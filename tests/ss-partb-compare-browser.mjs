import {chromium} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import assert from "node:assert/strict";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
await mkdir("tests/screenshots",{recursive:true});
const failures=[],check=(value,message)=>{if(!value)throw Error(message);};
const near=(x,y,tol=1e-7)=>Math.abs(x-y)<=tol;
async function slider(page,id,value){
 await page.locator(id).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event("input",{bubbles:true}));},value);
 await page.waitForTimeout(110);
}
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:850}});
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  try{
   await page.goto(base+"/signals-systems/applications.html#part-b",{waitUntil:"domcontentloaded"});
   await page.locator("#topics-b a[href='./applications-system-compare.html']").first().waitFor();
   check(await page.locator("#topics-b .ss-app-abd-lab-row").count()===3,"Part B must link three live labs");
   await page.goto(base+"/signals-systems/applications-system-compare.html",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.SSSystemCompareLab && document.querySelectorAll("#cmp-metrics .cmp-metric-card").length===3);
   check(await page.locator("#cmp-time").isVisible(),"shared signal chart missing");
   check(await page.locator("#cmp-frequency").isVisible(),"frequency response missing");
   check(await page.locator("#cmp-step").isVisible(),"step response missing");
   check(await page.locator("#cmp-phase").isVisible(),"phase response missing");
   check(await page.locator("#cmp-delay").isVisible(),"group-delay graph missing");
   check(await page.locator("#cmp-time-section-title").isVisible(),"time-domain learning stage missing");
   check(await page.locator("#cmp-frequency-section-title").isVisible(),"frequency-domain learning stage missing");
   const model=()=>page.evaluate(()=>window.SSSystemCompareLab.compute());
   let d=await model();
   check(d.M===9&&d.fs===50&&d.match,"wrong default state");
   check(near(d.cutoffRC,d.cutoffMA,1e-8),"default −3 dB not matched");
   check(d.items.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.rc)&&Number.isFinite(p.ma)),"plot values not finite");
   check(await page.locator("#cmp-tau").isDisabled(),"matched τ must be automatic");
   check(await page.locator("#cmp-frequency-readouts .cmp-frequency-value").count()===5,"phase/group-delay probe values missing");
   const inBand=d.spectrum.find(p=>p.f>0&&p.f<d.cutoffMA*.8);
   check(near(inBand.maDelay,d.groupDelayMA,1e-10),"MA passband group delay is not constant");
   const beforePhase=await page.locator("#cmp-phase").evaluate(c=>c.toDataURL());
   await slider(page,"#cmp-freq-probe",1.2);
   check((await page.locator("#cmp-freq-probe-value").innerText()).includes("1.20"),"frequency probe did not update");
   const afterPhase=await page.locator("#cmp-phase").evaluate(c=>c.toDataURL());
   check(beforePhase!==afterPhase,"frequency probe not redrawn on phase graph");
   await page.locator("#cmp-scope").selectOption("full");
   await page.waitForTimeout(110);
   const maxF=Number(await page.locator("#cmp-freq-probe").getAttribute("max"));
   check(near(maxF,d.fs/2,1e-6),"full-band view must end at Nyquist");
   await page.locator("#cmp-scope").selectOption("near");
   await page.waitForTimeout(110);
   const before=await page.locator("#cmp-time").evaluate(c=>c.toDataURL());
   await slider(page,"#cmp-M",21);
   d=await model();check(d.M===21&&near(d.cutoffRC,d.cutoffMA,1e-8),"M21 matching failed");
   const after=await page.locator("#cmp-time").evaluate(c=>c.toDataURL());
   check(before!==after,"MA and RC curves did not redraw");
   await page.locator("#cmp-match").uncheck();
   await page.waitForTimeout(120);check(!(await page.locator("#cmp-tau").isDisabled()),"manual τ unavailable");
   await slider(page,"#cmp-tau",.25);
   d=await model();check(near(d.tau,.25,1e-12)&&!d.match,"manual RC τ failed");
   await page.locator("#cmp-fs").selectOption("100");
   await page.waitForTimeout(100);
   d=await model();check(d.fs===100&&d.items.length===401,"sampling-rate update incorrect");
   await page.locator("#cmp-signal").selectOption("step");
   await slider(page,"#cmp-noise",0);
   d=await model();
   check(d.items.every(p=>near(p.x,p.clean,1e-12)),"zero-noise data mismatch");
   const canvas=page.locator("#cmp-time");
   await canvas.scrollIntoViewIfNeeded();
   const rect=await canvas.boundingBox();check(!!rect,"waveform canvas missing bounds");
   await page.mouse.click(rect.x+rect.width*.7,rect.y+rect.height*.5);
   const selected=await page.locator("#cmp-probe").innerText();
   check(selected.includes("RC=")&&selected.includes("MA="),"click-to-inspect missing");
   await canvas.focus();
   const beforeTime=await page.evaluate(()=>window.SSSystemCompareLab.state.inspectT);
   await page.keyboard.press("ArrowRight");
   const nextTime=await page.evaluate(()=>window.SSSystemCompareLab.state.inspectT);
   check(nextTime>beforeTime,"keyboard sample navigation failed");
   await page.locator("#cmp-M").evaluate(el=>{el.value="1";el.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.waitForTimeout(110);
   d=await model();check(d.M===1&&d.cutoffMA===null&&d.match===false,"M=1 must have no MA cutoff");
   await page.locator("#cmp-reset").click();await page.waitForTimeout(110);
   d=await model();check(d.M===9&&d.fs===50&&d.match===true&&near(d.noise,.3),"Reset failed");
   check(await page.locator("#cmp-scope").inputValue()==="near","reset should return to near-cutoff view");
   await page.locator("#cmp-language").selectOption("en");
   await page.waitForTimeout(90);
   check(!/[\uAC00-\uD7A3]/.test(await page.locator("#cmp-insight-body").innerText()),"Korean leaked into English mode");
   check(!/[\uAC00-\uD7A3]/.test(await page.locator("#cmp-phase-note").innerText()),"phase note leaked Korean");
   await page.locator("#cmp-language").selectOption("mixed");
   await page.waitForTimeout(90);
   check(/[\uAC00-\uD7A3]/.test(await page.locator("#cmp-insight-body").innerText()),"Bilingual mode missing Korean support");
   for(const theme of ["white-clean","neutral-dark"]){
    await page.locator("#cmp-theme").selectOption(theme);
    await page.waitForTimeout(90);
    check(await page.evaluate(()=>document.documentElement.dataset.elsTheme)===theme,"theme not applied: "+theme);
   }
   const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   check(size.scroll<=size.width+8,"page overflow "+JSON.stringify(size));
   check(errors.length===0,"Browser errors: "+errors.join(" | "));
   await page.screenshot({path:"tests/screenshots/partb-compare-"+width+".png",fullPage:true});
   console.log("RC vs Moving Average browser PASS width "+width);
  }catch(error){failures.push(width+": "+error.message);console.error("RC/MA browser FAIL "+width+": "+error.stack);}
  finally{await page.close();}
 }
}finally{await browser.close();}
assert.deepEqual(failures,[],"RC/MA browser smoke failures");
