/* ELS shared header controls: presentation only.
 * Language selection is owned by ELSLanguage and theme selection by ELSTheme.
 * No progress keys, editor state, or course content are modified.
 */
(function(win,doc){
 "use strict";
 if(win.ELSHeaderControls)return;
 const themes=[["white-clean","White Clean"],["warm-neutral","Warm Neutral"],["warm-dark","Warm Dark"],["navy-dark","Navy Dark"],["neutral-dark","Neutral Dark"]];
 function normalize(root){
   const scope=root||doc;
   const header=scope.querySelector(".ss-common-header,.site-header,body > header");
   if(!header)return;
   const language=header.querySelector("#lang,#c-language,.ss-common-language-select,#ss-language-select");
   if(language){
     const wrapped=language.closest("label");
     const label=wrapped||header.querySelector('label[for="'+language.id+'"]');
     if(label){
       label.classList.add("els-header-language");
       let icon=label.querySelector(".els-header-language-icon,.ss-language-icon");
       if(!icon){
         icon=doc.createElement("span");icon.className="els-header-language-icon";
         if(wrapped)label.insertBefore(icon,language);else label.replaceChildren(icon);
       }
       icon.textContent="🌐";icon.setAttribute("aria-hidden","true");
       for(const child of Array.from(label.children)){
         if(child!==icon&&child!==language&&child.matches("span"))child.hidden=true;
       }
       language.setAttribute("aria-label","Select language / 언어 선택");
     }
   }
   for(const select of header.querySelectorAll('[data-els-theme-picker],#theme-select,#theme')){
     select.setAttribute("data-els-theme-picker","");
     select.setAttribute("aria-label","Theme / 화면 테마");
     if(win.ELSTheme&&typeof win.ELSTheme.get==="function"){
       const active=win.ELSTheme.get();
       const old=[...select.options].map(x=>x.value+"|"+x.textContent).join(";");
       const required=themes.map(x=>x.join("|")).join(";");
       if(old!==required){
         select.replaceChildren();
         for(const [value,title] of themes){
           const option=doc.createElement("option");option.value=value;option.textContent=title;select.append(option);
         }
       }
       select.value=active;
     }
     const standalone=header.querySelector('label[for="'+select.id+'"]');
     if(standalone && !standalone.contains(select) && standalone.textContent.trim())standalone.textContent="";
     const wrapper=select.closest("label");
     if(wrapper){wrapper.classList.add("els-header-theme");for(const child of wrapper.children){if(child!==select&&child.matches("span"))child.hidden=true}}
   }
 }
 function ready(){normalize();win.addEventListener("els:themechange",()=>normalize());}
 if(doc.readyState==="loading")doc.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
 win.ELSHeaderControls=Object.freeze({normalize:()=>normalize(),themes:themes.map(x=>x[0])});
})(window,document);
