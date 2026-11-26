/* Common instructional continuity for Ch5, Ch7, Ch8.
 * Read-only view: existing model, graphs and derivation counters are never changed.
 */
(function(){
"use strict";
const chapter=Number((location.pathname.match(/chapter([578])\.html/)||[])[1]);if(!chapter)return;
const config={
 5:{observe:".ss5-observe",explain:"#derivationPanel",controls:".controlgrid [data-key]",label:"03 · Observe → 04 · Explain"},
 7:{observe:".ss7-stage-observe",explain:".ss7-stage-explain",controls:"#controls [data-param]",label:"03 · Observe → 04 · Explain"},
 8:{observe:".ss8-stage-observe",explain:".ss8-stage-explain",controls:"#controls [data-param]",label:"03 · Observe → 04 · Explain"}
}[chapter];
const dict={
 en:{observe:"The graphs reflect the selected experiment. Step 4 explains their underlying relationship.",
      title:"Explain these graphs",same:"Same experiment",
      summary:"Current settings",explain:"These equations refer to the selected experiment. Previous/Next reveals explanation steps; it does not change the controls.",
      verify:"Verify: Change one parameter, then compare the graph and the explanation."},
 ko:{observe:"현재 실험값을 사용한 그래프입니다. 4번에서 그 관계를 수식으로 설명합니다.",
      title:"위 그래프를 수식으로 설명",same:"동일한 실험",
      summary:"현재 설정값",explain:"선택한 실험의 수학적 관계를 설명합니다. 이전/다음은 수식 단계만 바꾸며 실험 변수는 변경하지 않습니다.",
      verify:"검증: 변수 하나를 바꾸고 그래프와 설명을 비교하세요."}
};
const mode=()=>{let v=window.SSContentModel?.mode?.()||window.ELSLanguage?.get?.()||"mixed";return v==="en"||v==="ko"?v:"mixed"};
function tr(k){
 const m=mode();return m==="mixed"?dict.en[k]+" / "+dict.ko[k]:dict[m][k];
}
function element(tag,className,text){const e=document.createElement(tag);e.className=className;if(text)e.textContent=text;return e}
function currentControls(){
 return [...document.querySelectorAll(config.controls)].filter(input=>{
  if(input.closest("[hidden]")||input.disabled)return false;
  const parent=input.closest(".ctrl,.control")||input.parentElement;
  return parent&&getComputedStyle(parent).display!=="none"&&getComputedStyle(input).display!=="none";
 }).map(input=>{
  const key=input.dataset.key||input.dataset.param;
  const parent=input.closest(".ctrl,.control")||input.parentElement;
  const label=parent?.querySelector("label")?.textContent?.trim().replace(/\s+/g," ").slice(0,55)||key;
  const value=input.tagName==="SELECT"
   ?input.selectedOptions[0]?.textContent?.trim()||input.value
   :(parent.querySelector("output")?.textContent?.trim()||input.value);
  return {key,label,value};
 });
}
let lastSignature="",scheduled=false,muting=false;
function refresh(){
 const observe=document.querySelector(config.observe),explain=document.querySelector(config.explain);
 if(!observe||!explain)return;
 const current=currentControls();
 const sig=chapter+"|"+mode()+"|"+JSON.stringify(current)+"|"+Boolean(observe.querySelector(".ss-continuity-observe"))+
  "|"+Boolean(explain.querySelector(".ss-continuity-explain"));
 if(lastSignature===sig)return;
 lastSignature=sig;muting=true;
 try{
  let link=observe.querySelector(".ss-continuity-observe");
  if(!link){
   link=element("div","ss-continuity-observe");
   const stage=observe.querySelector(".ss7-stage-head,.ss8-stage-head,.ss5-flow-label");
   if(stage)stage.insertAdjacentElement("afterend",link);else observe.prepend(link);
  }
  link.replaceChildren(element("strong","",config.label),element("p","",tr("observe")));
  let panel=explain.querySelector(".ss-continuity-explain");
  if(!panel){
   panel=element("section","ss-continuity-explain");
   panel.setAttribute("aria-label","Experiment and derivation relationship");
   const stage=explain.querySelector(".ss7-stage-head,.ss8-stage-head");
   if(stage)stage.insertAdjacentElement("afterend",panel);else explain.prepend(panel);
  }
  const heading=element("div","ss-continuity-heading");
  heading.append(element("strong","",tr("title")),element("span","ss-continuity-same",tr("same")));
  const note=element("p","",tr("explain"));
  const title=element("div","ss-continuity-values-title",tr("summary"));
  const chips=element("div","ss-continuity-values");
  for(const {label,value} of current){
   const chip=element("span","ss-continuity-chip");
   chip.append(element("strong","",label),document.createTextNode(value));
   chips.append(chip);
  }
  const verify=element("p","ss-continuity-verify",tr("verify"));
  panel.replaceChildren(heading,note,title,chips,verify);
 }finally{muting=false}
}
function queue(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;refresh()});
}
function init(){
 document.addEventListener("input",e=>{if(e.target.matches(config.controls))queue()},true);
 document.addEventListener("change",e=>{if(e.target.matches(config.controls))queue()},true);
 document.addEventListener("els-language-change",queue);
 document.addEventListener("els:themechange",queue);
 new MutationObserver(records=>{
  if(muting)return;
  if(records.some(r=>[...r.addedNodes].some(node=>
   node.nodeType===1&&!node.closest?.(".ss-continuity-observe,.ss-continuity-explain")&&
   (node.matches?.(config.observe+","+config.explain+",.ctrl,.control,.step,.plot-card")||
    node.querySelector?.(config.observe+","+config.explain+",.ctrl,.control")))))queue();
 }).observe(document.body,{childList:true,subtree:true});
 queue();
}
window.SSExperimentContinuity=Object.freeze({refresh,get chapter(){return chapter}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
