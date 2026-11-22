/* Applications Part A Labs 4–6: Beats, AM/FM, Sine/Chirp Sampling.
 * All plots are analytic except the Hann-windowed AM/FM 4096-point FFT.
 * The folded chirp frequency is a LOCAL instantaneous-frequency interpretation,
 * not a globally exact reconstructed chirp or a spectrogram calculation. */
(()=>{
"use strict";
const LABS=["beats","amfm","sampling"],allLabs=["harmonics","chirp","helix",...LABS];
const lab=new URLSearchParams(location.search).get("lab");
if(!LABS.includes(lab))return;
const $=id=>document.getElementById(id),canvases=[1,2,3].map(n=>$("ss-al-canvas-"+n));
const state=lab==="beats"?{f1:220,delta:4,ratio:1}:
 lab==="amfm"?{mode:"am",fc:440,fm:8,depth:.65,beta:2.5}:
 {kind:"chirp",fs:70,f0:8,f1:110,tone:38,T:2,pos:50,playing:false};
const initial=JSON.parse(JSON.stringify(state));
const duration=lab==="sampling"?state.T:2;
const language=window.ELSLanguage;
const titleMap={
 harmonics:["01 · Harmonics & Sound","01 · 조화파와 소리"],
 chirp:["02 · Chirp Explorer","02 · 처프 탐구"],
 helix:["03 · Complex Exponential Helix","03 · 복소지수함수 나선"],
 beats:["04 · Beats & Interference","04 · 맥놀이와 간섭"],
 amfm:["05 · AM / FM Modulation","05 · AM / FM 변조"],
 sampling:["06 · Sampling & Aliasing","06 · 표본화와 에일리어싱"]
};
const metadata={
 beats:{
  title:["Beats & Interference","맥놀이와 간섭"],
  subtitle:["Two nearby tones interfere: listen to beating and connect the envelope to the two frequency components.","가까운 두 정현파의 중첩으로 생기는 맥놀이를 듣고 포락선과 주파수 성분을 연결합니다."],
  control:["Two-tone signal","두 정현파 설정"],
  headings:[["Slow beat envelope and waveform","느린 맥놀이 포락선과 합성 파형"],["Carrier cycles: zoomed waveform","고주파 진동: 확대 파형"],["Two-tone line spectrum","두 정현파의 선 스펙트럼"]],
  notes:[["Keep f₁ fixed and increase Δf. Does the loudness fluctuate faster?","f₁을 고정한 뒤 Δf를 높이면 소리 크기 변화가 빨라지는지 관찰하세요."],["Reduce A₂/A₁. Compare the depth of the beat envelope.","A₂/A₁을 줄이면 맥놀이 포락선의 깊이가 어떻게 변하는지 비교하세요."],["Compare the number of line-spectrum peaks with the periodic envelope.","선 스펙트럼의 두 성분과 시간영역의 주기적 포락선 변화를 연결하세요."]],
  insight:["For equal-amplitude tones the envelope magnitude is 2|cos(πΔf t)| and the beat rate is |Δf|. With unequal amplitudes the envelope becomes √(1+a²+2a cos(2πΔf t)). This is superposition, not a nonlinear modulator.","진폭이 같을 때 포락선의 크기는 2|cos(πΔf t)|이고 맥놀이 주파수는 |Δf|입니다. 진폭이 다르면 포락선은 √(1+a²+2a cos(2πΔf t))가 됩니다. 비선형 변조가 아닌 선형 중첩 현상입니다."]
 },
 amfm:{
  title:["AM / FM Modulation","AM / FM 변조"],
  subtitle:["Change how information is carried by amplitude or instantaneous frequency. Compare waveform, message, and computed spectra.","진폭 또는 순간주파수의 변화를 통해 정보를 전달하는 방식을 비교합니다. 파형·정보 신호·계산된 스펙트럼을 연결합니다."],
  control:["Modulation controls","변조 변수 설정"],
  headings:[["Modulated carrier waveform","변조된 반송파"],["Message and modulation behavior","정보 신호와 변조 동작"],["FFT spectrum around the carrier","반송파 주변의 FFT 스펙트럼"]],
  notes:[["Switch AM / FM while keeping fₘ and f꜀ fixed. What changes in the waveform?","fₘ과 f꜀를 고정하고 AM/FM을 바꾸면 파형이 어떻게 달라지나요?"],["In AM, increase m and inspect the upper/lower envelope. In FM, increase β and inspect the frequency swing.","AM에서는 m을 높여 포락선을, FM에서는 β를 높여 주파수 편이를 관찰하세요."],["Compare FFT sidebands around the carrier; explain why AM and FM have different spectral structures.","반송파 주변 FFT 측대역을 비교하고 AM과 FM의 스펙트럼 구조가 다른 이유를 설명하세요."]],
  insight:["AM varies the carrier envelope; with 0≤m≤1 this model avoids overmodulation. FM uses phase 2πf꜀t+βsin(2πfₘt), so its instantaneous frequency is f꜀+βfₘcos(2πfₘt). FFT magnitudes are normalized and shown in dB.","AM은 반송파의 포락선을 변화시키며 이 모델은 0≤m≤1로 과변조를 피합니다. FM의 위상은 2πf꜀t+βsin(2πfₘt)이므로 순간주파수는 f꜀+βfₘcos(2πfₘt)입니다. FFT의 크기는 정규화한 dB로 표시합니다."]
 },
 sampling:{
  title:["Sampling & Aliasing · Sine and Chirp","표본화와 에일리어싱 · 정현파와 처프"],
  subtitle:["Select a sine wave or a linear chirp. Specify sampling frequency fₛ to see the original CT waveform, the discrete sequence x[n], and local frequency folding.","정현파 또는 선형 처프를 선택하고 샘플링 주파수 fₛ를 지정합니다. 원래 CT 파형, DT 수열 x[n], 국소적인 주파수 접힘을 동시에 관찰합니다."],
  control:["Sampling experiment","표본화 실습 변수"],
  headings:[["Continuous-time input and sample instants","연속시간 입력과 표본화 시점"],["Discrete-time sequence x[n]","이산시간 수열 x[n]"],["Original frequency, Nyquist, and folded frequency","원래 주파수·나이퀴스트·접힌 주파수"]],
  notes:[["In Sine mode, change fₛ across 2f₀. Notice that all samples agree with a lower-frequency alias when f₀ exceeds Nyquist.","정현파 모드에서 fₛ를 2f₀의 위아래로 조절해 나이퀴스트 경계와 낮은 주파수의 에일리어스를 관찰하세요."],["Switch to Linear Chirp: keep f₀=8 Hz and f₁=110 Hz, then vary fₛ. Locate each intersection with fₛ/2.","Linear Chirp로 전환하여 f₀=8Hz, f₁=110Hz를 유지한 채 fₛ를 바꾸고 fₛ/2와 만나는 시점을 찾으세요."],["Compare x(t), x[n], and the folded-frequency curve. Lower-frequency segments above Nyquist are aliases, not changes in the source chirp.","x(t)·x[n]·접힌 주파수 곡선을 비교하세요. 나이퀴스트를 넘어 낮아 보이는 주파수는 입력 신호가 바뀐 것이 아니라 에일리어싱입니다."]],
  insight:["Sampling uses x[n]=x(n/fₛ). For a pure tone the signed alias lies in [−fₛ/2,fₛ/2] and its magnitude is the displayed apparent frequency. For a chirp, folding fᵢ(t) modulo fₛ describes LOCAL apparent frequency; it does not imply an exact global aliased chirp or valid recovery without an anti-alias filter. Thin connectors between samples are only visual guides (not sinc reconstruction).","표본화는 x[n]=x(n/fₛ)입니다. 순음의 부호 있는 에일리어스 주파수는 [−fₛ/2,fₛ/2]에 있고 표시된 겉보기 주파수는 그 절댓값입니다. 처프의 fᵢ(t)를 fₛ 기준으로 접는 것은 국소적인 겉보기 주파수 설명이며, 전체 신호가 하나의 정확한 처프로 복원되거나 안티에일리어싱 필터 없이 복원이 가능하다는 뜻은 아닙니다. 표본점 사이의 얇은 연결선은 시각적 안내일 뿐 sinc 복원이 아닙니다."]
 }
};
const lang=()=>language?.get?.()||"mixed";
const txt=(en,ko,compact=false)=>lang()==="en"?en:lang()==="ko"?ko:compact?en+" · "+ko:en+"\n"+ko;
const dom=(tag,cls,text,parent)=>{
 const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined&&text!==null)el.textContent=text;if(parent)parent.appendChild(el);return el;
};
const clear=node=>node.replaceChildren();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let plotDirty=false,lastDraw=0,fftCache=null,playId=null,previousFrame=0,audioCtx=null,source=null,transportId=null,requestId=0;
const audio={playing:false,offset:0,start:0,buffer:null,duration:duration,buttons:null,status:null};
function palette(){
 const c=getComputedStyle(document.documentElement),v=n=>c.getPropertyValue(n).trim();
 return {ink:v("--els-ink")||"#e8e9e6",muted:v("--els-muted")||"#9ba4a1",line:v("--els-link")||"#87c5a5",border:v("--els-border")||"#666",bg:v("--els-surface")||"#171a19",alt:document.documentElement.dataset.theme==="light"?"#b66134":"#ffc08d"};
}
function canvasContext(canvas){
 const rect=canvas.getBoundingClientRect(),w=Math.max(130,rect.width),h=Math.max(130,rect.height),dpr=Math.min(2,window.devicePixelRatio||1);
 const cw=Math.round(w*dpr),ch=Math.round(h*dpr);
 if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}
 const ctx=canvas.getContext("2d");if(!ctx)return null;
 ctx.setTransform(dpr,0,0,dpr,0,0);const pal=palette();
 ctx.fillStyle=pal.bg;ctx.fillRect(0,0,w,h);
 return {ctx,w,h,pal};
}
function tick(n){if(!Number.isFinite(n))return "—";return Math.abs(n)>=100?Math.round(n).toString():Math.abs(n)>=10?n.toFixed(n%1?1:0):n.toFixed(2).replace(/\.?0+$/,"")}
function axes(C,{xmin,xmax,ymin,ymax,xlabel,ylabel,xticks=4,yticks=4}){
 const {ctx:c,w,h,pal}=C,r={l:56,t:20,b:h-42,right:w-15};r.width=r.right-r.l;r.height=r.b-r.t;
 const x=v=>r.l+(v-xmin)/(xmax-xmin)*r.width,y=v=>r.b-(v-ymin)/(ymax-ymin)*r.height;
 c.font="11px Arial, sans-serif";c.lineWidth=1;
 for(let i=0;i<=xticks;i++){const p=xmin+(xmax-xmin)*i/xticks,q=x(p);c.globalAlpha=.26;c.strokeStyle=pal.border;c.beginPath();c.moveTo(q,r.t);c.lineTo(q,r.b);c.stroke();c.globalAlpha=1;c.fillStyle=pal.muted;c.textAlign="center";c.fillText(tick(p),q,r.b+16)}
 for(let i=0;i<=yticks;i++){const p=ymin+(ymax-ymin)*i/yticks,q=y(p);c.globalAlpha=.26;c.strokeStyle=pal.border;c.beginPath();c.moveTo(r.l,q);c.lineTo(r.right,q);c.stroke();c.globalAlpha=1;c.fillStyle=pal.muted;c.textAlign="right";c.fillText(tick(p),r.l-6,q+4)}
 c.strokeStyle=pal.muted;c.strokeRect(r.l,r.t,r.width,r.height);c.fillStyle=pal.ink;c.font="12px Arial, sans-serif";
 c.textAlign="center";c.fillText(xlabel,r.l+r.width/2,h-6);
 c.save();c.translate(15,r.t+r.height/2);c.rotate(-Math.PI/2);c.fillText(ylabel,0,0);c.restore();
 return {x,y,r};
}
function line(C,B,points,color,width=2,dashes=[]){
 const c=C.ctx;c.save();c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dashes);c.beginPath();
 points.forEach(([x,y],i)=>{if(i)c.lineTo(B.x(x),B.y(y));else c.moveTo(B.x(x),B.y(y))});
 c.stroke();c.restore();
}
function circle(c,x,y,color,r=4){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill()}
function hint(C,msg){C.ctx.font="12px Arial, sans-serif";C.ctx.fillStyle=C.pal.muted;C.ctx.textAlign="left";C.ctx.fillText(msg,64,34)}
function legend(C,items){
 const c=C.ctx;let x=62;
 for(const [label,color] of items){
  c.strokeStyle=color;c.lineWidth=2.4;c.beginPath();c.moveTo(x,15);c.lineTo(x+13,15);c.stroke();
  c.fillStyle=C.pal.ink;c.font="11px Arial";c.textAlign="left";c.fillText(label,x+17,19);
  x+=label.length*6.8+38;
  if(x>C.w-80)break;
 }
}
function range(host,{key,en,ko,min,max,step,unit="",digits=0,changed}){
 const box=dom("div","ss-al-field",null,host),top=dom("div","ss-al-field-top",null,box),label=dom("label",null,txt(en,ko,true),top);
 const output=dom("output",null,Number(state[key]).toFixed(digits)+unit,top);
 const input=dom("input",null,null,box);input.type="range";input.id="ss-extra-"+key;input.min=min;input.max=max;input.step=step;input.value=state[key];label.htmlFor=input.id;
 input.addEventListener("input",()=>{state[key]=Number(input.value);output.textContent=state[key].toFixed(digits)+unit;if(changed)changed();else change();});
 return input;
}
function select(host,{key,en,ko,values}){
 const box=dom("div","ss-al-field",null,host),label=dom("label","ss-al-field-top",txt(en,ko,true),box),input=dom("select",null,null,box);
 input.id="ss-extra-"+key;label.htmlFor=input.id;
 for(const [value,textEn,textKo] of values){const op=dom("option",null,txt(textEn,textKo,true),input);op.value=value}
 input.value=state[key];input.addEventListener("change",()=>{state[key]=input.value;renderControls();change()});return input;
}
function displayNames(){
 const md=metadata[lab];$("ss-al-title").textContent=txt(...md.title,true);$("ss-al-subtitle").textContent=txt(...md.subtitle);
 $("ss-al-controls-title").textContent=txt("Experiment Controls","실험 변수",true);$("ss-al-controls-subtitle").textContent=txt(...md.control);
 $("ss-al-focus").textContent=txt($("ss-al-root").classList.contains("focus")?"Exit focus":"Focus on graphs",$("ss-al-root").classList.contains("focus")?"전체 보기":"그래프 집중 보기",true);
 $("ss-al-focus-toolbar").textContent=$("ss-al-focus").textContent;
 $("ss-al-panel-toggle").textContent=txt($("ss-al-root").classList.contains("controls-hidden")?"Show controls":"Hide controls",$("ss-al-root").classList.contains("controls-hidden")?"변수 보기":"변수 접기",true);
 $("ss-al-reset").textContent=txt("Reset lab","실습 초기화",true);
 $("ss-al-return").textContent=txt("Back to Applications","Applications 목차로",true);
 $("ss-al-transport").hidden=lab==="sampling";$("ss-al-camera-tools").hidden=true;
 $("ss-al-transport-label").textContent=txt("Playback position","재생 위치",true);
 $("ss-al-seek").setAttribute("aria-label",txt("Playback position","재생 위치",true));
 for(const a of document.querySelectorAll("[data-lab-link]")){
  a.textContent=txt(...titleMap[a.dataset.labLink],true);
  if(a.dataset.labLink===lab)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
 }
 document.title=txt(...md.title,true)+" | Signals & Systems";
 const plotHeaders=md.headings;
 for(let i=0;i<3;i++)$("ss-al-plot-title-"+(i+1)).textContent=txt(...plotHeaders[i],true);
 $("ss-al-third").hidden=false;$("ss-al-charts").dataset.kind=lab;
 $("ss-al-insight").textContent=txt(...md.insight);
 const guidance=$("ss-al-guidance");clear(guidance);
 dom("strong",null,txt("Try this sequence","탐구 순서",true),guidance);
 const list=dom("ol",null,null,guidance);
 for(const [en,ko] of md.notes)dom("li",null,txt(en,ko),list);
 renderFormula();
}
function renderFormula(){
 const f=$("ss-al-equation");
 const math={
  beats:{tex:"\\displaystyle x(t)=\\sin(2\\pi f_1t)+a\\sin(2\\pi f_2t)",body:"<mrow><mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi mathvariant='normal'>sin</mi><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>1</mn></msub><mi>t</mi><mo>)</mo><mo>+</mo><mi>a</mi><mi mathvariant='normal'>sin</mi><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>2</mn></msub><mi>t</mi><mo>)</mo></mrow>"},
  amfm:state.mode==="am"?
   {tex:"\\displaystyle s_{AM}(t)=[1+m\\cos(2\\pi f_m t)]\\cos(2\\pi f_c t)",body:"<mrow><msub><mi>s</mi><mi>AM</mi></msub><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mo>[</mo><mn>1</mn><mo>+</mo><mi>m</mi><mi mathvariant='normal'>cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mi>m</mi></msub><mi>t</mi><mo>)</mo><mo>]</mo><mi mathvariant='normal'>cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mi>c</mi></msub><mi>t</mi><mo>)</mo></mrow>"}:
   {tex:"\\displaystyle s_{FM}(t)=\\cos\\!\\bigl(2\\pi f_c t+\\beta\\sin(2\\pi f_m t)\\bigr)",body:"<mrow><msub><mi>s</mi><mi>FM</mi></msub><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi mathvariant='normal'>cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mi>c</mi></msub><mi>t</mi><mo>+</mo><mi>β</mi><mi mathvariant='normal'>sin</mi><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mi>m</mi></msub><mi>t</mi><mo>)</mo><mo>)</mo></mrow>"},
  sampling:state.kind==="sine"?
   {tex:"\\displaystyle x[n]=x\\!\\left(\\frac{n}{f_s}\\right),\\quad f_N=\\frac{f_s}{2}",body:"<mrow><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi>x</mi><mo>(</mo><mfrac><mi>n</mi><msub><mi>f</mi><mi>s</mi></msub></mfrac><mo>)</mo><mo>,</mo><mspace width='1em'/><msub><mi>f</mi><mi>N</mi></msub><mo>=</mo><mfrac><msub><mi>f</mi><mi>s</mi></msub><mn>2</mn></mfrac></mrow>"}:
   {tex:"\\displaystyle \\begin{aligned}f_i(t)&=f_0+\\frac{f_1-f_0}{T}t\\\\ f_{a}(t)&=\\left|f_i(t)-f_s\\,\\mathrm{round}\\!\\left(\\frac{f_i(t)}{f_s}\\right)\\right|\\end{aligned}",body:"<mtable columnalign='left'><mtr><mtd><mrow><msub><mi>f</mi><mi>i</mi></msub><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><msub><mi>f</mi><mn>0</mn></msub><mo>+</mo><mfrac><mrow><msub><mi>f</mi><mn>1</mn></msub><mo>−</mo><msub><mi>f</mi><mn>0</mn></msub></mrow><mi>T</mi></mfrac><mi>t</mi></mrow></mtd></mtr><mtr><mtd><mrow><msub><mi>f</mi><mi>a</mi></msub><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mo>|</mo><msub><mi>f</mi><mi>i</mi></msub><mo>(</mo><mi>t</mi><mo>)</mo><mo>−</mo><msub><mi>f</mi><mi>s</mi></msub><mi mathvariant='normal'>round</mi><mo>(</mo><mfrac><msub><mi>f</mi><mi>i</mi></msub><msub><mi>f</mi><mi>s</mi></msub></mfrac><mo>)</mo><mo>|</mo></mrow></mtd></mtr></mtable>"}
 }[lab];
 f.dataset.tex=math.tex;f.innerHTML="<math xmlns='http://www.w3.org/1998/Math/MathML'>"+math.body+"</math>";f.dataset.mathRendered="mathml";
 if(window.katex?.render){try{window.katex.render(math.tex,f,{throwOnError:true,displayMode:false,output:"htmlAndMathml",strict:"ignore"});f.dataset.mathRendered="katex"}catch(e){}}
}
function renderControls(){
 const h=$("ss-al-control-fields");clear(h),a=$("ss-al-audio");clear(a);
 a.hidden=lab==="sampling";
 if(lab==="beats"){
  range(h,{key:"f1",en:"First frequency f₁",ko:"첫 번째 주파수 f₁",min:150,max:550,step:10,unit:" Hz"});
  range(h,{key:"delta",en:"Frequency difference Δf",ko:"주파수 차이 Δf",min:0,max:16,step:.5,digits:1,unit:" Hz"});
  range(h,{key:"ratio",en:"Amplitude ratio A₂/A₁",ko:"진폭비 A₂/A₁",min:0,max:1,step:.05,digits:2});
 }else if(lab==="amfm"){
  select(h,{key:"mode",en:"Modulation type",ko:"변조 방식",values:[["am","AM · Amplitude","AM · 진폭"],["fm","FM · Frequency","FM · 주파수"]]});
  range(h,{key:"fc",en:"Carrier frequency f꜀",ko:"반송파 주파수 f꜀",min:220,max:900,step:10,unit:" Hz"});
  range(h,{key:"fm",en:"Message frequency fₘ",ko:"정보 신호 주파수 fₘ",min:2,max:30,step:1,unit:" Hz"});
  if(state.mode==="am")range(h,{key:"depth",en:"AM modulation index m",ko:"AM 변조도 m",min:0,max:1,step:.05,digits:2});
  else range(h,{key:"beta",en:"FM modulation index β",ko:"FM 변조지수 β",min:0,max:8,step:.25,digits:2});
 }else{
  select(h,{key:"kind",en:"Signal model",ko:"신호 모델",values:[["sine","Sine · Fixed frequency","정현파 · 고정 주파수"],["chirp","Linear Chirp · Sweep","선형 처프 · 주파수 스윕"]]});
  range(h,{key:"fs",en:"Sampling frequency fₛ",ko:"샘플링 주파수 fₛ",min:20,max:200,step:1,unit:" Hz"});
  const row=dom("div","ss-extra-number-row",null,h);
  const l=dom("label",null,txt("Enter exact fₛ (Hz)","fₛ 수치 직접 입력 (Hz)",true),row);
  const input=dom("input",null,null,row);input.type="number";input.id="ss-extra-fs-number";l.htmlFor=input.id;input.min="20";input.max="200";input.step="1";input.value=String(state.fs);
  const slider=$("ss-extra-fs");
  slider.addEventListener("input",()=>{input.value=String(state.fs)});
  const apply=()=>{let n=Number(input.value);if(!Number.isFinite(n))return;state.fs=clamp(Math.round(n),20,200);input.value=state.fs;slider.value=state.fs;slider.parentElement.querySelector("output").textContent=state.fs+" Hz";change()};
  input.addEventListener("change",apply);input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();apply()}});
  if(state.kind==="sine")range(h,{key:"tone",en:"Input frequency f₀",ko:"입력 주파수 f₀",min:5,max:120,step:1,unit:" Hz"});
  else{
   range(h,{key:"f0",en:"Chirp start f₀",ko:"처프 시작 주파수 f₀",min:2,max:100,step:1,unit:" Hz"});
   range(h,{key:"f1",en:"Chirp end f₁",ko:"처프 끝 주파수 f₁",min:10,max:160,step:1,unit:" Hz"});
   range(h,{key:"T",en:"Chirp duration T",ko:"처프 길이 T",min:1,max:3,step:.25,digits:2,unit:" s"});
  }
  range(h,{key:"pos",en:"Observation time",ko:"관찰 시각",min:0,max:100,step:1,unit:"%",changed:()=>{scheduleDraw()}});
  const actions=dom("div","ss-al-control-buttons",null,h),play=dom("button",null,null,actions);
  play.type="button";play.id="ss-extra-animate";play.textContent=txt(state.playing?"Pause sweep":"Play sweep",state.playing?"움직임 일시 정지":"시간 변화 재생",true);
  play.addEventListener("click",()=>{state.playing=!state.playing;previousFrame=0;play.textContent=txt(state.playing?"Pause sweep":"Play sweep",state.playing?"움직임 일시 정지":"시간 변화 재생",true);if(state.playing)playId=requestAnimationFrame(animate)});
 }
 if(lab!=="sampling"){
  const buttons=dom("div","ss-al-control-buttons",null,a);
  const play=dom("button","ss-al-primary",null,buttons),pause=dom("button",null,null,buttons),stop=dom("button",null,null,buttons);
  play.id="ss-al-play";pause.id="ss-al-pause";stop.id="ss-al-stop";
  const status=dom("p","ss-al-audio-status",null,a);status.setAttribute("role","status");
  audio.buttons={play,pause,stop};audio.status=status;
  play.addEventListener("click",startAudio);
  pause.addEventListener("click",()=>stopAudio(false));
  stop.addEventListener("click",()=>stopAudio(true));
  refreshAudio();
 }
}
function foldedSigned(f,fs){return f-fs*Math.floor(f/fs+.5)}
function freqAt(t){return state.kind==="sine"?state.tone:state.f0+(state.f1-state.f0)*t/state.T}
function phaseAt(t){return state.kind==="sine"?2*Math.PI*state.tone*t:2*Math.PI*(state.f0*t+.5*(state.f1-state.f0)/state.T*t*t)}
function continuousAt(t){return Math.sin(phaseAt(t))}
function beatsAt(t){return Math.sin(2*Math.PI*state.f1*t)+state.ratio*Math.sin(2*Math.PI*(state.f1+state.delta)*t)}
function envelope(t){return Math.sqrt(1+state.ratio**2+2*state.ratio*Math.cos(2*Math.PI*state.delta*t))}
function modAt(t){const phase=2*Math.PI*state.fm*t;
 return state.mode==="am"?(1+state.depth*Math.cos(phase))*Math.cos(2*Math.PI*state.fc*t):
 Math.cos(2*Math.PI*state.fc*t+state.beta*Math.sin(phase))}
