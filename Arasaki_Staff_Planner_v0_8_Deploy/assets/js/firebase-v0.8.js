import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
    import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
    import { getDatabase, ref, get, set, update, runTransaction, onValue, onChildAdded, onChildChanged, onChildRemoved, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js';

    const DEFAULT_TEAM_ID='arasaki-shipyard';
    async function loadFirebaseRuntimeConfig() {
      try {
        const response=await fetch('/__/firebase/init.json',{cache:'no-store'});
        const contentType=response.headers.get('content-type')||'';
        if(!response.ok||!contentType.includes('application/json'))throw new Error(`Firebase Hosting config: ${response.status}`);
        const config=await response.json();
        if(!config?.apiKey||!config?.projectId||!config?.appId)throw new Error('Firebase Hosting config is incomplete');
        return {FIREBASE_CONFIG:config,TEAM_ID:DEFAULT_TEAM_ID,TEAM_NAME:'荒嵜造船所'};
      } catch (hostingError) {
        console.info('Firebase Hosting外のため、ローカルconfig.jsを使用します。',hostingError);
        return import('./config.js?v=0.8');
      }
    }
    const {FIREBASE_CONFIG,TEAM_ID,TEAM_NAME}=await loadFirebaseRuntimeConfig();
    const workspaceName=String(TEAM_NAME||({'arasaki-shipyard':'荒嵜造船所'})[TEAM_ID]||TEAM_ID||'イベント');
    window.setPlannerWorkspaceIdentity?.(TEAM_ID,workspaceName);

    const roleLabels = {owner:'オーナー',operations:'運営',staff:'スタッフ',cast:'キャスト',external_collaborator:'外部協力者',admin:'運営',member:'スタッフ',viewer:'キャスト'};
    const roleOrder = {owner:0,operations:1,admin:1,staff:2,member:2,external_collaborator:3,cast:4,viewer:4};

    const gate=document.getElementById('authGate');
    const status=document.getElementById('authStatus');
    const uidBox=document.getElementById('authUid');
    const loginBtn=document.getElementById('googleLoginBtn');
    const signOutBtn=document.getElementById('staffSignOutBtn');
    const joinPanel=document.getElementById('joinRequestPanel');
    const joinTitle=document.getElementById('joinRequestTitle');
    const joinDescription=document.getElementById('joinRequestDescription');
    const joinAccount=document.getElementById('joinRequestAccount');
    const joinNameField=document.getElementById('joinRequestNameField');
    const joinName=document.getElementById('joinRequestName');
    const joinVrchat=document.getElementById('joinRequestVrchat');
    const joinSubmit=document.getElementById('submitJoinRequestBtn');
    const joinRefresh=document.getElementById('refreshJoinRequestBtn');
    const joinStatus=document.getElementById('joinRequestStatus');
    const managementPanel=document.getElementById('staffManagementPanel');
    const managementPermission=document.getElementById('staffManagementPermission');
    const requestList=document.getElementById('joinRequestList');
    const memberList=document.getElementById('staffMemberList');
    const requestCount=document.getElementById('pendingRequestCount');
    const memberCount=document.getElementById('registeredMemberCount');
    const managementMessage=document.getElementById('staffManagementMessage');
    const ownerAccessDenied=document.getElementById('ownerAccessDenied');
    const ownerDeniedSignOutBtn=document.getElementById('ownerDeniedSignOutBtn');

    let auth=null, db=null, activeUser=null, authUser=null;
    let ownMember=null, ownRequest=null, workspaceUid='';
    let membersData={}, requestsData={}, profilesData={};
    const rejectedInviteCleanupPromises=new Map();
    let unsubscribeOwnMember=null, unsubscribeOwnRequest=null, unsubscribeMembers=null, unsubscribeRequests=null, unsubscribeProfiles=null, unsubscribePublishedInvites=null, unsubscribeGlobalManagement=null;
    let workspaceUnsubscribers=[], workspaceReady=false, workspaceLoadGeneration=0, cloudBaseline=null, pendingCloudState=null;
    const appReadyPromise=window.__ARASAKI_APP_READY__
      ? Promise.resolve()
      : new Promise(resolve=>document.addEventListener('arasaki-app-ready',resolve,{once:true}));

    const isLocalPreviewHost=['localhost','127.0.0.1','[::1]','::1'].includes(location.hostname);
    const configured=()=>{
      if(isLocalPreviewHost&&new URLSearchParams(location.search).get('localPreview')==='1')return false;
      return Object.values(FIREBASE_CONFIG).every(value=>{
      const text=String(value||'').trim().toLowerCase();
      return text&&!text.includes('ここに')&&!text.includes('your-')&&!text.includes('example')&&!text.includes('project-id');
      });
    };
    const localGlobalAdminSample=()=>{
      const icon=(label,color)=>`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="20" fill="${color}"/><text x="48" y="58" text-anchor="middle" font-size="36" fill="white" font-family="sans-serif" font-weight="700">${label}</text></svg>`)}`;
      return {
        events:{
          'local-event-approved':{id:'local-event-approved',name:'星灯り交流会',icon:icon('星','#6558d3'),representativeName:'椎那',members:{owner:{name:'椎那',role:'代表者'},staff1:{name:'もちこ',role:'運営'},staff2:{name:'アラタ',role:'キャスト'},staff3:{name:'ミナト',role:'スタッフ'}},createdAt:'2026-07-20T09:00:00.000Z'},
          'local-event-pending':{id:'local-event-pending',name:'夏祭りイベント',icon:icon('夏','#d96b55'),representativeName:'',members:{guest1:{name:'参加者サンプル',role:'参加者'},guest2:{name:'参加者テスト',role:'参加者'}},createdAt:'2026-07-24T09:00:00.000Z'},
          'local-event-invited':{id:'local-event-invited',name:'新人キャスト説明会',icon:icon('新','#368b77'),representativeName:'',members:{},invite:{token:'local-preview-invite',createdAt:'2026-07-28T09:00:00.000Z',expiresAt:'2026-12-31T14:59:59.000Z',limit:1,used:0,active:true},createdAt:'2026-07-28T09:00:00.000Z'}
        },
        applications:{
          'local-application-pending':{id:'local-application-pending',eventId:'local-event-pending',displayName:'夏目',vrchat:'https://vrchat.com/home/user/usr_local_preview',status:'pending',createdAt:'2026-07-25T09:00:00.000Z'}
        },
        auditLogs:{},
        trash:{},
        recovery:{}
      };
    };
    const normalizedRole=role=>({admin:'operations',member:'staff',viewer:'cast'}[role]||role);
    const managerRole=role=>normalizedRole(role)==='owner'||normalizedRole(role)==='operations';
    const currentSurface=()=>window.getPlannerSurface?.()||(location.pathname.split('/').filter(Boolean)[0]==='owner'?'owner':location.pathname.split('/').filter(Boolean)[0]==='admin'?'global':'app');
    const staffManagementAvailable=()=>currentSurface()==='owner';
    const validFirebaseKey=value=>/^[^.#$\[\]\/]{1,256}$/.test(String(value||''));
    const validInviteToken=value=>String(value||'').length>=12&&validFirebaseKey(value);
    const projectInvitePath=token=>`teams/${TEAM_ID}/invites/${token}`;
    const projectAccessMap=value=>{
      if(!value||typeof value!=='object'||Array.isArray(value))return {};
      return Object.fromEntries(Object.entries(value).filter(([projectId,allowed])=>validFirebaseKey(projectId)&&allowed===true));
    };
    const projectAccessEntries=user=>Object.entries(projectAccessMap(user?.projectAccess));
    function additionalProjectInviteContext(member) {
      const params=new URLSearchParams(location.search);
      const token=params.get('invite')||'';
      const projectId=params.get('project')||'';
      if(
        normalizedRole(member?.role)!=='external_collaborator'
        ||member?.active===false
        ||!validInviteToken(token)
        ||!validFirebaseKey(projectId)
        ||projectAccessMap(member?.projectAccess)[projectId]===true
      )return null;
      return {token,projectId};
    }
    const normalizedClaimHashes=value=>{
      const claims={_seed:true};
      if(!value||typeof value!=='object'||Array.isArray(value))return claims;
      Object.entries(value).forEach(([hash,claimed])=>{
        if(/^[a-f0-9]{64}$/.test(hash)&&claimed===true)claims[hash]=true;
      });
      return claims;
    };
    const inviteUsedCount=invite=>Math.max(0,Object.values(normalizedClaimHashes(invite?.claimHashes)).filter(value=>value===true).length-1);
    async function projectInviteClaimHash(token,uid,generation='') {
      if(!globalThis.crypto?.subtle)throw new Error('このブラウザでは安全な招待承認を利用できません。');
      const bytes=new TextEncoder().encode(`${TEAM_ID}:${token}:${uid}${generation?`:${generation}`:''}`);
      const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
      return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
    }
    const inviteExpiryTime=value=>{
      const parsed=typeof value==='number'?value:Date.parse(String(value||''));
      return Number.isFinite(parsed)?parsed:NaN;
    };
    function projectInviteValidationError(invite,token='',requestedProjectId='',existingClaimHash='') {
      if(!invite||typeof invite!=='object')return 'この招待リンクは見つかりません。';
      if(!validFirebaseKey(invite.id))return '招待リンクIDが正しくありません。';
      if(!validInviteToken(invite.token)||(token&&invite.token!==token))return '招待トークンが一致しません。';
      if(invite.teamId!==TEAM_ID||invite.eventId!==TEAM_ID)return 'このイベント用の招待リンクではありません。';
      if(invite.kind!=='external'||invite.role!=='external_collaborator')return '外部協力者用の招待リンクではありません。';
      if(!validFirebaseKey(invite.projectId))return '招待先プロジェクトが正しくありません。';
      if(requestedProjectId&&requestedProjectId!==invite.projectId)return '招待先プロジェクトが一致しません。';
      if(!['owner','operations','staff','cast'].includes(invite.projectVisibility))return 'プロジェクトの公開範囲が正しくありません。';
      if(!invite.claimHashes||typeof invite.claimHashes!=='object'||Array.isArray(invite.claimHashes)||invite.claimHashes._seed!==true)return '招待リンクの利用情報が正しくありません。';
      if(Object.entries(invite.claimHashes).some(([hash,claimed])=>(hash!=='_seed'&&!/^[a-f0-9]{64}$/.test(hash))||claimed!==true))return '招待リンクの利用情報が正しくありません。';
      const expiresAt=inviteExpiryTime(invite.expiresAt);
      if(!Number.isFinite(expiresAt)||Date.now()>expiresAt)return 'この招待リンクは期限切れです。';
      const limit=Math.max(1,Number(invite.limit)||0),used=inviteUsedCount(invite);
      if(Number(invite.used)!==used)return '招待リンクの使用回数が正しくありません。';
      const alreadyClaimed=existingClaimHash&&invite.claimHashes[existingClaimHash]===true;
      if(invite.active===false||(!alreadyClaimed&&used>=limit))return 'この招待リンクは無効、または使用上限に達しています。';
      return '';
    }
    async function enterGlobalAdmin(user){
      const snapshot=await get(ref(db,`globalAdmins/${user.uid}`));
      const admin=snapshot.val();
      if(!admin?.active){
        activeUser=null;window.setStaffCloudUser?.(null);setGate(true);if(loginBtn)loginBtn.hidden=true;if(ownerAccessDenied)ownerAccessDenied.hidden=false;
        const deniedTitle=ownerAccessDenied?.querySelector('strong');if(deniedTitle)deniedTitle.textContent='全体管理者権限が必要です';
        setAuthStatus('このGoogleアカウントは全体管理者として登録されていません。');return;
      }
      window.startPlannerCloudSession?.(`${user.uid}:global`);
      activeUser={uid:user.uid,email:user.email||'',name:admin.displayName||user.displayName||user.email||'全体管理者',role:'owner',roleLabel:'全体管理者'};
      window.setStaffCloudUser?.(activeUser);window.setStaffReadOnly?.(false);window.applyRolePageAccess?.();setGate(false);if(joinPanel)joinPanel.hidden=true;
      unsubscribeGlobalManagement=onValue(ref(db,'globalManagement'),data=>window.setGlobalAdminData?.(data.val()||{}),error=>window.setCloudSyncStatus?.('error','読込エラー',error.message));
      window.globalAdminCloud={save(data){
        const invites={};
        Object.values(data?.events||{}).forEach(event=>{if(event?.invite?.token)invites[event.invite.token]={eventId:event.id,eventName:event.name,expiresAt:event.invite.expiresAt,limit:1,used:Number(event.invite.used)||0,active:event.invite.active!==false};});
        return update(ref(db),{globalManagement:data,globalInvites:invites});
      }};
      window.setCloudSyncStatus?.('online','同期済み','全体管理データを同期しています。');
    }
    const setAuthStatus=message=>{ if(status)status.textContent=message; };
    const showUid=uid=>{ if(!uidBox)return;uidBox.hidden=!uid;uidBox.textContent=uid?`登録用UID：${uid}`:''; };
    const setGate=visible=>{ if(gate)gate.hidden=!visible; };
    const safe=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
    const formatDate=value=>{
      if(!value)return '日時不明';
      const date=new Date(Number(value)||value);
      return Number.isNaN(date.getTime())?'日時不明':new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);
    };
    const setManagementMessage=(message,type='')=>{
      if(!managementMessage)return;
      managementMessage.textContent=message||'';
      managementMessage.className=`staff-management-message${type?` ${type}`:''}`;
    };

    function stopManagementListeners() {
      if(unsubscribeMembers){unsubscribeMembers();unsubscribeMembers=null;}
      if(unsubscribeRequests){unsubscribeRequests();unsubscribeRequests=null;}
      membersData={};requestsData={};
      if(managementPanel)managementPanel.hidden=true;
    }
    function stopPublishedInviteListener() {
      if(unsubscribePublishedInvites){unsubscribePublishedInvites();unsubscribePublishedInvites=null;}
      window.applyPublishedProjectInvites?.([]);
    }
    function startPublishedInviteListener() {
      if(!db||!activeUser||!managerRole(activeUser.role)){
        stopPublishedInviteListener();
        return;
      }
      if(unsubscribePublishedInvites)return;
      unsubscribePublishedInvites=onValue(
        ref(db,`teams/${TEAM_ID}/invites`),
        snapshot=>{
          if(!managerRole(activeUser?.role)){window.applyPublishedProjectInvites?.([]);return;}
          window.applyPublishedProjectInvites?.(Object.values(snapshot.val()||{}));
        },
        error=>{
          console.error('プロジェクト招待一覧を読み込めません',error);
          window.applyPublishedProjectInvites?.([]);
        }
      );
    }
    function stopWorkspaceListeners() {
      workspaceLoadGeneration+=1;
      workspaceUnsubscribers.forEach(unsubscribe=>{try{unsubscribe?.();}catch(_){}});
      workspaceUnsubscribers=[];workspaceReady=false;cloudBaseline=null;pendingCloudState=null;
      stopManagementListeners();
      stopPublishedInviteListener();
      if(unsubscribeProfiles){unsubscribeProfiles();unsubscribeProfiles=null;}
      if(unsubscribeGlobalManagement){unsubscribeGlobalManagement();unsubscribeGlobalManagement=null;}
      workspaceUid='';membersData={};requestsData={};profilesData={};window.staffDirectory={};
    }

    function stopAllListeners() {
      stopWorkspaceListeners();
      if(unsubscribeOwnMember){unsubscribeOwnMember();unsubscribeOwnMember=null;}
      if(unsubscribeOwnRequest){unsubscribeOwnRequest();unsubscribeOwnRequest=null;}
    }

    const WORKSPACE_PATH=`teams/${TEAM_ID}/workspace`;
    const LEGACY_PLANNER_PATH=`teams/${TEAM_ID}/planner`;
    const VISIBILITY_BUCKETS=['owner','operations','staff','cast'];
    const VISIBILITY_SECTIONS=['projects','notes'];
    const SHARED_ARRAY_SECTIONS=['events','meetings','schedulePolls','futureItems','trashItems','recoveryArchive','changeLog'];
    const readableSharedArraySections=()=>managerRole(activeUser?.role)?SHARED_ARRAY_SECTIONS:SHARED_ARRAY_SECTIONS.filter(section=>section!=='recoveryArchive');
    const ARRAY_SECTIONS=[...SHARED_ARRAY_SECTIONS,...VISIBILITY_SECTIONS];
    const PERSONAL_ARRAY_SECTIONS=['tasks','events','futureItems'];
    const MAP_SECTIONS=[];
    const PERSONAL_MAP_SECTIONS=['yearlyLogs','weeklyLogs','dailyEntries'];
    const clone=value=>JSON.parse(JSON.stringify(value??null));
    const jsonEqual=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
    const byId=items=>Object.fromEntries((Array.isArray(items)?items:[]).filter(item=>item&&item.id).map(item=>[item.id,item]));
    const isPersonalRecord=record=>record?.workspaceId==='personal';
    const normalizeVisibility=value=>VISIBILITY_BUCKETS.includes(value)?value:'staff';
    const recordVisibility=record=>normalizeVisibility(record?.visibility||record?.audience);
    const taskAudience=recordVisibility;
    const allowedVisibilityBuckets=role=>{
      const normalized=normalizedRole(role);
      if(normalized==='owner')return [...VISIBILITY_BUCKETS];
      if(normalized==='operations')return ['operations','staff','cast'];
      if(normalized==='staff')return ['staff','cast'];
      if(normalized==='external_collaborator')return [];
      return ['cast'];
    };
    const allowedTaskAudiences=allowedVisibilityBuckets;
    const personalWorkspacePath=uid=>`users/${uid}/workspace`;
    const categoryMigrationVersionOf=state=>Number(state?.categoryMigrationVersion??state?.meta?.categoryMigrationVersion)||0;
    function normalizedTeamTask(task,visibility=recordVisibility(task)){
      return {...clone(task),visibility,audience:visibility};
    }
    function normalizedVisibilityRecord(record,visibility=recordVisibility(record)){
      return {...clone(record),visibility};
    }
    function emptyWorkspaceState(seed={}){
      return {...seed,tasks:[],events:[],projects:[],meetings:[],schedulePolls:[],notes:[],futureItems:[],yearlyLogs:{},weeklyLogs:{},dailyEntries:{},changeLog:[]};
    }
    function buildWorkspaceUpdates(previous,next,{includeMeta=true}={}){
      const updates={};
      const before=previous||emptyWorkspaceState();
      const after=next||emptyWorkspaceState();
      const allowed=new Set(allowedVisibilityBuckets(activeUser?.role||'cast'));
      const prevTasks=byId((before.tasks||[]).filter(task=>!isPersonalRecord(task)&&allowed.has(recordVisibility(task))));
      const allNextTasks=byId((after.tasks||[]).filter(task=>!isPersonalRecord(task)));
      const nextTasks=byId(Object.values(allNextTasks).filter(task=>allowed.has(recordVisibility(task))));
      new Set([...Object.keys(prevTasks),...Object.keys(nextTasks)]).forEach(id=>{
        const oldTask=prevTasks[id],newTask=nextTasks[id];
        if(allNextTasks[id]&&!newTask)return;
        const oldAudience=oldTask?taskAudience(oldTask):'';
        const newAudience=newTask?taskAudience(newTask):'';
        if(oldTask&&(!newTask||oldAudience!==newAudience))updates[`tasks/${oldAudience}/${id}`]=null;
        const normalizedTask=newTask?normalizedTeamTask(newTask,newAudience):null;
        if(newTask&&(!oldTask||oldAudience!==newAudience||!jsonEqual(normalizedTeamTask(oldTask,oldAudience),normalizedTask)))updates[`tasks/${newAudience}/${id}`]=normalizedTask;
      });
      VISIBILITY_SECTIONS.forEach(section=>{
        const oldMap=byId((before[section]||[]).filter(record=>allowed.has(recordVisibility(record))));
        const allNewMap=byId(after[section]);
        const newMap=byId(Object.values(allNewMap).filter(record=>allowed.has(recordVisibility(record))));
        new Set([...Object.keys(oldMap),...Object.keys(newMap)]).forEach(id=>{
          const oldRecord=oldMap[id],newRecord=newMap[id];
          if(allNewMap[id]&&!newRecord)return;
          const oldVisibility=oldRecord?recordVisibility(oldRecord):'';
          const newVisibility=newRecord?recordVisibility(newRecord):'';
          if(oldRecord&&(!newRecord||oldVisibility!==newVisibility))updates[`${section}/${oldVisibility}/${id}`]=null;
          const normalizedRecord=newRecord?normalizedVisibilityRecord(newRecord,newVisibility):null;
          if(newRecord&&(!oldRecord||oldVisibility!==newVisibility||!jsonEqual(normalizedVisibilityRecord(oldRecord,oldVisibility),normalizedRecord)))updates[`${section}/${newVisibility}/${id}`]=normalizedRecord;
        });
      });
      SHARED_ARRAY_SECTIONS.forEach(section=>{
        const oldItems=PERSONAL_ARRAY_SECTIONS.includes(section)?(before[section]||[]).filter(record=>!isPersonalRecord(record)):(before[section]||[]);
        const newItems=PERSONAL_ARRAY_SECTIONS.includes(section)?(after[section]||[]).filter(record=>!isPersonalRecord(record)):(after[section]||[]);
        const oldMap=byId(oldItems),newMap=byId(newItems);
        new Set([...Object.keys(oldMap),...Object.keys(newMap)]).forEach(id=>{
          if(!newMap[id])updates[`${section}/${id}`]=null;
          else if(!oldMap[id]||!jsonEqual(oldMap[id],newMap[id]))updates[`${section}/${id}`]=clone(newMap[id]);
        });
      });
      MAP_SECTIONS.forEach(section=>{
        const oldMap=before[section]&&typeof before[section]==='object'?before[section]:{};
        const newMap=after[section]&&typeof after[section]==='object'?after[section]:{};
        new Set([...Object.keys(oldMap),...Object.keys(newMap)]).forEach(key=>{
          if(!(key in newMap))updates[`${section}/${key}`]=null;
          else if(!(key in oldMap)||!jsonEqual(oldMap[key],newMap[key]))updates[`${section}/${key}`]=clone(newMap[key]);
        });
      });
      if(!jsonEqual(before.settings,after.settings))updates['config/settings']=clone(after.settings||{});
      if(!jsonEqual(before.preferences,after.preferences))updates['config/preferences']=clone(after.preferences||{});
      if(!jsonEqual(before.menuConfig,after.menuConfig))updates['config/menuConfig']=clone(after.menuConfig||[]);
      const beforeAdminConfig=withoutLegacyExternalInvites(before.adminConfig);
      const afterAdminConfig=withoutLegacyExternalInvites(after.adminConfig);
      if(!jsonEqual(beforeAdminConfig,afterAdminConfig)&&managerRole(activeUser?.role))updates['config/adminConfig']=afterAdminConfig;
      if(normalizedRole(activeUser?.role)==='owner'){
        if(!jsonEqual(before.categoryMaster,after.categoryMaster))updates['config/categoryMaster']=clone(after.categoryMaster||{});
        if(!jsonEqual(before.projectTemplates,after.projectTemplates))updates['config/projectTemplates']=clone(after.projectTemplates||{});
      }
      const beforeCategoryMigration=categoryMigrationVersionOf(before);
      const afterCategoryMigration=categoryMigrationVersionOf(after);
      if(managerRole(activeUser?.role)&&afterCategoryMigration===1&&beforeCategoryMigration!==afterCategoryMigration)updates['meta/categoryMigrationVersion']=1;
      if(includeMeta){
        if(managerRole(activeUser?.role))updates['meta/schemaVersion']=3;
        updates['meta/appVersion']=Number(after.version)||108;
        updates['meta/updatedAt']=serverTimestamp();
        updates['meta/updatedBy']=activeUser?.name||activeUser?.email||'';
        updates['meta/updatedByUid']=activeUser?.uid||'';
      }
      return updates;
    }
    function buildPersonalWorkspaceUpdates(previous,next){
      const updates={};
      const before=previous||emptyWorkspaceState();
      const after=next||emptyWorkspaceState();
      PERSONAL_ARRAY_SECTIONS.forEach(section=>{
        const oldMap=byId((before[section]||[]).filter(isPersonalRecord));
        const newMap=byId((after[section]||[]).filter(isPersonalRecord));
        new Set([...Object.keys(oldMap),...Object.keys(newMap)]).forEach(id=>{
          if(!newMap[id])updates[`${section}/${id}`]=null;
          else{
            const normalized={...clone(newMap[id]),workspaceId:'personal'};
            if(!oldMap[id]||!jsonEqual({...clone(oldMap[id]),workspaceId:'personal'},normalized))updates[`${section}/${id}`]=normalized;
          }
        });
      });
      PERSONAL_MAP_SECTIONS.forEach(section=>{
        const oldMap=before[section]&&typeof before[section]==='object'?before[section]:{};
        const newMap=after[section]&&typeof after[section]==='object'?after[section]:{};
        new Set([...Object.keys(oldMap),...Object.keys(newMap)]).forEach(key=>{
          if(!(key in newMap))updates[`${section}/${key}`]=null;
          else if(!(key in oldMap)||!jsonEqual(oldMap[key],newMap[key]))updates[`${section}/${key}`]=clone(newMap[key]);
        });
      });
      return updates;
    }
    function addWorkspaceMetadata(updates,state){
      if(managerRole(activeUser?.role))updates['meta/schemaVersion']=3;
      updates['meta/appVersion']=Number(state?.version)||108;
      updates['meta/updatedAt']=serverTimestamp();
      updates['meta/updatedBy']=activeUser?.name||activeUser?.email||'';
      updates['meta/updatedByUid']=activeUser?.uid||'';
    }
    async function cloudSaveNow(state) {
      if(!db||!activeUser)return;
      const next=clone(state);
      if(!workspaceReady||!cloudBaseline){pendingCloudState=next;return;}
      // 外部協力者は共有workspaceへ一切書き込まず、自分のworkspaceだけを同期します。
      const teamUpdates=normalizedRole(activeUser.role)==='external_collaborator'
        ?{}
        :buildWorkspaceUpdates(cloudBaseline,next,{includeMeta:false});
      const personalUpdates=buildPersonalWorkspaceUpdates(cloudBaseline,next);
      const teamMeaningful=Object.keys(teamUpdates);
      const personalMeaningful=Object.keys(personalUpdates);
      if(teamMeaningful.length)addWorkspaceMetadata(teamUpdates,next);
      const updates={};
      Object.entries(teamUpdates).forEach(([path,value])=>{updates[`${WORKSPACE_PATH}/${path}`]=value;});
      Object.entries(personalUpdates).forEach(([path,value])=>{updates[`${personalWorkspacePath(activeUser.uid)}/${path}`]=value;});
      const meaningful=[...teamMeaningful,...personalMeaningful];
      cloudBaseline=next;
      if(!meaningful.length)return;
      window.setCloudSyncStatus?.('syncing','同期中…',`${meaningful.length}件の変更だけを送信しています。`);
      try{
        await update(ref(db),updates);
        window.setCloudSyncStatus?.('online','同期済み',`${activeUser.name||activeUser.email} として差分同期中`);
      }catch(error){
        cloudBaseline=null;
        throw error;
      }
    }
    window.staffCloud={save(state){return cloudSaveNow(clone(state));}};
    window.publishProjectInvite=async invite=>{
      if(!db||!activeUser)throw new Error('Firebaseへログインしてから招待リンクを発行してください。');
      if(!managerRole(activeUser.role))throw new Error('招待リンクを発行できるのはイベントオーナー・運営のみです。');
      const token=String(invite?.token||'');
      if(!validInviteToken(token))throw new Error('招待トークンの形式が正しくありません。');
      const context=window.getPlannerInvitationContext?.(token)||invite||{};
      const expiresAt=inviteExpiryTime(context.expiresAt||invite?.expiresAt);
      const payload={
        id:String(context.id||invite?.id||token),
        token,
        eventId:TEAM_ID,
        teamId:TEAM_ID,
        role:'external_collaborator',
        kind:'external',
        projectId:String(context.projectId||''),
        projectVisibility:normalizeVisibility(context.projectVisibility||invite?.projectVisibility||'staff'),
        expiresAt,
        limit:Math.max(1,Number(context.limit??invite?.limit)||1),
        used:0,
        active:context.active!==false&&invite?.active!==false,
        createdAt:Date.now(),
        createdBy:activeUser.uid,
        claimHashes:{_seed:true}
      };
      const validationError=projectInviteValidationError(payload,token,payload.projectId);
      if(validationError)throw new Error(validationError);
      await set(ref(db,projectInvitePath(token)),payload);
      return clone(payload);
    };
    window.setProjectInviteActive=async (tokenValue,active)=>{
      if(!db||!activeUser)throw new Error('Firebaseへログインしてください。');
      if(!managerRole(activeUser.role))throw new Error('招待リンクを変更できるのはイベントオーナー・運営のみです。');
      const token=String(tokenValue||'');
      if(!validInviteToken(token))throw new Error('招待トークンの形式が正しくありません。');
      const result=await runTransaction(ref(db,projectInvitePath(token)),invite=>{
        if(!invite||invite.token!==token||invite.teamId!==TEAM_ID||invite.eventId!==TEAM_ID||invite.kind!=='external'||invite.role!=='external_collaborator')return;
        if(!invite.claimHashes||typeof invite.claimHashes!=='object'||Array.isArray(invite.claimHashes)||invite.claimHashes._seed!==true)return;
        if(Object.entries(invite.claimHashes).some(([hash,claimed])=>(hash!=='_seed'&&!/^[a-f0-9]{64}$/.test(hash))||claimed!==true))return;
        const expiresAt=inviteExpiryTime(invite.expiresAt);
        const limit=Math.max(1,Number(invite.limit)||1);
        const claimHashes=normalizedClaimHashes(invite.claimHashes);
        const used=Math.max(0,Object.values(claimHashes).filter(value=>value===true).length-1);
        if(Number(invite.used)!==used)return;
        if(active&&(!Number.isFinite(expiresAt)||Date.now()>expiresAt||used>=limit))return;
        return {...invite,claimHashes,used,active:!!active};
      },{applyLocally:false});
      if(!result.committed)throw new Error(active?'期限切れ、または使用上限に達した招待リンクは再有効化できません。':'招待リンクを変更できませんでした。');
      return clone(result.snapshot.val());
    };

    function activeProfileEntries() {
      return Object.entries(profilesData).filter(([,profile])=>profile&&profile.active!==false&&String(profile.displayName||'').trim()).sort((a,b)=>String(a[1].displayName).localeCompare(String(b[1].displayName),'ja'));
    }
    function legacyValue(name) { return `legacy:${encodeURIComponent(String(name||''))}`; }
    function populateStaffSelect(select,selectedUid='',selectedName='') {
      if(!select)return;
      const profiles=activeProfileEntries();
      let resolvedUid=selectedUid||'';
      if(!resolvedUid&&selectedName){
        resolvedUid=profiles.find(([,profile])=>profile.displayName===selectedName)?.[0]||legacyValue(selectedName);
      }
      const hasUid=profiles.some(([uid])=>uid===resolvedUid);
      let html='<option value="">未設定</option>'+profiles.map(([uid,profile])=>`<option value="${safe(uid)}">${safe(profile.displayName)}</option>`).join('');
      if(resolvedUid&&!hasUid&&selectedName)html+=`<option value="${safe(legacyValue(selectedName))}">${safe(selectedName)}（旧データ）</option>`;
      select.innerHTML=html;
      select.value=resolvedUid&&[...select.options].some(option=>option.value===resolvedUid)?resolvedUid:'';
    }
    window.populateStaffSelects=(assigneeUid='',assigneeName='',reviewerUid='',reviewerName='')=>{
      populateStaffSelect(document.getElementById('taskAssignee'),assigneeUid,assigneeName);
      populateStaffSelect(document.getElementById('taskReviewer'),reviewerUid,reviewerName);
    };
    window.getStaffSelection=id=>{
      const select=document.getElementById(id);const value=select?.value||'';
      if(!value)return {uid:'',name:''};
      if(value.startsWith('legacy:'))return {uid:'',name:decodeURIComponent(value.slice(7))};
      return {uid:value,name:profilesData[value]?.displayName||select?.selectedOptions?.[0]?.textContent||''};
    };
    function syncStaffDirectory() {
      const assignee=document.getElementById('taskAssignee');
      const reviewer=document.getElementById('taskReviewer');
      const assigneeCurrent=window.getStaffSelection?.('taskAssignee')||{uid:'',name:''};
      const reviewerCurrent=window.getStaffSelection?.('taskReviewer')||{uid:'',name:''};
      window.staffDirectory=profilesData;
      populateStaffSelect(assignee,assigneeCurrent.uid,assigneeCurrent.name);
      populateStaffSelect(reviewer,reviewerCurrent.uid,reviewerCurrent.name);
      window.renderMyPage?.();
      window.renderAllPlannerViews?.();
    }
    function setMyPageStatus(message,type='') {
      const box=document.getElementById('myPageStatus');if(!box)return;
      box.textContent=message||'';box.className=`mypage-status${type?` ${type}`:''}`;
    }
    let activeProfileScope=window.getActivePlannerWorkspace?.()===TEAM_ID?'event':'personal';
    let selectedEventProfileId='';
    const profileImageDrafts={};
    window.setMyPageProfileScope=scope=>{
      activeProfileScope=scope==='event'?'event':'personal';
      setMyPageStatus('');
      window.renderMyPage?.();
    };
    function eventProfileOptions() { return window.getPlannerEventProfileOptions?.()||[]; }
    function ensureSelectedEventProfile() {
      const options=eventProfileOptions();
      if(!options.some(event=>event.id===selectedEventProfileId))selectedEventProfileId=options[0]?.id||'';
      return options;
    }
    function profileDraftKey() { return activeProfileScope==='personal'?'personal':`event:${selectedEventProfileId}`; }
    function savedScopedProfile(profile) {
      if(activeProfileScope==='personal')return profile?.profiles?.personal||{};
      return profile?.eventProfiles?.[selectedEventProfileId]||profile?.profiles?.event||{};
    }
    function scopedProfile(profile) {
      const personal=profile?.profiles?.personal||{};
      const saved=savedScopedProfile(profile);
      return {
        displayName:saved.displayName??personal.displayName??profile?.displayName??activeUser?.name??'',
        bio:saved.bio??personal.bio??'',
        discord:saved.discord??personal.discord??profile?.discord??'',
        vrchat:saved.vrchat??personal.vrchat??profile?.vrchat??'',
        vrchatDisplayName:saved.vrchatDisplayName??personal.vrchatDisplayName??'',
        vrchatUserId:saved.vrchatUserId??personal.vrchatUserId??'',
        vrchatSyncedAt:saved.vrchatSyncedAt??personal.vrchatSyncedAt??''
      };
    }
    window.renderMyPage=()=>{
      const profile=activeUser?profilesData[activeUser.uid]||{}:{};
      const eventOptions=ensureSelectedEventProfile();
      const eventField=document.getElementById('myPageEventProfileField');
      const eventSelect=document.getElementById('myPageEventProfileSelect');
      if(eventField)eventField.hidden=activeProfileScope!=='event';
      if(eventSelect&&activeProfileScope==='event'){
        eventSelect.innerHTML=eventOptions.length?eventOptions.map(event=>`<option value="${safe(event.id)}">${safe(event.name)}${event.date?`（${safe(event.date)}）`:''}</option>`).join(''):'<option value="">イベントがありません</option>';
        eventSelect.value=selectedEventProfileId;
      }
      const selected=scopedProfile(profile);
      const name=selected.displayName||activeUser?.name||'未ログイン';
      const savedScope=savedScopedProfile(profile);
      const personalPhoto=profile?.profiles?.personal?.avatarDataUrl||profile.photoURL||authUser?.photoURL||'';
      const savedPhoto=activeProfileScope==='personal'?(savedScope.avatarDataUrl||personalPhoto):(savedScope.avatarDataUrl||personalPhoto);
      const draftKey=profileDraftKey();
      const draftPhoto=profileImageDrafts[draftKey];
      const photo=Object.prototype.hasOwnProperty.call(profileImageDrafts,draftKey)?(draftPhoto===null?personalPhoto:draftPhoto):savedPhoto;
      const photoEl=document.getElementById('myPagePhoto');const fallback=document.getElementById('myPageAvatarFallback');
      if(photoEl&&fallback){photoEl.hidden=!photo;fallback.hidden=!!photo;if(photo)photoEl.src=photo;fallback.textContent=name.slice(0,1)||'⚓';}
      const setText=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
      const selectedEventName=eventOptions.find(event=>event.id===selectedEventProfileId)?.name||'イベント';
      setText('myPageProfileHeading',activeProfileScope==='personal'?'個人プロフィール':`${selectedEventName}用プロフィール`);
      setText('myPageProfileSubtitle',activeProfileScope==='personal'?'個人用タブで使用するプロフィール':`${selectedEventName}で使用するプロフィール`);
      setText('myPageName',name);setText('myPageEmail',activeUser?.email||'');setText('myPageRole',activeUser?.roleLabel||roleLabels[activeUser?.role]||'スタッフ');
      setText('myPageDiscordDisplay',selected.discord||'未登録');
      const vrchatDisplay=document.getElementById('myPageVrchatDisplay');
      if(vrchatDisplay){
        const url=selected.vrchat||'';
        const vrchatName=selected.vrchatDisplayName||'VRChatプロフィール';
        vrchatDisplay.innerHTML=url?`<a href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(vrchatName)} ↗</a>`:'未登録';
      }
      const profileName=document.getElementById('myPageProfileName');const bio=document.getElementById('myPageProfileBio');
      const discord=document.getElementById('myPageDiscord');const vrchat=document.getElementById('myPageVrchat');
      if(profileName&&document.activeElement!==profileName)profileName.value=selected.displayName||'';
      if(bio&&document.activeElement!==bio)bio.value=selected.bio||'';
      if(discord&&document.activeElement!==discord)discord.value=selected.discord||'';
      if(vrchat&&document.activeElement!==vrchat)vrchat.value=selected.vrchat||'';
      setText('myPageScopeHelp',activeProfileScope==='personal'?'個人用プロフィールを編集中です。':`${selectedEventName}用プロフィールを編集中です。未設定の画像は個人用プロフィールから引き継がれます。`);
      const removeButton=document.getElementById('removeMyPageProfileImageBtn');
      if(removeButton)removeButton.textContent=activeProfileScope==='personal'?'画像を削除':'個人用画像に戻す';
    };
    const VRCHAT_USER_ID_PATTERN=/^usr_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    function parseVrchatProfileUrl(value) {
      const parsed=new URL(String(value||'').trim());
      if(parsed.protocol!=='https:'||!/(^|\.)vrchat\.com$/i.test(parsed.hostname))throw new Error('VRChatのプロフィールURL（https://vrchat.com/home/user/usr_...）を入力してください。');
      const parts=parsed.pathname.split('/').filter(Boolean);
      const userId=parts.length===3&&parts[0]==='home'&&parts[1]==='user'?parts[2]:'';
      if(!VRCHAT_USER_ID_PATTERN.test(userId))throw new Error('VRChatプロフィールURL内のユーザーIDを確認してください。');
      return {userId,url:`https://vrchat.com/home/user/${userId}`};
    }
    function lookupVrchatProfile(userId) {
      return new Promise((resolve,reject)=>{
        const requestId=globalThis.crypto?.randomUUID?.()||`vrchat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const timeout=setTimeout(()=>{
          window.removeEventListener('message',receive);
          reject(new Error('VRChat連携拡張機能から応答がありません。拡張機能をインストールまたは再読み込みしてください。'));
        },30000);
        function receive(event) {
          if(event.source!==window||event.origin!==window.location.origin||event.data?.type!=='ARASAKI_VRCHAT_PROFILE_RESPONSE'||event.data.requestId!==requestId)return;
          clearTimeout(timeout);window.removeEventListener('message',receive);
          if(!event.data.ok){reject(new Error(event.data.error||'VRChatの表示名を取得できませんでした。'));return;}
          const displayName=String(event.data.displayName||'').trim();
          if(!displayName){reject(new Error('VRChatの表示名を取得できませんでした。'));return;}
          resolve({userId:String(event.data.userId||userId),displayName});
        }
        window.addEventListener('message',receive);
        window.postMessage({type:'ARASAKI_VRCHAT_PROFILE_REQUEST',requestId,userId},window.location.origin);
      });
    }
    function resizedProfileImage(file) {
      return new Promise((resolve,reject)=>{
        if(!file?.type?.startsWith('image/')){reject(new Error('画像ファイルを選択してください。'));return;}
        if(file.size>8*1024*1024){reject(new Error('画像は8MB以下にしてください。'));return;}
        const reader=new FileReader();
        reader.onerror=()=>reject(new Error('画像を読み込めませんでした。'));
        reader.onload=()=>{
          const image=new Image();
          image.onerror=()=>reject(new Error('画像を読み込めませんでした。'));
          image.onload=()=>{
            const size=256,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
            const context=canvas.getContext('2d');if(!context){reject(new Error('画像を処理できませんでした。'));return;}
            const scale=Math.max(size/image.width,size/image.height),width=image.width*scale,height=image.height*scale;
            context.drawImage(image,(size-width)/2,(size-height)/2,width,height);
            resolve(canvas.toDataURL('image/webp',.82));
          };
          image.src=String(reader.result||'');
        };
        reader.readAsDataURL(file);
      });
    }
    document.getElementById('myPageProfileImage')?.addEventListener('change',async event=>{
      const file=event.target.files?.[0];if(!file)return;
      setMyPageStatus('プロフィール画像を準備しています…');
      try{
        profileImageDrafts[profileDraftKey()]=await resizedProfileImage(file);
        setMyPageStatus('画像を変更しました。「マイページを保存」で確定します。','success');
        window.renderMyPage?.();
      }catch(error){setMyPageStatus(error.message||'画像を処理できませんでした。','error');}
      event.target.value='';
    });
    document.getElementById('removeMyPageProfileImageBtn')?.addEventListener('click',()=>{
      profileImageDrafts[profileDraftKey()]=activeProfileScope==='personal'?'':null;
      setMyPageStatus(activeProfileScope==='personal'?'画像を削除しました。「マイページを保存」で確定します。':'個人用画像へ戻しました。「マイページを保存」で確定します。');
      window.renderMyPage?.();
    });
    document.getElementById('myPageEventProfileSelect')?.addEventListener('change',event=>{
      selectedEventProfileId=event.target.value||'';
      setMyPageStatus('');
      window.renderMyPage?.();
    });
    async function saveMyPage({refreshVrchat=false}={}) {
      if(!activeUser)return;
      let displayName=document.getElementById('myPageProfileName')?.value.trim()||activeUser.name||'スタッフ';
      const bio=document.getElementById('myPageProfileBio')?.value.trim()||'';
      const discord=document.getElementById('myPageDiscord')?.value.trim()||'';
      let vrchat=document.getElementById('myPageVrchat')?.value.trim()||'';
      let vrchatProfile=null;
      if(vrchat){
        try{
          const parsed=parseVrchatProfileUrl(vrchat);
          vrchat=parsed.url;
          setMyPageStatus(refreshVrchat?'VRChatの表示名を再読み込みしています…':'VRChatの表示名を確認しています…');
          vrchatProfile=await lookupVrchatProfile(parsed.userId);
          displayName=vrchatProfile.displayName;
          const profileNameInput=document.getElementById('myPageProfileName');
          const vrchatInput=document.getElementById('myPageVrchat');
          if(profileNameInput)profileNameInput.value=displayName;
          if(vrchatInput)vrchatInput.value=vrchat;
        }catch(error){setMyPageStatus(error.message||'VRChatの表示名を取得できませんでした。','error');return;}
      }
      setMyPageStatus('マイページを保存しています…');
      try{
        if(activeProfileScope==='event'&&!selectedEventProfileId){setMyPageStatus('先にイベントを作成してください。','error');return;}
        const current=profilesData[activeUser.uid]||{};
        const currentScope=savedScopedProfile(current);
        const draftKey=profileDraftKey(),draftExists=Object.prototype.hasOwnProperty.call(profileImageDrafts,draftKey);
        const draftImage=profileImageDrafts[draftKey];
        const avatarDataUrl=draftExists?(draftImage===null?'':draftImage):(currentScope.avatarDataUrl||'');
        const scopeValue={
          ...currentScope,
          displayName,
          bio,
          discord,
          vrchat,
          avatarDataUrl,
          vrchatDisplayName:vrchatProfile?.displayName||(vrchat?currentScope.vrchatDisplayName||'':''),
          vrchatUserId:vrchatProfile?.userId||(vrchat?currentScope.vrchatUserId||'':''),
          vrchatSyncedAt:vrchatProfile?new Date().toISOString():(vrchat?currentScope.vrchatSyncedAt||'':'')
        };
        const profiles=activeProfileScope==='personal'?{...(current.profiles||{}),personal:scopeValue}:{...(current.profiles||{})};
        const eventProfiles=activeProfileScope==='event'?{...(current.eventProfiles||{}),[selectedEventProfileId]:scopeValue}:{...(current.eventProfiles||{})};
        const next={...current,displayName:activeUser.name,role:activeUser.role,active:true,photoURL:authUser?.photoURL||current.photoURL||'',discord:current.discord||'',vrchat:current.vrchat||'',profiles,eventProfiles,updatedByUid:activeUser.uid};
        if(db)await set(ref(db,`teams/${TEAM_ID}/profiles/${activeUser.uid}`),{...next,updatedAt:serverTimestamp()});
        else{
          profilesData[activeUser.uid]={...next,updatedAt:new Date().toISOString()};
          localStorage.setItem('arasaki_local_profiles_v1',JSON.stringify(profilesData));
          syncStaffDirectory();
        }
        const eventName=eventProfileOptions().find(event=>event.id===selectedEventProfileId)?.name||'イベント';
        const vrchatMessage=vrchatProfile?` VRChat表示名「${vrchatProfile.displayName}」を反映しました。`:'';
        setMyPageStatus(`${activeProfileScope==='personal'?'個人用':`${eventName}用`}プロフィールを保存しました。${vrchatMessage}`,'success');
      }catch(error){console.error(error);setMyPageStatus(`保存できません：${error.message}`,'error');}
    }
    document.getElementById('saveMyPageBtn')?.addEventListener('click',()=>saveMyPage());
    document.getElementById('refreshMyPageVrchatBtn')?.addEventListener('click',()=>saveMyPage({refreshVrchat:true}));

    async function ensureOwnProfile(user,member) {
      if(!db||!user||!member)return;
      const profileRef=ref(db,`teams/${TEAM_ID}/profiles/${user.uid}`);
      try{
        const snapshot=await get(profileRef);const current=snapshot.val()||{};
        const next={...current,displayName:member.displayName||user.displayName||user.email||'スタッフ',role:normalizedRole(member.role||'cast'),active:member.active!==false,photoURL:user.photoURL||current.photoURL||'',discord:current.discord||'',vrchat:current.vrchat||'',updatedAt:serverTimestamp(),updatedByUid:user.uid};
        if(!snapshot.exists()||current.displayName!==next.displayName||current.role!==next.role||current.active!==next.active||(!current.photoURL&&next.photoURL))await set(profileRef,next);
        if(activeUser?.uid!==user.uid||normalizedRole(activeUser.role)!==normalizedRole(member.role||'cast'))return;
        profilesData={...profilesData,[user.uid]:{...next,updatedAt:current.updatedAt||Date.now()}};
        syncStaffDirectory();
      }catch(error){console.error('プロフィール初期化エラー',error);}
    }
    async function syncProfilesFromMembers() {
      if(!db||!activeUser||!managerRole(activeUser.role))return;
      const jobs=[];
      Object.entries(membersData).forEach(([uid,member])=>{
        if(!member)return;const current=profilesData[uid]||{};
        if(current.displayName===member.displayName&&current.role===normalizedRole(member.role)&&current.active===(member.active!==false))return;
        jobs.push(set(ref(db,`teams/${TEAM_ID}/profiles/${uid}`),{...current,displayName:member.displayName||current.displayName||'スタッフ',role:normalizedRole(member.role||'cast'),active:member.active!==false,photoURL:member.photoURL||current.photoURL||'',discord:current.discord||'',vrchat:current.vrchat||'',updatedAt:serverTimestamp(),updatedByUid:activeUser.uid}));
      });
      if(jobs.length)try{await Promise.all(jobs);}catch(error){console.error('プロフィール一覧同期エラー',error);}
    }
    function startProfilesListener() {
      if(normalizedRole(activeUser?.role)==='external_collaborator'){
        if(unsubscribeProfiles){unsubscribeProfiles();unsubscribeProfiles=null;}
        return;
      }
      if(unsubscribeProfiles||!db||!activeUser)return;
      unsubscribeProfiles=onValue(ref(db,`teams/${TEAM_ID}/profiles`),snapshot=>{
        if(normalizedRole(activeUser?.role)==='external_collaborator')return;
        profilesData=snapshot.val()||{};syncStaffDirectory();syncProfilesFromMembers();
      },error=>{console.error(error);setMyPageStatus(`プロフィールを読み込めません：${error.message}`,'error');});
    }

    function showJoinRequest(user,request,member) {
      stopWorkspaceListeners();
      activeUser=null;
      window.setStaffCloudUser?.(null);
      window.setStaffReadOnly?.(false);
      setGate(true);showUid('');
      if(!joinPanel)return;
      joinPanel.hidden=false;
      const params=new URLSearchParams(location.search);
      const projectInvitation=Boolean(params.get('invite')&&params.get('project'));
      const additionalProjectRequest=Boolean(additionalProjectInviteContext(member));
      joinAccount.textContent=`Googleアカウント：${user.displayName||'名前未設定'} / ${user.email||'メールアドレス不明'}`;
      joinName.value=request?.displayName||member?.displayName||user.displayName||'';
      if(joinVrchat)joinVrchat.value=request?.vrchat||'';
      const inactive=!!member&&member.active===false;
      const pending=request?.status==='pending';
      const rejected=request?.status==='rejected';
      joinNameField.hidden=inactive||pending;
      joinSubmit.hidden=inactive||pending;
      joinRefresh.hidden=false;
      joinSubmit.disabled=false;
      if(inactive){
        joinTitle.textContent='利用が停止されています';
        joinDescription.textContent='登録は残っていますが、現在このアカウントの利用が停止されています。オーナーへ確認してください。';
        joinStatus.textContent='サイト上のスタッフ管理から「有効」に戻すと、再び利用できます。';
        setAuthStatus('このGoogleアカウントは現在利用停止中です。');
      }else if(pending){
        joinTitle.textContent=request?.inviteKind==='external'||projectInvitation?'プロジェクト参加申請を送信済みです':'参加申請を送信済みです';
        joinDescription.textContent=request?.inviteKind==='external'||projectInvitation?'オーナーまたは運営が承認すると、招待されたプロジェクトが追加されます。':'オーナーまたは運営が承認すると、自動的にStaff Plannerへ入れるようになります。';
        joinStatus.textContent=`申請日時：${formatDate(request.requestedAt)}`;
        setAuthStatus(projectInvitation?'プロジェクト参加申請の承認を待っています。':'スタッフ参加申請の承認を待っています。');
      }else{
        joinTitle.textContent=rejected?(projectInvitation?'プロジェクト参加申請が見送られました':'参加申請が見送られました'):(projectInvitation?'プロジェクト参加申請':'スタッフ参加申請');
        joinDescription.textContent=rejected?'表示名を確認し、必要に応じてもう一度申請できます。':projectInvitation?'表示名とVRChatアカウントを確認し、招待されたプロジェクトへの参加申請を送信してください。':'表示名を確認し、オーナー／運営へ参加申請を送信してください。';
        joinStatus.textContent=rejected?(request.reviewNote||'オーナー／運営へ確認してください。'):'';
        setAuthStatus(additionalProjectRequest?'追加プロジェクトへの参加申請を送信してください。':'このGoogleアカウントはまだスタッフ登録されていません。');
      }
      window.setCloudSyncStatus?.('syncing','承認待ち','オーナー／運営が参加申請を承認すると共有データを開きます。');
    }

    function roleOptions(selected,canChooseOwner,includeExternal=false) {
      const normalizedSelected=normalizedRole(selected);
      const roles=canChooseOwner?['owner','operations','staff','cast']:['staff','cast'];
      if(includeExternal)roles.push('external_collaborator');
      return roles.map(role=>`<option value="${role}" ${normalizedSelected===role?'selected':''}>${roleLabels[role]}</option>`).join('');
    }

    function renderStaffManagement() {
      const canManage=staffManagementAvailable()&&activeUser&&managerRole(activeUser.role);
      if(!managementPanel)return;
      managementPanel.hidden=!canManage;
      if(!canManage)return;
      managementPermission.textContent=normalizedRole(activeUser.role)==='owner'?'オーナー権限':'運営権限';
      const pending=Object.entries(requestsData).filter(([,req])=>req&&req.status==='pending').sort((a,b)=>(a[1].requestedAt||0)-(b[1].requestedAt||0));
      requestCount.textContent=`${pending.length}件`;
      requestList.innerHTML=pending.length?pending.map(([uid,req])=>{
        const externalInvite=req.inviteKind==='external'||req.requestedRole==='external_collaborator';
        const reviewClaim=req.reviewClaim&&typeof req.reviewClaim==='object'?req.reviewClaim:null;
        const reviewLocked=!!reviewClaim?.id;
        const options=externalInvite
          ? `<option value="external_collaborator" selected>${safe(roleLabels.external_collaborator)}</option>`
          : reviewClaim?.role
            ? roleOptions(reviewClaim.role,normalizedRole(activeUser.role)==='owner')
            : `<option value="" selected>ロールを選択</option>${roleOptions('staff',normalizedRole(activeUser.role)==='owner').replaceAll(' selected','')}`;
        const inviteMeta=externalInvite?` ／ プロジェクト招待：${safe(req.projectId||'不明')}`:'';
        const reviewLabel=reviewLocked?(reviewClaim.phase==='canceling'?'解除処理中':reviewClaim.action==='reject'?'見送り処理中':reviewClaim.phase==='committing'?'承認確定中':'承認処理中'):(externalInvite?'外部協力者':'承認待ち');
        return `<div class="staff-request-card" data-request-uid="${safe(uid)}" data-request-locked="${reviewLocked?'true':'false'}">
          <div class="staff-request-top"><div><div class="staff-request-name">${safe(req.displayName||'名前未設定')}</div><div class="staff-request-email">${safe(req.email||'')}</div></div><span class="tag">${reviewLabel}</span></div>
          <div class="staff-request-meta">申請：${safe(formatDate(req.requestedAt))}${req.vrchat?` ／ <a href="${safe(req.vrchat)}" target="_blank" rel="noopener noreferrer">VRChatで本人確認</a>`:' ／ VRChatリンク未登録'}${inviteMeta}</div>
          <div class="staff-request-actions"><select data-request-role aria-label="承認する権限" ${externalInvite||reviewLocked?'disabled':''}>${options}</select><button class="btn small success" type="button" data-request-action="approve" ${reviewLocked||!externalInvite?'disabled':''}>許可</button><button class="btn small danger" type="button" data-request-action="reject" ${reviewLocked?'disabled':''}>見送り</button>${reviewLocked?'<button class="btn small" type="button" data-request-action="unlock">処理を解除</button>':''}</div>
        </div>`;
      }).join(''):'<div class="staff-admin-empty">現在、承認待ちの参加申請はありません。</div>';

      const members=Object.entries(membersData).sort((a,b)=>{
        const activeDiff=(a[1]?.active===false)-(b[1]?.active===false);if(activeDiff)return activeDiff;
        const roleDiff=(roleOrder[a[1]?.role]??9)-(roleOrder[b[1]?.role]??9);if(roleDiff)return roleDiff;
        return String(a[1]?.displayName||'').localeCompare(String(b[1]?.displayName||''),'ja');
      });
      memberCount.textContent=`${members.length}名`;
      memberList.innerHTML=members.length?members.map(([uid,member])=>{
        const isSelf=uid===activeUser.uid;
        const activeRole=normalizedRole(activeUser.role);
        const memberRole=normalizedRole(member.role);
        const adminProtected=activeRole==='operations'&&(memberRole==='owner'||memberRole==='operations');
        const selfOwner=isSelf&&activeRole==='owner';
        const protectedRow=adminProtected||selfOwner;
        const canChooseOwner=activeRole==='owner';
        const options=roleOptions(member.role,canChooseOwner,memberRole==='external_collaborator');
        const roleControl=protectedRow?`<div><span class="tag">${safe(roleLabels[member.role]||member.role)}</span><div class="staff-protected-note">${isSelf?'自分のオーナー権限は保護されています':'オーナーのみ変更可能'}</div></div>`:`<select data-member-role aria-label="権限">${options}</select>`;
        return `<div class="staff-member-row" data-member-uid="${safe(uid)}">
          <div class="staff-member-identity"><input data-member-name value="${safe(member.displayName||'')}" aria-label="表示名" ${adminProtected?'disabled':''}/><div class="staff-member-email">${safe(member.email||uid)}</div></div>
          ${roleControl}
          <label class="staff-active-label"><input type="checkbox" data-member-active ${member.active!==false?'checked':''} ${protectedRow?'disabled':''}/>有効</label>
          <button class="btn small" type="button" data-member-action="save" ${adminProtected?'disabled':''}>保存</button>
          <button class="btn small danger" type="button" data-member-action="delete" ${protectedRow?'disabled':''}>削除</button>
        </div>`;
      }).join(''):'<div class="staff-admin-empty">登録スタッフがいません。</div>';
      syncProfilesFromMembers();
    }

    function startManagementListeners() {
      if(!staffManagementAvailable()||!db||!activeUser||!managerRole(activeUser.role)){
        stopManagementListeners();
        return;
      }
      if(!unsubscribeMembers){
        unsubscribeMembers=onValue(ref(db,`teams/${TEAM_ID}/members`),snapshot=>{membersData=snapshot.val()||{};renderStaffManagement();syncProfilesFromMembers();},error=>{console.error(error);setManagementMessage(`スタッフ一覧を読み込めません：${error.message}`,'error');});
      }
      if(!unsubscribeRequests){
        unsubscribeRequests=onValue(ref(db,`teams/${TEAM_ID}/joinRequests`),snapshot=>{requestsData=snapshot.val()||{};renderStaffManagement();retryRejectedInviteClaimCleanup();},error=>{console.error(error);setManagementMessage(`参加申請を読み込めません：${error.message}`,'error');});
      }
      renderStaffManagement();
    }

    const isVisibility=value=>VISIBILITY_BUCKETS.includes(value);
    function migrationRecord(record,id,visibility,isTask=false){
      const next={...clone(record),id,visibility};
      if(isTask)next.audience=visibility;
      return next;
    }
    function collectVisibilityMigrationUpdates(section,raw,isTask=false){
      const updates={};
      const source=raw&&typeof raw==='object'?raw:{};
      const bucketRecords=Object.fromEntries(VISIBILITY_BUCKETS.map(bucket=>[bucket,source[bucket]&&typeof source[bucket]==='object'?source[bucket]:{}]));
      VISIBILITY_BUCKETS.forEach(bucket=>{
        Object.entries(bucketRecords[bucket]).forEach(([id,record])=>{
          if(!record||typeof record!=='object')return;
          const explicit=isVisibility(record.visibility)?record.visibility:(isTask&&isVisibility(record.audience)?record.audience:bucket);
          const normalized=migrationRecord(record,id,explicit,isTask);
          if(explicit!==bucket){
            if(!bucketRecords[explicit][id])updates[`${section}/${explicit}/${id}`]=normalized;
            updates[`${section}/${bucket}/${id}`]=null;
          }else if(!jsonEqual(record,normalized)){
            updates[`${section}/${bucket}/${id}`]=normalized;
          }
        });
      });
      Object.entries(source).forEach(([id,record])=>{
        if(isVisibility(id)||!record||typeof record!=='object')return;
        const visibility=isVisibility(record.visibility)?record.visibility:(isTask&&isVisibility(record.audience)?record.audience:'staff');
        if(!bucketRecords[visibility][id]&&updates[`${section}/${visibility}/${id}`]===undefined){
          updates[`${section}/${visibility}/${id}`]=migrationRecord(record,id,visibility,isTask);
        }
        updates[`${section}/${id}`]=null;
      });
      return updates;
    }
    async function migrateWorkspaceToV3() {
      if(normalizedRole(activeUser?.role)!=='owner')throw new Error('schema v3への公開範囲移行はオーナーのログインが必要です。');
      const [projectsSnapshot,notesSnapshot,tasksSnapshot]=await Promise.all([
        get(ref(db,`${WORKSPACE_PATH}/projects`)),
        get(ref(db,`${WORKSPACE_PATH}/notes`)),
        get(ref(db,`${WORKSPACE_PATH}/tasks`))
      ]);
      const updates={
        ...collectVisibilityMigrationUpdates('projects',projectsSnapshot.val()),
        ...collectVisibilityMigrationUpdates('notes',notesSnapshot.val()),
        ...collectVisibilityMigrationUpdates('tasks',tasksSnapshot.val(),true)
      };
      addWorkspaceMetadata(updates,window.getPlannerState?.()||{});
      updates['meta/visibilityMigratedAt']=serverTimestamp();
      await update(ref(db,WORKSPACE_PATH),updates);
    }
    async function initializeWorkspaceV3() {
      if(!managerRole(activeUser?.role))throw new Error('初回データ移行はオーナーまたは運営のログインが必要です。');
      const legacy=await get(ref(db,LEGACY_PLANNER_PATH));
      const seed=legacy.exists()?legacy.val():(window.getPlannerState?.()||{});
      const teamUpdates=buildWorkspaceUpdates(emptyWorkspaceState(),seed,{includeMeta:false});
      const personalUpdates=buildPersonalWorkspaceUpdates(emptyWorkspaceState(),seed);
      addWorkspaceMetadata(teamUpdates,seed);
      teamUpdates['meta/migratedFrom']=legacy.exists()?'planner-v1':'local-state';
      teamUpdates['meta/migratedAt']=serverTimestamp();
      const updates={};
      Object.entries(teamUpdates).forEach(([path,value])=>{updates[`${WORKSPACE_PATH}/${path}`]=value;});
      Object.entries(personalUpdates).forEach(([path,value])=>{updates[`${personalWorkspacePath(activeUser.uid)}/${path}`]=value;});
      await update(ref(db),updates);
    }
    async function ensureWorkspaceMigrated() {
      const schemaSnapshot=await get(ref(db,`${WORKSPACE_PATH}/meta/schemaVersion`));
      if(!schemaSnapshot.exists()){await initializeWorkspaceV3();return;}
      const schemaVersion=Number(schemaSnapshot.val())||0;
      if(schemaVersion>=3)return;
      await migrateWorkspaceToV3();
    }
    const values=(snapshot,decorate=value=>value)=>snapshot.exists()?Object.entries(snapshot.val()||{}).map(([key,value])=>decorate(value,key)):[];
    const snapshotValue=(snapshot,fallback)=>snapshot.exists()?snapshot.val():fallback;
    function externalProjectRecord(record,projectId,visibility,uid=activeUser?.uid||'') {
      const memberUids=Array.isArray(record?.memberUids)?record.memberUids:[];
      const externalCollaboratorUids=Array.isArray(record?.externalCollaboratorUids)?record.externalCollaboratorUids:[];
      return {
        ...normalizedVisibilityRecord(record,visibility),
        id:projectId,
        memberUids:uid?[...new Set([...memberUids,uid])]:memberUids,
        externalCollaboratorUids:uid?[...new Set([...externalCollaboratorUids,uid])]:externalCollaboratorUids
      };
    }
    function externalWorkspaceShell() {
      return {
        version:108,
        categoryMigrationVersion:0,
        categoryMaster:[],
        projectTemplates:[],
        tasks:[],
        events:[],
        projects:[],
        meetings:[],
        schedulePolls:[],
        notes:[],
        futureItems:[],
        trashItems:[],
        recoveryArchive:[],
        yearlyLogs:{},
        weeklyLogs:{},
        dailyEntries:{},
        changeLog:[],
        settings:{},
        preferences:{},
        menuConfig:[],
        adminConfig:{event:{},invites:[]}
      };
    }
    async function loadExternalWorkspaceState() {
      const projectIds=projectAccessEntries(activeUser).map(([projectId])=>projectId);
      const [
        projectSnapshotGroups,
        personalTaskSnapshot,personalEventSnapshot,personalFutureSnapshot,
        personalYearlySnapshot,personalWeeklySnapshot,personalDailySnapshot
      ]=await Promise.all([
        Promise.all(projectIds.map(projectId=>Promise.all(VISIBILITY_BUCKETS.map(visibility=>get(ref(db,`${WORKSPACE_PATH}/projects/${visibility}/${projectId}`)))))),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/tasks`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/events`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/futureItems`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/yearlyLogs`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/weeklyLogs`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/dailyEntries`))
      ]);
      const remote=externalWorkspaceShell();
      projectIds.forEach((projectId,projectIndex)=>{
        const snapshots=projectSnapshotGroups[projectIndex]||[];
        const visibilityIndex=snapshots.findIndex(snapshot=>snapshot.exists());
        if(visibilityIndex<0)return;
        remote.projects.push(externalProjectRecord(snapshots[visibilityIndex].val(),projectId,VISIBILITY_BUCKETS[visibilityIndex]));
      });
      remote.tasks=values(personalTaskSnapshot,value=>({...clone(value),workspaceId:'personal'}));
      remote.events=values(personalEventSnapshot,value=>({...clone(value),workspaceId:'personal'}));
      remote.futureItems=values(personalFutureSnapshot,value=>({...clone(value),workspaceId:'personal'}));
      remote.yearlyLogs=snapshotValue(personalYearlySnapshot,{});
      remote.weeklyLogs=snapshotValue(personalWeeklySnapshot,{});
      remote.dailyEntries=snapshotValue(personalDailySnapshot,{});
      return remote;
    }
    function withoutLegacyExternalInvites(value) {
      const config=clone(value||{});
      if(Array.isArray(config.invites))config.invites=config.invites.filter(invite=>invite?.kind!=='external');
      return config;
    }
    function publicAdminConfig(eventValue) {
      return {event:clone(eventValue||{}),invites:[],links:[],customRoles:[]};
    }
    async function loadWorkspaceState() {
      const role=activeUser?.role||'cast';
      if(normalizedRole(role)==='external_collaborator')return loadExternalWorkspaceState();
      const manager=managerRole(role);
      const allowed=allowedVisibilityBuckets(role);
      const readableSharedSections=readableSharedArraySections();
      const [
        taskSnapshots,projectSnapshots,noteSnapshots,sharedSnapshots,mapSnapshots,
        settingsSnapshot,preferencesSnapshot,menuConfigSnapshot,adminConfigSnapshot,categoryMasterSnapshot,projectTemplatesSnapshot,
        appVersionSnapshot,categoryMigrationSnapshot,personalTaskSnapshot,personalEventSnapshot,personalFutureSnapshot,personalYearlySnapshot,personalWeeklySnapshot,personalDailySnapshot
      ]=await Promise.all([
        Promise.all(allowed.map(visibility=>get(ref(db,`${WORKSPACE_PATH}/tasks/${visibility}`)))),
        Promise.all(allowed.map(visibility=>get(ref(db,`${WORKSPACE_PATH}/projects/${visibility}`)))),
        Promise.all(allowed.map(visibility=>get(ref(db,`${WORKSPACE_PATH}/notes/${visibility}`)))),
        Promise.all(readableSharedSections.map(section=>get(ref(db,`${WORKSPACE_PATH}/${section}`)))),
        Promise.all(MAP_SECTIONS.map(section=>get(ref(db,`${WORKSPACE_PATH}/${section}`)))),
        get(ref(db,`${WORKSPACE_PATH}/config/settings`)),
        get(ref(db,`${WORKSPACE_PATH}/config/preferences`)),
        get(ref(db,`${WORKSPACE_PATH}/config/menuConfig`)),
        get(ref(db,`${WORKSPACE_PATH}/config/adminConfig${manager?'':'/event'}`)),
        get(ref(db,`${WORKSPACE_PATH}/config/categoryMaster`)),
        get(ref(db,`${WORKSPACE_PATH}/config/projectTemplates`)),
        get(ref(db,`${WORKSPACE_PATH}/meta/appVersion`)),
        get(ref(db,`${WORKSPACE_PATH}/meta/categoryMigrationVersion`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/tasks`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/events`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/futureItems`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/yearlyLogs`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/weeklyLogs`)),
        get(ref(db,`${personalWorkspacePath(activeUser.uid)}/dailyEntries`))
      ]);
      const local=window.getPlannerState?.()||{};
      const remote=emptyWorkspaceState(local);
      remote.tasks=[];
      allowed.forEach((visibility,index)=>{
        remote.tasks.push(...values(taskSnapshots[index],value=>normalizedTeamTask(value,visibility)));
      });
      remote.tasks.push(...values(personalTaskSnapshot,value=>({...clone(value),workspaceId:'personal'})));
      VISIBILITY_SECTIONS.forEach((section,sectionIndex)=>{
        remote[section]=[];
        allowed.forEach((visibility,bucketIndex)=>{
          const snapshots=section==='projects'?projectSnapshots:noteSnapshots;
          remote[section].push(...values(snapshots[bucketIndex],value=>normalizedVisibilityRecord(value,visibility)));
        });
      });
      readableSharedSections.forEach((section,index)=>{
        const records=values(sharedSnapshots[index]);
        remote[section]=PERSONAL_ARRAY_SECTIONS.includes(section)?records.filter(record=>!isPersonalRecord(record)):records;
      });
      if(!managerRole(role))remote.recoveryArchive=[];
      remote.events.push(...values(personalEventSnapshot,value=>({...clone(value),workspaceId:'personal'})));
      remote.futureItems.push(...values(personalFutureSnapshot,value=>({...clone(value),workspaceId:'personal'})));
      remote.yearlyLogs=snapshotValue(personalYearlySnapshot,{});
      remote.weeklyLogs=snapshotValue(personalWeeklySnapshot,{});
      remote.dailyEntries=snapshotValue(personalDailySnapshot,{});
      MAP_SECTIONS.forEach((section,index)=>{remote[section]=snapshotValue(mapSnapshots[index],{});});
      remote.settings=snapshotValue(settingsSnapshot,local.settings);
      remote.preferences=snapshotValue(preferencesSnapshot,local.preferences);
      remote.menuConfig=snapshotValue(menuConfigSnapshot,local.menuConfig);
      remote.adminConfig=manager
        ?withoutLegacyExternalInvites(snapshotValue(adminConfigSnapshot,local.adminConfig))
        :publicAdminConfig(snapshotValue(adminConfigSnapshot,{}));
      remote.categoryMaster=snapshotValue(categoryMasterSnapshot,local.categoryMaster);
      remote.projectTemplates=snapshotValue(projectTemplatesSnapshot,local.projectTemplates);
      remote.version=Number(snapshotValue(appVersionSnapshot,local.version))||108;
      remote.categoryMigrationVersion=Number(snapshotValue(categoryMigrationSnapshot,local.categoryMigrationVersion))||0;
      return remote;
    }
    function recordSyncLocation(section,record){
      if(PERSONAL_ARRAY_SECTIONS.includes(section)&&isPersonalRecord(record))return `personal/${section}`;
      if(section==='tasks'||VISIBILITY_SECTIONS.includes(section))return `${section}/${recordVisibility(record)}`;
      return section;
    }
    function listenChildren(rootPath,path,section,knownKeys=new Set(),decorate=value=>value) {
      const target=ref(db,`${rootPath}/${path}`);
      const listenerGeneration=workspaceLoadGeneration;
      const sourceLocation=path.startsWith('tasks/')||path.startsWith('projects/')||path.startsWith('notes/')?path:(rootPath===WORKSPACE_PATH?section:`personal/${section}`);
      const initial=new Set(knownKeys);
      workspaceUnsubscribers.push(onChildAdded(target,snapshot=>{
        if(listenerGeneration!==workspaceLoadGeneration)return;
        if(initial.has(snapshot.key)){initial.delete(snapshot.key);return;}
        const value=decorate(snapshot.val(),snapshot.key);
        if(cloudBaseline){
          if(section==='tasks')cloudBaseline.tasks=[...(cloudBaseline.tasks||[]).filter(item=>item.id!==snapshot.key),value];
          else if(ARRAY_SECTIONS.includes(section))cloudBaseline[section]=[...(cloudBaseline[section]||[]).filter(item=>item.id!==snapshot.key),value];
          else cloudBaseline[section]={...(cloudBaseline[section]||{}),[snapshot.key]:value};
        }
        window.applyRemotePlannerPatch?.(section,snapshot.key,value);
      }));
      workspaceUnsubscribers.push(onChildChanged(target,snapshot=>{
        if(listenerGeneration!==workspaceLoadGeneration)return;
        const value=decorate(snapshot.val(),snapshot.key);
        if(cloudBaseline){
          if(section==='tasks')cloudBaseline.tasks=[...(cloudBaseline.tasks||[]).filter(item=>item.id!==snapshot.key),value];
          else if(ARRAY_SECTIONS.includes(section))cloudBaseline[section]=[...(cloudBaseline[section]||[]).filter(item=>item.id!==snapshot.key),value];
          else cloudBaseline[section]={...(cloudBaseline[section]||{}),[snapshot.key]:value};
        }
        window.applyRemotePlannerPatch?.(section,snapshot.key,value);
      }));
      workspaceUnsubscribers.push(onChildRemoved(target,snapshot=>{
        if(listenerGeneration!==workspaceLoadGeneration)return;
        if(cloudBaseline&&(ARRAY_SECTIONS.includes(section)||section==='tasks')){
          const removed=decorate(snapshot.val(),snapshot.key);
          const current=(cloudBaseline[section]||[]).find(item=>item.id===snapshot.key);
          // 公開範囲や個人／組織の移動では削除と追加が同時に届くため、
          // 新しい保存先がすでに反映済みなら旧保存先の削除通知を無視します。
          if(current&&recordSyncLocation(section,current)!==sourceLocation)return;
        }
        if(cloudBaseline){
          if(section==='tasks')cloudBaseline.tasks=(cloudBaseline.tasks||[]).filter(item=>item.id!==snapshot.key);
          else if(ARRAY_SECTIONS.includes(section))cloudBaseline[section]=(cloudBaseline[section]||[]).filter(item=>item.id!==snapshot.key);
          else if(cloudBaseline[section])delete cloudBaseline[section][snapshot.key];
        }
        window.applyRemotePlannerPatch?.(section,snapshot.key,null);
      }));
    }
    function listenSingleton(rootPath,path,section,decorate=value=>value) {
      let first=true;
      const listenerGeneration=workspaceLoadGeneration;
      workspaceUnsubscribers.push(onValue(ref(db,`${rootPath}/${path}`),snapshot=>{
        if(listenerGeneration!==workspaceLoadGeneration)return;
        if(first){first=false;return;}
        const value=decorate(snapshot.val());
        if(cloudBaseline)cloudBaseline[section]=clone(value);
        window.applyRemotePlannerPatch?.(section,'',value);
      }));
    }
    function listenExternalProject(projectId,initialProject=null) {
      const records=new Map();
      const listenerGeneration=workspaceLoadGeneration;
      if(initialProject)records.set(recordVisibility(initialProject),initialProject);
      let publishTimer=0,disposed=false;
      const publish=()=>{
        publishTimer=0;
        if(disposed)return;
        const current=(cloudBaseline?.projects||[]).find(item=>item.id===projectId)||null;
        const currentVisibility=current?recordVisibility(current):'';
        const value=(currentVisibility&&records.get(currentVisibility))
          ||VISIBILITY_BUCKETS.map(visibility=>records.get(visibility)).find(Boolean)
          ||null;
        if(jsonEqual(current,value))return;
        if(cloudBaseline){
          cloudBaseline.projects=(cloudBaseline.projects||[]).filter(item=>item.id!==projectId);
          if(value)cloudBaseline.projects.push(value);
        }
        window.applyRemotePlannerPatch?.('projects',projectId,value);
      };
      const schedulePublish=()=>{
        if(publishTimer)clearTimeout(publishTimer);
        publishTimer=setTimeout(publish,0);
      };
      VISIBILITY_BUCKETS.forEach(visibility=>{
        const path=`projects/${visibility}/${projectId}`;
        workspaceUnsubscribers.push(onValue(ref(db,`${WORKSPACE_PATH}/${path}`),snapshot=>{
          if(disposed||listenerGeneration!==workspaceLoadGeneration)return;
          if(snapshot.exists()){
            records.set(visibility,externalProjectRecord(snapshot.val(),projectId,visibility));
          }else{
            records.delete(visibility);
            const current=(cloudBaseline?.projects||[]).find(item=>item.id===projectId);
            // visibility移動後に旧bucketの削除通知が届いても、新bucketのprojectは消しません。
            if(current&&recordVisibility(current)!==visibility&&records.has(recordVisibility(current)))return;
          }
          schedulePublish();
        },error=>{
          console.error(`直接参照 ${path} を購読できません`,error);
          window.setCloudSyncStatus?.('error','プロジェクト更新エラー',error.message||'プロジェクトのアクセス権を確認してください。');
        }));
      });
      workspaceUnsubscribers.push(()=>{
        disposed=true;
        if(publishTimer)clearTimeout(publishTimer);
      });
    }
    function attachPersonalWorkspaceListeners(initialState) {
      listenChildren(personalWorkspacePath(activeUser.uid),'tasks','tasks',new Set((initialState.tasks||[]).filter(isPersonalRecord).map(item=>item.id)),value=>({...clone(value),workspaceId:'personal'}));
      listenChildren(personalWorkspacePath(activeUser.uid),'events','events',new Set((initialState.events||[]).filter(isPersonalRecord).map(item=>item.id)),value=>({...clone(value),workspaceId:'personal'}));
      listenChildren(personalWorkspacePath(activeUser.uid),'futureItems','futureItems',new Set((initialState.futureItems||[]).filter(isPersonalRecord).map(item=>item.id)),value=>({...clone(value),workspaceId:'personal'}));
      listenChildren(personalWorkspacePath(activeUser.uid),'yearlyLogs','yearlyLogs',new Set(Object.keys(initialState.yearlyLogs||{})));
      listenChildren(personalWorkspacePath(activeUser.uid),'weeklyLogs','weeklyLogs',new Set(Object.keys(initialState.weeklyLogs||{})));
      listenChildren(personalWorkspacePath(activeUser.uid),'dailyEntries','dailyEntries',new Set(Object.keys(initialState.dailyEntries||{})));
    }
    function attachWorkspaceListeners(initialState) {
      if(normalizedRole(activeUser?.role)==='external_collaborator'){
        projectAccessEntries(activeUser).forEach(([projectId])=>{
          listenExternalProject(projectId,(initialState.projects||[]).find(project=>project.id===projectId)||null);
        });
        attachPersonalWorkspaceListeners(initialState);
        return;
      }
      const allowed=allowedVisibilityBuckets(activeUser?.role||'cast');
      allowed.forEach(visibility=>{
        const known=new Set((initialState.tasks||[]).filter(task=>!isPersonalRecord(task)&&recordVisibility(task)===visibility).map(task=>task.id));
        listenChildren(WORKSPACE_PATH,`tasks/${visibility}`,'tasks',known,value=>normalizedTeamTask(value,visibility));
      });
      VISIBILITY_SECTIONS.forEach(section=>{
        allowed.forEach(visibility=>{
          const known=new Set((initialState[section]||[]).filter(record=>recordVisibility(record)===visibility).map(record=>record.id));
          listenChildren(WORKSPACE_PATH,`${section}/${visibility}`,section,known,value=>normalizedVisibilityRecord(value,visibility));
        });
      });
      readableSharedArraySections().forEach(section=>{
        const knownItems=PERSONAL_ARRAY_SECTIONS.includes(section)?(initialState[section]||[]).filter(record=>!isPersonalRecord(record)):(initialState[section]||[]);
        listenChildren(WORKSPACE_PATH,section,section,new Set(knownItems.map(item=>item.id)));
      });
      MAP_SECTIONS.forEach(section=>listenChildren(WORKSPACE_PATH,section,section,new Set(Object.keys(initialState[section]||{}))));
      attachPersonalWorkspaceListeners(initialState);
      listenSingleton(WORKSPACE_PATH,'config/settings','settings');
      listenSingleton(WORKSPACE_PATH,'config/preferences','preferences');
      listenSingleton(WORKSPACE_PATH,'config/menuConfig','menuConfig');
      if(managerRole(activeUser?.role))listenSingleton(WORKSPACE_PATH,'config/adminConfig','adminConfig',withoutLegacyExternalInvites);
      else listenSingleton(WORKSPACE_PATH,'config/adminConfig/event','adminConfig',publicAdminConfig);
      listenSingleton(WORKSPACE_PATH,'config/categoryMaster','categoryMaster');
      listenSingleton(WORKSPACE_PATH,'config/projectTemplates','projectTemplates');
      listenSingleton(WORKSPACE_PATH,'meta/appVersion','version');
      listenSingleton(WORKSPACE_PATH,'meta/categoryMigrationVersion','categoryMigrationVersion');
    }
    async function startPlannerListener() {
      if(workspaceReady)return true;
      if(!db||!activeUser)return false;
      const loadGeneration=workspaceLoadGeneration;
      const loadIdentity=JSON.stringify({uid:activeUser.uid,role:activeUser.role,projectAccess:projectAccessMap(activeUser.projectAccess)});
      const staleLoad=()=>loadGeneration!==workspaceLoadGeneration||loadIdentity!==JSON.stringify({uid:activeUser?.uid,role:activeUser?.role,projectAccess:projectAccessMap(activeUser?.projectAccess)});
      window.setCloudSyncStatus?.('syncing','共有データを読込中…','必要なデータだけを分割して読み込んでいます。');
      try{
        if(normalizedRole(activeUser.role)!=='external_collaborator')await ensureWorkspaceMigrated();
        if(staleLoad())return null;
        const remote=await loadWorkspaceState();
        if(staleLoad())return null;
        cloudBaseline=clone(remote);workspaceReady=true;
        window.applyRemotePlannerState?.(remote);
        attachWorkspaceListeners(remote);
        window.setCloudSyncStatus?.('online','同期済み',`${activeUser.name} として差分同期中`);
        if(pendingCloudState){const pending=pendingCloudState;pendingCloudState=null;await cloudSaveNow(pending);}
        return true;
      }catch(error){
        if(staleLoad())return null;
        console.error(error);
        window.setCloudSyncStatus?.('error','読込エラー',error.message||'Firebaseルールとスタッフ登録を確認してください。');
        return false;
      }
    }

    function enterWorkspace(user,member) {
      const normalizedMemberRole=normalizedRole(member.role||'cast');
      const nextProjectAccess=projectAccessMap(member.projectAccess);
      const accessScope=Object.keys(nextProjectAccess).sort().join(',');
      window.startPlannerCloudSession?.(`${user.uid}:${normalizedMemberRole}:${accessScope}`);
      const nextUser={uid:user.uid,email:user.email||member.email||'',name:member.displayName||user.displayName||user.email||'スタッフ',role:normalizedMemberRole,roleLabel:roleLabels[normalizedMemberRole]||normalizedMemberRole,projectAccess:nextProjectAccess};
      if(window.getPlannerSurface?.()==='owner'&&!['owner','operations'].includes(normalizedMemberRole)){
        stopWorkspaceListeners();
        activeUser=null;
        window.setStaffCloudUser?.(null);
        window.setStaffReadOnly?.(true);
        setGate(true);showUid('');
        if(joinPanel)joinPanel.hidden=true;
        if(loginBtn)loginBtn.hidden=true;
        if(ownerAccessDenied)ownerAccessDenied.hidden=false;
        setAuthStatus(`${nextUser.name} はイベントオーナー・運営権限ではログインしていません。`);
        return;
      }
      if(loginBtn)loginBtn.hidden=false;
      if(ownerAccessDenied)ownerAccessDenied.hidden=true;
      const roleChanged=activeUser&&activeUser.role!==nextUser.role;
      const accessChanged=activeUser&&!jsonEqual(projectAccessMap(activeUser.projectAccess),nextProjectAccess);
      activeUser=nextUser;
      window.setStaffCloudUser?.(activeUser);
      window.applyRolePageAccess?.();
      window.setStaffReadOnly?.(true);
      setGate(false);showUid('');if(joinPanel)joinPanel.hidden=true;
      setAuthStatus('ログイン済みです。');
      if(workspaceUid!==user.uid){stopWorkspaceListeners();workspaceUid=user.uid;}
      else if(roleChanged||accessChanged){
        workspaceLoadGeneration+=1;
        workspaceUnsubscribers.forEach(unsubscribe=>{try{unsubscribe?.();}catch(_){}});
        workspaceUnsubscribers=[];workspaceReady=false;cloudBaseline=null;pendingCloudState=null;
      }
      if(normalizedMemberRole==='external_collaborator'){
        if(unsubscribeProfiles){unsubscribeProfiles();unsubscribeProfiles=null;}
        profilesData={};
        window.staffDirectory={};
        ensureOwnProfile(user,member);
      }else{
        ensureOwnProfile(user,member);
        startProfilesListener();
      }
      startPlannerListener().then(ok=>{if(ok!==null)window.setStaffReadOnly?.(!ok);});
      if((roleChanged||accessChanged)&&unsubscribeMembers){unsubscribeMembers();unsubscribeMembers=null;}
      if((roleChanged||accessChanged)&&unsubscribeRequests){unsubscribeRequests();unsubscribeRequests=null;}
      startManagementListeners();
      startPublishedInviteListener();
      window.renderMyPage?.();
    }

    function refreshAccessView() {
      if(!authUser)return;
      if(ownMember&&ownMember.active!==false){
        if(additionalProjectInviteContext(ownMember)){
          const accessScope=Object.keys(projectAccessMap(ownMember.projectAccess)).sort().join(',');
          window.startPlannerCloudSession?.(`${authUser.uid}:${normalizedRole(ownMember.role)}:${accessScope}:invite-pending`);
          showJoinRequest(authUser,ownRequest,ownMember);
        }else enterWorkspace(authUser,ownMember);
      }
      else showJoinRequest(authUser,ownRequest,ownMember);
    }

    function monitorAccess(user) {
      stopAllListeners();
      authUser=user;ownMember=null;ownRequest=null;
      unsubscribeOwnMember=onValue(ref(db,`teams/${TEAM_ID}/members/${user.uid}`),snapshot=>{ownMember=snapshot.val();refreshAccessView();},error=>{console.error(error);setAuthStatus(`スタッフ登録を確認できません：${error.message}`);});
      unsubscribeOwnRequest=onValue(ref(db,`teams/${TEAM_ID}/joinRequests/${user.uid}`),snapshot=>{ownRequest=snapshot.val();refreshAccessView();},error=>{console.error(error);});
    }

    async function readProjectInvite(token,requestedProjectId='',existingClaimHash='') {
      if(!validInviteToken(token))throw new Error('招待トークンの形式が正しくありません。');
      const snapshot=await get(ref(db,projectInvitePath(token)));
      if(!snapshot.exists())return null;
      const invite=snapshot.val();
      const validationError=projectInviteValidationError(invite,token,requestedProjectId,existingClaimHash);
      if(validationError)throw new Error(validationError);
      return invite;
    }

    async function submitJoinRequest() {
      if(!db||!authUser)return;
      const name=joinName.value.trim();
      if(!name){joinStatus.textContent='表示名を入力してください。';joinName.focus();return;}
      const vrchat=joinVrchat?.value.trim()||'';
      if(!/^https:\/\/(www\.)?vrchat\.com\/home\/user\/usr_/i.test(vrchat)){joinStatus.textContent='VRChatアカウントリンクを入力してください。';joinVrchat?.focus();return;}
      joinSubmit.disabled=true;joinStatus.textContent='参加申請を送信しています…';
      try{
        const params=new URLSearchParams(location.search);
        const globalToken=params.get('globalInvite')||'';
        if(globalToken){
          const inviteSnapshot=await get(ref(db,`globalInvites/${globalToken}`)),invite=inviteSnapshot.val();
          if(!invite?.active||Number(invite.used)>=1||Date.now()>new Date(invite.expiresAt).getTime())throw new Error('この代表者招待リンクは無効または期限切れです。');
          await set(ref(db,`globalManagement/applications/${authUser.uid}`),{id:authUser.uid,uid:authUser.uid,eventId:invite.eventId,displayName:name,email:authUser.email||'',photoURL:authUser.photoURL||'',vrchat,invitationToken:globalToken,status:'pending',requestedAt:serverTimestamp()});
          joinStatus.textContent='イベント代表者の参加申請を送信しました。全体管理者の承認をお待ちください。';
          return;
        }
        const invitationToken=params.get('invite')||'';
        const requestedProjectId=params.get('project')||'';
        const projectInvite=invitationToken?await readProjectInvite(invitationToken,requestedProjectId):null;
        if(requestedProjectId&&!projectInvite)throw new Error('プロジェクト招待リンクが見つからないか、無効になっています。');
        const request={
          uid:authUser.uid,
          displayName:name,
          email:authUser.email||'',
          photoURL:authUser.photoURL||'',
          vrchat,
          invitationToken,
          status:'pending',
          requestedAt:serverTimestamp(),
          ...(projectInvite?{
            requestedRole:'external_collaborator',
            inviteKind:'external',
            eventId:projectInvite.eventId,
            teamId:projectInvite.teamId,
            projectId:projectInvite.projectId,
            projectVisibility:projectInvite.projectVisibility
          }:{})
        };
        await set(ref(db,`teams/${TEAM_ID}/joinRequests/${authUser.uid}`),request);
        joinStatus.textContent=projectInvite
          ? '外部協力者としてプロジェクト参加を申請しました。イベントオーナー／運営の承認をお待ちください。'
          : '参加申請を送信しました。承認されるまでこの画面で待つか、後からもう一度開いてください。';
      }catch(error){console.error(error);joinStatus.textContent=`申請を送信できません：${error.message}`;}
      finally{joinSubmit.disabled=false;}
    }

    async function refreshRegistration() {
      if(!db||!authUser)return;
      joinRefresh.disabled=true;joinStatus.textContent='登録状況を確認しています…';
      try{
        const [memberSnap,requestSnap]=await Promise.all([get(ref(db,`teams/${TEAM_ID}/members/${authUser.uid}`)),get(ref(db,`teams/${TEAM_ID}/joinRequests/${authUser.uid}`))]);
        ownMember=memberSnap.val();ownRequest=requestSnap.val();refreshAccessView();
      }catch(error){console.error(error);joinStatus.textContent=`確認できません：${error.message}`;}
      finally{joinRefresh.disabled=false;}
    }

    async function resolveProjectLocation(projectId) {
      const readableBuckets=allowedVisibilityBuckets(activeUser?.role||'cast');
      const snapshots=await Promise.all(readableBuckets.map(visibility=>get(ref(db,`${WORKSPACE_PATH}/projects/${visibility}/${projectId}`))));
      const matches=readableBuckets.flatMap((visibility,index)=>snapshots[index].exists()?[{visibility,record:snapshots[index].val()}]:[]);
      if(!matches.length)throw new Error(normalizedRole(activeUser?.role)==='operations'?'このプロジェクトは運営権限で承認できません。イベントオーナーへ承認を依頼してください。':'招待先プロジェクトを読み込めません。');
      if(matches.length>1)throw new Error('招待先プロジェクトの公開範囲が重複しています。整理後にもう一度承認してください。');
      return matches[0];
    }

    async function claimProjectInvite(token,request,uid,preparedHash='') {
      const requestedProjectId=String(request?.projectId||'');
      const claimHash=preparedHash||await projectInviteClaimHash(token,uid);
      let addedClaim=false;
      const result=await runTransaction(ref(db,projectInvitePath(token)),invite=>{
        addedClaim=false;
        const validationError=projectInviteValidationError(invite,token,requestedProjectId,claimHash);
        if(validationError)return;
        const claimHashes=normalizedClaimHashes(invite.claimHashes);
        if(claimHashes[claimHash]===true){
          const used=Math.max(0,Object.values(claimHashes).filter(value=>value===true).length-1);
          return {...invite,claimHashes,used,active:invite.active!==false};
        }
        claimHashes[claimHash]=true;
        addedClaim=true;
        const used=Math.max(0,Object.values(claimHashes).filter(value=>value===true).length-1);
        return {...invite,claimHashes,used,active:invite.active!==false};
      },{applyLocally:false});
      if(!result.committed)throw new Error('招待リンクが期限切れ、無効、または使用上限に達しました。');
      return {invite:result.snapshot.val(),claimHash,added:addedClaim};
    }

    async function releaseProjectInviteClaim(token,claimHash) {
      if(!claimHash)return;
      await runTransaction(ref(db,projectInvitePath(token)),invite=>{
        if(!invite||invite.kind!=='external')return invite;
        const claimHashes=normalizedClaimHashes(invite.claimHashes);
        if(claimHashes[claimHash]!==true)return invite;
        delete claimHashes[claimHash];
        const used=Math.max(0,Object.values(claimHashes).filter(value=>value===true).length-1);
        return {...invite,claimHashes,used,active:invite.active!==false};
      },{applyLocally:false});
    }

    function requestReviewClaimId() {
      return globalThis.crypto?.randomUUID?.()||`${activeUser?.uid||'manager'}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    function requestReviewIdentity(request) {
      return JSON.stringify({
        uid:String(request?.uid||''),
        email:String(request?.email||''),
        displayName:String(request?.displayName||''),
        photoURL:String(request?.photoURL||''),
        vrchat:String(request?.vrchat||''),
        inviteKind:String(request?.inviteKind||''),
        requestedRole:String(request?.requestedRole||''),
        invitationToken:String(request?.invitationToken||''),
        eventId:String(request?.eventId||''),
        teamId:String(request?.teamId||''),
        projectId:String(request?.projectId||''),
        projectVisibility:String(request?.projectVisibility||''),
        requestedAt:request?.requestedAt??null
      });
    }

    async function acquireRequestReview(uid,action,role='',requestHint=null) {
      const id=requestReviewClaimId();
      const expectedIdentity=requestReviewIdentity(requestHint);
      const externalApprove=action==='approve'&&(requestHint?.inviteKind==='external'||requestHint?.requestedRole==='external_collaborator')&&validInviteToken(requestHint?.invitationToken);
      const inviteClaimHash=externalApprove?await projectInviteClaimHash(requestHint.invitationToken,uid,id):'';
      const claim={id,uid:activeUser.uid,action,phase:'reviewing',at:Date.now(),...(action==='approve'?{role}:{}),...(inviteClaimHash?{inviteClaimHash}:{})};
      const requestRef=ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`);
      const result=await runTransaction(requestRef,current=>{
        if(!current||current.status!=='pending')return;
        if(requestReviewIdentity(current)!==expectedIdentity)return;
        const existing=current.reviewClaim&&typeof current.reviewClaim==='object'?current.reviewClaim:null;
        if(existing?.id)return;
        return {...current,reviewClaim:claim};
      },{applyLocally:false});
      const request=result.snapshot.val();
      if(!result.committed||request?.reviewClaim?.id!==claim.id)throw new Error('この申請は別の管理者が処理中か、すでに更新されています。');
      return {claim,request};
    }

    async function releaseRequestReview(uid,claimId) {
      if(!claimId)return;
      await runTransaction(ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`),current=>{
        if(!current||current.status!=='pending'||current.reviewClaim?.id!==claimId)return current;
        if(current.reviewClaim.phase==='canceling')return current;
        const next={...current};
        delete next.reviewClaim;
        return next;
      },{applyLocally:false});
    }

    async function beginRequestReviewCommit(uid,claimId) {
      const result=await runTransaction(ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`),current=>{
        if(!current||current.status!=='pending'||current.reviewClaim?.id!==claimId||current.reviewClaim?.phase!=='reviewing')return;
        return {...current,reviewClaim:{...current.reviewClaim,phase:'committing',commitStartedAt:Date.now()}};
      },{applyLocally:false});
      if(!result.committed||result.snapshot.val()?.reviewClaim?.id!==claimId)throw new Error('申請処理が解除または更新されました。もう一度一覧から操作してください。');
      return result.snapshot.val();
    }

    async function assertRequestReviewCommit(uid,claimId) {
      const snapshot=await get(ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`));
      const request=snapshot.val();
      if(!request||request.status!=='pending'||request.reviewClaim?.id!==claimId||request.reviewClaim?.phase!=='committing')throw new Error('申請処理が解除または更新されました。もう一度一覧から操作してください。');
      return request;
    }

    async function unlockRequestReview(uid) {
      const preview=requestsData[uid];
      if(!preview?.reviewClaim?.id||!activeUser||!managerRole(activeUser.role))return;
      if(!confirm(`${preview.displayName||preview.email}さんの処理ロックを解除しますか？\n別タブで処理中でないことを確認してから実行してください。`))return;
      setManagementMessage('申請処理ロックを解除しています…');
      const claimId=preview.reviewClaim.id;
      try{
        const result=await runTransaction(ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`),current=>{
          if(!current||current.status!=='pending'||current.reviewClaim?.id!==claimId)return;
          if(current.reviewClaim.phase==='canceling')return current;
          return {...current,reviewClaim:{...current.reviewClaim,phase:'canceling',cancelStartedAt:Date.now()}};
        },{applyLocally:false});
        if(!result.committed)throw new Error('申請の状態が更新されています。一覧を再読み込みしてください。');
        const request=result.snapshot.val();
        if((request.inviteKind==='external'||request.requestedRole==='external_collaborator')&&validInviteToken(request.invitationToken)){
          const exactHash=request.reviewClaim?.inviteClaimHash||'';
          if(exactHash)await releaseProjectInviteClaim(request.invitationToken,exactHash);
          else if(request.reviewClaim?.action==='approve')await releaseProjectInviteClaim(request.invitationToken,await projectInviteClaimHash(request.invitationToken,uid));
        }
        const unlocked=await runTransaction(ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`),current=>{
          if(!current||current.status!=='pending'||current.reviewClaim?.id!==claimId||current.reviewClaim?.phase!=='canceling')return;
          const next={...current};
          delete next.reviewClaim;
          return next;
        },{applyLocally:false});
        if(!unlocked.committed)throw new Error('申請の状態が更新されています。一覧を再読み込みしてください。');
        setManagementMessage('処理ロックを解除しました。もう一度承認または見送りを実行できます。','success');
      }catch(error){
        console.error(error);
        setManagementMessage(`処理ロックを解除できません：${error.message}`,'error');
      }
    }

    function cleanupRejectedInviteClaim(uid,request) {
      const external=request?.inviteKind==='external'||request?.requestedRole==='external_collaborator';
      if(request?.status!=='rejected'||request.inviteClaimReleasedAt||!external||!validInviteToken(request.invitationToken))return Promise.resolve(true);
      const cleanupKey=`${uid}:${request.invitationToken}:${Number(request.reviewedAt)||0}`;
      if(rejectedInviteCleanupPromises.has(cleanupKey))return rejectedInviteCleanupPromises.get(cleanupKey);
      const cleanup=(async()=>{
        try{
          const expectedToken=request.invitationToken;
          const expectedReviewedAt=Number(request.reviewedAt)||0;
          const claimHash=await projectInviteClaimHash(request.invitationToken,uid);
          await releaseProjectInviteClaim(request.invitationToken,claimHash);
          const marked=await runTransaction(ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`),current=>{
            if(
              !current
              ||current.status!=='rejected'
              ||current.invitationToken!==expectedToken
              ||Number(current.reviewedAt)!==expectedReviewedAt
            )return;
            return {...current,inviteClaimReleasedAt:Date.now()};
          },{applyLocally:false});
          if(!marked.committed){
            const current=marked.snapshot.val();
            const sameRejected=current?.status==='rejected'&&current.invitationToken===expectedToken&&Number(current.reviewedAt)===expectedReviewedAt;
            if(sameRejected)throw new Error('見送り申請へクリーンアップ完了を記録できませんでした。');
          }
          return true;
        }catch(error){
          console.error('見送り後の招待リンク使用回数を戻せませんでした',error);
          return false;
        }
      })();
      rejectedInviteCleanupPromises.set(cleanupKey,cleanup);
      void cleanup.finally(()=>{if(rejectedInviteCleanupPromises.get(cleanupKey)===cleanup)rejectedInviteCleanupPromises.delete(cleanupKey);});
      return cleanup;
    }

    function retryRejectedInviteClaimCleanup() {
      if(!activeUser||!managerRole(activeUser.role))return;
      Object.entries(requestsData).forEach(([uid,request])=>{void cleanupRejectedInviteClaim(uid,request);});
    }

    async function approveRequest(uid,row) {
      const previewRequest=requestsData[uid];if(!previewRequest||!activeUser||!managerRole(activeUser.role))return;
      const selectedRole=row.querySelector('[data-request-role]')?.value||'';
      if(!selectedRole){setManagementMessage('申請者のロールを選択してから許可してください。','error');return;}
      setManagementMessage('参加申請を承認しています…');
      let review=null,inviteContext=null,commitAttempted=false,approvedRole='';
      try{
        review=await acquireRequestReview(uid,'approve',selectedRole,previewRequest);
        const request=review.request;
        const projectInviteRequest=request.inviteKind==='external'||request.requestedRole==='external_collaborator';
        const role=projectInviteRequest?'external_collaborator':normalizedRole(selectedRole);
        approvedRole=role;
        if(selectedRole==='external_collaborator'&&!projectInviteRequest)throw new Error('外部協力者は有効なプロジェクト招待からのみ承認できます。');
        if(normalizedRole(activeUser.role)==='operations'&&!['staff','cast','external_collaborator'].includes(role))throw new Error('運営が追加できるのは「スタッフ」「キャスト」「外部協力者」です。');
        let projectLocation=null,currentMember={};
        let inviteClaim=null;
        if(projectInviteRequest){
          if(!validInviteToken(request.invitationToken))throw new Error('申請に有効な招待トークンがありません。');
          const claimHash=review.claim.inviteClaimHash||await projectInviteClaimHash(request.invitationToken,uid,review.claim.id);
          inviteContext={token:request.invitationToken,claimHash,projectId:request.projectId};
          const invite=await readProjectInvite(request.invitationToken,request.projectId,claimHash);
          if(!invite)throw new Error('プロジェクト招待リンクが見つかりません。');
          const [resolvedProject,memberSnapshot]=await Promise.all([
            resolveProjectLocation(invite.projectId),
            get(ref(db,`teams/${TEAM_ID}/members/${uid}`))
          ]);
          projectLocation=resolvedProject;
          currentMember=memberSnapshot.val()||{};
          await beginRequestReviewCommit(uid,review.claim.id);
          inviteClaim=await claimProjectInvite(request.invitationToken,request,uid,claimHash);
        }else{
          await beginRequestReviewCommit(uid,review.claim.id);
        }
        const claimedInvite=inviteClaim?.invite||null;
        const displayName=request.displayName||request.email||(role==='external_collaborator'?'外部協力者':'スタッフ');
        const projectAccess=claimedInvite?{...projectAccessMap(currentMember.projectAccess),[claimedInvite.projectId]:true}:{};
        const teamUpdates={
          [`members/${uid}`]:{
            ...currentMember,
            displayName,email:request.email||'',photoURL:request.photoURL||'',role,active:true,
            ...(claimedInvite?{projectAccess}:{}),
            approvalClaimId:review.claim.id,
            createdAt:currentMember.createdAt||serverTimestamp(),approvedAt:serverTimestamp(),approvedBy:activeUser.name,approvedByUid:activeUser.uid
          },
          [`profiles/${uid}`]:{
            ...(profilesData[uid]||{}),
            displayName,role,active:true,photoURL:request.photoURL||'',discord:'',vrchat:request.vrchat||'',
            updatedAt:serverTimestamp(),updatedByUid:activeUser.uid
          },
          [`joinRequests/${uid}`]:null
        };
        if(claimedInvite&&projectLocation){
          teamUpdates[`workspace/projects/${projectLocation.visibility}/${claimedInvite.projectId}/externalCollaborators/${uid}`]=true;
        }
        await assertRequestReviewCommit(uid,review.claim.id);
        commitAttempted=true;
        await update(ref(db,`teams/${TEAM_ID}`),teamUpdates);
        setManagementMessage(`${request.displayName||request.email}さんを${roleLabels[role]}として承認しました。`,'success');
      }catch(error){
        let grantApplied=false,grantCheckFailed=false;
        if(commitAttempted&&review){
          try{
            const member=(await get(ref(db,`teams/${TEAM_ID}/members/${uid}`))).val()||{};
            grantApplied=inviteContext
              ? member.active!==false&&normalizedRole(member.role)==='external_collaborator'&&projectAccessMap(member.projectAccess)[inviteContext.projectId]===true
              : member.active!==false&&normalizedRole(member.role)===approvedRole;
          }catch(verificationError){
            grantCheckFailed=true;
            console.error('承認結果を確認できません',verificationError);
          }
        }
        if(grantApplied){
          setManagementMessage(`${review.request.displayName||review.request.email}さんの承認は完了しています。`,'success');
          return;
        }
        if(!grantCheckFailed){
          let rollbackFailed=false;
          if(inviteContext){
            try{await releaseProjectInviteClaim(inviteContext.token,inviteContext.claimHash);}
            catch(rollbackError){rollbackFailed=true;console.error('招待リンク使用回数の巻き戻しに失敗しました',rollbackError);}
          }
          if(review&&!rollbackFailed){
            try{await releaseRequestReview(uid,review.claim.id);}
            catch(releaseError){console.error('申請処理ロックの解除に失敗しました',releaseError);}
          }
        }
        console.error(error);
        setManagementMessage(grantCheckFailed?'承認結果を確認できません。通信を確認して一覧を再読み込みしてください。':`承認できません：${error.message}`,'error');
      }
    }

    async function rejectRequest(uid) {
      const previewRequest=requestsData[uid];if(!previewRequest||!activeUser||!managerRole(activeUser.role))return;
      if(!confirm(`${previewRequest.displayName||previewRequest.email}さんの参加申請を見送りますか？`))return;
      setManagementMessage('参加申請を更新しています…');
      let review=null;
      try{
        review=await acquireRequestReview(uid,'reject','',previewRequest);
        const request=review.request;
        const result=await runTransaction(ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`),current=>{
          if(!current||current.status!=='pending'||current.reviewClaim?.id!==review.claim.id||current.reviewClaim?.phase!=='reviewing')return;
          const rejected={...current,status:'rejected',reviewedAt:Date.now(),reviewedBy:activeUser.name,reviewedByUid:activeUser.uid,reviewNote:'参加申請が見送られました。必要な場合はオーナーへ確認してください。'};
          delete rejected.reviewClaim;
          return rejected;
        },{applyLocally:false});
        if(!result.committed)throw new Error('申請の状態が更新されています。一覧を再読み込みしてください。');
        if(!await cleanupRejectedInviteClaim(uid,result.snapshot.val())){
          setManagementMessage('申請は見送りました。招待リンクの使用回数は通信復旧後に自動で戻します。','error');
          return;
        }
        setManagementMessage('参加申請を見送りました。','success');
      }catch(error){
        if(review){
          try{await releaseRequestReview(uid,review.claim.id);}
          catch(releaseError){console.error('申請処理ロックの解除に失敗しました',releaseError);}
        }
        console.error(error);setManagementMessage(`更新できません：${error.message}`,'error');
      }
    }

    async function saveMember(uid,row) {
      const current=membersData[uid];if(!current||!activeUser||!managerRole(activeUser.role))return;
      const name=row.querySelector('[data-member-name]')?.value.trim()||current.displayName||'スタッフ';
      const role=normalizedRole(row.querySelector('[data-member-role]')?.value||current.role);
      const active=row.querySelector('[data-member-active]')?.checked!==false;
      if(uid===activeUser.uid&&normalizedRole(activeUser.role)==='owner'&&(role!=='owner'||!active)){setManagementMessage('自分自身のオーナー権限を解除・停止することはできません。','error');return;}
      if(normalizedRole(current.role)!=='external_collaborator'&&role==='external_collaborator'){setManagementMessage('外部協力者は有効なプロジェクト招待からのみ追加できます。','error');return;}
      if(normalizedRole(activeUser.role)==='operations'&&(['owner','operations'].includes(normalizedRole(current.role))||!['staff','cast','external_collaborator'].includes(role))){setManagementMessage('運営はオーナー／運営の変更や追加を行えません。','error');return;}
      setManagementMessage('スタッフ情報を保存しています…');
      try{
        await set(ref(db,`teams/${TEAM_ID}/members/${uid}`),{...current,displayName:name,role,active,updatedAt:serverTimestamp(),updatedBy:activeUser.name,updatedByUid:activeUser.uid});
        const currentProfile=profilesData[uid]||{};
        await set(ref(db,`teams/${TEAM_ID}/profiles/${uid}`),{...currentProfile,displayName:name,role,active,photoURL:current.photoURL||currentProfile.photoURL||'',discord:currentProfile.discord||'',vrchat:currentProfile.vrchat||'',updatedAt:serverTimestamp(),updatedByUid:activeUser.uid});
        setManagementMessage(`${name}さんの設定を保存しました。`,'success');
      }catch(error){console.error(error);setManagementMessage(`保存できません：${error.message}`,'error');}
    }

    async function deleteMember(uid) {
      const current=membersData[uid];if(!current||!activeUser||!managerRole(activeUser.role))return;
      const activeRole=normalizedRole(activeUser.role), targetRole=normalizedRole(current.role);
      if(uid===activeUser.uid){setManagementMessage('自分自身の登録は削除できません。','error');return;}
      if(activeRole==='operations'&&['owner','operations'].includes(targetRole)){setManagementMessage('運営はオーナー／運営を削除できません。','error');return;}
      const name=current.displayName||current.email||'このスタッフ';
      if(!confirm(`${name}さんのStaff Planner登録を削除しますか？\nGoogleアカウント自体は削除されません。再参加する場合は、もう一度参加申請が必要です。`))return;
      setManagementMessage('スタッフ登録を削除しています…');
      try{
        await set(ref(db,`teams/${TEAM_ID}/members/${uid}`),null);
        await set(ref(db,`teams/${TEAM_ID}/profiles/${uid}`),null);
        await set(ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`),null);
        setManagementMessage(`${name}さんの登録を削除しました。既存タスクの作成者・担当者名は記録として残ります。`,'success');
      }catch(error){console.error(error);setManagementMessage(`削除できません：${error.message}`,'error');}
    }

    joinSubmit?.addEventListener('click',submitJoinRequest);
    joinRefresh?.addEventListener('click',refreshRegistration);
    requestList?.addEventListener('click',event=>{
      const button=event.target.closest('[data-request-action]');if(!button)return;
      const row=button.closest('[data-request-uid]');if(!row)return;
      const uid=row.dataset.requestUid;
      if(button.dataset.requestAction==='approve')approveRequest(uid,row);
      if(button.dataset.requestAction==='reject')rejectRequest(uid);
      if(button.dataset.requestAction==='unlock')unlockRequestReview(uid);
    });
    requestList?.addEventListener('change',event=>{
      if(!event.target.matches('[data-request-role]'))return;
      const row=event.target.closest('[data-request-uid]');
      const approve=row?.querySelector('[data-request-action="approve"]');
      if(approve)approve.disabled=row?.dataset.requestLocked==='true'||!event.target.value;
    });
    memberList?.addEventListener('click',event=>{
      const button=event.target.closest('[data-member-action]');if(!button)return;
      const row=button.closest('[data-member-uid]');if(!row)return;
      if(button.dataset.memberAction==='save')saveMember(row.dataset.memberUid,row);
      if(button.dataset.memberAction==='delete')deleteMember(row.dataset.memberUid);
    });

    signOutBtn?.addEventListener('click',async()=>{
      if(!auth)return;
      if(!confirm('ログアウトしますか？\\n未同期の変更がある場合は、通信状態を確認してからログアウトしてください。'))return;
      await signOut(auth);
    });
    ownerDeniedSignOutBtn?.addEventListener('click',async()=>{
      if(auth)await signOut(auth);
      if(loginBtn)loginBtn.hidden=false;
      if(ownerAccessDenied)ownerAccessDenied.hidden=true;
      setAuthStatus('オーナーのGoogleアカウントでログインしてください。');
    });

    if(!configured()&&isLocalPreviewHost){
      loginBtn.disabled=true;
      signOutBtn?.setAttribute('disabled','');
      setAuthStatus('ローカル確認モードで起動しています。');
      let localPreviewStarted=false;
      const startLocalPreview=()=>{
        if(localPreviewStarted)return;
        localPreviewStarted=true;
        setGate(false);
        if(loginBtn)loginBtn.hidden=true;
        if(joinPanel)joinPanel.hidden=true;
        activeUser={uid:'local-preview-owner',email:'',name:'ローカル確認',role:'owner',roleLabel:roleLabels.owner};
        try{profilesData=JSON.parse(localStorage.getItem('arasaki_local_profiles_v1')||'{}')||{};}catch(_){profilesData={};}
        window.setStaffCloudUser?.(activeUser);
        try{
          syncStaffDirectory();
          window.applyRolePageAccess?.();
          window.renderMyPage?.();
          if(location.pathname.split('/').filter(Boolean)[0]==='admin'){
            const storageKey='arasaki_local_global_admin_v1';
            let localGlobalData;
            try{localGlobalData=JSON.parse(localStorage.getItem(storageKey)||'null');}catch(_){localGlobalData=null;}
            if(!localGlobalData){
              localGlobalData=localGlobalAdminSample();
              localStorage.setItem(storageKey,JSON.stringify(localGlobalData));
            }
            window.globalAdminCloud={save(data){
              localStorage.setItem(storageKey,JSON.stringify(data));
              return Promise.resolve();
            }};
            window.setGlobalAdminData?.(localGlobalData);
          }
        }catch(error){
          console.error('ローカル確認画面の初期描画でエラーが発生しました。',error);
        }
        window.setStaffReadOnly?.(false);
        if(managementPanel)managementPanel.hidden=true;
        showUid('');
        window.setCloudSyncStatus?.('offline','ローカル確認モード','データはこのブラウザ内だけに保存され、Firebaseとは同期されません。');
      };
      appReadyPromise.then(startLocalPreview);
      window.setTimeout(startLocalPreview,1200);
    }else{
      window.startPlannerCloudSession?.('cloud-pending');
      try{
        const app=initializeApp(FIREBASE_CONFIG);
        auth=getAuth(app);db=getDatabase(app);
        const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
        loginBtn.addEventListener('click',async()=>{
          loginBtn.disabled=true;setAuthStatus('Googleログインを開いています…');
          try{await signInWithPopup(auth,provider);}catch(error){console.error(error);setAuthStatus(`ログインできませんでした：${error.message||error.code}`);}finally{loginBtn.disabled=false;}
        });
        onAuthStateChanged(auth,async user=>{
          await appReadyPromise;
          stopAllListeners();
          if(user){
            window.startPlannerCloudSession?.(`${user.uid}:pending`);
            authUser=user;
            if(window.getPlannerSurface?.()==='global'){setAuthStatus('全体管理者権限を確認しています…');await enterGlobalAdmin(user);}
            else{setAuthStatus('スタッフ登録を確認しています…');monitorAccess(user);}
          }
          else{
            window.endPlannerCloudSession?.();
            authUser=null;activeUser=null;ownMember=null;ownRequest=null;window.setStaffCloudUser?.(null);window.setStaffReadOnly?.(false);setGate(true);if(joinPanel)joinPanel.hidden=true;showUid('');setAuthStatus('荒嵜造船所スタッフのGoogleアカウントでログインしてください。');window.setCloudSyncStatus?.('syncing','ログイン待ち','Googleログイン後に共有データを読み込みます。');
          }
        });
      }catch(error){console.error(error);loginBtn.disabled=true;setAuthStatus(`Firebase初期化エラー：${error.message}`);}
    }
