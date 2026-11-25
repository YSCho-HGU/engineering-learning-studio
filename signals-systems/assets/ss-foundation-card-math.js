/* Authored KaTeX equations for original Ch1-4 formula cards. No model logic changes. */
(function(global){
"use strict";
const F={"1":["x(t)=Ae^{-\\lambda|t|}\\cos(2\\pi ft+\\varphi)\\quad;\\quad x[n]=x(nT_s)","p_\\varepsilon(t)=\\frac1\\varepsilon\\ (|t|<\\varepsilon/2)\\quad;\\quad\\int p_\\varepsilon(t)\\,dt=1","y(t)=x(at+b)\\quad;\\quad \\tau=at+b\\Rightarrow t=\\frac{\\tau-b}{a}","\\text{CT: }T_0=\\frac{2\\pi}{|\\omega_0|}\\quad;\\quad \\text{DT: }\\Omega N=2\\pi m\\ (N,m\\in\\mathbb Z)","E(T)=\\int_{-T}^{T}|x(t)|^2\\,dt\\quad;\\quad P(T)=\\frac{E(T)}{2T}","\\mathcal T\\{ax_1+bx_2\\}\\stackrel{?}{=}a\\mathcal T\\{x_1\\}+b\\mathcal T\\{x_2\\}\\quad;\\quad \\mathcal T\\{x(t-t_0)\\}\\stackrel{?}{=}y(t-t_0)","x_e(t)=\\frac{x(t)+x(-t)}2\\quad;\\quad x_o(t)=\\frac{x(t)-x(-t)}2","y(t)=x(t)+h(t)\\quad;\\quad x(t)h(t)\\quad;\\quad \\frac{dx}{dt}\\quad;\\quad\\int_{-4}^{t}x(\\tau)\\,d\\tau","x[n]=x(nT_s)\\quad\\longrightarrow\\quad\\text{Sensor}\\to\\text{Analog}\\to\\text{ADC}\\to\\text{Digital}"],"2":["x[n]=\\sum_k x[k]\\delta[n-k]\\quad\\Rightarrow\\quad y[n]=\\sum_k x[k]h[n-k]","y[n]=\\sum_kx[k]h[n-k]\\quad;\\quad x=[1,2,1],\\ h=[1,b,0.5]","n_{\\mathrm{start}}=n_{x,0}+n_{h,0}\\quad;\\quad L_y=L_x+L_h-1","y(t)=\\int x(\\tau)h(t-\\tau)\\,d\\tau=\\text{overlap length}","e^{-at}u(t)*e^{-bt}u(t)=\\frac{e^{-at}-e^{-bt}}{b-a}u(t)\\quad(a\\ne b)","h(t)=\\frac1\\tau e^{-t/\\tau}u(t)\\quad;\\quad y(t)=[1-e^{-t/\\tau}]u(t)-[1-e^{-(t-T)/\\tau}]u(t-T)","y[n]=\\frac1M\\sum_{k=0}^{M-1}x[n-k]\\quad;\\quad h[k]=\\frac1M\\ (0\\le k<M)","\\text{Cascade: }h_{\\mathrm{eq}}=h_1*h_2\\quad;\\quad\\text{Parallel: }h_{\\mathrm{eq}}=h_1+h_2","\\text{Causal}\\iff h[n]=0\\ (n<0)\\quad;\\quad\\text{BIBO stable}\\iff\\sum_{n=-\\infty}^\\infty|h[n]|<\\infty"],"3":["x(t)=\\cos(\\omega_0t)+A\\cos(2\\omega_0t+\\varphi)\\quad;\\quad\\omega_0=\\frac{2\\pi}{T}","a_k=\\frac\\tau T\\operatorname{sinc}\\left(\\frac{k\\pi\\tau}{T}\\right)\\quad;\\quad\\operatorname{sinc}(x)=\\frac{\\sin x}{x}","S_M(t)=\\frac4\\pi\\sum_{n=0}^{M-1}\\frac{\\sin((2n+1)\\pi t)}{2n+1}","x(t-t_0)\\ \\longleftrightarrow\\ b_k=a_ke^{-jk\\omega_0t_0}","a_k=\\frac1N\\sum_{n=0}^{N-1}x[n]e^{-j2\\pi kn/N}\\quad;\\quad a_{k+N}=a_k","H(j\\omega)=\\frac1{1+j\\omega\\tau}\\quad;\\quad b_k=H(jk\\omega_0)a_k","S(0)=\\frac{x(0^-)+x(0^+)}2=0\\quad\\text{regardless of }x(0)"],"4":["\\omega_k=k\\frac{2\\pi}{T}\\quad;\\quad Ta_k=X(j\\omega_k)\\quad;\\quad\\Delta\\omega=\\frac{2\\pi}{T}","x(t)=A\\operatorname{rect}\\left(\\frac t\\tau\\right)\\quad;\\quad X(j\\omega)=A\\tau\\operatorname{sinc}\\left(\\frac{\\omega\\tau}2\\right)","x(t)=e^{-\\alpha|t|}\\quad;\\quad X(j\\omega)=\\frac{2\\alpha}{\\alpha^2+\\omega^2}\\quad(\\alpha>0)","\\operatorname{rect}\\left(\\frac{t-t_0}{\\tau}\\right)\\longleftrightarrow e^{-j\\omega t_0}\\tau\\operatorname{sinc}\\left(\\frac{\\omega\\tau}2\\right)","X(j\\omega)=\\tau\\operatorname{sinc}\\left(\\frac{\\omega\\tau}2\\right)\\quad;\\quad|X(j\\omega)|\\ge0","Y(j\\omega)=H(j\\omega)X(j\\omega)\\quad;\\quad H(j\\omega)=\\frac1{1+j\\omega\\tau}","x(t)\\cos(\\omega_ct)\\longleftrightarrow\\frac12[X(j(\\omega-\\omega_c))+X(j(\\omega+\\omega_c))]","\\widehat X(j\\omega)\\approx\\Delta t\\sum_{n=-M}^{M}x(n\\Delta t)e^{-j\\omega n\\Delta t}\\quad;\\quad x(t)=e^{-|t|}"]};
let rendered=0,failures=[];
function styles(){
 if(document.getElementById("ss-foundation-card-math-styles"))return;
 const style=document.createElement("style");style.id="ss-foundation-card-math-styles";
 style.textContent=".ss-foundation-card-equation{display:flex;flex-wrap:wrap;align-items:baseline;gap:.3em 1.1em;max-width:100%;overflow-x:auto;line-height:1.7}.ss-foundation-card-term{display:inline-block;max-width:100%;overflow-x:auto;vertical-align:middle}.ss-foundation-card-term .katex{font-size:1em}@media(max-width:600px){.ss-foundation-card-equation{gap:.5em .75em}.ss-foundation-card-term .katex{font-size:.92em}}";
 document.head.append(style);
}
function scan(){
 const chapter=Number((location.pathname.match(/chapter([1-4])\.html$/)||[])[1]);
 if(!chapter||!global.katex?.render)return;
 const card=document.querySelector("#formula.formula");if(!card)return;
 const buttons=[...document.querySelectorAll("#nav button,#tabs button,.ss-layout-sidebar nav button")];
 const selected=buttons.find(b=>b.classList.contains("active")||b.classList.contains("on")||
  ["page","true","step"].includes(b.getAttribute("aria-current")));
 const n=chapter===1?Number(selected?.dataset.exp||1)-1:buttons.indexOf(selected);
 const index=Math.max(0,n),latex=F[chapter]?.[index];
 if(!latex||card.dataset.ssFoundationMathDone===String(index)&&card.querySelector(".katex"))return;
 const previous=card.innerHTML,wrap=document.createElement("div");
 wrap.className="ss-foundation-card-equation";
 try{
  for(const part of latex.split(String.raw`\quad;\quad`)){
   const span=document.createElement("span");span.className="ss-foundation-card-term";
   global.katex.render(part,span,{displayMode:false,throwOnError:true,strict:"ignore",trust:false,output:"htmlAndMathml"});
   wrap.append(span);
  }
  card.replaceChildren(wrap);card.dataset.ssFoundationMathDone=String(index);rendered++;
 }catch(e){failures.push({chapter,index:index+1,error:String(e)});card.innerHTML=previous;}
}
let requested=false;
function schedule(){if(requested)return;requested=true;requestAnimationFrame(()=>{requested=false;scan();});}
function init(){
 styles();
 const root=document.body; // Stable host: Ch2-4 replace the entire <main> on lesson changes.
 new MutationObserver(m=>{if(m.some(record=>record.target?.id==="formula"||[...record.addedNodes].some(node=>
 node.nodeType===1&&(node.matches?.("#formula.formula")||node.querySelector?.("#formula.formula")))))schedule();
 }).observe(root,{childList:true,subtree:true});
 document.addEventListener("els:languagechange",schedule);
 window.addEventListener("load",schedule);schedule();
}
global.SSFoundationCardMath=Object.freeze({scan,formulas:F,get rendered(){return rendered},get failures(){return failures.slice()}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);
