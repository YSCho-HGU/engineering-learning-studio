/* Verify Chapter 6 graphs 2/3 and derivation 4 share one state, not one step counter. */
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {mkdir} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const modules=["periodic","pairs","phase","phasor","filter","fft"];
const browser=await chromium.launch({headless:true});
await mkdir("qa/ch6-learning-direction",{recursive:true});
const failures=[];
try{
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:850},reducedMotion:"reduce"});
  page.on("pageerror",e=>failures.push({width,reason:"pageerror",error:e.message}));
  try{
   const response=await page.goto(base+"/signals-systems/chapter6.html",{waitUntil:"domcontentloaded",timeout:30000});
   assert.equal(response?.status(),200,"Chapter 6 HTTP");
   await page.locator("[data-nav]").first().waitFor({timeout:12000});
   for(const id of modules){
    await page.locator('[data-nav="'+id+'"]').evaluate(el=>el.click());
    await page.locator(".ch6-context").waitFor({state:"visible",timeout:12000});
    const before=await page.evaluate(()=>window.__dtftApp);
    assert.equal(before.active,id,"selected module");
    const evidence=await page.evaluate(()=>{
     const bridge=document.querySelector(".ch6-observe-bridge");
     const guided=document.querySelector(".ch6-context");
     return {bridge:!!bridge,guide:!!guided,settings:[...guided?.querySelectorAll(".ch6-context-chip")||[]].map(el=>el.textContent.trim()),
       predict:!!guided?.querySelector(".ch6-context p strong"),verify:!!document.querySelector(".ch6-verify"),
       charts:document.querySelectorAll(".charts canvas").length,
       line:guided?.innerText?.slice(0,250),horizontalOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)};
    });
    assert.ok(evidence.bridge&&evidence.guide,id+" graph-to-math bridge");
    assert.ok(evidence.settings.length>=2,id+" current setting chips");
    assert.ok(evidence.predict&&evidence.verify,id+" predict/verify");
    assert.ok(evidence.charts>=2,id+" graph count");
    assert.ok(evidence.horizontalOverflow<=12,id+" horizontal overflow: "+evidence.horizontalOverflow);
    const previous=JSON.stringify(before.state[id]);
    const first=await page.locator("#derivationPanel .progress-badge").innerText();
    await page.locator("#nextStep").evaluate(el=>el.click());
    const afterStep=await page.evaluate(()=>window.__dtftApp);
    assert.equal(JSON.stringify(afterStep.state[id]),previous,id+" step navigation changed experiment parameters");
    const second=await page.locator("#derivationPanel .progress-badge").innerText();
    assert.notEqual(first,second,id+" Next did not advance equation explanation");
    const ctrl=page.locator(".controls [data-ctrl]").first();
    const controlType=await ctrl.evaluate(el=>el.tagName.toLowerCase());
    await ctrl.evaluate(el=>{
      if(el.tagName==="SELECT"){if(el.options.length>1)el.selectedIndex=(el.selectedIndex+1)%el.options.length}
      else{const max=Number(el.max),min=Number(el.min),current=Number(el.value);el.value=String(Math.abs(current-max)>1e-6?max:min)}
      el.dispatchEvent(new Event("input",{bubbles:true}));
      el.dispatchEvent(new Event("change",{bubbles:true}));
    });
    await page.waitForTimeout(190);
    const afterControl=await page.evaluate(()=>window.__dtftApp);
    assert.notEqual(JSON.stringify(afterControl.state[id]),previous,id+" control did not update shared experiment state");
    const text=await page.locator(".ch6-context-values").innerText();
    assert.ok(text.trim().length>0,id+" current state summary disappeared after control change");
    if(id==="pairs")assert.ok(controlType==="select");
    if(["periodic","fft"].includes(id))
     await page.screenshot({path:"qa/ch6-learning-direction/"+id+"-"+width+".png",fullPage:false});
    console.log("PASS",width,id,JSON.stringify(evidence.settings).slice(0,250));
   }
  }catch(err){
   failures.push({width,reason:String(err)});
   await page.screenshot({path:"qa/ch6-learning-direction/FAIL-"+width+".png",fullPage:true}).catch(()=>{});
  }finally{await page.close()}
 }
}finally{await browser.close()}
console.log("Ch6 learning direction:",modules.length*2,"module/viewport cases,",failures.length,"failures");
for(const x of failures)console.error("CH6 FAIL",JSON.stringify(x));
assert.equal(failures.length,0,"Ch6 shared-state instructional relation");
