/* Google login is used only when Firebase administrator mode has been explicitly configured. */
(async()=>{
"use strict";
const settings=window.STUDIO_ADMIN_FIREBASE_CONFIG||{};
if(!settings.enabled)return;
const status=document.getElementById("status"),login=document.getElementById("firebase-login"),logout=document.getElementById("firebase-logout");
const info=document.getElementById("firebase-user");
const report=(message)=>{if(status)status.textContent=message;};
const notify=(user)=>window.dispatchEvent(new CustomEvent("studio-admin-auth-state",{detail:{authenticated:!!user,user:user?{email:user.email,uid:user.uid}:null}}));
try{
 if(!settings.apiUrl||!/^https:\/\//.test(settings.apiUrl)||!settings.firebase?.apiKey||!settings.firebase?.projectId||!settings.firebase?.authDomain||!settings.firebase?.appId)
  throw new Error("Firebase 관리 설정이 아직 완료되지 않았습니다.");
 const [{initializeApp},{getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged}]=await Promise.all([
  import("https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js"),
  import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js")
 ]);
 const app=initializeApp(settings.firebase,"studio-admin");
 const auth=getAuth(app),provider=new GoogleAuthProvider();
 provider.setCustomParameters({prompt:"select_account",hd:"handong.edu"});
 const allowed="yscho@handong.edu";
 window.StudioAdminFirebase={
  async token(){
   const user=auth.currentUser;
   if(!user||!user.emailVerified||user.email?.toLowerCase()!==allowed)throw new Error("승인된 관리자 계정으로 로그인해야 합니다.");
   return user.getIdToken();
  },
  async signIn(){
   const result=await signInWithPopup(auth,provider);
   if(result.user.email?.toLowerCase()!==allowed||!result.user.emailVerified){
    await signOut(auth);
    throw new Error("허용된 관리자 계정이 아닙니다.");
   }
  },
  async signOut(){await signOut(auth);}
 };
 login?.addEventListener("click",async()=>{login.disabled=true;try{await window.StudioAdminFirebase.signIn()}catch(e){report("Google 로그인 실패: "+String(e.message||e))}finally{login.disabled=false}});
 logout?.addEventListener("click",async()=>{logout.disabled=true;try{await window.StudioAdminFirebase.signOut()}finally{logout.disabled=false}});
 onAuthStateChanged(auth,async user=>{
  if(user&&(!user.emailVerified||user.email?.toLowerCase()!==allowed)){await signOut(auth);return;}
  if(info)info.textContent=user?(user.email+" · Google 인증됨"):"관리자 로그인 필요";
  if(login)login.hidden=!!user;
  if(logout)logout.hidden=!user;
  notify(user);
 });
}catch(e){report("Firebase 초기화 실패: "+String(e.message||e));if(login)login.disabled=true;notify(null);}
})();
