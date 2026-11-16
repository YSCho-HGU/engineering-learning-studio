/* Shared C Programming localization: no changes to stored progress or C source. */
(function(){
"use strict";
const KEY="els-language";
const original=window.C_JOURNEY;
const english=window.C_JOURNEY_EN;
let lang="mixed";
try{const v=localStorage.getItem(KEY);if(["mixed","ko","en"].includes(v))lang=v}catch(e){}
const pristine=original?JSON.parse(JSON.stringify(original)):null;
function applyContent(mode){
 if(!original||!pristine)return;
 Object.assign(original,{summary:pristine.summary,phases:pristine.phases});
 original.lessons.forEach((l,i)=>{const source=pristine.lessons[i];for(const k of ["goal","concept","predict","transfer","guide"])if(source[k]!==undefined)l[k]=source[k];l.quiz={...source.quiz};});
 original.practice.forEach((p,i)=>{p.title=pristine.practice[i].title;p.task=pristine.practice[i].task});
 if(mode!=="en"||!english)return;
 if(english.summary)original.summary=english.summary;
 if(english.phases?.length===original.phases.length)original.phases=english.phases;
 original.lessons.forEach((l,i)=>{
  const en=english.lessons?.[i];if(!en)return;
  for(const k of ["goal","concept","predict","transfer","guide"]){if(typeof en[k]==="string")l[k]=en[k]}
  if(en.model && l.model)Object.assign(l.model,en.model);
  if(Array.isArray(en.trace)&&Array.isArray(l.trace))l.trace.forEach((item,j)=>{if(en.trace[j]?.meaning)item.meaning=en.trace[j].meaning});
  if(en.quiz){for(const k of ["q","explain"])if(typeof en.quiz[k]==="string")l.quiz[k]=en.quiz[k];
   if(Array.isArray(en.quiz.options)&&en.quiz.options.length===l.quiz.options.length)l.quiz.options=en.quiz.options;}
 });
 original.practice.forEach((p,i)=>{const en=english.practice?.[i];if(!en)return;if(en.title)p.title=en.title;if(en.task)p.task=en.task});
}
applyContent(lang);
const dict=new Map([
 ["학습 가능한 단원","Available chapters"],["학습 로드맵 · 3-Phase Learning","Learning roadmap · Three phases"],
 ["필수 학습 경로","Core learning path"],["1. 개념 학습","1. Concepts"],["2. 코딩 실습 안내","2. Coding practice"],["3. 코드 편집기","3. Code editor"],
 ["3-Phase 상세 학습 로드맵 펼치기","Expand three-phase learning roadmap"],
 ["Activity는 학습 확인, Concept는 정답 제출을 의미합니다. 실제 코딩 능력은 GCC로 별도 검증합니다.","Activity means reviewed content; Concept means a correct quiz response. Verify real C coding separately with GCC."],
 ["각 문제의 starter code를 직접 완성하고 GCC C11로 컴파일 및 실행 결과를 비교하세요. 웹 화면은 C 코드를 실제로 컴파일하지 않습니다.","Complete each starter program and compare its output after compiling with GCC C11. This webpage does not compile C code."],
 ["P1–P6 Coding Editor 열기 →","Open P1–P6 coding editor →"],["C Course Roadmap","C course roadmap"],
 ["활동 확인 기록입니다. 실제 C 코딩 숙달을 인증하지 않습니다.","Activity was marked reviewed; this does not certify C programming skills."],
 ["학습 활동 표시이며, 퀴즈 정답이나 실제 C 컴파일 성공을 의미하지 않습니다.","This marks activity review, not a correct quiz answer or a successful C compilation."],
 ["Check Yourself · 스스로 확인","Check Yourself"],["Predict before revealing the answer","Predict before revealing the answer"],["Check prediction · 확인","Check prediction"],
 ["먼저 답을 선택하세요. / Select an answer first.","Select an answer first."],
 ["Understand · 핵심 개념","Understand · Core concept"],["Read the C code · 코드 분석","Read the C code"],["Predict the output · 실행 예측","Predict the output"],
 ["Reveal reference output · 참조 결과","Reveal reference output"],["Transfer · 응용 및 설명","Apply and explain"],
 ["Instructor guidance · 해설 가이드","Instructor guidance"],["필수","Core"],["선택","Optional"],["필수 학습 · CORE","Core learning"],["선택 심화 · OPTIONAL","Optional extension"],
 ["초안 저장","Save draft"],[".c 다운로드","Download .c"],["Starter Code 복원","Restore starter code"],
 ["코드 점검 · 정적 힌트","Check code · Static hints"],["검증 범위:","Verification scope:"],
 ["GCC 실행 방법 및 검증 절차","How to compile and verify with GCC"],
 ["참조 결과 · 예상 출력 (실제 컴파일 결과 아님)","Reference · Expected output (not a compiled result)"],
 ["C Source Editor · 직접 코드 작성","C source editor · Write your code"],
 ["정적 검사는 컴파일이나 실제 실행을 대신하지 않습니다.","Static checks do not replace compilation or execution."],
 ["정적 점검은 구문 누락을 알려주는 힌트이며 컴파일·실행 검증이 아닙니다.","Static checks offer syntax hints, not compilation or execution."],
 ["GCC에서 직접 컴파일·실행하고 참조 출력과 비교했습니다 (자기보고).","I compiled and ran the code with GCC and compared the result (self-reported)."],
 ["이 체크는 자기보고입니다. 이 브라우저는 GCC를 실행하지 않으며, 제출된 C 코드의 정답을 자동 인증하지 않습니다.","This check is self-reported. The browser does not run GCC or automatically certify your C code."],
 ["단계별 힌트 · Guided Coding","Guided coding · Step-by-step hints"],
 ["필수 과제는 힌트를 순서대로 열어 핵심 코드를 직접 완성하세요.","Reveal hints in order and complete the core code yourself."],
 ["활동 기록 초기화","Reset learning progress"]
]);
const originals=new WeakMap();
function translate(root){
 if(lang!=="en")return;
 const scope=root?.nodeType===1?root:document.body;
 if(!scope)return;
 const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);
 let n;while((n=walker.nextNode())){
  const p=n.parentElement;if(!p||["SCRIPT","STYLE","PRE","CODE","TEXTAREA","OPTION"].includes(p.tagName)||p.closest("pre,code,textarea"))continue;
  if(!originals.has(n))originals.set(n,n.textContent);
  const text=originals.get(n),trim=text.trim();
  const found=dict.get(trim);
  if(found){const translated=text.replace(trim,found);if(n.textContent!==translated)n.textContent=translated;}
 }
}
function restore(){const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode()))if(originals.has(n)&&n.textContent!==originals.get(n))n.textContent=originals.get(n)}
let pending=false;
const observer=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;observer.disconnect();translate(document.body);observer.observe(document.body,{subtree:true,childList:true,characterData:true})})});
function renderLang(){document.documentElement.lang=lang==="en"?"en":"ko";restore();translate(document.body);}
function setup(){
 const nav=document.querySelector(".toplinks,.header-nav,.topbar,.site-header");
 if(!nav)return;
 if(!document.getElementById("c-shared-language")){
  const label=document.createElement("label");label.id="c-shared-language";label.style.cssText="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;font-size:12px";
  const caption=document.createElement("span");caption.textContent="Language";
  const select=document.createElement("select");select.setAttribute("aria-label","C Programming language");
  select.style.cssText="background:var(--surface,var(--els-surface,#222));color:var(--ink,var(--els-ink,#fff));border:1px solid var(--border,var(--els-border,#666));border-radius:7px;padding:7px;min-height:36px";
  for(const [value,name] of [["mixed","ENG + 한국어"],["en","ENG"],["ko","한국어"]]){const opt=document.createElement("option");opt.value=value;opt.textContent=name;select.append(opt)}
  select.value=lang;label.append(caption,select);nav.append(label);
  select.addEventListener("change",()=>{try{localStorage.setItem(KEY,select.value)}catch(e){}location.reload()});
 }
 renderLang();observer.observe(document.body,{subtree:true,childList:true,characterData:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();
