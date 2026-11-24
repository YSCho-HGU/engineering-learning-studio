/* Part C · 07: evidence-based, browser-local discovery checkpoints. */
(()=>{"use strict";
const KEY="els-ss-image-fft-progress-v1",TOTAL=4;
const root=document.querySelector(".ss-image-intro"),check=document.getElementById("image-check");
if(!root||!check)return;
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");return new Set(Array.isArray(v)?v.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL):[])}catch{return new Set()}};
const done=read(),panel=document.createElement("section");
panel.className="ss-image-panel";panel.id="image-discovery-progress";
panel.style.cssText="margin-top:10px;padding:12px 16px;display:grid;gap:7px";
const title=document.createElement("strong"),note=document.createElement("p"),bar=document.createElement("div"),fill=document.createElement("span"),steps=document.createElement("div"),link=document.createElement("a");
bar.style.cssText="height:9px;max-width:420px;border-radius:20px;background:var(--els-surface-alt,#444);overflow:hidden";
bar.setAttribute("role","progressbar");bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax","4");fill.style.cssText="display:block;height:100%;width:0;background:var(--els-link,#78c6c5)";bar.append(fill);
steps.style.cssText="display:flex;flex-wrap:wrap;gap:8px;font-size:13px";
link.href="../progress/";link.textContent="Studio Learning Progress";link.style.cssText="color:var(--els-link,#78c6c5);font-weight:700;font-size:13px";
note.style.cssText="margin:0;color:var(--els-muted,#bbb);font-size:13px";
panel.append(title,bar,steps,note,link);root.after(panel);
function language(){return window.ELSLanguage?.get?.()||"mixed"}
function render(){const en=language()==="en",ko=language()==="ko";
 const label=en?"Discovery checkpoints":ko?"발견 실습 완료 조건":"Discovery checkpoints · 발견 실습 완료";
 title.textContent=label+" · "+done.size+"/4";
 bar.setAttribute("aria-valuenow",String(done.size));fill.style.width=(done.size/TOTAL*100)+"%";
 steps.replaceChildren();for(let i=1;i<=TOTAL;i++){const el=document.createElement("span");el.textContent=(done.has(i)?"✓ ":"○ ")+(["","Patterns","Spectrum","Kernel → FFT","Noise removal"][i]);el.style.cssText="border:1px solid var(--els-border,#777);border-radius:12px;padding:4px 9px;"+(done.has(i)?"color:var(--els-link,#78c6c5)":"");steps.append(el)}
 note.textContent=en?"Recorded only after interacting and correctly explaining each stage. Browser-local learning evidence, not a grade.":ko?"각 단계에서 직접 조작하고 올바른 근거를 선택하면 완료됩니다. 이 브라우저에만 저장되며 성적이 아닙니다.":"Interact and verify each stage · 각 단계의 조작과 올바른 설명을 확인한 후 기록합니다. 성적이 아닙니다.";
}
check.addEventListener("click",()=>{const stage=Number(window.SSImageFFTApp?.state?.stage);if(!Number.isInteger(stage)||stage<1||stage>4||document.getElementById("image-feedback")?.dataset.result!=="correct")return;done.add(stage);try{localStorage.setItem(KEY,JSON.stringify([...done].sort()))}catch{}render();window.dispatchEvent(new CustomEvent("els:image-fft-progress",{detail:{completed:[...done]}}))});
window.addEventListener("storage",e=>{if(e.key===KEY){done.clear();for(const i of read())done.add(i);render()}});
window.ELSLanguage?.subscribe?.(render);render();
})();
