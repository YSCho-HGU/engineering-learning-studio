#!/usr/bin/env node
/* C integrated journey source + interaction acceptance. Run from repository root. */
import fs from "node:fs";
import vm from "node:vm";
import {spawnSync, spawn} from "node:child_process";
const failures=[],results=[];
function assert(ok,label){results.push({label,pass:!!ok});if(!ok)failures.push(label)}
const base="c-programming/";
const course={};
for(const kind of ["pointer","structure"]){
 const context={window:{}};
 vm.runInNewContext(fs.readFileSync(base+kind+"/data.js","utf8"),context);
 const d=context.window.C_JOURNEY;course[kind]=d;
 const englishContext={window:{}};
 vm.runInNewContext(fs.readFileSync(base+kind+"/en.js","utf8"),englishContext);
 const overlay=englishContext.window.C_JOURNEY_EN;
 const protectedFields=/^(?:code|source|starter|starterCode|expectedOutput|output|correct|answer|id|slug|kind|minutes|contentRevision|value|defaultValue|phaseBreaks)$/;
 const missingEnglish=[];
 function auditEnglish(obj,translated,location){
  if(Array.isArray(obj)){obj.forEach((value,i)=>auditEnglish(value,Array.isArray(translated)?translated[i]:undefined,location+"["+i+"]"));return;}
  if(obj&&typeof obj==="object"){for(const [field,value] of Object.entries(obj))if(!protectedFields.test(field))auditEnglish(value,translated?.[field],location?location+"."+field:field);return;}
  if(typeof obj==="string"&&/[가-힣]/.test(obj)&&(typeof translated!=="string"||/[가-힣]/.test(translated)))missingEnglish.push(location);
 }
 auditEnglish(d,overlay,"");
 assert(missingEnglish.length===0,kind+" English content coverage: "+missingEnglish.join(", "));
 assert(d.lessons.length===8,kind+" lessons = 8");
 assert(d.practice.length===6,kind+" exercises = 6");
 assert(d.lessons.every(x=>Array.isArray(x.quiz.options)&&x.quiz.options.length>=2&&Number.isInteger(x.quiz.correct)&&x.quiz.correct>=0&&x.quiz.correct<x.quiz.options.length&&String(x.quiz.options[x.quiz.correct]).trim().length>0&&x.quiz.explain),kind+" conceptual quiz answer key");
 assert(d.lessons.every(x=>typeof x.output==="string"&&x.output.trim().length>0),kind+" reference stdout specified separately from conceptual answer");
 assert(d.practice.every(x=>x.starter.includes("TODO")&&x.expected),kind+" draft and expected outputs");
 for(const file of [kind+"/index.html",kind+"/practice/index.html"]){
  assert(fs.existsSync(base+file),file+" route exists");
 }
 const home=fs.readFileSync(base+kind+"/index.html","utf8");
 assert(!home.includes('class="c-learning-shortcuts"')&&home.includes('class="course-phase-details"')&&home.includes('c-ch5-reading'),kind+" Chapter 5 reading structure");
 assert(home.includes('id="assessment-status"'),kind+" independent concept status");
 assert(home.includes('shared/els-content-model.js')&&home.includes('els-language.js')&&home.includes('../language.js'),kind+" shared immutable language pipeline");
 assert(home.includes('data-els-theme-picker')&&home.includes('id="theme"'),kind+" shared theme picker replaces legacy toggle");
 assert(!home.includes('Toggle dark and light mode'),kind+" no duplicate legacy theme button");
 assert(home.includes('./practice/'),kind+" practice editor navigation");
 assert(home.includes(kind==="pointer"?"../structure/":"../file-io/"),kind+" next course link");
}
const hub=fs.readFileSync(base+"learning-journey/index.html","utf8");
assert(["pointer","structure","fileio"].every(c=>hub.includes('data-course="'+c+'"')), "3 courses visible on integrated hub");
assert(hub.includes("els-code-evidence-")&&hub.includes("els-concept-"),"Activity/Concept/Coding aggregation");
const fileio=fs.readFileSync(base+"file-io/index.html","utf8");
assert(!fileio.includes('id="concept-count"'),"File I/O redundant visible concept counter removed");
assert(fileio.includes("../learning-journey/"),"File I/O integrated hub link");
for(const js of ["journey.js","practice-engine.js","file-io/app.js","file-io/core-transfer.js","file-io/practice/app.js"]){
 const run=spawnSync(process.execPath,["--check",base+js],{encoding:"utf8"});
 assert(run.status===0,"JavaScript parse "+js+" "+run.stderr.slice(0,160));
}
let browserStatus="NOT_RUN";
if(process.env.C_JOURNEY_BROWSER==="1"){
 let server, browser;
 try{
  const {chromium}=await import("playwright");
  server=spawn("python3",["-m","http.server","8876","--bind","127.0.0.1"],{stdio:"ignore"});
  await new Promise(r=>setTimeout(r,1100));
  browser=await chromium.launch({headless:true});
  for(const kind of ["pointer","structure"]){
   const page=await browser.newPage({viewport:{width:390,height:850}});
   const errors=[];page.on("pageerror",e=>errors.push(String(e)));page.on("response",r=>{if(r.status()>=400)errors.push("HTTP "+r.status()+" "+r.url())});
   await page.goto("http://127.0.0.1:8876/"+base+kind+"/",{waitUntil:"domcontentloaded"});
   assert(await page.locator("#lesson-nav button").count()===8,kind+" 8 working steps");
   assert(JSON.stringify(await page.locator('#lesson-nav details.c-learning-group').evaluateAll(es=>es.map(e=>e.dataset.group)))===JSON.stringify(["core","labs","advanced","challenges"]),kind+" grouped learning navigation");
   assert(!(await page.locator('.course-phase-details').evaluate(el=>el.open)),kind+" roadmap begins collapsed");
   await page.locator('.course-phase-details summary').click();
   assert(await page.locator('.course-phase-details').evaluate(el=>el.open),kind+" roadmap expands on demand");
   assert(await page.locator('.stage .lead').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))>=16,kind+" readable explanatory text");
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+8),kind+" reading layout does not overflow mobile viewport");
   assert(await page.locator('[data-els-theme-picker]').count()===1,kind+" exactly one theme picker");
   assert(await page.locator('#c-shared-language select').count()===1,kind+" common language control");
   await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded'}),page.locator('#c-shared-language select').selectOption('en')]);
   assert(await page.evaluate(()=>document.documentElement.dataset.elsLanguage)==='en',kind+" English mode retained");
   assert(!/[가-힣]/.test(await page.locator('#hero-summary').innerText()),kind+" English hero translation");
   await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded'}),page.locator('#c-shared-language select').selectOption('mixed')]);
   assert(await page.evaluate(()=>document.documentElement.dataset.elsLanguage)==='mixed',kind+" mixed mode retained");
   const conceptIndex=course[kind].lessons[0].quiz.correct;
   await page.locator("#lesson .question label").nth(conceptIndex).click();
   await page.locator("#lesson .question button").click();
   assert((await page.locator("#assessment-status").innerText()).includes("1/6"),kind+" core concept pass recorded");
   assert((await page.locator("#progress-text").innerText()).includes("0 / 6"),kind+" core activity not silently awarded");
   await page.locator("#lesson .navactions button").first().click();
   assert((await page.locator("#progress-text").innerText()).includes("1 / 6"),kind+" core activity marked independently");
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+8),kind+" no mobile page overflow");
   assert(errors.length===0,kind+" no runtime errors "+errors.join(";"));
   await page.close();
   const practice=await browser.newPage({viewport:{width:390,height:850}});
   const practiceErrors=[];practice.on("pageerror",e=>practiceErrors.push(String(e)));practice.on("response",r=>{if(r.status()>=400)practiceErrors.push("HTTP "+r.status()+" "+r.url())});
   await practice.goto("http://127.0.0.1:8876/"+base+kind+"/practice/",{waitUntil:"domcontentloaded"});
   assert(await practice.locator(".cp-nav-item").count()===6,kind+" 6 selectable coding exercises");
   const draft="/* TODO removed */\n#include <stdio.h>\nint main(void){return 0;}";
   await practice.locator("#cp-editor").fill(draft);
   await practice.locator(".cp-nav-item").nth(1).click();
   await practice.locator(".cp-nav-item").nth(0).click();
   assert((await practice.locator("#cp-editor").inputValue())===draft,kind+" draft survives task switching");
   await practice.locator("#cp-verified").check();
   assert(await practice.locator("#cp-verified").isChecked(),kind+" GCC self-report can be checked");
   await practice.locator("#cp-editor").fill(draft+"\n/* edited */");
   assert(!(await practice.locator("#cp-verified").isChecked()),kind+" code edits revoke GCC self-report");
   assert(practiceErrors.length===0,kind+" coding practice no runtime error "+practiceErrors.join(";"));
   await practice.close();
  }
  const fileio=await browser.newPage({viewport:{width:390,height:850}});
  const fileioErrors=[];fileio.on("pageerror",e=>fileioErrors.push(String(e)));fileio.on("response",r=>{if(r.status()>=400)fileioErrors.push("HTTP "+r.status()+" "+r.url())});
  await fileio.goto("http://127.0.0.1:8876/"+base+"file-io/",{waitUntil:"domcontentloaded"});
  await fileio.locator('input[name="q0"][value="b"]').check();
  await fileio.locator('[data-grade="0"]').click();
  assert(await fileio.evaluate(()=>JSON.parse(localStorage.getItem("els-concept-fileio-v1")||"[]").includes(0)),"File I/O concept result is stored independently of visible activity count");
  assert(fileioErrors.length===0,"File I/O new concept evidence no runtime errors "+fileioErrors.join(";"));
  await fileio.close();
  const filePractice=await browser.newPage({viewport:{width:390,height:850}});
  await filePractice.goto("http://127.0.0.1:8876/"+base+"file-io/practice/",{waitUntil:"domcontentloaded"});
  assert(await filePractice.locator('#task-nav button[data-task]').count()===7,"File I/O six P tasks plus M1 retained");
  await filePractice.locator("#gcc-confirm").check();
  await filePractice.locator("#editor").fill("/* changed code */");
  assert(!(await filePractice.locator("#gcc-confirm").isChecked()),"File I/O code edit revokes GCC self-report");
  await filePractice.close();
  const page=await browser.newPage();
  const dashboardErrors=[];page.on("pageerror",e=>dashboardErrors.push(String(e)));page.on("response",r=>{if(r.status()>=400)dashboardErrors.push("HTTP "+r.status()+" "+r.url())});
  await page.goto("http://127.0.0.1:8876/"+base+"learning-journey/",{waitUntil:"domcontentloaded"});
  assert(await page.locator("[data-course]").count()===3,"integrated dashboard renders all courses");
  assert(dashboardErrors.length===0,"integrated dashboard no missing resources or JS errors "+dashboardErrors.join(";"));
  await page.close();
  // Cross-chapter shell: the same header, course picker, section arrows,
  // and chapter sidebar must work for all eight published C chapters.
  for(const slug of ["arrays","strings","standard-library","functions","pointer","structure","file-io","dynamic-memory"]){
   const page=await browser.newPage({viewport:{width:1280,height:850}});
   const shellErrors=[];page.on("pageerror",e=>shellErrors.push(e.message));
   await page.goto("http://127.0.0.1:8876/"+base+slug+"/",{waitUntil:"domcontentloaded"});
   assert(await page.locator("body > .ss-common-header").count()===1,slug+" single SS-style header");
   assert(await page.locator(".c-ss-shell > .c-ss-sidebar").count()===1,slug+" left chapter sidebar");
   assert(await page.locator(".c-ss-shell > .c-ss-workspace").count()===1,slug+" right learning workspace");
   assert(await page.locator(".ss-common-menu .ss-common-links a").count()===9,slug+" eight chapter links plus home");
   assert(await page.locator(".c-four-navigation > *").count()===4,slug+" four chapter/section arrows");
   assert(await page.locator("#lesson-nav button").count()>0,slug+" section TOC preserved");
   assert(await page.locator("#c-language").count()===1,slug+" common language picker");
   assert(await page.locator("[data-els-theme-picker]").count()===1,slug+" one common theme picker");
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+8),slug+" no full-page overflow");
   assert(shellErrors.length===0,slug+" no shell runtime errors "+shellErrors.join(";"));
   if(slug==="pointer"){
    const before=await page.locator("#lesson h2").innerText();
    await page.locator(".c-four-navigation button").last().click();
    assert((await page.locator("#lesson h2").innerText())!==before,slug+" header next-section navigation");
    await page.locator(".c-sidebar-toggle").click();
    assert(await page.evaluate(()=>document.documentElement.dataset.cSidebar)==="collapsed",slug+" collapsible sidebar");
    await page.locator(".c-sidebar-toggle").click();
    assert(await page.evaluate(()=>document.documentElement.dataset.cSidebar)==="expanded",slug+" sidebar restores");
   }
   await page.close();
  }
  // After-class editors use the same persistent shell without replacing drafts.
  for(const slug of ["arrays","strings","standard-library","functions","pointer","structure","dynamic-memory"]){
   const page=await browser.newPage({viewport:{width:1280,height:850}});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8876/"+base+slug+"/practice/",{waitUntil:"domcontentloaded"});
   assert(await page.locator("body > .ss-common-header").count()===1,slug+" practice common header");
   assert(await page.locator(".c-ss-shell > .cp-menu.c-ss-sidebar").count()===1,slug+" task sidebar");
   assert(await page.locator(".c-practice-workspace .cp-editor").count()===1,slug+" original editor retained");
   assert(await page.locator(".cp-menu .cp-nav-item").count()===6,slug+" six tasks accessible");
   assert(await page.locator("[data-els-theme-picker] option").count()===5,slug+" five shared themes");
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+8),slug+" practice no overflow");
   assert(errors.length===0,slug+" practice no JS errors "+errors.join(";"));
   await page.close();
  }
  for(const [route,selector,count] of [
   ["file-io/practice/","#task-nav button[data-task]",7],
   ["file-io/core-labs/",".side-nav a[data-lab-link]",3]
  ]){
   const page=await browser.newPage({viewport:{width:1280,height:850}});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8876/"+base+route,{waitUntil:"domcontentloaded"});
   assert(await page.locator("body > .ss-common-header").count()===1,route+" SS-style header");
   assert(await page.locator(".c-ss-shell > .c-ss-sidebar").count()===1,route+" course sidebar");
   assert(await page.locator(selector).count()===count,route+" task sections preserved");
   assert(await page.locator("[data-els-theme-picker] option").count()===5,route+" five themes");
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+8),route+" no overflow");
   assert(errors.length===0,route+" no runtime errors "+errors.join(";"));
   await page.close();
  }
  browserStatus="RAN";
 }catch(e){assert(false,"Browser integration test failed: "+String(e))}
 finally{if(browser)await browser.close();if(server)server.kill()}
}
console.log(JSON.stringify({status:failures.length?"FAIL":"PASS",browserStatus,passed:results.filter(r=>r.pass).length,total:results.length,failures},null,2));
if(failures.length)process.exitCode=1;
