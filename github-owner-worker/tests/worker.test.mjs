import test from "node:test";
import assert from "node:assert/strict";
import {webcrypto,generateKeyPairSync} from "node:crypto";
import worker from "../src/index.js";

if(!globalThis.crypto)globalThis.crypto=webcrypto;
const privateKey=generateKeyPairSync("rsa",{modulusLength:2048,privateKeyEncoding:{type:"pkcs8",format:"pem"},publicKeyEncoding:{type:"spki",format:"pem"}}).privateKey;
const callback="https://owner-admin.example.workers.dev/auth/github/callback";
const env={
 GITHUB_CLIENT_ID:"Iv1.testappid",GITHUB_CLIENT_SECRET:"secret-not-for-public",
 GITHUB_APP_ID:"123",GITHUB_INSTALLATION_ID:"456",
 GITHUB_APP_PRIVATE_KEY:privateKey,
 OWNER_GITHUB_ID:"1234567",SESSION_SECRET:"this-must-be-random-32-byte-secret-value",
 OAUTH_CALLBACK_URL:callback
};
const base={schemaVersion:1,course:"signals-systems",chapters:[
 {id:"1",title:"Signals",description:"Basics",published:true,sub:"CT",book:""},
 {id:"2",title:"Systems",description:"LTI",published:false,sub:"DT",book:""}
]};
const sha="a".repeat(40),ownerOrigin="https://yscho-hgu.github.io";
let validEmail=true,queries=[],writes=[];
const actualFetch=globalThis.fetch;
globalThis.fetch=async(input,opts={})=>{
 const url=String(input),method=opts.method||"GET";
 queries.push({url,method});
 if(url==="https://github.com/login/oauth/access_token")return Response.json({access_token:"user-token"});
 if(url==="https://api.github.com/user")return Response.json({id:1234567,login:"school-admin"});
 if(url==="https://api.github.com/user/emails")return Response.json([{email:"yscho@handong.edu",verified:validEmail}]);
 if(url.endsWith("/app/installations/456/access_tokens"))return Response.json({token:"installation-token"});
 if(url.includes("/repos/YSCho-HGU/signals-systems-visual-lab/contents/course-catalog.json")){
  if(method==="GET")return Response.json({type:"file",sha,content:Buffer.from(JSON.stringify(base)).toString("base64")});
  writes.push(JSON.parse(opts.body||"{}"));
  return Response.json({content:{sha:"b".repeat(40)},commit:{sha:"c".repeat(40)}});
 }
 if(url.includes("/contents/index.html"))return Response.json({type:"file",sha,content:Buffer.from("index").toString("base64")});
 return Response.json({message:"Not found"},{status:404});
};
test.after(()=>{globalThis.fetch=actualFetch});
function oauthStart(){
 return worker.fetch(new Request("https://owner-admin.example.workers.dev/auth/github/start",{
  headers:{Referer:ownerOrigin+"/engineering-learning-studio/admin/"}
 }),env);
}
async function verifiedSession(){
 const begin=await oauthStart();
 assert.equal(begin.status,302);
 const authorization=new URL(begin.headers.get("location"));
 const state=authorization.searchParams.get("state");
 const cookie=begin.headers.get("set-cookie").split(";")[0];
 const finish=await worker.fetch(new Request(callback+"?state="+encodeURIComponent(state)+"&code=sample",{
  headers:{Cookie:cookie}
 }),env);
 assert.equal(finish.status,200);
 const html=await finish.text();
 const session=html.match(/"session":"([^"]+)"/)?.[1];
 return {finish,session,html,cookie,state};
}
test("OAuth starts with signed state cookie and fixed redirect URI",async()=>{
 const res=await oauthStart();assert.equal(res.status,302);
 assert.equal(new URL(res.headers.get("Location")).host,"github.com");
 assert.match(res.headers.get("Set-Cookie"),/HttpOnly; Secure; SameSite=Lax/);
 const denied=await worker.fetch(new Request("https://owner-admin.example.workers.dev/auth/github/start",{
  headers:{Referer:"https://attacker.example/"}
 }),env);
 assert.equal(denied.status,403);
});
test("OAuth state mismatch and unverified owner email are rejected",async()=>{
 const res=await oauthStart(),cookie=res.headers.get("set-cookie").split(";")[0];
 const wrong=await worker.fetch(new Request(callback+"?state=wrong&code=some",{
  headers:{Cookie:cookie}
 }),env);
 assert.match(await wrong.text(),/"ok":false/);
 validEmail=false;
 const begin=await oauthStart(),state=new URL(begin.headers.get("location")).searchParams.get("state");
 const denied=await worker.fetch(new Request(callback+"?state="+state+"&code=some",{
  headers:{Cookie:begin.headers.get("set-cookie").split(";")[0]}
 }),env);
 assert.match(await denied.text(),/"ok":false/);
 validEmail=true;
});
test("Owner session is not a GitHub token, and grants restricted catalog reads and writes",async()=>{
 const {session,html}=await verifiedSession();
 assert.ok(session&&session.includes("."));
 assert.doesNotMatch(html,/user-token|installation-token|secret-not-for-public/);
 const api="https://owner-admin.example.workers.dev/api/catalog?course=ss";
 const req=(method,headers={},body)=>new Request(api,{method,headers:{
  Origin:ownerOrigin,Authorization:"Bearer "+session,...headers
 },body});
 const loaded=await worker.fetch(req("GET"),env);
 assert.equal(loaded.status,200);
 assert.equal((await loaded.json()).catalog.chapters.length,2);
 assert.equal(loaded.headers.get("access-control-allow-origin"),ownerOrigin);
 const changed=structuredClone(base);changed.chapters[1].published=true;
 const update=await worker.fetch(req("PUT",{"Content-Type":"application/json"},
  JSON.stringify({sha,catalog:changed})),env);
 assert.equal(update.status,200);
 assert.deepEqual((await update.json()).changed,["2"]);
 assert.equal(writes.length,1);
 const stale=await worker.fetch(req("PUT",{"Content-Type":"application/json"},
  JSON.stringify({sha:"b".repeat(40),catalog:changed})),env);
 assert.equal(stale.status,409);
 const altered=structuredClone(base);altered.chapters[0].id="9";
 const blocked=await worker.fetch(req("PUT",{"Content-Type":"application/json"},
  JSON.stringify({sha,catalog:altered})),env);
 assert.equal(blocked.status,400);
 const unauth=await worker.fetch(new Request(api,{headers:{Origin:ownerOrigin}}),env);
 assert.equal(unauth.status,401);
 const foreign=await worker.fetch(new Request(api,{headers:{Origin:"https://attacker.example",Authorization:"Bearer "+session}}),env);
 assert.equal(foreign.status,403);
 const badCourse=await worker.fetch(new Request("https://owner-admin.example.workers.dev/api/catalog?course=../../secrets",{
  headers:{Origin:ownerOrigin,Authorization:"Bearer "+session}
 }),env);
 assert.equal(badCourse.status,400);
});
