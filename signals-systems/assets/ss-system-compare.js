/* Part B: the same sampled input drives an RC low-pass and causal moving-average FIR. */
(()=>{
"use strict";
const core=window.SSSystemCompareCore,lang=window.ELSLanguage,$=id=>document.getElementById(id);
if(!core)return;
const defaults={shape:"sensor",fs:50,noise:.3,M:9,tau:.09,match:true,inspectT:2.4,scope:"near",probeF:2.47};
const state={...defaults};let scheduled=0;
const tr=(en,ko,compact=false)=>{const m=lang?.get?.()||"mixed";return m==="en"?en:m==="ko"?ko:compact?en+" · "+ko:en+"\n"+ko;};
const tx=(id,en,ko,short=false)=>{$(id).textContent=tr(en,ko,short);};
const fmt=(x,n=2)=>Number(x).toFixed(n),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function katex(id,latex,alternative){const el=$(id);el.textContent=alternative;if(window.katex)try{window.katex.render(latex,el,{throwOnError:false});}catch(_){}}
function palette(){const s=getComputedStyle(document.documentElement),v=(k,f)=>s.getPropertyValue(k).trim()||f;return {
 input:v("--ss-trace-teal","#279ba5"),rc:v("--ss-trace-coral","#d87958"),ma:v("--ss-trace-gold","#bb8b2c"),
 clean:v("--ss-trace-violet","#9577c5"),grid:v("--ss-plot-grid",v("--els-border","#66736c")),muted:v("--els-muted","#a9b3ad"),accent:v("--els-link","#a8cdbd")
};}
function legend(id,entries){const root=$(id);root.replaceChildren();entries.forEach(([a,b,c])=>{const s=document.createElement("span");s.textContent=tr(a,b,true);s.style.setProperty("--legend-color",c);root.append(s);});}
function metrics(rows){
 const root=$("cmp-metrics");root.replaceChildren();
 rows.forEach(([en,ko,rc,ma])=>{
  const card=document.createElement("div");card.className="cmp-metric-card";
  const label=document.createElement("span");label.textContent=tr(en,ko,true);
  const values=document.createElement("div");values.className="cmp-metric-values";
  [["RC",rc],["MA",ma]].forEach(([name,value])=>{
   const holder=document.createElement("div"),small=document.createElement("small"),strong=document.createElement("strong");
   small.textContent=name;strong.textContent=value;holder.append(small,strong);values.append(holder);
  });card.append(label,values);root.append(card);
 });
}
function plot(id,lines,opt={}){
 const el=$(id),rect=el.getBoundingClientRect(),w=Math.max(250,rect.width),h=Math.max(180,rect.height);
 const dpr=Math.min(window.devicePixelRatio||1,2);el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);
 const c=el.getContext("2d");if(!c)return;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
 const p=palette(),L=54,R=16,T=14,B=37,W=w-L-R,H=h-T-B;
 const xmin=opt.xmin??0,xmax=opt.xmax??1,ymin=opt.ymin??0,ymax=opt.ymax??1;
 const X=x=>L+(x-xmin)/(xmax-xmin)*W,Y=y=>T+(ymax-y)/(ymax-ymin)*H;
 c.font='12px Arial, "Malgun Gothic", sans-serif';c.lineWidth=1;
 for(let i=0;i<=4;i++){
  const x=xmin+(xmax-xmin)*i/4,y=ymin+(ymax-ymin)*i/4;
  c.strokeStyle=p.grid;c.globalAlpha=.30;c.beginPath();c.moveTo(L,Y(y));c.lineTo(w-R,Y(y));c.moveTo(X(x),T);c.lineTo(X(x),h-B);c.stroke();c.globalAlpha=1;
  c.fillStyle=p.muted;c.textAlign="right";c.textBaseline="middle";c.fillText(fmt(y,2),L-6,Y(y));
  c.textAlign="center";c.textBaseline="top";c.fillText(fmt(x,opt.xdigits??1),X(x),h-B+5);
 }
 c.fillStyle=p.muted;c.fillText(opt.xlabel||"",w/2,h-13);
 c.save();c.beginPath();c.rect(L,T,W,H);c.clip();
 if(Number.isFinite(opt.threshold)){c.setLineDash([4,5]);c.strokeStyle=p.muted;c.beginPath();c.moveTo(L,Y(opt.threshold));c.lineTo(w-R,Y(opt.threshold));c.stroke();c.setLineDash([]);}
 lines.forEach(line=>{
  c.strokeStyle=line.color;c.lineWidth=line.width||2.3;c.setLineDash(line.dash||[]);
  c.beginPath();let began=false;
  let lastY=null;
  for(const [x,y]of line.points){
   if(!Number.isFinite(x)||!Number.isFinite(y)){began=false;lastY=null;continue;}
   if(!began||(line.breakJump&&lastY!==null&&Math.abs(y-lastY)>line.breakJump)){c.moveTo(X(x),Y(y));began=true;}else c.lineTo(X(x),Y(y));
   lastY=y;
  }
  c.stroke();c.setLineDash([]);
 });
 if(Number.isFinite(opt.marker)){c.setLineDash([4,5]);c.strokeStyle=p.accent;c.lineWidth=1.5;c.beginPath();c.moveTo(X(opt.marker),T);c.lineTo(X(opt.marker),T+H);c.stroke();c.setLineDash([]);}
 c.restore();
}
function localize(){
 tx("cmp-title","RC vs Moving Average","RC 필터와 이동평균 비교",true);
 tx("cmp-subtitle","Apply both filters to exactly the same sampled input and compare smoothing, frequency response and delay.","두 필터에 완전히 같은 표본 신호를 적용하고 평활화·주파수 응답·지연을 비교합니다.");
 tx("cmp-return","Back to Applications","응용 목차로",true);
 tx("cmp-tab-rc","01 · RC Filter","01 · RC 필터",true);
 tx("cmp-tab-ma","02 · Moving Average","02 · 이동평균",true);
 tx("cmp-tab-compare","03 · Filter Comparison","03 · 필터 비교",true);
 tx("cmp-control-title","One signal · two filters","하나의 신호 · 두 필터",true);
 tx("cmp-input-group","01 · Input and sampling","01 · 입력 및 표본화",true);
 tx("cmp-filter-group","02 · Filter settings","02 · 필터 설정",true);
 tx("cmp-control-intro","All outputs update using the same x[n].","모든 출력은 동일한 x[n]으로 갱신됩니다.");
 tx("cmp-label-signal","Input pattern","입력 신호",true);
 tx("cmp-label-fs","Sampling rate fs","샘플링 주파수 fs",true);
 tx("cmp-label-noise","Noise level","잡음 크기",true);
 tx("cmp-label-M","MA window length M","이동평균 길이 M",true);
 tx("cmp-match-label","Match −3 dB cutoffs","−3 dB 차단주파수 일치",true);
 tx("cmp-label-tau","RC time constant τ","RC 시정수 τ",true);
 tx("cmp-reset","Reset","초기화",true);
 tx("cmp-task-title","Try this","직접 실험하기",true);
 tx("cmp-time-section-title","Observe · What changes in time?","관찰 · 시간영역에서 무엇이 달라지나요?",true);
 tx("cmp-time-section-desc","The same input reaches both filters. Compare smoothing and response to sudden changes.","같은 입력을 통과시켜 평활화와 갑작스러운 변화에 대한 반응을 관찰합니다.");
 tx("cmp-frequency-section-title","Explain · Frequency, phase and delay","이해 · 주파수, 위상과 지연",true);
 tx("cmp-frequency-section-desc","Follow the magnitude response, then see how phase slope creates group delay.","크기 응답을 먼저 살펴본 뒤 위상의 기울기가 그룹 지연과 연결되는 과정을 확인합니다.");
 tx("cmp-scope-label","Frequency range","주파수 범위",true);
 tx("cmp-freq-probe-label","Inspect frequency","관찰 주파수",true);
 const opts=$("cmp-scope").options;
 opts[0].textContent=tr("Near cutoff","차단주파수 근처",true);
 opts[1].textContent=tr("Full band","전체 주파수 대역",true);
 tx("cmp-task-body",
 "Enable cutoff matching, then change M from 5 to 25. Compare noise suppression and low-frequency group delay. Next disable matching and adjust τ directly; finally change fs to observe what physical time each M means.",
 "차단주파수를 맞춘 뒤 M을 5에서 25로 조절하면서 잡음 억제와 저주파 군지연을 비교하세요. 일치 기능을 끄고 τ를 조절한 다음, fs 변경에 따라 M이 나타내는 물리적 시간이 달라짐을 관찰하세요.");
 const names=[["Noisy sensor","잡음 센서"],["Step","계단"],["Pulse","펄스"],["Sine wave","정현파"]];
 Array.from($("cmp-signal").options).forEach((o,i)=>o.textContent=tr(names[i][0],names[i][1],true));
 document.title=tr("RC vs Moving Average","RC와 이동평균 비교",true)+" | Engineering Learning Studio";
 document.documentElement.lang=lang?.get?.()==="ko"?"ko":"en";
}
function insight(en,ko){
 tx("cmp-insight-title","What do you notice?","무엇을 관찰했나요?",true);
 tx("cmp-insight-body",en,ko);
}
/* Frequency probe shares the same x position across magnitude, phase and group-delay plots. */
function renderFrequencyPanel(m,p){
 const {fs,M,alpha,cutoffRC,cutoffMA,spectrum}=m;
 const full=state.scope==="full";
 const reference=Math.max(cutoffMA||0,cutoffRC||0,fs/100);
 const maxF=full?fs/2:Math.min(fs/2,Math.max(.1,1.8*reference));
 state.probeF=clamp(state.probeF,0,maxF);
 const slider=$("cmp-freq-probe");
 slider.max=String(maxF);slider.step=String(Math.max(.001,maxF/1000));
 slider.value=String(state.probeF);
 $("cmp-scope").value=state.scope;
 $("cmp-freq-probe-value").textContent=fmt(state.probeF,2)+" Hz";
 const current=core.responsePoint(alpha,M,fs,state.probeF);
 const visible=spectrum.filter(v=>v.f<=maxF+1e-9);
 const point=(key)=>visible.map(v=>[v.f,key(v)]);
 const common={xmin:0,xmax:maxF,xlabel:"f (Hz)",marker:state.probeF};
 const lines=(key,extra={})=>[
  {color:p.rc,width:2.5,points:point(q=>q[key==="mag"?"rcMag":key==="phase"?"rcPhase":"rcDelay"]*(key==="delay"?1000:1)),...extra},
  {color:p.ma,width:2.5,points:point(q=>q[key==="mag"?"maMag":key==="phase"?"maPhase":"maDelay"]==null?null:q[key==="mag"?"maMag":key==="phase"?"maPhase":"maDelay"]*(key==="delay"?1000:1)),...extra}
 ];
 tx("cmp-title-frequency","Magnitude response |H|","크기 응답 |H|",true);
 tx("cmp-title-phase","Phase response ∠H","위상 응답 ∠H",true);
 tx("cmp-title-delay","Group delay τg(f)","그룹 지연 τg(f)",true);
 legend("cmp-legend-frequency",[["RC low-pass","RC 저역통과",p.rc],["Moving average","이동평균",p.ma]]);
 legend("cmp-legend-phase",[["RC","RC",p.rc],["MA","MA",p.ma]]);
 legend("cmp-legend-delay",[["RC","RC",p.rc],["MA","MA",p.ma]]);
 plot("cmp-frequency",lines("mag"),{...common,ymin:0,ymax:1.08,threshold:1/Math.sqrt(2)});
 plot("cmp-phase",lines("phase",{breakJump:150}),{...common,ymin:-185,ymax:185,xlabel:"f (Hz)"});
 const delays=visible.flatMap(v=>[v.rcDelay,v.maDelay]).filter(Number.isFinite).map(x=>x*1000);
 const upper=Math.max(1,...delays),lower=Math.min(0,...delays);
 const ymax=Math.max(10,Math.ceil(upper*1.13/10)*10),ymin=lower<0?Math.floor(lower*1.2/10)*10:0;
 plot("cmp-delay",lines("delay"),{...common,ymin,ymax,xlabel:"f (Hz)"});
 tx("cmp-frequency-note",
  "Dashed line: −3 dB amplitude. Move the frequency slider to compare both filters at one frequency.",
  "점선은 −3 dB 크기입니다. 주파수 슬라이더로 같은 주파수에서 두 필터를 비교하세요.");
 tx("cmp-phase-note",
  "Wrapped phase in degrees (−180° to 180°). Phase is undefined at MA spectral nulls; breaks are intentional.",
  "위상은 −180°~180°로 표시합니다. 이동평균 스펙트럼의 영점에서는 위상이 정의되지 않으므로 선이 끊깁니다.");
 tx("cmp-delay-note",
  "Group delay = −d∠H/dω. MA delay is constant between spectral nulls; RC delay depends on frequency. RC delay can be negative near Nyquist.",
  "그룹 지연 = −d∠H/dω입니다. 이동평균은 영점 사이에서 일정하고 RC는 주파수에 따라 변합니다. RC는 나이퀴스트 부근에서 음의 지연을 보일 수 있습니다.");
 const chips=$("cmp-frequency-readouts");chips.replaceChildren();
 const phase=x=>x===null?tr("undefined","정의되지 않음",true):fmt(x,1)+"°";
 const delay=x=>x===null?tr("undefined","정의되지 않음",true):fmt(x*1000,1)+" ms";
 const values=[
  [tr("Selected f","선택 주파수",true),fmt(state.probeF,2)+" Hz",""],
  ["RC · ∠H",phase(current.rcPhase),"rc"],
  ["MA · ∠H",phase(current.maPhase),"ma"],
  [tr("RC group delay","RC 그룹 지연",true),delay(current.rcDelay),"rc"],
  [tr("MA group delay","MA 그룹 지연",true),delay(current.maDelay),"ma"]
 ];
 for(const [name,value,role] of values){
  const box=document.createElement("div");box.className="cmp-frequency-value"+(role?" cmp-frequency-value-"+role:"");
  const a=document.createElement("span"),b=document.createElement("strong");a.textContent=name;b.textContent=value;box.append(a,b);chips.append(box);
 }
}
function draw(m){
 const p=palette(),{items,fs,M,alpha,cutoffRC,cutoffMA,groupDelayRC,groupDelayMA,sigmaRC,sigmaMA}=m;
 $("cmp-match").checked=state.match;$("cmp-match").disabled=state.M===1;
 $("cmp-tau").disabled=state.match&&state.M>1;
 $("cmp-tau-value").textContent=fmt(m.tau,3)+" s"+(m.match?" (auto)":"");
 $("cmp-M-value").textContent=String(M);$("cmp-noise-value").textContent=fmt(state.noise,2);
 tx("cmp-match-note",
  M===1?"M=1 is the identity: it has no −3 dB cutoff and cannot be cutoff-matched.":
  m.match?"RC τ is calculated to match the moving average's sampled −3 dB frequency. Turn matching off to adjust τ.":
  "Matching is off: RC τ and M can be changed independently.",
  M===1?"M=1은 입력을 그대로 통과시키므로 −3 dB 차단주파수가 없어 일치 비교를 할 수 없습니다.":
  m.match?"이동평균의 표본화된 −3 dB 주파수에 맞게 RC τ가 자동 계산됩니다. 직접 조절하려면 일치를 끄세요.":
  "일치 기능이 꺼졌습니다. RC τ와 M을 독립적으로 조절할 수 있습니다.");
 katex("cmp-eq-rc","y_{\\mathrm{RC}}[n]=\\alpha y_{\\mathrm{RC}}[n-1]+(1-\\alpha)x[n]","RC: y[n]=αy[n−1]+(1−α)x[n]");
 katex("cmp-eq-ma","y_{\\mathrm{MA}}[n]=\\frac{1}{M}\\sum_{k=0}^{M-1}x[n-k]","MA: y[n]=Σx[n−k]/M");
 const fc=f=>f===null?tr("not defined","정의되지 않음",true):fmt(f,2)+" Hz";
 metrics([
  ["−3 dB cutoff frequency","−3 dB 차단주파수",fc(cutoffRC),fc(cutoffMA)],
  ["DC group delay","DC 군지연",fmt(groupDelayRC*1000,1)+" ms",fmt(groupDelayMA*1000,1)+" ms"],
  ["White-noise σout/σin","백색잡음 표준편차 비",fmt(sigmaRC,3),fmt(sigmaMA,3)]
 ]);
 tx("cmp-title-time","Same input, two outputs","동일 입력, 두 출력",true);
 tx("cmp-title-frequency","Frequency response","주파수 응답",true);
 tx("cmp-title-step","Noise-free step response","잡음 없는 계단응답",true);
 legend("cmp-legend-time",[["Input","입력",p.input],["RC output","RC 출력",p.rc],["MA output","MA 출력",p.ma],["Clean signal","잡음 없는 신호",p.clean]]);
 legend("cmp-legend-frequency",[["RC","RC",p.rc],["Moving average","이동평균",p.ma]]);
 legend("cmp-legend-step",[["Ideal step","이상 계단",p.clean],["RC","RC",p.rc],["MA","MA",p.ma]]);
 const extremes=items.flatMap(v=>[v.clean,v.x,v.rc,v.ma]),ymin=Math.min(...extremes)-.18,ymax=Math.max(...extremes)+.18;
 const selected=items[clamp(Math.round(state.inspectT*fs),0,items.length-1)];
 plot("cmp-time",[
  {color:p.clean,dash:[5,4],width:1.6,points:items.map(v=>[v.t,v.clean])},
  {color:p.input,width:1.25,points:items.map(v=>[v.t,v.x])},
  {color:p.rc,width:2.6,points:items.map(v=>[v.t,v.rc])},
  {color:p.ma,width:2.6,points:items.map(v=>[v.t,v.ma])}
 ],{xmin:0,xmax:4,ymin,ymax,xlabel:"t (s)",marker:selected.t});
 renderFrequencyPanel(m,p);
 plot("cmp-step",[
  {color:p.clean,dash:[5,4],width:1.4,points:m.step.map(v=>[v.t,v.x])},
  {color:p.rc,width:2.5,points:m.step.map(v=>[v.t,v.rc])},
  {color:p.ma,width:2.5,points:m.step.map(v=>[v.t,v.ma])}
 ],{xmin:.6,xmax:Math.min(4,Math.max(2.4,1+5*m.tau)),ymin:-.05,ymax:1.08,xlabel:"t (s)",threshold:.5});
 tx("cmp-time-note","Click the graph to inspect the two outputs at the same time.","그래프를 클릭하여 동일한 순간의 두 출력을 비교하세요.");
 tx("cmp-step-note","Step at t=1 s. A 50% crossing time is different from low-frequency group delay.","계단 입력은 t=1초에서 발생합니다. 50% 도달시간과 저주파 군지연은 다른 개념입니다.");
 const probe=$("cmp-probe");probe.replaceChildren();
 [["n="+selected.n+" · t="+fmt(selected.t,2)+" s",""],["x[n]="+fmt(selected.x,3),""],["RC="+fmt(selected.rc,3),"cmp-probe-rc"],["MA="+fmt(selected.ma,3),"cmp-probe-ma"]].forEach(([value,klass])=>{const span=document.createElement("span");span.className=klass;span.textContent=value;probe.append(span);});
 if(m.match){
  const faster=groupDelayRC<groupDelayMA?"RC":"MA",quieter=sigmaRC<sigmaMA?"RC":"MA";
  insight(
   "Both −3 dB cutoffs equal "+fmt(cutoffMA,2)+" Hz. "+quieter+" has the lower theoretical white-noise level; "+faster+" has the shorter low-frequency group delay. Even with equal cutoffs, the impulse and step responses need not match. Try M = 5 and M = 25.",
   "두 필터의 −3 dB 차단주파수는 "+fmt(cutoffMA,2)+" Hz로 같습니다. "+quieter+"는 이론적인 백색잡음 수준이 더 낮으며 "+faster+"의 저주파 군지연이 더 짧습니다. 차단주파수가 같아도 임펄스·계단응답은 다를 수 있습니다. M=5와 25를 비교하세요.");
 }else insight(
  M===1?"M=1 makes the moving average an identity system, with no smoothing. Increase M to see the noise–delay tradeoff.":
    "The cutoff frequencies differ. Enable cutoff matching before comparing which filter suppresses more noise or adds more delay. Physical RC τ is in seconds, while M counts samples.",
  M===1?"M=1이면 이동평균은 항등시스템이므로 평활화가 없습니다. M을 늘려 잡음과 지연의 상충관계를 확인하세요.":
    "차단주파수가 다릅니다. 잡음 억제와 지연을 공정하게 비교하려면 차단주파수를 맞추세요. RC τ는 초 단위이고 M은 표본 수입니다.");
 tx("cmp-model-summary","Models and fair comparison","모델 및 공정 비교 조건",true);
 tx("cmp-model-body",
 "Both filters process the same deterministic sampled input x[n], including exactly the same noise. The analog RC low-pass is evaluated exactly at the end of each zero-order-held sample interval, with initial capacitor voltage zero: α=exp(−1/(fs τ)). The causal MA uses the current and M−1 past samples, zero-padded for negative indices. All displayed frequency responses are of the sampled models, not the unconstrained continuous-time RC response. White-noise ratios assume independent noise samples; group delay refers to frequency near DC and is not the 50% step-response time.",
 "두 필터에 같은 결정적 표본 입력 x[n]과 동일한 잡음을 넣습니다. 아날로그 RC 저역통과는 초기 커패시터 전압 0에서 표본 구간마다 입력을 일정하게 유지한 경우(ZOH)의 구간 끝 전압을 정확하게 계산합니다: α=exp(−1/(fs τ)). 인과적 이동평균은 현재와 과거 M−1개 표본을 사용하고 음수 인덱스는 0으로 채웁니다. 모든 주파수 응답은 표본화된 모델의 응답이며 연속시간 RC 응답과 구분됩니다. 백색잡음 비는 독립 잡음 표본을 가정하고, DC 군지연과 계단응답의 50% 도달시간은 다릅니다.");
}
function redraw(){if(scheduled)cancelAnimationFrame(scheduled);scheduled=requestAnimationFrame(()=>{scheduled=0;draw(core.run(state));});}
$("cmp-signal").addEventListener("change",e=>{state.shape=e.target.value;redraw();});
$("cmp-fs").addEventListener("change",e=>{state.fs=Number(e.target.value);redraw();});
$("cmp-noise").addEventListener("input",e=>{state.noise=Number(e.target.value);redraw();});
$("cmp-M").addEventListener("input",e=>{state.M=Number(e.target.value);if(state.M===1)state.match=false;redraw();});
$("cmp-match").addEventListener("change",e=>{state.match=e.target.checked;redraw();});
$("cmp-tau").addEventListener("input",e=>{state.tau=Number(e.target.value);redraw();});
$("cmp-scope").addEventListener("change",e=>{state.scope=e.target.value;redraw();});
$("cmp-freq-probe").addEventListener("input",e=>{state.probeF=Number(e.target.value);redraw();});
$("cmp-reset").addEventListener("click",()=>{
 Object.assign(state,defaults);
 $("cmp-signal").value=state.shape;$("cmp-fs").value=String(state.fs);
 $("cmp-noise").value=state.noise;$("cmp-M").value=state.M;
 $("cmp-match").checked=true;$("cmp-tau").value=state.tau;
 $("cmp-scope").value=state.scope;$("cmp-freq-probe").value=state.probeF;redraw();
});
const canvas=$("cmp-time");
canvas.addEventListener("click",e=>{
 const r=canvas.getBoundingClientRect(),fraction=clamp((e.clientX-r.left-54)/Math.max(1,r.width-70),0,1);
 state.inspectT=Math.round(4*fraction*state.fs)/state.fs;redraw();
});
canvas.addEventListener("keydown",e=>{
 const k=e.key;let v=state.inspectT;
 if(k==="ArrowLeft")v-=1/state.fs;else if(k==="ArrowRight")v+=1/state.fs;
 else if(k==="Home")v=0;else if(k==="End")v=4;else return;
 e.preventDefault();state.inspectT=clamp(Math.round(v*state.fs)/state.fs,0,4);redraw();
});
lang?.subscribe?.(()=>{localize();redraw();});
window.addEventListener("els:themechange",redraw);
window.addEventListener("resize",redraw);
if(window.ResizeObserver){let previous=0;new ResizeObserver(a=>{const width=Math.round(a[0].contentRect.width);if(width!==previous){previous=width;redraw();}}).observe($("cmp-workspace"));}
localize();redraw();
window.SSSystemCompareLab={state,compute:()=>core.run(state),redraw};
})();
