/* Read-only, public CI quality dashboard. Never reads the editor token or stores credentials. */
(()=>{
"use strict";
const ROOT="https://raw.githubusercontent.com/YSCho-HGU/signals-systems-visual-lab/main/qa-dashboard/latest.json";
const $=id=>document.getElementById(id);
const area=$("ss-quality"),status=$("ss-qa-status"),meta=$("ss-qa-meta"),metrics=$("ss-qa-summary"),chapters=$("ss-qa-chapters"),footer=$("ss-qa-footer");
if(!area)return;
const label={PASS:"PASS",FAIL:"FAIL",NOT_RUN:"미실행",NOT_VERIFIED:"미검증",PENDING:"검토 대기",BLOCKED_AUTOMATED:"자동 검사 실패",AUTOMATED_PASS:"자동 검사 통과"};
const stateName=s=>label[s]||s||"미확인";
function el(tag,cls,text){
 const n=document.createElement(tag);if(cls)n.className=cls;
 if(text!==undefined)n.textContent=String(text);return n;
}
function badge(s){
 const b=el("span","qa-badge",stateName(s));b.dataset.state=s||"NOT_RUN";return b;
}
function link(text,url){
 if(typeof url!=="string"||!/^https:\/\/github\.com\/YSCho-HGU\/(?:signals-systems-visual-lab|engineering-learning-studio)\//.test(url))return el("span","muted",text);
 const a=el("a","",text);a.href=url;a.rel="noopener noreferrer";a.target="_blank";return a;
}
function metric(name,value){
 const b=el("div","qa-metric");
 b.append(el("strong","",value),el("small","",name));return b;
}
function addMeta(report){
 meta.replaceChildren();
 meta.append(document.createTextNode("결과 생성: "+(report.generatedAt?new Date(report.generatedAt).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"}):"확인 불가")));
 if(report.sourceSha)meta.append(document.createTextNode(" · 커밋 "+report.sourceSha.slice(0,8)));
 if(report.runUrl)meta.append(link("GitHub Actions 검사 기록",report.runUrl));
 if(report.latestCommitUrl)meta.append(link("검사 대상 커밋",report.latestCommitUrl));
 meta.hidden=false;
}
function render(data){
 if(!data||data.schemaVersion!==1||!Array.isArray(data.chapters)||data.chapters.length!==8||!Array.isArray(data.gates))throw Error("품질 보고서 형식이 예상과 다릅니다.");
 const pass=data.gates.filter(x=>x.status==="PASS").length,all=data.gates.length;
 const visual=data.visual||{},passChapter=data.chapters.filter(c=>c.visual?.status==="PASS").length;
 status.replaceChildren(document.createTextNode("자동 검사: "+stateName(data.automatedStatus)+" · 교육적 검토: "+stateName(data.manualStatus)+". "+(data.notes?.[0]||"")));
 status.dataset.state=data.automatedStatus;
 addMeta(data);
 metrics.replaceChildren(
   metric("자동 검사",pass+" / "+all),
   metric("Chapter별 시각 검사 통과",passChapter+" / 8"),
   metric("화면 검사 기록",Number(visual.observed||0)+" / "+Number(visual.expected||248)),
   metric("확인된 시각 오류",visual.issues===null||visual.issues===undefined?"—":visual.issues));
 metrics.hidden=false;
 chapters.replaceChildren();
 for(const ch of data.chapters){
   const wrap=el("details","qa-chapter"),heading=el("summary");
   const title=el("span");title.append(el("strong","", "Chapter "+ch.id+" · "+ch.title),el("small","",ch.labCount+"개 실습 · "+(ch.visual?.observed??0)+"/"+(ch.visual?.expected??0)+" 화면"));
   heading.append(title,badge(ch.visual?.status));
   wrap.append(heading);
   const body=el("div","qa-details");
   body.append(el("p","", "시각 검사: "+stateName(ch.visual?.status)+" · 오류 "+(ch.visual?.issues??"—")+"건 · 미수집 "+(ch.visual?.missing??"—")+"건"));
   body.append(el("p","", "독립 수학 검증: "+(ch.coverage?.numericalReference||"검토 대기")));
   body.append(el("p","", "수동 검토 — 그래프 "+stateName(ch.manual?.axesAndLegends)+" / 수학 "+stateName(ch.manual?.mathematics)+" / 교육 "+stateName(ch.manual?.pedagogy)));
   if(ch.issueExamples?.length){const ul=el("ul");for(const item of ch.issueExamples.slice(0,8))ul.append(el("li","",("실습 "+(item.lab??"—")+": ")+(item.message||"오류")));body.append(ul);}
   if(ch.missingExamples?.length)body.append(el("p","", "미수집 예: "+ch.missingExamples.slice(0,4).join(", ")));
   wrap.append(body);chapters.append(wrap);
 }
 chapters.hidden=false;
 footer.replaceChildren(el("strong","", "전역 검사 G0–G7"));
 const g=el("div","qa-gates");
 for(const gate of data.gates){
   const row=el("div","qa-gate"),text=el("span","",(gate.id||"")+" · "+(gate.label||""));
   row.append(text,badge(gate.status));g.append(row);
 }
 footer.append(g,link("QA 정책", "https://github.com/YSCho-HGU/signals-systems-visual-lab/blob/main/docs/qa/SS_QA_STANDARD.md"),
   link("수동 교육 검토 양식","https://github.com/YSCho-HGU/signals-systems-visual-lab/blob/main/docs/qa/SS_MANUAL_REVIEW_TEMPLATE.md"));
 footer.hidden=false;
}
let counter=0;
async function load(){
 const seq=++counter;status.textContent="GitHub Actions의 최신 품질 보고서를 확인하는 중입니다.";
 try{
  const url=ROOT+"?t="+Date.now();
  const response=await fetch(url,{cache:"no-store",mode:"cors"});
  if(!response.ok)throw Error("HTTP "+response.status);
  const data=await response.json();if(seq!==counter)return;
  render(data);
 }catch(err){
  if(seq!==counter)return;
  status.textContent="아직 게시된 품질 보고서를 불러올 수 없습니다 ("+String(err.message||err)+"). GitHub Actions 결과와 QA 정책 링크를 사용할 수 있습니다.";
  meta.hidden=true;metrics.hidden=true;chapters.hidden=true;
  footer.replaceChildren(link("GitHub Actions 기록","https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/workflows/visual-audit.yml"));footer.hidden=false;
 }
}
function toggle(){
 const selected=$("course-ss")?.getAttribute("aria-selected")==="true";
 area.hidden=!selected;
 if(selected)load();else counter++;
}
$("course-c")?.addEventListener("click",()=>setTimeout(toggle,0));
$("course-ss")?.addEventListener("click",()=>setTimeout(toggle,0));
$("ss-qa-refresh")?.addEventListener("click",load);
toggle();
})();