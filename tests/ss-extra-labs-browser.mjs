import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const root=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const errors=[];
await mkdir("tests/screenshots",{recursive:true});
const almost=(x,y,tol=.2)=>Math.abs(Number(x)-y)<tol;
for(const lab of ["beats","amfm","sampling"]){
 const page=await browser.newPage({viewport:{width:1366,height:768}});
 const thrown=[];page.on("pageerror",e=>thrown.push(e.message));
 try{
  const res=await page.goto(root+"/signals-systems/applications-lab.html?lab="+lab,{waitUntil:"domcontentloaded",timeout:25000});
  if(!res?.ok())throw Error("HTTP "+res?.status());
  await page.locator("#ss-al-metrics .ss-al-metric").first().waitFor({timeout:15000});
  if(await page.locator("#ss-al-metrics .ss-al-metric").count()!==4)throw Error("Expected 4 metrics");
  if(await page.locator(".ss-al-plot:not([hidden]) canvas").count()!==3)throw Error("Expected 3 active plots");
  await page.locator("#ss-al-equation math").first().waitFor({timeout:10000});
  const hasEquation=await page.locator("#ss-al-equation").getAttribute("data-tex");
  if(!hasEquation?.includes("\\displaystyle"))throw Error("Equation source missing");
  const heights=await page.locator(".ss-al-plot:not([hidden]) canvas").evaluateAll(cs=>cs.map(c=>Math.round(c.getBoundingClientRect().height)));
  if(heights.some((h,i)=>h<(i===0?285:145)))throw Error("Plots too small "+JSON.stringify(heights));
  const initialCanvas=await page.locator("#ss-al-canvas-1").evaluate(c=>c.toDataURL());
  if(lab==="beats"){
   await page.locator("#ss-extra-delta").evaluate(e=>{e.value="8";e.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.waitForTimeout(95);
   const beat=await page.locator("#ss-al-metrics .ss-al-metric-value").nth(2).innerText();
   if(!beat.includes("8.0"))throw Error("Beat frequency not updated: "+beat);
  }
  if(lab==="amfm"){
   await page.locator("#ss-extra-mode").selectOption("fm");
   await page.waitForTimeout(80);
   if(!await page.locator("#ss-extra-beta").count())throw Error("FM beta slider missing");
   if(!(await page.locator("#ss-al-equation").getAttribute("data-tex")).includes("s_{FM}"))throw Error("FM mathematical model missing");
   await page.locator("#ss-extra-beta").evaluate(e=>{e.value="4";e.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.waitForTimeout(80);
   const swing=await page.locator("#ss-al-metrics .ss-al-metric-value").last().innerText();
   if(!swing.includes("32.0"))throw Error("FM swing βfm incorrect: "+swing);
  }
  if(lab==="sampling"){
   const alias=await page.locator("#ss-al-metrics .ss-al-metric-value").last().innerText();
   if(!almost(parseFloat(alias),11))throw Error("Initial chirp folded alias should be 11 Hz at t=1 s, got "+alias);
   // At f_i=70 Hz (about t=1.216 s), fs=70 Hz gives a locally folded frequency of zero.
   await page.locator("#ss-extra-pos").evaluate(el=>{el.value="61";el.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.waitForTimeout(85);
   const zeroFold=await page.locator("#ss-al-metrics .ss-al-metric-value").last().innerText();
   if(!almost(parseFloat(zeroFold),.22,.5))throw Error("Chirp should fold close to zero around f_i=fs, got "+zeroFold);
   await page.locator("#ss-extra-pos").evaluate(el=>{el.value="50";el.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.waitForTimeout(75);
   await page.locator("#ss-extra-fs-number").fill("50");
   await page.locator("#ss-extra-fs-number").dispatchEvent("change");
   await page.waitForTimeout(90);
   const folded=await page.locator("#ss-al-metrics .ss-al-metric-value").last().innerText();
   if(!almost(parseFloat(folded),9))throw Error("fs=50 folded chirp should be 9 Hz, got "+folded);
   const slider=await page.locator("#ss-extra-fs").inputValue();
   if(slider!=="50")throw Error("fs numeric and slider are not synchronized");
   await page.locator("#ss-extra-fs").evaluate(e=>{e.value="200";e.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.waitForTimeout(100);
   const unaliased=await page.locator("#ss-al-metrics .ss-al-metric-value").last().innerText();
   if(!almost(parseFloat(unaliased),59))throw Error("fs=200 should show 59 Hz local alias at t=1 s, got "+unaliased);
   await page.locator("#ss-extra-kind").selectOption("sine");
   await page.waitForTimeout(75);
   if(!await page.locator("#ss-extra-tone").count())throw Error("Sine tone frequency control missing");
   await page.locator("#ss-extra-fs-number").fill("56");
   await page.locator("#ss-extra-fs-number").dispatchEvent("change");
   await page.waitForTimeout(100);
   const sineAlias=await page.locator("#ss-al-metrics .ss-al-metric-value").last().innerText();
   if(!almost(parseFloat(sineAlias),18))throw Error("Sine alias 38 Hz at fs=56 should be 18 Hz, got "+sineAlias);
   await page.locator("#ss-extra-kind").selectOption("chirp");
  }
  const changedCanvas=await page.locator("#ss-al-canvas-1").evaluate(c=>c.toDataURL());
  if(initialCanvas===changedCanvas)throw Error("Canvas did not react to user controls");
  await page.screenshot({path:"tests/screenshots/part-a-"+lab+"-desktop.png"});
  await page.locator("#ss-al-reset").click();
  if(lab!=="sampling"){
   await page.locator("#ss-al-play").click();
   await page.waitForTimeout(160);
   const moved=Number(await page.locator("#ss-al-seek").inputValue());
   if(moved<20)throw Error("Audio transport did not advance");
   await page.locator("#ss-al-pause").click();
   await page.locator("#ss-al-seek").evaluate(el=>{el.value="600";el.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.locator("#ss-al-play").click();
   await page.waitForTimeout(70);
   if(Number(await page.locator("#ss-al-seek").inputValue())<600)throw Error("Audio failed to resume from seek");
   await page.locator("#ss-al-stop").click();
   if(Number(await page.locator("#ss-al-seek").inputValue())!==0)throw Error("Stop did not reset audio timeline");
  }else{
   await page.locator("#ss-extra-animate").click();
   await page.waitForTimeout(130);
   const progress=Number(await page.locator("#ss-extra-pos").inputValue());
   if(progress<=50)throw Error("Sampling time animation did not advance");
   await page.locator("#ss-extra-animate").click();
  }
  await page.locator("#ss-al-language").selectOption("ko");
  await page.waitForTimeout(100);
  if(!/[가-힣]/.test(await page.locator("#ss-al-title").innerText()))throw Error("Korean mode not applied");
  await page.locator("#ss-al-language").selectOption("en");
  await page.locator("#ss-al-theme").selectOption("white-clean");
  await page.waitForTimeout(80);
  if(await page.locator("html").getAttribute("data-els-theme")!=="white-clean")throw Error("Theme change missing");
  await page.locator("#ss-al-focus-toolbar").click();
  if(!await page.locator("#ss-al-root").evaluate(el=>el.classList.contains("focus")))throw Error("Focus entry failed");
  await page.locator("#ss-al-focus-toolbar").click();
  if(await page.locator("#ss-al-root").evaluate(el=>el.classList.contains("focus")))throw Error("Focus exit failed");
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(110);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  if(overflow>6)throw Error("Mobile horizontal overflow "+overflow+"px");
  const mobileH=await page.locator(".ss-al-plot:not([hidden]) canvas").evaluateAll(cs=>cs.map(c=>Math.round(c.getBoundingClientRect().height)));
  if(mobileH.some(h=>h<260))throw Error("Mobile plot too short "+JSON.stringify(mobileH));
  await page.screenshot({path:"tests/screenshots/part-a-"+lab+"-mobile.png",fullPage:true});
  if(thrown.length)throw Error("Page errors: "+thrown.join("; "));
  console.log("PASS Part A",lab,{heights,mobileH,overflow});
 }catch(e){errors.push({lab,error:String(e.message||e)});console.error("FAIL",lab,String(e.message||e))}
 await page.close();
}
try{
 const page=await browser.newPage();
 await page.goto(root+"/signals-systems/applications.html",{waitUntil:"domcontentloaded",timeout:25000});
 await page.locator("#topics-a a.ss-app-open-lab").first().waitFor();
 for(const slug of ["harmonics","chirp","helix","beats","amfm","sampling"]){
  const count=await page.locator('#topics-a a.ss-app-open-lab[href$="lab='+slug+'"]').count();
  if(count!==1)throw Error("Missing/duplicate Part A entry "+slug+": "+count);
 }
 console.log("PASS all six hub entries");
 await page.close();
}catch(e){errors.push({lab:"hub",error:String(e.message||e)});console.error("FAIL hub",String(e.message||e))}
await browser.close();if(errors.length)process.exitCode=1;
