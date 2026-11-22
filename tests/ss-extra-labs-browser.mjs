import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const root=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const errors=[];
await mkdir("tests/screenshots",{recursive:true});
const almost=(x,y,tol=.2)=>Math.abs(Number(x)-y)<tol;
for(const lab of ["beats","amfm","sampling"]){
 const page=await browser.newPage({viewport:{width:1366,height:768}});
 if(lab==="sampling"){
  await page.addInitScript(()=>{
   window.__ssAudioBuffers=[];
   if(typeof AudioBufferSourceNode==="undefined")return;
   const original=AudioBufferSourceNode.prototype.start;
   AudioBufferSourceNode.prototype.start=function(...args){
    const d=this.buffer?.getChannelData(0);
    if(d?.length){
     let peak=0,energy=0,n=0;
     const start=Math.min(d.length-1,Math.round(d.length*.10)),end=Math.min(d.length,start+4000);
     for(let i=start;i<end;i++){peak=Math.max(peak,Math.abs(d[i]));energy+=d[i]*d[i];n++}
     window.__ssAudioBuffers.push({peak,rms:Math.sqrt(energy/Math.max(1,n)),length:d.length});
    }
    return original.apply(this,args);
   };
  });
 }
 const thrown=[];page.on("pageerror",e=>thrown.push(e.message));
 try{
  const res=await page.goto(root+"/signals-systems/applications-lab.html?lab="+lab,{waitUntil:"domcontentloaded",timeout:25000});
  if(!res?.ok())throw Error("HTTP "+res?.status());
  await page.locator("#ss-al-metrics .ss-al-metric").first().waitFor({timeout:15000});
  if(await page.locator("#ss-al-metrics .ss-al-metric").count()!==4)throw Error("Expected 4 metrics");
  if(await page.locator(".ss-al-plot:not([hidden]) canvas").count()!==3)throw Error("Expected 3 active plots");
  for(const n of [1,2,3]){
   const legend=page.locator("#ss-al-legend-"+n);
   await legend.waitFor({state:"visible",timeout:9000});
   if(!await legend.locator(".ss-al-legend-item").count())throw Error("Graph "+n+" has no external legend");
  }
  await page.locator("#ss-al-equation math").first().waitFor({timeout:10000});
  const hasEquation=await page.locator("#ss-al-equation").getAttribute("data-tex");
  if(!hasEquation?.includes("\\displaystyle"))throw Error("Equation source missing");
  const heights=await page.locator(".ss-al-plot:not([hidden]) canvas").evaluateAll(cs=>cs.map(c=>Math.round(c.getBoundingClientRect().height)));
  if(heights.some((h,i)=>h<(i===0?285:145)))throw Error("Plots too small "+JSON.stringify(heights));
  const geometry=await page.evaluate(()=>{
   const canvas=document.querySelector(".ss-al-primary-plot canvas").getBoundingClientRect();
   const controls=document.getElementById("ss-al-controls").getBoundingClientRect();
   const legends=[1,2,3].map(i=>({
    legend:document.getElementById("ss-al-legend-"+i).getBoundingClientRect().bottom,
    plot:document.getElementById("ss-al-canvas-"+i).getBoundingClientRect().top
   }));
   return{canvasTop:canvas.top,controlsTop:controls.top,legends,viewport:innerHeight};
  });
  if(geometry.canvasTop>geometry.viewport*.80||geometry.controlsTop>geometry.viewport*.55)throw Error("Graph/controls not simultaneously accessible: "+JSON.stringify(geometry));
  if(geometry.legends.some(x=>x.legend>x.plot+2))throw Error("Legend overlaps graph plot");
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
   const summary=page.locator("#ss-al-alias-summary"),aliasValue=page.locator("#ss-al-metrics .ss-al-metric-value").last();
   if(!await summary.isVisible())throw Error("Alias summary missing");
   if(await summary.getAttribute("data-aliased")!=="true")throw Error("Default chirp should alias at t=1 s");
   const crossings=await summary.innerText();
   if(!crossings.includes("0.49")||!crossings.includes("1.63"))throw Error("Nyquist crossing times incorrect: "+crossings);
   if(!almost(parseFloat(await aliasValue.innerText()),200))throw Error("Chirp 3800 Hz at fs=4000 Hz should alias to 200 Hz");
   const ticks=(await page.locator("#ss-al-canvas-2").getAttribute("data-integer-ticks"))||"";
   if(!ticks||ticks.split(",").some(v=>!/^-?\d+$/.test(v)))throw Error("Noninteger DT axis ticks");
   if(await page.locator("#ss-al-pitch-scale").count())throw Error("×8 artificial pitch must be removed");
   if(await page.locator("#ss-extra-fs").getAttribute("max")!=="16000")throw Error("fs upper bound not 16 kHz");
   if(await page.locator("#ss-extra-f1").getAttribute("max")!=="8000")throw Error("Chirp upper bound not 8 kHz");
   if(!await page.locator("#ss-al-sound-check").isVisible())throw Error("1kHz audio check missing");
   await page.locator(".ss-al-preset[data-fs='16000']").click();await page.waitForTimeout(90);
   if(await summary.getAttribute("data-aliased")!=="false")throw Error("16kHz safe fs should not alias 7.3kHz chirp");
   if(!(await summary.innerText()).includes("none"))throw Error("fs16k should not cross Nyquist");
   if(await page.locator("#ss-extra-fs-number").inputValue()!=="16000")throw Error("fs slider and numeric are not synced");
   await page.locator(".ss-al-preset[data-fs='2500']").click();await page.waitForTimeout(90);
   if(!almost(parseFloat(await aliasValue.innerText()),1200))throw Error("3800 Hz chirp at fs2500 should alias to 1200Hz");
   await page.locator("#ss-extra-f1").evaluate(el=>{el.value="8000";el.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.waitForTimeout(70);
   if(await page.locator("#ss-extra-f1").inputValue()!=="8000")throw Error("8kHz chirp endpoint rejected");
   await page.locator("#ss-al-reset").click();
   await page.locator("#ss-extra-kind").selectOption("sine");await page.waitForTimeout(90);
   if(await page.locator("#ss-extra-tone").getAttribute("max")!=="8000")throw Error("8kHz sine endpoint missing");
   if(await page.locator("#ss-extra-fs").inputValue()!=="2000")throw Error("Sine default fs must be 2kHz");
   if(!almost(parseFloat(await aliasValue.innerText()),500))throw Error("Sine 1500Hz at fs2000 should alias to 500Hz");
   const audioInfo=await page.locator("#ss-al-audio-values").innerText();
   if(!audioInfo.includes("1500 Hz")||!audioInfo.includes("500 Hz"))throw Error("Actual source/alias frequencies not displayed");
   await page.locator(".ss-al-preset[data-fs='1200']").click();await page.waitForTimeout(75);
   if(!almost(parseFloat(await aliasValue.innerText()),300))throw Error("Sine 1500Hz at fs1200 should alias to 300Hz");
   await page.locator(".ss-al-preset[data-fs='2000']").click();await page.waitForTimeout(65);
   await page.locator("#ss-al-play-ct").click();await page.waitForTimeout(180);
   const startProgress=Number(await page.locator("#ss-al-seek").inputValue());
   if(startProgress<20)throw Error("CT Web Audio time failed to advance");
   await page.locator("#ss-al-play-alias").click();await page.waitForTimeout(110);
   const buffers=await page.evaluate(()=>window.__ssAudioBuffers||[]);
   if(buffers.length<2||buffers.slice(-2).some(b=>b.peak<.10||b.rms<.05))throw Error("Source/alias Web Audio generated silent PCM: "+JSON.stringify(buffers));
   if(!(await page.locator("#ss-al-audio .ss-al-audio-status").innerText()).includes("Aliased guide"))throw Error("Alias audio switch failed");
   if(Number(await page.locator("#ss-al-seek").inputValue())<startProgress)throw Error("Alias switching lost playback position");
   await page.locator("#ss-al-pause").click();
   const paused=Number(await page.locator("#ss-al-seek").inputValue());
   await page.waitForTimeout(100);
   if(Math.abs(Number(await page.locator("#ss-al-seek").inputValue())-paused)>4)throw Error("Audio pause did not hold");
   await page.locator("#ss-al-seek").evaluate(el=>{el.value="600";el.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.locator("#ss-al-play-ct").click();await page.waitForTimeout(80);
   if(Number(await page.locator("#ss-al-seek").inputValue())<600)throw Error("Audio seek/resume failed");
   await page.locator("#ss-al-stop").click();
   if(Number(await page.locator("#ss-al-seek").inputValue())!==0)throw Error("Audio stop did not reset timeline");
   await page.locator("#ss-al-sound-check").click();
   if(!(await page.locator("#ss-al-audio .ss-al-audio-status").innerText()).includes("1 kHz"))throw Error("1 kHz test-tone state missing");
   await page.locator("#ss-extra-kind").selectOption("chirp");
   await page.locator("#ss-al-play-ct").click();await page.waitForTimeout(130);
   if(Number(await page.locator("#ss-al-seek").inputValue())<10)throw Error("Real-frequency chirp audio did not start");
   await page.locator("#ss-al-play-alias").click();await page.waitForTimeout(80);
   if(!(await page.locator("#ss-al-audio .ss-al-audio-status").innerText()).includes("Aliased guide"))throw Error("Chirp alias audio failed");
   await page.locator("#ss-al-stop").click();
   await page.locator("#ss-extra-aliasGuide").selectOption("off");await page.waitForTimeout(80);
   if(await page.locator("#ss-al-legend-1 .ss-al-legend-item").count()!==2)throw Error("Alias guide not hidden");
   await page.locator("#ss-extra-aliasGuide").selectOption("on");
   const fftShown=await page.locator("#ss-al-canvas-3").evaluate(c=>c.toDataURL());
   await page.locator("#ss-extra-showFFT").selectOption("off");await page.waitForTimeout(85);
   if(fftShown===await page.locator("#ss-al-canvas-3").evaluate(c=>c.toDataURL()))throw Error("STFT visibility did not redraw");
   await page.locator("#ss-extra-showFFT").selectOption("on");
   await page.locator(".ss-al-preset[data-fs='2500']").click();
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
  for(const language of ["ko","mixed","en"]){
   await page.locator("#ss-al-language").selectOption(language);
   await page.waitForTimeout(65);
   const title=await page.locator("#ss-al-title").innerText();
   if(language!=="en"&&!/[가-힣]/.test(title))throw Error("Korean text missing for "+language);
   if(language==="en"&&/[가-힣]/.test(title))throw Error("English-only mode contains Korean");
  }
  for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
   await page.locator("#ss-al-theme").selectOption(theme);
   await page.waitForTimeout(65);
   if(await page.locator("html").getAttribute("data-els-theme")!==theme)throw Error("Theme not applied: "+theme);
  }
  await page.locator("#ss-al-theme").selectOption("white-clean");await page.waitForTimeout(80);
  await page.locator("#ss-al-focus-toolbar").click();
  if(!await page.locator("#ss-al-root").evaluate(el=>el.classList.contains("focus")))throw Error("Focus entry failed");
  await page.locator("#ss-al-focus-toolbar").click();
  if(await page.locator("#ss-al-root").evaluate(el=>el.classList.contains("focus")))throw Error("Focus exit failed");
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(110);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  if(overflow>6)throw Error("Mobile horizontal overflow "+overflow+"px");
  const mobileH=await page.locator(".ss-al-plot:not([hidden]) canvas").evaluateAll(cs=>cs.map(c=>Math.round(c.getBoundingClientRect().height)));
  const formula=page.locator("#ss-al-equation");
  const mathOverflow=await formula.evaluate(el=>el.scrollWidth-el.clientWidth);
  if(mathOverflow>4&&!(await formula.evaluate(el=>getComputedStyle(el).overflowX==="auto")))throw Error("Mobile formula is clipped");
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
