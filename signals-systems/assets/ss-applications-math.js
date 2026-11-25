/* Shared Applications math typography adapter for all dynamically generated cards.
 * Uses the same data-ss-math attributes and KaTeX renderer as Chapters 5-8.
 */
(function(global){
"use strict";
const pairs=[
 ["x(t)=exp[(σ+j2πf)t]","x(t)=e^{(\\sigma+j2\\pi f)t}"],
 ["exp(σt)","e^{\\sigma t}"],
 ["Ω=2πf/fₛ","\\Omega=\\frac{2\\pi f}{f_s}"],
 ["fₖ=k fₛ/N","f_k=\\frac{kf_s}{N}"],
 ["|f₂−f₁|","|f_2-f_1|"],
 ["|X_N(e^{jΩ})|/N","\\frac{|X_N(e^{j\\Omega})|}{N}"],
 ["x[n]=x(nTₛ)","x[n]=x(nT_s)"],
 ["fₛ/N","\\frac{f_s}{N}"],
 ["2πft","2\\pi ft"],
 ["fₖ","f_k"],
 ["f₂","f_2"],
 ["e^(σ+jω)t","e^{(\\sigma+j\\omega)t}"],
 ["fₛ/2","\\frac{f_s}{2}"],
 ["|X[k]|","\\lvert X[k]\\rvert"],
 ["k/N","\\frac{k}{N}"],
 ["H(jω)","H(j\\omega)"],
 ["H(z)","H(z)"],["X(z)","X(z)"],
 ["Tₛ","T_s"],
 ["X[k]","X[k]"],["x[n]","x[n]"],["x(t)","x(t)"],
 ["H(f)","H(f)"],["fₛ","f_s"],["f₀","f_0"],["f₁","f_1"],
 ["Δf","\\Delta f"],["2π","2\\pi"]
];
// Any Applications page that loads this adapter gets common math inside <main>.
// Avoid hand-maintained per-lab selectors: future labs are covered automatically.
const roots="main";
const skip="code,pre,kbd,samp,textarea,script,style,select,option,svg,math,.katex,[data-ss-math],[data-latex],[contenteditable=true]";
const quoted=pairs.map(x=>x[0].replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&"));
const re=new RegExp(/\\\((.+?)\\\)|\\\[([\s\S]+?)\\\]/.source+"|"+quoted.join("|"),"g");
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
    const authored=match[1]||match[2]||map.get(token);
    el.className=match[2]?"ss-app-display-math":"ss-app-inline-math";
    el.dataset.ssMath=authored;
    el.dataset.ssMathDisplay=match[2]?"block":"inline";
    el.dataset.ssMathFallback=match[1]||match[2]||token;
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
 if(!global.SSMathCore){document.documentElement.dataset.ssMathStatus="missing-core";return;}
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
