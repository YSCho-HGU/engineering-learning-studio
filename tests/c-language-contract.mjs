#!/usr/bin/env node
/* C language contract: preserve native ENG + 한국어 / ENG / 한국어 modes.
 * Read-only browser contexts; no existing learner data is modified.
 */
import assert from "node:assert/strict";
import {chromium} from "playwright";

const root=(process.env.HEADER_BASE_URL||"http://127.0.0.1:8765/").replace(/\/?$/,"/");
const browser=await chromium.launch({headless:true});
const url=root+"c-programming/functions/";
const marker="els-c-language-qa-preserve";
const englishGoal="Separate repeated computations into functions.";
const inspect=async page=>page.evaluate(key=>{
  const lang=window.ELSLanguage;
  const goal=window.C_JOURNEY?.lessons?.[0]?.goal||"";
  const picker=document.querySelector("#c-shared-language select");
  const right=document.querySelector("header.c-ss-header .ss-common-actions");
  return {
    mode:lang?.get(),
    stored:localStorage.getItem("els-language"),
    goal,selection:picker?.value,
    nativeCount:document.querySelectorAll("#c-shared-language select").length,
    nativeVisible:!!picker && picker.getBoundingClientRect().width>30 &&
      getComputedStyle(picker).visibility!=="hidden",
    topRightLanguageCount:right?.querySelectorAll(".ss-common-language-select").length ?? -1,
    themeCount:right?.querySelectorAll("[data-els-theme-picker]").length ?? -1,
    progressPreserved:localStorage.getItem(key)==="untouched"
  };
},marker);
function verify(x,mode){
  assert.equal(x.mode,mode,mode+" language API mode");
  assert.equal(x.stored,mode,mode+" saved language mode");
  assert.equal(x.selection,mode,mode+" single native select value");
  assert.equal(x.nativeCount,1,mode+" native picker count");
  assert.equal(x.nativeVisible,true,mode+" picker must remain visible");
  assert.equal(x.topRightLanguageCount,0,mode+" duplicate right-hand language picker");
  assert.equal(x.themeCount,1,mode+" theme picker remains");
  assert.equal(x.progressPreserved,true,mode+" unrelated saved learner state");
  if(mode==="en"){
    assert.equal(x.goal,englishGoal,"EN must project English-only lesson content");
    assert.ok(!/[가-힣]/.test(x.goal),"EN lesson contains Korean");
  }else if(mode==="ko"){
    assert.ok(/[가-힣]/.test(x.goal),"KR mode lost Korean lesson content");
    assert.ok(!x.goal.includes(englishGoal),"KR mode mistakenly mixed English translation");
  }else{
    assert.ok(x.goal.startsWith(englishGoal),"Mixed mode must show English first");
    assert.ok(/[가-힣]/.test(x.goal),"Mixed mode must include Korean explanation");
  }
}
try{
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.addInitScript(key=>{
    if(localStorage.getItem(key)!=="untouched"){
      localStorage.setItem("els-language","mixed");
      localStorage.setItem(key,"untouched");
    }
  },marker);
  const page=await context.newPage();
  await page.route("**/*",route=>{
    const host=new URL(route.request().url()).hostname;
    (host==="localhost"||host==="127.0.0.1")?route.continue():route.abort();
  });
  const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(response?.status(),200,"C Functions not served");
  for(const mode of ["mixed","en","ko","mixed"]){
    const current=await page.evaluate(()=>window.ELSLanguage?.get());
    if(current!==mode){
      await Promise.all([
        page.waitForNavigation({waitUntil:"domcontentloaded",timeout:15000}),
        page.locator("#c-shared-language select").selectOption(mode)
      ]);
    }
    await page.waitForFunction(m=>{
      return window.ELSLanguage?.get()===m &&
        document.querySelector("#c-shared-language select")?.value===m &&
        !!window.C_JOURNEY?.lessons?.[0]?.goal;
    },mode,{timeout:15000});
    // Language choice reloads the page; wait for projection to be available.
    await page.waitForTimeout(350);
    const result=await inspect(page);
    verify(result,mode);
    console.log("PASS: C Functions body language mode",mode);
  }
  await context.close();

  // AI-Assisted Coding and File I/O Guided Labs have their own translation
  // engines. Removing the shared right-hand select must not strand either.
  for(const target of [
    {route:"c-programming/ai-coding/",picker:"#c-ai-language",text:"#studio-content",
      contentEn:null},
    {route:"c-programming/file-io/core-labs/",picker:"#language-mode",
      text:'[data-i18n="writeTitle"]',contentEn:"Write One Line to a File"}
  ]){
    const isolated=await browser.newContext({viewport:{width:1280,height:900}});
    await isolated.addInitScript(()=>localStorage.setItem("els-language","mixed"));
    const tab=await isolated.newPage();
    await tab.route("**/*",route=>{
      const host=new URL(route.request().url()).hostname;
      (host==="localhost"||host==="127.0.0.1")?route.continue():route.abort();
    });
    const response=await tab.goto(root+target.route,{waitUntil:"domcontentloaded",timeout:30000});
    assert.equal(response?.status(),200,target.route+" not served");
    await tab.waitForFunction(selector=>!!document.querySelector(selector),target.picker,{timeout:12000});
    const initial=await tab.evaluate(selector=>{
      const picker=document.querySelector(selector);
      return {mode:window.ELSLanguage?.get(),value:picker?.value,
        visible:!!picker&&picker.getBoundingClientRect().width>30,
        rightDuplicate:document.querySelectorAll("header.c-ss-header .ss-common-language-select").length};
    },target.picker);
    assert.equal(initial.mode,"mixed",target.route+" initial mixed mode");
    assert.equal(initial.value,"mixed",target.route+" native control initial mode");
    assert.equal(initial.visible,true,target.route+" native control must be visible");
    assert.equal(initial.rightDuplicate,0,target.route+" shared-language duplicate");
    await tab.locator(target.picker).selectOption("en");
    await tab.waitForFunction(()=>window.ELSLanguage?.get()==="en",null,{timeout:12000});
    await tab.waitForTimeout(200);
    const next=await tab.evaluate(selector=>({
      mode:window.ELSLanguage.get(),text:document.querySelector(selector)?.textContent||""
    }),target.text);
    assert.equal(next.mode,"en",target.route+" native picker failed to update language");
    if(target.contentEn)assert.equal(next.text.trim(),target.contentEn,
      target.route+" English lesson content did not update");
    assert.ok(next.text.length>10,target.route+" rendered learning content is missing");
    console.log("PASS: C native language control",target.route);
    await isolated.close();
  }
}finally{await browser.close();}
