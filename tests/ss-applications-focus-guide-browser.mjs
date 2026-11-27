/* One discovery question per lab: 19 pages, responsive and multilingual browser QA. */
import assert from "node:assert/strict";
import {chromium} from "playwright";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const entries=[
 ...["harmonics","chirp","helix","beats","amfm","sampling"].map(id=>({name:"A "+id,path:"applications-lab.html?lab="+id})),
 ...["rc","moving-average"].map(id=>({name:"B "+id,path:"applications-system-lab.html?lab="+id})),
 {name:"B compare",path:"applications-system-compare.html"},
 ...[
 ["samples","applications-fft-lab.html"],
 ["resolution","applications-fft-resolution.html"],
 ["algorithm","applications-dft-fft.html"],
 ["dtmf","applications-fft-dtmf.html"],
 ["fingerprint","applications-fft-sound-fingerprint.html"],
 ["upload","applications-fft-upload.html"],
 ["image","applications-fft-image.html"],
 ["stft","applications-chirp-stft.html"]
 ].map(([name,path])=>({name:"C "+name,path})),
 {name:"D audio",path:"applications-audio-filter.html"},
 {name:"D radar",path:"applications-chirp-echo.html"}
];
assert.equal(entries.length,19);
const browser=await chromium.launch({headless:true});
let cases=0;
const problems=[];
for(const spec of entries){
 const page=await browser.newPage({viewport:{width:1366,height:900}});
 try{
  const res=await page.goto(base+"/signals-systems/"+spec.path,{waitUntil:"load",timeout:40000});
  assert.equal(res?.status(),200,"HTTP 200");
  await page.locator("#ss-app-focus-question").waitFor({state:"visible",timeout:10000});
  assert.equal(await page.locator("#ss-app-focus-guide").count(),1,"exactly one guide");
  assert.equal(await page.locator(".ss-focus-step").count(),3,"three steps");
  const evidence=await page.evaluate(()=>{
    const link=document.querySelector(".ss-focus-evidence-link");
    const target=link?.getAttribute("href")||"";
    const el=target.startsWith("#")?document.getElementById(target.slice(1)):null;
    return {target,exists:!!el,tag:el?.tagName||"",text:el?.textContent?.trim()?.slice(0,140)||""};
  });
  assert(evidence.exists,"The question has no actual target graph: "+JSON.stringify(evidence));
  assert(evidence.target.length>3,"Evidence link is missing");
  const initial=await page.evaluate(()=>{
   const main=document.querySelector("main"),guide=main.querySelector("#ss-app-focus-guide");
   return {index:[...main.children].indexOf(guide),hasTitleBefore:[...main.children].slice(0,[...main.children].indexOf(guide)).some(el=>!!el.querySelector("h1")||el.tagName==="H1"),next:guide.nextElementSibling?.className||""}
  });
  assert(initial.hasTitleBefore,"guide should appear after title");
  for(const language of ["en","ko","mixed"]){
   await page.locator("header select.ss-common-language-select").first().selectOption(language);
   await page.waitForTimeout(90);
   const state=await page.evaluate(()=>{
    const guide=document.querySelector("#ss-app-focus-guide");
    const q=guide?.querySelector("#ss-app-focus-question")?.textContent||"";
    const labels=[...guide.querySelectorAll(".ss-focus-label")].map(x=>x.textContent);
    const descriptions=[...guide.querySelectorAll(".ss-focus-description")].map(x=>x.textContent);
    return {mode:guide.dataset.mode,question:q,labels,descriptions};
   });
   assert.equal(state.mode,language,"language synchronization");
   assert(state.question.length>=22,"nonempty question");
   assert(state.labels.length===3&&state.descriptions.every(s=>s.length>12),"all three instructions present");
   if(language==="en")assert(!/[가-힣]/.test(state.question+state.labels.join("")+state.descriptions.join("")),"EN-only text");
   if(language==="ko")assert(/[가-힣]/.test(state.question),"Korean question");
   if(language==="mixed")assert(/[가-힣]/.test(state.question)&&/[A-Za-z]/.test(state.question),"mixed EN/KR question");
   assert.equal(await page.locator(".ss-focus-evidence-link").count(),1,"One evidence jump link");
   cases++;
  }
  await page.setViewportSize({width:390,height:844});
  const responsive=await page.evaluate(()=>{
   const guide=document.querySelector("#ss-app-focus-guide"),box=guide.getBoundingClientRect();
   const stepBoxes=[...guide.querySelectorAll(".ss-focus-step")].map(x=>x.getBoundingClientRect());
   return {pageWidth:document.documentElement.scrollWidth,windowWidth:innerWidth,guideWidth:box.width,left:box.left,right:box.right,steps:stepBoxes.map(x=>({left:x.left,right:x.right,width:x.width}))};
  });
  assert(responsive.guideWidth>=260&&responsive.left>=-1&&responsive.right<=responsive.windowWidth+2,"mobile guide geometry "+JSON.stringify(responsive));
  assert(responsive.steps.every(b=>b.width>200&&b.right<=responsive.windowWidth+3),"mobile guidance steps");
  const evidenceGeometry=await page.locator(".ss-focus-evidence-link").boundingBox();
  assert(evidenceGeometry&&evidenceGeometry.width>160,"Evidence link invisible on mobile");
  cases++;
  console.log("PASS",spec.name,"→",evidence.target);
 }catch(err){problems.push({name:spec.name,error:String(err)});console.error("FAIL",spec.name,String(err))}
 finally{await page.close()}
}
await browser.close();
console.log("Applications focus guides: "+cases+"/76 checks; "+problems.length+" lab failures");
if(problems.length)process.exitCode=1;
