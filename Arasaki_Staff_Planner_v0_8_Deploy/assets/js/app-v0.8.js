const STORAGE_KEY = 'arasaki_staff_planner_v1';

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
    const APP_VERSION = 108;
    const APP_BUILD = 'v0.8';
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
    let priorityLabels = { high:'高', medium:'中', low:'低' };
    let priorityOrder = { high:0, medium:1, low:2 };
    let statusLabels = { inbox:'Inbox', todo:'未着手', doing:'進行中', waiting:'待機中', done:'完了' };
    let projectStatusLabels = { planning:'計画中', active:'進行中', waiting:'待機中', completed:'完了', archived:'保管' };
    const viewInfo = {
      home:['Home','今日'], yearly:['Yearly Log','年間ログ'], calendar:['Schedule','カレンダー'], events:['Events','イベント・記念日'], future:['Future Log','未来の予定'],
      weekly:['Weekly Log','週間ログ'], daily:['Daily Log','日別ログ'], triage:['Task Workflow','タスクの整理フロー'],
      tasksAll:['Task','全タスク一覧'], tasksOperations:['Task','運営のタスク一覧'], tasksStaff:['Task','スタッフ用タスク一覧'], tasksCast:['Task','キャスト用タスク一覧'],
      projects:['Project','プロジェクト'], meetings:['Meeting','ミーティング'], schedulePolls:['Schedule','日程調整'],
      notes:['Idea / Note','アイデア・ノート'], mypage:['My Page','マイページ'], backup:['File','バックアップ'], settings:['Settings','メニュー・プルダウン設定']
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
      {view:'tasksAll', label:'全タスク一覧', short:'全件', icon:'✓'},
      {view:'tasksOperations', label:'運営のタスク一覧', short:'運営', icon:'⚓'},
      {view:'tasksStaff', label:'スタッフ用タスク一覧', short:'Staff', icon:'☷'},
      {view:'tasksCast', label:'キャスト用タスク一覧', short:'Cast', icon:'♢'},
      {view:'events', label:'イベントリスト', short:'行事', icon:'☆'},
      {view:'projects', label:'プロジェクトリスト', short:'案件', icon:'◇'},
      {view:'meetings', label:'ミーティングリスト', short:'会議', icon:'◎'},
      {view:'schedulePolls', label:'日程調整', short:'調整', icon:'◷'},
      {view:'notes', label:'アイデア・ノート', short:'ノート', icon:'✎'},
      {view:'backup', label:'バックアップ', short:'保存', icon:'↥'},
      {view:'settings', label:'メニュー・設定', short:'設定', icon:'⚙'}
    ];
    const DEFAULT_MENU_GROUPS = [
      {type:'group',id:'group-log',label:'Log',icon:'◌',visible:true,expanded:true},
      {type:'group',id:'group-list',label:'リスト',icon:'☷',visible:true,expanded:true}
    ];
    function menuPage(view,{visible=true,pinned=false,parentId=null}={}) { return {type:'page',view,visible,pinned,parentId}; }
    function defaultMenuConfig() {
      return [
        menuPage('home'), menuPage('mypage'), menuPage('calendar'), menuPage('triage'),
        {...DEFAULT_MENU_GROUPS[0]},
        menuPage('future',{parentId:'group-log'}), menuPage('yearly',{parentId:'group-log'}), menuPage('weekly',{parentId:'group-log'}), menuPage('daily',{parentId:'group-log'}),
        {...DEFAULT_MENU_GROUPS[1]},
        menuPage('tasksAll',{parentId:'group-list'}), menuPage('tasksOperations',{parentId:'group-list'}), menuPage('tasksStaff',{parentId:'group-list'}), menuPage('tasksCast',{parentId:'group-list'}),
        menuPage('events',{parentId:'group-list'}), menuPage('projects',{parentId:'group-list'}), menuPage('meetings',{parentId:'group-list'}), menuPage('schedulePolls',{parentId:'group-list'}),
        menuPage('notes'), menuPage('backup',{visible:false}), menuPage('settings',{visible:false})
      ];
    }
    const REQUIRED_VISIBLE_MENU_VIEWS = new Set(['home','mypage','tasksAll','tasksOperations','tasksStaff','tasksCast']);
    function enforceRequiredMenuEntries(items) {
      const result=Array.isArray(items)?items.map(item=>({...item})):[];
      let listGroup=result.find(item=>item.type==='group'&&item.id==='group-list');
      if(!listGroup){
        listGroup={...DEFAULT_MENU_GROUPS[1]};
        const logIndex=result.findIndex(item=>item.type==='group'&&item.id==='group-log');
        result.splice(logIndex>=0?logIndex+1:Math.min(4,result.length),0,listGroup);
      }
      listGroup.visible=true;
      listGroup.expanded=true;
      const defaults=defaultMenuConfig();
      REQUIRED_VISIBLE_MENU_VIEWS.forEach(view=>{
        let page=result.find(item=>item.type==='page'&&item.view===view);
        if(!page){
          const fallback=defaults.find(item=>item.type==='page'&&item.view===view)||menuPage(view);
          page={...fallback};
          result.push(page);
        }
        page.visible=true;
        if(['tasksAll','tasksOperations','tasksStaff','tasksCast'].includes(view))page.parentId='group-list';
        if(view==='mypage')page.parentId=null;
      });
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
      source.forEach(item=>{
        if(item?.type==='group'){
          const id=String(item.id||'').trim(); if(!id||groupSeen.has(id))return;
          groupSeen.add(id); result.push({type:'group',id,label:String(item.label||'カテゴリ').trim()||'カテゴリ',icon:item.icon||'▾',visible:item.visible!==false,expanded:item.expanded!==false});
          return;
        }
        const view=typeof item==='string'?item:item?.view;
        if(!MENU_DEFINITIONS.some(def=>def.view===view)||pageSeen.has(view))return;
        pageSeen.add(view); result.push({type:'page',view,visible:item?.visible!==false,pinned:!!item?.pinned,parentId:item?.parentId||null});
      });
      const defaults=defaultMenuConfig();
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
      if(!item||item.type!=='page'||item.visible===false)return false;
      if(item.pinned||!item.parentId)return true;
      return menuGroup(item.parentId)?.visible!==false;
    }

    const TASK_AUDIENCE_LABELS = {operations:'運営',staff:'スタッフ',cast:'キャスト'};
    const TASK_VIEW_AUDIENCE = {tasksAll:'all',tasksOperations:'operations',tasksStaff:'staff',tasksCast:'cast'};
    const LEGACY_ROLE_MAP = {admin:'operations',member:'staff',viewer:'cast'};
    function normalizeStaffRole(role='cast') { return LEGACY_ROLE_MAP[role] || (['owner','operations','staff','cast'].includes(role)?role:'cast'); }
    function currentStaffRole() { return normalizeStaffRole(window.currentStaffUser?.role||'cast'); }
    function canManageTasks() { return ['owner','operations'].includes(currentStaffRole()); }
    function canManageDropdowns() { return canManageTasks(); }
    function taskAudiencesForRole(role=currentStaffRole()) {
      const normalized=normalizeStaffRole(role);
      if(normalized==='owner'||normalized==='operations')return ['operations','staff','cast'];
      if(normalized==='staff')return ['staff','cast'];
      return ['cast'];
    }
    function normalizeTaskAudience(value='staff') { return ['operations','staff','cast'].includes(value)?value:'staff'; }
    function taskAudienceOf(task) { return normalizeTaskAudience(task?.audience||task?.taskAudience||'staff'); }
    function canCurrentRoleSeeTask(task) { return taskAudiencesForRole().includes(taskAudienceOf(task)); }
    function visibleTasks() { return state.tasks.filter(canCurrentRoleSeeTask); }
    function pageAllowedForRole(view,role=currentStaffRole()) {
      const normalized=normalizeStaffRole(role);
      if(view==='tasksAll')return normalized==='owner';
      if(view==='tasksOperations')return normalized==='owner'||normalized==='operations';
      if(view==='tasksStaff')return normalized==='owner'||normalized==='operations'||normalized==='staff';
      if(view==='tasksCast')return true;
      if(view==='backup')return normalized==='owner';
      return true;
    }
    function preferredTaskViewForRole(role=currentStaffRole()) {
      const normalized=normalizeStaffRole(role);
      if(normalized==='owner')return 'tasksAll';
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
      const allowed=canManageTasks();
      document.body.classList.toggle('task-create-disabled',!allowed);
      const createIds=['newTaskBtn','newTaskBtn2','workflowOpenFullTaskBtn','triageNewTaskBtn','addTaskForDayBtn','dailyAddTaskBtn'];
      createIds.forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=!allowed;});
      const capture=document.getElementById('taskCaptureForm');if(capture)capture.hidden=!allowed;
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
        categories: pair(['企画','人事','総務','情報システム','ワールド制作','小物制作','SNS・広報','品質確認']),
        taskTypes: [
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
        eventTypes: pair(['定期イベント','特別イベント','MTG']),
        taskStatuses: [{value:'inbox',label:'Inbox'},{value:'todo',label:'未着手'},{value:'doing',label:'進行中'},{value:'review',label:'確認待ち'},{value:'waiting',label:'待機中'},{value:'hold',label:'保留'},{value:'done',label:'完了',protected:true}],
        priorities: ['1A','1B','1C','2A','2B','2C','3A','3B','3C'].map(value=>({value,label:value,protected:true})),
        taskGroups: [],
        importanceLevels: [{value:'A',label:'A（高）',protected:true},{value:'B',label:'B（中）',protected:true},{value:'C',label:'C（低）',protected:true}],
        urgencyLevels: [{value:'1',label:'1（高）',protected:true},{value:'2',label:'2（中）',protected:true},{value:'3',label:'3（低）',protected:true}],
        projectStatuses: [{value:'planning',label:'計画中'},{value:'active',label:'進行中'},{value:'review',label:'確認中'},{value:'waiting',label:'待機中'},{value:'completed',label:'完了'},{value:'archived',label:'保管'}],
        noteTypes: pair(['アイデア','議事録','決定事項','引き継ぎ','リンク・資料','改善案','その他'])
      };
    }
    const settingNames = {
      categories:'カテゴリ', taskTypes:'タスクの種類', eventTypes:'イベントの種類', taskStatuses:'タスクの状態',
      importanceLevels:'重要度（3段階・名称変更可）', urgencyLevels:'緊急度（3段階・名称変更可）', projectStatuses:'プロジェクト状態',
      noteTypes:'ノートの種類'
    };
    function normalizeSettings(settings) {
      const defaults = defaultSettings();
      const result = {};
      Object.keys(defaults).forEach(key => {
        let source = Array.isArray(settings?.[key]) ? settings[key] : defaults[key];
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

    const emptyState = () => ({ version:APP_VERSION, tasks:[], events:[], projects:[], meetings:[], schedulePolls:[], notes:[], futureItems:[], yearlyLogs:{}, weeklyLogs:{}, settings:defaultSettings(), preferences:defaultAppPreferences(), menuConfig:defaultMenuConfig(), dailyEntries:{}, changeLog:[] });
    let state = loadState();
    syncRuntimeSettings();
    let currentView = 'home';
    let calendarCursor = new Date();
    calendarCursor.setDate(1);
    let selectedDate = localDateString();
    let yearlyCursor = new Date().getFullYear();
    let weeklyCursor = startOfWeek(new Date());
    let dailyCursor = localDateString();
    let pendingFutureSourceTaskId = '';
    let draggingFutureId = '';
    let suppressCalendarClickUntil = 0;

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
          assigneeUid:t.assigneeUid||'', assignee:t.assignee||'', reviewerUid:t.reviewerUid||'', reviewer:t.reviewer||'', createdByUid:t.createdByUid||'', createdBy:t.createdBy||'', updatedAt:t.updatedAt||t.createdAt||'', updatedBy:t.updatedBy||'', audience:normalizeTaskAudience(t.audience||t.taskAudience||'staff'),
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
          ...ev, type:ev.type || 'イベント', category:ev.category || 'PRIVATE', date:ev.date || ev.repeatStart || '', time:ev.time || '', allDay:ev.allDay !== false,
          repeatType:ev.repeatType || 'none', repeatInterval:Math.max(1,Number(ev.repeatInterval)||1),
          repeatWeekdays:Array.isArray(ev.repeatWeekdays)?ev.repeatWeekdays.map(Number).filter(n=>n>=0&&n<=6):[],
          repeatUntil:ev.repeatUntil || '', repeatStart:ev.repeatStart || ev.date || ''
        })) : [];
        next.projects = Array.isArray(next.projects) ? next.projects : [];
        next.meetings = Array.isArray(next.meetings) ? next.meetings : [];
        next.schedulePolls = Array.isArray(next.schedulePolls) ? next.schedulePolls : [];
        next.notes = Array.isArray(next.notes) ? next.notes : [];
        next.futureItems = Array.isArray(next.futureItems) ? next.futureItems : [];
        next.yearlyLogs = next.yearlyLogs && typeof next.yearlyLogs === 'object' ? next.yearlyLogs : {};
        next.weeklyLogs = next.weeklyLogs && typeof next.weeklyLogs === 'object' ? next.weeklyLogs : {};
        next.settings = normalizeSettings(next.settings);
        migrateV48Defaults(next,parsed.version);
        migrateExistingTaskRecords(next);
        next.preferences = normalizeAppPreferences(next.preferences);
        next.menuConfig = normalizeMenuConfig(next.menuConfig);
        next.dailyEntries = next.dailyEntries && typeof next.dailyEntries === 'object' ? next.dailyEntries : {};
        next.changeLog = Array.isArray(next.changeLog) ? next.changeLog.slice(-200) : [];
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
        state.changeLog.push({id:uid('change'),message,at:new Date().toISOString(),by:window.currentStaffUser?.name||window.currentStaffUser?.email||'ローカル'});
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
    const remoteArraySections = new Set(['tasks','events','projects','meetings','schedulePolls','notes','futureItems','changeLog']);
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
        if(!canCurrentRoleSeeTask(task))return;
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
      state.events.forEach(event=>{
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
    function projectOptions(selected='') { return `<option value="">紐づけなし</option>` + state.projects.map(p => `<option value="${p.id}" ${p.id===selected?'selected':''}>${escapeHtml(p.name)}</option>`).join(''); }

    function navButtonHtml(config, mobile=false, child=false) {
      const def=menuDefinition(config.view); if(!def)return '';
      const active=config.view===currentView?' active':'';
      const pinned=config.pinned?(mobile?' pinned-mobile':''):'';
      const audience=TASK_VIEW_AUDIENCE[def.view];
      return `<button class="nav-button${active}${pinned}${child?' nav-child':''}" data-view="${def.view}" ${audience&&audience!=='all'?`data-task-audience-drop="${audience}"`:''}><span class="nav-icon">${def.icon}</span><span>${escapeHtml(mobile?def.short:def.label)}</span>${!mobile&&config.pinned?'<span class="nav-pin-mark" title="ピン留め中">●</span>':''}</button>`;
    }
    function visibleMenuItems() {
      state.menuConfig=normalizeMenuConfig(state.menuConfig);
      return state.menuConfig.filter(item=>item.type==='page'&&pageVisibleInMenu(item)&&pageAllowedForRole(item.view));
    }
    function renderNavigation() {
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
        if(!rendered)html+='<div class="menu-empty-note">表示中のメニューはありません。下の「メニュー・設定」から表示項目を選べます。</div>';
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
      host.innerHTML=state.menuConfig.filter(config=>config.type==='group'||pageAllowedForRole(config.view)).map((config,index)=>{
        const key=menuEntryKey(config);
        if(config.type==='group'){
          const childCount=state.menuConfig.filter(item=>item.type==='page'&&item.parentId===config.id).length;
          return `<div class="menu-customize-row menu-group-row ${config.visible?'':'is-hidden'}" draggable="true" data-menu-key="${escapeHtml(key)}" data-menu-type="group" data-menu-group="${escapeHtml(config.id)}"><div class="menu-drag-handle" title="カテゴリごと移動">≡</div><div class="menu-item-name"><span class="nav-icon">${escapeHtml(config.icon||'▾')}</span><input class="menu-group-name-input" value="${escapeHtml(config.label)}" aria-label="カテゴリ名" /><span class="menu-group-badge">${childCount}ページ</span></div><label class="menu-toggle-label"><input type="checkbox" class="menu-visible-toggle" ${config.visible?'checked':''} />表示</label><label class="menu-toggle-label"><input type="checkbox" class="menu-group-expanded-toggle" ${config.expanded!==false?'checked':''} />開く</label><div class="menu-order-buttons"><button class="icon-btn menu-move-up" title="上へ">↑</button><button class="icon-btn menu-move-down" title="下へ">↓</button><button class="icon-btn menu-group-delete" title="カテゴリ削除">⌫</button></div></div>`;
        }
        const def=menuDefinition(config.view);
        return `<div class="menu-customize-row ${config.parentId?'menu-child-row':''} ${config.visible?'':'is-hidden'} ${config.pinned?'is-pinned':''}" draggable="true" data-menu-key="${escapeHtml(key)}" data-menu-type="page" data-menu-view="${config.view}"><div class="menu-drag-handle" title="ドラッグして並べ替え・カテゴリへ移動">≡</div><div class="menu-item-name"><span class="nav-icon">${def.icon}</span><div class="menu-row-meta"><strong>${escapeHtml(def.label)}</strong><select class="menu-parent-select" aria-label="所属カテゴリ">${groupOptions(config.parentId||'')}</select></div></div><label class="menu-toggle-label"><input type="checkbox" class="menu-visible-toggle" ${config.visible?'checked':''} />表示</label><label class="menu-toggle-label pin-toggle-wrap"><input type="checkbox" class="menu-pin-toggle" ${config.pinned?'checked':''} />ピン留め</label><div class="menu-order-buttons"><button class="icon-btn menu-move-up" title="上へ">↑</button><button class="icon-btn menu-move-down" title="下へ">↓</button></div></div>`;
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
      if(!pageAllowedForRole(viewName))viewName=preferredTaskViewForRole();
      currentView = viewName;
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
            <span class="tag">${categoryIcons[task.category]||'•'} ${escapeHtml(settingLabel('categories',task.category,'未分類'))}</span>
            <span class="tag ${task.priority}">優先度 ${escapeHtml(settingLabel('priorities',task.priority,'未選択'))}</span>
            <span class="tag">${escapeHtml(settingLabel('taskStatuses',task.status,(isDone(task)?'完了':'未選択')))}</span>
            ${task.type?`<span class="tag">${escapeHtml(settingLabel('taskTypes',task.type,task.type))}</span>`:''}
            ${taskAssigneeName(task)?`<span class="tag">担当：${escapeHtml(taskAssigneeName(task))}</span>`:''}
            ${taskReviewerName(task)?`<span class="tag">確認：${escapeHtml(taskReviewerName(task))}</span>`:''}
            ${taskCreatorName(task)?`<span class="tag task-creator-tag">作成：${escapeHtml(taskCreatorName(task))}</span>`:''}${taskAudienceOf(task)?`<span class="tag task-audience-tag">${escapeHtml(TASK_AUDIENCE_LABELS[taskAudienceOf(task)])}用</span>`:''}
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
        <div class="card-actions">${isDone(task)?'<button class="btn small task-undo-complete" type="button">元に戻す</button>':''}<button class="icon-btn task-edit" title="編集">✎</button><button class="icon-btn task-delete" title="削除">⌫</button></div>
      </article>`;
    }

    function eventCardHtml(event, compact=false) {
      const shownDate=event._occurrenceDate||event.date;
      const timeText=event.allDay!==false ? '終日' : (event.time||'時間未定');
      const own=!event.privateOwnerUid||event.privateOwnerUid===(window.currentStaffUser?.uid||'');
      const hidden=!!event.isPrivate&&!own;
      const title=hidden?'予定あり':event.title;
      const typeClass=`event-type-${Math.abs([...String(event.type||'')].reduce((sum,char)=>sum+char.charCodeAt(0),0))%6}`;
      return `<article class="event-card ${typeClass} ${hidden?'private-event':''}" data-kind="event" data-id="${event.id}" data-occurrence-date="${shownDate||''}">
        <div class="event-top"><div><div class="event-title">${hidden?'🔒':'☆'} ${escapeHtml(title)}</div><div class="event-date">${escapeHtml(dateLabel(shownDate))}・${escapeHtml(timeText)}</div>
        <div class="meta-row"><span class="tag event-tag">${escapeHtml(settingLabel('eventTypes',event.type,event.type||'イベント'))}</span><span class="tag">${categoryIcons[event.category]||'•'} ${escapeHtml(settingLabel('categories',event.category,event.category||'未分類'))}</span>${hasRepeat(event)?`<span class="tag repeat-badge">↻ ${escapeHtml(repeatSummary(event))}</span>`:''}</div></div>
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

    function projectCardHtml(p) {
      const tasks = visibleTasks().filter(t => t.projectId === p.id).sort((a,b) =>
        Number(isDone(a))-Number(isDone(b)) ||
        (a.due||'9999-12-31').localeCompare(b.due||'9999-12-31') ||
        (priorityOrder[a.priority]??999)-(priorityOrder[b.priority]??999)
      );
      const done = tasks.filter(isDone).length;
      const open = tasks.length-done;
      const rate = tasks.length ? Math.round(done/tasks.length*100) : 0;
      return `<article class="project-card" data-kind="project" data-id="${p.id}">
        <div class="project-head"><div><div class="project-title">${escapeHtml(p.name)}</div><div class="meta-row"><span class="tag">${categoryIcons[p.category]||'•'} ${escapeHtml(settingLabel('categories',p.category,p.category))}</span><span class="tag">${escapeHtml(settingLabel('projectStatuses',p.status,p.status))}</span>${p.due?`<span class="tag">期限 ${escapeHtml(dateLabel(p.due,false))}</span>`:''}</div></div><div class="card-actions"><button class="icon-btn project-task-add" title="タスク追加">＋</button><button class="icon-btn project-edit">✎</button><button class="icon-btn project-delete">⌫</button></div></div>
        ${p.purpose?`<div class="project-purpose">${nl2br(p.purpose)}</div>`:''}
        <div class="progress"><div style="width:${rate}%"></div></div>
        <div class="project-stats"><div class="mini-stat"><strong>${rate}%</strong><span>進捗</span></div><div class="mini-stat"><strong>${open}</strong><span>未完了</span></div><div class="mini-stat"><strong>${done}</strong><span>完了</span></div></div>
        ${p.note?`<div class="task-note">${nl2br(p.note)}</div>`:''}
        <div class="project-task-section">
          <div class="project-task-section-head"><strong>関連タスク</strong><span>全${tasks.length}件・未完了${open}件・完了${done}件</span></div>
          ${tasks.length?`<div class="project-task-list">${tasks.map(projectTaskRowHtml).join('')}</div>`:'<div class="project-task-empty">このプロジェクトに紐づいたタスクはまだありません。右上の「＋」から追加できます。</div>'}
        </div>
      </article>`;
    }

    function noteCardHtml(n) {
      const pName = projectName(n.projectId);
      return `<article class="note-card" data-kind="note" data-id="${n.id}"><div class="log-head"><div><div class="note-title">${escapeHtml(n.title)}</div><div class="meta-row"><span class="tag">${escapeHtml(settingLabel('noteTypes',n.type,n.type))}</span><span class="tag">${categoryIcons[n.category]||'•'} ${escapeHtml(settingLabel('categories',n.category,n.category))}</span>${pName?`<span class="tag">◇ ${escapeHtml(pName)}</span>`:''}${n.date?`<span class="tag">${escapeHtml(dateLabel(n.date,false))}</span>`:''}</div></div><div class="card-actions"><button class="icon-btn note-to-task" title="ノートをタスクにする">タスクにする</button><button class="icon-btn note-edit">✎</button><button class="icon-btn note-delete">⌫</button></div></div>${n.content?`<div class="note-content">${nl2br(n.content)}</div>`:''}</article>`;
    }

    function renderHome() {
      const today = localDateString();
      const open = visibleTasks().filter(t => !isDone(t));
      document.getElementById('openTaskStat').textContent = open.length;
      document.getElementById('todayTaskStat').textContent = open.filter(t => t.due === today).length;
      document.getElementById('overdueTaskStat').textContent = open.filter(isOverdue).length;
      document.getElementById('activeProjectStat').textContent = state.projects.filter(p => ['planning','active','waiting'].includes(p.status)).length;

      const entry = state.dailyEntries[today] || {};
      document.getElementById('todayGoal').value = entry.goal || '';
      document.getElementById('goodThings').value = entry.goodThings || '';

      document.getElementById('categorySummary').innerHTML = categories.map(cat => {
        const all = visibleTasks().filter(t => t.category === cat);
        const completed = all.filter(isDone).length;
        const remaining = all.length-completed;
        const rate = all.length ? Math.round(completed/all.length*100) : 0;
        return `<div class="category-card"><div class="category-card-head"><strong>${categoryIcons[cat]||'•'} ${escapeHtml(settingLabel('categories',cat,cat))}</strong><span class="remaining">${remaining}</span></div><div class="progress"><div style="width:${rate}%"></div></div><div class="mini-meta">完了 ${completed}件・進捗 ${rate}%</div></div>`;
      }).join('');

      const counts = {high:0,medium:0,low:0};
      open.forEach(t => counts[t.priority] = (counts[t.priority]||0)+1);
      const max = Math.max(1,...Object.values(counts));
      document.getElementById('priorityChart').innerHTML = settingItems('priorities').map(({value,label}) => `<div class="bar-line"><span>優先度 ${escapeHtml(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${(counts[value]||0)/max*100}%"></div></div><strong>${counts[value]||0}</strong></div>`).join('');

      const upcoming = open.slice().sort((a,b) => (a.due||'9999-12-31').localeCompare(b.due||'9999-12-31') || (priorityOrder[a.priority]??999)-(priorityOrder[b.priority]??999)).slice(0,6);
      document.getElementById('upcomingTasks').innerHTML = upcoming.length ? upcoming.map(t => taskCardHtml(t,true)).join('') : '<div class="empty">近日のタスクはありません。</div>';

      const nowKey = `${today}T00:00`;
      const meetings = state.meetings.filter(m => `${m.date}T${m.time||'00:00'}` >= nowKey).sort((a,b) => `${a.date}T${a.time||'00:00'}`.localeCompare(`${b.date}T${b.time||'00:00'}`)).slice(0,3);
      document.getElementById('nextMeetings').innerHTML = meetings.length ? meetings.map(m => meetingCardHtml(m,true)).join('') : '<div class="empty">今後のミーティングはありません。</div>';

      const upcomingEvents=state.events.map(event=>({event,date:nextEventOccurrence(event,today)})).filter(item=>item.date).sort((a,b)=>`${a.date}T${a.event.time||'99:99'}`.localeCompare(`${b.date}T${b.event.time||'99:99'}`)).slice(0,4).map(item=>({...item.event,date:item.date,_occurrenceDate:item.date}));
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
      const today = localDateString();
      const board=currentTaskViewAudience();
      const items = visibleTasks().filter(t => {
        const text = `${t.title} ${t.note||''} ${projectName(t.projectId)}`.toLowerCase();
        let statusMatch = true;
        if (status === 'open') statusMatch = !isDone(t);
        else if (status === 'done') statusMatch = isDone(t);
        else if (status === 'today') statusMatch = !isDone(t) && t.due === today;
        else if (status === 'overdue') statusMatch = isOverdue(t);
        else if (status !== 'all') statusMatch = t.status === status;
        const importanceMatch=importance==='all'||(importance==='unset'?!t.importance:t.importance===importance);
        const urgencyMatch=urgency==='all'||(urgency==='unset'?!t.urgency:t.urgency===urgency);
        const boardMatch=board==='all'||taskAudienceOf(t)===board;
        return boardMatch && (!q || text.includes(q)) && (category==='all'||t.category===category) && (priority==='all'||t.priority===priority) && (type==='all'||t.type===type) && importanceMatch && urgencyMatch && statusMatch;
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
      return items;
    }

    function matrixTaskHtml(task, inMatrix=false) {
      const pName=projectName(task.projectId);
      return `<article class="matrix-task-card ${isDone(task)?'completed':''}" draggable="true" data-kind="task" data-id="${task.id}" data-triage-task="${task.id}">
        <div class="matrix-task-title">${escapeHtml(task.title)}</div>
        <div class="matrix-task-meta">
          <span class="tag">${categoryIcons[task.category]||'•'} ${escapeHtml(settingLabel('categories',task.category,task.category||'未分類'))}</span>
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
        return (!q||text.includes(q))&&(category==='all'||task.category===category)&&(status==='all'||!isDone(task));
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
      return `<article class="workflow-deadline-card" data-workflow-task="${task.id}"><div><div class="workflow-deadline-title">${escapeHtml(task.title)}</div><div class="meta-row"><span class="tag">${categoryIcons[task.category]||'•'} ${escapeHtml(settingLabel('categories',task.category,task.category||'未分類'))}</span><span class="tag">重要 ${escapeHtml(settingLabel('importanceLevels',task.importance,task.importance))}</span><span class="tag">緊急 ${escapeHtml(settingLabel('urgencyLevels',task.urgency,task.urgency))}</span>${pName?`<span class="tag">◇ ${escapeHtml(pName)}</span>`:''}</div>${task.note?`<div class="task-note">${nl2br(task.note)}</div>`:''}</div><div class="workflow-deadline-actions"><div class="field"><label>期限</label><input class="workflow-due-input" type="date" /></div><button class="btn small primary workflow-save-due" type="button">期限を保存</button><button class="btn small workflow-future-btn workflow-move-future" type="button">Future Logへ</button></div></article>`;
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
      const title=board==='all'?'全タスク一覧':`${TASK_AUDIENCE_LABELS[board]}用タスク一覧`;
      const accessible=visibleTasks().filter(task=>board==='all'||taskAudienceOf(task)===board);
      const items = getFilteredTasks();
      const heading=document.getElementById('taskListHeading');if(heading)heading.textContent=title;
      const note=document.getElementById('taskListAccessNote');if(note)note.textContent=canManageTasks()
        ? (board==='all'?'カードを運営・スタッフ・キャストの一覧へドラッグして表示先を変更できます。':`${TASK_AUDIENCE_LABELS[board]}用として登録されたタスクだけを表示しています。`)
        : 'タスクの追加はオーナー・運営のみ可能です。意見やアイデアは「アイデア・ノート」へ記載してください。';
      document.getElementById('taskCountText').textContent = `${items.length}件表示中 / この一覧 全${accessible.length}件`;
      document.getElementById('taskList').innerHTML = items.length ? items.map(t => taskCardHtml(t)).join('') : '<div class="empty">条件に合うタスクはありません。</div>';
      refreshTaskAudienceSelect(board==='all'?'':board);
    }

    function renderProjects() {
      const q = document.getElementById('projectSearch').value.trim().toLowerCase();
      const category = document.getElementById('projectCategoryFilter').value;
      const status = document.getElementById('projectStatusFilter').value;
      const items = state.projects.filter(p => (!q || `${p.name} ${p.purpose||''} ${p.note||''}`.toLowerCase().includes(q)) && (category==='all'||p.category===category) && (status==='all'||p.status===status)).sort((a,b)=>(a.due||'9999-12-31').localeCompare(b.due||'9999-12-31'));
      document.getElementById('projectList').innerHTML = items.length ? items.map(projectCardHtml).join('') : '<div class="empty wide">プロジェクトがありません。大きな作業をまとめたいときに作成してみましょう。</div>';
      refreshProjectSelects();
    }

    function renderEvents() {
      const q=document.getElementById('eventSearch').value.trim().toLowerCase();
      const category=document.getElementById('eventCategoryFilter').value;
      const type=document.getElementById('eventTypeFilter').value;
      const tf=document.getElementById('eventTimeFilter').value;
      const today=localDateString();
      const items=state.events.map(event=>{
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
      const items = state.notes.filter(n => (!q||`${n.title} ${n.content||''}`.toLowerCase().includes(q)) && (type==='all'||n.type===type)).sort((a,b)=>(b.date||b.createdAt||'').localeCompare(a.date||a.createdAt||''));
      document.getElementById('noteList').innerHTML = items.length ? items.map(noteCardHtml).join('') : '<div class="empty">アイデアやメモを残してみましょう。</div>';
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
          const datedFuture = state.futureItems.filter(item=>item.date===ds);
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
      const datedFuture=state.futureItems.filter(item=>item.date===selectedDate);
      const holiday=japaneseHolidayForDate(selectedDate);
      const selectedEventHtml=`${holiday?holidayCardHtml(selectedDate,holiday):''}${events.map(event=>eventCardHtml(event,true)).join('')}`;
      document.getElementById('selectedDayEvents').innerHTML=selectedEventHtml||'<div class="empty">イベントなし</div>';
      document.getElementById('selectedDayFuture').innerHTML=datedFuture.length?datedFuture.map(item=>futureItemHtml(item)).join(''):'<div class="empty">日付確定済みのFuture項目なし</div>';
      document.getElementById('selectedDayTasks').innerHTML = tasks.length ? tasks.map(t=>taskCardHtml(t,true)).join('') : '<div class="empty">タスクなし</div>';
      document.getElementById('selectedDayMeetings').innerHTML = meetings.length ? meetings.map(m=>meetingCardHtml(m,true)).join('') : '<div class="empty">ミーティングなし</div>';
    }

    function refreshProjectSelects() {
      ['taskProject','meetingProject','noteProject','captureTaskProject'].forEach(id => {
        const el = document.getElementById(id); if (!el) return;
        const selected = el.value;
        el.innerHTML = projectOptions(selected);
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
      set('projectCategory', settingOptions('categories'));
      set('meetingCategory', settingOptions('categories'));
      set('eventCategory', settingOptions('categories'));
      set('eventTypeFilter', `<option value="all">すべて</option>${settingOptions('eventTypes')}`);
      set('eventType', settingOptions('eventTypes'));
      set('noteCategory', settingOptions('categories'));
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
    }

    function futureItemHtml(item, config={}) {
      const options=(config&&typeof config==='object'&&!Array.isArray(config))?config:{};
      const exact = item.date ? dateLabel(item.date,false) : `${item.month}月・日付未定`;
      const draggable=!!options.draggable;
      return `<div class="future-item ${draggable?'calendar-future-draggable':''}" data-kind="future" data-id="${item.id}" ${draggable?`draggable="true" data-future-drag-id="${item.id}" title="カレンダーの日付へドラッグできます"`:''}>
        <div><div class="future-item-title">${escapeHtml(item.title)}</div>
        <div class="meta-row"><span class="tag">${categoryIcons[item.category]||'•'} ${escapeHtml(settingLabel('categories',item.category,item.category))}</span><span class="tag">${escapeHtml(exact)}</span></div>
        ${item.note?`<div class="future-item-note">${nl2br(item.note)}</div>`:''}</div>
        <div class="card-actions">${draggable?'<button class="icon-btn future-schedule" title="日付を選んで配置">▦</button>':''}<button class="icon-btn future-task" title="タスクへ">✓</button><button class="icon-btn future-edit">✎</button><button class="icon-btn future-delete">⌫</button></div>
      </div>`;
    }

    function futureItemsForMonth(year, month) {
      return state.futureItems
        .filter(item => Number(item.year)===Number(year) && Number(item.month)===Number(month))
        .sort((a,b)=>(a.date||'9999-12-31').localeCompare(b.date||'9999-12-31') || (a.createdAt||'').localeCompare(b.createdAt||''));
    }

    function openFutureScheduleDialog(item, date='') {
      if(!item)return;
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
      return {id:uid('task'),title:item.title,category,type:fallbackType,audience:defaultTaskAudienceForRole(),status:'todo',completed:false,priority:'',due,projectId:'',group:'',assigneeUid:'',assignee:'',reviewerUid:'',reviewer:'',importance:'',urgency:'',level:'',note:item.note||'',repeatType:'none',repeatInterval:1,repeatWeekdays:[],repeatUntil:'',repeatStart:'',repeatHistory:[],...currentCreatorFields(),createdAt:new Date().toISOString()};
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
        container.innerHTML=`<div class="context-future-wrap is-empty">
          <div class="context-future-head" style="margin-bottom:0"><div><div class="context-future-title">◫ Future Log <span class="month-chip">${target.year}年${target.month}月</span></div><div class="context-future-empty">この月のFuture Logはまだありません。</div></div>
          <button class="btn small context-future-add" data-year="${target.year}" data-month="${target.month}">＋追加</button></div>
        </div>`;
        return;
      }
      container.innerHTML=`<div class="context-future-wrap"><div class="context-future-groups">${groups.map(group=>`
        <section class="context-future-group">
          <div class="context-future-head"><div><div class="context-future-title">◫ Future Log <span class="month-chip">${group.year}年${group.month}月</span></div><div class="future-drag-help">カードを下のカレンダー日付へドラッグすると、期限を決められます。</div></div>
          <button class="btn small context-future-add" data-year="${group.year}" data-month="${group.month}">＋追加</button></div>
          <div class="context-future-list">${group.items.length?group.items.map(item=>futureItemHtml(item,{draggable:true})).join(''):'<div class="context-future-empty">この月の項目はありません。</div>'}</div>
        </section>`).join('')}</div></div>`;
    }
    function yearlyEventOccurrences(year) {
      const results=[];
      const start=new Date(year,0,1), end=new Date(year,11,31);
      state.events.forEach(event=>{
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
      return `<article class="yearly-event-row" data-kind="event" data-id="${event.id}" data-occurrence-date="${ds||''}">
        <div class="yearly-event-day">${date?date.getDate()+'日':'--'}</div>
        <div><div class="yearly-event-title">☆ ${escapeHtml(event.title)}</div><div class="yearly-event-meta">${escapeHtml(settingLabel('eventTypes',event.type,event.type||'イベント'))}・${escapeHtml(time)}${hasRepeat(event)?`・↻ ${escapeHtml(repeatSummary(event))}`:''}</div></div>
        <button class="icon-btn event-edit" title="編集">✎</button>
      </article>`;
    }
    function yearlyFutureRowHtml(item) {
      const date=parseLocalDate(item.date);
      return `<article class="yearly-event-row is-future" data-kind="future" data-id="${item.id}">
        <div class="yearly-event-day">${date?date.getDate()+'日':'月内'}</div>
        <div><div class="yearly-event-title">◫ ${escapeHtml(item.title)}</div><div class="yearly-event-meta">Future Log・${date?escapeHtml(dateLabel(item.date,false)):'日付未定'}${item.note?`・${escapeHtml(item.note.slice(0,45))}${item.note.length>45?'…':''}`:''}</div></div>
        <button class="icon-btn future-edit" title="編集">✎</button>
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
      state.futureItems.filter(item=>Number(item.year)===year&&Number(item.month)===month)
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
      const entry=state.yearlyLogs[String(year)]||{};
      document.getElementById('yearlyTheme').value=entry.theme||'';
      document.getElementById('yearlyGoals').value=entry.goals||'';
      document.getElementById('yearlyMemo').value=entry.memo||'';
      const categoryFilter=document.getElementById('yearlyCategoryFilter')?.value||'all';
      document.getElementById('yearlyMonths').innerHTML=Array.from({length:12},(_,index)=>{
        const month=index+1,groups=yearlyMonthGroups(year,month,categoryFilter);
        const count=groups.reduce((sum,group)=>sum+group.items.length,0);
        const content=groups.length?`<div class="yearly-category-groups">${groups.map(group=>`<section class="yearly-category-group"><div class="yearly-category-head"><span>${escapeHtml(group.label)}</span><span>${group.items.length}件</span></div><div class="yearly-event-list">${group.items.map(item=>item.html).join('')}</div></section>`).join('')}</div>`:'<div class="yearly-empty">この月のイベント・予定はありません</div>';
        return `<section class="yearly-month-card" data-year="${year}" data-month="${month}"><div class="yearly-month-head"><button class="yearly-month-open" data-year="${year}" data-month="${month}" title="${month}月のカレンダーを開く"><span class="yearly-month-title">${month}月</span><small>Calendar →</small></button><span class="tag">${count}件</span></div>${content}</section>`;
      }).join('');
    }
    function saveYearlyLog() {
      const year=String(yearlyCursor||new Date().getFullYear());
      state.yearlyLogs[year]={
        theme:document.getElementById('yearlyTheme').value.trim(),
        goals:document.getElementById('yearlyGoals').value.trim(),
        memo:document.getElementById('yearlyMemo').value.trim(),
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
      const futures=state.futureItems.filter(item=>item.date===dailyCursor).sort((a,b)=>a.title.localeCompare(b.title,'ja'));
      const dailyEventHtml=`${holiday?holidayCardHtml(dailyCursor,holiday):''}${dayEvents.map(event=>eventCardHtml(event,true)).join('')}`;
      document.getElementById('dailyEvents').innerHTML=dailyEventHtml||'<div class="empty">イベントなし</div>';
      document.getElementById('dailyTasks').innerHTML=tasks.length?tasks.map(task=>taskCardHtml(task,true)).join(''):'<div class="empty">タスクなし</div>';
      document.getElementById('dailyMeetings').innerHTML=meetings.length?meetings.map(meeting=>meetingCardHtml(meeting,true)).join(''):'<div class="empty">ミーティングなし</div>';
      document.getElementById('dailyFutureItems').innerHTML=futures.length?futures.map(futureItemHtml).join(''):'<div class="empty">日付が確定したFuture項目なし</div>';
    }
    function saveDailyLog() {
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
      document.getElementById('futureYearGrid').innerHTML=Array.from({length:12},(_,index)=>{
        const month=index+1;
        const items=state.futureItems.filter(item=>Number(item.year)===year&&Number(item.month)===month)
          .sort((a,b)=>(a.date||'9999-12-31').localeCompare(b.date||'9999-12-31'));
        return `<section class="future-month-card"><div class="future-month-head"><div class="future-month-title">${month}月</div><button class="btn small future-add-month" data-month="${month}">＋追加</button></div>
          <div>${items.length?items.map(futureItemHtml).join(''):'<div class="muted" style="font-size:10px">まだ予定はありません</div>'}</div></section>`;
      }).join('');
    }
    function openFutureDialog(item=null, defaults={}) {
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
        const futures=state.futureItems.filter(f=>f.date===ds);
        const events=[
          ...(holiday?[`<div class="week-event holiday">㊗ ${escapeHtml(holiday)}</div>`]:[]),
          ...tasks.map(t=>`<div class="week-event">✓ ${escapeHtml(t.title)}</div>`),
          ...meetings.map(m=>`<div class="week-event meeting">◎ ${escapeHtml(m.title)}${m.time?` ${escapeHtml(m.time)}`:''}</div>`),
          ...dayEvents.map(event=>`<div class="week-event event">☆ ${escapeHtml(event.title)}${event.allDay===false&&event.time?` ${escapeHtml(event.time)}`:''}</div>`),
          ...futures.map(f=>`<div class="week-event future">◫ ${escapeHtml(f.title)}</div>`)
        ].join('');
        return `<section class="week-day-card ${ds===localDateString()?'today':''}">
          <div class="week-day-head"><button class="weekly-day-link" data-date="${ds}" title="Daily Logを開く"><div class="week-day-title">${name}曜日</div><div class="week-day-date">${dateLabel(ds,false)}</div></button>
          <div class="week-day-actions"><button class="icon-btn weekly-add-event" data-date="${ds}" title="イベント追加">☆</button><button class="icon-btn weekly-add-task" data-date="${ds}" title="タスク追加">＋</button></div></div>
          <div class="week-events">${events||'<div class="muted" style="font-size:9px">予定なし</div>'}</div>
          <div class="field"><label>Focus / Memo</label><textarea class="weekly-day-note" data-date="${ds}" placeholder="この日の重点・メモ">${escapeHtml(entry.days?.[ds]||'')}</textarea></div>
        </section>`;
      }).join('');
    }
    function saveWeeklyLog() {
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
    function renderSettings() {
      renderMenuSettings();
      updateThemeControls();
      document.getElementById('weekStartSetting').value=state.preferences.weekStartsOn;
      document.getElementById('showJapaneseHolidaysSetting').checked=state.preferences.showJapaneseHolidays!==false;
      const categoryOptionsForSetting=(selected='')=>`<option value="">共通</option>${settingOptions('categories',selected)}`;
      const dropdownPanel=document.getElementById('dropdownSettingsPanel');
      if(dropdownPanel)dropdownPanel.hidden=!canManageDropdowns();
      if(!canManageDropdowns()){document.getElementById('settingsGrid').innerHTML='';return;}
      document.getElementById('settingsGrid').innerHTML=Object.entries(settingNames).map(([key,name])=>{
        const fixedMatrixLevels=key==='importanceLevels'||key==='urgencyLevels';
        const rows=settingItems(key).map((item,index)=>`<div class="setting-row ${key==='taskTypes'?'task-type-setting-row':''}" data-setting-key="${key}" data-setting-index="${index}">
          <span class="setting-drag-handle" draggable="true" title="ドラッグして並べ替え" aria-label="ドラッグして並べ替え">≡</span>
          <input class="setting-label-input" value="${escapeHtml(item.label)}" aria-label="${escapeHtml(name)}の候補名" />
          ${key==='taskTypes'?`<select class="setting-task-category" aria-label="このタスク種類のカテゴリ">${categoryOptionsForSetting(item.category||'')}</select>`:''}
          <button class="btn small setting-rename">保存</button>
          <button class="icon-btn setting-delete" ${(item.protected||fixedMatrixLevels)?'disabled':''} title="削除">⌫</button>
        </div>`).join('');
        const addArea=fixedMatrixLevels?'<div class="setting-help">3×3表と連動するため3段階固定です。名称と順番を変更できます。</div>':key==='taskTypes'
          ?`<div class="setting-add task-type-setting-add"><input class="setting-new-input" data-setting-key="${key}" placeholder="新しい種類を追加" /><select class="setting-new-category" data-setting-key="${key}">${categoryOptionsForSetting(settingItems('categories')[0]?.value||'')}</select><button class="btn small setting-add-btn" data-setting-key="${key}">追加</button></div>`
          :`<div class="setting-add"><input class="setting-new-input" data-setting-key="${key}" placeholder="新しい候補を追加" /><button class="btn small setting-add-btn" data-setting-key="${key}">追加</button></div>`;
        return `<section class="setting-section"><div class="setting-head"><strong>${escapeHtml(name)}</strong><span class="tag">${settingItems(key).length}件</span></div>
          <div class="setting-list" data-setting-list-key="${key}">${rows}</div>${addArea}</section>`;
      }).join('');
    }
    function applySettingRename(key,index,newLabel) {
      if(!canManageDropdowns()){showToast('プルダウン設定はオーナー・運営のみ変更できます');return;}
      const item=settingItems(key)[index];
      if(!item||!newLabel.trim())return;
      item.label=newLabel.trim();
      syncRuntimeSettings(); populateAllDropdowns(); saveState('候補名を変更しました');
    }
    function applyTaskTypeCategory(index,category) {
      if(!canManageDropdowns()){showToast('プルダウン設定はオーナー・運営のみ変更できます');return;}
      const item=settingItems('taskTypes')[index];if(!item)return;
      item.category=category||'';populateAllDropdowns();saveState('タスク種類のカテゴリを変更しました');
    }
    function addSettingItem(key,label,category='') {
      if(!canManageDropdowns()){showToast('プルダウン設定はオーナー・運営のみ変更できます');return;}
      const clean=label.trim(); if(!clean)return;
      const duplicate=settingItems(key).some(item=>item.label===clean && (key!=='taskTypes'||(item.category||'')===(category||'')));
      if(duplicate){showToast('同じ名前の候補があります');return;}
      const value=`custom_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      settingItems(key).push({value,label:clean,...(key==='taskTypes'?{category:category||''}:{})});
      syncRuntimeSettings(); populateAllDropdowns(); saveState('候補を追加しました');
    }
    function deleteSettingItem(key,index) {
      if(!canManageDropdowns()){showToast('プルダウン設定はオーナー・運営のみ変更できます');return;}
      const item=settingItems(key)[index]; if(!item)return;
      if(item.protected){showToast('この候補は削除できません');return;}
      if(settingUsed(key,item.value)){showToast('使用中の候補は削除できません');return;}
      settingItems(key).splice(index,1);
      syncRuntimeSettings(); populateAllDropdowns(); saveState('候補を削除しました');
    }
    function moveSettingItem(key,fromIndex,toIndex) {
      if(!canManageDropdowns()){showToast('プルダウン設定はオーナー・運営のみ変更できます');return;}
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
        ${responseCount?`<details class="schedule-response-details"><summary>みんなの回答を見る（${responseCount}名）</summary><div class="schedule-response-list">${Object.values(poll.responses||{}).map(response=>`<div><strong>${escapeHtml(response.name||'スタッフ')}</strong><span>${(poll.slots||[]).map(slot=>scheduleStatusLabel(response.answers?.[slot.id]?.status)).join(' ')}</span></div>`).join('')}</div></details>`:''}
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
      document.getElementById('schedulePollForm').reset();
      document.getElementById('schedulePollId').value=poll?.id||'';
      document.getElementById('schedulePollModalTitle').textContent=poll?'日程調整を編集':'日程調整を作成';
      document.getElementById('schedulePollTitle').value=poll?.title||'';
      document.getElementById('schedulePollDescription').value=poll?.description||'';
      document.getElementById('schedulePollStart').value=poll?.start||localDateString();
      document.getElementById('schedulePollEnd').value=poll?.end||localDateString(addDays(new Date(),6));
      document.getElementById('schedulePollTimes').value=(poll?.times||['20:00']).join(', ');
      document.getElementById('schedulePollDeadline').value=poll?.deadline||localDateString(addDays(new Date(),3));
      document.getElementById('schedulePollNotify').checked=poll?.notify!==false;
      document.getElementById('schedulePollFormError').hidden=true;
      document.getElementById('schedulePollDialog').showModal();
    }

    function renderAll() {
      // v0.7: 変更のたびに全ページを再描画せず、現在表示中のページだけを更新します。
      syncRuntimeSettings();
      populateAllDropdowns();
      updateRoleControls();
      renderNavigation();
      if (currentView==='home') renderHome();
      else if (['tasksAll','tasksOperations','tasksStaff','tasksCast'].includes(currentView)) renderTasks();
      else if (currentView==='triage') renderTaskTriage();
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
      else if (currentView==='settings') renderSettings();
      renderScheduleNotifications();
    }

    window.renderAllPlannerViews=renderAll;

    function updateEventRepeatUI(autoSelectWeekday=false) {
      const type=document.getElementById('eventRepeatType').value;
      const panel=document.getElementById('eventRepeatPanel');
      const weekdaysWrap=document.getElementById('eventRepeatWeekdaysWrap');
      panel.hidden=type==='none';
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
      document.getElementById('eventForm').reset();
      document.getElementById('eventModalTitle').textContent=event?'イベントを編集':'イベントを追加';
      document.getElementById('eventId').value=event?.id||'';
      document.getElementById('eventTitle').value=event?.title||'';
      document.getElementById('eventCategory').value=event?.category||preset.category||categories[0]||'';
      document.getElementById('eventType').value=event?.type||settingItems('eventTypes')[0]?.value||'';
      document.getElementById('eventDate').value=event?.date||preset.date||localDateString();
      document.getElementById('eventTime').value=event?.time||'';
      document.getElementById('eventAllDay').checked=event?.allDay!==false && !event?.time;
      document.getElementById('eventPrivate').checked=!!event?.isPrivate;
      document.getElementById('eventTime').disabled=false;
      document.getElementById('eventRepeatType').value=event?.repeatType||preset.repeatType||'none';
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

    function openTaskDialog(task=null, preset={}) {
      if(!task&&!canManageTasks()){
        showToast('タスクの追加はオーナー・運営のみ可能です。アイデア・ノートをご利用ください。');
        setView('notes');return;
      }
      refreshProjectSelects();
      clearTaskFormError();
      document.getElementById('taskModalTitle').textContent = task?'タスクを編集':'タスクを追加';
      document.getElementById('taskId').value = task?.id||'';
      document.getElementById('taskTitle').value = task?.title||'';
      const rawCategory=task?.category||preset.category||categories[0]||'PRIVATE';
      const selectedCategory=resolveTaskCategoryValue(rawCategory);
      document.getElementById('taskCategory').value = selectedCategory;
      const selectedType=resolveTaskTypeValue(selectedCategory,task?.type||preset.type||'',rawCategory);
      refreshTaskTypeSelect(selectedCategory,selectedType);
      document.getElementById('taskStatus').value = task?.status==='inbox'?'':(task?.status||(task?.completed?'done':''));
      document.getElementById('taskDue').value = task?.due||preset.due||'';
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
      updateTaskRepeatUI();
      document.getElementById('taskDialog').showModal();
      setTimeout(()=>document.getElementById('taskTitle').focus(),50);
    }

    function openProjectDialog(p=null) {
      document.getElementById('projectModalTitle').textContent = p?'プロジェクトを編集':'プロジェクトを作成';
      document.getElementById('projectId').value=p?.id||''; document.getElementById('projectName').value=p?.name||'';
      document.getElementById('projectCategory').value=p?.category||(categories.includes('VRchat')?'VRchat':categories[0]); document.getElementById('projectStatus').value=p?.status||'planning';
      document.getElementById('projectStart').value=p?.start||''; document.getElementById('projectDue').value=p?.due||'';
      document.getElementById('projectPurpose').value=p?.purpose||''; document.getElementById('projectNote').value=p?.note||'';
      document.getElementById('projectDialog').showModal();
    }

    function openMeetingDialog(m=null,preset={}) {
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
      document.getElementById('noteType').value=n?.type||'アイデア'; document.getElementById('noteCategory').value=n?.category||(categories.includes('PRIVATE')?'PRIVATE':categories[0]);
      document.getElementById('noteProject').value=n?.projectId||''; document.getElementById('noteDate').value=n?.date||localDateString();
      document.getElementById('noteContent').value=n?.content||''; document.getElementById('noteDialog').showModal();
    }

    document.querySelectorAll('[data-close-dialog]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.closeDialog==='futureDialog'){pendingFutureSourceTaskId='';document.getElementById('futureMoveNotice').hidden=true;}document.getElementById(btn.dataset.closeDialog).close();}));
    document.getElementById('newTaskBtn').addEventListener('click',()=>openTaskDialog());
    document.getElementById('newEventBtn').addEventListener('click',()=>openEventDialog());
    document.getElementById('newEventBtn2').addEventListener('click',()=>openEventDialog());
    document.getElementById('newTaskBtn2').addEventListener('click',()=>openTaskDialog());
    document.getElementById('triageNewTaskBtn').addEventListener('click',()=>{document.getElementById('workflowCaptureSection').scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.getElementById('captureTaskTitle').focus(),350);});
    document.getElementById('workflowOpenFullTaskBtn').addEventListener('click',()=>openTaskDialog());
    document.getElementById('taskCaptureForm').addEventListener('submit',e=>{
      e.preventDefault();
      const title=document.getElementById('captureTaskTitle').value.trim();if(!title)return;
      const category=document.getElementById('captureTaskCategory').value||categories[0];
      const selectedType=document.getElementById('captureTaskType').value||firstTaskTypeForCategory(category);
      state.tasks.push({id:uid('task'),title,category,type:selectedType,audience:normalizeTaskAudience(document.getElementById('captureTaskAudience')?.value||defaultTaskAudienceForRole()),status:'inbox',completed:false,priority:'',due:'',projectId:document.getElementById('captureTaskProject').value||'',group:'',assigneeUid:'',assignee:'',reviewerUid:'',reviewer:'',importance:'',urgency:'',level:'',note:document.getElementById('captureTaskNote').value.trim(),repeatType:'none',repeatInterval:1,repeatWeekdays:[],repeatUntil:'',repeatStart:'',repeatHistory:[],...currentCreatorFields(),createdAt:new Date().toISOString()});
      document.getElementById('captureTaskTitle').value='';document.getElementById('captureTaskNote').value='';
      saveState('洗い出しタスクへ追加しました');
      setTimeout(()=>document.getElementById('captureTaskTitle').focus(),40);
    });
    document.querySelectorAll('[data-workflow-target]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.workflowTarget)?.scrollIntoView({behavior:'smooth',block:'start'})));
    document.querySelectorAll('[data-workflow-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.workflowView)));
    document.getElementById('newProjectBtn').addEventListener('click',()=>openProjectDialog());
    document.getElementById('newMeetingBtn').addEventListener('click',()=>openMeetingDialog());
    document.getElementById('newSchedulePollBtn').addEventListener('click',()=>openSchedulePollDialog());
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
      const eventTime=document.getElementById('eventTime').value;
      const eventAllDay=eventTime ? false : document.getElementById('eventAllDay').checked;
      const event={id:id||uid('event'),title:document.getElementById('eventTitle').value.trim(),category:document.getElementById('eventCategory').value,type:document.getElementById('eventType').value,date:rawDate,time:eventTime,allDay:eventAllDay,note:document.getElementById('eventNote').value.trim(),isPrivate:document.getElementById('eventPrivate').checked,privateOwnerUid:existing?.privateOwnerUid||window.currentStaffUser?.uid||'',repeatType,repeatInterval,repeatWeekdays,repeatUntil,repeatStart:rawDate,createdAt:existing?.createdAt||new Date().toISOString()};
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
      if(!existing&&!canManageTasks()){showToast('タスクの追加はオーナー・運営のみ可能です');document.getElementById('taskDialog').close();setView('notes');return;}
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
      const task={ id:id||uid('task'), title:document.getElementById('taskTitle').value.trim(), category:document.getElementById('taskCategory').value, type:document.getElementById('taskType').value, audience:normalizeTaskAudience(document.getElementById('taskAudience').value), status, completed:status==='done', priority:calculatedPriority(urgency,importance), due:rawDue, projectId:document.getElementById('taskProject').value, group:'', assigneeUid:assigneeSelection.uid, assignee:assigneeSelection.name, reviewerUid:reviewerSelection.uid, reviewer:reviewerSelection.name, importance, urgency, level:'', note:document.getElementById('taskNote').value.trim(),
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
      document.getElementById('taskDialog').close(); saveState(existing?'タスクを更新しました':'タスクを追加しました');
    });

    document.getElementById('projectForm').addEventListener('submit',e=>{
      e.preventDefault(); const id=document.getElementById('projectId').value; const existing=state.projects.find(p=>p.id===id);
      const p={ id:id||uid('project'), name:document.getElementById('projectName').value.trim(), category:document.getElementById('projectCategory').value, status:document.getElementById('projectStatus').value, start:document.getElementById('projectStart').value, due:document.getElementById('projectDue').value, purpose:document.getElementById('projectPurpose').value.trim(), note:document.getElementById('projectNote').value.trim(), createdAt:existing?.createdAt||new Date().toISOString() };
      if(!p.name)return; if(existing)Object.assign(existing,p); else state.projects.push(p);
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
      const times=[...new Set(document.getElementById('schedulePollTimes').value.split(/[,、\s]+/).map(value=>value.trim()).filter(value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value)))].sort();
      const slots=scheduleSlots(start,end,times);
      if(!slots.length){error.textContent='期間と候補時間を確認してください。時間は「20:00, 21:00」の形式で入力します。';error.hidden=false;return;}
      if(slots.length>80){error.textContent='候補が多すぎます。期間または候補時間を減らし、80件以内にしてください。';error.hidden=false;return;}
      const poll={id:id||uid('schedule'),title:document.getElementById('schedulePollTitle').value.trim(),description:document.getElementById('schedulePollDescription').value.trim(),start,end,times,slots,deadline:document.getElementById('schedulePollDeadline').value,notify:document.getElementById('schedulePollNotify').checked,status:existing?.status||'open',responses:{...(existing?.responses||{})},createdAt:existing?.createdAt||new Date().toISOString(),createdBy:scheduleUserName(),createdByUid:scheduleUserKey(),updatedAt:new Date().toISOString()};
      if(!poll.title||!poll.deadline)return;
      if(existing)Object.assign(existing,poll);else state.schedulePolls.push(poll);
      document.getElementById('schedulePollDialog').close();
      saveState(existing?'日程調整を更新しました':'日程調整を作成し、通知を出しました');
    });

    document.getElementById('noteForm').addEventListener('submit',e=>{
      e.preventDefault(); const id=document.getElementById('noteId').value; const existing=state.notes.find(n=>n.id===id);
      const n={ id:id||uid('note'), title:document.getElementById('noteTitle').value.trim(), type:document.getElementById('noteType').value, category:document.getElementById('noteCategory').value, projectId:document.getElementById('noteProject').value, date:document.getElementById('noteDate').value, content:document.getElementById('noteContent').value.trim(), createdAt:existing?.createdAt||new Date().toISOString() };
      if(!n.title)return; if(existing)Object.assign(existing,n); else state.notes.push(n);
      document.getElementById('noteDialog').close(); saveState(existing?'ノートを更新しました':'ノートを追加しました');
    });


    document.getElementById('applyFutureScheduleBtn').addEventListener('click',()=>{
      const id=document.getElementById('futureScheduleId').value;
      const date=document.getElementById('futureScheduleDate').value;
      const item=state.futureItems.find(entry=>entry.id===id);
      const mode=document.querySelector('input[name="futureScheduleMode"]:checked')?.value||'move';
      if(!item){showToast('Future項目が見つかりません');return;}
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
      const date=document.getElementById('futureDate').value;
      const item={
        id:id||uid('future'),
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
      if(!draggingFutureId){e.preventDefault();return;}
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

    document.addEventListener('click',e=>{
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
        saveState('回答を保存しました。通知を完了にしました');return;
      }
      const scheduleEdit=e.target.closest('.schedule-poll-edit');
      if(scheduleEdit){const poll=state.schedulePolls.find(item=>item.id===scheduleEdit.closest('[data-schedule-poll]')?.dataset.schedulePoll);if(poll)openSchedulePollDialog(poll);return;}
      const scheduleDelete=e.target.closest('.schedule-poll-delete');
      if(scheduleDelete){const id=scheduleDelete.closest('[data-schedule-poll]')?.dataset.schedulePoll;if(confirm('この日程調整と全員の回答を削除しますか？')){state.schedulePolls=state.schedulePolls.filter(item=>item.id!==id);saveState('日程調整を削除しました');}return;}
      const card=e.target.closest('[data-kind][data-id]'); if(!card)return;
      const {kind,id}=card.dataset;
      if(kind==='event'){
        const item=state.events.find(event=>event.id===id);
        if(e.target.closest('.event-edit'))openEventDialog(item);
        if(e.target.closest('.event-delete')&&confirm(hasRepeat(item)?'この繰り返しイベント全体を削除しますか？':'このイベントを削除しますか？')){state.events=state.events.filter(event=>event.id!==id);saveState('イベントを削除しました');}
      }
      if(kind==='future'){
        const item=state.futureItems.find(f=>f.id===id);
        if(e.target.closest('.future-edit'))openFutureDialog(item);
        if(e.target.closest('.future-task')){
          openTaskDialog(null,{due:item.date||'',category:item.category});
          document.getElementById('taskTitle').value=item.title;
          document.getElementById('taskNote').value=item.note||'';
        }
        if(e.target.closest('.future-delete')&&confirm('このFuture項目を削除しますか？')){state.futureItems=state.futureItems.filter(f=>f.id!==id);saveState('Future項目を削除しました');}
      }
      if(kind==='task'){
        const item=state.tasks.find(t=>t.id===id);
        if(e.target.closest('.task-undo-complete')){setTaskCompletion(item,false,card.dataset.occurrenceDate||item.due);return;}
        if(e.target.closest('.task-edit'))openTaskDialog(item);
        if(e.target.closest('.matrix-unassign')){assignTaskTriage(id,'','');return;}
        if(e.target.closest('.task-delete')&&confirm(hasRepeat(item)?'この繰り返しタスク全体を削除しますか？':'このタスクを削除しますか？')){state.tasks=state.tasks.filter(t=>t.id!==id);saveState('タスクを削除しました');}
      }
      if(kind==='project'){
        const item=state.projects.find(p=>p.id===id);
        if(e.target.closest('.project-edit'))openProjectDialog(item);
        if(e.target.closest('.project-task-add'))openTaskDialog(null,{projectId:id,category:item.category});
        if(e.target.closest('.project-delete')&&confirm('このプロジェクトを削除しますか？\n関連タスクは残り、紐づけだけ解除されます。')){state.projects=state.projects.filter(p=>p.id!==id);state.tasks.forEach(t=>{if(t.projectId===id)t.projectId='';});state.meetings.forEach(m=>{if(m.projectId===id)m.projectId='';});state.notes.forEach(n=>{if(n.projectId===id)n.projectId='';});saveState('プロジェクトを削除しました');}
      }
      if(kind==='meeting'){
        const item=state.meetings.find(m=>m.id===id);
        if(e.target.closest('.meeting-edit'))openMeetingDialog(item);
        if(e.target.closest('.meeting-delete')&&confirm('このミーティング記録を削除しますか？')){state.meetings=state.meetings.filter(m=>m.id!==id);saveState('ミーティングを削除しました');}
      }
      if(kind==='note'){
        const item=state.notes.find(n=>n.id===id);
        if(e.target.closest('.note-to-task')){openTaskDialog(null,{due:item.date||'',category:item.category||categories[0],projectId:item.projectId||''});document.getElementById('taskTitle').value=item.title||'';document.getElementById('taskNote').value=item.content||'';showToast('ノート内容をタスク入力へ移しました');return;}
        if(e.target.closest('.note-edit'))openNoteDialog(item);
        if(e.target.closest('.note-delete')&&confirm('このノートを削除しますか？')){state.notes=state.notes.filter(n=>n.id!==id);saveState('ノートを削除しました');}
      }
    });

    document.addEventListener('change',e=>{
      if(e.target.classList.contains('setting-task-category')){const row=e.target.closest('.setting-row');applyTaskTypeCategory(Number(row.dataset.settingIndex),e.target.value);return;}
      if(e.target.classList.contains('menu-visible-toggle')){
        const row=e.target.closest('.menu-customize-row');const item=state.menuConfig.find(config=>menuEntryKey(config)===row.dataset.menuKey);
        if(item){item.visible=e.target.checked;if(item.type==='page'&&!item.visible)item.pinned=false;commitMenuConfig(item.visible?'メニューを表示しました':'メニューを非表示にしました');}return;
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
        if(task&&canManageTasks()){task.audience=normalizeTaskAudience(audienceTarget.dataset.taskAudienceDrop);saveState(`${TASK_AUDIENCE_LABELS[task.audience]}用タスク一覧へ移動しました`);}
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
    document.getElementById('eventDate').addEventListener('change',()=>updateEventRepeatUI(true));
    document.getElementById('eventAllDay').addEventListener('change',e=>{if(e.target.checked)document.getElementById('eventTime').value='';document.getElementById('eventTime').disabled=false;});
    ['input','change'].forEach(eventName=>document.getElementById('eventTime').addEventListener(eventName,e=>{if(e.target.value)document.getElementById('eventAllDay').checked=false;}));
    document.getElementById('taskRepeatType').addEventListener('change',()=>{clearTaskFormError();updateTaskRepeatUI(true);});
    document.getElementById('taskDue').addEventListener('change',clearTaskFormError);
    document.querySelectorAll('#taskRepeatWeekdays input').forEach(input=>input.addEventListener('change',clearTaskFormError));
    document.getElementById('taskDue').addEventListener('change',()=>updateTaskRepeatUI(true));
    document.getElementById('taskImportance').addEventListener('change',updateTaskPriorityUI);
    document.getElementById('taskUrgency').addEventListener('change',updateTaskPriorityUI);

    document.getElementById('taskCategory').addEventListener('change',e=>refreshTaskTypeSelect(e.target.value,''));
    document.getElementById('captureTaskCategory').addEventListener('change',e=>{const select=document.getElementById('captureTaskType');select.innerHTML=taskTypeOptionsForCategory(e.target.value,'');select.value=firstTaskTypeForCategory(e.target.value);});
    document.getElementById('categoryFilter').addEventListener('change',()=>{refreshTaskTypeFilter();renderTasks();});
    ['taskSearch','statusFilter','priorityFilter','typeFilter','importanceFilter','urgencyFilter','sortFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='taskSearch'?'input':'change',renderTasks));
    ['triageSearch','triageCategoryFilter','triageStatusFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='triageSearch'?'input':'change',renderTaskTriage));
    ['projectSearch','projectCategoryFilter','projectStatusFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='projectSearch'?'input':'change',renderProjects));
    ['eventSearch','eventCategoryFilter','eventTypeFilter','eventTimeFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='eventSearch'?'input':'change',renderEvents));
    ['meetingSearch','meetingCategoryFilter','meetingTimeFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='meetingSearch'?'input':'change',renderMeetings));
    ['noteSearch','noteTypeFilter'].forEach(id=>document.getElementById(id).addEventListener(id==='noteSearch'?'input':'change',renderNotes));
    document.getElementById('clearNoteFilterBtn').addEventListener('click',()=>{document.getElementById('noteSearch').value='';document.getElementById('noteTypeFilter').value='all';renderNotes();});

    document.getElementById('prevMonthBtn').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderCalendar();});
    document.getElementById('nextMonthBtn').addEventListener('click',()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderCalendar();});
    document.getElementById('todayMonthBtn').addEventListener('click',()=>{calendarCursor=new Date();calendarCursor.setDate(1);selectedDate=localDateString();renderCalendar();});
    document.getElementById('addTaskForDayBtn').addEventListener('click',()=>openTaskDialog(null,{due:selectedDate}));
    document.getElementById('addEventForDayBtn').addEventListener('click',()=>openEventDialog(null,{date:selectedDate}));
    document.getElementById('addMeetingForDayBtn').addEventListener('click',()=>openMeetingDialog(null,{date:selectedDate}));
    document.getElementById('openDailyForDayBtn').addEventListener('click',()=>{dailyCursor=selectedDate;setView('daily');});

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
    populateAllDropdowns();
    document.getElementById('futureYear').value=now.getFullYear();
    document.getElementById('yearlyYear').value=now.getFullYear();
    document.getElementById('dailyDateInput').value=localDateString();
    document.getElementById('todayText').textContent=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(now);
    refreshProjectSelects(); renderAll(); renderCalendar(); document.getElementById('eventTime').disabled=false;
    window.__ARASAKI_APP_READY__=true;
    document.dispatchEvent(new CustomEvent('arasaki-app-ready',{detail:{build:APP_BUILD}}));
