/* Shared, accessible FFT Applications learning path for available Part C labs. */
(()=>{
"use strict";
const lessons=[
 {file:"applications-fft-lab.html",en:"FFT from Sample Data",ko:"샘플 데이터 FFT",phase:"foundation"},
 {file:"applications-fft-resolution.html",en:"Frequency Bins & Resolution",ko:"주파수 Bin과 분해능",phase:"foundation"},
 {file:"applications-dft-fft.html",en:"DFT vs FFT",ko:"DFT와 FFT",phase:"foundation"},
 {file:"applications-fft-dtmf.html",en:"DTMF Mystery Decoder",ko:"DTMF 비밀 숫자 해독",phase:"discovery"},
 {file:"applications-fft-sound-fingerprint.html",en:"Sound Fingerprint",ko:"소리의 주파수 지문",phase:"discovery"},
 {file:"applications-fft-upload.html",en:"Real Audio & Sensor FFT",ko:"실제 음성·센서 FFT",phase:"discovery"},
 {file:"applications-chirp-stft.html",en:"Chirp & STFT (Optional)",ko:"처프·STFT (선택)",phase:"extension"}
];
const focus=[
 ["FFT works on a sample array even without fs; fs determines the Hz labels.","fₛ를 몰라도 FFT는 표본 배열로 계산되며 fₛ는 Hz 축 해석에 필요합니다."],
 ["Resolution comes from observation time; Hann changes leakage and padding only densifies the grid.","분해능은 관측 시간과 관련되며 Hann 창은 누설을 바꾸고 Zero-padding은 격자만 촘촘하게 합니다."],
 ["FFT computes the same DFT as direct summation using reusable butterfly calculations.","FFT는 버터플라이 중간 계산을 재사용해 직접 DFT와 동일한 결과를 더 효율적으로 구합니다."],
 ["Two spectral peaks reveal a DTMF symbol; frequency analysis does not determine sequence order by itself.","두 주파수 피크로 DTMF 기호를 찾되, FFT 하나만으로 여러 기호의 시간 순서는 알 수 없습니다."],
 ["Harmonic strengths help explain timbre at the same pitch; synthesised models are not real instrument recordings.","같은 음높이에서도 고조파 크기가 음색을 구별하지만 합성 모델은 실제 악기 녹음이 아닙니다."],
 ["Apply FFT to selected real audio/sensor intervals; distinguish measured peaks from physical hypotheses.","실제 음성·센서 데이터의 선택 구간을 분석하고 관측 피크와 물리적 추론을 구분합니다."],
 ["Optional extension: a moving-window FFT reveals when frequencies change; revisit only after FFT fundamentals.","선택 확장: 이동 창 FFT로 주파수 변화 시점을 확인하며, FFT 기본 학습 후 진행합니다."]
];
const name=decodeURIComponent(location.pathname.split("/").pop()||"");
const index=lessons.findIndex(item=>item.file===name);
if(index<0)return;
const main=document.querySelector("main");
if(!main)return;
const nav=document.createElement("nav");
nav.className="ss-fft-path";
nav.setAttribute("aria-label","FFT Applications learning path");
nav.id="ss-fft-path";
function link(href,text,cls){
 const a=document.createElement("a");a.href=href;a.textContent=text;
 if(cls)a.className=cls;
 return a;
}
function render(){
 const lang=window.ELSLanguage?.get?.()||"mixed";
 const tr=(en,ko)=>lang==="en"?en:lang==="ko"?ko:en+" · "+ko;
 nav.replaceChildren();
 const summary=document.createElement("div");summary.className="ss-fft-path-summary";
 const counter=document.createElement("strong");counter.textContent=tr("FFT LEARNING PATH","FFT 학습 경로")+" · "+String(index+1).padStart(2,"0")+" / 07";
 const context=document.createElement("span");
 const phases={foundation:["Core foundations","핵심 기초"],discovery:["FFT discovery","FFT 발견 실습"],extension:["Optional extension","선택 확장"]};
 context.textContent=tr(...phases[lessons[index].phase]);
 summary.append(counter,context);
 const focusLine=document.createElement("p");focusLine.className="ss-fft-path-focus";
 focusLine.textContent=tr(...focus[index]);
 const actions=document.createElement("div");actions.className="ss-fft-path-actions";
 if(index>0)actions.append(link("./"+lessons[index-1].file,tr("← Previous: "+lessons[index-1].en,"← 이전: "+lessons[index-1].ko),"ss-fft-path-prev"));
 else actions.append(link("./applications.html#part-c",tr("← Part C overview","← Part C 목차"),"ss-fft-path-prev"));
 actions.append(link("./applications.html#part-c",tr("All FFT modules","FFT 전체 목차"),"ss-fft-path-home"));
 if(index<lessons.length-1)actions.append(link("./"+lessons[index+1].file,tr("Next: "+lessons[index+1].en+" →","다음: "+lessons[index+1].ko+" →"),"ss-fft-path-next"));
 else actions.append(link("./applications.html#part-c",tr("Finish · Part C →","학습 완료 · Part C →"),"ss-fft-path-next"));
 const progress=document.createElement("ol");progress.className="ss-fft-path-progress";
 for(let i=0;i<lessons.length;i++){
  const item=lessons[i],li=document.createElement("li");
  const a=link("./"+item.file,String(i+1),i===index?"is-current":"");
  a.setAttribute("aria-label",tr("Lesson "+(i+1)+": "+item.en,"학습 "+(i+1)+": "+item.ko));
  a.title=tr(item.en,item.ko);
  if(i===index)a.setAttribute("aria-current","page");
  li.append(a);progress.append(li);
 }
 nav.append(summary,focusLine,actions,progress);
}
function init(){main.prepend(nav);render();window.ELSLanguage?.subscribe?.(render);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();
