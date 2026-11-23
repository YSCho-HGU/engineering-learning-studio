/* Passive Chapters 1-8 math integrity monitor.
 * Never rewrites math or interferes with chapter-specific rendering engines.
 * Applications and Chapters share one observable audit contract.
 */
(function(global){
"use strict";
const scope="main",selector="[data-ss-math],[data-latex],.katex-error";
const rawPattern=/\\(?:frac|sum|int|omega|Delta|pi|left|right|begin|end|mathrm|text|sqrt|infty)\b|\\\(|\\\)|\\\[|\\\]/;
const skip="script,style,textarea,code,pre,kbd,samp,svg,math,.katex,[data-ss-math],[data-latex],[contenteditable]";
const chapter=Number(document.documentElement.dataset.ssFoundationChapter||
 (location.pathname.match(/chapter([1-8])\.html/i)||[])[1]||0);
let state=null,requested=false,observer=null;
function visible(node){return !!node.getClientRects().length}
function audit(){
 const root=document.querySelector(scope);
 if(!root)return {chapter,passed:false,reason:"missing-main",equations:0,failures:[{reason:"missing-main"}]};
 const failures=[],explicit=[...root.querySelectorAll("[data-ss-math],[data-latex]")].filter(visible);
 explicit.forEach(el=>{
  const tex=(el.getAttribute("data-ss-math")||el.getAttribute("data-latex")||"").trim();
  if(!tex)failures.push({reason:"missing-source",id:el.id||"",snippet:el.textContent.slice(0,80)});
  else if(global.katex?.render&&el.dataset.ssMathState==="error")
   failures.push({reason:"render-error",id:el.id||"",snippet:tex.slice(0,100)});
  else if(global.katex?.render&&!el.querySelector(".katex")&&el.dataset.ssMathState!=="waiting")
   failures.push({reason:"unrendered-explicit",id:el.id||"",snippet:tex.slice(0,100)});
 });
 const katexErrors=[...root.querySelectorAll(".katex-error")].filter(visible);
 katexErrors.forEach(el=>failures.push({reason:"katex-error",snippet:el.textContent.slice(0,100)}));
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let rawCount=0;
 while(walker.nextNode()){
  const n=walker.currentNode,p=n.parentElement;
  if(!p||p.closest(skip)||!visible(p))continue;
  const value=(n.nodeValue||"").trim();
  if(rawPattern.test(value)){rawCount++;if(rawCount<=20)failures.push({reason:"visible-raw-latex",snippet:value.slice(0,125),tag:p.tagName})}
 }
 state={chapter,passed:failures.length===0,equations:root.querySelectorAll(".katex").length,
  explicit:explicit.length,rawCount,failures,checkedAt:new Date().toISOString()};
 document.documentElement.dataset.ssChapterMathAudit=state.passed?"pass":"fail";
 document.dispatchEvent(new CustomEvent("ss-chapter-math-audited",{detail:state}));
 return state;
}
function queue(){if(requested)return;requested=true;queueMicrotask(()=>{requested=false;audit()})}
function setup(){
 const root=document.querySelector(scope);
 if(!root)return;
 observer=new MutationObserver(mutations=>{
  if(mutations.some(m=>m.type==="childList"&&[...m.addedNodes,...m.removedNodes].some(n=>
   n.nodeType===1&&!n.closest?.(".katex")||
   n.nodeType===3&&n.parentElement&&!n.parentElement.closest(skip))))queue();
 });
 observer.observe(root,{childList:true,subtree:true});
 ["ss-ch8-experiment-change","ss-ch8-state-change","ss-ch8-content-rendered","ss-ch7-experiment-change","els:languagechange","els:themechange"].forEach(event=>
  document.addEventListener(event,queue));
 window.addEventListener("load",queue);
 queue();
}
global.SSChaptersMathAudit=Object.freeze({audit,queue,get report(){return state}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});
else setup();
})(window);
