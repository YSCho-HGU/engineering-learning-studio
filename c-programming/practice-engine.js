/* Standalone Pointer/Structure coding practice. Syntax hints != C compiler. */
(()=>{
"use strict";
const d=window.C_JOURNEY,root=document.getElementById("practice-root");
if(!d||!root)return;
const practiceVersion=Number.isInteger(d.practiceRevision)?d.practiceRevision:1;
const K="els-code-"+d.slug+"-v"+practiceVersion,E="els-code-evidence-"+d.slug+"-v"+practiceVersion;
const optionalPractice=Number.isInteger(d.practiceCoreCount)&&d.practiceCoreCount>=0&&d.practiceCoreCount<d.practice.length;
const corePracticeCount=Number.isInteger(d.practiceCoreCount)?d.practiceCoreCount:d.practice.length;
const ui=(ko,en)=>window.ELSLanguage?.get()==="en"?en:ko;
const practiceLabel=i=>optionalPractice?(i<corePracticeCount?ui("[필수] ","[Core] "):ui("[선택 심화] ","[Optional] ")):"";
const taskHeading=i=>"P"+(i+1)+" · "+practiceLabel(i)+d.practice[i].title;
let selection=0;
const get=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch(e){return fallback}};
let drafts=get(K,{}),evidence=get(E,{});
const $=(s)=>document.querySelector(s);
const txt=(tag,cls,host,value)=>{let n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;host.append(n);return n};
function richText(host,value){
 host.replaceChildren();
 for(const part of String(value??"").split(/(`[^`\n]+`)/g)){
  if(!part)continue;
  if(part[0]==="`"&&part.at(-1)==="`"&&part.length>2)txt("code","cp-inline-code",host,part.slice(1,-1));
  else host.append(document.createTextNode(part));
 }
}
const store=()=>{try{localStorage.setItem(K,JSON.stringify(drafts));localStorage.setItem(E,JSON.stringify(evidence))}catch(e){}};
const rulebook={
pointer:[
 ["printf","*p"],["*a","*b","temp"],["sum","for","*"],["out","for","if"],["i","if","printf"],["samples","for","printf"]
],
structure:[
 ["Student","printf"],["Student *","->score"],["Student","for","score"],["Student","for","score"],["Student","b.score","printf"],["fopen","fprintf","fscanf","fclose"]
],
"dynamic-memory":[["malloc","sizeof","free"],["malloc","p[","free"],["free","NULL"],["calloc","free"],["realloc","free"],["Sensor","malloc","free"]]};
rulebook.arrays=[
 ["for","sum","printf"],["max","for","printf"],["f[","for","printf"],
 ["for","printf"],["m[","for","printf"],["double","for","printf"]
];
rulebook.strings=[
 ["char","printf"],["strlen","printf"],["strcmp","printf"],
 ["for","printf"],["fgets","sizeof"],["for","printf"]
];
rulebook["standard-library"]=[
 ["abs","printf"],["sqrt","printf"],["toupper","printf"],
 ["isdigit","printf"],["srand","rand"],["fabs","printf"]
];
rulebook.functions=[
 ["add","return"],["triple","return"],["max2","return"],
 ["positives","for"],["avg","return"],["add","multiply"]
];
rulebook["low-level-c"]=[
 ["READY_MASK","ERROR_MASK","ALARM_MASK","&","printf"],
 ["set_bit","clear_bit","toggle_bit","<<"],
 ["enum State","switch","RUNNING","ERROR_STATE"],
 ["status.h","status_decode","printf"],
 ["static int","next_id","printf"],
 ["argc","argv","fopen","fscanf","fclose"]
];
const rules=rulebook[d.slug]||[];
function assess(code,idx){
 const findings=[];
 if(d.slug==="dynamic-memory"&&idx<3){
  const tests=[
   [
    [code.includes("malloc("),"동적 배열 공간: malloc(...) 호출을 작성하세요."],
    [/sizeof\s*(?:\*\s*a|\(\s*int\s*\))/.test(code),"n개 int 공간은 n * sizeof *a와 같이 계산하세요."],
    [/if\s*\(\s*(?:a\s*==\s*NULL|!a)\s*\)/.test(code),"할당 실패 검사: if (a == NULL) ..."],
    [/\bfor\s*\(/.test(code)&&/a\s*\[/.test(code),"반복문에서 각 원소를 초기화하세요."],
    [/\bfree\s*\(\s*a\s*\)/.test(code),"사용한 배열에 free(a)를 호출하세요."]
   ],
   [
    [code.includes("malloc("),"동적 배열을 malloc으로 생성하세요."],
    [/if\s*\(\s*(?:p\s*==\s*NULL|!p)\s*\)/.test(code),"p의 NULL 여부를 검사하세요."],
    [/p\s*\[\s*[0-3]\s*\]\s*=/.test(code),"p[0]부터 p[3]까지 값을 저장하세요."],
    [/\*\s*\(\s*p\s*\+\s*3\s*\)/.test(code),"*(p+3)으로 네 번째 원소를 읽으세요."],
    [/\bfree\s*\(\s*p\s*\)/.test(code),"free(p)로 메모리를 반납하세요."]
   ],
   [
    [/printf\s*\(/.test(code),"메모리를 해제하기 전에 값을 출력하세요."],
    [/\bfree\s*\(\s*p\s*\)/.test(code),"free(p)를 정확히 한 번 작성하세요."],
    [/p\s*=\s*NULL\s*;/.test(code),"free 이후 p = NULL;을 추가하세요."],
    [code.indexOf("printf(")<code.indexOf("free("),"printf로 값을 읽은 후 free를 호출하세요."]
   ]
  ];
  const add=(pass,desc)=>findings.push({pass,desc});
  add(/#include\s*<stdlib\.h>/.test(code),"stdlib.h 헤더 포함");
  add(/\bint\s+main\s*\(\s*void\s*\)/.test(code),"int main(void)");
  add(!/\/\*\s*TODO|\/\/\s*TODO/.test(code),"남은 TODO를 완성하세요.");
  for(const [pass,desc] of tests[idx])add(pass,desc);
  return {findings,ok:findings.every(x=>x.pass)};
 }
 const add=(pass,desc)=>findings.push({pass,desc});
 add(code.includes("#include <stdio.h>"),"stdio.h 헤더");
 if(d.slug==="low-level-c"&&idx===5)
  add(/\bint\s+main\s*\(\s*int\s+argc\s*,\s*char\s*\*\s*argv\s*\[\s*\]\s*\)/.test(code),"int main(int argc, char *argv[])");
 else add(/\bint\s+main\s*\(\s*void\s*\)/.test(code),"int main(void)");
 add(!/\/\*\s*TODO|\/\/\s*TODO/.test(code),"미완성 TODO 없음");
 let bal=0,min=0;for(const ch of code){if(ch==="{")bal++;if(ch==="}")bal--;min=Math.min(min,bal)}
 add(bal===0&&min>=0,"중괄호 균형 (단순 검사)");
 for(const token of (rules[idx]||[]))add(code.includes(token),"기본 구문 확인: "+token);
 const hasAnyError=findings.some(x=>!x.pass);
 return {findings,ok:!hasAnyError};
}
root.innerHTML="";
const shell=txt("div","cp-layout",root);
const sidebar=txt("nav","cp-menu",shell);sidebar.setAttribute("aria-label","Coding practice P1 to P"+d.practice.length);
const content=txt("section","cp-content",shell);
txt("div","cp-eyebrow",content,optionalPractice?corePracticeCount+" Core / "+(d.practice.length-corePracticeCount)+" Optional Coding Challenges":"AFTER CLASS · CODING CHALLENGES");
const title=txt("h2","",content,"");
const description=txt("p","cp-description",content,"");
const guides=window.C_PRACTICE_GUIDES?.[d.slug]||[];
const guideSection=txt("section","cp-guided-lab",content);
const scenarioTitle=txt("h3","cp-guided-lab-heading",guideSection,ui("문제 상황 · 무엇을 만들까요?","Scenario · What are you building?"));
const scenario=txt("p","cp-guided-lab-scenario",guideSection,"");
const stepsTitle=txt("h3","cp-guided-steps-heading",guideSection,ui("코드 작성 순서 · 단계별 가이드","Writing the Code · Step by Step"));
const stepList=txt("ol","cp-guided-step-list",guideSection);
const checkTitle=txt("h3","cp-guided-check-heading",guideSection,ui("실행 결과 확인","Verify Your Result"));
const checkText=txt("p","cp-guided-check",guideSection,"");
function renderTaskGuide(i){
 const lang=window.ELSLanguage?.get()==="en"?"en":"ko";
 const guide=guides[i]?.[lang];
 const isCore=i<corePracticeCount;
 guideSection.hidden=!isCore||!guide;
 if(!isCore||!guide)return;
 scenario.textContent=guide.scene;
 stepList.replaceChildren();
 guide.steps.forEach((step,k)=>{
  const li=txt("li","cp-guided-step",stepList);
  const reveal=txt("button","cp-guided-reveal",li,ui("단계 ","Step ")+(k+1)+ui(" · 힌트 보기"," · Show hint"));
  reveal.type="button";reveal.setAttribute("aria-expanded","false");
  const help=txt("p","cp-guided-hint",li,step);
  help.hidden=true;
  reveal.addEventListener("click",()=>{
   help.hidden=!help.hidden;
   reveal.setAttribute("aria-expanded",String(!help.hidden));
   reveal.textContent=ui("단계 ","Step ")+(k+1)+(help.hidden?ui(" · 힌트 보기"," · Show hint"):ui(" · 힌트 닫기"," · Hide hint"));
  });
 });
 checkText.textContent=guide.check;
}

const inputs=txt("div","cp-reference",content);
const refLabel=txt("strong","",inputs,"참조 결과 · 예상 출력 (실제 컴파일 결과 아님)");
const expected=txt("pre","",inputs,"");
const label=txt("label","cp-editor-label",content,"C Source Editor · 직접 코드 작성");
const editor=txt("textarea","cp-editor",content);
editor.spellcheck=false;editor.setAttribute("aria-label","C source code editor");
label.htmlFor="cp-editor";editor.id="cp-editor";
const actions=txt("div","cp-actions",content);
const check=txt("button","cp-button cp-primary",actions,"코드 점검 · 정적 힌트");
const save=txt("button","cp-button",actions,"초안 저장");
const download=txt("button","cp-button",actions,".c 다운로드");
const reset=txt("button","cp-button",actions,"Starter Code 복원");
const status=txt("div","cp-feedback",content,"정적 검사는 컴파일이나 실제 실행을 대신하지 않습니다.");status.setAttribute("role","status");
const proof=txt("div","cp-proof",content);
const verified=txt("input","",proof);verified.type="checkbox";verified.id="cp-verified";
const verificationLabel=txt("label","",proof,"GCC에서 직접 컴파일·실행하고 참조 출력과 비교했습니다 (자기보고).");
verificationLabel.htmlFor="cp-verified";
const more=txt("details","cp-hint",content);
txt("summary","",more,"GCC 실행 방법 및 검증 절차");
txt("p","",more,"① .c 파일을 다운로드하세요. ② gcc -std=c11 -Wall -Wextra -Wpedantic -Werror task.c -o task"+(d.slug==="standard-library"?" -lm":"")+" ③ 실행 후 참조 출력과 대조하세요. 데이터 파일이 필요한 과제는 같은 폴더에 준비하세요.");
const navButtons=[];
function show(i){
 selection=i;const task=d.practice[i];title.textContent=taskHeading(i);richText(description,task.task);expected.textContent=task.expected;renderTaskGuide(i);
 editor.value=Object.prototype.hasOwnProperty.call(drafts,i)?drafts[i]:task.starter;verified.checked=!!evidence[i];
 status.textContent="정적 점검은 구문 누락을 알려주는 힌트이며 컴파일·실행 검증이 아닙니다.";
 status.dataset.kind="idle";
 navButtons.forEach((b,j)=>{b.classList.toggle("active",i===j);if(i===j)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
}
function persistDraft(){drafts[selection]=editor.value;store()}
d.practice.forEach((task,i)=>{
 const b=txt("button","cp-nav-item",sidebar,taskHeading(i));b.type="button";b.addEventListener("click",()=>{persistDraft();show(i)});navButtons.push(b);
});
editor.addEventListener("input",()=>{drafts[selection]=editor.value;store();if(evidence[selection]){delete evidence[selection];verified.checked=false;store()}});
check.addEventListener("click",()=>{persistDraft();status.dataset.kind="check";const result=assess(editor.value,selection);status.textContent=(result.ok?"정적 구문 단서가 확인되었습니다. GCC 실행 검증은 별도로 필요합니다.":"검토가 필요한 구문이 있습니다. (실제 컴파일 판정 아님)")+"\n"+result.findings.map(x=>(x.pass?"✓ ":"△ ")+x.desc).join("\n")});
save.addEventListener("click",()=>{persistDraft();status.dataset.kind="saved";status.textContent="초안을 이 브라우저에 저장했습니다. 서버로 제출되지 않습니다."});
verified.addEventListener("change",()=>{status.dataset.kind="verification";if(verified.checked)evidence[selection]={checked:true,at:new Date().toISOString()};else delete evidence[selection];persistDraft();store();status.textContent=verified.checked?"GCC 실행 확인을 자기보고로 기록했습니다.": "GCC 확인 기록을 해제했습니다."});
reset.addEventListener("click",()=>{if(!confirm("현재 과제의 초안을 Starter Code로 복원할까요?"))return;delete drafts[selection];delete evidence[selection];store();show(selection)});
download.addEventListener("click",()=>{
 persistDraft();const file=new Blob([editor.value],{type:"text/x-c;charset=utf-8"}),url=URL.createObjectURL(file),a=document.createElement("a");
 a.href=url;a.download=d.slug+"_p"+(selection+1)+".c";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
});
const hashTask=()=>{const match=/^#p(\d+)$/i.exec(location.hash);return match?Math.max(0,Math.min(d.practice.length-1,Number(match[1])-1)):0};
show(hashTask());
window.addEventListener("hashchange",()=>show(hashTask()));
// The content model has already been re-projected by c-programming/language.js.
// Repaint the same challenge, retaining the editor, saved draft and verification.
document.addEventListener("c-language-content-change",()=>{
 const oldScroll={x:window.scrollX,y:window.scrollY};
 const editing=document.activeElement===editor,from=editor.selectionStart,to=editor.selectionEnd;
 const hints=[...guideSection.querySelectorAll(".cp-guided-hint")].map(node=>!node.hidden);
 const expanded=more.open;
 const feedbackKind=status.dataset.kind||"idle";
 persistDraft();
 navButtons.forEach((button,i)=>{button.textContent=taskHeading(i)});
 scenarioTitle.textContent=ui("문제 상황 · 무엇을 만들까요?","Scenario · What are you building?");
 stepsTitle.textContent=ui("코드 작성 순서 · 단계별 가이드","Writing the Code · Step by Step");
 checkTitle.textContent=ui("실행 결과 확인","Verify Your Result");
 show(selection);
 if(feedbackKind==="check")check.click();
 else if(feedbackKind==="saved"){
  status.dataset.kind="saved";status.textContent=ui("초안을 이 브라우저에 저장했습니다. 서버로 제출되지 않습니다.","Draft saved in this browser. It has not been submitted to a server.");
 }else if(feedbackKind==="verification"){
  status.dataset.kind="verification";status.textContent=verified.checked?
   ui("GCC 실행 확인을 자기보고로 기록했습니다.","Your self-reported GCC check has been saved."):
   ui("GCC 확인 기록을 해제했습니다.","The self-reported GCC check has been cleared.");
 }
 more.open=expanded;
 [...guideSection.querySelectorAll(".cp-guided-hint")].forEach((hint,i)=>{
  if(!hints[i])return;
  hint.hidden=false;
  const button=hint.previousElementSibling;
  if(button){button.setAttribute("aria-expanded","true");button.textContent=ui("단계 ","Step ")+(i+1)+ui(" · 힌트 닫기"," · Hide hint")}
 });
 if(editing){editor.focus({preventScroll:true});editor.setSelectionRange(from,to)}
 window.ELSCourseShell?.refreshArrows?.();
 requestAnimationFrame(()=>window.scrollTo(oldScroll.x,oldScroll.y));
});
})();