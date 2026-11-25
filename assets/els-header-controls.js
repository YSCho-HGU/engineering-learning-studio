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
 // One header factory; courses provide chapter routes and section handlers.
 // Existing S&S static headers are adopted by mountSlots() to avoid a blank
 // header before scripts load. Both paths have the identical DOM contract.
 function createCourseHeader({className="",homeHref="../../",title="",chapterLinks=[],
   languageId="els-course-language",themeId="els-course-theme",showLanguage=true}={}){
   const create=(tag,cls,content)=>{
     const node=doc.createElement(tag);
     if(cls)node.className=cls;
     if(content!==undefined)node.textContent=content;
     return node;
   };
   const header=create("header","ss-common-header els-course-header "+className);
   header.setAttribute("aria-label","Engineering Learning Studio navigation");
   const home=create("a","ss-common-home","← Studio");home.href=homeHref;
   const menu=create("details","ss-common-menu");
   const summary=create("summary","ss-common-title",title);
   summary.setAttribute("aria-label","Choose chapter");
   const links=create("nav","ss-common-links");
   links.setAttribute("aria-label","Choose Chapter");
   for(const item of chapterLinks){
     const link=create("a","",item.label);
     link.href=item.href;
     if(item.current)link.setAttribute("aria-current","page");
     links.append(link);
   }
   menu.append(summary,links);
   const left=create("div","els-header-left");
   left.append(home,menu);
   const navigation=create("nav","ss-four-navigation els-course-header-navigation");
   navigation.setAttribute("aria-label","Chapter and section navigation");
   const actions=create("div","ss-common-actions els-course-header-actions");
   let languageSelect=null;
   if(showLanguage){
   const language=create("label","ss-common-language");
   language.htmlFor=languageId;
   const globe=create("span","ss-language-icon","🌐");
   globe.setAttribute("aria-hidden","true");
   languageSelect=create("select","ss-common-language-select");
   languageSelect.id=languageId;
   languageSelect.setAttribute("aria-label","Language / 언어");
   for(const [value,label] of [["mixed","한/영"],["en","English"],["ko","한국어"]]){
     const option=create("option","",label);option.value=value;languageSelect.append(option);
   }
   language.append(globe,languageSelect);
   actions.append(language);
   }
   const theme=create("label","ss-common-theme");theme.htmlFor=themeId;
   const themeSelect=create("select","");
   themeSelect.id=themeId;
   themeSelect.setAttribute("aria-label","Theme");
   themeSelect.setAttribute("data-els-theme-picker","");
   const choices=win.ELSTheme?.choices||[
     ["white-clean","White Clean"],["warm-neutral","Warm Neutral"],
     ["warm-dark","Warm Dark"],["navy-dark","Navy Dark"],["neutral-dark","Neutral Dark"]];
   for(const [value,label] of choices){
     const option=create("option","",label);option.value=value;themeSelect.append(option);
   }
   themeSelect.value=win.ELSTheme?.get?.()||"neutral-dark";
   themeSelect.addEventListener("change",()=>win.ELSTheme?.set?.(themeSelect.value));
   theme.append(themeSelect);
   actions.append(theme);
   header.append(left,navigation,actions);
   mountSlots(header);
   return {header,home,menu,summary,links,navigation,actions,languageSelect,themeSelect};
 }
 // The only layout composer for both courses. It accepts existing
 // navigation nodes so course-specific event listeners and state survive.
 function mountSlots(header){
   if(!header)return;
   header.classList.add("els-course-header");
   header.dataset.elsHeaderVersion="7";
   if(header.classList.contains("ss-common-header")&&!header.querySelector(":scope > .els-header-left")){
     const home=header.querySelector(":scope > .ss-common-home");
     const menu=header.querySelector(":scope > .ss-common-menu");
     if(home&&menu){
       const left=doc.createElement("div");
       left.className="els-header-left";
       header.insertBefore(left,home);
       left.append(home,menu);
     }
   }
   header.querySelector(".ss-four-navigation")?.classList.add("els-course-header-navigation");
   header.querySelector(".ss-common-actions")?.classList.add("els-course-header-actions");
 }
 function normalize(root){
   const scope=root||doc;
   const header=scope.querySelector(".ss-common-header");
   if(!header)return;
   mountSlots(header);
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
   for(const select of header.querySelectorAll('select[data-els-theme-picker],select#theme-select,select#theme')){
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
 // Keep the selected lesson visible after a mobile TOC changes the content.
 // Native anchors retain their hash and course-owned event listeners; no navigation is intercepted.
 function setupMobileLessonScroll(){
   if(doc.documentElement.dataset.elsMobileScrollBound==="1")return;
   doc.documentElement.dataset.elsMobileScrollBound="1";
   const query=win.matchMedia("(max-width: 800px)");
   const menuSelector=[
     ".ss-layout-sidebar nav button",
     ".ss-vertical-sidebar nav button",
     ".ss-app-toc a[href^='#']",
     ".ss-app-shortcuts a[href^='#']",
     "#lesson-nav button[data-lesson]",
     "#lesson-nav button[data-nav]",
     "#lesson-nav a[href^='#lab-']",
     "#lesson-nav .c-nav-item",
     ".cp-menu .cp-nav-item",
     ".side-nav a[data-lab-link]",
     ".ss-al-tabs a[href^='#']",
     ".ss-sys-tabs a[href^='#']"
   ].join(",");
   let sequence=0;
   function targetFor(control){
     const hash=control.getAttribute("href");
     if(hash&&hash.startsWith("#")&&hash.length>1){
       const found=doc.getElementById(decodeURIComponent(hash.slice(1)));
       if(found)return found;
     }
     return doc.querySelector(
       "#lesson, .ss-layout-main, .ss-vertical-main, .ss-app-main, .ss-al-workspace, .ss-sys-root, main.main, main#app, main"
     );
   }
   function align(control,token){
     if(token!==sequence||!query.matches||!control.isConnected)return;
     const target=targetFor(control);
     if(!target||target.hidden)return;
     const header=doc.querySelector("body > header.ss-common-header, body > header.els-course-header, body > header.site-header");
     const height=header?header.getBoundingClientRect().height:0;
     const offset=Math.max(12,Math.min(190,height+10));
     const top=Math.max(0,win.scrollY+target.getBoundingClientRect().top-offset);
     if(Math.abs(win.scrollY-top)>3)win.scrollTo({top,behavior:"instant"});
   }
   doc.addEventListener("click",event=>{
     if(!query.matches)return;
     const control=event.target.closest?.(menuSelector);
     if(!control||control.closest(".ss-common-header, .els-course-header"))return;
     if(control.matches("a")&&control.getAttribute("href")?.startsWith("http"))return;
     const token=++sequence;
     win.requestAnimationFrame(()=>win.requestAnimationFrame(()=>align(control,token)));
     win.setTimeout(()=>align(control,token),100);
     win.setTimeout(()=>align(control,token),260);
   });
 }
 function ready(){normalize();setupMobileLessonScroll();win.addEventListener("els:themechange",()=>normalize());}
 if(doc.readyState==="loading")doc.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
 win.ELSHeaderControls=Object.freeze({normalize:()=>normalize(),mountSlots,createCourseHeader,makeNavigationArrow,themes:win.ELSTheme?.options?.slice()||[]});
})(window,document);
