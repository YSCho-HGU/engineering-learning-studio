import {chromium} from "playwright";
import {readFileSync} from "node:fs";
const browser=await chromium.launch({headless:true});
const errors=[];
const c=JSON.parse(readFileSync("c-programming/course-catalog.json","utf8"));
const ss={schemaVersion:1,course:"signals-systems",chapters:Array.from({length:8},(_,i)=>({id:String(i+1),title:"Chapter "+(i+1),sub:"Signals lesson",description:"Original chapter",published:true,book:""}))};
const page=await browser.newPage({viewport:{width:1180,height:900}});
page.on("pageerror",e=>errors.push("JS: "+e.message));
page.on("dialog",d=>d.accept());
const writes=[];
await page.route("https://api.github.com/repos/**",route=>{
 const req=route.request(),url=req.url();
 if(req.method()==="PUT"){
  const payload=JSON.parse(req.postData()||"{}");
  writes.push({url,payload,catalog:JSON.parse(Buffer.from(payload.content,"base64").toString("utf8"))});
  return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({content:{sha:"new-sha"}})});
 }
 const fixture=url.includes("signals-systems-visual-lab")?ss:c;
 const encoded=Buffer.from(JSON.stringify(fixture),"utf8").toString("base64");
 return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({sha:"old-sha",content:encoded})});
});
await page.goto("http://127.0.0.1:8765/admin/",{waitUntil:"networkidle"});
if(await page.locator("#editor").isVisible())errors.push("Editor should be hidden before authentication");
await page.locator("#token").fill("mock-token");
await page.locator("#connect").click();
await page.locator("#editor").waitFor({state:"visible"});
if(await page.locator(".chapter").count()!==18)errors.push("C catalog should show 18 units");
await page.locator("#title-151").fill("Pointer Fundamentals");
await page.locator("#description-151").fill("Pointer memory and addresses");
await page.locator("#book-151").fill("https://drive.google.com/file/d/1o7bzzH32a2gMwjFZ-SdYCtaUcdjxMK4H/view");
await page.locator("#save").click();
await page.waitForFunction(()=>document.querySelector("#status").textContent.includes("저장 완료"));
if(writes.length!==1||writes[0].catalog.chapters.find(c=>c.id==="151").title!=="Pointer Fundamentals")errors.push("C metadata save mismatch");
await page.locator("#course-ss").click();
if(await page.locator("#editor").isVisible())errors.push("SS switch must clear editor and credentials");
await page.locator("#token").fill("mock-ss-token");
await page.locator("#connect").click();
await page.locator("#editor").waitFor({state:"visible"});
if(await page.locator(".chapter").count()!==8)errors.push("SS catalog should show 8 chapters");
await page.locator("#title-1").fill("Signals Overview");
await page.locator("#description-1").fill("Updated introduction");
await page.locator("#sub-1").fill("CT/DT Signals");
await page.locator("#save").click();
await page.waitForFunction(()=>document.querySelector("#status").textContent.includes("저장 완료"));
if(writes.length!==2||writes[1].catalog.chapters[0].title!=="Signals Overview")errors.push("SS metadata save mismatch");
await page.screenshot({path:"qa-studio-admin.png",fullPage:true});
await browser.close();
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("PASS: unified admin protected editor, C metadata, S&S metadata, repository switching, GitHub PUT payloads.");
