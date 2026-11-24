/* Focused DFT vs FFT lab: identical complex coefficients → butterfly → speed. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),all=sel=>Array.from(document.querySelectorAll(sel));
const core=window.SSDFTFFTCore,traceCore=window.SSButterfly8;
if(!core||!traceCore)throw Error("DFT/FFT compute modules failed to load");
let mode=window.ELSLanguage?.get?.()||"mixed",activeTab="same",stage=1,operation=0;
let currentTrace=traceCore.trace(traceCore.presets.ramp);
const dictionaries={
 "dft-intro":["Same result. Different computation. Why is FFT faster?","결과는 같지만 계산 방법은 다릅니다. FFT는 왜 빠를까요?"],
 "same-title":["Same samples → Same DFT coefficients","같은 입력 → 동일한 DFT 계수"],
 "same-desc":["Calculate the same samples with direct DFT and FFT. Compare the complex outputs.","같은 표본을 직접 DFT와 FFT로 계산하여 복소수 결과를 비교합니다."],
 "same-signal-label":["Signal","신호"],
 "same-size-label":["N samples","표본 수 N"],
 "same-rate-label":["Sampling rate fₛ (Hz)","샘플링 주파수 fₛ (Hz)"],
 "same-run":["Calculate","계산하기"],
 "metric-err-label":["Max |DFT − FFT|","최대 |DFT − FFT|"],
 "metric-bin-label":["Dominant frequency","가장 강한 주파수"],
 "metric-grid-label":["Bin spacing Δf","주파수 간격 Δf"],
 "plot-time-title":["Samples x[n]","표본 신호 x[n]"],
 "plot-spectrum-title":["Amplitude spectrum |X[k]|","진폭 스펙트럼 |X[k]|"],
 "same-discovery":["The FFT gives the same complex DFT coefficients, apart from floating-point rounding. It is a faster algorithm, not a different transform.","FFT는 반올림에 따른 작은 차이를 제외하면 직접 DFT와 동일한 복소수 계수를 구합니다. 다른 변환이 아니라 더 효율적인 알고리즘입니다."],
 "same-table-toggle":["Optional · Compare complex X[k]","선택 · 복소 계수 X[k] 비교"],
 "same-th-dft":["Direct DFT","직접 DFT"],
 "same-th-fft":["FFT","FFT"],
 "same-th-error":["|Error|","|오차|"],
 "butterfly-title":["How does the 8-point FFT reuse calculations?","8점 FFT는 중간 계산을 어떻게 재사용할까요?"],
 "butterfly-desc":["Follow bit-reversed samples through three butterfly stages. Select a pair to inspect its complex intermediate values.","입력의 비트 반전부터 세 단계의 버터플라이 계산을 따라갑니다. 연산 쌍을 선택하여 복소 중간값을 관찰하세요."],
 "butterfly-preset-label":["Input","입력 신호"],
 "butterfly-samples-label":["Eight real samples","실수 표본 8개"],
 "butterfly-apply":["Recalculate","다시 계산"],
 "butterfly-scroll-hint":["On narrow screens, swipe the diagram horizontally.","좁은 화면에서는 그림을 좌우로 이동하여 확인하세요."],
 "butterfly-inspect-title":["Selected butterfly","선택한 버터플라이"],
 "butterfly-table-title":["Four operations in this stage","현재 단계의 네 연산"],
 "butterfly-proof-title":["Final verification: FFT = direct DFT","최종 검증: FFT = 직접 DFT"],
 "butterfly-proof-toggle":["Optional · All eight complex coefficients","선택 · 8개 복소 계수 전체 보기"],
 "speed-title":["Why is FFT faster?","FFT는 왜 빠를까요?"],
 "speed-desc":["Change N to compare measured runtimes and the growth of direct DFT versus radix-2 FFT.","N을 바꾸며 직접 DFT와 radix-2 FFT의 측정 시간 및 연산량 증가를 비교합니다."],
 "speed-n-label":["Transform length N","변환 길이 N"],
 "speed-run":["Compare speed","속도 비교"],
 "speed-dft-label":["Direct DFT time","직접 DFT 시간"],
 "speed-fft-label":["Radix-2 FFT time","Radix-2 FFT 시간"],
 "speed-ratio-label":["Measured speedup","측정 속도 향상"],
 "speed-chart-title":["As N grows: N² versus N log₂N","N 증가에 따른 N²와 N log₂N 비교"],
 "speed-discovery":["FFT reuses intermediate results. The chart shows asymptotic growth rather than exact operation counts; measured timing varies by browser, device and runtime optimizations.","FFT는 중간 계산을 재활용합니다. 그래프는 정확한 명령어 수가 아니라 점근적 증가율을 보여줍니다. 실행 시간은 기기·브라우저에 따라 달라집니다."],
 "dft-evidence-title":["01 · Predict · Do samples change when fs changes?","01 · 예측 · fs가 변하면 표본의 FFT도 바뀔까요?"],
 "dft-evidence-prompt":["Keep x[n] and N fixed. Which quantity changes if fs doubles?","x[n]과 N을 고정하고 fs를 2배로 하면 무엇이 변할까요?"],
 "dft-evidence-test":["Double fs and compare","fs를 2배로 하여 비교"],
 "dft-transfer-title":["Apply · Impulse input","응용 · 임펄스 입력"],
 "dft-transfer-question":["Predict the eight FFT coefficients of δ[n].","δ[n]의 8개 FFT 계수를 예상하세요."],
 "dft-transfer-test":["Calculate impulse FFT","임펄스 FFT 계산"],
 "dft-speed-predict-title":["Apply · When N doubles","응용 · N이 2배가 될 때"],
 "dft-speed-question":["How does the direct DFT's O(N²) work grow?","직접 DFT의 O(N²) 연산량은 어떻게 늘까요?"],
 "dft-speed-check":["Verify complexity prediction","복잡도 예측 검증"],
 "related-label":["Related lessons:","관련 실습:"],
 "related-resolution":["Frequency bins & Zero-padding","주파수 Bin·Zero-padding"],
 "related-upload":["Real Audio & Sensor FFT","실제 음성·센서 FFT"]
};
const labels={
 tabs:[["1 · Same Result","1 · 동일한 결과"],["2 · Butterfly","2 · 버터플라이"],["3 · Speed","3 · 계산 속도"]],
 signals:[["Single tone","단일 정현파"],["Two tones","두 정현파"],["Off-bin tone","Bin 사이 주파수"],["Impulse","임펄스"]],
 presets:[["Ramp · x[n]=n","증가 신호 · x[n]=n"],["Impulse","임펄스"],["One-cycle cosine","코사인 한 주기"],["Custom input","직접 입력"]],
 stages:[["Input · reorder","입력 · 재배열"],["1 · Pairs","1 · 두 점 결합"],["2 · Combine","2 · 네 점 결합"],["3 · Final","3 · 최종 결과"]]
};
function L(en,ko){return mode==="en"?en:mode==="ko"?ko:en+" · "+ko}
function attachTranslation(){
 Object.entries(dictionaries).forEach(([id,words])=>{const el=$(id);if(el)el.textContent=L(...words)});
 all('[data-panel]').forEach((b,i)=>{b.textContent=L(...labels.tabs[i])});
 all("#same-signal option").forEach((e,i)=>{e.textContent=L(...labels.signals[i])});
 all("#butterfly-preset option").forEach((e,i)=>{e.textContent=L(...labels.presets[i])});
 all("#butterfly-stages button").forEach((b,i)=>{b.textContent=L(...labels.stages[i])});
 document.documentElement.lang=mode==="ko"?"ko":"en";
 const options=[
  ["dft-evidence-choice",[["Choose a hypothesis","가설 선택"],["X[k] itself changes","X[k] 자체가 변합니다"],["Only Hz labels and Δf change","Hz 축 및 Δf만 바뀝니다"]]],
  ["dft-transfer-choice",[["Choose a prediction","예측 선택"],["All X[k] = 1 (impulse at n=0)","모든 X[k] = 1 (n=0 임펄스)"],["All X[k] = 0","모든 X[k] = 0"],["Only X[0] is nonzero","X[0]만 0이 아닙니다"]]],
  ["dft-speed-choice",[["Choose a prediction","예측 선택"],["About 2×","약 2배"],["About 4×","약 4배"],["About 8×","약 8배"]]]
 ];
 for(const [id,words] of options)all("#"+id+" option").forEach((el,i)=>el.textContent=L(...words[i]));
 renderSame();renderButterfly();renderSpeedChart();
}
function svg(tag,attrs={},text){
 const el=document.createElementNS("http://www.w3.org/2000/svg",tag);
 Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
 if(text!==undefined)el.textContent=String(text);
 return el;
}
const add=(root,tag,attrs,text)=>root.append(svg(tag,attrs,text));
function plotAxes(root,rect,xTitle,yTitle){
 const {left,right,top,bottom}=rect;
 add(root,"line",{x1:left,y1:bottom,x2:right,y2:bottom,stroke:"currentColor","stroke-width":1.5});
 add(root,"line",{x1:left,y1:bottom,x2:left,y2:top,stroke:"currentColor","stroke-width":1.5});
 add(root,"text",{x:(left+right)/2,y:245,"text-anchor":"middle",fill:"currentColor","font-size":13},xTitle);
 add(root,"text",{x:left+6,y:top-6,fill:"currentColor","font-size":12},yTitle);
}
const accent="#13a7a9",comparison="#cf9b55";
function plotSignal(values){
 const root=$("dft-time-plot");root.replaceChildren();
 const rect={left:45,right:619,top:30,bottom:208},N=values.length;
 plotAxes(root,rect,"n","x[n]");
 const max=Math.max(1,...Array.from(values,v=>Math.abs(v))),len=N;
 const horizontal=rect.right-rect.left,vertical=rect.bottom-rect.top,mid=(rect.bottom+rect.top)/2;
 add(root,"line",{x1:rect.left,y1:mid,x2:rect.right,y2:mid,stroke:"currentColor","stroke-opacity":.3});
 const stride=Math.max(1,Math.ceil(len/100));
 for(let n=0;n<len;n+=stride){
  const x=rect.left+n/Math.max(1,N-1)*horizontal,y=mid-values[n]/max*vertical*.42;
  add(root,"line",{x1:x,y1:mid,x2:x,y2:y,stroke:accent,"stroke-width":1.2});
  add(root,"circle",{cx:x,cy:y,r:2,fill:accent});
 }
 for(let i=0;i<5;i++){const k=Math.round((N-1)*i/4),x=rect.left+horizontal*i/4;add(root,"text",{x,y:224,"text-anchor":"middle",fill:"currentColor","font-size":12},k)}
}
function plotSpectrum(values,fs){
 const root=$("dft-spectrum-plot");root.replaceChildren();
 const rect={left:47,right:620,top:26,bottom:205};
 plotAxes(root,rect,fs>0?"Frequency (Hz)":"cycles/sample","Amplitude");
 const vmax=Math.max(.001,...values),w=rect.right-rect.left,h=rect.bottom-rect.top,len=values.length;
 const commands=[];
 for(let k=0;k<len;k++){
  const x=rect.left+(k/(len-1))*w,y=rect.bottom-values[k]/vmax*h*.91;
  commands.push((k===0?"M":"L")+x.toFixed(2)+" "+y.toFixed(2));
 }
 add(root,"path",{d:commands.join(" "),fill:"none",stroke:accent,"stroke-width":2.1});
 for(let i=0;i<5;i++){
  const f=(fs>0?fs/2:.5)*i/4,x=rect.left+i*w/4;
  add(root,"text",{x,y:224,"text-anchor":"middle",fill:"currentColor","font-size":12},f.toFixed(fs>0?0:2));
 }
}
function td(row,value){const cell=document.createElement("td");cell.textContent=String(value);row.append(cell)}
function renderSame(){
 const N=Number($("same-n").value)||64,type=$("same-signal").value;
 const fs=Number($("same-fs").value);
 if(!Number.isFinite(fs)||fs<=0){$("same-validation").hidden=false;$("same-validation").textContent=L("Enter a positive sampling rate.","샘플링 주파수는 양수로 입력하세요.");return}
 $("same-validation").hidden=true;
 const samples=core.signal(N,type),dft=core.direct(samples),fft=core.radix2(samples);
 const maxError=core.error(dft,fft),amps=core.oneSided(fft);
 let peak=1;for(let k=2;k<amps.length;k++)if(amps[k]>amps[peak])peak=k;
 $("same-error").textContent=maxError.toExponential(2);
 $("same-peak").textContent=(peak*fs/N).toFixed(2)+" Hz (k="+peak+")";
 $("same-grid").textContent=(fs/N).toFixed(3)+" Hz";
 plotSignal(samples);plotSpectrum(amps,fs);
 const body=$("same-rows");body.replaceChildren();
 for(let k=0;k<Math.min(N,65);k++){
  const row=document.createElement("tr");td(row,k);
  td(row,traceCore.format(core.complex(dft,k)));td(row,traceCore.format(core.complex(fft,k)));
  td(row,Math.hypot(dft.re[k]-fft.re[k],dft.im[k]-fft.im[k]).toExponential(2));body.append(row);
 }
}
function switchTab(tab){
 activeTab=tab;
 for(const p of ["same","butterfly","speed"]){
  const on=p===tab; $("panel-"+p).hidden=!on;
  const button=$("tab-"+p);button.setAttribute("aria-selected",String(on));
  button.tabIndex=on?0:-1;
 }
 if(tab==="butterfly")renderButterfly();
 if(tab==="speed")renderSpeed();
}
function rowDetail(label,value){
 const a=document.createElement("span"),b=document.createElement("span");
 a.textContent=label;b.textContent=value;$("butterfly-details").append(a,b);
}
function positionStage(){
 const scroll=document.querySelector(".dft-scroll-figure");if(!scroll)return;
 const max=scroll.scrollWidth-scroll.clientWidth;
 scroll.scrollLeft=window.innerWidth<=760?Math.round(stage/3*Math.max(0,max)):0;
}
function stageSelect(next,op=0){stage=next;operation=op;renderButterfly();positionStage()}
function renderButterfly(){
 const trace=currentTrace,root=$("butterfly-diagram"),fmt=traceCore.format;
 all("#butterfly-stages button").forEach((b,i)=>b.setAttribute("aria-pressed",String(i===stage)));
 const stages=[
  ["Input order: x[0], x[4], x[2], x[6], x[1], x[5], x[3], x[7].","입력을 x[0], x[4], x[2], x[6], x[1], x[5], x[3], x[7] 순서로 재배열합니다."],
  ["Stage 1 · four length-2 butterflies","1단계 · 길이 2 버터플라이 4개"],
  ["Stage 2 · four length-4 butterflies","2단계 · 길이 4 버터플라이 4개"],
  ["Stage 3 · four length-8 butterflies · X[k]","3단계 · 길이 8 버터플라이 4개 · X[k]"]
 ];
 $("butterfly-stage-note").textContent=L(...stages[stage]);
 const buttons=$("butterfly-pairs"),details=$("butterfly-details"),tbody=$("butterfly-rows");
 buttons.replaceChildren();details.replaceChildren();tbody.replaceChildren();
 if(stage===0){
  for(let i=0;i<8;i++){const tr=document.createElement("tr");
   td(tr,i);td(tr,"x["+trace.order[i]+"]");td(tr,fmt(trace.stages[0][i]));td(tr,"—");tbody.append(tr)}
  rowDetail(L("Original","원래 순서"),trace.samples.map((v,k)=>"x["+k+"]="+Number(v.toFixed(3))).join(", "));
  rowDetail(L("Bit-reversed","재배열"),trace.order.map(n=>"x["+n+"]").join(", "));
 }else{
  const ops=trace.operations[stage];
  for(const [i,op] of ops.entries()){
   const b=document.createElement("button");b.type="button";
   b.textContent="("+op.a+","+op.b+")";b.setAttribute("aria-pressed",String(i===operation));
   b.addEventListener("click",()=>stageSelect(stage,i));buttons.append(b);
   const tr=document.createElement("tr");td(tr,"("+op.a+","+op.b+")");td(tr,fmt(op.W));td(tr,fmt(op.plus));td(tr,fmt(op.minus));tbody.append(tr);
  }
  const op=ops[Math.min(operation,ops.length-1)];
  rowDetail(L("Pair","계산 쌍"),"("+op.a+","+op.b+")");
  rowDetail("u",fmt(op.u));rowDetail("v",fmt(op.v));
  rowDetail("W"+op.length+"^"+op.r,fmt(op.W));
  rowDetail("t = Wv",fmt(op.t));
  rowDetail("u + t",fmt(op.plus));rowDetail("u − t",fmt(op.minus));
 }
 const proof=$("butterfly-proof");proof.hidden=stage!==3;
 if(stage===3){
  $("butterfly-proof-error").textContent=L("Maximum complex coefficient difference: ","최대 복소수 계수 오차: ")+trace.maxError.toExponential(3);
  const body=$("butterfly-proof-rows");body.replaceChildren();
  for(let k=0;k<8;k++){const row=document.createElement("tr");td(row,k);td(row,fmt(trace.fft[k]));td(row,fmt(trace.direct[k]));td(row,trace.errors[k].toExponential(2));body.append(row)}
 }
 root.replaceChildren();const xs=[142,365,588,811],ys=Array.from({length:8},(_,i)=>54+i*43);
 for(let st=1;st<=3;st++){
  for(const [i,op] of trace.operations[st].entries()){
   const selected=st===stage&&i===operation,muted=st>stage;
   for(const [from,to] of [[op.a,op.a],[op.a,op.b],[op.b,op.a],[op.b,op.b]]){
    add(root,"line",{x1:xs[st-1],y1:ys[from],x2:xs[st],y2:ys[to],
      stroke:selected?accent:"currentColor","stroke-opacity":selected?1:muted?.12:.25,"stroke-width":selected?3.1:1.15});
   }
  }
 }
 const names=[["Input / bit reversal","입력 / 비트 반전"],["Length 2","길이 2"],["Length 4","길이 4"],["Length 8 / X[k]","길이 8 / X[k]"]];
 for(let st=0;st<=3;st++){
  add(root,"text",{x:xs[st]-8,y:19,fill:"currentColor","font-size":13,"font-weight":st===stage?800:500},L(...names[st]));
  for(let i=0;i<8;i++){
   const op=stage>0?trace.operations[stage][Math.min(operation,3)]:null;
   const focused=st===stage&&(stage===0||[op.a,op.b].includes(i));
   add(root,"circle",{cx:xs[st],cy:ys[i],r:focused?5.3:3,fill:accent});
   if(st===0)add(root,"text",{x:4,y:ys[i]+4,fill:"currentColor","font-size":12},"x["+trace.order[i]+"]");
   if(st<=stage)add(root,"text",{x:xs[st]+9,y:ys[i]+4,fill:"currentColor","font-size":12},(st===3?"X["+i+"]=":"")+fmt(trace.stages[st][i],2));
  }
 }
}
function recalcButterfly(){
 try{
  const x=traceCore.parseSamples($("butterfly-input").value);
  currentTrace=traceCore.trace(x);$("butterfly-error").hidden=true;
  stageSelect(stage,0);
 }catch(e){
  $("butterfly-error").hidden=false;$("butterfly-error").textContent=L("Enter exactly eight finite real values.","유한한 실수 표본 8개를 입력하세요.");
 }
}
function chartSpeed(){
 const root=$("dft-speed-plot");root.replaceChildren();
 const xs=[32,64,128,256,512,1024],metric1=xs.map(n=>n*n),metric2=xs.map(n=>n*Math.log2(n));
 const top=23,bottom=267,left=68,right=827,w=right-left,h=bottom-top,max=Math.max(...metric1);
 add(root,"line",{x1:left,y1:bottom,x2:right,y2:bottom,stroke:"currentColor","stroke-width":1.4});
 add(root,"line",{x1:left,y1:bottom,x2:left,y2:top,stroke:"currentColor","stroke-width":1.4});
 for(const [j,series] of [[0,metric1],[1,metric2]]){
  const points=series.map((v,i)=>{const x=left+i*w/(xs.length-1),y=bottom-v/max*h*.95;return (i?"L":"M")+x+" "+y});
  add(root,"path",{d:points.join(" "),fill:"none",stroke:j?accent:comparison,"stroke-width":3});
 }
 xs.forEach((n,i)=>add(root,"text",{x:left+i*w/(xs.length-1),y:286,fill:"currentColor","text-anchor":"middle","font-size":12},n));
 add(root,"text",{x:right-280,y:31,fill:comparison,"font-size":14},"DFT · N²");
 add(root,"text",{x:right-140,y:31,fill:accent,"font-size":14},"FFT · N log₂N");
 add(root,"text",{x:(left+right)/2,y:305,fill:"currentColor","font-size":13,"text-anchor":"middle"},"N");
}
function renderSpeed(){
 const N=Number($("speed-n").value)||256;
 const x=core.signal(N,"two");
 // Warm up JIT and use repeated FFT calls to obtain a measurable average.
 for(let j=0;j<2;j++)core.radix2(x);
 let t0=performance.now();core.direct(x);const dftMs=performance.now()-t0;
 t0=performance.now();for(let i=0;i<20;i++)core.radix2(x);
 const fftMs=(performance.now()-t0)/20;
 $("speed-dft").textContent=dftMs.toFixed(3)+" ms";
 $("speed-fft").textContent=fftMs.toFixed(3)+" ms";
 $("speed-ratio").textContent=fftMs>0?(dftMs/fftMs).toFixed(1)+"×":"—";
 chartSpeed();
}
function renderSpeedChart(){chartSpeed()}
function formula(){
 const formulas=[
  ["same-formula",String.raw`X[k]=\sum_{n=0}^{N-1}x[n]e^{-j2\pi kn/N}`],
  ["butterfly-formula",String.raw`t=W_L^r v,\qquad y[a]=u+t,\quad y[b]=u-t`],
  ["speed-formula",String.raw`\mathcal O(N^2)\quad\text{vs.}\quad\mathcal O(N\log_2 N)`]
 ];
 if(!window.katex)return;
 for(const [id,tex] of formulas){
  const element=$(id);
  try{window.katex.render(tex,element,{throwOnError:false,displayMode:false,output:"htmlAndMathml"})}
  catch(e){console.warn("Optional formula rendering unavailable",e)}
 }
}
function setReason(id,correct,en,ko){
 const el=$(id);el.dataset.result=correct?"correct":"retry";el.textContent=L(en,ko);
}
function testSamplingRateHypothesis(){
 const selected=$("dft-evidence-choice").value;
 if(!selected){setReason("dft-evidence-feedback",false,"Choose a hypothesis before testing.","먼저 가설을 선택하세요.");return;}
 const fs=Number($("same-fs").value),N=Number($("same-n").value),type=$("same-signal").value;
 if(!Number.isFinite(fs)||fs<=0){setReason("dft-evidence-feedback",false,"Enter a valid fs first.","먼저 올바른 fs를 입력하세요.");return;}
 const samples=core.signal(N,type),before=core.direct(samples),after=core.radix2(samples);
 const err=core.error(before,after),oldStep=fs/N,newStep=2*fs/N;
 $("same-fs").value=String(2*fs);renderSame();
 const correct=selected==="labels" && err<1e-7;
 setReason("dft-evidence-feedback",correct,
  "Identical x[n] and N → unchanged complex X[k] (difference "+err.toExponential(2)+"). Δf changes from "+oldStep.toFixed(2)+" to "+newStep.toFixed(2)+" Hz. FFT is not a new transform.",
  "동일한 x[n], N → 복소 X[k]는 동일합니다(차이 "+err.toExponential(2)+"). Δf는 "+oldStep.toFixed(2)+"에서 "+newStep.toFixed(2)+"Hz로 변합니다. FFT는 새로운 변환이 아닙니다.");
}
function testImpulseTransfer(){
 const selected=$("dft-transfer-choice").value;
 if(!selected){setReason("dft-transfer-feedback",false,"Predict first, then calculate.","먼저 예측한 뒤 계산하세요.");return;}
 $("butterfly-preset").value="impulse";
 $("butterfly-input").value=traceCore.presets.impulse.join(",");
 recalcButterfly();stageSelect(3,0);
 const values=currentTrace.fft,allOne=values.every(v=>Math.abs(v.re-1)<1e-8&&Math.abs(v.im)<1e-8);
 const correct=selected==="flat"&&allOne;
 setReason("dft-transfer-feedback",correct,
  "For δ[n] at n=0, every DFT/FFT coefficient X[k] = 1. This is true for ALL k because e^(−j2πk·0/N) = 1.",
  "n=0에서의 δ[n]은 모든 DFT/FFT 계수 X[k]가 1입니다. 모든 k에서 e^(−j2πk·0/N)=1이기 때문입니다.");
}
function testGrowthPrediction(){
 const choice=$("dft-speed-choice").value;
 if(!choice){setReason("dft-speed-feedback",false,"Choose a growth hypothesis first.","연산량 증가에 대한 가설을 먼저 선택하세요.");return;}
 const N=Number($("speed-n").value)||256,ratioFFT=2*Math.log2(2*N)/Math.log2(N);
 const correct=choice==="four";
 setReason("dft-speed-feedback",correct,
  "Direct DFT work grows (2N)²/N² = 4×. FFT N log₂N grows by about "+ratioFFT.toFixed(2)+"× for N="+N+". Browser timing is a separate, noisy measurement.",
  "직접 DFT는 (2N)²/N² = 4배로 늘어납니다. FFT의 N log₂N은 N="+N+"에서 약 "+ratioFFT.toFixed(2)+"배 증가합니다. 브라우저 실행시간은 측정 변동이 있는 별개 값입니다.");
}
function initialize(){
 window.ELSLanguage?.bindSelect?.($("dft-language"));
 window.ELSLanguage?.subscribe?.(next=>{mode=next;attachTranslation()});
 all('[data-panel]').forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.panel)));
 all('[data-panel]').forEach((b,i)=>b.addEventListener("keydown",e=>{
  if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
  e.preventDefault();const arr=["same","butterfly","speed"],next=e.key==="Home"?0:e.key==="End"?2:(i+(e.key==="ArrowRight"?1:2))%3;
  switchTab(arr[next]);$("tab-"+arr[next]).focus();
 }));
 $("same-run").addEventListener("click",renderSame);
 $("dft-evidence-test").addEventListener("click",testSamplingRateHypothesis);
 $("dft-transfer-test").addEventListener("click",testImpulseTransfer);
 $("dft-speed-check").addEventListener("click",testGrowthPrediction);
 ["same-signal","same-n"].forEach(id=>$(id).addEventListener("change",renderSame));
 $("same-fs").addEventListener("input",renderSame);
 $("same-fs").addEventListener("change",renderSame);
 $("butterfly-preset").addEventListener("change",()=>{
  const mode=$("butterfly-preset").value;
  if(mode!=="custom"){$("butterfly-input").value=traceCore.presets[mode].map(x=>Number(x.toFixed(5))).join(",");recalcButterfly()}
 });
 $("butterfly-input").addEventListener("input",()=>{$("butterfly-preset").value="custom";$("butterfly-error").hidden=true});
 $("butterfly-apply").addEventListener("click",recalcButterfly);
 all("[data-stage]").forEach(b=>b.addEventListener("click",()=>stageSelect(Number(b.dataset.stage),0)));
 window.addEventListener("resize",positionStage);
 $("speed-n").addEventListener("change",renderSpeed);
 $("speed-run").addEventListener("click",renderSpeed);
 mode=window.ELSLanguage?.get?.()||"mixed";
 attachTranslation();switchTab("same");formula();
 window.__FFTFocusedReady=true;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();
