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
  const response=await page.goto(base+"/signals-systems/applications-lab.html?lab="+name,{waitUntil:"domcontentloaded",timeout:25000});
  if(!response?.ok())throw Error("HTTP "+response?.status());
  await page.locator("#ss-al-metrics .ss-al-metric").first().waitFor();
  if(await page.locator("#ss-al-metrics .ss-al-metric").count()!==4)throw Error("Missing metrics");
  const math=page.locator("#ss-al-equation");
  await math.locator("math,.katex").first().waitFor({timeout:15000});
  const rendered=await math.getAttribute("data-math-rendered");
  if(!["katex","mathml"].includes(rendered))throw Error("Equation not rendered");
  const tex=await math.getAttribute("data-tex");
  if(!tex||!tex.includes("\\displaystyle"))throw Error("LaTeX source missing");
  const formulaTagCount=await math.locator("math").count();
  if(formulaTagCount<1)throw Error("Accessible MathML missing");
  const canvas=await page.locator(".ss-al-plot:not([hidden]) canvas").evaluateAll(nodes=>nodes.map(c=>[c.width,c.height]));
  const canvasCss=await page.locator(".ss-al-plot:not([hidden]) canvas").evaluateAll(nodes=>nodes.map(c=>[Math.round(c.getBoundingClientRect().width),Math.round(c.getBoundingClientRect().height)]));
  if(canvas.length<(name==="harmonics"?2:3)||canvas.some(([w,h])=>w<250||h<145))throw Error("Plots too small: "+JSON.stringify(canvas));
  if(canvasCss.some(([w,h],i)=>w<240||h<(i===0?285:145)))throw Error("Visible graphs too small: "+JSON.stringify(canvasCss));
  const aboveFold=await page.evaluate(()=>{
    const controls=document.getElementById("ss-al-controls").getBoundingClientRect();
    const canvas=document.querySelector(".ss-al-primary-plot canvas").getBoundingClientRect();
    return{controlsTop:controls.top,graphTop:canvas.top,graphBottom:canvas.bottom,viewport:innerHeight};
  });
  if(aboveFold.controlsTop>aboveFold.viewport*.58||aboveFold.graphTop>aboveFold.viewport*.72)throw Error("Controls and first graph are not simultaneously visible: "+JSON.stringify(aboveFold));
  await page.screenshot({path:"tests/screenshots/"+name+"-desktop.png"});
  const beforeBitmap=await page.locator(".ss-al-plot canvas").first().evaluate(c=>c.toDataURL());
  const old=await page.locator("#ss-al-metrics .ss-al-metric-value").first().innerText();
  await page.locator("#ss-al-control-fields input[type=range]").first().evaluate((slider,value)=>{slider.value=value;slider.dispatchEvent(new Event("input",{bubbles:true}))},name==="harmonics"?"440":name==="chirp"?"360":"2.0");
  await page.waitForTimeout(120);
  if(name!=="helix"&&old===await page.locator("#ss-al-metrics .ss-al-metric-value").first().innerText())throw Error("Slider failed");
  const afterBitmap=await page.locator(".ss-al-plot canvas").first().evaluate(c=>c.toDataURL());
  if(beforeBitmap===afterBitmap)throw Error("Canvas did not redraw after input");
  if(name==="helix"){
    const changedPhasor=await page.locator("#ss-al-metrics .ss-al-metric-value").nth(2).innerText();
    await page.locator("#ss-al-reset").click();
    await page.waitForTimeout(70);
    const defaultPhasor=await page.locator("#ss-al-metrics .ss-al-metric-value").nth(2).innerText();
    if(changedPhasor===defaultPhasor)throw Error("Helix phasor did not respond to frequency change");
  }
  await page.locator("#ss-al-reset").click();
  await page.waitForTimeout(70);
  const reset=await page.locator("#ss-al-metrics .ss-al-metric-value").first().innerText();
  if(reset!==old)throw Error("Reset did not restore defaults");
  if(name==="helix"){
    const view=page.locator("#ss-al-canvas-1");
    const original=await view.evaluate(c=>c.toDataURL());
    const rect=await view.boundingBox();
    if(!rect)throw Error("3D canvas not visible");
    await page.mouse.move(rect.x+rect.width*.44,rect.y+rect.height*.50);
    await page.mouse.down();
    await page.mouse.move(rect.x+rect.width*.68,rect.y+rect.height*.62,{steps:7});
    await page.mouse.up();await page.waitForTimeout(80);
    const rotated=await view.evaluate(c=>c.toDataURL());
    if(rotated===original)throw Error("3D orbit did not rotate");
    await page.mouse.wheel(0,-150);await page.waitForTimeout(80);
    const zoomed=await view.evaluate(c=>c.toDataURL());
    if(zoomed===rotated)throw Error("3D wheel zoom did not change view");
    await page.locator("#ss-al-camera-reset").click();
    await page.waitForTimeout(80);
    const restored=await view.evaluate(c=>c.toDataURL());
    if(restored!==original)throw Error("3D camera reset did not restore original view");
  }else{
    await page.locator("#ss-al-play").click();
    await page.waitForTimeout(180);
    const moving=Number(await page.locator("#ss-al-seek").inputValue());
    if(moving<10)throw Error("Audio clock did not advance playback timeline");
    if(name==="chirp"){
      const selected=Number(await page.locator("#ctl-pos").inputValue());
      if(selected<1)throw Error("Chirp observation marker is not tracking audio playback");
    }
    await page.locator("#ss-al-pause").click();
    const paused=Number(await page.locator("#ss-al-seek").inputValue());
    await page.waitForTimeout(110);
    if(Math.abs(Number(await page.locator("#ss-al-seek").inputValue())-paused)>3)throw Error("Pause did not freeze timeline");
    await page.locator("#ss-al-seek").evaluate(el=>{el.value="700";el.dispatchEvent(new Event("input",{bubbles:true}))});
    const sought=Number(await page.locator("#ss-al-seek").inputValue());
    if(sought<690||sought>710)throw Error("Seek did not set requested playback position");
    await page.locator("#ss-al-play").click();
    await page.waitForTimeout(80);
    if(Number(await page.locator("#ss-al-seek").inputValue())<700)throw Error("Playback did not resume from seek position");
    await page.locator("#ss-al-stop").click();
    if(Number(await page.locator("#ss-al-seek").inputValue())!==0)throw Error("Stop failed to reset transport");
    if(name==="chirp"){
      const spec=await page.locator("#ss-al-canvas-1").boundingBox();
      if(!spec)throw Error("Chirp spectrogram unavailable");
      await page.mouse.click(spec.x+spec.width*.70,spec.y+spec.height*.48);
      const clicked=Number(await page.locator("#ss-al-seek").inputValue());
      if(clicked<500||clicked>800)throw Error("Spectrogram click failed to seek audio timeline");
      await page.locator("#ss-al-stop").click();
    }
  }
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
  for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
    await page.locator("#ss-al-theme").selectOption(theme);
    await page.waitForTimeout(40);
    if(await page.locator("html").getAttribute("data-els-theme")!==theme)throw Error("Theme not applied: "+theme);
  }
  await page.locator("#ss-al-theme").selectOption("white-clean");
  await page.waitForTimeout(75);
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  if(overflow>6)throw Error("Mobile horizontal overflow "+overflow+"px");
  const equationOverflow=await math.evaluate(el=>el.scrollWidth-el.clientWidth);
  if(equationOverflow>4){
    const scrollable=await math.evaluate(el=>getComputedStyle(el).overflowX==="auto");
    if(!scrollable)throw Error("Mobile equation inaccessible due to overflow: "+equationOverflow+"px");
  }
  const mobilePlots=await page.locator(".ss-al-plot:not([hidden]) canvas").evaluateAll(nodes=>nodes.map(c=>[Math.round(c.getBoundingClientRect().width),Math.round(c.getBoundingClientRect().height)]));
  if(mobilePlots.some(([w,h])=>w<260||h<260))throw Error("Mobile plot too small: "+JSON.stringify(mobilePlots));
  await page.screenshot({path:"tests/screenshots/"+name+"-mobile.png",fullPage:true});
  if(errors.length)throw Error(errors.join("; "));
  console.log("PASS "+name+" "+JSON.stringify({canvas,canvasCss,aboveFold,rendered,formulaTagCount,overflow,equationOverflow,mobilePlots}));
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