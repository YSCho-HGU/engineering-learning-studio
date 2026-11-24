(()=>{
"use strict";
const en=window.ELS211Translations,ko={"Try it!":"직접 체험","My results":"측정 결과","Start":"시작","Reset records":"기록 초기화","Add a course":"과목 추가","Add course":"과목 추가","Load sample":"예제 불러오기","Clear all":"전체 삭제","My GPA":"내 GPA","Course":"과목","Credits":"학점","Grade":"평점","Input & control":"입력 및 조절","Load array":"배열 적용","Random":"임의 배열","Reset trace":"추적 초기화","← Previous":"← 이전","Step →":"단계 실행 →","Play":"재생","Pause":"일시 정지","Observe the array":"배열 관찰","Signal parameters":"신호 매개변수","Waveform":"파형","Amplitude A":"진폭 A","Frequency f":"주파수 f","Phase φ":"위상 φ","Reset":"초기화","Download CSV":"CSV 다운로드","My tasks":"내 할 일","Add task":"할 일 추가","Clear completed":"완료 항목 삭제","My progress":"내 진행률","Filter":"필터","All tasks":"모든 할 일","To do":"미완료","Completed":"완료","Threshold":"임계값","Analyze":"분석","Generate 20 samples":"샘플 20개 생성","Sensor results":"센서 분석 결과","CSV input":"CSV 입력","Trials":"측정 횟수","Latest":"최근 값","Best":"최고 기록","Mean":"평균","Courses":"과목 수","Comparisons":"비교 횟수","Swaps":"교환 횟수","Step":"단계","Amplitude":"진폭","Frequency":"주파수","Period (parameter)":"주기 (매개변수)","Tasks":"할 일","Done":"완료","Progress":"진행률","Records":"레코드 수","Min":"최소","Max":"최대","Alerts":"경고","Delete":"삭제","Initial array":"초기 배열","Sorted":"정렬 완료","← Project Gallery":"← 프로젝트 갤러리"},lang=window.ELSLanguage;
const nodes=new WeakMap(),attrs=new WeakMap();
function translate(raw,mode){
 const trimmed=raw.trim();if(!trimmed)return raw;
 let english=en[trimmed],korean=ko[trimmed];
 if(!english&&/[가-힣]/.test(trimmed)){
  const row=trimmed.match(/^(\d+)번째 줄: 유효한 숫자 두 개가 필요합니다\.$/);
  const sig=trimmed.match(/^1초 동안 ([\d.]+)주기의 위상 변화가 있습니다\. (.+)$/);
  if(row)english="Row "+row[1]+": two valid numbers are required.";
  else if(sig)english="There are "+sig[1]+" cycles of phase change in one second. "+(sig[2].startsWith("A=0")?"With A=0 the signal is constant zero and has no unique fundamental period.":"Increasing frequency gives more cycles in the same time.");
  else if(trimmed.endsWith(" 삭제"))english=trimmed.slice(0,-3)+" Delete";
  else if(trimmed.endsWith(" 완료"))english=trimmed.slice(0,-3)+" Complete";
 }
 const val=english?(mode==="en"?english:mode==="ko"?trimmed:english+" · "+trimmed):korean?(mode==="ko"?korean:mode==="mixed"?trimmed+" · "+korean:trimmed):trimmed;
 return raw.slice(0,raw.indexOf(trimmed))+val+raw.slice(raw.indexOf(trimmed)+trimmed.length);
}
function visit(n){
 if(n.nodeType===3){if(!n.parentElement||n.parentElement.closest("script,style,pre,textarea,input,option,#project-lang,#theme,#rows td:not(:last-child),#list .taskrow span"))return;let old=nodes.get(n),raw=old&&old.rendered===n.data?old.raw:n.data;const v=translate(raw,lang.get());nodes.set(n,{raw,rendered:v});if(n.data!==v)n.data=v;return}
 if(n.nodeType!==1||n.closest("script,style,pre,textarea"))return;
 for(const a of ["aria-label","placeholder"]){if(!n.hasAttribute(a))continue;const current=n.getAttribute(a),key=attrs.get(n)||{};let raw=key[a]?.rendered===current?key[a].raw:current;const v=translate(raw,lang.get());key[a]={raw,rendered:v};attrs.set(n,key);if(current!==v)n.setAttribute(a,v)}
 for(const c of n.childNodes)visit(c);
}
window.ELS211ProjectLanguage={start(){lang.bindSelect("#project-lang");const root=document.body;const refresh=()=>visit(root);lang.subscribe(refresh,true);const observer=new MutationObserver(records=>{for(const r of records){if(r.type==="characterData")visit(r.target);else for(const n of r.addedNodes)visit(n)}});observer.observe(root,{childList:true,subtree:true,characterData:true})}};
})();