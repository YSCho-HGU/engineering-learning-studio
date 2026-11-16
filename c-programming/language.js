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
for(const [ko,en] of [["제공된 Starter Code를 직접 완성하고 실행 결과를 예측한 후 GCC로 검증합니다. 초안은 브라우저에 저장됩니다.","Complete the starter code, predict the output, and verify it with GCC. Drafts are saved in this browser."],["브라우저의 코드 점검은 단순 정적 구문 힌트입니다. C 소스를 컴파일하거나 실행하지 않으며, 코딩 숙달을 자동 인증하지 않습니다. 실제 결과 확인은 GCC로 진행합니다.","The browser offers basic static syntax hints only. It neither compiles nor runs C code, and does not certify coding proficiency. Verify actual behavior with GCC."],["각 문제의 starter code를 직접 완성하고 GCC C11로 컴파일 및 실행 결과를 비교하세요. 웹 화면은 C 코드를 실제로 컴파일하지 않습니다.","Complete the starter code for each task, compile it with GCC C11, and compare the output. This browser does not compile C."],["GCC에서 직접 컴파일·실행하고 참조 출력과 비교했습니다 (자기보고).","I compiled and ran the program with GCC and checked its output (self-reported)."],["초안을 이 브라우저에 저장했습니다. 서버로 제출되지 않습니다.","Draft saved in this browser. It has not been submitted to a server."],["GCC 실행 확인을 자기보고로 기록했습니다.","Your self-reported GCC check has been saved."],["GCC 확인 기록을 해제했습니다.","The self-reported GCC check has been cleared."],["정적 구문 단서가 확인되었습니다. GCC 실행 검증은 별도로 필요합니다.","Static syntax hints passed. GCC execution must still be verified separately."],["검토가 필요한 구문이 있습니다. (실제 컴파일 판정 아님)","Some patterns need review. This is not a compiler verdict."],["현재 과제의 초안을 Starter Code로 복원할까요?","Restore the starter code for this task?"],["이 체크는 자기보고입니다. 이 브라우저는 GCC를 실행하지 않으며, 제출된 C 코드의 정답을 자동 인증하지 않습니다.","This is a self-reported check. The browser does not run GCC or certify submitted code."],["0 / 3 힌트 펼침 · 먼저 직접 시도해 보세요.","0 / 3 hints shown · Try the task yourself first."],["정적 점검은 구문 누락을 알려주는 힌트이며 컴파일·실행 검증이 아닙니다.","Static checks are syntax hints, not compilation or execution."],["1. 개념 01–05","1. Concepts 01–05"],["2. 응용 06–08","2. Applications 06–08"],["3. P1 파일 쓰기","3. P1 Writing a file"],["4. P2 읽기·평균","4. P2 Reading and averaging"],["5. M1 한 줄 복사","5. M1 Copying one line"],["전체 학습 로드맵과 상세 안내 보기","View complete learning roadmap and guidance"],["학습 본문으로 건너뛰기","Skip to the lesson"],["교재 171 ↗","Textbook 171 ↗"],["개념·응용 8단계","Eight concept and application steps"],["필수 코딩 P1 → P2 → M1","Core coding P1 → P2 → M1"],["선택 심화 P3–P6","Optional extension P3–P6"],["선택 심화 · 더 알아보기","Optional · Learn more"],["학습 활동 기록 초기화","Clear learning activity records"],["답 확인 및 설명","Check answer and explanation"],["학습 중","In progress"],["완료 기준","Completion criterion"],["학습 로드맵 · 3-Phase Learning","Learning roadmap · Three phases"],["예습 · 개념 이해","Before class · Concepts"],["실습 · 실행 흐름 탐색","In class · Explore execution"],["자기평가 · 직접 코딩","After class · Hands-on coding"],["프로그램 종료 시뮬레이션","Program termination simulation"],["실행 중인 변수","Variable in memory"],["외부 저장 데이터 (가상 파일)","Persistent data (simulated file)"],["프로그램이 실행 중입니다.","The program is running."],["파일 열기 모드와 실제 실행 경로","File opening modes and actual control flow"],["r · 읽기","r · Read"],["w · 기존 내용 삭제","w · Truncate existing contents"],["a · 이어쓰기","a · Append"],["lab/ · readings.txt 존재","lab/ · readings.txt exists"],["other/ · 파일 없음","other/ · File does not exist"],["fopen 모드","fopen mode"],["fopen 직후 파일 상태를 예측하세요","Predict the file state immediately after fopen"],["기존 내용 그대로, 읽기 준비","Contents unchanged, ready to read"],["파일 내용이 비워짐","File contents truncated"],["기존 내용 유지, 끝에서 쓰기 준비","Contents retained, ready to append"],["fopen 실패 → NULL","fopen failed → NULL"],["새 빈 파일을 생성하여 쓰기 준비","New empty file created, ready to write"],["예측한 이유 (권장: 한 문장 이상)","Explain your prediction (at least one sentence)"],["예측 제출 → 실험 활성화","Submit prediction → Enable experiment"]])dict.set(ko,en);
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
