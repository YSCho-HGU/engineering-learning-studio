/* Part D: two original, self-contained integrated engineering labs. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),audio=document.body.dataset.partD==="audio",lang=window.ELSLanguage;
const mode=()=>lang?.get?.()||"mixed",tr=(en,ko)=>mode()==="en"?en:mode()==="ko"?ko:en+" / "+ko;
function localize(){document.querySelectorAll("[data-en][data-ko]").forEach(el=>el.textContent=tr(el.dataset.en,el.dataset.ko));}
lang?.bindSelect?.($("partd-language"));
lang?.subscribe?.(()=>{localize();drawAll()});
localize();
const N=8192,FS=8000,TAU=2*Math.PI;
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function rms(a){return Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length)}
function draw(canvas,series,{xmin=0,xmax=1,ymin=-1,ymax=1,marks=[],label=""}={}){
 const c=$(canvas),ctx=c.getContext("2d"),w=c.width,h=c.height, L=47,R=15,T=14,B=34;
 const px=x=>L+(x-xmin)*(w-L-R)/(xmax-xmin),py=y=>T+(ymax-y)*(h-T-B)/(ymax-ymin);
 const bg=getComputedStyle(document.documentElement).getPropertyValue("--els-surface-alt").trim()||"#26332c";
 const ink=getComputedStyle(document.documentElement).getPropertyValue("--els-ink").trim()||"#e7ede8";
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.strokeStyle=ink;ctx.globalAlpha=.22;ctx.lineWidth=1;
 for(let i=0;i<=4;i++){let y=T+(h-T-B)*i/4;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(w-R,y);ctx.stroke()}
 ctx.globalAlpha=1;ctx.fillStyle=ink;ctx.font="14px system-ui";ctx.textAlign="right";
 for(let i=0;i<=4;i++){let y=T+(h-T-B)*i/4;ctx.fillText((ymax-(ymax-ymin)*i/4).toFixed(Math.abs(ymax-ymin)>20?0:2),L-7,y+4)}
 ctx.textAlign="center";for(let i=0;i<=4;i++){let x=xmin+(xmax-xmin)*i/4;ctx.fillText(x.toFixed(xmax>50?0:1),px(x),h-11)}
 ctx.fillText(label,w-20,h-11);
 for(const s of series){ctx.strokeStyle=s.color;ctx.lineWidth=s.width||2;ctx.beginPath();let started=false;for(const p of s.points){if(p[0]<xmin||p[0]>xmax||!Number.isFinite(p[1]))continue;let x=px(p[0]),y=py(clamp(p[1],ymin,ymax));if(!started){ctx.moveTo(x,y);started=true}else ctx.lineTo(x,y)}ctx.stroke()}
 for(const m of marks){let x=px(m.x);ctx.strokeStyle=m.color||ink;ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,h-B);ctx.stroke();ctx.setLineDash([])}
 ctx.textAlign="left";let yy=17;for(const s of series){ctx.fillStyle=s.color;ctx.fillRect(L+9,yy-8,18,4);ctx.fillStyle=ink;ctx.fillText(s.label||"",L+35,yy);yy+=17}
}
const blue="#4a9ce8",orange="#e59e4e",green="#66ba83";
function points(a,dt=1,start=0,step=1){const v=[];for(let i=0;i<a.length;i+=step)v.push([start+i*dt,a[i]]);return v}
function prediction(options,correct){
 const root=$("predict-options");for(const [id,en,ko] of options){let label=document.createElement("label"),radio=document.createElement("input");radio.type="radio";radio.name="prediction";radio.value=id;label.append(radio,document.createTextNode(tr(en,ko)));root.append(label)}
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
function convolveSame(x,h){let y=new Array(x.length).fill(0),mid=(h.length-1)/2;for(let n=0;n<x.length;n++){let sum=0;for(let k=0;k<h.length;k++){let j=n+mid-k;if(j>=0&&j<x.length)sum+=h[k]*x[j]}y[n]=sum}return y}
function fftMagnitudes(x,bins=128){const N0=2048,section=x.slice(500,500+N0),out=[];for(let k=0;k<bins;k++){let re=0,im=0;for(let n=0;n<N0;n++){let a=TAU*k*n/N0,w=.5-.5*Math.cos(TAU*n/(N0-1));re+=section[n]*w*Math.cos(a);im-=section[n]*w*Math.sin(a)}out.push(Math.hypot(re,im))}return out}
function response(h,f){let re=0,im=0;for(let k=0;k<h.length;k++){let a=TAU*f*k/FS;re+=h[k]*Math.cos(a);im-=h[k]*Math.sin(a)}return Math.hypot(re,im)}
let audioData=null,ctxAudio=null,currentNode=null;
function stopAudio(){if(currentNode){try{currentNode.stop()}catch(e){}currentNode=null}}
function play(arr){stopAudio();const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctxAudio=ctxAudio||new AC();ctxAudio.resume();let buffer=ctxAudio.createBuffer(1,arr.length,FS);buffer.copyToChannel(Float32Array.from(arr),0);const source=ctxAudio.createBufferSource(),gain=ctxAudio.createGain();gain.gain.value=.45;source.buffer=buffer;source.connect(gain);gain.connect(ctxAudio.destination);source.onended=()=>{if(currentNode===source)currentNode=null};source.start();currentNode=source}
function runAudio(){
 let source=$("source").value,type=$("filter").value,cut=+$("cutoff").value,bw=+$("band").value;
 $("cutoff-value").textContent=cut+" Hz";$("band-value").textContent=bw+" Hz";$("band").disabled=type!=="band";
 const x=newSound(source),h=fir(type,cut,bw),y=convolveSame(x,h);audioData={x,y};
 let p1=points(x.slice(0,320),1000/FS,0,2),p2=points(y.slice(0,320),1000/FS,0,2);
 draw("waveplot",[{points:p1,color:blue,label:tr("Input","입력")},{points:p2,color:orange,label:tr("Output","출력")}],{xmin:0,xmax:40,ymin:-1.3,ymax:1.3,label:"ms"});
 let a=fftMagnitudes(x,250),b=fftMagnitudes(y,250),norm=Math.max(...a,1e-10);
 draw("specplot",[{points:a.map((v,i)=>[i*FS/2048,20*Math.log10(Math.max(1e-8,v/norm))]),color:blue,label:tr("Input","입력")},{points:b.map((v,i)=>[i*FS/2048,20*Math.log10(Math.max(1e-8,v/norm))]),color:orange,label:tr("Output","출력")}],{xmin:0,xmax:FS*249/2048,ymin:-75,ymax:5,label:"Hz"});
 let curve=[];for(let f=0;f<=3000;f+=25)curve.push([f,Math.max(-70,20*Math.log10(Math.max(1e-6,response(h,f))))]);
 draw("gainplot",[{points:curve,color:green,label:"|H(f)|"}],{xmin:0,xmax:3000,ymin:-70,ymax:8,label:"Hz"});
 let ratio=20*Math.log10(Math.max(1e-10,rms(y))/rms(x));
 $("atten").textContent=ratio.toFixed(1)+" dB";$("delay").textContent="6.25 ms";$("rms").textContent=rms(y).toFixed(3);
 $("audio-insight").textContent=type==="low"?tr("High frequencies are attenuated; listen for a duller sound.","높은 주파수가 줄어들어 소리가 둔탁해지는지 들어보세요."):type==="high"?tr("Low frequencies are attenuated; listen for a thinner sound.","낮은 주파수가 줄어들어 소리가 가늘어지는지 들어보세요."):tr("Only the selected band is emphasized; compare spectra and sound.","선택한 대역만 통과하므로 스펙트럼과 소리를 비교하세요.")
}
let sim=null,animation=null,noiseSeed=7;
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
 $("truth").textContent=(1000*delay/fs).toFixed(2)+" ms";
 $("estimate").textContent=(peak/fs*v/2).toFixed(2)+" m";
 $("error").textContent=Math.abs(peak/fs*v/2-d).toFixed(2)+" m";
 $("lag").max=String(maxLag);$("lag").step="1";$("lag").value=String(Math.min(maxLag,Math.round(.02*fs)));
 renderRadar()
}
function renderRadar(){
 if(!sim)return;const s=sim,lag=+$("lag").value;
 $("lag-value").textContent=(lag*1000/FS).toFixed(2)+" ms";
 const shifted=[];for(let i=0;i<s.received.length;i+=3){let idx=i-s.t0-lag;shifted.push([i*1000/FS,idx>=0&&idx<s.template.length?s.template[idx]:0])}
 const r=points(s.received,1000/FS,0,3);
 draw("echo-plot",[{points:r,color:orange,label:tr("Received","수신")},{points:shifted,color:blue,label:tr("Shifted template","이동 기준 신호")}],{xmin:0,xmax:290,ymin:-1.7,ymax:1.7,label:"ms"});
 draw("corr-plot",[{points:points(s.corr,1000/FS,0,2),color:green,label:tr("Correlation","상호상관")}],{xmin:0,xmax:s.maxLag*1000/FS,ymin:-.55,ymax:1.05,label:"ms",marks:[{x:lag*1000/FS,color:blue},{x:s.peak*1000/FS,color:orange}]});
 const corr=s.corr[lag],peak=s.corr[s.peak];
 $("lag-explain").textContent=tr("At this lag, normalized similarity is ","현재 지연에서 정규화된 유사도는 ")+corr.toFixed(3)+tr("; peak is ","이며, 최대값은 ")+peak.toFixed(3)+tr(". Try moving toward the orange peak.","입니다. 주황색 피크 쪽으로 이동해 보세요.")
}
function pause(){if(animation!==null){clearInterval(animation);animation=null;$("lag-play").textContent=tr("▶ Animate scan","▶ 지연 탐색 애니메이션")}}
function radarSetup(){
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
})();