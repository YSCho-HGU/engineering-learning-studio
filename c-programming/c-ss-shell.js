/* C Programming course shell: Chapter 5-compatible navigation and content geometry.
   Preserves lesson/practice nodes and all localStorage progress keys. */
(function(){
"use strict";
const chapters=[
 ["arrays","13","Arrays"],["strings","13","Strings"],["standard-library","13","Standard Library Functions"],
 ["functions","14","Functions"],["pointer","15","Pointers"],["structure","16","Structures"],
 ["file-io","17","File I/O"],["dynamic-memory","18","Dynamic Memory"]
];
const path=location.pathname;
const current=chapters.findIndex(row=>path.includes("/"+row[0]+"/"));
if(current<0)return;
const course=chapters[current],root=document.documentElement;
const STORE="els-c-sidebar-collapsed-v1";
function getSaved(){try{return localStorage.getItem(STORE)==="1"}catch(_){return false}}
function setSaved(v){try{localStorage.setItem(STORE,v?"1":"0")}catch(_){}}
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!=null)n.textContent=text;return n}
function link(label,href){const a=el("a","",label);a.href=href;return a}
function init(){
 const fileio=course[0]==="file-io"&&!path.includes("/practice/")&&!path.includes("/core-labs/");
 const fileioTask=course[0]==="file-io"&&path.includes("/practice/");
 const fileioLabs=course[0]==="file-io"&&path.includes("/core-labs/");
 const practice=path.includes("/practice/")&&!fileioTask;
 const nested=practice||fileioTask||fileioLabs;
 const parentPrefix=nested?"../../":"../";
 const wrap=(fileio||fileioLabs)?document.querySelector("body > .shell"):fileioTask?document.querySelector("body > main"):document.querySelector("body > .wrap");
 const oldHeader=document.querySelector("body > header");
 const layout=(fileio||fileioLabs)?wrap:practice?wrap?.querySelector("#practice-root .cp-layout"):fileioTask?wrap?.querySelector(".layout"):wrap?.querySelector(".layout");
 const aside=(fileio||fileioLabs)?wrap?.querySelector(".sidebar"):fileioTask?layout?.querySelector("#task-nav"):practice?layout?.querySelector(".cp-menu"):layout?.querySelector(".side");
 if(!wrap||!layout||!aside||!oldHeader)return;
 const header=el("header","ss-common-header c-ss-header");
 header.setAttribute("aria-label","Engineering Learning Studio navigation");
 header.append(link("← Studio",nested?"../../../":"../../"));
 const menu=el("details","ss-common-menu c-ss-menu"),summary=el("summary","ss-common-title");
 summary.textContent="C Programming · Chapter "+course[1]+" · "+course[2]+" ⌄";
 summary.setAttribute("aria-label","Choose C Programming chapter");
 const links=el("nav","ss-common-links");
 links.append(link("C Programming · Course Home",parentPrefix));
 chapters.forEach((entry,i)=>{let a=link("Chapter "+entry[1]+" · "+entry[2],parentPrefix+entry[0]+"/");if(i===current)a.setAttribute("aria-current","page");links.append(a)});
 menu.append(summary,links);header.append(menu);
 const arrows=el("nav","ss-four-navigation c-four-navigation");
 arrows.setAttribute("aria-label","Chapter and section navigation");
 function arrow(symbol,title,chapterDelta,sectionDelta){
  let n=chapterDelta!=null?el("a","ss-chapter-arrow",symbol):el("button","ss-chapter-arrow",symbol);
  n.setAttribute("aria-label",title);n.title=title;
  if(chapterDelta!=null){let index=current+chapterDelta;if(index>=0&&index<chapters.length)n.href=parentPrefix+chapters[index][0]+"/";else{n.setAttribute("aria-disabled","true");n.tabIndex=-1}}
  else {n.type="button";n.dataset.direction=String(sectionDelta);n.addEventListener("click",()=>{const buttons=[...document.querySelectorAll(fileioTask?"#task-nav button":fileioLabs?".side-nav a[data-lab-link]":practice?".cp-menu .cp-nav-item":fileio?"#lesson-nav button[data-nav]":"#lesson-nav button[data-lesson]")];const pos=buttons.findIndex(b=>fileioLabs?b.getAttribute("href")===(location.hash||"#write"):fileioTask||practice?b.classList.contains("active"):fileio?b.classList.contains("current"):b.getAttribute("aria-current")==="step");buttons[pos+sectionDelta]?.click();refreshArrows()})}
  arrows.append(n);return n;
 }
 arrow("⇤","Previous chapter",-1,null);
 const previous=arrow("←","Previous section",null,-1),next=arrow("→","Next section",null,1);
 arrow("⇥","Next chapter",1,null);header.append(arrows);
 const actions=el("div","ss-common-actions");
 const language=el("label","ss-common-language");language.id="c-shared-language";
 const icon=el("span","ss-language-icon","🌐");icon.setAttribute("aria-hidden","true");
 const select=el("select","ss-common-language-select");select.id="c-language";select.setAttribute("aria-label","Language / 언어");
 [["mixed","한/영"],["en","English"],["ko","한국어"]].forEach(([v,t])=>{const o=el("option","",t);o.value=v;select.append(o)});
 language.append(icon,select);actions.append(language);
 const theme=el("label","ss-common-theme"),themeSelect=el("select","");
 themeSelect.id="theme";themeSelect.setAttribute("data-els-theme-picker","");themeSelect.setAttribute("aria-label","Theme");
 const choices=window.ELSTheme?.choices||[["white-clean","White Clean"],["warm-neutral","Warm Neutral"],["warm-dark","Warm Dark"],["navy-dark","Navy Dark"],["neutral-dark","Neutral Dark"]];
 choices.forEach(([value,label])=>{const option=el("option","",label);option.value=value;themeSelect.append(option)});
 themeSelect.value=window.ELSTheme?.get?.()||"neutral-dark";
 themeSelect.addEventListener("change",()=>window.ELSTheme?.set?.(themeSelect.value));
 theme.append(themeSelect);actions.append(theme);header.append(actions);
 oldHeader.replaceWith(header);
 // Move original sidebar, do not clone it: progress, event handlers and lesson IDs remain unchanged.
 const shell=el("div","c-ss-shell"),sideRow=el("div","c-sidebar-topline");
 const toggle=el("button","c-sidebar-toggle","≪");toggle.type="button";toggle.setAttribute("aria-label","Collapse lesson navigation");
 const sideLabel=el("span","c-sidebar-caption","Chapter "+course[1]+" · "+course[2]);
 sideRow.append(toggle,sideLabel);aside.prepend(sideRow);aside.classList.add("c-ss-sidebar");
 const workspace=el("div","c-ss-workspace");wrap.classList.add("c-ss-content");
 if(fileio)wrap.classList.add("c-fileio-workspace");
 if(practice)wrap.classList.add("c-practice-workspace");
 if(fileioTask)wrap.classList.add("c-fileio-task-workspace");
 if(fileioLabs)wrap.classList.add("c-fileio-labs-workspace");
 wrap.parentNode.insertBefore(shell,wrap);shell.append(aside,workspace);workspace.append(wrap);
 function collapsed(v){root.dataset.cSidebar=v?"collapsed":"expanded";toggle.textContent=v?"≫":"≪";toggle.setAttribute("aria-label",v?"Expand lesson navigation":"Collapse lesson navigation");toggle.setAttribute("aria-expanded",String(!v));setSaved(v)}
 toggle.addEventListener("click",()=>collapsed(root.dataset.cSidebar!=="collapsed"));collapsed(getSaved());
 const roadmap=(fileio||practice||fileioTask||fileioLabs)?null:[...wrap.querySelectorAll(".route")].find(n=>!n.closest("details"));
 if(roadmap && !roadmap.closest("details")){
  const group=el("details","course-phase-details c-ss-roadmap");
  group.append(el("summary","","Three-phase learning roadmap · 학습 로드맵"));
  const heading=wrap.querySelector(".route-heading");if(heading)group.append(heading);
  group.append(roadmap);wrap.insertBefore(group,layout);
 }
 // The original course and practice exercises remain mounted under the same IDs.
 if(fileioLabs){const intro=document.querySelector("body > .hero");if(intro){intro.classList.add("c-ss-intro");workspace.insertBefore(intro,wrap)}}
 if(fileioTask){const empty=wrap.querySelector(".practice-full-list");if(empty)empty.remove()}
 if(fileio){
  const intro=document.querySelector("body > .course-header");
  const route=document.querySelector("body > .learning-route");
  if(intro){intro.classList.add("c-ss-intro");workspace.insertBefore(intro,wrap)}
  if(route){const group=el("details","course-phase-details c-fileio-roadmap");group.append(el("summary","","Learning roadmap · 학습 로드맵"));group.append(route);workspace.insertBefore(group,wrap)}
 }
 const crumb=wrap.querySelector(".crumb");if(crumb)crumb.remove();
 const hero=wrap.querySelector(".hero");if(hero)hero.classList.add("c-ss-intro");
 if(fileioLabs){const existing=oldHeader.querySelector("#language-mode");if(existing){existing.hidden=true;existing.setAttribute("aria-hidden","true");existing.tabIndex=-1;header.append(existing)}}
 const languageAPI=window.ELSLanguage;if(languageAPI?.bindSelect)languageAPI.bindSelect(select);
 else select.addEventListener("change",()=>{try{localStorage.setItem("els-language",select.value)}catch(_){}location.reload()});
 function refreshArrows(){const buttons=[...document.querySelectorAll(fileioTask?"#task-nav button":fileioLabs?".side-nav a[data-lab-link]":practice?".cp-menu .cp-nav-item":fileio?"#lesson-nav button[data-nav]":"#lesson-nav button[data-lesson]")];const idx=buttons.findIndex(b=>fileioLabs?b.getAttribute("href")===(location.hash||"#write"):fileioTask||practice?b.classList.contains("active"):fileio?b.classList.contains("current"):b.getAttribute("aria-current")==="step");previous.disabled=idx<=0;next.disabled=idx<0||idx>=buttons.length-1}
 const nav=(practice||fileioTask)?aside:fileioLabs?aside.querySelector(".side-nav"):aside.querySelector("#lesson-nav");
 if(nav){new MutationObserver(refreshArrows).observe(nav,{childList:true,subtree:true,attributes:true,attributeFilter:["aria-current","class"]});nav.addEventListener("click",()=>requestAnimationFrame(refreshArrows))}
 refreshArrows();
 document.addEventListener("pointerdown",e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});
 window.ELSCourseShell={refreshArrows,chapters:chapters.map(x=>x[0])};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();