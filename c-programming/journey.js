/* Data-driven C Programming Learning Journey.
   Read-only C reference snippets: model outputs are illustrative, not compiled C execution. */
(()=>{
"use strict";
const D=window.C_JOURNEY;
if(!D||!Array.isArray(D.lessons)||D.lessons.length!==8)throw Error("Journey must contain exactly 8 lessons");
const $=id=>document.getElementById(id);
const key="els-journey-"+D.slug+"-v1";
let completed=[],current=0,theme=localStorage.getItem("els-c-theme")||"auto";
try{const v=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(v))completed=[...new Set(v.filter(n=>Number.isInteger(n)&&n>=0&&n<8))]}catch(e){}
function safe(x){return String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function element(tag,cls,parent,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;parent.appendChild(n);return n}
function renderNav(){
 $("lesson-nav").replaceChildren();
 D.lessons.forEach((l,i)=>{
  const b=element("button",(i===current?"active ":"")+(completed.includes(i)?"done":""),$("lesson-nav"));
  b.type="button";b.dataset.lesson=i;
  element("span","n",b,String(i+1).padStart(2,"0"));
  element("span","",b,l.title);
  b.addEventListener("click",()=>show(i));
 });
 $("progress-text").textContent=completed.length+" / 8";
 $("progress-bar").style.width=completed.length/8*100+"%";
}
function createCode(host,source){
 const pre=element("pre","code",host);
 pre.setAttribute("aria-label","C11 reference code");
 pre.textContent=source;
}
function renderQuiz(stage,l){
 const section=element("section","quiz question",stage);
 element("h3","",section,"Check Yourself · 스스로 확인");
 const q=element("p","",section,l.quiz.q);
 const fs=element("fieldset","",section);element("legend","",fs,"Predict before revealing the answer");
 const name="answer-"+current;
 l.quiz.options.forEach((opt,i)=>{
  const label=element("label","",fs);
  const input=element("input","",label);input.type="radio";input.name=name;input.value=String(i);
  element("span","",label,opt);
 });
 const check=element("button","action primary",section,"Check prediction · 확인");
 const result=element("p","feedback",section);result.hidden=true;result.setAttribute("role","status");
 check.addEventListener("click",()=>{
  const answer=fs.querySelector("input:checked");
  result.hidden=false;
  if(!answer){result.textContent="먼저 답을 선택하세요. / Select an answer first.";return}
  const ok=Number(answer.value)===l.quiz.correct;
  result.textContent=(ok?"Correct. ":"Review your prediction. ")+l.quiz.explain;
 });
}
function renderModel(stage,l){
 const section=element("section","activity",stage);
 element("span","tag",section,"INTERACTIVE MODEL · 개념 실험");
 element("h3","",section,l.model.title);
 element("p","legend",section,"Values and addresses are illustrative. This is a JavaScript learning model, not a C compiler.");
 const grid=element("div","learn",section),left=element("div","model",grid),right=element("div","model",grid);
 const label=element("label","",left,l.model.controlLabel);
 const slider=element("input","",left);
 slider.type="range";slider.min=l.model.min;slider.max=l.model.max;slider.step=l.model.step||1;slider.value=l.model.initial;
 label.htmlFor="model-control";slider.id="model-control";
 const value=element("p","",left);
 const output=element("output","",right);output.setAttribute("aria-live","polite");
 const insight=element("p","legend",right,l.model.note);
 function refresh(){const v=Number(slider.value);value.textContent=l.model.valueLabel+": "+v;output.textContent=l.model.render(v)}
 slider.addEventListener("input",refresh);refresh();
}
function show(i){
 current=Math.max(0,Math.min(7,i));renderNav();
 const l=D.lessons[current];
 const stage=$("lesson");stage.replaceChildren();
 element("div","tag",stage,"STEP "+String(current+1).padStart(2,"0")+" / 08 · "+(current<4?"BEFORE CLASS":current<7?"IN CLASS":"AFTER CLASS"));
 element("h2","",stage,l.title);element("p","lead",stage,l.goal);
 const concept=element("section","concept",stage);
 element("h3","",concept,"Understand · 핵심 개념");element("p","",concept,l.concept);
 const learn=element("div","learn",stage);
 const c=element("section","",learn);element("h3","",c,"Read the C code · 코드 분석");createCode(c,l.code);
 const e=element("section","",learn);element("h3","",e,"Predict the output · 실행 예측");element("p","",e,l.predict);
 const reveal=element("button","action",e,"Reveal reference output · 참조 결과");
 const out=element("div","explain",e);out.hidden=true;
 const outPre=element("pre","",out);outPre.style.whiteSpace="pre-wrap";outPre.textContent=l.output;
 reveal.addEventListener("click",()=>{out.hidden=!out.hidden;reveal.setAttribute("aria-expanded",String(!out.hidden))});reveal.setAttribute("aria-expanded","false");
 renderModel(stage,l);renderQuiz(stage,l);
 const transfer=element("section","transfer",stage);
 element("h3","",transfer,"Transfer · 응용 및 설명");
 element("p","",transfer,l.transfer);
 const textarea=element("textarea","",transfer);textarea.placeholder="Explain why, sketch memory, or write pseudocode here...";textarea.setAttribute("aria-label","Personal explanation; stored only in this browser");
 const draftkey=key+"-note-"+current;try{textarea.value=localStorage.getItem(draftkey)||""}catch(e){}
 textarea.addEventListener("input",()=>{try{localStorage.setItem(draftkey,textarea.value)}catch(e){}});
 const hint=element("details","",transfer);element("summary","",hint,"Instructor guidance · 해설 가이드");element("p","",hint,l.guide);
 const actions=element("div","navactions",stage);
 const prev=element("button","action",actions,"← Previous");prev.disabled=current===0;prev.addEventListener("click",()=>show(current-1));
 const mark=element("button","action primary",actions,completed.includes(current)?"Activity reviewed ✓":"Mark activity reviewed ✓");
 mark.addEventListener("click",()=>{if(!completed.includes(current)){completed.push(current);completed.sort((a,b)=>a-b);try{localStorage.setItem(key,JSON.stringify(completed))}catch(e){}}
 renderNav();mark.textContent="Activity reviewed ✓";$("activity-note").textContent="활동 확인 기록입니다. 실제 C 코딩 숙달을 인증하지 않습니다."});
 const next=element("button","action",actions,"Next →");next.disabled=current===7;next.addEventListener("click",()=>show(current+1));
 $("current-title").textContent=l.title;
 $("activity-note").textContent="학습 활동 표시이며, 퀴즈 정답이나 실제 C 컴파일 성공을 의미하지 않습니다.";
}
function init(){
 $("site-title").textContent=D.title+" Learning Journey";
 $("hero-title").textContent=D.title+" Learning Journey";
 $("hero-summary").textContent=D.summary;
 $("hero-count").textContent="8 Essential Steps · "+D.book;
 $("course-number").textContent=D.book;
 $("phase-one").textContent=D.phases[0];$("phase-two").textContent=D.phases[1];$("phase-three").textContent=D.phases[2];
 $("back-link").href="../";
 $("related-link").href=D.related; $("related-link").textContent="Related "+D.relatedTitle+" →";
 $("practice").replaceChildren();
 D.practice.forEach((p,i)=>{
  const article=element("article","",$("practice"));element("strong","",article,"P"+(i+1)+" · "+p.title);
  element("p","",article,p.task);
  const details=element("details","",article);element("summary","",details,"Starter code and test case");
  createCode(details,p.starter);
  const test=element("pre","code",details);test.textContent="Test input / expected output:\n"+p.expected;
  const btn=element("button","action",details,"Copy starter code");
  btn.addEventListener("click",()=>navigator.clipboard?.writeText(p.starter));
 });
 $("theme").addEventListener("click",()=>{
  theme=theme==="dark"?"light":"dark";document.documentElement.dataset.mode=theme;
  try{localStorage.setItem("els-c-theme",theme)}catch(e){}
 });document.documentElement.dataset.mode=theme;
 renderNav();show(0);
}
init();
})();