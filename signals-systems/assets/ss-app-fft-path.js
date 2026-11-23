/* FFT Applications: one module selector and adjacent previous/next links. */
(()=>{
"use strict";
const modules=[
 {file:"applications-fft-lab.html",en:"FFT from Sample Data",ko:"샘플 데이터 FFT"},
 {file:"applications-fft-resolution.html",en:"Frequency Bins & Resolution",ko:"주파수 Bin과 분해능"},
 {file:"applications-dft-fft.html",en:"DFT vs FFT",ko:"DFT와 FFT"},
 {file:"applications-fft-dtmf.html",en:"DTMF Decoder",ko:"DTMF 해독"},
 {file:"applications-fft-sound-fingerprint.html",en:"Sound Fingerprint",ko:"소리의 주파수 지문"},
 {file:"applications-fft-upload.html",en:"Real Audio & Sensor FFT",ko:"실제 음성·센서 FFT"},
 {file:"applications-chirp-stft.html",en:"Chirp & STFT",ko:"Chirp · STFT",optional:true}
];
const filename=decodeURIComponent(location.pathname.split("/").pop()||"");
const current=modules.findIndex(m=>m.file===filename);
if(current===-1)return;
const main=document.querySelector("main");
if(!main)return;
const nav=document.createElement("nav");
nav.id="ss-fft-path";nav.className="ss-fft-path";nav.setAttribute("aria-label","FFT modules");
const local=(en,ko)=>{
 const mode=window.ELSLanguage?.get?.()||"mixed";
 return mode==="en"?en:mode==="ko"?ko:en+" · "+ko;
};
function link(href,text,className,description){
 const a=document.createElement("a");
 a.href=href;a.textContent=text;a.className=className;
 if(description){a.setAttribute("aria-label",description);a.title=description}
 return a;
}
function menuItem(m,index){
 const a=link("./"+m.file,"","ss-fft-path-option");
 if(index===current){a.setAttribute("aria-current","page")}
 const number=document.createElement("span");
 number.className="ss-fft-path-number";number.textContent=String(index+1).padStart(2,"0");
 const name=document.createElement("span");name.textContent=local(m.en,m.ko);
 a.append(number,name);
 if(index===current){const tick=document.createElement("span");tick.className="ss-fft-path-check";tick.textContent="✓";tick.setAttribute("aria-hidden","true");a.append(tick)}
 return a;
}
function render(){
 const dropdown=document.createElement("details");dropdown.className="ss-fft-path-picker";
 const summary=document.createElement("summary");
 summary.className="ss-fft-path-summary";
 const caption=document.createElement("span");caption.className="ss-fft-path-meta";
 caption.textContent=modules[current].optional?local("OPTIONAL EXTENSION","선택 확장"):local("FFT APPLICATIONS · "+String(current+1).padStart(2,"0")+" / 06","FFT 실습 · "+String(current+1).padStart(2,"0")+" / 06");
 const title=document.createElement("span");
 title.className="ss-fft-path-current";title.textContent=local(modules[current].en,modules[current].ko);
 const textGroup=document.createElement("span");textGroup.className="ss-fft-path-selector-label";textGroup.append(caption,title);
 const arrow=document.createElement("span");arrow.className="ss-fft-path-dropdown-arrow";arrow.textContent="⌄";arrow.setAttribute("aria-hidden","true");
 summary.append(textGroup,arrow);
 summary.setAttribute("aria-label",local("Choose FFT module. Current: "+modules[current].en,"FFT 실습 선택. 현재: "+modules[current].ko));
 const menu=document.createElement("div");menu.className="ss-fft-path-menu";
 const heading=document.createElement("p");heading.className="ss-fft-path-menu-heading";heading.textContent=local("FFT Fundamentals & Discovery","FFT 핵심 기초 · 발견 실습");menu.append(heading);
 modules.slice(0,6).forEach((m,i)=>menu.append(menuItem(m,i)));
 const optional=document.createElement("p");optional.className="ss-fft-path-menu-heading ss-fft-path-menu-optional";optional.textContent=local("Optional Extension","선택 확장");
 menu.append(optional,menuItem(modules[6],6));
 menu.append(link("./applications.html#part-c",local("View all FFT contents","FFT 전체 목차 보기"),"ss-fft-path-all"));
 dropdown.append(summary,menu);
 const controls=document.createElement("div");controls.className="ss-fft-path-actions";
 if(current>0){const m=modules[current-1];controls.append(link("./"+m.file,local("← Previous","← 이전"),"ss-fft-path-prev",local("Previous: "+m.en,"이전: "+m.ko)))}
 else {const disabled=document.createElement("span");disabled.className="ss-fft-path-disabled";disabled.textContent=local("← Previous","← 이전");disabled.setAttribute("aria-disabled","true");controls.append(disabled)}
 if(current<modules.length-1){const m=modules[current+1];controls.append(link("./"+m.file,local("Next →","다음 →"),"ss-fft-path-next",local("Next: "+m.en,"다음: "+m.ko)))}
 else {const disabled=document.createElement("span");disabled.className="ss-fft-path-disabled";disabled.textContent=local("Next →","다음 →");disabled.setAttribute("aria-disabled","true");controls.append(disabled)}
 nav.replaceChildren(dropdown,controls);
}
function init(){
 if(!document.getElementById("ss-fft-path"))main.prepend(nav);
 render();
 window.ELSLanguage?.subscribe?.(render);
 document.addEventListener("click",e=>{
  const d=nav.querySelector(".ss-fft-path-picker");if(d?.open&&!d.contains(e.target))d.open=false;
 });
 document.addEventListener("keydown",e=>{if(e.key==="Escape"){const d=nav.querySelector(".ss-fft-path-picker");if(d?.open){d.open=false;d.querySelector("summary")?.focus()}}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();