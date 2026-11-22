/* Fail-closed display gate for the public GitHub Pages /admin/ route.
 * The UI gate is NOT an access-control boundary: GitHub Pages serves static
 * HTML/JS publicly. The trusted Cloudflare Worker authenticates every
 * catalog API request by verifying a signed owner session.
 * No catalog editor or QA dashboard is displayed before a successful
 * authenticated server response.
 */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const section=$("admin-private"),notice=$("admin-config-note"),controls=$("github-auth-controls"),status=$("status");
const config=window.STUDIO_ADMIN_GITHUB||{};
let base=null,serial=0,qualityLoaded=false;
function lock(){
 section.hidden=true;
 section.inert=true;
 section.setAttribute("aria-hidden","true");
}
function unlock(){
 section.hidden=false;
 section.inert=false;
 section.removeAttribute("aria-hidden");
}
function message(text){if(status)status.textContent=text}
function script(path){
 const el=document.createElement("script");
 el.src=path;el.defer=true;
 el.onerror=()=>message("관리자 품질 관리 화면을 불러오지 못했습니다.");
 document.body.append(el);
}
function loadQuality(){
 if(qualityLoaded)return;
 qualityLoaded=true;
 script("./studio-quality.js?v=2");
 script("./ss-qa-dashboard.js?v=2");
}
lock();
try{
 if(config.enabled===true){
  base=new URL(config.workerUrl);
  if(base.protocol!=="https:"||base.pathname!=="/"||base.search||base.hash)base=null;
 }
}catch{base=null}
if(!base){
 notice.hidden=false;
 controls.hidden=true;
 message("접근 제한 중 · GitHub Owner 인증 서버 설정이 필요합니다. 인증 전에는 관리자 기능을 사용할 수 없습니다.");
 return;
}
notice.hidden=true;
controls.hidden=false;
message("관리자 GitHub 계정으로 로그인하세요.");
window.addEventListener("studio-admin-auth-state",async event=>{
 const id=++serial;
 lock();
 if(!event.detail?.authenticated){
  message("관리자 GitHub 계정으로 로그인하세요.");
  return;
 }
 message("서버에서 관리자 권한을 확인하는 중입니다.");
 try{
  const token=await window.StudioAdminOwner?.token?.();
  if(!token||id!==serial)return;
  const url=new URL("/api/catalog?course=c",base);
  const response=await fetch(url.href,{
   method:"GET",headers:{"Accept":"application/json","Authorization":"Bearer "+token},
   cache:"no-store"
  });
  if(!response.ok)throw new Error("관리자 서버 인증 실패 (HTTP "+response.status+")");
  const data=await response.json();
  if(id!==serial)return;
  if(!data||!data.catalog||!Array.isArray(data.catalog.chapters))throw new Error("인증된 서버 응답을 확인할 수 없습니다.");
  unlock();
  loadQuality();
  message("GitHub Owner 권한 검증 완료 · 관리 기능을 사용할 수 있습니다.");
 }catch(error){
  if(id!==serial)return;
  lock();
  message(error.message||"관리자 권한 검증 실패");
  window.StudioAdminOwner?.signOut?.();
 }
});
})();
