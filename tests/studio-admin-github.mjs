import {chromium} from "playwright";
import {readFileSync} from "node:fs";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1250,height:900}});
const origin="https://owner-admin.example.workers.dev";
const c=JSON.parse(readFileSync("c-programming/course-catalog.json","utf8"));
const ss={schemaVersion:1,course:"signals-systems",chapters:Array.from({length:8},(_,i)=>({
 id:String(i+1),title:"Chapter "+(i+1),sub:"Signals",description:"Description",published:true,book:""
}))};
const errors=[],writes=[];let directGithub=0;
page.on("pageerror",e=>errors.push("PAGE "+e.message));
page.on("dialog",d=>d.accept());
await page.route("**/admin/github-config.js*",route=>route.fulfill({
 status:200,contentType:"text/javascript",
 body:'window.STUDIO_ADMIN_GITHUB={enabled:true,workerUrl:"'+origin+'"}'
}));
await page.context().route(origin+"/auth/github/start*",route=>route.fulfill({
 status:200,contentType:"text/html",
 body:`<!doctype html><script>setTimeout(()=>window.opener.postMessage({
  type:"els-github-login",ok:true,session:"fake.owner.session",
  expiresAt:Date.now()+120000,login:"studio-owner"
 },"http://127.0.0.1:8765"),150)</script>`
}));
await page.route("https://api.github.com/**",route=>{
 directGithub++;return route.fulfill({status:500,body:"No direct GitHub access in Owner mode"});
});
await page.route(origin+"/api/catalog*",async route=>{
 const request=route.request(),url=new URL(request.url()),course=url.searchParams.get("course");
 const cors={"Access-Control-Allow-Origin":"http://127.0.0.1:8765","Access-Control-Allow-Methods":"GET, PUT, OPTIONS","Access-Control-Allow-Headers":"Authorization, Content-Type","Vary":"Origin"};
 if(request.method()==="OPTIONS")return route.fulfill({status:204,headers:cors});
 if(request.headers().authorization!=="Bearer fake.owner.session")return route.fulfill({status:401,contentType:"application/json",headers:cors,body:'{"error":"로그인 필요"}'});
 if(!["c","ss"].includes(course))return route.fulfill({status:400});
 if(request.method()==="GET")return route.fulfill({
  status:200,contentType:"application/json",
  headers:cors,
  body:JSON.stringify({catalog:course==="c"?c:ss,sha:"a".repeat(40),course})
 });
 if(request.method()==="PUT"){
  const body=request.postDataJSON();
  writes.push({course,body});
  return route.fulfill({status:200,contentType:"application/json",headers:cors,body:JSON.stringify({sha:"b".repeat(40),changed:["151"]})});
 }
 return route.fulfill({status:405});
});
try{
 await page.goto("http://127.0.0.1:8765/admin/",{waitUntil:"domcontentloaded"});
 await page.locator("#github-login").waitFor({state:"visible"});
 if(await page.locator("#admin-private").isVisible())errors.push("Owner console visible before verified session");
 if(await page.locator("#legacy-auth-controls").count())errors.push("Legacy GitHub PAT editor still in page");
 if(await page.locator("#editor").isVisible())errors.push("Unauthenticated editor visible");
 // Even a forged browser-only auth event must not reveal the manager.
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent("studio-admin-auth-state",{
  detail:{authenticated:true,user:{login:"forged"}}})));
 await page.waitForTimeout(160);
 if(await page.locator("#admin-private").isVisible())errors.push("Forged frontend event bypassed Worker verification");
 await page.locator("#github-login").click();
 await page.locator("#editor").waitFor({state:"visible",timeout:12000});
 await page.locator("#admin-private").waitFor({state:"visible",timeout:12000});
 if(await page.locator(".chapter").count()!==c.chapters.length)errors.push("C catalog missing");
 await page.locator("#title-151").fill("Pointer Fundamentals");
 await page.locator("#save").click();
 await page.waitForFunction(()=>document.getElementById("status")?.textContent.includes("저장 완료"));
 if(writes.length!==1||writes[0].course!=="c"||
   writes[0].body.sha!=="a".repeat(40)||
   writes[0].body.catalog.chapters.find(c=>c.id==="151")?.title!=="Pointer Fundamentals")
  errors.push("Owner request payload incorrect");
 if("token" in writes[0].body||"path" in writes[0].body||"repo" in writes[0].body)errors.push("Unexpected repository or token parameters in API request");
 // A developer should stay signed in when refreshing the same admin tab.
 await page.reload({waitUntil:"domcontentloaded"});
 await page.locator("#editor").waitFor({state:"visible",timeout:12000});
 if(await page.locator(".chapter").count()!==c.chapters.length)errors.push("Owner session was not restored after refresh");
 await page.locator("#course-ss").click();
 await page.locator("#editor").waitFor({state:"visible"});
 if(await page.locator(".chapter").count()!==8)errors.push("Signals catalog missing");
 await page.locator("#github-logout").click();
 await page.locator("#editor").waitFor({state:"hidden"});
 await page.locator("#admin-private").waitFor({state:"hidden"});
 if(await page.evaluate(()=>sessionStorage.getItem("els-gh-owner-session-v1")!==null))errors.push("Logout did not clear tab session");
 if(directGithub)errors.push("GitHub API requested directly from browser");
 await page.screenshot({path:"qa-studio-admin-github.png",fullPage:true});
}finally{await browser.close();}
console.log(JSON.stringify({status:errors.length?"FAIL":"PASS",writes:writes.length,directGithub,errors},null,2));
if(errors.length)process.exitCode=1;
