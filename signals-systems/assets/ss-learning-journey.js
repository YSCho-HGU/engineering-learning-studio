/* Signals & Systems learning map: Chapter 1–8 to implemented Applications A–C.
 * Pure presentation/route integration. Does not alter the transform explorer,
 * chapter simulations, user preferences or experiment state.
 */
(function(W){
"use strict";
const mount=document.getElementById("ss-learning-journey");
if(!mount)return;
const mode=()=>W.ELSLanguage?.get?.()||"mixed";
const lang=(en,ko,short=false)=>mode()==="en"?en:mode()==="ko"?ko:en+(short?" · ":"\n")+ko;
const node=(tag,cls,copy)=>{
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(copy!==undefined)el.textContent=copy;
 return el;
};
const chapter=(n)=>"./chapter"+n+".html";
const apps={
 harmonics:{href:"./applications-lab.html?lab=harmonics",name:["Harmonics","조화파"]},
 chirp:{href:"./applications-lab.html?lab=chirp",name:["Chirp","처프"]},
 helix:{href:"./applications-lab.html?lab=helix",name:["Complex Helix","복소지수 나선"]},
 beats:{href:"./applications-lab.html?lab=beats",name:["Beats","맥놀이"]},
 amfm:{href:"./applications-lab.html?lab=amfm",name:["AM/FM","진폭·주파수 변조"]},
 sampling:{href:"./applications-lab.html?lab=sampling",name:["Sampling & Aliasing","표본화·에일리어싱"]},
 rc:{href:"./applications-system-lab.html?lab=rc",name:["RC Filter","RC 필터"]},
 moving:{href:"./applications-system-lab.html?lab=moving-average",name:["Moving Average","이동평균"]},
 comparison:{href:"./applications-system-compare.html",name:["Same-Input Comparison","동일 입력 비교"]},
 samples:{href:"./applications-fft-lab.html",name:["FFT from Samples","표본 데이터 FFT"]},
 resolution:{href:"./applications-fft-resolution.html",name:["Resolution & Leakage","분해능·누설"]},
 dftfft:{href:"./applications-dft-fft.html",name:["DFT vs FFT","DFT와 FFT"]},
 dtmf:{href:"./applications-fft-dtmf.html",name:["DTMF Decoder","전화 버튼 해독"]},
 sound:{href:"./applications-fft-sound-fingerprint.html",name:["Sound Fingerprints","소리의 주파수 지문"]},
 upload:{href:"./applications-fft-upload.html",name:["Audio / Sensor FFT","오디오·센서 FFT"]},
 image:{href:"./applications-fft-image.html",name:["2D Image FFT","2D 영상 FFT"]},
 theory:{href:"./applications-fft-theory.html",name:["FFT Concept Guide","FFT 기초 이론 가이드"]}
};
const chapters=[
 {n:1,name:["Signals & Systems","신호와 시스템"],branch:"foundation",
  question:["What is a signal and how does time indexing change it?","신호란 무엇이며 시간 인덱스는 신호를 어떻게 바꾸는가?"],
  key:["CT/DT, time shift and scaling, system tests","연속·이산시간, 시간 이동·스케일, 시스템 성질"],
  apps:["helix","beats"]},
 {n:2,name:["LTI & Convolution","LTI와 컨벌루션"],branch:"foundation",
  question:["How do input x and impulse response h produce output y?","입력 x와 임펄스 응답 h가 어떻게 출력 y를 만드는가?"],
  key:["Impulse response; convolution as an accumulated overlap","임펄스 응답, 겹침의 누적합·적분으로 출력 이해"],
  apps:["moving","rc"]},
 {n:3,name:["Fourier Series","푸리에 급수"],branch:"represent",
  question:["Which harmonics make up a periodic signal?","주기신호는 어떤 조화 성분으로 구성되는가?"],
  key:["Harmonic coefficients, magnitude and phase","고조파 계수, 크기와 위상"],
  apps:["harmonics","sound"]},
 {n:4,name:["CT Fourier Transform","연속시간 푸리에 변환"],branch:"represent",
  question:["How can nonperiodic CT signals be read in frequency?","비주기 연속시간 신호를 주파수로 어떻게 해석하는가?"],
  key:["Continuous spectra, bandwidth, shift and filtering","연속 스펙트럼, 대역폭, 이동과 필터링"],
  apps:["chirp","amfm"]},
 {n:5,name:["Laplace & ROC","라플라스 변환·ROC"],branch:"systems",
  question:["When does a CT system converge and remain stable?","연속시간 시스템은 어디에서 수렴하며 언제 안정한가?"],
  key:["Poles, region of convergence and CT stability","극점, 수렴영역, 연속시간 안정성"],
  apps:["rc","comparison"]},
 {n:6,name:["DTFT & Digital Filtering","DTFT와 디지털 필터"],branch:"digital",
  question:["What do frequency response and FIR filtering mean for sequences?","이산 신호의 주파수 응답과 FIR 필터는 무엇을 의미하는가?"],
  key:["2π-periodic spectrum; FIR magnitude and phase","2π 주기 스펙트럼, FIR 크기와 위상"],
  apps:["moving","resolution"]},
 {n:7,name:["Sampling & Reconstruction","표본화·복원"],branch:"digital",
  question:["How does a CT signal become samples, and when does aliasing occur?","연속 신호가 어떻게 표본이 되고 언제 에일리어싱이 생기는가?"],
  key:["Sampling rate, physical Hz and aliasing","표본화 주파수, 물리 주파수 Hz, 에일리어싱"],
  apps:["sampling","samples"]},
 {n:8,name:["Z-Transform & ROC","Z 변환·ROC"],branch:"systems",
  question:["How do DT poles and ROC determine response and stability?","이산시간 극점·ROC로 응답과 안정성을 어떻게 판단하는가?"],
  key:["Pole-zero, ROC, causality and stable filter behavior","극영점, 수렴영역, 인과성과 안정한 필터 동작"],
  apps:["moving","comparison"]}
];
const routes=[
 {id:"signals",code:"A",title:["Hear and see signals","소리를 듣고 신호를 관찰하기"],
  desc:["For understanding how waveforms, harmonics and sampled signals explain audible behavior.","파형과 고조파 및 표본화를 통해 소리의 특징을 이해하는 경로"],
  outcome:["I can explain a sound using its time pattern, frequency content and sampling conditions.","소리를 시간 파형·주파수 성분·표본화 조건으로 설명할 수 있습니다."],
  stages:[
   {n:1,k:"ch",ch:1,note:["Recognize CT/DT signals","CT/DT 신호 읽기"]},
   {n:2,k:"ch",ch:3,note:["Discover harmonics and periodicity","고조파와 주기성 발견"]},
   {n:3,k:"app",id:"harmonics",note:["Build and hear harmonics","고조파를 구성하고 소리 듣기"]},
   {n:4,k:"ch",ch:4,note:["Interpret a spectrum","스펙트럼 해석"]},
   {n:5,k:"ch",ch:7,note:["Understand sampling and aliasing","표본화·에일리어싱 이해"]},
   {n:6,k:"labgroup",ids:["chirp","amfm","sampling"],note:["Apply to changing-frequency and sampled signals","주파수 변화와 표본화 신호에 응용"]}
  ]},
 {id:"systems",code:"B",title:["Design and compare systems","시스템을 설계하고 비교하기"],
  desc:["For explaining why two filters can smooth the same input but have different delays.","두 필터가 같은 입력을 평활해도 지연이 다른 이유를 이해하는 경로"],
  outcome:["I can calculate and compare output, cutoff and delay without confusing CT and DT systems.","CT와 DT를 혼동하지 않고 출력·차단주파수·지연을 비교할 수 있습니다."],
  stages:[
   {n:1,k:"ch",ch:1,note:["Understand input, output and system properties","입출력과 시스템 성질 이해"]},
   {n:2,k:"ch",ch:2,note:["Derive output by convolution","컨벌루션으로 출력 계산"]},
   {n:3,k:"app",id:"rc",note:["Measure analog low-pass behavior","아날로그 저역통과 응답 관찰"]},
   {n:4,k:"chgroup",ids:[5,6,8],note:["Use CT poles, DTFT and Z/ROC as needed","CT 극점·DTFT·Z/ROC를 필요에 따라 학습"]},
   {n:5,k:"app",id:"moving",note:["Follow the FIR averaging taps","FIR 평균의 각 항 확인"]},
   {n:6,k:"app",id:"comparison",note:["Compare both on the same input and cutoff","같은 입력·차단주파수에서 비교"]}
  ]},
 {id:"fft",code:"C",title:["Discover FFT and analyze real data","FFT를 발견하고 실제 데이터 분석하기"],
  desc:["For first-time FFT learners: start from finite samples, then explore actual audio, sensor and image data.","FFT 입문자 경로: 유한 표본에서 시작해 실제 소리·센서·영상으로 확장"],
  outcome:["I can read an FFT bin correctly, distinguish Hz from cycles/sample and interpret peaks in applications.","FFT Bin과 Hz·cycles/sample을 구분하고 응용 데이터의 피크를 해석할 수 있습니다."],
  stages:[
   {n:1,k:"chgroup",ids:[3,4],note:["Revisit Fourier decomposition","푸리에 표현 복습"]},
   {n:2,k:"chgroup",ids:[6,7],note:["DTFT, samples and sampling rate","DTFT·표본·표본화 주파수"]},
   {n:3,k:"app",id:"theory",note:["Read just the needed FFT foundations","필요한 FFT 기본 개념만 확인"]},
   {n:4,k:"app",id:"samples",note:["Discover bins and normalized frequency","Bin·정규화 주파수 발견"]},
   {n:5,k:"labgroup",ids:["resolution","dftfft"],note:["Observe resolution and butterfly algorithm","분해능·버터플라이 확인"]},
   {n:6,k:"labgroup",ids:["dtmf","sound","upload","image"],note:["Decode, identify and filter real-world data","오디오·센서·영상으로 응용"]}
  ]}
];
const facts=[
 ["DFT and FFT are not two different transforms.","DFT와 FFT는 서로 다른 변환이 아닙니다."],
 ["Physical frequency (Hz) needs a known sampling rate fₛ.","물리 주파수(Hz)에는 확인된 표본화 주파수 fₛ가 필요합니다."],
 ["Laplace and Z-transform need the ROC for a complete interpretation.","라플라스·Z 변환 해석에는 ROC가 필요합니다."]
];
let active="signals";
function anchor(href,label,cls){
 const a=node("a",cls,label);a.href=href;
 return a;
}
function chip(id){
 const x=apps[id];
 return anchor(x.href,lang(...x.name,true),"ss-j-chip");
}
function chapterChip(ch){
 return anchor(chapter(ch),lang("Ch "+ch,"제"+ch+"장",true),"ss-j-chapter-chip");
}
function stageCard(stage){
 const box=node("div","ss-j-stage");
 const over=node("span","ss-j-step-number",String(stage.n).padStart(2,"0"));
 box.append(over);
 let title;
 if(stage.k==="ch"){
  const data=chapters[stage.ch-1];
  title=anchor(chapter(stage.ch),lang("Ch "+stage.ch+" · "+data.name[0],"제"+stage.ch+"장 · "+data.name[1],true),"ss-j-stage-name");
  box.append(title);
 }else if(stage.k==="app"){
  title=chip(stage.id);title.classList.add("ss-j-stage-primary");box.append(title);
 }else if(stage.k==="chgroup"){
  const row=node("div","ss-j-stage-links");
  stage.ids.forEach(n=>row.append(chapterChip(n)));
  box.append(row);
 }else{
  const row=node("div","ss-j-stage-links");
  stage.ids.forEach(id=>row.append(chip(id)));
  box.append(row);
 }
 box.append(node("p","ss-j-step-note",lang(...stage.note)));
 return box;
}
function fullRender(){
 mount.replaceChildren();
 for(const [id,en,ko] of [
  ["ss-map-kicker","LEARNING MAP · CHAPTERS → APPLICATIONS","학습 개념도 · Chapter에서 Applications로"],
  ["ss-map-heading","From Signals and Systems to Engineering Applications","신호및시스템에서 공학 응용까지"],
  ["ss-map-lead","Choose an engineering goal, see which chapters explain it, and open the actual experiment.","공학적 학습 목표를 선택하고 연결된 Chapter와 실제 실습으로 이동하세요."],
  ["ss-map-transform-kicker","DEEPER CONNECTIONS · TRANSFORM EXPLORER","심화 관계 · 변환 탐색기"],
  ["ss-map-transform-heading","Explore the Mathematical Relationships","변환 사이의 수학적 관계 탐색"],
  ["ss-map-transform-desc","Select a relationship to inspect its conditions, equation and a related chapter.","관계선을 선택해 성립 조건·수식·관련 Chapter를 확인하세요."]
 ]){
  const el=document.getElementById(id);
  if(el)el.textContent=lang(en,ko);
 }
 mount.setAttribute("aria-label",lang("Integrated Chapter 1–8 and Applications learning map","Chapter 1~8 및 Applications 통합 학습 개념도"));
 const intro=node("div","ss-j-intro");
 const kicker=node("p","ss-j-overline",lang("01 / The full course at a glance","01 / 전체 학습 흐름"));
 intro.append(kicker,node("h3","ss-j-main-title",lang("From a signal to an engineering decision","신호 이해에서 공학적 판단까지")));
 intro.append(node("p","ss-j-lead",lang(
  "All three routes share Chapters 1–2 as a foundation. Fourier representations, CT/DT system analysis and sampling are complementary branches—not a strict eight-step prerequisite chain.",
  "세 응용 경로의 공통 토대는 1~2장입니다. 푸리에 표현, CT/DT 시스템 해석, 표본화는 서로 연결되는 분기이며 8개 장을 모두 순서대로 마쳐야 하는 단일 선수과목 체인은 아닙니다.")));
 mount.append(intro);
 const overview=node("section","ss-j-overview");overview.setAttribute("aria-label",lang("Concept network","핵심 개념 관계도"));
 const root=node("div","ss-j-root-card");
 root.append(node("strong","",lang("COMMON FOUNDATIONS","공통 기초")));
 const rootLinks=node("div","ss-j-foundation-links");rootLinks.append(chapterChip(1),chapterChip(2));root.append(rootLinks);
 root.append(node("span","ss-j-root-note",lang("Signals, systems and convolution","신호, 시스템과 컨벌루션")));
 overview.append(root);
 const diverge=node("div","ss-j-split");diverge.setAttribute("aria-hidden","true");
 diverge.append(node("span"),node("span"),node("span"));overview.append(diverge);
 const branches=node("div","ss-j-branch-grid");
 const groups=[
  {label:["A · Signal / Fourier view","A · 신호·푸리에 관점"],chapterIds:[3,4,7],title:["Signals in time and frequency","시간·주파수에서 신호 이해"],labIds:["harmonics","chirp","sampling"]},
  {label:["B · System / response view","B · 시스템·응답 관점"],chapterIds:[5,6,8],title:["Poles, filters and output","극점·필터·출력 비교"],labIds:["rc","moving","comparison"]},
  {label:["C · Sampled-data / FFT view","C · 표본 데이터·FFT 관점"],chapterIds:[6,7],title:["DFT/FFT for practical data","실제 데이터의 DFT/FFT"],labIds:["samples","dtmf","image"]}
 ];
 for(const g of groups){
  const box=node("article","ss-j-branch");
  box.append(node("h4","",lang(...g.label)));
  box.append(node("p","",lang(...g.title)));
  const chaptersRow=node("div","ss-j-branch-chapters");
  g.chapterIds.forEach(n=>chaptersRow.append(chapterChip(n)));
  box.append(chaptersRow);
  const arrow=node("span","ss-j-branch-arrow","↓");arrow.setAttribute("aria-hidden","true");box.append(arrow);
  const labs=node("div","ss-j-branch-apps");
  g.labIds.forEach(id=>labs.append(chip(id)));box.append(labs);branches.append(box);
 }
 overview.append(branches);
 overview.append(node("p","ss-j-branch-note",lang(
  "Arrows represent conceptual connections, not mandatory prerequisites. Chapter 5 concerns CT poles and ROC; Chapter 8 concerns DT poles and ROC. Sampling bridges CT and DT.",
  "화살표는 필수 선수 관계가 아니라 개념적 연결입니다. 5장은 CT 극점·ROC, 8장은 DT 극점·ROC를 다루며 표본화는 CT와 DT를 연결합니다.")));
 mount.append(overview);
 const routeSection=node("section","ss-j-routes");
 routeSection.append(node("p","ss-j-overline",lang("02 / Choose a purpose","02 / 학습 목표 선택")));
 routeSection.append(node("h3","",lang("Which engineering question interests you?","어떤 공학 문제를 해결하고 싶은가요?")));
 routeSection.append(node("p","ss-j-desc",lang(
  "Pick a route. Click a chapter or an application lab to study it, then return to this map. Changing routes does not reset any lab.",
  "경로를 선택하고 Chapter 또는 응용 실습을 클릭해 이동하세요. 이 지도에 돌아와 다른 경로를 선택해도 실습 내용은 초기화되지 않습니다.")));
 const pickers=node("div","ss-j-route-buttons");pickers.setAttribute("role","group");pickers.setAttribute("aria-label",lang("Choose an application route","응용 학습 경로 선택"));
 for(const r of routes){
  const btn=node("button","ss-j-route-button",lang(...r.title));btn.type="button";
  btn.dataset.routeId=r.id;btn.setAttribute("aria-pressed",String(active===r.id));
  btn.addEventListener("click",()=>{active=r.id;fullRender();mount.querySelector(".ss-j-routes")?.scrollIntoView({block:"start",behavior:"auto"})});
  const small=node("span","ss-j-route-code","PART "+r.code);btn.prepend(small);
  pickers.append(btn);
 }
 routeSection.append(pickers);
 const selected=routes.find(r=>r.id===active);
 const routeBody=node("div","ss-j-route-body");
 routeBody.append(node("p","ss-j-route-summary",lang(...selected.desc)));
 const trail=node("div","ss-j-steps");trail.setAttribute("aria-label",lang("Recommended learning sequence","추천 학습 순서"));
 selected.stages.forEach((stage,i)=>{
  if(i){const conn=node("span","ss-j-stage-connector","→");conn.setAttribute("aria-hidden","true");trail.append(conn)}
  trail.append(stageCard(stage));
 });
 routeBody.append(trail);
 const end=node("p","ss-j-route-outcome");
 const strong=node("strong","",lang("When I finish: ","마친 후 할 수 있는 일: "));
 end.append(strong,document.createTextNode(lang(...selected.outcome)));
 routeBody.append(end);
 routeSection.append(routeBody);mount.append(routeSection);
 const catalogue=node("section","ss-j-catalogue");
 catalogue.append(node("p","ss-j-overline",lang("03 / Link each chapter to an actual lab","03 / Chapter 개념을 실제 실습으로 연결")));
 catalogue.append(node("h3","",lang("Eight chapters · What can I try now?","8개 Chapter · 지금 무엇을 실습할 수 있나요?")));
 const chapGrid=node("div","ss-j-chapter-grid");
 for(const item of chapters){
  const card=node("article","ss-j-chapter-card");
  const name=anchor(chapter(item.n),lang("Ch "+item.n+" · "+item.name[0],"제"+item.n+"장 · "+item.name[1],true),"ss-j-chapter-name");
  card.append(name);
  card.append(node("p","ss-j-question",lang(...item.question)));
  card.append(node("p","ss-j-key",lang(...item.key)));
  const match=node("div","ss-j-related");
  match.append(node("span","ss-j-related-label",lang("Try this in Applications","Applications에서 확인")));
  const links=node("div","ss-j-related-links");item.apps.forEach(k=>links.append(chip(k)));
  match.append(links);card.append(match);chapGrid.append(card);
 }
 catalogue.append(chapGrid);
 mount.append(catalogue);
 const finish=node("section","ss-j-finish");
 finish.append(node("h3","",lang("A common student habit in every lab","모든 실습에서 적용할 공통 학습 원칙")));
 finish.append(node("p","",lang("Predict → Change one variable → Observe graphs and numbers → Explain with the current equation → Apply to a new case.",
  "예측 → 변수 하나 변경 → 그래프와 수치 관찰 → 현재 값으로 수식 해석 → 새로운 조건에 적용")));
 const factsList=node("ul","ss-j-facts");
 facts.forEach(pair=>factsList.append(node("li","",lang(...pair))));
 finish.append(factsList);
 const footer=node("div","ss-j-footer-links");
 footer.append(anchor("./applications.html",lang("Browse all implemented Applications","구현된 Applications 전체 보기"),"ss-j-footer-link"));
 footer.append(anchor("./applications-fft-theory.html#samples",lang("FFT foundation guide (optional)","FFT 기초 이론 가이드 (선택)"),"ss-j-footer-link"));
 finish.append(footer);
 finish.append(node("p","ss-j-planned",lang(
  "Available now: Part A (6 labs), Part B (3 labs), Part C (7 core FFT labs + 1 optional STFT preview). Part D integration labs are planned, not yet executable.",
  "현재 실습: Part A 6개, Part B 3개, Part C FFT 핵심 7개와 선택 STFT 1개. Part D의 통합 실습은 기획 단계이며 아직 실행할 수 없습니다.")));
 mount.append(finish);
}
W.ELSLanguage?.subscribe?.(fullRender);
fullRender();
W.SSLearningJourney=Object.freeze({chapters:chapters.map(x=>x.n),routes:routes.map(x=>x.id),applications:Object.keys(apps),selectRoute:(id)=>{if(!routes.some(r=>r.id===id))return false;active=id;fullRender();return true},getRoute:()=>active});
})(window);
