#!/usr/bin/env node
/* Chapter 191 chapter/practice browser acceptance tests (isolated storage). */
import assert from "node:assert/strict";
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true,timeout:15000});
const base=process.env.HEADER_BASE_URL||"http://127.0.0.1:8765/";
const root=base.endsWith("/")?base:base+"/";
const failures=[];
for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:900}});
 await context.addInitScript(()=>{localStorage.setItem("els-language","mixed");localStorage.setItem("els-theme-v2","neutral-dark")});
 const page=await context.newPage();page.setDefaultTimeout(11000);
 try{
  const response=await page.goto(root+"c-programming/low-level-c/",{waitUntil:"domcontentloaded",timeout:20000});
  assert.equal(response?.status(),200,"Chapter 19 served");
  await page.waitForSelector("#lesson-nav button[data-lesson]");
  assert.equal(await page.locator("#lesson-nav button[data-lesson]").count(),11);
  assert.equal(await page.locator("#c191-visual .c191-bit").count(),8);
  assert.equal(await page.locator("#c191-visual .c191-bit.on").count(),5);
  assert.equal(await page.locator(".ss-common-language select").count(),1,"single standard language picker");
  // 19.2: declarations execute in source order; no sensor status in this scene.
  await page.locator('#lesson-nav button[data-lesson="1"]').click();
  assert.equal(await page.locator('#c191-visual .c191-op-variable').count(),3);
  assert.equal(await page.locator('#c191-visual .c191-op-unknown').count(),3,"a,b,result initially unknown");
  assert.equal(await page.locator('#c191-visual .c191-device').count(),0,"no unrelated device panel");
  assert.equal(await page.locator('.c191-op-experiment').count(),1,"extra experiment separate");
  await page.locator('[data-action="step"]').click();
  assert.equal(await page.locator('.c191-op-variable[data-variable="a"] .c191-op-number').count(),1,"a initialized first");
  assert.equal(await page.locator('.c191-op-unknown').count(),2);
  await page.locator('[data-action="step"]').click();
  assert.equal(await page.locator('.c191-op-variable[data-variable="b"] .c191-op-number').count(),1,"b initialized second");
  assert.equal(await page.locator('.c191-op-unknown').count(),1);
  await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-op-variable[data-variable="result"] .c191-op-number').innerText()).includes("0x07"),"OR produces result 7");
  await page.locator('[data-action="reset-step"]').click();
  assert.equal(await page.locator('.c191-op-unknown').count(),3,"reset restores unknown variables");
  await page.locator('[data-action="operator"]').click();
  assert.equal(await page.locator('.c191-op-unknown').count(),3,"independent experiment cannot initialize sample");
  await page.locator('#lesson-nav button[data-lesson="2"]').click();
  assert.equal(await page.locator(".c191-metrics span").nth(1).innerText(),"Hex 0x04");
  await page.locator('[data-action="step"]').click();
  await page.locator('[data-action="step"]').click();
  assert.equal(await page.locator(".c191-metrics span").nth(1).innerText(),"Hex 0x06","C line to LED register");
  await page.locator('[data-action="reset-step"]').click();
  assert.equal(await page.locator(".c191-metrics span").nth(1).innerText(),"Hex 0x04");
  await page.locator('#lesson-nav button[data-lesson="3"]').click();
  await page.locator('[data-action="flag"][data-flag="0"]').click();
  assert.ok((await page.locator(".c191-state.active").innerText()).includes("RUNNING"));
  await page.locator('[data-action="flag"][data-flag="4"]').click();
  assert.ok((await page.locator(".c191-state.active").innerText()).includes("ERROR"));
  await page.locator('#lesson-nav button[data-lesson="5"]').click();
  await page.locator('[data-action="build"]').click();
  assert.equal(await page.locator(".c191-file.active").innerText(),"main.c + status.c");
  await page.locator('#lesson-nav button[data-lesson="6"]').click();
  await page.locator('[data-action="call"]').click();
  await page.locator('[data-action="call"]').click();
  assert.ok((await page.locator(".c191-terminal").innerText()).includes("1002"));
  await page.locator('#lesson-nav button[data-lesson="7"]').click();
  assert.ok((await page.locator(".c191-terminal").innerText()).includes("argc = 3"));
  await page.locator('#lesson-nav button[data-lesson="8"]').click();
  await page.locator(".c191-bit[data-bit='0']").click();
  const status=await page.locator(".c191-terminal").innerText();
  assert.ok(status.includes("ERROR_STATE"),"sensor decoder priority");
  // Q3: predict -> execute -> compare, across all 11 sections.
  await page.locator('#lesson-nav button[data-lesson="2"]').click();
  await page.locator('#c191-pred-byte').fill("6");
  await page.locator('[data-action="predict-save"]').click();
  assert.equal(await page.locator('.c191-pred-compare').count(),1);
  assert.ok((await page.locator('.c191-pred-pending').innerText()).includes("Step") || (await page.locator('.c191-pred-pending').innerText()).includes("후"));
  await page.locator('[data-action="step"]').click();
  await page.locator('[data-action="step"]').click();
  assert.equal(await page.locator('.c191-pred-feedback.matched').count(),1,"register prediction 0x06 matches LED");
  assert.equal(await page.locator('.c191-pred-side').nth(1).locator('.c191-mini-leds .lit').count(),2);
  await page.locator('[data-action="predict-edit"]').click();
  assert.equal(await page.locator('#c191-pred-byte').isEnabled(),true,"prediction editable again");
  await page.locator('[data-action="reset-step"]').click();
  assert.equal(await page.locator('.c191-pred-compare').count(),0,"reset clears comparison");

  await page.locator('#lesson-nav button[data-lesson="3"]').click();
  await page.locator('#c191-pred-state').selectOption("RUNNING");
  await page.locator('[data-action="predict-save"]').click();
  await page.locator('[data-action="flag"][data-flag="0"]').click();
  assert.equal(await page.locator('.c191-pred-feedback.matched').count(),1,"READY yields RUNNING");
  await page.locator('[data-action="flag"][data-flag="4"]').click();
  assert.equal(await page.locator('.c191-pred-feedback.unmatched').count(),1,"ALARM overrides READY");
  assert.ok((await page.locator('.c191-state.active').innerText()).includes("ERROR"));

  await page.locator('#lesson-nav button[data-lesson="0"]').click();
  await page.locator('#c191-pred-byte').fill("180");
  await page.locator('[data-action="predict-save"]').click();
  await page.locator('.c191-bit[data-bit="0"]').click();
  assert.equal(await page.locator('.c191-pred-feedback.matched').count(),1,"bit explorer 0xB5 to 0xB4");
  assert.equal(await page.locator('.c191-pred-side').nth(1).locator('.c191-mini-bits .mismatch').count(),0);

  for(let section=0;section<11;section++){
   await page.locator('#lesson-nav button[data-lesson="'+section+'"]').click();
   assert.equal(await page.locator('#lesson h2').count(),1,"heading section "+(section+1));
   assert.ok((await page.locator('.c191-code .c191-line').count())>=2,"code section "+(section+1));
   if(section===1) assert.equal(await page.locator('#c191-visual .c191-op-variable').count(),3,"three C variables");
   else assert.equal(await page.locator('#c191-visual .c191-terminal').count(),1,"result section "+(section+1));
   if([0,1,2,3,8,10].includes(section))
    assert.equal(await page.locator('.c191-prediction').count(),1,"prediction section "+(section+1));
   await page.locator('[data-action="reset-step"]').click();
   await page.locator('[data-action="step"]').click();
   assert.equal(await page.locator('.c191-code .c191-line.current').count(),1,"single highlighted line section "+(section+1));
  }
  await page.locator('#lesson-nav button[data-lesson="8"]').click();
  await page.locator("#c191-note").fill("Keep my unsent reasoning");
  const previousUrl=page.url();
  await page.locator(".ss-common-language select").selectOption("en");
  assert.equal(page.url(),previousUrl,"language switch did not navigate");
  assert.equal(await page.locator("#c191-note").inputValue(),"Keep my unsent reasoning");
  assert.ok(await page.locator("#lesson h2").innerText().then(x=>x.includes("Sensor Status Monitor")));
  assert.equal(await page.locator(".ss-common-language select").count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),"mobile horizontal overflow");
  console.log("PASS "+width+"px Chapter 191, register, state, module, static, argv, capstone, language");
  const practiceResponse=await page.goto(root+"c-programming/low-level-c/practice/",{waitUntil:"domcontentloaded",timeout:20000});
  assert.equal(practiceResponse?.status(),200);
  await page.waitForSelector(".cp-nav-item");
  assert.equal(await page.locator(".cp-nav-item").count(),6,"P1 to P6 present");
  await page.locator(".cp-nav-item").nth(2).click();
  const draft="/* custom C draft */\nint main(void){return 19;}";
  await page.locator("#cp-editor").fill(draft);
  await page.locator(".ss-common-language select").selectOption("ko");
  assert.equal(await page.locator("#cp-editor").inputValue(),draft,"practice code preserved after language switch");
  assert.ok((await page.locator(".cp-nav-item.active").innerText()).includes("P3"));
  assert.equal(await page.locator(".ss-common-language select").count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),"practice mobile overflow");
  console.log("PASS "+width+"px P1–P6, draft, single picker");
 }catch(e){failures.push(width+"px "+e.message);console.error("FAIL "+width+"px "+e.stack);}
 finally{await context.close();}
}
await browser.close();
assert.deepEqual(failures,[],"Chapter 191 QA");
