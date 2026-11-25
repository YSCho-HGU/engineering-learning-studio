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
  assert.equal(await page.locator("#c191-visual .c191-uninitialized").count(),1,"19.1 starts uninitialized");
  await page.locator('[data-action="step"]').click();
  assert.equal(await page.locator("#c191-visual .c191-uninitialized").count(),1,"include does not initialize status");
  await page.locator('[data-action="step"]').click();
  assert.equal(await page.locator("#c191-visual .c191-bit.on").count(),5,"status becomes 0xB5 on declaration");
  assert.equal(await page.locator(".ss-common-language select").count(),1,"single standard language picker");
  assert.equal(await page.locator('.c191-concept-check').count(),1);
  assert.equal(await page.locator('.c191-concept-check').evaluate(el=>el.open),false);
  await page.locator('.c191-concept-check summary').click();
  await page.locator('input[name="c191-answer"][value="0"]').check();
  assert.equal(await page.locator('.c191-concept-check').evaluate(el=>el.open),true);
  await page.locator('[data-action="check"]').click();
  assert.ok((await page.locator('.c191-result').innerText()).length>4);

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
  assert.equal(await page.locator("#c191-visual .c191-uninitialized").count(),1,"19.3 led uninitialized");
  await page.locator('[data-action="step"]').click();
  assert.equal(await page.locator(".c191-metrics span").nth(1).innerText(),"Hex 0x04");
  await page.locator('[data-action="step"]').click();
  assert.equal(await page.locator(".c191-metrics span").nth(1).innerText(),"Hex 0x06","C line to LED register");
  await page.locator('[data-action="reset-step"]').click();
  assert.equal(await page.locator(".c191-uninitialized").count(),1,"reset restores unknown LED");
  // Independent mask exploration must not mutate the reference LED register.
  await page.locator('[data-action="mask"]').click();
  assert.equal(await page.locator('.c191-uninitialized').count(),1,"extra exploration leaves code display uninitialized");
  assert.equal(await page.locator('.c191-extra .c191-mini-bits').count(),1,"exploration has its own byte");
  await page.locator('[data-action="reset-mask"]').click();
  await page.locator('#lesson-nav button[data-lesson="3"]').click();
  await page.locator('[data-action="flag"][data-flag="0"]').click();
  assert.ok((await page.locator(".c191-state.active").innerText()).includes("RUNNING"));
  await page.locator('[data-action="flag"][data-flag="4"]').click();
  assert.ok((await page.locator(".c191-state.active").innerText()).includes("ERROR"));
  // Branch paths: only reachable statements execute; return stops the trace.
  await page.locator('#lesson-nav button[data-lesson="3"]').click();
  await page.locator('[data-action="reset-step"]').click();
  await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-device-head').innerText()).includes("판정 전") ||
    (await page.locator('.c191-device-head').innerText()).includes("Not decoded"));
  await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-code .c191-line.current').innerText()).includes("if (status"));
  await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-code .c191-line.current').innerText()).includes("state = IDLE")===false);
  await page.locator('#lesson-nav button[data-lesson="8"]').click();
  await page.locator('[data-action="reset-step"]').click();
  for(let i=0;i<3;i++)await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-code .c191-line.current').innerText()).includes("ERROR_STATE"),"error branch returns");
  await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-code .c191-line.current').innerText()).includes("ERROR_STATE"),"no steps after return");
  await page.locator('#lesson-nav button[data-lesson="10"]').click();
  await page.locator('[data-action="reset-step"]').click();
  await page.locator('[data-action="step"]').click();
  await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-metrics span').nth(1).innerText()).includes("0x95"),"bit 5 cleared");

  // No unreachable C lines in READY, IDLE or error return paths.
  await page.locator('#lesson-nav button[data-lesson="3"]').click();
  await page.locator('[data-action="reset-step"]').click();
  await page.locator('[data-action="flag"][data-flag="0"]').click();
  const runningPath=[];
  for(let i=0;i<4;i++){await page.locator('[data-action="step"]').click();runningPath.push(await page.locator('.c191-line.current').innerText());}
  assert.ok(runningPath[3].includes("state = RUNNING"),"READY branch reaches RUNNING");
  assert.ok(!runningPath.some(x=>x.includes("state = ERROR_STATE")),"READY does not execute error assignment");
  await page.locator('[data-action="flag"][data-flag="0"]').click();
  const idlePath=[];
  for(let i=0;i<5;i++){await page.locator('[data-action="step"]').click();idlePath.push(await page.locator('.c191-line.current').innerText());}
  assert.ok(idlePath[4].includes("state = IDLE"),"IDLE branch runs only after failed tests");
  assert.ok(!idlePath.some(x=>x.includes("state = RUNNING")),"IDLE skips RUNNING assignment");

  // Optional conditional compilation must skip the inactive DEBUG body.
  await page.locator('#lesson-nav button[data-lesson="9"]').click();
  for(let i=0;i<4;i++)await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-line.current').innerText()).includes("#endif"),"DEBUG body is skipped");
  assert.ok((await page.locator('.c191-trace').innerText()).includes("DEBUG"));

  // 19.5: macro expansion and arithmetic must appear only at their trace steps.
  await page.locator('#lesson-nav button[data-lesson="4"]').click();
  assert.equal(await page.locator('.c191-stage-list .c191-file.active').count(),0,"macro before first step");
  for(let i=0;i<3;i++)await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-file.active').innerText()).includes("1+2*1+2"),"macro token substitution");
  await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-file.active').innerText()).includes("5"),"macro expression result");
  await page.locator('[data-action="reset-step"]').click();
  assert.equal(await page.locator('.c191-stage-list .c191-file.active').count(),0,"macro reset");

  // 19.6: compiler and linker order; focus highlights source line.
  await page.locator('#lesson-nav button[data-lesson="5"]').click();
  assert.equal(await page.locator('.c191-file.active').count(),0,"files initially unprocessed");
  for(let i=0;i<5;i++)await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-file.active').innerText()).includes("Executable"));
  assert.ok((await page.locator('.c191-stage-explain').innerText()).length>20);
  await page.locator('[data-action="reset-step"]').click();
  assert.equal(await page.locator('.c191-file.active').count(),0,"compile reset");

  // 19.7: four steps per call; static persists when frames return.
  await page.locator('#lesson-nav button[data-lesson="6"]').click();
  assert.ok((await page.locator('.c191-memory').innerText()).includes("1000"));
  for(let i=0;i<4;i++)await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-memory').innerText()).includes("1001"));
  await page.locator('[data-action="call"]').click();
  assert.ok((await page.locator('.c191-memory').innerText()).includes("1002"));
  await page.locator('[data-action="reset-step"]').click();
  assert.ok((await page.locator('.c191-memory').innerText()).includes("1000"));

  // 19.8: argc mismatch exits early; simulated fopen success/failure is explicit.
  await page.locator('#lesson-nav button[data-lesson="7"]').click();
  assert.ok((await page.locator('.c191-argv').innerText()).includes("argc = 2"));
  await page.locator('#c191-command').fill("./sensor data.txt -v");
  await page.locator('[data-action="step"]').click();
  await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-stage-explain').innerText()).includes("return 1"));
  await page.locator('#c191-command').fill("./sensor data.txt");
  await page.locator('[data-setting="fileAvailable"]').check();
  for(let i=0;i<5;i++)await page.locator('[data-action="step"]').click();
  assert.ok((await page.locator('.c191-file.active').innerText()).includes("fclose"));
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
  await page.locator('[data-action="step"]').click();
  await page.locator('[data-action="step"]').click();
  await page.locator('#c191-pred-byte').fill("180");
  await page.locator('[data-action="predict-save"]').click();
  await page.locator('.c191-bit[data-bit="0"]').click();
  assert.equal(await page.locator('.c191-pred-feedback.matched').count(),1,"bit explorer 0xB5 to 0xB4");
  assert.equal(await page.locator('.c191-pred-side').nth(1).locator('.c191-mini-bits .mismatch').count(),0);

  for(let section=0;section<11;section++){
   await page.locator('#lesson-nav button[data-lesson="'+section+'"]').click();
   await page.locator('[data-action="reset-step"]').click();
   assert.equal(await page.locator('#lesson h2').count(),1,"heading section "+(section+1));
   assert.equal(await page.locator('.c191-concept-check').count(),1,"one optional quiz per section");
   assert.equal(await page.locator('.c191-reflect').count(),1,"one reflection panel per section");
   assert.equal(await page.locator('#lesson .c191-grid').count(),1,"one main code-observation grid");

   assert.ok((await page.locator('.c191-code .c191-line').count())>=2,"code section "+(section+1));
   if(section===1) assert.equal(await page.locator('#c191-visual .c191-op-variable').count(),3,"three C variables");
   else if(section===0) assert.equal(await page.locator('#c191-visual .c191-uninitialized').count(),1,"uninitialized byte section "+(section+1));
   else if(section===2) assert.equal(await page.locator('#c191-visual .c191-uninitialized').count(),1,"uninitialized LED section "+(section+1));
   else if(section===10) assert.equal(await page.locator('#c191-visual .c191-bit').count(),8,"review bit model");
   else if(![0,1,4,5,6,7,10].includes(section)) assert.equal(await page.locator('#c191-visual .c191-terminal').count(),1,"result section "+(section+1));
   if([0,1,10].includes(section)) assert.equal(await page.locator('#c191-visual .c191-device').count(),0,"no irrelevant hardware section "+(section+1));
   if([4,5,9].includes(section)) assert.ok(await page.locator('#c191-visual .c191-stage-list').count()===1,"stage model section "+(section+1));
   if([2,3,8,10].includes(section)) assert.equal(await page.locator('.c191-extra').count(),1,"separate exploration card section "+(section+1));
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
