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
 const meter=$("progress-bar").parentElement;if(meter)meter.setAttribute("aria-valuenow",String(completed.length));
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
function modelOutput(model,v){
 switch(model.kind){
 case "address":return "int x = "+v+";\nint *p = &x;\n&p → 0x1000 (illustrative)\np → 0x1000\n*p → "+v+"\nAddress and value are different.";
 case "write":return "Before: x = "+v+"\n*p = "+(v+7)+";\nAfter: x = "+(v+7)+"\n*p and x refer to the same object.";
 case "swap":return "Before: a = "+v+", b = "+(v+3)+"\nAfter swap(&a,&b):\na = "+(v+3)+", b = "+v;
 case "array":return "a[0] = "+v+" at 0x1000\na[1] = "+(v+1)+" at 0x1004\na[2] = "+(v+2)+" at 0x1008\n*(a+1) = "+(v+1)+"\nAddresses assume sizeof(int)=4 for this illustration.";
 case "const":return "int x = "+v+";\nconst int *p = &x;\n*p = "+v+" (read allowed)\n*p = 9 (not allowed through p)\nx itself may still be modified.";
 case "pointer-array":return "scores = {"+v+","+(v+10)+","+(v+20)+"}\nPointer traversal sum = "+(3*v+30)+"\nThe same values as indexed traversal.";
 case "double-pointer":return "x = "+v+" at 0x1000\np = &x at 0x2000\npp = &p at 0x3000\n**pp = "+v+"\nAll displayed addresses are illustrative.";
 case "pointer-risk":return "index = "+v+"; valid indices: 0, 1, 2\n"+(v<3?"Access a["+v+"] is valid.":"Out-of-bounds access: undefined behavior. Do not dereference.")+"\nUse index bounds before access.";
 case "record":return "Student id="+v+"\nscore="+(70+v%25)+"\nmember access: s.id = "+v+"\nFields belong to one record.";
 case "typedef":return "Student s = {"+v+", 85.0};\nStudent is a typedef name.\nstruct Student is a tag only if declared.\nBoth denote a struct type when tagged typedef is used.";
 case "member":return "s.score before = "+v+"\nps->score = "+(v+5)+"\nEquivalent: (*ps).score = "+(v+5)+"\nThe original s is modified.";
 case "copy":return "original.score="+v+"\ncopy = original;\ncopy.score="+(v+10)+"\noriginal.score remains "+v+"\nStruct assignment copies member values (not deep-owned resources).";
 case "record-array":return "Students: {id:1,score:"+v+"}, {id:2,score:"+(v+10)+"}, {id:3,score:"+(v+20)+"}\nAverage = "+(v+10);
 case "function-record":return "Before: record.score="+v+"\nbyValue(record) changes local copy only.\nbyPointer(&record) adds 10.\nAfter: record.score="+(v+10);
 case "alignment":return "sizeof(struct) depends on member types and ABI.\nSelected example value="+v+"\nNever assume sizeof(Student) equals the sum of field sizes.\nUse sizeof and portable serialization.";
 case "sensor":return "sensor.id="+v+"; reading="+(v/10).toFixed(1)+"\nCSV example: "+v+","+(v/10).toFixed(1)+"\nRound-trip needs agreed text format and parse validation.";
 default:return "Model not configured";
 }
}

function renderTrace(stage,l){
 const section=element("section","activity trace-lab",stage);
 element("span","tag",section,"GUIDED EXECUTION · LINE-BY-LINE");
 element("h3","",section,"Trace the code · 코드 실행 흐름 추적");
 element("p","legend",section,"Educational execution walkthrough aligned to the C example. Each snapshot is manually specified, not obtained from a JavaScript C interpreter.");
 const panel=element("div","trace-layout",section),left=element("div","trace-code",panel),right=element("div","trace-state",panel);
 const lines=l.code.split("\n");
 const code=element("div","trace-lines",left);
 const rendered=lines.map((line,i)=>{
  const row=element("div","trace-line",code);
  row.dataset.line=String(i+1);
  const num=element("span","trace-number",row,String(i+1));
  num.setAttribute("aria-hidden","true");
  element("span","trace-source",row,line||" ");
  return row;
 });
 const trace=l.trace||[],steps=[];
 let searchFrom=0;
 for(const item of trace){
  let ix=lines.findIndex((line,i)=>i>=searchFrom&&line.includes(item.match));
  if(ix<0)ix=lines.findIndex(line=>line.includes(item.match));
  steps.push({...item,line:ix+1});
  if(ix>=0)searchFrom=ix+1;
 }
 const status=element("p","trace-status",right);
 const currentState=element("pre","trace-memory",right);
 const explanation=element("p","trace-explanation",right);
 const position=element("p","legend",right);
 const controls=element("div","trace-controls",section);
 const previous=element("button","action",controls,"← Previous");
 const next=element("button","action primary",controls,"Next →");
 const restart=element("button","action",controls,"Restart");
 let pointer=0;
 function showTrace(){
  const step=steps[pointer];
  rendered.forEach((row,i)=>{row.classList.toggle("active",i+1===step.line);if(i+1===step.line)row.setAttribute("aria-current","step");else row.removeAttribute("aria-current")});
  status.textContent="Step "+(pointer+1)+" / "+steps.length+" · Line "+step.line;
  currentState.textContent=step.state.replaceAll("\\n","\n");
  explanation.textContent=step.meaning;
  position.textContent="Read the highlighted C line, then explain how the stored values change.";
  previous.disabled=pointer===0;next.disabled=pointer===steps.length-1;
  rendered.find((row,i)=>i+1===step.line)?.scrollIntoView({block:"nearest",behavior:"instant"});
 }
 previous.addEventListener("click",()=>{pointer=Math.max(0,pointer-1);showTrace()});
 next.addEventListener("click",()=>{pointer=Math.min(steps.length-1,pointer+1);showTrace()});
 restart.addEventListener("click",()=>{pointer=0;showTrace()});
 if(steps.length)showTrace();else section.hidden=true;
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
 function refresh(){const v=Number(slider.value);value.textContent=l.model.valueLabel+": "+v;output.textContent=modelOutput(l.model,v)}
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
 renderTrace(stage,l);renderModel(stage,l);renderQuiz(stage,l);
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
 const back=$("back-link");if(back)back.href="../";
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
  theme=theme==="dark"?"light":"dark";document.documentElement.dataset.mode=theme;$("theme").setAttribute("aria-pressed",String(theme==="dark"));
  try{localStorage.setItem("els-c-theme",theme)}catch(e){}
 });document.documentElement.dataset.mode=theme;$("theme").setAttribute("aria-pressed",String(theme==="dark"));
 renderNav();show(0);
}
init();
})();