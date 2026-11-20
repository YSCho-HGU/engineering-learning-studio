import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {initializeApp as initializeAdminApp,getApps} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {createAppAuth} from "@octokit/auth-app";
import {Octokit} from "@octokit/rest";
import {createHash} from "node:crypto";
import {COURSES,ADMIN_EMAIL,ADMIN_ORIGIN,HttpError,authorizedIdentity,courseConfig,validateCatalog,publishedPagePath} from "./catalog-core.mjs";

if(!getApps().length)initializeAdminApp();
const githubAppId=defineSecret("GITHUB_APP_ID");
const githubInstallationId=defineSecret("GITHUB_INSTALLATION_ID");
const githubPrivateKey=defineSecret("GITHUB_APP_PRIVATE_KEY");
const adminUid=defineSecret("ADMIN_FIREBASE_UID");
const allowedOrigins=new Set([ADMIN_ORIGIN,"https://yscho-hgu.github.io"]);
const maxBodyBytes=180000;
function headers(res,origin){
 res.setHeader("Vary","Origin");
 res.setHeader("Cache-Control","no-store");
 res.setHeader("X-Content-Type-Options","nosniff");
 if(allowedOrigins.has(origin)){
  res.setHeader("Access-Control-Allow-Origin",origin);
  res.setHeader("Access-Control-Allow-Methods","GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Authorization, Content-Type");
  res.setHeader("Access-Control-Max-Age","600");
 }
}
function fail(res,error){
 const status=error instanceof HttpError?error.status:500;
 if(status>=500)console.error("Admin API failure",{kind:error?.name||"Error",message:error?.message||"unknown"});
 else console.warn("Admin API rejected",{status,message:error.message});
 res.status(status).json({error:status>=500?"관리 API 처리 중 오류가 발생했습니다.":error.message});
}
async function identify(req){
 const token=req.headers.authorization?.match(/^Bearer ([A-Za-z0-9._-]+)$/)?.[1];
 if(!token||token.length>6000)throw new HttpError(401,"로그인 세션이 없습니다.");
 let decoded;
 try{decoded=await getAuth().verifyIdToken(token,true)}catch{throw new HttpError(401,"로그인이 만료되었거나 인증되지 않았습니다.");}
 if(!authorizedIdentity(decoded,adminUid.value()))throw new HttpError(403,"승인된 관리자 계정이 아닙니다.");
 return decoded;
}
async function github(){
 const appId=Number(githubAppId.value());
 const installationId=Number(githubInstallationId.value());
 const privateKey=githubPrivateKey.value().replace(/\\n/g,"\n");
 if(!Number.isSafeInteger(appId)||appId<=0||!Number.isSafeInteger(installationId)||installationId<=0||!privateKey.includes("BEGIN")||!privateKey.includes("PRIVATE KEY"))throw new Error("GitHub App secrets unavailable");
 const auth=createAppAuth({appId,privateKey,installationId});
 const result=await auth({type:"installation",installationId});
 return new Octokit({auth:result.token,request:{timeout:15000}});
}
function asContent(response){
 const data=response.data;
 if(!data||Array.isArray(data)||data.type!=="file"||typeof data.content!=="string")throw new Error("Expected GitHub catalog file");
 const bytes=Buffer.from(data.content.replace(/\s/g,""),"base64");
 if(bytes.length>maxBodyBytes)throw new Error("Oversized catalog");
 return {catalog:JSON.parse(bytes.toString("utf8")),sha:data.sha};
}
async function readCatalog(api,cfg){
 try{return asContent(await api.rest.repos.getContent({owner:"YSCho-HGU",repo:cfg.repo.split("/")[1],path:cfg.path,ref:"main"}));}
 catch(e){if(e.status===404)throw new HttpError(404,"카탈로그 파일이 없습니다.");throw e}
}
async function checkPublishing(api,cfg,course,changes){
 for(const change of changes.filter(c=>c.after.published&&!c.before.published)){
  const path=publishedPagePath(course,change.after);
  try{
   await api.rest.repos.getContent({owner:"YSCho-HGU",repo:cfg.repo.split("/")[1],path,ref:"main"});
  }catch(e){if(e.status===404)throw new HttpError(400,change.id+"번 콘텐츠 페이지가 존재하지 않아 공개할 수 없습니다.");throw e}
 }
}
export const adminCatalog=onRequest({
 region:"asia-northeast3",
 memory:"256MiB",
 timeoutSeconds:30,
 maxInstances:5,
 invoker:"public", // HTTP entrypoint; Firebase identity is verified on every request below.
 secrets:[githubAppId,githubInstallationId,githubPrivateKey,adminUid]
},async(req,res)=>{
 const origin=req.headers.origin||"";
 headers(res,origin);
 if(!allowedOrigins.has(origin))return res.status(403).json({error:"허용되지 않은 요청 출처입니다."});
 if(req.method==="OPTIONS")return res.status(204).end();
 if(!["GET","PUT"].includes(req.method))return res.status(405).json({error:"지원하지 않는 요청입니다."});
 try{
  const actor=await identify(req);
  const course=req.query.course;
  const cfg=courseConfig(course);
  const api=await github();
  const current=await readCatalog(api,cfg);
  if(req.method==="GET")return res.status(200).json({catalog:current.catalog,sha:current.sha,course});
  if(!String(req.headers["content-type"]||"").startsWith("application/json"))throw new HttpError(415,"JSON 요청만 허용됩니다.");
  const size=Number(req.headers["content-length"]||0);
  if(size>maxBodyBytes)throw new HttpError(413,"요청이 너무 큽니다.");
  const body=req.body;
  if(!body||typeof body!=="object"||Array.isArray(body)||typeof body.sha!=="string"||!body.catalog)throw new HttpError(400,"잘못된 수정 요청입니다.");
  if(!/^[0-9a-f]{40}$/.test(body.sha))throw new HttpError(400,"잘못된 파일 버전입니다.");
  if(body.sha!==current.sha)throw new HttpError(409,"다른 수정이 먼저 반영되었습니다. 최신 설정을 다시 읽으세요.");
  const changes=validateCatalog(current.catalog,body.catalog,course);
  if(!changes.length)return res.status(200).json({catalog:current.catalog,sha:current.sha,changed:[]});
  await checkPublishing(api,cfg,course,changes);
  const encoded=Buffer.from(JSON.stringify(body.catalog,null,2)+"\n","utf8").toString("base64");
  const digest=createHash("sha256").update(changes.map(x=>x.id).join(",")).digest("hex").slice(0,10);
  let result;
  try{
   result=await api.rest.repos.createOrUpdateFileContents({
    owner:"YSCho-HGU",repo:cfg.repo.split("/")[1],path:cfg.path,branch:"main",
    message:"admin: update "+course+" chapters "+changes.map(x=>x.id).join(",")+" (firebase-admin "+actor.uid.slice(0,10)+", "+digest+")",
    sha:current.sha,content:encoded,
    committer:{name:"Engineering Learning Studio Admin",email:"yscho@handong.edu"}
   });
  }catch(e){if(e.status===409||e.status===422)throw new HttpError(409,"카탈로그 버전 충돌이 발생했습니다. 다시 불러오세요.");throw e}
  console.info("Admin catalog update",{course,uid:actor.uid,chapterIds:changes.map(x=>x.id),commit:result.data.commit?.sha});
  return res.status(200).json({catalog:body.catalog,sha:result.data.content.sha,changed:changes.map(x=>x.id),commit:result.data.commit?.sha});
 }catch(e){return fail(res,e)}
});
