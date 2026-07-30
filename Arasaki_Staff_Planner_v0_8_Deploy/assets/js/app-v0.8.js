const STORAGE_KEY = 'arasaki_staff_planner_v1';
    const DOMAIN = window.ARASAKI_PLANNER_DOMAIN;
    if (!DOMAIN) throw new Error('Planner domain の初期化に失敗しました');
    const surfacePath=location.pathname.split('/').filter(Boolean)[0];
    const APP_SURFACE=surfacePath==='admin'?'global':surfacePath==='owner'?'owner':'app';
    const OWNER_SURFACE_VIEWS=new Set(['adminEvent','adminAudit','adminInvites','adminApplications','adminLinks','adminRoles','permissions','settings','backup']);
    const GLOBAL_SURFACE_VIEWS=new Set(['globalEvents','globalEventList','globalEventDetails','globalInvites','globalApplications','globalAudit','globalTrash']);
    const STAFF_SURFACE_HIDDEN_VIEWS=new Set(['tasksAll','backup','permissions']);
    document.body.dataset.surface=APP_SURFACE;
    window.getPlannerSurface=()=>APP_SURFACE;

    const THEME_STORAGE_KEY = 'arasaki_staff_planner_theme_v1';
    const THEME_DEFAULT = { mode:'dark', color:'blue' };
    const THEME_LABELS = { dark:'ダーク', light:'ライト', blue:'Blue', red:'Red', yellow:'Yellow', pink:'Pink', green:'Green' };
    function normalizeTheme(value) {
      return {
        mode:['dark','light'].includes(value?.mode)?value.mode:THEME_DEFAULT.mode,
        color:['blue','red','yellow','pink','green'].includes(value?.color)?value.color:THEME_DEFAULT.color
      };
    }
    function loadTheme() {
      try { return normalizeTheme(JSON.parse(localStorage.getItem(THEME_STORAGE_KEY)||'null')); }
      catch (_) { return {...THEME_DEFAULT}; }
    }
    let appearanceTheme=loadTheme();
    function updateThemeControls() {
      document.querySelectorAll('input[name="themeMode"]').forEach(input=>input.checked=input.value===appearanceTheme.mode);
      document.querySelectorAll('input[name="themeColor"]').forEach(input=>input.checked=input.value===appearanceTheme.color);
      const title=document.getElementById('themePreviewTitle');
      if(title)title.textContent=`${THEME_LABELS[appearanceTheme.color]}・${THEME_LABELS[appearanceTheme.mode]}`;
    }
    function applyTheme(nextTheme, persist=true) {
      appearanceTheme=normalizeTheme(nextTheme);
      document.documentElement.dataset.themeMode=appearanceTheme.mode;
      document.documentElement.dataset.themeColor=appearanceTheme.color;
      document.querySelector('meta[name="color-scheme"]')?.setAttribute('content',appearanceTheme.mode);
      if(persist)localStorage.setItem(THEME_STORAGE_KEY,JSON.stringify(appearanceTheme));
      updateThemeControls();
    }
    applyTheme(appearanceTheme,false);
    const APP_VERSION = 109;
    const APP_BUILD = 'v0.9-category';
    window.__ARASAKI_STAFF_PLANNER_BUILD__ = APP_BUILD;
    const repeatTypeLabels = { none:'繰り返しなし', daily:'毎日', weekly:'毎週', monthly:'毎月', yearly:'毎年' };
    const weekdayShortLabels = ['日','月','火','水','木','金','土'];
    const OFFICIAL_JAPANESE_HOLIDAYS = {"2020-01-01":"元日","2020-01-13":"成人の日","2020-02-11":"建国記念の日","2020-02-23":"天皇誕生日","2020-02-24":"休日","2020-03-20":"春分の日","2020-04-29":"昭和の日","2020-05-03":"憲法記念日","2020-05-04":"みどりの日","2020-05-05":"こどもの日","2020-05-06":"休日","2020-07-23":"海の日","2020-07-24":"スポーツの日","2020-08-10":"山の日","2020-09-21":"敬老の日","2020-09-22":"秋分の日","2020-11-03":"文化の日","2020-11-23":"勤労感謝の日","2021-01-01":"元日","2021-01-11":"成人の日","2021-02-11":"建国記念の日","2021-02-23":"天皇誕生日","2021-03-20":"春分の日","2021-04-29":"昭和の日","2021-05-03":"憲法記念日","2021-05-04":"みどりの日","2021-05-05":"こどもの日","2021-07-22":"海の日","2021-07-23":"スポーツの日","2021-08-08":"山の日","2021-08-09":"休日","2021-09-20":"敬老の日","2021-09-23":"秋分の日","2021-11-03":"文化の日","2021-11-23":"勤労感謝の日","2022-01-01":"元日","2022-01-10":"成人の日","2022-02-11":"建国記念の日","2022-02-23":"天皇誕生日","2022-03-21":"春分の日","2022-04-29":"昭和の日","2022-05-03":"憲法記念日","2022-05-04":"みどりの日","2022-05-05":"こどもの日","2022-07-18":"海の日","2022-08-11":"山の日","2022-09-19":"敬老の日","2022-09-23":"秋分の日","2022-10-10":"スポーツの日","2022-11-03":"文化の日","2022-11-23":"勤労感謝の日","2023-01-01":"元日","2023-01-02":"休日","2023-01-09":"成人の日","2023-02-11":"建国記念の日","2023-02-23":"天皇誕生日","2023-03-21":"春分の日","2023-04-29":"昭和の日","2023-05-03":"憲法記念日","2023-05-04":"みどりの日","2023-05-05":"こどもの日","2023-07-17":"海の日","2023-08-11":"山の日","2023-09-18":"敬老の日","2023-09-23":"秋分の日","2023-10-09":"スポーツの日","2023-11-03":"文化の日","2023-11-23":"勤労感謝の日","2024-01-01":"元日","2024-01-08":"成人の日","2024-02-11":"建国記念の日","2024-02-12":"休日","2024-02-23":"天皇誕生日","2024-03-20":"春分の日","2024-04-29":"昭和の日","2024-05-03":"憲法記念日","2024-05-04":"みどりの日","2024-05-05":"こどもの日","2024-05-06":"休日","2024-07-15":"海の日","2024-08-11":"山の日","2024-08-12":"休日","2024-09-16":"敬老の日","2024-09-22":"秋分の日","2024-09-23":"休日","2024-10-14":"スポーツの日","2024-11-03":"文化の日","2024-11-04":"休日","2024-11-23":"勤労感謝の日","2025-01-01":"元日","2025-01-13":"成人の日","2025-02-11":"建国記念の日","2025-02-23":"天皇誕生日","2025-02-24":"休日","2025-03-20":"春分の日","2025-04-29":"昭和の日","2025-05-03":"憲法記念日","2025-05-04":"みどりの日","2025-05-05":"こどもの日","2025-05-06":"休日","2025-07-21":"海の日","2025-08-11":"山の日","2025-09-15":"敬老の日","2025-09-23":"秋分の日","2025-10-13":"スポーツの日","2025-11-03":"文化の日","2025-11-23":"勤労感謝の日","2025-11-24":"休日","2026-01-01":"元日","2026-01-12":"成人の日","2026-02-11":"建国記念の日","2026-02-23":"天皇誕生日","2026-03-20":"春分の日","2026-04-29":"昭和の日","2026-05-03":"憲法記念日","2026-05-04":"みどりの日","2026-05-05":"こどもの日","2026-05-06":"休日","2026-07-20":"海の日","2026-08-11":"山の日","2026-09-21":"敬老の日","2026-09-22":"休日","2026-09-23":"秋分の日","2026-10-12":"スポーツの日","2026-11-03":"文化の日","2026-11-23":"勤労感謝の日","2027-01-01":"元日","2027-01-11":"成人の日","2027-02-11":"建国記念の日","2027-02-23":"天皇誕生日","2027-03-21":"春分の日","2027-03-22":"休日","2027-04-29":"昭和の日","2027-05-03":"憲法記念日","2027-05-04":"みどりの日","2027-05-05":"こどもの日","2027-07-19":"海の日","2027-08-11":"山の日","2027-09-20":"敬老の日","2027-09-23":"秋分の日","2027-10-11":"スポーツの日","2027-11-03":"文化の日","2027-11-23":"勤労感謝の日"};
    const OFFICIAL_HOLIDAY_MAX_YEAR = 2027;

    function defaultAppPreferences() { return { weekStartsOn:'monday', showJapaneseHolidays:true }; }
    function normalizeAppPreferences(value) {
      const defaults=defaultAppPreferences();
      return {
        weekStartsOn:value?.weekStartsOn==='sunday'?'sunday':'monday',
        showJapaneseHolidays:value?.showJapaneseHolidays !== false
      };
    }
    function weekStartDay() { return state?.preferences?.weekStartsOn==='sunday' ? 0 : 1; }
    function orderedWeekdayLabels() { return weekStartDay()===0 ? ['日','月','火','水','木','金','土'] : ['月','火','水','木','金','土','日']; }
    function isoWeekNumber(value) {
      const source=value instanceof Date?value:parseLocalDate(value);
      if(!source)return 0;
      const date=new Date(Date.UTC(source.getFullYear(),source.getMonth(),source.getDate()));
      const day=date.getUTCDay()||7;
      date.setUTCDate(date.getUTCDate()+4-day);
      const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1));
      return Math.ceil((((date-yearStart)/86400000)+1)/7);
    }
    function dateKeyFromParts(year,month,day) { return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`; }
    function nthWeekdayOfMonth(year,month,weekday,nth) {
      const first=new Date(year,month-1,1);
      return 1 + ((weekday-first.getDay()+7)%7) + (nth-1)*7;
    }
    function vernalEquinoxDay(year) { return Math.floor(20.8431 + 0.242194*(year-1980) - Math.floor((year-1980)/4)); }
    function autumnEquinoxDay(year) { return Math.floor(23.2488 + 0.242194*(year-1980) - Math.floor((year-1980)/4)); }
    function calculatedJapaneseHolidays(year) {
      const holidays={};
      const add=(month,day,name)=>{ holidays[dateKeyFromParts(year,month,day)]=name; };
      add(1,1,'元日');
      add(1,nthWeekdayOfMonth(year,1,1,2),'成人の日');
      add(2,11,'建国記念の日');
      add(2,23,'天皇誕生日');
      add(3,vernalEquinoxDay(year),'春分の日');
      add(4,29,'昭和の日');
      add(5,3,'憲法記念日'); add(5,4,'みどりの日'); add(5,5,'こどもの日');
      add(7,nthWeekdayOfMonth(year,7,1,3),'海の日');
      add(8,11,'山の日');
      add(9,nthWeekdayOfMonth(year,9,1,3),'敬老の日');
      add(9,autumnEquinoxDay(year),'秋分の日');
      add(10,nthWeekdayOfMonth(year,10,1,2),'スポーツの日');
      add(11,3,'文化の日'); add(11,23,'勤労感謝の日');
      // 国民の休日：祝日に挟まれた、日曜日以外の平日。
      let cursor=new Date(year,0,2), last=new Date(year,11,30);
      while(cursor<=last){
        const key=localDateString(cursor);
        if(!holidays[key] && cursor.getDay()!==0){
          const prev=localDateString(addDays(cursor,-1));
          const next=localDateString(addDays(cursor,1));
          if(holidays[prev]&&holidays[next]) holidays[key]='国民の休日';
        }
        cursor=addDays(cursor,1);
      }
      // 振替休日：日曜の祝日の直後にある最初の非祝日。
      Object.keys(holidays).sort().forEach(key=>{
        const date=parseLocalDate(key);
        if(date.getDay()!==0) return;
        let substitute=addDays(date,1), substituteKey=localDateString(substitute);
        while(holidays[substituteKey]){ substitute=addDays(substitute,1); substituteKey=localDateString(substitute); }
        if(substitute.getFullYear()===year) holidays[substituteKey]='振替休日';
      });
      return holidays;
    }
    const holidayYearCache={};
    function japaneseHolidaysForYear(year) {
      if(holidayYearCache[year]) return holidayYearCache[year];
      const official=Object.fromEntries(Object.entries(OFFICIAL_JAPANESE_HOLIDAYS).filter(([date])=>Number(date.slice(0,4))===Number(year)));
      holidayYearCache[year]=Object.keys(official).length ? official : calculatedJapaneseHolidays(Number(year));
      return holidayYearCache[year];
    }
    function japaneseHolidayForDate(dateValue) {
      if(state?.preferences?.showJapaneseHolidays===false || !dateValue) return '';
      const year=Number(dateValue.slice(0,4));
      return japaneseHolidaysForYear(year)[dateValue] || '';
    }
    let categories = ['全体','企画・進行','ワールド制作','小物・制作','SNS・広報','品質確認','当日運営'];
    const categoryIcons = { '全体':'⚓', '企画・進行':'🧭', 'ワールド制作':'🏗', '小物・制作':'🔧', 'SNS・広報':'📣', '品質確認':'🔎', '当日運営':'🎪' };
    const cloneData = value => JSON.parse(JSON.stringify(value));
    function domainArray(...keys) {
      for (const key of keys) if (Array.isArray(DOMAIN[key])) return DOMAIN[key];
      return [];
    }
    function defaultCategoryMaster() {
      return cloneData(domainArray('INITIAL_CATEGORY_MASTER','CATEGORY_MASTER','INITIAL_CATEGORIES','CATEGORY_CATALOG','categoryMaster'));
    }
    function defaultProjectTemplates() {
      return cloneData(domainArray('PROJECT_TEMPLATES','INITIAL_PROJECT_TEMPLATES','projectTemplates'));
    }
    function defaultPhaseSets() {
      return domainArray('PROJECT_PHASE_SETS','PHASE_SETS','phaseSets');
    }
    function categoryMasterItems() { return Array.isArray(state?.categoryMaster)&&state.categoryMaster.length?state.categoryMaster:defaultCategoryMaster(); }
    function categoryNode(id) { return categoryMasterItems().find(item=>item.id===id); }
    function categoryChildren(parentId,{activeOnly=false}={}) {
      return categoryMasterItems().filter(item=>item.parentId===parentId&&(!activeOnly||item.active!==false)).sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0)||String(a.name).localeCompare(String(b.name),'ja'));
    }
    function majorCategories({activeOnly=false,forNew=false}={}) {
      return categoryMasterItems().filter(item=>item.level===1&&(!activeOnly||item.active!==false)&&(!forNew||!item.system)).sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0));
    }
    function categoryPathIds(item) {
      const ids=[item?.majorCategoryId,item?.middleCategoryId,item?.smallCategoryId].filter(Boolean);
      return ids.map(categoryNode).filter(Boolean);
    }
    function categoryPathText(item,{fallback=true}={}) {
      const path=categoryPathIds(item);
      if(path.length)return path.map(node=>node.name).join(' ＞ ');
      return fallback?settingLabel('categories',item?.category,item?.legacyCategory||item?.category||'未分類'):'';
    }
    function categoryPathHtml(item) {
      const path=categoryPathIds(item);
      if(!path.length)return `<span>${escapeHtml(categoryPathText(item))}</span>`;
      return path.map((node,index)=>`${index?'<span class="category-breadcrumb-separator">›</span>':''}<span>${escapeHtml(node.name)}${node.active===false?'（無効）':''}</span>`).join('');
    }
    function categoryLegacyLabel(majorId) { return categoryNode(majorId)?.name||'未分類'; }
    function classificationNeeds(item) { return item?.classificationStatus==='needs-classification'||item?.needsClassification===true; }
    function allProjectPhases() {
      const fromSets=defaultPhaseSets().flatMap(set=>Array.isArray(set.phases)?set.phases:[]);
      const fromTemplates=(state?.projectTemplates||defaultProjectTemplates()).flatMap(template=>template.phases||[]);
      const seen=new Set();
      return [...fromSets,...fromTemplates].filter(phase=>phase?.id&&!seen.has(phase.id)&&seen.add(phase.id)).sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0));
    }
    function phaseLabel(id) { return allProjectPhases().find(phase=>phase.id===id)?.name||id||'未設定'; }
    function activeTemplates() { return (state?.projectTemplates||defaultProjectTemplates()).filter(template=>template.active!==false); }
    function projectTemplate(id) { return (state?.projectTemplates||defaultProjectTemplates()).find(template=>template.id===id); }
    function projectTemplateCandidates(majorId,middleId) {
      return activeTemplates().filter(template=>template.majorCategoryId===majorId&&(!template.middleCategoryId||template.middleCategoryId===middleId));
    }
    let priorityLabels = { high:'高', medium:'中', low:'低' };
    let priorityOrder = { high:0, medium:1, low:2 };
    let statusLabels = { inbox:'Inbox', todo:'未着手', doing:'進行中', waiting:'待機中', done:'完了' };
    let projectStatusLabels = { planning:'計画中', active:'進行中', waiting:'待機中', completed:'完了', archived:'保管' };
    const viewInfo = {
      home:['Home','今日'], yearly:['Yearly Log','年間ログ'], calendar:['Schedule','カレンダー'], events:['Events','イベント・記念日'], future:['Future Log','未来の予定'],
      weekly:['Weekly Log','週間ログ'], daily:['Daily Log','日別ログ'], triage:['Task Workflow','タスクの整理フロー'],
      tasksAssigned:['Task','個別タスク'], tasksAll:['Task','全タスク一覧'], tasksOperations:['Task','運営のタスク一覧'], tasksStaff:['Task','スタッフ用タスク一覧'], tasksCast:['Task','キャスト用タスク一覧'],
      projects:['Project','プロジェクト'], meetings:['Meeting','ミーティング'], schedulePolls:['Schedule','日程調整'],
      notes:['Idea / Note','アイデア・ノート'], mypage:['My Page','マイページ'], permissions:['Access Control','権限管理'], backup:['File','バックアップ'], settings:['Settings','設定']
      ,adminEvent:['Event Details','イベント詳細'],adminAudit:['Operation Log','操作ログ'],adminInvites:['Invitation','招待リンク発行'],adminApplications:['Applications','参加申請一覧'],adminLinks:['Data Links','データリンク'],adminRoles:['Role Management','ロール管理']
      ,globalEvents:['Global Events','イベント作成'],globalEventList:['Event Registry','イベント一覧'],globalEventDetails:['Event Details','イベント詳細'],globalInvites:['Invitation','招待リンク発行'],globalApplications:['Owner Applications','イベントオーナーからの申請一覧'],globalAudit:['Global Audit','操作ログ'],globalTrash:['Global Trash','ゴミ箱・復元']
    };


    const MENU_DEFINITIONS = [
      {view:'home', label:'ホーム・今日', short:'今日', icon:'⌂'},
      {view:'mypage', label:'マイページ', short:'自分', icon:'☺'},
      {view:'calendar', label:'カレンダー', short:'予定', icon:'▦'},
      {view:'triage', label:'タスクフロー', short:'整理', icon:'▦'},
      {view:'future', label:'Future Log', short:'未来', icon:'◫'},
      {view:'yearly', label:'Yearly Log', short:'年間', icon:'▥'},
      {view:'weekly', label:'Weekly Log', short:'週間', icon:'▤'},
      {view:'daily', label:'Daily Log', short:'日別', icon:'▧'},
      {view:'tasksAssigned', label:'個別タスク', short:'個別', icon:'●'},
      {view:'tasksAll', label:'全タスク一覧', short:'全件', icon:'✓'},
      {view:'tasksOperations', label:'運営のタスク一覧', short:'運営', icon:'⚓'},
      {view:'tasksStaff', label:'スタッフ用タスク一覧', short:'Staff', icon:'☷'},
      {view:'tasksCast', label:'キャスト用タスク一覧', short:'Cast', icon:'♢'},
      {view:'events', label:'イベントリスト', short:'行事', icon:'☆'},
      {view:'projects', label:'プロジェクトリスト', short:'案件', icon:'◇'},
      {view:'meetings', label:'ミーティングリスト', short:'会議', icon:'◎'},
      {view:'schedulePolls', label:'日程調整', short:'調整', icon:'◷'},
      {view:'notes', label:'アイデア・ノート', short:'ノート', icon:'✎'},
      {view:'permissions', label:'権限・招待管理', short:'権限', icon:'◆'},
      {view:'backup', label:'バックアップ', short:'保存', icon:'↥'},
      {view:'settings', label:'設定', short:'設定', icon:'⚙'}
      ,{view:'adminEvent',label:'イベント詳細',short:'詳細',icon:'◆'},{view:'adminAudit',label:'操作ログ',short:'ログ',icon:'≡'},{view:'adminInvites',label:'招待リンク発行',short:'招待',icon:'＋'},{view:'adminApplications',label:'参加申請一覧',short:'申請',icon:'✓'},{view:'adminLinks',label:'データリンク',short:'リンク',icon:'↗'},{view:'adminRoles',label:'ロール管理',short:'ロール',icon:'♢'}
      ,{view:'globalEvents',label:'イベント作成',short:'作成',icon:'＋'},{view:'globalEventList',label:'イベント一覧',short:'一覧',icon:'◆'},{view:'globalInvites',label:'招待リンク発行',short:'招待',icon:'＋'},{view:'globalApplications',label:'イベントオーナーからの申請一覧',short:'申請',icon:'✓'},{view:'globalAudit',label:'操作ログ',short:'ログ',icon:'≡'},{view:'globalTrash',label:'ゴミ箱・復元',short:'復元',icon:'♲'}
    ];
    const DEFAULT_MENU_GROUPS = [
      {type:'group',id:'group-log',label:'Log',icon:'◌',visible:true,expanded:true},
      {type:'group',id:'group-list',label:'リスト',icon:'☷',visible:true,expanded:true}
    ];
    function menuPage(view,{visible=true,pinned=false,parentId=null,roleVisibility=null}={}) { return {type:'page',view,visible,pinned,parentId,...(roleVisibility?{roleVisibility}:{})}; }
    function defaultMenuConfig() {
      const roles=(owner,operations,staff,cast,external_collaborator=false)=>({owner,operations,staff,cast,external_collaborator});
      return [
        menuPage('home',{pinned:true}),menuPage('mypage',{pinned:true}),menuPage('calendar',{pinned:true}),
        menuPage('triage',{pinned:true,roleVisibility:roles(true,true,true,true,false)}),
        menuPage('tasksAssigned',{pinned:true}),
        menuPage('events',{roleVisibility:roles(true,true,true,true,true)}),
        menuPage('projects',{roleVisibility:roles(true,true,true,true,true)}),
        menuPage('meetings',{roleVisibility:roles(true,true,true,true,true)}),
        menuPage('notes',{roleVisibility:roles(true,true,true,true,false)}),
        menuPage('schedulePolls',{roleVisibility:roles(true,true,true,true,true)}),
        {...DEFAULT_MENU_GROUPS[1],roleVisibility:roles(true,true,true,false,false)},
        menuPage('tasksOperations',{parentId:'group-list',roleVisibility:roles(true,true,false,false,false)}),
        menuPage('tasksStaff',{parentId:'group-list',roleVisibility:roles(true,true,true,false,false)}),
        menuPage('tasksCast',{parentId:'group-list',roleVisibility:roles(true,true,true,true,false)}),
        menuPage('tasksAll',{visible:false,roleVisibility:roles(false,false,false,false,false)}),
        {...DEFAULT_MENU_GROUPS[0],roleVisibility:roles(true,true,true,true,false)},
        menuPage('future',{parentId:'group-log',roleVisibility:roles(true,true,true,true,false)}),
        menuPage('yearly',{parentId:'group-log',roleVisibility:roles(true,true,true,true,false)}),
        menuPage('weekly',{parentId:'group-log',roleVisibility:roles(true,true,true,true,false)}),
        menuPage('daily',{parentId:'group-log',roleVisibility:roles(true,true,true,true,false)}),
        menuPage('permissions',{roleVisibility:roles(true,true,false,false,false)}),
        menuPage('backup',{visible:false,roleVisibility:roles(false,false,false,false,false)}),
        menuPage('settings')
      ];
    }
    const REQUIRED_VISIBLE_MENU_VIEWS = new Set(['home','mypage','calendar','tasksAssigned','settings']);
    function enforceRequiredMenuEntries(items) {
      const result=Array.isArray(items)?items.map(item=>({...item})):[];
      let listGroup=result.find(item=>item.type==='group'&&item.id==='group-list');
      if(!listGroup){
        listGroup={...DEFAULT_MENU_GROUPS[1]};
        const logIndex=result.findIndex(item=>item.type==='group'&&item.id==='group-log');
        result.splice(logIndex>=0?logIndex+1:Math.min(4,result.length),0,listGroup);
      }
      listGroup.visible=true;
      const defaults=defaultMenuConfig();
      REQUIRED_VISIBLE_MENU_VIEWS.forEach(view=>{
        let page=result.find(item=>item.type==='page'&&item.view===view);
        if(!page){
          const fallback=defaults.find(item=>item.type==='page'&&item.view===view)||menuPage(view);
          page={...fallback};
          result.push(page);
        }
        page.visible=true;
        if(['tasksOperations','tasksStaff','tasksCast'].includes(view))page.parentId='group-list';
        if(view==='mypage')page.parentId=null;
      });
      const schedulePollPage=result.find(item=>item.type==='page'&&item.view==='schedulePolls');
      if(schedulePollPage)schedulePollPage.parentId=null;
      return result;
    }
    function normalizeMenuConfig(config) {
      const source=Array.isArray(config)?config:[];
      const hasTyped=source.some(item=>item?.type==='group'||item?.type==='page');
      if(!hasTyped){
        const legacy=new Map(source.map(item=>[typeof item==='string'?item:item?.view,item]));
        return enforceRequiredMenuEntries(defaultMenuConfig().map(item=>{
          if(item.type==='group')return item;
          const old=legacy.get(item.view);
          return {...item,visible:old?.visible===false?false:item.visible,pinned:!!old?.pinned};
        }));
      }
      const result=[]; const pageSeen=new Set(); const groupSeen=new Set();
      const defaults=defaultMenuConfig();
      source.forEach(item=>{
        if(item?.type==='group'){
          const id=String(item.id||'').trim(); if(!id||groupSeen.has(id))return;
          const fallback=defaults.find(entry=>entry.type==='group'&&entry.id===id);
          groupSeen.add(id); result.push({type:'group',id,label:String(item.label||'カテゴリ').trim()||'カテゴリ',icon:item.icon||'▾',visible:item.visible!==false,expanded:item.expanded!==false,roleVisibility:{...(fallback?.roleVisibility||{}),...(item.roleVisibility||{})}});
          return;
        }
        const view=typeof item==='string'?item:item?.view;
        if(!MENU_DEFINITIONS.some(def=>def.view===view)||pageSeen.has(view))return;
        const fallback=defaults.find(entry=>entry.type==='page'&&entry.view===view);
        pageSeen.add(view); result.push({type:'page',view,visible:item?.visible!==false,pinned:item?.pinned===undefined?!!fallback?.pinned:!!item.pinned,parentId:item?.parentId||null,roleVisibility:{...(fallback?.roleVisibility||{}),...(item?.roleVisibility||{})}});
      });
      MENU_DEFINITIONS.forEach(def=>{
        if(pageSeen.has(def.view))return;
        const fallback=defaults.find(item=>item.type==='page'&&item.view===def.view)||menuPage(def.view);
        result.push({...fallback,parentId:result.some(item=>item.type==='group'&&item.id===fallback.parentId)?fallback.parentId:null});
      });
      const validGroups=new Set(result.filter(item=>item.type==='group').map(item=>item.id));
      result.forEach(item=>{if(item.type==='page'&&item.parentId&&!validGroups.has(item.parentId))item.parentId=null;});
      return enforceRequiredMenuEntries(result);
    }
    function menuDefinition(view) { return MENU_DEFINITIONS.find(item => item.view === view); }
    function menuEntryKey(item) { return item?.type==='group'?`group:${item.id}`:`page:${item?.view}`; }
    function menuGroup(id) { return state.menuConfig.find(item=>item.type==='group'&&item.id===id); }
    function menuPageConfig(view) { return state.menuConfig.find(item=>item.type==='page'&&item.view===view); }
    function pageVisibleInMenu(item) {
      if(!item||item.type!=='page'||!menuItemVisibleForRole(item,currentStaffRole()))return false;
      if(item.view==='triage'&&activeWorkspace===eventWorkspaceId&&!canManageTasks())return false;
      if(item.view==='schedulePolls'&&activeWorkspace==='personal')return false;
      if(item.pinned||!item.parentId)return true;
      return menuItemVisibleForRole(menuGroup(item.parentId),currentStaffRole());
    }
    function menuItemVisibleForRole(item,role=currentStaffRole()) {
      if(!item)return false;
      if(activeWorkspace!==eventWorkspaceId)return item.visible!==false;
      return item.roleVisibility?.[role]??item.visible!==false;
    }
    function menuTargetRole() {
      const selected=document.getElementById('menuRoleTarget')?.value;
      return canManageTasks()&&['owner','operations','staff','cast','external_collaborator'].includes(selected)?selected:currentStaffRole();
    }

    const TASK_AUDIENCE_LABELS = {owner:'オーナー',operations:'運営',staff:'スタッフ',cast:'キャスト',external_collaborator:'外部協力'};
    const VISIBILITY_LABELS = {...TASK_AUDIENCE_LABELS};
    const MANAGEMENT_TYPE_LABELS = {idea:'アイデア',project:'プロジェクト',task:'タスク',meeting:'会議',request:'依頼・案件',recurring:'定期業務',record:'記録・台帳'};
    const IDEA_DECISION_LABELS = {pending:'未整理',approved:'実施',onHold:'保留',rejected:'却下'};
    const TASK_VIEW_AUDIENCE = {tasksAssigned:'assigned',tasksAll:'all',tasksOperations:'operations',tasksStaff:'staff',tasksCast:'cast'};
    const LEGACY_ROLE_MAP = {admin:'operations',member:'staff',viewer:'cast'};
    function normalizeStaffRole(role='cast') { return LEGACY_ROLE_MAP[role] || (['owner','operations','staff','cast','external_collaborator'].includes(role)?role:'cast'); }
    function currentStaffRole() { return normalizeStaffRole(window.currentStaffUser?.role||'cast'); }
    function canManageTasks() { return ['owner','operations'].includes(currentStaffRole()); }
    function canManageDropdowns() { return true; }
    function canEditSettingKey(key) { return activeWorkspace!==eventWorkspaceId||!['importanceLevels','urgencyLevels'].includes(key)||canManageTasks(); }
    function taskAudiencesForRole(role=currentStaffRole()) {
      const normalized=normalizeStaffRole(role);
      if(normalized==='owner')return ['owner','operations','staff','cast'];
      if(normalized==='operations')return ['operations','staff','cast'];
      if(normalized==='staff')return ['staff','cast'];
      return ['cast'];
    }
    function normalizeTaskAudience(value='staff') { return ['owner','operations','staff','cast'].includes(value)?value:'staff'; }
    function normalizeVisibility(value='staff') { return normalizeTaskAudience(value); }
    function taskAudienceOf(task) { return normalizeTaskAudience(task?.visibility||task?.audience||task?.taskAudience||'staff'); }
    function canCurrentRoleSeeTask(task) { return taskAudiencesForRole().includes(taskAudienceOf(task)); }
    function canCurrentRoleSeeVisibility(item) { return taskAudiencesForRole().includes(normalizeVisibility(item?.visibility||item?.audience||'staff')); }
    const WORKSPACE_LABELS={personal:'個人用','arasaki-shipyard':'荒嵜造船所用'};
    let eventWorkspaceId='arasaki-shipyard';
    let eventWorkspaceName='荒嵜造船所';
    window.setPlannerWorkspaceIdentity=(workspaceId,workspaceName)=>{
      const previousId=eventWorkspaceId;
      eventWorkspaceId=String(workspaceId||'arasaki-shipyard');
      eventWorkspaceName=String(workspaceName||eventWorkspaceId||'イベント').trim()||'イベント';
      WORKSPACE_LABELS[eventWorkspaceId]=`${eventWorkspaceName}用`;
      document.querySelectorAll('.workspace-tab[data-workspace]').forEach(tab=>{
        if(tab.dataset.workspace===previousId||tab.dataset.workspace==='arasaki-shipyard'){
          tab.dataset.workspace=eventWorkspaceId;
          const label=tab.querySelector('.workspace-tab-label');
          const help=tab.querySelector('small');
          if(label)label.textContent=`${eventWorkspaceName}用`;
          if(help)help.textContent=`${eventWorkspaceName}のスタッフ用スペース`;
        }
      });
      document.querySelectorAll('select option[value="arasaki-shipyard"]').forEach(option=>{
        option.value=eventWorkspaceId;
        option.textContent=eventWorkspaceName;
      });
      if(activeWorkspace===previousId||activeWorkspace==='arasaki-shipyard')activeWorkspace=eventWorkspaceId;
      window.renderMyPage?.();
      applyEventWorkspaceIcon();
    };
    function applyEventWorkspaceIcon(){
      const icon=state?.adminConfig?.event?.icon||'';
      const tab=document.querySelector(`.workspace-tab[data-workspace="${eventWorkspaceId}"]`);
      const mark=tab?.querySelector('.workspace-tab-mark');if(!mark)return;
      mark.innerHTML=icon?`<img class="workspace-tab-image" src="${escapeHtml(icon)}" alt="" />`:'⚓';
    }
    let activeWorkspace='all';
    window.getActivePlannerWorkspace=()=>activeWorkspace;
    function itemWorkspace(item) { return item?.workspaceId||'arasaki-shipyard'; }
    function inActiveWorkspace(item) { return activeWorkspace==='all'||itemWorkspace(item)===activeWorkspace; }
    function visibleTasks() { return state.tasks.filter(task=>canCurrentRoleSeeTask(task)&&inActiveWorkspace(task)); }
    function visibleEvents() { return state.events.filter(inActiveWorkspace); }
    function visibleFutureItems() { return state.futureItems.filter(inActiveWorkspace); }
    function canManageFutureWorkspace(workspaceId) { return workspaceId==='personal'||canManageTasks(); }
    function canManageFutureItem(item) { return canManageFutureWorkspace(itemWorkspace(item)); }
    function canAddFutureInActiveWorkspace() { return canManageFutureWorkspace(activeWorkspace==='all'?'personal':activeWorkspace); }
    window.getPlannerEventProfileOptions=()=>[{id:eventWorkspaceId,name:eventWorkspaceName,date:''}];
    function visibleProjects() { return state.projects.filter(project=>canCurrentRoleSeeVisibility(project)&&inActiveWorkspace(project)); }
    function visibleNotes() { return state.notes.filter(note=>canCurrentRoleSeeVisibility(note)&&inActiveWorkspace(note)); }
    function workspaceLabel(item) { return WORKSPACE_LABELS[itemWorkspace(item)]||itemWorkspace(item); }
    function workspaceProfileScope() { return activeWorkspace===eventWorkspaceId?'event':'personal'; }
    function personalTaskCategories() {
      const preferred=new Set(['PRIVATE','LIFE','VRchat']);
      const used=new Set(state.tasks.filter(task=>itemWorkspace(task)==='personal').map(task=>task.category).filter(Boolean));
      return settingItems('categories').filter(item=>preferred.has(item.value)||used.has(item.value));
    }
    function refreshWorkspaceTaskControls() {
      const personal=activeWorkspace==='personal';
      ['capturePersonalCategoryField','capturePersonalTypeField'].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=!personal;});
      ['captureMajorCategoryField','captureMiddleCategoryField','captureSmallCategoryField'].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=personal;});
      ['captureProjectField','captureAudienceField'].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=personal;});
      const noteField=document.getElementById('captureNoteField');if(noteField)noteField.hidden=true;
      const major=document.getElementById('captureMajorCategory');if(major)major.required=!personal;
      const category=document.getElementById('captureTaskCategory');
      if(category&&personal){
        const current=category.value;
        const items=personalTaskCategories();
        category.innerHTML=items.map(item=>`<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join('');
        category.value=items.some(item=>item.value===current)?current:(items[0]?.value||'PRIVATE');
        const type=document.getElementById('captureTaskType');
        if(type){const selected=type.value;type.innerHTML=taskTypeOptionsForCategory(category.value,selected);type.value=[...type.options].some(option=>option.value===selected)?selected:(type.options[0]?.value||'');}
      }
      const filter=document.getElementById('triageCategoryFilter');
      if(filter){
        const current=filter.value;
        if(personal)filter.innerHTML='<option value="all">すべての個人用カテゴリ</option>'+personalTaskCategories().map(item=>`<option value="legacy:${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join('');
        else filter.innerHTML='<option value="all">すべてのイベント用カテゴリ</option>'+majorCategories({activeOnly:true}).map(item=>`<option value="major:${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
        filter.value=[...filter.options].some(option=>option.value===current)?current:'all';
      }
    }
    function applyActiveWorkspace(nextWorkspace) {
      activeWorkspace=['all','personal',eventWorkspaceId].includes(nextWorkspace)?nextWorkspace:'all';
      document.querySelectorAll('.workspace-tab').forEach(tab=>tab.classList.toggle('active',tab.dataset.workspace===activeWorkspace));
      refreshWorkspaceTaskControls();
      window.setMyPageProfileScope?.(workspaceProfileScope());
    }
    function syncWorkspaceTabsForView() {
      const permissionsOnly=currentView==='permissions';
      const allUnavailable=currentView==='mypage'||currentView==='triage';
      const allTab=document.querySelector('.workspace-tab[data-workspace="all"]');
      const personalTab=document.querySelector('.workspace-tab[data-workspace="personal"]');
      const eventTab=document.querySelector(`.workspace-tab[data-workspace="${eventWorkspaceId}"]`);
      if(allTab)allTab.hidden=allUnavailable||permissionsOnly;
      if(personalTab)personalTab.hidden=permissionsOnly;
      if(eventTab)eventTab.hidden=false;
      if(permissionsOnly&&activeWorkspace!==eventWorkspaceId)applyActiveWorkspace(eventWorkspaceId);
      if(allUnavailable&&activeWorkspace==='all')applyActiveWorkspace('personal');
    }
    function pageAllowedForRole(view,role=currentStaffRole()) {
      const normalized=normalizeStaffRole(role);
      if(APP_SURFACE==='owner'&&!OWNER_SURFACE_VIEWS.has(view))return false;
      if(APP_SURFACE==='global'&&!GLOBAL_SURFACE_VIEWS.has(view))return false;
      if(APP_SURFACE==='app'&&STAFF_SURFACE_HIDDEN_VIEWS.has(view))return false;
      if(view==='tasksAll')return normalized==='owner';
      if(view==='tasksAssigned')return true;
      if(normalized==='external_collaborator')return ['home','mypage','calendar','events','projects','meetings','schedulePolls','settings'].includes(view);
      if(view==='tasksOperations')return normalized==='owner'||normalized==='operations';
      if(view==='tasksStaff')return normalized==='owner'||normalized==='operations'||normalized==='staff';
      if(view==='tasksCast')return true;
      if(view==='backup')return normalized==='owner';
      return true;
    }
    function preferredTaskViewForRole(role=currentStaffRole()) {
      const normalized=normalizeStaffRole(role);
      if(normalized==='owner')return APP_SURFACE==='owner'?'tasksAll':'tasksOperations';
      if(normalized==='operations')return 'tasksOperations';
      if(normalized==='staff')return 'tasksStaff';
      return 'tasksCast';
    }
    function defaultTaskAudienceForRole(role=currentStaffRole()) {
      const normalized=normalizeStaffRole(role);
      if(normalized==='owner'||normalized==='operations')return 'operations';
      if(normalized==='staff')return 'staff';
      return 'cast';
    }
    function currentTaskViewAudience() { return TASK_VIEW_AUDIENCE[currentView] || 'all'; }
    function updateRoleControls() {
      const allowed=activeWorkspace==='personal'||canManageTasks();
      document.body.classList.toggle('task-create-disabled',!allowed);
      const createIds=['newTaskBtn','newTaskBtn2','workflowOpenFullTaskBtn','triageNewTaskBtn','addTaskForDayBtn','dailyAddTaskBtn'];
      createIds.forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=!allowed;});
      const capture=document.getElementById('taskCaptureForm');if(capture)capture.hidden=!allowed;
      const eventCreateAllowed=activeWorkspace!=='personal'?canManageTasks():true;
      ['newEventBtn','newEventBtn2','yearlyAddEventBtn','dailyAddEventBtn'].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=!eventCreateAllowed;});
      ['newProjectBtn','newMeetingBtn','dailyAddMeetingBtn','newSchedulePollBtn'].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=!canManageTasks();});
    }
    function taskAudienceOptions(selected='') {
      const allowed=taskAudiencesForRole();
      const chosen=allowed.includes(selected)?selected:(TASK_VIEW_AUDIENCE[currentView]&&TASK_VIEW_AUDIENCE[currentView]!=='all'&&allowed.includes(TASK_VIEW_AUDIENCE[currentView])?TASK_VIEW_AUDIENCE[currentView]:defaultTaskAudienceForRole());
      return allowed.map(value=>`<option value="${value}" ${value===chosen?'selected':''}>${TASK_AUDIENCE_LABELS[value]}用タスク一覧</option>`).join('');
    }
    function refreshTaskAudienceSelect(selected='') {
      const el=document.getElementById('taskAudience');if(!el)return;
      el.innerHTML=taskAudienceOptions(selected);
      const allowed=taskAudiencesForRole();
      const fallback=allowed.includes(selected)?selected:(TASK_VIEW_AUDIENCE[currentView]&&TASK_VIEW_AUDIENCE[currentView]!=='all'&&allowed.includes(TASK_VIEW_AUDIENCE[currentView])?TASK_VIEW_AUDIENCE[currentView]:defaultTaskAudienceForRole());
      el.value=fallback;
    }

    function refreshCaptureTaskAudience(selected='') {
      const el=document.getElementById('captureTaskAudience');if(!el)return;
      const allowed=taskAudiencesForRole();
      const fallback=allowed.includes(selected)?selected:defaultTaskAudienceForRole();
      el.innerHTML=allowed.map(value=>`<option value="${value}">${TASK_AUDIENCE_LABELS[value]}用</option>`).join('');
      el.value=fallback;
    }

    function defaultSettings() {
      const pair = values => values.map(value => ({ value, label:value }));
      const typed = (category, labels) => labels.map((label,index) => ({ value:`${category}__${index+1}`, label, category }));
      return {
        categories: pair(['PRIVATE','LIFE','VRchat','企画','人事','総務','情報システム','ワールド制作','小物制作','SNS・広報','品質確認']),
        taskTypes: [
          ...typed('PRIVATE',['コンタクト交換','個人的な用事']),
          ...typed('LIFE',['ゴミ出し','買い出し']),
          ...typed('VRchat',['荒嵜造船所以外','イベント参加','フレンド・コミュニティ']),
          ...typed('企画',['企画立案','タイムスケジュール作成','カンペ作成','MTG']),
          ...typed('人事',['募集','面談','育成']),
          ...typed('総務',['周知','連絡','出欠確認','リマインド','日程調整']),
          ...typed('情報システム',['Discord管理','Notion管理','ツール管理']),
          ...typed('ワールド制作',['モデリング','ギミック','ライト・演出','動作確認','修正']),
          ...typed('小物制作',['モデリング','ギミック','提出','実装']),
          ...typed('SNS・広報',['告知文','ポスター作製','投稿','イベントカレンダー']),
          ...typed('品質確認',['動作確認','修正依頼','最終確認']),
          {value:'common__other',label:'その他',category:''}
        ],
        eventTypes: [
          {value:'birthday',label:'誕生日',scope:'personal'},
          {value:'anniversary',label:'記念日',scope:'personal'},
          {value:'regular_event',label:'定期イベント',scope:'event'},
          {value:'special_event',label:'特別イベント',scope:'event'},
          {value:'collaboration_event',label:'コラボイベント',scope:'event'}
        ],
        taskStatuses: [
          {value:'inbox',label:'Inbox',description:'仕分け前',scope:'both'},
          {value:'todo',label:'未着手',description:'個人用：日付未設定／イベント用：担当者未設定・スケジュール未設定',scope:'both'},
          {value:'planning',label:'計画中',description:'担当者未設定・スケジュール設定済み',scope:'event'},
          {value:'waiting',label:'待機中',description:'担当者決定済み・スケジュール未設定',scope:'event'},
          {value:'doing',label:'進行中',description:'担当者決定済み・スケジュール設定済み',scope:'event'},
          {value:'review',label:'確認待ち',description:'タスク完了後、責任者確認中',scope:'event'},
          {value:'hold',label:'保留',description:'保留とするものは手作業で変更',scope:'both'},
          {value:'done',label:'完了',description:'タスク・プロジェクト完了（イベント用は自動でアーカイブ）',scope:'both',protected:true}
        ],
        priorities: ['1A','1B','1C','2A','2B','2C','3A','3B','3C'].map(value=>({value,label:value,protected:true})),
        taskGroups: [],
        importanceLevels: [{value:'A',label:'A（高）',protected:true},{value:'B',label:'B（中）',protected:true},{value:'C',label:'C（低）',protected:true}],
        urgencyLevels: [{value:'1',label:'1（高）',protected:true},{value:'2',label:'2（中）',protected:true},{value:'3',label:'3（低）',protected:true}],
        projectStatuses: [{value:'planning',label:'計画中'},{value:'active',label:'進行中'},{value:'review',label:'確認中'},{value:'waiting',label:'待機中'},{value:'completed',label:'完了'},{value:'archived',label:'保管'}],
        noteTypes: [
          {value:'idea',label:'アイディア',scope:'both'},
          {value:'minutes',label:'議事録',scope:'event'},
          {value:'decision',label:'決定事項',scope:'event'},
          {value:'handover',label:'引き継ぎ',scope:'both'},
          {value:'reference',label:'リンク・資料',scope:'both'},
          {value:'improvement',label:'改善案',scope:'event'},
          {value:'memo',label:'メモ',scope:'both'}
        ]
      };
    }
    const settingNames = {
      categories:'カテゴリ', taskTypes:'タスクの種類', eventTypes:'イベントの種類', taskStatuses:'タスクの状態',
      importanceLevels:'重要度（3段階・名称変更可）', urgencyLevels:'緊急度（3段階・名称変更可）',
      noteTypes:'ノートの種類'
    };
    function normalizeSettings(settings) {
      const defaults = defaultSettings();
      const result = {};
      Object.keys(defaults).forEach(key => {
        let source = Array.isArray(settings?.[key]) ? settings[key] : defaults[key];
        if(['eventTypes','taskStatuses','noteTypes'].includes(key)&&!source.some(item=>item?.scope||item?.description))source=defaults[key];
        if(key==='eventTypes' && source.length===3 && source.every(item=>!item?.category) &&
          source.map(item=>item?.label||item).join('|')==='定期イベント|特別イベント|MTG') source=defaults.eventTypes;
        if(key==='priorities' && !source.some(item=>/^([123][ABC])$/.test(String(item?.value||item)))) source=defaults.priorities;
        result[key] = source.map(item => typeof item === 'string' ? {value:item,label:item} : {...item});
      });
      return result;
    }
    const LEGACY_DEFAULT_CATEGORIES=['個人','仕事','荒嵜造船所','OKEANOS'];
    const LEGACY_DEFAULT_TASK_TYPES=['制作','企画','運営','連絡・確認','ミーティング','イベント運営','SNS・告知','採用・面談','資料作成','家事・生活','学習','その他'];
    function settingValuesMatch(items, values) {
      return Array.isArray(items) && items.length===values.length && items.every((item,index)=>(item?.value||item?.label)===values[index]);
    }
    function legacyCategoryToNew(value) {
      return ({'個人':'PRIVATE','仕事':'WORK','荒嵜造船所':'VRchat','OKEANOS':'VRchat'})[value] || value || 'PRIVATE';
    }
    function migrateV48Defaults(next, previousVersion) {
      const legacyCategories=settingValuesMatch(next.settings?.categories,LEGACY_DEFAULT_CATEGORIES);
      const legacyTaskTypes=settingValuesMatch(next.settings?.taskTypes,LEGACY_DEFAULT_TASK_TYPES);
      const legacyTaskCategories=new Map((next.tasks||[]).map(task=>[task.id,task.category]));
      if(legacyCategories){
        const collections=['events','projects','meetings','notes','futureItems'];
        collections.forEach(key=>(next[key]||[]).forEach(item=>{item.category=legacyCategoryToNew(item.category);}));
        if(!legacyTaskTypes)(next.tasks||[]).forEach(task=>{task.category=legacyCategoryToNew(task.category);});
        next.settings.categories=defaultSettings().categories.map(item=>({...item}));
      }
      if(legacyTaskTypes){
        const defaults=defaultSettings().taskTypes.map(item=>({...item}));
        const extras=[];
        const findDefault=(category,label)=>defaults.find(item=>item.category===category&&item.label===label);
        const ensureExtra=(category,label)=>{
          const existing=extras.find(item=>item.category===category&&item.label===label);
          if(existing)return existing;
          const item={value:`legacy_${category}_${Date.now()}_${extras.length}`,label:label||'未分類',category};extras.push(item);return item;
        };
        (next.tasks||[]).forEach(task=>{
          const legacyCategory=legacyTaskCategories.get(task.id)||task.category;
          const category=legacyCategoryToNew(legacyCategory);
          const oldType=task.type||'';
          let target=null;
          if(category==='VRchat'&&legacyCategory==='荒嵜造船所')target=findDefault(category,'荒嵜造船所');
          if(category==='VRchat'&&legacyCategory==='OKEANOS')target=findDefault(category,'OKEANOS');
          if(category==='VRchat'&&['荒嵜造船所','OKEANOS'].includes(oldType))target=findDefault(category,oldType);
          if(category==='VRchat'&&oldType==='制作'&&!target)target=findDefault(category, task.title?.includes('OKEANOS')?'OKEANOS':'荒嵜造船所');
          if(category==='WORK'&&oldType==='資料作成')target=findDefault(category,'資料作成');
          if(category==='WORK'&&oldType==='ミーティング')target=findDefault(category,'MTG');
          if(category==='WORK'&&oldType==='採用・面談')target=findDefault(category,'面談');
          if(!target&&oldType)target=ensureExtra(category,oldType);
          if(!target)target=defaults.find(item=>item.category===category)||defaults[0];
          task.category=category;task.type=target.value;
        });
        next.settings.taskTypes=[...defaults,...extras];
      } else {
        next.settings.taskTypes=(next.settings.taskTypes||[]).map(item=>({...item,category:legacyCategories?legacyCategoryToNew(item.category||''):(item.category||'')}));
      }
    }
    function migratedTaskTypeValue(category, label) {
      return `migrated::${String(category||'PRIVATE')}::${String(label||'未分類')}`;
    }
    function migrateExistingTaskRecords(next) {
      const defaults=defaultSettings();
      const defaultCategories=defaults.categories.map(item=>({...item}));
      const defaultTypes=defaults.taskTypes.map(item=>({...item}));
      const legacyCategoryValues=new Set(LEGACY_DEFAULT_CATEGORIES);
      const legacyTypeLabels=new Set(LEGACY_DEFAULT_TASK_TYPES);

      const extraCategories=[];
      const categorySeen=new Set(defaultCategories.map(item=>item.value));
      (next.settings?.categories||[]).forEach(item=>{
        const raw=String(item?.value||item?.label||'').trim();if(!raw)return;
        const mapped=legacyCategoryToNew(raw);
        if(categorySeen.has(mapped))return;
        categorySeen.add(mapped);
        extraCategories.push({value:mapped,label:legacyCategoryValues.has(raw)?mapped:String(item?.label||mapped)});
      });
      next.settings.categories=[...defaultCategories,...extraCategories];

      const sourceTypes=(next.settings?.taskTypes||[]).map(item=>typeof item==='string'?{value:item,label:item,category:''}:{...item});
      const sourceByValue=new Map(sourceTypes.map(item=>[item.value,item]));
      const generatedTypes=[];
      const findDefault=(category,label)=>defaultTypes.find(item=>item.category===category&&item.label===label);
      const ensureCustom=(category,label)=>{
        const clean=String(label||'').trim()||'未分類';
        const defaultItem=findDefault(category,clean);if(defaultItem)return defaultItem;
        let item=generatedTypes.find(entry=>entry.category===category&&entry.label===clean);
        if(item)return item;
        const value=migratedTaskTypeValue(category,clean);
        item={value,label:clean,category};generatedTypes.push(item);return item;
      };
      const ensureCategory=value=>{
        const raw=String(value||'').trim();
        const mapped=legacyCategoryToNew(raw);
        if(categorySeen.has(mapped))return mapped;
        if(raw&&!categorySeen.has(raw)){
          const item={value:raw,label:raw};next.settings.categories.push(item);categorySeen.add(raw);return raw;
        }
        return defaultCategories[0]?.value||'PRIVATE';
      };
      const taskTypeLabel=raw=>{
        const value=String(raw||'').trim();
        return sourceByValue.get(value)?.label || defaultTypes.find(item=>item.value===value)?.label || value;
      };

      const collections=['events','projects','meetings','notes','futureItems'];
      collections.forEach(key=>(next[key]||[]).forEach(item=>{item.category=ensureCategory(item.category);}));
      (next.tasks||[]).forEach(task=>{
        const originalCategory=String(task.category||'').trim();
        const category=ensureCategory(originalCategory);
        const rawType=String(task.type||'').trim();
        let label=taskTypeLabel(rawType);
        let target=defaultTypes.find(item=>item.value===rawType&&item.category===category);
        const sourceItem=sourceByValue.get(rawType);
        const sourceCategory=sourceItem?.category?legacyCategoryToNew(sourceItem.category):'';
        if(!target&&sourceItem&&!legacyTypeLabels.has(label)&&(!sourceCategory||sourceCategory===category))target={...sourceItem,category:sourceCategory};
        if(!target&&originalCategory==='荒嵜造船所')target=findDefault('VRchat','荒嵜造船所');
        if(!target&&originalCategory==='OKEANOS')target=findDefault('VRchat','OKEANOS');
        if(!target&&category==='WORK'&&label==='ミーティング')target=findDefault('WORK','MTG');
        if(!target&&category==='WORK'&&label==='採用・面談')target=findDefault('WORK','面談');
        if(!target&&category==='WORK'&&label==='資料作成')target=findDefault('WORK','資料作成');
        if(!target&&findDefault(category,label))target=findDefault(category,label);
        if(!target)target=ensureCustom(category,label);
        task.category=category;task.type=target.value;
      });

      const preservedTypes=[];
      const typeKeys=new Set(defaultTypes.map(item=>`${item.category}::${item.label}`));
      sourceTypes.forEach(item=>{
        const label=String(item.label||item.value||'').trim();if(!label)return;
        const originalCategory=String(item.category||'').trim();
        const category=originalCategory?legacyCategoryToNew(originalCategory):'';
        if(defaultTypes.some(def=>def.value===item.value||`${def.category}::${def.label}`===`${category}::${label}`))return;
        if(legacyTypeLabels.has(label)&&(!originalCategory||legacyCategoryValues.has(originalCategory)))return;
        const key=`${category}::${label}`;if(typeKeys.has(key))return;
        typeKeys.add(key);preservedTypes.push({...item,category});
      });
      generatedTypes.forEach(item=>{
        const key=`${item.category}::${item.label}`;if(typeKeys.has(key))return;
        typeKeys.add(key);preservedTypes.push(item);
      });
      next.settings.taskTypes=[...defaultTypes,...preservedTypes];
    }
    function resolveTaskCategoryValue(raw='') {
      const value=String(raw||'').trim();
      if(categories.includes(value))return value;
      const mapped=legacyCategoryToNew(value);
      return categories.includes(mapped)?mapped:(categories[0]||'PRIVATE');
    }
    function resolveTaskTypeValue(category, raw='', originalCategory='') {
      const value=String(raw||'').trim();
      const items=taskTypeItemsForCategory(category);
      if(items.some(item=>item.value===value))return value;
      let label=value;
      if(originalCategory==='荒嵜造船所')label='荒嵜造船所';
      else if(originalCategory==='OKEANOS')label='OKEANOS';
      else if(category==='WORK'&&value==='ミーティング')label='MTG';
      else if(category==='WORK'&&value==='採用・面談')label='面談';
      return items.find(item=>item.label===label)?.value || firstTaskTypeForCategory(category);
    }
    function settingItems(key) { return state?.settings?.[key] || defaultSettings()[key] || []; }
    function taskTypeItemsForCategory(category='', includeCommon=true) {
      return settingItems('taskTypes').filter(item=>!category || item.category===category || (includeCommon&&!item.category));
    }
    function firstTaskTypeForCategory(category='') {
      return taskTypeItemsForCategory(category)[0]?.value || settingItems('taskTypes')[0]?.value || '';
    }
    function taskTypeOptionsForCategory(category='', selected='', includeAll=false) {
      const items=includeAll?settingItems('taskTypes'):taskTypeItemsForCategory(category);
      return items.map(item=>`<option value="${escapeHtml(item.value)}" ${item.value===selected?'selected':''}>${escapeHtml(item.label)}</option>`).join('');
    }
    function groupedTaskTypeFilterOptions(category='all',selected='all') {
      if(category&&category!=='all')return `<option value="all">すべて</option>${taskTypeOptionsForCategory(category,selected)}`;
      const common=settingItems('taskTypes').filter(item=>!item.category);
      const groups=settingItems('categories').map(cat=>({cat,items:settingItems('taskTypes').filter(item=>item.category===cat.value)})).filter(group=>group.items.length);
      return `<option value="all">すべて</option>${groups.map(group=>`<optgroup label="${escapeHtml(group.cat.label)}">${group.items.map(item=>`<option value="${escapeHtml(item.value)}" ${item.value===selected?'selected':''}>${escapeHtml(item.label)}</option>`).join('')}</optgroup>`).join('')}${common.length?`<optgroup label="共通">${common.map(item=>`<option value="${escapeHtml(item.value)}" ${item.value===selected?'selected':''}>${escapeHtml(item.label)}</option>`).join('')}</optgroup>`:''}`;
    }
    function refreshTaskTypeSelect(category=document.getElementById('taskCategory')?.value||'', selected='') {
      const el=document.getElementById('taskType');if(!el)return;
      const current=selected||el.value;el.innerHTML=taskTypeOptionsForCategory(category,current);
      if([...el.options].some(option=>option.value===current))el.value=current;
      else el.value=firstTaskTypeForCategory(category);
    }
    const PERSONAL_TASK_CATEGORIES=new Set(['PRIVATE','LIFE','VRchat']);
    function eventCategoriesForWorkspace(workspaceId) {
      const personal=workspaceId==='personal';
      const used=new Set(state.events.filter(event=>itemWorkspace(event)===workspaceId).map(event=>event.category).filter(Boolean));
      return settingItems('categories').filter(item=>(personal?PERSONAL_TASK_CATEGORIES.has(item.value):!PERSONAL_TASK_CATEGORIES.has(item.value))||used.has(item.value));
    }
    function eventTypeItemsForCategory(category='') {
      return settingItems('eventTypes').filter(item=>!item.category||item.category===category);
    }
    function refreshEventTypeSelect(category=document.getElementById('eventCategory')?.value||'',selected='') {
      const el=document.getElementById('eventType');if(!el)return;
      const items=eventTypeItemsForCategory(category);
      el.innerHTML=items.map(item=>`<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join('');
      el.value=items.some(item=>item.value===selected)?selected:(items[0]?.value||'');
    }
    function refreshEventCategoryForWorkspace(workspaceId,selected='',selectedType='') {
      const el=document.getElementById('eventCategory');if(!el)return;
      const items=eventCategoriesForWorkspace(workspaceId);
      el.innerHTML=items.map(item=>`<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join('');
      el.value=items.some(item=>item.value===selected)?selected:(items[0]?.value||'');
      refreshEventTypeSelect(el.value,selectedType);
    }
    function refreshTaskCategoryForWorkspace(workspaceId,selected='',selectedType='') {
      const el=document.getElementById('taskCategory');if(!el)return;
      const personal=workspaceId==='personal';
      const items=settingItems('categories').filter(item=>personal?PERSONAL_TASK_CATEGORIES.has(item.value):!PERSONAL_TASK_CATEGORIES.has(item.value));
      const fallback=items[0]?.value||'PRIVATE';
      const value=items.some(item=>item.value===selected)?selected:fallback;
      el.innerHTML=items.map(item=>`<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join('');
      el.value=value;
      refreshTaskTypeSelect(value,selectedType);
    }
    function refreshTaskTypeFilter() {
      const category=document.getElementById('categoryFilter')?.value||'all';
      const el=document.getElementById('typeFilter');if(!el)return;
      const current=el.value;el.innerHTML=groupedTaskTypeFilterOptions(category,current);
      if([...el.options].some(option=>option.value===current))el.value=current;else el.value='all';
    }
    function settingLabel(key,value,fallback='') {
      return settingItems(key).find(item => item.value === value)?.label || fallback || value || '';
    }
    function settingOptions(key, selected='', includeBlank=false, blankLabel='未選択') {
      return `${includeBlank?`<option value="">${escapeHtml(blankLabel)}</option>`:''}` +
        settingItems(key).map(item => `<option value="${escapeHtml(item.value)}" ${item.value===selected?'selected':''}>${escapeHtml(item.label)}</option>`).join('');
    }
    function visibilityOptions(selected='staff',includeAll=false,allowed=taskAudiencesForRole()) {
      const values=Object.entries(VISIBILITY_LABELS).filter(([value])=>allowed.includes(value));
      const safeSelected=values.some(([value])=>value===selected)?selected:values[0]?.[0]||'cast';
      return `${includeAll?'<option value="all">すべて</option>':''}${values.map(([value,label])=>`<option value="${value}" ${value===safeSelected?'selected':''}>${escapeHtml(label)}</option>`).join('')}`;
    }
    function managementTypeOptions(selected='task',includeAll=false,allowed=null) {
      const entries=Object.entries(MANAGEMENT_TYPE_LABELS).filter(([value])=>!allowed||allowed.includes(value));
      return `${includeAll?'<option value="all">すべて</option>':''}${entries.map(([value,label])=>`<option value="${value}" ${value===selected?'selected':''}>${escapeHtml(label)}</option>`).join('')}`;
    }
    function categorySelectOptions(items,selected='',blankValue='',blankLabel='未選択') {
      const options=[...items];
      const selectedNode=selected&&categoryNode(selected);
      if(selectedNode&&!options.some(item=>item.id===selectedNode.id))options.push(selectedNode);
      return `<option value="${escapeHtml(blankValue)}">${escapeHtml(blankLabel)}</option>${options.map(item=>`<option value="${escapeHtml(item.id)}" ${item.id===selected?'selected':''}>${escapeHtml(item.name)}${item.active===false?'（無効）':''}</option>`).join('')}`;
    }
    function populateHierarchySelects(ids,selection={},config={}) {
      const major=document.getElementById(ids.major),middle=document.getElementById(ids.middle),small=document.getElementById(ids.small);
      if(!major||!middle||!small)return;
      const blankValue=config.filter?'all':'';
      const activeOnly=config.activeOnly!==false;
      const selectedMajor=Object.prototype.hasOwnProperty.call(selection,'majorCategoryId')?selection.majorCategoryId:major.value;
      const majors=majorCategories({activeOnly,forNew:!config.filter});
      major.innerHTML=categorySelectOptions(majors,selectedMajor,blankValue,config.filter?'すべて':'大カテゴリを選択');
      major.value=[...major.options].some(option=>option.value===selectedMajor)?selectedMajor:blankValue;
      const effectiveMajor=major.value===blankValue?'':major.value;
      const selectedMiddle=effectiveMajor?(Object.prototype.hasOwnProperty.call(selection,'middleCategoryId')?selection.middleCategoryId:middle.value):'';
      const middles=effectiveMajor?categoryChildren(effectiveMajor,{activeOnly}):[];
      middle.innerHTML=categorySelectOptions(middles,selectedMiddle,blankValue,config.filter?'すべて':'中カテゴリなし');
      middle.disabled=!effectiveMajor;
      middle.value=[...middle.options].some(option=>option.value===selectedMiddle)?selectedMiddle:blankValue;
      const effectiveMiddle=middle.value===blankValue?'':middle.value;
      const selectedSmall=effectiveMiddle?(Object.prototype.hasOwnProperty.call(selection,'smallCategoryId')?selection.smallCategoryId:small.value):'';
      const smalls=effectiveMiddle?categoryChildren(effectiveMiddle,{activeOnly}):[];
      small.innerHTML=categorySelectOptions(smalls,selectedSmall,blankValue,config.filter?'すべて':'小カテゴリなし');
      small.disabled=!effectiveMiddle;
      small.value=[...small.options].some(option=>option.value===selectedSmall)?selectedSmall:blankValue;
    }
    function hierarchySelection(ids) {
      const clean=value=>value&&value!=='all'?value:undefined;
      return {
        majorCategoryId:clean(document.getElementById(ids.major)?.value)||'',
        middleCategoryId:clean(document.getElementById(ids.middle)?.value),
        smallCategoryId:clean(document.getElementById(ids.small)?.value)
      };
    }
    const TASK_HIERARCHY_IDS={major:'taskMajorCategory',middle:'taskMiddleCategory',small:'taskSmallCategory'};
    const PROJECT_HIERARCHY_IDS={major:'projectMajorCategory',middle:'projectMiddleCategory',small:'projectSmallCategory'};
    const NOTE_HIERARCHY_IDS={major:'noteMajorCategory',middle:'noteMiddleCategory',small:'noteSmallCategory'};
    const CAPTURE_HIERARCHY_IDS={major:'captureMajorCategory',middle:'captureMiddleCategory',small:'captureSmallCategory'};
    const TASK_FILTER_HIERARCHY_IDS={major:'taskMajorFilter',middle:'taskMiddleFilter',small:'taskSmallFilter'};
    const PROJECT_FILTER_HIERARCHY_IDS={major:'projectMajorFilter',middle:'projectMiddleFilter',small:'projectSmallFilter'};
    function bindHierarchySelects(ids,{filter=false,onChange=null}={}) {
      const major=document.getElementById(ids.major),middle=document.getElementById(ids.middle),small=document.getElementById(ids.small);
      major?.addEventListener('change',()=>{
        populateHierarchySelects(ids,{majorCategoryId:major.value,middleCategoryId:undefined,smallCategoryId:undefined},{activeOnly:true,filter});
        onChange?.('major');
      });
      middle?.addEventListener('change',()=>{
        populateHierarchySelects(ids,{majorCategoryId:major.value,middleCategoryId:middle.value,smallCategoryId:undefined},{activeOnly:true,filter});
        onChange?.('middle');
      });
      small?.addEventListener('change',()=>onChange?.('small'));
    }
    function populatePhaseSelect(id,selected='',includeAll=false,phases=allProjectPhases()) {
      const el=document.getElementById(id);if(!el)return;
      const unique=phases.filter((phase,index,list)=>phase?.id&&list.findIndex(item=>item.id===phase.id)===index);
      el.innerHTML=`<option value="${includeAll?'all':''}">${includeAll?'すべて':'未設定'}</option>${unique.map(phase=>`<option value="${escapeHtml(phase.id)}">${escapeHtml(phase.name)}</option>`).join('')}`;
      el.value=[...el.options].some(option=>option.value===selected)?selected:(includeAll?'all':'');
    }
    function calculatedPriority(urgency='',importance='') {
      return /^[123]$/.test(urgency)&&/^[ABC]$/.test(importance)?`${urgency}${importance}`:'';
    }
    function updateTaskPriorityUI() {
      const importance=document.getElementById('taskImportance')?.value||'';
      const urgency=document.getElementById('taskUrgency')?.value||'';
      const priority=calculatedPriority(urgency,importance);
      const input=document.getElementById('taskPriority');
      const display=document.getElementById('taskPriorityDisplay');
      if(input)input.value=priority;
      if(display){display.textContent=priority||'未選択';display.classList.toggle('has-value',Boolean(priority));}
      return priority;
    }
    function syncRuntimeSettings() {
      categories = settingItems('categories').map(item => item.value);
      priorityLabels = Object.fromEntries(settingItems('priorities').map(item => [item.value,item.label]));
      priorityOrder = Object.fromEntries(settingItems('priorities').map((item,index) => [item.value,index]));
      statusLabels = Object.fromEntries(settingItems('taskStatuses').map(item => [item.value,item.label]));
      projectStatusLabels = Object.fromEntries(settingItems('projectStatuses').map(item => [item.value,item.label]));
    }

    function migratePlannerCategoryState(target) {
      if(typeof DOMAIN.migrateLegacyPlannerState!=='function')return target;
      try{
        const result=DOMAIN.migrateLegacyPlannerState(target);
        const migrated=result?.state||result;
        if(migrated&&typeof migrated==='object')Object.assign(target,migrated);
        (target.projects||[]).forEach(project=>{
          project.visibility=normalizeVisibility(project.visibility||'cast');
          if(project.majorCategoryId==='CAT-PRD'&&['completed','archived'].includes(project.phaseId))project.phaseId='production-completed';
          else if(project.majorCategoryId==='CAT-HR'&&project.middleCategoryId==='CAT-HR-RECRUIT'&&['completed','archived'].includes(project.phaseId))project.phaseId='recruitment-completed';
          else if(!project.phaseId&&project.majorCategoryId==='CAT-PRD')project.phaseId='production-requirements';
          else if(!project.phaseId&&project.majorCategoryId==='CAT-HR'&&project.middleCategoryId==='CAT-HR-RECRUIT')project.phaseId='recruitment-planning';
          else if(!project.phaseId&&project.majorCategoryId==='CAT-PLN'&&project.middleCategoryId==='CAT-PLN-EVENT')project.phaseId='planning';
        });
        (target.notes||[]).forEach(note=>{note.visibility=normalizeVisibility(note.visibility||'cast');});
      }catch(error){console.error('カテゴリ移行エラー',error);}
      return target;
    }

    function defaultAdminConfig(){return {event:{name:'',icon:'',groupLink:'',xLink:'',discord:''},invites:[],links:[
      {id:'drive_operations',label:'運営用Googleドライブ',url:'',roles:['owner','operations']},
      {id:'drive_staff',label:'スタッフ用Googleドライブ',url:'',roles:['owner','operations','staff']},
      {id:'drive_cast',label:'キャスト用Googleドライブ',url:'',roles:['owner','operations','cast']},
      {id:'drive_delivery',label:'納品用Googleドライブ',url:'',roles:['owner','operations','staff','cast','external_collaborator']},
      {id:'drive_new_cast',label:'新規キャスト用Googleドライブ',url:'',roles:['owner','operations','cast']}
    ]};}
    const emptyState = () => ({ version:APP_VERSION, categoryMigrationVersion:0, categoryMaster:defaultCategoryMaster(), projectTemplates:defaultProjectTemplates(), tasks:[], events:[], projects:[], meetings:[], schedulePolls:[], notes:[], futureItems:[], trashItems:[], recoveryArchive:[], yearlyLogs:{}, weeklyLogs:{}, settings:defaultSettings(), preferences:defaultAppPreferences(), menuConfig:defaultMenuConfig(), adminConfig:defaultAdminConfig(), dailyEntries:{}, changeLog:[], globalAdmins:{}, users:{}, permissionEvents:{}, permissionProjects:{}, permissionTasks:{}, auditLogs:{}, deleteRequests:{} });
    let state = loadState();
    syncRuntimeSettings();
    let currentView = APP_SURFACE==='global'?'globalEventList':APP_SURFACE==='owner'?'adminEvent':'home';
    let calendarCursor = new Date();
    calendarCursor.setDate(1);
    let selectedDate = localDateString();
    let yearlyCursor = new Date().getFullYear();
    let weeklyCursor = startOfWeek(new Date());
    let dailyCursor = localDateString();
    let pendingFutureSourceTaskId = '';
    let draggingFutureId = '';
    let suppressCalendarClickUntil = 0;
    let selectedGlobalEventId = '';

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return emptyState();
        const parsed = JSON.parse(raw);
        const next = { ...emptyState(), ...parsed };
        // Staff版では個人の体調・気分・生理などの旧ログを保持しません。
        delete next.logs;
        Object.values(next.dailyEntries||{}).forEach(entry=>{ if(entry&&typeof entry==='object') delete entry.feelingMemo; });
        next.tasks = Array.isArray(next.tasks) ? next.tasks.map(t => ({
          ...t,
          workspaceId:t.workspaceId||'arasaki-shipyard',
          managementType:t.managementType||((t.repeatType&&t.repeatType!=='none')?'recurring':'task'),
          assigneeUid:t.assigneeUid||t.assigneeUids?.[0]||'', assigneeUids:Array.isArray(t.assigneeUids)?t.assigneeUids.filter(Boolean):(t.assigneeUid?[t.assigneeUid]:[]), assignee:t.assignee||'',
          reviewerUid:t.reviewerUid||t.reviewerUids?.[0]||'', reviewerUids:Array.isArray(t.reviewerUids)?t.reviewerUids.filter(Boolean):(t.reviewerUid?[t.reviewerUid]:[]), reviewer:t.reviewer||'',
          createdByUid:t.createdByUid||'', createdBy:t.createdBy||'', updatedAt:t.updatedAt||t.createdAt||'', updatedBy:t.updatedBy||'',
          visibility:normalizeVisibility(t.visibility||t.audience||t.taskAudience||'staff'), audience:normalizeTaskAudience(t.visibility||t.audience||t.taskAudience||'staff'),
          tags:Array.isArray(t.tags)?t.tags.filter(Boolean):[], relatedUrls:Array.isArray(t.relatedUrls)?t.relatedUrls:[],
          status: t.status !== undefined ? t.status : (t.completed ? 'done' : 'todo'),
          completed: t.status ? t.status === 'done' : !!t.completed,
          type: t.type || '', projectId:t.projectId || '', group:t.group || '',
          importance: t.importance || (['A','B','C'].includes(String(t.level||'')) ? String(t.level) : ''),
          urgency: t.urgency || (['1','2','3'].includes(String(t.level||'')) ? String(t.level) : ''), level:'',
          repeatType: t.repeatType || 'none', repeatInterval: Math.max(1, Number(t.repeatInterval)||1),
          repeatWeekdays: Array.isArray(t.repeatWeekdays) ? t.repeatWeekdays.map(Number).filter(n=>n>=0&&n<=6) : [],
          repeatUntil: t.repeatUntil || '', repeatStart: t.repeatStart || t.due || '',
          repeatHistory: Array.isArray(t.repeatHistory) ? [...new Set(t.repeatHistory.filter(Boolean))] : []
        })) : [];
        next.tasks.forEach(task=>{task.priority=calculatedPriority(task.urgency,task.importance);});
        next.events = Array.isArray(next.events) ? next.events.map(ev => ({
          ...ev, workspaceId:ev.workspaceId||'arasaki-shipyard', type:ev.type || 'イベント', category:ev.category || 'PRIVATE', date:ev.date || ev.repeatStart || '', endDate:ev.endDate||'', time:ev.time || '', endTime:ev.endTime||'', backgroundColor:/^#[0-9a-f]{6}$/i.test(ev.backgroundColor||'')?ev.backgroundColor:'',
          allDay:ev.allDay !== false,
          repeatType:ev.repeatType || 'none', repeatInterval:Math.max(1,Number(ev.repeatInterval)||1),
          repeatWeekdays:Array.isArray(ev.repeatWeekdays)?ev.repeatWeekdays.map(Number).filter(n=>n>=0&&n<=6):[],
          repeatUntil:ev.repeatUntil || '', repeatStart:ev.repeatStart || ev.date || ''
        })) : [];
        next.projects = Array.isArray(next.projects) ? next.projects.map(project=>({
          ...project, workspaceId:project.workspaceId||'arasaki-shipyard', managementType:'project',
          visibility:project.visibility,
          phaseId:project.phaseId||(project.status==='completed'?'completed':project.status==='archived'?'archived':''),
          startDate:project.startDate||project.start||'', endDate:project.endDate||project.due||'',
          ownerUid:project.ownerUid||'', memberUids:Array.isArray(project.memberUids)?project.memberUids:[],
          templateValues:project.templateValues&&typeof project.templateValues==='object'?project.templateValues:{},
          deliverables:Array.isArray(project.deliverables)?project.deliverables:[],
          relatedEventIds:Array.isArray(project.relatedEventIds)?project.relatedEventIds:[],
          relatedProjectIds:Array.isArray(project.relatedProjectIds)?project.relatedProjectIds:[]
        })) : [];
        next.meetings = Array.isArray(next.meetings) ? next.meetings : [];
        next.schedulePolls = Array.isArray(next.schedulePolls) ? next.schedulePolls : [];
        next.notes = Array.isArray(next.notes) ? next.notes.map(note=>({
          ...note, workspaceId:note.workspaceId||'arasaki-shipyard',
          managementType:note.managementType||(note.type==='アイデア'?'idea':'record'),
          visibility:note.visibility, decision:note.decision||'pending',
          tags:Array.isArray(note.tags)?note.tags.filter(Boolean):[], relatedUrls:Array.isArray(note.relatedUrls)?note.relatedUrls:[]
        })) : [];
        next.futureItems = Array.isArray(next.futureItems) ? next.futureItems : [];
        next.trashItems = Array.isArray(next.trashItems) ? next.trashItems : [];
        next.recoveryArchive = Array.isArray(next.recoveryArchive) ? next.recoveryArchive : [];
        next.yearlyLogs = next.yearlyLogs && typeof next.yearlyLogs === 'object' ? next.yearlyLogs : {};
        next.weeklyLogs = next.weeklyLogs && typeof next.weeklyLogs === 'object' ? next.weeklyLogs : {};
        next.settings = normalizeSettings(next.settings);
        migrateV48Defaults(next,parsed.version);
        next.categoryMaster=Array.isArray(next.categoryMaster)&&next.categoryMaster.length?next.categoryMaster:defaultCategoryMaster();
        next.projectTemplates=Array.isArray(next.projectTemplates)&&next.projectTemplates.length?next.projectTemplates:defaultProjectTemplates();
        migratePlannerCategoryState(next);
        migrateExistingTaskRecords(next);
        next.preferences = normalizeAppPreferences(next.preferences);
        next.menuConfig = normalizeMenuConfig(next.menuConfig);
        next.adminConfig={...defaultAdminConfig(),...(next.adminConfig||{}),event:{...defaultAdminConfig().event,...(next.adminConfig?.event||{})},invites:Array.isArray(next.adminConfig?.invites)?next.adminConfig.invites:[],links:Array.isArray(next.adminConfig?.links)?next.adminConfig.links:defaultAdminConfig().links};
        next.dailyEntries = next.dailyEntries && typeof next.dailyEntries === 'object' ? next.dailyEntries : {};
        next.changeLog = Array.isArray(next.changeLog) ? next.changeLog.slice(-200) : [];
        ['globalAdmins','users','permissionEvents','permissionProjects','permissionTasks','auditLogs','deleteRequests'].forEach(key=>{
          next[key]=next[key]&&typeof next[key]==='object'&&!Array.isArray(next[key])?next[key]:{};
        });
        next.version = APP_VERSION;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      } catch (error) {
        console.error(error);
        return emptyState();
      }
    }

    function persistStateSilently() {
      state.version = APP_VERSION;
      delete state.logs;
      Object.values(state.dailyEntries||{}).forEach(entry=>{ if(entry&&typeof entry==='object') delete entry.feelingMemo; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (window.currentStaffUser && window.staffCloud?.save) {
        window.staffCloud.save(state).catch(error=>{
          console.error(error);
          window.setCloudSyncStatus?.('error','同期エラー','端末内には保存されています。通信状態を確認してください。');
        });
      }
    }

    function saveState(message='') {
      if (message) {
        state.changeLog = Array.isArray(state.changeLog) ? state.changeLog : [];
        state.changeLog.push({id:uid('change'),message,at:new Date().toISOString(),by:window.currentStaffUser?.name||window.currentStaffUser?.email||'ローカル',actorName:window.currentStaffUser?.name||window.currentStaffUser?.email||'ローカル',actorUid:window.currentStaffUser?.uid||'',actorRole:currentStaffRole()});
        state.changeLog = state.changeLog.slice(-200);
      }
      persistStateSilently();
      renderAll();
      if (message) showToast(message);
    }

    function restoreTaskSnapshot(taskId,snapshot,message='完了を元に戻しました') {
      const index=state.tasks.findIndex(task=>task.id===taskId);if(index<0)return;
      state.tasks[index]=JSON.parse(snapshot);saveState(message);
    }

    function setTaskCompletion(task,checked,occurrenceDate='') {
      const snapshot=JSON.stringify(task);
      let message='';
      if(checked&&hasRepeat(task)){
        const result=completeRecurringTask(task,occurrenceDate||task.due);
        message=result.advanced?`完了を記録し、次回を ${dateLabel(result.next,false)} に移動しました`:'最後の繰り返しを完了しました';
      }else if(!checked&&hasRepeat(task)){
        const completedDate=occurrenceDate||(task.repeatHistory||[]).slice().sort().at(-1)||task.due;
        task.repeatHistory=(task.repeatHistory||[]).filter(date=>date!==completedDate);
        task.due=completedDate;task.status='todo';task.completed=false;
        message='未完了に戻しました';
      }else{
        task.status=checked?'done':'todo';task.completed=checked;
        message=checked?'完了にしました':'未完了に戻しました';
      }
      saveState(message);
      if(checked)showToast(message,()=>restoreTaskSnapshot(task.id,snapshot));
    }

    window.applyRemotePlannerState = function(remoteState) {
      if (!remoteState || typeof remoteState !== 'object') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
      state = loadState();
      syncRuntimeSettings();
      renderAll();
    };

    let remotePatchCommitTimer = null;
    const remoteArraySections = new Set(['tasks','events','projects','meetings','schedulePolls','notes','futureItems','trashItems','recoveryArchive','changeLog']);
    const remoteMapSections = new Set(['yearlyLogs','weeklyLogs','dailyEntries']);
    function scheduleRemotePatchCommit(refreshSettings=false) {
      clearTimeout(remotePatchCommitTimer);
      remotePatchCommitTimer = setTimeout(()=>{
        state.version = APP_VERSION;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        if(refreshSettings) syncRuntimeSettings();
        renderAll();
      },45);
    }
    window.applyRemotePlannerPatch = function(section,key,value) {
      if(!section)return;
      if(remoteArraySections.has(section)){
        const items=Array.isArray(state[section])?state[section]:[];
        const id=key||value?.id;
        if(!id)return;
        const index=items.findIndex(item=>item?.id===id);
        if(value==null){ if(index>=0)items.splice(index,1); }
        else if(index>=0)items[index]=value;
        else items.push(value);
        state[section]=items;
      }else if(remoteMapSections.has(section)){
        state[section]=state[section]&&typeof state[section]==='object'?state[section]:{};
        if(value==null)delete state[section][key];else state[section][key]=value;
      }else if(section==='settings'){
        state.settings=normalizeSettings(value);
      }else if(section==='preferences'){
        state.preferences=normalizeAppPreferences(value);
      }else if(section==='menuConfig'){
        state.menuConfig=normalizeMenuConfig(value);
      }else if(section==='adminConfig'){
        state.adminConfig={...defaultAdminConfig(),...(value||{})};
      }else if(section==='categoryMaster'){
        state.categoryMaster=Array.isArray(value)?value:defaultCategoryMaster();
      }else if(section==='projectTemplates'){
        state.projectTemplates=Array.isArray(value)?value:defaultProjectTemplates();
      }else if(section==='categoryMigrationVersion'){
        state.categoryMigrationVersion=Number(value)||0;
      }else if(section==='version'){
        state.version=Number(value)||APP_VERSION;
      }else return;
      scheduleRemotePatchCommit(section==='settings'||section==='preferences'||section==='menuConfig');
    };
    window.getPlannerState = function() { return JSON.parse(JSON.stringify(state)); };
    window.setCloudSyncStatus = function(kind,text,detail='') {
      const dot=document.getElementById('cloudStatusDot');
      const label=document.getElementById('cloudStatusText');
      const desc=document.getElementById('cloudStatusDetail');
      if(dot){dot.classList.toggle('online',kind==='online');dot.classList.toggle('error',kind==='error');}
      if(label)label.textContent=text;
      if(desc)desc.textContent=detail;
    };
    window.setStaffReadOnly = function(readOnly) { document.body.classList.toggle('staff-readonly',!!readOnly); };
    window.applyRolePageAccess = function() {
      applySurfaceChrome();
      renderNavigation();
      refreshCaptureTaskAudience();
      refreshTaskAudienceSelect();
      if(!pageAllowedForRole(currentView))setView(preferredTaskViewForRole());
      else renderAll();
    };
    window.setStaffCloudUser = function(user) {
      window.currentStaffUser=user||null;
      const chip=document.getElementById('staffUserChip');
      if(chip)chip.hidden=!user;
      const name=document.getElementById('staffUserName');if(name)name.textContent=user?.name||user?.email||'スタッフ';
      const role=document.getElementById('staffUserRole');if(role)role.textContent=user?.roleLabel||user?.role||'キャスト';
      const avatar=document.getElementById('staffUserAvatar');if(avatar)avatar.textContent=(user?.name||user?.email||'⚓').slice(0,1);
      renderScheduleNotifications();
    };

    function applySurfaceChrome() {
      const ownerSurface=APP_SURFACE==='owner';
      const globalSurface=APP_SURFACE==='global';
      const brandTitle=document.querySelector('.brand h1');
      const brandDescription=document.querySelector('.brand p');
      if(brandTitle){
        if(globalSurface)brandTitle.innerHTML='MocchiriPlanner<small>総合管理者ツール</small>';
        else brandTitle.textContent=ownerSurface?'Owner Console':'Staff Planner';
      }
      if(brandDescription)brandDescription.textContent=globalSurface?'全イベント管理ツール':ownerSurface?`${eventWorkspaceName}の管理ツール`:`${eventWorkspaceName}のワークスペース`;
      const surfaceModeSelect=document.getElementById('surfaceModeSelect');
      const ownerSurfaceModeOption=document.getElementById('ownerSurfaceModeOption');
      if(ownerSurfaceModeOption)ownerSurfaceModeOption.textContent=`「${eventWorkspaceName}」管理ページ`;
      if(surfaceModeSelect)surfaceModeSelect.value=globalSurface?'/admin/':ownerSurface?'/owner/':'/app/';
      const templatePanel=document.getElementById('templateSettingsPanel');
      if(templatePanel)templatePanel.hidden=!ownerSurface;
      const switcher=document.getElementById('workspaceSwitcher');if(switcher)switcher.hidden=ownerSurface||globalSurface;
      if(ownerSurface){
        if(activeWorkspace!==eventWorkspaceId)applyActiveWorkspace(eventWorkspaceId);
        const management=document.getElementById('staffManagementPanel'),host=document.getElementById('adminApplicationsHost');
        if(management&&host&&!host.contains(management))host.appendChild(management);
      }
      document.title=globalSurface?'MocchiriPlanner総合管理者ツール':ownerSurface?`Owner Console｜${eventWorkspaceName}`:`Staff Planner｜${eventWorkspaceName}`;
    }

    function uid(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }
    function localDateString(date = new Date()) {
      const y = date.getFullYear();
      const m = String(date.getMonth()+1).padStart(2,'0');
      const d = String(date.getDate()).padStart(2,'0');
      return `${y}-${m}-${d}`;
    }
    function parseLocalDate(value) {
      if (!value) return null;
      const [y,m,d] = value.split('-').map(Number);
      return new Date(y,m-1,d);
    }

    function startOfWeek(date) {
      const d = new Date(date);
      d.setHours(0,0,0,0);
      const offset = (d.getDay()-weekStartDay()+7)%7;
      d.setDate(d.getDate()-offset);
      return d;
    }
    function addDays(date,days) { const d=new Date(date); d.setDate(d.getDate()+days); return d; }
    function weekKey(date=weeklyCursor) { return localDateString(startOfWeek(date)); }
    function monthNumberOptions(selected=1) {
      return Array.from({length:12},(_,i)=>`<option value="${i+1}" ${Number(selected)===i+1?'selected':''}>${i+1}月</option>`).join('');
    }

    function dateLabel(value, withYear=true) {
      const d = parseLocalDate(value);
      if (!d) return '日付なし';
      return new Intl.DateTimeFormat('ja-JP', { year:withYear?'numeric':undefined, month:'long', day:'numeric', weekday:'short' }).format(d);
    }
    function monthLabel(date) { return new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'long'}).format(date); }
    function escapeHtml(value='') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
    function nl2br(value='') { return escapeHtml(value).replace(/\n/g,'<br>'); }
    function isDone(task) {
      if (task && Object.prototype.hasOwnProperty.call(task,'_occurrenceCompleted')) return !!task._occurrenceCompleted;
      return task.status === 'done' || task.completed;
    }
    function hasRepeat(task) { return !!task && !!task.repeatType && task.repeatType !== 'none'; }
    function normalizedRepeatWeekdays(task) {
      const days = Array.isArray(task.repeatWeekdays) ? [...new Set(task.repeatWeekdays.map(Number).filter(n=>n>=0&&n<=6))] : [];
      if (days.length) return days;
      const start=parseLocalDate(task.repeatStart||task.due);
      return start ? [start.getDay()] : [];
    }
    function daysBetween(a,b) {
      const aa=new Date(a.getFullYear(),a.getMonth(),a.getDate());
      const bb=new Date(b.getFullYear(),b.getMonth(),b.getDate());
      return Math.round((bb-aa)/86400000);
    }
    function monthsBetween(a,b) { return (b.getFullYear()-a.getFullYear())*12 + (b.getMonth()-a.getMonth()); }
    function daysInMonth(year,monthIndex) { return new Date(year,monthIndex+1,0).getDate(); }
    function recurrenceMatches(task,dateValue) {
      if (!hasRepeat(task) || !dateValue) return false;
      const start=parseLocalDate(task.repeatStart||task.due), date=parseLocalDate(dateValue);
      if (!start || !date || date < start) return false;
      if (task.repeatUntil && dateValue > task.repeatUntil) return false;
      const interval=Math.max(1,Number(task.repeatInterval)||1);
      if (task.repeatType==='daily') return daysBetween(start,date)%interval===0;
      if (task.repeatType==='weekly') {
        const weekDiff=Math.floor(daysBetween(startOfWeek(start),startOfWeek(date))/7);
        return weekDiff>=0 && weekDiff%interval===0 && normalizedRepeatWeekdays(task).includes(date.getDay());
      }
      if (task.repeatType==='monthly') {
        const diff=monthsBetween(start,date);
        if (diff<0 || diff%interval!==0) return false;
        const targetDay=Math.min(start.getDate(),daysInMonth(date.getFullYear(),date.getMonth()));
        return date.getDate()===targetDay;
      }
      if (task.repeatType==='yearly') {
        const diff=date.getFullYear()-start.getFullYear();
        if (diff<0 || diff%interval!==0 || date.getMonth()!==start.getMonth()) return false;
        const targetDay=Math.min(start.getDate(),daysInMonth(date.getFullYear(),date.getMonth()));
        return date.getDate()===targetDay;
      }
      return false;
    }
    function firstRepeatDateOnOrAfter(task,dateValue) {
      if (!hasRepeat(task) || !dateValue) return dateValue||'';
      let cursor=parseLocalDate(dateValue);
      if (!cursor) return '';
      for (let i=0;i<36650;i++) {
        const ds=localDateString(cursor);
        if (task.repeatUntil && ds>task.repeatUntil) return '';
        if (recurrenceMatches(task,ds)) return ds;
        cursor=addDays(cursor,1);
      }
      return '';
    }
    function nextRepeatDate(task,afterDate) {
      if (!hasRepeat(task)) return '';
      const after=parseLocalDate(afterDate||task.due||localDateString());
      const today=parseLocalDate(localDateString());
      if (!after) return '';
      let cursor=addDays(after>today?after:today,1);
      for (let i=0;i<36650;i++) {
        const ds=localDateString(cursor);
        if (task.repeatUntil && ds>task.repeatUntil) return '';
        if (recurrenceMatches(task,ds) && !(task.repeatHistory||[]).includes(ds)) return ds;
        cursor=addDays(cursor,1);
      }
      return '';
    }
    function repeatSummary(task) {
      if (!hasRepeat(task)) return '';
      const interval=Math.max(1,Number(task.repeatInterval)||1);
      let label='';
      if (task.repeatType==='daily') label=interval===1?'毎日':`${interval}日ごと`;
      if (task.repeatType==='weekly') {
        const days=normalizedRepeatWeekdays(task).sort((a,b)=>((a+6)%7)-((b+6)%7)).map(d=>weekdayShortLabels[d]).join('・');
        label=(interval===1?'毎週':`${interval}週ごと`) + (days?` ${days}`:'');
      }
      if (task.repeatType==='monthly') label=interval===1?'毎月':`${interval}か月ごと`;
      if (task.repeatType==='yearly') label=interval===1?'毎年':`${interval}年ごと`;
      if (task.repeatUntil) label+=`・${dateLabel(task.repeatUntil,false)}まで`;
      return label;
    }
    function tasksForDate(dateValue,includeCompleted=false) {
      const items=[];
      state.tasks.forEach(task=>{
        if(!canCurrentRoleSeeTask(task)||!inActiveWorkspace(task))return;
        if (!hasRepeat(task)) {
          if (task.due===dateValue && (includeCompleted || !isDone(task))) items.push(task);
          return;
        }
        if (!recurrenceMatches(task,dateValue)) return;
        const completed=(task.repeatHistory||[]).includes(dateValue) || (task.due===dateValue && isDone(task));
        if (completed) {
          if (includeCompleted) items.push({...task,due:dateValue,_occurrenceDate:dateValue,_occurrenceCompleted:true,_virtualOccurrence:dateValue!==task.due});
          return;
        }
        if (task.due && dateValue<task.due) return;
        items.push({...task,due:dateValue,status:'todo',completed:false,_occurrenceDate:dateValue,_occurrenceCompleted:false,_virtualOccurrence:dateValue!==task.due});
      });
      return items.sort((a,b)=>(priorityOrder[a.priority]??999)-(priorityOrder[b.priority]??999) || a.title.localeCompare(b.title,'ja'));
    }
    function eventsForDate(dateValue) {
      const items=[];
      visibleEvents().forEach(event=>{
        if (!hasRepeat(event)) {
          if (event.date===dateValue) items.push({...event,_occurrenceDate:dateValue});
          return;
        }
        if (recurrenceMatches(event,dateValue)) items.push({...event,date:dateValue,_occurrenceDate:dateValue,_virtualOccurrence:dateValue!==event.date});
      });
      return items.sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99') || a.title.localeCompare(b.title,'ja'));
    }
    function nextEventOccurrence(event, fromDate=localDateString()) {
      if (!hasRepeat(event)) return event.date>=fromDate ? event.date : '';
      const start=parseLocalDate(fromDate);
      if(!start)return '';
      for(let i=0;i<36650;i++){
        const ds=localDateString(addDays(start,i));
        if(event.repeatUntil && ds>event.repeatUntil)return '';
        if(recurrenceMatches(event,ds))return ds;
      }
      return '';
    }

    function completeRecurringTask(task,occurrenceDate) {
      const completedDate=occurrenceDate||task.due||localDateString();
      task.repeatHistory=[...new Set([...(task.repeatHistory||[]),completedDate])].sort();
      const next=nextRepeatDate(task,completedDate);
      if (next) {
        task.due=next; task.status='todo'; task.completed=false;
        return { advanced:true, next };
      }
      task.status='done'; task.completed=true;
      return { advanced:false, next:'' };
    }
    function isOverdue(task) { return !isDone(task) && task.due && task.due < localDateString(); }
    function projectName(id) { return state.projects.find(p => p.id === id)?.name || ''; }
    function projectOptions(selected='',blankValue='',blankLabel='紐づけなし') {
      const items=visibleProjects();
      const selectedProject=selected&&state.projects.find(project=>project.id===selected);
      if(selectedProject&&!items.some(project=>project.id===selectedProject.id))items.push(selectedProject);
      return `<option value="${blankValue}">${blankLabel}</option>` + items.map(p => `<option value="${p.id}" ${p.id===selected?'selected':''}>${escapeHtml(p.name)}</option>`).join('');
    }

    function navButtonHtml(config, mobile=false, child=false) {
      const def=menuDefinition(config.view); if(!def)return '';
      const active=config.view===currentView?' active':'';
      const pinned=config.pinned?(mobile?' pinned-mobile':''):'';
      const audience=TASK_VIEW_AUDIENCE[def.view];
      return `<button class="nav-button${active}${pinned}${child?' nav-child':''}" data-view="${def.view}" ${['operations','staff','cast'].includes(audience)?`data-task-audience-drop="${audience}"`:''}><span class="nav-icon">${def.icon}</span><span>${escapeHtml(mobile?def.short:def.label)}</span>${!mobile&&config.pinned?'<span class="nav-pin-mark" title="ピン留め中">●</span>':''}</button>`;
    }
    function dataLinkIcon(url=''){
      const value=String(url).toLowerCase();
      if(value.includes('docs.google.com/spreadsheets'))return '▦';
      if(value.includes('drive.google.com'))return '△';
      if(value.includes('docs.google.com/document'))return '▤';
      if(value.includes('docs.google.com/presentation'))return '▥';
      if(value.includes('calendar.google.com'))return '▣';
      if(value.includes('notion.'))return 'N';
      if(value.includes('discord.'))return '◉';
      return '↗';
    }
    function visibleMenuItems() {
      if(APP_SURFACE==='global')return ['globalEventList','globalApplications','globalAudit','globalTrash'].map(view=>menuPage(view));
      if(APP_SURFACE==='owner')return ['adminEvent','adminInvites','adminLinks','adminRoles','permissions','adminAudit','adminApplications','settings'].map(view=>menuPage(view)).filter(item=>pageAllowedForRole(item.view));
      state.menuConfig=normalizeMenuConfig(state.menuConfig);
      return state.menuConfig.filter(item=>item.type==='page'&&pageVisibleInMenu(item)&&pageAllowedForRole(item.view));
    }
    function renderNavigation() {
      if(APP_SURFACE==='owner'||APP_SURFACE==='global'){
        const items=visibleMenuItems();
        const html=`<div class="nav-section-label">${APP_SURFACE==='global'?'全体管理':'管理'}</div><nav class="nav-list">${items.map(item=>navButtonHtml(item)).join('')}</nav>`;
        const sidebar=document.getElementById('sidebarNavContainer');if(sidebar)sidebar.innerHTML=html;
        const mobile=document.getElementById('mobileNav');if(mobile)mobile.innerHTML=items.map(item=>navButtonHtml(item,true)).join('');
        document.querySelector('.menu-settings-shortcut')?.setAttribute('hidden','');
        return;
      }
      state.menuConfig=normalizeMenuConfig(state.menuConfig);
      const pages=state.menuConfig.filter(item=>item.type==='page');
      const pinned=pages.filter(item=>item.pinned&&pageVisibleInMenu(item)&&pageAllowedForRole(item.view));
      const shortcut=document.querySelector('.menu-settings-shortcut');
      const settingsPage=menuPageConfig('settings');
      if(shortcut)shortcut.hidden=pageVisibleInMenu(settingsPage);
      const sidebar=document.getElementById('sidebarNavContainer');
      if(sidebar){
        let html='';
        if(pinned.length)html+=`<div class="nav-section-label">Pinned</div><nav class="nav-list pinned-nav">${pinned.map(item=>navButtonHtml(item)).join('')}</nav>`;
        html+='<div class="nav-section-label">Menu</div><nav class="nav-list">';
        let rendered=0;
        state.menuConfig.forEach(item=>{
          if(item.type==='page'){
            if(item.parentId||item.pinned||!pageVisibleInMenu(item)||!pageAllowedForRole(item.view))return;
            html+=navButtonHtml(item); rendered++; return;
          }
          if(item.visible===false)return;
          const children=state.menuConfig.filter(child=>child.type==='page'&&child.parentId===item.id&&!child.pinned&&child.visible!==false&&pageAllowedForRole(child.view));
          const activeChild=children.some(child=>child.view===currentView);
          html+=`<section class="nav-group" data-nav-group="${escapeHtml(item.id)}"><button class="nav-group-toggle${activeChild?' active-group':''}" data-menu-group-toggle="${escapeHtml(item.id)}" aria-expanded="${item.expanded!==false}"><span class="nav-icon">${escapeHtml(item.icon||'▾')}</span><span>${escapeHtml(item.label)}</span><span class="nav-group-arrow">⌄</span></button><div class="nav-group-children" ${item.expanded===false?'hidden':''}>${children.length?children.map(child=>navButtonHtml(child,false,true)).join(''):'<div class="nav-group-empty">表示中のページはありません</div>'}</div></section>`;
          rendered++;
        });
        const role=currentStaffRole();
        const dataLinks=(state.adminConfig?.links||[]).filter(link=>link.url&&Array.isArray(link.roles)&&link.roles.includes(role));
        if(dataLinks.length)html+=`<section class="nav-group"><button class="nav-group-toggle" data-admin-link-toggle aria-expanded="true"><span class="nav-icon">↗</span><span>リンク</span><span class="nav-group-arrow">⌄</span></button><div class="nav-group-children">${dataLinks.map(link=>`<a class="nav-button nav-child" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"><span class="nav-icon">${dataLinkIcon(link.url)}</span><span>${escapeHtml(link.label)}</span></a>`).join('')}</div></section>`;
        if(!rendered&&!dataLinks.length)html+='<div class="menu-empty-note">表示中のメニューはありません。下の「メニュー・設定」から表示項目を選べます。</div>';
        html+='</nav>'; sidebar.innerHTML=html;
      }
      const mobile=document.getElementById('mobileNav');
      if(mobile){
        const normal=state.menuConfig.filter(item=>item.type==='page'&&!item.pinned&&pageVisibleInMenu(item)&&pageAllowedForRole(item.view)&&item.view!=='settings');
        const ordered=[...pinned.filter(item=>item.view!=='settings'),...normal];
        ordered.push({type:'page',view:'settings',visible:true,pinned:false,parentId:null,_fixed:true});
        mobile.innerHTML=ordered.map(item=>navButtonHtml(item,true)).join('');
        if(!pageVisibleInMenu(settingsPage))mobile.querySelector('[data-view="settings"]:last-child')?.classList.add('mobile-settings-fixed');
      }
      document.querySelectorAll('.nav-button[data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view===currentView));
    }
    function groupOptions(selected='') {
      return `<option value="">カテゴリなし</option>`+state.menuConfig.filter(item=>item.type==='group').map(group=>`<option value="${escapeHtml(group.id)}" ${group.id===selected?'selected':''}>${escapeHtml(group.label)}</option>`).join('');
    }
    function renderMenuSettings() {
      const host=document.getElementById('menuCustomizeList'); if(!host)return;
      state.menuConfig=normalizeMenuConfig(state.menuConfig);
      const targetRole=menuTargetRole();
      const roleField=document.getElementById('menuRoleTargetField');
      const roleSelect=document.getElementById('menuRoleTarget');
      if(roleField)roleField.hidden=activeWorkspace!==eventWorkspaceId;
      if(roleSelect){roleSelect.disabled=!canManageTasks();roleSelect.value=targetRole;}
      host.innerHTML=state.menuConfig.filter(config=>config.type==='group'||pageAllowedForRole(config.view)).map((config,index)=>{
        const key=menuEntryKey(config);
        const visible=menuItemVisibleForRole(config,targetRole);
        if(config.type==='group'){
          const childCount=state.menuConfig.filter(item=>item.type==='page'&&item.parentId===config.id).length;
          return `<div class="menu-customize-row menu-group-row ${visible?'':'is-hidden'}" draggable="true" data-menu-key="${escapeHtml(key)}" data-menu-type="group" data-menu-group="${escapeHtml(config.id)}"><div class="menu-drag-handle" title="カテゴリごと移動">≡</div><div class="menu-item-name"><span class="nav-icon">${escapeHtml(config.icon||'▾')}</span><input class="menu-group-name-input" value="${escapeHtml(config.label)}" aria-label="カテゴリ名" /><span class="menu-group-badge">${childCount}ページ</span></div><label class="menu-toggle-label"><input type="checkbox" class="menu-visible-toggle" ${visible?'checked':''} />表示</label><label class="menu-toggle-label"><input type="checkbox" class="menu-group-expanded-toggle" ${config.expanded!==false?'checked':''} />開く</label><div class="menu-order-buttons"><button class="icon-btn menu-move-up" title="上へ">↑</button><button class="icon-btn menu-move-down" title="下へ">↓</button><button class="icon-btn menu-group-delete" title="カテゴリ削除">⌫</button></div></div>`;
        }
        const def=menuDefinition(config.view);
        return `<div class="menu-customize-row ${config.parentId?'menu-child-row':''} ${visible?'':'is-hidden'} ${config.pinned?'is-pinned':''}" draggable="true" data-menu-key="${escapeHtml(key)}" data-menu-type="page" data-menu-view="${config.view}"><div class="menu-drag-handle" title="ドラッグして並べ替え・カテゴリへ移動">≡</div><div class="menu-item-name"><span class="nav-icon">${def.icon}</span><div class="menu-row-meta"><strong>${escapeHtml(def.label)}</strong><select class="menu-parent-select" aria-label="所属カテゴリ">${groupOptions(config.parentId||'')}</select></div></div><label class="menu-toggle-label"><input type="checkbox" class="menu-visible-toggle" ${visible?'checked':''} />表示</label><label class="menu-toggle-label pin-toggle-wrap"><input type="checkbox" class="menu-pin-toggle" ${config.pinned?'checked':''} />ピン留め</label><div class="menu-order-buttons"><button class="icon-btn menu-move-up" title="上へ">↑</button><button class="icon-btn menu-move-down" title="下へ">↓</button></div></div>`;
      }).join('');
    }
    function commitMenuConfig(message='メニュー設定を保存しました') {
      state.menuConfig=normalizeMenuConfig(state.menuConfig); state.version=APP_VERSION;
      persistStateSilently(); renderNavigation(); renderMenuSettings();
      if(currentView!=='settings'&&!pageVisibleInMenu(menuPageConfig(currentView))){const next=visibleMenuItems()[0]?.view||'settings';setView(next);}
      if(message)showToast(message);
    }
    function menuBlockForKey(key) {
      const entry=state.menuConfig.find(item=>menuEntryKey(item)===key); if(!entry)return [];
      return entry.type==='group'?[entry,...state.menuConfig.filter(item=>item.type==='page'&&item.parentId===entry.id)]:[entry];
    }
    function removeMenuBlock(key) {
      const block=menuBlockForKey(key); const keys=new Set(block.map(menuEntryKey)); state.menuConfig=state.menuConfig.filter(item=>!keys.has(menuEntryKey(item))); return block;
    }
    function insertAfterGroup(groupId,block) {
      let index=state.menuConfig.findIndex(item=>item.type==='group'&&item.id===groupId); if(index<0){state.menuConfig.push(...block);return;}
      index++; while(index<state.menuConfig.length&&state.menuConfig[index].type==='page'&&state.menuConfig[index].parentId===groupId)index++;
      state.menuConfig.splice(index,0,...block);
    }
    function moveMenuEntry(sourceKey,targetKey,after=false) {
      if(!sourceKey||sourceKey===targetKey)return;
      const source=state.menuConfig.find(item=>menuEntryKey(item)===sourceKey); const targetBefore=state.menuConfig.find(item=>menuEntryKey(item)===targetKey); if(!source||!targetBefore)return;
      const block=removeMenuBlock(sourceKey); const moving=block[0]; const target=state.menuConfig.find(item=>menuEntryKey(item)===targetKey); if(!target){state.menuConfig.push(...block);commitMenuConfig('メニューを移動しました');return;}
      if(moving.type==='page'&&target.type==='group'&&!after){moving.parentId=target.id;insertAfterGroup(target.id,block);}
      else {
        if(moving.type==='page')moving.parentId=target.type==='page'?(target.parentId||null):null;
        let effectiveTarget=target;
        if(moving.type==='group'&&target.type==='page'&&target.parentId)effectiveTarget=menuGroup(target.parentId)||target;
        let index;
        if(effectiveTarget.type==='page')index=state.menuConfig.findIndex(item=>menuEntryKey(item)===menuEntryKey(effectiveTarget))+(after?1:0);
        else if(after){index=state.menuConfig.findIndex(item=>menuEntryKey(item)===menuEntryKey(effectiveTarget))+1;while(index<state.menuConfig.length&&state.menuConfig[index].type==='page'&&state.menuConfig[index].parentId===effectiveTarget.id)index++;}
        else index=state.menuConfig.findIndex(item=>menuEntryKey(item)===menuEntryKey(effectiveTarget));
        state.menuConfig.splice(Math.max(0,index),0,...block);
      }
      commitMenuConfig(moving.type==='page'&&moving.parentId?'ページをカテゴリへ移動しました':'メニューを移動しました');
    }
    function moveMenuItem(key,direction) {
      const item=state.menuConfig.find(entry=>menuEntryKey(entry)===key); if(!item)return;
      const siblings=state.menuConfig.filter(entry=>item.type==='page'&&item.parentId?entry.type==='page'&&entry.parentId===item.parentId:(!item.parentId?entry.type==='group'||(entry.type==='page'&&!entry.parentId):entry.type==='group'));
      const index=siblings.findIndex(entry=>menuEntryKey(entry)===key); const target=siblings[index+direction]; if(!target)return;
      moveMenuEntry(key,menuEntryKey(target),direction>0);
    }
    function addMenuGroup(label) {
      const clean=String(label||'').trim(); if(!clean)return;
      const id=`group_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      const group={type:'group',id,label:clean,icon:'▾',visible:true,expanded:true};
      const settingsIndex=state.menuConfig.findIndex(item=>item.type==='page'&&item.view==='settings');
      state.menuConfig.splice(settingsIndex>=0?settingsIndex:state.menuConfig.length,0,group); commitMenuConfig('メニューカテゴリを追加しました');
    }
    function deleteMenuGroup(id) {
      const group=menuGroup(id); if(!group)return;
      state.menuConfig.forEach(item=>{if(item.type==='page'&&item.parentId===id)item.parentId=null;});
      state.menuConfig=state.menuConfig.filter(item=>!(item.type==='group'&&item.id===id)); commitMenuConfig('カテゴリを削除し、ページを最上位へ戻しました');
    }

    function setView(viewName) {
      if(viewName==='tasks')viewName=preferredTaskViewForRole();
      if(!pageAllowedForRole(viewName))viewName=visibleMenuItems()[0]?.view||(APP_SURFACE==='owner'?'settings':'home');
      if(viewName==='calendar')applyActiveWorkspace('all');
      currentView = viewName;
      syncWorkspaceTabsForView();
      const domViewName=Object.prototype.hasOwnProperty.call(TASK_VIEW_AUDIENCE,viewName)?'tasks':viewName;
      document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `${domViewName}View`));
      document.querySelectorAll('.nav-button[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === viewName));
      const [eye,title] = viewInfo[viewName] || viewInfo.home;
      document.getElementById('pageEyebrow').textContent = eye;
      document.getElementById('pageTitle').textContent = title;
      // v0.7: ページを開いた時点で、そのページだけを最新状態へ描画します。
      renderAll();
      window.scrollTo({top:0,behavior:'smooth'});
    }

    function showToast(message, undoAction=null) {
      const toast = document.getElementById('toast');
      toast.innerHTML = `<span>${escapeHtml(message)}</span>${undoAction?'<button class="toast-undo" type="button">元に戻す</button>':''}`;
      if(undoAction) toast.querySelector('.toast-undo')?.addEventListener('click',()=>{
        clearTimeout(showToast.timer);undoAction();toast.classList.remove('show');
      },{once:true});
      toast.classList.add('show');
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    function staffDirectoryName(uidValue,fallback='') {
      const uid=String(uidValue||'');
      return (uid&&window.staffDirectory?.[uid]?.displayName) || fallback || '';
    }
    function taskAssigneeName(task) { return staffDirectoryName(task.assigneeUid,task.assignee); }
    function taskReviewerName(task) { return staffDirectoryName(task.reviewerUid,task.reviewer); }
    function taskCreatorName(task) { return staffDirectoryName(task.createdByUid,task.createdBy); }
    function currentCreatorFields() {
      const user=window.currentStaffUser;
      return {createdByUid:user?.uid||'',createdBy:user?.name||user?.email||''};
    }

    function taskCardHtml(task, compact=false) {
      const overdue = isOverdue(task);
      const pName = projectName(task.projectId);
      const movable=currentView==='tasksAll'&&canManageTasks()&&!task._virtualOccurrence;
      return `<article class="task-card ${isDone(task)?'completed':''} ${overdue?'overdue':''} ${movable?'task-audience-draggable':''}" ${movable?'draggable="true" title="運営・スタッフ・キャストの一覧へドラッグして移動"':''} data-kind="task" data-id="${task.id}" data-occurrence-date="${task._occurrenceDate||task.due||''}">
        <input class="check task-toggle" type="checkbox" ${isDone(task)?'checked':''} ${task._virtualOccurrence?'disabled title="先の繰り返し予定です。完了は直近の回から記録してください"':''} aria-label="完了切替" />
        <div>
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="meta-row">
            <span class="tag category-breadcrumb">${categoryPathHtml(task)}</span>
            <span class="tag">${escapeHtml(MANAGEMENT_TYPE_LABELS[task.managementType]||'タスク')}</span>
            <span class="tag ${task.priority}">優先度 ${escapeHtml(settingLabel('priorities',task.priority,'未選択'))}</span>
            <span class="tag">${escapeHtml(settingLabel('taskStatuses',task.status,(isDone(task)?'完了':'未選択')))}</span>
            ${task.type?`<span class="tag">${escapeHtml(settingLabel('taskTypes',task.type,task.type))}</span>`:''}
            ${taskAssigneeName(task)?`<span class="tag">担当：${escapeHtml(taskAssigneeName(task))}</span>`:''}
            ${taskReviewerName(task)?`<span class="tag">確認：${escapeHtml(taskReviewerName(task))}</span>`:''}
            ${taskCreatorName(task)?`<span class="tag task-creator-tag">作成：${escapeHtml(taskCreatorName(task))}</span>`:''}${taskAudienceOf(task)?`<span class="tag task-audience-tag visibility-${taskAudienceOf(task)}">${escapeHtml(TASK_AUDIENCE_LABELS[taskAudienceOf(task)])}</span>`:''}
            ${task.phaseId?`<span class="tag">${escapeHtml(phaseLabel(task.phaseId))}</span>`:''}
            ${classificationNeeds(task)?'<span class="tag classification-alert">要分類</span>':''}
            ${task.due?`<span class="tag">${overdue?'期限切れ ':''}${escapeHtml(dateLabel(task.due,false))}</span>`:''}
            ${pName?`<span class="tag">◇ ${escapeHtml(pName)}</span>`:''}
            ${task.group?`<span class="tag">Group ${escapeHtml(settingLabel('taskGroups',task.group,task.group))}</span>`:''}
            ${task.importance?`<span class="tag">重要度 ${escapeHtml(settingLabel('importanceLevels',task.importance,task.importance))}</span>`:''}
            ${task.urgency?`<span class="tag">緊急度 ${escapeHtml(settingLabel('urgencyLevels',task.urgency,task.urgency))}</span>`:''}
            ${hasRepeat(task)?`<span class="tag repeat-badge">↻ ${escapeHtml(repeatSummary(task))}</span>`:''}
          </div>
          ${task._virtualOccurrence?`<div class="occurrence-note">この日は繰り返し予定です。完了チェックは直近の実行日から進めます。</div>`:''}
          ${!compact && task.note?`<div class="task-note">${nl2br(task.note)}</div>`:''}
        </div>
        <div class="card-actions">${isDone(task)?'<button class="btn small task-undo-complete" type="button">元に戻す</button>':''}${!task.projectId&&!task._virtualOccurrence?'<button class="btn small task-to-project" type="button">プロジェクトに変更</button>':''}<button class="icon-btn task-edit" title="編集">✎</button><button class="icon-btn task-delete" title="削除">⌫</button></div>
      </article>`;
    }

    function eventCardHtml(event, compact=false) {
      const shownDate=event._occurrenceDate||event.date;
      const dateText=event.endDate&&event.endDate!==event.date?`${dateLabel(shownDate)} 〜 ${dateLabel(event.endDate)}`:dateLabel(shownDate);
      const timeText=event.allDay!==false ? '終日' : ([event.time,event.endTime].filter(Boolean).join(' 〜 ')||'時間未定');
      const own=!event.privateOwnerUid||event.privateOwnerUid===(window.currentStaffUser?.uid||'');
      const hidden=!!event.isPrivate&&!own;
      const title=hidden?'予定あり':event.title;
      const typeClass=`event-type-${Math.abs([...String(event.type||'')].reduce((sum,char)=>sum+char.charCodeAt(0),0))%6}`;
      const color=/^#[0-9a-f]{6}$/i.test(event.backgroundColor||'')?event.backgroundColor:'';
      return `<article class="event-card ${typeClass} ${color?'has-custom-color':''} ${hidden?'private-event':''}" ${color?`style="--event-color:${color}"`:''} data-kind="event" data-id="${event.id}" data-occurrence-date="${shownDate||''}">
        <div class="event-top"><div><div class="event-title">${hidden?'🔒':'☆'} ${escapeHtml(title)}</div><div class="event-date">${escapeHtml(dateText)}・${escapeHtml(timeText)}</div>
        <div class="meta-row"><span class="tag workspace-badge">${escapeHtml(workspaceLabel(event))}</span><span class="tag event-tag">${escapeHtml(settingLabel('eventTypes',event.type,event.type||'イベント'))}</span>${hidden?'':`<span class="tag">${categoryIcons[event.category]||'•'} ${escapeHtml(settingLabel('categories',event.category,event.category||'未分類'))}</span>`}${hasRepeat(event)&&!hidden?`<span class="tag repeat-badge">↻ ${escapeHtml(repeatSummary(event))}</span>`:''}</div></div>
        <div class="card-actions">${own?'<button class="icon-btn event-edit" title="編集">✎</button><button class="icon-btn event-delete" title="削除">⌫</button>':''}</div></div>
        ${!hidden&&!compact&&event.note?`<div class="event-note">${nl2br(event.note)}</div>`:''}
      </article>`;
    }

    function holidayCardHtml(dateValue,name) {
      return `<article class="event-card holiday-card"><div class="event-top"><div><div class="event-title">㊗ ${escapeHtml(name)}</div><div class="event-date">${escapeHtml(dateLabel(dateValue))}</div><div class="meta-row"><span class="tag holiday-tag">日本の祝日</span></div></div></div></article>`;
    }

    function meetingCardHtml(m, compact=false) {
      const pName = projectName(m.projectId);
      const userKey=window.currentStaffUser?.uid||window.currentStaffUser?.email||window.currentStaffUser?.name||'';
      const response=m.responses?.[userKey];
      const responseLabel=response?.status==='yes'?'参加':response?.status==='no'?'不参加':response?.status==='maybe'?'保留':'未回答';
      return `<article class="meeting-card" data-kind="meeting" data-id="${m.id}">
        <div class="meeting-top"><div><div class="meeting-title">${escapeHtml(m.title)}</div><div class="meeting-time">${escapeHtml(dateLabel(m.date))}${m.time?` ${escapeHtml(m.time)}`:''}</div><div class="meta-row"><span class="tag">${categoryIcons[m.category]||'•'} ${escapeHtml(settingLabel('categories',m.category,m.category||''))}</span>${pName?`<span class="tag">◇ ${escapeHtml(pName)}</span>`:''}${m.attendees?`<span class="tag">参加：${escapeHtml(m.attendees)}</span>`:''}</div></div><div class="card-actions"><button class="icon-btn meeting-edit">✎</button><button class="icon-btn meeting-delete">⌫</button></div></div>
        <div class="meeting-rsvp" data-meeting-rsvp="${m.id}"><span class="tag">あなたの回答：${responseLabel}${response?.comment?`・${escapeHtml(response.comment)}`:''}</span><button class="btn small meeting-rsvp-btn" data-rsvp="yes">〇 参加</button><button class="btn small meeting-rsvp-btn" data-rsvp="no">× 不参加</button><button class="btn small meeting-rsvp-btn" data-rsvp="maybe">△ コメント</button></div>
        ${!compact && (m.agenda||m.decisions||m.pending||m.nextActions)?`<div class="meeting-body">
          ${m.agenda?`<div class="meeting-block"><strong>議題</strong><div>${nl2br(m.agenda)}</div></div>`:''}
          ${m.decisions?`<div class="meeting-block"><strong>決定事項</strong><div>${nl2br(m.decisions)}</div></div>`:''}
          ${m.pending?`<div class="meeting-block"><strong>保留・確認</strong><div>${nl2br(m.pending)}</div></div>`:''}
          ${m.nextActions?`<div class="meeting-block"><strong>次の行動</strong><div>${nl2br(m.nextActions)}</div></div>`:''}
        </div>`:''}
      </article>`;
    }

    function projectTaskRowHtml(task) {
      const overdue = isOverdue(task);
      return `<div class="project-task-row ${isDone(task)?'completed':''} ${overdue?'overdue':''}" data-kind="task" data-id="${task.id}" data-occurrence-date="${task.due||''}">
        <input class="check task-toggle" type="checkbox" ${isDone(task)?'checked':''} aria-label="完了切替" />
        <div class="project-task-main">
          <div class="project-task-title">${escapeHtml(task.title)}</div>
          <div class="meta-row">
            <span class="tag ${task.priority}">優先度 ${escapeHtml(settingLabel('priorities',task.priority,priorityLabels[task.priority]||'未選択'))}</span>
            <span class="tag">${escapeHtml(settingLabel('taskStatuses',task.status,statusLabels[task.status] || (isDone(task)?'完了':'未選択')))}</span>
            ${task.type?`<span class="tag">${escapeHtml(settingLabel('taskTypes',task.type,task.type))}</span>`:''}
            ${taskAssigneeName(task)?`<span class="tag">担当：${escapeHtml(taskAssigneeName(task))}</span>`:''}
            ${taskReviewerName(task)?`<span class="tag">確認：${escapeHtml(taskReviewerName(task))}</span>`:''}
            ${taskCreatorName(task)?`<span class="tag task-creator-tag">作成：${escapeHtml(taskCreatorName(task))}</span>`:''}${taskAudienceOf(task)?`<span class="tag task-audience-tag">${escapeHtml(TASK_AUDIENCE_LABELS[taskAudienceOf(task)])}用</span>`:''}
            ${task.due?`<span class="tag">${overdue?'期限切れ ':''}${escapeHtml(dateLabel(task.due,false))}</span>`:''}
            ${task.group?`<span class="tag">Group ${escapeHtml(settingLabel('taskGroups',task.group,task.group))}</span>`:''}
            ${task.importance?`<span class="tag">重要度 ${escapeHtml(settingLabel('importanceLevels',task.importance,task.importance))}</span>`:''}
            ${task.urgency?`<span class="tag">緊急度 ${escapeHtml(settingLabel('urgencyLevels',task.urgency,task.urgency))}</span>`:''}
            ${hasRepeat(task)?`<span class="tag repeat-badge">↻ ${escapeHtml(repeatSummary(task))}</span>`:''}
          </div>
          ${task.note?`<div class="project-task-note">${nl2br(task.note)}</div>`:''}
        </div>
        <div class="card-actions"><button class="icon-btn task-edit" title="タスクを編集">✎</button></div>
      </div>`;
    }

    function calculateProjectCompletion(project,tasks=visibleTasks().filter(task=>task.projectId===project.id)) {
      if(typeof DOMAIN.calculateProjectProgress==='function'){
        try{
          const result=DOMAIN.calculateProjectProgress({projectId:project.id,template:project.templateSnapshot,templateValues:project.templateValues,tasks,qualityChecks:project.qualityChecks||[]});
          if(result&&Number.isFinite(result.percent))return {rate:Math.round(result.percent),completed:Number(result.completed)||0,total:Number(result.total)||0};
        }catch(error){console.error('進捗率計算エラー',error);}
      }
      const sections=project.templateSnapshot?.sections||[];
      const fields=sections.flatMap(section=>section.fields||[]).filter(field=>field.completionEnabled!==false);
      const values=project.templateValues||{};
      const taskTargets=tasks.filter(task=>!['archived','cancelled'].includes(task.status));
      const qualityTargets=(project.qualityChecks||[]).filter(check=>check.required!==false&&check.result!=='notApplicable');
      const completedFields=fields.filter(field=>values[field.id]?.completed).length;
      const completedTasks=taskTargets.filter(isDone).length;
      const completedQuality=qualityTargets.filter(check=>check.result==='passed').length;
      const total=fields.length+taskTargets.length+qualityTargets.length;
      const completed=completedFields+completedTasks+completedQuality;
      return {rate:total?Math.round(completed/total*100):0,completed,total};
    }

    function projectCardHtml(p) {
      const tasks = visibleTasks().filter(t => t.projectId === p.id).sort((a,b) =>
        Number(isDone(a))-Number(isDone(b)) ||
        (a.due||'9999-12-31').localeCompare(b.due||'9999-12-31') ||
        (priorityOrder[a.priority]??999)-(priorityOrder[b.priority]??999)
      );
      const done = tasks.filter(isDone).length;
      const open = tasks.length-done;
      const progress=calculateProjectCompletion(p,tasks);
      const rate=progress.rate;
      return `<article class="project-card" data-kind="project" data-id="${p.id}">
        <div class="project-head"><div><div class="project-title">${escapeHtml(p.name)}</div><div class="meta-row"><span class="tag category-breadcrumb">${categoryPathHtml(p)}</span><span class="tag">${escapeHtml(phaseLabel(p.phaseId))}</span><span class="tag visibility-${normalizeVisibility(p.visibility)}">${escapeHtml(VISIBILITY_LABELS[normalizeVisibility(p.visibility)])}</span>${p.templateId?`<span class="tag">${escapeHtml(projectTemplate(p.templateId)?.name||p.templateId)} v${p.templateVersion||1}</span>`:''}${classificationNeeds(p)?'<span class="tag classification-alert">要分類</span>':''}${(p.endDate||p.due)?`<span class="tag">期限 ${escapeHtml(dateLabel(p.endDate||p.due,false))}</span>`:''}</div></div><div class="card-actions"><button class="btn small project-detail-open" type="button">詳細</button><button class="icon-btn project-task-add" title="タスク追加">＋</button><button class="icon-btn project-edit">✎</button><button class="icon-btn project-delete">⌫</button></div></div>
        ${p.purpose?`<div class="project-purpose">${nl2br(p.purpose)}</div>`:''}
        <div class="progress"><div style="width:${rate}%"></div></div>
        <div class="project-stats"><div class="mini-stat"><strong>${rate}%</strong><span>進捗（${progress.completed}/${progress.total}）</span></div><div class="mini-stat"><strong>${open}</strong><span>未完了</span></div><div class="mini-stat"><strong>${done}</strong><span>完了</span></div></div>
        ${p.note?`<div class="task-note">${nl2br(p.note)}</div>`:''}
        <div class="project-task-section">
          <div class="project-task-section-head"><strong>関連タスク</strong><span>全${tasks.length}件・未完了${open}件・完了${done}件</span></div>
          ${tasks.length?`<div class="project-task-list">${tasks.map(projectTaskRowHtml).join('')}</div>`:'<div class="project-task-empty">このプロジェクトに紐づいたタスクはまだありません。右上の「＋」から追加できます。</div>'}
        </div>
      </article>`;
    }

    function noteCardHtml(n) {
      const pName = projectName(n.projectId);
      const idea=n.managementType==='idea';
      return `<article class="note-card" data-kind="note" data-id="${n.id}"><div class="log-head"><div><div class="note-title">${escapeHtml(n.title)}</div><div class="meta-row"><span class="tag">${escapeHtml(MANAGEMENT_TYPE_LABELS[n.managementType]||settingLabel('noteTypes',n.type,n.type))}</span><span class="tag category-breadcrumb">${categoryPathHtml(n)}</span><span class="tag visibility-${normalizeVisibility(n.visibility)}">${escapeHtml(VISIBILITY_LABELS[normalizeVisibility(n.visibility)])}</span>${idea?`<span class="tag">${escapeHtml(IDEA_DECISION_LABELS[n.decision]||'未整理')}</span>`:''}${classificationNeeds(n)?'<span class="tag classification-alert">要分類</span>':''}${pName?`<span class="tag">◇ ${escapeHtml(pName)}</span>`:''}${n.date?`<span class="tag">${escapeHtml(dateLabel(n.date,false))}</span>`:''}</div></div><div class="card-actions">${idea?'<button class="btn small note-to-project" type="button">プロジェクト化</button>':''}<button class="btn small note-to-task" type="button">${idea?'タスク化':'タスクにする'}</button><button class="icon-btn note-edit">✎</button><button class="icon-btn note-delete">⌫</button></div></div>${n.content?`<div class="note-content">${nl2br(n.content)}</div>`:''}</article>`;
    }

    function renderHome() {
      const today = localDateString();
      const currentUid=window.currentStaffUser?.uid||'';
      const relevantTasks=visibleTasks().filter(task=>itemWorkspace(task)==='personal'||!task.assigneeUid||task.assigneeUid===currentUid);
      const open = relevantTasks.filter(t => !isDone(t));
      document.getElementById('openTaskStat').textContent = open.length;
      document.getElementById('todayTaskStat').textContent = open.filter(t => t.due === today).length;
      document.getElementById('overdueTaskStat').textContent = open.filter(isOverdue).length;
      document.getElementById('activeProjectStat').textContent = visibleProjects().filter(p => !['completed','archived'].includes(p.phaseId)&&!['completed','archived'].includes(p.status)).length;

      const entry = state.dailyEntries[today] || {};
      document.getElementById('todayGoal').value = entry.goal || '';
      document.getElementById('goodThings').value = entry.goodThings || '';

      const summaryCategories=activeWorkspace==='personal'
        ? personalTaskCategories().map(item=>({id:item.value,name:item.label,legacy:true}))
        : majorCategories({activeOnly:true}).filter(item=>!item.system);
      const personalSummary=activeWorkspace==='personal';
      const summaryTasks=personalSummary?relevantTasks:visibleTasks().filter(task=>itemWorkspace(task)!=='personal');
      document.getElementById('homeCategorySummaryTitle').textContent=personalSummary?'個人カテゴリごとのタスク':'担当領域ごとの進捗';
      document.getElementById('homeCategorySummarySub').textContent=personalSummary?'個人用タスクをカテゴリ別に表示':'担当領域ごとの完了率と残件数';
      document.getElementById('categorySummary').innerHTML = summaryCategories.map(cat => {
        const all = summaryTasks.filter(t => cat.legacy?t.category===cat.id:t.majorCategoryId===cat.id);
        const completed = all.filter(isDone).length;
        const remaining = all.length-completed;
        const rate = all.length ? Math.round(completed/all.length*100) : 0;
        if(personalSummary)return `<div class="category-card"><div class="category-card-head"><strong>${escapeHtml(cat.icon||categoryIcons[cat.id]||'•')} ${escapeHtml(cat.name)}</strong><span class="remaining">${all.length}</span></div><div class="mini-meta">未完了 ${remaining}件・完了 ${completed}件</div></div>`;
        return `<div class="category-card"><div class="category-card-head"><strong>${escapeHtml(cat.icon||categoryIcons[cat.id]||'•')} ${escapeHtml(cat.name)}</strong><span class="remaining">${remaining}</span></div><div class="progress"><div style="width:${rate}%"></div></div><div class="mini-meta">完了 ${completed}件・進捗 ${rate}%</div></div>`;
      }).join('');

      const counts = {high:0,medium:0,low:0};
      open.forEach(t => counts[t.priority] = (counts[t.priority]||0)+1);
      const max = Math.max(1,...Object.values(counts));
      document.getElementById('priorityChart').innerHTML = settingItems('priorities').map(({value,label}) => `<div class="bar-line"><span>優先度 ${escapeHtml(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${(counts[value]||0)/max*100}%"></div></div><strong>${counts[value]||0}</strong></div>`).join('');
      const priorityDetails=document.getElementById('homePriorityDetails');
      const eventManager=activeWorkspace===eventWorkspaceId&&canManageTasks();
      priorityDetails.open=eventManager;
      priorityDetails.querySelector('.details-toggle-label').textContent=eventManager?'イベント管理者向け表示':'詳細を表示';

      const upcoming = open.slice().sort((a,b) => (a.due||'9999-12-31').localeCompare(b.due||'9999-12-31') || (priorityOrder[a.priority]??999)-(priorityOrder[b.priority]??999)).slice(0,6);
      document.getElementById('upcomingTasks').innerHTML = upcoming.length ? upcoming.map(t => taskCardHtml(t,true)).join('') : '<div class="empty">近日のタスクはありません。</div>';

      const nowKey = `${today}T00:00`;
      const meetings = state.meetings.filter(m => `${m.date}T${m.time||'00:00'}` >= nowKey).sort((a,b) => `${a.date}T${a.time||'00:00'}`.localeCompare(`${b.date}T${b.time||'00:00'}`)).slice(0,3);
      document.getElementById('nextMeetings').innerHTML = meetings.length ? meetings.map(m => meetingCardHtml(m,true)).join('') : '<div class="empty">今後のミーティングはありません。</div>';

      const upcomingEvents=visibleEvents().map(event=>({event,date:nextEventOccurrence(event,today)})).filter(item=>item.date).sort((a,b)=>`${a.date}T${a.event.time||'99:99'}`.localeCompare(`${b.date}T${b.event.time||'99:99'}`)).slice(0,4).map(item=>({...item.event,date:item.date,_occurrenceDate:item.date}));
      document.getElementById('upcomingEvents').innerHTML=upcomingEvents.length?upcomingEvents.map(event=>eventCardHtml(event,true)).join(''):'<div class="empty">今後のイベントはありません。</div>';
    }

    function getFilteredTasks() {
      const q = document.getElementById('taskSearch').value.trim().toLowerCase();
      const category = document.getElementById('categoryFilter').value;
      const status = document.getElementById('statusFilter').value;
      const priority = document.getElementById('priorityFilter').value;
      const type = document.getElementById('typeFilter').value;
      const importance = document.getElementById('importanceFilter').value;
      const urgency = document.getElementById('urgencyFilter').value;
      const sort = document.getElementById('sortFilter').value;
      const major=document.getElementById('taskMajorFilter')?.value||'all';
      const middle=document.getElementById('taskMiddleFilter')?.value||'all';
      const small=document.getElementById('taskSmallFilter')?.value||'all';
      const management=document.getElementById('taskManagementFilter')?.value||'all';
      const project=document.getElementById('taskProjectFilter')?.value||'all';
      const phase=document.getElementById('taskPhaseFilter')?.value||'all';
      const assignee=document.getElementById('taskAssigneeFilter')?.value||'all';
      const reviewer=document.getElementById('taskReviewerFilter')?.value||'all';
      const visibility=document.getElementById('taskVisibilityFilter')?.value||'all';
      const tag=(document.getElementById('taskTagFilter')?.value||'').trim().toLowerCase();
      const dueFilter=document.getElementById('taskDueFilter')?.value||'all';
      const template=document.getElementById('taskTemplateFilter')?.value||'all';
      const classification=document.getElementById('taskClassificationFilter')?.value||'all';
      const today = localDateString();
      const weekEnd=localDateString(addDays(parseLocalDate(today),7));
      const board=currentTaskViewAudience();
      const items = visibleTasks().filter(t => {
        const text = `${t.title} ${t.note||''} ${projectName(t.projectId)} ${categoryPathText(t)} ${(t.tags||[]).join(' ')}`.toLowerCase();
        let statusMatch = true;
        if (status === 'open') statusMatch = !isDone(t);
        else if (status === 'done') statusMatch = isDone(t);
        else if (status === 'today') statusMatch = !isDone(t) && t.due === today;
        else if (status === 'overdue') statusMatch = isOverdue(t);
        else if (status !== 'all') statusMatch = t.status === status;
        const importanceMatch=importance==='all'||(importance==='unset'?!t.importance:t.importance===importance);
        const urgencyMatch=urgency==='all'||(urgency==='unset'?!t.urgency:t.urgency===urgency);
        const userUid=window.currentStaffUser?.uid||'';
        const userName=window.currentStaffUser?.name||'';
        const assignedToCurrentUser=t.assigneeUid===userUid||(t.assigneeUids||[]).includes(userUid)||(!t.assigneeUid&&userName&&t.assignee===userName);
        const boardMatch=board==='all'||(board==='assigned'?assignedToCurrentUser:taskAudienceOf(t)===board);
        const dueMatch=dueFilter==='all'||(dueFilter==='today'&&t.due===today)||(dueFilter==='week'&&t.due>=today&&t.due<=weekEnd)||(dueFilter==='overdue'&&isOverdue(t))||(dueFilter==='none'&&!t.due);
        const linkedProject=t.projectId&&state.projects.find(item=>item.id===t.projectId);
        return boardMatch && (!q || text.includes(q)) &&
          (category==='all'||t.category===category) &&
          (major==='all'||t.majorCategoryId===major) && (middle==='all'||t.middleCategoryId===middle) && (small==='all'||t.smallCategoryId===small) &&
          (management==='all'||t.managementType===management) && (project==='all'||t.projectId===project) && (phase==='all'||t.phaseId===phase) &&
          (assignee==='all'||t.assigneeUid===assignee||(t.assigneeUids||[]).includes(assignee)) &&
          (reviewer==='all'||t.reviewerUid===reviewer||(t.reviewerUids||[]).includes(reviewer)) &&
          (visibility==='all'||taskAudienceOf(t)===visibility) && (!tag||(t.tags||[]).some(value=>String(value).toLowerCase().includes(tag))) &&
          (template==='all'||linkedProject?.templateId===template) &&
          (classification==='all'||(classification==='needs'?classificationNeeds(t):!classificationNeeds(t))) &&
          dueMatch && (priority==='all'||t.priority===priority) && (type==='all'||t.type===type) && importanceMatch && urgencyMatch && statusMatch;
      });
      items.sort((a,b) => {
        const importanceRank={A:0,B:1,C:2}; const urgencyRank={'1':0,'2':1,'3':2};
        if (sort==='matrix') return (importanceRank[a.importance]??9)-(importanceRank[b.importance]??9) || (urgencyRank[a.urgency]??9)-(urgencyRank[b.urgency]??9) || (a.due||'9999-12-31').localeCompare(b.due||'9999-12-31');
        if (sort==='importance') return (importanceRank[a.importance]??9)-(importanceRank[b.importance]??9) || (urgencyRank[a.urgency]??9)-(urgencyRank[b.urgency]??9);
        if (sort==='urgency') return (urgencyRank[a.urgency]??9)-(urgencyRank[b.urgency]??9) || (importanceRank[a.importance]??9)-(importanceRank[b.importance]??9);
        if (sort==='created') return (b.createdAt||'').localeCompare(a.createdAt||'');
        if (sort==='group') {
          const order=new Map(settingItems('taskGroups').map((item,index)=>[item.value,index]));
          return (order.get(a.group)??999)-(order.get(b.group)??999) || (a.due||'9999-12-31').localeCompare(b.due||'9999-12-31');
        }
        if (sort==='priority') return (priorityOrder[a.priority]??999)-(priorityOrder[b.priority]??999) || (a.due||'9999-12-31').localeCompare(b.due||'9999-12-31');
        if (sort==='category') return categories.indexOf(a.category)-categories.indexOf(b.category) || (a.due||'9999-12-31').localeCompare(b.due||'9999-12-31');
        return Number(isDone(a))-Number(isDone(b)) || (a.due||'9999-12-31').localeCompare(b.due||'9999-12-31');
      });
      if(document.getElementById('sortDirectionFilter')?.value==='reverse')items.reverse();
      return items;
    }

    function matrixTaskHtml(task, inMatrix=false) {
      const pName=projectName(task.projectId);
      const categoryHtml=itemWorkspace(task)==='personal'
        ? `${categoryIcons[task.category]||'•'} ${escapeHtml(settingLabel('categories',task.category,task.category||'未分類'))}`
        : categoryPathHtml(task);
      return `<article class="matrix-task-card ${isDone(task)?'completed':''}" draggable="true" data-kind="task" data-id="${task.id}" data-triage-task="${task.id}">
        <div class="matrix-task-title">${escapeHtml(task.title)}</div>
        <div class="matrix-task-meta">
          <span class="tag category-breadcrumb">${categoryHtml}</span>
          ${task.due?`<span class="tag">${isOverdue(task)?'期限切れ ':''}${escapeHtml(dateLabel(task.due,false))}</span>`:''}
          ${pName?`<span class="tag">◇ ${escapeHtml(pName)}</span>`:''}
          ${task.importance?`<span class="tag">重要 ${escapeHtml(settingLabel('importanceLevels',task.importance,task.importance))}</span>`:''}
          ${task.urgency?`<span class="tag">緊急 ${escapeHtml(settingLabel('urgencyLevels',task.urgency,task.urgency))}</span>`:''}<span class="tag task-audience-tag">${escapeHtml(TASK_AUDIENCE_LABELS[taskAudienceOf(task)])}用</span>
        </div>
        <div class="matrix-task-actions"><button class="icon-btn task-edit" title="編集">✎</button>${inMatrix?'<button class="icon-btn matrix-unassign" title="未仕分けへ戻す">↩</button>':''}</div>
      </article>`;
    }

    function triageCellHint(importance,urgency) {
      const hints={A3:'やりたいこと',A1:'やらなければならないこと',C3:'やらなくてもいいこと',C1:'やったほうがいいこと'};
      return hints[`${importance}${urgency}`]||'';
    }

    function renderTaskTriage() {
      const grid=document.getElementById('triageGrid'); if(!grid)return;
      const q=(document.getElementById('triageSearch')?.value||'').trim().toLowerCase();
      const category=document.getElementById('triageCategoryFilter')?.value||'all';
      const status=document.getElementById('triageStatusFilter')?.value||'open';
      const source=visibleTasks().filter(task=>{
        const text=`${task.title} ${task.note||''} ${projectName(task.projectId)}`.toLowerCase();
        const categoryMatch=category==='all'||(category.startsWith('legacy:')&&task.category===category.slice(7))||(category.startsWith('major:')&&task.majorCategoryId===category.slice(6));
        return (!q||text.includes(q))&&categoryMatch&&(status==='all'||!isDone(task));
      });
      const importanceValues=['A','B','C'];
      const urgencyValues=['3','2','1'];
      document.getElementById('triageColumnHeads').innerHTML=urgencyValues.map(value=>`<div class="triage-column-head"><strong>${escapeHtml(settingLabel('urgencyLevels',value,value))}</strong>${value==='1'?'高い':value==='2'?'中':'低い'}緊急度</div>`).join('');
      document.getElementById('triageRowHeads').innerHTML=importanceValues.map(value=>`<div class="triage-row-head"><div><strong>${escapeHtml(settingLabel('importanceLevels',value,value))}</strong>${value==='A'?'高い':value==='B'?'中':'低い'}<br>重要度</div></div>`).join('');
      grid.innerHTML=importanceValues.flatMap(importance=>urgencyValues.map(urgency=>{
        const tasks=source.filter(task=>task.importance===importance&&task.urgency===urgency).sort((a,b)=>(a.due||'9999-12-31').localeCompare(b.due||'9999-12-31'));
        return `<section class="triage-cell" data-triage-importance="${importance}" data-triage-urgency="${urgency}"><div class="triage-cell-head"><strong>${escapeHtml(settingLabel('importanceLevels',importance,importance))} × ${escapeHtml(settingLabel('urgencyLevels',urgency,urgency))}</strong><span>${tasks.length}件</span></div><div class="matrix-corner-label">${escapeHtml(triageCellHint(importance,urgency))}</div><div class="triage-cell-list">${tasks.length?tasks.map(task=>matrixTaskHtml(task,true)).join(''):'<div class="triage-empty-cell">ここへドロップ</div>'}</div></section>`;
      })).join('');
      const unassigned=source.filter(task=>!task.importance||!task.urgency).sort((a,b)=>(a.due||'9999-12-31').localeCompare(b.due||'9999-12-31'));
      document.getElementById('triageInboxCount').textContent=`${unassigned.length}件 / 対象${source.length}件`;
      document.getElementById('triageUnassignedList').innerHTML=unassigned.length?unassigned.map(task=>matrixTaskHtml(task,false)).join(''):'<div class="empty">未仕分けタスクはありません。</div>';
      renderTaskWorkflow();
    }

    function workflowDeadlineCardHtml(task) {
      const pName=projectName(task.projectId);
      const categoryHtml=itemWorkspace(task)==='personal'
        ? `${categoryIcons[task.category]||'•'} ${escapeHtml(settingLabel('categories',task.category,task.category||'未分類'))}`
        : categoryPathHtml(task);
      return `<article class="workflow-deadline-card" data-workflow-task="${task.id}"><div><div class="workflow-deadline-title">${escapeHtml(task.title)}</div><div class="meta-row"><span class="tag category-breadcrumb">${categoryHtml}</span><span class="tag">重要 ${escapeHtml(settingLabel('importanceLevels',task.importance,task.importance))}</span><span class="tag">緊急 ${escapeHtml(settingLabel('urgencyLevels',task.urgency,task.urgency))}</span>${pName?`<span class="tag">◇ ${escapeHtml(pName)}</span>`:''}</div>${task.note?`<div class="task-note">${nl2br(task.note)}</div>`:''}</div><div class="workflow-deadline-actions"><div class="field"><label>期限</label><input class="workflow-due-input" type="date" /></div><button class="btn small primary workflow-save-due" type="button">期限を保存</button><button class="btn small workflow-future-btn workflow-move-future" type="button">Future Logへ</button></div></article>`;
    }
    function workflowAssigneeCardHtml(task) {
      return `<article class="workflow-deadline-card" data-workflow-task="${task.id}"><div><div class="workflow-deadline-title">${escapeHtml(task.title)}</div><div class="meta-row"><span class="tag">${escapeHtml(dateLabel(task.due,false))}</span><span class="tag">重要 ${escapeHtml(settingLabel('importanceLevels',task.importance,task.importance))}</span><span class="tag">緊急 ${escapeHtml(settingLabel('urgencyLevels',task.urgency,task.urgency))}</span></div></div><div class="workflow-deadline-actions"><div class="field"><label>担当者</label><select class="workflow-assignee-select"><option value="">未設定</option></select></div><button class="btn small primary workflow-save-assignee" type="button">担当者を保存</button></div></article>`;
    }

    function renderTaskWorkflow() {
      const openTasks=visibleTasks().filter(task=>!isDone(task));
      const unassigned=openTasks.filter(task=>!task.importance||!task.urgency);
      const sorted=openTasks.filter(task=>task.importance&&task.urgency);
      const awaitingDue=sorted.filter(task=>!task.due).sort((a,b)=>{const ir={A:0,B:1,C:2},ur={'1':0,'2':1,'3':2};return (ir[a.importance]??9)-(ir[b.importance]??9)||(ur[a.urgency]??9)-(ur[b.urgency]??9)||(a.createdAt||'').localeCompare(b.createdAt||'');});
      const awaitingAssignee=sorted.filter(task=>task.due&&!task.assigneeUid&&!task.assignee);
      const setText=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value);};
      setText('workflowCaptureCount',unassigned.length);
      setText('workflowTriageCount',sorted.length);
      setText('workflowDeadlineCount',awaitingDue.length);
      setText('workflowAssigneeCount',awaitingAssignee.length);
      setText('workflowDeadlineSummary',`${awaitingDue.length}件`);
      setText('workflowAssigneeSummary',`${awaitingAssignee.length}件`);
      const status=document.getElementById('workflowStatusLine');
      if(status) status.innerHTML=`<span class="tag">洗い出し・未仕分け ${unassigned.length}件</span><span class="tag">仕分け済み ${sorted.length}件</span><span class="tag">期限待ち ${awaitingDue.length}件</span><span class="tag">Future Log ${state.futureItems.length}件</span>`;
      const list=document.getElementById('workflowDeadlineList');
      if(list) list.innerHTML=awaitingDue.length?awaitingDue.map(workflowDeadlineCardHtml).join(''):'<div class="workflow-complete-box"><strong>期限待ちのタスクはありません。</strong><br>仕分けが終わったタスクへ期限を付けると、通常のタスク一覧・カレンダー・Weekly Logへ反映されます。</div>';
      const assigneeList=document.getElementById('workflowAssigneeList');
      if(assigneeList){
        assigneeList.innerHTML=awaitingAssignee.length?awaitingAssignee.map(workflowAssigneeCardHtml).join(''):'<div class="workflow-complete-box"><strong>担当者待ちのタスクはありません。</strong></div>';
        const source=document.getElementById('taskAssignee');
        assigneeList.querySelectorAll('.workflow-assignee-select').forEach(select=>{if(source)select.innerHTML=source.innerHTML;});
      }
      refreshProjectSelects();
    }

    function assignTaskTriage(taskId,importance='',urgency='') {
      const task=state.tasks.find(item=>item.id===taskId); if(!task||!canCurrentRoleSeeTask(task))return;
      task.importance=importance; task.urgency=urgency; task.priority=calculatedPriority(urgency,importance);
      saveState(importance&&urgency?`重要度 ${settingLabel('importanceLevels',importance,importance)}・緊急度 ${settingLabel('urgencyLevels',urgency,urgency)} に仕分けました`:'未仕分けへ戻しました');
    }

    function renderTasks() {
      const board=currentTaskViewAudience();
      const userUid=window.currentStaffUser?.uid||'',userName=window.currentStaffUser?.name||'';
      const isAssigned=task=>task.assigneeUid===userUid||(task.assigneeUids||[]).includes(userUid)||(!task.assigneeUid&&userName&&task.assignee===userName);
      const title=board==='assigned'?'個別タスク（自分の担当）':board==='all'?'全タスク一覧':`${TASK_AUDIENCE_LABELS[board]}用タスク一覧`;
      const accessible=visibleTasks().filter(task=>board==='all'||(board==='assigned'?isAssigned(task):taskAudienceOf(task)===board));
      const items = getFilteredTasks();
      document.getElementById('newTaskBtn2').hidden=board==='assigned'||!canManageTasks();
      const heading=document.getElementById('taskListHeading');if(heading)heading.textContent=title;
      const note=document.getElementById('taskListAccessNote');if(note)note.textContent=canManageTasks()
        ? (board==='all'?'カードを運営・スタッフ・キャストの一覧へドラッグして表示先を変更できます。':board==='assigned'?'自分に割り当てられたタスクだけを表示しています。':`${TASK_AUDIENCE_LABELS[board]}用として登録されたタスクだけを表示しています。`)
        : 'タスクの追加はオーナー・運営のみ可能です。意見やアイデアは「アイデア・ノート」へ記載してください。';
      document.getElementById('taskCountText').textContent = `${items.length}件表示中 / この一覧 全${accessible.length}件`;
      document.getElementById('taskList').innerHTML = items.length ? items.map(t => taskCardHtml(t)).join('') : '<div class="empty">条件に合うタスクはありません。</div>';
      refreshTaskAudienceSelect(board==='all'||board==='assigned'?'':board);
    }

    function renderProjects() {
      const q = document.getElementById('projectSearch').value.trim().toLowerCase();
      const category = document.getElementById('projectCategoryFilter').value;
      const status = document.getElementById('projectStatusFilter').value;
      const major=document.getElementById('projectMajorFilter')?.value||'all';
      const middle=document.getElementById('projectMiddleFilter')?.value||'all';
      const small=document.getElementById('projectSmallFilter')?.value||'all';
      const phase=document.getElementById('projectPhaseFilter')?.value||'all';
      const template=document.getElementById('projectTemplateFilter')?.value||'all';
      const visibility=document.getElementById('projectVisibilityFilter')?.value||'all';
      const classification=document.getElementById('projectClassificationFilter')?.value||'all';
      const items = visibleProjects().filter(p =>
        (!q || `${p.name} ${p.purpose||''} ${p.note||''} ${p.completionCriteria||''} ${categoryPathText(p)}`.toLowerCase().includes(q)) &&
        (category==='all'||p.category===category) && (status==='all'||p.status===status) &&
        (major==='all'||p.majorCategoryId===major) && (middle==='all'||p.middleCategoryId===middle) && (small==='all'||p.smallCategoryId===small) &&
        (phase==='all'||p.phaseId===phase) && (template==='all'||p.templateId===template) &&
        (visibility==='all'||normalizeVisibility(p.visibility)===visibility) &&
        (classification==='all'||(classification==='needs'?classificationNeeds(p):!classificationNeeds(p)))
      ).sort((a,b)=>(a.endDate||a.due||'9999-12-31').localeCompare(b.endDate||b.due||'9999-12-31'));
      document.getElementById('projectList').innerHTML = items.length ? items.map(projectCardHtml).join('') : '<div class="empty wide">プロジェクトがありません。大きな作業をまとめたいときに作成してみましょう。</div>';
      refreshProjectSelects();
    }

    function renderEvents() {
      const q=document.getElementById('eventSearch').value.trim().toLowerCase();
      const category=document.getElementById('eventCategoryFilter').value;
      const type=document.getElementById('eventTypeFilter').value;
      const tf=document.getElementById('eventTimeFilter').value;
      const today=localDateString();
      const items=visibleEvents().map(event=>{
        const next=nextEventOccurrence(event,today);
        return {...event,_nextDate:next};
      }).filter(event=>{
        const text=`${event.title} ${event.note||''}`.toLowerCase();
        const timeMatch=tf==='all'||(tf==='upcoming'?!!event._nextDate:(!event._nextDate&&event.date<today));
        return (!q||text.includes(q))&&(category==='all'||event.category===category)&&(type==='all'||event.type===type)&&timeMatch;
      }).sort((a,b)=>(a._nextDate||a.date||'9999-12-31').localeCompare(b._nextDate||b.date||'9999-12-31'));
      document.getElementById('eventList').innerHTML=items.length?items.map(event=>eventCardHtml({...event,date:event._nextDate||event.date,_occurrenceDate:event._nextDate||event.date})).join(''):'<div class="empty">イベント・記念日はまだありません。</div>';
    }

    function renderMeetings() {
      const q = document.getElementById('meetingSearch').value.trim().toLowerCase();
      const category = document.getElementById('meetingCategoryFilter').value;
      const tf = document.getElementById('meetingTimeFilter').value;
      const today = localDateString();
      const items = state.meetings.filter(m => {
        const text = `${m.title} ${m.agenda||''} ${m.decisions||''} ${m.pending||''} ${m.nextActions||''}`.toLowerCase();
        const timeMatch = tf==='all' || (tf==='upcoming' ? m.date>=today : m.date<today);
        return (!q||text.includes(q)) && (category==='all'||m.category===category) && timeMatch;
      }).sort((a,b)=>`${b.date}T${b.time||'00:00'}`.localeCompare(`${a.date}T${a.time||'00:00'}`));
      document.getElementById('meetingList').innerHTML = items.length ? items.map(m=>meetingCardHtml(m)).join('') : '<div class="empty">ミーティング記録がありません。</div>';
    }

    function renderNotes() {
      const q = document.getElementById('noteSearch').value.trim().toLowerCase();
      const type = document.getElementById('noteTypeFilter').value;
      const major=document.getElementById('noteMajorFilter')?.value||'all';
      const middle=document.getElementById('noteMiddleFilter')?.value||'all';
      const decision=document.getElementById('noteDecisionFilter')?.value||'all';
      const classification=document.getElementById('noteClassificationFilter')?.value||'all';
      const items = visibleNotes().filter(n =>
        (!q||`${n.title} ${n.content||''} ${categoryPathText(n)} ${(n.tags||[]).join(' ')}`.toLowerCase().includes(q)) &&
        (type==='all'||n.type===type) && (major==='all'||n.majorCategoryId===major) && (middle==='all'||n.middleCategoryId===middle) &&
        (decision==='all'||n.decision===decision) &&
        (classification==='all'||(classification==='needs'?classificationNeeds(n):!classificationNeeds(n)))
      ).sort((a,b)=>(b.date||b.createdAt||'').localeCompare(a.date||a.createdAt||''));
      document.getElementById('noteList').innerHTML = items.length ? items.map(noteCardHtml).join('') : '<div class="empty">アイデアやメモを残してみましょう。</div>';
    }

    function renderIdeaTriage() {
      const list=document.getElementById('ideaTriageList');if(!list)return;
      const ideas=visibleNotes().filter(note=>note.managementType==='idea'&&(note.decision||'pending')==='pending').sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||''));
      const count=document.getElementById('ideaTriageCount');if(count)count.textContent=`${ideas.length}件`;
      list.innerHTML=ideas.length?ideas.map(idea=>`<article class="idea-triage-card" data-kind="note" data-id="${idea.id}">
        <div><div class="idea-triage-title">${escapeHtml(idea.title)}</div><div class="meta-row"><span class="tag category-breadcrumb">${categoryPathHtml(idea)}</span><span class="tag visibility-${normalizeVisibility(idea.visibility)}">${escapeHtml(VISIBILITY_LABELS[normalizeVisibility(idea.visibility)])}</span>${classificationNeeds(idea)?'<span class="tag classification-alert">要分類</span>':''}${idea.date?`<span class="tag">希望 ${escapeHtml(dateLabel(idea.date,false))}</span>`:''}</div>${idea.content?`<div class="task-note">${nl2br(idea.content)}</div>`:''}</div>
        <div class="idea-triage-actions"><button class="btn small note-edit" type="button">整理</button><button class="btn small note-to-task" type="button">タスク化</button><button class="btn small primary note-to-project" type="button">プロジェクト化</button><button class="btn small idea-hold" type="button">保留</button><button class="btn small danger idea-reject" type="button">却下</button></div>
      </article>`).join(''):'<div class="workflow-complete-box"><strong>未整理のアイデアはありません。</strong><br>新しいアイデアは「アイデア・ノート」から大カテゴリだけで登録できます。</div>';
    }

    function renderCalendar() {
      document.getElementById('calendarTitle').textContent = monthLabel(calendarCursor);
      document.getElementById('calendarWeekdays').innerHTML=`<div class="week-number-label">W</div>${orderedWeekdayLabels().map(label=>`<div>${label}</div>`).join('')}`;
      renderContextFuturePanel('calendarFuturePanel',[{year:calendarCursor.getFullYear(),month:calendarCursor.getMonth()+1}]);
      const first = new Date(calendarCursor.getFullYear(),calendarCursor.getMonth(),1);
      const startOffset = (first.getDay()-weekStartDay()+7)%7;
      const start = new Date(first); start.setDate(first.getDate()-startOffset);
      let html='';
      for(let weekIndex=0;weekIndex<6;weekIndex++){
        const rowStart=addDays(start,weekIndex*7);
        const rowKey=localDateString(rowStart);
        const referenceThursday=addDays(rowStart,(4-rowStart.getDay()+7)%7);
        html+=`<button class="calendar-week-number" data-week-start="${rowKey}" title="Weekly Logを開く">W${isoWeekNumber(referenceThursday)}</button>`;
        for(let dayIndex=0;dayIndex<7;dayIndex++) {
          const d=addDays(rowStart,dayIndex);
          const ds = localDateString(d);
          const holiday=japaneseHolidayForDate(ds);
          const tasks = tasksForDate(ds,false);
          const meetings = state.meetings.filter(m=>m.date===ds);
          const events = eventsForDate(ds);
          const datedFuture = visibleFutureItems().filter(item=>item.date===ds);
          html += `<div class="calendar-day ${d.getMonth()!==calendarCursor.getMonth()?'other':''} ${ds===localDateString()?'today':''} ${ds===selectedDate?'selected':''} ${holiday?'holiday':''}" data-date="${ds}" title="Daily Logを開く／Future Logをドロップ">
            <div class="day-number"><span>${d.getDate()}</span>${holiday?`<span class="holiday-name" title="${escapeHtml(holiday)}">${escapeHtml(holiday)}</span>`:''}</div><div class="day-events">
            ${holiday?`<div class="cal-item holiday">㊗ ${escapeHtml(holiday)}</div>`:''}
            ${tasks.slice(0,2).map(t=>`<div class="cal-item">${escapeHtml(t.title)}</div>`).join('')}
            ${meetings.slice(0,1).map(m=>`<div class="cal-item meeting">MTG ${escapeHtml(m.title)}</div>`).join('')}
            ${events.slice(0,1).map(ev=>{const hidden=ev.isPrivate&&ev.privateOwnerUid&&ev.privateOwnerUid!==(window.currentStaffUser?.uid||'');return `<div class="cal-item event event-type-${Math.abs([...String(ev.type||'')].reduce((sum,char)=>sum+char.charCodeAt(0),0))%6}">${hidden?'🔒 予定あり':`☆ ${escapeHtml(ev.title)}`}</div>`;}).join('')}
            ${datedFuture.slice(0,1).map(item=>`<div class="cal-item future">◫ ${escapeHtml(item.title)}</div>`).join('')}
            </div><div class="cal-dots">${holiday?'<span class="dot holiday"></span>':''}${tasks.length?'<span class="dot"></span>':''}${meetings.length?'<span class="dot" style="background:var(--cyan)"></span>':''}${events.length?'<span class="dot event"></span>':''}${datedFuture.length?'<span class="dot future"></span>':''}</div>
          </div>`;
        }
      }
      document.getElementById('calendarGrid').innerHTML = html;
      renderSelectedDay();
    }

    function renderSelectedDay() {
      document.getElementById('selectedDateTitle').textContent = dateLabel(selectedDate);
      const entry = state.dailyEntries[selectedDate] || {};
      document.getElementById('selectedDateSubtitle').textContent = entry.goal ? `Today's Goal：${entry.goal}` : 'この日の予定と記録';
      const tasks = tasksForDate(selectedDate,true).sort((a,b)=>Number(isDone(a))-Number(isDone(b)));
      const meetings = state.meetings.filter(m=>m.date===selectedDate).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
      const events=eventsForDate(selectedDate);
      const datedFuture=visibleFutureItems().filter(item=>item.date===selectedDate);
      const holiday=japaneseHolidayForDate(selectedDate);
      const selectedEventHtml=`${holiday?holidayCardHtml(selectedDate,holiday):''}${events.map(event=>eventCardHtml(event,true)).join('')}`;
      document.getElementById('selectedDayEvents').innerHTML=selectedEventHtml||'<div class="empty">イベントなし</div>';
      document.getElementById('selectedDayFuture').innerHTML=datedFuture.length?datedFuture.map(item=>futureItemHtml(item)).join(''):'<div class="empty">日付確定済みのFuture項目なし</div>';
      document.getElementById('selectedDayTasks').innerHTML = tasks.length ? tasks.map(calendarTaskRowHtml).join('') : '<div class="empty">タスクなし</div>';
      document.getElementById('selectedDayMeetings').innerHTML = meetings.length ? meetings.map(m=>meetingCardHtml(m,true)).join('') : '<div class="empty">ミーティングなし</div>';
    }

    function refreshProjectSelects() {
      ['taskProject','meetingProject','noteProject','captureTaskProject'].forEach(id => {
        const el = document.getElementById(id); if (!el) return;
        const selected = el.value;
        el.innerHTML = projectOptions(selected);
      });
      const filter=document.getElementById('taskProjectFilter');
      if(filter){const selected=filter.value||'all';filter.innerHTML=projectOptions(selected,'all','すべて');filter.value=[...filter.options].some(option=>option.value===selected)?selected:'all';}
      const assigneeSource=document.getElementById('taskAssignee');
      const staffSelects=['taskAssigneeFilter','taskReviewerFilter','projectOwner'];
      staffSelects.forEach(id=>{
        const el=document.getElementById(id);if(!el||!assigneeSource)return;
        const selected=el.value;
        el.innerHTML=(id==='projectOwner'?'<option value="">未設定</option>':'<option value="all">すべて</option>')+
          [...assigneeSource.options].filter(option=>option.value).map(option=>`<option value="${escapeHtml(option.value)}">${escapeHtml(option.textContent)}</option>`).join('');
        if([...el.options].some(option=>option.value===selected))el.value=selected;
      });
    }


    function populateAllDropdowns() {
      const set = (id,html,value) => {
        const el=document.getElementById(id); if(!el)return;
        const current=value!==undefined?value:el.value;
        el.innerHTML=html;
        if([...el.options].some(o=>o.value===current)) el.value=current;
      };
      set('categoryFilter', `<option value="all">すべて</option>${settingOptions('categories')}`);
      set('projectCategoryFilter', `<option value="all">すべて</option>${settingOptions('categories')}`);
      set('meetingCategoryFilter', `<option value="all">すべて</option>${settingOptions('categories')}`);
      set('eventCategoryFilter', `<option value="all">すべて</option>${settingOptions('categories')}`);
      set('yearlyCategoryFilter', `<option value="all">すべて</option>${settingOptions('categories')}<option value="__holidays">日本の祝日</option>`);
      set('taskCategory', settingOptions('categories'));
      set('meetingCategory', settingOptions('categories'));
      set('eventCategory', settingOptions('categories'));
      set('eventTypeFilter', `<option value="all">すべて</option>${settingOptions('eventTypes')}`);
      set('eventType', settingOptions('eventTypes'));
      set('futureCategory', settingOptions('categories'));
      set('typeFilter', groupedTaskTypeFilterOptions(document.getElementById('categoryFilter')?.value||'all',document.getElementById('typeFilter')?.value||'all'));
      refreshTaskTypeSelect(document.getElementById('taskCategory')?.value||categories[0],document.getElementById('taskType')?.value||'');
      set('statusFilter', `<option value="open">未完了</option><option value="all">すべて</option>${settingOptions('taskStatuses')}<option value="today">今日が期限</option><option value="overdue">期限切れ</option>`);
      set('taskStatus', `<option value="">未選択</option>${settingItems('taskStatuses').filter(item=>item.value!=='inbox').map(item=>`<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join('')}`);
      set('priorityFilter', `<option value="all">すべて</option>${settingOptions('priorities')}`);
      set('taskImportance', settingOptions('importanceLevels','',true,'未選択'));
      set('taskUrgency', settingOptions('urgencyLevels','',true,'未選択'));
      set('importanceFilter', `<option value="all">すべて</option><option value="unset">未設定</option>${settingOptions('importanceLevels')}`);
      set('urgencyFilter', `<option value="all">すべて</option><option value="unset">未設定</option>${settingOptions('urgencyLevels')}`);
      set('triageCategoryFilter', `<option value="all">すべてのカテゴリ</option>${settingOptions('categories')}`);
      set('captureTaskCategory', settingOptions('categories'));
      set('captureTaskType', taskTypeOptionsForCategory(document.getElementById('captureTaskCategory')?.value||categories[0],document.getElementById('captureTaskType')?.value||''));
      refreshCaptureTaskAudience(document.getElementById('captureTaskAudience')?.value||defaultTaskAudienceForRole());
      set('projectStatusFilter', `<option value="all">すべて</option>${settingOptions('projectStatuses')}`);
      set('projectStatus', settingOptions('projectStatuses'));
      set('noteTypeFilter', `<option value="all">すべて</option>${settingOptions('noteTypes')}`);
      set('noteType', settingOptions('noteTypes'));
      set('futureItemMonth', monthNumberOptions(new Date().getMonth()+1));
      populateHierarchySelects(TASK_HIERARCHY_IDS,{}, {activeOnly:true});
      populateHierarchySelects(PROJECT_HIERARCHY_IDS,{}, {activeOnly:true});
      populateHierarchySelects(NOTE_HIERARCHY_IDS,{}, {activeOnly:true});
      populateHierarchySelects(CAPTURE_HIERARCHY_IDS,{}, {activeOnly:true});
      refreshWorkspaceTaskControls();
      populateHierarchySelects(TASK_FILTER_HIERARCHY_IDS,{}, {activeOnly:true,filter:true});
      populateHierarchySelects(PROJECT_FILTER_HIERARCHY_IDS,{}, {activeOnly:true,filter:true});
      const noteMajorFilter=document.getElementById('noteMajorFilter');
      if(noteMajorFilter)noteMajorFilter.innerHTML=categorySelectOptions(majorCategories({activeOnly:true}),'','all','すべての大カテゴリ');
      const noteMiddleFilter=document.getElementById('noteMiddleFilter');
      if(noteMiddleFilter)noteMiddleFilter.innerHTML=categorySelectOptions([],'','all','すべての中カテゴリ');
      set('taskManagementType',managementTypeOptions('task',false,['task','recurring','request']));
      set('noteManagementType',managementTypeOptions('idea',false,['idea','record','meeting','request']));
      set('taskManagementFilter',managementTypeOptions('all',true));
      set('taskVisibilityFilter',visibilityOptions('all',true));
      set('projectVisibilityFilter',visibilityOptions('all',true));
      set('taskAudience',visibilityOptions('staff'));
      set('projectVisibility',visibilityOptions('staff'));
      set('noteVisibility',visibilityOptions('staff'));
      populatePhaseSelect('taskPhase','');
      populatePhaseSelect('taskPhaseFilter','all',true);
      populatePhaseSelect('projectPhase','planning');
      populatePhaseSelect('projectPhaseFilter','all',true);
      const templates=state.projectTemplates||defaultProjectTemplates();
      const templateOptions=`<option value="all">すべて</option>${templates.map(template=>`<option value="${escapeHtml(template.id)}">${escapeHtml(template.name)} v${template.version}</option>`).join('')}`;
      set('taskTemplateFilter',templateOptions);
      set('projectTemplateFilter',templateOptions);
    }

    function futureItemHtml(item, config={}) {
      const options=(config&&typeof config==='object'&&!Array.isArray(config))?config:{};
      const exact = item.date ? dateLabel(item.date,false) : `${item.month}月・日付未定`;
      const manageable=canManageFutureItem(item);
      const draggable=!!options.draggable&&manageable;
      return `<div class="future-item ${draggable?'calendar-future-draggable':''}" data-kind="future" data-id="${item.id}" ${draggable?`draggable="true" data-future-drag-id="${item.id}" title="カレンダーの日付へドラッグできます"`:''}>
        <div><div class="future-item-title">${escapeHtml(item.title)}</div>
        <div class="meta-row"><span class="tag">${categoryIcons[item.category]||'•'} ${escapeHtml(settingLabel('categories',item.category,item.category))}</span><span class="tag">${escapeHtml(exact)}</span></div>
        ${item.note?`<div class="future-item-note">${nl2br(item.note)}</div>`:''}</div>
        ${manageable?`<div class="card-actions">${draggable?'<button class="icon-btn future-schedule" title="日付を選んで配置">▦</button>':''}<button class="icon-btn future-task" title="タスクへ">✓</button><button class="icon-btn future-edit">✎</button><button class="icon-btn future-delete">⌫</button></div>`:''}
      </div>`;
    }

    function calendarTaskRowHtml(task) {
      return `<article class="calendar-task-row ${isDone(task)?'completed':''}" data-kind="task" data-id="${task.id}" data-occurrence-date="${task._occurrenceDate||task.due||''}">
        <div class="calendar-task-summary"><input class="check task-toggle" type="checkbox" ${isDone(task)?'checked':''} ${task._virtualOccurrence?'disabled title="先の繰り返し予定です"':''} aria-label="完了切替" /><span>${escapeHtml(task.title)}</span></div>
        <button class="btn small task-edit" type="button">詳細確認</button>
      </article>`;
    }

    function futureItemsForMonth(year, month) {
      return visibleFutureItems()
        .filter(item => Number(item.year)===Number(year) && Number(item.month)===Number(month))
        .sort((a,b)=>(a.date||'9999-12-31').localeCompare(b.date||'9999-12-31') || (a.createdAt||'').localeCompare(b.createdAt||''));
    }

    function openFutureScheduleDialog(item, date='') {
      if(!item)return;
      if(!canManageFutureItem(item)){showToast('イベント用Future Logを移動できるのはイベントオーナー・運営のみです');return;}
      const fallback=`${item.year}-${String(item.month).padStart(2,'0')}-01`;
      document.getElementById('futureScheduleId').value=item.id;
      document.getElementById('futureScheduleDate').value=date||item.date||fallback;
      document.getElementById('futureScheduleSummary').innerHTML=`<strong>◫ ${escapeHtml(item.title)}</strong><span>${categoryIcons[item.category]||'•'} ${escapeHtml(settingLabel('categories',item.category,item.category||'未分類'))}・${item.year}年${item.month}月</span>`;
      const moveRadio=document.querySelector('input[name="futureScheduleMode"][value="move"]');
      if(moveRadio)moveRadio.checked=true;
      document.getElementById('futureScheduleDialog').showModal();
    }

    function taskFromFuture(item, due) {
      const category=item.category||categories[0];
      const fallbackType=firstTaskTypeForCategory(category);
      return {id:uid('task'),title:item.title,workspaceId:itemWorkspace(item),category,type:fallbackType,audience:defaultTaskAudienceForRole(),status:'todo',completed:false,priority:'',due,projectId:'',group:'',assigneeUid:'',assignee:'',reviewerUid:'',reviewer:'',importance:'',urgency:'',level:'',note:item.note||'',repeatType:'none',repeatInterval:1,repeatWeekdays:[],repeatUntil:'',repeatStart:'',repeatHistory:[],...currentCreatorFields(),createdAt:new Date().toISOString()};
    }

    function clearFutureDragState() {
      draggingFutureId='';
      document.querySelectorAll('.calendar-future-draggable.is-dragging').forEach(item=>item.classList.remove('is-dragging'));
      document.querySelectorAll('.calendar-day.future-drop-target,.calendar-day.future-drag-over').forEach(day=>day.classList.remove('future-drop-target','future-drag-over'));
    }

    function renderContextFuturePanel(containerId, monthGroups) {
      const container=document.getElementById(containerId);
      if(!container)return;
      const unique=[];
      monthGroups.forEach(group=>{
        const key=`${group.year}-${group.month}`;
        if(!unique.some(item=>item.key===key)) unique.push({...group,key});
      });
      const groups=unique.map(group=>({...group,items:futureItemsForMonth(group.year,group.month)}));
      const total=groups.reduce((sum,group)=>sum+group.items.length,0);
      if(!total){
        const target=groups[0]||{year:new Date().getFullYear(),month:new Date().getMonth()+1};
        const addButton=canAddFutureInActiveWorkspace()?`<button class="btn small context-future-add" data-year="${target.year}" data-month="${target.month}">＋追加</button>`:'';
        container.innerHTML=`<div class="context-future-wrap is-empty">
          <div class="context-future-head" style="margin-bottom:0"><div><div class="context-future-title">◫ Future Log <span class="month-chip">${target.year}年${target.month}月</span></div><div class="context-future-empty">この月のFuture Logはまだありません。</div></div>
          ${addButton}</div>
        </div>`;
        return;
      }
      container.innerHTML=`<div class="context-future-wrap"><div class="context-future-groups">${groups.map(group=>`
        <section class="context-future-group">
          <div class="context-future-head"><div><div class="context-future-title">◫ Future Log <span class="month-chip">${group.year}年${group.month}月</span></div><div class="future-drag-help">カードを下のカレンダー日付へドラッグすると、期限を決められます。</div></div>
          ${canAddFutureInActiveWorkspace()?`<button class="btn small context-future-add" data-year="${group.year}" data-month="${group.month}">＋追加</button>`:''}</div>
          <div class="context-future-list">${group.items.length?group.items.map(item=>futureItemHtml(item,{draggable:true})).join(''):'<div class="context-future-empty">この月の項目はありません。</div>'}</div>
        </section>`).join('')}</div></div>`;
    }
    function yearlyEventOccurrences(year) {
      const results=[];
      const start=new Date(year,0,1), end=new Date(year,11,31);
      visibleEvents().forEach(event=>{
        if(!hasRepeat(event)){
          const date=parseLocalDate(event.date);
          if(date&&date.getFullYear()===year)results.push({...event,_occurrenceDate:event.date,_yearlyKind:'event'});
          return;
        }
        for(let cursor=new Date(start);cursor<=end;cursor=addDays(cursor,1)){
          const ds=localDateString(cursor);
          if(recurrenceMatches(event,ds))results.push({...event,date:ds,_occurrenceDate:ds,_virtualOccurrence:ds!==event.date,_yearlyKind:'event'});
        }
      });
      return results.sort((a,b)=>(a._occurrenceDate||a.date).localeCompare(b._occurrenceDate||b.date)||(a.time||'99:99').localeCompare(b.time||'99:99'));
    }
    function yearlyEventRowHtml(event) {
      const ds=event._occurrenceDate||event.date;
      const date=parseLocalDate(ds);
      const time=event.allDay!==false?'終日':(event.time||'時間未定');
      const hidden=!!event.isPrivate&&event.privateOwnerUid&&event.privateOwnerUid!==(window.currentStaffUser?.uid||'');
      return `<article class="yearly-event-row" data-kind="event" data-id="${event.id}" data-occurrence-date="${ds||''}">
        <div class="yearly-event-day">${date?date.getDate()+'日':'--'}</div>
        <div><div class="yearly-event-title">${hidden?'🔒 予定あり':`☆ ${escapeHtml(event.title)}`}</div><div class="yearly-event-meta">${escapeHtml(time)}${hidden?'':`・${escapeHtml(settingLabel('eventTypes',event.type,event.type||'イベント'))}${hasRepeat(event)?`・↻ ${escapeHtml(repeatSummary(event))}`:''}`}</div></div>
        ${hidden?'<span></span>':'<button class="icon-btn event-edit" title="編集">✎</button>'}
      </article>`;
    }
    function yearlyFutureRowHtml(item) {
      const date=parseLocalDate(item.date);
      return `<article class="yearly-event-row is-future" data-kind="future" data-id="${item.id}">
        <div class="yearly-event-day">${date?date.getDate()+'日':'月内'}</div>
        <div><div class="yearly-event-title">◫ ${escapeHtml(item.title)}</div><div class="yearly-event-meta">Future Log・${date?escapeHtml(dateLabel(item.date,false)):'日付未定'}${item.note?`・${escapeHtml(item.note.slice(0,45))}${item.note.length>45?'…':''}`:''}</div></div>
        ${canManageFutureItem(item)?'<button class="icon-btn future-edit" title="編集">✎</button>':'<span></span>'}
      </article>`;
    }
    function yearlyHolidayRowHtml(dateString,name) {
      const date=parseLocalDate(dateString);
      return `<article class="yearly-event-row is-holiday">
        <div class="yearly-event-day">${date?date.getDate()+'日':'--'}</div>
        <div><div class="yearly-event-title">㊗ ${escapeHtml(name)}</div><div class="yearly-event-meta">日本の祝日</div></div><span></span>
      </article>`;
    }
    function yearlyMonthGroups(year,month,categoryFilter='all') {
      const groups=new Map();
      const add=(category,html,sortKey)=>{
        if(categoryFilter!=='all' && categoryFilter!==category)return;
        if(!groups.has(category))groups.set(category,[]);
        groups.get(category).push({html,sortKey});
      };
      yearlyEventOccurrences(year).filter(event=>parseLocalDate(event._occurrenceDate||event.date)?.getMonth()===month-1)
        .forEach(event=>add(event.category||'未分類',yearlyEventRowHtml(event),event._occurrenceDate||event.date||`${year}-${String(month).padStart(2,'0')}-99`));
      visibleFutureItems().filter(item=>Number(item.year)===year&&Number(item.month)===month)
        .forEach(item=>add(item.category||'未分類',yearlyFutureRowHtml(item),item.date||`${year}-${String(month).padStart(2,'0')}-99`));
      if(state.preferences.showJapaneseHolidays!==false && (categoryFilter==='all'||categoryFilter==='__holidays')){
        const lastDay=new Date(year,month,0).getDate();
        for(let day=1;day<=lastDay;day++){
          const ds=dateKeyFromParts(year,month,day),holiday=japaneseHolidayForDate(ds);
          if(holiday)add('__holidays',yearlyHolidayRowHtml(ds,holiday),ds);
        }
      }
      const categoryOrder=settingItems('categories').map(item=>item.value);
      const sorted=[...groups.entries()].sort(([a],[b])=>{
        if(a==='__holidays')return 1;if(b==='__holidays')return -1;
        const ai=categoryOrder.indexOf(a),bi=categoryOrder.indexOf(b);
        return (ai<0?999:ai)-(bi<0?999:bi)||a.localeCompare(b,'ja');
      });
      return sorted.map(([category,items])=>({category,label:category==='__holidays'?'日本の祝日':settingLabel('categories',category,category),items:items.sort((a,b)=>a.sortKey.localeCompare(b.sortKey))}));
    }
    function renderYearlyLog() {
      const yearInput=document.getElementById('yearlyYear');
      if(!yearInput.value)yearInput.value=yearlyCursor||new Date().getFullYear();
      const year=Math.min(2100,Math.max(2020,Number(yearInput.value)||new Date().getFullYear()));
      yearlyCursor=year; yearInput.value=year;
      document.getElementById('yearlyTitle').textContent=`${year}年 年間ログ`;
      const personalYearly=activeWorkspace!==eventWorkspaceId;
      document.getElementById('yearlyPersonalSummary').hidden=!personalYearly;
      document.getElementById('saveYearlyBtn').hidden=!personalYearly;
      const entry=state.yearlyLogs[String(year)]||{};
      document.getElementById('yearlyTheme').value=entry.theme||'';
      document.getElementById('yearlyGoals').value=entry.goals||'';
      document.getElementById('yearlyMemo').value=entry.reflection??entry.memo??'';
      const categoryFilter=document.getElementById('yearlyCategoryFilter')?.value||'all';
      document.getElementById('yearlyMonths').innerHTML=Array.from({length:12},(_,index)=>{
        const month=index+1,groups=yearlyMonthGroups(year,month,categoryFilter);
        const count=groups.reduce((sum,group)=>sum+group.items.length,0);
        const content=groups.length?`<div class="yearly-category-groups">${groups.map(group=>`<section class="yearly-category-group"><div class="yearly-category-head"><span>${escapeHtml(group.label)}</span><span>${group.items.length}件</span></div><div class="yearly-event-list">${group.items.map(item=>item.html).join('')}</div></section>`).join('')}</div>`:'<div class="yearly-empty">この月のイベント・予定はありません</div>';
        return `<section class="yearly-month-card" data-year="${year}" data-month="${month}"><div class="yearly-month-head"><button class="yearly-month-open" data-year="${year}" data-month="${month}" title="${month}月のカレンダーを開く"><span class="yearly-month-title">${month}月</span><small>Calendar →</small></button><span class="tag">${count}件</span></div>${content}</section>`;
      }).join('');
    }
    function saveYearlyLog() {
      if(activeWorkspace===eventWorkspaceId){showToast('イベント用Yearly Logには年次テーマ・目標・振り返りはありません');return;}
      const year=String(yearlyCursor||new Date().getFullYear());
      state.yearlyLogs[year]={
        theme:document.getElementById('yearlyTheme').value.trim(),
        goals:document.getElementById('yearlyGoals').value.trim(),
        reflection:document.getElementById('yearlyMemo').value.trim(),
        updatedAt:new Date().toISOString()
      };
      saveState('年間ログを保存しました');
    }
    function shiftYear(amount) {
      yearlyCursor=Math.min(2100,Math.max(2020,(yearlyCursor||new Date().getFullYear())+amount));
      document.getElementById('yearlyYear').value=yearlyCursor;
      renderYearlyLog();
    }

    function renderDailyLog() {
      const ds=dailyCursor||localDateString();
      const date=parseLocalDate(ds)||new Date();
      dailyCursor=localDateString(date);
      const personalDaily=activeWorkspace!==eventWorkspaceId;
      document.getElementById('dailyPersonalPlanning').hidden=!personalDaily;
      document.getElementById('dailyPersonalReflection').hidden=!personalDaily;
      document.getElementById('saveDailyLogBtn').hidden=!personalDaily;
      document.getElementById('dailyAddMeetingBtn').hidden=activeWorkspace==='personal';
      document.getElementById('dailyDateInput').value=dailyCursor;
      document.getElementById('dailyTitle').textContent=dateLabel(dailyCursor);
      renderContextFuturePanel('dailyFuturePanel',[{year:date.getFullYear(),month:date.getMonth()+1}]);
      const entry=state.dailyEntries[dailyCursor]||{};
      document.getElementById('dailyGoal').value=entry.goal||'';
      document.getElementById('dailyPriorities').value=entry.priorities||'';
      document.getElementById('dailyMemo').value=entry.memo||'';
      document.getElementById('dailyGoodThings').value=entry.goodThings||'';
      const dayEvents=eventsForDate(dailyCursor);
      const holiday=japaneseHolidayForDate(dailyCursor);
      const tasks=tasksForDate(dailyCursor,true).sort((a,b)=>Number(isDone(a))-Number(isDone(b)) || (priorityOrder[a.priority]??999)-(priorityOrder[b.priority]??999));
      const meetings=state.meetings.filter(m=>m.date===dailyCursor).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
      const futures=visibleFutureItems().filter(item=>item.date===dailyCursor).sort((a,b)=>a.title.localeCompare(b.title,'ja'));
      const dailyEventHtml=`${holiday?holidayCardHtml(dailyCursor,holiday):''}${dayEvents.map(event=>eventCardHtml(event,true)).join('')}`;
      document.getElementById('dailyEvents').innerHTML=dailyEventHtml||'<div class="empty">イベントなし</div>';
      document.getElementById('dailyTasks').innerHTML=tasks.length?tasks.map(task=>taskCardHtml(task,true)).join(''):'<div class="empty">タスクなし</div>';
      document.getElementById('dailyMeetings').innerHTML=meetings.length?meetings.map(meeting=>meetingCardHtml(meeting,true)).join(''):'<div class="empty">ミーティングなし</div>';
      document.getElementById('dailyFutureItems').innerHTML=futures.length?futures.map(futureItemHtml).join(''):'<div class="empty">日付が確定したFuture項目なし</div>';
    }
    function saveDailyLog() {
      if(activeWorkspace===eventWorkspaceId){showToast('イベント用Daily Logには個人用のゴール・優先事項・メモはありません');return;}
      const ds=dailyCursor||localDateString();
      state.dailyEntries[ds]={
        ...(state.dailyEntries[ds]||{}),
        goal:document.getElementById('dailyGoal').value.trim(),
        priorities:document.getElementById('dailyPriorities').value.trim(),
        memo:document.getElementById('dailyMemo').value.trim(),
        goodThings:document.getElementById('dailyGoodThings').value.trim(),
        updatedAt:new Date().toISOString()
      };
      saveState('Daily Logを保存しました');
    }
    function shiftDaily(amount) {
      const date=parseLocalDate(dailyCursor)||new Date();
      dailyCursor=localDateString(addDays(date,amount));
      renderDailyLog();
    }

    function renderFutureLog() {
      const yearInput=document.getElementById('futureYear');
      if(!yearInput.value) yearInput.value=new Date().getFullYear();
      const year=Number(yearInput.value);
      const newButton=document.getElementById('newFutureBtn');if(newButton)newButton.hidden=!canAddFutureInActiveWorkspace();
      document.getElementById('futureYearGrid').innerHTML=Array.from({length:12},(_,index)=>{
        const month=index+1;
        const items=visibleFutureItems().filter(item=>Number(item.year)===year&&Number(item.month)===month)
          .sort((a,b)=>(a.date||'9999-12-31').localeCompare(b.date||'9999-12-31'));
        return `<section class="future-month-card"><div class="future-month-head"><div class="future-month-title">${month}月</div>${canAddFutureInActiveWorkspace()?`<button class="btn small future-add-month" data-month="${month}">＋追加</button>`:''}</div>
          <div>${items.length?items.map(futureItemHtml).join(''):'<div class="muted" style="font-size:10px">まだ予定はありません</div>'}</div></section>`;
      }).join('');
    }
    function openFutureDialog(item=null, defaults={}) {
      const targetWorkspace=item?itemWorkspace(item):(activeWorkspace==='all'?'personal':activeWorkspace);
      if(!canManageFutureWorkspace(targetWorkspace)){showToast('イベント用Future Logを操作できるのはイベントオーナー・運営のみです');return;}
      document.getElementById('futureForm').reset();
      pendingFutureSourceTaskId = item ? '' : (defaults.sourceTaskId||'');
      document.getElementById('futureId').value=item?.id||'';
      document.getElementById('futureModalTitle').textContent=item?'Future項目を編集':(pendingFutureSourceTaskId?'タスクをFuture Logへ移動':'Future項目を追加');
      document.getElementById('futureMoveNotice').hidden=!pendingFutureSourceTaskId;
      document.getElementById('futureItemYear').value=item?.year||defaults.year||Number(document.getElementById('futureYear').value)||new Date().getFullYear();
      document.getElementById('futureItemMonth').innerHTML=monthNumberOptions(item?.month||defaults.month||new Date().getMonth()+1);
      document.getElementById('futureTitle').value=item?.title||defaults.title||'';
      document.getElementById('futureDate').value=item?.date||defaults.date||'';
      document.getElementById('futureCategory').innerHTML=settingOptions('categories',item?.category||defaults.category||categories[0]);
      document.getElementById('futureNote').value=item?.note||defaults.note||'';
      document.getElementById('futureDialog').showModal();
    }

    function renderWeeklyLog() {
      const start=startOfWeek(weeklyCursor), end=addDays(start,6), key=weekKey(start);
      weeklyCursor=start;
      const personalWeekly=activeWorkspace!==eventWorkspaceId;
      document.getElementById('weeklyPersonalSummary').hidden=!personalWeekly;
      document.getElementById('saveWeeklyBtn').hidden=!personalWeekly;
      const weekMonths=Array.from({length:7},(_,index)=>addDays(start,index)).map(day=>({year:day.getFullYear(),month:day.getMonth()+1}));
      renderContextFuturePanel('weeklyFuturePanel',weekMonths);
      const entry=state.weeklyLogs[key]||{};
      document.getElementById('weeklyTitle').textContent=`W${isoWeekNumber(addDays(start,(4-start.getDay()+7)%7))}｜${dateLabel(localDateString(start),false)} 〜 ${dateLabel(localDateString(end),false)}`;
      document.getElementById('weeklyRangeHint').textContent=weekStartDay()===0?'日曜日から土曜日までの予定・タスク・メモ':'月曜日から日曜日までの予定・タスク・メモ';
      document.getElementById('weeklyGoal').value=entry.goal||'';
      document.getElementById('weeklyPriorities').value=entry.priorities||'';
      document.getElementById('weeklyMemo').value=entry.memo||'';
      document.getElementById('weeklyDays').innerHTML=Array.from({length:7},(_,index)=>{
        const day=addDays(start,index), ds=localDateString(day), name=weekdayShortLabels[day.getDay()];
        const holiday=japaneseHolidayForDate(ds);
        const tasks=tasksForDate(ds,false);
        const meetings=state.meetings.filter(m=>m.date===ds);
        const dayEvents=eventsForDate(ds);
        const futures=visibleFutureItems().filter(f=>f.date===ds);
        const events=[
          ...(holiday?[`<div class="week-event holiday">㊗ ${escapeHtml(holiday)}</div>`]:[]),
          ...tasks.map(t=>`<div class="week-event">✓ ${escapeHtml(t.title)}</div>`),
          ...meetings.map(m=>`<div class="week-event meeting">◎ ${escapeHtml(m.title)}${m.time?` ${escapeHtml(m.time)}`:''}</div>`),
          ...dayEvents.map(event=>{const hidden=!!event.isPrivate&&event.privateOwnerUid&&event.privateOwnerUid!==(window.currentStaffUser?.uid||'');return `<div class="week-event event">${hidden?'🔒 予定あり':`☆ ${escapeHtml(event.title)}`}${event.allDay===false&&event.time?` ${escapeHtml(event.time)}`:''}</div>`;}),
          ...futures.map(f=>`<div class="week-event future">◫ ${escapeHtml(f.title)}</div>`)
        ].join('');
        return `<section class="week-day-card ${ds===localDateString()?'today':''}">
          <div class="week-day-head"><button class="weekly-day-link" data-date="${ds}" title="Daily Logを開く"><div class="week-day-title">${name}曜日</div><div class="week-day-date">${dateLabel(ds,false)}</div></button>
          <div class="week-day-actions"><button class="icon-btn weekly-add-event" data-date="${ds}" title="イベント追加">☆</button><button class="icon-btn weekly-add-task" data-date="${ds}" title="タスク追加">＋</button></div></div>
          <div class="week-events">${events||'<div class="muted" style="font-size:9px">予定なし</div>'}</div>
          ${personalWeekly?`<div class="field"><label>Focus / Memo</label><textarea class="weekly-day-note" data-date="${ds}" placeholder="この日の重点・メモ">${escapeHtml(entry.days?.[ds]||'')}</textarea></div>`:''}
        </section>`;
      }).join('');
    }
    function saveWeeklyLog() {
      if(activeWorkspace===eventWorkspaceId){showToast('イベント用Weekly Logには個人用のゴール・優先事項・メモはありません');return;}
      const key=weekKey();
      const days={};
      document.querySelectorAll('.weekly-day-note').forEach(el=>days[el.dataset.date]=el.value);
      state.weeklyLogs[key]={
        goal:document.getElementById('weeklyGoal').value.trim(),
        priorities:document.getElementById('weeklyPriorities').value.trim(),
        memo:document.getElementById('weeklyMemo').value.trim(),
        days, updatedAt:new Date().toISOString()
      };
      saveState('週間ログを保存しました');
    }

    function settingUsed(key,value) {
      const checks={
        categories:()=>[...state.tasks,...state.events,...state.projects,...state.meetings,...state.notes,...state.futureItems].some(x=>x.category===value) || settingItems('taskTypes').some(x=>x.category===value),
        eventTypes:()=>state.events.some(x=>x.type===value),
        taskTypes:()=>state.tasks.some(x=>x.type===value),
        taskStatuses:()=>state.tasks.some(x=>x.status===value),
        priorities:()=>state.tasks.some(x=>x.priority===value),
        taskGroups:()=>state.tasks.some(x=>x.group===value),
        importanceLevels:()=>state.tasks.some(x=>x.importance===value),
        urgencyLevels:()=>state.tasks.some(x=>x.urgency===value),
        projectStatuses:()=>state.projects.some(x=>x.status===value),
        noteTypes:()=>state.notes.some(x=>x.type===value)
      };
      return checks[key]?.()||false;
    }
    function categoryUsageCount(categoryId) {
      const collections=[state.tasks,state.projects,state.notes,state.meetings,state.events,state.futureItems];
      return collections.flat().filter(item=>item?.majorCategoryId===categoryId||item?.middleCategoryId===categoryId||item?.smallCategoryId===categoryId).length;
    }
    function renderCategoryAdmin() {
      const tree=document.getElementById('categoryAdminTree');if(!tree)return;
      const owner=canManageTasks();
      document.getElementById('categoryEditPermission').textContent=owner?'編集可能':'オーナー・運営のみ編集';
      document.getElementById('addHierarchyCategoryBtn').hidden=!owner;
      const rows=[];
      const walk=parentId=>{
        categoryChildren(parentId,{activeOnly:false}).forEach(item=>{
          const used=categoryUsageCount(item.id);
          const parentChoices=item.level===1?[]:categoryMasterItems().filter(candidate=>candidate.level===item.level-1&&candidate.active!==false);
          rows.push(`<div class="category-admin-row ${item.active===false?'inactive':''}" data-category-id="${escapeHtml(item.id)}" data-level="${item.level}" data-parent-id="${escapeHtml(item.parentId||'')}" draggable="${owner}">
            <span class="category-drag-handle" title="ドラッグして移動">≡</span><button class="category-collapse" type="button" aria-expanded="${item.collapsed!==true}">${item.level<3?'⌄':'·'}</button>
            <span class="category-level-badge">${item.level===1?'大分類':item.level===2?'中分類':'小分類'}</span>
            <input class="category-name-input" value="${escapeHtml(item.name)}" maxlength="60" ${owner?'':'disabled'} aria-label="カテゴリ名" />
            ${item.level===1?`<span class="category-admin-meta">${escapeHtml(item.id)}</span>`:`<select class="category-parent-control" ${owner?'':'disabled'}>${parentChoices.map(parent=>`<option value="${escapeHtml(parent.id)}" ${parent.id===item.parentId?'selected':''}>${escapeHtml(parent.name)}</option>`).join('')}</select>`}
            <label class="preference-toggle"><input class="category-active-toggle" type="checkbox" ${item.active!==false?'checked':''} ${owner&&!item.system?'':'disabled'} /><span><strong>${item.active!==false?'有効':'無効'}</strong><small>使用 ${used}件</small></span></label>
            <div class="category-admin-actions"><button class="btn small category-save" type="button" ${owner?'':'disabled'}>保存</button><button class="btn small danger category-delete" type="button" ${owner&&!item.system&&!used?'':'disabled'} title="${used?'使用中のカテゴリは削除できません':''}">削除</button></div>
          </div>`);
          walk(item.id);
        });
      };
      majorCategories({activeOnly:false}).forEach(item=>{
        const used=categoryUsageCount(item.id);
        rows.push(`<div class="category-admin-row ${item.active===false?'inactive':''}" data-category-id="${escapeHtml(item.id)}" data-level="1" data-parent-id="" draggable="${owner}">
          <span class="category-drag-handle" title="上下にドラッグして移動">≡</span><button class="category-collapse" type="button" aria-expanded="${item.collapsed!==true}">⌄</button>
          <span class="category-level-badge">大分類</span><input class="category-name-input" value="${escapeHtml(item.name)}" maxlength="60" ${owner?'':'disabled'} aria-label="カテゴリ名" />
          <span class="category-admin-meta">${escapeHtml(item.id)}</span>
          <label class="preference-toggle"><input class="category-active-toggle" type="checkbox" ${item.active!==false?'checked':''} ${owner&&!item.system?'':'disabled'} /><span><strong>${item.active!==false?'有効':'無効'}</strong><small>使用 ${used}件</small></span></label>
          <div class="category-admin-actions"><button class="btn small category-save" type="button" ${owner?'':'disabled'}>保存</button><button class="btn small danger category-delete" type="button" ${owner&&!item.system&&!used?'':'disabled'}>削除</button></div>
        </div>`);
        walk(item.id);
      });
      tree.innerHTML=rows.join('')||'<div class="empty">カテゴリマスタがありません。</div>';
      tree.querySelectorAll('.category-admin-row').forEach(row=>{
        let parent=categoryNode(row.dataset.parentId),hidden=false;
        while(parent){if(parent.collapsed){hidden=true;break;}parent=categoryNode(parent.parentId);}
        row.hidden=hidden;
      });
    }
    function applyCategoryTemplate(){
      if(!canManageTasks())return;
      const type=document.getElementById('categoryTemplateSelect')?.value;if(!type)return;
      if(!confirm('現在の未使用カテゴリをテンプレート構成に置き換えますか？使用中カテゴリは保持されます。'))return;
      const keep=categoryMasterItems().filter(item=>item.system||categoryUsageCount(item.id));
      const stamp=Date.now().toString(36).toUpperCase();
      const major={id:`CAT-TEMPLATE-${stamp}-1`,level:1,parentId:null,name:'大分類',sortOrder:999,active:true};
      const additions=[major];
      if(type!=='simple'){
        const middle={id:`CAT-TEMPLATE-${stamp}-2`,level:2,parentId:major.id,name:'中分類',sortOrder:1,active:true};additions.push(middle);
        if(type==='detailed')additions.push({id:`CAT-TEMPLATE-${stamp}-3`,level:3,parentId:middle.id,name:'小分類',sortOrder:1,active:true});
      }
      state.categoryMaster=[...keep,...additions];saveState('カテゴリテンプレートを適用しました');
    }
    let draggedCategoryId='';
    function moveCategoryByDrop(sourceId,targetId){
      if(!canManageTasks()||sourceId===targetId)return;
      const source=categoryNode(sourceId),target=categoryNode(targetId);if(!source||!target)return;
      if(source.level===1&&target.level!==1){showToast('大分類は上下の並べ替えのみ可能です');return;}
      if(target.level===3&&source.level!==3){showToast('小分類の中には分類を入れられません');return;}
      let parentId=target.parentId,level=target.level;
      if(source.level!==1&&target.level<3){parentId=target.id;level=target.level+1;}
      if(level>3)return;
      source.parentId=parentId||null;source.level=level;
      const siblings=categoryMasterItems().filter(item=>item.id!==source.id&&item.parentId===source.parentId);
      source.sortOrder=siblings.length?Math.max(...siblings.map(item=>Number(item.sortOrder)||0))+1:1;
      saveState(`${source.name}を${level===1?'大分類':level===2?'中分類':'小分類'}へ移動しました`);
    }
    function renderTemplateSettings() {
      const list=document.getElementById('templateSettingsList');if(!list)return;
      const owner=canManageTasks();
      list.innerHTML=(state.projectTemplates||[]).map(template=>{
        const fieldCount=(template.sections||[]).reduce((sum,section)=>sum+(section.fields||[]).length,0);
        return `<article class="template-setting-card" data-template-id="${escapeHtml(template.id)}"><div><h4>${escapeHtml(template.name)}</h4><p class="panel-sub">${escapeHtml(template.description||'')}</p><div class="template-setting-meta"><span class="tag">${escapeHtml(template.id)}</span><span class="tag">v${template.version}</span><span class="tag">${template.sections?.length||0}セクション</span><span class="tag">${fieldCount}項目</span><span class="tag">${template.generatedTasks?.length||0}初期タスク</span></div></div><label class="preference-toggle"><input class="template-active-toggle" type="checkbox" ${template.active!==false?'checked':''} ${owner?'':'disabled'} /><span><strong>${template.active!==false?'有効':'無効'}</strong><small>${owner?'作成候補を切替':'オーナーのみ変更'}</small></span></label></article>`;
      }).join('')||'<div class="empty">テンプレートがありません。</div>';
    }
    function saveHierarchyCategoryRow(row) {
      if(!canManageTasks())return;
      const item=state.categoryMaster.find(category=>category.id===row.dataset.categoryId);if(!item)return;
      const name=row.querySelector('.category-name-input')?.value.trim();
      if(!name){showToast('カテゴリ名を入力してください');return;}
      const parent=row.querySelector('.category-parent-control')?.value;
      if(item.level>1&&!parent){showToast('親カテゴリを選択してください');return;}
      item.name=name;
      if(item.level>1)item.parentId=parent;
      if(!item.system)item.active=row.querySelector('.category-active-toggle')?.checked!==false;
      saveState('カテゴリ設定を保存しました');
    }
    function deleteHierarchyCategory(id) {
      if(!canManageTasks())return;
      const item=state.categoryMaster.find(category=>category.id===id);if(!item||item.system)return;
      if(categoryUsageCount(id)){showToast('使用中のカテゴリは削除できません。無効化してください');return;}
      if(categoryChildren(id,{activeOnly:false}).length){showToast('子カテゴリがあるため削除できません');return;}
      if(!confirm(`「${item.name}」を削除しますか？`))return;
      state.categoryMaster=state.categoryMaster.filter(category=>category.id!==id);
      saveState('未使用カテゴリを削除しました');
    }
    function addHierarchyCategory() {
      if(!canManageTasks())return;
      const level=Number(prompt('追加する階層を入力してください（1=大、2=中、3=小）','2'));
      if(![1,2,3].includes(level)){showToast('階層は1〜3で指定してください');return;}
      let parentId=null;
      if(level>1){
        const candidates=categoryMasterItems().filter(item=>item.level===level-1&&item.active!==false);
        const guide=candidates.map(item=>`${item.id}: ${item.name}`).join('\n');
        parentId=prompt(`親カテゴリIDを入力してください\n\n${guide}`,candidates[0]?.id||'');
        if(!candidates.some(item=>item.id===parentId)){showToast('正しい親カテゴリIDを選んでください');return;}
      }
      const name=prompt('カテゴリ名を入力してください');if(!name?.trim())return;
      const id=`CAT-CUSTOM-${level}-${Date.now().toString(36).toUpperCase()}`;
      const siblings=state.categoryMaster.filter(item=>item.parentId===parentId);
      state.categoryMaster.push({id,level,parentId,name:name.trim(),sortOrder:siblings.length?Math.max(...siblings.map(item=>Number(item.sortOrder)||0))+1:1,active:true});
      saveState('カテゴリを追加しました');
    }
    const TRASH_SECTIONS={task:'tasks',event:'events',project:'projects',meeting:'meetings',schedulePoll:'schedulePolls',note:'notes',future:'futureItems'};
    const TRASH_LABELS={task:'タスク',event:'イベント',project:'プロジェクト',meeting:'ミーティング',schedulePoll:'日程調整',note:'ノート',future:'Future'};
    const DAY_MS=86400000;
    function trashTitle(record){return record?.title||record?.name||'名称未設定';}
    function moveToTrash(kind,id) {
      const section=TRASH_SECTIONS[kind],items=state[section]||[];
      const index=items.findIndex(item=>item.id===id);if(index<0)return;
      const now=new Date().toISOString(),record=items[index];
      state.trashItems.push({id:uid('trash'),kind,record,deletedAt:now,deletedByUid:window.currentStaffUser?.uid||'',deletedBy:window.currentStaffUser?.name||window.currentStaffUser?.email||'ローカル'});
      state[section]=items.filter(item=>item.id!==id);
      saveState(`${TRASH_LABELS[kind]}をゴミ箱へ移動しました`);
    }
    function restoreTrashItem(id,archive=false) {
      const source=archive?state.recoveryArchive:state.trashItems;
      const item=source.find(entry=>entry.id===id);if(!item)return;
      const section=TRASH_SECTIONS[item.kind];if(!section)return;
      state[section]=(state[section]||[]).filter(record=>record.id!==item.record.id);
      state[section].push(item.record);
      if(archive)state.recoveryArchive=state.recoveryArchive.filter(entry=>entry.id!==id);
      else state.trashItems=state.trashItems.filter(entry=>entry.id!==id);
      saveState(`${TRASH_LABELS[item.kind]}を復元しました`);
    }
    function permanentlyDeleteTrashItem(id,automatic=false) {
      const item=state.trashItems.find(entry=>entry.id===id);if(!item)return;
      const now=new Date().toISOString();
      state.trashItems=state.trashItems.filter(entry=>entry.id!==id);
      state.recoveryArchive.push({...item,permanentlyDeletedAt:now,permanentlyDeletedByUid:window.currentStaffUser?.uid||'',permanentlyDeletedBy:automatic?'システム':(window.currentStaffUser?.name||window.currentStaffUser?.email||'ローカル')});
      saveState(automatic?'30日経過した項目を完全削除しました':`${TRASH_LABELS[item.kind]}を完全削除しました`);
    }
    function maintainDeletionLifecycle() {
      const now=Date.now();let changed=false;
      const expired=(state.trashItems||[]).filter(item=>now-new Date(item.deletedAt).getTime()>=30*DAY_MS);
      expired.forEach(item=>{
        state.recoveryArchive.push({...item,permanentlyDeletedAt:new Date().toISOString(),permanentlyDeletedBy:'システム'});
        changed=true;
      });
      if(expired.length){const ids=new Set(expired.map(item=>item.id));state.trashItems=state.trashItems.filter(item=>!ids.has(item.id));}
      const purged=(state.recoveryArchive||[]).filter(item=>now-new Date(item.permanentlyDeletedAt).getTime()>=10*DAY_MS);
      if(purged.length){
        const ids=new Set(purged.map(item=>item.id));
        purged.filter(item=>item.kind==='project').forEach(item=>{
          ['tasks','meetings','notes'].forEach(section=>(state[section]||[]).forEach(record=>{if(record.projectId===item.record.id)record.projectId='';}));
        });
        state.recoveryArchive=state.recoveryArchive.filter(item=>!ids.has(item.id));changed=true;
      }
      if(changed)persistStateSilently();
    }
    function deletionRemaining(item,days,field) {
      return Math.max(0,Math.ceil((days*DAY_MS-(Date.now()-new Date(item[field]).getTime()))/DAY_MS));
    }
    function renderDeletionTools() {
      const trash=document.getElementById('trashItemList'),archive=document.getElementById('recoveryArchiveList');
      if(!trash||!archive)return;
      trash.innerHTML=state.trashItems.length?state.trashItems.map(item=>`<div class="trash-row" data-trash-id="${escapeHtml(item.id)}"><div><strong>${escapeHtml(trashTitle(item.record))}</strong><small>${TRASH_LABELS[item.kind]}・${escapeHtml(item.deletedBy||'不明')}が削除・あと${deletionRemaining(item,30,'deletedAt')}日</small></div><div class="inline-actions"><button class="btn small trash-restore">復元</button><button class="btn small danger trash-delete-forever">完全削除</button></div></div>`).join(''):'<div class="empty-state"><p>ゴミ箱は空です。</p></div>';
      const manager=canManageTasks();
      document.getElementById('recoveryArchivePanel').hidden=!manager;
      archive.innerHTML=manager?(state.recoveryArchive.length?state.recoveryArchive.map(item=>`<div class="trash-row" data-archive-id="${escapeHtml(item.id)}"><div><strong>${escapeHtml(trashTitle(item.record))}</strong><small>${TRASH_LABELS[item.kind]}・完全削除からあと${deletionRemaining(item,10,'permanentlyDeletedAt')}日復元可能</small></div><button class="btn small archive-restore">管理者復元</button></div>`).join(''):'<div class="empty-state"><p>復元可能な完全削除データはありません。</p></div>'):'';
    }
    function renderSettings() {
      maintainDeletionLifecycle();
      renderDeletionTools();
      renderMenuSettings();
      renderCategoryAdmin();
      renderTemplateSettings();
      updateThemeControls();
      document.getElementById('weekStartSetting').value=state.preferences.weekStartsOn;
      document.getElementById('showJapaneseHolidaysSetting').checked=state.preferences.showJapaneseHolidays!==false;
      const personalSettings=activeWorkspace!==eventWorkspaceId;
      const categoryPanel=document.getElementById('categoryHierarchyPanel');
      if(categoryPanel)categoryPanel.hidden=personalSettings;
      const trashPanel=document.getElementById('trashPanel');if(trashPanel)trashPanel.hidden=personalSettings;
      const recoveryPanel=document.getElementById('recoveryArchivePanel');if(personalSettings&&recoveryPanel)recoveryPanel.hidden=true;
      const categoryOptionsForSetting=(selected='')=>settingItems('categories').filter(item=>!personalSettings||PERSONAL_TASK_CATEGORIES.has(item.value)).map(item=>`<option value="${escapeHtml(item.value)}" ${item.value===selected?'selected':''}>${escapeHtml(item.label)}</option>`).join('');
      const dropdownPanel=document.getElementById('dropdownSettingsPanel');
      if(dropdownPanel)dropdownPanel.hidden=false;
      if(!canManageDropdowns()){document.getElementById('settingsGrid').innerHTML='';return;}
      const visibleKeys=personalSettings
        ? ['categories','taskTypes','eventTypes','taskStatuses','noteTypes','importanceLevels','urgencyLevels']
        : ['eventTypes','taskStatuses','noteTypes','importanceLevels','urgencyLevels'];
      const scopedItems=key=>settingItems(key).map((item,index)=>({item,index})).filter(({item})=>{
        if(key==='categories')return PERSONAL_TASK_CATEGORIES.has(item.value);
        if(key==='taskTypes')return PERSONAL_TASK_CATEGORIES.has(item.category);
        if(['eventTypes','taskStatuses','noteTypes'].includes(key)){
          const scope=item.scope||'both';return scope==='both'||scope===(personalSettings?'personal':'event');
        }
        return true;
      });
      const addPlaceholder=category=>{
        if(category==='PRIVATE')return '例）遊び、コンタクト交換、等';
        if(category==='LIFE')return '例）ゴミ出し、買い出し、等';
        if(category==='VRchat')return '例）イベント参加、LIVE見る、等';
        return '新しい種類を追加';
      };
      document.getElementById('settingsGrid').innerHTML=visibleKeys.map(key=>{
        const name=settingNames[key];
        const fixedMatrixLevels=key==='importanceLevels'||key==='urgencyLevels';
        const categorizedType=key==='taskTypes'||key==='eventTypes';
        const editable=canEditSettingKey(key);
        const rows=scopedItems(key).map(({item,index})=>`<div class="setting-row ${categorizedType?'task-type-setting-row':''}" data-setting-key="${key}" data-setting-index="${index}">
          <span class="setting-drag-handle" draggable="true" title="ドラッグして並べ替え" aria-label="ドラッグして並べ替え">≡</span>
          <span><input class="setting-label-input" value="${escapeHtml(item.label)}" aria-label="${escapeHtml(name)}の候補名" ${editable?'':'disabled'} />${item.description?`<small class="setting-item-description">${escapeHtml(item.description)}</small>`:''}</span>
          ${categorizedType&&key==='taskTypes'?`<select class="setting-type-category" aria-label="この種類のカテゴリ" ${editable?'':'disabled'}>${categoryOptionsForSetting(item.category||'')}</select>`:''}
          <button class="btn small setting-rename" ${editable?'':'disabled'}>保存</button>
          <button class="icon-btn setting-delete" ${(item.protected||fixedMatrixLevels||!editable)?'disabled':''} title="削除">⌫</button>
        </div>`).join('');
        const addArea=fixedMatrixLevels?'<div class="setting-help">3×3表と連動するため3段階固定です。名称と順番を変更できます。</div>':categorizedType
          ?`<div class="setting-add task-type-setting-add"><input class="setting-new-input" data-setting-key="${key}" placeholder="${escapeHtml(key==='taskTypes'?addPlaceholder('PRIVATE'):'新しい種類を追加')}" ${editable?'':'disabled'} />${key==='taskTypes'?`<select class="setting-new-category" data-setting-key="${key}">${categoryOptionsForSetting('PRIVATE')}</select>`:''}<button class="btn small setting-add-btn" data-setting-key="${key}" ${editable?'':'disabled'}>追加</button></div>`
          :`<div class="setting-add"><input class="setting-new-input" data-setting-key="${key}" placeholder="新しい候補を追加" /><button class="btn small setting-add-btn" data-setting-key="${key}">追加</button></div>`;
        return `<details class="setting-section"><summary class="setting-head"><strong>${escapeHtml(name)}</strong><span class="tag">${scopedItems(key).length}件</span></summary>
          <div class="setting-list" data-setting-list-key="${key}">${rows}</div>${addArea}</details>`;
      }).join('');
    }
    function setupSettingsNavigation() {
      const settingsView=document.getElementById('settingsView');
      if(!settingsView||settingsView.dataset.settingsReady)return;
      settingsView.dataset.settingsReady='true';
      const orderedIds=['appearanceSettingsPanel','calendarSettingsPanel','menuSettingsPanel','categoryHierarchyPanel','dropdownSettingsPanel'];
      settingsView.prepend(...orderedIds.map(id=>document.getElementById(id)).filter(Boolean));
      const initiallyClosed=new Set(['appearanceSettingsPanel','calendarSettingsPanel','menuSettingsPanel','dropdownSettingsPanel']);
      [...settingsView.querySelectorAll(':scope > article.panel')].forEach(panel=>{
        panel.classList.add('settings-section-panel');
        const titleRow=panel.querySelector('.panel-title-row');
        if(titleRow&&!titleRow.querySelector('.settings-collapse-btn')){
          const toggle=document.createElement('button');
          toggle.type='button';
          toggle.className='btn small settings-collapse-btn';
          const collapsed=initiallyClosed.has(panel.id);
          panel.classList.toggle('is-collapsed',collapsed);
          toggle.setAttribute('aria-expanded',String(!collapsed));
          toggle.textContent=collapsed?'詳細を開く':'詳細を閉じる';
          toggle.addEventListener('click',()=>{
            const collapsed=panel.classList.toggle('is-collapsed');
            toggle.setAttribute('aria-expanded',String(!collapsed));
            toggle.textContent=collapsed?'詳細を開く':'詳細を閉じる';
          });
          titleRow.append(toggle);
        }
      });
    }
    function applySettingRename(key,index,newLabel) {
      if(!canManageDropdowns()){showToast('プルダウン設定はオーナー・運営のみ変更できます');return;}
      if(!canEditSettingKey(key)){showToast('イベント用の重要度・緊急度はオーナー・運営のみ変更できます');return;}
      const item=settingItems(key)[index];
      if(!item||!newLabel.trim())return;
      item.label=newLabel.trim();
      syncRuntimeSettings(); populateAllDropdowns(); saveState('候補名を変更しました');
    }
    function applyTypeCategory(key,index,category) {
      if(!canManageDropdowns()){showToast('プルダウン設定はオーナー・運営のみ変更できます');return;}
      if(!canEditSettingKey(key))return;
      const item=settingItems(key)[index];if(!item)return;
      item.category=category||'';populateAllDropdowns();saveState(`${key==='eventTypes'?'イベント':'タスク'}種類のカテゴリを変更しました`);
    }
    function addSettingItem(key,label,category='') {
      if(!canManageDropdowns()){showToast('プルダウン設定はオーナー・運営のみ変更できます');return;}
      if(!canEditSettingKey(key)){showToast('イベント用の重要度・緊急度はオーナー・運営のみ変更できます');return;}
      const clean=label.trim(); if(!clean)return;
      const categorizedType=key==='taskTypes'||key==='eventTypes';
      const duplicate=settingItems(key).some(item=>item.label===clean && (!categorizedType||(item.category||'')===(category||'')));
      if(duplicate){showToast('同じ名前の候補があります');return;}
      const value=`custom_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      const scoped=['eventTypes','taskStatuses','noteTypes'].includes(key);
      settingItems(key).push({value,label:clean,...(categorizedType?{category:category||''}:{}),...(scoped?{scope:activeWorkspace===eventWorkspaceId?'event':'personal'}:{})});
      syncRuntimeSettings(); populateAllDropdowns(); saveState('候補を追加しました');
    }
    function deleteSettingItem(key,index) {
      if(!canManageDropdowns()){showToast('プルダウン設定はオーナー・運営のみ変更できます');return;}
      if(!canEditSettingKey(key)){showToast('イベント用の重要度・緊急度はオーナー・運営のみ変更できます');return;}
      const item=settingItems(key)[index]; if(!item)return;
      if(item.protected){showToast('この候補は削除できません');return;}
      if(settingUsed(key,item.value)){showToast('使用中の候補は削除できません');return;}
      settingItems(key).splice(index,1);
      syncRuntimeSettings(); populateAllDropdowns(); saveState('候補を削除しました');
    }
    function moveSettingItem(key,fromIndex,toIndex) {
      if(!canManageDropdowns()){showToast('プルダウン設定はオーナー・運営のみ変更できます');return;}
      if(!canEditSettingKey(key)){showToast('イベント用の重要度・緊急度はオーナー・運営のみ変更できます');return;}
      const items=settingItems(key);if(fromIndex<0||fromIndex>=items.length)return;
      const [item]=items.splice(fromIndex,1);
      const safe=Math.max(0,Math.min(toIndex,items.length));items.splice(safe,0,item);
      syncRuntimeSettings();populateAllDropdowns();saveState('プルダウン候補の順番を変更しました');
    }

    function scheduleUserKey() {
      return window.currentStaffUser?.uid||window.currentStaffUser?.email||window.currentStaffUser?.name||'';
    }
    function scheduleUserName() {
      return window.currentStaffUser?.name||window.currentStaffUser?.email||'スタッフ';
    }
    function scheduleSlots(start,end,times) {
      const result=[];let cursor=parseLocalDate(start),last=parseLocalDate(end);
      if(!cursor||!last||cursor>last)return result;
      while(cursor<=last){
        const date=localDateString(cursor);
        times.forEach(time=>result.push({id:`${date}T${time}`,date,time}));
        cursor=addDays(cursor,1);
      }
      return result;
    }
    function scheduleTimeRow(value='20:00') {
      return `<div class="schedule-time-row"><input type="time" class="schedule-time-input" value="${escapeHtml(value)}" required /><button class="icon-btn schedule-remove-time" type="button" title="この時間を削除" aria-label="この時間を削除">✕</button></div>`;
    }
    function setScheduleTimes(times=['20:00']) {
      const picker=document.getElementById('schedulePollTimePicker');if(!picker)return;
      const values=Array.isArray(times)&&times.length?times:['20:00'];
      picker.innerHTML=values.map(scheduleTimeRow).join('');
    }
    function addScheduleTime(value='') {
      const picker=document.getElementById('schedulePollTimePicker');if(!picker)return;
      picker.insertAdjacentHTML('beforeend',scheduleTimeRow(value));
      picker.querySelector('.schedule-time-row:last-child .schedule-time-input')?.focus();
    }
    function scheduleResponseComplete(poll,userKey=scheduleUserKey()) {
      const answers=poll?.responses?.[userKey]?.answers||{};
      return Boolean(poll?.slots?.length)&&poll.slots.every(slot=>['yes','no','maybe'].includes(answers[slot.id]?.status));
    }
    function scheduleStatusLabel(status) {
      return status==='yes'?'〇':status==='no'?'×':status==='maybe'?'△':'—';
    }
    function scheduleStatusText(status) {
      return status==='yes'?'参加可能':status==='no'?'参加不可':status==='maybe'?'条件付き':'未回答';
    }
    function scheduleBestSlots(poll) {
      const responses=Object.values(poll.responses||{});
      return (poll.slots||[]).map(slot=>{
        const values=responses.map(response=>response.answers?.[slot.id]?.status).filter(Boolean);
        return {slot,yes:values.filter(value=>value==='yes').length,maybe:values.filter(value=>value==='maybe').length,no:values.filter(value=>value==='no').length,total:values.length,score:values.filter(value=>value==='yes').length*2+values.filter(value=>value==='maybe').length};
      }).sort((a,b)=>b.score-a.score||b.yes-a.yes||a.no-b.no);
    }
    function scheduleResponseDetailsHtml(poll) {
      return Object.values(poll.responses||{}).map(response=>`<article class="schedule-response-person">
        <div class="schedule-response-person-head"><strong>${escapeHtml(response.name||'スタッフ')}</strong><small>${response.updatedAt?`回答 ${escapeHtml(new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(response.updatedAt)))}`:''}</small></div>
        <div class="schedule-response-answers">${(poll.slots||[]).map(slot=>{
          const answer=response.answers?.[slot.id]||{},status=answer.status||'';
          return `<div class="schedule-response-answer">
            <span class="schedule-response-date">${escapeHtml(dateLabel(slot.date,false))}<strong>${escapeHtml(slot.time)}</strong></span>
            <span class="schedule-response-status status-${status||'empty'}"><b>${scheduleStatusLabel(status)}</b>${escapeHtml(scheduleStatusText(status))}</span>
            ${answer.comment?`<span class="schedule-response-comment">💬 ${escapeHtml(answer.comment)}</span>`:''}
          </div>`;
        }).join('')}</div>
      </article>`).join('');
    }
    function renderScheduleNotifications() {
      const wrap=document.getElementById('persistentNotifications');if(!wrap)return;
      const userKey=scheduleUserKey();
      if(!userKey){wrap.innerHTML='';return;}
      const pending=state.schedulePolls.filter(poll=>poll.notify!==false&&poll.status!=='closed'&&!scheduleResponseComplete(poll,userKey));
      wrap.innerHTML=pending.map(poll=>`<button class="persistent-notification" type="button" data-open-schedule="${poll.id}">
        <span class="notification-icon">◷</span><span><small>日程調整のお願い</small><strong>${escapeHtml(poll.title)}</strong><em>回答期限 ${escapeHtml(dateLabel(poll.deadline,false))}</em></span><span class="notification-arrow">→</span>
      </button>`).join('');
    }
    function schedulePollCardHtml(poll) {
      const userKey=scheduleUserKey(),ownAnswers=poll.responses?.[userKey]?.answers||{};
      const complete=scheduleResponseComplete(poll,userKey),best=scheduleBestSlots(poll);
      const responseCount=Object.keys(poll.responses||{}).length;
      return `<article class="panel schedule-poll-card" data-schedule-poll="${poll.id}">
        <div class="schedule-card-head">
          <div><div class="eyebrow">${poll.status==='closed'?'Closed':'Collecting Answers'}</div><h3>${escapeHtml(poll.title)}</h3><p>${escapeHtml(poll.description||'候補日時ごとに参加可否を入力してください。')}</p></div>
          <div class="schedule-head-actions"><span class="schedule-completion ${complete?'is-complete':''}">${complete?'✓ 回答済み':'未回答'}</span>${canManageTasks()?`<button class="icon-btn schedule-poll-edit" title="編集">✎</button><button class="icon-btn schedule-poll-delete" title="削除">⌫</button>`:''}</div>
        </div>
        <div class="schedule-meta"><span>回答期限 <strong>${escapeHtml(dateLabel(poll.deadline,false))}</strong></span><span><strong>${responseCount}名</strong>が回答</span>${best[0]?`<span>現在の有力候補 <strong>${escapeHtml(dateLabel(best[0].slot.date,false))} ${escapeHtml(best[0].slot.time)}</strong></span>`:''}</div>
        <div class="schedule-table-wrap"><table class="schedule-table"><thead><tr><th>候補日時</th><th>あなたの回答</th><th>集計</th></tr></thead><tbody>
          ${(poll.slots||[]).map(slot=>{const answer=ownAnswers[slot.id]||{};const tally=best.find(item=>item.slot.id===slot.id)||{yes:0,maybe:0,no:0};return `<tr data-schedule-slot="${slot.id}">
            <td><strong>${escapeHtml(dateLabel(slot.date,false))}</strong><span>${escapeHtml(slot.time)}</span></td>
            <td><div class="schedule-choice-group">${[['yes','〇'],['no','×'],['maybe','△']].map(([value,label])=>`<button type="button" class="schedule-choice choice-${value} ${answer.status===value?'selected':''}" data-schedule-choice="${value}" aria-label="${scheduleStatusText(value)}">${label}<small>${scheduleStatusText(value)}</small></button>`).join('')}</div>
            <input class="schedule-comment" value="${escapeHtml(answer.comment||'')}" placeholder="△の条件を入力（例：21時以降）" ${answer.status==='maybe'?'':'hidden'} /></td>
            <td><div class="schedule-tally"><span class="yes">〇 ${tally.yes}</span><span class="maybe">△ ${tally.maybe}</span><span class="no">× ${tally.no}</span></div></td>
          </tr>`;}).join('')}
        </tbody></table></div>
        <div class="schedule-card-footer"><div class="schedule-legend">〇 参加可能　× 参加不可　△ 条件付き</div><button class="btn primary schedule-save-response" type="button">回答を保存</button></div>
        ${responseCount?`<details class="schedule-response-details"><summary>みんなの回答を見る（${responseCount}名）</summary><div class="schedule-response-list">${scheduleResponseDetailsHtml(poll)}</div></details>`:''}
      </article>`;
    }
    function renderSchedulePolls() {
      const list=document.getElementById('schedulePollList'),summary=document.getElementById('schedulePollSummary');if(!list)return;
      const active=state.schedulePolls.filter(poll=>poll.status!=='closed');
      const pending=active.filter(poll=>!scheduleResponseComplete(poll));
      if(summary)summary.innerHTML=`<div><span>受付中</span><strong>${active.length}</strong></div><div><span>あなたの未回答</span><strong>${pending.length}</strong></div><div><span>回答済み</span><strong>${active.length-pending.length}</strong></div>`;
      list.innerHTML=state.schedulePolls.length?state.schedulePolls.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).map(schedulePollCardHtml).join(''):'<div class="panel empty-state"><div class="empty-state-icon">◷</div><h3>日程調整はまだありません</h3><p>候補期間と時間を決めて、みんなに回答をお願いしましょう。</p></div>';
      renderScheduleNotifications();
    }
    function openSchedulePollDialog(poll=null) {
      if(!canManageTasks()){showToast('日程調整を作成・編集できるのはイベントオーナー・運営のみです');return;}
      document.getElementById('schedulePollForm').reset();
      document.getElementById('schedulePollId').value=poll?.id||'';
      document.getElementById('schedulePollModalTitle').textContent=poll?'日程調整を編集':'日程調整を作成';
      document.getElementById('schedulePollTitle').value=poll?.title||'';
      document.getElementById('schedulePollDescription').value=poll?.description||'';
      document.getElementById('schedulePollStart').value=poll?.start||localDateString();
      document.getElementById('schedulePollEnd').value=poll?.end||localDateString(addDays(new Date(),6));
      setScheduleTimes(poll?.times||['20:00']);
      document.getElementById('schedulePollDeadline').value=poll?.deadline||localDateString(addDays(new Date(),3));
      document.getElementById('schedulePollNotify').checked=poll?.notify!==false;
      document.getElementById('schedulePollFormError').hidden=true;
      document.getElementById('schedulePollDialog').showModal();
    }

    const PERMISSION_ROLE_LABELS={event_owner:'イベントオーナー',operations:'運営',external_collaborator:'外部協力',staff:'スタッフ',cast:'キャスト'};
    const PERMISSION_ROLES=Object.keys(PERMISSION_ROLE_LABELS);
    let selectedPermissionEventId='';
    function permissionUserName(uidValue) { return state.users?.[uidValue]?.displayName||uidValue||'不明なユーザー'; }
    function permissionAudit(operation,targetType,targetId,message) {
      state.auditLogs=state.auditLogs&&typeof state.auditLogs==='object'?state.auditLogs:{};
      const id=uid('audit');
      state.auditLogs[id]={actorUid:window.currentStaffUser?.uid||'local-user',eventId:selectedPermissionEventId,targetType,targetId,operation,at:new Date().toISOString(),reason:message};
    }
    function permissionEventEntries() { return Object.entries(state.permissionEvents||{}); }
    function renderPermissions() {
      const eventEntries=permissionEventEntries();
      if(!eventEntries.some(([id])=>id===selectedPermissionEventId))selectedPermissionEventId=eventEntries[0]?.[0]||'';
      const eventSelect=document.getElementById('permissionEventSelect');
      eventSelect.innerHTML=eventEntries.length?eventEntries.map(([id,event])=>`<option value="${escapeHtml(id)}">${escapeHtml(event.title||id)}</option>`).join(''):'<option value="">イベントデータなし</option>';
      eventSelect.value=selectedPermissionEventId;
      const event=state.permissionEvents?.[selectedPermissionEventId]||{};
      const members=Object.entries(event.members||{});
      const projects=Object.entries(state.permissionProjects||{}).filter(([,project])=>project.eventId===selectedPermissionEventId);
      const permissionInvites=Object.entries(event.invitations||{});
      const ownerInvites=(state.adminConfig?.invites||[]).map(invite=>[invite.id,{...invite,uses:invite.used,kind:'event'}]);
      const invites=[...permissionInvites,...ownerInvites.filter(([id])=>!permissionInvites.some(([permissionId])=>permissionId===id))];
      const activeInvites=invites.filter(([,invite])=>invite.active!==false).length;
      document.getElementById('permissionSummary').innerHTML=[
        ['参加メンバー',`${members.length}名`],['プロジェクト',`${projects.length}件`],['有効な招待',`${activeInvites}件`],['監査ログ',`${Object.keys(state.auditLogs||{}).length}件`]
      ].map(([label,value])=>`<article><span>${label}</span><strong>${value}</strong></article>`).join('');
      document.getElementById('permissionMemberRows').innerHTML=members.length?members.map(([memberUid,member])=>{
        const owner=event.owners?.[memberUid];
        return `<tr data-permission-member="${escapeHtml(memberUid)}"><td><strong>${escapeHtml(permissionUserName(memberUid))}</strong><small>${escapeHtml(memberUid)}</small></td><td><select class="permission-member-role">${PERMISSION_ROLES.map(role=>`<option value="${role}" ${member.role===role?'selected':''}>${PERMISSION_ROLE_LABELS[role]}</option>`).join('')}</select></td><td><label class="permission-switch"><input class="permission-member-active" type="checkbox" ${member.active!==false?'checked':''}/><span>${member.active!==false?'利用中':'停止中'}</span></label></td><td>${owner?.isRepresentative?'<span class="tag">代表</span>':'—'}</td></tr>`;
      }).join(''):'<tr><td colspan="4" class="muted">メンバーが登録されていません。</td></tr>';
      document.getElementById('permissionProjectList').innerHTML=projects.length?projects.map(([projectId,project])=>{
        const visibility=project.visibility||{};const allowedRoles=visibility.allowedRoles||[];const projectMembers=visibility.members||{};
        const roleChecks=PERMISSION_ROLES.map(role=>`<label><input class="permission-project-role" type="checkbox" data-project-id="${escapeHtml(projectId)}" data-role="${role}" ${allowedRoles.includes(role)?'checked':''}/> ${PERMISSION_ROLE_LABELS[role]}</label>`).join('');
        const externalRows=Object.entries(projectMembers).map(([memberUid,permissions])=>`<div class="permission-external-row" data-project-id="${escapeHtml(projectId)}" data-member-uid="${escapeHtml(memberUid)}"><strong>${escapeHtml(permissionUserName(memberUid))}</strong>${[['canView','閲覧'],['canAddTask','タスク追加'],['canComment','コメント'],['canViewFiles','ファイル']].map(([key,label])=>`<label><input class="permission-project-grant" type="checkbox" data-permission="${key}" ${permissions[key]===true?'checked':''}/> ${label}</label>`).join('')}</div>`).join('');
        const individual=(visibility.allowedUsers||[]).map(uidValue=>`<span class="tag">${escapeHtml(permissionUserName(uidValue))}</span>`).join('')||'<span class="muted">なし</span>';
        return `<section class="permission-project-card"><div><h4>${escapeHtml(project.name||projectId)}</h4><small>${escapeHtml(projectId)}</small></div><div class="permission-role-checks">${roleChecks}</div><div class="permission-individual"><strong>個別公開</strong>${individual}</div><div>${externalRows||'<div class="muted">外部協力者の個別権限はありません。</div>'}</div></section>`;
      }).join(''):'<div class="empty-state"><p>このイベントのプロジェクト権限データはありません。</p></div>';
      document.getElementById('permissionInviteList').innerHTML=invites.length?invites.map(([inviteId,invite])=>{
        const expiry=invite.expiresAt?new Date(invite.expiresAt).toLocaleDateString('ja-JP'):'未設定';
        return `<div class="permission-list-card"><div><strong>${escapeHtml(invite.kind==='external'?'外部協力者用':invite.kind==='owner'?'オーナー用':'イベント用')}</strong><small>${escapeHtml(invite.role||'')}・期限 ${escapeHtml(expiry)}・使用 ${Number(invite.uses)||0}回</small></div><button class="btn small ${invite.active===false?'':'danger'} permission-invite-toggle" data-invite-id="${escapeHtml(inviteId)}">${invite.active===false?'再有効化':'無効化'}</button></div>`;
      }).join(''):'<div class="muted">招待リンクはありません。</div>';
      const logs=Object.entries(state.auditLogs||{}).filter(([,log])=>!selectedPermissionEventId||!log.eventId||log.eventId===selectedPermissionEventId).sort(([,a],[,b])=>String(b.at||'').localeCompare(String(a.at||''))).slice(0,30);
      document.getElementById('permissionAuditList').innerHTML=logs.length?logs.map(([,log])=>`<div class="permission-list-card"><div><strong>${escapeHtml(log.reason||log.operation||'変更')}</strong><small>${escapeHtml(permissionUserName(log.actorUid))}・${escapeHtml(log.at?new Date(log.at).toLocaleString('ja-JP'):'日時不明')}</small></div><span class="tag">${escapeHtml(log.targetType||'data')}</span></div>`).join(''):'<div class="muted">操作履歴はありません。</div>';
    }

    function setEventIconPreview(id,src=''){
      const host=document.getElementById(id);if(!host)return;
      host.innerHTML=src?`<img src="${escapeHtml(src)}" alt="イベントアイコンのプレビュー" />`:'<span>◆</span>';
    }
    function imageFileData(file){
      if(!file)return Promise.resolve('');
      if(file.size>2*1024*1024)return Promise.reject(new Error('size'));
      return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});
    }
    function renderAdminEvent(){
      const event=state.adminConfig?.event||{};
      [['adminEventName','name'],['adminEventGroupLink','groupLink'],['adminEventXLink','xLink'],['adminEventDiscord','discord']].forEach(([id,key])=>{const input=document.getElementById(id);if(input)input.value=event[key]||'';});
      setEventIconPreview('adminEventIconPreview',event.icon);
    }
    function renderAdminAudit(){
      const host=document.getElementById('adminAuditList');if(!host)return;
      const role=document.getElementById('adminAuditRole')?.value||'all';
      const permissionLogs=Object.values(state.auditLogs||{}).map(log=>({...log,message:log.reason||log.operation||'権限を変更',timestamp:log.at}));
      const logs=[...(state.changeLog||[]),...permissionLogs].map(log=>{
        const uidValue=log.actorUid||log.userUid||'';
        const user=state.users?.[uidValue]||{};
        return {...log,actorRole:normalizeStaffRole(log.actorRole||user.role||'cast'),actorName:log.actorName||log.by||log.user||user.displayName||permissionUserName(uidValue)};
      }).filter(log=>role==='all'||log.actorRole===role).sort((a,b)=>String(b.timestamp||b.at||'').localeCompare(String(a.timestamp||a.at||''))).slice(0,200);
      host.innerHTML=logs.length?logs.map(log=>`<div class="permission-list-card"><div><strong>${escapeHtml(log.message||log.action||'操作')}</strong><small>${escapeHtml(log.actorName||'不明')}・${escapeHtml(TASK_AUDIENCE_LABELS[log.actorRole]||log.actorRole)}・${escapeHtml(log.timestamp||log.at?new Date(log.timestamp||log.at).toLocaleString('ja-JP'):'日時不明')}</small></div></div>`).join(''):'<div class="empty">操作ログはまだありません。</div>';
    }
    function inviteUrl(invite){return `${location.origin}/app/?invite=${encodeURIComponent(invite.token)}`;}
    async function copyInviteText(text,input){
      try{
        if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);
        else{
          input?.focus();input?.select();
          if(!document.execCommand('copy'))throw new Error('copy failed');
        }
        showToast('招待リンクをコピーしました');
      }catch(error){
        console.error(error);
        input?.focus();input?.select();
        showToast('リンクを選択しました。手動でコピーしてください');
      }
    }
    function renderAdminInvites(){
      const host=document.getElementById('adminInviteList');if(!host)return;
      const roleLabels={operations:'運営',staff:'スタッフ',cast:'キャスト',external_collaborator:'外部協力者'};
      const invites=state.adminConfig?.invites||[];
      host.innerHTML=invites.length?invites.slice().reverse().map(invite=>`<div class="permission-list-card" data-admin-invite="${escapeHtml(invite.id)}"><div><strong>${escapeHtml(roleLabels[invite.role]||invite.role)}招待</strong><small>期限 ${escapeHtml(invite.expiresAt?new Date(invite.expiresAt).toLocaleString('ja-JP'):'未設定')}・使用 ${Number(invite.used)||0}/${Number(invite.limit)||1}回</small><input value="${escapeHtml(inviteUrl(invite))}" readonly /></div><div class="inline-actions"><button class="btn small admin-invite-copy">コピー</button><button class="btn small admin-invite-toggle">${invite.active===false?'再有効化':'無効化'}</button></div></div>`).join(''):'<div class="empty">発行済みの招待リンクはありません。</div>';
    }
    function adminLinkRow(link={id:uid('link'),label:'',url:'',roles:['owner','operations']}){
      const roles=['owner','operations','staff','cast','external_collaborator'];
      return `<div class="permission-list-card admin-data-link-row" data-link-id="${escapeHtml(link.id)}"><div class="form-grid"><label class="field"><span>表示名</span><input class="admin-link-label" value="${escapeHtml(link.label||'')}"/></label><label class="field"><span>URL</span><input class="admin-link-url" type="url" value="${escapeHtml(link.url||'')}" placeholder="https://..."/></label><div class="field span-2"><span>表示ロール</span><div class="inline-actions">${roles.map(role=>`<label><input class="admin-link-role" type="checkbox" value="${role}" ${(link.roles||[]).includes(role)?'checked':''}/> ${escapeHtml(TASK_AUDIENCE_LABELS[role])}</label>`).join('')}</div></div></div><button class="btn small danger admin-link-delete">削除</button></div>`;
    }
    function renderAdminLinks(){const host=document.getElementById('adminDataLinkRows');if(host)host.innerHTML=(state.adminConfig?.links||[]).map(adminLinkRow).join('');}
    function renderAdminRoles(){
      const host=document.getElementById('adminRoleList');if(!host)return;
      const roles=state.adminConfig?.customRoles||[];
      host.innerHTML=roles.length?roles.map(role=>`<div class="permission-list-card admin-role-row" data-role-id="${escapeHtml(role.id)}"><div class="form-grid"><label class="field"><span>ロール名</span><input class="admin-role-name" maxlength="40" value="${escapeHtml(role.name)}" /></label><label class="field"><span>基準権限</span><select class="admin-role-base"><option value="operations" ${role.baseRole==='operations'?'selected':''}>運営</option><option value="staff" ${role.baseRole==='staff'?'selected':''}>スタッフ</option><option value="cast" ${role.baseRole==='cast'?'selected':''}>キャスト</option><option value="external_collaborator" ${role.baseRole==='external_collaborator'?'selected':''}>外部協力者</option></select></label></div><div class="inline-actions"><button class="btn small admin-role-save">保存</button><button class="btn small danger admin-role-delete">削除</button></div></div>`).join(''):'<div class="empty">追加ロールはありません。</div>';
    }

    let globalAdminData={events:{},applications:{},auditLogs:{},trash:{},recovery:{}};
    const FIXED_EVENT_ID='arasaki-shipyard';
    function ensureFixedGlobalEvent(){
      globalAdminData.events=globalAdminData.events||{};
      if(!globalAdminData.events[FIXED_EVENT_ID])globalAdminData.events[FIXED_EVENT_ID]={id:FIXED_EVENT_ID,name:'荒嵜造船所',icon:'',groupLink:'',xLink:'',discord:'',representativeName:'',members:{},fixed:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    }
    function globalAudit(action,eventId='',detail=''){
      const id=uid('global_audit');globalAdminData.auditLogs[id]={id,action,eventId,detail,actorUid:window.currentStaffUser?.uid||'',actorName:window.currentStaffUser?.name||'全体管理者',at:new Date().toISOString()};
    }
    function saveGlobalAdminData(message=''){
      window.globalAdminCloud?.save(globalAdminData).catch(error=>{console.error(error);showToast('全体管理データを同期できませんでした');});
      renderAll();if(message)showToast(message);
    }
    window.setGlobalAdminData=data=>{globalAdminData={events:{},applications:{},auditLogs:{},trash:{},recovery:{},...(data||{})};ensureFixedGlobalEvent();renderAll();};
    function maintainGlobalDeletionLifecycle(){
      const now=Date.now(),day=86400000;let changed=false;
      Object.entries(globalAdminData.trash||{}).forEach(([id,item])=>{if(now-new Date(item.deletedAt).getTime()>=30*day){globalAdminData.recovery[id]={...item,permanentlyDeletedAt:new Date().toISOString()};delete globalAdminData.trash[id];changed=true;}});
      Object.entries(globalAdminData.recovery||{}).forEach(([id,item])=>{if(now-new Date(item.permanentlyDeletedAt).getTime()>=10*day){delete globalAdminData.recovery[id];changed=true;}});
      if(changed)window.globalAdminCloud?.save(globalAdminData).catch(console.error);
    }
    function globalRemaining(item,days,key){return Math.max(0,Math.ceil((days*86400000-(Date.now()-new Date(item[key]).getTime()))/86400000));}
    function globalEventIconFallback(){
      const placeholder=document.createElement('span');
      placeholder.className='global-event-icon global-event-icon-placeholder';
      placeholder.setAttribute('aria-hidden','true');
      placeholder.textContent='◆';
      return placeholder;
    }
    function renderGlobalEventList(){
      const host=document.getElementById('globalEventList');if(!host)return;ensureFixedGlobalEvent();maintainGlobalDeletionLifecycle();
      const events=Object.values(globalAdminData.events||{});
      host.innerHTML=events.length?events.map(event=>{
        const members=Object.values(event.members||{});
        const application=Object.values(globalAdminData.applications||{}).find(item=>item.eventId===event.id);
        const applicationStatus=event.representativeName?'承認済み':application?.status==='pending'?'申請中':application?.status==='rejected'?'見送り':event.invite?'招待済み':'未申請';
        const icon=event.icon?`<img class="global-event-icon" src="${escapeHtml(event.icon)}" alt="" loading="lazy"/>`:`<span class="global-event-icon global-event-icon-placeholder" aria-hidden="true">◆</span>`;
        return `<article class="panel permission-project-card" data-global-event="${escapeHtml(event.id)}"><div class="panel-title-row global-event-list-row"><div class="global-event-summary">${icon}<div><h3>${escapeHtml(event.name)}${event.fixed?'<span class="tag">固定</span>':''}</h3><div class="panel-sub">代表者：${escapeHtml(event.representativeName||application?.displayName||applicationStatus)} / 参加人数${members.length}名</div><div class="global-event-application-status">申請状況：${escapeHtml(applicationStatus)}</div></div></div><div class="inline-actions"><button class="btn small global-event-details">詳細</button><button class="btn small global-event-edit">編集</button><button class="btn small global-owner-invite">招待リンク発行</button>${event.fixed?'':'<button class="btn small danger global-event-delete">イベント削除</button>'}</div></div>${event.invite?`<div class="setting-help global-invite-link"><span>代表者招待：</span><input value="${escapeHtml(`${location.origin}/app/?globalInvite=${event.invite.token}&event=${event.id}`)}" readonly/><button class="btn small global-owner-invite-copy" type="button">コピー</button></div>`:''}</article>`;
      }).join(''):'<div class="empty">登録イベントはありません。</div>';
      host.querySelectorAll('img.global-event-icon').forEach(img=>img.addEventListener('error',()=>img.replaceWith(globalEventIconFallback()),{once:true}));
    }
    function renderGlobalEventDetails(){
      const event=globalAdminData.events?.[selectedGlobalEventId];
      const title=document.getElementById('globalEventDetailsName');
      const memberHost=document.getElementById('globalEventMemberList');
      const logHost=document.getElementById('globalEventLogList');
      if(!event){if(title)title.textContent='イベント詳細';if(memberHost)memberHost.innerHTML='<div class="empty">イベントが見つかりません。</div>';if(logHost)logHost.innerHTML='';return;}
      if(title)title.textContent=event.name;
      const members=Object.values(event.members||{});
      const logs=Object.values(globalAdminData.auditLogs||{}).filter(log=>log.eventId===event.id).sort((a,b)=>String(b.at).localeCompare(String(a.at)));
      if(memberHost)memberHost.innerHTML=members.length?members.map(member=>`<div class="permission-list-card"><div><strong>${escapeHtml(member.name||member.displayName||'名前未設定')}</strong>${member.vrchat?`<small><a href="${escapeHtml(member.vrchat)}" target="_blank" rel="noopener noreferrer">VRChatプロフィール</a></small>`:''}</div><span class="tag">${escapeHtml(member.role||'参加者')}</span></div>`).join(''):'<div class="empty">参加メンバーはいません。</div>';
      if(logHost)logHost.innerHTML=logs.length?logs.map(log=>`<div class="permission-list-card"><div><strong>${escapeHtml(log.action)}</strong><small>${escapeHtml(log.actorName||'全体管理者')}・${escapeHtml(new Date(log.at).toLocaleString('ja-JP'))}</small></div></div>`).join(''):'<div class="empty">操作ログはありません。</div>';
    }
    function renderGlobalApplications(){
      const host=document.getElementById('globalApplicationList');if(!host)return;
      const apps=Object.values(globalAdminData.applications||{}).filter(app=>app.status==='pending');
      host.innerHTML=apps.length?apps.map(app=>`<div class="staff-request-card" data-global-application="${escapeHtml(app.id)}"><div class="staff-request-top"><div><div class="staff-request-name">${escapeHtml(globalAdminData.events?.[app.eventId]?.name||'イベント未設定')}</div><div class="staff-request-email">オーナー名：${escapeHtml(app.displayName||'名前未設定')}</div></div><span class="tag">オーナー申請</span></div><div class="staff-request-meta">オーナープロフィール：${app.vrchat?`<a href="${escapeHtml(app.vrchat)}" target="_blank" rel="noopener noreferrer">VRChatプロフィールを開く</a>`:'VRChatリンク未登録'}</div><div class="staff-request-actions"><button class="btn small success global-application-approve" ${app.vrchat?'':'disabled'}>許可</button><button class="btn small danger global-application-reject">見送り</button></div></div>`).join(''):'<div class="empty">承認待ちのイベントオーナー申請はありません。</div>';
    }
    function renderGlobalAudit(){const host=document.getElementById('globalAuditList');if(host){const logs=Object.values(globalAdminData.auditLogs||{}).sort((a,b)=>String(b.at).localeCompare(String(a.at)));host.innerHTML=logs.length?logs.map(log=>`<div class="permission-list-card"><div><strong>${escapeHtml(log.action)}</strong><small>${escapeHtml(log.actorName||'全体管理者')}・${escapeHtml(new Date(log.at).toLocaleString('ja-JP'))}</small></div><span class="tag">${escapeHtml(globalAdminData.events?.[log.eventId]?.name||'全体')}</span></div>`).join(''):'<div class="empty">操作ログはありません。</div>';}}
    function renderGlobalTrash(){
      const trash=document.getElementById('globalTrashList'),recovery=document.getElementById('globalRecoveryList');if(!trash||!recovery)return;maintainGlobalDeletionLifecycle();
      const trashed=Object.values(globalAdminData.trash||{}),recoverable=Object.values(globalAdminData.recovery||{});
      trash.innerHTML=trashed.length?trashed.map(item=>`<div class="trash-row" data-global-trash="${escapeHtml(item.id)}"><div><strong>${escapeHtml(item.record?.name||'イベント')}</strong><small>あと${globalRemaining(item,30,'deletedAt')}日</small></div><div class="inline-actions"><button class="btn small global-trash-restore">復元</button><button class="btn small danger global-trash-purge">完全削除</button></div></div>`).join(''):'<div class="empty">ゴミ箱は空です。</div>';
      recovery.innerHTML=recoverable.length?recoverable.map(item=>`<div class="trash-row" data-global-recovery="${escapeHtml(item.id)}"><div><strong>${escapeHtml(item.record?.name||'イベント')}</strong><small>復元期限まで${globalRemaining(item,10,'permanentlyDeletedAt')}日</small></div><button class="btn small global-recovery-restore">管理者復元</button></div>`).join(''):'<div class="empty">復元可能な完全削除データはありません。</div>';
    }

    function renderAll() {
      // v0.7: 変更のたびに全ページを再描画せず、現在表示中のページだけを更新します。
      maintainDeletionLifecycle();
      syncRuntimeSettings();
      populateAllDropdowns();
      updateRoleControls();
      renderNavigation();
      if (currentView==='home') renderHome();
      else if (['tasksAssigned','tasksAll','tasksOperations','tasksStaff','tasksCast'].includes(currentView)) renderTasks();
      else if (currentView==='triage') {renderTaskTriage();renderIdeaTriage();}
      else if (currentView==='events') renderEvents();
      else if (currentView==='projects') renderProjects();
      else if (currentView==='meetings') renderMeetings();
      else if (currentView==='schedulePolls') renderSchedulePolls();
      else if (currentView==='notes') renderNotes();
      else if (currentView==='yearly') renderYearlyLog();
      else if (currentView==='calendar') renderCalendar();
      else if (currentView==='future') renderFutureLog();
      else if (currentView==='weekly') renderWeeklyLog();
      else if (currentView==='daily') renderDailyLog();
      else if (currentView==='mypage') window.renderMyPage?.();
      else if (currentView==='permissions') renderPermissions();
      else if (currentView==='settings') renderSettings();
      else if(currentView==='adminEvent')renderAdminEvent();
      else if(currentView==='adminAudit')renderAdminAudit();
      else if(currentView==='adminInvites')renderAdminInvites();
      else if(currentView==='adminLinks')renderAdminLinks();
      else if(currentView==='adminRoles')renderAdminRoles();
      else if(currentView==='globalEventList')renderGlobalEventList();
      else if(currentView==='globalEventDetails')renderGlobalEventDetails();
      else if(currentView==='globalApplications')renderGlobalApplications();
      else if(currentView==='globalAudit')renderGlobalAudit();
      else if(currentView==='globalTrash')renderGlobalTrash();
      renderScheduleNotifications();
    }

    window.renderAllPlannerViews=renderAll;

    function updateEventRepeatUI(autoSelectWeekday=false) {
      const type=document.getElementById('eventRepeatType').value;
      const panel=document.getElementById('eventRepeatPanel');
      const weekdaysWrap=document.getElementById('eventRepeatWeekdaysWrap');
      panel.hidden=document.getElementById('eventRepeatToggle')?.getAttribute('aria-expanded')!=='true';
      weekdaysWrap.hidden=type!=='weekly';
      const units={daily:'日',weekly:'週',monthly:'か月',yearly:'年'};
      document.getElementById('eventRepeatUnit').textContent=units[type]||'回';
      const help={daily:'毎日・数日ごとの行事に使えます。',weekly:'毎週決まった曜日の予定に使えます。複数曜日を選べます。',monthly:'毎月の記念日や定例イベントに使えます。',yearly:'誕生日・記念日・年中行事におすすめです。'};
      document.getElementById('eventRepeatHelp').textContent=(help[type]||'')+(type==='none'?'':' カレンダー・Weekly Log・Daily Logに自動表示され、対象の種類はYearly Logにも表示されます。');
      if(type==='weekly'&&autoSelectWeekday){
        const checks=[...document.querySelectorAll('#eventRepeatWeekdays input')];
        if(!checks.some(input=>input.checked)){
          const date=parseLocalDate(document.getElementById('eventDate').value);
          const target=date&&checks.find(input=>Number(input.value)===date.getDay());
          if(target)target.checked=true;
        }
      }
    }
    function openEventDialog(event=null,preset={}) {
      const requestedWorkspace=event?.workspaceId||preset.workspaceId||(activeWorkspace==='all'?'personal':activeWorkspace);
      if(requestedWorkspace!=='personal'&&!canManageTasks()){showToast('イベント用の予定を追加・編集できるのはイベントオーナー・運営のみです');return;}
      document.getElementById('eventForm').reset();
      document.getElementById('eventModalTitle').textContent=event?'イベントを編集':'イベントを追加';
      document.getElementById('eventId').value=event?.id||'';
      document.getElementById('eventTitle').value=event?.title||'';
      const workspaceId=event?.workspaceId||preset.workspaceId||(activeWorkspace==='all'?'personal':activeWorkspace);
      refreshEventCategoryForWorkspace(workspaceId,event?.category||preset.category||'',event?.type||'');
      document.getElementById('eventDate').value=event?.date||preset.date||localDateString();
      document.getElementById('eventEndDate').value=event?.endDate||'';
      document.getElementById('eventTime').value=event?.time||'';
      document.getElementById('eventEndTime').value=event?.endTime||'';
      const colorInput=document.getElementById('eventBackgroundColor');
      colorInput.value=event?.backgroundColor||'#54c7ec';
      colorInput.dataset.custom=event?.backgroundColor?'true':'false';
      document.getElementById('eventAllDay').checked=event?.allDay!==false && !event?.time;
      document.getElementById('eventWorkspace').value=workspaceId;
      document.getElementById('eventPrivate').checked=!!event?.isPrivate;
      document.getElementById('eventPrivate').disabled=document.getElementById('eventWorkspace').value==='personal';
      if(document.getElementById('eventWorkspace').value==='personal')document.getElementById('eventPrivate').checked=true;
      document.getElementById('eventTime').disabled=false;
      document.getElementById('eventRepeatType').value=event?.repeatType||preset.repeatType||'none';
      const repeatExpanded=(event?.repeatType&&event.repeatType!=='none')||(preset.repeatType&&preset.repeatType!=='none');
      document.getElementById('eventRepeatToggle').setAttribute('aria-expanded',repeatExpanded?'true':'false');
      document.getElementById('eventRepeatToggle').textContent=repeatExpanded?'↻ 繰り返し設定を閉じる':'↻ 繰り返しを設定';
      document.getElementById('eventRepeatInterval').value=Math.max(1,Number(event?.repeatInterval)||1);
      document.getElementById('eventRepeatUntil').value=event?.repeatUntil||'';
      const selectedDays=Array.isArray(event?.repeatWeekdays)?event.repeatWeekdays.map(Number):[];
      document.querySelectorAll('#eventRepeatWeekdays input').forEach(input=>input.checked=selectedDays.includes(Number(input.value)));
      document.getElementById('eventNote').value=event?.note||'';
      updateEventRepeatUI();
      document.getElementById('eventDialog').showModal();
      setTimeout(()=>document.getElementById('eventTitle').focus(),50);
    }

    function clearTaskFormError() {
      const box=document.getElementById('taskFormError');
      if(!box)return;
      box.hidden=true;
      box.textContent='';
    }
    function showTaskFormError(message,fieldId='') {
      const box=document.getElementById('taskFormError');
      if(box){box.textContent=message;box.hidden=false;box.scrollIntoView({behavior:'smooth',block:'nearest'});}
      const field=fieldId?document.getElementById(fieldId):null;
      if(field)setTimeout(()=>field.focus(),60);
    }

    function updateTaskRepeatUI(autoSelectWeekday=false) {
      const type=document.getElementById('taskRepeatType').value;
      const panel=document.getElementById('taskRepeatPanel');
      const weekdaysWrap=document.getElementById('taskRepeatWeekdaysWrap');
      panel.hidden=type==='none';
      weekdaysWrap.hidden=type!=='weekly';
      const units={daily:'日',weekly:'週',monthly:'か月',yearly:'年'};
      document.getElementById('taskRepeatUnit').textContent=units[type]||'回';
      const help={
        daily:'完了すると、設定した日数後へ自動で進みます。',
        weekly:'ゴミ出しなど、曜日が決まっている予定に使えます。複数曜日を選べます。',
        monthly:'毎月の支払い・月次作業などに使えます。月末の日付は、その月の最終日に調整されます。',
        yearly:'誕生日・記念日などに使えます。完了すると翌年以降へ進みます。'
      };
      document.getElementById('taskRepeatHelp').textContent=(help[type]||'') + (type==='none'?'':' カレンダーとWeekly Logには今後の繰り返し予定も表示されます。');
      if (type==='weekly' && autoSelectWeekday) {
        const checks=[...document.querySelectorAll('#taskRepeatWeekdays input')];
        if (!checks.some(input=>input.checked)) {
          const due=parseLocalDate(document.getElementById('taskDue').value);
          if (due) {
            const target=checks.find(input=>Number(input.value)===due.getDay());
            if (target) target.checked=true;
          }
        }
      }
    }

    function updateTaskTaxonomyMode() {
      const personal=document.getElementById('taskWorkspace').value==='personal';
      document.getElementById('taskLegacyCategoryField').hidden=!personal;
      document.getElementById('taskLegacyTypeField').hidden=!personal;
      document.getElementById('taskHierarchyFields').hidden=personal;
      document.getElementById('taskMajorCategory').required=!personal;
    }
    function renderProjectTemplatePreview(templateId=document.getElementById('projectTemplate')?.value||'') {
      const box=document.getElementById('projectTemplatePreview');if(!box)return;
      const template=projectTemplate(templateId);
      if(!template){box.innerHTML='';populatePhaseSelect('projectPhase',document.getElementById('projectPhase')?.value||'planning');return;}
      const fields=(template.sections||[]).reduce((sum,section)=>sum+(section.fields||[]).length,0);
      box.innerHTML=`<div class="template-preview-head"><div><strong>${escapeHtml(template.name)}</strong><div class="panel-sub">${escapeHtml(template.description||'')}</div></div><span class="tag">v${template.version}</span></div><div class="template-preview-sections">${(template.sections||[]).map(section=>`<span class="template-preview-section">${escapeHtml(section.name)}・${section.fields?.length||0}項目</span>`).join('')}</div><div class="panel-sub" style="margin-top:8px">作成時に ${fields} 項目と ${template.generatedTasks?.length||0} 件の初期タスクをスナップショットとして複製します。</div>`;
      populatePhaseSelect('projectPhase',document.getElementById('projectPhase')?.value||template.phases?.find(phase=>phase.initial)?.id||template.phases?.[0]?.id||'',false,template.phases||[]);
    }
    function refreshProjectTemplateChoices(selected='') {
      const selection=hierarchySelection(PROJECT_HIERARCHY_IDS);
      const choices=projectTemplateCandidates(selection.majorCategoryId,selection.middleCategoryId);
      const el=document.getElementById('projectTemplate');if(!el)return;
      const current=selected||el.value;
      el.innerHTML='<option value="">テンプレートなし</option>'+choices.map(template=>`<option value="${escapeHtml(template.id)}">${escapeHtml(template.name)} v${template.version}</option>`).join('');
      el.value=[...el.options].some(option=>option.value===current)?current:'';
      renderProjectTemplatePreview(el.value);
    }
    function instantiateTemplateForProject(template,capturedAt=new Date().toISOString()) {
      if(!template)return {snapshot:null,values:{},tasks:[]};
      if(typeof DOMAIN.instantiateProjectTemplate==='function'){
        try{
          const result=DOMAIN.instantiateProjectTemplate(template,capturedAt);
          if(result){
            return {
              snapshot:result.snapshot||result.templateSnapshot||null,
              values:result.values||result.templateValues||{},
              tasks:result.tasks||result.generatedTasks||result.generatedTaskDefinitions||[]
            };
          }
        }catch(error){console.error('テンプレート展開エラー',error);}
      }
      const snapshot={templateId:template.id,templateVersion:template.version,templateName:template.name,capturedAt,phases:cloneData(template.phases||[]),sections:cloneData(template.sections||[]),generatedTasks:cloneData(template.generatedTasks||[])};
      const values={};
      snapshot.sections.flatMap(section=>section.fields||[]).forEach(field=>{values[field.id]={value:cloneData(field.defaultValue??''),completed:false};});
      return {snapshot,values,tasks:cloneData(template.generatedTasks||[])};
    }
    let activeProjectDetailTab='overview';
    const PROJECT_DETAIL_TABS=[
      ['overview','概要'],['template','テンプレート項目'],['tasks','タスク'],['schedule','スケジュール'],['meetings','会議'],['deliverables','成果物・URL'],['qa','品質確認'],['retrospective','振り返り'],['history','変更履歴']
    ];
    function templateFieldInputHtml(field,valueRecord={}) {
      const raw=valueRecord.value??field.defaultValue??'';
      const value=typeof raw==='object'?JSON.stringify(raw):String(raw);
      const common=`data-template-field="${escapeHtml(field.id)}"`;
      if(field.inputType==='longText'||field.inputType==='richList')return `<textarea ${common} placeholder="${escapeHtml(field.description||'')}">${escapeHtml(value)}</textarea>`;
      if(field.inputType==='number'||field.inputType==='currency')return `<input ${common} type="number" value="${escapeHtml(value)}" />`;
      if(field.inputType==='date')return `<input ${common} type="date" value="${escapeHtml(value)}" />`;
      if(field.inputType==='datetime')return `<input ${common} type="datetime-local" value="${escapeHtml(value)}" />`;
      if(field.inputType==='datetimeRange'){
        const range=raw&&typeof raw==='object'?raw:{start:'',end:''};
        return `<div class="repeat-grid"><input ${common} data-range-part="start" type="datetime-local" value="${escapeHtml(range.start||'')}" /><input ${common} data-range-part="end" type="datetime-local" value="${escapeHtml(range.end||'')}" /></div>`;
      }
      if(field.inputType==='checkbox')return `<label class="all-day-row"><input ${common} type="checkbox" ${raw===true?'checked':''} /><span class="muted">${escapeHtml(field.description||'完了')}</span></label>`;
      if(field.inputType==='singleSelect'||field.inputType==='multiSelect'||field.inputType==='result'){
        const options=field.inputType==='result'?[{value:'unchecked',label:'未確認'},{value:'passed',label:'合格'},{value:'needsRevision',label:'要修正'},{value:'notApplicable',label:'対象外'}]:(field.options||[]);
        return `<select ${common} ${field.inputType==='multiSelect'?'multiple':''}>${options.map(option=>`<option value="${escapeHtml(option.value)}" ${Array.isArray(raw)?raw.includes(option.value):String(raw)===option.value?'selected':''}>${escapeHtml(option.label)}</option>`).join('')}</select>`;
      }
      if(field.inputType==='userSelect'){
        const profiles=Object.entries(window.staffDirectory||{});
        return `<select ${common}><option value="">未設定</option>${profiles.map(([uid,profile])=>`<option value="${escapeHtml(uid)}" ${uid===raw?'selected':''}>${escapeHtml(profile.displayName||uid)}</option>`).join('')}</select>`;
      }
      const type=['url','fileLink','externalTool'].includes(field.inputType)?'url':'text';
      return `<input ${common} type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.externalToolHint||field.description||'')}" />`;
    }
    function projectTemplateDetailHtml(project,{retrospectiveOnly=false}={}) {
      const sections=(project.templateSnapshot?.sections||[]).filter(section=>!retrospectiveOnly||/振り返り|retrospective/i.test(`${section.id} ${section.name}`));
      if(!sections.length)return `<div class="empty">${retrospectiveOnly?'振り返り項目はありません。':'テンプレート項目はありません。'}</div>`;
      return `<div class="template-section-list">${sections.map(section=>`<section class="template-section-card"><div class="template-section-head"><div><h4>${escapeHtml(section.name)}</h4>${section.description?`<div class="panel-sub">${escapeHtml(section.description)}</div>`:''}</div><span class="tag">${section.fields?.length||0}項目</span></div><div class="template-field-grid">${(section.fields||[]).map(field=>{
        const record=project.templateValues?.[field.id]||{};
        return `<div class="template-field ${record.completed?'is-complete':''}" data-template-field-wrap="${escapeHtml(field.id)}"><div class="template-field-label"><span>${escapeHtml(field.label)} ${field.required?'<small>必須</small>':''}</span><small>${escapeHtml(field.inputType)}</small></div>${templateFieldInputHtml(field,record)}${field.completionEnabled!==false?`<label class="template-completion"><input type="checkbox" data-template-complete="${escapeHtml(field.id)}" ${record.completed?'checked':''} /> 入力・確認を完了</label>`:''}</div>`;
      }).join('')}</div></section>`).join('')}</div>`;
    }
    function renderProjectDetailContent(project) {
      const content=document.getElementById('projectDetailContent');if(!content)return;
      const tasks=visibleTasks().filter(task=>task.projectId===project.id);
      if(activeProjectDetailTab==='overview'){
        content.innerHTML=`<div class="project-detail-grid"><section class="project-detail-block"><h4>目的</h4><p>${escapeHtml(project.purpose||'未設定')}</p></section><section class="project-detail-block"><h4>完了条件</h4><p>${escapeHtml(project.completionCriteria||'未設定')}</p></section><section class="project-detail-block"><h4>進行設定</h4><div class="field"><label>現在フェーズ</label><select id="projectDetailPhase"></select></div></section><section class="project-detail-block"><h4>期間・責任者</h4><p>${escapeHtml(project.startDate||project.start||'未設定')} 〜 ${escapeHtml(project.endDate||project.due||'未設定')}\n責任者：${escapeHtml(staffDirectoryName(project.ownerUid,'未設定'))}</p></section>${project.note?`<section class="project-detail-block wide"><h4>メモ</h4><p>${escapeHtml(project.note)}</p></section>`:''}</div>`;
        populatePhaseSelect('projectDetailPhase',project.phaseId||'',false,project.templateSnapshot?.phases||allProjectPhases());return;
      }
      if(activeProjectDetailTab==='template'){content.innerHTML=projectTemplateDetailHtml(project);return;}
      if(activeProjectDetailTab==='tasks'){content.innerHTML=tasks.length?`<div class="project-task-list">${tasks.map(projectTaskRowHtml).join('')}</div>`:'<div class="empty">タスクはありません。</div>';return;}
      if(activeProjectDetailTab==='schedule'){content.innerHTML=`<div class="project-detail-grid"><section class="project-detail-block"><h4>期間</h4><p>${escapeHtml(project.startDate||'未設定')} 〜 ${escapeHtml(project.endDate||'未設定')}</p></section><section class="project-detail-block"><h4>現在フェーズ</h4><p>${escapeHtml(phaseLabel(project.phaseId))}</p></section></div>`;return;}
      if(activeProjectDetailTab==='meetings'){
        const meetings=state.meetings.filter(meeting=>meeting.projectId===project.id);content.innerHTML=meetings.length?meetings.map(meeting=>meetingCardHtml(meeting)).join(''):'<div class="empty">関連会議はありません。</div>';return;
      }
      if(activeProjectDetailTab==='deliverables'){
        const urls=project.relatedUrls||[];content.innerHTML=`<div class="project-detail-grid"><section class="project-detail-block"><h4>成果物</h4>${(project.deliverables||[]).length?(project.deliverables||[]).map(item=>`<p>・${escapeHtml(item.name||item)}</p>`).join(''):'<p>未登録</p>'}</section><section class="project-detail-block"><h4>関連URL</h4>${urls.length?urls.map(item=>`<p><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label||item.url)} ↗</a></p>`).join(''):'<p>未登録</p>'}</section></div>`;return;
      }
      if(activeProjectDetailTab==='qa'){
        const checks=project.qualityChecks||[];content.innerHTML=checks.length?checks.map(check=>`<div class="project-detail-block"><strong>${escapeHtml(check.label)}</strong><span class="tag">${escapeHtml(check.result||'unchecked')}</span></div>`).join(''):'<div class="empty">品質確認項目はありません。</div>';return;
      }
      if(activeProjectDetailTab==='retrospective'){content.innerHTML=projectTemplateDetailHtml(project,{retrospectiveOnly:true});return;}
      const history=(state.changeLog||[]).filter(change=>String(change.message||'').includes(project.name)).slice().reverse();
      content.innerHTML=history.length?history.map(change=>`<div class="project-detail-block"><strong>${escapeHtml(change.message)}</strong><p>${escapeHtml(new Date(change.at).toLocaleString('ja-JP'))}・${escapeHtml(change.by||'')}</p></div>`).join(''):'<div class="empty">このプロジェクトの変更履歴はまだありません。</div>';
    }
    function renderProjectDetail(project) {
      if(!project)return;
      const tasks=visibleTasks().filter(task=>task.projectId===project.id),progress=calculateProjectCompletion(project,tasks);
      document.getElementById('projectDetailId').value=project.id;
      document.getElementById('projectDetailTitle').textContent=project.name;
      document.getElementById('projectDetailHero').innerHTML=`<div><strong>${escapeHtml(project.name)}</strong><div class="project-detail-meta"><span class="tag category-breadcrumb">${categoryPathHtml(project)}</span><span class="tag">${escapeHtml(phaseLabel(project.phaseId))}</span><span class="tag visibility-${normalizeVisibility(project.visibility)}">${escapeHtml(VISIBILITY_LABELS[normalizeVisibility(project.visibility)])}</span>${project.templateId?`<span class="tag">${escapeHtml(projectTemplate(project.templateId)?.name||project.templateId)} v${project.templateVersion||1}</span>`:''}</div></div><div class="project-detail-progress"><strong>${progress.rate}%</strong><span>${progress.completed}/${progress.total} 完了対象</span></div>`;
      document.getElementById('projectDetailTabs').innerHTML=PROJECT_DETAIL_TABS.map(([id,label])=>`<button class="project-detail-tab ${id===activeProjectDetailTab?'active':''}" type="button" data-project-detail-tab="${id}">${label}</button>`).join('');
      renderProjectDetailContent(project);
    }
    function openProjectDetail(project,tab='overview') {
      activeProjectDetailTab=tab;
      renderProjectDetail(project);
      document.getElementById('projectDetailDialog').showModal();
    }
    function saveProjectDetail() {
      const project=state.projects.find(item=>item.id===document.getElementById('projectDetailId').value);if(!project)return;
      const rangeValues={};
      document.querySelectorAll('#projectDetailContent [data-template-field]').forEach(input=>{
        const id=input.dataset.templateField;
        if(input.dataset.rangePart){rangeValues[id]=rangeValues[id]||{};rangeValues[id][input.dataset.rangePart]=input.value;return;}
        let value=input.type==='checkbox'?input.checked:input.multiple?[...input.selectedOptions].map(option=>option.value):input.value;
        project.templateValues[id]={...(project.templateValues[id]||{}),value};
      });
      Object.entries(rangeValues).forEach(([id,value])=>project.templateValues[id]={...(project.templateValues[id]||{}),value});
      document.querySelectorAll('#projectDetailContent [data-template-complete]').forEach(input=>{
        const id=input.dataset.templateComplete;project.templateValues[id]={...(project.templateValues[id]||{}),completed:input.checked,completedAt:input.checked?new Date().toISOString():undefined};
      });
      const phase=document.getElementById('projectDetailPhase')?.value;if(phase)project.phaseId=phase;
      project.updatedAt=new Date().toISOString();project.updatedBy=window.currentStaffUser?.name||'';
      saveState(`${project.name} を更新しました`);renderProjectDetail(project);
    }

    function openTaskDialog(task=null, preset={}) {
      const targetWorkspace=task?.workspaceId||preset.workspaceId||(activeWorkspace==='all'?'personal':activeWorkspace);
      if(!task&&targetWorkspace!=='personal'&&!canManageTasks()){
        showToast('タスクの追加はオーナー・運営のみ可能です。アイデア・ノートをご利用ください。');
        setView('notes');return;
      }
      refreshProjectSelects();
      clearTaskFormError();
      document.getElementById('taskModalTitle').textContent = task?'タスクを編集':'タスクを追加';
      document.getElementById('taskId').value = task?.id||'';
      document.getElementById('taskSourceIdeaId').value=preset.sourceIdeaId||'';
      document.getElementById('taskTitle').value = task?.title||'';
      const rawCategory=task?.category||preset.category||categories[0]||'PRIVATE';
      const selectedCategory=resolveTaskCategoryValue(rawCategory);
      document.getElementById('taskCategory').value = selectedCategory;
      const selectedType=resolveTaskTypeValue(selectedCategory,task?.type||preset.type||'',rawCategory);
      refreshTaskTypeSelect(selectedCategory,selectedType);
      document.getElementById('taskStatus').value = task?.status==='inbox'?'':(task?.status||(task?.completed?'done':''));
      document.getElementById('taskDue').value = task?.due||preset.due||'';
      document.getElementById('taskWorkspace').value = task?.workspaceId||preset.workspaceId||(activeWorkspace==='all'?'personal':activeWorkspace);
      refreshTaskCategoryForWorkspace(document.getElementById('taskWorkspace').value,selectedCategory,selectedType);
      const linkedProject=state.projects.find(project=>project.id===(task?.projectId||preset.projectId));
      populateHierarchySelects(TASK_HIERARCHY_IDS,{
        majorCategoryId:task?.majorCategoryId||preset.majorCategoryId||linkedProject?.majorCategoryId||'',
        middleCategoryId:task?.middleCategoryId||preset.middleCategoryId||linkedProject?.middleCategoryId,
        smallCategoryId:task?.smallCategoryId||preset.smallCategoryId||linkedProject?.smallCategoryId
      },{activeOnly:true});
      document.getElementById('taskManagementType').value=task?.managementType||preset.managementType||'task';
      populatePhaseSelect('taskPhase',task?.phaseId||preset.phaseId||linkedProject?.phaseId||'');
      document.getElementById('taskRepeatType').value = task?.repeatType||'none';
      document.getElementById('taskRepeatInterval').value = Math.max(1,Number(task?.repeatInterval)||1);
      document.getElementById('taskRepeatUntil').value = task?.repeatUntil||'';
      const selectedDays=Array.isArray(task?.repeatWeekdays)?task.repeatWeekdays.map(Number):[];
      document.querySelectorAll('#taskRepeatWeekdays input').forEach(input=>input.checked=selectedDays.includes(Number(input.value)));
      document.getElementById('taskProject').value = task?.projectId||preset.projectId||'';
      refreshTaskAudienceSelect(taskAudienceOf(task||{audience:preset.audience||((TASK_VIEW_AUDIENCE[currentView]&&TASK_VIEW_AUDIENCE[currentView]!=='all')?TASK_VIEW_AUDIENCE[currentView]:defaultTaskAudienceForRole())}));
      window.populateStaffSelects?.(task?.assigneeUid||preset.assigneeUid||'',task?.assignee||preset.assignee||'',task?.reviewerUid||preset.reviewerUid||'',task?.reviewer||preset.reviewer||'');
      document.getElementById('taskImportance').value = task?.importance||preset.importance||'';
      document.getElementById('taskUrgency').value = task?.urgency||preset.urgency||'';
      updateTaskPriorityUI();
      document.getElementById('taskNote').value = task?.note||'';
      document.getElementById('taskTags').value=(task?.tags||preset.tags||[]).join(', ');
      document.getElementById('taskRelatedUrl').value=task?.relatedUrls?.[0]?.url||preset.relatedUrl||'';
      updateTaskTaxonomyMode();
      updateTaskRepeatUI();
      document.getElementById('taskDialog').showModal();
      setTimeout(()=>document.getElementById('taskTitle').focus(),50);
    }

    function openProjectDialog(p=null,preset={}) {
      if(!canManageTasks()){showToast('イベント用プロジェクトを追加・編集できるのはイベントオーナー・運営のみです');return;}
      document.getElementById('projectModalTitle').textContent = p?'プロジェクトを編集':'プロジェクトを作成';
      document.getElementById('projectId').value=p?.id||''; document.getElementById('projectSourceIdeaId').value=preset.sourceIdeaId||''; document.getElementById('projectSourceTaskId').value=preset.sourceTaskId||'';
      document.getElementById('projectName').value=p?.name||preset.name||'';
      populateHierarchySelects(PROJECT_HIERARCHY_IDS,{
        majorCategoryId:p?.majorCategoryId||preset.majorCategoryId||'',
        middleCategoryId:p?.middleCategoryId||preset.middleCategoryId,
        smallCategoryId:p?.smallCategoryId||preset.smallCategoryId
      },{activeOnly:true});
      refreshProjectTemplateChoices(p?.templateId||preset.templateId||'');
      document.getElementById('projectTemplate').disabled=!!p?.templateSnapshot;
      document.getElementById('projectStatus').value=p?.status||'planning';
      document.getElementById('projectVisibility').innerHTML=visibilityOptions(normalizeVisibility(p?.visibility||preset.visibility||'staff'));
      document.getElementById('projectVisibility').value=normalizeVisibility(p?.visibility||preset.visibility||'staff');
      document.getElementById('projectStart').value=p?.startDate||p?.start||preset.startDate||''; document.getElementById('projectDue').value=p?.endDate||p?.due||preset.endDate||'';
      document.getElementById('projectPurpose').value=p?.purpose||preset.purpose||''; document.getElementById('projectCompletionCriteria').value=p?.completionCriteria||'';
      document.getElementById('projectDeliverables').value=(p?.deliverables||[]).map(item=>item.name||item).join(', ');
      document.getElementById('projectReferenceUrl').value=p?.relatedUrls?.[0]?.url||preset.relatedUrl||'';
      document.getElementById('projectMembers').value=(p?.memberNames||[]).join(', ');
      document.getElementById('projectNote').value=p?.note||'';
      refreshProjectSelects();
      document.getElementById('projectOwner').value=p?.ownerUid||preset.ownerUid||'';
      populatePhaseSelect('projectPhase',p?.phaseId||preset.phaseId||document.getElementById('projectPhase').value||'planning',false,projectTemplate(p?.templateId||preset.templateId)?.phases||allProjectPhases());
      renderProjectTemplatePreview(document.getElementById('projectTemplate').value);
      document.getElementById('projectDialog').showModal();
    }

    function openMeetingDialog(m=null,preset={}) {
      if(!canManageTasks()){showToast('イベント用ミーティングを追加・編集できるのはイベントオーナー・運営のみです');return;}
      refreshProjectSelects();
      document.getElementById('meetingModalTitle').textContent=m?'ミーティングを編集':'ミーティングを追加';
      document.getElementById('meetingId').value=m?.id||''; document.getElementById('meetingTitle').value=m?.title||'';
      document.getElementById('meetingCategory').value=m?.category||preset.category||(categories.includes('VRchat')?'VRchat':categories[0]); document.getElementById('meetingProject').value=m?.projectId||preset.projectId||'';
      document.getElementById('meetingDate').value=m?.date||preset.date||localDateString(); document.getElementById('meetingTime').value=m?.time||'';
      document.getElementById('meetingAttendees').value=m?.attendees||''; document.getElementById('meetingAgenda').value=m?.agenda||'';
      document.getElementById('meetingDecisions').value=m?.decisions||''; document.getElementById('meetingPending').value=m?.pending||'';
      document.getElementById('meetingNextActions').value=m?.nextActions||'';
      document.getElementById('meetingDialog').showModal();
    }

    function openNoteDialog(n=null) {
      refreshProjectSelects();
      document.getElementById('noteModalTitle').textContent=n?'ノートを編集':'ノートを追加';
      document.getElementById('noteId').value=n?.id||''; document.getElementById('noteTitle').value=n?.title||'';
      document.getElementById('noteType').value=n?.type||'アイデア';
      document.getElementById('noteManagementType').innerHTML=managementTypeOptions(n?.managementType||'idea',false,['idea','record','meeting','request']);
      document.getElementById('noteManagementType').value=n?.managementType||'idea';
      populateHierarchySelects(NOTE_HIERARCHY_IDS,n||{},{activeOnly:true});
      document.getElementById('noteVisibility').innerHTML=visibilityOptions(normalizeVisibility(n?.visibility||'staff'));
      document.getElementById('noteVisibility').value=normalizeVisibility(n?.visibility||'staff');
      document.getElementById('noteDecision').value=n?.decision||'pending';
      document.getElementById('noteProject').value=n?.projectId||''; document.getElementById('noteDate').value=n?.date||localDateString();
      document.getElementById('noteTags').value=(n?.tags||[]).join(', ');
      document.getElementById('noteRelatedUrl').value=n?.relatedUrls?.[0]?.url||'';
      document.getElementById('noteContent').value=n?.content||''; document.getElementById('noteDialog').showModal();
    }

    document.querySelectorAll('[data-close-dialog]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.closeDialog==='futureDialog'){pendingFutureSourceTaskId='';document.getElementById('futureMoveNotice').hidden=true;}document.getElementById(btn.dataset.closeDialog).close();}));
    document.getElementById('newTaskBtn').addEventListener('click',()=>openTaskDialog());
    document.getElementById('newEventBtn').addEventListener('click',()=>openEventDialog());
    document.getElementById('newEventBtn2').addEventListener('click',()=>openEventDialog());
    document.getElementById('newTaskBtn2').addEventListener('click',()=>openTaskDialog());
    document.getElementById('triageNewTaskBtn').addEventListener('click',()=>{document.getElementById('workflowCaptureSection').scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.getElementById('captureTaskTitle').focus(),350);});
    document.getElementById('workflowOpenFullTaskBtn').addEventListener('click',()=>openTaskDialog());
    function resetGlobalEventForm(){
      document.getElementById('globalEventForm')?.reset();
      document.getElementById('globalEventEditId').value='';
      document.getElementById('globalEventFormTitle').textContent='イベント作成';
      document.getElementById('saveGlobalEventBtn').textContent='イベントを作成';
      document.getElementById('cancelGlobalEventEditBtn').hidden=true;
      setEventIconPreview('globalEventIconPreview','');
    }
    function openGlobalEventEdit(event){
      resetGlobalEventForm();
      document.getElementById('globalEventEditId').value=event.id;
      document.getElementById('globalEventName').value=event.name||'';
      setEventIconPreview('globalEventIconPreview',event.icon||'');
      document.getElementById('globalEventGroup').value=event.groupLink||'';
      document.getElementById('globalEventX').value=event.xLink||'';
      document.getElementById('globalEventDiscord').value=event.discord||'';
      document.getElementById('globalEventFormTitle').textContent='イベント編集';
      document.getElementById('saveGlobalEventBtn').textContent='変更を保存';
      document.getElementById('cancelGlobalEventEditBtn').hidden=false;
      setView('globalEvents');
    }
    document.getElementById('globalEventForm')?.addEventListener('submit',async e=>{
      e.preventDefault();
      const name=document.getElementById('globalEventName').value.trim();if(!name)return;
      const editId=document.getElementById('globalEventEditId').value;
      const existingEvent=editId?globalAdminData.events[editId]:null;
      const iconFile=document.getElementById('globalEventIconFile')?.files?.[0];
      if(iconFile&&iconFile.size>2*1024*1024){showToast('アイコン画像は2MB以下にしてください');return;}
      let icon=existingEvent?.icon||'';
      if(iconFile){
        try{icon=await imageFileData(iconFile);}
        catch(error){console.error(error);showToast('アイコン画像を読み込めませんでした');return;}
      }
      const id=editId||uid('event_registry');
      globalAdminData.events[id]={...(existingEvent||{}),id,name,icon,groupLink:document.getElementById('globalEventGroup').value.trim(),xLink:document.getElementById('globalEventX').value.trim(),discord:document.getElementById('globalEventDiscord').value.trim(),representativeName:existingEvent?.representativeName||'',members:existingEvent?.members||{},createdAt:existingEvent?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
      globalAudit(existingEvent?'イベントを編集':'イベントを作成',id,name);
      resetGlobalEventForm();
      saveGlobalAdminData(existingEvent?'イベントを更新しました':'イベントを作成しました');
      setView('globalEventList');
    });
    document.getElementById('openGlobalEventCreateBtn')?.addEventListener('click',()=>{resetGlobalEventForm();setView('globalEvents');});
    document.getElementById('cancelGlobalEventEditBtn')?.addEventListener('click',()=>{resetGlobalEventForm();setView('globalEventList');});
    document.getElementById('closeGlobalEventDetailsBtn')?.addEventListener('click',()=>setView('globalEventList'));
    function showGlobalEventDetailPanel(panel){
      const members=panel==='members';
      document.getElementById('globalEventMembersPanel').hidden=!members;
      document.getElementById('globalEventLogsPanel').hidden=members;
      document.getElementById('showGlobalEventMembersBtn').classList.toggle('primary',members);
      document.getElementById('showGlobalEventLogsBtn').classList.toggle('primary',!members);
    }
    document.getElementById('showGlobalEventMembersBtn')?.addEventListener('click',()=>showGlobalEventDetailPanel('members'));
    document.getElementById('showGlobalEventLogsBtn')?.addEventListener('click',()=>showGlobalEventDetailPanel('logs'));
    document.getElementById('cancelGlobalInviteBtn')?.addEventListener('click',()=>setView('globalEventList'));
    document.getElementById('globalInviteForm')?.addEventListener('submit',e=>{
      e.preventDefault();
      const eventId=document.getElementById('globalInviteEventId').value;
      const event=globalAdminData.events[eventId];if(!event)return;
      const expiresAt=document.getElementById('globalInviteExpiry').value;
      const limit=Math.max(1,Number(document.getElementById('globalInviteLimit').value)||1);
      event.invite={token:`${Date.now().toString(36)}${Math.random().toString(36).slice(2,12)}`,createdAt:new Date().toISOString(),expiresAt:new Date(expiresAt).toISOString(),limit,used:0,active:true};
      globalAudit('イベント代表者の招待リンクを発行',event.id,`期限 ${new Date(expiresAt).toLocaleString('ja-JP')}・${limit}回`);
      saveGlobalAdminData('代表者招待リンクを発行しました');setView('globalEventList');
    });
    document.getElementById('surfaceModeSelect')?.addEventListener('change',e=>{
      const target=e.target.value;if(target&&target!==location.pathname)location.href=target;
    });
    document.getElementById('exportGlobalAuditCsvBtn')?.addEventListener('click',()=>{
      const csvCell=value=>`"${String(value??'').replaceAll('"','""')}"`;
      const logs=Object.values(globalAdminData.auditLogs||{}).sort((a,b)=>String(b.at).localeCompare(String(a.at)));
      const rows=[['日時','操作内容','操作者','イベント名','詳細'],...logs.map(log=>[
        log.at?new Date(log.at).toLocaleString('ja-JP'):'',
        log.action||'',
        log.actorName||'全体管理者',
        globalAdminData.events?.[log.eventId]?.name||'全体',
        log.detail||''
      ])];
      const blob=new Blob(['\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download=`mocchiri-planner-operation-log-${localDateString()}.csv`;link.click();URL.revokeObjectURL(url);
      showToast('操作ログをCSV形式で抽出しました');
    });
    document.getElementById('taskCaptureForm').addEventListener('submit',e=>{
      e.preventDefault();
      const title=document.getElementById('captureTaskTitle').value.trim();if(!title)return;
      const personal=activeWorkspace==='personal';
      const hierarchy=hierarchySelection(CAPTURE_HIERARCHY_IDS);
      if(!personal&&!hierarchy.majorCategoryId){showToast('大カテゴリを選択してください');return;}
      const category=document.getElementById('captureTaskCategory').value||categories[0];
      const selectedType=personal?(document.getElementById('captureTaskType').value||firstTaskTypeForCategory(category)):'';
      const visibility=normalizeVisibility(document.getElementById('captureTaskAudience')?.value||defaultTaskAudienceForRole());
      state.tasks.push({id:uid('task'),title,workspaceId:personal?'personal':eventWorkspaceId,managementType:'task',...(personal?{}:hierarchy),classificationStatus:'classified',category:personal?category:categoryLegacyLabel(hierarchy.majorCategoryId),type:selectedType,visibility:personal?'owner':visibility,audience:personal?'owner':visibility,status:'inbox',completed:false,priority:'',due:'',projectId:personal?'':(document.getElementById('captureTaskProject').value||''),group:'',assigneeUid:'',assigneeUids:[],assignee:'',reviewerUid:'',reviewerUids:[],reviewer:'',importance:'',urgency:'',level:'',tags:[],relatedUrls:[],note:'',repeatType:'none',repeatInterval:1,repeatWeekdays:[],repeatUntil:'',repeatStart:'',repeatHistory:[],...currentCreatorFields(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
      document.getElementById('captureTaskTitle').value='';document.getElementById('captureTaskNote').value='';
      saveState('洗い出しタスクへ追加しました');
      setTimeout(()=>document.getElementById('captureTaskTitle').focus(),40);
    });
    document.querySelectorAll('[data-workflow-target]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.workflowTarget)?.scrollIntoView({behavior:'smooth',block:'start'})));
    document.querySelectorAll('[data-workflow-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.workflowView)));
    document.getElementById('newProjectBtn').addEventListener('click',()=>openProjectDialog());
    document.getElementById('saveProjectDetailBtn').addEventListener('click',saveProjectDetail);
    document.getElementById('addHierarchyCategoryBtn').addEventListener('click',addHierarchyCategory);
    document.getElementById('applyCategoryTemplateBtn')?.addEventListener('click',applyCategoryTemplate);
    document.getElementById('categoryAdminTree')?.addEventListener('click',e=>{
      const button=e.target.closest('.category-collapse');if(!button)return;
      const item=categoryNode(button.closest('.category-admin-row')?.dataset.categoryId);if(!item||item.level===3)return;
      item.collapsed=!item.collapsed;persistStateSilently();renderCategoryAdmin();
    });
    document.getElementById('categoryAdminTree')?.addEventListener('dragstart',e=>{
      const row=e.target.closest('.category-admin-row');draggedCategoryId=row?.dataset.categoryId||'';
      if(e.dataTransfer)e.dataTransfer.effectAllowed='move';
    });
    document.getElementById('categoryAdminTree')?.addEventListener('dragover',e=>{if(e.target.closest('.category-admin-row'))e.preventDefault();});
    document.getElementById('categoryAdminTree')?.addEventListener('drop',e=>{
      const row=e.target.closest('.category-admin-row');if(!row)return;e.preventDefault();moveCategoryByDrop(draggedCategoryId,row.dataset.categoryId);draggedCategoryId='';
    });
    document.getElementById('adminEventIconFile')?.addEventListener('change',async e=>{
      const file=e.target.files?.[0];if(!file)return;
      try{setEventIconPreview('adminEventIconPreview',await imageFileData(file));}catch(error){showToast(error.message==='size'?'アイコン画像は2MB以下にしてください':'画像を読み込めませんでした');e.target.value='';}
    });
    document.getElementById('globalEventIconFile')?.addEventListener('change',async e=>{
      const file=e.target.files?.[0];if(!file)return;
      try{setEventIconPreview('globalEventIconPreview',await imageFileData(file));}catch(error){showToast(error.message==='size'?'アイコン画像は2MB以下にしてください':'画像を読み込めませんでした');e.target.value='';}
    });
    document.getElementById('newMeetingBtn').addEventListener('click',()=>openMeetingDialog());
    document.getElementById('newSchedulePollBtn').addEventListener('click',()=>openSchedulePollDialog());
    document.getElementById('scheduleAddTimeBtn').addEventListener('click',()=>addScheduleTime(''));
    document.getElementById('schedulePollTimePicker').addEventListener('click',e=>{
      const remove=e.target.closest('.schedule-remove-time');if(!remove)return;
      const picker=document.getElementById('schedulePollTimePicker');
      if(picker.querySelectorAll('.schedule-time-row').length<=1){showToast('候補時間は1つ以上必要です');return;}
      remove.closest('.schedule-time-row').remove();
    });
    document.getElementById('newNoteBtn').addEventListener('click',()=>openNoteDialog());
    document.getElementById('yearlyAddEventBtn').addEventListener('click',()=>openEventDialog(null,{date:`${yearlyCursor||new Date().getFullYear()}-01-01`,repeatType:'yearly'}));
    document.getElementById('saveYearlyBtn').addEventListener('click',saveYearlyLog);
    document.getElementById('prevYearBtn').addEventListener('click',()=>shiftYear(-1));
    document.getElementById('nextYearBtn').addEventListener('click',()=>shiftYear(1));
    document.getElementById('thisYearBtn').addEventListener('click',()=>{yearlyCursor=new Date().getFullYear();document.getElementById('yearlyYear').value=yearlyCursor;renderYearlyLog();});
    document.getElementById('yearlyYear').addEventListener('change',e=>{yearlyCursor=Number(e.target.value)||new Date().getFullYear();renderYearlyLog();});
    document.getElementById('saveDailyLogBtn').addEventListener('click',saveDailyLog);
    document.getElementById('prevDayBtn').addEventListener('click',()=>shiftDaily(-1));
    document.getElementById('nextDayBtn').addEventListener('click',()=>shiftDaily(1));
    document.getElementById('todayDailyBtn').addEventListener('click',()=>{dailyCursor=localDateString();renderDailyLog();});
    document.getElementById('dailyDateInput').addEventListener('change',e=>{dailyCursor=e.target.value||localDateString();renderDailyLog();});
    document.getElementById('dailyAddTaskBtn').addEventListener('click',()=>openTaskDialog(null,{due:dailyCursor}));
    document.getElementById('dailyAddEventBtn').addEventListener('click',()=>openEventDialog(null,{date:dailyCursor}));
    document.getElementById('dailyAddMeetingBtn').addEventListener('click',()=>openMeetingDialog(null,{date:dailyCursor}));

    document.getElementById('saveDailyEntryBtn').addEventListener('click',()=>{
      const date=localDateString();
      state.dailyEntries[date]={ ...(state.dailyEntries[date]||{}), goal:document.getElementById('todayGoal').value.trim(), goodThings:document.getElementById('goodThings').value.trim(), updatedAt:new Date().toISOString() };
      saveState('今日のページを保存しました');
    });
    document.getElementById('openTodayDailyLogBtn').addEventListener('click',()=>{dailyCursor=localDateString();selectedDate=dailyCursor;setView('daily');});
    document.getElementById('moveTodayTasksBtn').addEventListener('click',()=>{
      const today=localDateString(),tomorrow=localDateString(addDays(parseLocalDate(today),1));
      const targets=visibleTasks().filter(task=>!isDone(task)&&task.due===today&&!hasRepeat(task));
      if(!targets.length){showToast('翌日へ送る今日のタスクはありません');return;}
      if(!confirm(`今日の未完了タスク ${targets.length}件を翌日へ送りますか？`))return;
      targets.forEach(task=>{task.due=tomorrow;task.updatedAt=new Date().toISOString();});saveState(`${targets.length}件を翌日へ送りました`);
    });

    document.getElementById('eventForm').addEventListener('submit',e=>{
      e.preventDefault();
      const id=document.getElementById('eventId').value;
      const existing=state.events.find(event=>event.id===id);
      const rawDate=document.getElementById('eventDate').value;
      const repeatType=document.getElementById('eventRepeatType').value;
      const repeatInterval=Math.max(1,Number(document.getElementById('eventRepeatInterval').value)||1);
      let repeatWeekdays=[...document.querySelectorAll('#eventRepeatWeekdays input:checked')].map(input=>Number(input.value));
      if(repeatType==='weekly'&&!repeatWeekdays.length&&rawDate)repeatWeekdays=[parseLocalDate(rawDate).getDay()];
      const repeatUntil=document.getElementById('eventRepeatUntil').value;
      if(repeatUntil&&rawDate&&repeatUntil<rawDate){showToast('終了日は最初の日付以降にしてください');return;}
      const endDate=document.getElementById('eventEndDate').value;
      if(endDate&&rawDate&&endDate<rawDate){showToast('終了日は開催日以降にしてください');return;}
      const eventTime=document.getElementById('eventTime').value;
      const eventEndTime=document.getElementById('eventEndTime').value;
      if(eventEndTime&&!eventTime){showToast('終了時間を設定する場合は開始時間も入力してください');return;}
      if(eventEndTime&&eventTime&&(!endDate||endDate===rawDate)&&eventEndTime<eventTime){showToast('同日の終了時間は開始時間以降にしてください');return;}
      const eventAllDay=eventTime ? false : document.getElementById('eventAllDay').checked;
      const workspaceId=document.getElementById('eventWorkspace').value;
      const colorInput=document.getElementById('eventBackgroundColor');
      const event={id:id||uid('event'),title:document.getElementById('eventTitle').value.trim(),workspaceId,category:document.getElementById('eventCategory').value,type:document.getElementById('eventType').value,date:rawDate,endDate,time:eventTime,endTime:eventEndTime,backgroundColor:colorInput.dataset.custom==='true'?colorInput.value:'',allDay:eventAllDay,note:document.getElementById('eventNote').value.trim(),isPrivate:workspaceId==='personal'||document.getElementById('eventPrivate').checked,privateOwnerUid:existing?.privateOwnerUid||window.currentStaffUser?.uid||'',repeatType,repeatInterval,repeatWeekdays,repeatUntil,repeatStart:rawDate,createdAt:existing?.createdAt||new Date().toISOString()};
      if(!event.title||!event.date)return;
      if(hasRepeat(event)){
        const normalizedDate=firstRepeatDateOnOrAfter(event,event.date);
        if(!normalizedDate){showToast('指定した条件でイベント日を作れません');return;}
        event.date=normalizedDate;
      }
      if(existing)Object.assign(existing,event);else state.events.push(event);
      document.getElementById('eventDialog').close();
      saveState(existing?'イベントを更新しました':'イベントを追加しました');
    });

    document.getElementById('taskForm').addEventListener('submit',e=>{
      e.preventDefault();
      clearTaskFormError();
      const id=document.getElementById('taskId').value; const existing=state.tasks.find(t=>t.id===id);
      if(!existing&&document.getElementById('taskWorkspace').value!=='personal'&&!canManageTasks()){showToast('組織タスクの追加はオーナー・運営のみ可能です');document.getElementById('taskDialog').close();setView('notes');return;}
      const status=document.getElementById('taskStatus').value;
      let rawDue=document.getElementById('taskDue').value;
      const repeatType=document.getElementById('taskRepeatType').value;
      const repeatInterval=Math.max(1,Number(document.getElementById('taskRepeatInterval').value)||1);
      let repeatWeekdays=[...document.querySelectorAll('#taskRepeatWeekdays input:checked')].map(input=>Number(input.value));
      if (repeatType==='weekly' && !rawDue && repeatWeekdays.length) {
        // ゴミ出しなどは曜日だけでも登録可能。今日を基準に最初の該当日を自動計算する。
        rawDue=localDateString();
      }
      if (repeatType!=='none' && !rawDue) {
        showTaskFormError(repeatType==='weekly'?'最初の実行日、または繰り返す曜日を選んでください。':'繰り返しタスクには「期限／最初の実行日」が必要です。','taskDue');
        return;
      }
      if (repeatType==='weekly' && !repeatWeekdays.length && rawDue) repeatWeekdays=[parseLocalDate(rawDue).getDay()];
      const repeatUntil=document.getElementById('taskRepeatUntil').value;
      if (repeatUntil && rawDue && repeatUntil<rawDue) { showTaskFormError('終了日は最初の実行日以降にしてください。','taskRepeatUntil'); return; }
      const oldConfig=existing?JSON.stringify([existing.repeatType||'none',Number(existing.repeatInterval)||1,(existing.repeatWeekdays||[]).map(Number).sort(),existing.repeatUntil||'']):'';
      const newConfig=JSON.stringify([repeatType,repeatInterval,[...repeatWeekdays].sort(),repeatUntil]);
      const resetSeries=!existing || oldConfig!==newConfig || existing.due!==rawDue;
      const assigneeSelection=window.getStaffSelection?.('taskAssignee')||{uid:'',name:''};
      const reviewerSelection=window.getStaffSelection?.('taskReviewer')||{uid:'',name:''};
      const creator=currentCreatorFields();
      const importance=document.getElementById('taskImportance').value;
      const urgency=document.getElementById('taskUrgency').value;
      const workspaceId=document.getElementById('taskWorkspace').value;
      const hierarchy=hierarchySelection(TASK_HIERARCHY_IDS);
      if(workspaceId!=='personal'&&!hierarchy.majorCategoryId){showTaskFormError('組織タスクには大カテゴリが必要です。','taskMajorCategory');return;}
      const visibility=normalizeVisibility(document.getElementById('taskAudience').value);
      const relatedUrl=document.getElementById('taskRelatedUrl').value.trim();
      let managementType=document.getElementById('taskManagementType').value||'task';
      if(repeatType!=='none'&&managementType==='task')managementType='recurring';
      const task={ id:id||uid('task'), title:document.getElementById('taskTitle').value.trim(), workspaceId, managementType,
        ...(workspaceId==='personal'?{}:hierarchy), classificationStatus:workspaceId==='personal'?(existing?.classificationStatus||'classified'):'classified',
        category:workspaceId==='personal'?document.getElementById('taskCategory').value:categoryLegacyLabel(hierarchy.majorCategoryId), type:document.getElementById('taskType').value,
        visibility,audience:visibility, phaseId:document.getElementById('taskPhase').value||'', status, completed:status==='done', priority:calculatedPriority(urgency,importance), due:rawDue, projectId:document.getElementById('taskProject').value, templateFieldId:existing?.templateFieldId||'',generatedTaskDefinitionId:existing?.generatedTaskDefinitionId||'', group:'',
        assigneeUid:assigneeSelection.uid,assigneeUids:assigneeSelection.uid?[assigneeSelection.uid]:[], assignee:assigneeSelection.name,
        reviewerUid:reviewerSelection.uid,reviewerUids:reviewerSelection.uid?[reviewerSelection.uid]:[], reviewer:reviewerSelection.name, importance, urgency, level:'',
        tags:document.getElementById('taskTags').value.split(',').map(value=>value.trim()).filter(Boolean),
        relatedUrls:relatedUrl?[{id:existing?.relatedUrls?.[0]?.id||uid('url'),toolType:'other',label:'関連URL',url:relatedUrl}]:[],
        note:document.getElementById('taskNote').value.trim(),
        repeatType, repeatInterval, repeatWeekdays, repeatUntil,
        repeatStart:repeatType==='none'?'':(resetSeries?rawDue:(existing?.repeatStart||rawDue)),
        repeatHistory:repeatType==='none'?[]:(resetSeries?[]:[...(existing?.repeatHistory||[])]),
        createdByUid:existing ? (existing.createdByUid||'') : creator.createdByUid, createdBy:existing ? (existing.createdBy||'') : creator.createdBy, createdAt:existing?.createdAt||new Date().toISOString(), updatedAt:new Date().toISOString(), updatedBy:window.currentStaffUser?.name||window.currentStaffUser?.email||'' };
      if(!task.title)return;
      if (hasRepeat(task)) {
        const normalizedDue=firstRepeatDateOnOrAfter(task,task.due);
        if (!normalizedDue) { showTaskFormError('指定した条件で次回日を作れません。曜日や終了日を確認してください。','taskRepeatUntil'); return; }
        task.due=normalizedDue;
        document.getElementById('taskDue').value=normalizedDue;
        if (task.status==='done') completeRecurringTask(task,task.due);
      }
      if(existing)Object.assign(existing,task); else state.tasks.push(task);
      const sourceIdeaId=document.getElementById('taskSourceIdeaId').value;
      const sourceIdea=sourceIdeaId&&state.notes.find(note=>note.id===sourceIdeaId);
      if(sourceIdea){sourceIdea.decision='approved';sourceIdea.convertedTaskId=task.id;sourceIdea.updatedAt=new Date().toISOString();}
      document.getElementById('taskDialog').close(); saveState(existing?'タスクを更新しました':'タスクを追加しました');
    });

    document.getElementById('projectForm').addEventListener('submit',e=>{
      e.preventDefault(); const id=document.getElementById('projectId').value; const existing=state.projects.find(p=>p.id===id);
      const hierarchy=hierarchySelection(PROJECT_HIERARCHY_IDS);
      if(!hierarchy.majorCategoryId||!hierarchy.middleCategoryId){showToast('大カテゴリと中カテゴリを選択してください');return;}
      const startDate=document.getElementById('projectStart').value,endDate=document.getElementById('projectDue').value;
      if(startDate&&endDate&&endDate<startDate){showToast('終了日は開始日以降にしてください');return;}
      const templateId=existing?.templateId||document.getElementById('projectTemplate').value;
      const template=projectTemplate(templateId);
      const capturedAt=new Date().toISOString();
      const instance=!existing&&template?instantiateTemplateForProject(template,capturedAt):null;
      const referenceUrl=document.getElementById('projectReferenceUrl').value.trim();
      const creator=currentCreatorFields();
      const projectId=id||uid('project');
      const visibility=normalizeVisibility(document.getElementById('projectVisibility').value);
      const p={ id:projectId,workspaceId:'arasaki-shipyard',managementType:'project', name:document.getElementById('projectName').value.trim(),
        ...hierarchy,classificationStatus:'classified',category:categoryLegacyLabel(hierarchy.majorCategoryId),
        templateId:templateId||'',templateVersion:existing?.templateVersion||(template?.version||undefined),templateSnapshot:existing?.templateSnapshot||(instance?.snapshot||undefined),templateValues:existing?.templateValues||(instance?.values||{}),
        phaseId:document.getElementById('projectPhase').value||template?.phases?.[0]?.id||'planning',
        status:document.getElementById('projectStatus').value, start:startDate,due:endDate,startDate,endDate,
        purpose:document.getElementById('projectPurpose').value.trim(),completionCriteria:document.getElementById('projectCompletionCriteria').value.trim(),
        ownerUid:document.getElementById('projectOwner').value||'',memberUids:existing?.memberUids||[],memberNames:document.getElementById('projectMembers').value.split(',').map(value=>value.trim()).filter(Boolean),
        visibility,relatedEventIds:existing?.relatedEventIds||[],relatedProjectIds:existing?.relatedProjectIds||[],
        deliverables:document.getElementById('projectDeliverables').value.split(',').map((name,index)=>({id:existing?.deliverables?.[index]?.id||uid('deliverable'),name:name.trim()})).filter(item=>item.name),
        relatedUrls:referenceUrl?[{id:existing?.relatedUrls?.[0]?.id||uid('url'),toolType:'other',label:'参考URL',url:referenceUrl}]:[],
        note:document.getElementById('projectNote').value.trim(),
        createdByUid:existing?.createdByUid||creator.createdByUid,createdBy:existing?.createdBy||creator.createdBy,createdAt:existing?.createdAt||capturedAt,updatedAt:capturedAt,updatedBy:window.currentStaffUser?.name||window.currentStaffUser?.email||'' };
      if(!p.name)return;
      if(existing)Object.assign(existing,p); else state.projects.push(p);
      if(!existing&&instance?.tasks?.length){
        instance.tasks.forEach((definition,index)=>{
          const taskVisibility=normalizeVisibility(definition.visibility||visibility);
          state.tasks.push({id:uid('task'),workspaceId:'arasaki-shipyard',title:definition.title,managementType:definition.managementType||'task',majorCategoryId:p.majorCategoryId,middleCategoryId:definition.middleCategoryId||p.middleCategoryId,smallCategoryId:definition.smallCategoryId||p.smallCategoryId,classificationStatus:'classified',category:categoryLegacyLabel(p.majorCategoryId),type:'',visibility:taskVisibility,audience:taskVisibility,projectId:p.id,templateFieldId:definition.templateFieldId||'',generatedTaskDefinitionId:definition.id||`generated-${index+1}`,phaseId:definition.phaseId||p.phaseId,status:definition.status||'todo',completed:false,priority:definition.priority||'',due:'',assigneeUid:'',assigneeUids:[],assignee:'',reviewerUid:'',reviewerUids:[],reviewer:'',importance:'',urgency:'',level:'',tags:[],relatedUrls:[],note:definition.description||'',repeatType:definition.managementType==='recurring'?'monthly':'none',repeatInterval:1,repeatWeekdays:[],repeatUntil:'',repeatStart:'',repeatHistory:[],...currentCreatorFields(),createdAt:capturedAt,updatedAt:capturedAt});
        });
      }
      const sourceIdeaId=document.getElementById('projectSourceIdeaId').value;
      const sourceIdea=sourceIdeaId&&state.notes.find(note=>note.id===sourceIdeaId);
      if(sourceIdea){sourceIdea.decision='approved';sourceIdea.convertedProjectId=p.id;sourceIdea.updatedAt=capturedAt;}
      const sourceTaskId=document.getElementById('projectSourceTaskId').value;
      const sourceTask=sourceTaskId&&state.tasks.find(task=>task.id===sourceTaskId);
      if(sourceTask){sourceTask.projectId=p.id;sourceTask.phaseId=p.phaseId;sourceTask.updatedAt=capturedAt;}
      document.getElementById('projectDialog').close(); saveState(existing?'プロジェクトを更新しました':'プロジェクトを作成しました');
    });

    document.getElementById('meetingForm').addEventListener('submit',e=>{
      e.preventDefault(); const id=document.getElementById('meetingId').value; const existing=state.meetings.find(m=>m.id===id);
      const m={ id:id||uid('meeting'), title:document.getElementById('meetingTitle').value.trim(), category:document.getElementById('meetingCategory').value, projectId:document.getElementById('meetingProject').value, date:document.getElementById('meetingDate').value, time:document.getElementById('meetingTime').value, attendees:document.getElementById('meetingAttendees').value.trim(), responses:{...(existing?.responses||{})}, agenda:document.getElementById('meetingAgenda').value.trim(), decisions:document.getElementById('meetingDecisions').value.trim(), pending:document.getElementById('meetingPending').value.trim(), nextActions:document.getElementById('meetingNextActions').value.trim(), createdAt:existing?.createdAt||new Date().toISOString() };
      if(!m.title||!m.date)return; if(existing)Object.assign(existing,m); else state.meetings.push(m);
      document.getElementById('meetingDialog').close(); saveState(existing?'ミーティングを更新しました':'ミーティングを追加しました');
    });

    document.getElementById('schedulePollForm').addEventListener('submit',e=>{
      e.preventDefault();
      const error=document.getElementById('schedulePollFormError'),id=document.getElementById('schedulePollId').value;
      const existing=state.schedulePolls.find(poll=>poll.id===id);
      const start=document.getElementById('schedulePollStart').value,end=document.getElementById('schedulePollEnd').value;
      const times=[...new Set([...document.querySelectorAll('#schedulePollTimePicker .schedule-time-input')].map(input=>input.value).filter(value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value)))].sort();
      const slots=scheduleSlots(start,end,times);
      if(!slots.length){error.textContent='期間と候補時間を確認してください。候補時間は1つ以上選択します。';error.hidden=false;return;}
      if(slots.length>80){error.textContent='候補が多すぎます。期間または候補時間を減らし、80件以内にしてください。';error.hidden=false;return;}
      const poll={id:id||uid('schedule'),title:document.getElementById('schedulePollTitle').value.trim(),description:document.getElementById('schedulePollDescription').value.trim(),start,end,times,slots,deadline:document.getElementById('schedulePollDeadline').value,notify:document.getElementById('schedulePollNotify').checked,status:existing?.status||'open',responses:{...(existing?.responses||{})},createdAt:existing?.createdAt||new Date().toISOString(),createdBy:scheduleUserName(),createdByUid:scheduleUserKey(),updatedAt:new Date().toISOString()};
      if(!poll.title||!poll.deadline)return;
      if(existing)Object.assign(existing,poll);else state.schedulePolls.push(poll);
      document.getElementById('schedulePollDialog').close();
      saveState(existing?'日程調整を更新しました':'日程調整を作成し、通知を出しました');
    });

    document.getElementById('noteForm').addEventListener('submit',e=>{
      e.preventDefault(); const id=document.getElementById('noteId').value; const existing=state.notes.find(n=>n.id===id);
      const hierarchy=hierarchySelection(NOTE_HIERARCHY_IDS);
      if(!hierarchy.majorCategoryId){showToast('大カテゴリを選択してください');return;}
      const now=new Date().toISOString(),relatedUrl=document.getElementById('noteRelatedUrl').value.trim();
      const n={ id:id||uid('note'),workspaceId:'arasaki-shipyard', title:document.getElementById('noteTitle').value.trim(), type:document.getElementById('noteType').value,
        managementType:document.getElementById('noteManagementType').value||'idea',...hierarchy,classificationStatus:'classified',category:categoryLegacyLabel(hierarchy.majorCategoryId),
        visibility:normalizeVisibility(document.getElementById('noteVisibility').value),decision:document.getElementById('noteDecision').value||'pending',
        projectId:document.getElementById('noteProject').value, date:document.getElementById('noteDate').value,
        tags:document.getElementById('noteTags').value.split(',').map(value=>value.trim()).filter(Boolean),
        relatedUrls:relatedUrl?[{id:existing?.relatedUrls?.[0]?.id||uid('url'),toolType:'other',label:'関連URL',url:relatedUrl}]:[],
        content:document.getElementById('noteContent').value.trim(),
        createdByUid:existing?.createdByUid||window.currentStaffUser?.uid||'',createdBy:existing?.createdBy||window.currentStaffUser?.name||'',createdAt:existing?.createdAt||now,updatedAt:now };
      if(!n.title)return; if(existing)Object.assign(existing,n); else state.notes.push(n);
      document.getElementById('noteDialog').close(); saveState(existing?'ノートを更新しました':'ノートを追加しました');
    });


    document.getElementById('applyFutureScheduleBtn').addEventListener('click',()=>{
      const id=document.getElementById('futureScheduleId').value;
      const date=document.getElementById('futureScheduleDate').value;
      const item=state.futureItems.find(entry=>entry.id===id);
      const mode=document.querySelector('input[name="futureScheduleMode"]:checked')?.value||'move';
      if(!item){showToast('Future項目が見つかりません');return;}
      if(!canManageFutureItem(item)){showToast('イベント用Future Logを移動できるのはイベントオーナー・運営のみです');document.getElementById('futureScheduleDialog').close();return;}
      if(!date){showToast('配置する日付を選んでください');return;}
      if(mode==='dateOnly'){
        const d=parseLocalDate(date);item.date=date;item.year=d.getFullYear();item.month=d.getMonth()+1;
        document.getElementById('futureScheduleDialog').close();saveState(`${dateLabel(date,false)} にFuture項目を配置しました`);return;
      }
      state.tasks.push(taskFromFuture(item,date));
      if(mode==='move')state.futureItems=state.futureItems.filter(entry=>entry.id!==id);
      document.getElementById('futureScheduleDialog').close();
      saveState(mode==='move'?`${dateLabel(date,false)} のタスクへ移動しました`:`${dateLabel(date,false)} のタスクへコピーしました`);
    });

    document.getElementById('newFutureBtn').addEventListener('click',()=>openFutureDialog());
    document.getElementById('futureYear').addEventListener('change',renderFutureLog);
    document.getElementById('yearlyCategoryFilter').addEventListener('change',renderYearlyLog);
    document.getElementById('futureForm').addEventListener('submit',e=>{
      e.preventDefault();
      const id=document.getElementById('futureId').value;
      const existing=state.futureItems.find(item=>item.id===id);
      const sourceTask=state.tasks.find(task=>task.id===pendingFutureSourceTaskId);
      const targetWorkspace=existing?itemWorkspace(existing):(sourceTask?.workspaceId||(activeWorkspace==='all'?'personal':activeWorkspace));
      if(!canManageFutureWorkspace(targetWorkspace)){showToast('イベント用Future Logを追加・変更できるのはイベントオーナー・運営のみです');return;}
      const date=document.getElementById('futureDate').value;
      const item={
        id:id||uid('future'),
        workspaceId:targetWorkspace,
        title:document.getElementById('futureTitle').value.trim(),
        year:Number(document.getElementById('futureItemYear').value),
        month:Number(document.getElementById('futureItemMonth').value),
        date,
        category:document.getElementById('futureCategory').value,
        note:document.getElementById('futureNote').value.trim(),
        createdAt:existing?.createdAt||new Date().toISOString()
      };
      if(date){const d=parseLocalDate(date);item.year=d.getFullYear();item.month=d.getMonth()+1;}
      if(!item.title)return;
      if(existing)Object.assign(existing,item);else state.futureItems.push(item);
      const movedTaskId=pendingFutureSourceTaskId;
      if(movedTaskId) state.tasks=state.tasks.filter(task=>task.id!==movedTaskId);
      pendingFutureSourceTaskId='';
      document.getElementById('futureMoveNotice').hidden=true;
      document.getElementById('futureDialog').close();
      document.getElementById('futureYear').value=item.year;
      saveState(movedTaskId?'タスクをFuture Logへ移動しました':(existing?'Future項目を更新しました':'Future項目を追加しました'));
    });

    document.getElementById('prevWeekBtn').addEventListener('click',()=>{weeklyCursor=addDays(weeklyCursor,-7);renderWeeklyLog();});
    document.getElementById('nextWeekBtn').addEventListener('click',()=>{weeklyCursor=addDays(weeklyCursor,7);renderWeeklyLog();});
    document.getElementById('thisWeekBtn').addEventListener('click',()=>{weeklyCursor=startOfWeek(new Date());renderWeeklyLog();});
    document.getElementById('saveWeeklyBtn').addEventListener('click',saveWeeklyLog);
    document.querySelectorAll('input[name="themeMode"]').forEach(input=>input.addEventListener('change',e=>{
      if(!e.target.checked)return;
      applyTheme({...appearanceTheme,mode:e.target.value});
      showToast(`${THEME_LABELS[e.target.value]}モードへ変更しました`);
    }));
    document.querySelectorAll('input[name="themeColor"]').forEach(input=>input.addEventListener('change',e=>{
      if(!e.target.checked)return;
      applyTheme({...appearanceTheme,color:e.target.value});
      showToast(`${THEME_LABELS[e.target.value]}テーマへ変更しました`);
    }));
    document.getElementById('resetThemeBtn').addEventListener('click',()=>{
      applyTheme({...THEME_DEFAULT});
      showToast('Blue・ダークへ戻しました');
    });

    document.getElementById('weekStartSetting').addEventListener('change',e=>{
      state.preferences.weekStartsOn=e.target.value==='sunday'?'sunday':'monday';
      weeklyCursor=startOfWeek(weeklyCursor||new Date());
      saveState(state.preferences.weekStartsOn==='sunday'?'日曜日始まりに変更しました':'月曜日始まりに変更しました');
    });
    document.getElementById('showJapaneseHolidaysSetting').addEventListener('change',e=>{
      state.preferences.showJapaneseHolidays=!!e.target.checked;
      saveState(e.target.checked?'日本の祝日を表示します':'日本の祝日を非表示にしました');
    });
    document.getElementById('resetMenuBtn').addEventListener('click',()=>{
      if(confirm('左メニューの順番・表示・ピン留めを初期配置へ戻しますか？')){
        state.menuConfig=defaultMenuConfig();commitMenuConfig('メニューを初期配置へ戻しました');
      }
    });
    document.getElementById('menuRoleTarget').addEventListener('change',renderMenuSettings);
    document.getElementById('newMenuGroupBtn').addEventListener('click',()=>{
      const label=prompt('新しいメニューカテゴリ名を入力してください');
      if(label!==null)addMenuGroup(label);
    });
    document.getElementById('resetSettingsBtn').addEventListener('click',()=>{
      if(confirm('プルダウン候補を初期値へ戻しますか？\\n既存データは削除されません。')){
        state.settings=defaultSettings();syncRuntimeSettings();populateAllDropdowns();saveState('プルダウン設定を初期化しました');
      }
    });

    document.addEventListener('dragstart',e=>{
      const card=e.target.closest('.calendar-future-draggable');
      if(!card)return;
      if(e.target.closest('button')){e.preventDefault();return;}
      draggingFutureId=card.dataset.futureDragId||card.dataset.id||'';
      const futureItem=state.futureItems.find(item=>item.id===draggingFutureId);
      if(!draggingFutureId||!futureItem||!canManageFutureItem(futureItem)){draggingFutureId='';e.preventDefault();return;}
      card.classList.add('is-dragging');
      document.querySelectorAll('.calendar-day').forEach(day=>day.classList.add('future-drop-target'));
      if(e.dataTransfer){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggingFutureId);}
    });
    document.addEventListener('dragend',clearFutureDragState);
    document.getElementById('calendarGrid').addEventListener('dragover',e=>{
      const day=e.target.closest('.calendar-day');
      if(!day||!draggingFutureId)return;
      e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='move';
      document.querySelectorAll('.calendar-day.future-drag-over').forEach(item=>{if(item!==day)item.classList.remove('future-drag-over');});
      day.classList.add('future-drag-over');
    });
    document.getElementById('calendarGrid').addEventListener('dragleave',e=>{
      const day=e.target.closest('.calendar-day');
      if(day&&!day.contains(e.relatedTarget))day.classList.remove('future-drag-over');
    });
    document.getElementById('calendarGrid').addEventListener('drop',e=>{
      const day=e.target.closest('.calendar-day');
      if(!day)return;
      e.preventDefault();
      const id=draggingFutureId||e.dataTransfer?.getData('text/plain')||'';
      const item=state.futureItems.find(entry=>entry.id===id);
      const date=day.dataset.date;
      suppressCalendarClickUntil=Date.now()+400;
      clearFutureDragState();
      if(item&&date)openFutureScheduleDialog(item,date);
    });

    document.addEventListener('click',async e=>{
      const globalEventCard=e.target.closest('[data-global-event]');
      if(globalEventCard&&e.target.closest('.global-event-details')){
        selectedGlobalEventId=globalEventCard.dataset.globalEvent;
        showGlobalEventDetailPanel('members');setView('globalEventDetails');return;
      }
      if(globalEventCard&&e.target.closest('.global-event-edit')){
        const event=globalAdminData.events[globalEventCard.dataset.globalEvent];
        if(event)openGlobalEventEdit(event);
        return;
      }
      if(globalEventCard&&e.target.closest('.global-owner-invite')){
        const event=globalAdminData.events[globalEventCard.dataset.globalEvent];if(!event)return;
        document.getElementById('globalInviteEventId').value=event.id;
        document.getElementById('globalInviteEventName').textContent=`${event.name} の招待条件を設定します。`;
        const defaultExpiry=new Date(Date.now()+7*86400000);
        document.getElementById('globalInviteExpiry').value=new Date(defaultExpiry.getTime()-defaultExpiry.getTimezoneOffset()*60000).toISOString().slice(0,16);
        document.getElementById('globalInviteLimit').value=1;
        setView('globalInvites');return;
      }
      if(globalEventCard&&e.target.closest('.global-owner-invite-copy')){
        const input=globalEventCard.querySelector('.global-invite-link input');
        if(input)copyInviteText(input.value,input);
        return;
      }
      if(globalEventCard&&e.target.closest('.global-event-delete')){
        const event=globalAdminData.events[globalEventCard.dataset.globalEvent];if(!event||!confirm(`「${event.name}」をゴミ箱へ移動しますか？`))return;
        globalAdminData.trash[event.id]={id:event.id,kind:'event',record:event,deletedAt:new Date().toISOString()};delete globalAdminData.events[event.id];globalAudit('イベントをゴミ箱へ移動',event.id,event.name);saveGlobalAdminData('イベントをゴミ箱へ移動しました');return;
      }
      const applicationRow=e.target.closest('[data-global-application]');
      if(applicationRow&&e.target.closest('.global-application-approve')){
        const app=globalAdminData.applications[applicationRow.dataset.globalApplication],event=globalAdminData.events[app?.eventId];if(!app||!event)return;
        app.status='approved';event.representativeName=app.displayName;event.representativeUid=app.uid;event.members={...(event.members||{}),[app.uid]:{name:app.displayName,role:'owner',vrchat:app.vrchat}};if(event.invite){event.invite.used=1;event.invite.active=false;}globalAudit('イベント代表者の参加申請を承認',event.id,app.displayName);saveGlobalAdminData('イベント代表者を承認しました');return;
      }
      if(applicationRow&&e.target.closest('.global-application-reject')){const app=globalAdminData.applications[applicationRow.dataset.globalApplication];if(app){app.status='rejected';globalAudit('イベント代表者の参加申請を見送り',app.eventId,app.displayName);saveGlobalAdminData('申請を見送りました');}return;}
      const trashRowGlobal=e.target.closest('[data-global-trash]');
      if(trashRowGlobal&&e.target.closest('.global-trash-restore')){const item=globalAdminData.trash[trashRowGlobal.dataset.globalTrash];if(item){globalAdminData.events[item.id]=item.record;delete globalAdminData.trash[item.id];globalAudit('ゴミ箱からイベントを復元',item.id,item.record?.name);saveGlobalAdminData('イベントを復元しました');}return;}
      if(trashRowGlobal&&e.target.closest('.global-trash-purge')){const item=globalAdminData.trash[trashRowGlobal.dataset.globalTrash];if(item&&confirm('完全削除しますか？10日間は全体管理者が復元できます。')){globalAdminData.recovery[item.id]={...item,permanentlyDeletedAt:new Date().toISOString()};delete globalAdminData.trash[item.id];globalAudit('イベントを完全削除',item.id,item.record?.name);saveGlobalAdminData('完全削除しました');}return;}
      const recoveryRow=e.target.closest('[data-global-recovery]');
      if(recoveryRow&&e.target.closest('.global-recovery-restore')){const item=globalAdminData.recovery[recoveryRow.dataset.globalRecovery];if(item){globalAdminData.events[item.id]=item.record;delete globalAdminData.recovery[item.id];globalAudit('完全削除データからイベントを復元',item.id,item.record?.name);saveGlobalAdminData('完全削除データから復元しました');}return;}
      if(e.target.closest('[data-admin-link-toggle]')){
        const toggle=e.target.closest('[data-admin-link-toggle]'),children=toggle.nextElementSibling,open=toggle.getAttribute('aria-expanded')!=='false';
        toggle.setAttribute('aria-expanded',open?'false':'true');if(children)children.hidden=open;return;
      }
      if(e.target.id==='saveAdminEventBtn'){
        state.adminConfig=state.adminConfig||defaultAdminConfig();
        const file=document.getElementById('adminEventIconFile')?.files?.[0];
        let icon=state.adminConfig.event?.icon||'';
        if(file){try{icon=await imageFileData(file);}catch(error){showToast(error.message==='size'?'アイコン画像は2MB以下にしてください':'アイコン画像を読み込めませんでした');return;}}
        state.adminConfig.event={name:document.getElementById('adminEventName').value.trim(),icon,groupLink:document.getElementById('adminEventGroupLink').value.trim(),xLink:document.getElementById('adminEventXLink').value.trim(),discord:document.getElementById('adminEventDiscord').value.trim()};
        applyEventWorkspaceIcon();saveState('イベント詳細を保存しました');return;
      }
      if(e.target.id==='createAdminInviteBtn'){
        const expiresAt=document.getElementById('adminInviteExpiry').value,limit=Math.max(1,Number(document.getElementById('adminInviteLimit').value)||1);
        if(!expiresAt){showToast('招待リンクの期限を指定してください');return;}
        state.adminConfig=state.adminConfig||defaultAdminConfig();state.adminConfig.invites=Array.isArray(state.adminConfig.invites)?state.adminConfig.invites:[];
        state.adminConfig.invites.push({id:uid('invite'),token:`${Date.now().toString(36)}${Math.random().toString(36).slice(2,12)}`,role:document.getElementById('adminInviteRole').value,expiresAt:new Date(expiresAt).toISOString(),limit,used:0,active:true,createdAt:new Date().toISOString(),createdBy:window.currentStaffUser?.uid||''});
        saveState('招待リンクを発行しました');return;
      }
      const adminInvite=e.target.closest('[data-admin-invite]');
      if(adminInvite&&e.target.closest('.admin-invite-copy')){const invite=(state.adminConfig?.invites||[]).find(item=>item.id===adminInvite.dataset.adminInvite);if(invite)copyInviteText(inviteUrl(invite),adminInvite.querySelector('input'));return;}
      if(adminInvite&&e.target.closest('.admin-invite-toggle')){const invite=(state.adminConfig?.invites||[]).find(item=>item.id===adminInvite.dataset.adminInvite);if(invite){invite.active=invite.active===false;saveState(invite.active?'招待リンクを再有効化しました':'招待リンクを無効化しました');}return;}
      if(e.target.id==='addAdminDataLinkBtn'){document.getElementById('adminDataLinkRows')?.insertAdjacentHTML('beforeend',adminLinkRow());return;}
      if(e.target.closest('.admin-link-delete')){e.target.closest('.admin-data-link-row')?.remove();return;}
      if(e.target.id==='saveAdminDataLinksBtn'){
        state.adminConfig=state.adminConfig||defaultAdminConfig();
        state.adminConfig.links=[...document.querySelectorAll('.admin-data-link-row')].map(row=>({id:row.dataset.linkId||uid('link'),label:row.querySelector('.admin-link-label').value.trim(),url:row.querySelector('.admin-link-url').value.trim(),roles:[...row.querySelectorAll('.admin-link-role:checked')].map(input=>input.value)})).filter(link=>link.label);
        saveState('データリンクを保存しました');return;
      }
      if(e.target.id==='addAdminRoleBtn'){
        state.adminConfig=state.adminConfig||defaultAdminConfig();state.adminConfig.customRoles=state.adminConfig.customRoles||[];
        state.adminConfig.customRoles.push({id:uid('role'),name:'新しいロール',baseRole:'staff'});saveState('ロールを追加しました');return;
      }
      const roleRow=e.target.closest('.admin-role-row');
      if(roleRow&&e.target.closest('.admin-role-save')){
        const role=(state.adminConfig.customRoles||[]).find(item=>item.id===roleRow.dataset.roleId);if(!role)return;
        const name=roleRow.querySelector('.admin-role-name').value.trim();if(!name){showToast('ロール名を入力してください');return;}
        role.name=name;role.baseRole=roleRow.querySelector('.admin-role-base').value;saveState('ロールを更新しました');return;
      }
      if(roleRow&&e.target.closest('.admin-role-delete')){
        if(!confirm('この追加ロールを削除しますか？'))return;
        state.adminConfig.customRoles=(state.adminConfig.customRoles||[]).filter(item=>item.id!==roleRow.dataset.roleId);saveState('ロールを削除しました');return;
      }
      const trashRow=e.target.closest('[data-trash-id]');
      if(trashRow&&e.target.closest('.trash-restore')){restoreTrashItem(trashRow.dataset.trashId);return;}
      if(trashRow&&e.target.closest('.trash-delete-forever')&&confirm('完全削除しますか？\\n管理者は10日間のみ復元できます。')){permanentlyDeleteTrashItem(trashRow.dataset.trashId);return;}
      const archiveRow=e.target.closest('[data-archive-id]');
      if(archiveRow&&e.target.closest('.archive-restore')&&canManageTasks()){restoreTrashItem(archiveRow.dataset.archiveId,true);return;}
      const inviteToggle=e.target.closest('.permission-invite-toggle');
      if(inviteToggle){
        const invite=state.permissionEvents?.[selectedPermissionEventId]?.invitations?.[inviteToggle.dataset.inviteId];
        if(invite){invite.active=invite.active===false;permissionAudit(invite.active?'enable':'disable','invitation',inviteToggle.dataset.inviteId,invite.active?'招待リンクを再有効化':'招待リンクを無効化');saveState(invite.active?'招待リンクを再有効化しました':'招待リンクを無効化しました');}return;
      }
      const projectDetailTab=e.target.closest('[data-project-detail-tab]');
      if(projectDetailTab){activeProjectDetailTab=projectDetailTab.dataset.projectDetailTab;const project=state.projects.find(item=>item.id===document.getElementById('projectDetailId').value);if(project)renderProjectDetail(project);return;}
      const categorySave=e.target.closest('.category-save');
      if(categorySave){saveHierarchyCategoryRow(categorySave.closest('.category-admin-row'));return;}
      const categoryDelete=e.target.closest('.category-delete');
      if(categoryDelete){deleteHierarchyCategory(categoryDelete.closest('.category-admin-row').dataset.categoryId);return;}
      const groupToggle=e.target.closest('.nav-group-toggle');
      if(groupToggle){const group=menuGroup(groupToggle.dataset.menuGroupToggle);if(group){group.expanded=group.expanded===false;state.version=APP_VERSION;persistStateSilently();renderNavigation();renderMenuSettings();}return;}
      const menuUp=e.target.closest('.menu-move-up');
      if(menuUp){moveMenuItem(menuUp.closest('.menu-customize-row').dataset.menuKey,-1);return;}
      const menuDown=e.target.closest('.menu-move-down');
      if(menuDown){moveMenuItem(menuDown.closest('.menu-customize-row').dataset.menuKey,1);return;}
      const groupDelete=e.target.closest('.menu-group-delete');
      if(groupDelete){const row=groupDelete.closest('.menu-customize-row');if(confirm('このカテゴリを削除しますか？\n中のページは最上位へ戻ります。'))deleteMenuGroup(row.dataset.menuGroup);return;}
      const navTarget=e.target.closest('.nav-button[data-view], [data-open-view]');
      if(navTarget){setView(navTarget.dataset.view||navTarget.dataset.openView);return;}
      const yearlyMonthOpen=e.target.closest('.yearly-month-open');
      if(yearlyMonthOpen){
        const year=Number(yearlyMonthOpen.dataset.year),month=Number(yearlyMonthOpen.dataset.month);
        calendarCursor=new Date(year,month-1,1);selectedDate=localDateString(calendarCursor);setView('calendar');return;
      }
      const calendarWeek=e.target.closest('.calendar-week-number');
      if(calendarWeek){weeklyCursor=startOfWeek(parseLocalDate(calendarWeek.dataset.weekStart));setView('weekly');return;}
      const weeklyDayLink=e.target.closest('.weekly-day-link');
      if(weeklyDayLink){dailyCursor=weeklyDayLink.dataset.date;selectedDate=dailyCursor;setView('daily');return;}
      const contextFutureAdd=e.target.closest('.context-future-add');
      if(contextFutureAdd){openFutureDialog(null,{year:Number(contextFutureAdd.dataset.year),month:Number(contextFutureAdd.dataset.month)});return;}
      const futureScheduleBtn=e.target.closest('.future-schedule');
      if(futureScheduleBtn){const card=futureScheduleBtn.closest('[data-kind="future"]');const item=state.futureItems.find(entry=>entry.id===card?.dataset.id);if(item)openFutureScheduleDialog(item,item.date||'');return;}
      const futureAdd=e.target.closest('.future-add-month');
      if(futureAdd){openFutureDialog(null,{year:Number(document.getElementById('futureYear').value),month:Number(futureAdd.dataset.month)});return;}
      const weekEventAdd=e.target.closest('.weekly-add-event');
      if(weekEventAdd){openEventDialog(null,{date:weekEventAdd.dataset.date});return;}
      const weekAdd=e.target.closest('.weekly-add-task');
      if(weekAdd){openTaskDialog(null,{due:weekAdd.dataset.date});return;}
      const renameBtn=e.target.closest('.setting-rename');
      if(renameBtn){const row=renameBtn.closest('.setting-row');applySettingRename(row.dataset.settingKey,Number(row.dataset.settingIndex),row.querySelector('.setting-label-input').value);return;}
      const deleteBtn=e.target.closest('.setting-delete');
      if(deleteBtn){const row=deleteBtn.closest('.setting-row');deleteSettingItem(row.dataset.settingKey,Number(row.dataset.settingIndex));return;}
      const addSettingBtn=e.target.closest('.setting-add-btn');
      if(addSettingBtn){const key=addSettingBtn.dataset.settingKey;const input=document.querySelector(`.setting-new-input[data-setting-key="${key}"]`);const category=document.querySelector(`.setting-new-category[data-setting-key="${key}"]`)?.value||'';addSettingItem(key,input.value,category);return;}
      const day=e.target.closest('.calendar-day');
      if(day){if(Date.now()<suppressCalendarClickUntil)return;selectedDate=day.dataset.date;dailyCursor=selectedDate;setView('daily');return;}
      const workflowSaveDue=e.target.closest('.workflow-save-due');
      if(workflowSaveDue){
        const row=workflowSaveDue.closest('[data-workflow-task]');const task=state.tasks.find(item=>item.id===row?.dataset.workflowTask);const due=row?.querySelector('.workflow-due-input')?.value||'';
        if(!task)return;if(!due){showToast('期限を選んでください');return;}task.due=due;if(task.status==='inbox'){task.status='todo';task.completed=false;}saveState(`期限を ${dateLabel(due,false)} に設定しました`);return;
      }
      const workflowMoveFuture=e.target.closest('.workflow-move-future');
      if(workflowMoveFuture){
        const row=workflowMoveFuture.closest('[data-workflow-task]');const task=state.tasks.find(item=>item.id===row?.dataset.workflowTask);if(!task)return;
        const today=new Date();
        openFutureDialog(null,{sourceTaskId:task.id,title:task.title,category:task.category,note:task.note||'',year:today.getFullYear(),month:today.getMonth()+1});return;
      }
      const saveAssignee=e.target.closest('.workflow-save-assignee');
      if(saveAssignee){
        const row=saveAssignee.closest('[data-workflow-task]');const task=state.tasks.find(item=>item.id===row?.dataset.workflowTask);const select=row?.querySelector('.workflow-assignee-select');
        if(!task||!select?.value){showToast('担当者を選んでください');return;}
        task.assigneeUid=select.value;task.assignee=select.options[select.selectedIndex]?.textContent||'';saveState('担当者を設定しました');return;
      }
      const rsvp=e.target.closest('.meeting-rsvp-btn');
      if(rsvp){
        const meetingId=rsvp.closest('[data-meeting-rsvp]')?.dataset.meetingRsvp;const meeting=state.meetings.find(item=>item.id===meetingId);
        const userKey=window.currentStaffUser?.uid||window.currentStaffUser?.email||window.currentStaffUser?.name||'';
        if(!meeting||!userKey){showToast('出欠回答にはログインが必要です');return;}
        let comment='';if(rsvp.dataset.rsvp==='maybe'){comment=prompt('コメントを入力してください（例：少し遅れて参加）')||'';if(!comment)return;}
        meeting.responses={...(meeting.responses||{}),[userKey]:{status:rsvp.dataset.rsvp,comment,name:window.currentStaffUser?.name||window.currentStaffUser?.email||'',updatedAt:new Date().toISOString()}};
        saveState('ミーティングの出欠を回答しました');return;
      }
      const notification=e.target.closest('[data-open-schedule]');
      if(notification){setView('schedulePolls');setTimeout(()=>document.querySelector(`[data-schedule-poll="${notification.dataset.openSchedule}"]`)?.scrollIntoView({behavior:'smooth',block:'start'}),80);return;}
      const scheduleChoice=e.target.closest('.schedule-choice');
      if(scheduleChoice){
        const row=scheduleChoice.closest('[data-schedule-slot]');
        row.querySelectorAll('.schedule-choice').forEach(button=>button.classList.toggle('selected',button===scheduleChoice));
        const comment=row.querySelector('.schedule-comment');comment.hidden=scheduleChoice.dataset.scheduleChoice!=='maybe';if(!comment.hidden)comment.focus();
        return;
      }
      const scheduleSave=e.target.closest('.schedule-save-response');
      if(scheduleSave){
        const card=scheduleSave.closest('[data-schedule-poll]'),poll=state.schedulePolls.find(item=>item.id===card?.dataset.schedulePoll);
        const userKey=scheduleUserKey();if(!poll||!userKey){showToast('回答にはログインが必要です');return;}
        const answers={};let missing=false,missingComment=false;
        card.querySelectorAll('[data-schedule-slot]').forEach(row=>{
          const status=row.querySelector('.schedule-choice.selected')?.dataset.scheduleChoice||'',comment=row.querySelector('.schedule-comment')?.value.trim()||'';
          if(!status)missing=true;if(status==='maybe'&&!comment)missingComment=true;
          answers[row.dataset.scheduleSlot]={status,comment};
        });
        if(missing){showToast('すべての候補に回答してください');return;}
        if(missingComment){showToast('△の候補には条件コメントを入力してください');return;}
        poll.responses={...(poll.responses||{}),[userKey]:{name:scheduleUserName(),answers,updatedAt:new Date().toISOString()}};
        saveState('回答を保存しました。通知を完了にしました');
        document.querySelector(`[data-schedule-poll="${poll.id}"] .schedule-response-details`)?.setAttribute('open','');
        return;
      }
      const scheduleEdit=e.target.closest('.schedule-poll-edit');
      if(scheduleEdit){const poll=state.schedulePolls.find(item=>item.id===scheduleEdit.closest('[data-schedule-poll]')?.dataset.schedulePoll);if(poll)openSchedulePollDialog(poll);return;}
      const scheduleDelete=e.target.closest('.schedule-poll-delete');
      if(scheduleDelete){const id=scheduleDelete.closest('[data-schedule-poll]')?.dataset.schedulePoll;if(confirm('この日程調整と全員の回答をゴミ箱へ移動しますか？'))moveToTrash('schedulePoll',id);return;}
      const card=e.target.closest('[data-kind][data-id]'); if(!card)return;
      const {kind,id}=card.dataset;
      if(kind==='event'){
        const item=state.events.find(event=>event.id===id);
        if(e.target.closest('.event-edit'))openEventDialog(item);
        if(e.target.closest('.event-delete')&&confirm(hasRepeat(item)?'この繰り返しイベント全体をゴミ箱へ移動しますか？':'このイベントをゴミ箱へ移動しますか？'))moveToTrash('event',id);
      }
      if(kind==='future'){
        const item=state.futureItems.find(f=>f.id===id);
        if(!item)return;
        const requestedManagement=e.target.closest('.future-edit,.future-task,.future-delete');
        if(requestedManagement&&!canManageFutureItem(item)){showToast('イベント用Future Logを操作できるのはイベントオーナー・運営のみです');return;}
        if(e.target.closest('.future-edit'))openFutureDialog(item);
        if(e.target.closest('.future-task')){
          openTaskDialog(null,{due:item.date||'',category:item.category});
          document.getElementById('taskTitle').value=item.title;
          document.getElementById('taskNote').value=item.note||'';
        }
        if(e.target.closest('.future-delete')&&confirm('このFuture項目をゴミ箱へ移動しますか？'))moveToTrash('future',id);
      }
      if(kind==='task'){
        const item=state.tasks.find(t=>t.id===id);
        if(e.target.closest('.task-undo-complete')){setTaskCompletion(item,false,card.dataset.occurrenceDate||item.due);return;}
        if(e.target.closest('.task-to-project')){openProjectDialog(null,{sourceTaskId:item.id,name:item.title,majorCategoryId:item.majorCategoryId,middleCategoryId:item.middleCategoryId,smallCategoryId:item.smallCategoryId,purpose:item.note||'',visibility:item.visibility||item.audience,relatedUrl:item.relatedUrls?.[0]?.url||'',startDate:item.due||''});showToast('プロジェクト情報を確認して作成してください');return;}
        if(e.target.closest('.task-edit'))openTaskDialog(item);
        if(e.target.closest('.matrix-unassign')){assignTaskTriage(id,'','');return;}
        if(e.target.closest('.task-delete')&&confirm(hasRepeat(item)?'この繰り返しタスク全体をゴミ箱へ移動しますか？':'このタスクをゴミ箱へ移動しますか？'))moveToTrash('task',id);
      }
      if(kind==='project'){
        const item=state.projects.find(p=>p.id===id);
        if(e.target.closest('.project-detail-open')){openProjectDetail(item);return;}
        if(e.target.closest('.project-edit'))openProjectDialog(item);
        if(e.target.closest('.project-task-add'))openTaskDialog(null,{workspaceId:'arasaki-shipyard',projectId:id,category:item.category,majorCategoryId:item.majorCategoryId,middleCategoryId:item.middleCategoryId,smallCategoryId:item.smallCategoryId,phaseId:item.phaseId,visibility:item.visibility,audience:item.visibility});
        if(e.target.closest('.project-delete')&&confirm('このプロジェクトをゴミ箱へ移動しますか？\\n復元すれば関連データとの紐づけも戻ります。'))moveToTrash('project',id);
      }
      if(kind==='meeting'){
        const item=state.meetings.find(m=>m.id===id);
        if(e.target.closest('.meeting-edit'))openMeetingDialog(item);
        if(e.target.closest('.meeting-delete')&&confirm('このミーティング記録をゴミ箱へ移動しますか？'))moveToTrash('meeting',id);
      }
      if(kind==='note'){
        const item=state.notes.find(n=>n.id===id);
        if(e.target.closest('.idea-hold')){item.decision='onHold';item.updatedAt=new Date().toISOString();saveState('アイデアを保留にしました');return;}
        if(e.target.closest('.idea-reject')){if(confirm('このアイデアを却下にしますか？')){item.decision='rejected';item.updatedAt=new Date().toISOString();saveState('アイデアを却下にしました');}return;}
        if(e.target.closest('.note-to-project')){openProjectDialog(null,{sourceIdeaId:item.id,name:item.title,majorCategoryId:item.majorCategoryId,middleCategoryId:item.middleCategoryId,smallCategoryId:item.smallCategoryId,purpose:item.content||'',visibility:item.visibility,relatedUrl:item.relatedUrls?.[0]?.url||''});return;}
        if(e.target.closest('.note-to-task')){openTaskDialog(null,{workspaceId:'arasaki-shipyard',sourceIdeaId:item.id,due:item.date||'',category:item.category||categories[0],projectId:item.projectId||'',majorCategoryId:item.majorCategoryId,middleCategoryId:item.middleCategoryId,smallCategoryId:item.smallCategoryId,visibility:item.visibility,audience:item.visibility,tags:item.tags||[],relatedUrl:item.relatedUrls?.[0]?.url||''});document.getElementById('taskTitle').value=item.title||'';document.getElementById('taskNote').value=item.content||'';showToast('内容をタスク入力へ移しました');return;}
        if(e.target.closest('.note-edit'))openNoteDialog(item);
        if(e.target.closest('.note-delete')&&confirm('このノートをゴミ箱へ移動しますか？'))moveToTrash('note',id);
      }
    });

    document.addEventListener('change',e=>{
      if(e.target.id==='adminAuditRole'){renderAdminAudit();return;}
      if(e.target.id==='permissionEventSelect'){selectedPermissionEventId=e.target.value;renderPermissions();return;}
      if(e.target.classList.contains('permission-member-role')){
        const row=e.target.closest('[data-permission-member]');const member=state.permissionEvents?.[selectedPermissionEventId]?.members?.[row?.dataset.permissionMember];
        if(member){const before=member.role;member.role=e.target.value;permissionAudit('role_change','member',row.dataset.permissionMember,`${permissionUserName(row.dataset.permissionMember)}のロールを${PERMISSION_ROLE_LABELS[before]||before}から${PERMISSION_ROLE_LABELS[member.role]||member.role}へ変更`);saveState('イベントロールを変更しました');}return;
      }
      if(e.target.classList.contains('permission-member-active')){
        const row=e.target.closest('[data-permission-member]');const member=state.permissionEvents?.[selectedPermissionEventId]?.members?.[row?.dataset.permissionMember];
        if(member){member.active=e.target.checked;permissionAudit(member.active?'activate':'suspend','member',row.dataset.permissionMember,`${permissionUserName(row.dataset.permissionMember)}を${member.active?'利用中':'利用停止'}へ変更`);saveState(member.active?'メンバーを利用中にしました':'メンバーを利用停止にしました');}return;
      }
      if(e.target.classList.contains('permission-project-role')){
        const project=state.permissionProjects?.[e.target.dataset.projectId];if(!project)return;
        project.visibility=project.visibility||{};project.visibility.allowedRoles=Array.isArray(project.visibility.allowedRoles)?project.visibility.allowedRoles:[];
        project.visibility.allowedRoles=e.target.checked?[...new Set([...project.visibility.allowedRoles,e.target.dataset.role])]:project.visibility.allowedRoles.filter(role=>role!==e.target.dataset.role);
        permissionAudit('visibility_change','project',e.target.dataset.projectId,`${project.name||e.target.dataset.projectId}のロール公開を変更`);saveState('プロジェクト公開範囲を変更しました');return;
      }
      if(e.target.classList.contains('permission-project-grant')){
        const row=e.target.closest('.permission-external-row');const project=state.permissionProjects?.[row?.dataset.projectId];const grant=project?.visibility?.members?.[row?.dataset.memberUid];
        if(grant){grant[e.target.dataset.permission]=e.target.checked;permissionAudit('permission_change','project',row.dataset.projectId,`${permissionUserName(row.dataset.memberUid)}のプロジェクト権限を変更`);saveState('外部協力者の権限を変更しました');}return;
      }
      if(e.target.classList.contains('template-active-toggle')){
        if(currentStaffRole()!=='owner')return;
        const template=state.projectTemplates.find(item=>item.id===e.target.closest('[data-template-id]')?.dataset.templateId);
        if(template){template.active=e.target.checked;saveState(template.active?'テンプレートを有効にしました':'テンプレートを無効にしました');}return;
      }
      if(e.target.classList.contains('setting-type-category')){const row=e.target.closest('.setting-row');applyTypeCategory(row.dataset.settingKey,Number(row.dataset.settingIndex),e.target.value);return;}
      if(e.target.classList.contains('menu-visible-toggle')){
        const row=e.target.closest('.menu-customize-row');const item=state.menuConfig.find(config=>menuEntryKey(config)===row.dataset.menuKey);
        if(item){
          if(activeWorkspace===eventWorkspaceId)item.roleVisibility={...(item.roleVisibility||{}),[menuTargetRole()]:e.target.checked};
          else item.visible=e.target.checked;
          if(item.type==='page'&&!e.target.checked&&activeWorkspace!==eventWorkspaceId)item.pinned=false;
          commitMenuConfig(e.target.checked?'メニューを表示しました':'メニューを非表示にしました');
        }return;
      }
      if(e.target.classList.contains('menu-pin-toggle')){
        const row=e.target.closest('.menu-customize-row');const item=state.menuConfig.find(config=>menuEntryKey(config)===row.dataset.menuKey);
        if(item?.type==='page'){item.pinned=e.target.checked;if(item.pinned)item.visible=true;commitMenuConfig(item.pinned?'メニューをピン留めしました':'ピン留めを外しました');}return;
      }
      if(e.target.classList.contains('menu-group-expanded-toggle')){
        const row=e.target.closest('.menu-customize-row');const item=state.menuConfig.find(config=>menuEntryKey(config)===row.dataset.menuKey);
        if(item?.type==='group'){item.expanded=e.target.checked;commitMenuConfig(item.expanded?'カテゴリを開いた状態にしました':'カテゴリを閉じた状態にしました');}return;
      }
      if(e.target.classList.contains('menu-parent-select')){
        const row=e.target.closest('.menu-customize-row');const key=row.dataset.menuKey;const item=state.menuConfig.find(config=>menuEntryKey(config)===key);
        if(item?.type==='page'){const parentId=e.target.value||null;const block=removeMenuBlock(key);item.parentId=parentId;if(parentId)insertAfterGroup(parentId,block);else{const settingsIndex=state.menuConfig.findIndex(entry=>entry.type==='page'&&entry.view==='settings');state.menuConfig.splice(settingsIndex>=0?settingsIndex:state.menuConfig.length,0,...block);}commitMenuConfig(parentId?'所属カテゴリを変更しました':'ページを最上位へ移動しました');}return;
      }
      if(e.target.classList.contains('menu-group-name-input')){
        const row=e.target.closest('.menu-customize-row');const item=state.menuConfig.find(config=>menuEntryKey(config)===row.dataset.menuKey);const clean=e.target.value.trim();
        if(item?.type==='group'&&clean){item.label=clean;commitMenuConfig('カテゴリ名を変更しました');}return;
      }
      if(e.target.classList.contains('task-toggle')){
        const card=e.target.closest('[data-kind="task"]'); const task=state.tasks.find(t=>t.id===card.dataset.id);
        if(task){
          setTaskCompletion(task,e.target.checked,card.dataset.occurrenceDate||task.due);
        }
      }
    });

    let draggedMenuKey='';
    let draggedTriageTaskId='';
    let draggedAudienceTaskId='';
    let draggedSettingKey='';
    let draggedSettingIndex=-1;
    let settingDropAfter=false;
    document.addEventListener('dragstart',e=>{
      const audienceCard=e.target.closest('.task-audience-draggable');
      if(audienceCard){draggedAudienceTaskId=audienceCard.dataset.id||'';audienceCard.classList.add('dragging');if(e.dataTransfer){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/task-audience-id',draggedAudienceTaskId);e.dataTransfer.setData('text/plain',draggedAudienceTaskId);}return;}
      const settingHandle=e.target.closest('.setting-drag-handle');
      if(settingHandle){const row=settingHandle.closest('.setting-row');draggedSettingKey=row.dataset.settingKey;draggedSettingIndex=Number(row.dataset.settingIndex);row.classList.add('setting-dragging');if(e.dataTransfer){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/setting-key',draggedSettingKey);e.dataTransfer.setData('text/plain',`${draggedSettingKey}:${draggedSettingIndex}`);}return;}
      const taskCard=e.target.closest('.matrix-task-card');
      if(taskCard){draggedTriageTaskId=taskCard.dataset.triageTask;taskCard.classList.add('dragging');if(e.dataTransfer){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/task-id',draggedTriageTaskId);e.dataTransfer.setData('text/plain',draggedTriageTaskId);}return;}
      const row=e.target.closest('.menu-customize-row');if(!row)return;
      draggedMenuKey=row.dataset.menuKey;row.classList.add('dragging');
      if(e.dataTransfer){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/menu-key',draggedMenuKey);e.dataTransfer.setData('text/plain',draggedMenuKey);}
    });
    document.addEventListener('dragover',e=>{
      const audienceTarget=e.target.closest('[data-task-audience-drop]');
      if(audienceTarget&&draggedAudienceTaskId){e.preventDefault();audienceTarget.classList.add('task-audience-drop-over');if(e.dataTransfer)e.dataTransfer.dropEffect='move';return;}
      if(draggedSettingKey){
        const row=e.target.closest('.setting-row');const list=e.target.closest('.setting-list');
        if(row&&row.dataset.settingKey===draggedSettingKey){e.preventDefault();const rect=row.getBoundingClientRect();settingDropAfter=e.clientY>rect.top+rect.height/2;document.querySelectorAll('.setting-row.setting-drop-before,.setting-row.setting-drop-after').forEach(el=>el.classList.remove('setting-drop-before','setting-drop-after'));row.classList.add(settingDropAfter?'setting-drop-after':'setting-drop-before');return;}
        if(list&&list.dataset.settingListKey===draggedSettingKey){e.preventDefault();list.classList.add('setting-drop-end');return;}
      }
      const triageTarget=e.target.closest('.triage-cell,.triage-unassigned-drop');
      if(triageTarget&&draggedTriageTaskId){e.preventDefault();document.querySelectorAll('.triage-cell.drag-over,.triage-unassigned-drop.drag-over').forEach(el=>el.classList.remove('drag-over'));triageTarget.classList.add('drag-over');return;}
      const row=e.target.closest('.menu-customize-row');if(!row||!draggedMenuKey)return;
      e.preventDefault();document.querySelectorAll('.menu-customize-row.drag-over').forEach(el=>el.classList.remove('drag-over'));row.classList.add('drag-over');
    });
    document.addEventListener('drop',e=>{
      const audienceTarget=e.target.closest('[data-task-audience-drop]');
      if(audienceTarget&&draggedAudienceTaskId){
        e.preventDefault();const task=state.tasks.find(item=>item.id===draggedAudienceTaskId);
        if(task&&canManageTasks()){task.audience=normalizeTaskAudience(audienceTarget.dataset.taskAudienceDrop);task.visibility=task.audience;saveState(`${TASK_AUDIENCE_LABELS[task.audience]}用タスク一覧へ移動しました`);}
        draggedAudienceTaskId='';return;
      }
      if(draggedSettingKey){
        const row=e.target.closest('.setting-row');const list=e.target.closest('.setting-list');
        if(row&&row.dataset.settingKey===draggedSettingKey){e.preventDefault();let target=Number(row.dataset.settingIndex)+(settingDropAfter?1:0);if(draggedSettingIndex<target)target--;moveSettingItem(draggedSettingKey,draggedSettingIndex,target);draggedSettingKey='';draggedSettingIndex=-1;return;}
        if(list&&list.dataset.settingListKey===draggedSettingKey){e.preventDefault();moveSettingItem(draggedSettingKey,draggedSettingIndex,settingItems(draggedSettingKey).length);draggedSettingKey='';draggedSettingIndex=-1;return;}
      }
      const triageTarget=e.target.closest('.triage-cell,.triage-unassigned-drop');
      if(triageTarget&&draggedTriageTaskId){e.preventDefault();if(triageTarget.classList.contains('triage-cell'))assignTaskTriage(draggedTriageTaskId,triageTarget.dataset.triageImportance,triageTarget.dataset.triageUrgency);else assignTaskTriage(draggedTriageTaskId,'','');draggedTriageTaskId='';return;}
      const row=e.target.closest('.menu-customize-row');if(!row||!draggedMenuKey)return;
      e.preventDefault();moveMenuEntry(draggedMenuKey,row.dataset.menuKey,false);draggedMenuKey='';
    });
    document.addEventListener('dragend',()=>{
      draggedMenuKey='';draggedTriageTaskId='';draggedAudienceTaskId='';draggedSettingKey='';draggedSettingIndex=-1;document.querySelectorAll('.menu-customize-row.dragging,.menu-customize-row.drag-over,.matrix-task-card.dragging,.task-audience-draggable.dragging,.triage-cell.drag-over,.triage-unassigned-drop.drag-over').forEach(el=>el.classList.remove('dragging','drag-over'));
      document.querySelectorAll('.task-audience-drop-over').forEach(el=>el.classList.remove('task-audience-drop-over'));
      document.querySelectorAll('.setting-row.setting-dragging,.setting-row.setting-drop-before,.setting-row.setting-drop-after').forEach(el=>el.classList.remove('setting-dragging','setting-drop-before','setting-drop-after'));document.querySelectorAll('.setting-list.setting-drop-end').forEach(el=>el.classList.remove('setting-drop-end'));
    });

    document.getElementById('eventRepeatType').addEventListener('change',()=>updateEventRepeatUI(true));
    document.getElementById('eventRepeatToggle').addEventListener('click',e=>{
      const expanded=e.currentTarget.getAttribute('aria-expanded')!=='true';
      e.currentTarget.setAttribute('aria-expanded',expanded?'true':'false');
      e.currentTarget.textContent=expanded?'↻ 繰り返し設定を閉じる':'↻ 繰り返しを設定';
      updateEventRepeatUI(true);
    });
    document.getElementById('eventBackgroundColor').addEventListener('input',e=>{e.target.dataset.custom='true';});
    document.getElementById('eventColorReset').addEventListener('click',()=>{const input=document.getElementById('eventBackgroundColor');input.value='#54c7ec';input.dataset.custom='false';});
    document.getElementById('eventDate').addEventListener('change',()=>updateEventRepeatUI(true));
    document.getElementById('eventAllDay').addEventListener('change',e=>{if(e.target.checked)document.getElementById('eventTime').value='';document.getElementById('eventTime').disabled=false;});
    ['input','change'].forEach(eventName=>document.getElementById('eventTime').addEventListener(eventName,e=>{if(e.target.value)document.getElementById('eventAllDay').checked=false;}));
    ['input','change'].forEach(eventName=>document.getElementById('eventEndTime').addEventListener(eventName,e=>{if(e.target.value)document.getElementById('eventAllDay').checked=false;}));
    document.getElementById('eventWorkspace').addEventListener('change',e=>{
      const personal=e.target.value==='personal';
      const privateInput=document.getElementById('eventPrivate');
      if(personal)privateInput.checked=true;
      privateInput.disabled=personal;
      refreshEventCategoryForWorkspace(e.target.value);
    });
    document.getElementById('eventCategory').addEventListener('change',e=>refreshEventTypeSelect(e.target.value));
    document.getElementById('taskRepeatType').addEventListener('change',()=>{clearTaskFormError();updateTaskRepeatUI(true);});
    document.getElementById('taskDue').addEventListener('change',clearTaskFormError);
    document.querySelectorAll('#taskRepeatWeekdays input').forEach(input=>input.addEventListener('change',clearTaskFormError));
    document.getElementById('taskDue').addEventListener('change',()=>updateTaskRepeatUI(true));
    document.getElementById('taskImportance').addEventListener('change',updateTaskPriorityUI);
    document.getElementById('taskUrgency').addEventListener('change',updateTaskPriorityUI);

    document.getElementById('taskCategory').addEventListener('change',e=>refreshTaskTypeSelect(e.target.value,''));
    document.getElementById('taskWorkspace').addEventListener('change',e=>{refreshTaskCategoryForWorkspace(e.target.value);updateTaskTaxonomyMode();});
    bindHierarchySelects(TASK_HIERARCHY_IDS);
    bindHierarchySelects(PROJECT_HIERARCHY_IDS,{onChange:()=>refreshProjectTemplateChoices()});
    bindHierarchySelects(NOTE_HIERARCHY_IDS);
    bindHierarchySelects(CAPTURE_HIERARCHY_IDS);
    bindHierarchySelects(TASK_FILTER_HIERARCHY_IDS,{filter:true,onChange:()=>renderTasks()});
    bindHierarchySelects(PROJECT_FILTER_HIERARCHY_IDS,{filter:true,onChange:()=>renderProjects()});
    document.getElementById('projectTemplate').addEventListener('change',e=>renderProjectTemplatePreview(e.target.value));
    document.getElementById('noteType').addEventListener('change',e=>{
      if(e.target.value==='アイデア')document.getElementById('noteManagementType').value='idea';
      else if(document.getElementById('noteManagementType').value==='idea')document.getElementById('noteManagementType').value='record';
    });
    document.getElementById('noteMajorFilter').addEventListener('change',e=>{
      const middle=document.getElementById('noteMiddleFilter');
      middle.innerHTML=categorySelectOptions(e.target.value==='all'?[]:categoryChildren(e.target.value,{activeOnly:true}),'','all','すべての中カテゴリ');
      renderNotes();
    });
    document.getElementById('captureTaskCategory').addEventListener('change',e=>{const select=document.getElementById('captureTaskType');select.innerHTML=taskTypeOptionsForCategory(e.target.value,'');select.value=firstTaskTypeForCategory(e.target.value);});
    document.getElementById('categoryFilter').addEventListener('change',()=>{refreshTaskTypeFilter();renderTasks();});
    ['taskSearch','statusFilter','priorityFilter','typeFilter','importanceFilter','urgencyFilter','sortFilter','sortDirectionFilter','taskManagementFilter','taskProjectFilter','taskPhaseFilter','taskAssigneeFilter','taskReviewerFilter','taskVisibilityFilter','taskTagFilter','taskDueFilter','taskTemplateFilter','taskClassificationFilter'].forEach(id=>document.getElementById(id)?.addEventListener(['taskSearch','taskTagFilter'].includes(id)?'input':'change',renderTasks));
    ['triageSearch','triageCategoryFilter','triageStatusFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='triageSearch'?'input':'change',renderTaskTriage));
    ['projectSearch','projectCategoryFilter','projectStatusFilter','projectPhaseFilter','projectTemplateFilter','projectVisibilityFilter','projectClassificationFilter'].forEach(id=>document.getElementById(id)?.addEventListener(id==='projectSearch'?'input':'change',renderProjects));
    ['eventSearch','eventCategoryFilter','eventTypeFilter','eventTimeFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='eventSearch'?'input':'change',renderEvents));
    ['meetingSearch','meetingCategoryFilter','meetingTimeFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='meetingSearch'?'input':'change',renderMeetings));
    ['noteSearch','noteTypeFilter','noteMiddleFilter','noteDecisionFilter','noteClassificationFilter'].forEach(id=>document.getElementById(id)?.addEventListener(id==='noteSearch'?'input':'change',renderNotes));
    document.getElementById('clearNoteFilterBtn').addEventListener('click',()=>{['noteSearch'].forEach(id=>document.getElementById(id).value='');['noteTypeFilter','noteMajorFilter','noteMiddleFilter','noteDecisionFilter','noteClassificationFilter'].forEach(id=>document.getElementById(id).value='all');renderNotes();});

    document.getElementById('prevMonthBtn').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderCalendar();});
    document.getElementById('nextMonthBtn').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderCalendar();});
    document.getElementById('todayMonthBtn').addEventListener('click',()=>{calendarCursor=new Date();calendarCursor.setDate(1);selectedDate=localDateString();renderCalendar();});
    document.getElementById('addTaskForDayBtn').addEventListener('click',()=>openTaskDialog(null,{due:selectedDate}));
    document.getElementById('addEventForDayBtn').addEventListener('click',()=>openEventDialog(null,{date:selectedDate}));
    document.getElementById('addMeetingForDayBtn').addEventListener('click',()=>openMeetingDialog(null,{date:selectedDate}));
    document.getElementById('openDailyForDayBtn').addEventListener('click',()=>{dailyCursor=selectedDate;setView('daily');});
    setupSettingsNavigation();
    document.querySelectorAll('.workspace-tab').forEach(tab=>tab.addEventListener('click',()=>{
      const nextWorkspace=tab.dataset.workspace||'all';
      if(nextWorkspace===activeWorkspace)return;
      applyActiveWorkspace(nextWorkspace);
      const main=document.querySelector('.main');
      main?.classList.remove('workspace-switching');
      if(main)void main.offsetWidth;
      main?.classList.add('workspace-switching');
      renderAll();
      setTimeout(()=>main?.classList.remove('workspace-switching'),360);
    }));
    document.getElementById('exportBtn').addEventListener('click',()=>{
      const blob=new Blob([JSON.stringify({...state,version:APP_VERSION,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`arasaki-staff-planner-backup-${localDateString()}.json`; a.click(); URL.revokeObjectURL(url); showToast('バックアップを書き出しました');
    });
    document.getElementById('importFile').addEventListener('change',async e=>{
      const file=e.target.files[0]; if(!file)return;
      try{const parsed=JSON.parse(await file.text()); if(!parsed||!Array.isArray(parsed.tasks))throw new Error('形式'); delete parsed.logs; state={...emptyState(),...parsed}; persistStateSilently(); state=loadState(); renderAll(); showToast('バックアップを読み込みました');}catch(err){alert('読み込めませんでした。正しいバックアップJSONを選んでください。');} e.target.value='';
    });
    document.getElementById('resetBtn').addEventListener('click',()=>{if(confirm('本当にすべてのデータを削除しますか？')){state=emptyState();persistStateSilently();renderAll();showToast('全データを削除しました');}});

    const now=new Date();
    applySurfaceChrome();
    populateAllDropdowns();
    document.getElementById('futureYear').value=now.getFullYear();
    document.getElementById('yearlyYear').value=now.getFullYear();
    document.getElementById('dailyDateInput').value=localDateString();
    document.getElementById('todayText').textContent=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(now);
    refreshProjectSelects(); setView(currentView); renderCalendar(); document.getElementById('eventTime').disabled=false;
    window.__ARASAKI_APP_READY__=true;
    document.dispatchEvent(new CustomEvent('arasaki-app-ready',{detail:{build:APP_BUILD}}));
