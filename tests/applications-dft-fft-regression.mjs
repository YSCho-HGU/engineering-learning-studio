/** Real Chromium regression for the 3 essential DFT vs FFT experiments.
 * No browser server required: file URLs use the checked-out GitHub source.
 */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import {fileURLToPath,pathToFileURL} from "node:url";
import path from "node:path";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const screenshots=path.join(root,"artifacts","fft-browser-qa");await mkdir(screenshots,{recursive:true});
const dest=f=>path.join(root,"signals-systems",f);
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1366,height:900}});
const errors=[];page.on("pageerror",e=>errors.push(e.message));
try{
 await page.goto(pathToFileURL(dest("applications.html")).href+"#part-c");
 const open=page.locator('#topics-c a.ss-app-lesson-row[data-learning-step="3"]');
 await open.waitFor({state:"visible"});await open.click();
 await page.waitForURL(/applications-dft-fft\.html$/);
 await page.waitForFunction(()=>window.__FFTFocusedReady===true);
 assert.equal(await page.locator("header.ss-common-header").count(),1,"Missing standard course header");
 assert.equal(await page.locator("#ss-presentation-toggle").count(),0,"Presentation toggle must be removed");
 assert.equal(await page.locator("#ss-fft-path").count(),1,"One module navigation bar only");
 assert.equal(await page.locator('.dft-tabs [role="tab"]').count(),3,"Exactly 3 internal experiments");
 assert.equal(await page.locator(".dft-paired-plots").count(),1,"Paired time/spectrum plots should share the viewport");
 assert.equal(await page.locator("#dft-time-plot circle").count()>5,true,"Sample time plot empty");
 assert.equal(await page.locator("#dft-spectrum-plot path").count()>0,true,"Spectrum plot empty");
 const errorText=await page.locator("#same-error").innerText();
 assert.ok(Number(errorText)<1e-7,"FFT and direct DFT differ: "+errorText);
 assert.ok((await page.locator("#same-peak").innerText()).includes("Hz"));
 await page.locator("#same-signal").selectOption("two");
 await page.locator("#same-n").selectOption("128");
 await page.locator("#same-fs").fill("2048");
 assert.ok((await page.locator("#same-grid").innerText()).includes("16.000 Hz"));
 await page.locator("#same-fs").fill("0");
 assert.ok(await page.locator("#same-validation").isVisible(),"Invalid fs was not detected");
 await page.locator("#same-fs").fill("1024");
 assert.ok(await page.locator("#same-validation").isHidden(),"Valid fs did not restore experiment");
 console.log("PASS 1 Same Result: plots, complex coefficients, fs, input validation");

 await page.locator("#tab-butterfly").click();
 assert.equal(await page.locator("#panel-same").isHidden(),true);
 assert.equal(await page.locator("#panel-butterfly").isVisible(),true);
 assert.equal(await page.locator("#butterfly-diagram circle").count(),32);
 assert.equal(await page.locator("#butterfly-rows tr").count(),4);
 assert.ok((await page.locator("#butterfly-details").innerText()).includes("W"));
 await page.locator('[data-stage="0"]').click();
 assert.equal(await page.locator("#butterfly-rows tr").count(),8,"Bit reversal order should show 8 positions");
 assert.equal(await page.locator("#butterfly-diagram text").count()>12,true);
 await page.locator('[data-stage="2"]').click();
 await page.locator("#butterfly-pairs button").nth(1).click();
 assert.ok((await page.locator("#butterfly-details").innerText()).includes("W4^1"));
 await page.locator('[data-stage="3"]').click();
 assert.ok(await page.locator("#butterfly-proof").isVisible(),"Final FFT/DFT proof should appear at stage 3");
 assert.equal(await page.locator("#butterfly-proof-rows tr").count(),8);
 const proof=(await page.locator("#butterfly-proof-error").innerText()).match(/([\d.]+e[+-]?\d+)/i);
 assert.ok(proof&&Number(proof[1])<1e-9,"Numerical verification failed");
 await page.locator("#butterfly-preset").selectOption("impulse");
 assert.ok((await page.locator("#butterfly-proof-rows tr").first().innerText()).includes("1.000"));
 await page.locator("#butterfly-input").fill("1 2 3");
 await page.locator("#butterfly-apply").click();
 assert.ok(await page.locator("#butterfly-error").isVisible(),"Invalid input not rejected");
 await page.locator("#butterfly-input").fill("0 1 2 3 4 5 6 7");
 await page.locator("#butterfly-apply").click();
 assert.ok(await page.locator("#butterfly-error").isHidden(),"Valid input not accepted");
 console.log("PASS 2 Butterfly: bit reversal, 12 operations, twiddle values, proof, invalid/custom input");

 await page.locator("#tab-speed").click();
 assert.ok(await page.locator("#panel-speed").isVisible());
 assert.ok(await page.locator("#panel-butterfly").isHidden());
 const before=await page.locator("#speed-dft").innerText();
 assert.ok(before.includes("ms"));
 await page.locator("#speed-n").selectOption("512");
 await page.locator("#speed-run").click();
 assert.ok((await page.locator("#speed-fft").innerText()).includes("ms"));
 assert.ok((await page.locator("#speed-ratio").innerText()).includes("×"));
 assert.equal(await page.locator("#dft-speed-plot path").count(),2,"Expected DFT and FFT cost curves");
 assert.ok((await page.locator("#speed-discovery").innerText()).length>70);
 console.log("PASS 3 Speed: N selection, measured runtime, N² and N log₂N");

 const language=page.locator("#dft-language"),theme=page.locator("#dft-theme");
 await language.selectOption("en");
 assert.ok(!/[가-힣]/.test(await page.locator("#same-title").innerText()));
 await theme.selectOption("neutral-dark");
 await page.locator("#tab-butterfly").click();await page.locator('[data-stage="3"]').click();
 assert.equal(await page.locator(".katex-error").count(),0,"Invalid KaTeX source");
 const math=await page.locator("#butterfly-formula").evaluate(e=>({visible:e.getBoundingClientRect().width>20,rendered:!!e.querySelector(".katex"),fallback:e.textContent.includes("W")}));
 assert.ok(math.visible&&(math.rendered||math.fallback),"Butterfly formula missing");
 await page.screenshot({path:path.join(screenshots,"butterfly-desktop-neutral-dark.png"),fullPage:true});
 await theme.selectOption("white-clean");
 await page.screenshot({path:path.join(screenshots,"butterfly-desktop-white-clean.png"),fullPage:true});
 await language.selectOption("ko");
 assert.ok(/[가-힣]/.test(await page.locator("#butterfly-title").innerText()));
 await page.screenshot({path:path.join(screenshots,"butterfly-desktop-korean.png"),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(overflow<=3,"Full-page horizontal overflow on mobile: "+overflow);
 const scroller=page.locator(".dft-scroll-figure");
 assert.ok(await scroller.evaluate(el=>el.scrollWidth>el.clientWidth),"Butterfly complex SVG should scroll internally");
 await page.locator('[data-stage="3"]').click();await page.locator('[data-stage="2"]').click();await page.locator('[data-stage="3"]').click();
 assert.ok(await scroller.evaluate(el=>el.scrollLeft>0),"Selected butterfly stage not focused in mobile diagram");
 await page.screenshot({path:path.join(screenshots,"butterfly-mobile-white-clean.png"),fullPage:true});
 assert.equal(errors.length,0,"Uncaught browser errors: "+errors.join(" | "));
 console.log("ALL DFT VS FFT THREE-EXPERIMENT CHROMIUM CHECKS PASSED");
}catch(error){
 try{await page.screenshot({path:path.join(screenshots,"failure-state.png"),fullPage:true})}catch(e){}
 throw error;
}finally{await page.close();await browser.close()}
