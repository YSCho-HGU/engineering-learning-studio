/* Applications curriculum catalog. All six Part A topics launch working signal labs; Parts B-D remain planned. */
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
  {en:"RC Low-Pass and High-Pass Filters",ko:"RC 저역통과·고역통과 필터",kind:"Circuits",concept:"Time constant · Cutoff · Frequency response",questionEn:"Why does an RC circuit smooth one input but attenuate another?",questionKo:"RC 회로가 어떤 신호는 평활하고 다른 신호는 감쇠시키는 이유는?",observeEn:"R/C values, step response, amplitude/phase response, and input-output waveforms.",observeKo:"R·C 값·계단응답·진폭/위상 응답·입출력 파형",ch:[2,4,5]},
  {en:"Moving-Average and Sensor Smoothing",ko:"이동평균과 센서 평활화",kind:"Digital filtering",concept:"Discrete convolution · FIR · Noise",questionEn:"Why does a longer averaging window reduce rapid fluctuations but add delay?",questionKo:"평균 구간이 길어지면 빠른 변화는 줄지만 응답이 늦어지는 이유는?",observeEn:"Noisy sensor values, window length, impulse response, and output delay.",observeKo:"잡음 센서값·평균 길이·임펄스 응답·출력 지연",ch:[2,6]},
  {en:"Echo, Delay, and Reverberation",ko:"에코·지연·잔향",kind:"Audio systems",concept:"Impulse response · Delay · Convolution",questionEn:"How can a small number of delayed copies model an echo?",questionKo:"지연된 신호의 합으로 에코를 어떻게 모델링할 수 있는가?",observeEn:"Echo amplitude and delay, input/output waveform, impulse response, and listening comparison.",observeKo:"에코 크기·지연 시간·입출력·임펄스 응답·청각 비교",ch:[1,2,4]},
  {en:"Resonance and Band-Pass Selection",ko:"공진과 대역통과 선택",kind:"Frequency-selective systems",concept:"Resonance · Bandwidth · Poles",questionEn:"Why can a system respond strongly to a narrow range of frequencies?",questionKo:"시스템은 특정 주파수 부근에서 왜 크게 반응하는가?",observeEn:"Excitation frequency, resonance peak, bandwidth, and response magnitude.",observeKo:"여기 주파수·공진 피크·대역폭·응답 크기",ch:[4,5,8]},
  {en:"Transient and Control Responses",ko:"과도응답과 제어 시스템",kind:"Dynamics",concept:"Step response · Settling · Overshoot",questionEn:"Why can a fast-responding system overshoot or oscillate?",questionKo:"빠른 시스템이 목표값을 지나치거나 진동하는 이유는?",observeEn:"Step input, settling behavior, damping, and stability intuition.",observeKo:"계단 입력·정착 과정·감쇠·안정성 직관",ch:[2,5,8]},
  {en:"Image Blur as 2D Convolution",ko:"2차원 컨벌루션과 이미지 흐림",kind:"Spatial systems",concept:"2D kernel · Spatial filtering",questionEn:"How does a local averaging kernel soften sharp image details?",questionKo:"국소 평균 필터가 왜 이미지의 선명한 경계를 흐리게 만드는가?",observeEn:"Image kernel size, original/blurred output, and edge behavior.",observeKo:"필터 커널 크기·원본과 흐림 결과·에지 변화",ch:[2,4]}
 ],
 c:[
  {lab:"fft-foundations",href:"./applications-fft-lab.html",en:"Start Here · FFT from Sample Data",ko:"여기서 시작 · 샘플 데이터 FFT 분석",kind:"FFT Foundations",concept:"x[n] · X[k] · N · k/N · fₛ",questionEn:"Given samples alone, what can we learn from the FFT? What changes when fs is provided?",questionKo:"샘플 데이터만으로 FFT에서 무엇을 알 수 있으며 fs가 주어지면 해석이 어떻게 달라지는가?",observeEn:"Paste or select numeric samples, compute FFT bins, inspect normalized frequencies without fs, then add fs to interpret Hz.",observeKo:"숫자 표본 입력·FFT Bin 계산·fs가 없을 때의 정규화 주파수·fs를 알 때의 Hz 해석",ch:[6,7]},
  {lab:"fft-resolution",href:"./applications-fft-resolution.html",en:"Frequency Bins and Resolution",ko:"주파수 격자와 분해능",kind:"FFT Foundations",concept:"Sampling rate · N · Bin spacing",questionEn:"How do sampling rate, record length, and N affect the FFT frequency grid?",questionKo:"샘플링 주파수·관측 길이·N은 FFT 주파수 격자에 어떻게 영향을 주는가?",observeEn:"Interactive comparisons of N, fs, nearby tones, off-bin leakage, Rectangular/Hann windows and zero padding.",observeKo:"N·fs·인접 주파수·Bin 사이 누설·직사각/Hann 창·영 채우기 비교",ch:[6,7]},
  {en:"DFT vs FFT",ko:"DFT와 FFT의 관계",kind:"FFT Foundations",concept:"DFT · FFT algorithm · Computational cost",questionEn:"Why is FFT faster without changing the DFT it computes?",questionKo:"FFT는 같은 DFT 결과를 계산하면서 왜 더 빠른가?",observeEn:"N-point DFT result, butterfly steps, and operation-count comparison.",observeKo:"N점 DFT 결과·버터플라이 단계·연산량 비교",ch:[3,6]},
  {en:"Magnitude, Phase, and Reconstruction",ko:"크기·위상·복원",kind:"FFT Foundations",concept:"Complex spectrum · IFFT · Phase",questionEn:"Why is phase necessary to reconstruct the original signal?",questionKo:"원래 신호를 복원하려면 위상이 왜 필요한가?",observeEn:"Magnitude and phase spectra, phase changes, and IFFT reconstruction.",observeKo:"크기·위상 스펙트럼·위상 변화·IFFT 복원",ch:[3,4,6]},
  {en:"Spectral Leakage and Windows",ko:"스펙트럼 누설과 윈도 함수",kind:"FFT Foundations",concept:"Observation window · Leakage · Tapering",questionEn:"Why does a tone spread across many bins when the observation window is not coherent?",questionKo:"관측 구간에 정수 주기가 들어 있지 않을 때 에너지가 여러 격자로 퍼지는 이유는?",observeEn:"Rectangular/Hann windows, amplitude spectra, and the main-lobe/side-lobe tradeoff.",observeKo:"직사각·Hann 창·진폭 스펙트럼·주엽과 부엽의 상충 관계",ch:[4,6]},
  {en:"Zero Padding and Spectral Detail",ko:"영 채우기와 스펙트럼 표시",kind:"FFT Foundations",concept:"Zero padding · Interpolation · Resolution",questionEn:"Why does zero padding add FFT samples without automatically improving true resolving power?",questionKo:"0을 추가하면 FFT 격자는 촘촘해지지만 실제 분해능은 왜 자동 향상되지 않는가?",observeEn:"Fixed observation versus padded FFT length and nearby tones.",observeKo:"관측 길이 고정·패딩 후 FFT 점 수·인접 주파수 성분",ch:[6,7]},
  {lab:"chirp-stft",href:"./applications-chirp-stft.html",en:"Chirp, STFT, and Spectrogram",ko:"처프·STFT·스펙트로그램",kind:"Audio & Time-frequency",concept:"STFT · Time-frequency tradeoff",questionEn:"Why does one full-record FFT lose the timing of a moving frequency?",questionKo:"전체 구간 FFT 하나로는 주파수가 변한 시점을 왜 알 수 없는가?",observeEn:"Window length, overlapping frames, chirp curve, and spectrogram.",observeKo:"윈도 길이·겹치는 구간·처프 주파수 곡선·스펙트로그램",ch:[4,6,7]},
  {lab:"dtmf-decoder",href:"./applications-fft-dtmf.html",en:"DTMF Mystery Decoder · Discover Hidden Numbers with FFT",ko:"DTMF 비밀 숫자 해독 · FFT로 숨겨진 정보 찾기",kind:"FFT Discovery · Decode",concept:"Two-tone signals · FFT peaks · DTMF standard · Mystery challenge",questionEn:"Can you decode a hidden telephone key from its two FFT frequency peaks?",questionKo:"두 개의 FFT 주파수 피크만으로 비밀 전화번호를 알아낼 수 있을까?",observeEn:"Listen before seeing the spectrum; perform FFT, locate low/high peaks, decode a secret key, then solve a three-key sequence.",observeKo:"먼저 소리를 듣고 FFT로 저주파·고주파 피크를 찾아 비밀 숫자와 세 자리 연속 숫자를 해독",ch:[3,4,6,7]},
  {lab:"sound-fingerprint",href:"./applications-fft-sound-fingerprint.html",en:"Sound Fingerprint · Piano, Guitar and Voice FFT",ko:"소리의 주파수 지문 · 피아노·기타·목소리 FFT",kind:"FFT Discovery · Discover",concept:"Same fundamental · Harmonic spectrum · Timbre · Listening",questionEn:"Why do a piano, guitar, and voice sound different at the same pitch?",questionKo:"같은 음높이로 소리를 내도 피아노·기타·목소리가 다르게 들리는 이유는?",observeEn:"Listen to hidden A/B/C sounds, compare their actual FFT and ten harmonic amplitudes, then reveal their identities. Optionally analyze real uploaded recordings.",observeKo:"정체를 숨긴 A·B·C 소리를 듣고 FFT·고조파 진폭을 비교한 다음 정체 공개. 실제 녹음 파일도 선택 분석 가능",ch:[3,4,6,7]},
  {lab:"fft-upload",href:"./applications-fft-upload.html",en:"FFT of Real Audio, Music & Sensor Data",ko:"실제 음성·음악·센서 데이터 FFT",kind:"Audio & Sensors",concept:"File upload · FFT · Spectral peaks · Sampling rate",questionEn:"What does an uploaded recording or sensor trace reveal in the frequency domain?",questionKo:"실제 음성·음악·센서 데이터의 FFT로 어떤 주파수 성분을 알아낼 수 있을까?",observeEn:"Upload local audio or CSV, select a sample segment, compute amplitude FFT, identify peaks and interpret normalized frequency versus Hz.",observeKo:"로컬 오디오·CSV 업로드, 표본 구간 선택, FFT 크기 및 피크 분석, 정규화 주파수와 Hz 비교",ch:[3,4,6,7]},
  {en:"2D FFT of Images",ko:"이미지의 2D FFT",kind:"Image Processing",concept:"Spatial frequency · 2D FFT · IFFT",questionEn:"How do stripe spacing and direction appear as peaks in the 2D spectrum?",questionKo:"줄무늬의 간격과 방향이 2D 스펙트럼 피크에 어떻게 나타나는가?",observeEn:"Image upload, spectrum, low/high-pass masks, and reconstructed image.",observeKo:"이미지 업로드·스펙트럼·저역/고역 필터 마스크·복원 이미지",ch:[2,4,6]},
  {en:"Video Temporal FFT and Flicker",ko:"동영상 시간 FFT와 깜빡임",kind:"Video Processing",concept:"Temporal sampling · FFT · Aliasing",questionEn:"How can periodic brightness changes in a video reveal flicker or vibration?",questionKo:"영상 밝기의 주기적 변화로 어떻게 깜빡임과 진동을 찾을 수 있는가?",observeEn:"Pixel/region brightness through time, temporal FFT, and frame-rate effects.",observeKo:"픽셀·영역의 시간에 따른 밝기·시간 FFT·프레임률 영향",ch:[6,7]},
  {en:"FFT-Based Convolution",ko:"FFT 기반 컨벌루션",kind:"FFT Engineering",concept:"Convolution theorem · Padding · Circular effects",questionEn:"When does multiplying two FFT spectra reproduce linear convolution?",questionKo:"두 FFT를 곱했을 때 어떤 조건에서 선형 컨벌루션 결과와 같아지는가?",observeEn:"Direct convolution versus FFT/IFFT and the padding required to avoid wrap-around.",observeKo:"직접 컨벌루션과 FFT/IFFT·순환 겹침을 방지하는 패딩",ch:[2,4,6]}
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
function renderTopics(){
 sections.forEach(part=>{
  const host=document.getElementById("topics-"+part),data=topics[part];
  if(!host)return;
  host.replaceChildren();
  document.getElementById("part-"+part+"-count").textContent=data.length+" "+i18n("topics","주제",true);
  for(let i=0;i<data.length;i++){
   const x=data[i];
   const details=node("details","ss-app-topic");
   if(part==="c")details.dataset.area="fft";
   const summary=node("summary");
   if(part==="c"){
    details.dataset.learningStep=String(i+1);
    const phase=i===0?i18n("START HERE · FIRST PRACTICAL","여기에서 시작 · 첫 실습",true):
      i<=2?i18n("FOUNDATIONS","핵심 기초",true):
      i<=5?i18n("SPECTRUM INTERPRETATION","스펙트럼 해석",true):
      i18n("REAL-WORLD APPLICATION","실제 응용",true);
    summary.append(node("span","ss-app-topic-stage",phase));
   }
   const heading=node("h3",null,mode()==="ko"?x.ko:x.en);
   summary.append(heading);
   const kindKo={"Sound & periodicity":"소리와 주기성","Time-varying frequency":"시간가변 주파수","Complex signals":"복소 신호","Sound & superposition":"소리와 중첩","Communication signals":"통신 신호","Sampling":"표본화","Circuits":"회로","Digital filtering":"디지털 필터링","Audio systems":"오디오 시스템","Frequency-selective systems":"주파수 선택 시스템","Dynamics":"동적 시스템","Spatial systems":"공간 시스템","FFT Foundations":"FFT 기초","Audio & Time-frequency":"오디오와 시간-주파수","Audio & Sensors":"오디오와 센서","Image Processing":"영상 처리","Video Processing":"동영상 처리","FFT Engineering":"FFT 공학 응용","Audio":"오디오","Sensors & IoT":"센서와 IoT","Radar & Sonar":"레이더와 소나","Biomedical":"바이오메디컬","Image & Vision":"이미지와 비전","Communications":"통신"};
   const label=node("span","ss-app-topic-label",i18n(x.kind,kindKo[x.kind]||x.kind,true));
   summary.append(label);details.append(summary);
   if(x.lab){details.classList.add("ss-app-topic-ready");details.open=true;}
   const body=node("div","ss-app-topic-details");
   body.append(node("span","ss-app-status",x.lab?i18n("Interactive lab available","인터랙티브 실습 제공",true):i18n("Planned module","개발 예정",true)));
   if(x.lab){
    const run=node("a","ss-app-open-lab",i18n("Open Interactive Lab →","실습 열기 →",true));
    run.href=x.href||"./applications-lab.html?lab="+x.lab;
    body.append(run);
   }
   const concept=node("span","ss-app-topic-label",x.concept);
   body.append(concept);
   const q=node("p",null,i18n("Question: "+x.questionEn,"핵심 질문: "+x.questionKo));body.append(q);
   body.append(node("p",null,i18n((x.lab?"Try in the lab: ":"Planned exploration: ")+x.observeEn,(x.lab?"실습에서 확인: ":"예정 실습: ")+x.observeKo)));
   const prereq=node("div","ss-app-topic-labs",i18n("Related chapters","연결되는 Chapter",true)+": ");
   x.ch.forEach(n=>{
    const link=node("a",null,"Ch "+n);
    link.href="./chapter"+n+".html";link.title="Open Chapter "+n;prereq.append(link);
   });body.append(prereq);
   details.append(body);
   host.append(details);
  }
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
