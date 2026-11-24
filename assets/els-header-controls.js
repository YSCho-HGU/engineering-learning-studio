/* ELS shared header controls: presentation only.
 * Language selection is owned by ELSLanguage and theme selection by ELSTheme.
 * No progress keys, editor state, or course content are modified.
 */
(function(win,doc){
 "use strict";
 if(win.ELSHeaderControls)return;
  // Shared presentation component used by both C and Signals & Systems.
  // Host course owns the navigation destination and its click behavior.
  function makeNavigationArrow({kind="section",direction=1,label="",href=null}={}){
    const element=doc.createElement(kind==="chapter"?"a":"button");
    element.className="els-header-arrow ss-chapter-arrow ss-nav-"+kind;
    element.setAttribute("aria-label",label);
    element.title=label;
    if(kind==="section")element.type="button";
    if(href!==null&&kind==="chapter")element.setAttribute("href",href);
    const svg=doc.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24");
    svg.setAttribute("focusable","false");
    svg.setAttribute("aria-hidden","true");
    const path=doc.createElementNS("http://www.w3.org/2000/svg","path");
    const left=direction<0;
    path.setAttribute("d",left?"M15 5l-7 7 7 7":"M9 5l7 7-7 7");
    svg.append(path);
    if(kind==="chapter"){
      const bar=doc.createElementNS("http://www.w3.org/2000/svg","path");
      bar.setAttribute("d",left?"M5 5v14":"M19 5v14");
      svg.append(bar);
    }
    element.append(svg);
    return element;
  }
 function normalize(root){
   const scope=root||doc;
   const header=scope.querySelector(".ss-common-header,.site-header,body > header");
   if(!header)return;
   header.classList.add("els-course-header");
   const title=header.querySelector(".ss-common-menu,.brand");
   if(title)title.classList.add("els-course-header-title");
   const actions=header.querySelector(".ss-common-actions,.header-nav");
   if(actions)actions.classList.add("els-course-header-actions");
   const navigation=header.querySelector(".ss-four-navigation");
   if(navigation){
     navigation.classList.add("els-course-header-navigation");
     const arrows=[...navigation.querySelectorAll(".ss-chapter-arrow")];
     arrows.forEach((arrow,index)=>{
       if(arrow.querySelector("svg"))return;
       const template=makeNavigationArrow({kind:arrow.classList.contains("ss-nav-chapter")?"chapter":"section",
         direction:index<2?-1:1,label:arrow.getAttribute("aria-label")||arrow.title||"Navigation"});
       arrow.replaceChildren(template.querySelector("svg"));
       arrow.classList.add("els-header-arrow");
     });
   }
   const language=header.querySelector("#lang,#c-language,#project-lang,#language,.ss-common-language-select,#ss-language-select,label#c-shared-language select");
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
       // Standalone project labels already contain a globe as a text node.
       // Replace that glyph with the same accessible icon, never duplicate it.
       for(const node of [...label.childNodes]){
         if(node.nodeType===3 && node.textContent.trim()==="🌐")node.remove();
       }
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
       const choices=win.ELSTheme.choices||[];
       const required=choices.map(x=>x.join("|")).join(";");
       if(old!==required){
         select.replaceChildren();
         for(const [value,title] of choices){
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
 win.ELSHeaderControls=Object.freeze({normalize:()=>normalize(),makeNavigationArrow,themes:win.ELSTheme?.options?.slice()||[]});
})(window,document);
