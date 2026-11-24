/* Part B exploratory diagrams: RC topology/instantaneous voltages and FIR convolution walkthrough. */
(function(){
"use strict";
const lab=window.SSSystemLab,core=window.SSSystemCore,language=window.ELSLanguage;
if(!lab||!core)return;
const $=id=>document.getElementById(id);
const isRC=lab.kind==="rc";
const tr=(en,ko,compact=false)=>{
 const mode=language?.get?.()||"mixed";
 return mode==="en"?en:mode==="ko"?ko:compact?en+" · "+ko:en+"\n"+ko;
};
const fmt=(v,d=3)=>Number(v).toFixed(d).replace(/\.?0+$/,"");
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function text(id,en,ko,short=false){$(id).textContent=tr(en,ko,short);}
function renderMath(target,formula,fallback){
 target.textContent=fallback;
 if(window.katex){
  try{window.katex.render(formula,target,{throwOnError:false,displayMode:false});}
  catch(_){}
 }
}
function makeTimeChartInteractive(){
 const canvas=$("ss-sys-canvas-1");if(!canvas)return;
 canvas.setAttribute("role","button");canvas.tabIndex=0;
 canvas.setAttribute("aria-label",tr(
  isRC?"Select a moment on the input/output plot. Use left and right arrow keys to move the probe.":
       "Select a sensor sample to inspect its convolution. Use left and right arrow keys to move the sample.",
  isRC?"파형의 시점을 선택합니다. 좌우 화살표로 관찰 위치를 옮길 수 있습니다.":
       "센서 표본을 선택하여 컨벌루션을 살펴봅니다. 좌우 화살표로 이동할 수 있습니다."));
 const key=isRC?"probe":"index",maximum=isRC?1200:127;
 canvas.addEventListener("click",event=>{
  const rect=canvas.getBoundingClientRect(),left=49,right=13;
  const ratio=clamp((event.clientX-rect.left-left)/Math.max(1,rect.width-left-right),0,1);
  lab.update({[key]:Math.round(ratio*maximum)});
 });
 canvas.addEventListener("keydown",event=>{
  let next=null,current=lab.state[key];
  if(event.key==="ArrowRight")next=current+1;
  if(event.key==="ArrowLeft")next=current-1;
  if(event.key==="Home")next=0;
  if(event.key==="End")next=maximum;
  if(next===null)return;
  event.preventDefault();lab.update({[key]:clamp(next,0,maximum)});
 });
}
function initRC(){
 $("ss-sys-rc-explorer").hidden=false;
 $("ss-sys-ma-explorer").hidden=true;
}
function rcRender(){
 const s=lab.state,data=core.rcSimulate(s),index=clamp(Math.round(s.probe),0,1200),point=data.series[index],isLow=s.type==="low";
 const vr=isLow?point.x-point.y:point.y;
 const vc=isLow?point.y:point.x-point.y;
 const activeId=isLow?"ss-sys-shunt-c":"ss-sys-shunt-r";
 ["ss-sys-series-r","ss-sys-series-c","ss-sys-shunt-r","ss-sys-shunt-c"].forEach(id=>{
  const el=$(id);el.toggleAttribute("hidden",id===(isLow?"ss-sys-series-c":"ss-sys-series-r")||id===(isLow?"ss-sys-shunt-r":"ss-sys-shunt-c"));
  el.classList.toggle("ss-sys-measured-element",id===activeId);
 });
 text("ss-sys-rc-heading","RC circuit · signal and voltage","RC 회로 · 신호와 전압",true);
 text("ss-sys-rc-topology",isLow?"Low-pass · output across C":"High-pass · output across R",
      isLow?"저역통과 · C 양단 출력":"고역통과 · R 양단 출력",true);
 $("ss-sys-series-label").textContent=isLow?"R = "+fmt(s.Rk,0)+" kΩ":"C = "+fmt(s.Cmicro,0)+" µF";
 $("ss-sys-shunt-label").textContent=isLow?"C = "+fmt(s.Cmicro,0)+" µF":"R = "+fmt(s.Rk,0)+" kΩ";
 $("ss-sys-output-label").textContent=isLow?"v_out = v_C":"v_out = v_R";
 text("ss-sys-direction","signal","신호",true);
 text("ss-sys-source-label","Source","입력원",true);
 $("ss-sys-circuit-title").textContent=tr("RC "+(isLow?"low-pass":"high-pass")+" circuit",
   isLow?"RC 저역통과 회로":"RC 고역통과 회로",true);
 $("ss-sys-circuit-desc").textContent=tr(
  isLow?"Series resistor and grounded capacitor, output measured across the capacitor.":
        "Series capacitor and grounded resistor, output measured across the resistor.",
  isLow?"R을 직렬, C를 접지에 연결하고 C 양단 전압을 출력으로 측정합니다.":
        "C를 직렬, R을 접지에 연결하고 R 양단 전압을 출력으로 측정합니다.");
 $("ss-sys-v-time").textContent=point.t<1?fmt(point.t*1000,1)+" ms":fmt(point.t,3)+" s";
 $("ss-sys-v-in").textContent=fmt(point.x)+" V";
 $("ss-sys-v-out").textContent=fmt(point.y)+" V";
 $("ss-sys-v-r").textContent=fmt(vr)+" V";
 $("ss-sys-v-c").textContent=fmt(vc)+" V";
 const measured=isLow?"C":"R";
 ["R","C"].forEach(part=>{
  const el=$("ss-sys-v-"+part.toLowerCase()).parentElement;
  el.classList.toggle("ss-sys-measured-voltage",part===measured);
 });
 $("ss-sys-voltage-balance").textContent="v_in(t) = v_R(t) + v_C(t)  →  "+
  fmt(point.x)+" V = "+fmt(vr)+" V + "+fmt(vc)+" V";
 const reactanceK=1000/(2*Math.PI*s.frequency*s.Cmicro);
 text("ss-sys-circuit-principle",
  "At f = "+fmt(s.frequency,1)+" Hz, capacitor reactance |Z_C| ≈ "+fmt(reactanceK,2)+" kΩ versus R = "+fmt(s.Rk,0)+" kΩ. "+(isLow?"Output across C: low frequency passes; high frequency is attenuated.":"Output across R: low frequency is attenuated; high frequency passes."),
  "f = "+fmt(s.frequency,1)+" Hz에서 커패시터 리액턴스 |Z_C| ≈ "+fmt(reactanceK,2)+" kΩ이고 R = "+fmt(s.Rk,0)+" kΩ입니다. "+(isLow?"C 양단을 측정하므로 저주파는 통과하고 고주파는 감쇠합니다.":"R 양단을 측정하므로 저주파는 감쇠하고 고주파는 통과합니다."));
 text("ss-sys-circuit-note",
 "The arrow indicates the input-to-output signal path (not electron flow). Voltages use the bottom node as reference. Move the time slider or click the waveform to inspect instantaneous values; the frequency gain/phase refer to sinusoidal steady state.",
 "화살표는 전하 이동이 아닌 입력→출력 신호 경로를 뜻합니다. 모든 전압은 아래 기준 노드에 대한 값입니다. 시간 슬라이더 또는 파형 클릭으로 순간 전압을 확인할 수 있으며, 주파수 이득·위상은 정현파 정상상태 기준입니다.");
}
let walkthroughStep=0,lastKey="",latest=null;
function initMA(){
 $("ss-sys-rc-explorer").hidden=true;
 $("ss-sys-ma-explorer").hidden=false;
 $("ss-sys-ma-back").addEventListener("click",()=>setStep(walkthroughStep-1,true));
 $("ss-sys-ma-next").addEventListener("click",()=>setStep(walkthroughStep+1,true));
 $("ss-sys-ma-show-all").addEventListener("click",()=>setStep(latest?.M+1||0,true));
 $("ss-sys-ma-restart").addEventListener("click",()=>setStep(0,true));
}
function setStep(next,scroll=false){
 if(!latest)return;
 walkthroughStep=clamp(next,0,latest.M+1);
 renderWalkthrough(latest,scroll);
}
function maRender(){
 const s=lab.state,model=core.averageSimulate(s);
 const key=[s.index,s.M,s.shape,s.noise].join(":");
 if(key!==lastKey){walkthroughStep=0;lastKey=key;}
 const windowData=core.averageWindow(model.series,model.M,s.index);
 latest={...windowData,M:model.M,simulated:model.series[windowData.index].y};
 renderWalkthrough(latest,false);
}
function renderWalkthrough(data,scroll){
 const M=data.M,index=data.index,terms=data.terms;
 const atStart=walkthroughStep===0,atEnd=walkthroughStep===M+1;
 const processed=clamp(walkthroughStep,0,M);
 const partial=terms.slice(0,processed).reduce((sum,t)=>sum+t.contribution,0);
 text("ss-sys-ma-heading","Convolution Inspector","컨벌루션 계산 과정",true);
 text("ss-sys-ma-hint",
  "Click the upper waveform to choose n, then follow the M input samples through multiplication and summation.",
  "위 파형에서 n을 클릭한 뒤, M개 표본이 각각 곱해지고 더해지는 과정을 따라가세요.");
 const stageText=atStart?
  tr("1 · Select the window","1 · 평균 구간 선택",true):
  atEnd?tr("Result · verify y[n]","결과 · y[n] 검증",true):
  tr("Tap "+processed+" / "+M,"항 "+processed+" / "+M,true);
 $("ss-sys-ma-counter").textContent=stageText+"   (n = "+index+", M = "+M+")";
 const strip=$("ss-sys-ma-taps");strip.replaceChildren();
 let activeChip=null;
 terms.forEach((term,k)=>{
  const btn=document.createElement("button");
  btn.type="button";btn.className="ss-sys-ma-tap";
  if(term.padded)btn.classList.add("ss-sys-ma-padded");
  if(k<processed)btn.classList.add("ss-sys-ma-done");
  if(k===processed-1&&!atEnd){btn.classList.add("ss-sys-ma-active");activeChip=btn;}
  const a=document.createElement("span"),b=document.createElement("strong"),c=document.createElement("small");
  a.textContent="k = "+k+"  ·  x["+(index-k)+"]";
  b.textContent=fmt(term.x);
  c.textContent=term.padded?tr("zero-padded","0 채움",true):"× 1/"+M;
  btn.append(a,b,c);
  btn.setAttribute("aria-label",tr("Inspect contribution k="+k+" from x["+(index-k)+"]","x["+(index-k)+"] 항 k="+k+"의 계산 확인",true));
  btn.setAttribute("aria-pressed",String(k===processed-1&&!atEnd));
  btn.addEventListener("click",()=>setStep(k+1,true));
  strip.append(btn);
 });
 const equation=$("ss-sys-ma-expression"),accumulator=$("ss-sys-ma-accumulator");
 if(atStart){
  const fallback="y["+index+"] = (x["+index+"] + ⋯ + x["+(index-M+1)+"]) / "+M;
  renderMath(equation,"y["+index+"]=\\frac{1}{"+M+"}\\sum_{k=0}^{"+(M-1)+"}x["+
    index+"-k]",fallback);
  accumulator.textContent=tr("Selected "+M+" samples (causal window). Press Next term to multiply by 1/M.",
    "인과적 평균 구간의 "+M+"개 표본을 선택했습니다. 다음 항을 눌러 1/M을 곱해 보세요.");
 }else if(atEnd){
  renderMath(equation,"y["+index+"]=\\sum_{k=0}^{"+(M-1)+
    "}x["+(index)+"-k]\\cdot\\frac{1}{"+M+"} = "+Number(data.total.toFixed(6)),
    "y["+index+"] = Σ x[n−k]/"+M+" = "+fmt(data.total,6));
  const consistent=Math.abs(data.total-data.simulated)<1e-10;
  accumulator.textContent=tr(
   "All "+M+" weighted terms summed: "+fmt(data.total,6)+". Compared with the FIR output: "+(consistent?"MATCH":"CHECK")+".",
   "가중치를 곱한 "+M+"개 항의 합: "+fmt(data.total,6)+". FIR 출력과 비교: "+(consistent?"일치":"확인 필요")+".");
  accumulator.dataset.verified=String(consistent);
 }else{
  const term=terms[processed-1],k=processed-1;
  renderMath(equation,"x["+(index-k)+"]\\times\\frac{1}{"+M+
   "} = "+Number(term.contribution.toFixed(6)),
   "x["+(index-k)+"] × (1/"+M+") = "+fmt(term.contribution,6));
  accumulator.textContent=tr(
   "Running sum after "+processed+" of "+M+" terms = "+fmt(partial,6)+".",
   M+"개 중 "+processed+"개 항까지 누적합 = "+fmt(partial,6)+".");
 }
 text("ss-sys-ma-back","Previous","이전",true);
 text("ss-sys-ma-next","Next term","다음 항",true);
 text("ss-sys-ma-show-all","Show result","결과 보기",true);
 text("ss-sys-ma-restart","Restart","처음부터",true);
 $("ss-sys-ma-back").disabled=atStart;
 $("ss-sys-ma-next").disabled=atEnd;
 $("ss-sys-ma-show-all").disabled=atEnd;
 $("ss-sys-ma-restart").disabled=atStart;
 text("ss-sys-ma-assumption",
  "Causal FIR: h[k] = 1/M for 0 ≤ k < M. For n < 0 the input is zero-padded. The complete sum uses every term, including those outside the visible plot before n=0.",
  "인과적 FIR: 0 ≤ k < M에서 h[k] = 1/M입니다. n < 0인 표본은 0으로 채웁니다. 전체 합산에는 경계 밖의 0 표본까지 모두 포함합니다.");
 if(scroll&&activeChip)activeChip.scrollIntoView({behavior:"auto",block:"nearest",inline:"nearest"});
}
function onModelUpdate(event){
 if(event?.detail?.kind!==lab.kind)return;
 if(isRC)rcRender();else maRender();
}
if(isRC)initRC();else initMA();
makeTimeChartInteractive();
window.addEventListener("ss:system-render",onModelUpdate);
language?.subscribe?.(()=>{makeLocaleOnly();if(isRC)rcRender();else if(latest)renderWalkthrough(latest,false);});
function makeLocaleOnly(){makeTimeChartInteractiveLocale();}
function makeTimeChartInteractiveLocale(){
 $("ss-sys-canvas-1").setAttribute("aria-label",tr(
  isRC?"Click to inspect instantaneous input/output voltage. Keyboard: left/right arrows.":
       "Click to inspect convolution at one sample. Keyboard: left/right arrows.",
  isRC?"클릭하여 해당 시점의 입력·출력 전압을 살펴보세요. 키보드 좌우 방향키도 사용할 수 있습니다.":
       "표본을 클릭하여 컨벌루션 계산을 확인하세요. 키보드 좌우 방향키도 사용할 수 있습니다."));
}
makeTimeChartInteractiveLocale();
})();
