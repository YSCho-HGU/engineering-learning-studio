/** FFT curriculum checks: ordered cards, all linked labs, and shared navigation.
 * Run after installing playwright: node tests/applications-fft-path-regression.mjs
 */
import { chromium } from "playwright";
import { access } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const pages=[
 "applications-fft-lab.html",
 "applications-fft-resolution.html",
 "applications-dft-fft.html",
 "applications-fft-dtmf.html",
 "applications-fft-sound-fingerprint.html",
 "applications-fft-upload.html",
 "applications-chirp-stft.html"
];
const target=file=>path.join(root,"signals-systems",file);
for(const name of pages)await access(target(name));
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1366,height:880}});
try{
 await page.goto(pathToFileURL(target("applications.html")).href+"#part-c");
 const groups=page.locator("#topics-c > .ss-app-phase");
 await groups.first().waitFor({state:"visible"});
 const groupTypes=await groups.evaluateAll(nodes=>nodes.map(n=>n.dataset.fftPhase));
 assert.deepEqual(groupTypes,["foundation","discovery","extension","planned"]);
 const counts=await groups.evaluateAll(nodes=>nodes.map(n=>n.querySelectorAll(".ss-app-topic").length));
 assert.deepEqual(counts,[3,3,1,4]);
 const cards=page.locator('#topics-c .ss-app-topic');
 assert.equal(await cards.count(),11);
 assert.equal(await page.locator('#topics-c .ss-app-topic-ready').count(),7);
 assert.equal(await page.locator('#topics-c .ss-app-topic:not(.ss-app-topic-ready)').count(),4);
 assert.equal(await page.locator('#topics-c .ss-app-topic-availability').count(),11);
 assert.equal(await page.locator('#topics-c a.ss-app-open-lab').count(),7);
 const links=await page.locator('#topics-c a.ss-app-open-lab').evaluateAll(nodes=>nodes.map(a=>a.getAttribute("href").replace(/^\.\//,"")));
 assert.deepEqual(links,pages);
 const labels=await page.locator('#topics-c .ss-app-topic-stage').allTextContents();
 assert.ok(labels[0].includes("01 / 07"),"First lab must be marked as starting point");
 assert.ok(labels[6].includes("07 / 07"),"STFT must be marked as last optional step");
 assert.ok(await page.locator('#topics-c .ss-app-topic-ready').first().evaluate(el=>el.open),"Start Here must open by default");
 assert.equal(await page.locator("#topics-c").getAttribute("class"),"ss-app-topic-grid");
 const planned=await groups.nth(3).innerText();
 assert.ok(planned.includes("Magnitude, Phase")&&planned.includes("FFT-Based Convolution"),"Future modules must remain discoverable");
 const allTitles=await cards.locator("h3").allTextContents();
 assert.ok(!allTitles.some(t=>t==="Spectral Leakage and Windows"||t==="Zero Padding and Spectral Detail"),"Already-covered topics duplicated as planned cards");
 console.log("PASS Part C: four learning phases, 7 usable labs, 4 future modules and no duplicate cards");

 for(let i=0;i<pages.length;i++){
  const name=pages[i];
  await page.goto(pathToFileURL(target(name)).href,{waitUntil:"domcontentloaded"});
  const nav=page.locator("#ss-fft-path");
  await nav.waitFor({state:"visible"});
  assert.equal(await nav.locator(".ss-fft-path-progress a").count(),7,name+" progress count");
  const current=nav.locator('.ss-fft-path-progress a[aria-current="page"]');
  assert.equal(await current.count(),1,name+" current lesson mark");
  assert.equal((await current.innerText()).trim(),String(i+1),name+" current lesson index");
  assert.equal(await nav.locator(".ss-fft-path-next").getAttribute("href"),
   i<pages.length-1?"./"+pages[i+1]:"./applications.html#part-c",name+" next path");
  assert.equal(await nav.locator(".ss-fft-path-prev").getAttribute("href"),
   i>0?"./"+pages[i-1]:"./applications.html#part-c",name+" previous path");
  await page.setViewportSize({width:390,height:844});
  const navWidth=await nav.evaluate(el=>el.getBoundingClientRect().width);
  assert.ok(navWidth<=392,name+" nav overflows mobile viewport");
  await page.setViewportSize({width:1366,height:880});
  console.log("PASS sequence "+(i+1)+"/7",name);
 }
 await page.goto(pathToFileURL(target("applications.html")).href+"#part-c");
 const third=page.locator('#topics-c [data-learning-step="3"]');
 await third.locator("summary").click();
 assert.ok(await third.locator("a.ss-app-open-lab").isVisible(),"DFT vs FFT card does not show launch link");
 const href=await third.locator("a.ss-app-open-lab").getAttribute("href");
 assert.equal(href,"./applications-dft-fft.html");
 console.log("ALL FFT LEARNING PATH CHECKS PASSED");
}finally{
 await page.close();
 await browser.close();
}
