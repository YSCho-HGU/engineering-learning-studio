/* FFT follow-up: original synthetic signals; no inferred sample rate.
   N controls actual acquisition duration. Padding changes DFT grid only. */
(function(global){"use strict";
const $=id=>document.getElementById(id),tau=2*Math.PI;
const L={
title:["Frequency Resolution & Spectral Leakage","주파수 분해능과 스펙트럼 누설"],
subtitle:["First change how long you observe a signal. Next move a tone between FFT bins. Finally add zeros without adding observations.","먼저 실제 관측 시간을 바꾸고, 다음에는 신호를 FFT Bin 사이로 이동해 봅니다. 마지막으로 새 표본 없이 0만 추가해 봅니다."],
controls:["Experiment controls","실험 설정"],controlsNote:["Start with Two nearby tones. Hold fs and the tone separation fixed, then increase N and check when two peaks separate.","‘가까운 두 정현파’ 실험으로 시작하세요. fs와 주파수 차이를 고정한 채 N을 늘리며 두 피크가 분리되는지 확인하세요."],
experiment:["Choose experiment","실험 선택"],fs:["Sampling rate fs","샘플링 주파수 fs"],n:["Observed samples N","관측 표본 수 N"],
separation:["Two-tone separation","두 신호의 주파수 차이"],offset:["Fractional bin offset","정수 Bin에서 벗어난 정도"],
window:["Observation window","관측 창 함수"],padding:["FFT length M (zero padding)","FFT 길이 M (영 채우기)"],
time:["1 · Observe samples","1 · 시간 영역 관찰"],spectrum:["2 · Observe spectral peaks","2 · 주파수 피크 관찰"],
timeNote:["The horizontal axis is n (sample index), not seconds.","가로축은 실제 시간이 아닌 표본 인덱스 n입니다."],
spectrumNote:["The horizontal axis is frequency in Hz; the graph shows one-sided amplitude.","가로축은 Hz 단위 주파수이며 단측 진폭을 표시합니다."],
theory:["3 · Read the equations","3 · 수식으로 해석"],eq1:["Observation and nominal bin spacing","관측 시간과 원래 Bin 간격"],eq2:["Padded grid spacing","영 채우기 후의 표시 격자"],
theoryNote:["N is the number of acquired samples, M is the transform length after padding. With the same observation, denser bins are not automatically better physical resolution.","N은 실제 관측 표본 개수이고 M은 영 채우기를 적용한 변환 길이입니다. 관측 구간이 같다면 FFT 격자만 촘촘해져도 실제 분해능은 자동으로 높아지지 않습니다."],
observation:["4 · Explain your observation","4 · 관찰 결과 해석"],back:["← Sample Data FFT","← 샘플 데이터 FFT"],quizTitle:["5 · Check your understanding","5 · 이해도 확인"],quizButton:["Check answer","정답 확인"],quizRetry:["Choose another answer","다른 답을 선택해 보세요"],legend:["Solid = signal frequency; dashed = FFT bins","실선 = 실제 신호 주파수, 점선 = FFT Bin"],next:["Next · DFT vs FFT →","다음 · DFT와 FFT →"]
};
const lang=()=>global.ELSLanguage?.get?.()||"mixed";
const tr=([en,ko],short=false)=>lang()==="en"?en:lang()==="ko"?ko:en+(short?" · ":"\n")+ko;
const f=(v,d=2)=>Number(v.toFixed(d)).toLocaleString("en-US",{maximumFractionDigits:d});
function dftMagnitude(samples,M){
 // Calculate the same DFT with radix-2 FFT whenever M is a power of two.
 // Zero-padding changes the frequency grid but not the number of measurements.
 const N=samples.length,half=Math.floor(M/2),out=[];
 if(M<N||M<2||!Number.isInteger(M))throw Error("FFT size must be an integer >= observed samples");
 if((M&(M-1))===0){
  const re=new Float64Array(M),im=new Float64Array(M);
  re.set(samples);
  for(let i=1,j=0;i<M;i++){
   let bit=M>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;
   if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}
  }
  for(let length=2;length<=M;length*=2){
   const halfLength=length/2,theta=-tau/length;
   for(let block=0;block<M;block+=length)for(let j=0;j<halfLength;j++){
    const angle=theta*j,c=Math.cos(angle),d=Math.sin(angle),a=block+j,b=a+halfLength;
    const tr=c*re[b]-d*im[b],ti=d*re[b]+c*im[b];
    re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;
   }
  }
  for(let k=0;k<=half;k++)out.push((k===0||(M%2===0&&k===half)?1:2)*Math.hypot(re[k],im[k])/N);
 }else{
  // Keep the exported function useful for arbitrary integer transform sizes.
  for(let k=0;k<=half;k++){
   let re=0,im=0;
   for(let n=0;n<N;n++){const a=-tau*k*n/M;re+=samples[n]*Math.cos(a);im+=samples[n]*Math.sin(a)}
   out.push((k===0||(M%2===0&&k===half)?1:2)*Math.hypot(re,im)/N);
  }
 }
 return out;
}
function analyze({fs=256,N=64,separation=12,offset=.35,experiment="resolution",window="rect",padding=1}={}){
 const M=N*padding,df=fs/N,base=48;
 const f1=experiment==="leakage"?10*df+offset*df:base;
 const f2=base+separation;
 const raw=Array.from({length:N},(_,n)=>{
  const t=n/fs;
  if(experiment==="resolution")return .65*Math.sin(tau*f1*t)+.55*Math.sin(tau*f2*t);
  return Math.sin(tau*f1*t);
 });
 const w=raw.map((_,n)=>window==="hann"?(.5-.5*Math.cos(tau*n/(N-1))):1);
 const coherentGain=w.reduce((a,b)=>a+b,0)/N;
 const samples=raw.map((v,n)=>v*w[n]);
 const spectrum=dftMagnitude(samples,M).map(v=>v/coherentGain);
 const bins=spectrum.map((amplitude,k)=>({k,hz:k*fs/M,amplitude}));
 return {fs,N,M,df,grid:fs/M,duration:N/fs,experiment,window,padding,separation,offset,f1,f2,raw,samples,bins};
}
function draw(svg,points,{xmin=0,xmax,ymax,axisX,axisY,stems=false,markers=null}){
 const NS="http://www.w3.org/2000/svg",W=620,H=300,left=64,right=18,top=32,bottom=44,pw=W-left-right,ph=H-top-bottom;
 svg.replaceChildren();
 const minY=stems?Math.min(-.1,...points.map(p=>p.y)):-.04;
 const maxY=ymax||Math.max(.2,...points.map(p=>p.y))*1.12;
 const sx=x=>left+(x-xmin)/(xmax-xmin)*pw,sy=y=>top+(maxY-y)/(maxY-minY)*ph;
 const add=(tag,attrs,text,cls)=>{const el=document.createElementNS(NS,tag);Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,String(v)));if(cls)el.setAttribute("class",cls);if(text!==undefined)el.textContent=text;svg.append(el);return el};
 for(let j=0;j<=4;j++){
  const yy=minY+(maxY-minY)*j/4,y=sy(yy);
  add("line",{x1:left,x2:W-right,y1:y,y2:y},undefined,"grid");
  add("text",{x:left-8,y:y+4,"text-anchor":"end"},f(yy,2),"tick");
 }
 add("line",{x1:left,x2:W-right,y1:sy(0),y2:sy(0)},undefined,"axis");
 add("line",{x1:left,x2:left,y1:top,y2:H-bottom},undefined,"axis");
 const ticks=6;
 for(let j=0;j<=ticks;j++){
  const val=xmin+(xmax-xmin)*j/ticks,x=sx(val);
  add("text",{x,y:H-bottom+18,"text-anchor":j===0?"start":j===ticks?"end":"middle"},stems?String(Math.round(val)):f(val,1),"tick");
 }
 if(stems){
  const stride=Math.max(1,Math.ceil(points.length/128));
  points.forEach((p,j)=>{if(j%stride)return;const x=sx(p.x),y=sy(p.y);add("line",{x1:x,x2:x,y1:sy(0),y2:y,stroke:"var(--els-link)","stroke-width":1.3});add("circle",{cx:x,cy:y,r:2.1},undefined,"sample")});
 }else{
  const path=points.filter(p=>p.x>=xmin&&p.x<=xmax).map((p,j)=>(j?"L":"M")+sx(p.x).toFixed(2)+","+sy(p.y).toFixed(2)).join(" ");
  add("path",{d:path},undefined,"curve");
 }
 if(markers){
  const nyq=xmax,step=markers.grid;
  // Only nearby bins: every bin for very coarse grids would obscure the data.
  const centers=markers.tones.filter(t=>t>0&&t<nyq);
  const near=new Set();
  for(const tone of centers){const k=Math.round(tone/step);for(let j=k-2;j<=k+2;j++){const value=j*step;if(value>=0&&value<=nyq)near.add(j)}}
  for(const k of [...near].sort((a,b)=>a-b)){
   const x=sx(k*step);
   add("line",{x1:x,x2:x,y1:top,y2:H-bottom,stroke:"var(--els-muted)","stroke-width":1,"stroke-dasharray":"3 6",opacity:.7},undefined,"fft-bin-guide");
  }
  centers.forEach((tone,index)=>{
   const x=sx(tone);
   add("line",{x1:x,x2:x,y1:top,y2:H-bottom,stroke:index?"#e58d49":"#36b6a8","stroke-width":2.2,opacity:.95},undefined,"true-frequency-guide");
   const edge=x>W-95?"end":x<left+80?"start":"middle";
   add("text",{x,y:top+14+index*16,"text-anchor":edge,fill:index?"#e58d49":"#36b6a8","font-size":13,"font-weight":700},f(tone,2)+" Hz","true-frequency-label");
  });
 }
 add("text",{x:left,y:17},axisY,"title");
 add("text",{x:left+pw/2,y:H-7,"text-anchor":"middle"},axisX,"title");
}
function renderLabels(){
 const pairs=[["fft-r-title","title"],["fft-r-subtitle","subtitle"],["fft-r-controls-title","controls"],["fft-r-controls-note","controlsNote"],["fft-r-experiment-label","experiment"],["fft-r-fs-label","fs"],["fft-r-n-label","n"],["fft-r-separation-label","separation"],["fft-r-offset-label","offset"],["fft-r-window-label","window"],["fft-r-padding-label","padding"],["fft-r-time-title","time"],["fft-r-spectrum-title","spectrum"],["fft-r-time-note","timeNote"],["fft-r-spectrum-note","spectrumNote"],["fft-r-theory-title","theory"],["fft-r-eq1-label","eq1"],["fft-r-eq2-label","eq2"],["fft-r-theory-note","theoryNote"],["fft-r-observation-title","observation"],["fft-r-quiz-title","quizTitle"],["fft-r-quiz-check","quizButton"],["fft-r-guide-legend","legend"]];
 for(const [id,key] of pairs)$(id).textContent=tr(L[key]);
 $("fft-r-experiment").options[0].textContent=tr(["1 · Two nearby tones","1 · 인접한 두 정현파"],true);
 $("fft-r-experiment").options[1].textContent=tr(["2 · Off-bin tone","2 · Bin 사이 정현파"],true);
 $("fft-r-experiment").options[2].textContent=tr(["3 · Zero padding","3 · 영 채우기"],true);
 for(const [v,a,b] of [["rect","Rectangular","직사각 창"],["hann","Hann","Hann 창"]])$("fft-r-window").querySelector('[value="'+v+'"]').textContent=tr([a,b],true);
 $("fft-r-padding").options[0].textContent=tr(["No padding","패딩 없음"],true);
 $("fft-r-padding").options[1].textContent=tr(["4× FFT grid","4배 촘촘한 FFT"],true);
 document.documentElement.lang=lang()==="ko"?"ko":"en";
}
function run(){
 const experiment=$("fft-r-experiment").value,fs=Number($("fft-r-fs").value),N=Number($("fft-r-n").value),separation=Number($("fft-r-separation").value),offset=Number($("fft-r-offset").value),window=$("fft-r-window").value,padding=Number($("fft-r-padding").value);
 $("fft-r-separation").parentElement.hidden=experiment!=="resolution";
 $("fft-r-offset").parentElement.hidden=experiment!=="leakage";
 $("fft-r-separation-output").textContent=separation+" Hz";
 $("fft-r-offset-output").textContent=f(offset,2)+" bins";
 const a=analyze({experiment,fs,N,separation,offset,window,padding});
 const vals=[
  [tr(["Actual samples","실제 표본 수"],true),String(a.N)],
  [tr(["Observation time","관측 시간"],true),f(1000*a.duration,1)+" ms"],
  [tr(["Original bin Δf","원래 Bin 간격"],true),f(a.df,2)+" Hz"],
  [tr(["Display grid step","표시 격자 간격"],true),f(a.grid,2)+" Hz"]
 ];
 $("fft-r-stats").replaceChildren(...vals.map(([label,val])=>{const box=document.createElement("div"),s=document.createElement("span"),b=document.createElement("strong");s.textContent=label;b.textContent=val;box.append(s,b);return box}));
 draw($("fft-r-time"),a.samples.map((y,x)=>({x,y})),{xmax:N-1,axisX:"n (sample index)",axisY:"x[n] · windowed",stems:true});
 draw($("fft-r-spectrum"),a.bins.map(p=>({x:p.hz,y:p.amplitude})),{xmax:fs/2,axisX:"f (Hz)",axisY:tr(["One-sided amplitude","단측 진폭"],true),markers:{grid:a.grid,tones:experiment==="resolution"?[a.f1,a.f2]:[a.f1]}});
 let lines=[];
 if(experiment==="resolution"){
  lines=[tr(["Two tones: "+f(a.f1,1)+" Hz and "+f(a.f2,1)+" Hz. Their separation is "+separation+" Hz; the observation-based bin spacing is "+f(a.df,2)+" Hz.","두 정현파: "+f(a.f1,1)+" Hz와 "+f(a.f2,1)+" Hz. 주파수 차이는 "+separation+" Hz이며 관측 길이 기준 Bin 간격은 "+f(a.df,2)+" Hz입니다."]),
   tr(["Increase N at fixed fs and watch whether the two peaks become distinguishable. Bin spacing is a grid measure, not a universal guarantee of two-tone resolution.","fs를 고정하고 N을 늘려 두 피크가 구별되는지 관찰하세요. Bin 간격 자체가 모든 신호에 대한 분리 가능성을 보장하지는 않습니다."])];
 }else if(experiment==="leakage"){
  lines=[tr(["The tone is at "+f(a.f1,2)+" Hz, shifted by "+f(offset,2)+" bin from a DFT grid point. Watch energy spread into neighboring bins.","정현파는 "+f(a.f1,2)+" Hz이며 DFT 격자에서 "+f(offset,2)+" Bin만큼 벗어났습니다. 주변 Bin으로 퍼지는 크기를 관찰하세요."]),
   tr(["Compare Rectangular and Hann. Hann typically suppresses distant sidelobes but broadens the main lobe; it does not make leakage disappear.","직사각 창과 Hann 창을 비교하세요. Hann은 일반적으로 먼 부엽을 줄이지만 주엽을 넓히며, 누설을 완전히 제거하지는 않습니다."])];
 }else{
  lines=[tr(["The record contains exactly N="+N+" observations. Padding increases transform length to M="+a.M+" but does not extend the actual "+f(1000*a.duration,2)+" ms record.","실제 관측 표본은 N="+N+"개입니다. 패딩을 하면 변환 길이는 M="+a.M+"로 늘지만 "+f(1000*a.duration,2)+" ms의 실제 관측 시간은 그대로입니다."]),
   tr(["Compare the denser spectrum grid against the unchanged observation time. Padding interpolates the sampled spectrum; it cannot separate tones that the original record does not resolve.","촘촘해진 주파수 격자와 변하지 않은 관측 시간을 비교하세요. 영 채우기는 스펙트럼을 더 촘촘히 표본화하지만 원래 기록으로 구별할 수 없는 두 신호를 새로 분리해 주지는 않습니다."])];
 }
 $("fft-r-observation").textContent=lines.join("\n\n");
 renderQuestion(experiment);
 renderChallenge(a);
 global.SSMathCore?.queue?.();
}
const challengeInstructions={
 resolution:["Set fs = 256 Hz, N ≥ 128, and the tone separation to 4 Hz. Create an observation with an original FFT-bin spacing of 2 Hz or less.","fs = 256 Hz, N ≥ 128, 두 주파수 간격 = 4 Hz로 맞추세요. 원래 FFT Bin 간격이 2 Hz 이하인 관측을 만드세요."],
 leakage:["Set fs = 256 Hz, N = 64, offset = 0.35 bins and Hann window. Observe how the tone lies between bin lines while the window reshapes the spectrum.","fs = 256 Hz, N = 64, offset = 0.35 Bin, Hann 창으로 설정하세요. 신호가 Bin 사이에 있고 창에 따라 스펙트럼 형태가 바뀌는지 관찰하세요."],
 padding:["Use fs = 256 Hz, N = 64 and 4× padding. Make the displayed FFT grid 1 Hz while preserving the original 4 Hz spacing and 250 ms observation.","fs = 256 Hz, N = 64, 영 채우기 4배를 적용하세요. 실제 관측 250 ms와 원래 간격 4 Hz를 유지하면서 표시 격자를 1 Hz로 만드세요."]
};
function evaluateChallenge(a){
 const close=(x,y)=>Math.abs(x-y)<1e-8;
 if(a.experiment==="resolution")return {ok:a.fs===256&&a.N>=128&&a.separation===4&&a.df<=2,detail:"Δf = "+f(a.df,2)+" Hz · T = "+f(a.duration*1000,1)+" ms · "+f(a.f1,0)+"/"+f(a.f2,0)+" Hz"};
 if(a.experiment==="leakage")return {ok:a.fs===256&&a.N===64&&close(a.offset,.35)&&a.window==="hann",detail:"Offset = "+f(a.offset,2)+" bin · window = "+a.window+" · f = "+f(a.f1,2)+" Hz"};
 return {ok:a.fs===256&&a.N===64&&a.padding===4&&close(a.grid,1)&&close(a.df,4)&&close(a.duration,.25),detail:"N = "+a.N+" · M = "+a.M+" · Δf = "+f(a.df,2)+" Hz · grid = "+f(a.grid,2)+" Hz"};
}
let challengeStage="",challengeVerified=false;
function renderChallenge(a){
 if(challengeStage!==a.experiment){challengeStage=a.experiment;challengeVerified=false}
 $("fft-r-challenge-title").textContent=tr(["4 · Graph experiment challenge","4 · 그래프 실험 미션"]);
 $("fft-r-challenge-instruction").textContent=tr(challengeInstructions[a.experiment]);
 const result=evaluateChallenge(a);
 if(challengeVerified&&!result.ok)challengeVerified=false;
 $("fft-r-challenge-measure").textContent=result.detail;
 $("fft-r-challenge-check").textContent=tr(["Check my experiment","실험 목표 확인"],true);
 const feedback=$("fft-r-challenge-feedback");
 if(!challengeVerified){feedback.textContent=tr(["Adjust controls and inspect both plots, then check.","값을 조정해 두 그래프를 관찰한 후 목표를 확인하세요."]);feedback.dataset.result="pending"}
}
function checkChallenge(){
 const a=analyze({experiment:$("fft-r-experiment").value,fs:Number($("fft-r-fs").value),N:Number($("fft-r-n").value),separation:Number($("fft-r-separation").value),offset:Number($("fft-r-offset").value),window:$("fft-r-window").value,padding:Number($("fft-r-padding").value)});
 const status=evaluateChallenge(a),feedback=$("fft-r-challenge-feedback");
 challengeVerified=true;
 feedback.dataset.result=status.ok?"correct":"incorrect";
 feedback.textContent=status.ok?tr(["Goal achieved. Explain what changed in the graph and why.","목표를 달성했습니다. 그래프에서 달라진 점과 그 이유를 설명해 보세요."]):tr(["Not yet: compare the target with the current values and adjust the controls.","아직 목표에 도달하지 않았습니다. 목표와 현재 값을 비교하고 조절값을 변경하세요."]);
}

