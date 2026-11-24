/* C Programming course shell: Chapter 5-compatible navigation and content geometry.
   Preserves lesson/practice nodes and all localStorage progress keys. */
(function(){
"use strict";
const chapters=[
 ["arrays","13","Arrays"],["strings","13","Strings"],["standard-library","13","Standard Library Functions"],
 ["functions","14","User-Defined Functions"],["pointer","15","Pointers"],["structure","16","Structures"],
 ["file-io","17","File I/O"],["dynamic-memory","18","Dynamic Memory"],["ai-coding","21","AI-Assisted Coding"]
];
const path=location.pathname;
// Chapter 211 is now listed after the eight original published C units.
const current=chapters.findIndex(row=>path.includes("/"+row[0]+"/"));
if(current<0)return;
const course=chapters[current],root=document.documentElement;
const compact211=course[0]==="ai-coding"&&matchMedia("(max-width: 780px)").matches;
const STORE=compact211?"els-c211-mobile-sidebar-v1":"els-c-sidebar-collapsed-v1";
function getSaved(){try{const value=localStorage.getItem(STORE);return value===null?compact211:value==="1"}catch(_){return compact211}}
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
 const controls=window.ELSHeaderControls;
 if(typeof controls?.createCourseHeader!=="function"){
   console.error("[ELS header] Common course header component not loaded");
   return;
 }
 const parentTitle=course[0]==="ai-coding"?"Chapter "+course[1]+" · "+course[2]:
   "C Programming · Chapter "+course[1]+" · "+course[2];
 const entries=[{label:"C Programming · Course Home",href:parentPrefix},
  ...chapters.map((entry,i)=>({label:"Chapter "+entry[1]+" · "+entry[2],
    href:parentPrefix+entry[0]+"/",current:i===current}))];
 const {header,menu,navigation:arrows}=controls.createCourseHeader({
   className:"c-ss-header",homeHref:nested?"../../../":"../../",title:parentTitle,
   chapterLinks:entries,themeId:"theme",showLanguage:false
 });
 function arrow(title,chapterDelta,sectionDelta){
  const kind=chapterDelta!=null?"chapter":"section",direction=chapterDelta??sectionDelta;
  const n=controls.makeNavigationArrow({kind,direction,label:title});
  if(chapterDelta!=null){
   const index=current+chapterDelta;
   if(index>=0&&index<chapters.length)n.href=parentPrefix+chapters[index][0]+"/";
   else{n.setAttribute("aria-disabled","true");n.tabIndex=-1}
  }else{
   n.dataset.direction=String(sectionDelta);
   n.addEventListener("click",()=>{
    const buttons=[...document.querySelectorAll(fileioTask?"#task-nav button[data-task]":
     fileioLabs?".side-nav a[data-lab-link]":practice?".cp-menu .cp-nav-item":
     fileio?"#lesson-nav button[data-nav]":"#lesson-nav button[data-lesson], #lesson-nav a[href^='#lab-']")];
    const pos=buttons.findIndex(b=>fileioLabs?b.getAttribute("href")===(location.hash||"#write"):
     fileioTask||practice?b.classList.contains("active"):fileio?b.classList.contains("current"):
     b.getAttribute("aria-current")==="step");
    if(pos>=0&&pos+sectionDelta>=0&&pos+sectionDelta<buttons.length)
      buttons[pos+sectionDelta].click();
    refreshArrows();
   });
  }
  arrows.append(n);
  return n;
 }
 arrow("Previous chapter",-1,null);
 const previous=arrow("Previous section",null,-1),next=arrow("Next section",null,1);
 arrow("Next chapter",1,null);
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
 // The original course and practice exercises remain mounted under the same IDs.
 if(fileioLabs){const intro=document.querySelector("body > .hero");if(intro){intro.classList.add("c-ss-intro");workspace.insertBefore(intro,wrap)}}
 if(fileio){
  const intro=document.querySelector("body > .course-header");
  if(intro){intro.classList.add("c-ss-intro");workspace.insertBefore(intro,wrap)}
 }

 // Standard four-part learning map. Only populated groups are rendered.
 // Move existing interactive elements instead of cloning/rebinding them.
 const en=()=>window.ELSLanguage?.get?.()==="en";
 function makeGroup(host,id,ko,enLabel,opened){
  const details=el("details","c-learning-group");
  details.dataset.group=id;details.open=opened;
  const summary=el("summary","c-learning-group-title",en()?enLabel:enLabel+" · "+ko);
  details.append(summary);
  const items=el("div","c-learning-group-items");
  details.append(items);host.append(details);
  return items;
 }
 if(fileio){
  const toc=aside.querySelector("#lesson-nav");
  if(toc){
   const coreButtons=[...toc.querySelectorAll("button[data-nav]")].filter(b=>b.dataset.nav!=="6");
   const advancedButton=toc.querySelector('button[data-nav="6"]');
   toc.replaceChildren();toc.classList.add("c-grouped-toc");
   const coreGroup=makeGroup(toc,"core","필수 학습","Core Concepts",true);
   coreButtons.forEach(b=>coreGroup.append(b));
   const originalLabs=aside.querySelector(".fileio-lab-nav");
   const labs=[...originalLabs?.querySelectorAll("a")||[]];
   if(labs.length){
    const labGroup=makeGroup(toc,"labs","따라하기 실습","Guided Labs",false);
    labs.forEach(a=>labGroup.append(a));
   }
   originalLabs?.remove();
   const advancedGroup=makeGroup(toc,"advanced","선택 심화","Advanced / Optional",location.hash==="#optional");
   if(advancedButton)advancedGroup.append(advancedButton);
   const challenges=makeGroup(toc,"challenges","직접 구현","Coding Challenges",false);
   [["P1 · File writing","./practice/#p1"],["P2 · File reading","./practice/#p2"],["M1 · Line copying","./practice/#m1"],
    ["P3–P6 · Optional challenges","./practice/#p3"]].forEach(([name,url])=>challenges.append(link(name,url)));
   toc.addEventListener("click",e=>{
    if(!e.target.closest("button[data-nav]"))return;
    const which=e.target.closest("button[data-nav]").dataset.nav;
    const group=toc.querySelector('details[data-group="'+(which==="6"?"advanced":"core")+'"]');
    if(group)group.open=true;
   });
  }
  const progress=aside.querySelector(".progress-panel");
  progress?.querySelectorAll("small").forEach(n=>{if(!n.id)n.remove()});
  const concept=progress?.querySelector("#concept-count");
  if(concept)concept.classList.add("c-sr-only-concept");
 }
 if(fileioLabs){
  const toc=aside.querySelector(".side-nav");
  if(toc){
   const anchors=[...toc.querySelectorAll("a[data-lab-link]")];
   toc.replaceChildren();
   const core=makeGroup(toc,"core","필수 학습","Core Concepts",false);
   core.append(link(en()?"Back to concepts":"개념 학습으로 이동","../"));
   const labs=makeGroup(toc,"labs","따라하기 실습","Guided Labs",true);
   anchors.forEach(a=>labs.append(a));
   const adv=makeGroup(toc,"advanced","선택 심화","Advanced / Optional",false);
   adv.append(link(en()?"Advanced concepts":"선택 심화","../#optional"));
   const challenges=makeGroup(toc,"challenges","직접 구현","Coding Challenges",false);
   challenges.append(link(en()?"Open coding challenges":"직접 구현 과제","../practice/"));
  }
 }
 if(fileioTask){
  // The task engine owns the seven buttons and re-renders them on task changes;
  // its own renderer groups them without changing task indices or saved drafts.
  const toc=aside;
  const navLinks=el("div","c-course-task-links");
  const core=makeGroup(navLinks,"core","필수 학습","Core Concepts",false);
  core.append(link(en()?"Concept learning":"개념 학습","../"));
  const labs=makeGroup(navLinks,"labs","따라하기 실습","Guided Labs",false);
  labs.append(link(en()?"Three guided labs":"따라하기 실습 3개","../core-labs/"));
  toc.querySelector(".c-sidebar-topline")?.after(navLinks);
 }
 if(practice){
  const toc=aside;
  const navLinks=el("div","c-course-task-links");
  const core=makeGroup(navLinks,"core","필수 학습","Core Concepts",false);
  core.append(link(en()?"Concept learning":"개념 학습","../"));
  toc.querySelector(".c-sidebar-topline")?.after(navLinks);
  // The P1–P6 buttons already form the Coding Challenges group.
  const heading=el("div","c-learning-task-heading",en()?"Coding Challenges":"Coding Challenges · 직접 구현");
  toc.insertBefore(heading,toc.querySelector(".cp-nav-item"));
 }
 const crumb=wrap.querySelector(".crumb");if(crumb)crumb.remove();
 const hero=wrap.querySelector(".hero");if(hero)hero.classList.add("c-ss-intro");
 if(fileioLabs){const existing=oldHeader.querySelector("#language-mode");if(existing){existing.hidden=true;existing.setAttribute("aria-hidden","true");existing.tabIndex=-1;header.append(existing)}}
 // The single C language picker is owned by c-programming/language.js.
 function refreshArrows(){const buttons=[...document.querySelectorAll(fileioTask?"#task-nav button[data-task]":fileioLabs?".side-nav a[data-lab-link]":practice?".cp-menu .cp-nav-item":fileio?"#lesson-nav button[data-nav]":"#lesson-nav button[data-lesson], #lesson-nav a[href^='#lab-']")];const idx=buttons.findIndex(b=>fileioLabs?b.getAttribute("href")===(location.hash||"#write"):fileioTask||practice?b.classList.contains("active"):fileio?b.classList.contains("current"):b.getAttribute("aria-current")==="step");previous.disabled=idx<=0;next.disabled=idx<0||idx>=buttons.length-1}
 const nav=(practice||fileioTask)?aside:fileioLabs?aside.querySelector(".side-nav"):aside.querySelector("#lesson-nav");
 if(nav){new MutationObserver(refreshArrows).observe(nav,{childList:true,subtree:true,attributes:true,attributeFilter:["aria-current","class"]});nav.addEventListener("click",()=>requestAnimationFrame(refreshArrows))}
 refreshArrows();
 document.addEventListener("pointerdown",e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});
 window.ELSHeaderControls?.normalize?.();
 window.ELSCourseShell={refreshArrows,chapters:chapters.map(x=>x[0])};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();