/* Local-only real-world FFT teaching lab. No STFT, upload, telemetry, or server storage. */
(function(global){
"use strict";
const $=id=>document.getElementById(id),PI2=2*Math.PI;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),fmt=(x,d=2)=>Number(x).toFixed(d);
const language=global.ELSLanguage,mode=()=>language?.get?.()||"mixed";
const tr=(en,ko)=>mode()==="en"?en:mode()==="ko"?ko:en+"\n"+ko;
const safe=s=>String(s).replace(/[&<>"]/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[x]));
function fft(real,imag){
 const n=real.length;
 if(n<2||(n&(n-1)))throw Error("FFT size must be a power of two");
 for(let i=1,j=0;i<n;i++){
  let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;
  if(i<j){[real[i],real[j]]=[real[j],real[i]];[imag[i],imag[j]]=[imag[j],imag[i]]}
 }
 for(let size=2;size<=n;size<<=1){
  const half=size>>1;
  for(let start=0;start<n;start+=size){
   for(let k=0;k<half;k++){
    const angle=-PI2*k/size,c=Math.cos(angle),s=Math.sin(angle),a=start+k,b=a+half;
    const re=real[b]*c-imag[b]*s,im=real[b]*s+imag[b]*c;
    real[b]=real[a]-re;imag[b]=imag[a]-im;real[a]+=re;imag[a]+=im;
   }
  }
 }
 return{real,imag};
}
function analyze(samples,{N=1024,position=0,fs=null,window="hann",removeMean=true}={}){
 const data=samples instanceof Float64Array?samples:Float64Array.from(samples);
 N=Number(N);
 if(N<256||N>8192||(N&(N-1)))throw Error("N must be 256–8192 and a power of two");
 if(data.length<N)throw Error("Not enough samples for this FFT length");
 fs=fs===null||fs===undefined||fs===""?null:Number(fs);
 if(fs!==null&&(!Number.isFinite(fs)||fs<=0||fs>1e6))throw Error("Invalid sampling rate");
 const maxStart=data.length-N,start=Math.min(maxStart,Math.max(0,Math.round(clamp(Number(position)||0,0,1)*maxStart)));
 const segment=data.subarray(start,start+N),real=new Float64Array(N),imag=new Float64Array(N);
 let mean=0;for(const v of segment){if(!Number.isFinite(v))throw Error("Non-finite sample");mean+=v}mean/=N;
 let gain=0;
 for(let n=0;n<N;n++){
  const w=window==="hann"?.5-.5*Math.cos(PI2*n/(N-1)):1;
  if(window!=="hann"&&window!=="rect")throw Error("Unknown window");
  real[n]=(segment[n]-(removeMean?mean:0))*w;gain+=w;
 }
 fft(real,imag);
 const spectrum=new Float64Array(N/2+1);
 for(let k=0;k<=N/2;k++){
  const factor=k===0||k===N/2?1:2;
  spectrum[k]=factor*Math.hypot(real[k],imag[k])/gain;
 }
 let peakBin=1;
 for(let k=2;k<spectrum.length;k++)if(spectrum[k]>spectrum[peakBin])peakBin=k;
 const candidates=[];
 for(let k=1;k<spectrum.length-1;k++){
  if(spectrum[k]>=spectrum[k-1]&&spectrum[k]>spectrum[k+1])
   candidates.push({bin:k,amplitude:spectrum[k]});
 }
 candidates.sort((a,b)=>b.amplitude-a.amplitude);
 const topPeaks=[];
 for(const p of candidates){
  if(topPeaks.every(q=>Math.abs(q.bin-p.bin)>2)){
   topPeaks.push({bin:p.bin,amplitude:p.amplitude,frequency:fs===null?p.bin/N:p.bin*fs/N});
   if(topPeaks.length>=5)break;
  }
 }
 const freqUnit=fs===null?"cycles/sample":"Hz";
 const peakFreq=fs===null?peakBin/N:peakBin*fs/N;
 return {N,total:data.length,start,end:start+N,position:maxStart?start/maxStart:0,fs,window,removeMean,mean,
   segment, spectrum,peakBin,peakAmplitude:spectrum[peakBin],peakFreq,freqUnit,topPeaks,
   binSpacing:fs===null?1/N:fs/N,nyquist:fs===null?.5:fs/2,
   duration:fs===null?null:N/fs};
}
function parseCSV(text,{maxSamples=300000,valueColumn=null}={}){
 const lines=String(text).replace(/^\uFEFF/,"").split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith("#"));
 if(!lines.length)throw Error("Empty CSV");
 const delimiter=lines.slice(0,5).some(x=>x.includes("\t"))?"\t":lines.slice(0,5).some(x=>x.includes(";"))?";":",";
 const tokenize=line=>line.split(delimiter).map(x=>x.trim().replace(/^"|"$/g,""));
 const first=tokenize(lines[0]),header=first.some(x=>x!==""&&!Number.isFinite(Number(x)));
 const names=header?first.map(x=>x.toLowerCase()):first.map((_,i)=>"column"+i);
 const timeIndex=names.findIndex(x=>/^(t|time|time_s|time_sec|time_seconds|timestamp|timestamp_s|timestamp_ms|time_ms)$/i.test(x));
 const timeUnit=timeIndex<0?1:/_ms$/i.test(names[timeIndex])?.001:1;
 const ambiguousTimeUnit=timeIndex>=0&&names[timeIndex]==="timestamp";
 let valueIndex=names.findIndex((x,i)=>i!==timeIndex&&/^(value|signal|amplitude|accel|acceleration|temperature|pressure|sensor|reading|x|y|z|ecg|voltage|current)$/i.test(x));
 if(valueIndex<0)valueIndex=first.length>=2&&timeIndex===0?1:timeIndex<0?0:Math.min(first.length-1,timeIndex+1);
 if(valueColumn!==null){const selected=names.indexOf(String(valueColumn).toLowerCase());if(selected<0||selected===timeIndex)throw Error("Invalid sensor column");valueIndex=selected;}
 const values=[],times=[];
 let rejected=0;
 for(let i=header?1:0;i<lines.length&&values.length<maxSamples;i++){
  const row=tokenize(lines[i]),v=Number(row[valueIndex]);
  if(row[valueIndex]===undefined||row[valueIndex]===""||!Number.isFinite(v)){rejected++;continue}
  values.push(v);
  if(timeIndex>=0){
   const value=Number(row[timeIndex]);
   times.push(row[timeIndex]!==undefined&&row[timeIndex]!==""&&Number.isFinite(value)?value*timeUnit:NaN);
  }
 }
 if(!values.length)throw Error("CSV has no numeric samples");
 let fs=null,reason=ambiguousTimeUnit?"ambiguous-time-unit":"unknown";
 if(!ambiguousTimeUnit&&times.length>=3&&times.every(Number.isFinite)){
  const diffs=[];
  for(let i=1;i<times.length;i++){const dt=times[i]-times[i-1];if(dt<=0){diffs.length=0;break}diffs.push(dt)}
  if(diffs.length){
   const sorted=diffs.slice().sort((a,b)=>a-b),dt=sorted[Math.floor(sorted.length/2)];
   const maxDeviation=Math.max(...diffs.slice(0,Math.min(4000,diffs.length)).map(x=>Math.abs(x-dt)))/dt;
   if(dt>0&&maxDeviation<=.02){fs=1/dt;reason="time-column"}
   else reason="nonuniform-time";
  }
 }
 return {samples:Float64Array.from(values),fs,timeColumn:timeIndex>=0?names[timeIndex]:null,
  columns:names.filter((_,i)=>i!==timeIndex),valueColumn:names[valueIndex],rejected,reason,truncated:values.length>=maxSamples};
}
function axes(w,h,{xMax,yMin,yMax,xLabel,yLabel}){
 const left=57,right=15,top=16,bottom=38,W=w-left-right,H=h-top-bottom,parts=[];
 for(let i=0;i<=4;i++){
  const x=left+i*W/4,y=top+i*H/4;
  parts.push('<line class="ss-fft-upload-grid" x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+(top+H)+'"/>');
  parts.push('<line class="ss-fft-upload-grid" x1="'+left+'" y1="'+y+'" x2="'+(left+W)+'" y2="'+y+'"/>');
  parts.push('<text class="ss-fft-upload-tick" x="'+x+'" y="'+(h-18)+'" text-anchor="middle">'+fmt(xMax*i/4,xMax>=10?0:xMax>=1?2:3)+'</text>');
  parts.push('<text class="ss-fft-upload-tick" x="'+(left-7)+'" y="'+(y+4)+'" text-anchor="end">'+fmt(yMax+(yMin-yMax)*i/4,Math.max(Math.abs(yMax),Math.abs(yMin))>=10?0:2)+'</text>');
 }
 parts.push('<line class="ss-fft-upload-axis" x1="'+left+'" y1="'+top+'" x2="'+left+'" y2="'+(top+H)+'"/>');
 parts.push('<line class="ss-fft-upload-axis" x1="'+left+'" y1="'+(top+H)+'" x2="'+(left+W)+'" y2="'+(top+H)+'"/>');
 parts.push('<text class="ss-fft-upload-axis-title" x="'+(left+W/2)+'" y="'+(h-2)+'" text-anchor="middle">'+safe(xLabel)+'</text>');
 parts.push('<text class="ss-fft-upload-axis-title" x="13" y="'+(top+H/2)+'" text-anchor="middle" transform="rotate(-90 13 '+(top+H/2)+')">'+safe(yLabel)+'</text>');
 return {left,top,W,H,markup:parts.join("")};
}
function draw(a,samples){
 const wave=$("fft-upload-wave"),spec=$("fft-upload-spectrum");
 const bins=Math.min(1024,samples.length);
 const lows=new Float64Array(bins),highs=new Float64Array(bins);
 lows.fill(Infinity);highs.fill(-Infinity);
 let yMin=Infinity,yMax=-Infinity;
 for(let i=0;i<samples.length;i++){
  const v=samples[i],b=Math.min(bins-1,Math.floor(i*bins/samples.length));
  if(v<lows[b])lows[b]=v;if(v>highs[b])highs[b]=v;
  if(v<yMin)yMin=v;if(v>yMax)yMax=v;
 }
 if(yMax-yMin<1e-9){yMax+=1;yMin-=1}
 const pad=(yMax-yMin)*.08;yMax+=pad;yMin-=pad;
 const xMax=a.fs===null?samples.length-1:(samples.length-1)/a.fs;
 const g=axes(850,240,{xMax,yMin,yMax,xLabel:a.fs===null?"Sample index n":"Time (s)",yLabel:"x[n]"});
 const x=i=>g.left+i/Math.max(1,samples.length-1)*g.W,y=v=>g.top+(yMax-v)/(yMax-yMin)*g.H;
 const waveform=[];
 for(let b=0;b<bins;b++){
  const px=g.left+(b+.5)*g.W/bins;
  if(samples.length===bins)waveform.push((b?"L":"M")+fmt(px,2)+" "+fmt(y(lows[b]),2));
  else waveform.push("M"+fmt(px,2)+" "+fmt(y(lows[b]),2)+" L"+fmt(px,2)+" "+fmt(y(highs[b]),2));
 }
 const start=x(a.start),end=x(a.end-1);
 wave.innerHTML=g.markup+'<rect class="ss-fft-upload-wave-region" x="'+start+'" y="'+g.top+'" width="'+Math.max(1,end-start)+'" height="'+g.H+'"/>'+'<path class="ss-fft-upload-line" d="'+waveform.join(" ")+'"/>';
 const max=Math.max(...a.spectrum,1e-9),p=axes(850,300,{xMax:a.nyquist,yMin:0,yMax:max*1.08,xLabel:a.fs===null?"Normalized frequency (cycles/sample)":"Frequency (Hz)",yLabel:"Amplitude"});
 const path=[];
 for(let k=0;k<a.spectrum.length;k++){
  const px=p.left+k/(a.spectrum.length-1)*p.W,py=p.top+p.H-(a.spectrum[k]/(max*1.08))*p.H;
  path.push((k?"L":"M")+fmt(px,2)+" "+fmt(py,2));
 }
 const peakX=p.left+a.peakBin/(a.spectrum.length-1)*p.W;
 spec.innerHTML=p.markup+'<path class="ss-fft-upload-line" d="'+path.join(" ")+'"/><circle cx="'+fmt(peakX,2)+'" cy="'+fmt(p.top+p.H-a.peakAmplitude/(max*1.08)*p.H,2)+'" r="4.3" fill="var(--els-link)"/>';
}
let source=null,analysis=null,csvText=null,csvFileName="";
function currentRate(){
 const v=$("fft-upload-fs").value.trim();
 if(v==="")return source?.fs??null;
 const parsed=Number(v);
 if(parsed===0)return null;
 return Number.isFinite(parsed)&&parsed>0&&parsed<=1e6?parsed:NaN;
}
function refresh(){
 if(!source)return;
 const N=Number($("fft-upload-n").value),fs=currentRate(),position=Number($("fft-upload-location").value)/1000;
 try{
  analysis=analyze(source.samples,{N,fs,position,window:$("fft-upload-window").value});
  const maxStart=source.samples.length-N;
  $("fft-upload-location-value").textContent=analysis.start+" / "+Math.max(0,maxStart);
  $("fft-upload-prev").disabled=analysis.start===0;$("fft-upload-next").disabled=analysis.end===source.samples.length;
  draw(analysis,source.samples);
  const metrics=[
   [tr("Selected samples","선택 표본"),analysis.N],
   [tr("Original bin spacing","원래 Bin 간격"),fmt(analysis.binSpacing,analysis.fs?3:5)+" "+analysis.freqUnit],
   [tr("Peak frequency","최대 피크 주파수"),fmt(analysis.peakFreq,analysis.fs?2:5)+" "+analysis.freqUnit],
   [tr("Peak amplitude","피크 진폭"),fmt(analysis.peakAmplitude,4)],
   [tr("Window duration","관측 구간 길이"),analysis.fs?fmt(analysis.duration*1000,2)+" ms":tr("N samples","N 표본")],
   [tr("FFT bin index","FFT Bin 인덱스"),"k = "+analysis.peakBin]
  ];
  $("fft-upload-stats").innerHTML=metrics.map(([name,value])=>'<div class="ss-fft-upload-stat">'+safe(name)+'<strong>'+safe(value)+'</strong></div>').join("");
  $("fft-upload-peaks").innerHTML=analysis.topPeaks.map((p,i)=>
   '<div class="ss-fft-upload-peak"><strong>#'+(i+1)+'</strong><span>k = '+p.bin+'</span><span>'+fmt(p.frequency,analysis.fs?2:5)+' '+analysis.freqUnit+'</span><span>A = '+fmt(p.amplitude,4)+'</span></div>').join("");
  $("fft-upload-spectrum-help").textContent=analysis.fs===null?
   tr("Sampling rate unknown: FFT bins are described in cycles/sample. Hz cannot be recovered from sample values alone.","샘플링 주파수를 알 수 없어 cycles/sample 단위로 해석합니다. 표본값만으로 Hz를 결정할 수 없습니다."):
   tr("Known sampling rate: frequency bin k maps to k × fs/N Hz. The original bin spacing is fs/N.","샘플링 주파수가 주어졌으므로 k번째 Bin은 k × fs/N Hz입니다. 원래 Bin 간격은 fs/N입니다.");
  $("fft-upload-explain").textContent=tr(
   "The FFT describes the selected N samples, not the whole file. Move the selection to compare intervals. A Hann window limits leakage, but changes peak shape. Removing the selected segment mean reduces the DC component. No STFT or spectrogram is computed.",
   "FFT는 파일 전체가 아니라 선택한 N개 표본을 분석합니다. 구간을 이동해 결과를 비교하세요. Hann 창은 누설을 줄이지만 피크 형태도 바뀝니다. 선택 구간의 평균을 제거해 DC 성분을 억제합니다. STFT나 Spectrogram은 계산하지 않습니다.");
  $("fft-upload-feedback").textContent="";
  $("fft-upload-status").textContent=tr("Ready · processed locally in your browser","준비 완료 · 브라우저 내부에서만 처리");
 }catch(error){
  analysis=null;$("fft-upload-status").textContent=tr("Cannot analyze: ","분석 불가: ")+String(error.message);
  $("fft-upload-spectrum").replaceChildren();$("fft-upload-stats").replaceChildren();$("fft-upload-peaks").replaceChildren();
 }
}
function loadSource({samples,fs=null,name="",kind="sensor",metadata=""}){
 if(samples.length<256)throw Error("At least 256 samples are required");
 if(!samples.every(Number.isFinite))throw Error("Data contains non-finite values");
 source={samples,fs,name,kind,metadata};
 $("fft-upload-fs").value="";
 $("fft-upload-meta").textContent=name+" · "+samples.length+" "+tr("samples","표본")+(fs?" · fs = "+fmt(fs,2)+" Hz":" · fs = ?")+(metadata?" · "+metadata:"");
 const options=[...$("fft-upload-n").options].filter(opt=>Number(opt.value)<=samples.length);
 $("fft-upload-n").value=options.some(x=>x.value==="1024")?"1024":options.at(-1).value;
 $("fft-upload-location").value="0";refresh();
}
function useCsvColumn(){
 if(!csvText)return;
 const chosen=$("fft-upload-column").value;
 const data=parseCSV(csvText,{valueColumn:chosen});
 loadSource({samples:data.samples,fs:data.fs,name:csvFileName,kind:"sensor",
  metadata:(data.timeColumn?"time="+data.timeColumn+", ":"")+"value="+data.valueColumn+
  (data.rejected?" · skipped "+data.rejected:"")+(data.reason==="nonuniform-time"?" · irregular time: fs unknown":data.reason==="ambiguous-time-unit"?" · timestamp unit unspecified: fs unknown":"")});
}
async function ingest(file){
 if(!file)return;
 if(file.size>25*1024*1024)throw Error("Maximum file size is 25 MB");
 const suffix=file.name.toLowerCase();
 if(/\.(csv|txt)$/.test(suffix)||file.type==="text/csv"||file.type==="text/plain"){
  csvText=await file.text();csvFileName=file.name;
  const data=parseCSV(csvText);
  const dropdown=$("fft-upload-column");
  dropdown.replaceChildren(...data.columns.map(name=>{const option=document.createElement("option");option.value=name;option.textContent=name;return option}));
  dropdown.value=data.valueColumn;
  $("fft-upload-column-row").hidden=data.columns.length<=1;
  useCsvColumn();
 }else{
  csvText=null;csvFileName="";$("fft-upload-column-row").hidden=true;
  const bytes=await file.arrayBuffer();
  const ctx=new (global.AudioContext||global.webkitAudioContext)();
  try{
   const buffer=await ctx.decodeAudioData(bytes.slice(0));
   const max=3000000,samples=new Float64Array(Math.min(buffer.length,max));
   const channels=buffer.numberOfChannels;
   for(let c=0;c<channels;c++){
    const values=buffer.getChannelData(c);
    for(let i=0;i<samples.length;i++)samples[i]+=values[i]/channels;
   }
   loadSource({samples,fs:buffer.sampleRate,name:file.name,kind:"audio",metadata:channels+" "+tr("channel(s)","채널")+(buffer.length>max?" · first 3000000 samples":"")});
  }finally{await ctx.close()}
 }
}
function demo(){
 csvText=null;csvFileName="";$("fft-upload-column-row").hidden=true;
 const fs=512,N=4096;
 const samples=Float64Array.from({length:N},(_,n)=>.7*Math.sin(PI2*32*n/fs)+.24*Math.sin(PI2*96*n/fs)+.03*Math.sin(PI2*5*n*n/(fs*N)));
 loadSource({samples,fs,name:tr("Built-in music / sensor example","내장 음향·센서 예제"),kind:"demo"});
}
function localize(){
 const labels={
 "fft-upload-title":["FFT of Real Audio, Music & Sensor Data","실제 음성·음악·센서 데이터 FFT"],
 "fft-upload-intro":["Upload a sound recording or IoT sensor CSV. Select samples, run one FFT and interpret peaks—with or without a known sampling rate. Files stay in your browser.","음성·음악 파일이나 IoT 센서 CSV를 선택하세요. 구간 FFT를 계산하고 샘플링 주파수의 유무에 따라 피크를 해석합니다. 파일은 브라우저 밖으로 전송되지 않습니다."],
 "fft-upload-controls-title":["1 · Load & Change","1 · 불러오기와 조절"],
 "fft-upload-file-label":["Audio or sensor file","오디오 또는 센서 파일"],
 "fft-upload-file-help":["Audio: WAV, MP3, OGG and browser-supported codecs. Sensor: CSV/TXT with one value column or time,value columns. Maximum 25 MB. Local only.","오디오: WAV·MP3·OGG 등 브라우저 지원 코덱. 센서: 값 한 열 또는 time,value CSV/TXT. 최대 25 MB. 브라우저에서만 처리."],
 "fft-upload-demo":["Load example signal","예제 신호 사용"],
 "fft-upload-column-label":["Sensor value column","센서 데이터 열 선택"],
 "fft-upload-fs-label":["Sampling rate fs (Hz) · blank = auto, 0 = unknown","샘플링 주파수 fs (Hz) · 공란=자동, 0=모름"],
 "fft-upload-fs-help":["Audio files provide fs. CSV can infer fs from a uniform time column; otherwise enter it manually, or use 0 for unknown.","오디오에는 fs가 기록됩니다. CSV의 일정한 시간 열로 fs를 추정할 수 있으며, 없으면 직접 입력하거나 0으로 설정하세요."],
 "fft-upload-n-label":["FFT observation length N","FFT 관측 표본 수 N"],
 "fft-upload-window-label":["Analysis window","분석 창 함수"],
 "fft-upload-location-label":["Move selected sample segment","선택 구간 이동"],
 "fft-upload-prev":["← Earlier segment","← 이전 구간"],
 "fft-upload-next":["Later segment →","다음 구간 →"],
 "fft-upload-step1":["2 · Observe the waveform","2 · 시간 파형 관찰"],
 "fft-upload-wave-help":["The shaded region contains the selected N samples used for the FFT.","음영 영역은 FFT에 사용되는 N개 표본 구간입니다."],
 "fft-upload-step2":["3 · FFT magnitude spectrum","3 · FFT 크기 스펙트럼"],
 "fft-upload-peaks-title":["Strong peaks (not necessarily the fundamental)","주요 피크 (반드시 기본주파수는 아님)"],
 "fft-upload-step3":["4 · Explain the spectrum","4 · 스펙트럼 해석"],
 "fft-upload-question":["Check · What does the frequency axis mean?","확인 · 주파수 축은 무엇을 뜻할까요?"],
 "fft-upload-answer":["Explain my FFT","FFT 해석 확인"],
 "fft-upload-prev-link":["← FFT resolution lab","← FFT 분해능 실습"],
 "fft-upload-home-link":["Part C · All topics","Part C · 전체 목록"]
 };
 for(const[id,[en,ko]]of Object.entries(labels)){const el=$(id);if(el)el.textContent=tr(en,ko)}
 document.documentElement.lang=mode()==="ko"?"ko":"en";
 if(source){refresh()}else{$("fft-upload-status").textContent=tr("Choose a file or load the example.","파일을 선택하거나 예제를 불러오세요.")}
}
function init(){
 language?.bindSelect?.("#fft-upload-language");
 $("fft-upload-file").addEventListener("change",async e=>{
  try{$("fft-upload-status").textContent=tr("Reading local file…","로컬 파일 읽는 중…");await ingest(e.target.files?.[0])}
  catch(error){$("fft-upload-status").textContent=tr("Cannot open file: ","파일을 열 수 없습니다: ")+String(error.message)}
 });
 $("fft-upload-demo").addEventListener("click",demo);
 $("fft-upload-column").addEventListener("change",useCsvColumn);
 for(const id of ["fft-upload-fs","fft-upload-n","fft-upload-window","fft-upload-location"]){
  $(id).addEventListener("input",refresh);$(id).addEventListener("change",refresh);
 }
 function move(delta){
  if(!analysis||!source)return;
  const max=source.samples.length-analysis.N;
  $("fft-upload-location").value=String(max?Math.round(clamp((analysis.start+delta*analysis.N/2)/max,0,1)*1000):0);refresh();
 }
 $("fft-upload-prev").addEventListener("click",()=>move(-1));
 $("fft-upload-next").addEventListener("click",()=>move(1));
 $("fft-upload-answer").addEventListener("click",()=>{
  $("fft-upload-feedback").textContent=!analysis?tr("Load samples first.","먼저 표본을 불러오세요."):
   analysis.fs===null?tr("Without fs, the peak is "+fmt(analysis.peakFreq,5)+" cycles/sample. Its position is known in normalized units, but not in Hz.","fs가 없을 때 피크는 "+fmt(analysis.peakFreq,5)+" cycles/sample입니다. 정규화 주파수는 알 수 있지만 Hz 단위는 알 수 없습니다."):
   tr("Bin k="+analysis.peakBin+", fs="+fmt(analysis.fs,2)+" Hz, N="+analysis.N+": the peak is "+fmt(analysis.peakFreq,2)+" Hz.","k="+analysis.peakBin+", fs="+fmt(analysis.fs,2)+" Hz, N="+analysis.N+"이므로 피크는 "+fmt(analysis.peakFreq,2)+" Hz입니다.");
 });
 language?.subscribe?.(localize);
 localize();
 global.SSMathCore?.renderNow?.();
}
global.SSRealFFT=Object.freeze({fft,analyze,parseCSV,ingest,loadSource,get analysis(){return analysis}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);
