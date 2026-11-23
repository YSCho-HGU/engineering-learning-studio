/* Interactive time-frequency analysis: computed radix-2 FFT, windowed STFT and spectrogram. */
(function(global){
"use strict";
const $=id=>document.getElementById(id);
const TWO_PI=2*Math.PI;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=(v,d=1)=>Number(v).toFixed(d);
const modes=global.ELSLanguage;
const lang=()=>modes?.get?.()||"mixed";
const tr=(en,ko,short=false)=>lang()==="en"?en:lang()==="ko"?ko:short?en+" · "+ko:en+"\n"+ko;
function fft(re,im){
 const n=re.length;if(!n||(n&(n-1)))throw Error("FFT length must be a power of 2");
 for(let i=1,j=0;i<n;i++){
  let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;
  if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}
 }
 for(let size=2;size<=n;size*=2){
  const half=size>>1,alpha=-TWO_PI/size;
  for(let offset=0;offset<n;offset+=size){
   for(let j=0;j<half;j++){
    const angle=alpha*j,wr=Math.cos(angle),wi=Math.sin(angle),a=offset+j,b=a+half;
    const vr=wr*re[b]-wi*im[b],vi=wr*im[b]+wi*re[b];
    re[b]=re[a]-vr;im[b]=im[a]-vi;re[a]+=vr;im[a]+=vi;
   }
  }
 }
 return {re,im};
}
function fftMagnitudes(samples,windowKind="rect",size=samples.length){
 const len=samples.length;
 if(size<len||(size&(size-1)))throw Error("FFT length must be a power of 2, >= window length");
 const re=new Float64Array(size),im=new Float64Array(size);
 let gain=0;
 for(let r=0;r<len;r++){
  const w=windowKind==="hann"?(len===1?1:.5-.5*Math.cos(TWO_PI*r/(len-1))):1;
  re[r]=samples[r]*w;gain+=w;
 }
 fft(re,im);
 const amplitudes=new Float64Array(size/2+1);
 for(let k=0;k<amplitudes.length;k++)
  amplitudes[k]=Math.hypot(re[k],im[k])*(k===0||k===size/2?1:2)/gain;
 return amplitudes;
}
function frequencyAt(t,{duration,f0,f1,shape="rising"}){
 const u=clamp(t/duration,0,1);
 if(shape==="falling")return f1+(f0-f1)*u;
 if(shape==="step")return t<duration/2?f0:f1;
 return f0+(f1-f0)*u;
}
function signalPhase(t,{duration,f0,f1,shape="rising"}){
 if(shape==="step")return t<=duration/2?f0*t:f0*duration/2+f1*(t-duration/2);
 if(shape==="falling")return f1*t+(f0-f1)*t*t/(2*duration);
 return f0*t+(f1-f0)*t*t/(2*duration);
}
function analyze({fs=512,duration=2,f0=20,f1=180,L=128,overlap=75,window="hann",padding=1,shape="rising"}={}){
 fs=Number(fs);duration=Number(duration);f0=Number(f0);f1=Number(f1);
 L=Number(L);overlap=Number(overlap);padding=Number(padding);
 if(!["rising","falling","step"].includes(shape))throw Error("Unsupported frequency pattern");
 const N=Math.round(fs*duration),M=L*padding,H=Math.max(1,Math.round(L*(1-overlap/100)));
 if(fs<=0||duration<=0||N<L||N>8192||f0<0||f1<0||Math.max(f0,f1)>=fs/2||overlap<0||overlap>=100)throw Error("Invalid chirp range or sampling rate");
 const params={duration,f0,f1,shape};
 const samples=Float64Array.from({length:N},(_,n)=>{
  const t=n/fs;return Math.sin(TWO_PI*signalPhase(t,params));
 });
 const globalFft=fftMagnitudes(samples,"rect",N);
 const starts=[];
 for(let a=0;a+L<=N;a+=H)starts.push(a);
 const frames=starts.map(a=>fftMagnitudes(samples.subarray(a,a+L),window,M));
 const centers=starts.map(a=>(a+(L-1)/2)/fs);
 const peaks=frames.map(row=>{
  let best=1;for(let k=2;k<row.length;k++)if(row[k]>row[best])best=k;
  return best*fs/M;
 });
 let max=0;for(const row of frames)for(const value of row)if(value>max)max=value;
 const decibels=frames.map(row=>Float64Array.from(row,value=>clamp(20*Math.log10(Math.max(value,1e-12)/Math.max(max,1e-12)),-60,0)));
 return {fs,duration,N,L,M,H,overlap,window,f0,f1,shape,samples,globalFft,starts,frames,centers,peaks,decibels,
  windowTime:L/fs,hopTime:H/fs,binSpacing:fs/L,displaySpacing:fs/M,frameCount:frames.length,
  instantaneousFrequency:t=>frequencyAt(t,params)};
}
const colors=[[19,43,85],[36,107,153],[54,182,174],[244,210,107],[241,122,71]];
function palette(db){
 const p=clamp((db+60)/60,0,1)*4,i=Math.min(3,Math.floor(p)),f=p-i;
 return "rgb("+colors[i].map((v,k)=>Math.round(v+(colors[i+1][k]-v)*f)).join(",")+")";
}
function attrs(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function graphBase(w,h,{left=55,right=14,top=17,bottom=36}={}){
 return {left,right,top,bottom,W:w-left-right,H:h-top-bottom,w,h};
}
function axes(p,{labelX="Time (s)",labelY="",xMax=2,yMin=0,yMax=1}={}){
 const t=[];
 for(let i=0;i<=4;i++){
  const x=p.left+i*p.W/4,y=p.top+i*p.H/4;
  t.push('<line class="ss-stft-grid" x1="'+x+'" y1="'+p.top+'" x2="'+x+'" y2="'+(p.top+p.H)+'"/>');
  t.push('<line class="ss-stft-grid" x1="'+p.left+'" y1="'+y+'" x2="'+(p.left+p.W)+'" y2="'+y+'"/>');
  t.push('<text class="ss-stft-tick" x="'+x+'" y="'+(p.h-15)+'" text-anchor="middle">'+fmt(xMax*i/4,xMax>=10?0:2)+'</text>');
  t.push('<text class="ss-stft-tick" x="'+(p.left-7)+'" y="'+(y+4)+'" text-anchor="end">'+fmt(yMax+(yMin-yMax)*i/4,Math.max(Math.abs(yMax),Math.abs(yMin))>=10?0:1)+'</text>');
 }
 t.push('<line class="ss-stft-axis" x1="'+p.left+'" y1="'+p.top+'" x2="'+p.left+'" y2="'+(p.top+p.H)+'"/>');
 t.push('<line class="ss-stft-axis" x1="'+p.left+'" y1="'+(p.top+p.H)+'" x2="'+(p.left+p.W)+'" y2="'+(p.top+p.H)+'"/>');
 t.push('<text class="ss-stft-axis-label" text-anchor="middle" x="'+(p.left+p.W/2)+'" y="'+(p.h-1)+'">'+attrs(labelX)+'</text>');
 t.push('<text class="ss-stft-axis-label" x="12" y="'+(p.top+p.H/2)+'" text-anchor="middle" transform="rotate(-90 12 '+(p.top+p.H/2)+')">'+attrs(labelY)+'</text>');
 return t.join("");
}
function linePath(values,x0,y0,xStep,yScale,skip=1){
 let d="";for(let i=0;i<values.length;i+=skip){const val=values[i];if(!Number.isFinite(val))continue;d+=(d?"L":"M")+fmt(x0+i*xStep,2)+" "+fmt(y0-val*yScale,2)+" ";}
 return d;
}
function drawTime(a,frame){
 const svg=$("stft-time-plot"),p=graphBase(900,225,{left:58,right:16,top:16,bottom:37}),b=p.top+p.H;
 const x=n=>p.left+n/(a.N-1)*p.W,y=v=>p.top+p.H/2-v*(p.H/2-8);
 const start=a.starts[frame],end=start+a.L-1;
 let markup=axes(p,{xMax:a.duration,yMin:-1,yMax:1,labelX:"Time (s)",labelY:"x(t)"});
 markup+='<rect class="ss-stft-window-region" x="'+x(start)+'" y="'+p.top+'" width="'+Math.max(1,x(end)-x(start))+'" height="'+p.H+'"/>';
 markup+='<path class="ss-stft-trace" d="'+linePath(a.samples,x(0),p.top+p.H/2,p.W/(a.N-1),p.H/2-8,Math.max(1,Math.floor(a.N/1600)))+'"/>';
 markup+='<line class="ss-stft-window-edge" x1="'+x(start)+'" y1="'+p.top+'" x2="'+x(start)+'" y2="'+b+'"/>';
 markup+='<line class="ss-stft-window-edge" x1="'+x(end)+'" y1="'+p.top+'" x2="'+x(end)+'" y2="'+b+'"/>';
 svg.innerHTML=markup;
}
function drawSpectrum(svgId,bins,fs,size,maxPlot,highlight){
 const svg=$(svgId),p=graphBase(580,260,{left:50,right:18,top:18,bottom:38}),h=p.top+p.H;
 const fmax=fs/2,peak=Math.max(0.01,maxPlot||Math.max(...bins));
 let markup=axes(p,{xMax:fmax,yMax:peak,labelX:"Frequency (Hz)",labelY:"Amplitude"});
 let d="";
 for(let k=0;k<bins.length;k++){
  const x=p.left+k/(bins.length-1)*p.W,y=h-clamp(bins[k]/peak,0,1)*p.H;
  d+=(k?"L":"M")+fmt(x,2)+" "+fmt(y,2)+" ";
 }
 markup+='<path class="ss-stft-trace" d="'+d+'"/>';
 if(Number.isFinite(highlight))markup+='<line class="ss-stft-current" x1="'+(p.left+highlight/fmax*p.W)+'" x2="'+(p.left+highlight/fmax*p.W)+'" y1="'+p.top+'" y2="'+h+'" stroke-dasharray="5 5"/>';
 svg.innerHTML=markup;
}
function drawMap(a,frame){
 const svg=$("stft-spectrogram"),p=graphBase(900,325,{left:57,right:16,top:18,bottom:38});
 const x=t=>p.left+clamp(t/a.duration,0,1)*p.W,y=f=>p.top+p.H-clamp(f/(a.fs/2),0,1)*p.H;
 let markup=axes(p,{xMax:a.duration,yMax:a.fs/2,labelX:"Time (s)",labelY:"Frequency (Hz)"});
 const halfHop=a.hopTime/2;
 for(let i=0;i<a.frameCount;i++){
  const cx=a.centers[i],startX=x(Math.max(0,cx-halfHop)),endX=x(Math.min(a.duration,cx+halfHop));
  const width=Math.max(1,endX-startX+0.35),row=a.decibels[i];
  for(let k=0;k<row.length;k++){
   const hi=Math.min(a.fs/2,(k+.5)*a.fs/a.M);
   const lo=Math.max(0,(k-.5)*a.fs/a.M);
   const yy=y(hi),height=Math.max(1,y(lo)-yy+.3);
   markup+='<rect x="'+fmt(startX,2)+'" y="'+fmt(yy,2)+'" width="'+fmt(width,2)+'" height="'+fmt(height,2)+'" fill="'+palette(row[k])+'"/>';
  }
 }
 const center=x(a.centers[frame]);
 markup+='<line class="ss-stft-current" x1="'+center+'" y1="'+p.top+'" x2="'+center+'" y2="'+(p.top+p.H)+'" stroke="#ffffff" stroke-width="2"/>';
 // Redraw labels after raster cells so axes stay readable.
 markup+=axes(p,{xMax:a.duration,yMax:a.fs/2,labelX:"Time (s)",labelY:"Frequency (Hz)"});
 svg.innerHTML=markup;
}
const original={fs:512,duration:2,f0:20,f1:180,L:128,overlap:75,window:"hann",padding:1,shape:"rising"};
let analysis=null,frame=0,missionChecked=false;
function input(){return{fs:+$("stft-fs").value,duration:+$("stft-duration").value,f0:+$("stft-start").value,f1:+$("stft-end").value,L:+$("stft-window").value,overlap:+$("stft-overlap").value,window:$("stft-window-type").value,padding:+$("stft-fft-factor").value,shape:$("stft-shape").value};}
function updateRange(){
 const v=input(),limit=v.fs/2-5;
 $("stft-start").max=String(Math.min(100,limit));
 $("stft-end").max=String(Math.min(240,limit));
 if(v.f0>=v.fs/2){$("stft-start").value=String(Math.max(10,Math.min(100,limit)))}
 if(v.f1>=v.fs/2){$("stft-end").value=String(Math.max(80,Math.min(240,limit)))}
}
function stats(a){
 const values=[
  [tr("Samples","표본 수",true),a.N],
  [tr("Window duration","창 시간 길이",true),fmt(a.windowTime*1000,1)+" ms"],
  [tr("Original bin spacing","원래 Bin 간격",true),fmt(a.binSpacing,2)+" Hz"],
  [tr("STFT frames · Hop","STFT 구간 · 이동폭",true),a.frameCount+" · "+fmt(a.hopTime*1000,1)+" ms"]
 ];
 $("stft-stats").innerHTML=values.map(([label,v])=>'<div class="ss-stft-stat"><span>'+attrs(label)+'</span><strong>'+v+'</strong></div>').join("");
}
function resetFeedback(){
 missionChecked=false;$("stft-mission-feedback").dataset.result="pending";
 $("stft-mission-feedback").textContent=tr("Make a rising chirp and move the analysis window to the last quarter of the signal.","주파수가 증가하는 처프를 만들고 분석 Window를 신호의 마지막 1/4 구간으로 이동하세요.");
}
function redraw(){
 if(!analysis)return;
 const a=analysis;
 frame=clamp(frame,0,a.frameCount-1);
 $("stft-frame").max=String(a.frameCount-1);
 $("stft-frame").value=String(frame);
 $("stft-frame-value").textContent=(frame+1)+" / "+a.frameCount+" · "+fmt(a.centers[frame],3)+" s";
 $("stft-prev").disabled=frame===0;$("stft-next").disabled=frame===a.frameCount-1;
 $("stft-start-value").textContent=a.f0+" Hz";$("stft-end-value").textContent=a.f1+" Hz";
 stats(a);
 drawTime(a,frame);
 drawSpectrum("stft-global-plot",a.globalFft,a.fs,a.N,Math.max(...a.globalFft));
 drawSpectrum("stft-local-plot",a.frames[frame],a.fs,a.M,Math.max(...a.frames[frame]),a.instantaneousFrequency(a.centers[frame]));
 drawMap(a,frame);
 $("stft-local-help").textContent=tr(
  "Current window center "+fmt(a.centers[frame],3)+" s · Instantaneous frequency ≈ "+fmt(a.instantaneousFrequency(a.centers[frame]),1)+" Hz · measured local peak "+fmt(a.peaks[frame],1)+" Hz",
  "현재 창의 중심 "+fmt(a.centers[frame],3)+"초 · 순간주파수 ≈ "+fmt(a.instantaneousFrequency(a.centers[frame]),1)+" Hz · 측정된 피크 "+fmt(a.peaks[frame],1)+" Hz"
 );
 $("stft-map-note").textContent=tr(
  "Color shows STFT magnitude relative to the largest frame-bin (dB). White line: current analysis frame. Click the spectrogram to select time.",
  "색상은 전체 STFT의 최대 성분을 기준으로 한 상대 크기(dB)입니다. 흰 선은 현재 분석 구간이며, Spectrogram을 클릭해 시간을 선택할 수 있습니다."
 );
}
function compute(){
 updateRange();
 try{analysis=analyze(input())}catch(error){$("stft-map-note").textContent=String(error.message);return}
 frame=clamp(frame,0,analysis.frameCount-1);
 redraw();resetFeedback();
 global.SSMathCore?.queue?.();
}
function setFrame(next){
 frame=clamp(Math.round(next),0,analysis.frameCount-1);redraw();
 if(missionChecked)resetFeedback();
}
function localization(){
 document.documentElement.lang=lang()==="ko"?"ko":"en";
 const items={
 "stft-title":["Chirp, STFT, and Spectrogram","처프·STFT·스펙트로그램"],
 "stft-intro":["Discover why the FFT of an entire signal loses time information. Move a short-time window, compare its FFT, and build the spectrogram.","전체 신호의 FFT가 시간 정보를 알려주지 못하는 이유를 발견하세요. 짧은 분석 창을 이동하고 각 FFT를 비교하면서 Spectrogram을 만듭니다."],
 "stft-step-1":["1 · Chirp","1 · 처프"],
 "stft-step-2":["2 · Global FFT","2 · 전체 FFT"],
 "stft-step-3":["3 · Moving FFT","3 · 이동 FFT"],
 "stft-step-4":["4 · Spectrogram","4 · 스펙트로그램"],
 "stft-controls-title":["Change · Signal and analysis","Change · 신호와 분석 설정"],
 "stft-controls-help":["Adjust chirp frequency, observation duration, and the STFT window. Then move the selected frame.","처프 주파수·관측 시간·STFT 창을 조절한 뒤 현재 분석 구간을 이동하세요."],
 "stft-fs-label":["Sampling rate fs","샘플링 주파수 fs"],
 "stft-duration-label":["Signal duration T","신호 길이 T"],
 "stft-start-label":["Start frequency f0","시작 주파수 f0"],
 "stft-end-label":["End frequency f1","끝 주파수 f1"],
 "stft-window-label":["Window length L (samples)","창 길이 L (samples)"],
 "stft-overlap-label":["Overlap between frames","구간 간 Overlap"],
 "stft-window-type-label":["Analysis window","분석 창 함수"],
 "stft-fft-factor-label":["Display FFT length M","표시용 FFT 길이 M"],
 "stft-frame-label":["Move analysis frame","분석 Window 이동"],
 "stft-prev":["← Previous frame","← 이전 구간"],
 "stft-next":["Next frame →","다음 구간 →"],
 "stft-reset":["Reset experiment","실험 초기화"],
 "stft-time-title":["1 · Observe the Chirp signal","1 · Chirp 시간 신호 관찰"],
 "stft-time-help":["The shaded area is the current STFT analysis window. Narrowing the oscillations means a higher instantaneous frequency.","음영 영역은 현재 STFT 분석 창입니다. 파형의 진동 간격이 좁아질수록 순간주파수가 높아집니다."],
 "stft-global-title":["2 · Entire-record FFT","2 · 전체 구간 FFT"],
 "stft-global-help":["The full FFT identifies frequencies but cannot say when the chirp visited each one.","전체 FFT는 주파수 성분을 보여주지만 언제 나타났는지는 알려주지 않습니다."],
 "stft-local-title":["3 · FFT of the selected window","3 · 선택 구간의 FFT"],
 "stft-map-title":["4 · STFT Spectrogram","4 · STFT Spectrogram"],
 "stft-map-help":["Each vertical slice is an FFT of one window. Follow the bright ridge through time.","각 세로 단면은 하나의 Window FFT 결과입니다. 밝은 능선이 시간에 따라 어떻게 변하는지 확인하세요."],
 "stft-insight-title":["Explain · Connecting the four views","설명 · 네 그림의 관계"],
 "stft-eq1-label":["Linear chirp instantaneous frequency","선형 처프 순간주파수"],
 "stft-eq2-label":["Short-time Fourier transform (M-point FFT)","단시간 푸리에 변환 (M점 FFT)"],
 "stft-eq3-label":["Time window, original frequency bin spacing, hop","창 시간 길이·원래 주파수 격자·이동 간격"],
 "stft-eq4-label":["Power spectrogram (relative display uses magnitude dB)","Power Spectrogram (화면에는 상대 Magnitude dB 사용)"],
 "stft-insight-body":["The full FFT collapses time. STFT repeats FFT on short windows. Smaller L improves localization in time but broadens frequency features; a smaller hop displays more slices, not a longer observation. Zero padding changes the display grid, not the window duration.","전체 FFT는 시간 위치를 구분하지 못합니다. STFT는 짧은 창마다 FFT를 반복합니다. 짧은 L은 시간 위치를 잘 보여주지만 주파수 특징은 넓어집니다. Hop을 줄이면 시간축의 표시 간격만 촘촘해집니다. Zero Padding은 표시 격자를 바꾸지만 창의 시간 길이는 바꾸지 않습니다."],
 "stft-mission-title":["Check · Graph experiment mission","확인 · 그래프 실험 미션"],
 "stft-mission-prompt":["Make a rising chirp (f1 > f0), then move the window into the final quarter. Compare the local FFT peak with the theoretical instantaneous frequency.","상승 처프(f1 > f0)를 만든 다음 Window를 마지막 1/4 구간으로 이동하세요. FFT 피크와 이론 순간주파수를 비교하세요."],
 "stft-mission-check":["Check my experiment","실험 목표 확인"],
 "stft-prev-link":["← Frequency resolution lab","← 주파수 분해능 실습"],
 "stft-catalog-link":["Part C · Learning map","Part C · 학습 목록"]
 };
 for(const [id,[en,ko]] of Object.entries(items)){const el=$(id);if(el)el.textContent=tr(en,ko,id.startsWith("stft-step")||id.endsWith("-link"))}
 if(analysis)redraw();
 if(!missionChecked)resetFeedback();
}
function mission(){
 if(!analysis)return;
 const a=analysis,t=a.centers[frame],theory=a.instantaneousFrequency(t),error=Math.abs(a.peaks[frame]-theory);
 const ok=a.f1>a.f0&&t>=a.duration*.75&&error<=Math.max(a.binSpacing*2,8);
 const el=$("stft-mission-feedback");missionChecked=true;el.dataset.result=ok?"correct":"incorrect";
 el.textContent=ok?tr(
  "Goal achieved. Window center "+fmt(t,2)+" s · predicted "+fmt(theory,1)+" Hz · measured "+fmt(a.peaks[frame],1)+" Hz. Compare the broad full-record FFT with this localized peak.",
  "목표 달성! 중심 시간 "+fmt(t,2)+"초 · 이론 "+fmt(theory,1)+" Hz · 측정 "+fmt(a.peaks[frame],1)+" Hz. 전체 FFT와 국소 피크를 비교하세요."
 ):tr("Not yet. Ensure the chirp increases, move the window near the end, and compare local FFT and theory.",
 "아직 목표에 도달하지 않았습니다. 상승 처프와 마지막 구간을 선택하고 국소 FFT와 이론값을 비교하세요.");
}
function init(){
 modes?.bindSelect?.("#stft-language");
 const fields=["stft-shape","stft-fs","stft-duration","stft-start","stft-end","stft-window","stft-overlap","stft-window-type","stft-fft-factor"];
 for(const id of fields)$(id).addEventListener("input",()=>{frame=0;compute()});
 $("stft-frame").addEventListener("input",e=>setFrame(Number(e.target.value)));
 $("stft-prev").addEventListener("click",()=>setFrame(frame-1));
 $("stft-next").addEventListener("click",()=>setFrame(frame+1));
 $("stft-reset").addEventListener("click",()=>{
  for(const [key,value]of Object.entries(original)){
   const id={f0:"stft-start",f1:"stft-end",L:"stft-window",window:"stft-window-type",padding:"stft-fft-factor",shape:"stft-shape"}[key]||"stft-"+key;
   $(id).value=String(value);
  }
  frame=0;compute();
 });
 $("stft-spectrogram").addEventListener("click",e=>{
  if(!analysis)return;
  const svg=e.currentTarget,p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;
  const local=p.matrixTransform(svg.getScreenCTM().inverse());
  const ratio=clamp((local.x-57)/(900-57-16),0,1),time=ratio*analysis.duration;
  let best=0,min=Infinity;
  for(let i=0;i<analysis.centers.length;i++){
   const gap=Math.abs(analysis.centers[i]-time);if(gap<min){min=gap;best=i}
  }setFrame(best);
 });
 $("stft-mission-check").addEventListener("click",mission);
 modes?.subscribe?.(localization);
 compute();localization();
 global.SSMathCore?.renderNow?.();
}
global.SSChirpSTFT=Object.freeze({fft,fftMagnitudes,analyze});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);
