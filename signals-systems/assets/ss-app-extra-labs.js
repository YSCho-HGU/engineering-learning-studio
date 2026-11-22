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
 {kind:"chirp",fs:4000,f0:300,f1:7300,tone:1500,T:2,pos:50,showFFT:"on",aliasGuide:"on",windowMs:"auto",playing:false};
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
  notes:[["In Sine mode, change fₛ across 2f₀. Notice that all samples agree with a lower-frequency alias when f₀ exceeds Nyquist.","정현파 모드에서 fₛ를 2f₀의 위아래로 조절해 나이퀴스트 경계와 낮은 주파수의 에일리어스를 관찰하세요."],["For Linear Chirp use f₀=300 Hz, f₁=7300 Hz, and vary fₛ up to 16000 Hz. Notice when the spectrum crosses Nyquist.","선형 처프 f₀=300Hz, f₁=7300Hz에서 fₛ를 최대 16000Hz까지 조정하며 나이퀴스트 경계를 통과하는 순간을 관찰하세요."],["Compare x(t), x[n], and the folded-frequency curve. Lower-frequency segments above Nyquist are aliases, not changes in the source chirp.","x(t)·x[n]·접힌 주파수 곡선을 비교하세요. 나이퀴스트를 넘어 낮아 보이는 주파수는 입력 신호가 바뀐 것이 아니라 에일리어싱입니다."],["Listen to original CT and alias at actual frequency. At f₀=1500 Hz and fₛ=2000 Hz, compare the 1500 Hz source and 500 Hz alias; they generate the same samples.","실제 주파수의 Original CT와 Alias Guide를 듣습니다. f₀=1500Hz, fₛ=2000Hz에서 입력 1500Hz와 에일리어스 500Hz는 동일한 표본을 만듭니다."],["At f₀=8000 Hz and fₛ=16000 Hz the tone is exactly at Nyquist: a phase-sensitive boundary, not a safe anti-aliasing margin.","f₀=8000Hz, fₛ=16000Hz는 정확히 나이퀴스트 경계입니다. 위상에 민감하며 충분한 에일리어싱 방지 여유가 있는 조건은 아닙니다."]],
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
const audio={playing:false,offset:0,start:0,buffer:null,duration:duration,buttons:null,status:null,signal:"ct",error:""};
function palette(){
 const c=getComputedStyle(document.documentElement),v=n=>c.getPropertyValue(n).trim();
 return {ink:v("--els-ink")||"#e8e9e6",muted:v("--els-muted")||"#9ba4a1",line:v("--els-link")||"#87c5a5",border:v("--els-border")||"#666",bg:v("--els-surface")||"#171a19",alt:document.documentElement.dataset.theme==="light"?"#b66134":"#ffc08d",peak:document.documentElement.dataset.theme==="light"?"#764aa5":"#bea5e7"};
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
function axes(C,{xmin,xmax,ymin,ymax,xlabel,ylabel,xticks=4,yticks=4,xvalues=null,yvalues=null,xformat=tick,yformat=tick}){
 const {ctx:c,w,h,pal}=C,r={l:58,t:14,b:h-41,right:w-14};
 r.width=r.right-r.l;r.height=r.b-r.t;
 const x=v=>r.l+(v-xmin)/(xmax-xmin)*r.width;
 const y=v=>r.b-(v-ymin)/(ymax-ymin)*r.height;
 c.font="11px Arial, sans-serif";c.lineWidth=1;
 const xs=xvalues||Array.from({length:xticks+1},(_,i)=>xmin+(xmax-xmin)*i/xticks);
 const ys=yvalues||Array.from({length:yticks+1},(_,i)=>ymin+(ymax-ymin)*i/yticks);
 for(const p of xs){
  if(p<xmin-1e-9||p>xmax+1e-9)continue;
  const q=x(p);c.globalAlpha=.20;c.strokeStyle=pal.border;c.beginPath();c.moveTo(q,r.t);c.lineTo(q,r.b);c.stroke();c.globalAlpha=1;
  c.fillStyle=pal.muted;c.textAlign="center";c.fillText(xformat(p),q,r.b+17);
 }
 for(const p of ys){
  if(p<ymin-1e-9||p>ymax+1e-9)continue;
  const q=y(p);c.globalAlpha=.20;c.strokeStyle=pal.border;c.beginPath();c.moveTo(r.l,q);c.lineTo(r.right,q);c.stroke();c.globalAlpha=1;
  c.fillStyle=pal.muted;c.textAlign="right";c.fillText(yformat(p),r.l-7,q+4);
 }
 // Draw the axes more strongly than the background grid, especially x(t)=0.
 c.save();
 c.strokeStyle=pal.muted;c.globalAlpha=.95;c.lineWidth=1.8;
 c.beginPath();c.moveTo(r.l,r.b);c.lineTo(r.right,r.b);c.stroke();
 if(ymin<0&&ymax>0){
  c.strokeStyle=pal.ink;c.globalAlpha=.56;c.lineWidth=1.75;
  c.beginPath();c.moveTo(r.l,y(0));c.lineTo(r.right,y(0));c.stroke();
 }
 c.restore();
 c.strokeStyle=pal.muted;c.globalAlpha=.76;c.lineWidth=1.15;c.strokeRect(r.l,r.t,r.width,r.height);c.globalAlpha=1;
 c.fillStyle=pal.ink;c.font="12px Arial, sans-serif";c.textAlign="center";
 c.fillText(xlabel,r.l+r.width/2,h-5);
 c.save();c.translate(16,r.t+r.height/2);c.rotate(-Math.PI/2);c.fillText(ylabel,0,0);c.restore();
 return{x,y,r};
}
function integerTicks(low,high,target=5){
 const span=Math.max(1,high-low);
 const rough=span/target;const base=10**Math.floor(Math.log10(rough));
 const step=[1,2,5,10].map(v=>v*base).find(v=>v>=rough)||10*base;
 const ticks=[];for(let n=Math.ceil(low/step)*step;n<=high+1e-9;n+=step)ticks.push(Math.round(n));
 return ticks;
}
function outsideLegend(index,items){
 const el=$("ss-al-legend-"+index);if(!el)return;
 el.hidden=false;el.replaceChildren();
 for(const [label,color,type="line"] of items){
  const item=dom("span","ss-al-legend-item",null,el);
  const swatch=dom("span","ss-al-legend-swatch "+type,null,item);
  swatch.style.backgroundColor=color;swatch.style.borderBottomColor=color;
  dom("span",null,label,item);
 }
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
 input.value=state[key];input.addEventListener("change",()=>{
  state[key]=input.value;
  if(lab==="sampling"&&key==="kind"){
   state.fs=state.kind==="sine"?2000:4000;state.pos=50;state.windowMs="auto";
  }
  renderControls();
  if(lab==="sampling"&&["windowMs","aliasGuide","showFFT"].includes(key)){drawSoon();return}
  change();
 });return input;
}
function displayNames(){
 const md=metadata[lab];$("ss-al-title").textContent=txt(...md.title,true);$("ss-al-subtitle").textContent=txt(...md.subtitle);
 $("ss-al-controls-title").textContent=txt("Experiment Controls","실험 변수",true);$("ss-al-controls-subtitle").textContent=txt(...md.control);
 $("ss-al-focus").textContent=txt($("ss-al-root").classList.contains("focus")?"Exit focus":"Focus on graphs",$("ss-al-root").classList.contains("focus")?"전체 보기":"그래프 집중 보기",true);
 $("ss-al-focus-toolbar").textContent=$("ss-al-focus").textContent;
 $("ss-al-panel-toggle").textContent=txt($("ss-al-root").classList.contains("controls-hidden")?"Show controls":"Hide controls",$("ss-al-root").classList.contains("controls-hidden")?"변수 보기":"변수 접기",true);
 $("ss-al-reset").textContent=txt("Reset lab","실습 초기화",true);
 $("ss-al-return").textContent=txt("Back to Applications","Applications 목차로",true);
 $("ss-al-transport").hidden=false;$("ss-al-camera-tools").hidden=true;
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
   {tex:String.raw`\displaystyle \begin{aligned}
x[n]&=\sin\!\left(2\pi\frac{f_0}{f_s}n\right)\\
&=\sin\!\left(2\pi\frac{f_a}{f_s}n\right),\quad f_a=f_0-kf_s
\end{aligned}`,body:`<mtable xmlns="http://www.w3.org/1998/Math/MathML" columnalign="left"><mtr><mtd><mrow><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi mathvariant="normal">sin</mi><mo>(</mo><mn>2</mn><mi>π</mi><mfrac><msub><mi>f</mi><mn>0</mn></msub><msub><mi>f</mi><mi>s</mi></msub></mfrac><mi>n</mi><mo>)</mo></mrow></mtd></mtr><mtr><mtd><mrow><mo>=</mo><mi mathvariant="normal">sin</mi><mo>(</mo><mn>2</mn><mi>π</mi><mfrac><msub><mi>f</mi><mi>a</mi></msub><msub><mi>f</mi><mi>s</mi></msub></mfrac><mi>n</mi><mo>)</mo><mspace width="1em"/><msub><mi>f</mi><mi>a</mi></msub><mo>=</mo><msub><mi>f</mi><mn>0</mn></msub><mo>−</mo><mi>k</mi><msub><mi>f</mi><mi>s</mi></msub></mrow></mtd></mtr></mtable>`}:
   {tex:"\\displaystyle \\begin{aligned}f_i(t)&=f_0+\\frac{f_1-f_0}{T}t\\\\ f_{a}(t)&=\\left|f_i(t)-f_s\\,\\mathrm{round}\\!\\left(\\frac{f_i(t)}{f_s}\\right)\\right|\\end{aligned}",body:"<mtable columnalign='left'><mtr><mtd><mrow><msub><mi>f</mi><mi>i</mi></msub><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><msub><mi>f</mi><mn>0</mn></msub><mo>+</mo><mfrac><mrow><msub><mi>f</mi><mn>1</mn></msub><mo>−</mo><msub><mi>f</mi><mn>0</mn></msub></mrow><mi>T</mi></mfrac><mi>t</mi></mrow></mtd></mtr><mtr><mtd><mrow><msub><mi>f</mi><mi>a</mi></msub><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mo>|</mo><msub><mi>f</mi><mi>i</mi></msub><mo>(</mo><mi>t</mi><mo>)</mo><mo>−</mo><msub><mi>f</mi><mi>s</mi></msub><mi mathvariant='normal'>round</mi><mo>(</mo><mfrac><msub><mi>f</mi><mi>i</mi></msub><msub><mi>f</mi><mi>s</mi></msub></mfrac><mo>)</mo><mo>|</mo></mrow></mtd></mtr></mtable>"}
 }[lab];
 f.dataset.tex=math.tex;f.innerHTML="<math xmlns='http://www.w3.org/1998/Math/MathML'>"+math.body+"</math>";f.dataset.mathRendered="mathml";
 if(window.katex?.render){try{window.katex.render(math.tex,f,{throwOnError:true,displayMode:false,output:"htmlAndMathml",strict:"ignore"});f.dataset.mathRendered="katex"}catch(e){}}
}
function renderControls(){
 const h=$("ss-al-control-fields"),a=$("ss-al-audio");clear(h);clear(a);
 a.hidden=false;a.dataset.kind=lab;
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
  range(h,{key:"fs",en:"Sampling frequency fₛ",ko:"샘플링 주파수 fₛ",min:20,max:16000,step:1,unit:" Hz"});
  const row=dom("div","ss-extra-number-row",null,h);
  const l=dom("label",null,txt("Enter exact fₛ (Hz)","fₛ 수치 직접 입력 (Hz)",true),row);
  const input=dom("input",null,null,row);input.type="number";input.id="ss-extra-fs-number";l.htmlFor=input.id;input.min="20";input.max="16000";input.step="1";input.value=String(state.fs);
  const slider=$("ss-extra-fs");
  slider.addEventListener("input",()=>{input.value=String(state.fs);for(const b of h.querySelectorAll(".ss-al-preset"))b.setAttribute("aria-pressed",String(Number(b.dataset.fs)===state.fs))});
  const apply=()=>{let n=Number(input.value);if(!Number.isFinite(n))return;state.fs=clamp(Math.round(n),20,16000);input.value=state.fs;slider.value=state.fs;slider.parentElement.querySelector("output").textContent=state.fs+" Hz";renderControls();change()};
  input.addEventListener("change",apply);input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();apply()}});
  if(state.kind==="sine")range(h,{key:"tone",en:"Input frequency f₀",ko:"입력 주파수 f₀",min:20,max:8000,step:1,unit:" Hz"});
  else{
   range(h,{key:"f0",en:"Chirp start f₀",ko:"처프 시작 주파수 f₀",min:20,max:8000,step:1,unit:" Hz"});
   range(h,{key:"f1",en:"Chirp end f₁",ko:"처프 끝 주파수 f₁",min:20,max:8000,step:1,unit:" Hz"});
   range(h,{key:"T",en:"Chirp duration T",ko:"처프 길이 T",min:1,max:3,step:.25,digits:2,unit:" s"});
  }
  const presetRow=dom("div","ss-al-presets",null,h);
  const presets=state.kind==="sine"?
   [[4000,"No alias · 4 kHz","무에일리어싱 · 4kHz"],[2000,"1500 → 500 Hz alias","1500 → 500Hz 에일리어싱"],[1200,"1500 → 300 Hz alias","1500 → 300Hz 에일리어싱"]]:
   [[16000,"No alias · 16 kHz","전구간 무에일리어싱 · 16kHz"],[4000,"Fold twice · 4 kHz","두 번 접힘 · 4kHz"],[2500,"Multiple folds · 2.5 kHz","여러 번 접힘 · 2.5kHz"]];
  for(const [f,labelEn,labelKo] of presets){
   const preset=dom("button","ss-al-preset",txt(labelEn,labelKo,true),presetRow);
   preset.type="button";preset.dataset.fs=String(f);
   preset.setAttribute("aria-pressed",String(state.fs===f));
   preset.addEventListener("click",()=>{state.fs=f;renderControls();change()});
  }
  select(h,{key:"windowMs",en:"Visible time span",ko:"표시 시간 범위",values:[["auto","Auto · 12 cycles","자동 · 약 12주기"],["2","2 ms","2 ms"],["5","5 ms","5 ms"],["10","10 ms","10 ms"],["20","20 ms","20 ms"],["50","50 ms","50 ms"],["120","120 ms","120 ms"],["240","240 ms","240 ms"],["480","480 ms","480 ms"]]});
  select(h,{key:"aliasGuide",en:"Sample-consistent alias guide",ko:"표본 일치 에일리어스 안내선",values:[["on","Show alias guide","에일리어스 안내선 표시"],["off","Hide alias guide","안내선 숨기기"]]});
  select(h,{key:"showFFT",en:"Measured STFT peaks",ko:"표본의 STFT 피크",values:[["on","Show STFT peaks","STFT 피크 표시"],["off","Hide STFT peaks","STFT 피크 숨기기"]]});
  range(h,{key:"pos",en:"Observation time",ko:"관찰 시각",min:0,max:100,step:1,unit:"%",changed:()=>{
   if(audio.playing)seek(state.T*state.pos/100);else drawSoon();
  }});
  const actions=dom("div","ss-al-control-buttons",null,h),play=dom("button",null,null,actions);
  play.type="button";play.id="ss-extra-animate";play.textContent=txt(state.playing?"Pause sweep":"Play sweep",state.playing?"움직임 일시 정지":"시간 변화 재생",true);
  play.addEventListener("click",()=>{
   if(!state.playing&&audio.playing)stopAudio(true);
   state.playing=!state.playing;previousFrame=0;
   play.textContent=txt(state.playing?"Pause sweep":"Play sweep",state.playing?"움직임 일시 정지":"시간 변화 재생",true);
   if(state.playing)playId=requestAnimationFrame(animate);
   else if(playId!==null){cancelAnimationFrame(playId);playId=null}
  });
 }
 if(lab==="sampling"){
  dom("p","ss-al-audio-caution",txt(
   "Sound uses actual frequencies. Browser audio output uses the device sample rate (typically 44.1/48 kHz), not experiment fₛ.",
   "소리는 실제 주파수로 재생합니다. 브라우저 오디오 출력은 실험 fₛ가 아니라 장치 샘플률(보통 44.1/48kHz)을 사용합니다."
  ),a);
 }
 {
  const buttons=dom("div","ss-al-control-buttons",null,a);
  const play=dom("button","ss-al-primary",null,buttons),pause=dom("button",null,null,buttons),stop=dom("button",null,null,buttons);
  play.id="ss-al-play";pause.id="ss-al-pause";stop.id="ss-al-stop";
  let aliasPlay=null;
  if(lab==="sampling"){
   aliasPlay=dom("button",null,null,buttons);
   aliasPlay.id="ss-al-play-alias";aliasPlay.type="button";
   play.id="ss-al-play-ct";
   play.addEventListener("click",()=>startAudio("ct"));
   aliasPlay.addEventListener("click",()=>startAudio("alias"));
  }
  const status=dom("p","ss-al-audio-status",null,a);status.setAttribute("role","status");
  audio.buttons={play,pause,stop,aliasPlay};audio.status=status;
  if(lab==="sampling"){
   dom("div","ss-al-audio-values",null,a).id="ss-al-audio-values";
   const soundCheck=dom("button","ss-al-sound-check",txt("Test output · 1 kHz","소리 확인 · 1kHz",true),a);
   soundCheck.id="ss-al-sound-check";soundCheck.type="button";
   soundCheck.addEventListener("click",testAudioOutput);
  }
  if(lab!=="sampling")play.addEventListener("click",startAudio);
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
  outsideLegend(1,[["x(t)",C.pal.line],[txt("± envelope","± 포락선",true),C.pal.alt]]);
  marker(C,B,(audioPosition()%2),beatsAt(audioPosition()%2),C.pal.alt);
 }
 C=canvasContext(canvases[1]);
 if(C){
  const t0=.27,dt=.045,B=axes(C,{xmin:t0,xmax:t0+dt,ymin:-2.2,ymax:2.2,xlabel:"t (s)",ylabel:"x(t)"});
  const a=[],b=[],c=[];
  for(let i=0;i<=900;i++){const t=t0+dt*i/900;a.push([t,Math.sin(2*Math.PI*state.f1*t)]);b.push([t,state.ratio*Math.sin(2*Math.PI*(state.f1+state.delta)*t)]);c.push([t,beatsAt(t)])}
  line(C,B,a,C.pal.muted,1);line(C,B,b,C.pal.alt,1);line(C,B,c,C.pal.line,2);
  outsideLegend(2,[[txt("tone 1","신호 1",true),C.pal.muted],[txt("tone 2","신호 2",true),C.pal.alt],[txt("sum","합",true),C.pal.line]]);
 }
 C=canvasContext(canvases[2]);
 if(C){
  const xmax=state.f1+Math.max(15,state.delta)*1.45;
  const B=axes(C,{xmin:Math.max(0,state.f1-28),xmax:xmax,ymin:0,ymax:1.15,xlabel:"f (Hz)",ylabel:"Amplitude"});
  const c=C.ctx;
  for(const [f,a,color] of [[state.f1,1,C.pal.line],[state.f1+state.delta,state.ratio,C.pal.alt]]){
   c.strokeStyle=color;c.lineWidth=4;c.beginPath();c.moveTo(B.x(f),B.y(0));c.lineTo(B.x(f),B.y(a));c.stroke();circle(c,B.x(f),B.y(a),color,4);
  }
  outsideLegend(3,[[txt("Frequency components","주파수 성분",true),C.pal.line]]);
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
  outsideLegend(1,am?[["AM",C.pal.line],[txt("envelope","포락선",true),C.pal.alt]]:[[txt("FM · constant amplitude","FM · 일정 진폭",true),C.pal.line]]);
  const t=audioPosition()%tmax;marker(C,B,t,modAt(t),C.pal.alt);
 }
 C=canvasContext(canvases[1]);if(C){
  const time=.5,pts=[];
  const range=am?{ymin:0,ymax:2.15,ylabel:"Envelope amplitude"}:{ymin:state.fc-state.beta*state.fm-12,ymax:state.fc+state.beta*state.fm+12,ylabel:"fᵢ(t) (Hz)"};
  const B=axes(C,{xmin:0,xmax:time,...range,xlabel:"t (s)"});
  for(let i=0;i<=500;i++){const t=time*i/500;pts.push([t,am?1+state.depth*Math.cos(2*Math.PI*state.fm*t):state.fc+state.beta*state.fm*Math.cos(2*Math.PI*state.fm*t)])}
  line(C,B,pts,C.pal.alt,2.2);
  outsideLegend(2,[[am?txt("AM envelope","AM 포락선",true):txt("FM instantaneous frequency","FM 순간주파수",true),C.pal.alt]]);
 }
 C=canvasContext(canvases[2]);if(C){
  const S=spectrum(),B=axes(C,{xmin:S.lo,xmax:S.hi,ymin:-70,ymax:2,xlabel:"f (Hz)",ylabel:"Rel. FFT (dB)"});
  line(C,B,S.data,C.pal.line,2);
  outsideLegend(3,[[txt("4096-point Hann FFT · 1s","4096점 Hann FFT · 1초",true),C.pal.line]]);
 }
 $("ss-al-note-1").textContent=txt("AM changes envelope magnitude; FM keeps amplitude constant while changing phase slope.","AM은 포락선의 크기를, FM은 일정한 진폭에서 위상 변화율을 조절합니다.");
 $("ss-al-note-2").textContent=txt(am?"Message-controlled AM envelope.":"Instantaneous frequency f꜀+βfₘ cos(2πfₘt).",am?"정보 신호에 따라 변하는 AM 포락선입니다.":"순간주파수 f꜀+βfₘ cos(2πfₘt)입니다.");
 $("ss-al-note-3").textContent=txt("Numerical one-sided FFT; amplitude is relative to the largest bin in the displayed band.","수치 계산한 단측 FFT입니다. 표시 대역의 최대 빈을 기준으로 상대 크기를 나타냅니다.");
}
function plotSamples(C,B,tStart,tEnd,showConnect=false){
 const first=Math.max(0,Math.ceil(tStart*state.fs-1e-10)),last=Math.min(Math.floor(state.T*state.fs),Math.floor(tEnd*state.fs+1e-10)),pts=[];
 const stride=Math.max(1,Math.ceil((last-first+1)/220));
 for(let n=first;n<=last;n+=stride){const t=n/state.fs,v=continuousAt(t);pts.push([t,v])}
 if(showConnect&&pts.length>1)line(C,B,pts,C.pal.alt,1,[4,4]);
 for(const [t,v] of pts){
  C.ctx.strokeStyle=C.pal.alt;C.ctx.lineWidth=1.3;C.ctx.beginPath();C.ctx.moveTo(B.x(t),B.y(0));C.ctx.lineTo(B.x(t),B.y(v));C.ctx.stroke();circle(C.ctx,B.x(t),B.y(v),C.pal.alt,3.8);
 }
 return pts;
}
// The measured points use a Hann-windowed FFT of ACTUAL x[n], not a
// manually folded frequency curve. Finite windows smear fast chirp crossings.
function sampledStftPeaks(){
 const signature=[state.kind,state.fs,state.f0,state.f1,state.tone,state.T].join(":");
 if(fftCache?.signature===signature)return fftCache.result;
 const fs=state.fs,total=Math.floor(state.T*fs)+1;
 const goal=Math.min(128,Math.max(16,Math.floor(fs*.50)));
 let N=16;while(N*2<=goal&&N*2<=total)N*=2;
 const count=36,pts=[];
 for(let frame=0;frame<count;frame++){
  const start=Math.max(0,Math.floor((total-N)*frame/(count-1)));
  const re=new Float64Array(N),im=new Float64Array(N);
  for(let i=0;i<N;i++)re[i]=continuousAt((start+i)/fs)*(.5-.5*Math.cos(2*Math.PI*i/(N-1)));
  fftRadix(re,im);
  let kmax=0,max=-1;
  for(let k=0;k<=N/2;k++){
   const a=Math.hypot(re[k],im[k]);
   if(a>max){max=a;kmax=k}
  }
  const t=(start+(N-1)/2)/fs;
  pts.push([t,kmax*fs/N]);
 }
 const result={points:pts,window:N,fs};
 fftCache={signature,result};
 return result;
}
// A sample-consistent, interval-wise phase-fold interpolation. It passes
// through every true sample, but is NOT the unique continuous-time signal,
// not a bandlimited (sinc) reconstruction and not the original source.
function phaseFoldAngle(t){
 const fs=state.fs,at=Math.max(0,t*fs),n=Math.floor(at),u=at-n;
 const p0=phaseAt(n/fs),p1=phaseAt((n+1)/fs);
 const step=p1-p0-2*Math.PI*Math.round((p1-p0)/(2*Math.PI));
 return p0+step*u;
}
function phaseFoldGuide(t){return Math.sin(phaseFoldAngle(t))}
function nyquistCrossings(){
 if(state.kind==="sine"||state.f1===state.f0)return [];
 const lo=Math.min(state.f0,state.f1),hi=Math.max(state.f0,state.f1),cross=[];
 for(let k=0;k<Math.ceil(hi/state.fs)+2;k++){
  const freq=(k+.5)*state.fs;
  if(freq>lo&&freq<hi){
   const t=(freq-state.f0)*state.T/(state.f1-state.f0);
   if(t>=0&&t<=state.T)cross.push(t);
  }
 }
 return cross.sort((a,b)=>a-b);
}
function renderAliasSummary(){
 const el=$("ss-al-alias-summary");if(!el)return;
 el.hidden=false;
 const t=state.T*state.pos/100,fi=freqAt(t),signed=foldedSigned(fi,state.fs);
 const nyquist=state.fs/2,atNyquist=Math.abs(fi-nyquist)<.0001;
 const aliased=fi>nyquist&&!atNyquist;
 const crossings=nyquistCrossings();
 const times=crossings.length?crossings.map(t=>t.toFixed(2)+" s").join(", "):txt("none","없음",true);
 const heading=atNyquist?txt("AT NYQUIST · phase-sensitive boundary","나이퀴스트 경계 · 위상 주의",true):
  aliased?txt("ALIASING","에일리어싱",true):txt("No alias at t","선택 시각 무에일리어싱",true);
 const direction=signed<-.001?txt("reverse phase","위상 반전",true):txt("forward phase","정방향 위상",true);
 el.dataset.aliased=String(aliased);el.dataset.atNyquist=String(atNyquist);
 el.textContent=heading+"  ·  t="+t.toFixed(2)+" s  ·  "+
   "fᵢ="+fi.toFixed(1)+" Hz → fₐ="+signed.toFixed(1)+" Hz ("+direction+")  ·  "+
   "fₛ/2="+(state.fs/2).toFixed(1)+" Hz  ·  "+
   txt("crossings","교차 시각",true)+": "+times;
}
function drawSampling(){
 const T=state.T,center=T*state.pos/100;
 const localFrequency=Math.max(20,Math.abs(freqAt(center)));
 const requestedSpan=state.windowMs==="auto"?clamp(12/localFrequency,.002,.48):Number(state.windowMs)/1000;
 const span=Math.min(requestedSpan,T),begin=clamp(center-span/2,0,T-span),end=begin+span;
 renderAliasSummary();
 let C=canvasContext(canvases[0]);
 if(C){
  const B=axes(C,{xmin:begin,xmax:end,ymin:-1.2,ymax:1.2,
   xlabel:"t (ms)",ylabel:"x(t)",xticks:4,xformat:t=>Math.round(1000*t).toString(),yvalues:[-1,0,1]});
  const original=[],guide=[];
  for(let i=0;i<=1250;i++){
   const t=begin+span*i/1250;
   original.push([t,continuousAt(t)]);
   if(state.aliasGuide==="on")guide.push([t,phaseFoldGuide(t)]);
  }
  line(C,B,original,C.pal.muted,1.3);
  if(guide.length)line(C,B,guide,C.pal.line,2.6,[7,4]);
  plotSamples(C,B,begin,end,false);
  if(Math.max(freqAt(begin),freqAt(end))*span>140){
   C.ctx.save();C.ctx.font="12px Arial";C.ctx.fillStyle=C.pal.alt;C.ctx.textAlign="left";
   C.ctx.fillText(txt("Display may miss CT cycles: choose 2–10 ms","CT 주기 표시 부족: 2–10ms 선택",true),B.r.l+6,B.r.t+15);
   C.ctx.restore();
  }
  marker(C,B,center,continuousAt(center),C.pal.alt);
  outsideLegend(1,[
   [txt("Original CT x(t)","원래 CT x(t)",true),C.pal.muted],
   ...(state.aliasGuide==="on"?[[txt("Aliased-view guide","에일리어스 안내 파형",true),C.pal.line,"dash"]]:[]),
   [txt("Exact samples","실제 표본점",true),C.pal.alt,"dot"]
  ]);
 }
 C=canvasContext(canvases[1]);
 if(C){
  const n0=Math.max(0,Math.ceil(begin*state.fs)),n1=Math.max(n0+1,Math.floor(end*state.fs));
  const integerLabels=integerTicks(n0,n1,5);
  canvases[1].dataset.integerTicks=integerLabels.join(",");
  canvases[1].setAttribute("aria-label",txt("Discrete-time x[n], integer sample indices","정수 표본 첨자를 가진 이산시간 수열 x[n]",true)+" · n="+integerLabels.join(", "));
  const B=axes(C,{xmin:n0-.55,xmax:n1+.55,ymin:-1.2,ymax:1.2,
   xlabel:"n",ylabel:"x[n]",xvalues:integerLabels,
   xformat:n=>String(Math.round(n)),yvalues:[-1,0,1]});
  const ctx=C.ctx;
  ctx.strokeStyle=C.pal.muted;ctx.lineWidth=1;ctx.beginPath();
  ctx.moveTo(B.r.l,B.y(0));ctx.lineTo(B.r.right,B.y(0));ctx.stroke();
  const selectedN=Math.round(center*state.fs);
  const stride=Math.max(1,Math.ceil((n1-n0+1)/180));
  for(let n=n0;n<=n1;n+=stride){
   const v=continuousAt(n/state.fs),x=B.x(n);
   ctx.strokeStyle=C.pal.line;ctx.lineWidth=1.4;
   ctx.beginPath();ctx.moveTo(x,B.y(0));ctx.lineTo(x,B.y(v));ctx.stroke();
   circle(ctx,x,B.y(v),n===selectedN?C.pal.alt:C.pal.line,n===selectedN?5.1:3.2);
  }
  outsideLegend(2,[[txt(stride>1?"Displayed every "+stride+"th sample":"Discrete samples at integer n",stride>1?stride+"개 간격 표본 표시":"정수 n에서의 이산 표본",true),C.pal.line,"dot"]]);
 }
 C=canvasContext(canvases[2]);
 if(C){
  const fmax=Math.max(state.kind==="sine"?state.tone:Math.max(state.f0,state.f1),state.fs/2)*1.18;
  const B=axes(C,{xmin:0,xmax:T,ymin:0,ymax:fmax,
   xlabel:"t (s)",ylabel:"f (Hz)",yformat:v=>Math.round(v).toString()});
  const original=[],fold=[],ny=[];
  const ctx=C.ctx;
  // Lightly shade the time regions where the original instantaneous frequency
  // exceeds Nyquist. The threshold line remains visible above the shading.
  ctx.save();ctx.globalAlpha=.075;ctx.fillStyle=C.pal.alt;
  for(let i=0;i<300;i++){
   const t0=T*i/300,t1=T*(i+1)/300;
   if(freqAt((t0+t1)/2)>state.fs/2)ctx.fillRect(B.x(t0),B.r.t,B.x(t1)-B.x(t0)+1,B.r.height);
  }
  ctx.restore();
  for(let i=0;i<=750;i++){
   const t=T*i/750,frequency=freqAt(t);
   original.push([t,frequency]);fold.push([t,Math.abs(foldedSigned(frequency,state.fs))]);ny.push([t,state.fs/2]);
  }
  line(C,B,original,C.pal.muted,1.6);
  line(C,B,ny,C.pal.alt,1.8,[6,4]);
  line(C,B,fold,C.pal.line,2.5);
  if(state.showFFT==="on"){
   const measured=sampledStftPeaks();
   for(const [t,f] of measured.points){
    if(t<0||t>T)continue;
    ctx.save();ctx.globalAlpha=.90;circle(ctx,B.x(t),B.y(f),C.pal.peak,2.8);ctx.restore();
   }
  }
  for(const t of nyquistCrossings()){
   ctx.save();ctx.strokeStyle=C.pal.alt;ctx.lineWidth=1.4;ctx.setLineDash([2,4]);
   ctx.beginPath();ctx.moveTo(B.x(t),B.r.t);ctx.lineTo(B.x(t),B.r.b);ctx.stroke();
   ctx.setLineDash([]);ctx.fillStyle=C.pal.alt;ctx.font="11px Arial";
   ctx.textAlign="center";ctx.fillText(t.toFixed(2)+" s",B.x(t),B.r.b-10);ctx.restore();
  }
  marker(C,B,center,Math.abs(foldedSigned(freqAt(center),state.fs)),C.pal.alt);
  outsideLegend(3,[
   [txt("Input fᵢ(t)","입력 fᵢ(t)",true),C.pal.muted],
   [txt("Folded |fₐ(t)|","접힌 |fₐ(t)|",true),C.pal.line],
   [txt("Nyquist fₛ/2","나이퀴스트 fₛ/2",true),C.pal.alt,"dash"],
   ...(state.showFFT==="on"?[[txt("Measured STFT peaks","표본 STFT 피크",true),C.pal.peak,"dot"]]:[])
  ]);
 }
 $("ss-al-note-1").textContent=txt(
  "Thin gray: original CT waveform. Green dashed: a sample-consistent phase-fold guide; both pass through the same orange samples. The guide is NOT a unique reconstruction.",
  "얇은 회색은 원래 CT 파형, 녹색 점선은 표본에 일치하는 위상 접힘 안내선입니다. 둘 다 주황색 표본을 통과하지만 안내선은 유일한 복원 결과가 아닙니다."
 );
 $("ss-al-note-2").textContent=txt(
  "Sample index n always uses integer ticks. Orange highlights the nearest sample to the selected time.",
  "표본 첨자 n에는 정수 눈금만 사용합니다. 주황색 점은 선택 시각에 가장 가까운 표본입니다."
 );
 $("ss-al-note-3").textContent=txt(
  "Shaded intervals: source fᵢ(t) exceeds fₛ/2; vertical marks: Nyquist crossings. Purple points are finite-window STFT estimates and may differ near rapid folds.",
  "음영은 입력 순간주파수가 fₛ/2를 넘는 구간, 수직 점선은 나이퀴스트 교차 시각입니다. 보라색 점은 유한 윈도 STFT 추정값으로 급격한 접힘에서 오차가 날 수 있습니다."
 );
}

