/* Applications curriculum catalog: six Part A labs, three Part B labs, seven Part C labs, remaining topics planned. */
(()=>{
"use strict";
const sections=["a","b","c","d"];
const topics={
 a:[
  {lab:"harmonics",en:"Harmonics and Musical Sound",ko:"조화파와 악기 음색",kind:"Sound & periodicity",concept:"CTFS · Harmonics · Timbre",questionEn:"Why do instruments playing the same pitch sound different?",questionKo:"같은 음높이인데 악기마다 음색이 다른 이유는?",observeEn:"Fundamental frequency, harmonic amplitudes, time waveform, spectrum, and audio playback.",observeKo:"기본주파수·조화파 크기·시간 파형·스펙트럼·소리 재생",ch:[3,4,6]},
  {lab:"chirp",en:"Chirp Signals and Frequency Sweeps",ko:"처프 신호와 주파수 변화",kind:"Time-varying frequency",concept:"Instantaneous frequency · STFT",questionEn:"How does a rising-frequency chirp differ from a fixed-frequency tone?",questionKo:"주파수가 증가하는 처프는 고정 주파수 정현파와 어떻게 다른가?",observeEn:"Linear/exponential sweep, waveform spacing, and a time-frequency spectrogram.",observeKo:"선형·지수 스윕, 파형 간격 변화, 시간-주파수 스펙트로그램",ch:[1,4,6]},
  {lab:"helix",en:"Complex Exponential and 3D Helix",ko:"복소지수함수와 3D 나선",kind:"Complex signals",concept:"Euler relation · Phasor · e^(σ+jω)t",questionEn:"How does a rotating phasor generate a sine wave?",questionKo:"회전하는 페이저가 어떻게 정현파를 만드는가?",observeEn:"Complex-plane rotation, 3D helix, real/imaginary projections, growth and decay.",observeKo:"복소평면 회전·3D 나선·실수부/허수부 투영·감쇠와 증가",ch:[1,3,5]},
  {lab:"beats",en:"Beats and Interference",ko:"맥놀이와 간섭",kind:"Sound & superposition",concept:"Sum of sinusoids · Envelope",questionEn:"Why can two similar tones produce periodic loudness changes?",questionKo:"주파수가 비슷한 두 음을 동시에 내면 왜 소리 크기가 주기적으로 달라지는가?",observeEn:"Two nearby frequencies, their sum, beat envelope, and audible difference.",observeKo:"가까운 두 주파수·합성 파형·맥놀이 포락선·청각적 차이",ch:[1,3]},
  {lab:"amfm",en:"AM and FM Signal Intuition",ko:"AM·FM 신호의 직관",kind:"Communication signals",concept:"Carrier · Modulation · Spectrum",questionEn:"How can a message be represented by a carrier's amplitude or frequency?",questionKo:"정보를 반송파의 진폭이나 주파수 변화로 어떻게 나타내는가?",observeEn:"Message/carrier signals, AM envelope, FM instantaneous frequency, and spectra.",observeKo:"정보 신호와 반송파·AM 포락선·FM 순간주파수·스펙트럼",ch:[3,4,6]},
  {lab:"sampling",en:"Sampling and Aliasing in Daily Life",ko:"일상 속 표본화와 에일리어싱",kind:"Sampling",concept:"Sampling rate · Aliasing · Reconstruction",questionEn:"Why can a rotating wheel appear to turn backward on video?",questionKo:"영상에서 회전 바퀴가 거꾸로 도는 것처럼 보이는 이유는?",observeEn:"Sine or linear chirp, adjustable sampling rate fₛ, CT waveform, x[n], Nyquist threshold and folded frequency versus time.",observeKo:"정현파·선형 처프 선택, 샘플링 주파수 fₛ 조절, CT 파형·x[n]·나이퀴스트 경계·시간에 따른 접힌 주파수",ch:[1,6,7]}
 ],
 b:[
  {lab:"rc",en:"RC Low-Pass and High-Pass Filters",ko:"RC 저역통과·고역통과 필터",kind:"Circuits",concept:"Time constant · Cutoff · Frequency response",questionEn:"Why does an RC circuit smooth one input but attenuate another?",questionKo:"RC 회로가 어떤 신호는 평활하고 다른 신호는 감쇠시키는 이유는?",observeEn:"R/C values, step response, amplitude/phase response, and input-output waveforms.",observeKo:"R·C 값·계단응답·진폭/위상 응답·입출력 파형",ch:[2,4,5]},
  {lab:"moving-average",en:"Moving-Average and Sensor Smoothing",ko:"이동평균과 센서 평활화",kind:"Digital filtering",concept:"Discrete convolution · FIR · Noise",questionEn:"Why does a longer averaging window reduce rapid fluctuations but add delay?",questionKo:"평균 구간이 길어지면 빠른 변화는 줄지만 응답이 늦어지는 이유는?",observeEn:"Noisy sensor values, window length, impulse response, and output delay.",observeKo:"잡음 센서값·평균 길이·임펄스 응답·출력 지연",ch:[2,6]},
  {lab:"compare",href:"./applications-system-compare.html",en:"RC vs Moving Average: Same Input",ko:"RC와 이동평균: 동일 입력 비교",kind:"Digital filtering",concept:"Cutoff · Smoothing · Noise · Delay",questionEn:"Which filter reduces noise with less delay when bandwidth is matched?",questionKo:"차단주파수가 같다면 어느 필터가 더 적은 지연으로 잡음을 줄일까요?",observeEn:"One sampled input, both outputs, matched −3 dB cutoff, white-noise attenuation and low-frequency delay.",observeKo:"동일한 입력, 두 필터 출력, 일치된 −3 dB 차단주파수, 백색잡음 감소 및 저주파 지연",ch:[2,5,6]},
  {en:"Echo, Delay, and Reverberation",ko:"에코·지연·잔향",kind:"Audio systems",concept:"Impulse response · Delay · Convolution",questionEn:"How can a small number of delayed copies model an echo?",questionKo:"지연된 신호의 합으로 에코를 어떻게 모델링할 수 있는가?",observeEn:"Echo amplitude and delay, input/output waveform, impulse response, and listening comparison.",observeKo:"에코 크기·지연 시간·입출력·임펄스 응답·청각 비교",ch:[1,2,4]},
  {en:"Resonance and Band-Pass Selection",ko:"공진과 대역통과 선택",kind:"Frequency-selective systems",concept:"Resonance · Bandwidth · Poles",questionEn:"Why can a system respond strongly to a narrow range of frequencies?",questionKo:"시스템은 특정 주파수 부근에서 왜 크게 반응하는가?",observeEn:"Excitation frequency, resonance peak, bandwidth, and response magnitude.",observeKo:"여기 주파수·공진 피크·대역폭·응답 크기",ch:[4,5,8]},
  {en:"Transient and Control Responses",ko:"과도응답과 제어 시스템",kind:"Dynamics",concept:"Step response · Settling · Overshoot",questionEn:"Why can a fast-responding system overshoot or oscillate?",questionKo:"빠른 시스템이 목표값을 지나치거나 진동하는 이유는?",observeEn:"Step input, settling behavior, damping, and stability intuition.",observeKo:"계단 입력·정착 과정·감쇠·안정성 직관",ch:[2,5,8]},
  {en:"Image Blur as 2D Convolution",ko:"2차원 컨벌루션과 이미지 흐림",kind:"Spatial systems",concept:"2D kernel · Spatial filtering",questionEn:"How does a local averaging kernel soften sharp image details?",questionKo:"국소 평균 필터가 왜 이미지의 선명한 경계를 흐리게 만드는가?",observeEn:"Image kernel size, original/blurred output, and edge behavior.",observeKo:"필터 커널 크기·원본과 흐림 결과·에지 변화",ch:[2,4]}
 ],

 c:[
  {phase:"foundation",routeIndex:1,lab:"fft-foundations",href:"./applications-fft-lab.html",en:"FFT from Sample Data",ko:"샘플 데이터 FFT",descEn:"Find frequencies in samples",descKo:"표본에서 주파수 성분 찾기"},
  {phase:"foundation",routeIndex:2,lab:"fft-resolution",href:"./applications-fft-resolution.html",en:"Frequency Bins & Resolution",ko:"주파수 Bin과 분해능",descEn:"Hz · leakage · windows · zero-padding",descKo:"Hz·누설·창 함수·Zero-padding"},
  {phase:"foundation",routeIndex:3,lab:"dft-fft",href:"./applications-dft-fft.html",en:"DFT vs FFT",ko:"DFT와 FFT",descEn:"Same result · butterfly · speed",descKo:"동일한 결과·버터플라이·속도"},
  {phase:"discovery",routeIndex:4,lab:"dtmf-decoder",href:"./applications-fft-dtmf.html",en:"DTMF Decoder",ko:"DTMF 해독",descEn:"Decode a hidden telephone key",descKo:"FFT로 전화번호 해독"},
  {phase:"discovery",routeIndex:5,lab:"sound-fingerprint",href:"./applications-fft-sound-fingerprint.html",en:"Sound Fingerprint",ko:"소리의 주파수 지문",descEn:"Recognize sounds from harmonics",descKo:"고조파로 소리 구별하기"},
  {phase:"discovery",routeIndex:6,lab:"fft-upload",href:"./applications-fft-upload.html",en:"Real Audio & Sensor FFT",ko:"실제 음성·센서 FFT",descEn:"Analyze a recording or sensor signal",descKo:"실제 음성·센서 데이터 분석"},
  {phase:"extension",routeIndex:7,optional:true,lab:"chirp-stft",href:"./applications-chirp-stft.html",en:"Chirp & STFT",ko:"Chirp·STFT",descEn:"See when frequency changes",descKo:"주파수가 변하는 시점 확인"},
  {phase:"planned",en:"Magnitude, Phase and Reconstruction",ko:"크기·위상·복원"},
  {phase:"planned",en:"FFT-Based Convolution",ko:"FFT 기반 컨벌루션"},
  {phase:"planned",en:"2D FFT of Images",ko:"이미지의 2D FFT"},
  {phase:"planned",en:"Video Temporal FFT and Flicker",ko:"동영상 시간 FFT와 깜빡임"}
 ],

 d:[
  {en:"Audio Equalizer and Speech Filtering",ko:"오디오 이퀄라이저와 음성 필터",kind:"Audio",concept:"Signal spectrum · H(f) · Filtering",questionEn:"What happens to both the waveform and sound when frequency bands are attenuated?",questionKo:"특정 주파수 대역을 감쇠시키면 파형과 소리는 어떻게 달라지는가?",observeEn:"Input/filtered audio, gain curve, waveform, spectrum, and listening comparison.",observeKo:"입력·필터된 소리·이득 곡선·파형·스펙트럼·청각 비교",ch:[2,3,4,6]},
  {en:"Wearable and IoT Sensor Denoising",ko:"웨어러블·IoT 센서 잡음 제거",kind:"Sensors & IoT",concept:"Noise · Smoothing · Delay",questionEn:"How can a sensor trend be recovered while preserving meaningful changes?",questionKo:"필요한 변화는 유지하면서 센서의 추세를 어떻게 추출할 수 있는가?",observeEn:"Synthetic sensor trace, moving-average or RC-like smoothing, and response lag.",observeKo:"합성 센서 파형·이동평균 및 RC 평활화·응답 지연",ch:[1,2,6]},
  {en:"Radar and Sonar Chirp Echoes",ko:"레이더·소나의 처프 반사",kind:"Radar & Sonar",concept:"Chirp · Delay · Correlation",questionEn:"How can a delayed echo help estimate the distance to an object?",questionKo:"지연된 반사파로 물체까지의 거리를 어떻게 추정하는가?",observeEn:"Transmit/receive chirps, propagation delay, correlation peak, and distance model.",observeKo:"송신·수신 처프·전파 지연·상관 피크·거리 모델",ch:[1,2,4,6]},
  {en:"Biomedical Waveforms and Filtering",ko:"생체 신호와 필터링",kind:"Biomedical",concept:"ECG-like signal · Drift · Filtering",questionEn:"How can filtering suppress baseline drift without distorting useful features?",questionKo:"유용한 파형 특징을 왜곡하지 않고 기저선 변동을 어떻게 줄이는가?",observeEn:"Synthetic ECG-like data, baseline drift, selected filters, and preserved features.",observeKo:"합성 ECG 유사 신호·기저선 변동·필터·유지되는 특징",ch:[1,2,4,6]},
  {en:"Camera Image Enhancement",ko:"카메라 이미지 개선",kind:"Image & Vision",concept:"2D convolution · Frequency filters · Edges",questionEn:"How do image blur and sharpening correspond to different spatial-frequency responses?",questionKo:"이미지 흐림과 선명화는 어떤 공간주파수 응답의 차이인가?",observeEn:"Image, filter mask, 2D spectrum, reconstruction, and edge details.",observeKo:"이미지·필터 마스크·2D 스펙트럼·복원·에지 세부 정보",ch:[2,4,6]},
  {en:"Communication and Modulation Spectra",ko:"통신 변조와 스펙트럼",kind:"Communications",concept:"Carrier · AM/FM · Bandwidth",questionEn:"How does modulation change the signal's frequency content?",questionKo:"변조는 신호의 주파수 성분을 어떻게 변화시키는가?",observeEn:"Message and modulated signal, spectral occupancy, and filter behavior.",observeKo:"정보 신호와 변조 신호·주파수 대역 점유·필터 동작",ch:[3,4,6]}
 ]
};
function node(tag,className,content){
 const el=document.createElement(tag);if(className)el.className=className;
 if(content!=null)el.textContent=content;return el;
}
const language=window.ELSLanguage;
const mode=()=>language?.get?.()||"mixed";
function i18n(en,ko,compact=false){
 const m=mode();
 return m==="en"?en:m==="ko"?ko:compact?en+" · "+ko:en+"\n"+ko;
}
function localizeStatic(){
 document.querySelectorAll("[data-en][data-ko]").forEach(el=>{
  const compact=el.tagName==="A"||el.tagName==="H2";
  el.textContent=i18n(el.dataset.en,el.dataset.ko,compact);
 });
 document.documentElement.lang=mode()==="ko"?"ko":"en";
 document.title=i18n("Applications · Signals & Systems","응용 · 신호및시스템",true)+" | Engineering Learning Studio";
}
/* Part C: direct-access lesson rows. Detailed questions stay inside each lab. */
const partCTitles={
 foundation:["FFT Fundamentals","FFT 핵심 기초"],
 discovery:["FFT Discovery","FFT 발견 실습"],
 extension:["Optional Extension","선택 확장"]
};
function renderFFTCompact(host,data){
 const category=(type)=>{
  const group=node("section","ss-app-lesson-group");
  group.dataset.fftPhase=type;
  const title=node("h3","ss-app-lesson-group-title",i18n(...partCTitles[type],true));
  group.append(title);
  const items=node("div","ss-app-lesson-list");
  for(const x of data.filter(y=>y.phase===type)){
   const n=x.routeIndex,names=[x.en,x.ko,x.descEn,x.descKo];
   const a=node("a","ss-app-lesson-row");
   a.dataset.learningStep=String(n);
   a.href=x.href;
   a.setAttribute("aria-label",i18n("Open lesson "+n+": "+names[0],"실습 "+n+" 열기: "+names[1],true));
   a.append(node("span","ss-app-lesson-number",String(n).padStart(2,"0")));
   const heading=node("span","ss-app-lesson-copy");
   heading.append(node("strong","ss-app-lesson-title",i18n(names[0],names[1],true)));
   heading.append(node("span","ss-app-lesson-desc",i18n(names[2],names[3],true)));
   a.append(heading,node("span","ss-app-lesson-arrow","›"));
   items.append(a);
  }
  group.append(items);return group;
 };
 host.append(category("foundation"),category("discovery"),category("extension"));
 const future=data.filter(x=>x.phase==="planned"),box=node("details","ss-app-future");
 const summary=node("summary",null,i18n("Future Modules","개발 예정 모듈",true)+" · "+future.length);
 box.append(summary);
 const futureList=node("ul","ss-app-future-list");
 for(const x of future){const li=node("li",null,i18n(x.en,x.ko,true));futureList.append(li);}
 box.append(futureList);host.append(box);
}
/* Applications A, B and D use the same concise card language as FFT Part C.
   Only real Part A labs are links; B/D preserve curriculum notes as disclosures. */
const kindKo={"Sound & periodicity":"소리와 주기성","Time-varying frequency":"시간가변 주파수","Complex signals":"복소 신호","Sound & superposition":"소리와 중첩","Communication signals":"통신 신호","Sampling":"표본화","Circuits":"회로","Digital filtering":"디지털 필터링","Audio systems":"오디오 시스템","Frequency-selective systems":"주파수 선택 시스템","Dynamics":"동적 시스템","Spatial systems":"공간 시스템","Audio":"오디오","Sensors & IoT":"센서와 IoT","Radar & Sonar":"레이더와 소나","Biomedical":"바이오메디컬","Image & Vision":"이미지와 비전","Communications":"통신"};
function moduleNumber(i){
 return String(i+1).padStart(2,"0");
}
function renderSignalLabs(host,data){
 const list=node("div","ss-app-lesson-list ss-app-abd-lab-list");
 data.forEach((x,i)=>{
  const row=node("a","ss-app-lesson-row ss-app-abd-lab-row");
  row.href="./applications-lab.html?lab="+encodeURIComponent(x.lab);
  row.dataset.lab=x.lab;
  row.setAttribute("aria-label",i18n("Open signal lab "+(i+1)+": "+x.en,"신호 실습 "+(i+1)+" 열기: "+x.ko,true));
  row.append(node("span","ss-app-lesson-number",moduleNumber(i)));
  const copy=node("span","ss-app-lesson-copy");
  copy.append(node("strong","ss-app-lesson-title",i18n(x.en,x.ko,true)));
  copy.append(node("span","ss-app-lesson-desc",x.concept));
  row.append(copy,node("span","ss-app-lesson-arrow","›"));
  list.append(row);
 });
 host.append(list);
}
function renderSystemsModules(host,data){
 const ready=data.filter(x=>!!x.lab),future=data.filter(x=>!x.lab);
 const list=node("div","ss-app-lesson-list ss-app-abd-lab-list");
 ready.forEach((x,i)=>{
  const a=node("a","ss-app-lesson-row ss-app-abd-lab-row");
  a.href=x.href||"./applications-system-lab.html?lab="+encodeURIComponent(x.lab);
  a.dataset.lab=x.lab;
  a.setAttribute("aria-label",i18n("Open interactive system lab "+(i+1)+": "+x.en,"시스템 실습 "+(i+1)+" 열기: "+x.ko,true));
  a.append(node("span","ss-app-lesson-number",moduleNumber(i)));
  const copy=node("span","ss-app-lesson-copy");
  copy.append(node("strong","ss-app-lesson-title",i18n(x.en,x.ko,true)),node("span","ss-app-lesson-desc",x.concept));
  a.append(copy,node("span","ss-app-lesson-arrow","›"));list.append(a);
 });
 host.append(list);
 if(future.length){
  const details=node("details","ss-app-future");
  details.append(node("summary",null,i18n("Future Modules","개발 예정 모듈",true)+" · "+future.length));
  const section=node("div","ss-app-future-topics");
  renderPlannedModules(section,future,"b");
  details.append(section);host.append(details);
 }
}
function renderPlannedModules(host,data,part){
 const list=node("div","ss-app-abd-planned-list");
 data.forEach((x,i)=>{
  const card=node("details","ss-app-abd-planned");
  card.dataset.area=part;card.dataset.topic=String(i+1);
  const summary=node("summary","ss-app-abd-planned-summary");
  summary.append(node("span","ss-app-lesson-number",moduleNumber(i)));
  const copy=node("span","ss-app-lesson-copy");
  copy.append(node("strong","ss-app-lesson-title",i18n(x.en,x.ko,true)));
  copy.append(node("span","ss-app-lesson-desc",x.concept));
  summary.append(copy,node("span","ss-app-abd-planned-tag",i18n("Planned","개발 예정",true)));
  const expansion=node("span","ss-app-abd-disclosure","⌄");expansion.setAttribute("aria-hidden","true");summary.append(expansion);
  card.append(summary);
  const details=node("div","ss-app-abd-planned-body");
  details.append(node("p","ss-app-abd-question",i18n("Question: "+x.questionEn,"핵심 질문: "+x.questionKo)));
  details.append(node("p","ss-app-abd-observe",i18n("Planned exploration: "+x.observeEn,"예정 실습: "+x.observeKo)));
  const chapters=node("div","ss-app-topic-labs",i18n("Related chapters","연결되는 Chapter",true)+": ");
  x.ch.forEach(n=>{const link=node("a",null,"Ch "+n);link.href="./chapter"+n+".html";link.title="Open Chapter "+n;chapters.append(link);});
  details.append(chapters);card.append(details);list.append(card);
 });
 host.append(list);
}
function renderTopics(){
 sections.forEach(part=>{
  const host=document.getElementById("topics-"+part),data=topics[part];
  if(!host)return;
  host.replaceChildren();
  if(part==="c"){
   document.getElementById("part-c-count").textContent=i18n("6 core labs + 1 optional","핵심 6개 + 선택 1개",true);
   renderFFTCompact(host,data);return;
  }
  if(part==="a"){
   document.getElementById("part-a-count").textContent=i18n("6 interactive labs","인터랙티브 실습 6개",true);
   renderSignalLabs(host,data);return;
  }
  if(part==="b"){
   document.getElementById("part-b-count").textContent=i18n("3 interactive labs + 4 planned","인터랙티브 실습 3개 + 예정 4개",true);
   renderSystemsModules(host,data);return;
  }
  document.getElementById("part-"+part+"-count").textContent=data.length+" "+i18n("planned topics","개발 예정 주제",true);
  renderPlannedModules(host,data,part);
 });
}
function selectedPart(){
 const m=/^#part-([a-d])$/.exec(location.hash);
 return m?m[1]:"a";
}
function updateNavigation(){
 const part=selectedPart(),idx=sections.indexOf(part);
 document.querySelectorAll("[data-part-link]").forEach(el=>{
  if(el.dataset.partLink===part)el.setAttribute("aria-current","location");else el.removeAttribute("aria-current");
 });
 const prev=document.getElementById("ss-app-prev"),next=document.getElementById("ss-app-next");
 prev.disabled=idx<=0;next.disabled=idx===sections.length-1;
 prev.setAttribute("aria-disabled",String(prev.disabled));next.setAttribute("aria-disabled",String(next.disabled));
}
function move(delta){
 const index=sections.indexOf(selectedPart());
 const target=sections[index+delta];
 if(target)location.hash="part-"+target;
}
function init(){
 // Language selection is bound once by the shared chapter header controller.
 language?.subscribe?.(()=>{localizeStatic();renderTopics();updateNavigation()});
 localizeStatic();renderTopics();updateNavigation();
 document.getElementById("ss-app-prev").addEventListener("click",()=>move(-1));
 document.getElementById("ss-app-next").addEventListener("click",()=>move(1));
 window.addEventListener("hashchange",updateNavigation);
 document.querySelectorAll('a[href^="#part-"]').forEach(a=>a.addEventListener("click",()=>{const menu=document.querySelector(".ss-common-menu");if(menu)menu.open=false}));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
