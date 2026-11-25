/* Shared, conservative inline math typography for Chapter 1-8 detail cards.
 * Formula cards use authored whole equations; this adapter only converts tokens
 * in prose/labels, never code, controls, numeric data, SVG or KaTeX output.
 */
(function(global){
"use strict";
const rules=[{"source":"Ω\\s*=\\s*2πf\\/fₛ","latex":"\\Omega=\\frac{2\\pi f}{f_s}"},{"source":"Ω\\s*\\+\\s*2π","latex":"\\Omega+2\\pi"},{"source":"X\\(e\\^\\{jΩ\\}\\)","latex":"X(e^{j\\Omega})"},{"source":"H\\(e\\^\\{jΩ\\}\\)","latex":"H(e^{j\\Omega})"},{"source":"H\\(jω\\)","latex":"H(j\\omega)"},{"source":"X\\(jω\\)","latex":"X(j\\omega)"},{"source":"Y\\(jω\\)","latex":"Y(j\\omega)"},{"source":"X\\(s\\)","latex":"X(s)"},{"source":"H\\(s\\)","latex":"H(s)"},{"source":"X\\(z\\)","latex":"X(z)"},{"source":"H\\(z\\)","latex":"H(z)"},{"source":"aₖ","latex":"a_k"},{"source":"bₖ","latex":"b_k"},{"source":"ω₀","latex":"\\omega_0"},{"source":"ωₙ","latex":"\\omega_n"},{"source":"ωₛ","latex":"\\omega_s"},{"source":"Δω","latex":"\\Delta\\omega"},{"source":"Δf","latex":"\\Delta f"},{"source":"T₀","latex":"T_0"},{"source":"Tₛ","latex":"T_s"},{"source":"t₀","latex":"t_0"},{"source":"fₛ\\/2","latex":"\\frac{f_s}{2}"},{"source":"fₛ","latex":"f_s"},{"source":"f₀","latex":"f_0"},{"source":"f₁","latex":"f_1"},{"source":"f₂","latex":"f_2"},{"source":"xₑ\\(t\\)","latex":"x_e(t)"},{"source":"xₒ\\(t\\)","latex":"x_o(t)"},{"source":"x꜀\\(t\\)","latex":"x_c(t)"},{"source":"x꜀\\(nTₛ\\)","latex":"x_c(nT_s)"},{"source":"\\b[xyuh]\\[(?:n|k|m)\\]","latex":null},{"source":"\\b[xyuh]\\((?:t|s)\\)","latex":null},{"source":"δ\\[(?:n|k)\\]","latex":"\\delta[n]"},{"source":"Σ","latex":"\\sum"},{"source":"Ω","latex":"\\Omega"},{"source":"ω","latex":"\\omega"},{"source":"π","latex":"\\pi"},{"source":"τ","latex":"\\tau"},{"source":"σ","latex":"\\sigma"},{"source":"ζ","latex":"\\zeta"},{"source":"φ","latex":"\\varphi"}].map(x=>({re:new RegExp(x.source,"gu"),latex:x.latex}));
const SKIP="script,style,textarea,input,select,option,button,pre,code,kbd,samp,svg,math,.katex,[data-ss-math],[data-latex],[data-els-math-inline],[data-els-math-display],[contenteditable],.ss-foundation-card-equation,.ss-foundation-card-term,.ss5-prose-math,.ss7-prose-math,.ss8-prose-math,.ss5-inline-equation,.ss8-inline-math,.ss-app-inline-math";
const SELECT=".learning,.question,.metric,.figure,.reading,.insight,.step,.heading,.ss5-predict,.ss5-observe,.reading-panel,.reading-note,.plot-instruction,.ss7-learning-flow,.ss7-periodicity,.ss7-sampling-concepts,.ss8-predict,.ss8-compare-result,.check,.guide-check,.derivation-panel";
const chapter=Number((location.pathname.match(/chapter([1-8])\\.html$/)||[])[1]||0);
let converted=0,failures=[],scheduled=false,working=false;
function ranges(source){
 const hits=[];
 for(let priority=0;priority<rules.length;priority++){
  const rule=rules[priority];rule.re.lastIndex=0;
  for(const m of source.matchAll(rule.re))hits.push({start:m.index,end:m.index+m[0].length,latex:rule.latex||m[0],priority});
 }
 hits.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start)||a.priority-b.priority);
 const out=[];let end=0;for(const item of hits)if(item.start>=end){out.push(item);end=item.end;}return out;
}
function scan(){
 if(working||!global.katex?.render)return 0;
 const root=document.querySelector("main");if(!root)return 0;
 working=true;
 let updated=0;
 try{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
   const p=node.parentElement;
   if(!p||!node.nodeValue?.trim()||p.closest(SKIP)||!p.closest(SELECT))return NodeFilter.FILTER_REJECT;
   return ranges(node.nodeValue).length?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }}),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
   if(!node.isConnected)continue;
   const text=node.nodeValue,found=ranges(text),frag=document.createDocumentFragment();let pos=0;
   for(const item of found){
    if(item.start>pos)frag.append(document.createTextNode(text.slice(pos,item.start)));
    const math=document.createElement("span");math.className="ss-detail-inline-math";
    try{
     global.katex.render(item.latex,math,{displayMode:false,throwOnError:true,strict:"ignore",trust:false,output:"htmlAndMathml"});
     updated++;converted++;
    }catch(e){failures.push({chapter,latex:item.latex,error:String(e)});math.textContent=text.slice(item.start,item.end);}
    frag.append(math);pos=item.end;
   }
   if(pos<text.length)frag.append(document.createTextNode(text.slice(pos)));
   node.replaceWith(frag);
  }
 }finally{working=false;}
 return updated;
}
function queue(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;scan()});
}
function init(){
 const root=document.querySelector("main")||document.body;
 new MutationObserver(records=>{
  if(working)return;
  if(records.some(r=>[...r.addedNodes].some(n=>
   n.nodeType===1&&!n.closest?.(".katex,.ss-detail-inline-math")||
   n.nodeType===3&&n.parentElement&&!n.parentElement.closest(SKIP))))queue();
 }).observe(root,{childList:true,subtree:true});
 document.addEventListener("els:languagechange",queue);
 window.addEventListener("load",queue);queue();
}
global.SSDetailCardMath=Object.freeze({scan,queue,get converted(){return converted},get failures(){return failures.slice()},version:"1.0"});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);