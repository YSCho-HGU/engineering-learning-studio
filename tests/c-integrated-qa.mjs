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
 assert(d.lessons.length===8,kind+" lessons = 8");
 assert(d.practice.length===6,kind+" exercises = 6");
 assert(d.lessons.every(x=>x.quiz.options[x.quiz.correct]===x.output),kind+" quiz oracle");
 assert(d.practice.every(x=>x.starter.includes("TODO")&&x.expected),kind+" draft and expected outputs");
 for(const file of [kind+"/index.html",kind+"/practice/index.html"]){
  assert(fs.existsSync(base+file),file+" route exists");
 }
 const home=fs.readFileSync(base+kind+"/index.html","utf8");
 assert(home.includes('id="assessment-status"'),kind+" independent concept status");
 assert(home.includes('./practice/'),kind+" practice editor navigation");
 assert(home.includes(kind==="pointer"?"../structure/":"../file-io/"),kind+" next course link");
}
const hub=fs.readFileSync(base+"learning-journey/index.html","utf8");
assert(["pointer","structure","fileio"].every(c=>hub.includes('data-course="'+c+'"')), "3 courses visible on integrated hub");
assert(hub.includes("els-code-evidence-")&&hub.includes("els-concept-"),"Activity/Concept/Coding aggregation");
const fileio=fs.readFileSync(base+"file-io/index.html","utf8");
assert(fileio.includes('id="concept-count"'),"File I/O concept evidence element");
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
   const conceptIndex=course[kind].lessons[0].quiz.correct;
   await page.locator("#lesson .question label").nth(conceptIndex).click();
   await page.locator("#lesson .question button").click();
   assert((await page.locator("#assessment-status").innerText()).includes("Concept Check Passed 1/8"),kind+" concept pass recorded");
   assert((await page.locator("#progress-text").innerText()).includes("Activity 0/8"),kind+" activity not silently awarded");
   await page.locator("#lesson .navactions button").nth(1).click();
   assert((await page.locator("#progress-text").innerText()).includes("Activity 1/8"),kind+" activity marked independently");
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
  assert((await fileio.locator("#concept-count").innerText()).includes("1/8"),"File I/O concept correct answer is separately recorded");
  assert(fileioErrors.length===0,"File I/O new concept evidence no runtime errors "+fileioErrors.join(";"));
  await fileio.close();
  const filePractice=await browser.newPage({viewport:{width:390,height:850}});
  await filePractice.goto("http://127.0.0.1:8876/"+base+"file-io/practice/",{waitUntil:"domcontentloaded"});
  assert(await filePractice.locator('#task-nav button').count()===6,"File I/O six tasks retained");
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
  browserStatus="RAN";
 }catch(e){assert(false,"Browser integration test failed: "+String(e))}
 finally{if(browser)await browser.close();if(server)server.kill()}
}
console.log(JSON.stringify({status:failures.length?"FAIL":"PASS",browserStatus,passed:results.filter(r=>r.pass).length,total:results.length,failures},null,2));
if(failures.length)process.exitCode=1;
