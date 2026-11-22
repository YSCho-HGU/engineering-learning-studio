import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
let failures=0;
await mkdir("tests/screenshots",{recursive:true});
for(const name of ["harmonics","chirp","helix"]){
 const page=await browser.newPage({viewport:{width:1366,height:768}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 try{
  const response=await page.goto(base+"/signals-systems/applications-lab.html?lab="+name,{waitUntil:"networkidle",timeout:25000});
  if(!response?.ok())throw Error("HTTP "+response?.status());
  await page.locator("#ss-al-metrics .ss-al-metric").first().waitFor();
  if(await page.locator("#ss-al-metrics .ss-al-metric").count()!==4)throw Error("Missing metrics");
  const canvas=await page.locator(".ss-al-plot:not([hidden]) canvas").evaluateAll(nodes=>nodes.map(c=>[c.width,c.height]));
  if(canvas.length<(name==="harmonics"?2:3)||canvas.some(([w,h])=>w<250||h<175))throw Error("Plots too small: "+JSON.stringify(canvas));
  await page.screenshot({path:"tests/screenshots/"+name+"-desktop.png"});
  const old=await page.locator("#ss-al-metrics .ss-al-metric-value").first().innerText();
  await page.locator("#ss-al-control-fields input[type=range]").first().fill(name==="harmonics"?"440":name==="chirp"?"360":"2.0");
  await page.waitForTimeout(120);
  if(name!=="helix"&&old===await page.locator("#ss-al-metrics .ss-al-metric-value").first().innerText())throw Error("Slider failed");
  await page.locator("#ss-al-focus-toolbar").click();
  if(!await page.locator("#ss-al-root").evaluate(el=>el.classList.contains("focus")))throw Error("Focus failed");
  await page.locator("#ss-al-focus-toolbar").click();
  if(await page.locator("#ss-al-root").evaluate(el=>el.classList.contains("focus")))throw Error("Exit focus failed");
  await page.locator("#ss-al-panel-toggle").click();
  if(!await page.locator("#ss-al-root").evaluate(el=>el.classList.contains("controls-hidden")))throw Error("Hide controls failed");
  await page.locator("#ss-al-panel-toggle").click();
  await page.locator("#ss-al-language").selectOption("ko");
  await page.waitForTimeout(75);
  if(!/[가-힣]/.test(await page.locator("#ss-al-title").innerText()))throw Error("Language not applied");
  await page.locator("#ss-al-language").selectOption("en");
  await page.locator("#ss-al-theme").selectOption("white-clean");
  await page.waitForTimeout(75);
  if(await page.locator("html").getAttribute("data-els-theme")!=="white-clean")throw Error("Theme not applied");
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  if(overflow>6)throw Error("Mobile horizontal overflow "+overflow+"px");
  await page.screenshot({path:"tests/screenshots/"+name+"-mobile.png",fullPage:true});
  if(errors.length)throw Error(errors.join("; "));
  console.log("PASS "+name+" "+JSON.stringify({canvas,overflow}));
 }catch(e){failures++;console.error("FAIL "+name+": "+String(e.message||e))}
 await page.close();
}
try{
 const page=await browser.newPage();
 await page.goto(base+"/signals-systems/applications.html",{waitUntil:"networkidle",timeout:25000});
 for(const slug of ["harmonics","chirp","helix"]){
  if(!await page.locator('#topics-a .ss-app-open-lab[href$="lab='+slug+'"]').count())throw Error("Missing Part A lab "+slug);
 }
 console.log("PASS Applications hub links");await page.close();
}catch(e){failures++;console.error("FAIL Applications hub: "+String(e.message||e))}
await browser.close();
if(failures)process.exitCode=1;