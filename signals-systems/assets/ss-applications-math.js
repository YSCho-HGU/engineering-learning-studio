/* Shared Applications math typography adapter for all dynamically generated cards.
 * Uses the same data-ss-math attributes and KaTeX renderer as Chapters 5-8.
 */
(function(global){
"use strict";
const pairs=[
 ["e^(σ+jω)t","e^{(\\sigma+j\\omega)t}"],
 ["fₛ/2","\\frac{f_s}{2}"],
 ["|X[k]|","\\lvert X[k]\\rvert"],
 ["X[k]","X[k]"],["x[n]","x[n]"],["x(t)","x(t)"],
 ["H(f)","H(f)"],["fₛ","f_s"],["f₀","f_0"],["f₁","f_1"],
 ["Δf","\\Delta f"],["2π","2\\pi"]
];
const roots=".ss-app-intro,.ss-app-toc,.ss-app-main,.ss-al-root,.ss-fft-root";
const skip="code,pre,kbd,samp,textarea,script,style,select,option,svg,math,.katex,[data-ss-math],[data-latex],[contenteditable=true]";
const quoted=pairs.map(x=>x[0].replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&"));
const re=new RegExp(quoted.join("|"),"g");
const map=new Map(pairs);
let processed=0;
function enhance(root=document){
 const hosts=root.matches?.(roots)?[root]:Array.from(root.querySelectorAll(roots));
 for(const host of hosts){
  const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()){
   const node=walker.currentNode;
   if(!node.nodeValue?.trim()||node.parentElement?.closest(skip))continue;
   re.lastIndex=0;
   if(re.test(node.nodeValue))nodes.push(node);
  }
  for(const text of nodes){
   if(!text.isConnected)continue;
   const src=text.nodeValue,fragment=document.createDocumentFragment();
   let last=0,match;
   re.lastIndex=0;
   while((match=re.exec(src))!==null){
    if(match.index>last)fragment.append(document.createTextNode(src.slice(last,match.index)));
    const token=match[0],el=document.createElement("span");
    el.className="ss-app-inline-math";
    el.dataset.ssMath=map.get(token);
    el.dataset.ssMathDisplay="inline";
    el.dataset.ssMathFallback=token;
    el.textContent=token;
    fragment.append(el);processed++;
    last=match.index+token.length;
   }
   if(last<src.length)fragment.append(document.createTextNode(src.slice(last)));
   text.replaceWith(fragment);
  }
 }
 return processed;
}
function init(){
 if(!global.SSMathCore)return;
 global.SSMathCore.install({beforeRender:()=>enhance()});
 const root=document.querySelector("main")||document.body;
 // The hub and all labs replace text/cards after language or parameter changes.
 // Watch their prose, but never re-process KaTeX-owned descendants.
 const observer=new MutationObserver(mutations=>{
  if(mutations.some(m=>{
   const target=m.target.nodeType===1?m.target:m.target.parentElement;
   return target?.closest?.(roots)&&!target.closest(skip);
  }))global.SSMathCore.queue();
 });
 observer.observe(root,{childList:true,subtree:true,characterData:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
global.SSApplicationsMath=Object.freeze({enhance,get converted(){return processed}});
})(window);
