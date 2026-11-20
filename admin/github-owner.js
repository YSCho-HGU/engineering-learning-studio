/* Single-owner GitHub login. Only the Worker session token is held in this tab.
 * Raw GitHub OAuth and App tokens remain on the Cloudflare Worker.
 */
(()=>{
"use strict";
const config=window.STUDIO_ADMIN_GITHUB||{};
if(!config.enabled)return;
const button=document.getElementById("github-login"),logout=document.getElementById("github-logout");
const who=document.getElementById("github-user");
const status=document.getElementById("status");
let session=null,deadline=0,loginWindow=null,popupChecking=false;
const sessionKey="els-gh-owner-session-v1";
let base;
try{
 base=new URL(config.workerUrl);
 if(base.protocol!=="https:"||base.pathname!=="/"||base.search||base.hash)throw Error("Invalid Worker URL");
}catch(e){if(status)status.textContent="GitHub Worker 주소가 설정되지 않았습니다.";return;}
const broadcast=on=>window.dispatchEvent(new CustomEvent("studio-admin-auth-state",{
 detail:{authenticated:on,user:on?{login:who?.textContent||"GitHub Owner"}:null}
}));
function setSession(value,until,login){
 session=value||null;deadline=until||0;
 try{if(session)sessionStorage.setItem(sessionKey,JSON.stringify({token:session,until:deadline,login}));else sessionStorage.removeItem(sessionKey)}catch{}
 if(who)who.textContent=session?login+" · Owner": "관리자 로그인 필요";
 if(button)button.hidden=!!session;
 if(logout)logout.hidden=!session;
 broadcast(!!session);
}
function expires(){return !session||deadline<=Date.now()+4000}
window.StudioAdminOwner={
 async token(){
  if(expires()){setSession(null,0,"");throw Error("관리자 세션이 만료되었습니다. 다시 로그인하세요.");}
  return session;
 },
 signOut(){
  // Stateless Worker sessions expire after 30 minutes and survive only this tab.
  // Logging out discards its bearer, but cannot revoke already stolen tokens.
  setSession(null,0,"");
 }
};
button?.addEventListener("click",()=>{
 const url=new URL("/auth/github/start",base);
 const popup=window.open(url.href,"els-github-owner-login","popup,width=520,height=700");
 if(!popup){if(status)status.textContent="팝업 차단을 해제하고 다시 로그인하세요.";return}
 loginWindow=popup;popupChecking=true;
 if(status)status.textContent="GitHub 계정 인증을 진행하세요.";
});
logout?.addEventListener("click",()=>window.StudioAdminOwner.signOut());
try{
 const cached=JSON.parse(sessionStorage.getItem(sessionKey)||"null");
 if(cached&&typeof cached.token==="string"&&typeof cached.login==="string"&&cached.until>Date.now()+4000)setSession(cached.token,cached.until,cached.login);
 else sessionStorage.removeItem(sessionKey);
}catch{try{sessionStorage.removeItem(sessionKey)}catch{}}
window.addEventListener("message",event=>{
 if(event.origin!==base.origin||!loginWindow||event.source!==loginWindow)return;
 if(event.data?.type!=="els-github-login")return;
 const message=event.data;loginWindow=null;popupChecking=false;
 if(message.ok&&typeof message.session==="string"&&Number(message.expiresAt)>Date.now()&&typeof message.login==="string"){
  setSession(message.session,message.expiresAt,message.login);
  if(status)status.textContent="GitHub Owner 인증이 완료되었습니다.";
 }else{
  setSession(null,0,"");
  if(status)status.textContent=message.error||"GitHub 관리자 인증 실패";
 }
});
})();
