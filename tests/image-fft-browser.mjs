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
   check((await page.locator("#ss-fft-path [aria-current=page] .ss-fft-path-number").innerText())==="07","Module picker not on 07");
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
   await page.waitForFunction(()=>window.SSImageFFTApp.state.kind==="scene"&&window.SSImageFFTApp.result);
   check(await page.locator("#image-filter").inputValue()==="low","Stage 3 should start low-pass");
   const lowData=await page.locator("#image-output-canvas").evaluate(c=>c.toDataURL());
   await page.locator("#image-filter").selectOption("high");
   await page.waitForTimeout(160);
   const highData=await page.locator("#image-output-canvas").evaluate(c=>c.toDataURL());
   check(highData!==lowData,"Low/high-pass output images identical");
   await page.locator("#image-prediction").selectOption("a");
   await page.locator("#image-check").click();
   check((await page.locator("#image-feedback").getAttribute("data-result"))==="correct","Stage 3 blur explanation");
   await capture("03-filter");
   await page.locator('[data-stage="4"]').click();
   await page.waitForFunction(()=>window.SSImageFFTApp.state.kind==="noise"&&!!window.SSImageFFTApp.result?.originalRMSE);
   let s=await page.evaluate(()=>window.SSImageFFTApp.result);
   const errBefore=s.originalRMSE;
   check(near(s.filteredRMSE,errBefore,1e-7),"Stage 4 should begin with unfiltered interference");
   const spectrum=page.locator("#image-spectrum-canvas");await spectrum.scrollIntoViewIfNeeded();
   const rect=await spectrum.boundingBox(),N=256;
   await page.mouse.click(rect.x+(N/2+12.5)/N*rect.width,rect.y+(N/2+7.5)/N*rect.height);
   await page.waitForFunction(()=>window.SSImageFFTApp.state.filter==="notch"&&window.SSImageFFTApp.result.filteredRMSE<window.SSImageFFTApp.result.originalRMSE*.3);
   s=await page.evaluate(()=>window.SSImageFFTApp.result);
   check(s.output.imagMax<1e-8,"Notch reconstruction became complex");
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
