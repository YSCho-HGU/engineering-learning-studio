/* Standalone Pointer/Structure coding practice. Syntax hints != C compiler. */
(()=>{
"use strict";
const d=window.C_JOURNEY,root=document.getElementById("practice-root");
if(!d||!root)return;
const K="els-code-"+d.slug+"-v1",E="els-code-evidence-"+d.slug+"-v1";
let selection=0;
const get=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch(e){return fallback}};
let drafts=get(K,{}),evidence=get(E,{});
const $=(s)=>document.querySelector(s);
const txt=(tag,cls,host,value)=>{let n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;host.append(n);return n};
const store=()=>{try{localStorage.setItem(K,JSON.stringify(drafts));localStorage.setItem(E,JSON.stringify(evidence))}catch(e){}};
const rulebook={
pointer:[
 ["printf","*p"],["*a","*b","temp"],["sum","for","*"],["out","for","if"],["i","if","printf"],["samples","for","printf"]
],
structure:[
 ["Student","printf"],["Student *","->score"],["Student","for","score"],["Student","for","score"],["Student","=","->"],["fopen","fprintf","fscanf","fclose"]
]};
const rules=rulebook[d.slug]||[];
function assess(code,idx){
 const findings=[];
 const add=(pass,desc)=>findings.push({pass,desc});
 add(code.includes("#include <stdio.h>"),"stdio.h 헤더");
 add(/\bint\s+main\s*\(\s*void\s*\)/.test(code),"int main(void)");
 add(!/\/\*\s*TODO|\/\/\s*TODO/.test(code),"미완성 TODO 없음");
 let bal=0,min=0;for(const ch of code){if(ch==="{")bal++;if(ch==="}")bal--;min=Math.min(min,bal)}
 add(bal===0&&min>=0,"중괄호 균형 (단순 검사)");
 for(const token of (rules[idx]||[]))add(code.includes(token),"기본 구문 확인: "+token);
 const hasAnyError=findings.some(x=>!x.pass);
 return {findings,ok:!hasAnyError};
}
root.innerHTML="";
const shell=txt("div","cp-layout",root);
const sidebar=txt("nav","cp-menu",shell);sidebar.setAttribute("aria-label","Coding practice P1 to P6");
const content=txt("section","cp-content",shell);
txt("div","cp-eyebrow",content,"AFTER CLASS · CODING PRACTICE");
const title=txt("h2","",content,"");
const description=txt("p","cp-description",content,"");
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
txt("p","cp-disclaimer",content,"이 체크는 자기보고입니다. 이 브라우저는 GCC를 실행하지 않으며, 제출된 C 코드의 정답을 자동 인증하지 않습니다.");
const more=txt("details","cp-hint",content);
txt("summary","",more,"GCC 실행 방법 및 검증 절차");
txt("p","",more,"① .c 파일을 다운로드하세요. ② gcc -std=c11 -Wall -Wextra -Wpedantic -Werror task.c -o task ③ 실행 후 참조 출력과 대조하세요. 데이터 파일이 필요한 과제는 같은 폴더에 준비하세요.");
const navButtons=[];
function show(i){
 selection=i;const task=d.practice[i];title.textContent="P"+(i+1)+" · "+task.title;description.textContent=task.task;expected.textContent=task.expected;
 editor.value=Object.prototype.hasOwnProperty.call(drafts,i)?drafts[i]:task.starter;verified.checked=!!evidence[i];
 status.textContent="정적 점검은 구문 누락을 알려주는 힌트이며 컴파일·실행 검증이 아닙니다.";
 navButtons.forEach((b,j)=>{b.classList.toggle("active",i===j);if(i===j)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
}
function persistDraft(){drafts[selection]=editor.value;store()}
d.practice.forEach((task,i)=>{
 const b=txt("button","cp-nav-item",sidebar,"P"+(i+1)+" · "+task.title);b.type="button";b.addEventListener("click",()=>{persistDraft();show(i)});navButtons.push(b);
});
editor.addEventListener("input",()=>{drafts[selection]=editor.value;store();if(evidence[selection]){delete evidence[selection];verified.checked=false;store()}});
check.addEventListener("click",()=>{persistDraft();const result=assess(editor.value,selection);status.textContent=(result.ok?"정적 구문 단서가 확인되었습니다. GCC 실행 검증은 별도로 필요합니다.":"검토가 필요한 구문이 있습니다. (실제 컴파일 판정 아님)")+"\n"+result.findings.map(x=>(x.pass?"✓ ":"△ ")+x.desc).join("\n")});
save.addEventListener("click",()=>{persistDraft();status.textContent="초안을 이 브라우저에 저장했습니다. 서버로 제출되지 않습니다."});
verified.addEventListener("change",()=>{if(verified.checked)evidence[selection]={checked:true,at:new Date().toISOString()};else delete evidence[selection];persistDraft();store();status.textContent=verified.checked?"GCC 실행 확인을 자기보고로 기록했습니다.": "GCC 확인 기록을 해제했습니다."});
reset.addEventListener("click",()=>{if(!confirm("현재 과제의 초안을 Starter Code로 복원할까요?"))return;delete drafts[selection];delete evidence[selection];store();show(selection)});
download.addEventListener("click",()=>{
 persistDraft();const file=new Blob([editor.value],{type:"text/x-c;charset=utf-8"}),url=URL.createObjectURL(file),a=document.createElement("a");
 a.href=url;a.download=d.slug+"_p"+(selection+1)+".c";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
});
show(0);
})();