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
 nav.append(summary,actions,progress);
}
function init(){main.prepend(nav);render();window.ELSLanguage?.subscribe?.(render);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();
