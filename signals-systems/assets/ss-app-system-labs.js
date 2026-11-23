/* Interactive RC and causal moving-average Part B lessons. */
(function(){
"use strict";
const core=window.SSSystemCore,lang=window.ELSLanguage,$=id=>document.getElementById(id);
const kind=new URLSearchParams(location.search).get("lab")==="moving-average"?"moving-average":"rc";
const defaults=kind==="rc"?{type:"low",shape:"sine",Rk:10,Cmicro:10,frequency:3,noise:.5}:{M:7,shape:"trend",noise:.42,index:65};
const state={...defaults};
function tr(en,ko,compact){const m=lang?.get?.()||"mixed";return m==="en"?en:m==="ko"?ko:compact?en+" · "+ko:en+"\n"+ko;}
function label(id,en,ko,compact){$(id).textContent=tr(en,ko,compact);}
const num=(v,d=2)=>Number(v).toFixed(d);
function drawMath(text){const el=$("ss-sys-equation");el.textContent=text;if(window.katex)try{window.katex.render(text,el,{throwOnError:false});}catch(_){}}
const content={
 rc:{title:["RC Low-Pass and High-Pass","RC 저역통과·고역통과"],sub:["Change the time constant and frequency to see what passes through.","시정수와 주파수를 조절하여 필터의 동작을 관찰합니다."],question:["Does the circuit pass slow and fast signals equally?","회로는 느린 신호와 빠른 신호를 똑같이 통과시킬까요?"],task:["Sweep the input frequency across the cutoff, then switch Low-pass and High-pass.","입력 주파수를 차단주파수 전후로 바꾸고 저역·고역통과 출력을 비교하세요."]},
 "moving-average":{title:["Moving Average and Sensor Smoothing","이동평균과 센서 평활화"],sub:["Observe a causal FIR filter and inspect convolution sample by sample.","인과적 FIR의 평활화와 컨벌루션을 표본 단위로 관찰합니다."],question:["Why does averaging remove noise but blur sudden changes?","평균은 잡음을 줄이면서 갑작스러운 변화를 왜 흐리게 할까요?"],task:["Select Step, increase M from 3 to 21, and inspect a sample during the transition.","Step을 선택하고 M을 3에서 21로 증가한 후 전이 구간의 표본을 관찰하세요."]}
};
function colors(){const s=getComputedStyle(document.documentElement);const get=(k,v)=>s.getPropertyValue(k).trim()||v;return {input:"#289bc0",output:"#de8a37",ideal:"#7cae76",muted:get("--els-muted","#9ba4a0"),grid:get("--els-border","#56605a"),accent:get("--els-link","#a9cbb4")};}
function select(key,en,ko,opts){const row=document.createElement("div");row.className="ss-sys-field";
const l=document.createElement("label");l.textContent=tr(en,ko,true);l.htmlFor="sys-"+key;
const el=document.createElement("select");el.id=l.htmlFor;
opts.forEach(o=>{const t=document.createElement("option");t.value=o[0];t.textContent=tr(o[1],o[2],true);el.append(t);});
el.value=state[key];el.addEventListener("change",()=>{state[key]=el.value;controls();render();});row.append(l,el);$("ss-sys-fields").append(row);}
function range(key,en,ko,min,max,step,unit=""){const row=document.createElement("div");row.className="ss-sys-field";
const head=document.createElement("div");head.className="ss-sys-field-head";
const l=document.createElement("label");l.htmlFor="sys-"+key;l.textContent=tr(en,ko,true);
const out=document.createElement("output");out.id="out-"+key;out.textContent=state[key]+unit;head.append(l,out);
const el=document.createElement("input");el.id=l.htmlFor;el.type="range";el.min=min;el.max=max;el.step=step;el.value=state[key];
el.addEventListener("input",()=>{state[key]=Number(el.value);out.textContent=state[key]+unit;render();});row.append(head,el);$("ss-sys-fields").append(row);}
function controls(){$("ss-sys-fields").replaceChildren();
if(kind==="rc"){select("type","Filter type","필터 종류",[["low","Low-pass","저역통과"],["high","High-pass","고역통과"]]);select("shape","Input signal","입력 신호",[["sine","Sine","정현파"],["square","Square","구형파"],["step","Step","계단"],["sensor","Sensor + ripple","센서 + 리플"]]);
range("Rk","Resistance R","저항 R",1,100,1," kΩ");range("Cmicro","Capacitance C","커패시턴스 C",1,100,1," µF");range("frequency","Input frequency","입력 주파수",.2,20,.2," Hz");if(state.shape==="sensor")range("noise","Ripple strength","리플 강도",0,1,.05);}
else{select("shape","Sensor pattern","센서 신호",[["trend","Slow trend","느린 변화"],["step","Step change","계단 변화"],["periodic","Periodic","주기 신호"],["constant","Constant","일정 신호"]]);
range("M","Window size M","평균 길이 M",1,31,1);range("noise","Noise level","잡음 크기",0,1.2,.05);range("index","Inspect sample n","관찰 표본 n",0,127,1);}}
function metric(data){const root=$("ss-sys-metrics");root.replaceChildren();data.forEach(([en,ko,value])=>{const b=document.createElement("div");b.className="ss-sys-metric";const s=document.createElement("span");s.textContent=tr(en,ko,true);const strong=document.createElement("strong");strong.textContent=value;b.append(s,strong);root.append(b);});}
function legend(id,items){$(id).replaceChildren();items.forEach(([en,ko,color])=>{const s=document.createElement("span");s.style.setProperty("--legend-color",color);s.textContent=tr(en,ko,true);$(id).append(s);});}
function plot(index,series,opts){const el=$("ss-sys-canvas-"+index),rect=el.getBoundingClientRect(),w=Math.max(230,rect.width),h=Math.max(170,rect.height),dpr=Math.min(2,devicePixelRatio||1);
el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);const c=el.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
const p=colors(),L=49,R=13,T=12,B=34,W=w-L-R,H=h-T-B,xMin=opts.xMin??0,xMax=opts.xMax??1,yMin=opts.yMin??0,yMax=opts.yMax??1;
const X=x=>L+(x-xMin)*W/(xMax-xMin),Y=y=>T+(yMax-y)*H/(yMax-yMin);
c.font="12px Arial, sans-serif";c.strokeStyle=p.grid;c.fillStyle=p.muted;c.lineWidth=.8;
for(let i=0;i<=4;i++){const y=yMin+(yMax-yMin)*i/4,yp=Y(y),x=xMin+(xMax-xMin)*i/4,xp=X(x);
c.globalAlpha=.3;c.beginPath();c.moveTo(L,yp);c.lineTo(w-R,yp);c.moveTo(xp,T);c.lineTo(xp,h-B);c.stroke();c.globalAlpha=1;c.textAlign="right";c.textBaseline="middle";c.fillText(num(y,2),L-6,yp);c.textAlign="center";c.textBaseline="top";c.fillText(num(x,opts.decimals??2),xp,h-B+5);}
c.fillStyle=p.muted;c.textAlign="center";c.fillText(opts.xLabel||"",w/2,h-14);
c.save();c.beginPath();c.rect(L,T,W,H);c.clip();
if(opts.window){c.fillStyle=p.accent;c.globalAlpha=.12;c.fillRect(X(opts.window[0]),T,Math.max(0,X(opts.window[1])-X(opts.window[0])),H);c.globalAlpha=1;}
series.forEach(line=>{c.strokeStyle=line.color;c.lineWidth=line.width||2;c.setLineDash(line.dash||[]);c.beginPath();
line.points.forEach((v,i)=>{if(line.stems){c.moveTo(X(v[0]),Y(0));c.lineTo(X(v[0]),Y(v[1]));}else if(i)c.lineTo(X(v[0]),Y(v[1]));else c.moveTo(X(v[0]),Y(v[1]));});c.stroke();c.setLineDash([]);});
if(opts.cursor!=null){c.strokeStyle=p.accent;c.setLineDash([4,4]);c.beginPath();c.moveTo(X(opts.cursor),T);c.lineTo(X(opts.cursor),h-B);c.stroke();c.setLineDash([]);}
c.restore();}
function insight(en,ko){const root=$("ss-sys-insight"),h=document.createElement("strong"),p=document.createElement("p");h.textContent=tr("Interpret the result","결과 해석",true);p.textContent=tr(en,ko);root.replaceChildren(h,p);}
function rc(){const p=colors(),d=core.rcSimulate(state),{tau,cutoff,frequency,frequencyPoint}=d,m=frequencyPoint.mag,phase=frequencyPoint.phase;
drawMath(state.type==="low"?"H_{LP}(s)=\\frac{1}{1+sRC},\\quad f_c=\\frac{1}{2\\pi RC}":"H_{HP}(s)=\\frac{sRC}{1+sRC},\\quad f_c=\\frac{1}{2\\pi RC}");
label("ss-sys-plot-title-1","Input and output","입력과 출력");label("ss-sys-plot-title-2","Frequency response |H(jω)|","주파수 응답 |H(jω)|");label("ss-sys-plot-title-3","Unit-step response","단위 계단응답");
label("ss-sys-note-1","Capacitor = LP; resistor = HP. The simulation includes transients.","커패시터는 LP, 저항은 HP이며 과도응답도 포함됩니다.");
label("ss-sys-note-2","Linear frequency axis; input frequency shown by vertical line.","선형 주파수 축이며 세로선이 입력 주파수를 나타냅니다.");
label("ss-sys-note-3","Response shown versus normalized time t/τ.","정규화 시간 t/τ 기준 응답입니다.");
metric([["Time constant τ","시정수 τ",num(tau*1000,1)+" ms"],["Cutoff frequency","차단주파수",num(cutoff)+" Hz"],["Gain at input","입력 이득",num(m,3)+" ×"],["Phase at input","입력 위상",num(phase,1)+"°"],["f / cutoff","f / 차단주파수",num(frequency/cutoff,2)+" ×"]]);
legend("ss-sys-legend-1",[["Input","입력",p.input],["Output","출력",p.output]]);legend("ss-sys-legend-2",[["Magnitude","크기",p.output],["Current frequency","현재 주파수",p.accent]]);
const full=Math.max(1.15,...d.series.map(v=>Math.abs(v.x),Math.abs(v.y)))*1.08;
plot(1,[{color:p.input,points:d.series.map(v=>[v.t,v.x])},{color:p.output,points:d.series.map(v=>[v.t,v.y])}],{xMax:d.duration,yMin:-full,yMax:full,xLabel:"t (s)"});
const maxf=Math.max(20,4*cutoff,1.3*frequency),pts=Array.from({length:250},(_,i)=>maxf*i/249);
plot(2,[{color:p.output,points:pts.map(f=>[f,core.rcFrequency(tau,f,state.type).mag])},{color:p.accent,points:[[frequency,0],[frequency,m]],dash:[4,4]}],{xMax:maxf,yMax:1.05,xLabel:"f (Hz)"});
plot(3,[{color:p.output,points:d.step.map(v=>[v.x,v.y])}],{xMax:6,yMax:1.05,xLabel:"t / τ"});
insight("Gain "+num(m,3)+" and phase "+num(phase,1)+"° at "+num(frequency,1)+" Hz. These values describe sinusoidal steady state, not the harmonics of a square wave.","입력 "+num(frequency,1)+" Hz에서 이득은 "+num(m,3)+", 위상은 "+num(phase,1)+"°입니다. 이는 정현파 정상상태 값이며 구형파의 모든 고조파 응답을 뜻하지 않습니다.");}
function moving(){const p=colors(),d=core.averageSimulate(state),{series,M,delay}=d,win=core.averageWindow(series,M,state.index),vals=series.flatMap(v=>[v.clean,v.x,v.y]),yMin=Math.min(...vals)-.15,yMax=Math.max(...vals)+.15;
drawMath("y[n]=\\frac{1}{M}\\sum_{k=0}^{M-1}x[n-k],\\quad h[k]=\\frac{1}{M}\\ (0\\leq k<M)");
label("ss-sys-plot-title-1","Sensor input and filtered output","센서 입력과 필터 출력");label("ss-sys-plot-title-2","FIR magnitude response","FIR 크기 응답");label("ss-sys-plot-title-3","Impulse response h[n]","임펄스 응답 h[n]");
label("ss-sys-note-1","The shaded window contains the M contributing samples.","음영 구간은 출력 계산에 사용하는 M개 표본입니다.");
label("ss-sys-note-2","Horizontal axis is normalized angular frequency ω/π.","가로축은 정규화 각주파수 ω/π입니다.");
label("ss-sys-note-3","M equal taps of weight 1/M, beginning at n=0.","n=0부터 시작하는 M개의 동일한 가중치 1/M입니다.");
metric([["Window size","평균 길이",String(M)],["Group delay","군지연",num(delay,1)+" samples"],["Selected index","선택 표본","n="+win.index],["Input x[n]","입력 x[n]",num(series[win.index].x,3)],["Output y[n]","출력 y[n]",num(win.total,3)],["White-noise std ratio","백색잡음 표준편차 비",num(1/Math.sqrt(M),3)]]);
legend("ss-sys-legend-1",[["Sensor","센서",p.input],["True trend","원 신호",p.ideal],["Filtered","필터",p.output]]);legend("ss-sys-legend-2",[["Magnitude","크기",p.output]]);
plot(1,[{color:p.ideal,dash:[5,4],points:series.map(v=>[v.n,v.clean])},{color:p.input,width:1.3,points:series.map(v=>[v.n,v.x])},{color:p.output,width:2.4,points:series.map(v=>[v.n,v.y])}],{xMax:127,yMin,yMax,xLabel:"sample index n",decimals:0,cursor:win.index,window:[Math.max(0,win.index-M+1),win.index]});
plot(2,[{color:p.output,points:d.gain.map(v=>[v.w,v.mag])}],{xMax:1,yMax:1.05,xLabel:"ω / π"});
plot(3,[{color:p.output,stems:true,points:d.impulse.map(v=>[v.n,v.y])}],{xMax:d.impulse.length-1,yMax:Math.max(.08,1.15/M),xLabel:"sample index n",decimals:0});
const terms=win.terms.slice(0,7).map(v=>num(v.x,2)).join(" + ")+(M>7?" + …":"");
insight("At n="+win.index+", y[n] = ("+terms+") / "+M+" = "+num(win.total,3)+". The linear-phase group delay is (M−1)/2 samples. Noise reduction by 1/√M assumes independent white noise.",
"n="+win.index+"에서 y[n] = ("+terms+") / "+M+" = "+num(win.total,3)+"입니다. 선형위상 군지연은 (M−1)/2 표본이며 1/√M 잡음 감소는 독립 백색잡음에서 성립합니다.");}
let frame=0;function render(){if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=0;if(kind==="rc")rc();else moving();});}
function init(){const c=content[kind];label("ss-sys-title",...c.title,true);label("ss-sys-subtitle",...c.sub);label("ss-sys-question",...c.question);label("ss-sys-task",...c.task);
label("ss-sys-controls-title","Experiment Controls","실습 변수 조절",true);label("ss-sys-try-title","Try this","직접 실험하기",true);label("ss-sys-reset","Reset","초기화",true);label("ss-sys-return","Back to Applications","응용 목차로",true);
document.title=tr(...c.title,true)+" | Engineering Learning Studio";document.documentElement.lang=lang?.get?.()==="ko"?"ko":"en";
document.querySelectorAll("[data-system-tab]").forEach(a=>{const rc=a.dataset.systemTab==="rc";a.textContent=tr(rc?"01 · RC Filters":"02 · Moving Average",rc?"01 · RC 필터":"02 · 이동평균",true);if(a.dataset.systemTab===kind)a.setAttribute("aria-current","page");});
$("ss-sys-prev").disabled=kind==="rc";$("ss-sys-next").disabled=kind==="moving-average";
$("ss-sys-prev").onclick=()=>{if(kind!=="rc")location.href="./applications-system-lab.html?lab=rc";};
$("ss-sys-next").onclick=()=>{if(kind==="rc")location.href="./applications-system-lab.html?lab=moving-average";};
controls();render();}
$("ss-sys-reset").addEventListener("click",()=>{Object.assign(state,defaults);controls();render();});
lang?.subscribe?.(init);window.addEventListener("els:themechange",render);window.addEventListener("resize",render);
if(window.ResizeObserver)new ResizeObserver(render).observe($("ss-sys-workspace"));init();
})();
