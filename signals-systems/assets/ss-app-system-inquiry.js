/* Part B connected student journey: predict -> prepared experiments -> evidence -> apply.
 * Presentation-only adapter. Source-of-truth computations remain in the RC/MA/compare cores.
 */
(function(W){
"use strict";
const $=id=>document.getElementById(id),L=W.ELSLanguage;
const tr=(en,ko,compact=false)=>{const m=L?.get?.()||"mixed";return m==="en"?en:m==="ko"?ko:en+(compact?" · ":"\n")+ko};
const fmt=(n,d=3)=>Number.isFinite(n)?String(Number(n.toFixed(d))):"—";
const isComparison=!!$("cmp-main"),native=W.SSSystemLab;
const kind=isComparison?"compare":native?.kind;
if(!["rc","moving-average","compare"].includes(kind))return;
const spec={
 rc:{
  question:["At fixed R and C, which sine wave is attenuated more strongly by an RC low-pass filter?","R과 C가 같을 때 RC 저역통과 필터가 더 많이 감쇠시키는 정현파는 무엇일까요?"],
  choices:[["8 Hz (fast)","8 Hz (빠른 신호)"],["0.4 Hz (slow)","0.4 Hz (느린 신호)"]],answer:0,
  apply:["At the same R and C, which filter passes a fast sine wave more strongly?","R과 C가 같을 때 높은 주파수 정현파를 더 강하게 통과시키는 필터는 무엇일까요?"],
  applyChoices:[["High-pass (HP)","고역통과(HP)"],["Low-pass (LP)","저역통과(LP)"]],applyAnswer:0,
  why:["For a fixed RC, raising frequency lowers the low-pass gain. High-pass and low-pass read output across different elements.","RC를 고정하면 입력 주파수가 높을수록 저역통과 이득은 줄어듭니다. 고역·저역통과는 출력 전압을 측정하는 소자가 다릅니다."],
  next:"applications-system-lab.html?lab=moving-average",
  nextLabel:["Next · Build an FIR from samples","다음 · 표본으로 FIR 필터 만들기"],
  bridge:["The RC circuit smooths continuously. Next, form a digital filter by averaging samples.","RC 회로는 연속시간에서 평활화합니다. 다음에는 표본의 평균으로 디지털 필터를 만듭니다."]
 },
 "moving-average":{
  question:["For the same noise-free step and output index n=55, what happens if M changes from 3 to 21?","동일한 잡음 없는 계단 입력의 n=55 출력에서 M을 3에서 21로 늘리면 어떻게 될까요?"],
  choices:[["The output rises more slowly (more averaging memory)","출력이 더 천천히 올라갑니다(평균의 기억 증가)"],["Both outputs are identical at the edge","경계에서도 두 출력은 같습니다"]],answer:0,
  apply:["For independent white noise, what happens to output noise standard deviation when M increases?","독립 백색잡음에서 평균 길이 M이 증가하면 출력 잡음의 표준편차는 어떻게 될까요?"],
  applyChoices:[["It decreases approximately as 1/√M","대략 1/√M에 비례해 감소합니다"],["It increases approximately as √M","대략 √M에 비례해 증가합니다"]],applyAnswer:0,
  why:["A causal M-tap average uses the current and M−1 past samples. Longer windows smooth independent noise more but spread sharp transitions and increase delay.","인과적 M탭 이동평균은 현재와 과거 M−1개 표본을 사용합니다. M이 커지면 독립 잡음은 더 줄지만 급격한 변화가 퍼지고 지연이 증가합니다."],
  next:"applications-system-compare.html",
  nextLabel:["Next · Compare filters on one input","다음 · 동일 입력으로 두 필터 비교"],
  bridge:["An FIR average also smooths, but creates a different delay. Compare it fairly with RC using the same input and cutoff.","FIR 평균도 신호를 평활하지만 지연 특성이 다릅니다. 다음에는 동일 입력과 차단주파수 조건에서 RC와 비교합니다."]
 },
 compare:{
  question:["If RC and MA have the same −3 dB cutoff, must their delay and noise reduction also be identical?","RC와 이동평균의 −3 dB 차단주파수가 같다면 지연과 잡음 감소도 반드시 같을까요?"],
  choices:[["No; matching cutoff does not force identical response","아니요. 차단주파수가 같아도 응답은 다를 수 있습니다"],["Yes; all frequency and time responses must match","예. 시간·주파수 응답도 반드시 같습니다"]],answer:0,
  apply:["With the same M, how does the moving-average group delay in seconds change when sampling rate fs doubles?","M이 같은 이동평균에서 표본화 주파수 fs가 두 배가 되면 초 단위 군지연은 어떻게 변할까요?"],
  applyChoices:[["It is halved","절반이 됩니다"],["It doubles","두 배가 됩니다"]],applyAnswer:0,
  why:["The matched cutoff is just one magnitude point. Phase and group delay depend on each filter's structure; for MA, τg=(M−1)/(2fs).","같은 차단주파수는 크기 응답의 한 점만 일치한다는 의미입니다. 위상과 군지연은 필터 구조에 따라 달라지며, 이동평균의 군지연은 τg=(M−1)/(2fs)입니다."],
  next:"applications.html#part-c",
  nextLabel:["Continue · Explore FFT and spectral evidence","계속 · FFT와 스펙트럼 실습"],
  bridge:["You compared time and frequency responses of two systems. Next, use FFT to identify frequency components in actual sampled data.","두 시스템의 시간·주파수 응답을 비교했습니다. 다음에는 FFT로 실제 표본 데이터의 주파수 성분을 분석합니다."]
 }
}[kind];
const selected={prediction:"",transfer:"",seen:new Set(),success:false,feedback:""};
function node(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n}
function options(host,label,pairs,value,callback){
 const select=node("select","ss-b-inquiry-choice");
 select.setAttribute("aria-label",tr(...label));
 const blank=node("option","",tr("Choose an answer","답 선택"));blank.value="";select.append(blank);
 pairs.forEach((pair,i)=>{const opt=node("option","",tr(...pair));opt.value=String(i);select.append(opt)});
 select.value=value;select.addEventListener("change",()=>callback(select.value));
 host.append(select);
}
function root(){
 return isComparison?$("cmp-main"):$("ss-sys-root");
}
function feedback(){
 const where=$("ss-b-inquiry-feedback");if(!where)return;
 where.textContent=selected.feedback;where.dataset.status=selected.success?"correct":selected.feedback?"pending":"";
 const link=$("ss-b-inquiry-next");if(link)link.hidden=!selected.success;
}
function render(){
 let host=root();if(!host)return;
 host.querySelector("#ss-b-inquiry")?.remove();
 const section=node("section","ss-b-inquiry");
 section.id="ss-b-inquiry";section.dataset.lab=kind;
 const top=node("div","ss-b-inquiry-kicker",tr("① Predict · Keep other settings fixed","① 예측 · 나머지 조건 고정"));
 section.append(top,node("h3","ss-b-inquiry-question",tr(...spec.question)));
 options(section,["Prediction","예측"],spec.choices,selected.prediction,value=>{selected.prediction=value;selected.success=false;selected.feedback="";feedback()});
 section.append(node("p","ss-b-inquiry-direction",isComparison?
  tr("② Run both prepared investigations: matched cutoff, then step response. The same sampled input feeds both filters in each case.","② 준비된 두 예제(차단주파수 일치 → 계단응답)를 실행하세요. 각 예제에서 두 필터에는 동일한 표본 입력이 적용됩니다."):
  tr("② Use both prepared A/B buttons below; change only the intended variable, then inspect the graphs.","② 아래 준비된 A/B 버튼을 모두 사용해 해당 변수만 바꾸고 그래프를 비교하세요.")));
 const progress=node("p","ss-b-inquiry-progress");progress.id="ss-b-inquiry-progress";section.append(progress);
 const transfer=node("section","ss-b-transfer");transfer.id="ss-b-transfer";
 transfer.append(node("h4","ss-b-inquiry-apply-title",tr("Apply / Check · Transfer your reasoning","응용·확인 · 새로운 조건에도 적용")));
 transfer.append(node("p","ss-b-inquiry-apply-question",tr(...spec.apply)));
 options(transfer,["Transfer check","응용 확인"],spec.applyChoices,selected.transfer,value=>{selected.transfer=value;selected.success=false;selected.feedback="";feedback()});
 const btn=node("button","ss-b-inquiry-check",tr("Check using the observations","관찰 근거로 확인"));btn.type="button";
 btn.addEventListener("click",()=>{
  if(selected.prediction===""||selected.transfer==="")selected.feedback=tr("Choose both answers first.","두 질문의 답을 먼저 선택하세요.");
  else if(selected.seen.size<2)selected.feedback=tr("Run both prepared examples and inspect the plots first.","준비된 두 예제를 모두 실행한 뒤 그래프를 관찰하세요.");
  else if(Number(selected.prediction)!==spec.answer||Number(selected.transfer)!==spec.applyAnswer)
    selected.feedback=tr("Compare the evidence for both cases, then revise the answers.","두 조건의 관찰 근거를 비교한 뒤 답을 다시 선택하세요.");
  else{selected.success=true;selected.feedback=tr("Evidence verified. ","근거를 확인했습니다. ")+tr(...spec.why)}
  feedback();
 });transfer.append(btn);
 const status=node("p","ss-b-inquiry-feedback");status.id="ss-b-inquiry-feedback";status.setAttribute("role","status");status.setAttribute("aria-live","polite");transfer.append(status);
 const link=node("a","ss-b-inquiry-next",tr(...spec.nextLabel));link.id="ss-b-inquiry-next";link.href="./"+spec.next;link.hidden=!selected.success;transfer.append(link);
 const workspace=host.querySelector(isComparison?"#cmp-workspace":"#ss-sys-workspace");
 if(workspace)host.insertBefore(section,workspace);else host.prepend(section);
 const results=host.querySelector(isComparison?".cmp-results":".ss-sys-results");
 results?.querySelector("#ss-b-transfer")?.remove();
 results?.append(transfer);
 updateEvidence();feedback();
}
function model(){
 if(kind==="rc"){
  const p=native.state,c=W.SSSystemCore,{tau,cutoff}=c.rcParameters(p.Rk,p.Cmicro);
  const gain=c.rcFrequency(tau,p.frequency,p.type).mag;
  return {
   en:"f = "+fmt(Number(p.frequency),2)+" Hz · fc = "+fmt(cutoff,2)+" Hz · gain = "+fmt(gain),
   ko:"f = "+fmt(Number(p.frequency),2)+" Hz · 차단주파수 = "+fmt(cutoff,2)+" Hz · 이득 = "+fmt(gain),
   tex:String.raw`f_c=\frac{1}{2\pi RC}=${fmt(cutoff,3)}\,\mathrm{Hz},\quad|H(j2\pi f)|=${fmt(gain)}`, 
   interpretation:tr("For this same circuit, LP and HP measure voltage across different components.","같은 회로에서도 저역통과와 고역통과는 서로 다른 소자의 전압을 출력으로 측정합니다.")
  };
 }
 if(kind==="moving-average"){
  const p=native.state,c=W.SSSystemCore,d=c.averageSimulate(p),sample=c.averageWindow(d.series,d.M,p.index);
  return {
   en:"n = "+sample.index+" · M = "+d.M+" · y[n] = "+fmt(sample.total)+" · delay = "+fmt(d.delay,1)+" samples",
   ko:"n = "+sample.index+" · M = "+d.M+" · y[n] = "+fmt(sample.total)+" · 지연 = "+fmt(d.delay,1)+" 표본",
   tex:String.raw`y[${sample.index}]=\frac1{${d.M}}\sum_{k=0}^{${d.M-1}}x[${sample.index}-k]=${fmt(sample.total)},\quad\tau_g=${fmt(d.delay,1)}\ \mathrm{samples}`, 
   interpretation:tr("The selected FIR output equals the sum of the highlighted input taps divided by M.","선택한 FIR 출력은 음영으로 표시한 입력 표본들의 합을 M으로 나눈 값입니다.")
  };
 }
 const c=W.SSSystemCompareCore;
 const d=c.run({shape:$("cmp-signal").value,fs:Number($("cmp-fs").value),noise:Number($("cmp-noise").value),
  M:Number($("cmp-M").value),tau:Number($("cmp-tau").value),match:$("cmp-match").checked});
 const ms=1000;
 return {
  en:"fc(RC) = "+fmt(d.cutoffRC,2)+" Hz · fc(MA) = "+fmt(d.cutoffMA,2)+" Hz · delay RC/MA = "+fmt(d.groupDelayRC*ms,1)+"/"+fmt(d.groupDelayMA*ms,1)+" ms",
  ko:"RC/MA 차단주파수 = "+fmt(d.cutoffRC,2)+"/"+fmt(d.cutoffMA,2)+" Hz · 군지연 RC/MA = "+fmt(d.groupDelayRC*ms,1)+"/"+fmt(d.groupDelayMA*ms,1)+" ms",
  tex:String.raw`\begin{aligned}\tau_{g,\mathrm{MA}}&=\frac{M-1}{2f_s}=${fmt(d.groupDelayMA*ms,2)}\,\mathrm{ms}\\\tau_{g,\mathrm{RC}}(0)&=${fmt(d.groupDelayRC*ms,2)}\,\mathrm{ms}\end{aligned}`, 
  interpretation:tr("Both filters see one x[n]. Equal −3 dB cutoff does not guarantee equal phase, group delay or noise reduction.","두 필터는 같은 x[n]을 사용합니다. −3 dB 차단주파수가 같아도 위상·군지연·잡음 감소는 같지 않을 수 있습니다.")
 };
}
function updateEvidence(){
 const host=isComparison?$("cmp-main").querySelector(".cmp-results"):$("ss-sys-root").querySelector(".ss-sys-results");
 if(!host)return;
 let card=host.querySelector("#ss-b-evidence");
 if(!card){
  card=node("section","ss-b-evidence");card.id="ss-b-evidence";
  const target=host.querySelector(isComparison?".cmp-insight":".ss-sys-insight");
  if(target)host.insertBefore(card,target);else host.append(card);
 }
 let m;try{m=model()}catch(e){console.warn("Part B learning evidence",e);return}
 const label=tr("③ Observed → ④ Equation check","③ 관찰값 → ④ 수식 검증");
 const key=tr("Current calculated result","현재 계산 결과"),intro=tr("From the same parameters as the plots","그래프와 동일한 설정값에서 계산"),note=tr(...spec.bridge);
 card.replaceChildren(
  node("h3","ss-b-evidence-title",label),
  node("p","ss-b-evidence-label",key),
  node("output","ss-b-evidence-values",tr(m.en,m.ko)),
  node("p","ss-b-evidence-label",tr("Current values in the relation","현재 값을 대입한 관계식")),
  node("div","ss-b-evidence-equation",m.tex),
  node("p","ss-b-evidence-meaning",m.interpretation),
  node("p","ss-b-evidence-bridge",note)
 );
 const math=card.querySelector(".ss-b-evidence-equation");
 if(math&&typeof W.katex?.render==="function"){
  try{W.katex.render(m.tex,math,{displayMode:true,throwOnError:true,strict:"ignore",trust:false,output:"htmlAndMathml"});math.dataset.mathState="rendered"}
  catch(err){math.dataset.mathState="error";math.title=String(err.message||err)}
 }else if(math)math.dataset.mathState="waiting";
 const progress=$("ss-b-inquiry-progress");if(progress)progress.textContent=tr(
  "Prepared examples observed: "+selected.seen.size+" / 2",
  "준비된 예제 관찰: "+selected.seen.size+" / 2");
}
let scheduled=false;
function queue(){
 if(scheduled)return;scheduled=true;
 W.requestAnimationFrame(()=>{scheduled=false;updateEvidence()});
}
function reset(){
 selected.prediction="";selected.transfer="";selected.seen.clear();
 selected.success=false;selected.feedback="";render();
}
function setup(){
 const buttons=isComparison?["cmp-example-fair","cmp-example-step"]:["ss-sys-demo-one","ss-sys-demo-two"];
 buttons.forEach((id,i)=>{
  $(id)?.addEventListener("click",()=>{
   selected.seen.add(i);selected.success=false;selected.feedback="";
   feedback();queue();
  });
 });
 $(isComparison?"cmp-reset":"ss-sys-reset")?.addEventListener("click",reset);
 if(isComparison){
  $("cmp-main").addEventListener("input",queue);
  $("cmp-main").addEventListener("change",queue);
 }else W.addEventListener("ss:system-render",e=>{if(e.detail?.kind===kind)queue()});
 L?.subscribe?.(render);
 render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});
else setup();
W.SSSystemLearningJourney=Object.freeze({kind,updateEvidence,covered:["rc","moving-average","compare"]});
})(window);
