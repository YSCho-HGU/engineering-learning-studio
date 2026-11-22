/* Part A signal laboratories: original deterministic synthesis; canvas plots and user-initiated sound.
   Spectrum in Harmonics is a theoretical line spectrum, not an FFT measurement.
   Chirp spectrogram uses a radix-2 FFT with Hann windows over a finite record. */
(()=>{
"use strict";
const MODES=["harmonics","chirp","helix"];
const params=new URLSearchParams(location.search);
const lab=MODES.includes(params.get("lab"))?params.get("lab"):"harmonics";
const language=window.ELSLanguage;
const state={
 harmonics:{f0:220,n:6,preset:"square",custom:[1,.42,.23,.15,.1,.07,.04,.03]},
 chirp:{f0:220,f1:1200,T:2,window:512,pos:46},
 helix:{f:1.5,sigma:0,pos:38,playing:false}
}[lab];
const initial=JSON.parse(JSON.stringify(state));
const $=id=>document.getElementById(id);
const plotCanvases=[1,2,3].map(i=>$("ss-al-canvas-"+i));
let audioContext=null,audioSource=null,framePending=false,lastFrame=0,animationId=null,previousTime=0;
const labels={
 harmonics:{
  title:["Harmonics & Sound","조화파와 소리"],sub:["Explore how a periodic waveform and its harmonic amplitudes create an audible timbre.","주기 신호의 파형과 조화파 크기가 소리의 음색을 만드는 과정을 관찰합니다."],
  control:["Tone and harmonic mix","소리와 조화파 구성"],
  notes:[["Keep the fundamental fixed, change the harmonic count, then listen and compare the waveform and line spectrum.","기본주파수를 고정하고 조화파 개수를 바꾼 다음 파형·선 스펙트럼·소리를 비교합니다."],["Select a different waveform preset. Which harmonics appear or disappear?","파형 프리셋을 바꾸면 어떤 조화파가 생기거나 사라지는지 관찰합니다."],["Use Custom to change individual harmonic amplitudes. Predict the sound before playing it.","Custom에서 각 조화파의 크기를 변경하고 재생 전에 음색을 예측합니다."]],
  insight:["A harmonic line spectrum shows components at integer multiples of f₀. Timbre depends on their amplitudes and phases; this model uses zero sine-phase offsets. Audio playback is synthesized, not recorded.","조화파 선 스펙트럼은 f₀의 정수배에 존재합니다. 음색은 조화파의 크기와 위상에 영향을 받으며, 여기서는 각 사인 성분의 위상 오프셋을 0으로 둡니다. 소리는 녹음이 아닌 합성음입니다."]
 },
 chirp:{
  title:["Chirp & Spectrogram","처프와 스펙트로그램"],sub:["Change a sweep and compare its local waveform, instantaneous frequency, and FFT-based spectrogram.","처프의 주파수를 변화시키면서 국소 파형·순간주파수·FFT 기반 스펙트로그램을 비교합니다."],
  control:["Frequency sweep settings","주파수 스윕 설정"],
  notes:[["Increase the ending frequency. Follow the rising ridge in the spectrogram.","끝 주파수를 높이고 스펙트로그램의 능선이 위로 이동하는 모습을 관찰합니다."],["Change the STFT window. Compare time localization with frequency concentration.","STFT 윈도 길이를 바꾸고 시간 위치와 주파수 집중도를 비교합니다."],["Move the observation time to see the oscillations become closer together.","관찰 시간을 이동해 파형의 진동 간격이 변하는 것을 확인합니다."]],
  insight:["The spectrogram is computed from successive finite-window FFTs. Its frequency ridge is approximate; finite windows trade time localization against frequency selectivity. The white line is the ideal instantaneous-frequency model.","스펙트로그램은 유한 윈도 구간마다 FFT를 계산해 만듭니다. 주파수 능선은 근사 결과이며 윈도 길이는 시간·주파수 국소화 사이에 상충 관계가 있습니다. 흰 선은 이상적인 순간주파수 모델입니다."]
 },
 helix:{
  title:["Complex Exponential · 3D Helix","복소지수함수 · 3D 나선"],sub:["Connect a rotating complex exponential to a 3D helix, a complex-plane phasor, and real/imaginary time signals.","회전하는 복소지수함수를 3D 나선, 복소평면 페이저, 실수부·허수부 시간 신호로 연결합니다."],
  control:["Rotation and growth","회전 및 진폭 변화 설정"],
  notes:[["Set σ = 0 and observe constant-radius rotation. Track the real and imaginary projections.","σ=0에서 반지름이 일정한 회전을 관찰하고 실수부·허수부 투영을 비교합니다."],["Change σ to a negative value. The helix contracts as the complex magnitude decays.","σ를 음수로 바꾸면 복소 신호의 크기가 감소하면서 나선 반지름이 줄어듭니다."],["Increase f while holding σ fixed. Compare helix turns with real/imaginary periods.","σ를 고정하고 f를 높여 나선 회전수와 실수부·허수부 주기를 비교합니다."]],
  insight:["x(t) = exp[(σ+j2πf)t] has magnitude exp(σt) and phase 2πft. The 3D projection uses a common scale to keep growth and decay visible; the complex-plane view shows the phasor at the selected time.","x(t)=exp[(σ+j2πf)t]의 크기는 exp(σt), 위상은 2πft입니다. 3D 투영은 증가·감쇠를 화면에 표시하기 위해 공통 축척을 사용하고, 복소평면에는 선택한 시각의 페이저를 나타냅니다."]
 }
};
const mode=()=>language?.get?.()||"mixed";
const tx=(en,ko,compact=false)=>mode()==="en"?en:mode()==="ko"?ko:compact?en+" · "+ko:en+"\n"+ko;
function clear(node){node.replaceChildren()}
function elt(tag,className,text,parent){
 const x=document.createElement(tag);
 if(className)x.className=className;
 if(text!==undefined&&text!==null)x.textContent=text;
 if(parent)parent.append(x);
 return x;
}
function measurePalette(){
 const cs=getComputedStyle(document.documentElement),v=name=>cs.getPropertyValue(name).trim();
 return {ink:v("--els-ink")||"#e8e9e6",muted:v("--els-muted")||"#a9b7b0",link:v("--els-link")||"#9bcbb4",border:v("--els-border")||"#666e66",surface:v("--els-surface")||"#1c1c1c",alt:v("--els-surface-alt")||"#2a2e2b",second:document.documentElement.dataset.theme==="light"?"#ba643c":"#f0b68d"};
}
function renderHeader(){
 const info=labels[lab];
 $("ss-al-title").textContent=tx(...info.title,true);
 $("ss-al-subtitle").textContent=tx(...info.sub);
 $("ss-al-controls-title").textContent=tx("Experiment Controls","실험 변수",true);
 $("ss-al-controls-subtitle").textContent=tx(...info.control);
 $("ss-al-focus").textContent=tx($("ss-al-root").classList.contains("focus")?"Exit focus":"Focus on graphs",$("ss-al-root").classList.contains("focus")?"전체 화면으로 돌아가기":"그래프 집중 보기",true);
 $("ss-al-return").textContent=tx("Back to Applications","Applications 목차로",true);
 $("ss-al-panel-toggle").textContent=tx($("ss-al-root").classList.contains("controls-hidden")?"Show controls":"Hide controls",$("ss-al-root").classList.contains("controls-hidden")?"변수 설정 보기":"변수 설정 접기",true);
 document.querySelectorAll("[data-lab-link]").forEach(a=>{
  const key=a.dataset.labLink;
  const titles={harmonics:["01 · Harmonics & Sound","01 · 조화파와 소리"],chirp:["02 · Chirp Explorer","02 · 처프 탐구"],helix:["03 · Complex Exponential Helix","03 · 복소지수함수 나선"]};
  a.textContent=tx(...titles[key],true);
  if(key===lab)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
 });
 document.title=tx(...info.title,true)+" | Signals & Systems";
}
function fieldRange(host,options){
 const field=elt("div","ss-al-field",null,host);
 const heading=elt("div","ss-al-field-top",null,field);
 const lbl=elt("label",null,tx(options.en,options.ko,true),heading);
 const display=elt("output",null,options.format(state[options.key]),heading);
 const range=elt("input",null,null,field);
 range.type="range";range.min=String(options.min);range.max=String(options.max);range.step=String(options.step);
 range.value=String(state[options.key]);range.id="ctl-"+options.key;lbl.htmlFor=range.id;
 range.addEventListener("input",()=>{
  state[options.key]=Number(range.value);display.textContent=options.format(state[options.key]);
  scheduleDraw();
 });
 return range;
}
function fieldSelect(host,options){
 const field=elt("div","ss-al-field",null,host);
 const lbl=elt("label","ss-al-field-top",tx(options.en,options.ko,true),field);
 const select=elt("select",null,null,field);
 select.id="ctl-"+options.key;lbl.htmlFor=select.id;
 options.values.forEach(([value,en,ko])=>{const op=elt("option",null,tx(en,ko,true),select);op.value=String(value)});
 select.value=String(state[options.key]);
 select.addEventListener("change",()=>{state[options.key]=options.number?Number(select.value):select.value;if(options.rebuild)renderControls();scheduleDraw()});
 return select;
}
function harmonicWeights(){
 const out=[];
 for(let k=1;k<=state.n;k++){
  const v=state.preset==="sine"?(k===1?1:0):state.preset==="square"?(k%2?1/k:0):state.preset==="saw"?((k%2?1:-1)/k):state.custom[k-1];
  out.push(v);
 }
 return out;
}
function harmonicAt(t,weights=harmonicWeights()){
 let sum=0;for(let k=0;k<weights.length;k++)sum+=weights[k]*Math.sin(2*Math.PI*(k+1)*state.f0*t);
 return sum;
}
function chirpPhase(t){
 const rate=(state.f1-state.f0)/state.T;
 return 2*Math.PI*(state.f0*t+0.5*rate*t*t);
}
function chirpFrequency(t){return state.f0+(state.f1-state.f0)*t/state.T}
function helixValue(t){const amp=Math.exp(state.sigma*t),phi=2*Math.PI*state.f*t;return{re:amp*Math.cos(phi),im:amp*Math.sin(phi),amp,phi}}
function renderControls(){
 const host=$("ss-al-control-fields");clear(host);
 const audio=$("ss-al-audio");clear(audio);
 if(lab==="harmonics"){
  fieldSelect(host,{key:"preset",en:"Harmonic preset",ko:"조화파 유형",values:[["sine","Pure sine","단일 정현파"],["square","Square-wave approximation","사각파 근사"],["saw","Sawtooth approximation","톱니파 근사"],["custom","Custom amplitudes","개별 크기 조절"]],rebuild:true});
  fieldRange(host,{key:"f0",en:"Fundamental frequency f₀",ko:"기본주파수 f₀",min:110,max:880,step:10,format:v=>v+" Hz"});
  fieldRange(host,{key:"n",en:"Number of harmonics N",ko:"조화파 개수 N",min:1,max:8,step:1,format:v=>String(v)});
  if(state.preset==="custom"){
   const custom=elt("div","ss-al-harmonic-sliders",null,host);
   elt("h3",null,tx("Individual harmonic amplitudes","조화파별 진폭",true),custom);
   for(let k=1;k<=8;k++){
    if(k>state.n)break;
    const line=elt("div","ss-al-field",null,custom);
    const top=elt("div","ss-al-field-top",null,line);
    const label=elt("label",null,"A"+k,top),out=elt("output",null,state.custom[k-1].toFixed(2),top);
    const input=elt("input",null,null,line);input.type="range";input.min="0";input.max="1";input.step=".05";input.value=String(state.custom[k-1]);input.id="harmonic-"+k;label.htmlFor=input.id;
    input.addEventListener("input",()=>{state.custom[k-1]=Number(input.value);out.textContent=state.custom[k-1].toFixed(2);scheduleDraw()});
   }
  }
 }else if(lab==="chirp"){
  fieldRange(host,{key:"f0",en:"Starting frequency",ko:"시작 주파수",min:100,max:1000,step:20,format:v=>v+" Hz"});
  fieldRange(host,{key:"f1",en:"Ending frequency",ko:"끝 주파수",min:100,max:2400,step:20,format:v=>v+" Hz"});
  fieldRange(host,{key:"T",en:"Sweep duration",ko:"스윕 시간",min:0.5,max:4,step:.25,format:v=>v.toFixed(2)+" s"});
  fieldSelect(host,{key:"window",en:"STFT window size",ko:"STFT 윈도 크기",values:[[128,"128 samples","128 샘플"],[256,"256 samples","256 샘플"],[512,"512 samples","512 샘플"],[1024,"1024 samples","1024 샘플"]],number:true});
  fieldRange(host,{key:"pos",en:"Observation time",ko:"관찰 시각",min:0,max:100,step:1,format:v=>v+"%"});
 }else{
  fieldRange(host,{key:"f",en:"Rotation frequency f",ko:"회전 주파수 f",min:.5,max:4,step:.1,format:v=>v.toFixed(1)+" Hz"});
  fieldRange(host,{key:"sigma",en:"Growth / decay σ",ko:"증가·감쇠율 σ",min:-.7,max:.7,step:.05,format:v=>v.toFixed(2)+" s⁻¹"});
  fieldRange(host,{key:"pos",en:"Selected time",ko:"선택 시각",min:0,max:100,step:1,format:v=>(3*v/100).toFixed(2)+" s"});
  const actions=elt("div","ss-al-control-buttons",null,host);
  const play=elt("button",null,tx(state.playing?"Pause animation":"Play animation",state.playing?"일시 정지":"애니메이션 재생",true),actions);play.type="button";play.id="ss-al-play-motion";
  play.addEventListener("click",()=>{
   state.playing=!state.playing;
   play.textContent=tx(state.playing?"Pause animation":"Play animation",state.playing?"일시 정지":"애니메이션 재생",true);
   if(state.playing){previousTime=0;animationId=requestAnimationFrame(animate)}else if(animationId!==null){cancelAnimationFrame(animationId);animationId=null}
  });
 }
 if(lab!=="helix"){
  const buttons=elt("div","ss-al-control-buttons",null,audio);
  const play=elt("button","ss-al-primary",tx("▶ Play sound","▶ 소리 재생",true),buttons);play.type="button";
  const stop=elt("button",null,tx("■ Stop","■ 정지",true),buttons);stop.type="button";
  const status=elt("p","ss-al-audio-status",tx("Sound starts only when Play is selected. Keep headphone volume low.","재생 버튼을 누른 경우에만 소리가 시작됩니다. 이어폰 음량을 낮춰주세요."),audio);
  status.setAttribute("role","status");
  play.addEventListener("click",()=>playAudio(status));
  stop.addEventListener("click",()=>{stopAudio();status.textContent=tx("Sound stopped.","재생이 정지되었습니다.")});
 }
 const guide=$("ss-al-guidance");clear(guide);
 elt("strong",null,tx("Try this sequence","탐구 순서",true),guide);
 const list=elt("ol",null,null,guide);
 labels[lab].notes.forEach(x=>elt("li",null,tx(...x),list));
}
function plotTitles(){
 const titles={
  harmonics:[["Periodic waveform (time domain)","주기 파형 (시간영역)"],["Harmonic line spectrum","조화파 선 스펙트럼"]],
  chirp:[["STFT spectrogram (Hann window)","STFT 스펙트로그램 (Hann 창)"],["Waveform near selected time","선택한 시각 부근의 파형"],["Instantaneous frequency model","순간주파수 모델"]],
  helix:[["3D helix of x(t)","x(t)의 3D 나선"],["Complex-plane phasor at t","t에서의 복소평면 페이저"],["Real / imaginary parts over time","시간에 따른 실수부·허수부"]]
 }[lab];
 for(let i=1;i<=3;i++){
  $("ss-al-third").hidden=lab==="harmonics";
  const title=$("ss-al-plot-title-"+i);
  const note=$("ss-al-note-"+i);
  if(i<=titles.length)title.textContent=tx(...titles[i-1],true);
  note.textContent="";
 }
 $("ss-al-charts").dataset.kind=lab;
 const eq={
  harmonics:"x(t) = ∑<sub>k=1</sub><sup>N</sup> A<sub>k</sub> sin(2πkf<sub>0</sub>t)",
  chirp:"f(t) = f<sub>0</sub> + (f<sub>1</sub> − f<sub>0</sub>)t/T",
  helix:"x(t) = e<sup>(σ + j2πf)t</sup> = e<sup>σt</sup>[cos(2πft) + j sin(2πft)]"
 };
 $("ss-al-equation").innerHTML=eq[lab];
 $("ss-al-insight").textContent=tx(...labels[lab].insight);
}
function metric(label,value){
 const d=elt("div","ss-al-metric");
 elt("span","ss-al-metric-label",label,d);
 elt("strong","ss-al-metric-value",String(value),d);
 return d;
}
function renderMetrics(){
 const host=$("ss-al-metrics");clear(host);
 let values;
 if(lab==="harmonics"){
  const w=harmonicWeights();values=[
   [tx("Fundamental","기본주파수",true),state.f0+" Hz"],
   [tx("Period T₀","주기 T₀",true),(1000/state.f0).toFixed(2)+" ms"],
   [tx("Active harmonics","유효 조화파",true),w.filter(x=>Math.abs(x)>.00001).length],
   [tx("Highest component","최고 주파수 성분",true),(Math.max(1,...w.map((v,k)=>Math.abs(v)>.00001?k+1:0))*state.f0)+" Hz"]
  ];
 }else if(lab==="chirp"){
  const t=state.T*state.pos/100;
  values=[[tx("Start frequency","시작 주파수",true),state.f0+" Hz"],[tx("End frequency","끝 주파수",true),state.f1+" Hz"],[tx("Selected f(t)","선택 순간주파수",true),Math.round(chirpFrequency(t))+" Hz"],[tx("STFT window","STFT 윈도",true),(1000*state.window/8192).toFixed(1)+" ms"]];
 }else{
  const t=3*state.pos/100,v=helixValue(t);
  values=[[tx("Selected time","선택 시각",true),t.toFixed(2)+" s"],[tx("Magnitude |x(t)|","크기 |x(t)|",true),v.amp.toFixed(3)],[tx("Real part","실수부",true),v.re.toFixed(3)],[tx("Imaginary part","허수부",true),v.im.toFixed(3)]];
 }
 values.forEach(x=>host.append(metric(...x)));
}
function chartContext(canvas){
 const rect=canvas.getBoundingClientRect();
 const w=Math.max(120,rect.width),h=Math.max(120,rect.height),dpr=Math.min(2,window.devicePixelRatio||1);
 const cw=Math.round(w*dpr),ch=Math.round(h*dpr);
 if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}
 const c=canvas.getContext("2d");if(!c)return null;
 c.setTransform(dpr,0,0,dpr,0,0);
 const pal=measurePalette();
 c.fillStyle=pal.surface;c.fillRect(0,0,w,h);
 return{ctx:c,w,h,pal};
}
function chartBox(C,{xMin,xMax,yMin,yMax,xLabel,yLabel,xTicks=4,yTicks=4}){
 const {ctx:c,w,h,pal}=C,rect={l:57,r:w-14,t:15,b:h-41};
 rect.w=Math.max(30,rect.r-rect.l);rect.h=Math.max(30,rect.b-rect.t);
 const px=x=>rect.l+rect.w*(x-xMin)/(xMax-xMin);
 const py=y=>rect.b-rect.h*(y-yMin)/(yMax-yMin);
 c.lineWidth=1;c.font="11px Arial, sans-serif";
 for(let i=0;i<=xTicks;i++){
  const x=xMin+(xMax-xMin)*i/xTicks,X=px(x);
  c.beginPath();c.moveTo(X,rect.t);c.lineTo(X,rect.b);c.strokeStyle=pal.border;c.globalAlpha=.24;c.stroke();c.globalAlpha=1;
  c.fillStyle=pal.muted;c.textAlign="center";c.fillText(formatTick(x),X,rect.b+17);
 }
 for(let i=0;i<=yTicks;i++){
  const y=yMin+(yMax-yMin)*i/yTicks,Y=py(y);
  c.beginPath();c.moveTo(rect.l,Y);c.lineTo(rect.r,Y);c.strokeStyle=pal.border;c.globalAlpha=.24;c.stroke();c.globalAlpha=1;
  c.fillStyle=pal.muted;c.textAlign="right";c.fillText(formatTick(y),rect.l-6,Y+4);
 }
 c.strokeStyle=pal.muted;c.globalAlpha=.65;c.strokeRect(rect.l,rect.t,rect.w,rect.h);c.globalAlpha=1;
 c.font="12px Arial, sans-serif";c.fillStyle=pal.ink;
 c.textAlign="center";c.fillText(xLabel,rect.l+rect.w/2,h-6);
 c.save();c.translate(15,rect.t+rect.h/2);c.rotate(-Math.PI/2);c.fillText(yLabel,0,0);c.restore();
 return{rect,px,py};
}
function formatTick(n){if(Math.abs(n)>=1000)return Number(n).toFixed(0);if(Math.abs(n)>=10)return Number(n).toFixed(n%1?1:0);return Number(n).toFixed(Math.abs(n)<.1?2:Math.abs(n)<1?1:0)}
function poly(C,box,points,color,width=2){
 const c=C.ctx;if(!points.length)return;
 c.beginPath();points.forEach((p,i)=>{const x=box.px(p[0]),y=box.py(p[1]);if(i===0)c.moveTo(x,y);else c.lineTo(x,y)});
 c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function dot(ctx,x,y,color,r=5){
 ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();ctx.lineWidth=1;ctx.strokeStyle="#ffffff";ctx.stroke();
}
function drawHarmonics(){
 const weights=harmonicWeights(),amp=Math.max(1,weights.reduce((a,b)=>a+Math.abs(b),0));
 let C=chartContext(plotCanvases[0]);if(C){
  const limit=5/state.f0,box=chartBox(C,{xMin:0,xMax:limit*1000,yMin:-amp*1.12,yMax:amp*1.12,xLabel:"t (ms)",yLabel:"x(t)"});
  const pts=[];for(let i=0;i<=950;i++){const t=limit*i/950;pts.push([t*1000,harmonicAt(t,weights)])}
  poly(C,box,pts,C.pal.link,2.2);
 }
 C=chartContext(plotCanvases[1]);if(C){
  const xmax=state.n*state.f0*1.08,box=chartBox(C,{xMin:0,xMax:xmax,yMin:0,yMax:1.15,xLabel:"f (Hz)",yLabel:"|Aₖ|"});
  const c=C.ctx;c.lineWidth=3;
  weights.forEach((v,k)=>{
   const x=box.px((k+1)*state.f0),y=box.py(Math.abs(v));
   c.strokeStyle=C.pal.link;c.beginPath();c.moveTo(x,box.py(0));c.lineTo(x,y);c.stroke();dot(c,x,y,C.pal.link,3.5);
   c.font="11px Arial";c.textAlign="center";c.fillStyle=C.pal.muted;c.fillText("k="+(k+1),x,Math.max(box.rect.t+10,y-11));
  });
 }
 $("ss-al-note-1").textContent=tx("Five fundamental periods; the harmonic sum is plotted without audio loudness normalization.","기본 주기 5개를 표시합니다. 파형은 음량 정규화 전의 조화파 합입니다.");
 $("ss-al-note-2").textContent=tx("Analytical harmonic amplitudes at kf₀ (a line spectrum, not an FFT measurement).","kf₀에 있는 이론적 조화파 크기입니다. FFT 측정값이 아닌 선 스펙트럼입니다.");
}
function radixFFT(re,im){
 const n=re.length;
 for(let i=1,j=0;i<n;i++){
  let bit=n>>1;
  for(;j&bit;bit>>=1)j^=bit;
  j^=bit;
  if(i<j){let tmp=re[i];re[i]=re[j];re[j]=tmp;tmp=im[i];im[i]=im[j];im[j]=tmp}
 }
 for(let len=2;len<=n;len<<=1){
  const a=-2*Math.PI/len,cs=Math.cos(a),sn=Math.sin(a);
  for(let i=0;i<n;i+=len){
   let wr=1,wi=0;
   for(let j=0;j<len/2;j++){
    const k=i+j,h=k+len/2,tr=wr*re[h]-wi*im[h],ti=wr*im[h]+wi*re[h];
    re[h]=re[k]-tr;im[h]=im[k]-ti;re[k]+=tr;im[k]+=ti;
    const nextR=wr*cs-wi*sn;wi=wr*sn+wi*cs;wr=nextR;
   }
  }
 }
}
function spectrogram(){
 const fs=8192,N=state.window,T=state.T,frameCount=110;
 const sampleCount=Math.floor(T*fs),lastStart=Math.max(0,sampleCount-N),maxFreq=Math.min(3000,Math.max(1200,state.f0,state.f1)*1.2);
 const spectra=[],times=[],freqBins=Math.min(N/2,Math.ceil(maxFreq*N/fs));
 let maxMag=0;
 for(let frame=0;frame<frameCount;frame++){
  const start=Math.round(lastStart*frame/(frameCount-1)),re=new Float64Array(N),im=new Float64Array(N);
  for(let i=0;i<N;i++){
   const t=(start+i)/fs,window=.5-.5*Math.cos(2*Math.PI*i/(N-1));
   re[i]=Math.sin(chirpPhase(t))*window;
  }
  radixFFT(re,im);
  const m=new Float64Array(freqBins+1);
  for(let i=0;i<=freqBins;i++){m[i]=Math.hypot(re[i],im[i]);if(m[i]>maxMag)maxMag=m[i]}
  spectra.push(m);times.push((start+N/2)/fs);
 }
 return{spectra,times,fs,N,maxMag,maxFreq};
}
function heatColor(v){
 v=Math.max(0,Math.min(1,v));
 const stops=[[8,20,33],[35,66,93],[66,139,152],[165,205,149],[247,226,140]];
 const p=Math.min(3,Math.floor(v*4)),t=v*4-p,a=stops[p],b=stops[p+1];
 return"rgb("+a.map((n,i)=>Math.round(n+(b[i]-n)*t)).join(",")+")";
}
function drawChirp(){
 const S=spectrogram(),C=chartContext(plotCanvases[0]);
 if(C){
  const c=C.ctx,box=chartBox(C,{xMin:0,xMax:state.T,yMin:0,yMax:S.maxFreq,xLabel:"t (s)",yLabel:"f (Hz)"});
  const cols=S.spectra.length,fBins=S.spectra[0].length,floor=-65;
  const dx=box.rect.w/cols,dy=box.rect.h/(fBins-1);
  for(let k=0;k<cols;k++){
   const mags=S.spectra[k];
   for(let b=0;b<fBins;b++){
    const db=20*Math.log10(Math.max(1e-12,mags[b]/Math.max(1e-12,S.maxMag)));
    const v=Math.max(0,(db-floor)/(-floor));
    c.fillStyle=heatColor(v);
    c.fillRect(box.rect.l+k*dx,box.py(b*S.fs/S.N)-dy/2,dx+1,dy+1);
   }
  }
  c.strokeStyle="#fdf4e3";c.lineWidth=1.5;c.setLineDash([5,4]);c.beginPath();
  for(let i=0;i<=200;i++){const t=state.T*i/200;const x=box.px(t),y=box.py(chirpFrequency(t));if(i===0)c.moveTo(x,y);else c.lineTo(x,y)}
  c.stroke();c.setLineDash([]);
  const selected=state.T*state.pos/100;
  c.strokeStyle="#ffffff";c.globalAlpha=.65;c.setLineDash([3,4]);c.beginPath();c.moveTo(box.px(selected),box.rect.t);c.lineTo(box.px(selected),box.rect.b);c.stroke();c.setLineDash([]);c.globalAlpha=1;
 }
 let B=chartContext(plotCanvases[1]);if(B){
  const center=state.T*state.pos/100,span=.045;
  const begin=Math.max(0,Math.min(state.T-span,center-span/2)),end=Math.min(state.T,begin+span);
  const box=chartBox(B,{xMin:begin*1000,xMax:end*1000,yMin:-1.15,yMax:1.15,xLabel:"t (ms)",yLabel:"x(t)"});
  const samples=[];for(let i=0;i<=600;i++){const t=begin+(end-begin)*i/600;samples.push([t*1000,Math.sin(chirpPhase(t))])}
  poly(B,box,samples,B.pal.link,1.8);
 }
 B=chartContext(plotCanvases[2]);if(B){
  const ymax=Math.max(400,state.f0,state.f1)*1.2;
  const box=chartBox(B,{xMin:0,xMax:state.T,yMin:0,yMax:ymax,xLabel:"t (s)",yLabel:"f(t) Hz"});
  const pts=[];for(let i=0;i<=100;i++){const t=state.T*i/100;pts.push([t,chirpFrequency(t)])}
  poly(B,box,pts,B.pal.link,2.3);
  const t=state.T*state.pos/100;dot(B.ctx,box.px(t),box.py(chirpFrequency(t)),B.pal.second,5);
 }
 $("ss-al-note-1").textContent=tx("FFT magnitude relative to the maximum, shown across a 65 dB display range; dashed curve = ideal f(t).","최대값에 대한 FFT 크기를 약 65 dB 범위로 표시합니다. 점선은 이상적인 f(t)입니다.");
 $("ss-al-note-2").textContent=tx("A 45 ms waveform excerpt near the selected time.","선택 시각 부근의 45 ms 구간 파형입니다.");
 $("ss-al-note-3").textContent=tx("Theoretical instantaneous frequency of the linear chirp.","선형 처프의 이론적 순간주파수입니다.");
}
function drawHelix(){
 const T=3,peak=Math.exp(Math.max(0,state.sigma)*T),tSelected=T*state.pos/100,v=helixValue(tSelected);
 let C=chartContext(plotCanvases[0]);if(C){
  const c=C.ctx,w=C.w,h=C.h,center=h*.51,startX=63,endX=w-58,scale=Math.min(h*.23,130)/peak;
  const proj=(t,re,im)=>[startX+(endX-startX)*t/T+im*scale*.42,center-re*scale-im*scale*.37];
  c.strokeStyle=C.pal.border;c.lineWidth=1.5;c.beginPath();let a=proj(0,0,0),b=proj(T,0,0);c.moveTo(...a);c.lineTo(...b);c.stroke();
  c.beginPath();c.moveTo(...proj(0,-peak,0));c.lineTo(...proj(0,peak,0));c.moveTo(...proj(0,0,-peak));c.lineTo(...proj(0,0,peak));c.stroke();
  c.fillStyle=C.pal.ink;c.font="12px Arial";c.textAlign="left";
  c.fillText("t",Math.min(w-20,b[0]+12),b[1]+5);let R=proj(0,peak,0),I=proj(0,0,peak);
  c.fillText("Re",R[0]-20,R[1]-8);c.fillText("Im",I[0]+6,I[1]-4);
  c.strokeStyle=C.pal.link;c.lineWidth=2.25;c.beginPath();
  for(let i=0;i<=1300;i++){const t=T*i/1300,x=helixValue(t),p=proj(t,x.re,x.im);if(i===0)c.moveTo(...p);else c.lineTo(...p)}c.stroke();
  const pp=proj(tSelected,v.re,v.im),base=proj(tSelected,0,0);
  c.setLineDash([4,4]);c.strokeStyle=C.pal.muted;c.beginPath();c.moveTo(...base);c.lineTo(...pp);c.stroke();c.setLineDash([]);
  dot(c,pp[0],pp[1],C.pal.second,6);
  c.font="11px Arial";c.fillStyle=C.pal.muted;c.fillText("time axis →",Math.max(70,w*.43),center+22);
  c.fillText(tx("3D projection","3D 투영",true),14,22);
 }
 C=chartContext(plotCanvases[1]);if(C){
  const c=C.ctx,w=C.w,h=C.h,cx=w*.52,cy=h*.51,range=peak*1.18,r=Math.min((w-80)/2,(h-55)/2)/range;
  c.strokeStyle=C.pal.border;c.lineWidth=1;c.beginPath();c.moveTo(37,cy);c.lineTo(w-18,cy);c.moveTo(cx,18);c.lineTo(cx,h-34);c.stroke();
  c.strokeStyle=C.pal.muted;c.globalAlpha=.45;c.beginPath();c.arc(cx,cy,r,0,2*Math.PI);c.stroke();c.globalAlpha=1;
  c.strokeStyle=C.pal.link;c.lineWidth=2.5;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+v.re*r,cy-v.im*r);c.stroke();
  dot(c,cx+v.re*r,cy-v.im*r,C.pal.second,5);
  c.fillStyle=C.pal.ink;c.font="12px Arial";c.fillText("Re",w-31,cy-9);c.fillText("Im",cx+7,17);
  c.fillStyle=C.pal.muted;c.font="11px Arial";c.fillText("t = "+tSelected.toFixed(2)+" s",18,h-12);
 }
 C=chartContext(plotCanvases[2]);if(C){
  const box=chartBox(C,{xMin:0,xMax:T,yMin:-1.12*peak,yMax:1.12*peak,xLabel:"t (s)",yLabel:"Re / Im"});
  const real=[],imag=[];for(let i=0;i<=800;i++){const t=T*i/800,x=helixValue(t);real.push([t,x.re]);imag.push([t,x.im])}
  poly(C,box,real,C.pal.link,2);
  poly(C,box,imag,C.pal.second,1.9);
  const c=C.ctx;c.strokeStyle=C.pal.muted;c.globalAlpha=.8;c.setLineDash([4,4]);c.beginPath();c.moveTo(box.px(tSelected),box.rect.t);c.lineTo(box.px(tSelected),box.rect.b);c.stroke();c.setLineDash([]);c.globalAlpha=1;
  c.fillStyle=C.pal.link;c.textAlign="right";c.font="12px Arial";c.fillText("Re",box.rect.r-6,box.rect.t+15);
  c.fillStyle=C.pal.second;c.fillText("Im",box.rect.r-6,box.rect.t+30);
 }
 $("ss-al-note-1").textContent=tx("Time runs along the main axis. Re and Im create the rotating helix.","시간은 긴 축 방향으로 진행하고 실수부와 허수부가 회전하는 나선을 만듭니다.");
 $("ss-al-note-2").textContent=tx("Phasor at the chosen time; radius equals e^(σt).","선택 시각의 페이저이며 반지름은 e^(σt)입니다.");
 $("ss-al-note-3").textContent=tx("Projections onto the real and imaginary time axes.","실수부 및 허수부의 시간축 투영입니다.");
}
function draw(){
 framePending=false;lastFrame=performance.now();
 renderMetrics();
 if(lab==="harmonics")drawHarmonics();else if(lab==="chirp")drawChirp();else drawHelix();
}
function scheduleDraw(){if(!framePending){framePending=true;requestAnimationFrame(draw)}}
async function playAudio(status){
 stopAudio();
 const Ctx=window.AudioContext||window.webkitAudioContext;
 if(!Ctx){status.textContent=tx("Web Audio is not available in this browser.","이 브라우저에서는 Web Audio를 지원하지 않습니다.");return}
 try{
  if(!audioContext)audioContext=new Ctx();
  await audioContext.resume();
  const sampleRate=audioContext.sampleRate,duration=lab==="harmonics"?2:state.T;
  const count=Math.round(duration*sampleRate),buffer=audioContext.createBuffer(1,count,sampleRate);
  const samples=buffer.getChannelData(0),weights=lab==="harmonics"?harmonicWeights():null;
  const normal=weights?Math.max(1,weights.reduce((a,b)=>a+Math.abs(b),0)):1,fade=Math.min(.025,duration*.08);
  for(let i=0;i<count;i++){
   const t=i/sampleRate,gain=Math.min(1,t/fade,(duration-t)/fade);
   samples[i]=Math.max(-1,Math.min(1,(lab==="harmonics"?harmonicAt(t,weights)/normal:Math.sin(chirpPhase(t)))*gain*.22));
  }
  audioSource=audioContext.createBufferSource();
  audioSource.buffer=buffer;audioSource.connect(audioContext.destination);
  const node=audioSource;node.onended=()=>{if(audioSource===node){audioSource=null;status.textContent=tx("Playback finished.","재생을 마쳤습니다.")}};
  audioSource.start();
  status.textContent=tx("Playing original synthesized sound…","합성음을 재생하고 있습니다…");
 }catch(err){status.textContent=tx("Playback unavailable. Check browser audio permissions.","오디오 재생을 사용할 수 없습니다. 브라우저의 오디오 권한을 확인하세요.");stopAudio()}
}
function stopAudio(){
 if(audioSource){const source=audioSource;audioSource=null;source.onended=null;try{source.stop()}catch(e){}try{source.disconnect()}catch(e){}}
}
function animate(now){
 if(!state.playing)return;
 if(!previousTime)previousTime=now;
 const dt=Math.min(.1,Math.max(0,(now-previousTime)/1000));previousTime=now;
 if(now-lastFrame>35){state.pos=(state.pos+dt/3*100)%100;const slider=$("ctl-pos");if(slider){slider.value=String(state.pos);slider.parentElement.querySelector("output").textContent=(state.pos*3/100).toFixed(2)+" s"}scheduleDraw()}
 animationId=requestAnimationFrame(animate);
}
function onVisibility(){if(document.hidden){stopAudio();if(lab==="helix"&&state.playing){state.playing=false;cancelAnimationFrame(animationId);animationId=null;previousTime=0;renderControls()}}}
function init(){
 renderHeader();plotTitles();renderControls();scheduleDraw();
 $("ss-al-focus").addEventListener("click",()=>{
  const root=$("ss-al-root"),v=!root.classList.contains("focus");root.classList.toggle("focus",v);
  $("ss-al-focus").setAttribute("aria-pressed",String(v));renderHeader();requestAnimationFrame(scheduleDraw);
 });
 $("ss-al-panel-toggle").addEventListener("click",()=>{
  const root=$("ss-al-root"),v=!root.classList.contains("controls-hidden");root.classList.toggle("controls-hidden",v);
  $("ss-al-panel-toggle").setAttribute("aria-expanded",String(!v));renderHeader();requestAnimationFrame(scheduleDraw);
 });
 language?.subscribe?.(()=>{renderHeader();plotTitles();renderControls();scheduleDraw()});
 window.addEventListener("els:themechange",scheduleDraw);
 window.addEventListener("resize",scheduleDraw);
 if(window.ResizeObserver){new ResizeObserver(scheduleDraw).observe($("ss-al-charts"))}
 document.addEventListener("visibilitychange",onVisibility);
 window.addEventListener("pagehide",stopAudio);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();