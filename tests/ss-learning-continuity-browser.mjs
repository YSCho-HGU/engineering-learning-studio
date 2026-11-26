import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const cases=[
 {chapter:5,nav:"[data-nav]",controls:".controlgrid [data-key]",observe:".ss5-observe",explain:"#derivationPanel"},
 {chapter:7,nav:"#ss7-lesson-nav button",controls:"#controls [data-param]",observe:".ss7-stage-observe",explain:".ss7-stage-explain"},
 {chapter:8,nav:"#nav [data-exp]",controls:"#controls [data-param]",observe:".ss8-stage-observe",explain:".ss8-stage-explain"}
];
const browser=await chromium.launch({headless:true}),failures=[],results=[];
await mkdir("qa/ss-continuity",{recursive:true});
try{
 for(const width of [390,1366]){
  const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
  for(const cfg of cases){
   const page=await ctx.newPage();page.on("pageerror",e=>failures.push({chapter:cfg.chapter,width,reason:"pageerror",error:e.message}));
   try{
    const response=await page.goto(base+"/signals-systems/chapter"+cfg.chapter+".html",{waitUntil:"domcontentloaded",timeout:30000});
    assert.equal(response?.status(),200,"HTTP Chapter "+cfg.chapter);
    await page.locator(".ss-continuity-explain").waitFor({state:"visible",timeout:12000});
    const nav=page.locator(cfg.nav),count=await nav.count();
    assert.ok(count>=2,"missing lessons Ch"+cfg.chapter);
    for(const index of [...new Set([0,Math.floor(count/2),count-1])]){
     await nav.nth(index).evaluate(el=>el.click());
     await page.locator(".ss-continuity-explain").waitFor({state:"visible",timeout:6000});
     const before=await page.evaluate(()=>{
      const bridge=document.querySelector(".ss-continuity-explain"),values=bridge.querySelector(".ss-continuity-values");
      const observe=document.querySelector(".ss-continuity-observe");
      return{bridge:!!bridge,observe:!!observe,chips:values?.querySelectorAll(".ss-continuity-chip").length||0,
        text:bridge.textContent.slice(0,300),overflow:document.documentElement.scrollWidth-innerWidth};
     });
     assert.ok(before.bridge&&before.observe,"continuity must link graphs and derivation");
     assert.ok(before.chips>=1,"current values must be visible");
     if(width<800)assert.ok(before.overflow<=12,"mobile horizontal overflow: "+before.overflow);
     const control=page.locator(cfg.controls).first();
     if(await control.count()){
      const original=await page.locator(".ss-continuity-values").textContent();
      await control.evaluate(el=>{
       if(el.tagName==="SELECT"){if(el.options.length>1)el.selectedIndex=(el.selectedIndex+1)%el.options.length;}
       else{const lo=Number(el.min),hi=Number(el.max),v=Number(el.value);el.value=String(Math.abs(v-hi)>1e-8?hi:lo);}
       el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));
      });
      await page.waitForTimeout(250);
      const changed=await page.locator(".ss-continuity-values").textContent();
      assert.notEqual(changed,original,"current settings stale on variable change");
     }
     const controlSnapshot=await page.locator(cfg.controls).evaluateAll(els=>els.map(el=>el.value));
     const step=cfg.chapter===5?page.locator("#nextStep"):page.locator("#next");
     if(await step.count()&&await step.isEnabled()){
      await step.evaluate(el=>el.click());
      const after=await page.locator(cfg.controls).evaluateAll(els=>els.map(el=>el.value));
      assert.deepEqual(after,controlSnapshot,"derivation step changed experiment settings");
     }
     results.push({chapter:cfg.chapter,width,section:index+1,controls:before.chips});
    }
    if(width===390)await page.screenshot({path:"qa/ss-continuity/ch"+cfg.chapter+"-mobile.png",fullPage:false});
   }catch(e){failures.push({chapter:cfg.chapter,width,error:String(e)});
    await page.screenshot({path:"qa/ss-continuity/FAIL-ch"+cfg.chapter+"-"+width+".png",fullPage:true}).catch(()=>{});
   }finally{await page.close()}
  }await ctx.close();
 }
}finally{await browser.close()}
await writeFile("qa/ss-continuity/results.json",JSON.stringify({results,failures},null,2));
console.log("Chapter 5/7/8 continuity:",results.length,"cases",failures.length,"failures");
for(const f of failures)console.error("CONTINUITY FAIL",JSON.stringify(f).slice(0,700));
assert.equal(failures.length,0,"SS learning continuity regression");
