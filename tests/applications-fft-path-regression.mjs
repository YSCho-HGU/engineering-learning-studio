/** Browser QA for the simplified Part C list and its 7 one-line module navigations. */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import {fileURLToPath,pathToFileURL} from "node:url";
import path from "node:path";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const files=["applications-fft-lab.html","applications-fft-resolution.html","applications-dft-fft.html",
 "applications-fft-dtmf.html","applications-fft-sound-fingerprint.html","applications-fft-upload.html","applications-chirp-stft.html"];
const dest=f=>path.join(root,"signals-systems",f);
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:840}});
try{
 await page.goto(pathToFileURL(dest("applications.html")).href+"#part-c");
 await page.locator("#topics-c .ss-app-lesson-row").first().waitFor();
 assert.equal(await page.locator("#topics-c .ss-app-lesson-row").count(),7);
 assert.equal(await page.locator("#topics-c .ss-app-lesson-group").count(),3);
 const counts=await page.locator("#topics-c .ss-app-lesson-group").evaluateAll(list=>list.map(x=>x.querySelectorAll("a.ss-app-lesson-row").length));
 assert.deepEqual(counts,[3,3,1]);
 assert.equal(await page.locator("#topics-c .ss-app-future").count(),1);
 assert.equal(await page.locator("#topics-c details.ss-app-topic").count(),0,"FFT catalog should have no old accordion cards");
 const links=await page.locator("#topics-c .ss-app-lesson-row").evaluateAll(list=>list.map(a=>a.getAttribute("href").replace("./","")));
 assert.deepEqual(links,files);
 assert.equal(await page.locator("#topics-c .ss-app-lesson-row .ss-app-lesson-arrow").count(),7);
 const future=await page.locator("#topics-c .ss-app-future summary").innerText();assert.ok(future.includes("4"));
 assert.equal(await page.locator("#ss-presentation-toggle").count(),0);
 assert.ok(await page.locator("header.ss-common-header").isVisible(),"Common header missing on Part C");
 await page.setViewportSize({width:390,height:844});
 const width=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(width<=3,"Part C mobile horizontal overflow: "+width);
 console.log("PASS Part C: 6 direct labs, 1 optional, 4 future topics and standard header");
 for(let index=0;index<files.length;index++){
  await page.goto(pathToFileURL(dest(files[index])).href);
  const nav=page.locator("#ss-fft-path");await nav.waitFor({state:"visible"});
  assert.equal(await nav.count(),1,"Lesson navigation must be unique");
  assert.equal(await nav.locator(".ss-fft-path-actions a").count(),index===0?2:3);
  assert.equal(await nav.locator(".ss-fft-path-progress").count(),0,"Remove 7-step dot strip");
  assert.equal(await nav.locator(".ss-fft-path-focus").count(),0,"Remove redundant navigation essay");
  assert.equal(await nav.locator(".ss-fft-path-next").getAttribute("href"),
   index===6?"./applications.html#part-c":"./"+files[index+1]);
  assert.equal(await nav.locator(".ss-fft-path-home").getAttribute("href"),"./applications.html#part-c");
  if(index>0)assert.equal(await nav.locator(".ss-fft-path-prev").getAttribute("href"),"./"+files[index-1]);
  assert.equal(await page.locator("#ss-presentation-toggle").count(),0);
  assert.ok(await page.locator("header.ss-common-header").isVisible(),"Standard header missing "+files[index]);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=3,files[index]+" mobile horizontal overflow "+overflow);
  console.log("PASS FFT navigation "+(index+1)+"/7");
 }
 console.log("ALL SIMPLIFIED FFT PATH CHECKS PASSED");
}finally{await page.close();await browser.close()}
