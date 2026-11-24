/** Visual contract QA for all 8 FFT Applications — Chromium and screenshot evidence. */
import {chromium} from "playwright";
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {fileURLToPath,pathToFileURL} from "node:url";
import path from "node:path";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"artifacts","fft-visual-standard-qa");
await mkdir(output,{recursive:true});
const modules=[
 ["applications-fft-lab.html",".ss-fft-card.ss-fft-graph-card","#fft-time-plot",".ss-fft-equation",".ss-fft-graphs"],
 ["applications-fft-resolution.html",".ss-fft-r-card","#fft-r-time",".ss-fft-r-theory>div",".ss-fft-r-graphs"],
 ["applications-dft-fft.html",".dft-plot-card","#dft-time-plot","#same-formula",".dft-paired-plots"],
 ["applications-fft-dtmf.html",".ss-dtmf-panel","#dtmf-wave",".ss-dtmf-formulas>div",null],
 ["applications-fft-sound-fingerprint.html",".ss-finger-card","#finger-wave",".ss-finger-math>div",null],
 ["applications-fft-upload.html",".ss-fft-upload-panel","#fft-upload-wave",".ss-fft-upload-formulas>div",null],
 ["applications-fft-image.html",".ss-image-panel","#image-input-canvas","#image-formula-1",".ss-image-views"],
 ["applications-chirp-stft.html",".ss-stft-card","#stft-time-plot",".ss-stft-formulas>div",".ss-stft-pair"]
];
const chartHeadings={
 "applications-fft-lab.html":".ss-fft-graph-card h2",
 "applications-fft-resolution.html":".ss-fft-r-graphs h2",
 "applications-dft-fft.html":".dft-plot-card h3",
 "applications-fft-dtmf.html":"#dtmf-wave-title",
 "applications-fft-sound-fingerprint.html":"#finger-wave-title",
 "applications-fft-upload.html":"#fft-upload-step1",
 "applications-fft-image.html":".ss-image-view h3",
 "applications-chirp-stft.html":"#stft-time-title"
};
const cssNumber=s=>parseFloat(s)||0;
const browser=await chromium.launch({headless:true});
const p=await browser.newPage({viewport:{width:1366,height:850},deviceScaleFactor:1});
const allErrors=[];p.on("pageerror",e=>allErrors.push(e.message));
try{
 const measurements=[];
 for(let idx=0;idx<modules.length;idx++){
  const [file,cardSelector,plotSelector,mathSelector,pairSelector]=modules[idx],slug=file.replace(/\.html$/,""),titleSelector=chartHeadings[file];
  await p.setViewportSize({width:1366,height:850});
  await p.goto(pathToFileURL(path.join(root,"signals-systems",file)).href,{waitUntil:"domcontentloaded"});
  await p.locator("#ss-fft-path").waitFor({state:"visible"});
  await p.locator(cardSelector).first().waitFor({state:"visible"});
  if(file==="applications-fft-image.html")await p.locator(".ss-image-advanced summary").click(); // Optional math is intentionally collapsed until requested.
  assert.equal(await p.locator('link[href*="ss-app-fft-visual-standard.css"]').count(),1,slug+": shared stylesheet not linked");
  assert.ok(await p.locator("header.ss-common-header").isVisible(),slug+": standard header missing");
  const mathElement=p.locator(mathSelector).first();
  assert.ok(await mathElement.count()>0,slug+": no formula display container");
  const card=p.locator(cardSelector).first();
  const plot=p.locator(plotSelector);
  const selects=p.locator("main select:visible");
  assert.ok(await selects.count()>0,slug+": missing interactive controls");
  const select=selects.first();
  const check=async(phone)=>{
    const measure=await p.evaluate(({cardSelector,plotSelector,mathSelector,titleSelector})=>{
      const root=document.querySelector("main");
      const style=getComputedStyle(root),card=document.querySelector(cardSelector),
       graph=document.querySelector(plotSelector),math=document.querySelector(mathSelector);
      const first=root.querySelector("select"),heading=card.querySelector("h2");
      const box=graph?.getBoundingClientRect();
      const c=getComputedStyle(card);const title=document.querySelector(titleSelector);
      return{
       padding:c.paddingTop,
       cardRadius:c.borderTopLeftRadius,
       controlHeight:first?getComputedStyle(first).minHeight:"0",
       headingSize:heading?getComputedStyle(heading).fontSize:"",
       plotTitleSize:title?getComputedStyle(title).fontSize:"",
       svgWidth:box?.width??0,svgHeight:box?.height??0,
       mathSize:math?getComputedStyle(math).fontSize:"",
       mathOverflow:math?getComputedStyle(math).overflowX:"",
       rootFont:style.fontSize,
       gap:style.getPropertyValue("--fft-ui-gap").trim(),
       bodyOverflow:document.documentElement.scrollWidth-window.innerWidth,
       theme:document.documentElement.dataset.elsTheme,
       cardWidth:card.getBoundingClientRect().width,
       viewport:window.innerWidth,
       mathWidth:math?.getBoundingClientRect().width??0
      };
    },{cardSelector,plotSelector,mathSelector,titleSelector});
    const expectedPadding=phone?12:14;
    assert.equal(cssNumber(measure.padding),expectedPadding,slug+": card padding "+JSON.stringify(measure));
    assert.ok(cssNumber(measure.cardRadius)>=10,slug+": inconsistent card rounding");
    assert.equal(cssNumber(measure.plotTitleSize),phone?15:16,slug+": plot title hierarchy differs "+JSON.stringify(measure));
    assert.ok(cssNumber(measure.controlHeight)>=40,slug+": control too small");
    assert.ok(measure.svgWidth>120&&measure.svgHeight>40,slug+": graph not visible or collapsed");
    assert.ok(measure.mathWidth>0,slug+": mathematical container has no layout");
    assert.ok(cssNumber(measure.mathSize)>=16,slug+": equation text too small");
    assert.ok(measure.bodyOverflow<=3,slug+": horizontal page overflow "+JSON.stringify(measure));
    assert.ok(measure.gap==="12px"||measure.gap==="10px",slug+": spacing token absent");
    return measure;
  };
  await p.locator("[data-els-theme-picker]").selectOption("neutral-dark");
  const dark=await check(false);
  measurements.push({module:slug,view:"desktop dark",...dark});
  await p.screenshot({path:path.join(output,String(idx+1).padStart(2,"0")+"-"+slug+"-dark.png"),fullPage:true,animations:"disabled"});
  await p.locator("[data-els-theme-picker]").selectOption("white-clean");
  const white=await check(false);
  measurements.push({module:slug,view:"desktop white",...white});
  await p.screenshot({path:path.join(output,String(idx+1).padStart(2,"0")+"-"+slug+"-white.png"),fullPage:true,animations:"disabled"});
  if(pairSelector&&(idx===0||idx===1||idx===2)){
   const paired=await p.locator(pairSelector).evaluate(el=>{
    const children=Array.from(el.children).filter(x=>getComputedStyle(x).display!=="none");
    if(children.length<2)return {columns:children.length};
    const a=children[0].getBoundingClientRect(),b=children[1].getBoundingClientRect();
    return{columns:children.length,verticalDifference:Math.abs(a.y-b.y),firstWidth:a.width,secondWidth:b.width};
   });
   assert.ok(paired.columns>=2&&paired.verticalDifference<50,slug+": graphs should be side by side on desktop "+JSON.stringify(paired));
  }
  await p.setViewportSize({width:390,height:844});
  await p.locator("[data-els-theme-picker]").selectOption("neutral-dark");
  const mobile=await check(true);
  measurements.push({module:slug,view:"390px mobile dark",...mobile});
  await p.screenshot({path:path.join(output,String(idx+1).padStart(2,"0")+"-"+slug+"-mobile.png"),fullPage:true,animations:"disabled"});
  assert.equal(await p.locator(".katex-error").count(),0,slug+": rendered invalid KaTeX");
  console.log("PASS visual standard "+(idx+1)+"/8 "+slug+": cards, controls, graph, equation, themes, desktop/mobile");
 }
 assert.equal(allErrors.length,0,"Uncaught JS exceptions: "+allErrors.join(" | "));
 const fs=await import("node:fs/promises");
 await fs.writeFile(path.join(output,"measured-layout.json"),JSON.stringify(measurements,null,2));
 console.log("PASS all 8 FFT visual contracts, 24 screenshots and geometry measurements");
}catch(e){
 try{await p.screenshot({path:path.join(output,"failure.png"),fullPage:true})}catch{}
 throw e;
}finally{await p.close();await browser.close()}
