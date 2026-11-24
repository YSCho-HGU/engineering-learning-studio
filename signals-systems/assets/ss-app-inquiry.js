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
W.SSApplicationsInquiry=Object.freeze({renderSignal,refresh,reset});
})(window);
