/** Chromium QA: Part C direct catalog, one accessible FFT module dropdown, no redundant step navigation. */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import {fileURLToPath,pathToFileURL} from "node:url";
import path from "node:path";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const files=["applications-fft-lab.html","applications-fft-resolution.html","applications-dft-fft.html",
 "applications-fft-dtmf.html","applications-fft-sound-fingerprint.html","applications-fft-upload.html","applications-chirp-stft.html"];
const dest=f=>path.join(root,"signals-systems",f);
const screenshots=path.join(root,"artifacts","fft-browser-qa");await mkdir(screenshots,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:840}});
const errors=[];page.on("pageerror",e=>errors.push(e.message));
try{
 await page.goto(pathToFileURL(dest("applications.html")).href+"#part-c");
 await page.locator("#topics-c .ss-app-lesson-row").first().waitFor();
 assert.equal(await page.locator("#topics-c .ss-app-lesson-row").count(),7);
 assert.equal(await page.locator("#topics-c .ss-app-lesson-group").count(),3);
 const counts=await page.locator("#topics-c .ss-app-lesson-group").evaluateAll(list=>list.map(x=>x.querySelectorAll("a.ss-app-lesson-row").length));
 assert.deepEqual(counts,[3,3,1]);
 assert.equal(await page.locator("#topics-c .ss-app-future").count(),1);
 assert.equal(await page.locator("#topics-c details.ss-app-topic").count(),0,"Catalog should not use old accordion");
 const links=await page.locator("#topics-c .ss-app-lesson-row").evaluateAll(list=>list.map(a=>a.getAttribute("href").replace("./","")));
 assert.deepEqual(links,files);
 const future=await page.locator("#topics-c .ss-app-future summary").innerText();assert.ok(future.includes("4"));
 assert.ok(await page.locator("header.ss-common-header").isVisible(),"Standard course header missing");
 await page.screenshot({path:path.join(screenshots,"fft-part-c-desktop.png"),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 const w=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(w<=3,"Part C catalog horizontal overflow "+w);
 await page.screenshot({path:path.join(screenshots,"fft-part-c-mobile.png"),fullPage:true});
 console.log("PASS Part C: 6 core labs, 1 optional and 4 future modules");

 const redundant=["#fft-roadmap","#fft-r-steps",".ss-dtmf-steps",".ss-finger-steps",
   ".ss-stft-stages",".ss-dtmf-footer",".ss-finger-footer",".ss-stft-links",
   ".ss-fft-upload-links",".ss-fft-r-nav",".ss-fft-next",".ss-four-navigation.ss-fft-nav"];
 for(let index=0;index<files.length;index++){
  await page.goto(pathToFileURL(dest(files[index])).href);
  const nav=page.locator("#ss-fft-path");await nav.waitFor({state:"visible"});
  assert.equal(await nav.count(),1,"One FFT module navigation only");
  assert.equal(await nav.locator(".ss-fft-path-picker").count(),1);
  assert.equal(await nav.locator(".ss-fft-path-current").count(),1);
  assert.equal(await nav.locator(".ss-fft-path-actions a").count(),index===0||index===6?1:2);
  assert.equal(await nav.locator(".ss-fft-path-disabled").count(),index===0||index===6?1:0);
  assert.equal(await nav.locator(".ss-fft-path-option").count(),7);
  assert.equal(await nav.locator(".ss-fft-path-option[aria-current='page']").count(),1);
  assert.equal(await nav.locator(".ss-fft-path-option[aria-current='page']").getAttribute("href"),"./"+files[index]);
  assert.equal(await nav.locator(".ss-fft-path-all").getAttribute("href"),"./applications.html#part-c");
  assert.equal(await nav.locator(".ss-fft-path-progress,.ss-fft-path-focus,.ss-fft-path-home").count(),0);
  if(index<6)assert.equal(await nav.locator(".ss-fft-path-next").getAttribute("href"),"./"+files[index+1]);
  if(index>0)assert.equal(await nav.locator(".ss-fft-path-prev").getAttribute("href"),"./"+files[index-1]);
  for(const sel of redundant)assert.equal(await page.locator(sel).count(),0,files[index]+": redundant "+sel);
  assert.ok(await page.locator("header.ss-common-header").isVisible(),"Standard header missing "+files[index]);
  await nav.locator("summary").click();
  assert.ok(await nav.locator(".ss-fft-path-menu").isVisible(),"Dropdown menu not visible");
  assert.ok((await nav.locator(".ss-fft-path-meta").innerText()).includes(index===6?"OPTIONAL":String(index+1).padStart(2,"0")));
  await page.keyboard.press("Escape");
  assert.ok(await nav.locator(".ss-fft-path-menu").isHidden(),"Escape should dismiss module selector");
  if(index===2){
   await page.locator(".ss-common-language-select").selectOption("en");
   assert.ok(!/[가-힣]/.test(await nav.locator(".ss-fft-path-current").innerText()),"English label includes Korean");
   await page.locator(".ss-common-language-select").selectOption("ko");
   assert.ok(/[가-힣]/.test(await nav.locator(".ss-fft-path-current").innerText()),"Korean label not translated");
   await page.locator(".ss-common-language-select").selectOption("en");
  }
  if(index===0||index===1||index===6){
   await page.screenshot({path:path.join(screenshots,"fft-nav-"+(index+1)+"-closed-mobile.png"),fullPage:true});
   await nav.locator("summary").click();
   await page.screenshot({path:path.join(screenshots,"fft-nav-"+(index+1)+"-open-mobile.png"),fullPage:true});
   await page.keyboard.press("Escape");
  }
  const width=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(width<=3,files[index]+": 390px horizontal overflow "+width);
  console.log("PASS module selector "+(index+1)+"/7");
 }
 await page.goto(pathToFileURL(dest(files[0])).href);
 await page.locator("#ss-fft-path summary").click();
 await page.locator("#ss-fft-path .ss-fft-path-option").nth(2).click();
 await page.waitForURL(/applications-dft-fft\.html$/);
 assert.ok(await page.locator("#ss-fft-path .ss-fft-path-current").isVisible(),"Direct module menu navigation failed");
 assert.equal(errors.length,0,"Uncaught JavaScript errors: "+errors.join(" | "));
 console.log("ALL FFT MODULE PICKER NAVIGATION CHECKS PASSED");
}finally{await page.close();await browser.close()}
