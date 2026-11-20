/* Unified studio course manager. Credentials remain in this page's memory. */
(()=>{
"use strict";
const COURSES={
 c:{repo:"YSCho-HGU/engineering-learning-studio",path:"c-programming/course-catalog.json",pagePrefix:"c-programming/",name:"C Programming",home:"../c-programming/"},
 ss:{repo:"YSCho-HGU/signals-systems-visual-lab",path:"course-catalog.json",pagePrefix:null,name:"Signals & Systems",home:"https://yscho-hgu.github.io/signals-systems-visual-lab/"}
};
const $=id=>document.getElementById(id);
const ownerSettings=window.STUDIO_ADMIN_GITHUB||{};
const secureMode=ownerSettings.enabled===true;
let selected="c",token="",catalog=null,sha="",busy=false,secureIdentity=null;
function apiURL(){return new URL("/api/catalog?course="+encodeURIComponent(selected),ownerSettings.workerUrl).href}
async function ownerHeaders(){return {"Accept":"application/json","Authorization":"Bearer "+await window.StudioAdminOwner.token()}}
function isSignedIn(){return !!secureIdentity&&!!window.StudioAdminOwner}
function msg(text){$("status").textContent=text}
function authHeader(){return {"Accept":"application/vnd.github+json","Authorization":"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28"}}
function apiPath(file){return "https://api.github.com/repos/"+COURSES[selected].repo+"/contents/"+file}
function encode(s){const bytes=new TextEncoder().encode(s);let b="";for(let i=0;i<bytes.length;i+=8192)b+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(b)}
function decode(content){const raw=atob(content.replace(/\s/g,""));return new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0)))}
function courseChange(id){
 selected=id;token="";catalog=null;sha="";$("token").value="";$("editor").hidden=true;
 $("course-c").setAttribute("aria-selected",String(id==="c"));
 $("course-ss").setAttribute("aria-selected",String(id==="ss"));
 $("repo-label").textContent="Repository: "+COURSES[id].repo+" · "+COURSES[id].path;
 if(secureMode)msg(COURSES[id].name+(isSignedIn()?" · GitHub Owner 계정으로 최신 강의 설정을 읽습니다.":" · GitHub Owner 로그인이 필요합니다."));
 else msg(COURSES[id].name+" 관리 모드입니다. 해당 저장소 권한으로 인증하세요.");
 if(secureMode&&isSignedIn())load();
}
function check(data){
 if(!data||data.schemaVersion!==1||!Array.isArray(data.chapters))throw Error("잘못된 카탈로그 형식입니다.");
 const seen=new Set();
 for(const ch of data.chapters){
  if(seen.has(ch.id))throw Error("중복 단원 ID: "+ch.id);
  seen.add(ch.id);
 }
}
function field(host,id,key,title,value,multi=false){
 const label=document.createElement("label");label.textContent=title;
 const control=document.createElement(multi?"textarea":"input");if(!multi)control.type="text";
 control.id=key+"-"+id;control.value=value||"";control.maxLength=key==="title"?120:key==="description"?600:400;
 if(key==="book")control.placeholder="https://drive.google.com/file/d/...";
 label.append(control);host.append(label);
}
function render(){
 const root=$("chapter-list");root.replaceChildren();
 const groupList=selected==="c"?catalog.groups.map(g=>({id:g.id,title:g.title,chapters:catalog.chapters.filter(c=>c.group===g.id)})):
 [{id:"ss",title:"Signals & Systems · Chapter 1–8",chapters:catalog.chapters}];
 for(const g of groupList){
  const section=document.createElement("section");section.className="group";
  const h=document.createElement("h3");h.textContent=g.title;section.append(h);
  const grid=document.createElement("div");grid.className="chapters";section.append(grid);
  for(const ch of g.chapters.slice().sort((a,b)=>Number(a.chapter??a.id)-Number(b.chapter??b.id)||Number(a.id)-Number(b.id))){
   const row=document.createElement("article");row.className="chapter";
   const top=document.createElement("div");top.className="chapter-top";
   const strong=document.createElement("strong");strong.textContent=(selected==="c"?ch.id+" / Chapter "+ch.chapter:"Chapter "+ch.id);
   const checkLabel=document.createElement("label");
   const toggle=document.createElement("input");toggle.type="checkbox";toggle.id="publish-"+ch.id;toggle.checked=!!ch.published;toggle.addEventListener("change",count);
   checkLabel.append(toggle,document.createTextNode("공개"));top.append(strong,checkLabel);
   const fields=document.createElement("div");fields.className="fields";
   field(fields,ch.id,"title","단원 제목",ch.title);
   if(selected==="ss")field(fields,ch.id,"sub","부제",ch.sub);
   field(fields,ch.id,"description","설명",ch.description,true);
   field(fields,ch.id,"book","교재 링크 (선택)",ch.book);
   row.append(top,fields);grid.append(row);
  }
  root.append(section);
 }
 $("editor-title").textContent=COURSES[selected].name+" · 공개 및 단원 정보";
 count();
}
function count(){
 if(!catalog)return;
 $("count").textContent="공개 "+catalog.chapters.filter(ch=>$("publish-"+ch.id)?.checked).length+" / "+catalog.chapters.length;
}
function validBook(url){return !url||/^https:\/\/(?:drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view(?:\?[^#\s]*)?|docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9/?=&_.-]*)$/.test(url)}
function nextCatalog(){
 const next=JSON.parse(JSON.stringify(catalog));
 for(const ch of next.chapters){
  ch.published=$("publish-"+ch.id).checked;
  ch.title=$("title-"+ch.id).value.trim();
  if(selected==="ss")ch.sub=$("sub-"+ch.id).value.trim();
  ch.description=$("description-"+ch.id).value.trim();
  const book=$("book-"+ch.id).value.trim();
  if(book)ch.book=book;else delete ch.book;
  if(!ch.title)throw Error(ch.id+"번 제목을 입력하세요.");
  if(!validBook(book))throw Error(ch.id+"번 교재 링크가 허용된 Google Drive/Docs 형식이 아닙니다.");
 }
 return next;
}
async function ensurePage(ch){
 if(selected==="c"){
  if(!/^\.\/[a-z0-9-]+\/$/.test(ch.url))throw Error(ch.id+"번 경로 오류");
  const p="c-programming/"+ch.url.slice(2)+"index.html";
  const res=await fetch(apiPath(p),{headers:authHeader(),cache:"no-store"});
  if(!res.ok)throw Error(ch.id+"번 학습 페이지가 없습니다: "+p+" (HTTP "+res.status+")");
 }else{
  // All eight S&S chapters are embedded in index.html; check only the known chapter range.
  if(!/^[1-8]$/.test(String(ch.id)))throw Error("Unknown S&S chapter "+ch.id);
  const res=await fetch(apiPath("index.html"),{headers:authHeader(),cache:"no-store"});
  if(!res.ok)throw Error("S&S index.html 확인 실패 (HTTP "+res.status+")");
 }
}
async function load(){
 if(secureMode&&!isSignedIn()){msg("GitHub Owner 계정으로 로그인하세요.");return;}
 if(!secureMode&&!token){msg("토큰을 입력하세요.");return}
 try{
  busy=true;$("connect").disabled=true;$("save").disabled=true;
  msg("선택한 과목의 GitHub 공개 설정을 읽는 중...");
  const requested=selected;
  const res=secureMode?
    await fetch(apiURL(),{headers:await ownerHeaders(),cache:"no-store"}):
    await fetch(apiPath(COURSES[selected].path),{headers:authHeader(),cache:"no-store"});
  if(!res.ok){const issue=await res.json().catch(()=>({}));throw Error(issue.error||"인증/조회 실패 HTTP "+res.status);}
  const data=await res.json(),loaded=secureMode?data.catalog:JSON.parse(decode(data.content));
  if(requested!==selected||secureMode&&!isSignedIn())return;
  check(loaded);catalog=loaded;sha=data.sha;render();$("editor").hidden=false;
  msg("최신 데이터 불러오기 완료. 수정 사항은 저장 전까지 게시되지 않습니다.");
 }catch(e){msg(e.message);$("editor").hidden=true}
 finally{busy=false;$("connect").disabled=false;$("save").disabled=false}
}
async function save(){
 if(busy||!catalog)return;
 let next;try{next=nextCatalog()}catch(e){msg(e.message);return}
 const changed=next.chapters.filter((c,i)=>JSON.stringify(c)!==JSON.stringify(catalog.chapters[i]));
 if(!changed.length){msg("변경한 항목이 없습니다.");return}
 if(!confirm(COURSES[selected].name+" · "+changed.length+"개 단원 변경 내용을 GitHub에 저장할까요?"))return;
 const newly=changed.filter(c=>c.published&&!catalog.chapters.find(old=>old.id===c.id)?.published);
 try{
  busy=true;$("save").disabled=true;$("reload").disabled=true;
  if(!secureMode)for(const ch of newly){msg(ch.id+"번 학습 콘텐츠 확인 중...");await ensurePage(ch)}
  msg("GitHub에 저장 중...");
  const currentSelection=selected;
  const res=secureMode?
   await fetch(apiURL(),{
    method:"PUT",headers:{...await ownerHeaders(),"Content-Type":"application/json"},
    body:JSON.stringify({sha,catalog:next})
   }):
   await fetch(apiPath(COURSES[selected].path),{
    method:"PUT",headers:{...authHeader(),"Content-Type":"application/json"},
    body:JSON.stringify({message:"Manage "+COURSES[selected].name+" chapter metadata: "+changed.map(c=>c.id).join(","),content:encode(JSON.stringify(next,null,2)+"\n"),sha})
   });
  if(!res.ok){let info="";try{const data=await res.json();info=data.error||data.message||""}catch(e){}throw Error("저장 실패 HTTP "+res.status+": "+info+". 최신 설정을 다시 읽어 충돌을 확인하세요.")}
  const result=await res.json();
  if(currentSelection!==selected||secureMode&&!isSignedIn())return;
  catalog=next;sha=secureMode?result.sha:result.content.sha;render();
  msg("GitHub에 변경 사항 저장 완료. Pages 배포 후 학생 화면을 새로고침하면 반영됩니다.");
 }catch(e){msg(e.message)}
 finally{busy=false;$("save").disabled=false;$("reload").disabled=false}
}
$("course-c").addEventListener("click",()=>courseChange("c"));
$("course-ss").addEventListener("click",()=>courseChange("ss"));
$("connect").addEventListener("click",()=>{if(secureMode)return;token=$("token").value.trim();$("token").value="";load()});
$("clear").addEventListener("click",()=>{if(secureMode)return;token="";catalog=null;sha="";$("token").value="";$("editor").hidden=true;msg("이 탭의 인증 정보를 지웠습니다.")});
$("save").addEventListener("click",save);
$("reload").addEventListener("click",()=>{if(confirm("저장 전 변경 사항을 버리고 최신 데이터를 불러올까요?"))load()});
if(secureMode){
 $("legacy-auth-controls").hidden=true;
 $("legacy-auth-copy").hidden=true;
 $("github-auth-controls").hidden=false;
 window.addEventListener("studio-admin-auth-state",event=>{
  secureIdentity=event.detail?.authenticated?event.detail.user:null;
  token="";catalog=null;sha="";$("editor").hidden=true;
  $("save").disabled=!secureIdentity;
  if(secureIdentity)load();else msg("GitHub Owner로 로그인하면 단원 정보를 편집할 수 있습니다.");
 });
}
courseChange("c");
})();