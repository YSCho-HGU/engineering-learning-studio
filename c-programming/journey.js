/* Data-driven C Programming Learning Journey.
   Read-only C reference snippets: model outputs are illustrative, not compiled C execution. */
(()=>{
"use strict";
const D=window.C_JOURNEY;
if(!D||!Array.isArray(D.lessons)||D.lessons.length<1)throw Error("Journey must contain at least one lesson");
const total=D.lessons.length;
const hasOptional=Number.isInteger(D.coreCount)&&D.coreCount>0&&D.coreCount<total;
const coreCount=hasOptional?D.coreCount:total;
const phaseBreaks=Array.isArray(D.phaseBreaks)&&D.phaseBreaks.length===2?D.phaseBreaks:[Math.ceil(total/2),Math.max(Math.ceil(total/2)+1,total-1)];
const $=id=>document.getElementById(id);
const ui=(ko,en)=>window.ELSLanguage?.get()==="en"?en:ko;
const version=D.contentRevision||(D.slug==="dynamic-memory"?2:1);
const key="els-journey-"+D.slug+"-v"+version;
let completed=[],current=0;
const assessmentKey="els-concept-"+D.slug+"-v"+version;
let concepts=[];
try{const v=JSON.parse(localStorage.getItem(assessmentKey)||"[]");if(Array.isArray(v))concepts=[...new Set(v.filter(n=>Number.isInteger(n)&&n>=0&&n<total))]}catch(e){}
const persistConcepts=()=>{try{localStorage.setItem(assessmentKey,JSON.stringify(concepts))}catch(e){}};

try{const v=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(v))completed=[...new Set(v.filter(n=>Number.isInteger(n)&&n>=0&&n<total))]}catch(e){}
function safe(x){return String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function element(tag,cls,parent,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;parent.appendChild(n);return n}
function renderNav(){
 const nav=$("lesson-nav");
 const previousOpen={};
 nav.querySelectorAll("details.c-learning-group").forEach(group=>{previousOpen[group.dataset.group]=group.open});
 nav.replaceChildren();
 function group(id,ko,en,openDefault){
  const d=element("details","c-learning-group",nav);
  d.dataset.group=id;
  d.open=Object.prototype.hasOwnProperty.call(previousOpen,id)?previousOpen[id]:openDefault;
  const title=element("summary","c-learning-group-title",d,ui(ko,en));
  title.setAttribute("aria-label",en);
  const list=element("div","c-learning-group-items",d);
  return list;
 }
 const core=group("core","Core Concepts · 필수 학습","Core Concepts",current<coreCount);
 const optional=hasOptional?group("advanced","Advanced · 선택 심화","Advanced / Optional",current>=coreCount):null;
 D.lessons.forEach((l,i)=>{
  const host=i<coreCount?core:optional;
  const b=element("button",(i===current?"active ":"")+(completed.includes(i)?"done":""),host);
  b.type="button";b.dataset.lesson=i;b.setAttribute("aria-controls","lesson");
  if(i===current)b.setAttribute("aria-current","step");
  element("span","n",b,String(i+1).padStart(2,"0"));
  element("span","",b,l.title);
  if(concepts.includes(i))element("span","concept-indicator",b,"✓");
  b.addEventListener("click",()=>show(i));
 });
 if(Array.isArray(D.guidedLabs)&&D.guidedLabs.length){
  const labs=group("labs","Guided Labs · 따라하기 실습","Guided Labs",false);
  D.guidedLabs.forEach((lab,i)=>{
   const link=element("a","c-learning-link",labs,lab.label||"Lab "+(i+1));
   link.href=lab.href;
  });
 }
 if(Array.isArray(D.practice)&&D.practice.length){
  const challenges=group("challenges","Coding Challenges · 직접 구현","Coding Challenges",false);
  D.practice.forEach((task,i)=>{
   const link=element("a","c-learning-link",challenges,"P"+(i+1)+" · "+task.title);
   link.href="./practice/#p"+(i+1);
   link.dataset.challenge=String(i+1);
  });
 }
 const count=hasOptional?completed.filter(i=>i<coreCount).length:completed.length;
 const limit=hasOptional?coreCount:total;
 $("progress-text").textContent=count+" / "+limit+ui(" 완료"," completed");
 $("progress-bar").style.width=(count/limit)*100+"%";
 const meter=$("progress-bar").parentElement;
 if(meter){meter.setAttribute("aria-valuenow",String(count));meter.setAttribute("aria-valuemax",String(limit))}
}
function createCode(host,source,kind="reference"){
 const wrap=element("div","c-code-example",host);
 const caption=kind==="starter"?ui("실습용 Starter Code · TODO를 직접 완성하세요","Starter code · Complete the TODO sections"):ui("전체 C11 예제 프로그램 · 출력 결과를 먼저 예측하세요","Complete C11 example · Predict its output before revealing the answer");
 element("p","c-code-caption",wrap,caption);
 const pre=element("pre","code",wrap);
 pre.setAttribute("aria-label",kind==="starter"?"C11 starter code (incomplete)":"Complete C11 example");
 pre.textContent=source;
 return pre;
}
function renderQuiz(stage,l){
 const section=element("section","quiz question",stage);
 element("h3","",section,ui("Check Yourself · 스스로 확인","Check Yourself"));
 element("p","quiz-context",section,l.quiz.context||l.goal);
 const q=element("p","quiz-question",section,l.quiz.q);
 const fs=element("fieldset","",section);element("legend","",fs,ui("보기를 선택하고 근거를 생각해 보세요.","Select an answer and consider why it is correct."));
 const name="answer-"+current;
 l.quiz.options.forEach((opt,i)=>{
  const label=element("label","",fs);
  const input=element("input","",label);input.type="radio";input.name=name;input.value=String(i);
  element("span","",label,opt);
 });
 const check=element("button","action primary",section,ui("선택한 답 확인","Check your answer"));
 const result=element("p","feedback",section);result.hidden=true;result.setAttribute("role","status");
 check.addEventListener("click",()=>{
  const answer=fs.querySelector("input:checked");
  result.hidden=false;
  if(!answer){result.textContent=ui("먼저 답을 선택하세요.","Select an answer first.");return}
  const ok=Number(answer.value)===l.quiz.correct;
  result.textContent=(ok?ui("정답입니다. ","Correct. "):ui("답을 다시 검토하세요. ","Review your answer. "))+l.quiz.explain;
  if(ok&&!concepts.includes(current)){concepts.push(current);concepts.sort((a,b)=>a-b);persistConcepts();renderNav();updateAssessmentSummary();}
 });
}
function updateAssessmentSummary(){
 const target=$("assessment-status");if(!target)return;
 target.textContent=hasOptional?ui("필수 활동 ","Core activity ")+completed.filter(i=>i<coreCount).length+"/"+coreCount+ui(" · 필수 개념 "," · Core concept ")+concepts.filter(i=>i<coreCount).length+"/"+coreCount+ui(" · 선택 심화 활동 "," · Optional activity ")+completed.filter(i=>i>=coreCount).length+"/"+(total-coreCount)+ui(" · GCC 직접 확인은 자기보고"," · GCC checks are self-reported"): "Activity Reviewed "+completed.length+"/"+total+" · Concept Check Passed "+concepts.length+"/"+total+" · Coding Practice: self-reported GCC checks only.";
}
function modelOutput(model,v){
 switch(model.kind){
 case "scenario":return model.cases?.[v-1]||"Scenario not configured";
 case "alloc":return "Request: "+v+" int elements\nHeap: ["+Array.from({length:v},(_,i)=>"slot "+i).join(" | ")+"]\nmalloc: uninitialized until you write each element\nOwner pointer must be checked for NULL; free once after use.";
 case "calloc":return "calloc("+v+", sizeof(int))\nConceptual int array: ["+Array(v).fill("0").join(", ")+"]\nAll allocated bytes initialized to zero; always check allocation result.";
 case "failure":return "Request: "+v+" int elements\nSuccess → pointer to allocated block; initialize and use\nFailure → NULL, skip dereference, handle error\nSimulation shows both branches, not a real failure.";
 case "realloc":return "Original array: [4, 8]\nGrow to "+v+" int slots with temporary pointer\nSuccess → old values preserved; new elements uninitialized\nFailure → original allocation remains valid; free original when finished.";
 case "free":return "Allocated block of "+v+" int slot(s)\nBefore free: valid if allocation succeeded\nAfter free: object lifetime ended; do NOT dereference or free again\nAssign p=NULL to prevent accidental reuse of this pointer.";
 case "sensor":return "Allocate "+v+" Sensor record(s)\nExample values: "+Array.from({length:v},(_,i)=>12+6*i).join(", ")+"\nMean: "+(12+3*(v-1)).toFixed(1)+"\nUse records, calculate results, and free the allocation.";

 case "indexed-array":return "int values["+v+"] = {"+Array.from({length:v},(_,i)=>2*(i+1)).join(", ")+"}\nValid indices: 0 ... "+(v-1)+"\nRead a[i] only when i is within bounds.\nSum = "+v*(v+1)+"; average = "+(v+1)+".";
 case "cstring":return "char s["+ (v+1)+"] = {"+Array.from({length:v},(_,i)=>"'"+String.fromCharCode(65+i)+"'").join(", ")+", '\0'}\nstrlen(s) = "+v+"\nsizeof s = "+(v+1)+"\nCharacter array needs space for the null terminator.";
 case "stdlib":return "Input n = "+v+"\nabs(-n) = "+v+"\nsqrt(n*n) = "+v+"\nStandard function behavior depends on the declared input and output types.";
 case "function-call":return "Call: twice("+v+")\nParameter x receives a copy of "+v+"\nreturn 2*x → "+(v*2)+"\nCaller receives "+(v*2)+"; the original argument is not changed.";
 case "address":return "int x = "+v+";\nint *p = &x;\n&x → 0x1000 (illustrative)\np → 0x1000\n*p → "+v+"\nAddress and value are different.";
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


/* Visual memory model from instructor-authored trace snapshots.
   Deliberately illustrative: virtual addresses are NOT actual GCC addresses. */
function renderMemoryDiagram(host, step, lesson){
 host.replaceChildren();
 const header=element("div","mem-diagram-title",host);
 element("strong","",header,"Memory Diagram · 메모리 상태");
 element("small","",header,"Virtual addresses / conceptual view");
 const board=element("div","mem-diagram-board",host);
 const state=step.state.replaceAll("\\n","\n");
 const statements=state.split(/[\n;]+/).map(s=>s.trim()).filter(Boolean);
 const relationships=[];
 const values=[];
 const outputs=[];
 for(const statement of statements){
  if(/^(?:stdout|output):/i.test(statement)){outputs.push(statement);continue}
  const arrow=/^(.+?)\s*(?:→|->)\s*(.+)$/.exec(statement);
  if(arrow && !/^i=/.test(statement)){relationships.push([arrow[1].trim(),arrow[2].trim()]);continue}
  if(/[=:]/.test(statement)){values.push(statement);continue}
  outputs.push(statement);
 }
 if(!relationships.length && !values.length){
  values.push("State: "+state);
 }
 const take=(str,max=80)=>str.length>max?str.slice(0,max-1)+"…":str;
 const addCell=(name,value,kind,parent=board)=>{
  const card=element("div","mem-cell "+kind,parent);
  const top=element("div","mem-cell-head",card);
  element("span","mem-cell-name",top,take(name,42));
  const virtualAddress=/\bpp\b/.test(name)?"&pp (symbolic)":/\b(?:p|ps)\b/.test(name)?"&p (symbolic)":/\ba\[2\]/.test(name)?"base+2*sizeof(int)":/\ba\[1\]/.test(name)?"base+sizeof(int)":/\bb\./.test(name)?"&b+offset":/\ba\./.test(name)?"&a+offset":"symbolic";
  element("span","mem-cell-address",top,virtualAddress);
  element("strong","mem-cell-value",card,take(value,110));
  return card;
 };
 for(const [from,to] of relationships){
  const link=element("div","mem-pointer-link",board);
  addCell(from,"address / reference","mem-pointer",link);
  const connector=element("div","mem-connector",link);
  const arrow=element("div","mem-arrow",connector,"→");arrow.setAttribute("aria-hidden","true");
  element("span","mem-link-label",connector,"points to");
  addCell(to,"target object / value","mem-target",link);
 }
 for(const statement of values){
  const equal=/^([^=:]+)[=:]\s*(.*)$/.exec(statement);
  addCell(equal?equal[1].trim():"state",equal?equal[2].trim():statement,"mem-value");
 }
 if(outputs.length){
  const footer=element("div","mem-diagram-output",host);
  element("strong","",footer,"Output / interpretation");
  element("span","",footer,outputs.join(" · "));
 }
 const note=element("p","mem-diagram-note",host,
   lesson.model?.kind==="alignment"?
    "sizeof(struct) and padding depend on the implementation. No fixed address or size is asserted.":
    "Addresses and arrows illustrate relationships only. Actual layout depends on compiler, ABI, and execution.");
 return host;
}


function renderMemoryLayout(stage,l){
 if(!l.layout)return;
 const section=element("section","activity layout-lesson",stage);
 element("span","tag",section,"MEMORY LAYOUT · ARRAYS & STRUCTURES");
 element("h3","",section,l.layout.title);
 const meta=element("p","legend",section,l.layout.base);
 const strip=element("div","layout-cells",section);
 for(const cell of l.layout.cells){
  const panel=element("div","layout-cell"+(cell.label.includes("padding")?" layout-padding":""),strip);
  element("strong","layout-cell-label",panel,cell.label);
  element("span","layout-cell-value",panel,cell.value);
  element("small","layout-cell-offset",panel,cell.offset);
 }
 element("p","layout-disclaimer",section,l.layout.note);
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
 const diagram=element("div","mem-diagram",right);
 const explanation=element("p","trace-explanation",right);
 const position=element("p","legend",right);
 const controls=element("div","trace-controls",section);
 const previous=element("button","action",controls,"← Previous");
 const next=element("button","action primary",controls,"Next →");
 const restart=element("button","action",controls,"Restart");
 let pointer=0;
 function showTrace(userAction=false){
  const step=steps[pointer];
  rendered.forEach((row,i)=>{row.classList.toggle("active",i+1===step.line);if(i+1===step.line)row.setAttribute("aria-current","step");else row.removeAttribute("aria-current")});
  status.textContent="Step "+(pointer+1)+" / "+steps.length+" · Line "+step.line;
  currentState.textContent=step.state.replaceAll("\\n","\n");
  renderMemoryDiagram(diagram,step,l);
  explanation.textContent=step.meaning;
  position.textContent="Read the highlighted C line, then explain how the stored values change.";
  previous.disabled=pointer===0;next.disabled=pointer===steps.length-1;
  if(userAction){const row=rendered.find((r,i)=>i+1===step.line);if(row)code.parentElement.scrollTop=Math.max(0,row.offsetTop-code.offsetTop-65)}
 }
 previous.addEventListener("click",()=>{pointer=Math.max(0,pointer-1);showTrace(true)});
 next.addEventListener("click",()=>{pointer=Math.min(steps.length-1,pointer+1);showTrace(true)});
 restart.addEventListener("click",()=>{pointer=0;showTrace(true)});
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
 if(D.slug==="dynamic-memory"&&typeof window.renderDynamicHeap==="function")window.renderDynamicHeap(stage,l);
}
function show(i){
 current=Math.max(0,Math.min(total-1,i));renderNav();
 const l=D.lessons[current];
 const stage=$("lesson");stage.replaceChildren();
 element("div","tag",stage,"STEP "+String(current+1).padStart(2,"0")+" / "+String(total).padStart(2,"0")+" · "+(hasOptional?(current<coreCount?ui("필수 학습 · CORE","Core lesson"):ui("선택 심화 · OPTIONAL","Optional extension")):(current<phaseBreaks[0]?"BEFORE CLASS":current<phaseBreaks[1]?"IN CLASS":"AFTER CLASS")));
 element("h2","",stage,l.title);element("p","lead",stage,l.goal);
 if(l.minutes)element("p","legend",stage,ui("권장 개념 학습 시간: 약 ","Suggested concept study: ")+l.minutes+ui("분 · 코딩 실습은 별도"," min · Coding practice is separate"));
 const concept=element("section","concept",stage);
 element("h3","",concept,ui("핵심 개념 · Understand","Core Concept · Understand"));element("p","",concept,l.concept);
 const learn=element("div","learn",stage);
 const c=element("section","",learn);element("h3","",c,ui("전체 프로그램 · 코드 읽기","Complete C Program · Read the Code"));createCode(c,l.code);
 const e=element("section","",learn);element("h3","",e,ui("실행 결과 예측하기","Predict the Output"));element("p","",e,l.predict);
 const reveal=element("button","action",e,ui("참조 출력 확인","Reveal Reference Output"));
 const out=element("div","explain",e);out.hidden=true;
 const outPre=element("pre","",out);outPre.style.whiteSpace="pre-wrap";outPre.textContent=l.output;
 reveal.addEventListener("click",()=>{out.hidden=!out.hidden;reveal.setAttribute("aria-expanded",String(!out.hidden))});reveal.setAttribute("aria-expanded","false");
 renderTrace(stage,l);renderMemoryLayout(stage,l);renderModel(stage,l);renderQuiz(stage,l);
 const transfer=element("section","transfer",stage);
 element("h3","",transfer,ui("응용 · 내 말로 설명하기","Apply and Explain"));
 element("p","",transfer,l.transfer);
 const textarea=element("textarea","",transfer);textarea.placeholder="Explain why, sketch memory, or write pseudocode here...";textarea.setAttribute("aria-label","Personal explanation; stored only in this browser");
 const draftkey=key+"-note-"+current;try{textarea.value=localStorage.getItem(draftkey)||""}catch(e){}
 textarea.addEventListener("input",()=>{try{localStorage.setItem(draftkey,textarea.value)}catch(e){}});
 const hint=element("details","",transfer);element("summary","",hint,ui("해설 가이드 펼치기","Show Instructor Guidance"));element("p","",hint,l.guide);
 const actions=element("div","navactions",stage);
 const prev=element("button","action",actions,"← Previous");prev.disabled=current===0;prev.addEventListener("click",()=>show(current-1));
 const mark=element("button","action primary",actions,completed.includes(current)?"Activity reviewed ✓":"Mark activity reviewed ✓");
 mark.addEventListener("click",()=>{if(!completed.includes(current)){completed.push(current);completed.sort((a,b)=>a-b);try{localStorage.setItem(key,JSON.stringify(completed))}catch(e){}}
 renderNav();updateAssessmentSummary();mark.textContent="Activity reviewed ✓";$("activity-note").textContent=ui("활동 확인 기록입니다. 실제 C 코딩 숙달을 인증하지 않습니다.","Activity reviewed. This is not evidence of C coding proficiency.")});
 const next=element("button","action",actions,"Next →");next.disabled=current===total-1;next.addEventListener("click",()=>show(current+1));
 $("current-title").textContent=l.title;
 $("activity-note").textContent=ui("학습 활동 표시이며, 퀴즈 정답이나 실제 C 컴파일 성공을 의미하지 않습니다.","This activity marker does not indicate a correct quiz answer or successful C compilation.");
}
function init(){
 $("site-title").textContent=D.title+" Learning Journey";
 $("hero-title").textContent=D.title+" Learning Journey";
 $("hero-summary").textContent=D.summary;
 $("hero-count").textContent=(hasOptional?coreCount+" Core + "+(total-coreCount)+" Optional · ":total+" Learning Steps · ")+D.book;
 const stepLabel=document.querySelector(".hero-aside small");if(stepLabel)stepLabel.textContent=total+" LEARNING STEPS";
 const heading=document.querySelector(".route-heading span");if(heading)heading.textContent=total+" Learning Steps / "+D.practice.length+" Coding Practices";
 const intro=document.querySelector("#coding-practice h2");if(intro)intro.textContent="P1–P"+D.practice.length+" · Coding Challenges";
 const meter=$("progress-bar")?.parentElement;if(meter)meter.setAttribute("aria-valuemax",String(hasOptional?coreCount:total));
 $("course-number").textContent=D.book;
 $("phase-one").textContent=D.phases[0];$("phase-two").textContent=D.phases[1];$("phase-three").textContent=D.phases[2];
 const back=$("back-link");if(back)back.href="../";
 $("related-link").href=D.related; $("related-link").textContent=ui("연관 단원: ","Related: ")+D.relatedTitle+" →";
 $("practice").replaceChildren();
 D.practice.forEach((p,i)=>{
  const article=element("article","",$("practice"));element("strong","",article,"P"+(i+1)+" · "+(hasOptional?(i<Number(D.practiceCoreCount??3)?ui("[필수] ","[Core] "):ui("[선택] ","[Optional] ")):"")+p.title);
  element("p","",article,p.task);
  const details=element("details","",article);element("summary","",details,"Starter code and test case");
  createCode(details,p.starter,"starter");
  const test=element("pre","code",details);test.textContent="Test input / expected output:\n"+p.expected;
  const btn=element("button","action",details,"Copy starter code");
  btn.addEventListener("click",()=>navigator.clipboard?.writeText(p.starter));
 });
 const themeToggle=$("theme");
 if(themeToggle && themeToggle.tagName==="BUTTON")themeToggle.addEventListener("click",()=>{
  if(window.ELSTheme){
   const next=window.ELSTheme.get()==="warm-neutral"?"neutral-dark":"warm-neutral";
   window.ELSTheme.set(next);
   themeToggle.setAttribute("aria-pressed",String(next!=="warm-neutral"));
  }
 });
 const hashStep=()=>{const m=/^#step-(\d+)$/.exec(location.hash);return m?Math.max(0,Math.min(total-1,Number(m[1])-1)):0};
 renderNav();show(hashStep());updateAssessmentSummary();
 window.addEventListener("hashchange",()=>{if(/^#step-\d+$/.test(location.hash))show(hashStep())});
}
init();
})();