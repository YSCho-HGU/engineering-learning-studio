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
  // Select a non-first topic without changing the URL. Changing language must
  // leave the live document and selected topic in place, just as S&S does.
  await page.locator('#lesson-nav button[data-lesson="3"]').click();
  const selectedGoal=await page.evaluate(()=>window.C_JOURNEY.lessons[3].goal);
  assert.ok(selectedGoal.length>8,"Fourth C Functions topic exists");
  await page.evaluate(()=>{window.__cLanguagePageIdentity="same-document"});
  const correct=await page.evaluate(()=>window.C_JOURNEY.lessons[3].quiz.correct);
  await page.locator('#lesson .quiz input[type="radio"]').nth(correct).check();
  await page.locator('#lesson .quiz button').click();
  await page.locator('#lesson .explain').evaluate(e=>e.previousElementSibling.click());
  await page.locator('#lesson .trace-controls button').nth(1).click();
  await page.locator('#model-control').evaluate(e=>{
    e.value=e.max;e.dispatchEvent(new Event("input",{bubbles:true}));
  });
  await page.locator('#lesson .transfer textarea').fill("Unsaved user explanation");
  await page.locator('#lesson details').first().evaluate(e=>e.open=true);
  const topicTitle=()=>page.locator("#lesson h2").first().innerText();
  for(const mode of ["mixed","en","ko","mixed"]){
    const current=await page.evaluate(()=>window.ELSLanguage?.get());
    if(current!==mode)await page.locator("#c-shared-language select").selectOption(mode);
    await page.waitForFunction(m=>{
      return window.ELSLanguage?.get()===m &&
        document.querySelector("#c-shared-language select")?.value===m &&
        !!window.C_JOURNEY?.lessons?.[0]?.goal;
    },mode,{timeout:15000});
    await page.waitForFunction(m=>{
      const topic=document.querySelector("#lesson h2");
      const expected=window.C_JOURNEY?.lessons?.[3]?.title;
      return topic?.textContent===expected && window.ELSLanguage?.get()===m;
    },mode,{timeout:12000});
    assert.equal(await page.evaluate(()=>window.__cLanguagePageIdentity),"same-document",
      mode+" language change must not reload the C chapter");
    assert.equal(await page.locator('#lesson-nav button[aria-current="step"]').getAttribute("data-lesson"),
      "3",mode+" must keep current C topic");
    assert.equal(await page.locator('#lesson .trace-lab').getAttribute('data-trace-index'),'1',
      mode+" trace position lost");
    assert.equal(await page.locator('#model-control').inputValue(),
      await page.locator('#model-control').getAttribute('max'),mode+" slider value lost");
    assert.equal(await page.locator('#lesson .quiz input:checked').count(),1,mode+" quiz choice lost");
    assert.equal(await page.locator('#lesson .quiz .feedback').isVisible(),true,mode+" quiz feedback hidden");
    assert.equal(await page.locator('#lesson .explain').isVisible(),true,mode+" revealed result hidden");
    assert.equal(await page.locator('#lesson details').first().evaluate(e=>e.open),true,mode+" hint collapsed");
    assert.equal(await page.locator('#lesson .transfer textarea').inputValue(),
      "Unsaved user explanation",mode+" explanation draft lost");
    const result=await inspect(page);
    verify(result,mode);
    console.log("PASS: C Functions body language mode",mode);
  }
  await context.close();

  // Coding practice: retain P3 and an edited C draft across all modes.
  const editorContext=await browser.newContext({viewport:{width:1280,height:900}});
  await editorContext.addInitScript(()=>localStorage.setItem("els-language","mixed"));
  const editorTab=await editorContext.newPage();
  const draft="/* keep this work */\\nint main(void){return 7;}";
  await editorTab.goto(root+"c-programming/functions/practice/",{waitUntil:"domcontentloaded"});
  await editorTab.locator(".cp-nav-item").nth(2).click();
  await editorTab.locator("#cp-editor").fill(draft);
  await editorTab.evaluate(()=>{window.__cPracticeIdentity="same-document"});
  await editorTab.locator("#c-shared-language select").selectOption("en");
  await editorTab.waitForFunction(()=>window.ELSLanguage?.get()==="en");
  assert.equal(await editorTab.locator("#cp-editor").inputValue(),draft,"C draft preserved");
  assert.equal(await editorTab.locator(".cp-nav-item.active").innerText().then(x=>x.slice(0,2)),"P3",
    "Coding Practice remains on P3");
  assert.equal(await editorTab.evaluate(()=>window.__cPracticeIdentity),"same-document",
    "Practice language change must not reload");
  await editorContext.close();

  // The static File I/O lesson must also keep its current active stage.
  const fileContext=await browser.newContext({viewport:{width:1280,height:900}});
  await fileContext.addInitScript(()=>localStorage.setItem("els-language","mixed"));
  const fileTab=await fileContext.newPage();
  await fileTab.goto(root+"c-programming/file-io/",{waitUntil:"domcontentloaded"});
  await fileTab.locator("#lesson-nav [data-nav]").nth(3).click();
  const fileStage=await fileTab.locator(".stage[data-stage]:not([hidden])").first().getAttribute("data-stage");
  assert.notEqual(fileStage,"0","File I/O stage moved away from first topic");
  await fileTab.evaluate(()=>{window.__cFileIdentity="same-document"});
  await fileTab.locator("#c-shared-language select").selectOption("en");
  await fileTab.waitForFunction(()=>window.ELSLanguage?.get()==="en");
  assert.equal(await fileTab.locator(".stage[data-stage]:not([hidden])").first().getAttribute("data-stage"),
    fileStage,"File I/O current stage preserved");
  assert.equal(await fileTab.evaluate(()=>window.__cFileIdentity),"same-document",
    "File I/O language change must not reload");
  await fileContext.close();

  // Keep actual simulation closure state (not just the selected Chapter).
  {
    const ctx=await browser.newContext({viewport:{width:1280,height:900}});
    await ctx.addInitScript(()=>localStorage.setItem("els-language","mixed"));
    const tab=await ctx.newPage();
    await tab.goto(root+"c-programming/dynamic-memory/",{waitUntil:"domcontentloaded"});
    await tab.locator('#lesson-nav button[data-lesson="3"]').click();
    await tab.locator('.dm-heap [data-phase="used"]').click();
    await tab.locator('.dm-heap .dm-cell').nth(3).click();
    await tab.locator('.dm-heap [data-leak="lost"]').click();
    await tab.locator('.dm-heap .dm-leak').evaluate(e=>e.open=true);
    await tab.locator('#lesson .trace-controls button').nth(1).click();
    await tab.evaluate(()=>window.__heapDocumentMarker="unchanged");
    for(const mode of ["en","ko","mixed"]){
      await tab.locator('#c-shared-language select').selectOption(mode);
      await tab.waitForFunction(m=>window.ELSLanguage?.get()===m,mode);
      assert.equal(await tab.evaluate(()=>window.__heapDocumentMarker),"unchanged",
        mode+" reloaded heap");
      assert.equal(await tab.locator('.dm-heap').getAttribute('data-phase'),'used');
      assert.equal(await tab.locator('.dm-heap .dm-cell.selected')
        .evaluate(e=>Array.from(e.parentElement.children).indexOf(e)),3);
      assert.equal(await tab.locator('.dm-heap [data-leak="lost"]')
        .getAttribute('aria-pressed'),'true');
      assert.equal(await tab.locator('.dm-heap .dm-leak').evaluate(e=>e.open),true);
      assert.equal(await tab.locator('#lesson .trace-lab')
        .getAttribute('data-trace-index'),'1');
    }
    await tab.locator('#dm-play').click();
    await tab.locator('#c-shared-language select').selectOption("en");
    assert.equal(await tab.locator('.dm-heap').evaluate(e=>e.getLanguageSnapshot().playing),
      true,"autoplay was reset by language selection");
    await ctx.close();
  }
  // Preserve source code, syntax-check result and an expanded hint in P3.
  {
    const ctx=await browser.newContext({viewport:{width:1280,height:900}});
    await ctx.addInitScript(()=>localStorage.setItem("els-language","mixed"));
    const tab=await ctx.newPage();
    await tab.goto(root+"c-programming/functions/practice/",{waitUntil:"domcontentloaded"});
    await tab.locator('.cp-nav-item').nth(2).click();
    const draftCode="/* Keep this C draft */\\nint main(void){return 31;}";
    await tab.locator('#cp-editor').fill(draftCode);
    await tab.locator('.cp-guided-reveal').first().click();
    await tab.locator('.cp-button.cp-primary').click();
    await tab.evaluate(()=>window.__practiceDocumentMarker="unchanged");
    for(const mode of ["en","ko","mixed"]){
      await tab.locator('#c-shared-language select').selectOption(mode);
      await tab.waitForFunction(m=>window.ELSLanguage?.get()===m,mode);
      assert.equal(await tab.evaluate(()=>window.__practiceDocumentMarker),"unchanged");
      assert.ok((await tab.locator('.cp-nav-item.active').innerText()).startsWith("P3"));
      assert.equal(await tab.locator('#cp-editor').inputValue(),draftCode);
      assert.equal(await tab.locator('.cp-feedback').getAttribute('data-kind'),'check');
      assert.ok((await tab.locator('.cp-feedback').innerText()).includes('✓'));
      assert.equal(await tab.locator('.cp-guided-hint').first().isVisible(),true);
    }
    await ctx.close();
  }

  // The Chapter 211 engine stores activity state separately from language:
  // a graded answer, bubble-sort trace and checked safety choices must survive.
  {
    const ctx=await browser.newContext({viewport:{width:1280,height:900}});
    await ctx.addInitScript(()=>localStorage.setItem("els-language","mixed"));
    const tab=await ctx.newPage();
    await tab.goto(root+"c-programming/ai-coding/toolkit.html#11-1",{waitUntil:"domcontentloaded"});
    await tab.locator('#activity .ai-card button').nth(1).click();
    await tab.evaluate(()=>window.__ai211Identity="same-document");
    for(const mode of ["en","ko","mixed"]){
      await tab.locator('#c-shared-language select').selectOption(mode);
      await tab.waitForFunction(m=>window.ELSLanguage?.get()===m,mode);
      assert.equal(await tab.evaluate(()=>window.__ai211Identity),"same-document");
      const answer=await tab.locator('#activity .ai-result').innerText();
      assert.ok(answer.includes(mode==="ko"?"정답":"Correct"),
        mode+" AI Coding answer feedback missing");
      assert.equal(new URL(tab.url()).hash,"#11-1");
    }
    await tab.evaluate(()=>location.hash="#11-2");
    await tab.locator('#sort-step').click();
    const before=await tab.locator('#activity .ai-result').innerText();
    const suffix=before.slice(before.lastIndexOf("("));
    assert.ok(suffix.startsWith("(")&&suffix.includes("/"),"sort trace not started");
    await tab.locator('#c-shared-language select').selectOption("en");
    assert.ok((await tab.locator('#activity .ai-result').innerText()).includes(suffix),
      "sort trace returned to frame zero");
    await tab.evaluate(()=>location.hash="#11-6");
    for(const i of [0,2,4])await tab.locator('#activity .ai-check input').nth(i).check();
    await tab.locator('#activity .ai-card button').last().click();
    await tab.locator('#c-shared-language select').selectOption("ko");
    assert.ok((await tab.locator('#activity .ai-result').innerText()).includes("정답"),
      "AI Coding safety verdict disappeared after language change");
    assert.equal(await tab.locator('#activity .ai-check input:checked').count(),3);
    await ctx.close();
  }

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
