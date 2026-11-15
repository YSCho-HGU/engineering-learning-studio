/* C course public catalog. Source of truth: course-catalog.json.
   Publication means an entry is listed; it is not access control. */
(async()=>{
"use strict";
const $=id=>document.getElementById(id);
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeLocalPath=url=>typeof url==="string"&&/^\.\/[a-z0-9-]+\/$/.test(url)?url:null;
const safeBook=url=>{
 if(typeof url!=="string")return null;
 try{
  const u=new URL(url);
  if(u.protocol!=="https:")return null;
  if(u.hostname==="drive.google.com"&&/^\/file\/d\/[a-zA-Z0-9_-]+\/view$/.test(u.pathname))return url;
  if(u.hostname==="docs.google.com"&&/^\/(?:document|presentation|spreadsheets)\/d\/[a-zA-Z0-9_-]+\/.+/.test(u.pathname))return url;
 }catch(e){}
 return null;
};
function roadmapNavigation(){
 function show(){
  const pane=$("course-overview-details");if(!pane)return;
  pane.open=true;
  requestAnimationFrame(()=>{$("roadmap").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"})});
 }
 for(const id of ["course-roadmap-link","overview-action"]){
  $(id)?.addEventListener("click",e=>{e.preventDefault();history.replaceState(null,"","#roadmap");show()});
 }
 if(location.hash==="#roadmap")show();
 window.addEventListener("hashchange",()=>{if(location.hash==="#roadmap")show()});
}
roadmapNavigation();
function render(catalog){
 const chapters=catalog.chapters.slice().sort((a,b)=>Number(a.chapter)-Number(b.chapter)||Number(a.id)-Number(b.id));
 const lookup=new Map(chapters.map(c=>[c.id,c]));
 const ready=chapters.filter(c=>c.published&&safeLocalPath(c.url));
 const card=c=>{
  const id=escape(c.id),title=escape(c.title),name=escape(c.chapter),desc=escape(c.description);
  const book=safeBook(c.book);
  return '<article class="path-card"><span class="number">'+name+' / Chapter '+name+'</span><h3>'+title+'</h3><p>'+desc+'</p><a class="open stretch-link" href="'+c.url+'" aria-label="Chapter '+name+' '+title+' 학습 열기">학습 시작 <span aria-hidden="true">→</span></a><div class="resource-links">'+(book?'<a href="'+book+'" target="_blank" rel="noopener noreferrer">교재 '+id+' ↗</a>':'')+'</div></article>';
 };
 $("available-count").textContent=ready.length+"개 단원 공개";
 $("available-chapters").innerHTML=ready.map(card).join("");
 $("available-overview-count").textContent=ready.length+"개";
 $("pending-overview-count").textContent=(chapters.length-ready.length)+"개";
 $("units").innerHTML=catalog.groups.map((group,index)=>{
  const entries=chapters.filter(c=>c.group===group.id);
  const body=entries.map(c=>{
   const active=c.published&&safeLocalPath(c.url);
   const title=escape(c.title),id=escape(c.id);
   const detail=active?(c.id==="181"?"필수 4단계 · 선택 심화 4단계":"인터랙티브 학습 공개"):"학습 콘텐츠 준비 중";
   const content='<span class="id">'+id+'</span><span class="details"><strong>'+title+'</strong><small>'+detail+'</small></span>';
   return active?'<a class="unit unit-live" href="'+c.url+'" aria-label="'+id+' '+title+' 학습 열기"><span class="unit-status live" aria-label="학습 가능"><span class="status-dot" aria-hidden="true"></span>학습 가능</span>'+content+'<span class="unit-action" aria-hidden="true">열기 →</span></a>':'<article class="unit unit-pending" aria-label="'+id+' '+title+' 준비 중"><span class="unit-status pending"><span class="status-dot" aria-hidden="true"></span>준비 중</span>'+content+'</article>';
  }).join("");
  const count=entries.filter(c=>c.published&&safeLocalPath(c.url)).length;
  return '<section class="course-group'+(count===0?' course-group-upcoming':'')+'" aria-labelledby="course-group-'+index+'"><div class="course-group-head"><div><span class="course-group-kicker">'+String(index+1).padStart(2,"0")+' · '+escape(group.en)+'</span><h3 id="course-group-'+index+'">'+escape(group.title)+'</h3><p>'+escape(group.description)+'</p></div><span class="course-group-count'+(count>0?' has-live':'')+'">'+(count?count+' / '+entries.length+' 학습 가능':'공개 준비 중')+'</span></div><div class="unit-grid">'+body+'</div></section>';
 }).join("");
}
try{
 const response=await fetch("./course-catalog.json",{cache:"no-store"});
 if(!response.ok)throw Error("HTTP "+response.status);
 const catalog=await response.json();
 if(!Array.isArray(catalog.chapters)||!Array.isArray(catalog.groups))throw Error("Invalid chapter catalog");
 render(catalog);
}catch(e){
 $("available-count").textContent="단원 정보를 불러오지 못했습니다";
 $("available-chapters").textContent="단원 목록을 표시하지 못했습니다. 페이지를 새로고침해 주세요.";
 $("units").textContent="Course Overview를 불러올 수 없습니다.";
 console.error("C course catalog:",e);
}
})();