function audioAt(t){return lab==="beats"?beatsAt(t)/(1+state.ratio):modAt(t)/(state.mode==="am"?1+state.depth:1)}
function measureValues(){
 const out=[];
 if(lab==="beats")out.push(
  [txt("f₁","주파수 f₁",true),state.f1+" Hz"],[txt("f₂","주파수 f₂",true),(state.f1+state.delta).toFixed(1)+" Hz"],
  [txt("Beat rate","맥놀이 주파수",true),(state.ratio===0?0:state.delta).toFixed(1)+" Hz"],
  [txt("Envelope minima","포락선 최소",true),Math.abs(1-state.ratio).toFixed(2)]);
 else if(lab==="amfm")out.push(
  [txt("Carrier f꜀","반송파 f꜀",true),state.fc+" Hz"],[txt("Message fₘ","정보 신호 fₘ",true),state.fm+" Hz"],
  [txt("Modulation","변조 방식",true),state.mode.toUpperCase()],
  [state.mode==="am"?txt("Envelope range","포락선 범위",true):txt("Frequency swing","주파수 편이",true),state.mode==="am"?(1-state.depth).toFixed(2)+"–"+(1+state.depth).toFixed(2):"±"+(state.beta*state.fm).toFixed(1)+" Hz"]);
 else{
  const t=state.T*state.pos/100,fi=freqAt(t),fa=Math.abs(foldedSigned(fi,state.fs)),ny=state.fs/2;
  out.push([txt("Sampling fₛ","샘플링 fₛ",true),state.fs+" Hz"],[txt("Nyquist fₛ/2","나이퀴스트 fₛ/2",true),ny.toFixed(1)+" Hz"],
   [txt("Input fᵢ(t)","입력 fᵢ(t)",true),fi.toFixed(1)+" Hz"],[txt("Local alias |fₐ|","국소 에일리어스 |fₐ|",true),fa.toFixed(1)+" Hz"]);
 }
 const host=$("ss-al-metrics");clear(host);
 for(const [label,value] of out){const d=dom("div","ss-al-metric",null,host);dom("span","ss-al-metric-label",label,d);dom("strong","ss-al-metric-value",value,d)}
}
function signalTime(){return lab==="sampling"?state.T:2}
function drawBeats(){
 let C=canvasContext(canvases[0]);
 if(C){
  const B=axes(C,{xmin:0,xmax:2,ymin:-2.25,ymax:2.25,xlabel:"t (s)",ylabel:"x(t)"});
  const waveform=[],top=[],bottom=[];
  for(let i=0;i<=3600;i++){const t=2*i/3600,e=envelope(t);waveform.push([t,beatsAt(t)]);top.push([t,e]);bottom.push([t,-e])}
  line(C,B,waveform,C.pal.line,1.3);line(C,B,top,C.pal.alt,2);line(C,B,bottom,C.pal.alt,1.5,[5,5]);
  legend(C,[["x(t)",C.pal.line],["± envelope",C.pal.alt]]);
  marker(C,B,(audioPosition()%2),beatsAt(audioPosition()%2),C.pal.alt);
 }
 C=canvasContext(canvases[1]);
 if(C){
  const t0=.27,dt=.045,B=axes(C,{xmin:t0,xmax:t0+dt,ymin:-2.2,ymax:2.2,xlabel:"t (s)",ylabel:"x(t)"});
  const a=[],b=[],c=[];
  for(let i=0;i<=900;i++){const t=t0+dt*i/900;a.push([t,Math.sin(2*Math.PI*state.f1*t)]);b.push([t,state.ratio*Math.sin(2*Math.PI*(state.f1+state.delta)*t)]);c.push([t,beatsAt(t)])}
  line(C,B,a,C.pal.muted,1);line(C,B,b,C.pal.alt,1);line(C,B,c,C.pal.line,2);
  legend(C,[["tone 1",C.pal.muted],["tone 2",C.pal.alt],["sum",C.pal.line]]);
 }
 C=canvasContext(canvases[2]);
 if(C){
  const xmax=state.f1+Math.max(15,state.delta)*1.45;
  const B=axes(C,{xmin:Math.max(0,state.f1-28),xmax:xmax,ymin:0,ymax:1.15,xlabel:"f (Hz)",ylabel:"Amplitude"});
  const c=C.ctx;
  for(const [f,a,color] of [[state.f1,1,C.pal.line],[state.f1+state.delta,state.ratio,C.pal.alt]]){
   c.strokeStyle=color;c.lineWidth=4;c.beginPath();c.moveTo(B.x(f),B.y(0));c.lineTo(B.x(f),B.y(a));c.stroke();circle(c,B.x(f),B.y(a),color,4);
  }
  if(state.delta===0)hint(C,"Two spectral components coincide");
 }
 $("ss-al-note-1").textContent=txt("Waveform and amplitude envelope; audio-clock cursor tracks playback.","파형과 진폭 포락선입니다. 재생 마커는 오디오 시간과 동기화됩니다.");
 $("ss-al-note-2").textContent=txt("Zoomed view exposes the sum of two rapidly oscillating tones.","확대 화면에서 두 고주파 정현파의 합성을 확인합니다.");
 $("ss-al-note-3").textContent=txt("Theoretical positive-frequency components (not a measured FFT).","이론적인 양의 주파수 성분입니다. 측정 FFT가 아닙니다.");
}
function marker(C,B,t,y,color){
 if(!Number.isFinite(t))return;
 const x=B.x(t),yy=B.y(y);if(x<B.r.l||x>B.r.right)return;
 C.ctx.save();C.ctx.strokeStyle=color;C.ctx.lineWidth=1.5;C.ctx.setLineDash([4,5]);
 C.ctx.beginPath();C.ctx.moveTo(x,B.r.t);C.ctx.lineTo(x,B.r.b);C.ctx.stroke();C.ctx.setLineDash([]);
 circle(C.ctx,x,yy,color,4);C.ctx.restore();
}
function fftRadix(re,im){
 const n=re.length;
 for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){let z=re[i];re[i]=re[j];re[j]=z;z=im[i];im[i]=im[j];im[j]=z}}
 for(let len=2;len<=n;len<<=1){const th=-2*Math.PI/len,cs=Math.cos(th),sn=Math.sin(th);
  for(let i=0;i<n;i+=len){let wr=1,wi=0;for(let j=0;j<len/2;j++){const k=i+j,h=k+len/2,a=wr*re[h]-wi*im[h],b=wr*im[h]+wi*re[h];re[h]=re[k]-a;im[h]=im[k]-b;re[k]+=a;im[k]+=b;const r=wr*cs-wi*sn;wi=wr*sn+wi*cs;wr=r}}
 }
}
function spectrum(){
 const signature=[state.mode,state.fc,state.fm,state.depth,state.beta].join(":");
 if(fftCache&&fftCache.signature===signature)return fftCache.result;
 const n=4096,fs=4096,re=new Float64Array(n),im=new Float64Array(n);
 for(let i=0;i<n;i++)re[i]=modAt(i/fs)*(.5-.5*Math.cos(2*Math.PI*i/(n-1)));
 fftRadix(re,im);let max=0;
 const range=Math.max(65,12*state.fm+25),lo=Math.max(0,Math.floor(state.fc-range)),hi=Math.min(fs/2,Math.ceil(state.fc+range));
 for(let k=lo;k<=hi;k++)max=Math.max(max,Math.hypot(re[k],im[k]));
 const data=[];for(let k=lo;k<=hi;k++)data.push([k,Math.max(-70,20*Math.log10(Math.max(1e-12,Math.hypot(re[k],im[k])/max)))]);
 const result={lo,hi,data};fftCache={signature,result};return result;
}
function drawAMFM(){
 const tmax=.28,am=state.mode==="am";
 let C=canvasContext(canvases[0]);
 if(C){
  const B=axes(C,{xmin:0,xmax:tmax,ymin:-2.15,ymax:2.15,xlabel:"t (s)",ylabel:"s(t)"}),wave=[],eP=[],eN=[];
  for(let i=0;i<=1900;i++){const t=tmax*i/1900,v=modAt(t);wave.push([t,v]);
   if(am){const e=1+state.depth*Math.cos(2*Math.PI*state.fm*t);eP.push([t,e]);eN.push([t,-e])}
  }
  line(C,B,wave,C.pal.line,1.2);
  if(am){line(C,B,eP,C.pal.alt,2);line(C,B,eN,C.pal.alt,1.7,[5,4])}
  legend(C,am?[["AM",C.pal.line],["envelope",C.pal.alt]]:[["FM · constant amplitude",C.pal.line]]);
  const t=audioPosition()%tmax;marker(C,B,t,modAt(t),C.pal.alt);
 }
 C=canvasContext(canvases[1]);if(C){
  const time=.5,pts=[];
  const range=am?{ymin:0,ymax:2.15,ylabel:"Envelope amplitude"}:{ymin:state.fc-state.beta*state.fm-12,ymax:state.fc+state.beta*state.fm+12,ylabel:"fᵢ(t) (Hz)"};
  const B=axes(C,{xmin:0,xmax:time,...range,xlabel:"t (s)"});
  for(let i=0;i<=500;i++){const t=time*i/500;pts.push([t,am?1+state.depth*Math.cos(2*Math.PI*state.fm*t):state.fc+state.beta*state.fm*Math.cos(2*Math.PI*state.fm*t)])}
  line(C,B,pts,C.pal.alt,2.2);hint(C,am?"envelope = 1 + m cos(2πfₘt)":"fᵢ = f꜀ + βfₘ cos(2πfₘt)");
 }
 C=canvasContext(canvases[2]);if(C){
  const S=spectrum(),B=axes(C,{xmin:S.lo,xmax:S.hi,ymin:-70,ymax:2,xlabel:"f (Hz)",ylabel:"Rel. FFT (dB)"});
  line(C,B,S.data,C.pal.line,2);hint(C,"4096-point Hann FFT, 1 s record");
 }
 $("ss-al-note-1").textContent=txt("AM changes envelope magnitude; FM keeps amplitude constant while changing phase slope.","AM은 포락선의 크기를, FM은 일정한 진폭에서 위상 변화율을 조절합니다.");
 $("ss-al-note-2").textContent=txt(am?"Message-controlled AM envelope.":"Instantaneous frequency f꜀+βfₘ cos(2πfₘt).",am?"정보 신호에 따라 변하는 AM 포락선입니다.":"순간주파수 f꜀+βfₘ cos(2πfₘt)입니다.");
 $("ss-al-note-3").textContent=txt("Numerical one-sided FFT; amplitude is relative to the largest bin in the displayed band.","수치 계산한 단측 FFT입니다. 표시 대역의 최대 빈을 기준으로 상대 크기를 나타냅니다.");
}
function plotSamples(C,B,tStart,tEnd,showConnect=false){
 const first=Math.ceil(tStart*state.fs-1e-10),last=Math.floor(tEnd*state.fs+1e-10),pts=[];
 for(let n=Math.max(0,first);n<=Math.min(Math.floor(state.T*state.fs),last);n++){const t=n/state.fs,v=continuousAt(t);pts.push([t,v])}
 if(showConnect&&pts.length>1)line(C,B,pts,C.pal.alt,1,[4,4]);
 for(const [t,v] of pts){
  C.ctx.strokeStyle=C.pal.alt;C.ctx.lineWidth=1.3;C.ctx.beginPath();C.ctx.moveTo(B.x(t),B.y(0));C.ctx.lineTo(B.x(t),B.y(v));C.ctx.stroke();circle(C.ctx,B.x(t),B.y(v),C.pal.alt,3.8);
 }
 return pts;
}
function drawSampling(){
 const T=state.T,center=T*state.pos/100,span=Math.min(.24,T),begin=clamp(center-span/2,0,T-span),end=begin+span;
 let C=canvasContext(canvases[0]);
 if(C){
  const B=axes(C,{xmin:begin,xmax:end,ymin:-1.2,ymax:1.2,xlabel:"t (s)",ylabel:"x(t)"}),wave=[];
  for(let i=0;i<=1150;i++){const t=begin+span*i/1150;wave.push([t,continuousAt(t)])}
  line(C,B,wave,C.pal.line,1.8);plotSamples(C,B,begin,end,true);
  legend(C,[["CT input",C.pal.line],["samples",C.pal.alt]]);
  marker(C,B,center,continuousAt(center),C.pal.alt);
 }
 C=canvasContext(canvases[1]);if(C){
  const n0=Math.max(0,Math.ceil(begin*state.fs)),n1=Math.max(n0+1,Math.floor(end*state.fs));
  const B=axes(C,{xmin:n0-.6,xmax:n1+.6,ymin:-1.2,ymax:1.2,xlabel:"n (sample index)",ylabel:"x[n]"});
  for(let n=n0;n<=n1;n++){
   const v=continuousAt(n/state.fs),x=B.x(n);C.ctx.strokeStyle=C.pal.line;C.ctx.lineWidth=1.4;C.ctx.beginPath();C.ctx.moveTo(x,B.y(0));C.ctx.lineTo(x,B.y(v));C.ctx.stroke();circle(C.ctx,x,B.y(v),C.pal.alt,3.7);
  }
  hint(C,"x[n] = x(n / fₛ)");
 }
 C=canvasContext(canvases[2]);if(C){
  const fmax=Math.max(state.kind==="sine"?state.tone:Math.max(state.f0,state.f1),state.fs/2)*1.18;
  const B=axes(C,{xmin:0,xmax:T,ymin:0,ymax:fmax,xlabel:"t (s)",ylabel:"f (Hz)"}),original=[],fold=[],ny=[];
  for(let i=0;i<=750;i++){const t=T*i/750,f=freqAt(t);original.push([t,f]);fold.push([t,Math.abs(foldedSigned(f,state.fs))]);ny.push([t,state.fs/2])}
  line(C,B,original,C.pal.muted,1.7);line(C,B,fold,C.pal.line,2.4);line(C,B,ny,C.pal.alt,1.8,[6,5]);
  legend(C,[["input fᵢ",C.pal.muted],["folded |fₐ|",C.pal.line],["Nyquist",C.pal.alt]]);
  marker(C,B,center,Math.abs(foldedSigned(freqAt(center),state.fs)),C.pal.alt);
 }
 $("ss-al-note-1").textContent=txt("Original continuous waveform (green) and exact samples taken at t=n/fₛ (orange). Dashed links are not interpolation.","연속시간 파형(녹색)과 t=n/fₛ에서 얻은 정확한 표본점(주황색)입니다. 점선 연결은 보간 복원이 아닙니다.");
 $("ss-al-note-2").textContent=txt("Sample stems against integer index n, not equally spaced points on a rescaled continuous waveform.","표본을 연속시간축이 아니라 정수 첨자 n에 대해 막대 형태로 나타냅니다.");
 $("ss-al-note-3").textContent=txt("The folded line is the local apparent frequency after sampling; a rising chirp can fold repeatedly at Nyquist boundaries.","접힌 곡선은 표본화 후의 국소 겉보기 주파수입니다. 증가하는 처프는 나이퀴스트 경계에서 여러 번 접힐 수 있습니다.");
}
function audioPosition(){return audio.playing&&audioCtx?clamp(audioCtx.currentTime-audio.start,0,audio.duration):audio.offset}
function updateTransport(){
 if(lab==="sampling")return;
 const position=audioPosition();$("ss-al-seek").value=Math.round(position/audio.duration*1000);
 $("ss-al-transport-time").textContent=position.toFixed(2)+" / "+audio.duration.toFixed(2)+" s";
}
function refreshAudio(){
 if(!audio.buttons)return;
 const {play,pause,stop}=audio.buttons;
 play.textContent=txt(audio.playing?"Playing":"▶ Play",audio.playing?"재생 중":"▶ 재생",true);
 play.disabled=audio.playing;
 pause.textContent=txt("Ⅱ Pause","Ⅱ 일시 정지",true);pause.disabled=!audio.playing;
 stop.textContent=txt("■ Stop","■ 정지",true);stop.disabled=!audio.playing&&audio.offset===0;
 audio.status.textContent=audio.playing?txt("Playing · audio-clock synchronized","재생 중 · 오디오 시계 동기화"):
  audio.offset>0&&audio.offset<audio.duration?txt("Paused · resume from current position","일시 정지 · 현재 위치에서 계속"):
  txt("User-initiated synthesized audio; start with low volume.","버튼으로 시작하는 합성음입니다. 낮은 음량으로 시작하세요.");
 updateTransport();
}
function closeSource(){
 if(!source)return;const s=source;source=null;s.onended=null;try{s.stop()}catch(e){}try{s.disconnect()}catch(e){}
}
function stopAudio(reset=true){
 if(lab==="sampling")return;
 requestId++;
 const pos=audioPosition();audio.playing=false;
 if(transportId!==null){cancelAnimationFrame(transportId);transportId=null}
 closeSource();audio.offset=reset?0:pos;refreshAudio();drawSoon();
}
function change(){
 fftCache=null;
 if(lab!=="sampling"){stopAudio(true);audio.buffer=null}else if(state.playing){state.playing=false;if(playId!==null)cancelAnimationFrame(playId);playId=null;renderControls()}
 if(lab==="amfm"||lab==="sampling")renderFormula();
 drawSoon();
}
function fftAudioBuffer(){
 const sr=audioCtx.sampleRate,n=Math.floor(sr*audio.duration);
 const buffer=audioCtx.createBuffer(1,n,sr),data=buffer.getChannelData(0),fade=.015;
 for(let i=0;i<n;i++){const t=i/sr,gain=Math.min(1,t/fade,(audio.duration-t)/fade);data[i]=clamp(.22*gain*audioAt(t),-1,1)}
 audio.buffer=buffer;
}
function beginSource(offset){
 closeSource();const s=audioCtx.createBufferSource();s.buffer=audio.buffer;s.connect(audioCtx.destination);
 audio.offset=clamp(offset,0,audio.duration-.0001);audio.start=audioCtx.currentTime-audio.offset;audio.playing=true;source=s;
 s.onended=()=>{
  if(s!==source)return;audio.playing=false;source=null;
  if(transportId!==null)cancelAnimationFrame(transportId);transportId=null;
  audio.offset=audio.duration;refreshAudio();drawSoon();
 };
 s.start(0,audio.offset);if(transportId!==null)cancelAnimationFrame(transportId);
 transportId=requestAnimationFrame(audioFrame);refreshAudio();
}
async function startAudio(){
 if(lab==="sampling"||audio.playing)return;
 const Ctx=window.AudioContext||window.webkitAudioContext;
 if(!Ctx){if(audio.status)audio.status.textContent=txt("Web Audio unavailable.","Web Audio 미지원");return}
 const req=++requestId;
 try{
  if(!audioCtx)audioCtx=new Ctx();await audioCtx.resume();
  if(requestId!==req)return;
  if(!audio.buffer)fftAudioBuffer();
  if(audio.offset>=audio.duration-.001)audio.offset=0;
  beginSource(audio.offset);
 }catch(e){if(req===requestId&&audio.status)audio.status.textContent=txt("Playback unavailable.","재생할 수 없습니다.")}
}
function audioFrame(){
 transportId=null;if(!audio.playing)return;
 const pos=audioPosition();audio.offset=pos;updateTransport();
 if(performance.now()-lastDraw>33)drawSoon();
 if(audio.playing)transportId=requestAnimationFrame(audioFrame);
}
function seek(seconds){
 if(lab==="sampling")return;
 const was=audio.playing;if(was){audio.playing=false;if(transportId!==null)cancelAnimationFrame(transportId);transportId=null;closeSource()}
 audio.offset=clamp(seconds,0,audio.duration);
 if(was&&audio.buffer&&audio.offset<audio.duration)beginSource(audio.offset);else refreshAudio();
 drawSoon();
}
function animate(now){
 if(!state.playing)return;
 if(!previousFrame)previousFrame=now;
 const dt=clamp((now-previousFrame)/1000,0,.1);previousFrame=now;
 state.pos=(state.pos+dt/state.T*100)%100;
 const slider=$("ss-extra-pos");if(slider){slider.value=state.pos;slider.parentElement.querySelector("output").textContent=Math.round(state.pos)+"%"}
 if(now-lastDraw>35)drawSoon();playId=requestAnimationFrame(animate);
}
function redraw(){
 plotDirty=false;lastDraw=performance.now();measureValues();
 if(lab==="beats")drawBeats();else if(lab==="amfm")drawAMFM();else drawSampling();
}
function drawSoon(){if(!plotDirty){plotDirty=true;requestAnimationFrame(redraw)}}
function init(){
 displayNames();renderControls();
 const at=allLabs.indexOf(lab),prev=$("ss-al-prev-lab"),next=$("ss-al-next-lab");
 prev.disabled=at===0;next.disabled=at===allLabs.length-1;
 prev.setAttribute("aria-disabled",String(prev.disabled));next.setAttribute("aria-disabled",String(next.disabled));
 prev.addEventListener("click",()=>{if(at>0)location.href="./applications-lab.html?lab="+allLabs[at-1]});
 next.addEventListener("click",()=>{if(at<allLabs.length-1)location.href="./applications-lab.html?lab="+allLabs[at+1]});
 $("ss-al-camera-tools").hidden=true;
 const focus=()=>{
  const root=$("ss-al-root"),v=!root.classList.contains("focus");root.classList.toggle("focus",v);
  $("ss-al-focus").setAttribute("aria-pressed",String(v));$("ss-al-focus-toolbar").setAttribute("aria-pressed",String(v));
  displayNames();requestAnimationFrame(drawSoon);
 };
 $("ss-al-focus").addEventListener("click",focus);$("ss-al-focus-toolbar").addEventListener("click",focus);
 $("ss-al-panel-toggle").addEventListener("click",()=>{
  const root=$("ss-al-root"),v=!root.classList.contains("controls-hidden");root.classList.toggle("controls-hidden",v);
  $("ss-al-panel-toggle").setAttribute("aria-expanded",String(!v));displayNames();requestAnimationFrame(drawSoon);
 });
 $("ss-al-reset").addEventListener("click",()=>{
  if(lab!=="sampling")stopAudio(true);else if(playId!==null){cancelAnimationFrame(playId);playId=null}
  Object.keys(initial).forEach(key=>state[key]=initial[key]);fftCache=null;audio.buffer=null;audio.offset=0;
  previousFrame=0;displayNames();renderControls();drawSoon();
 });
 if(lab!=="sampling"){
  $("ss-al-seek").addEventListener("input",e=>seek(Number(e.target.value)/1000*audio.duration));
  updateTransport();
 }else{
  const canvas=canvases[2];canvas.style.cursor="crosshair";
  canvas.addEventListener("click",e=>{
   const bounds=canvas.getBoundingClientRect(),left=56,right=bounds.width-15;
   if(e.clientX<bounds.left+left||e.clientX>bounds.left+right)return;
   state.pos=clamp((e.clientX-bounds.left-left)/(right-left)*100,0,100);
   const slider=$("ss-extra-pos");if(slider){slider.value=state.pos;slider.parentElement.querySelector("output").textContent=Math.round(state.pos)+"%"}
   drawSoon();
  });
 }
 language?.subscribe?.(()=>{displayNames();renderControls();drawSoon()});
 window.addEventListener("els:themechange",drawSoon);window.addEventListener("resize",drawSoon);
 if(window.ResizeObserver)new ResizeObserver(drawSoon).observe($("ss-al-charts"));
 document.addEventListener("visibilitychange",()=>{
  if(document.hidden){if(lab!=="sampling")stopAudio(true);else{state.playing=false;if(playId!==null)cancelAnimationFrame(playId);playId=null;renderControls()}}
 });
 window.addEventListener("pagehide",()=>{
  if(lab!=="sampling")stopAudio(true);
  if(playId!==null)cancelAnimationFrame(playId);
 });
 drawSoon();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
