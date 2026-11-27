/* Part D: two original, self-contained integrated engineering labs. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),audio=document.body.dataset.partD==="audio",lang=window.ELSLanguage;
const mode=()=>lang?.get?.()||"mixed",tr=(en,ko)=>mode()==="en"?en:mode()==="ko"?ko:en+" / "+ko;
function localize(){document.querySelectorAll("[data-en][data-ko]").forEach(el=>el.textContent=tr(el.dataset.en,el.dataset.ko));}
lang?.bindSelect?.($("partd-language"));
lang?.subscribe?.(()=>{localize();drawAll()});
localize();
const N=16384,FS=8000,TAU=2*Math.PI;
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function rms(a){return Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length)}
function draw(canvas,series,{xmin=0,xmax=1,ymin=-1,ymax=1,marks=[],hmarks=[],label=""}={}){
 const c=$(canvas),rect=c.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
 const w=Math.max(270,rect.width||c.width),h=Math.max(130,rect.height||c.height);
 const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
 if(c.width!==pw||c.height!==ph){c.width=pw;c.height=ph}
 const ctx=c.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);
 const L=51,R=19,T=25,B=36;
 const px=x=>L+(x-xmin)*(w-L-R)/(xmax-xmin),py=y=>T+(ymax-y)*(h-T-B)/(ymax-ymin);
 const bg=getComputedStyle(document.documentElement).getPropertyValue("--els-surface-alt").trim()||"#26332c";
 const ink=getComputedStyle(document.documentElement).getPropertyValue("--els-ink").trim()||"#e7ede8";
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.strokeStyle=ink;ctx.globalAlpha=.32;ctx.lineWidth=1;
 for(let i=0;i<=4;i++){let y=T+(h-T-B)*i/4;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(w-R,y);ctx.stroke()}
 ctx.globalAlpha=1;ctx.fillStyle=ink;ctx.font="12px system-ui";ctx.textAlign="right";
 for(let i=0;i<=4;i++){let y=T+(h-T-B)*i/4;ctx.fillText((ymax-(ymax-ymin)*i/4).toFixed(Math.abs(ymax-ymin)>20?0:2),L-7,y+4)}
 ctx.textAlign="center";for(let i=0;i<=4;i++){let x=xmin+(xmax-xmin)*i/4;ctx.fillText(x.toFixed(xmax>50?0:1),px(x),h-11)}
 ctx.fillText(label,w-20,h-11);
 for(const s of series){ctx.strokeStyle=s.color;ctx.lineWidth=s.width||2.25;ctx.beginPath();let started=false;for(const p of s.points){if(p[0]<xmin||p[0]>xmax||!Number.isFinite(p[1]))continue;let x=px(p[0]),y=py(clamp(p[1],ymin,ymax));if(!started){ctx.moveTo(x,y);started=true}else ctx.lineTo(x,y)}ctx.stroke()}
 for(const m of marks){let x=px(m.x);ctx.strokeStyle=m.color||ink;ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,h-B);ctx.stroke();ctx.setLineDash([])}
 for(const m of hmarks){let y=py(m.y);ctx.strokeStyle=m.color||ink;ctx.lineWidth=1.5;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(w-R,y);ctx.stroke();ctx.setLineDash([])}
 ctx.textAlign="left";let yy=20;for(const s of series){ctx.fillStyle=s.color;ctx.fillRect(L+9,yy-8,18,4);ctx.fillStyle=ink;ctx.fillText(s.label||"",L+35,yy);yy+=17}
}
const blue="#4a9ce8",orange="#e59e4e",green="#66ba83";
function points(a,dt=1,start=0,step=1){const v=[];for(let i=0;i<a.length;i+=step)v.push([start+i*dt,a[i]]);return v}
function prediction(options,correct){
 const root=$("predict-options");for(const [id,en,ko] of options){let label=document.createElement("label"),radio=document.createElement("input");radio.type="radio";radio.name="prediction";radio.value=id;const span=document.createElement("span");span.dataset.en=en;span.dataset.ko=ko;span.textContent=tr(en,ko);label.append(radio,span);root.append(label)}
 $("predict-check").addEventListener("click",()=>{const answer=document.querySelector('input[name="prediction"]:checked')?.value;$("predict-result").textContent=!answer?tr("Choose an answer first.","먼저 답을 선택하세요."):answer===correct?tr("Correct. Test the prediction below.","맞았습니다. 아래에서 예측을 시험해 보세요."):tr("Try the experiment and compare the outcome.","실험 결과를 살펴보고 다시 생각해 보세요.")});
}
function newSound(source){
 let a=new Array(N);for(let i=0;i<N;i++){const t=i/FS,env=Math.min(1,t*35)*Math.min(1,(N-i)/400);
 a[i]=env*(source==="tones"?.55*Math.sin(TAU*250*t)+.4*Math.sin(TAU*1950*t):.42*Math.sin(TAU*130*t)+.3*Math.sin(TAU*260*t)+.22*Math.sin(TAU*520*t)+.19*Math.sin(TAU*910*t)+.12*Math.sin(TAU*1820*t))}return a
}
function fir(type,cut,bw){
 const M=100,h=[];const lp=(f,k)=>{let v=k===0?2*f/FS:Math.sin(2*Math.PI*f*k/FS)/(Math.PI*k);return v};
 for(let i=0;i<=M;i++){let k=i-M/2,w=.54-.46*Math.cos(TAU*i/M),v=type==="low"?lp(cut,k):type==="high"?(k===0?1:0)-lp(cut,k):lp(Math.min(3900,cut+bw/2),k)-lp(Math.max(50,cut-bw/2),k);h.push(v*w)}
 return h
}
function convolveSame(x,h){let y=new Array(x.length).fill(0);for(let n=0;n<x.length;n++){let sum=0;for(let k=0;k<h.length;k++){let j=n-k;if(j>=0)sum+=h[k]*x[j]}y[n]=sum}return y}
function fftMagnitudes(x,bins=128){
 const n=2048,re=new Float64Array(n),im=new Float64Array(n);
 for(let i=0;i<n;i++)re[i]=(x[500+i]||0)*(.5-.5*Math.cos(TAU*i/(n-1)));
 for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){let t=re[i];re[i]=re[j];re[j]=t}}
 for(let size=2;size<=n;size<<=1){const half=size>>1;
  for(let k=0;k<n;k+=size)for(let p=0;p<half;p++){
   const ang=-TAU*p/size,c=Math.cos(ang),s=Math.sin(ang),j=k+p+half;
   const tr=re[j]*c-im[j]*s,ti=re[j]*s+im[j]*c;
   re[j]=re[k+p]-tr;im[j]=im[k+p]-ti;re[k+p]+=tr;im[k+p]+=ti;
  }
 }
 return Array.from({length:bins},(_,i)=>Math.hypot(re[i],im[i]));
}
function response(h,f){let re=0,im=0;for(let k=0;k<h.length;k++){let a=TAU*f*k/FS;re+=h[k]*Math.cos(a);im-=h[k]*Math.sin(a)}return Math.hypot(re,im)}
let audioData=null,ctxAudio=null,currentNode=null;
function stopAudio(){if(currentNode){try{currentNode.stop()}catch(e){}currentNode=null}}
function play(arr){stopAudio();const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctxAudio=ctxAudio||new AC();ctxAudio.resume();let buffer=ctxAudio.createBuffer(1,arr.length,FS);buffer.copyToChannel(Float32Array.from(arr),0);const source=ctxAudio.createBufferSource(),gain=ctxAudio.createGain();gain.gain.value=.45;source.buffer=buffer;source.connect(gain);gain.connect(ctxAudio.destination);source.onended=()=>{if(currentNode===source)currentNode=null};source.start();currentNode=source}
function runAudio(){
 let source=$("source").value,type=$("filter").value,cut=+$("cutoff").value,bw=+$("band").value;
 $("cutoff-value").textContent=cut+" Hz";$("band-value").textContent=bw+" Hz";$("band").disabled=type!=="band";
 const x=newSound(source),h=fir(type,cut,bw),y=convolveSame(x,h);audioData={x,y};
 const typeText=type==="low"?tr("Low-pass","저역통과"):type==="high"?tr("High-pass","고역통과"):tr("Band-pass","대역통과");
 const sourceText=source==="tones"?tr("Two-tone: 250 Hz + 1950 Hz","두 정현파: 250 Hz + 1950 Hz"):tr("Synthetic vowel-like sound","합성 모음 유사 소리");
 const settingText=type==="band"?
  typeText+" · "+cut+" Hz · "+tr("Bandwidth","대역폭")+" "+bw+" Hz":
  typeText+" · "+cut+" Hz";
 $("observe-settings").textContent=tr("Input: ","입력: ")+sourceText+"  |  "+tr("Filter: ","필터: ")+settingText;
 $("spectrum-guide").textContent=source==="tones"?(type==="low"?
  tr("Check the 250 Hz and 1950 Hz peaks. The 250 Hz component should remain stronger after low-pass filtering.","250 Hz와 1950 Hz 피크를 찾으세요. 저역통과에서는 필터 출력의 250 Hz 성분이 상대적으로 더 강하게 남습니다."):
  type==="high"?tr("Check the 250 Hz and 1950 Hz peaks. High-pass filtering should reduce the 250 Hz component more strongly.","250 Hz와 1950 Hz 피크를 찾으세요. 고역통과에서는 필터 출력의 250 Hz 성분이 더 크게 줄어듭니다."):
  tr("Check which of 250 Hz and 1950 Hz lies within the selected passband. Change center and bandwidth to test your prediction.","250 Hz와 1950 Hz 중 선택한 통과대역에 포함되는 성분을 확인하세요. 중심주파수와 대역폭을 바꾸며 예측을 검증하세요.")):
  tr("This input has several harmonics. Compare how the orange peaks change against the blue peaks, then try the two-tone example to see an easier result.","이 입력에는 여러 고조파가 있습니다. 주황 피크가 파란 피크에 비해 어떻게 변하는지 비교한 뒤, 더 명확한 관찰을 위해 두 정현파 예제도 선택해 보세요.");
 $("wave-guide").textContent=tr("These are the exact same input and output as in graph A, shown over time. Their difference comes from filtering, not from a new experiment. For a clear frequency test, use Two-tone and compare again.","A 그래프에서 비교한 바로 그 입력과 출력을 시간영역에 나타낸 것입니다. 다른 실험이 아니라 같은 필터링 결과입니다. 주파수 차이를 명확하게 보고 싶다면 ‘두 개의 정현파’로 다시 비교해 보세요.");
 let p1=points(x.slice(0,320),1000/FS,0,2),p2=points(y.slice(0,320),1000/FS,0,2);
 draw("waveplot",[{points:p1,color:blue,label:tr("Input","입력")},{points:p2,color:orange,label:tr("Output","출력")}],{xmin:0,xmax:40,ymin:-1.3,ymax:1.3,label:"ms"});
 let a=fftMagnitudes(x,250),b=fftMagnitudes(y,250),norm=Math.max(...a,1e-10);
 draw("specplot",[{points:a.map((v,i)=>[i*FS/2048,20*Math.log10(Math.max(1e-8,v/norm))]),color:blue,label:tr("Input","입력")},{points:b.map((v,i)=>[i*FS/2048,20*Math.log10(Math.max(1e-8,v/norm))]),color:orange,label:tr("Output","출력")}],{xmin:0,xmax:FS*249/2048,ymin:-75,ymax:5,label:"Hz"});
 let curve=[];for(let f=0;f<=3000;f+=25)curve.push([f,Math.max(-70,20*Math.log10(Math.max(1e-6,response(h,f))))]);
 const edges=type==="band"?[Math.max(50,cut-bw/2),Math.min(3900,cut+bw/2)]:[cut];
 draw("gainplot",[{points:curve,color:green,label:"|H(f)|"}],{xmin:0,xmax:3000,ymin:-70,ymax:8,label:"Hz",marks:edges.map(f=>({x:f,color:orange})),hmarks:[{y:-3,color:blue}]});
 $("cutoff-explain").textContent=type==="band"?
  tr("Orange dashed lines = nominal passband edges "+edges.map(v=>Math.round(v)).join("–")+" Hz; blue line = −3 dB. Compare the green *actual* FIR response with both limits.","주황 점선 = 설정한 대역 경계 "+edges.map(v=>Math.round(v)).join("–")+" Hz; 파란 선 = −3 dB. 초록색 실제 FIR 응답을 경계와 비교하세요."):
  tr("Orange dashed line = selected "+cut+" Hz cutoff; blue horizontal line = −3 dB. Compare where the actual green FIR response crosses this level.","주황 점선 = 설정 차단주파수 "+cut+" Hz; 파란 가로선 = −3 dB. 실제 초록색 FIR 응답이 이 수준을 통과하는 위치를 관찰하세요.");
 const impulseAt=64,impulse=new Array(320).fill(0),impout=new Array(320).fill(0);
 impulse[impulseAt]=1;for(let i=0;i<h.length;i++)impout[impulseAt+i]=h[i];
 const absMax=Math.max(1,...h.map(Math.abs)),scale=1.1*absMax;
 draw("impulseplot",[{points:points(impulse.map(v=>v*absMax),1000/FS,0,1),color:blue,label:tr("Unit impulse (scaled)","단위 임펄스(축소)")},{points:points(impout,1000/FS),color:orange,label:"h[n]"}],
 {xmin:0,xmax:36,ymin:-scale,ymax:scale,label:"ms",marks:[{x:impulseAt*1000/FS,color:blue},{x:(impulseAt+50)*1000/FS,color:orange}]});
 $("delay-explain").textContent=tr("The input impulse occurs at 8 ms (blue dashed line); the symmetric FIR impulse response is centered at 14.25 ms (orange). Group delay = 50 samples / 8000 samples per second = 6.25 ms. This is phase/group delay, not 6.25 ms of total silence.","입력 임펄스는 8 ms(파란 점선)에 발생합니다. 대칭 FIR 임펄스 응답의 중심은 14.25 ms(주황 점선)입니다. 군지연 = 50표본 / 초당 8000표본 = 6.25 ms. 이는 위상/군지연이며, 6.25 ms 동안 출력이 완전히 0이라는 뜻은 아닙니다.");
 let ratio=20*Math.log10(Math.max(1e-10,rms(y))/rms(x));
 $("atten").textContent=ratio.toFixed(1)+" dB";$("delay").textContent="6.25 ms";$("rms").textContent=rms(y).toFixed(3);
 $("audio-insight").textContent=type==="low"?tr("High frequencies are attenuated; listen for a duller sound.","높은 주파수가 줄어들어 소리가 둔탁해지는지 들어보세요."):type==="high"?tr("Low frequencies are attenuated; listen for a thinner sound.","낮은 주파수가 줄어들어 소리가 가늘어지는지 들어보세요."):tr("Only the selected band is emphasized; compare spectra and sound.","선택한 대역만 통과하므로 스펙트럼과 소리를 비교하세요.")
}
let sim=null,animation=null,sampleAnimation=null,noiseSeed=7;
function noise(i,seed){let v=Math.sin((i+1)*12.9898+seed*78.233)*43758.5453;return 2*(v-Math.floor(v))-1}
function simulate(){
 const v=$("medium").value==="sound"?343:1500,d=+$("distance").value,noiseAmp=+$("noise").value/100;
 const fs=8000,len=2400,pulse=240,t0=Math.round(.008*fs),delay=Math.round((2*d/v)*fs);
 const narrow=$("bandwidth").value==="narrow",f0=narrow?1000:500,f1=narrow?1500:2500;
 const template=new Array(pulse),received=new Array(len).fill(0);
 for(let i=0;i<pulse;i++){let t=i/fs,env=Math.sin(Math.PI*i/pulse)**2;template[i]=env*Math.sin(TAU*(f0*t+(f1-f0)*t*t/(2*pulse/fs)))}
 for(let n=0;n<len;n++){let j=n-t0-delay;received[n]=.75*(j>=0&&j<pulse?template[j]:0)+noiseAmp*.65*noise(n,noiseSeed)}
 // Cross correlate with a transmitted template, beginning after the known transmit start.
 const maxLag=2000,corr=[],energy=template.reduce((a,x)=>a+x*x,0);
 for(let lag=0;lag<=maxLag;lag++){let dot=0,er=0;for(let i=0;i<pulse;i++){let q=received[t0+lag+i]||0;dot+=q*template[i];er+=q*q}corr.push(dot/Math.sqrt(Math.max(1e-12,energy*er)))}
 let peak=0;for(let k=1;k<corr.length;k++)if(corr[k]>corr[peak])peak=k;
 sim={v,d,noiseAmp,template,received,t0,delay,corr,peak,maxLag};
 $("distance-value").textContent=d+" m";$("noise-value").textContent=Math.round(noiseAmp*100)+"%";
 const mediumText=v===343?tr("Air / sound, 343 m/s","공기 / 소리, 343 m/s"):tr("Water / sonar, 1500 m/s","물 / 소나, 1500 m/s");
 const chirpText=narrow?tr("Narrow chirp, 1000–1500 Hz","좁은 처프, 1000–1500 Hz"):tr("Wide chirp, 500–2500 Hz","넓은 처프, 500–2500 Hz");
 $("radar-observe-settings").textContent=tr("Medium: ","매질: ")+mediumText+"  |  "+tr("Target: ","거리: ")+d+" m  |  "+tr("Noise: ","잡음: ")+Math.round(noiseAmp*100)+"%  |  "+chirpText;
 $("truth").textContent=(1000*delay/fs).toFixed(2)+" ms";
 $("estimate").textContent=(peak/fs*v/2).toFixed(2)+" m";
 $("error").textContent=Math.abs(peak/fs*v/2-d).toFixed(2)+" m";
 $("radar-result-guide").textContent=tr(
  "The selected Step 2 target is "+d+" m; the strongest correlation peak gives a "+(peak*1000/FS).toFixed(2)+" ms round-trip delay and an estimated "+(peak/FS*v/2).toFixed(2)+" m. Compare their difference, then change only the distance in Step 2.",
  "2번에서 정한 목표물 거리는 "+d+" m입니다. 가장 높은 상관 피크의 왕복 지연은 "+(peak*1000/FS).toFixed(2)+" ms이고, 추정 거리는 "+(peak/FS*v/2).toFixed(2)+" m입니다. 두 거리를 비교한 뒤 2번에서 거리만 바꾸어 다시 관찰하세요."
 );
 $("lag").max=String(maxLag);$("lag").step="1";$("lag").value=String(Math.min(maxLag,Math.round(.02*fs)));
 renderRadar()
}

function productStep(){
 if(!sim)return;
 const s=sim,lag=+ $("lag").value,m=+ $("sample-index").value;
 const products=[],sums=[];let total=0;
 for(let i=0;i<s.template.length;i++){
  const v=s.template[i]*(s.received[s.t0+lag+i]||0);products.push(v);total+=v;sums.push(total);
 }
 const maxP=Math.max(.01,...products.map(Math.abs))*1.12;
 draw("product-plot",[{points:points(products),color:orange,label:tr("Sample products","표본별 곱")}],
  {xmin:0,xmax:s.template.length-1,ymin:-maxP,ymax:maxP,label:"i",marks:[{x:m,color:blue}]});
 const maxS=Math.max(.1,...sums.map(Math.abs))*1.15;
 draw("sum-plot",[{points:points(sums.slice(0,m+1)),color:green,label:tr("Running sum","누적합")}],
  {xmin:0,xmax:s.template.length-1,ymin:-maxS,ymax:maxS,label:"m",marks:[{x:m,color:blue}]});
 $("sample-value").textContent=String(m+1)+" / "+s.template.length;
 $("product-value").textContent=products[m].toFixed(4);
 $("partial-value").textContent=sums[m].toFixed(4);
 $("norm-value").textContent=s.corr[lag].toFixed(4);
 const normEnergy=s.template.reduce((a,v)=>a+v*v,0);
 let receivedEnergy=0;for(let i=0;i<s.template.length;i++){const v=s.received[s.t0+lag+i]||0;receivedEnergy+=v*v}
 const denom=Math.sqrt(normEnergy*receivedEnergy);
 $("product-explain").textContent=tr(
 "Step "+(m+1)+": multiply the two aligned samples ("+s.template[m].toFixed(3)+" × "+(s.received[s.t0+lag+m]||0).toFixed(3)+"), then add "+products[m].toFixed(4)+" to the running total. Full sum "+total.toFixed(4)+" ÷ energy normalization "+denom.toFixed(4)+" = "+s.corr[lag].toFixed(4)+".",
 "단계 "+(m+1)+": 정렬한 두 표본을 곱하고 ("+s.template[m].toFixed(3)+" × "+(s.received[s.t0+lag+m]||0).toFixed(3)+"), 그 값 "+products[m].toFixed(4)+"를 누적합에 더합니다. 전체 합 "+total.toFixed(4)+" ÷ 에너지 정규화 "+denom.toFixed(4)+" = "+s.corr[lag].toFixed(4)+"."
 );
}
function pauseSample(){
 if(sampleAnimation!==null){clearInterval(sampleAnimation);sampleAnimation=null;$("sample-play").textContent=tr("▶ Accumulate","▶ 누적합 애니메이션")}
}
function renderRadar(){
 if(!sim)return;const s=sim,lag=+$("lag").value;
 $("lag-value").textContent=(lag*1000/FS).toFixed(2)+" ms";
 const shifted=[];for(let i=0;i<s.received.length;i+=3){let idx=i-s.t0-lag;shifted.push([i*1000/FS,idx>=0&&idx<s.template.length?s.template[idx]:0])}
 const r=points(s.received,1000/FS,0,3);
 draw("echo-plot",[{points:r,color:orange,label:tr("Received","수신")},{points:shifted,color:blue,label:tr("Shifted template","이동 기준 신호")}],{xmin:0,xmax:290,ymin:-1.7,ymax:1.7,label:"ms"});
 draw("corr-plot",[{points:points(s.corr,1000/FS,0,2),color:green,label:tr("Correlation","상호상관")}],{xmin:0,xmax:s.maxLag*1000/FS,ymin:-.55,ymax:1.05,label:"ms",marks:[{x:lag*1000/FS,color:blue},{x:s.peak*1000/FS,color:orange}]});
 const corr=s.corr[lag],peak=s.corr[s.peak];
 $("lag-explain").textContent=tr("At this lag, normalized similarity is ","현재 지연에서 정규화된 유사도는 ")+corr.toFixed(3)+tr("; peak is ","이며, 최대값은 ")+peak.toFixed(3)+tr(". Try moving toward the orange peak.","입니다. 주황색 피크 쪽으로 이동해 보세요.");
 productStep()
}
function pause(){pauseSample();if(animation!==null){clearInterval(animation);animation=null;$("lag-play").textContent=tr("▶ Animate scan","▶ 지연 탐색 애니메이션")}}
function radarSetup(){
 $("sample-index").addEventListener("input",()=>{pauseSample();productStep()});
 $("sample-prev").addEventListener("click",()=>{pauseSample();$("sample-index").value=String(Math.max(0,+$("sample-index").value-1));productStep()});
 $("sample-next").addEventListener("click",()=>{pauseSample();$("sample-index").value=String(Math.min(239,+$("sample-index").value+1));productStep()});
 $("sample-complete").addEventListener("click",()=>{pauseSample();$("sample-index").value="239";productStep()});
 $("sample-play").addEventListener("click",()=>{if(sampleAnimation!==null){pauseSample();return}$("sample-index").value="0";productStep();sampleAnimation=setInterval(()=>{let n=+$("sample-index").value+2;if(n>239){pauseSample();return}$("sample-index").value=String(n);productStep()},65);$("sample-play").textContent=tr("■ Pause","■ 일시정지")});
 window.addEventListener("pagehide",()=>{pause();pauseSample()});
 for(const id of ["medium","distance","noise","bandwidth"])$(id).addEventListener("input",()=>{pause();simulate()});
 $("new-noise").addEventListener("click",()=>{noiseSeed++;pause();simulate()});
 $("lag").addEventListener("input",()=>{pause();renderRadar()});
 $("lag-back").addEventListener("click",()=>{$("lag").value=String(Math.max(0,+$("lag").value-16));renderRadar()});
 $("lag-forward").addEventListener("click",()=>{$("lag").value=String(Math.min(sim.maxLag,+$("lag").value+16));renderRadar()});
 $("lag-peak").addEventListener("click",()=>{pause();$("lag").value=String(sim.peak);renderRadar()});
 $("lag-play").addEventListener("click",()=>{if(animation!==null){pause();return}$("lag").value="0";animation=setInterval(()=>{let next=+$("lag").value+24;if(next>sim.maxLag){pause();return}$("lag").value=String(next);renderRadar()},35);$("lag-play").textContent=tr("■ Pause","■ 일시정지")});
 $("reset").addEventListener("click",()=>{pause();$("medium").value="sound";$("distance").value="17";$("noise").value="30";$("bandwidth").value="wide";noiseSeed=7;simulate()});
 prediction([["a","Look for the strongest similarity after shifting.","기준 신호를 이동하며 가장 높은 유사도를 찾는다."],["b","Use only the tallest received sample.","수신 파형에서 가장 높은 표본 하나를 고른다."],["c","Ignore the delay and count peaks.","시간 지연은 무시하고 피크 수만 센다."]],"a");
 simulate();
}
function audioSetup(){
 for(const id of ["source","filter","cutoff","band"])$(id).addEventListener("input",runAudio);
 $("play-original").addEventListener("click",()=>play(audioData.x));$("play-filtered").addEventListener("click",()=>play(audioData.y));$("stop").addEventListener("click",stopAudio);
 $("reset").addEventListener("click",()=>{stopAudio();$("source").value="voice";$("filter").value="low";$("cutoff").value="950";$("band").value="650";runAudio()});
 prediction([["a","The higher-frequency components decrease.","높은 주파수 성분이 감소한다."],["b","The sampling frequency becomes lower.","샘플링 주파수가 낮아진다."],["c","All frequencies are amplified equally.","모든 주파수가 똑같이 증폭된다."]],"a");
 runAudio();
 window.addEventListener("pagehide",stopAudio);
}
function drawAll(){if(audio){if(audioData)runAudio()}else if(sim)renderRadar()}
if(audio)audioSetup();else radarSetup();
let resizeQueued=false;
window.addEventListener("resize",()=>{
 if(resizeQueued)return;
 resizeQueued=true;
 requestAnimationFrame(()=>{resizeQueued=false;drawAll()});
});
window.addEventListener("els:themechange",()=>requestAnimationFrame(drawAll));
if(!audio){
 const detail=$("correlation-detail");
 detail?.addEventListener("toggle",()=>{
  if(detail.open)requestAnimationFrame(productStep);
 });
}
})();