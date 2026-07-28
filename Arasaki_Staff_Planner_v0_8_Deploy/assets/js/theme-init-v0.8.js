(()=>{
      const fallback={mode:'light',color:'blue'};
      try{
        const saved=JSON.parse(localStorage.getItem('arasaki_staff_planner_theme_v1')||'null')||fallback;
        const mode=['dark','light'].includes(saved.mode)?saved.mode:fallback.mode;
        const color=['blue','red','yellow','pink','green'].includes(saved.color)?saved.color:fallback.color;
        document.documentElement.dataset.themeMode=mode;
        document.documentElement.dataset.themeColor=color;
      }catch(_){
        document.documentElement.dataset.themeMode=fallback.mode;
        document.documentElement.dataset.themeColor=fallback.color;
      }
    })();
