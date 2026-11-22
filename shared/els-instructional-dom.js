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
Object.assign(translations,{
 "=1/(s+1.10), the pole is s=-1.10. 오른쪽 ROC이므로 t≥0의 인과적 감쇠 신호를 나타냅니다. The ROC determines time sidedness and convergence.": "=1/(s+1.10), the pole is s=-1.10. The right-sided ROC gives a causal decaying signal for t≥0. The ROC determines time sidedness and convergence.",
 "CHECK YOUR UNDERSTANDING / 개념 확인 — Derive the transform using support → integration → convergence, not memorization.": "CHECK YOUR UNDERSTANDING — Derive the transform from support to integration to convergence, rather than memorizing it.",
 "CHECK YOUR UNDERSTANDING / 개념 확인 — Use ROC to assign each partial-fraction term to its time direction.": "CHECK YOUR UNDERSTANDING — Use the ROC to determine the time direction of each partial-fraction term.",
 "=(e^(−t)−e^(−4t))/3 for t≥0. 두 항의 시작값이 상쇄되어 x(0)=0이며 t<0에서는 0. The pole locations remain the same, but the ROC changes the time-domain signal. 허수축이 ROC에 포함되어 ordinary CTFT도 존재합니다.": "=(e^(−t)−e^(−4t))/3 for t≥0. The two initial terms cancel, so x(0)=0; the signal is zero for t<0. The poles are unchanged, but the ROC changes the time-domain signal. Because the ROC includes the imaginary axis, its ordinary CTFT also exists.",
 "인과 시스템의 모든 활성 pole이 왼쪽 반평면에 있으므로 BIBO 안정. pole의 실수부가 감쇠/증가를 결정하며 zero는 잔여계수와 주파수 응답의 모양에 영향을 줍니다.": "The causal system is BIBO stable because all active poles lie in the open left half-plane. Pole real parts control decay or growth, while zeros affect residues and the frequency-response shape.",
 "CHECK YOUR UNDERSTANDING / 개념 확인 — Pole real parts control decay; imaginary parts control oscillation.": "CHECK YOUR UNDERSTANDING — Pole real parts control decay; imaginary parts control oscillation.",
 "during 4.00 seconds. Nearest bin k=17, f=4.250 Hz. ⚠ 비정수 주기, FFT bin과 불일치 → leakage.": "during 4.00 seconds. Nearest bin k=17, f=4.250 Hz. ⚠ A noninteger number of cycles does not align with an FFT bin, causing spectral leakage.",
 "Ideal bandlimited reconstruction is theoretically possible. 중앙 t=0.037 s to 유한합 오차 ≈ 0.0004. Distinguish ideal infinite-sum conditions from finite numerical approximation.": "Ideal bandlimited reconstruction is theoretically possible. At the center t=0.037 s, the finite-sum error is approximately 0.0004. Distinguish ideal infinite-sum conditions from finite numerical approximation.",
 ". Convergence restricts which complex z are allowed; this set is the ROC. 감쇠와 발산, 그리고 단위원의 포함 여부를 먼저 연결해 보세요.": ". Convergence restricts which complex z values are allowed; this set is the ROC. First connect decay, divergence, and whether the unit circle belongs to the ROC.",
 "; the causal sequence is absolutely summable. 같은 대수식이라도 ROC가 필요합니다.": "; the causal sequence is absolutely summable. Even the same algebraic expression requires an ROC to specify the sequence.",
 ". Its ROC is essential. 같은 대수식": ". Its ROC is essential. The same algebraic expression",
 ". Moving the pole toward +1 makes the impulse-response tail longer and changes the unit-circle frequency response. Pole 위치는 시간적 기억과 주파수 선택성에 동시에 영향을 줍니다.": ". Moving the pole toward +1 makes the impulse-response tail longer and changes the unit-circle frequency response. Pole location influences both time-domain memory and frequency selectivity.",
 ". For a sinusoidal input, averaging N delayed phasors may cancel exactly. 이때": ". For a sinusoidal input, averaging N delayed phasors may cancel exactly. In that case,",
 "show how that series behaves as M grows. 우측수열과 좌측수열의 수렴 조건을 pole 및 ROC와 연결합니다.": "show how the series behaves as M grows. Relate the convergence conditions for right-sided and left-sided sequences to poles and the ROC.",
 "term is an actual one-sample state delay. a controls both noise reduction and response delay. 실습에서는": "term is an actual one-sample state delay. Parameter a controls both noise reduction and response delay. In this lab,"
});
Object.assign(translations,{
 "Two-sided sequences add a right-sided contribution and a left-sided contribution. Each component has its own convergence region, so the result converges where the regions overlap. 합의 Z-transform에서 pole·zero와 실제 ROC를 구분합니다.": "Two-sided sequences add right-sided and left-sided contributions. Each component has its own convergence region, so their sum converges in the overlap. Distinguish the poles and zeros of the resulting Z-transform from its actual ROC.",
 "Inverse Z-transform is an actual calculation: factor the denominator, determine the partial-fraction coefficients, and then use the given ROC to choose each term’s time direction. 두 pole a<b인 X(z)=1/[(1−az⁻¹)(1−bz⁻¹)]을 사용합니다. 주어진 2차 유리식의 역변환은 먼저 X(z)를 1차 분모를 가진 항들의 합으로 분해한 뒤, 각 1차항에 Z-transform pair와 ROC를 적용해 시간수열을 복원합니다. 계수는 암기할 필요가 없습니다. 1=A(1−bz⁻¹)+B(1−az⁻¹)로 통분하고 상수항과 z⁻¹항의 계수를 비교하여 A+B=1, bA+aB=0을 얻습니다. 이어서 B=1−A를 대입하면 (b−a)A=−a이므로 A=−a/(b−a), B=b/(b−a)입니다.": "Inverse Z-transform requires calculation rather than memorization. For X(z)=1/[(1−az⁻¹)(1−bz⁻¹)] with two poles a<b, factor the denominator and use partial fractions, then apply the appropriate Z-transform pair and ROC to each term. Multiply through by the common denominator: 1=A(1−bz⁻¹)+B(1−az⁻¹). Matching the constant and z⁻¹ coefficients gives A+B=1 and bA+aB=0. Substituting B=1−A gives (b−a)A=−a, hence A=−a/(b−a) and B=b/(b−a). Use the ROC to choose each contribution's time direction."
});
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
