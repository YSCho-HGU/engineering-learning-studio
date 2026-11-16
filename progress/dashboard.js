/* Engineering Learning Studio: read-only cross-course progress projection. */
(()=>{"use strict";
const catalog=[
 {id:"131",slug:"arrays",title:"Arrays",v:2,pv:1,n:7,core:7,p:6,pc:6},
 {id:"132",slug:"strings",title:"Strings",v:2,pv:1,n:7,core:7,p:6,pc:6},
 {id:"133",slug:"standard-library",title:"Standard Library",v:2,pv:1,n:6,core:6,p:6,pc:6},
 {id:"141",slug:"functions",title:"Functions",v:2,pv:1,n:8,core:8,p:6,pc:6},
 {id:"151",slug:"pointer",title:"Pointers",v:2,pv:2,n:8,core:6,p:6,pc:4},
 {id:"161",slug:"structure",title:"Structures",v:2,pv:3,n:8,core:6,p:6,pc:5},
 {id:"171",slug:"fileio",title:"File I/O",v:1,pv:1,n:8,core:8,p:7,pc:3},
 {id:"181",slug:"dynamic-memory",title:"Dynamic Memory",v:3,pv:2,n:8,core:4,p:6,pc:3}
];
const $=id=>document.getElementById(id);
const text={
 en:{heading:"Learning progress",subtitle:"Local records in this browser only — not a gradebook",activity:"Activity reviews",concept:"Correct concept checks",coding:"Self-reported GCC checks",draft:"Saved coding drafts",core:"Core",optional:"Optional",ss:"Signals & Systems",ssNA:"Completion tracking is not connected on the current Signals & Systems site. This does not mean 0% completion.",c:"C Programming",notes:"Activity ≠ correct quiz answer ≠ self-reported execution ≠ verified grading. No source code or notes are transmitted.",refresh:"Refresh local records",none:"No records yet",record:"Recorded",available:"Core learning",updated:"Updated from local browser",visit:"Open lesson",practice:"Coding practice",sslink:"Open Signals & Systems",progress:"Activity completion (core)",local:"Browser-only (same origin)",unavailable:"Unavailable in this browser",revisions:"Course revision"},
 ko:{heading:"학습 진도 통합 대시보드",subtitle:"현재 브라우저의 로컬 기록만 표시하며 성적표가 아닙니다",activity:"학습 활동 확인",concept:"개념 퀴즈 정답",coding:"GCC 실행 자기보고",draft:"저장된 코딩 초안",core:"필수",optional:"선택",ss:"신호 및 시스템",ssNA:"현재 Signals & Systems 사이트에는 완료 기록 기능이 연결되어 있지 않습니다. 학습 진도 0%를 의미하지 않습니다.",c:"C 프로그래밍",notes:"학습 활동 ≠ 퀴즈 정답 ≠ 실행 자기보고 ≠ 검증된 성적입니다. 작성 코드나 학습 노트는 전송하지 않습니다.",refresh:"로컬 기록 새로고침",none:"아직 기록 없음",record:"기록",available:"필수 학습",updated:"브라우저 저장소 기준",visit:"단원 열기",practice:"코딩 실습",sslink:"Signals & Systems 열기",progress:"필수 학습 활동 완료율",local:"동일 출처 브라우저 저장",unavailable:"현재 브라우저에서 사용할 수 없음",revisions:"콘텐츠 버전"},
 mixed:{heading:"Learning Progress · 학습 진도",subtitle:"Browser-local records · 현재 브라우저의 기록 (성적표 아님)",activity:"Activity · 학습 활동",concept:"Concept · 개념 정답",coding:"GCC self-report · 실행 자기보고",draft:"Drafts · 코드 초안",core:"Core · 필수",optional:"Optional · 선택",ss:"Signals & Systems · 신호 및 시스템",ssNA:"SS completion tracking is not connected · SS 완료 기록은 아직 연결되지 않았습니다. 0%가 아닙니다.",c:"C Programming · C 프로그래밍",notes:"Activity, quiz, execution self-report, verified assessment are different evidence types. · 코드와 노트는 전송하지 않습니다.",refresh:"Refresh · 새로고침",none:"No records · 기록 없음",record:"Recorded · 기록",available:"Core learning · 필수",updated:"Local browser · 브라우저 저장소",visit:"Open lesson · 단원 열기",practice:"Coding practice · 실습",sslink:"Open SS · SS 열기",progress:"Core activity completion · 필수 진도",local:"Same-origin local browser · 로컬 저장",unavailable:"Unavailable · 사용 불가",revisions:"Revision · 버전"}
};
const lang=window.ELSLanguage;
function t(k){return text[lang?.get()||"mixed"][k]}
function get(key){try{return localStorage.getItem(key)}catch(e){return null}}
function parse(key,fallback){try{const raw=get(key);return raw===null?fallback:JSON.parse(raw)}catch(e){return fallback}}
function indices(key,max){const v=parse(key,[]);return new Set(Array.isArray(v)?v.filter(n=>Number.isInteger(n)&&n>=0&&n<max):[])}
function countEvidence(key,max){const v=parse(key,{});if(!v||typeof v!=="object"||Array.isArray(v))return 0;return Object.entries(v).filter(([k,value])=>/^\d+$/.test(k)&&+k<max&&value?.checked===true).length}
function drafts(key,max){const v=parse(key,{});if(!v||typeof v!=="object"||Array.isArray(v))return 0;return Object.keys(v).filter(k=>/^\d+$/.test(k)&&+k<max&&typeof v[k]==="string"&&v[k].trim()).length}
function item(d){
 if(d.slug==="fileio"){
  const hasV2=get("els-fileio-progress-v2")!==null;
  const activity=indices(hasV2?"els-fileio-progress-v2":"els-fileio-progress-v1",8);
  if(get("els-fileio-integrated-m3-reflection")==="saved")activity.add(2);
  if(get("els-fileio-integrated-m4-reflection")==="saved")activity.add(4);
  let draftCount=0;
  for(let i=0;i<7;i++){const k=i===6?"els-c-fileio-practice-m1-v1":"els-c-fileio-practice-p"+(i+1);if((get(k)||"").trim())draftCount++}
  return {...d,activity:activity.size,activityCore:[...activity].filter(x=>x<d.core).length,concept:indices("els-concept-fileio-v1",8).size,conceptCore:indices("els-concept-fileio-v1",8).size,code:countEvidence("els-code-evidence-fileio-v1",7),draft:draftCount};
 }
 const a=indices("els-journey-"+d.slug+"-v"+d.v,d.n),c=indices("els-concept-"+d.slug+"-v"+d.v,d.n);
 return {...d,activity:a.size,activityCore:[...a].filter(x=>x<d.core).length,concept:c.size,conceptCore:[...c].filter(x=>x<d.core).length,code:countEvidence("els-code-evidence-"+d.slug+"-v"+d.pv,d.p),draft:drafts("els-code-"+d.slug+"-v"+d.pv,d.p)};
}
function el(tag,parent,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;if(parent)parent.append(n);return n}
function metric(parent,label,value){const div=el("div",parent,"metric");el("span",div,"small",label);el("strong",div,null,value)}
function panel(d){
 const card=el("article",$("course-grid"),"course-card");
 const header=el("div",card,"unit-head");el("h3",header,null,d.id+" · "+d.title);
 const pct=Math.round(d.activityCore/d.core*100);
 el("span",header,"pct",pct+"%");
 const bar=el("div",card,"bar");bar.setAttribute("role","progressbar");bar.setAttribute("aria-valuenow",String(d.activityCore));bar.setAttribute("aria-valuemax",String(d.core));bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-label",d.title+" "+t("progress"));
 el("span",bar,"fill").style.width=pct+"%";
 metric(card,t("activity"),d.activity+"/"+d.n+" ("+t("core")+" "+d.activityCore+"/"+d.core+")");
 metric(card,t("concept"),d.concept+"/"+d.n+" ("+t("core")+" "+d.conceptCore+"/"+d.core+")");
 metric(card,t("coding"),d.code+"/"+d.p);
 metric(card,t("draft"),String(d.draft));
 const links=el("div",card,"links");
 const slug=d.slug==="fileio"?"file-io":d.slug;
 for(const [label,url] of [[t("visit"),"../c-programming/"+slug+"/"],[t("practice"),"../c-programming/"+slug+"/practice/"]]){const a=el("a",links,null,label);a.href=url}
}
function render(){
 const list=catalog.map(item);const total=list.reduce((n,d)=>n+d.core,0),reviewed=list.reduce((n,d)=>n+d.activityCore,0),quiz=list.reduce((n,d)=>n+d.conceptCore,0),gcc=list.reduce((n,d)=>n+d.code,0),written=list.reduce((n,d)=>n+d.draft,0);
 document.documentElement.lang=lang?.get()==="en"?"en":"ko";
 for(const node of document.querySelectorAll("[data-t]"))node.textContent=t(node.dataset.t);
 $("summary").replaceChildren();
 metric($("summary"),t("activity"),reviewed+"/"+total);
 metric($("summary"),t("concept"),quiz+"/"+total);
 metric($("summary"),t("coding"),String(gcc));
 metric($("summary"),t("draft"),String(written));
 $("course-grid").replaceChildren();for(const d of list)panel(d);
 $("updated").textContent=t("updated")+" · "+new Date().toLocaleString();
}
$("refresh").addEventListener("click",render);
window.addEventListener("storage",event=>{if(event.key?.startsWith("els-"))render()});
window.addEventListener("pageshow",render);
lang?.subscribe(render);
render();
})();
