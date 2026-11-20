/* Three-course QA overview: independently fetched public reports, no access to credentials. */
(()=>{
"use strict";
const sources=[
 {id:"ss",title:"Signals & Systems",url:"https://raw.githubusercontent.com/YSCho-HGU/signals-systems-visual-lab/main/qa-dashboard/latest.json",kind:"ss"},
 {id:"c",title:"C Programming",url:"../qa-dashboard/c-latest.json",kind:"c"},
 {id:"logic",title:"Logic Design",url:"../qa-dashboard/logic-latest.json",kind:"logic"}
];
const root=document.getElementById("studio-quality-cards"),status=document.getElementById("studio-quality-status");
if(!root||!status)return;
const t=(tag,name,value)=>{const e=document.createElement(tag);if(name)e.className=name;if(value!==undefined)e.textContent=String(value);return e};
const badge=state=>{const e=t("span","qa-badge",state||"NOT_RUN");e.dataset.state=state||"NOT_RUN";return e};
const safeLink=(text,url)=>{if(typeof url!=="string"||!/^https:\/\/github\.com\/YSCho-HGU\/(?:signals-systems-visual-lab|engineering-learning-studio)\//.test(url))return t("span","muted",text);const a=t("a","",text);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a};
const str=s=>({NOT_RUN:"미실행",PENDING:"교육 검토 대기",AUTOMATED_PASS:"자동 검사 통과",BLOCKED_AUTOMATED:"자동 검사 실패",PILOT_PASS:"시범 실습 통과",PILOT_BLOCKED:"시범 실습 실패"}[s]||s||"미실행");
function card(source,data,error){
 const c=t("article","qa-course-card");
 const head=t("div","qa-course-head");
 head.append(t("strong","",source.title),badge(error?"NOT_RUN":(data.automatedStatus||data.automaticStatus||"NOT_RUN")));
 c.append(head);
 if(error){c.append(t("p","qa-course-sub","검사 보고서를 불러오지 못했습니다: "+String(error.message||error)));return c}
 const at=data.generatedAt?new Date(data.generatedAt).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"}):"미확인";
 c.append(t("p","qa-course-sub","최근 검사: "+at));
 if(source.kind==="logic"){
   c.append(t("p","qa-course-sub",data.testedPrototype||"현재는 미니 실습 검증 단계"));
   const formal=t("p","qa-course-sub","정식 Logic Design 교과목: ");
   formal.append(badge(data.formalCourseStatus||"NOT_RUN"));c.append(formal);
 }else{
   const labels=source.kind==="ss"?(data.labsCount||62)+"개 실습":(data.plannedUnits||18)+"개 계획 / "+(data.chapters?.length||0)+"개 공개";
   c.append(t("p","qa-course-sub",labels+" · 화면 검증 "+(data.visual?.observed??0)+"/"+(data.visual?.expected??"—")));
 }
 const manual=t("p","qa-course-sub","교육적 검토: "+str(data.manualStatus||"PENDING"));
 c.append(manual);
 const details=t("details"),summary=t("summary","","G0–G7 검사 및 단원별 상태");details.append(summary);
 for(const gate of data.gates||[]){
   const row=t("div","qa-gate");
   row.append(t("span","",(gate.id||"")+" · "+(gate.label||gate.name||"")),badge(gate.status));
   details.append(row);
 }
 if(data.chapters?.length){
   const list=t("div","qa-unit-list");
   for(const ch of data.chapters){
     const row=t("div","qa-unit");
     row.append(t("span","",(source.kind==="ss"?"Chapter ":"Unit ")+ch.id+" · "+ch.title),badge(ch.visual?.status||"NOT_RUN"));
     list.append(row);
   }
   details.append(list);
 }
 if(data.runUrl)details.append(safeLink("GitHub Actions 검사 기록",data.runUrl));
 c.append(details);
 return c;
}
let counter=0;
async function load(){
 const seq=++counter;status.textContent="세 과목의 품질 보고서를 확인하고 있습니다.";
 const results=await Promise.all(sources.map(async s=>{
  try{
   const r=await fetch(s.url+(s.url.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"});
   if(!r.ok)throw Error("HTTP "+r.status);
   const d=await r.json();
   if(d.schemaVersion!==1||!Array.isArray(d.gates))throw Error("보고서 형식 오류");
   return {source:s,data:d};
  }catch(error){return {source:s,error}}
 }));
 if(seq!==counter)return;
 root.replaceChildren(...results.map(r=>card(r.source,r.data,r.error)));
 const loaded=results.filter(x=>!x.error).length;
 const manual=results.every(x=>x.data?.manualStatus==="PENDING");
 status.textContent=loaded+"/3 과목 품질 보고서 조회 · "+(manual?"자동 검증과 교육적 검토를 구분합니다.":"일부 보고서는 미실행 또는 확인 불가 상태입니다.");
}
document.getElementById("studio-quality-refresh")?.addEventListener("click",load);
load();
})();