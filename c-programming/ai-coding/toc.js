/* Chapter 211 uses the shared C chapter TOC markup, not a separate mobile menu. */
(()=>{
"use strict";
const sections=[["projects","Start Creating","먼저 만들어 보기"],["improve","Make It Better","기능 발전시키기"],["technology","Explore Technology","기술 스택 탐색"],["agents","Build with AI Agents","AI와 함께 개발하기"],["publish","Publish Your App","배포하고 공유하기"],["toolkit","Engineering Toolkit","체계적 개발 도구"]];
const projects=[["01-reaction-time","Reaction Time Game","반응속도 게임"],["02-gpa-calculator","GPA Calculator","학점 계산기"],["03-sorting-visualizer","Sorting Visualizer","정렬 시각화"],["04-signal-generator","Signal Generator","파형 생성기"],["05-study-planner","Study Planner","학습 계획표"],["06-sensor-dashboard","Sensor Data Dashboard","센서 대시보드"]];
function t(en,ko){const m=window.ELSLanguage?.get();return m==="en"?en:m==="ko"?ko:en+" · "+ko}
function el(tag,cls,host,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;host.append(n);return n}
function render(nav,{active=0,go,lessons=null,reviewed=[]}={}){
 const isToolkit=Array.isArray(lessons),prev={};
 nav.querySelectorAll("details.c-learning-group").forEach(d=>prev[d.dataset.group]=d.open);
 nav.classList.add("c-grouped-toc");nav.replaceChildren();
 function group(id,en,ko,open){const d=el("details","c-learning-group",nav);d.dataset.group=id;d.open=open||prev[id]===true;const s=el("summary","c-learning-group-title",d,t(en,ko));s.setAttribute("aria-label",t(en,ko));return el("div","c-learning-group-items",d)}
 function entry(host,index,label,onClick,selected,done=false){const b=el("button",selected?"active":"",host);b.type="button";b.dataset.lesson=String(index);b.setAttribute("aria-controls","lesson");if(selected)b.setAttribute("aria-current","step");el("span","n",b,String(index+1).padStart(2,"0"));el("span","c-toc-label",b,label);if(done)el("span","concept-indicator",b,"✓");b.addEventListener("click",onClick);return b}
 function link(host,href,label){const a=el("a","c-learning-link",host,label);a.href=href;return a}
 const core=group("core","Core Concepts","핵심 학습",!isToolkit&&active<5);
 sections.slice(0,5).forEach(([key,en,ko],i)=>{if(isToolkit)link(core,"./#"+key,String(i+1).padStart(2,"0")+" · "+t(en,ko));else entry(core,i,t(en,ko),()=>go(i),active===i)});
 const labs=group("labs","Guided Labs","따라하기 실습",false);
 projects.forEach(([slug,en,ko],i)=>link(labs,"./projects/versions/"+slug+"/v1.html","P"+(i+1)+" · "+t(en,ko)));
 const advanced=group("advanced","Advanced / Optional","선택 심화",isToolkit||active===5);
 if(isToolkit){link(advanced,"./#toolkit",t("Engineering Toolkit overview","개발 도구 개요"));lessons.forEach((l,i)=>entry(advanced,i,t(l.title,l.ko),()=>go(i),active===i,reviewed.includes(i)))}
 else entry(advanced,5,t(sections[5][1],sections[5][2]),()=>go(5),active===5);
}
window.ELSAICodingTOC={render,sections};
})();