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
 if(request.headers().authorization!=="Bearer fake.owner.session")return route.fulfill({status:401,contentType:"application/json",body:'{"error":"로그인 필요"}'});
 if(!["c","ss"].includes(course))return route.fulfill({status:400});
 if(request.method()==="GET")return route.fulfill({
  status:200,contentType:"application/json",
  body:JSON.stringify({catalog:course==="c"?c:ss,sha:"a".repeat(40),course})
 });
 if(request.method()==="PUT"){
  const body=request.postDataJSON();
  writes.push({course,body});
  return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({sha:"b".repeat(40),changed:["151"]})});
 }
 return route.fulfill({status:405});
});
try{
 await page.goto("http://127.0.0.1:8765/admin/",{waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>document.querySelector("#legacy-auth-controls")?.hidden===true);
 if(await page.locator("#legacy-auth-controls").isVisible())errors.push("Legacy GitHub token editor visible in Owner mode");
 if(await page.locator("#editor").isVisible())errors.push("Unauthenticated editor visible");
 await page.locator("#github-login").click();
 await page.locator("#editor").waitFor({state:"visible",timeout:12000});
 if(await page.locator(".chapter").count()!==18)errors.push("C catalog missing");
 await page.locator("#title-151").fill("Pointer Fundamentals");
 await page.locator("#save").click();
 await page.waitForFunction(()=>document.getElementById("status")?.textContent.includes("저장 완료"));
 if(writes.length!==1||writes[0].course!=="c"||
   writes[0].body.sha!=="a".repeat(40)||
   writes[0].body.catalog.chapters.find(c=>c.id==="151")?.title!=="Pointer Fundamentals")
  errors.push("Owner request payload incorrect");
 if("token" in writes[0].body||"path" in writes[0].body||"repo" in writes[0].body)errors.push("Unexpected repository or token parameters in API request");
 await page.locator("#course-ss").click();
 await page.locator("#editor").waitFor({state:"visible"});
 if(await page.locator(".chapter").count()!==8)errors.push("Signals catalog missing");
 await page.locator("#github-logout").click();
 await page.locator("#editor").waitFor({state:"hidden"});
 if(directGithub)errors.push("GitHub API requested directly from browser");
 await page.screenshot({path:"qa-studio-admin-github.png",fullPage:true});
}finally{await browser.close();}
console.log(JSON.stringify({status:errors.length?"FAIL":"PASS",writes:writes.length,directGithub,errors},null,2));
if(errors.length)process.exitCode=1;
