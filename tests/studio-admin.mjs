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
const qualitySnapshot={
 schemaVersion:1,source:"test",generatedAt:"2026-11-20T10:00:00.000Z",
 sourceSha:"abcdef0123456789",runUrl:"https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/runs/123",
 automatedStatus:"AUTOMATED_PASS",manualStatus:"PENDING",
 gates:Array.from({length:8},(_,i)=>({id:"G"+i,label:"Gate "+i,status:"PASS",required:true})),
 visual:{expected:248,observed:248,issues:0},
 chapters:Array.from({length:8},(_,i)=>({id:i+1,title:"Chapter "+(i+1),labCount:[9,9,7,8,8,6,7,8][i],
  visual:{status:"PASS",expected:[9,9,7,8,8,6,7,8][i]*4,observed:[9,9,7,8,8,6,7,8][i]*4,issues:0,missing:0},
  coverage:{numericalReference:i===5?"6.1 only":"PENDING_INDEPENDENT_ORACLE"},
  manual:{axesAndLegends:"PENDING",mathematics:"PENDING",pedagogy:"PENDING"},
  issueExamples:[],missingExamples:[]}))
};
let qaRequests=0;
await page.route("https://raw.githubusercontent.com/YSCho-HGU/signals-systems-visual-lab/main/qa-dashboard/latest.json*",route=>{
 qaRequests++;
 route.fulfill({status:200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},
 body:JSON.stringify(qualitySnapshot)});
});
await page.goto("http://127.0.0.1:8765/admin/",{waitUntil:"networkidle"});
if(await page.locator("#editor").isVisible())errors.push("Editor should be hidden before authentication");
if(await page.locator("#ss-quality").isVisible())errors.push("QA dashboard should be hidden for C Programming");
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
await page.locator("#ss-quality").waitFor({state:"visible"});
await page.waitForFunction(()=>document.querySelector("#ss-qa-summary")?.hidden===false);
if(await page.locator("#ss-qa-chapters .qa-chapter").count()!==8)errors.push("QA dashboard must show eight chapters");
if(await page.locator("#ss-qa-footer .qa-gate").count()!==8)errors.push("QA dashboard must show eight G0-G7 gates");
if(!(await page.locator("#ss-qa-summary").innerText()).includes("248"))errors.push("QA screenshot total absent");
if(!(await page.locator("#ss-qa-status").innerText()).includes("교육적 검토"))errors.push("QA dashboard should not imply manual approval");
await page.locator("#ss-qa-chapters details").first().locator("summary").click();
if(!(await page.locator("#ss-qa-chapters details").first().innerText()).includes("독립 수학 검증"))errors.push("Chapter detail missing mathematical review");
await page.locator("#ss-qa-refresh").click();
await page.waitForFunction(()=>document.querySelector("#ss-qa-meta")?.hidden===false);
if(qaRequests<2)errors.push("QA Refresh did not request the latest report");

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
await page.locator("#course-c").click();
await page.locator("#ss-quality").waitFor({state:"hidden"});
if(await page.locator("#ss-quality").isVisible())errors.push("QA dashboard should hide on C Programming");
await page.locator("#course-ss").click();
await page.locator("#ss-quality").waitFor({state:"visible"});
await page.screenshot({path:"qa-studio-admin.png",fullPage:true});
await browser.close();
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("PASS: unified admin protected editor, C metadata, S&S metadata, repository switching, GitHub PUT payloads.");
