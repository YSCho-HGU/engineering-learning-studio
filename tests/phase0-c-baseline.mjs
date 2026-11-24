#!/usr/bin/env node
// Phase 0: non-destructive C + shared Studio baseline contract and browser smoke.
// Runs only in a disposable browser profile; never removes any user's local data.
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import vm from "node:vm";
import {spawn} from "node:child_process";
import {chromium} from "playwright";

const reportDir="qa-phase0";
mkdirSync(reportDir,{recursive:true});
const manifest=JSON.parse(readFileSync("docs/phase0/c-storage-baseline.json","utf8"));
const checks=[],issues=[],pageErrors=[];
function assert(condition,name,detail=""){
 checks.push({name,status:condition?"PASS":"FAIL",detail});
 if(!condition)issues.push(name+": "+detail);
}
function readData(slug){
 const s=readFileSync("c-programming/"+slug+"/data.js","utf8");
 const context={window:{}};
 vm.runInNewContext(s,context,{timeout:3000});
 return context.window.C_JOURNEY;
}
const catalog=JSON.parse(readFileSync("c-programming/course-catalog.json","utf8"));
assert(catalog.schemaVersion===1,"catalog-schema");
assert(catalog.chapters.filter(c=>c.kind!=="ai-capstone").length===18,"catalog-planned-count",String(catalog.chapters.length));
const allPublished=catalog.chapters.filter(x=>x.published);
const published=allPublished.filter(x=>x.kind!=="ai-capstone");
assert(allPublished.length===9&&allPublished.some(x=>x.id==="211"),"catalog-published-capstone");
assert(published.length===8,"catalog-published-count",String(published.length));
assert(JSON.stringify(published.map(x=>x.id))===JSON.stringify(manifest.publishedUnits.map(x=>x.number)),"catalog-published-ids");
for(const unit of manifest.publishedUnits){
 const chapter=catalog.chapters.find(c=>c.id===unit.number);
 assert(!!chapter&&chapter.url==="./"+unit.slug+"/","route-"+unit.number);
 if(unit.slug==="file-io"){
  assert(unit.lessons===8&&unit.practice===7,"fileio-specialized-contract");
  continue;
 }
 const data=readData(unit.slug);
 const version=data.practiceRevision??1;
 const core=data.coreCount??data.lessons.length;
 const practiceCore=data.practiceCoreCount??data.practice.length;
 assert(data.slug===unit.slug&&data.contentRevision===unit.contentRevision&&version===unit.practiceRevision,"revision-"+unit.slug);
 assert(data.lessons.length===unit.lessons&&core===unit.coreLessons&&data.practice.length===unit.practice&&practiceCore===unit.corePractice,"counts-"+unit.slug);
 assert(data.lessons.every(l=>l.quiz&&l.quiz.options.length===3&&Number.isInteger(l.quiz.correct)&&l.quiz.correct>=0&&l.quiz.correct<3),"quiz-contract-"+unit.slug);
 assert(data.practice.every(p=>typeof p.starter==="string"&&typeof p.expected==="string"),"practice-contract-"+unit.slug);
}
const base=process.env.PHASE0_BASE||"http://127.0.0.1:8765/";
let server=null;
if(!process.env.PHASE0_BASE){
 server=spawn("python3",["-m","http.server","8765","--bind","127.0.0.1"],{stdio:"ignore"});
 await new Promise(resolve=>setTimeout(resolve,1200));
}
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
  const page=await context.newPage();
  page.on("pageerror",error=>pageErrors.push({width,url:page.url(),error:error.message}));
  page.on("response",response=>{
   if(response.status()>=400&&new URL(response.url()).origin===new URL(base).origin)
    pageErrors.push({width,url:response.url(),error:"HTTP "+response.status()});
  });
  await page.goto(base,{waitUntil:"load"});
  const prefix="phase0-"+width;
  const fixture={
   "els-language":"mixed","els-theme-v2":"neutral-dark",
   "els-journey-arrays-v2":"[0,1]","els-concept-arrays-v2":"[0]",
   "els-code-arrays-v1":JSON.stringify({"0":"/* PHASE0_SENTINEL */\nint main(void){return 0;}"}),
   "els-code-evidence-arrays-v1":JSON.stringify({"0":{"checked":true}}),
   "els-ss-lab-progress-v1":JSON.stringify(["1:1","3:2"]),
   "phase0-unknown-key":"preserve-user-custom-storage"
  };
  await page.evaluate(fixture=>{for(const [key,value] of Object.entries(fixture))localStorage.setItem(key,value)},fixture);
  const before=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(fixture));
  for(const mode of ["mixed","en","ko"]){
   await page.goto(base+"c-programming/",{waitUntil:"load"});
   assert((await page.locator("#available-chapters .path-card").count())===allPublished.length,prefix+"-c-home-units-"+mode);
   const selected=await page.evaluate(()=>window.ELSLanguage?.get());
   assert(selected===mode,prefix+"-lang-"+mode,String(selected));
   if(mode!=="ko"){
    await page.evaluate(next=>window.ELSLanguage.set(next),mode==="mixed"?"en":"ko");
   }
  }
  await page.evaluate(()=>window.ELSLanguage.set("mixed"));
  for(const unit of manifest.publishedUnits){
   const path=base+"c-programming/"+unit.slug+"/";
   try{
    await page.goto(path,{waitUntil:"load",timeout:30000});
    assert((await page.locator("body").innerText()).length>150,prefix+"-lesson-renders-"+unit.slug);
    if(unit.slug!=="file-io"){
     assert((await page.locator("#lesson-nav button").count())>=unit.lessons,prefix+"-lesson-navigation-"+unit.slug);
     await page.goto(path+"practice/",{waitUntil:"load",timeout:30000});
     assert((await page.locator("#cp-editor").count())===1,prefix+"-editor-"+unit.slug);
    }else{
     await page.goto(path+"practice/",{waitUntil:"load",timeout:30000});
     assert((await page.locator("#editor").count())===1,prefix+"-fileio-editor");
    }
   }catch(error){assert(false,prefix+"-route-"+unit.slug,String(error).slice(0,180))}
  }
  await page.goto(base+"c-programming/arrays/practice/",{waitUntil:"load"});
  const source=await page.locator("#cp-editor").inputValue();
  assert(source.includes("PHASE0_SENTINEL"),prefix+"-draft-restored");
  await page.goto(base+"progress/",{waitUntil:"load"});
  const dashboard=await page.locator("#summary").innerText();
  assert(dashboard.includes("2/")&&dashboard.includes("1/"),prefix+"-dashboard-fixture");
  const ss=await page.locator("#ss-progress-summary").innerText();
  assert(ss.includes("2/62"),prefix+"-ss-progress-projection",ss);
  await page.screenshot({path:join(reportDir,"studio-"+width+".png"),fullPage:true});
  await page.goto(base+"admin/",{waitUntil:"load"});
  assert((await page.locator("body").innerText()).length>100,prefix+"-admin-renders");
  const after=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(fixture));
  for(const key of Object.keys(fixture)){
   if(key==="els-language")continue;
   assert(before[key]===after[key],prefix+"-storage-unchanged-"+key);
  }
  assert(after["phase0-unknown-key"]===fixture["phase0-unknown-key"],prefix+"-unknown-localstorage-preserved");
  await context.close();
 }
}finally{
 if(browser)await browser.close();
 if(server)server.kill();
}
assert(pageErrors.length===0,"browser-no-uncaught-errors",JSON.stringify(pageErrors.slice(0,8)));
const result={schemaVersion:1,createdAt:new Date().toISOString(),repository:"engineering-learning-studio",total:checks.length,passed:checks.filter(x=>x.status==="PASS").length,failed:issues.length,status:issues.length?"FAIL":"PASS",issues,pageErrors,checks,scope:"isolated Chromium; C catalog, pages, drafts, browser-only progress and shared preferences"};
writeFileSync(join(reportDir,"c-baseline.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({status:result.status,passed:result.passed,total:result.total,issues:issues.slice(0,18)},null,2));
if(issues.length)process.exitCode=1;
