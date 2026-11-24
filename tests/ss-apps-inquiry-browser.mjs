import {chromium} from "@playwright/test";
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const results=[],failures=[];
await mkdir("tests/screenshots",{recursive:true});
const check=(value,description)=>{if(!value)throw Error(description);};
async function open(page,pathname,condition){
 await page.goto(base+"/signals-systems/"+pathname,{waitUntil:"domcontentloaded"});
 await page.waitForFunction(condition,null,{timeout:15000});
}
async function inspect(page,name,width){
 const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,errors:document.querySelectorAll(".katex-error").length}));
 check(layout.scroll<=layout.client+8,name+" overflow "+JSON.stringify(layout));
 check(layout.errors===0,name+" math error");
 await page.screenshot({path:"tests/screenshots/inquiry-"+name+"-"+width+".png",fullPage:true,animations:"disabled"});
 results.push({name,width,status:"PASS"});
}
try{
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   for(const lab of ["harmonics","beats","sampling"]){
    await open(page,"applications-lab.html?lab="+lab,()=>document.querySelector("#ss-al-guidance.ss-inquiry") && document.querySelector("#ss-al-canvas-1")?.width>20);
    const prediction=lab==="beats"?"0":"1",transfer=lab==="beats"?"1":"0";
    const choices=page.locator("#ss-al-guidance .ss-inquiry-select");
    check(await choices.count()===2,lab+" must ask both prediction and transfer");
    await choices.nth(0).selectOption(prediction);
    await choices.nth(1).selectOption(transfer);
    await page.locator('#ss-al-guidance button[data-scenario="1"]').click();
    await page.waitForTimeout(120);
    const chartA=await page.locator("#ss-al-canvas-1").evaluate(c=>c.toDataURL());
    await page.locator('#ss-al-guidance button[data-scenario="2"]').click();
    await page.waitForTimeout(120);
    const chartB=await page.locator("#ss-al-canvas-1").evaluate(c=>c.toDataURL());
    check(chartA!==chartB,lab+" A/B did not change observation graph");
    await page.locator("#ss-al-guidance .ss-inquiry-verify").click();
    check(await page.locator("#ss-al-guidance .ss-inquiry-feedback").getAttribute("data-result")==="correct",lab+" reasoning not verified");
    const evidence=await page.locator("#ss-al-guidance .ss-inquiry-evidence").textContent();
    check(lab==="harmonics"?evidence.includes("220"):lab==="beats"?evidence.includes("0.125"):evidence.includes("500"),lab+" numerical evidence incorrect: "+evidence);
    check((await page.locator("#ss-al-guidance .ss-inquiry-progress").textContent()).includes("2 / 2"),lab+" comparison incomplete");
    await inspect(page,lab,width);
   }
   await open(page,"applications-dft-fft.html",()=>window.__FFTFocusedReady===true && !!document.querySelector("#dft-evidence-choice"));
   await page.locator("#dft-evidence-choice").selectOption("labels");
   const fs=Number(await page.locator("#same-fs").inputValue());
   await page.locator("#dft-evidence-test").click();
   check(Number(await page.locator("#same-fs").inputValue())===fs*2,"DFT fs change not visible");
   check(await page.locator("#dft-evidence-feedback").getAttribute("data-result")==="correct","DFT coefficient reasoning failed");
   await page.locator("#tab-butterfly").click();
   await page.locator('[data-stage="3"]').click();
   await page.locator("#dft-transfer-choice").selectOption("flat");
   await page.locator("#dft-transfer-test").click();
   check(await page.locator("#dft-transfer-feedback").getAttribute("data-result")==="correct","Impulse transfer failed");
   await page.locator("#tab-speed").click();
   await page.locator("#dft-speed-choice").selectOption("four");
   await page.locator("#dft-speed-check").click();
   check(await page.locator("#dft-speed-feedback").getAttribute("data-result")==="correct","DFT complexity reasoning failed");
   await inspect(page,"dft-fft",width);
   await open(page,"applications-fft-dtmf.html?seed=129",()=>!!window.SSDTMF&&!!document.querySelector("#dtmf-evidence-check"));
   check(await page.locator("#dtmf-check").isDisabled(),"Key answer should start locked");
   check(await page.locator("#dtmf-keypad button:not([disabled])").count()===0,"Keypad must wait for spectral evidence");
   await page.locator("#dtmf-fft").click();
   check(await page.locator("#dtmf-spectrum").isVisible(),"FFT spectrum missing");
   const pair=await page.evaluate(()=>window.SSDTMF.tones(window.SSDTMF.result.decoded));
   await page.locator("#dtmf-evidence-low").selectOption(String(pair.low));
   await page.locator("#dtmf-evidence-high").selectOption(String(pair.high));
   await page.locator("#dtmf-evidence-check").click();
   check(await page.locator("#dtmf-evidence-feedback").getAttribute("data-result")==="correct","DTMF evidence invalid");
   const key=pair.key;
   await page.locator('#dtmf-keypad button[data-digit="'+key+'"]').click();
   await page.locator("#dtmf-check").click();
   check(await page.locator("#dtmf-feedback").getAttribute("data-result")==="correct","DTMF keypad failed");
   await page.locator(".ss-dtmf-options summary").click();
   await page.locator("#dtmf-fft-n").selectOption("512");
   check(await page.locator("#dtmf-check").isDisabled(),"Changing FFT parameters must invalidate old answer");
   await inspect(page,"dtmf",width);
   await open(page,"applications-fft-sound-fingerprint.html",()=>!!window.SSSoundFingerprint && !!document.querySelector("#finger-evidence-check") && !!document.querySelector("#finger-spectrum .ss-finger-wave"));
   await page.locator("#finger-play-b").click();
   await page.locator("#finger-guess").selectOption("voice");
   await page.locator("#finger-guess-check").click();
   check(await page.locator("#finger-reveal-btn").isDisabled(),"Sound identity must not reveal without harmonic evidence");
   await page.locator("#finger-evidence-choice").selectOption("h4");
   await page.locator("#finger-evidence-check").click();
   check(await page.locator("#finger-evidence-feedback").getAttribute("data-result")==="correct","Harmonic evidence failed for selected voice model");
   await page.locator("#finger-reveal-btn").click();
   check(await page.locator("#finger-compare svg").count()===3,"Fingerprint comparison not exposed");
   await page.locator("#finger-quiz").selectOption("harmonics");
   await page.locator("#finger-quiz-check").click();
   check((await page.locator("#finger-quiz-feedback").textContent()).length>5,"Transfer explanation missing");
   await inspect(page,"fingerprint",width);
   check(errors.length===0,"Page JS errors: "+errors.join(" | "));
   console.log("PASS all six inquiry-first labs at "+width+"px");
  }catch(e){
   failures.push(width+": "+(e.stack||e.message));
   try{await page.screenshot({path:"tests/screenshots/inquiry-failure-"+width+".png",fullPage:true});}catch(_){}
  }finally{await page.close();}
 }
}finally{await browser.close();}
for(const failure of failures)console.error("FAIL",failure);
assert.deepEqual(failures,[],"Inquiry-first Applications regression failed");
