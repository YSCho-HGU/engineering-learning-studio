/* Admin: GitHub token is held in memory only, never persisted. */
(()=>{
"use strict";
const repo="YSCho-HGU/engineering-learning-studio";
const path="c-programming/course-catalog.json";
const api="https://api.github.com/repos/"+repo+"/contents/"+path;
const $=id=>document.getElementById(id);
let token="",sha="",catalog=null,baseVersion="",busy=false;
function status(message){$("message").textContent=message}
function headers(){return {"Accept":"application/vnd.github+json","Authorization":"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28"}}
function encodeUtf8(s){const bytes=new TextEncoder().encode(s);let raw="";for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(raw)}
function decodeUtf8(b){const raw=atob(b.replace(/\s/g,""));return new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0)))}
function safeLocalUrl(url){return typeof url==="string"&&/^\.\/[a-z0-9-]+\/$/.test(url)}
function validate(c){
 if(!c||c.schemaVersion!==1||!Array.isArray(c.groups)||!Array.isArray(c.chapters))throw Error("올바른 Chapter catalog 형식이 아닙니다.");
 const ids=new Set();for(const ch of c.chapters){if(ids.has(ch.id))throw Error("중복 chapter: "+ch.id);ids.add(ch.id)}
}
async function load(){
 if(!token){status("GitHub 토큰을 입력하세요.");return}
 try{
  busy=true;$("auth").disabled=true;$("save").disabled=true;status("GitHub 저장소의 공개 상태를 읽는 중입니다.");
  const r=await fetch(api,{headers:headers(),cache:"no-store"});
  if(!r.ok)throw Error("GitHub 인증 또는 읽기 실패 (HTTP "+r.status+")");
  const data=await r.json();
  const c=JSON.parse(decodeUtf8(data.content));validate(c);
  catalog=c;sha=data.sha;baseVersion=JSON.stringify(c.chapters.map(ch=>[ch.id,ch.published]));
  render();$("chapters").hidden=false;status("GitHub에서 최신 공개 상태를 불러왔습니다. 변경 후 저장하세요.");
 }catch(e){status(e.message);$("chapters").hidden=true}
 finally{busy=false;$("auth").disabled=false;$("save").disabled=false}
}
function render(){
 const root=$("chapter-list");root.replaceChildren();
 const byGroup=new Map(catalog.groups.map(g=>[g.id,[]]));
 for(const ch of catalog.chapters)byGroup.get(ch.group)?.push(ch);
 for(const group of catalog.groups){
  const section=document.createElement("section");section.className="group";
  const h=document.createElement("h3");h.textContent=group.title+" · "+group.en;section.append(h);
  const grid=document.createElement("div");grid.className="entries";section.append(grid);
  for(const ch of (byGroup.get(group.id)||[]).sort((a,b)=>a.chapter-b.chapter||Number(a.id)-Number(b.id))){
   const row=document.createElement("div");row.className="entry";
   const input=document.createElement("input");input.type="checkbox";input.id="c-"+ch.id;input.checked=Boolean(ch.published);input.dataset.chapterId=ch.id;
   const label=document.createElement("label");label.htmlFor=input.id;
   const title=document.createElement("strong");title.textContent=ch.id+" · "+ch.title;
   const caption=document.createElement("small");caption.textContent=(ch.published?"현재 공개":"현재 비공개")+" · "+ch.url;
   label.append(title,caption);row.append(input,label);grid.append(row);
   input.addEventListener("change",updateCount);
  }
  root.append(section);
 }
 updateCount();
}
function updateCount(){
 const count=[...document.querySelectorAll("[data-chapter-id]")].filter(i=>i.checked).length;
 $("count").textContent="공개 "+count+" / "+catalog.chapters.length+"개";
}
async function ensurePage(ch){
 if(!safeLocalUrl(ch.url))throw Error(ch.id+"번 단원 경로가 유효하지 않습니다.");
 // A published page must be present in GitHub repository, not just a stale Pages deployment.
 const slug=ch.url.slice(2,-1),filePath="c-programming/"+slug+"/index.html";
 const url="https://api.github.com/repos/"+repo+"/contents/"+filePath;
 const r=await fetch(url,{headers:headers(),cache:"no-store"});
 if(!r.ok)throw Error(ch.id+"번 학습 페이지가 없습니다 ("+filePath+", HTTP "+r.status+"). 먼저 페이지를 제작하세요.");
}
async function save(){
 if(busy||!catalog)return;
 const next=structuredClone(catalog);
 for(const ch of next.chapters)ch.published=Boolean($("c-"+ch.id)?.checked);
 const changed=next.chapters.filter((ch,i)=>ch.published!==catalog.chapters[i].published);
 if(!changed.length){status("변경된 공개 상태가 없습니다.");return}
 const newlyPublished=changed.filter(ch=>ch.published);
 if(!confirm("공개 "+next.chapters.filter(ch=>ch.published).length+"개로 변경합니다.\nGitHub Pages의 학생 화면에 반영되도록 저장할까요?"))return;
 try{
  busy=true;$("save").disabled=true;$("reload").disabled=true;
  for(const ch of newlyPublished){status(ch.id+"번 학습 파일 존재 여부 확인 중...");await ensurePage(ch)}
  const content=JSON.stringify(next,null,2)+"\n";
  status("GitHub에 공개 상태 저장 중...");
  const r=await fetch(api,{method:"PUT",headers:{...headers(),"Content-Type":"application/json"},body:JSON.stringify({message:"Update C course publication: "+changed.map(ch=>ch.id+"="+(ch.published?"public":"draft")).join(", "),content:encodeUtf8(content),sha})});
  if(!r.ok){let detail="";try{detail=(await r.json()).message}catch(e){}throw Error("저장 실패 (HTTP "+r.status+"): "+detail+". 최신 상태 다시 읽기로 충돌 여부를 확인하세요.")}
  const saved=await r.json();catalog=next;sha=saved.content.sha;baseVersion=JSON.stringify(next.chapters.map(ch=>[ch.id,ch.published]));render();
  status("공개 상태를 GitHub에 저장했습니다. GitHub Pages 배포 후 학생 화면에 반영됩니다.");
 }catch(e){status(e.message)}
 finally{busy=false;$("save").disabled=false;$("reload").disabled=false}
}
$("auth").addEventListener("click",()=>{token=$("token").value.trim();$("token").value="";load()});
$("clear").addEventListener("click",()=>{token="";sha="";catalog=null;$("token").value="";$("chapters").hidden=true;status("인증 정보를 이 페이지에서 지웠습니다.")});
$("save").addEventListener("click",save);
$("reload").addEventListener("click",()=>{if(confirm("저장하지 않은 설정을 버리고 GitHub 최신 설정을 불러올까요?"))load()});
})();
