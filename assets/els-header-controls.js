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
     "aside nav button[data-exp]",
     "aside nav button[data-lab]",
     "aside nav a[href^='#']",
     ".ss-app-topic > summary",
     ".ss-app-abd-planned > summary",
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
     if(control.tagName==="SUMMARY"&&control.parentElement?.tagName==="DETAILS")return control.parentElement;
     const hash=control.getAttribute("href");
     if(hash&&hash.startsWith("#")&&hash.length>1){
       const found=doc.getElementById(decodeURIComponent(hash.slice(1)));
       if(found&&!found.hidden&&!found.closest("[hidden]"))return found;
     }
     return doc.querySelector(
       "#lesson, .ss-layout-main, .ss-vertical-main, .ss-app-main, .ss-al-workspace, .ss-sys-root, main.main, main#app, main"
     );
   }

   // A lightweight in-content return control: no sticky heading, no desktop layout impact.
   function installMobileLessonStyles(){
     if(doc.getElementById("els-mobile-learning-styles"))return;
     const style=doc.createElement("style");
     style.id="els-mobile-learning-styles";
     style.textContent=[
       ".els-mobile-open-lessons{display:none!important}",
       "@media(max-width:800px){",
       "#lesson>.els-mobile-open-lessons,.ss-layout-main>.els-mobile-open-lessons{",
       "display:inline-flex!important;align-items:center;min-height:40px;margin:0 0 12px;",
       "padding:8px 14px;border-radius:9px;border:1px solid var(--els-border,var(--line,#718096));",
       "background:var(--els-surface-alt,var(--card,#293747));color:var(--els-ink,var(--ink,#f1f5f9));",
       "font:600 14px/1.4 system-ui,sans-serif;cursor:pointer}",
       ".els-mobile-open-lessons:focus-visible{outline:3px solid var(--els-link,#5caac0);outline-offset:2px}",
       "#lesson,.ss-layout-main,.ss-vertical-main{min-width:0;max-width:100%}",
       "#lesson pre,.ss-layout-main pre{max-width:100%;overflow-x:auto}",
       "#lesson canvas,#lesson svg,.ss-layout-main canvas,.ss-layout-main svg{max-width:100%}",
       "}",
       "@media(min-width:801px){.els-mobile-open-lessons{display:none!important}}",
       "@media(max-width:800px){",
       "#lesson-nav .els-current-lesson,.ss-layout-sidebar nav .els-current-lesson{",
       "box-shadow:inset 3px 0 0 var(--els-link,var(--els-accent,#4dabb3))!important;",
       "background:var(--els-surface-alt,var(--card,rgba(77,171,179,.12)))!important;",
       "color:var(--els-ink,var(--ink,inherit))!important;font-weight:750!important}",
       "}"
     ].join("");
     doc.head.append(style);
   }
   function findCurrentLesson(nav){
     if(!nav)return null;
     const selectors=[
       '[aria-current="step"]','[aria-current="page"]','[aria-current="true"]',
       'button.current','button.active','button.on',
       'a.current','a.active','a.on','button[aria-selected="true"]',
       'button[data-active="true"]'
     ];
     for(const selector of selectors){
       const matches=nav.querySelectorAll(selector);
       for(const candidate of matches){
         if(candidate.closest(".ss-mobile-index-toggle,.ss-side-toggle"))continue;
         return candidate;
       }
     }
     return null;
   }
   function markCurrentLesson(nav){
     if(!query.matches||!nav)return;
     const current=findCurrentLesson(nav);
     nav.querySelectorAll(".els-current-lesson").forEach(item=>{
       if(item!==current)item.classList.remove("els-current-lesson");
     });
     if(current)current.classList.add("els-current-lesson");
   }
   function ensureReturnToLessons(){
     if(!query.matches)return;
     installMobileLessonStyles();
     const toc=doc.querySelector("#lesson-nav, .ss-layout-sidebar nav");
     const content=doc.querySelector("#lesson, .ss-layout-main");
     if(!toc||!content)return;
     let control=doc.getElementById("els-mobile-open-lessons");
     if(!control){
       control=doc.createElement("button");
       control.id="els-mobile-open-lessons";
       control.type="button";
       control.className="els-mobile-open-lessons";
       control.setAttribute("aria-label","Open lesson list / 학습 목차 열기");
       control.textContent="☰  "+(win.ELSLanguage?.get?.()==="en"?"Lessons":"목차");
       control.addEventListener("click",()=>{
         if(!query.matches)return;
         const currentToc=doc.querySelector("#lesson-nav, .ss-layout-sidebar nav");
         if(!currentToc)return;
         const currentSide=currentToc.closest(".ss-layout-sidebar");
         const toggle=currentSide?.querySelector(".ss-mobile-index-toggle");
         if(toggle&&toggle.getAttribute("aria-expanded")==="false")toggle.click();
         const current=findCurrentLesson(currentToc);
         if(current){
           for(let parent=current.parentElement;parent&&parent!==currentToc;parent=parent.parentElement){
             if(parent.tagName==="DETAILS")parent.open=true;
           }
         }else if(!currentSide){
           const group=currentToc.querySelector("details");
           if(group)group.open=true;
         }
         const reveal=()=>{
           if(!query.matches)return;
           const nav=doc.querySelector("#lesson-nav, .ss-layout-sidebar nav");
           if(!nav)return;
           const active=findCurrentLesson(nav);
           if(active){
             markCurrentLesson(nav);
             // Align the chosen lesson in its own scrollable list before
             // changing page scroll; scrolling the whole nav to its start
             // hides the current item on long chapter menus.
             for(let parent=active.parentElement;parent;parent=parent.parentElement){
               const style=win.getComputedStyle(parent);
               if(parent.scrollHeight>parent.clientHeight+4&&/auto|scroll/.test(style.overflowY)){
                 const a=active.getBoundingClientRect(),b=parent.getBoundingClientRect();
                 parent.scrollTop+=a.top-b.top-(b.height-a.height)/2;
                 break;
               }
               if(parent===nav)break;
             }
           }
           const selected=active&&active.getClientRects().length?active:nav;
           const header=doc.querySelector("body > header.ss-common-header, body > header.els-course-header, body > header.site-header");
           const headerHeight=header?.getBoundingClientRect().height||0;
           const top=Math.max(0,win.scrollY+selected.getBoundingClientRect().top-headerHeight-14);
           win.scrollTo({top,behavior:"instant"});
         };
         win.requestAnimationFrame(()=>win.requestAnimationFrame(reveal));
         win.setTimeout(reveal,100);
       });
     }
     if(control.parentElement!==content)content.prepend(control);
     control.textContent="☰  "+(win.ELSLanguage?.get?.()==="en"?"Lessons":"목차");
     markCurrentLesson(toc);
   }
   // Only a student-initiated lesson selection closes the mobile course list.
   // Keep open/closed preferences and desktop navigation completely untouched.
   function collapseMobileList(control,token,wasLessonNav,wasSSSidebar){
     if(token!==sequence||!query.matches)return;
     const toc=doc.getElementById("lesson-nav");
     if(toc&&wasLessonNav){
       toc.querySelectorAll("details[open]").forEach(group=>{group.open=false;});
     }
     const sidebar=wasSSSidebar?doc.querySelector(".ss-layout-sidebar"):null;
     if(sidebar){
       const toggle=sidebar.querySelector(".ss-mobile-index-toggle");
       if(toggle&&toggle.getAttribute("aria-expanded")==="true"){
         // SS sidebar owns mobileOpen; a click on the selected lesson already
         // closes it. Dispatch only when it remains open after its handler.
         toggle.click();
       }
     }
   }
   function align(control,token){
     if(token!==sequence||!query.matches)return;
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
     const path=event.composedPath?.()||[];
     const wasLessonNav=path.some(node=>node.id==="lesson-nav")||!!control.closest("#lesson-nav");
     const wasSSSidebar=path.some(node=>node.classList?.contains?.("ss-layout-sidebar"));
     ensureReturnToLessons();
     win.requestAnimationFrame(()=>win.requestAnimationFrame(()=>{ensureReturnToLessons();collapseMobileList(control,token,wasLessonNav,wasSSSidebar);align(control,token);}));
     win.setTimeout(()=>{collapseMobileList(control,token);align(control,token);},100);
     win.setTimeout(()=>align(control,token),260);
   });
 }
 function ready(){normalize();setupMobileLessonScroll();win.addEventListener("els:themechange",()=>normalize());win.ELSLanguage?.subscribe?.(()=>{const b=doc.getElementById("els-mobile-open-lessons");if(b)b.textContent="☰  "+(win.ELSLanguage.get()==="en"?"Lessons":"목차");});}
 if(doc.readyState==="loading")doc.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
 win.ELSHeaderControls=Object.freeze({normalize:()=>normalize(),mountSlots,createCourseHeader,makeNavigationArrow,themes:win.ELSTheme?.options?.slice()||[]});
})(window,document);
