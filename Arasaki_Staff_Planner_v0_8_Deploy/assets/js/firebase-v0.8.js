import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
    import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
    import { getDatabase, ref, get, set, update, onValue, onChildAdded, onChildChanged, onChildRemoved, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js';

    const DEFAULT_TEAM_ID='arasaki-shipyard';
    async function loadFirebaseRuntimeConfig() {
      try {
        const response=await fetch('/__/firebase/init.json',{cache:'no-store'});
        const contentType=response.headers.get('content-type')||'';
        if(!response.ok||!contentType.includes('application/json'))throw new Error(`Firebase Hosting config: ${response.status}`);
        const config=await response.json();
        if(!config?.apiKey||!config?.projectId||!config?.appId)throw new Error('Firebase Hosting config is incomplete');
        return {FIREBASE_CONFIG:config,TEAM_ID:DEFAULT_TEAM_ID};
      } catch (hostingError) {
        console.info('Firebase Hosting外のため、ローカルconfig.jsを使用します。',hostingError);
        return import('./config.js?v=0.8');
      }
    }
    const {FIREBASE_CONFIG,TEAM_ID}=await loadFirebaseRuntimeConfig();

    const roleLabels = {owner:'オーナー',operations:'運営',staff:'スタッフ',cast:'キャスト',admin:'運営',member:'スタッフ',viewer:'キャスト'};
    const roleOrder = {owner:0,operations:1,admin:1,staff:2,member:2,cast:3,viewer:3};

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

    let auth=null, db=null, activeUser=null, authUser=null;
    let ownMember=null, ownRequest=null, workspaceUid='';
    let membersData={}, requestsData={}, profilesData={};
    let unsubscribeOwnMember=null, unsubscribeOwnRequest=null, unsubscribeMembers=null, unsubscribeRequests=null, unsubscribeProfiles=null;
    let workspaceUnsubscribers=[], workspaceReady=false, cloudBaseline=null, pendingCloudState=null;
    const appReadyPromise=window.__ARASAKI_APP_READY__
      ? Promise.resolve()
      : new Promise(resolve=>document.addEventListener('arasaki-app-ready',resolve,{once:true}));

    const configured=()=>Object.values(FIREBASE_CONFIG).every(value=>value && !String(value).includes('ここに'));
    const normalizedRole=role=>({admin:'operations',member:'staff',viewer:'cast'}[role]||role);
    const managerRole=role=>normalizedRole(role)==='owner'||normalizedRole(role)==='operations';
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

    function stopWorkspaceListeners() {
      workspaceUnsubscribers.forEach(unsubscribe=>{try{unsubscribe?.();}catch(_){}});
      workspaceUnsubscribers=[];workspaceReady=false;cloudBaseline=null;pendingCloudState=null;
      if(unsubscribeMembers){unsubscribeMembers();unsubscribeMembers=null;}
      if(unsubscribeRequests){unsubscribeRequests();unsubscribeRequests=null;}
      if(unsubscribeProfiles){unsubscribeProfiles();unsubscribeProfiles=null;}
      workspaceUid='';membersData={};requestsData={};profilesData={};window.staffDirectory={};
      if(managementPanel)managementPanel.hidden=true;
    }

    function stopAllListeners() {
      stopWorkspaceListeners();
      if(unsubscribeOwnMember){unsubscribeOwnMember();unsubscribeOwnMember=null;}
      if(unsubscribeOwnRequest){unsubscribeOwnRequest();unsubscribeOwnRequest=null;}
    }

    const WORKSPACE_PATH=`teams/${TEAM_ID}/workspace`;
    const LEGACY_PLANNER_PATH=`teams/${TEAM_ID}/planner`;
    const ARRAY_SECTIONS=['events','projects','meetings','notes','futureItems','changeLog'];
    const MAP_SECTIONS=['yearlyLogs','weeklyLogs','dailyEntries'];
    const clone=value=>JSON.parse(JSON.stringify(value??null));
    const jsonEqual=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
    const byId=items=>Object.fromEntries((Array.isArray(items)?items:[]).filter(item=>item&&item.id).map(item=>[item.id,item]));
    const taskAudience=task=>['operations','staff','cast'].includes(task?.audience)?task.audience:'staff';
    const allowedTaskAudiences=role=>{
      const normalized=normalizedRole(role);
      if(normalized==='owner'||normalized==='operations')return ['operations','staff','cast'];
      if(normalized==='staff')return ['staff','cast'];
      return ['cast'];
    };
    function emptyWorkspaceState(seed={}){
      return {...seed,tasks:[],events:[],projects:[],meetings:[],notes:[],futureItems:[],yearlyLogs:{},weeklyLogs:{},dailyEntries:{},changeLog:[]};
    }
    function buildWorkspaceUpdates(previous,next,{includeMeta=true}={}){
      const updates={};
      const before=previous||emptyWorkspaceState();
      const after=next||emptyWorkspaceState();
      const prevTasks=byId(before.tasks),nextTasks=byId(after.tasks);
      new Set([...Object.keys(prevTasks),...Object.keys(nextTasks)]).forEach(id=>{
        const oldTask=prevTasks[id],newTask=nextTasks[id];
        const oldAudience=oldTask?taskAudience(oldTask):'';
        const newAudience=newTask?taskAudience(newTask):'';
        if(oldTask&&(!newTask||oldAudience!==newAudience))updates[`tasks/${oldAudience}/${id}`]=null;
        if(newTask&&(!oldTask||oldAudience!==newAudience||!jsonEqual(oldTask,newTask)))updates[`tasks/${newAudience}/${id}`]=clone(newTask);
      });
      ARRAY_SECTIONS.forEach(section=>{
        const oldMap=byId(before[section]),newMap=byId(after[section]);
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
      if(includeMeta){
        updates['meta/schemaVersion']=2;
        updates['meta/appVersion']=Number(after.version)||108;
        updates['meta/updatedAt']=serverTimestamp();
        updates['meta/updatedBy']=activeUser?.name||activeUser?.email||'';
        updates['meta/updatedByUid']=activeUser?.uid||'';
      }
      return updates;
    }
    async function cloudSaveNow(state) {
      if(!db||!activeUser)return;
      const next=clone(state);
      if(!workspaceReady||!cloudBaseline){pendingCloudState=next;return;}
      const updates=buildWorkspaceUpdates(cloudBaseline,next);
      const meaningful=Object.keys(updates).filter(key=>!key.startsWith('meta/'));
      cloudBaseline=next;
      if(!meaningful.length)return;
      window.setCloudSyncStatus?.('syncing','同期中…',`${meaningful.length}件の変更だけを送信しています。`);
      try{
        await update(ref(db,WORKSPACE_PATH),updates);
        window.setCloudSyncStatus?.('online','同期済み',`${activeUser.name||activeUser.email} として差分同期中`);
      }catch(error){
        cloudBaseline=null;
        throw error;
      }
    }
    window.staffCloud={save(state){return cloudSaveNow(clone(state));}};

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
    window.renderMyPage=()=>{
      const profile=activeUser?profilesData[activeUser.uid]||{}:{};
      const name=activeUser?.name||'未ログイン';
      const photo=profile.photoURL||authUser?.photoURL||'';
      const photoEl=document.getElementById('myPagePhoto');const fallback=document.getElementById('myPageAvatarFallback');
      if(photoEl&&fallback){photoEl.hidden=!photo;fallback.hidden=!!photo;if(photo)photoEl.src=photo;fallback.textContent=name.slice(0,1)||'⚓';}
      const setText=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
      setText('myPageName',name);setText('myPageEmail',activeUser?.email||'');setText('myPageRole',activeUser?.roleLabel||roleLabels[activeUser?.role]||'スタッフ');
      setText('myPageDiscordDisplay',profile.discord||'未登録');
      const vrchatDisplay=document.getElementById('myPageVrchatDisplay');
      if(vrchatDisplay){
        const url=profile.vrchat||'';
        vrchatDisplay.innerHTML=url?`<a href="${safe(url)}" target="_blank" rel="noopener noreferrer">VRChatプロフィールを開く ↗</a>`:'未登録';
      }
      const discord=document.getElementById('myPageDiscord');const vrchat=document.getElementById('myPageVrchat');
      if(discord&&document.activeElement!==discord)discord.value=profile.discord||'';
      if(vrchat&&document.activeElement!==vrchat)vrchat.value=profile.vrchat||'';
    };
    async function saveMyPage() {
      if(!db||!activeUser)return;
      const discord=document.getElementById('myPageDiscord')?.value.trim()||'';
      const vrchat=document.getElementById('myPageVrchat')?.value.trim()||'';
      if(vrchat){
        try{
          const parsed=new URL(vrchat);
          if(parsed.protocol!=='https:'||!/(^|\.)vrchat\.com$/i.test(parsed.hostname))throw new Error();
        }catch(_){setMyPageStatus('VRChatのプロフィールURL（https://vrchat.com/...）を入力してください。','error');return;}
      }
      setMyPageStatus('マイページを保存しています…');
      try{
        const current=profilesData[activeUser.uid]||{};
        await set(ref(db,`teams/${TEAM_ID}/profiles/${activeUser.uid}`),{...current,displayName:activeUser.name,role:activeUser.role,active:true,photoURL:authUser?.photoURL||current.photoURL||'',discord,vrchat,updatedAt:serverTimestamp(),updatedByUid:activeUser.uid});
        setMyPageStatus('マイページを保存しました。','success');
      }catch(error){console.error(error);setMyPageStatus(`保存できません：${error.message}`,'error');}
    }
    document.getElementById('saveMyPageBtn')?.addEventListener('click',saveMyPage);

    async function ensureOwnProfile(user,member) {
      if(!db||!user||!member)return;
      const profileRef=ref(db,`teams/${TEAM_ID}/profiles/${user.uid}`);
      try{
        const snapshot=await get(profileRef);const current=snapshot.val()||{};
        const next={...current,displayName:member.displayName||user.displayName||user.email||'スタッフ',role:normalizedRole(member.role||'cast'),active:member.active!==false,photoURL:user.photoURL||current.photoURL||'',discord:current.discord||'',vrchat:current.vrchat||'',updatedAt:serverTimestamp(),updatedByUid:user.uid};
        if(!snapshot.exists()||current.displayName!==next.displayName||current.role!==next.role||current.active!==next.active||(!current.photoURL&&next.photoURL))await set(profileRef,next);
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
      if(unsubscribeProfiles||!db||!activeUser)return;
      unsubscribeProfiles=onValue(ref(db,`teams/${TEAM_ID}/profiles`),snapshot=>{profilesData=snapshot.val()||{};syncStaffDirectory();syncProfilesFromMembers();},error=>{console.error(error);setMyPageStatus(`プロフィールを読み込めません：${error.message}`,'error');});
    }

    function showJoinRequest(user,request,member) {
      stopWorkspaceListeners();
      activeUser=null;
      window.setStaffCloudUser?.(null);
      window.setStaffReadOnly?.(false);
      setGate(true);showUid('');
      if(!joinPanel)return;
      joinPanel.hidden=false;
      joinAccount.textContent=`Googleアカウント：${user.displayName||'名前未設定'} / ${user.email||'メールアドレス不明'}`;
      joinName.value=request?.displayName||user.displayName||'';
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
        joinTitle.textContent='参加申請を送信済みです';
        joinDescription.textContent='オーナーまたは運営が承認すると、自動的にStaff Plannerへ入れるようになります。';
        joinStatus.textContent=`申請日時：${formatDate(request.requestedAt)}`;
        setAuthStatus('スタッフ参加申請の承認を待っています。');
      }else{
        joinTitle.textContent=rejected?'参加申請が見送られました':'スタッフ参加申請';
        joinDescription.textContent=rejected?'表示名を確認し、必要に応じてもう一度申請できます。':'表示名を確認し、オーナー／運営へ参加申請を送信してください。';
        joinStatus.textContent=rejected?(request.reviewNote||'オーナー／運営へ確認してください。'):'';
        setAuthStatus('このGoogleアカウントはまだスタッフ登録されていません。');
      }
      window.setCloudSyncStatus?.('syncing','承認待ち','オーナー／運営が参加申請を承認すると共有データを開きます。');
    }

    function roleOptions(selected,canChooseOwner) {
      const normalizedSelected=normalizedRole(selected);
      const roles=canChooseOwner?['owner','operations','staff','cast']:['staff','cast'];
      return roles.map(role=>`<option value="${role}" ${normalizedSelected===role?'selected':''}>${roleLabels[role]}</option>`).join('');
    }

    function renderStaffManagement() {
      const canManage=activeUser&&managerRole(activeUser.role);
      if(!managementPanel)return;
      managementPanel.hidden=!canManage;
      if(!canManage)return;
      managementPermission.textContent=normalizedRole(activeUser.role)==='owner'?'オーナー権限':'運営権限';
      const pending=Object.entries(requestsData).filter(([,req])=>req&&req.status==='pending').sort((a,b)=>(a[1].requestedAt||0)-(b[1].requestedAt||0));
      requestCount.textContent=`${pending.length}件`;
      requestList.innerHTML=pending.length?pending.map(([uid,req])=>{
        const options=roleOptions('staff',normalizedRole(activeUser.role)==='owner');
        return `<div class="staff-request-card" data-request-uid="${safe(uid)}">
          <div class="staff-request-top"><div><div class="staff-request-name">${safe(req.displayName||'名前未設定')}</div><div class="staff-request-email">${safe(req.email||'')}</div></div><span class="tag">承認待ち</span></div>
          <div class="staff-request-meta">申請：${safe(formatDate(req.requestedAt))}</div>
          <div class="staff-request-actions"><select data-request-role aria-label="承認する権限">${options}</select><button class="btn small success" type="button" data-request-action="approve">承認</button><button class="btn small danger" type="button" data-request-action="reject">見送り</button></div>
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
        const options=roleOptions(member.role,canChooseOwner);
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
      if(!db||!activeUser||!managerRole(activeUser.role)){
        if(unsubscribeMembers){unsubscribeMembers();unsubscribeMembers=null;}
        if(unsubscribeRequests){unsubscribeRequests();unsubscribeRequests=null;}
        if(managementPanel)managementPanel.hidden=true;
        return;
      }
      if(!unsubscribeMembers){
        unsubscribeMembers=onValue(ref(db,`teams/${TEAM_ID}/members`),snapshot=>{membersData=snapshot.val()||{};renderStaffManagement();syncProfilesFromMembers();},error=>{console.error(error);setManagementMessage(`スタッフ一覧を読み込めません：${error.message}`,'error');});
      }
      if(!unsubscribeRequests){
        unsubscribeRequests=onValue(ref(db,`teams/${TEAM_ID}/joinRequests`),snapshot=>{requestsData=snapshot.val()||{};renderStaffManagement();},error=>{console.error(error);setManagementMessage(`参加申請を読み込めません：${error.message}`,'error');});
      }
      renderStaffManagement();
    }

    async function ensureWorkspaceMigrated() {
      const schema=await get(ref(db,`${WORKSPACE_PATH}/meta/schemaVersion`));
      if(schema.exists())return;
      if(!managerRole(activeUser?.role))throw new Error('初回データ移行はオーナーまたは運営のログインが必要です。');
      const legacy=await get(ref(db,LEGACY_PLANNER_PATH));
      const seed=legacy.exists()?legacy.val():(window.getPlannerState?.()||{});
      const updates=buildWorkspaceUpdates(emptyWorkspaceState(),seed);
      updates['meta/migratedFrom']=legacy.exists()?'planner-v1':'local-state';
      updates['meta/migratedAt']=serverTimestamp();
      await update(ref(db,WORKSPACE_PATH),updates);
    }
    const values=snapshot=>snapshot.exists()?Object.values(snapshot.val()||{}):[];
    async function loadWorkspaceState() {
      const role=activeUser?.role||'cast';
      const taskAudiences=allowedTaskAudiences(role);
      const requests=[
        ...taskAudiences.map(audience=>get(ref(db,`${WORKSPACE_PATH}/tasks/${audience}`))),
        ...ARRAY_SECTIONS.map(section=>get(ref(db,`${WORKSPACE_PATH}/${section}`))),
        ...MAP_SECTIONS.map(section=>get(ref(db,`${WORKSPACE_PATH}/${section}`))),
        get(ref(db,`${WORKSPACE_PATH}/config/settings`)),
        get(ref(db,`${WORKSPACE_PATH}/config/preferences`)),
        get(ref(db,`${WORKSPACE_PATH}/config/menuConfig`)),
        get(ref(db,`${WORKSPACE_PATH}/meta/appVersion`))
      ];
      const snapshots=await Promise.all(requests);
      let cursor=0;
      const local=window.getPlannerState?.()||{};
      const remote=emptyWorkspaceState(local);
      remote.tasks=[];
      taskAudiences.forEach(()=>{remote.tasks.push(...values(snapshots[cursor++]));});
      ARRAY_SECTIONS.forEach(section=>{remote[section]=values(snapshots[cursor++]);});
      MAP_SECTIONS.forEach(section=>{remote[section]=snapshots[cursor++].val()||{};});
      remote.settings=snapshots[cursor++].val()||local.settings;
      remote.preferences=snapshots[cursor++].val()||local.preferences;
      remote.menuConfig=snapshots[cursor++].val()||local.menuConfig;
      remote.version=Number(snapshots[cursor++].val())||108;
      return remote;
    }
    function listenChildren(path,section,knownKeys=new Set(),decorate=value=>value) {
      const target=ref(db,`${WORKSPACE_PATH}/${path}`);
      const initial=new Set(knownKeys);
      workspaceUnsubscribers.push(onChildAdded(target,snapshot=>{
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
        const value=decorate(snapshot.val(),snapshot.key);
        if(cloudBaseline){
          if(section==='tasks')cloudBaseline.tasks=[...(cloudBaseline.tasks||[]).filter(item=>item.id!==snapshot.key),value];
          else if(ARRAY_SECTIONS.includes(section))cloudBaseline[section]=[...(cloudBaseline[section]||[]).filter(item=>item.id!==snapshot.key),value];
          else cloudBaseline[section]={...(cloudBaseline[section]||{}),[snapshot.key]:value};
        }
        window.applyRemotePlannerPatch?.(section,snapshot.key,value);
      }));
      workspaceUnsubscribers.push(onChildRemoved(target,snapshot=>{
        if(section==='tasks'&&cloudBaseline){
          const removed=decorate(snapshot.val(),snapshot.key);
          const current=(cloudBaseline.tasks||[]).find(item=>item.id===snapshot.key);
          // 表示先変更時は旧フォルダの削除と新フォルダへの追加が同時に届きます。
          // 新しい表示先のデータがすでに反映済みなら、旧側の削除通知は無視します。
          if(current&&taskAudience(current)!==taskAudience(removed))return;
        }
        if(cloudBaseline){
          if(section==='tasks')cloudBaseline.tasks=(cloudBaseline.tasks||[]).filter(item=>item.id!==snapshot.key);
          else if(ARRAY_SECTIONS.includes(section))cloudBaseline[section]=(cloudBaseline[section]||[]).filter(item=>item.id!==snapshot.key);
          else if(cloudBaseline[section])delete cloudBaseline[section][snapshot.key];
        }
        window.applyRemotePlannerPatch?.(section,snapshot.key,null);
      }));
    }
    function listenSingleton(path,section) {
      let first=true;
      workspaceUnsubscribers.push(onValue(ref(db,`${WORKSPACE_PATH}/${path}`),snapshot=>{
        if(first){first=false;return;}
        const value=snapshot.val();
        if(cloudBaseline)cloudBaseline[section]=clone(value);
        window.applyRemotePlannerPatch?.(section,'',value);
      }));
    }
    function attachWorkspaceListeners(initialState) {
      const allowed=allowedTaskAudiences(activeUser?.role||'cast');
      allowed.forEach(audience=>{
        const known=new Set((initialState.tasks||[]).filter(task=>taskAudience(task)===audience).map(task=>task.id));
        listenChildren(`tasks/${audience}`,'tasks',known,value=>({...value,audience}));
      });
      ARRAY_SECTIONS.forEach(section=>listenChildren(section,section,new Set((initialState[section]||[]).map(item=>item.id))));
      MAP_SECTIONS.forEach(section=>listenChildren(section,section,new Set(Object.keys(initialState[section]||{}))));
      listenSingleton('config/settings','settings');
      listenSingleton('config/preferences','preferences');
      listenSingleton('config/menuConfig','menuConfig');
      listenSingleton('meta/appVersion','version');
    }
    async function startPlannerListener() {
      if(workspaceReady)return true;
      if(!db||!activeUser)return false;
      window.setCloudSyncStatus?.('syncing','共有データを読込中…','必要なデータだけを分割して読み込んでいます。');
      try{
        await ensureWorkspaceMigrated();
        const remote=await loadWorkspaceState();
        cloudBaseline=clone(remote);workspaceReady=true;
        window.applyRemotePlannerState?.(remote);
        attachWorkspaceListeners(remote);
        window.setCloudSyncStatus?.('online','同期済み',`${activeUser.name} として差分同期中`);
        if(pendingCloudState){const pending=pendingCloudState;pendingCloudState=null;await cloudSaveNow(pending);}
        return true;
      }catch(error){
        console.error(error);
        window.setCloudSyncStatus?.('error','読込エラー',error.message||'Firebaseルールとスタッフ登録を確認してください。');
        return false;
      }
    }

    function enterWorkspace(user,member) {
      const normalizedMemberRole=normalizedRole(member.role||'cast');
      const nextUser={uid:user.uid,email:user.email||member.email||'',name:member.displayName||user.displayName||user.email||'スタッフ',role:normalizedMemberRole,roleLabel:roleLabels[normalizedMemberRole]||normalizedMemberRole};
      const roleChanged=activeUser&&activeUser.role!==nextUser.role;
      activeUser=nextUser;
      window.setStaffCloudUser?.(activeUser);
      window.applyRolePageAccess?.();
      window.setStaffReadOnly?.(true);
      setGate(false);showUid('');if(joinPanel)joinPanel.hidden=true;
      setAuthStatus('ログイン済みです。');
      if(workspaceUid!==user.uid){stopWorkspaceListeners();workspaceUid=user.uid;}
      else if(roleChanged){
        workspaceUnsubscribers.forEach(unsubscribe=>{try{unsubscribe?.();}catch(_){}});
        workspaceUnsubscribers=[];workspaceReady=false;cloudBaseline=null;pendingCloudState=null;
      }
      ensureOwnProfile(user,member);
      startProfilesListener();
      startPlannerListener().then(ok=>window.setStaffReadOnly?.(!ok));
      if(roleChanged&&unsubscribeMembers){unsubscribeMembers();unsubscribeMembers=null;}
      if(roleChanged&&unsubscribeRequests){unsubscribeRequests();unsubscribeRequests=null;}
      startManagementListeners();
      window.renderMyPage?.();
    }

    function refreshAccessView() {
      if(!authUser)return;
      if(ownMember&&ownMember.active!==false)enterWorkspace(authUser,ownMember);
      else showJoinRequest(authUser,ownRequest,ownMember);
    }

    function monitorAccess(user) {
      stopAllListeners();
      authUser=user;ownMember=null;ownRequest=null;
      unsubscribeOwnMember=onValue(ref(db,`teams/${TEAM_ID}/members/${user.uid}`),snapshot=>{ownMember=snapshot.val();refreshAccessView();},error=>{console.error(error);setAuthStatus(`スタッフ登録を確認できません：${error.message}`);});
      unsubscribeOwnRequest=onValue(ref(db,`teams/${TEAM_ID}/joinRequests/${user.uid}`),snapshot=>{ownRequest=snapshot.val();refreshAccessView();},error=>{console.error(error);});
    }

    async function submitJoinRequest() {
      if(!db||!authUser)return;
      const name=joinName.value.trim();
      if(!name){joinStatus.textContent='表示名を入力してください。';joinName.focus();return;}
      joinSubmit.disabled=true;joinStatus.textContent='参加申請を送信しています…';
      try{
        await set(ref(db,`teams/${TEAM_ID}/joinRequests/${authUser.uid}`),{
          uid:authUser.uid,displayName:name,email:authUser.email||'',photoURL:authUser.photoURL||'',status:'pending',requestedAt:serverTimestamp()
        });
        joinStatus.textContent='参加申請を送信しました。承認されるまでこの画面で待つか、後からもう一度開いてください。';
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

    async function approveRequest(uid,row) {
      const request=requestsData[uid];if(!request||!activeUser||!managerRole(activeUser.role))return;
      const role=normalizedRole(row.querySelector('[data-request-role]')?.value||'staff');
      if(normalizedRole(activeUser.role)==='operations'&&!['staff','cast'].includes(role)){setManagementMessage('運営が追加できるのは「スタッフ」または「キャスト」です。','error');return;}
      setManagementMessage('参加申請を承認しています…');
      try{
        await set(ref(db,`teams/${TEAM_ID}/members/${uid}`),{
          displayName:request.displayName||request.email||'スタッフ',email:request.email||'',photoURL:request.photoURL||'',role,active:true,createdAt:serverTimestamp(),approvedAt:serverTimestamp(),approvedBy:activeUser.name,approvedByUid:activeUser.uid
        });
        await set(ref(db,`teams/${TEAM_ID}/profiles/${uid}`),{displayName:request.displayName||request.email||'スタッフ',role,active:true,photoURL:request.photoURL||'',discord:'',vrchat:'',updatedAt:serverTimestamp(),updatedByUid:activeUser.uid});
        await set(ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`),null);
        setManagementMessage(`${request.displayName||request.email}さんを${roleLabels[role]}として承認しました。`,'success');
      }catch(error){console.error(error);setManagementMessage(`承認できません：${error.message}`,'error');}
    }

    async function rejectRequest(uid) {
      const request=requestsData[uid];if(!request||!activeUser||!managerRole(activeUser.role))return;
      if(!confirm(`${request.displayName||request.email}さんの参加申請を見送りますか？`))return;
      setManagementMessage('参加申請を更新しています…');
      try{
        await set(ref(db,`teams/${TEAM_ID}/joinRequests/${uid}`),{...request,status:'rejected',reviewedAt:serverTimestamp(),reviewedBy:activeUser.name,reviewedByUid:activeUser.uid,reviewNote:'参加申請が見送られました。必要な場合はオーナーへ確認してください。'});
        setManagementMessage('参加申請を見送りました。','success');
      }catch(error){console.error(error);setManagementMessage(`更新できません：${error.message}`,'error');}
    }

    async function saveMember(uid,row) {
      const current=membersData[uid];if(!current||!activeUser||!managerRole(activeUser.role))return;
      const name=row.querySelector('[data-member-name]')?.value.trim()||current.displayName||'スタッフ';
      const role=normalizedRole(row.querySelector('[data-member-role]')?.value||current.role);
      const active=row.querySelector('[data-member-active]')?.checked!==false;
      if(uid===activeUser.uid&&normalizedRole(activeUser.role)==='owner'&&(role!=='owner'||!active)){setManagementMessage('自分自身のオーナー権限を解除・停止することはできません。','error');return;}
      if(normalizedRole(activeUser.role)==='operations'&&(['owner','operations'].includes(normalizedRole(current.role))||!['staff','cast'].includes(role))){setManagementMessage('運営はオーナー／運営の変更や追加を行えません。','error');return;}
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

    if(!configured()){
      loginBtn.disabled=true;
      setAuthStatus('Firebase設定が未入力です。assets/js/config.js の FIREBASE_CONFIG を設定してから公開してください。');
      window.setCloudSyncStatus?.('error','Firebase未設定','導入手順ファイルに沿って設定してください。');
    }else{
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
          if(user){authUser=user;setAuthStatus('スタッフ登録を確認しています…');monitorAccess(user);}
          else{
            authUser=null;activeUser=null;ownMember=null;ownRequest=null;window.setStaffCloudUser?.(null);window.setStaffReadOnly?.(false);setGate(true);if(joinPanel)joinPanel.hidden=true;showUid('');setAuthStatus('荒嵜造船所スタッフのGoogleアカウントでログインしてください。');window.setCloudSyncStatus?.('syncing','ログイン待ち','Googleログイン後に共有データを読み込みます。');
          }
        });
      }catch(error){console.error(error);loginBtn.disabled=true;setAuthStatus(`Firebase初期化エラー：${error.message}`);}
    }
