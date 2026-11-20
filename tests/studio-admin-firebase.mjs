import {chromium} from "playwright";
import {readFileSync} from "node:fs";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1250,height:900}});
const c=JSON.parse(readFileSync("c-programming/course-catalog.json","utf8"));
const ss={schemaVersion:1,course:"signals-systems",chapters:Array.from({length:8},(_,i)=>({id:String(i+1),title:"Chapter "+(i+1),sub:"Signals",description:"Description",published:true,book:""}))};
const errors=[],writes=[];let directGithub=0,authenticated=false,deny=false;
page.on("pageerror",e=>errors.push("PAGE "+e.message));
page.on("dialog",dialog=>dialog.accept());
await page.route("**/admin/firebase-config.js*",route=>route.fulfill({
 status:200,contentType:"text/javascript",
 body:`window.STUDIO_ADMIN_FIREBASE_CONFIG={enabled:true,apiUrl:"https://mock-admin.example/api",firebase:{apiKey:"test",authDomain:"test.firebaseapp.com",projectId:"test",appId:"test"}}`
}));
await page.route("**/admin/firebase-auth.js*",route=>route.fulfill({
 status:200,contentType:"text/javascript",
 body:`(()=>{const notify=x=>window.dispatchEvent(new CustomEvent("studio-admin-auth-state",{detail:{authenticated:x,user:x?{email:"yscho@handong.edu",uid:"test-uid"}:null}}));
 window.StudioAdminFirebase={token:async()=>"valid-test-token",signIn:async()=>notify(true),signOut:async()=>notify(false)};
 document.querySelector("#firebase-login").addEventListener("click",()=>window.StudioAdminFirebase.signIn());
 document.querySelector("#firebase-logout").addEventListener("click",()=>window.StudioAdminFirebase.signOut());
 })();`
}));
await page.route("https://api.github.com/**",route=>{directGithub++;route.fulfill({status:500,body:"Client must not call GitHub when Firebase enabled"})});
await page.route("https://mock-admin.example/api*",async route=>{
 const req=route.request(),url=new URL(req.url()),course=url.searchParams.get("course");
 if(req.headers().authorization!=="Bearer valid-test-token"||deny){return route.fulfill({status:403,contentType:"application/json",body:JSON.stringify({error:"권한 없음"})})}
 if(!["c","ss"].includes(course))return route.fulfill({status:400});
 if(req.method()==="GET")return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({catalog:course==="c"?c:ss,sha:"a".repeat(40),course})});
 if(req.method()==="PUT"){
  const body=req.postDataJSON();
  writes.push({course,body});
  return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({sha:"b".repeat(40),changed:["151"]})});
 }
 route.fulfill({status:405});
});
await page.goto("http://127.0.0.1:8765/admin/",{waitUntil:"domcontentloaded"});
await page.waitForFunction(()=>document.querySelector("#legacy-auth-controls")?.hidden===true);
if(await page.locator("#legacy-auth-controls").isVisible())errors.push("Old GitHub token form should be hidden");
if(!(await page.locator("#firebase-auth-controls").isVisible()))errors.push("Google login form missing");
if(await page.locator("#editor").isVisible())errors.push("Unauthenticated editor visible");
await page.locator("#firebase-login").click();
await page.locator("#editor").waitFor({state:"visible",timeout:10000});
if(await page.locator(".chapter").count()!==18)errors.push("C catalog not loaded");
await page.locator("#title-151").fill("Pointer Fundamentals");
await page.locator("#save").click();
await page.waitForFunction(()=>document.getElementById("status")?.textContent.includes("저장 완료"));
if(writes.length!==1||writes[0].course!=="c"||writes[0].body.sha!=="a".repeat(40)||writes[0].body.catalog.chapters.find(c=>c.id==="151")?.title!=="Pointer Fundamentals")errors.push("Firebase catalog payload incorrect");
if(writes[0]&&("token" in writes[0].body||"path" in writes[0].body||"repo" in writes[0].body))errors.push("Client supplied unauthorized repo/path/token parameters");
await page.locator("#course-ss").click();
await page.locator("#editor").waitFor({state:"visible"});
if(await page.locator(".chapter").count()!==8)errors.push("S&S catalog not loaded");
await page.locator("#firebase-logout").click();
await page.locator("#editor").waitFor({state:"hidden"});
if(directGithub)errors.push("Direct GitHub requests were made: "+directGithub);
await page.screenshot({path:"qa-studio-admin-firebase.png",fullPage:true});
await browser.close();
console.log(JSON.stringify({status:errors.length?"FAIL":"PASS",writes:writes.length,directGithub,errors},null,2));
if(errors.length)process.exitCode=1;
