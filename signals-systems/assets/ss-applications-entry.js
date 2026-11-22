/* Applications links on existing S&S Overview and Learning Map. */
(()=>{"use strict";
 const lang=window.ELSLanguage;
 const render=()=>{
  const mode=lang?.get?.()||"mixed";
  document.querySelectorAll("[data-app-en][data-app-ko]").forEach(el=>{
   const en=el.dataset.appEn,ko=el.dataset.appKo;
   el.textContent=mode==="en"?en:mode==="ko"?ko:en+" · "+ko;
  });
 };
 lang?.subscribe?.(render);
 render();
})();
