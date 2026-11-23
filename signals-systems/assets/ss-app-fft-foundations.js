/* FFT from sample data: beginner-first analysis, deterministic DFT/FFT.
 * The FFT transforms a sample sequence without knowing fs; fs only maps the
 * normalized frequency grid to physical Hz. No fabricated sample rate.
 */
(function(global){
"use strict";
const $=id=>document.getElementById(id);
const fmt=(v,d=3)=>Number.isFinite(v)?Number(v.toFixed(d)).toLocaleString("en-US",{maximumFractionDigits:d}):"—";
const language=()=>global.ELSLanguage?.get?.()||"mixed";
const i=(en,ko,short=false)=>language()==="en"?en:language()==="ko"?ko:(en===ko?en:en+(short?" · ":"\n")+ko);
const twoPi=2*Math.PI;
const presets={
 one:{n:16,values:n=>Math.sin(twoPi*3*n/16)},
 two:{n:32,values:n=>0.85*Math.sin(twoPi*3*n/32)+0.50*Math.sin(twoPi*7*n/32)},
 leak:{n:32,values:n=>Math.sin(twoPi*3.4*n/32)},
 pulse:{n:16,values:n=>n===0?1:0}
};
const sampleArray=key=>{
 const p=presets[key]||presets.one;
 return Array.from({length:p.n},(_,n)=>p.values(n));
};
function parseSamples(input){
 const s=String(input||"").trim();
 if(!s)throw Error("No samples given");
 const items=s.split(/[\s,;]+/).filter(Boolean);
 if(items.length<8||items.length>128)throw Error("Enter 8–128 finite real samples");
 const values=items.map(v=>Number(v));
 if(values.some(v=>!Number.isFinite(v)||Math.abs(v)>1e9))throw Error("All samples must be finite numbers");
 return values;
}
function transform(values){
 const n=values.length,re=Float64Array.from(values),im=new Float64Array(n);
 const power2=(n&(n-1))===0;
 if(power2){
  for(let j=1,k=0;j<n;j++){
   let bit=n>>1;for(;k&bit;bit>>=1)k^=bit;k^=bit;
   if(j<k){[re[j],re[k]]=[re[k],re[j]];[im[j],im[k]]=[im[k],im[j]]}
  }
  for(let len=2;len<=n;len*=2){
   const a=-twoPi/len;
   for(let st=0;st<n;st+=len){
    for(let j=0;j<len/2;j++){
     const angle=a*j,c=Math.cos(angle),q=Math.sin(angle),idx=st+j,other=idx+len/2;
     const r=re[other]*c-im[other]*q,iv=re[other]*q+im[other]*c;
     re[other]=re[idx]-r;im[other]=im[idx]-iv;
     re[idx]+=r;im[idx]+=iv;
    }
   }
  }
 }else{
  for(let k=0;k<n;k++){
   let rr=0,ii=0;
   for(let m=0;m<n;m++){const angle=-twoPi*k*m/n;rr+=values[m]*Math.cos(angle);ii+=values[m]*Math.sin(angle)}
   re[k]=rr;im[k]=ii;
  }
 }
 return {re:Array.from(re),im:Array.from(im),method:power2?"FFT":"DFT"};
}
function analyze(samples,fs=null){
 if(samples.length<8||samples.length>128||samples.some(v=>!Number.isFinite(v)))throw Error("8–128 finite samples required");
 if(fs!==null&&(!Number.isFinite(fs)||fs<=0))throw Error("fs must be positive");
 const n=samples.length,X=transform(samples),nyq=Math.floor(n/2),bins=[];
 for(let k=0;k<=nyq;k++){
  const magnitude=Math.hypot(X.re[k],X.im[k]);
  const edge=k===0||(n%2===0&&k===n/2);
  const amplitude=(edge?1:2)*magnitude/n;
  bins.push({k,normalized:k/n,hz:fs===null?null:k*fs/n,magnitude,amplitude});
 }
 const max=Math.max(...bins.map(x=>x.amplitude));
 const peaks=bins.filter(x=>x.k>0&&x.amplitude>Math.max(1e-8,.15*max))
  .sort((a,b)=>b.amplitude-a.amplitude).slice(0,3);
 const best=peaks[0]||bins[0];
 return {samples:samples.slice(),n,fs,method:X.method,X,bins,peaks,best,
  normalizedSpacing:1/n,hzSpacing:fs===null?null:fs/n,
  duration:fs===null?null:n/fs};
}
function graph(svg,data,style,known){
 const NS="http://www.w3.org/2000/svg";
 svg.replaceChildren();
 const w=620,h=300,l=57,r=22,t=20,b=50,plotW=w-l-r,plotH=h-t-b;
 const vmin=style==="time"?Math.min(0,...data.map(p=>p.y)):0;
 const vmax=style==="time"?Math.max(0,...data.map(p=>p.y)):Math.max(1e-9,...data.map(p=>p.y));
 const lo=style==="time"?Math.min(-.15,vmin*1.13):0;
 const hi=style==="time"?Math.max(.15,vmax*1.13):vmax*1.17;
 const xmax=Math.max(1e-9,...data.map(p=>p.x));
 const sx=x=>l+plotW*x/xmax,sy=y=>t+(hi-y)/(hi-lo)*plotH;
 function add(tag,attrs,content,cls){
  const el=document.createElementNS(NS,tag);
  Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,String(v)));
  if(cls)el.setAttribute("class",cls);
  if(content!==null&&content!==undefined)el.textContent=content;
  svg.append(el);return el;
 }
 for(let j=0;j<=4;j++){
  const val=lo+(hi-lo)*j/4,y=sy(val);
  add("line",{x1:l,y1:y,x2:w-r,y2:y},null,"grid-line");
  add("text",{x:l-9,y:y+4,"text-anchor":"end"},fmt(val,2),"tick-label");
 }
 const zero=sy(0);
 add("line",{x1:l,y1:zero,x2:w-r,y2:zero},null,"axis");
 add("line",{x1:l,y1:t,x2:l,y2:h-b},null,"axis");
 const stride=style==="time"?Math.max(1,Math.ceil((data.length-1)/8)):Math.max(1,Math.ceil((data.length-1)/7));
 for(let j=0;j<data.length;j++){
  const p=data[j],x=sx(p.x),y=sy(p.y);
  add("line",{x1:x,y1:zero,x2:x,y2:y},null,p.peak?"peak-stem":"stem");
  add("circle",{cx:x,cy:y,r:p.peak?4.8:3.2},null,"sample-dot");
  if(j%stride===0||j===data.length-1)add("text",{x,y:h-b+17,"text-anchor":"middle"},style==="time"?String(j):known?fmt(p.x,0):String(p.k),"tick-label");
 }
 add("text",{x:l+plotW/2,y:h-6,"text-anchor":"middle"},style==="time"?"n (sample index)":known?"f (Hz)":"k (FFT bin index)","plot-label");
 const axis=style==="time"?"x[n]":i("One-sided amplitude","단측 진폭",true);
 add("text",{x:14,y:12},axis,"plot-label");
}
function containerMetric(label,value){
 const box=document.createElement("div");box.className="ss-fft-metric";
 const title=document.createElement("span");title.textContent=label;
 const v=document.createElement("strong");v.textContent=value;
 box.append(title,v);return box;
}
function renderTable(result){
 const table=$("fft-table"),thead=table.tHead||table.createTHead(),tbody=table.tBodies[0]||table.createTBody();
 const headers=["k","k/N (cycles/sample)","|X[k]|",i("One-sided amplitude","단측 진폭",true)];
 if(result.fs!==null)headers.splice(2,0,"f (Hz)");
 const tr=document.createElement("tr");
 headers.forEach(s=>{const th=document.createElement("th");th.textContent=s;tr.append(th)});
 thead.replaceChildren(tr);tbody.replaceChildren();
 const highlights=new Set(result.peaks.map(x=>x.k));
 for(const bin of result.bins){
  const row=document.createElement("tr");row.dataset.peak=String(highlights.has(bin.k));
  const values=[String(bin.k),fmt(bin.normalized,4)];
  if(result.fs!==null)values.push(fmt(bin.hz,2));
  values.push(fmt(bin.magnitude,4),fmt(bin.amplitude,4));
  values.forEach(v=>{const cell=document.createElement("td");cell.textContent=v;row.append(cell)});
  tbody.append(row);
 }
}
function insight(result){
 const root=$("fft-insight"),comp=$("fft-compare"),best=result.best;
 const type=$("fft-preset").value;
 const normalized=fmt(best.normalized,4),k=best.k,n=result.n,fs=result.fs;
 const examples=[];
 if(fs===null){
  examples.push(i("The largest non-DC component is at bin k="+k+"; its normalized frequency is "+normalized+" cycles/sample.",
   "DC를 제외한 주요 성분은 k="+k+"이며 정규화 주파수는 "+normalized+" cycles/sample입니다."));
  examples.push(i("With no sample rate, you cannot determine Hz, a sampling interval in seconds, or a real-world time scale.",
   "샘플링 주파수가 없으면 Hz, 초 단위 표본 간격, 실제 시간축을 결정할 수 없습니다."));
  comp.textContent=i("Example: if fs were 8000 Hz, this bin would be "+fmt(k*8000/n,2)+" Hz; if fs were 16000 Hz, it would be "+fmt(k*16000/n,2)+" Hz. Both produce the same FFT coefficients.",
   "예: fs를 8000Hz라고 가정하면 "+fmt(k*8000/n,2)+"Hz, 16000Hz라면 "+fmt(k*16000/n,2)+"Hz입니다. FFT 계수는 바뀌지 않습니다.");
 }else{
  examples.push(i("The strongest non-DC bin k="+k+" maps to "+fmt(best.hz,2)+" Hz, because f = k fs / N.",
   "주요 Bin k="+k+"는 f=k fs/N에 따라 "+fmt(best.hz,2)+"Hz로 해석합니다."));
  examples.push(i("Your bin spacing is "+fmt(result.hzSpacing,3)+" Hz. The record lasts "+fmt(1000*result.duration,3)+" ms. A frequency between bins may leak across several bins.",
   "Bin 간격은 "+fmt(result.hzSpacing,3)+"Hz, 표본 기록 길이는 "+fmt(1000*result.duration,3)+"ms입니다. Bin 사이의 성분은 여러 Bin에 퍼질 수 있습니다."));
  comp.textContent=i("Try changing fs to "+fmt(2*fs,2)+" Hz without editing the samples: bin k="+k+" and its amplitude stay unchanged, but its frequency becomes "+fmt(2*best.hz,2)+" Hz.",
   "표본값은 유지하고 fs를 "+fmt(2*fs,2)+"Hz로 바꾸어 보세요. Bin k="+k+"와 진폭은 그대로지만 주파수는 "+fmt(2*best.hz,2)+"Hz가 됩니다.");
 }
 if(type==="leak")examples.push(i("This example contains 3.4 cycles in the record. It lies between bins, so the FFT energy spreads: the largest bin is not the exact sinusoid frequency.",
 "이 예제는 관측 구간에 3.4주기를 포함합니다. Bin 사이의 성분이므로 누설이 발생하며 최대 Bin은 정확한 정현파 주파수와 다를 수 있습니다."));
 else if(type==="pulse")examples.push(i("A single impulse spreads over all frequency bins; one bin is not enough to identify its shape.",
 "임펄스 신호의 주파수 성분은 모든 Bin에 퍼집니다. 특정 Bin 하나만으로 신호를 판단할 수 없습니다."));
 else examples.push(i("A large FFT bin indicates a strong component near that grid point; the normalized one-sided amplitude is not the unscaled |X[k]|.",
 "큰 FFT Bin은 그 격자 부근의 성분이 강함을 뜻합니다. 단측 진폭은 스케일링 전 |X[k]|와 다릅니다."));
 root.replaceChildren(...examples.map(s=>{const p=document.createElement("p");p.textContent=s;return p}));
}
const labels={
 title:["FFT from Sample Data","샘플 데이터로 시작하는 FFT"],
 subtitle:["Start with a list of samples. Find the strongest frequency bins, then discover what changes—and what does not—when sampling rate is known.","샘플 배열에서 출발하여 주요 주파수 Bin을 찾고, 샘플링 주파수 유무에 따라 해석 가능한 정보를 구분합니다."],
 back:["← All Part C topics","← Part C 전체 주제"],
 roadmap:[["Read samples","표본 확인"],["Compute FFT","FFT 수행"],["Interpret bins","Bin 해석"],["Add sampling rate","샘플링 주파수 적용"]],
 controls:["Input samples","입력 표본 데이터"],note:["Choose a sample set or paste numeric samples. One column, separated by spaces, commas, or line breaks.","예제 데이터를 선택하거나 숫자 표본을 붙여넣습니다. 공백·쉼표·줄바꿈으로 구분합니다."],
 preset:["Example dataset","예제 데이터"],samples:["Sample values x[n]","표본값 x[n]"],format:["Enter 8–128 real values. For power-of-two N, a radix-2 FFT is used; otherwise, a direct DFT returns the same coefficients.","실수 표본 8~128개를 입력합니다. N이 2의 거듭제곱이면 radix-2 FFT, 아니면 동일한 계수를 구하는 직접 DFT를 사용합니다."],
 known:["Sampling rate fs is known","샘플링 주파수 fs를 알고 있습니다"],fs:["Sampling rate fs (Hz)","샘플링 주파수 fs (Hz)"],
 run:["Run FFT","FFT 실행"],reset:["Reset","초기화"],
 theory:["What does an FFT compute?","FFT는 무엇을 계산할까요?"],theoryDesc:["A DFT transforms N samples into complex coefficients X[k]. The FFT is a fast way to compute that same DFT; it does not create the missing sampling rate.","DFT는 N개 표본을 복소수 계수 X[k]로 변환합니다. FFT는 동일한 DFT를 빠르게 계산하는 알고리즘이며, 누락된 샘플링 주파수를 생성하지 않습니다."],
 equation1:["DFT definition","DFT 정의"],equation2:["Normalized frequency and physical frequency","정규화 주파수와 실제 주파수"],
 time:["1 · Given sample sequence","1 · 주어진 표본 신호"],timeNote:["Horizontal axis: integer sample index n; the samples alone do not reveal time in seconds.","가로축은 정수 표본 인덱스 n입니다. 이 표본만으로 초 단위 시간을 알 수 없습니다."],
 spectrum:["2 · FFT spectrum and bins","2 · FFT 스펙트럼과 Bin"],
 insightTitle:["3 · Read the FFT result","3 · FFT 결과 해석"],table:["4 · Check individual FFT bins","4 · FFT Bin 상세 확인"],
 tableNote:["For real input, display only nonnegative-frequency bins. One-sided amplitude = |X[k]|/N for DC and (even-N) Nyquist, or 2|X[k]|/N otherwise. Leakage can make peaks misleading.","실수 입력의 비음수 주파수 Bin만 표시합니다. 단측 진폭은 DC 및 짝수 N의 나이퀴스트에서 |X[k]|/N, 나머지에서 2|X[k]|/N입니다. 누설이 있으면 피크 해석에 주의해야 합니다."],
 next:["Next, after this foundation","기초 이해 후 다음 단계"],nextText:["When you can interpret a real sample array in both cases, move on to FFT resolution, leakage, windows, phase, STFT, and finally images/video.","표본 데이터의 두 해석을 충분히 이해한 뒤 주파수 분해능·누설·창 함수·위상·STFT·이미지·동영상으로 확장합니다."],
 nextLink:["See the full FFT curriculum →","FFT 전체 학습 목차 →"]
};
let lastSamples=sampleArray("one"),lastResult=null;
function localize(){
 for(const [id,key] of [["fft-title","title"],["fft-subtitle","subtitle"],["fft-back","back"],["fft-controls-title","controls"],["fft-controls-note","note"],["fft-preset-label","preset"],["fft-samples-label","samples"],["fft-format","format"],["fft-known-label","known"],["fft-fs-label","fs"],["fft-run","run"],["fft-reset","reset"],["fft-theory-title","theory"],["fft-theory-desc","theoryDesc"],["fft-equation-1-label","equation1"],["fft-equation-2-label","equation2"],["fft-time-title","time"],["fft-time-note","timeNote"],["fft-spectrum-title","spectrum"],["fft-insight-title","insightTitle"],["fft-table-title","table"],["fft-table-note","tableNote"],["fft-next-title","next"],["fft-next-desc","nextText"],["fft-next-link","nextLink"]]){
  $(id).textContent=i(...labels[key]);
 }
 const steps=$("fft-roadmap");
 steps.replaceChildren(...labels.roadmap.map((pair,n)=>{
  const el=document.createElement("div");el.className="ss-fft-stage";
  const number=document.createElement("span");number.className="ss-fft-stage-num";number.textContent=String(n+1).padStart(2,"0");
  const title=document.createElement("span");title.textContent=i(...pair,true);
  el.append(number,title);return el;
 }));
 document.documentElement.lang=language()==="ko"?"ko":"en";
}
function show(result){
 lastResult=result;
 const known=result.fs!==null,top=result.best,metrics=$("fft-metrics");
 metrics.replaceChildren(
  containerMetric("N",String(result.n)),
  containerMetric(i("Dominant bin","주요 Bin",true),"k = "+top.k),
  containerMetric(known?i("Bin spacing","Bin 간격",true):i("Normalized spacing","정규화 간격",true),fmt(known?result.hzSpacing:result.normalizedSpacing,4)+(known?" Hz":" cyc/sample")),
  containerMetric(known?i("Peak frequency","피크 주파수",true):i("Peak / sample","표본당 주파수",true),
   fmt(known?top.hz:top.normalized,4)+(known?" Hz":" cyc/sample"))
 );
 graph($("fft-time-plot"),result.samples.map((y,n)=>({x:n,y})), "time",false);
 const peakSet=new Set(result.peaks.map(x=>x.k));
 graph($("fft-spectrum-plot"),result.bins.map(b=>({x:known?b.hz:b.k,y:b.amplitude,k:b.k,peak:peakSet.has(b.k)})), "spectrum",known);
 $("fft-spectrum-note").textContent=i(known?
  "Horizontal axis is now in Hz; f = k fs / N.":"Horizontal axis is bin index k. Physical Hz is unknown.",
  known?"가로축은 Hz입니다. f=k fs/N로 변환합니다.":"가로축은 Bin k입니다. 실제 Hz는 아직 결정되지 않습니다.");
 $("fft-sample-source").textContent=i("Algorithm: "+result.method+" · "+result.n+" data samples.","알고리즘: "+result.method+" · 표본 "+result.n+"개.");
 insight(result);renderTable(result);
 global.SSMathCore?.queue?.();
}
function compute(){
 const error=$("fft-error");
 try{
  const samples=parseSamples($("fft-samples").value),known=$("fft-known").checked;
  const raw=Number($("fft-fs").value),fs=known?raw:null;
  if(known&&(!Number.isFinite(raw)||raw<=0||raw>1000000))throw Error("Sampling rate must be in (0, 1,000,000] Hz");
  lastSamples=samples;
  show(analyze(samples,fs));error.hidden=true;
 }catch(e){
  error.hidden=false;
  error.textContent=i("Check input: "+e.message,"입력을 확인하세요: "+e.message);
 }
}
function selectPreset(key){
 if(key==="custom")return;
 $("fft-samples").value=sampleArray(key).map(v=>fmt(v,7)).join(", ");
 compute();
}
function init(){
 global.ELSLanguage?.bindSelect?.("#ss-fft-language");
 localize();
 $("fft-preset").addEventListener("change",e=>selectPreset(e.target.value));
 $("fft-samples").addEventListener("input",()=>{$("fft-preset").value="custom"});
 $("fft-known").addEventListener("change",()=>{$("fft-fs").disabled=!$("fft-known").checked;compute()});
 $("fft-fs").addEventListener("change",compute);
 $("fft-run").addEventListener("click",compute);
 $("fft-reset").addEventListener("click",()=>{
  $("fft-preset").value="one";$("fft-known").checked=false;$("fft-fs").value="8000";$("fft-fs").disabled=true;
  selectPreset("one");
 });
 global.ELSLanguage?.subscribe?.(()=>{localize();if(lastResult)show(lastResult)});
 selectPreset("one");
}
global.SSFFTFoundations=Object.freeze({sampleArray,parseSamples,transform,analyze});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);