const questions={
 resolution:{
  q:["At fixed fs, doubling the actual number of observed samples N has what effect?","fs가 일정할 때 실제 관측 표본 수 N을 두 배로 늘리면 무엇이 변할까요?"],
  choices:[["Observation time doubles and the original bin spacing halves.","관측 시간은 두 배, 원래 Bin 간격은 절반이 됩니다."],["The original bin spacing doubles.","원래 Bin 간격이 두 배가 됩니다."],["The sampling rate automatically doubles.","샘플링 주파수가 자동으로 두 배가 됩니다."]],
  correct:0,why:["Because T=N/fs and Δf=fs/N. Closely spaced tones may become more distinguishable, but bin spacing alone does not guarantee resolution.","T=N/fs, Δf=fs/N이기 때문입니다. 인접 피크의 구별 가능성은 좋아질 수 있지만 Bin 간격만으로 분해능을 보장할 수는 없습니다."]},
 leakage:{
  q:["Why can a sinusoid spread across many FFT bins?","정현파 성분이 여러 FFT Bin으로 퍼져 보이는 이유는 무엇일까요?"],
  choices:[["Its frequency need not lie exactly on a DFT bin, and the finite observation window creates leakage.","신호 주파수가 DFT Bin과 일치하지 않고 유한 관측 창의 영향으로 누설이 발생할 수 있습니다."],["The FFT always adds random noise.","FFT가 항상 랜덤 잡음을 추가하기 때문입니다."],["The sampling rate is unknown.","샘플링 주파수를 알 수 없기 때문입니다."]],
  correct:0,why:["Compare offset 0 with 0.35, then Rectangular with Hann. Hann lowers distant sidelobes but widens the main lobe.","Offset 0과 0.35를 비교한 후 직사각 창과 Hann 창을 비교하세요. Hann은 먼 부엽을 낮추는 대신 주엽을 넓힙니다."]},
 padding:{
  q:["When only zero padding increases M, what changes?","Zero Padding으로 FFT 길이 M만 늘리면 무엇이 달라질까요?"],
  choices:[["The observation duration doubles.","실제 관측 시간이 두 배로 늘어납니다."],["The FFT frequency grid becomes denser, but the recorded information and original fs/N remain unchanged.","FFT 주파수 격자만 촘촘해지고 기록 정보와 원래 fs/N은 변하지 않습니다."],["New measured samples are created.","새로 측정한 표본이 생성됩니다."]],
  correct:1,why:["Zero padding uses the same N measured samples. The displayed grid step is fs/M, not a new physical resolving power.","측정 표본은 여전히 N개입니다. 표시 격자 간격은 fs/M이지만 실제 관측 정보가 늘어난 것은 아닙니다."]}
};
let quizChoice="",quizStage="";
function renderQuestion(experiment){
 const q=questions[experiment],changed=quizStage!==experiment;
 if(changed){quizChoice="";quizStage=experiment}
 $("fft-r-quiz-question").textContent=tr(q.q);
 const select=$("fft-r-quiz-answers");
 const old=changed?"":quizChoice;
 select.replaceChildren();
 const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent=tr(["Select an answer","답을 선택하세요"],true);select.append(placeholder);
 q.choices.forEach((label,index)=>{const opt=document.createElement("option");opt.value=String(index);opt.textContent=tr(label,true);select.append(opt)});
 select.value=old;
 const feedback=$("fft-r-quiz-feedback");feedback.textContent="";feedback.dataset.result="";
}
function checkQuestion(){
 const q=questions[quizStage],value=$("fft-r-quiz-answers").value,feedback=$("fft-r-quiz-feedback");
 if(value===""){feedback.textContent=tr(["Select an answer first.","먼저 답을 선택하세요."]);feedback.dataset.result="pending";return}
 const correct=Number(value)===q.correct;
 feedback.dataset.result=correct?"correct":"incorrect";
 feedback.textContent=(correct?tr(["Correct.","정답입니다."]):tr(["Not yet. Review the graph, change a control and try again.","그래프와 조절값을 다시 관찰하고 재도전하세요."]))+"\n"+(correct?tr(q.why):"");
}

function init(){
 global.SSMathCore?.install?.();
 global.ELSLanguage?.bindSelect?.("#fft-r-language");
 ["fft-r-experiment","fft-r-fs","fft-r-n","fft-r-separation","fft-r-offset","fft-r-window","fft-r-padding"].forEach(id=>$(id).addEventListener(id==="fft-r-separation"||id==="fft-r-offset"?"input":"change",run));
 $("fft-r-experiment").addEventListener("change",()=>{
  const exp=$("fft-r-experiment").value;
  if(exp==="padding"){$("fft-r-offset").value=".35";$("fft-r-n").value="64"}
  run();
 });
 $("fft-r-quiz-answers").addEventListener("change",e=>{quizChoice=e.target.value;$("fft-r-quiz-feedback").textContent="";});
 $("fft-r-quiz-check").addEventListener("click",checkQuestion);
 $("fft-r-challenge-check").addEventListener("click",checkChallenge);
 global.ELSLanguage?.subscribe?.(()=>{renderLabels();run()});
 renderLabels();run();
}
global.SSFFTResolution=Object.freeze({analyze,dftMagnitude});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);
