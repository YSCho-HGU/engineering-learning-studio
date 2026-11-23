/* One concise path bar for FFT Applications: previous, contents, next. */
(()=>{
"use strict";
const lessons=[
 ["applications-fft-lab.html","FFT from Sample Data","샘플 데이터 FFT"],
 ["applications-fft-resolution.html","Frequency Bins & Resolution","주파수 Bin과 분해능"],
 ["applications-dft-fft.html","DFT vs FFT","DFT와 FFT"],
 ["applications-fft-dtmf.html","DTMF Decoder","DTMF 해독"],
 ["applications-fft-sound-fingerprint.html","Sound Fingerprint","소리의 주파수 지문"],
 ["applications-fft-upload.html","Real Audio & Sensor FFT","실제 음성·센서 FFT"],
 ["applications-chirp-stft.html","Chirp & STFT","Chirp·STFT"]
];
const file=decodeURIComponent(location.pathname.split("/").pop()||"");
const index=lessons.findIndex(item=>item[0]===file);
if(index<0)return;
const main=document.querySelector("main");
if(!main)return;
const nav=document.createElement("nav");
nav.id="ss-fft-path";nav.className="ss-fft-path";
nav.setAttribute("aria-label","FFT module navigation");
const createLink=(href,text,className,title)=>{
 const a=document.createElement("a");
 a.className=className;a.href=href;a.textContent=text;if(title)a.title=title;
 return a;
};
function render(){
 const language=window.ELSLanguage?.get?.()||"mixed";
 const tr=(en,ko)=>language==="en"?en:language==="ko"?ko:en+" · "+ko;
 const title=document.createElement("strong");
 title.className="ss-fft-path-current";
 title.textContent=String(index+1).padStart(2,"0")+" · "+tr(lessons[index][1],lessons[index][2]);
 const actions=document.createElement("div");actions.className="ss-fft-path-actions";
 const before=lessons[index-1],after=lessons[index+1];
 const previous=before
  ?createLink("./"+before[0],tr("← Previous","← 이전"),"ss-fft-path-prev",tr(before[1],before[2]))
  :document.createElement("span");
 if(!before){previous.className="ss-fft-path-placeholder";previous.setAttribute("aria-hidden","true");}
 const contents=createLink("./applications.html#part-c",tr("FFT Contents","FFT 목차"),"ss-fft-path-home");
 const next=after
  ?createLink("./"+after[0],tr("Next →","다음 →"),"ss-fft-path-next",tr(after[1],after[2]))
  :createLink("./applications.html#part-c",tr("Finish →","완료 →"),"ss-fft-path-next");
 actions.append(previous,contents,next);nav.replaceChildren(title,actions);
}
function init(){
 if(!document.querySelector("#ss-fft-path"))main.prepend(nav);
 render();window.ELSLanguage?.subscribe?.(render);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
