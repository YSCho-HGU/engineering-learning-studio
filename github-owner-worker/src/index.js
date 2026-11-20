import {courseConfig,validateCatalog,publishedPagePath,ownerIdentity,HttpError} from "./catalog-core.js";

// Single-owner GitHub App OAuth and App installation API.
// No GitHub OAuth access token or GitHub App private key is ever sent to the browser.
const PUBLIC_ORIGIN="https://yscho-hgu.github.io";
const GITHUB_API="https://api.github.com";
const MAX_BODY=180000;
const SESSION_SECONDS=1800;
const encoder=new TextEncoder();
const decoder=new TextDecoder();

function base64url(bytes){
 let out="";for(let i=0;i<bytes.length;i+=32768)out+=String.fromCharCode(...bytes.slice(i,i+32768));
 return btoa(out).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function unbase64url(s){
 if(typeof s!=="string"||! /^[A-Za-z0-9_-]+$/.test(s))throw new Error("Malformed base64url");
 const bytes=atob(s.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-s.length%4)%4));
 return Uint8Array.from(bytes,c=>c.charCodeAt(0));
}
function randomToken(){return base64url(crypto.getRandomValues(new Uint8Array(32)))}
function now(){return Math.floor(Date.now()/1000)}
function hmacKey(secret){return crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"])}
async function signPayload(data,secret){
 const payload=base64url(encoder.encode(JSON.stringify(data)));
 const signature=base64url(new Uint8Array(await crypto.subtle.sign("HMAC",await hmacKey(secret),encoder.encode(payload))));
 return payload+"."+signature;
}
async function verifyPayload(value,secret){
 if(typeof value!=="string"||value.length>3000)return null;
 const parts=value.split(".");if(parts.length!==2)return null;
 try{
  const ok=await crypto.subtle.verify("HMAC",await hmacKey(secret),unbase64url(parts[1]),encoder.encode(parts[0]));
  return ok?JSON.parse(decoder.decode(unbase64url(parts[0]))):null;
 }catch{return null}
}
function error(status,message){return new HttpError(status,message)}
function responseJSON(data,status=200,headers={}){
 return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...headers}});
}
function cors(origin){
 return origin===PUBLIC_ORIGIN?{"Access-Control-Allow-Origin":PUBLIC_ORIGIN,"Access-Control-Allow-Methods":"GET, PUT, OPTIONS","Access-Control-Allow-Headers":"Authorization, Content-Type","Vary":"Origin"}:{"Vary":"Origin"};
}
function noStoreRedirect(location,extraHeaders={}){
 return new Response(null,{status:302,headers:{"Location":location,"Cache-Control":"no-store","Referrer-Policy":"no-referrer",...extraHeaders}});
}
function verifyConfig(env){
 for(const name of ["GITHUB_CLIENT_ID","GITHUB_CLIENT_SECRET","GITHUB_APP_ID","GITHUB_INSTALLATION_ID","GITHUB_APP_PRIVATE_KEY","OWNER_GITHUB_ID","SESSION_SECRET","OAUTH_CALLBACK_URL"]){
  if(typeof env[name]!=="string"||!env[name].trim())throw error(503,"GitHub 관리자 연동이 설정되지 않았습니다.");
 }
 if(!/^\d+$/.test(env.OWNER_GITHUB_ID)||env.SESSION_SECRET.length<32)throw error(503,"관리자 인증 설정이 유효하지 않습니다.");
 if(!env.GITHUB_APP_PRIVATE_KEY.includes("BEGIN PRIVATE KEY"))throw error(503,"GitHub App 키는 PKCS#8 PRIVATE KEY 형식이어야 합니다.");
 const callback=new URL(env.OAUTH_CALLBACK_URL);
 if(callback.protocol!=="https:"||callback.pathname!=="/auth/github/callback"||callback.search||callback.hash)throw error(503,"OAuth Callback 설정을 확인하세요.");
}
function setStateCookie(req,state){
 const host=new URL(req.url).hostname;
 const cookie="els_github_oauth_state="+state+"; Path=/auth/github; Max-Age=600; HttpOnly; Secure; SameSite=Lax";
 return host.endsWith(".workers.dev")?cookie:cookie;
}
function clearStateCookie(){
 return "els_github_oauth_state=; Path=/auth/github; Max-Age=0; HttpOnly; Secure; SameSite=Lax";
}
async function startOAuth(req,env){
 verifyConfig(env);
 // Only initiate login from the published admin origin (browser popup).
 const from=req.headers.get("Referer")||"";
 let referral;try{referral=new URL(from)}catch{throw error(403,"관리자 페이지에서 로그인을 시작하세요.");}
 // Browser default referrer policy strips the path on cross-origin navigation.
 if(referral.origin!==PUBLIC_ORIGIN)throw error(403,"관리자 페이지에서 로그인을 시작하세요.");
 const state=randomToken();
 const challenge=await signPayload({state,exp:now()+600},env.SESSION_SECRET);
 const u=new URL("https://github.com/login/oauth/authorize");
 u.searchParams.set("client_id",env.GITHUB_CLIENT_ID);
 u.searchParams.set("redirect_uri",env.OAUTH_CALLBACK_URL);
 u.searchParams.set("state",state);
 u.searchParams.set("allow_signup","false");
 return noStoreRedirect(u.toString(),{"Set-Cookie":setStateCookie(req,challenge)});
}
async function githubFetch(path,token,opts={}){
 const response=await fetch(GITHUB_API+path,{
  ...opts,
  headers:{"Accept":"application/vnd.github+json","Authorization":"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28","User-Agent":"ELS-Single-Owner-Admin",...(opts.headers||{})}
 });
 if(response.status===401||response.status===403)throw error(502,"GitHub 인증 또는 App 권한을 확인하세요.");
 return response;
}
async function exchangeGithubCode(code,env){
 const response=await fetch("https://github.com/login/oauth/access_token",{
  method:"POST",
  headers:{"Accept":"application/json","Content-Type":"application/json","User-Agent":"ELS-Single-Owner-Admin"},
  body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:env.OAUTH_CALLBACK_URL})
 });
 if(!response.ok)throw error(502,"GitHub 로그인 토큰 교환 실패");
 const data=await response.json();
 if(!data.access_token||data.error)throw error(401,"GitHub 로그인 승인에 실패했습니다.");
 return data.access_token;
}
function callbackPage(result){
 // CSP nonce and fixed target origin; popup does not expose the raw GitHub token.
 const nonce=randomToken();
 const script="window.opener?.postMessage("+JSON.stringify(result)+","+JSON.stringify(PUBLIC_ORIGIN)+");window.close();";
 const html='<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>GitHub 관리자 로그인</title></head><body><p>인증 결과를 관리자 창으로 전달했습니다. 창이 닫히지 않으면 닫아주세요.</p><script nonce="'+nonce+'">'+script+'</script></body></html>';
 return new Response(html,{status:200,headers:{
  "Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store",
  "Content-Security-Policy":"default-src 'none'; script-src 'nonce-"+nonce+"'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff","Set-Cookie":clearStateCookie()
 }});
}
async function callback(req,env){
 verifyConfig(env);
 const url=new URL(req.url),cookie=req.headers.get("Cookie")||"";
 const stateCookie=cookie.match(/(?:^|;\s*)els_github_oauth_state=([^;]+)/)?.[1];
 const claimed=stateCookie&&await verifyPayload(stateCookie,env.SESSION_SECRET);
 const incoming=url.searchParams.get("state");
 if(!claimed||claimed.exp<=now()||!incoming||claimed.state!==incoming)throw error(403,"GitHub 인증 상태 검증 실패");
 const code=url.searchParams.get("code");
 if(!code||code.length>1000)throw error(400,"GitHub 인증 코드가 없습니다.");
 const oauthToken=await exchangeGithubCode(code,env);
 const [profileResponse,emailResponse]=await Promise.all([
  githubFetch("/user",oauthToken),
  githubFetch("/user/emails",oauthToken)
 ]);
 if(!profileResponse.ok||!emailResponse.ok)throw error(403,"GitHub 사용자와 검증 이메일을 확인할 수 없습니다. GitHub App의 Email addresses: Read 권한을 확인하세요.");
 const profile=await profileResponse.json(),emails=await emailResponse.json();
 if(!ownerIdentity(profile,emails,env.OWNER_GITHUB_ID))throw error(403,"승인된 GitHub 관리자 계정이 아닙니다.");
 const timestamp=now();
 const token=await signPayload({type:"els-owner",uid:String(profile.id),iat:timestamp,exp:timestamp+SESSION_SECONDS,nonce:randomToken()},env.SESSION_SECRET);
 return callbackPage({type:"els-github-login",ok:true,session:token,expiresAt:(timestamp+SESSION_SECONDS)*1000,login:profile.login});
}
async function authorize(req,env){
 const token=req.headers.get("Authorization")?.match(/^Bearer ([A-Za-z0-9._-]+)$/)?.[1];
 if(!token)throw error(401,"GitHub 관리자 로그인이 필요합니다.");
 const info=await verifyPayload(token,env.SESSION_SECRET);
 if(!info||info.type!=="els-owner"||info.exp<=now()||info.iat>now()+30||info.uid!==String(env.OWNER_GITHUB_ID))throw error(401,"관리자 세션이 만료되었거나 유효하지 않습니다.");
 return info;
}
function encodePEM(pem){
 const body=pem.replace(/\\n/g,"\n").replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----|-----END (?:RSA )?PRIVATE KEY-----|\s/g,"");
 return Uint8Array.from(atob(body),c=>c.charCodeAt(0));
}
async function appJwt(env){
 const key=await crypto.subtle.importKey("pkcs8",encodePEM(env.GITHUB_APP_PRIVATE_KEY),
  {name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
 const header=base64url(encoder.encode(JSON.stringify({alg:"RS256",typ:"JWT"})));
 const payload=base64url(encoder.encode(JSON.stringify({iat:now()-60,exp:now()+540,iss:env.GITHUB_APP_ID})));
 const toSign=header+"."+payload;
 const sig=base64url(new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,encoder.encode(toSign))));
 return toSign+"."+sig;
}
async function installationToken(env){
 const jwt=await appJwt(env);
 const response=await githubFetch("/app/installations/"+encodeURIComponent(env.GITHUB_INSTALLATION_ID)+"/access_tokens",jwt,{method:"POST"});
 if(!response.ok)throw error(502,"GitHub App 설치와 저장소 권한을 확인하세요.");
 return (await response.json()).token;
}
async function repoFile(token,repo,path){
 const url="/repos/YSCho-HGU/"+encodeURIComponent(repo)+"/contents/"+path.split("/").map(encodeURIComponent).join("/")+"?ref=main";
 const response=await githubFetch(url,token);
 if(response.status===404)throw error(404,"강의 카탈로그 또는 학습 페이지를 찾을 수 없습니다.");
 if(!response.ok)throw error(502,"GitHub 저장소 조회에 실패했습니다.");
 const data=await response.json();
 if(data.type!=="file"||typeof data.content!=="string")throw error(502,"카탈로그 파일 형식 오류");
 return {sha:data.sha,text:decoder.decode(Uint8Array.from(atob(data.content.replace(/\s/g,"")),c=>c.charCodeAt(0)))};
}
async function catalog(req,env,url){
 verifyConfig(env);
 await authorize(req,env);
 const course=url.searchParams.get("course");
 const cfg=courseConfig(course);
 const githubToken=await installationToken(env);
 const repo=cfg.repo.split("/")[1];
 const original=await repoFile(githubToken,repo,cfg.path);
 let originalCatalog;
 try{originalCatalog=JSON.parse(original.text)}catch{throw error(502,"카탈로그 JSON이 올바르지 않습니다.");}
 if(req.method==="GET")return responseJSON({course,sha:original.sha,catalog:originalCatalog},200,cors(PUBLIC_ORIGIN));
 if(req.method!=="PUT")throw error(405,"GET/PUT만 허용됩니다.");
 if(!req.headers.get("Content-Type")?.startsWith("application/json"))throw error(415,"JSON 요청만 허용됩니다.");
 if(Number(req.headers.get("Content-Length")||0)>MAX_BODY)throw error(413,"요청이 너무 큽니다.");
 const content=await req.text();
 if(content.length>MAX_BODY)throw error(413,"요청이 너무 큽니다.");
 let data;try{data=JSON.parse(content)}catch{throw error(400,"JSON 요청 형식을 확인하세요.");}
 if(!data||typeof data!=="object"||Object.keys(data).sort().join(",")!=="catalog,sha"||! /^[0-9a-f]{40}$/.test(data.sha))throw error(400,"잘못된 수정 요청입니다.");
 if(data.sha!==original.sha)throw error(409,"카탈로그가 이미 변경되었습니다. 새로고침 후 다시 저장하세요.");
 const changes=validateCatalog(originalCatalog,data.catalog,course);
 if(changes.length===0)return responseJSON({sha:original.sha,changed:[]},200,cors(PUBLIC_ORIGIN));
 for(const changed of changes.filter(x=>x.after.published&&!x.before.published)){
  const path=publishedPagePath(course,changed.after);
  await repoFile(githubToken,repo,path);
 }
 const bytes=encoder.encode(JSON.stringify(data.catalog,null,2)+"\n");
 const ghResponse=await githubFetch("/repos/YSCho-HGU/"+encodeURIComponent(repo)+"/contents/"+cfg.path,githubToken,{
  method:"PUT",headers:{"Content-Type":"application/json"},
  body:JSON.stringify({message:"admin: update "+course+" chapters "+changes.map(x=>x.id).join(","),content:base64url(bytes).replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-base64url(bytes).length%4)%4),sha:original.sha,branch:"main"})
 });
 if(ghResponse.status===409||ghResponse.status===422)throw error(409,"저장소 충돌입니다. 새로고침 후 다시 저장하세요.");
 if(!ghResponse.ok)throw error(502,"GitHub 저장에 실패했습니다.");
 const saved=await ghResponse.json();
 return responseJSON({sha:saved.content?.sha,changed:changes.map(x=>x.id),commit:saved.commit?.sha},200,cors(PUBLIC_ORIGIN));
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  try{
   if(url.pathname==="/auth/github/start"&&request.method==="GET")return await startOAuth(request,env);
   if(url.pathname==="/auth/github/callback"&&request.method==="GET")return await callback(request,env);
   if(url.pathname==="/api/catalog"){
    const origin=request.headers.get("Origin")||"";
    if(origin!==PUBLIC_ORIGIN)throw error(403,"허용되지 않은 관리자 화면입니다.");
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors(origin)});
    return await catalog(request,env,url);
   }
   return responseJSON({error:"Not found"},404);
  }catch(e){
   const status=e instanceof HttpError?e.status:500;
   if(status>=500)console.error("ELS Worker",{name:e?.name,message:e?.message});
   if(url.pathname==="/auth/github/callback"){
    return callbackPage({type:"els-github-login",ok:false,error:status>=500?"서버 설정을 확인하세요.":e.message});
   }
   return responseJSON({error:status>=500?"관리 서버 오류가 발생했습니다.":e.message},status,cors(request.headers.get("Origin")||""));
  }
 }
};
