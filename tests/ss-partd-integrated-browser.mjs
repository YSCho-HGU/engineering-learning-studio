/* Part D integration smoke: run from repo root after starting python3 -m http.server 8765. */
import assert from "node:assert/strict";
import {chromium} from "playwright";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
let failures=[];
for(const [path,kind] of [["applications-audio-filter.html","audio"],["applications-chirp-echo.html","radar"]]){
 const page=await browser.newPage({viewport:{width:1366,height:850}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 try{
  const response=await page.goto(base+"/signals-systems/"+path,{waitUntil:"load"});
  assert(response?.ok(),"page fetch failed: "+path);
  await page.waitForTimeout(350);
  assert(await page.locator(".d-card").count()===4,"Four instructional steps required");
  for(const mode of ["en","ko","mixed"]){
   await page.locator("#partd-language").selectOption(mode);
   assert.equal(await page.locator("html").getAttribute("data-els-language"),mode);
   assert((await page.locator("h1").innerText()).trim().length>10);
   assert.equal(await page.locator(".katex-error").count(),0,"KaTeX error");
   assert((await page.locator(".katex").count())>=1,"Math equation not rendered");
   assert.equal(await page.locator('input[name="prediction"]').count(),3);
  }
  if(kind==="audio"){
   let before=await page.locator("#atten").innerText();
   await page.locator("#filter").selectOption("high");
   await page.locator("#cutoff").fill("2100");
   const after=await page.locator("#atten").innerText();
   assert(before!==after,"FIR result did not change");
   for(const id of ["waveplot","specplot","gainplot"])assert((await page.locator("#"+id).evaluate(e=>e.width*e.height))>0);
  }else{
   const initial=await page.locator("#estimate").innerText();
   await page.locator("#distance").fill("27");
   assert.notEqual(await page.locator("#estimate").innerText(),initial,"Estimated distance did not update");
   await page.locator("#lag-peak").click();
   const lag=+(await page.locator("#lag").inputValue());
   assert(lag>=0,"Invalid correlation lag");
   await page.locator("#lag-forward").click();
   assert(+(await page.locator("#lag").inputValue())>=lag);
   await page.locator("#medium").selectOption("water");
   assert((await page.locator("#truth").innerText()).includes("ms"),"Missing sonar delay");
  }
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),"Mobile page overflows horizontally");
  if(errors.length)throw Error("Browser errors: "+errors.join("; "));
  console.log("PASS Part D",kind);
 }catch(e){failures.push({path,error:String(e)});console.error("FAIL Part D",path,e)}
 await page.close();
}
await browser.close();
if(failures.length)process.exitCode=1;
