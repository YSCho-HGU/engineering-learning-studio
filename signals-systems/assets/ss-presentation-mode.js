/* Presentation mode: one opt-in visual state for Chapters 1–8 and Applications.
   Never changes a lesson's calculation, selected parameters or saved progress. */
(function(global){
"use strict";
const root=document.documentElement;
const label={en:["Presentation mode","Exit presentation mode"],ko:["발표 모드","발표 종료"]};
let button=null,priorSidebar=null;
const isOn=()=>root.dataset.ssPresentation==="on";
function currentLabel(){
 const language=root.dataset.elsLanguage||global.ELSLanguage?.get?.()||"mixed";
 const names=language==="ko"?label.ko:label.en;
 return names[isOn()?1:0];
}
function update(){
 if(!button)return;
 button.textContent=(isOn()?"⤢ ":"▣ ")+currentLabel();
 button.title=isOn()?"Exit presentation mode (Esc)":"Presentation mode (P)";
 button.setAttribute("aria-pressed",String(isOn()));
 button.setAttribute("aria-label",currentLabel());
 root.style.setProperty("--ss-presentation-controls","1");
}
function set(enabled){
 if(enabled===isOn())return;
 if(enabled){
  priorSidebar=root.getAttribute("data-ss-sidebar");
  root.dataset.ssPresentation="on";
 }else{
  delete root.dataset.ssPresentation;
  if(priorSidebar===null)root.removeAttribute("data-ss-sidebar");
  else root.setAttribute("data-ss-sidebar",priorSidebar);
 }
 update();
 global.dispatchEvent(new Event("resize"));
 document.dispatchEvent(new CustomEvent("ss:presentationchange",{detail:{active:enabled}}));
}
function install(){
 if(!document.querySelector("main")||button)return;
 const header=document.querySelector(".ss-common-header,.ss5-site-header,header");
 button=document.createElement("button");
 button.type="button";button.id="ss-presentation-toggle";button.className="ss-presentation-toggle";
 button.addEventListener("click",()=>set(!isOn()));
 if(header)header.append(button);
 else document.body.prepend(button);
 document.addEventListener("keydown",event=>{
  if(event.altKey||event.ctrlKey||event.metaKey)return;
  const t=event.target;
  if(t?.closest?.("input,textarea,select,[contenteditable=true]"))return;
  if(event.key==="Escape"&&isOn()){event.preventDefault();set(false)}
  if((event.key==="p"||event.key==="P")&&!event.repeat){event.preventDefault();set(!isOn())}
 });
 new MutationObserver(update).observe(root,{attributes:true,attributeFilter:["data-els-language"]});
 update();
}
global.SSPresentationMode=Object.freeze({set,get active(){return isOn()}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
})(window);