function audioPosition(){return audio.playing&&audioCtx?clamp(audioCtx.currentTime-audio.start,0,audio.duration):audio.offset}
function updateTransport(){
 const position=audioPosition(),slider=$("ss-al-seek");
 slider.value=Math.round(position/audio.duration*1000);
 $("ss-al-transport-time").textContent=position.toFixed(2)+" / "+audio.duration.toFixed(2)+" s";
}
function refreshAudio(){
 if(!audio.buttons)return;
 const {play,pause,stop,aliasPlay}=audio.buttons,active=audio.playing?audio.signal:"";
 if(lab==="sampling"){
  const d=$("ss-al-audio-values");
  if(d){
   if(state.kind==="sine"){
    const signed=foldedSigned(state.tone,state.fs),alias=Math.abs(signed);
    d.textContent=txt(
     "CT "+state.tone+" Hz → signed alias "+signed+" Hz (audible frequency "+alias+" Hz). Same x[n] at fₛ="+state.fs+" Hz.",
     "CT "+state.tone+"Hz → 부호 있는 에일리어스 "+signed+"Hz (들리는 주파수 "+alias+"Hz). fₛ="+state.fs+"Hz에서 같은 x[n]을 만듭니다."
    );
   }else{
    d.textContent=txt(
     "CT chirp "+state.f0+"–"+state.f1+" Hz at actual frequencies. Alias guide matches samples but is NOT a unique reconstruction.",
     "CT 처프 "+state.f0+"–"+state.f1+"Hz를 실제 주파수로 듣습니다. 에일리어스 안내 파형은 표본과 일치하지만 유일한 복원 신호는 아닙니다."
    );
   }
  }
 }
 if(lab==="sampling"){
  play.textContent=txt("▶ Original CT","▶ 원래 CT 소리",true);
  play.disabled=active==="ct";
  aliasPlay.textContent=txt("▶ Alias guide","▶ 에일리어스 소리",true);
  aliasPlay.disabled=active==="alias";
 }else{
  play.textContent=txt(audio.playing?"Playing":"▶ Play",audio.playing?"재생 중":"▶ 재생",true);
  play.disabled=audio.playing;
 }
 pause.textContent=txt("Ⅱ Pause","Ⅱ 일시 정지",true);pause.disabled=!audio.playing;
 stop.textContent=txt("■ Stop","■ 정지",true);stop.disabled=!audio.playing&&audio.offset===0;
 audio.status.textContent=audio.error||(
  audio.playing?
   txt((lab==="sampling"?(audio.signal==="ct"?"Original CT":"Aliased guide")+" · ":"")+"Playing · Web Audio"+(audioCtx?.sampleRate?" · "+audioCtx.sampleRate+" Hz output":""),
       (lab==="sampling"?(audio.signal==="ct"?"원래 CT":"에일리어스 안내 파형")+" · ":"")+"재생 중 · Web Audio"+(audioCtx?.sampleRate?" · 출력 "+audioCtx.sampleRate+"Hz":"")):
   audio.offset>0&&audio.offset<audio.duration?
    txt("Paused · resume at current position","일시 정지 · 현재 위치에서 계속"):
    txt("Press Play to start sound at a low volume.","낮은 음량에서 재생 버튼을 누르세요.")
 );
 updateTransport();
}
function closeSource(){
 if(!source)return;const s=source;source=null;s.onended=null;try{s.stop()}catch(e){}try{s.disconnect()}catch(e){}
}
function stopAudio(reset=true){
 requestId++;
 const wasActive=audio.playing||audio.offset>0,pos=audioPosition();
 audio.playing=false;
 if(transportId!==null){cancelAnimationFrame(transportId);transportId=null}
 closeSource();audio.offset=reset?0:pos;
 if(lab==="sampling"&&wasActive){
  state.pos=100*audio.offset/state.T;
  const slider=$("ss-extra-pos");
  if(slider){
   slider.value=String(state.pos);
   const output=slider.parentElement.querySelector("output");
   if(output)output.textContent=Math.round(state.pos)+"%";
  }
 }
 refreshAudio();drawSoon();
}
function change(){
 fftCache=null;
 stopAudio(true);audio.buffer=null;
 if(lab==="sampling"){
  audio.duration=state.T;
  if(state.playing){
   state.playing=false;
   if(playId!==null)cancelAnimationFrame(playId);
   playId=null;renderControls();
  }
 }
 if(lab==="amfm"||lab==="sampling")renderFormula();
 drawSoon();
}
async function testAudioOutput(){
 const Ctx=window.AudioContext||window.webkitAudioContext;
 if(!Ctx){audio.error=txt("Web Audio API unavailable.","Web Audio API를 사용할 수 없습니다.");refreshAudio();return}
 try{
  stopAudio(true);audio.error="";
  if(!audioCtx)audioCtx=new Ctx();
  await audioCtx.resume();
  if(audioCtx.state&&audioCtx.state!=="running")throw Error("AudioContext "+audioCtx.state);
  const oscillator=audioCtx.createOscillator(),gain=audioCtx.createGain(),now=audioCtx.currentTime;
  oscillator.type="sine";oscillator.frequency.setValueAtTime(1000,now);
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(.12,now+.025);
  gain.gain.exponentialRampToValueAtTime(.0001,now+.38);
  oscillator.connect(gain);gain.connect(audioCtx.destination);
  oscillator.start(now);oscillator.stop(now+.40);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
  audio.error=txt("1 kHz test tone triggered. If silent, check browser tab and output-device volume.",
                  "1kHz 확인음을 출력했습니다. 들리지 않으면 브라우저 탭과 출력 장치 음량을 확인하세요.");
  refreshAudio();
 }catch(e){
  audio.error=txt("Audio check failed: ","오디오 확인 실패: ")+String(e?.message||e);
  refreshAudio();
 }
}
function fftAudioBuffer(){
 const sr=audioCtx.sampleRate,n=Math.floor(sr*audio.duration);
 const buffer=audioCtx.createBuffer(1,n,sr),data=buffer.getChannelData(0),fade=.015;
 for(let i=0;i<n;i++){
  const t=i/sr,gain=Math.max(0,Math.min(1,t/fade,(audio.duration-t)/fade));
  const sample=lab==="sampling"?
   (audio.signal==="ct"?Math.sin(phaseAt(t)):Math.sin(phaseFoldAngle(t))):
   audioAt(t);
  data[i]=clamp(.28*gain*sample,-1,1);
 }
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
async function startAudio(choice=null){
 audio.error="";
 if(lab==="sampling"){
  if(choice!=="ct"&&choice!=="alias")return;
  if(state.playing){
   state.playing=false;
   if(playId!==null)cancelAnimationFrame(playId);
   playId=null;renderControls();
  }
  if(audio.playing&&audio.signal===choice)return;
  if(audio.signal!==choice){
   const saved=audioPosition();
   stopAudio(false);
   audio.offset=saved;
   audio.signal=choice;audio.buffer=null;
  }
  audio.duration=state.T;
 }else if(audio.playing)return;
 const Ctx=window.AudioContext||window.webkitAudioContext;
 if(!Ctx){audio.error=txt("Web Audio API unavailable.","Web Audio API 미지원");refreshAudio();return}
 const req=++requestId;
 try{
  if(!audioCtx)audioCtx=new Ctx();
  await audioCtx.resume();
  if(requestId!==req)return;
  if(audioCtx.state&&audioCtx.state!=="running")throw Error("AudioContext "+audioCtx.state);
  if(!audio.buffer)fftAudioBuffer();
  if(audio.offset>=audio.duration-.001)audio.offset=0;
  beginSource(audio.offset);
 }catch(e){
  if(req===requestId){
   audio.error=txt("Playback failed: ","재생 실패: ")+String(e?.message||e);
   refreshAudio();
  }
 }
}
function audioFrame(){
 transportId=null;if(!audio.playing)return;
 const pos=audioPosition();audio.offset=pos;updateTransport();
 if(lab==="sampling"){
  state.pos=100*pos/state.T;
  const slider=$("ss-extra-pos");
  if(slider){
   slider.value=String(state.pos);
   const output=slider.parentElement.querySelector("output");
   if(output)output.textContent=Math.round(state.pos)+"%";
  }
 }
 if(performance.now()-lastDraw>33)drawSoon();
 if(audio.playing)transportId=requestAnimationFrame(audioFrame);
}
function seek(seconds){
 const was=audio.playing;
 if(was){
  audio.playing=false;
  if(transportId!==null)cancelAnimationFrame(transportId);
  transportId=null;closeSource();
 }
 audio.offset=clamp(seconds,0,audio.duration);
 if(lab==="sampling"){
  state.pos=100*audio.offset/state.T;
  const slider=$("ss-extra-pos");
  if(slider){
   slider.value=String(state.pos);
   const output=slider.parentElement.querySelector("output");
   if(output)output.textContent=Math.round(state.pos)+"%";
  }
 }
 if(was&&audio.buffer&&audio.offset<audio.duration)beginSource(audio.offset);
 else refreshAudio();
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
  stopAudio(true);if(playId!==null){cancelAnimationFrame(playId);playId=null}
  Object.keys(initial).forEach(key=>state[key]=initial[key]);fftCache=null;audio.buffer=null;audio.offset=0;audio.duration=lab==="sampling"?state.T:2;audio.signal="ct";audio.error="";
  previousFrame=0;displayNames();renderControls();drawSoon();
 });
 {
  $("ss-al-seek").addEventListener("input",e=>seek(Number(e.target.value)/1000*audio.duration));
  updateTransport();
 }
 if(lab==="sampling"){
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
 if(window.ResizeObserver)new window.ResizeObserver(drawSoon).observe($("ss-al-charts"));
 document.addEventListener("visibilitychange",()=>{
  if(document.hidden){stopAudio(true);if(lab==="sampling"){state.playing=false;if(playId!==null)cancelAnimationFrame(playId);playId=null;renderControls()}}
 });
 window.addEventListener("pagehide",()=>{
  stopAudio(true);
  if(playId!==null)cancelAnimationFrame(playId);
 });
 drawSoon();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
