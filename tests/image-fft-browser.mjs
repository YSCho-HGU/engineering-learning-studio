/* 2D image FFT student journeys — Chromium, responsive and numerical checks.
 * Run from repo root after serving: node tests/image-fft-browser.mjs
 */
import {chromium} from "@playwright/test";
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const output="tests/screenshots/image-fft";
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true}),issues=[];
const check=(v,msg)=>assert.ok(v,msg);
const near=(x,y,eps=1e-8)=>Math.abs(x-y)<eps;
async function range(page,id,value){
 await page.locator(id).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event("input",{bubbles:true}));},value);
 await page.waitForTimeout(150);
}
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:880},reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  try{
   await page.goto(base+"/signals-systems/applications.html#part-c",{waitUntil:"domcontentloaded"});
   await page.locator("#topics-c a.ss-app-lesson-row").first().waitFor();
   check(await page.locator("#topics-c .ss-app-lesson-group[data-fft-phase=discovery] a.ss-app-lesson-row").count()===4,"Expected discovery lessons 04–07");
   const rows=page.locator("#topics-c .ss-app-lesson-group[data-fft-phase=discovery] a.ss-app-lesson-row");
   check((await rows.nth(2).getAttribute("href"))==="./applications-fft-upload.html","Lesson 06 moved");
   check((await rows.nth(3).getAttribute("href"))==="./applications-fft-image.html","Lesson 07 must follow 06");
   if(width===1440){
    const result=await rows.nth(2).evaluate(el=>{
     const next=el.nextElementSibling,a=el.getBoundingClientRect(),b=next.getBoundingClientRect();
     return {rightOf:b.x>a.x,sharedRow:Math.abs(b.y-a.y)<12};
    });
    check(result.rightOf&&result.sharedRow,"Lesson 07 must be directly right of 06 in desktop grid: "+JSON.stringify(result));
   }
   await page.goto(base+"/signals-systems/applications-fft-image.html",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.SSImageFFTApp?.result?.output?.pixels?.length===65536,null,{timeout:20000});
   check(await page.locator("#ss-fft-path").isVisible(),"Missing common FFT module selector");
   check((await page.locator("#ss-fft-path [aria-current=page] .ss-fft-path-number").textContent())==="07","Module picker not on 07");
   check(await page.locator("header.ss-common-header").isVisible(),"Standard header missing");
   const canvases=["image-input-canvas","image-spectrum-canvas","image-mask-canvas","image-output-canvas"];
   for(const id of canvases){
    const c=page.locator("#"+id);
    check(await c.isVisible(),"Missing canvas "+id);
    const rect=await c.boundingBox();check(rect.width>150&&rect.height>150,"Canvas unreadable "+id);
   }
   const initial=await page.evaluate(()=>window.SSImageFFTApp.result);
   check(initial.peak.u===0&&Math.abs(initial.peak.v)===8,"Horizontal stripes FFT peaks incorrect");
   const capture=(name)=>page.screenshot({path:output+"/"+name+"-"+width+".png",fullPage:true,animations:"disabled"});
   await capture("01-stripes");
   await range(page,"#image-cycles",20);
   await page.waitForFunction(()=>Math.abs(window.SSImageFFTApp.result?.peak?.v)===20);
   await range(page,"#image-angle",90);
   await page.waitForFunction(()=>Math.abs(window.SSImageFFTApp.result?.peak?.u)===20);
   check(Math.abs((await page.evaluate(()=>window.SSImageFFTApp.result.peak)).v)<1,"Rotated vertical stripes peak not horizontal");
   await page.locator("#image-prediction").selectOption("a");
   await page.locator("#image-check").click();
   check((await page.locator("#image-feedback").getAttribute("data-result"))==="correct","Stage 1 reasoning");
   await page.locator('[data-stage="2"]').click();
   await page.waitForFunction(()=>window.SSImageFFTApp.state.kind==="checker"&&window.SSImageFFTApp.result);
   await range(page,"#image-cycles",12);
   await page.locator("#image-prediction").selectOption("a");
   await page.locator("#image-check").click();
   check((await page.locator("#image-feedback").getAttribute("data-result"))==="correct","Stage 2 checkerboard reasoning");
   await capture("02-checkerboard");
   await page.locator('[data-stage="3"]').click();
   await page.waitForFunction(()=>window.SSImageFFTApp.result?.input?.kind==="scene" && Number.isFinite(window.SSImageFFTApp.result?.output?.maxDifference) && document.querySelectorAll("#image-kernel-pixels .ss-image-kernel-cell").length===9);
   check(await page.locator("#image-filter").inputValue()==="kernel","Stage 3 must begin with an actual spatial kernel");
   const inspector=page.locator("#image-kernel-panel");
   check(await inspector.isVisible(),"3x3 kernel selector should be displayed");
   check(await page.locator("#image-kernel-bridge").isVisible(),"Spatial/FFT comparison bridge missing");
   check(await page.evaluate(()=>document.querySelector("#image-prediction").compareDocumentPosition(document.querySelector("#image-input-canvas"))&Node.DOCUMENT_POSITION_FOLLOWING),"Prediction must appear before input image");
   check(await page.locator("#image-scan-source").isVisible(),"Animated source preview missing");
   check(await page.locator("#image-scan-fft").isVisible(),"FFT reconstruction preview missing");
   check(await page.locator("#image-spatial-progress .ss-image-bridge-cell").count()===25,"Spatial 5x5 output grid missing");
   check(await page.locator("#image-fft-progress .ss-image-bridge-cell").count()===25,"FFT 5x5 output grid missing");
   const preview=page.locator("#image-scan-source"),bounds=await preview.boundingBox();
   await page.mouse.click(bounds.x+bounds.width*.45,bounds.y+bounds.height*.35);
   const previewPoint=await page.evaluate(()=>({x:window.SSImageFFTApp.state.probeX,y:window.SSImageFFTApp.state.probeY}));
   check(Math.abs(previewPoint.x-256*.45)<2&&Math.abs(previewPoint.y-256*.35)<2,"Preview click does not select kernel center");
   check((await page.locator("#image-scan-counter").textContent())==="0 / 25","Selecting preview must restart the scan");
   check(await page.locator("#image-spatial-progress .ss-image-bridge-revealed").count()===0,"Spatial scan must begin empty");
   check(await page.locator("#image-kernel-pixels .ss-image-kernel-cell").count()===9,"Nine input pixels missing");
   check(await page.locator("#image-kernel-weights .ss-image-kernel-cell").count()===9,"Nine kernel weights missing");
   let kernel=await page.evaluate(()=>window.SSImageFFTApp.result);
   check(kernel.output.maxDifference<1e-9,"Box spatial and FFT2 filtering disagree");
   const boxImage=await page.locator("#image-output-canvas").evaluate(c=>c.toDataURL());
   await page.locator("#image-kernel-choice").selectOption("gaussian");
   await page.waitForFunction(()=>window.SSImageFFTApp.state.kernel==="gaussian"&&window.SSImageFFTApp.result?.output?.maxDifference<1e-9);
   const gaussianImage=await page.locator("#image-output-canvas").evaluate(c=>c.toDataURL());
   check(gaussianImage!==boxImage,"Box and Gaussian kernel results must differ");
   await page.locator("#image-kernel-choice").selectOption("sharpen");
   await page.waitForFunction(()=>window.SSImageFFTApp.state.kernel==="sharpen"&&window.SSImageFFTApp.result?.output?.maxDifference<1e-9);
   const sharpImage=await page.locator("#image-output-canvas").evaluate(c=>c.toDataURL());
   check(sharpImage!==gaussianImage,"Sharpening should differ from Gaussian blur");
   const clickBox=await page.locator("#image-input-canvas").boundingBox();
   await page.mouse.click(clickBox.x+clickBox.width*.37,clickBox.y+clickBox.height*.4);
   await page.waitForTimeout(120);
   check((await page.locator("#image-kernel-evidence").textContent()).length>10,"Pixel scan instruction missing");
   const probe=await page.evaluate(()=>{
    const api=window.SSImageFFTApp,core=window.SSImageFFTCore;
    return core.kernelProbe(api.result.input.pixels,api.state.N,api.state.kernel,api.state.probeX,api.state.probeY);
   });
   const fftPixel=await page.evaluate(()=>{
    const api=window.SSImageFFTApp;
    return api.result.output.pixels[api.state.probeY*api.state.N+api.state.probeX];
   });
   check(Math.abs(probe.sum-fftPixel)<1e-9,"Selected pixel weighted sum not equal to FFT pixel output");
   // Show the broad frequency-domain low/high-pass alternative as a distinct operation,
   // rather than incorrectly treating the Gaussian mask as identical to a 3x3 kernel.
   await page.locator("#image-filter").selectOption("low");
   await page.waitForTimeout(140);
   const lowData=await page.locator("#image-output-canvas").evaluate(c=>c.toDataURL());
   await page.locator("#image-filter").selectOption("high");
   await page.waitForTimeout(140);
   const highData=await page.locator("#image-output-canvas").evaluate(c=>c.toDataURL());
   check(highData!==lowData,"Low/high-pass output images identical");
   await page.locator("#image-filter").selectOption("kernel");
   await page.waitForTimeout(100);
   await page.locator("#image-prediction").selectOption("a");
   await page.locator("#image-check").click();
   check((await page.locator("#image-feedback").getAttribute("data-result"))==="retry","Stage 3 must require evidence from the scan");
   await page.locator("#image-scan-next").click();
   check((await page.locator("#image-kernel-evidence").textContent()).includes("FFT2"),"Pixel sum and FFT evidence not connected");
   await page.locator("#image-scan-next").click();
   await page.locator("#image-scan-next").click();
   check((await page.locator("#image-scan-counter").textContent())==="3 / 25","Step animation does not advance");
   check(await page.locator("#image-spatial-progress .ss-image-bridge-revealed").count()===3,"Three spatial outputs not revealed");
   check(await page.locator("#image-fft-progress .ss-image-bridge-known").count()===25,"All FFT results must be ready");
   const pair=await page.evaluate(()=>{
    const app=window.SSImageFFTApp,idx=app.state.probeY*app.state.N+app.state.probeX;
    return [app.result.output.spatialPixels[idx],app.result.output.pixels[idx]];
   });
   check(Math.abs(pair[0]-pair[1])<1e-9,"Spatial and FFT current pixel mismatch");
   await page.locator("#image-check").click();
   check((await page.locator("#image-feedback").getAttribute("data-result"))==="correct","Stage 3 convolution theorem explanation");
   await page.locator("#image-scan-speed").selectOption("230");
   await page.locator("#image-scan-play").click();
   await page.waitForFunction(()=>Number(document.querySelector("#image-scan-counter").textContent.split(" / ")[0])>=4,null,{timeout:5000});
   check((await page.locator("#image-scan-play").getAttribute("aria-pressed"))==="true","Kernel scan failed to start");
   await page.locator("#image-scan-play").click();
   check((await page.locator("#image-scan-play").getAttribute("aria-pressed"))==="false","Kernel scan failed to pause");
   await page.locator("#image-scan-restart").click();
   check((await page.locator("#image-scan-counter").textContent())==="0 / 25","Kernel scan did not restart");
   await capture("03-filter");
   await page.locator('[data-stage="4"]').click();
   await page.waitForFunction(()=>window.SSImageFFTApp.state.kind==="noise"&&!!window.SSImageFFTApp.result?.originalRMSE);
   check(await page.locator("#image-kernel-bridge").isHidden(),"Kernel animation leaked into noise stage");
   await page.locator("#image-noise-hint").click();
   check((await page.locator("#image-noise-hint").textContent()).includes("Hide"),"Noise peak hint did not toggle");
   await page.locator("#image-noise-hint").click();
   let s=await page.evaluate(()=>window.SSImageFFTApp.result);
   const errBefore=s.originalRMSE;
   check(near(s.filteredRMSE,errBefore,1e-7),"Stage 4 should begin with unfiltered interference");
   const spectrum=page.locator("#image-spectrum-canvas");await spectrum.scrollIntoViewIfNeeded();
   const rect=await spectrum.boundingBox(),N=256;
   await page.mouse.click(rect.x+(N/2+12.5)/N*rect.width,rect.y+(N/2+7.5)/N*rect.height);
   await page.waitForFunction(()=>window.SSImageFFTApp.state.filter==="notch"&&window.SSImageFFTApp.result.filteredRMSE<window.SSImageFFTApp.result.originalRMSE*.3);
   s=await page.evaluate(()=>window.SSImageFFTApp.result);
   check(s.output.imagMax<1e-8,"Notch reconstruction became complex");
   check((await page.locator("#image-live-observation").textContent()).includes("RMSE"),"Denoising improvement not explained");
   await page.locator("#image-prediction").selectOption("a");
   await page.locator("#image-check").click();
   check((await page.locator("#image-feedback").getAttribute("data-result"))==="correct","Stage 4 conjugate symmetry reasoning");
   await capture("04-denoise");
   await page.locator(".ss-image-advanced summary").click();
   await page.locator("#image-spectrum-view").selectOption("phase");
   await page.waitForTimeout(100);
   check(await page.locator("#image-spectrum-canvas").isVisible(),"Advanced phase visualization failed");
   // An original PNG, generated entirely in the browser, is uploaded locally.
   const encoded=await page.evaluate(()=>{
    const c=document.createElement("canvas");c.width=48;c.height=48;const x=c.getContext("2d");
    x.fillStyle="#eee";x.fillRect(0,0,48,48);
    x.fillStyle="#222";for(let i=0;i<48;i+=8)x.fillRect(i,0,4,48);
    return c.toDataURL("image/png").split(",")[1];
   });
   await page.locator("#image-upload").setInputFiles({name:"sample-stripes.png",mimeType:"image/png",buffer:Buffer.from(encoded,"base64")});
   await page.waitForFunction(()=>window.SSImageFFTApp.state.kind==="upload"&&window.SSImageFFTApp.result?.input?.kind==="upload");
   await page.locator("#image-size").selectOption("128");
   await page.waitForFunction(()=>window.SSImageFFTApp.result?.N===128);
   check((await page.locator("#image-status").innerText()).includes("sample-stripes.png"),"Local upload status missing");
   await page.locator("#image-reset").click();
   await page.waitForFunction(()=>window.SSImageFFTApp.state.kind==="stripes"&&window.SSImageFFTApp.result?.N===256);
   check(await page.locator("#image-filter").inputValue()==="none","Reset did not restore no mask");
   for(const language of ["en","ko","mixed"]){
    await page.locator("#image-language").selectOption(language);
    const q=await page.locator("#image-question").textContent();
    check(language==="en"?!/[가-힣]/.test(q):/[가-힣]/.test(q),"Language switching incorrect: "+language);
   }
   for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
    await page.locator("[data-els-theme-picker]").selectOption(theme);
    check(await page.evaluate(()=>document.documentElement.dataset.elsTheme)===theme,"Theme failed "+theme);
   }
   check((await page.locator(".katex-error").count())===0,"Equation formatting broken");
   const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
   check(dims.scroll<=dims.width+8,"Horizontal overflow "+JSON.stringify(dims));
   check(errors.length===0,"Page exceptions: "+errors.join(" | "));
   await capture("final");
   console.log("PASS 2D Image FFT full student journey at "+width+"px");
  }catch(e){
   issues.push(width+": "+e.stack);
   try{await page.screenshot({path:output+"/failure-"+width+".png",fullPage:true});}catch(_){}
   console.error("FAIL image FFT "+width+": "+e.stack);
  }finally{await page.close();}
 }
}finally{await browser.close();}
assert.deepEqual(issues,[],"Image FFT browser regression");
