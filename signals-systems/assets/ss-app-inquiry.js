/* Part A inquiry-first learning controls: shared pedagogy, lab-specific physics.
 * Replaces passive "try this" lists. The synthesis, plots and audio stay owned by
 * the existing Part A lab modules.
 */
(function(W){
"use strict";
const store=Object.create(null);
const specs={
 harmonics:{
  question:["At the same fundamental frequency, what changes when more harmonics appear?","기본주파수가 같을 때 고조파가 더해지면 무엇이 달라질까요?"],
  choices:[["The main pitch must double","주된 음높이가 반드시 2배가 됩니다"],["The timbre can change while the pitch stays the same","음높이는 유지되지만 음색이 달라질 수 있습니다"]],
  answer:1,scenarios:[
   {en:"A · Pure tone",ko:"A · 단일 정현파",patch:{f0:220,n:7,preset:"sine"}},
   {en:"B · Harmonic-rich",ko:"B · 고조파가 풍부한 신호",patch:{f0:220,n:7,preset:"square"}}
  ],
  transfer:["If f₀ doubles while relative harmonic weights stay fixed, what chiefly changes?","조화파의 상대 크기를 유지하고 f₀만 2배로 높이면 무엇이 주로 달라질까요?"],
  transferChoices:[["Fundamental pitch rises by one octave","기본주파수가 2배가 되어 음높이가 한 옥타브 상승합니다"],["The sound must lose all upper harmonics","모든 고조파가 반드시 사라집니다"]],transferAnswer:0,
  reason:["A pure sine has only its fundamental. A harmonically rich signal has additional lines at integer multiples of f₀, so pitch can stay at 220 Hz while the spectrum and timbre change. This model uses synthetic sounds.","단일 정현파에는 기본주파수 성분만 있습니다. 고조파가 풍부한 신호에는 f₀의 정수배 성분이 추가되므로 220Hz 음높이를 유지하면서 스펙트럼과 음색이 달라집니다. 여기서는 합성음을 사용합니다."],
  evidence:s=>{
   const active=s.preset==="sine"?1:s.preset==="square"?Math.ceil(s.n/2):s.n;
   return ["f₀ = "+s.f0+" Hz · "+active+" nonzero harmonic "+(active===1?"line":"lines")+" (model preset)",
           "f₀ = "+s.f0+" Hz · 비영 고조파 성분 "+active+"개 (모델 프리셋)"];
  }
 },
 beats:{
  question:["If the difference between two nearby tones grows from 2 to 8 Hz, what happens to the beat rate?","두 주파수 차이가 2Hz에서 8Hz로 증가하면 맥놀이 속도는 어떻게 달라질까요?"],
  choices:[["The beat becomes four times faster","맥놀이가 4배 빨라집니다"],["The beat becomes four times slower","맥놀이가 4배 느려집니다"]],answer:0,
  scenarios:[
   {en:"A · Δf = 2 Hz",ko:"A · Δf = 2 Hz",patch:{f1:220,delta:2,ratio:1}},
   {en:"B · Δf = 8 Hz",ko:"B · Δf = 8 Hz",patch:{f1:220,delta:8,ratio:1}}
  ],
  transfer:["If both sinusoids have exactly the same frequency, will a periodic beat remain?","두 정현파의 주파수가 정확히 같다면 주기적인 맥놀이가 계속 발생할까요?"],
  transferChoices:[["Yes, faster beating","예, 더 빠른 맥놀이가 생깁니다"],["No, there is no slow beating envelope","아니요, 느린 맥놀이 포락선이 없습니다"]],transferAnswer:1,
  reason:["For two tones, the beat frequency is |f₂−f₁|. Changing Δf changes how often the phase alignment repeats; lowering the second amplitude changes beat depth, not its rate. This is linear superposition, not AM modulation.","두 성분의 맥놀이 주파수는 |f₂−f₁|입니다. Δf가 변하면 위상이 다시 일치하는 속도가 바뀝니다. 두 번째 진폭을 줄이면 맥놀이 깊이가 바뀌지만 주파수는 바뀌지 않습니다. 비선형 AM 변조가 아니라 선형 중첩입니다."],
  evidence:s=>s.delta>0?["f₁ = "+s.f1+" Hz · f₂ = "+(s.f1+s.delta)+" Hz · beat = "+s.delta+" Hz · Tbeat = "+(1/s.delta).toFixed(3)+" s",
  "f₁ = "+s.f1+" Hz · f₂ = "+(s.f1+s.delta)+" Hz · 맥놀이 = "+s.delta+" Hz · 주기 = "+(1/s.delta).toFixed(3)+" s"]:
  ["Δf = 0: no periodic loudness beating","Δf = 0: 주기적인 음량 맥놀이가 없습니다"]
 },
 sampling:{
  question:["A 1,500 Hz sine is sampled at fs = 2,000 Hz. What nonnegative apparent frequency will the samples show?","1,500Hz 정현파를 fs = 2,000Hz로 표본화하면 표본에서 관찰되는 양의 겉보기 주파수는?"],
  choices:[["1,500 Hz — the original frequency","1,500Hz — 원래 입력 주파수"],["500 Hz — an aliased frequency","500Hz — 에일리어싱된 주파수"]],answer:1,
  scenarios:[
   {en:"A · fs = 4 kHz",ko:"A · fs = 4 kHz",patch:{kind:"sine",tone:1500,fs:4000,windowMs:"auto",aliasGuide:"on"}},
   {en:"B · fs = 2 kHz",ko:"B · fs = 2 kHz",patch:{kind:"sine",tone:1500,fs:2000,windowMs:"auto",aliasGuide:"on"}}
  ],
  transfer:["With the same 1,500 Hz sine but fs = 4,000 Hz, is the tone below Nyquist?","같은 1,500Hz 입력을 fs = 4,000Hz로 표본화하면 나이퀴스트보다 낮을까요?"],
  transferChoices:[["Yes: 1,500 Hz < 2,000 Hz","예: 1,500Hz < 2,000Hz"],["No: it must alias to 500 Hz","아니요: 반드시 500Hz로 접힙니다"]],transferAnswer:0,
  reason:["At fs=2 kHz, f₀=1.5 kHz is above Nyquist (1 kHz) and corresponds to a signed −500 Hz alias. Its magnitude spectrum shows 500 Hz; sign/phase matters when comparing exact sample sequences. Increasing fs to 4 kHz puts the original 1.5 kHz below Nyquist.","fs=2kHz일 때 f₀=1.5kHz는 나이퀴스트(1kHz)를 넘고 부호 있는 에일리어스는 −500Hz입니다. 크기 스펙트럼에는 500Hz로 표시되지만 표본열의 부호·위상도 중요합니다. fs를 4kHz로 높이면 원 신호 1.5kHz가 나이퀴스트 아래에 놓입니다."],
  evidence:s=>{
   if(s.kind!=="sine")return ["Chirp selected: the apparent frequency changes with time; use Sine for this fixed-tone comparison.","처프 선택: 겉보기 주파수가 시간에 따라 달라집니다. 고정 주파수 비교에는 정현파를 선택하세요."];
   const signed=s.tone-s.fs*Math.round(s.tone/s.fs),nyquist=s.fs/2;
   return ["f₀ = "+s.tone+" Hz · fs/2 = "+nyquist+" Hz · signed alias = "+signed+" Hz · |alias| = "+Math.abs(signed)+" Hz",
   "f₀ = "+s.tone+" Hz · fs/2 = "+nyquist+" Hz · 부호 있는 에일리어스 = "+signed+" Hz · |에일리어스| = "+Math.abs(signed)+" Hz"];
  }
 },
 chirp:{
  question:["With the same starting frequency and duration, what happens halfway through a chirp if its ending frequency increases?","시작 주파수와 스윕 시간을 고정하고 끝 주파수를 높이면 중간 지점의 순간주파수는 어떻게 될까요?"],
  choices:[["The halfway frequency increases","중간 지점의 주파수가 증가합니다"],["It is unaffected by the ending frequency","끝 주파수와 관계없이 일정합니다"]],answer:0,
  scenarios:[
   {en:"A · End at 900 Hz",ko:"A · 끝 900 Hz",patch:{f0:220,f1:900,T:2,window:512,pos:50}},
   {en:"B · End at 1800 Hz",ko:"B · 끝 1800 Hz",patch:{f0:220,f1:1800,T:2,window:512,pos:50}}
  ],
  transfer:["Keeping the start and end frequencies fixed, what happens to sweep rate if duration T doubles?","시작·끝 주파수를 유지하면서 스윕 시간 T를 두 배로 늘리면 주파수 변화율은 어떻게 될까요?"],
  transferChoices:[["The sweep rate is halved","주파수 변화율이 절반이 됩니다"],["The sweep rate doubles","주파수 변화율이 두 배가 됩니다"]],transferAnswer:0,
  reason:["For a linear chirp, f(t)=f₀+(f₁−f₀)t/T. At the same relative time, a higher f₁ raises instantaneous frequency; doubling T halves the rate (f₁−f₀)/T. The spectrogram is an FFT-based preview, not a second signal.","선형 처프의 순간주파수는 f(t)=f₀+(f₁−f₀)t/T입니다. 동일한 상대 시각에서 f₁이 높으면 순간주파수도 증가하고 T를 두 배로 하면 변화율은 절반이 됩니다. 스펙트로그램은 같은 신호의 FFT 기반 미리보기입니다."],
  evidence:s=>{
   const time=s.T*s.pos/100,f=s.f0+(s.f1-s.f0)*s.pos/100,rate=(s.f1-s.f0)/s.T;
   return ["t = "+time.toFixed(2)+" s · f(t) = "+f.toFixed(1)+" Hz · df/dt = "+rate.toFixed(1)+" Hz/s",
    "t = "+time.toFixed(2)+"초 · f(t) = "+f.toFixed(1)+" Hz · 주파수 변화율 = "+rate.toFixed(1)+" Hz/s"];
  }
 },
 helix:{
  question:["At t>0, if σ changes from negative to positive while f stays fixed, what happens to the helix radius?","t>0에서 회전 주파수 f를 고정하고 σ를 음수에서 양수로 바꾸면 나선의 반지름은 어떻게 될까요?"],
  choices:[["It changes from decay to growth","감쇠에서 증가로 바뀝니다"],["Only the rotation speed changes","회전 속도만 바뀝니다"]],answer:0,
  scenarios:[
   {en:"A · σ = −0.4 s⁻¹",ko:"A · 감쇠 σ=−0.4",patch:{f:1.5,sigma:-.4,pos:70,playing:false}},
   {en:"B · σ = +0.4 s⁻¹",ko:"B · 증가 σ=+0.4",patch:{f:1.5,sigma:.4,pos:70,playing:false}}
  ],
  transfer:["If rotation frequency f doubles while σ stays fixed, which quantity remains unchanged at a given time?","σ를 고정하고 회전 주파수 f만 두 배로 하면 같은 시각에서 무엇이 변하지 않을까요?"],
  transferChoices:[["Magnitude |x(t)|","신호 크기 |x(t)|"],["Number of turns per second","초당 회전 횟수"]],transferAnswer:0,
  reason:["x(t)=e^{(σ+j2πf)t}. Its magnitude is e^{σt}; frequency f controls angular rotation. At t=0 all cases have magnitude 1. Compare the selected positive time in the phasor, helix and real/imaginary plots.","x(t)=e^{(σ+j2πf)t}에서 크기는 e^{σt}, 회전 속도는 f가 결정합니다. t=0에서는 모두 크기가 1이므로, 양의 선택 시각에서 나선·페이저·실수부/허수부를 함께 비교하세요."],
  evidence:s=>{
   const t=3*s.pos/100,mag=Math.exp(s.sigma*t),turns=s.f*t;
   return ["t = "+t.toFixed(2)+" s · |x(t)| = e^("+s.sigma.toFixed(2)+"·"+t.toFixed(2)+") = "+mag.toFixed(3)+" · turns = "+turns.toFixed(2),
    "t = "+t.toFixed(2)+"초 · |x(t)| = "+mag.toFixed(3)+" · 회전 수 = "+turns.toFixed(2)];
  }
 },
 amfm:{
  question:["With the carrier and message frequencies fixed, which modulation keeps its ideal envelope constant while varying instantaneous frequency?","반송파·정보 신호 주파수를 고정했을 때 포락선의 크기는 일정하고 순간주파수가 변하는 방식은 무엇일까요?"],
  choices:[["AM — amplitude modulation","AM — 진폭 변조"],["FM — frequency modulation","FM — 주파수 변조"]],answer:1,
  scenarios:[
   {en:"A · AM envelope",ko:"A · AM 포락선",patch:{mode:"am",fc:440,fm:8,depth:.65,beta:2.5}},
   {en:"B · FM frequency",ko:"B · FM 순간주파수",patch:{mode:"fm",fc:440,fm:8,depth:.65,beta:2.5}}
  ],
  transfer:["For FM, if β doubles at the same message frequency fₘ, how does maximum frequency deviation change?","FM에서 정보 신호 주파수 fₘ을 유지하고 β를 두 배로 하면 최대 주파수 편이는 어떻게 변할까요?"],
  transferChoices:[["It doubles (Δf=βfₘ)","두 배가 됩니다(Δf=βfₘ)"],["It stays unchanged","변하지 않습니다"]],transferAnswer:0,
  reason:["AM changes envelope amplitude: 1±m. FM keeps ideal amplitude constant while its instantaneous frequency varies between f꜀−βfₘ and f꜀+βfₘ. Compare waveform shape and sidebands for the same carrier/message frequencies.","AM은 포락선의 진폭을 1±m으로 바꿉니다. 이상적인 FM의 진폭은 일정하고 순간주파수는 f꜀−βfₘ부터 f꜀+βfₘ까지 변합니다. 같은 반송파·정보 신호 주파수에서 파형과 측대역을 비교하세요."],
  evidence:s=>s.mode==="fm"?
   ["FM · f꜀ = "+s.fc+" Hz · Δf = βfₘ = "+(s.beta*s.fm).toFixed(1)+" Hz · envelope = 1",
    "FM · 반송파 "+s.fc+" Hz · 최대 주파수 편이 = "+(s.beta*s.fm).toFixed(1)+" Hz · 포락선 = 1"]:
   ["AM · f꜀ = "+s.fc+" Hz · envelope range = "+(1-s.depth).toFixed(2)+" … "+(1+s.depth).toFixed(2),
    "AM · 반송파 "+s.fc+" Hz · 포락선 범위 = "+(1-s.depth).toFixed(2)+" … "+(1+s.depth).toFixed(2)]
 }

};
function session(lab){return store[lab]||(store[lab]={predict:"",transfer:"",seen:new Set(),checked:false,choice:""});}
function text(pair){const m=W.ELSLanguage?.get?.()||"mixed";return m==="en"?pair[0]:m==="ko"?pair[1]:pair[0]+"\n"+pair[1]}
function element(tag,cls,content,parent){
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(content!==undefined&&content!==null)node.textContent=content;
 if(parent)parent.append(node);
 return node;
}
function choice(group,options,selected,root,update){
 const select=element("select","ss-inquiry-select",null,root);select.setAttribute("aria-label",text(group));
 const placeholder=element("option",null,text(["Select your prediction","예측 선택"]),select);placeholder.value="";
 options.forEach((pair,i)=>{const option=element("option",null,text(pair),select);option.value=String(i);});
 select.value=selected;select.addEventListener("change",()=>update(select.value));
 return select;
}
function refresh(lab,state){
 const spec=specs[lab],s=session(lab),root=document.querySelector("#ss-al-guidance[data-inquiry='"+lab+"']");
 if(!spec||!root)return;
 const evidence=root.querySelector("[data-inquiry-evidence]");
 if(evidence)evidence.textContent=text(spec.evidence(state));
 const seen=root.querySelector("[data-inquiry-progress]");
 if(seen)seen.textContent=text(["Scenarios observed: "+s.seen.size+" / 2","관찰한 조건: "+s.seen.size+" / 2"]);
 root.querySelectorAll("[data-scenario]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.scenario===String(Number(s.choice)+1)&&s.choice!=="")));
}
function renderSignal({lab,state,host,apply}){
 const spec=specs[lab];if(!spec)return false;
 const s=session(lab);host.replaceChildren();host.dataset.inquiry=lab;host.classList.add("ss-inquiry");
 element("div","ss-inquiry-kicker",text(["QUESTION → EVIDENCE → EXPLANATION","질문 → 근거 → 설명"]),host);
 element("h3","ss-inquiry-question",text(spec.question),host);
 const predict=element("div","ss-inquiry-field",null,host);
 element("label","ss-inquiry-label",text(["01 · Predict before changing settings","01 · 변수를 바꾸기 전에 예측"]),predict);
 choice(["Prediction","예측"],spec.choices,s.predict,predict,value=>{s.predict=value;s.checked=false;});
 const actions=element("div","ss-inquiry-experiment",null,host);
 element("span","ss-inquiry-label",text(["02 · Compare two controlled experiments","02 · 다른 변수는 고정하고 두 조건 비교"]),actions);
 const buttons=element("div","ss-inquiry-presets",null,actions);
 for(let i=0;i<2;i++){
  const ex=spec.scenarios[i],button=element("button",null,text([ex.en,ex.ko]),buttons);
  button.type="button";button.dataset.scenario=String(i+1);
  button.setAttribute("aria-pressed",String(s.choice===String(i)));
  button.addEventListener("click",()=>{
   s.choice=String(i);s.seen.add(i);s.checked=false;
   apply({...ex.patch});
   refresh(lab,state);
  });
 }
 const observed=element("div","ss-inquiry-observed",null,host);
 const caption=element("span","ss-inquiry-label",text(["What the plots can verify","그래프에서 검증할 수 있는 근거"]),observed);
 caption.dataset.inquiryCaption="true";
 const evidence=element("output","ss-inquiry-evidence","",observed);evidence.dataset.inquiryEvidence="";
 const progress=element("span","ss-inquiry-progress","",observed);progress.dataset.inquiryProgress="";
 const application=element("div","ss-inquiry-field",null,host);
 element("label","ss-inquiry-label",text(["03 · Apply the same reasoning to a new condition","03 · 새로운 조건에 원리를 적용"]),application);
 element("p","ss-inquiry-transfer",text(spec.transfer),application);
 choice(["Transfer prediction","응용 예측"],spec.transferChoices,s.transfer,application,value=>{s.transfer=value;s.checked=false;});
 const verify=element("button","ss-inquiry-verify",text(["Explain using evidence","근거로 설명 확인"]),host);
 verify.type="button";
 const feedback=element("p","ss-inquiry-feedback",null,host);
 feedback.setAttribute("role","status");feedback.setAttribute("aria-live","polite");
 verify.addEventListener("click",()=>{
  if(s.predict===""||s.transfer===""){
   feedback.textContent=text(["Choose both a prediction and a transfer answer.","기본 예측과 응용 예측을 모두 선택하세요."]);
   feedback.dataset.result="pending";return;
  }
  if(s.seen.size<2){
   feedback.textContent=text(["Observe both A and B on the graphs before explaining.","설명하기 전에 A와 B를 모두 그래프에서 관찰하세요."]);
   feedback.dataset.result="pending";return;
  }
  const correct=Number(s.predict)===spec.answer&&Number(s.transfer)===spec.transferAnswer;
  feedback.dataset.result=correct?"correct":"retry";
  feedback.textContent=correct?text(["Evidence supports your prediction. ","그래프와 계산 근거가 예측을 뒷받침합니다. "])+text(spec.reason):
   text(["Recheck the key quantity shown above. Compare A and B, then revise your reasoning.","위에 표시된 핵심 수치를 확인하세요. A와 B를 비교한 뒤 예측을 수정하세요."]);
  s.checked=correct;
 });
 refresh(lab,state);
 return true;
}
function reset(lab){delete store[lab];}
W.SSApplicationsInquiry=Object.freeze({renderSignal,refresh,reset,covered:Object.freeze(Object.keys(specs))});
})(window);
