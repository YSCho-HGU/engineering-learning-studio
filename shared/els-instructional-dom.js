/* State-preserving localization of visible authored instructional text.
 * Keep code, math, numeric controls, plots and learning data untouched.
 * Only translate verified bilingual pairs and explicit authored translations.
 */
(function(window,document){
"use strict";
if(window.ELSInstructionalDOM)return;
const language=window.ELSLanguage;
if(!language)return;
const translations={
 "생각해 보기": "Think about it",
 "정답 및 설명 보기": "Show answer and explanation",
 "학습 주제": "Learning experiments",
 "단계별 이해": "Guided explanation",
 "스스로 확인": "Check yourself",
 "학습 확인": "Mark lab reviewed",
 "해설 보기": "Show answer",
 "핵심 관계식": "Key relation",
 "학습 배경": "Learning background",
 "먼저 예측해 보세요": "Predict first",
 "x(t)를 좌우 반전하면 어느 부분이 유지되고 어느 부분이 부호가 바뀔까요?": "When x(t) is time-reversed, which parts stay unchanged and which parts reverse sign?",
 "— x(t)를 좌우 반전하면 어느 부분이 유지되고 어느 부분이 부호가 바뀔까요?": "— When x(t) is time-reversed, which parts stay unchanged and which reverse sign?",
 "n=3일 때 유효 k를 직접 나열하고 곱을 더해 보세요.": "For n=3, list the valid k indices and add their products.",
 "각 신호의 시작과 끝 인덱스를 먼저 적습니다.": "First identify the starting and ending index of each signal.",
 "펄스의 The width is A=2 s, B=1.5 s.": "The pulse widths are A=2 s and B=1.5 s.",
 "A=2, B=1.5 to y(t)의 최대값은 얼마인가요?": "For A=2 and B=1.5, what is the maximum value of y(t)?",
 "M=5개의 계수가 모두 동일한 크기를 갖습니다.": "All M=5 coefficients have equal magnitude.",
 "M=5일 때 입력이 일정한 2라면 정상상태 출력은 얼마인가요?": "When M=5 and the input is a constant 2, what is the steady-state output?",
 "현재 선택: Causal / 인과적. h[n]의 음의 인덱스 막대를 확인하세요.": "Current selection: causal. Inspect h[n] at negative indices.",
 "T=7, τ=2 to a₀를 예측한 값과 화면의 DC 값을 비교해 보세요.": "For T=7 and τ=2, compare your predicted a₀ with the displayed DC value.",
 "한 주기에 1이 연속 4개이고 나머지는 0인 주기 수열.": "A periodic sequence with four consecutive ones and zeros elsewhere in each period.",
 "N=8이고 L=4일 때 a₀의 값과 aₖ의 주기를 그래프 to 확인하세요.": "For N=8 and L=4, use the graph to identify a₀ and the period of aₖ.",
 "T=4 to Δω=1.57 rad/s. T를 두 배로 키우면 무엇이 절반이 될까요?": "For T=4, Δω=1.57 rad/s. What becomes half as large when T doubles?",
 "τ=0.8 s일 때 차단 각주파수 ωc=1.25 rad/s를 확인해 보세요.": "For τ=0.8 s, verify that the cutoff angular frequency is ωc=1.25 rad/s.",
 ". / 양의": ". Positive",
 "에서 누적 적분은 유한한 값에 접근합니다.": "the cumulative integral approaches a finite value.",
 "인과 신호이므로": "Because the signal is causal,",
 ". / 인과 신호입니다.": ". It is a causal signal.",
 "를 두 배로 하면 차단 각주파수는 절반입니다.": "doubling it halves the cutoff angular frequency.",
 "CT의 t는 초 단위. 위쪽 그래프에서는 항상 0–200 ms를 보여줍니다.": "Continuous-time t is measured in seconds. The upper graph always spans 0–200 ms.",
 "지수 수열은": "The exponential sequence",
 "≥0에서만 존재합니다.": "exists only for indices ≥0.",
 "이므로 이 단일 톤에 대한 이상적 복원 조건을 만족합니다. 실제 입력의 대역제한과 anti-aliasing filter가 별도로 필요합니다.": "thus satisfying the ideal reconstruction condition for this single tone. Actual signals also require bandlimiting and an anti-aliasing filter.",
 "a를 1보다 작게/크게 바꾸면 시간수열과 ROC는 어떻게 변할까요? 단위원이 ROC 안에 있는 경우는 언제일까요?": "How do the time sequence and ROC change when a moves below or above 1? When does the ROC include the unit circle?",
 "같은": "the same",
 "와 pole": "and poles",
 "라도 바깥쪽 ROC는 인과적": "an exterior ROC corresponds to a causal sequence",
 ", 안쪽 ROC는 비인과적": ", whereas an interior ROC corresponds to an anticausal sequence",
 "을 뜻합니다. 여기서는": "in this example. Here,",
 "로 고정하고 오른쪽 또는 왼쪽 수열을 먼저 선택합니다. 그 수열의 합 범위, 기하급수 전개,": "is held fixed while you select the right- or left-sided sequence. Examine the summation limits and geometric-series expansion,",
 "와 ROC가 어떻게 도출되는지 오른쪽에서 비교하세요.": "and compare how the ROC is derived on the right.",
 "를 갖는 두 임펄스응답이 왜 서로 다른 n 영역에 나타날까요? 각 수열의 합 범위는 무엇인가요? 왜 서로 다른 수열로부터 동일한": "why do two impulse responses with the same transform expression occupy different ranges of n? What are their summation limits? Why do they yield the same",
 "가 나오지만 ROC는 다른가요?": "but different ROCs?",
 "에서 ROC를 외부·고리형·내부로 바꿀 때 두 항의 우측/좌측 방향은 어떻게 바뀔까요? 최종": "when the ROC changes between exterior, annular, and interior regions, how do the two components change sidedness? Predict the final",
 "의 부호도 예측하세요.": "sign as well.",
 "a가 커질수록": "As a increases,",
 "의 감소 속도와 고주파 응답은 어떻게 변할까요?": "how do the decay rate and high-frequency response change?",
 "이고": "and",
 "라면 네 표본의 평균이 왜 0이 될까요? 시간 파형의 출력,": "why is the average of four samples zero? How do the output waveform,",
 "notch, 단위원 zero가 어떻게 연결될까요?": "notch, and unit-circle zero relate?",
 "과": "and",
 "와": "and",
 "각각에서 causal/anti-causal 중 어떤 쪽의": "in each case, which causal or anticausal",
 "이 유한한 값으로 수렴할까요? M을 늘리면서 확인하세요.": "converges to a finite value? Increase M to investigate.",
 "에서 실제 환경 값이 변하도록 구성한 모의 센서 데이터를 사용합니다.": "uses simulated sensor data whose environmental values change over time.",
 "의 계단응답과 고주파 억제 성능을 비교하면 어떤 차이가 나타날까요?": "how do their step responses and high-frequency attenuation differ?",
 "=0이고 같은 지점": "=0 and the same point",
 "는 Z-plane의 zero입니다. 본 실험의 입력 정현파는 모든 정수 n에서 존재하므로 정상상태 응답을 봅니다.": "is a zero in the z-plane. The sinusoidal input exists at every integer n, so we observe the steady-state response."
};
const originals=new WeakMap(),observed=new WeakMap(),korean=/[가-힣]/;
let running=false;
function localize(value,mode){
 const trimmed=value.trim();
 if(!trimmed||!korean.test(trimmed))return value;
 const index=value.indexOf(trimmed),before=value.slice(0,index),after=value.slice(index+trimmed.length);
 const exact=translations[trimmed];
 if(exact)return before+(mode==="en"?exact:mode==="ko"?trimmed:exact+"\n"+trimmed)+after;
 // Authored English/Korean pairs are deliberately separated by slash or middle dot.
 // Keep the whole English half, including its mathematical symbols.
 const pair=trimmed.match(/^([\s\S]*[A-Za-z][\s\S]*?)\s+(?:\/|·)\s+([가-힣][\s\S]*)$/);
 if(pair){
  const en=pair[1].trim(),ko=pair[2].trim();
  return before+(mode==="en"?en:mode==="ko"?ko:en+"\n"+ko)+after;
 }
 if(mode==="en"){
  // Prefer the existing authored SS translation corpus, never guess a translation.
  const converted=window.SSContentModel?.text?.(trimmed,"en");
  if(typeof converted==="string"&&!korean.test(converted))return before+converted+after;
 }
 return value;
}
function syncDoc(doc){
 if(!doc?.body)return;
 let observer=observed.get(doc);
 if(observer)observer.disconnect();
 const walker=doc.createTreeWalker(doc.body,doc.defaultView.NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  const parent=node.parentElement;
  if(!parent||parent.closest('script,style,pre,code,textarea,svg,canvas,math,.katex,[contenteditable]'))continue;
  const present=node.nodeValue;
  let record=originals.get(node);
  if(!record){record={source:present,rendered:present};originals.set(node,record)}
  else if(present!==record.source&&present!==record.rendered)record.source=present;
  const translated=localize(record.source,language.get());
  record.rendered=translated;
  if(present!==translated)node.nodeValue=translated;
 }
 if(!observer){
  observer=new doc.defaultView.MutationObserver(()=>queueMicrotask(refresh));
  observed.set(doc,observer);
 }
 observer.observe(doc.body,{subtree:true,childList:true,characterData:true});
}
function refresh(){
 if(running)return;
 running=true;
 try{
  syncDoc(document);
  for(const iframe of document.querySelectorAll('iframe')){
   try{if(iframe.contentDocument?.body)syncDoc(iframe.contentDocument)}catch(e){}
  }
 }finally{running=false}
}
function init(){
 language.subscribe(refresh,true);
 const watcher=new MutationObserver(()=>queueMicrotask(refresh));
 watcher.observe(document.body,{childList:true,subtree:true});
 document.addEventListener('load',event=>{if(event.target?.tagName==='IFRAME')refresh()},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.ELSInstructionalDOM=Object.freeze({version:'2.0.0',refresh});
})(window,document);
