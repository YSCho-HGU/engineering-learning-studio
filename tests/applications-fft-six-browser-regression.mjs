/** End-to-end Chromium QA for the six FFT Applications labs other than DFT vs FFT.
 * Run: node tests/applications-fft-six-browser-regression.mjs
 * Screenshots: artifacts/fft-six-browser-qa/
 */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const artifacts=path.join(root,"artifacts","fft-six-browser-qa");
await mkdir(artifacts,{recursive:true});
const lessons=[
 {file:"applications-fft-lab.html",lang:"ss-fft-language",title:"fft-title",plots:["fft-time-plot","fft-spectrum-plot"],step:1,slug:"samples"},
 {file:"applications-fft-resolution.html",lang:"fft-r-language",title:"fft-r-title",plots:["fft-r-time","fft-r-spectrum"],step:2,slug:"resolution"},
 {file:"applications-fft-dtmf.html",lang:"dtmf-language",title:"dtmf-title",plots:["dtmf-wave"],step:4,slug:"dtmf"},
 {file:"applications-fft-sound-fingerprint.html",lang:"finger-language",title:"finger-title",plots:["finger-wave","finger-spectrum"],step:5,slug:"sound"},
 {file:"applications-fft-upload.html",lang:"fft-upload-language",title:"fft-upload-title",plots:[],step:6,slug:"upload"},
 {file:"applications-chirp-stft.html",lang:"stft-language",title:"stft-title",plots:["stft-time-plot","stft-global-plot","stft-local-plot","stft-spectrogram"],step:8,slug:"chirp"}
];
function check(condition,message){assert.ok(condition,message);}
async function svgNonblank(page,id){
 const result=await page.locator("#"+id).evaluate(svg=>{
  const drawing=svg.querySelectorAll("path,line,polyline,polygon,circle,rect").length;
  const box=svg.getBoundingClientRect();
  return{drawing,width:box.width,height:box.height,visible:getComputedStyle(svg).display!=="none"};
 });
 check(result.drawing>2&&result.width>40&&result.height>30,id+" must render nonempty SVG: "+JSON.stringify(result));
}
async function setRange(page,id,value){
 await page.locator("#"+id).evaluate((element,v)=>{
  element.value=String(v);
  element.dispatchEvent(new Event("input",{bubbles:true}));
  element.dispatchEvent(new Event("change",{bubbles:true}));
 },value);
}
async function capture(page,name){
 await page.screenshot({path:path.join(artifacts,name+".png"),fullPage:true,animations:"disabled",timeout:20000});
}
function wav({rate=16000,n=16384,freq=440}={}){
 const bytes=Buffer.alloc(44+n*2);bytes.write("RIFF",0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write("WAVEfmt ",8);
 bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);
 bytes.writeUInt32LE(rate,24);bytes.writeUInt32LE(rate*2,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);
 bytes.write("data",36);bytes.writeUInt32LE(n*2,40);
 for(let i=0;i<n;i++){const v=.65*Math.sin(2*Math.PI*freq*i/rate);bytes.writeInt16LE(Math.round(v*32767),44+i*2)}
 return bytes;
}
const browser=await chromium.launch({headless:true});
let page=null;
const allErrors=[];
try{
 for(const lesson of lessons){
  const errors=[];
  page=await browser.newPage({viewport:{width:1366,height:850}});
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(root,"signals-systems",lesson.file)).href,{waitUntil:"domcontentloaded"});
  await page.locator("#ss-fft-path").waitFor({state:"visible"});
  check(await page.locator("#ss-fft-path").count()===1,lesson.slug+": should have exactly one shared learning path");
  check(await page.locator("#ss-fft-path .ss-fft-path-option[aria-current='page']").count()===1,lesson.slug+": wrong selected module");
  check((await page.locator("#ss-fft-path .ss-fft-path-option[aria-current='page'] .ss-fft-path-number").textContent())===String(lesson.step).padStart(2,"0"),lesson.slug+": wrong route number");
  check(await page.locator("#ss-presentation-toggle").count()===0,lesson.slug+": Presentation mode must be removed");
  check(await page.locator("header.ss-common-header").isVisible(),lesson.slug+": standard header missing");
  check(await page.locator("#"+lesson.title).isVisible(),lesson.slug+": heading not visible");
  for(const id of lesson.plots)await svgNonblank(page,id);
  check(await page.locator(".katex-error").count()===0,lesson.slug+": invalid equation syntax");
  await page.locator("#"+lesson.lang).selectOption("en");
  check(!/[가-힣]/.test(await page.locator("#"+lesson.title).innerText()),lesson.slug+": Korean in English title");
  const theme=page.locator("[data-els-theme-picker]");
  check(await theme.count()===1,lesson.slug+": shared theme picker absent");
  await theme.selectOption("white-clean");
  const white=await page.evaluate(()=>({theme:document.documentElement.dataset.elsTheme,bg:getComputedStyle(document.body).backgroundColor}));
  await theme.selectOption("neutral-dark");
  const dark=await page.evaluate(()=>({theme:document.documentElement.dataset.elsTheme,bg:getComputedStyle(document.body).backgroundColor}));
  check(white.theme==="white-clean"&&dark.theme==="neutral-dark",lesson.slug+": theme setting not reflected in DOM");
  check(white.bg!==dark.bg,lesson.slug+": body background does not respond to theme");
  await page.locator("#"+lesson.lang).selectOption("ko");
  check(/[가-힣]/.test(await page.locator("#"+lesson.title).innerText()),lesson.slug+": no Korean heading");
  await page.locator("#"+lesson.lang).selectOption("en");
  console.log("PASS "+lesson.slug+": route, plots, math, EN/KR, white/neutral-dark");

  if(lesson.slug==="samples"){
   check(await page.locator("#fft-error").isHidden(),"samples: initial input error");
   check((await page.locator("#fft-metrics").innerText()).includes("cycles/sample"),"samples: missing normalized frequency without fs");
   await page.locator("#fft-known").check();
   await page.locator("#fft-fs").fill("8000");await page.locator("#fft-run").click();
   check((await page.locator("#fft-metrics").innerText()).includes("Hz"),"samples: Hz units not shown with sampling rate");
   await page.locator("#fft-preset").selectOption("two");
   await svgNonblank(page,"fft-spectrum-plot");
   await page.locator("#fft-samples").fill("1, 2, xyz");await page.locator("#fft-run").click();
   check(await page.locator("#fft-error").isVisible(),"samples: invalid data not rejected");
   await page.locator("#fft-reset").click();
   check(await page.locator("#fft-error").isHidden(),"samples: reset did not recover input");
   await page.locator("#fft-checkpoint-answer").selectOption("0");await page.locator("#fft-checkpoint-check").click();
   check((await page.locator("#fft-checkpoint-feedback").innerText()).length>0,"samples: checkpoint gave no feedback");
  }else if(lesson.slug==="resolution"){
   check((await page.locator("#fft-r-stats").innerText()).includes("Hz"),"resolution: no frequency metrics");
   await page.locator("#fft-r-experiment").selectOption("leakage");
   await page.locator("#fft-r-window").selectOption("hann");
   await setRange(page,"fft-r-offset","0.4");
   await svgNonblank(page,"fft-r-spectrum");
   await page.locator("#fft-r-experiment").selectOption("padding");
   await page.locator("#fft-r-padding").selectOption("4");
   check((await page.locator("#fft-r-stats").innerText()).includes("Hz"),"resolution: missing padded-grid metrics");
   await page.locator("#fft-r-quiz-answers").selectOption("0");await page.locator("#fft-r-quiz-check").click();
   check((await page.locator("#fft-r-quiz-feedback").innerText()).length>0,"resolution: quiz gave no feedback");
  }else if(lesson.slug==="dtmf"){
   await page.locator("#dtmf-fft").click();
   check(await page.locator("#dtmf-spectrum").isVisible(),"dtmf: spectrum hidden after FFT");
   await svgNonblank(page,"dtmf-spectrum");
   const traceFill=await page.locator("#dtmf-spectrum path.ss-dtmf-trace").evaluate(el=>getComputedStyle(el).fill);
   check(traceFill==="none","dtmf: spectrum line must be unfilled, got "+traceFill);
   const axisFill=await page.locator("#dtmf-spectrum path.ss-dtmf-axis").evaluate(el=>getComputedStyle(el).fill);
   check(axisFill==="none","dtmf: chart axis must not fill triangle, got "+axisFill);
   check((await page.locator("#dtmf-peaks").innerText()).includes("Hz"),"dtmf: no two frequency peaks");
   const digit=await page.evaluate(()=>window.SSDTMF.result?.decoded);
   check(typeof digit==="string"&&digit.length===1,"dtmf: no valid decoded key");
   await page.locator('#dtmf-keypad [data-digit="'+digit+'"]').click();
   await page.locator("#dtmf-check").click();
   check((await page.locator("#dtmf-feedback").getAttribute("data-result"))==="correct","dtmf: correct key rejected");
   await page.locator("#dtmf-mode").selectOption("sequence");
   check((await page.locator("#dtmf-challenge-index").innerText()).includes("/ 3"),"dtmf: three-key mode unavailable");
   await page.locator("#dtmf-fft").click();await svgNonblank(page,"dtmf-spectrum");
  }else if(lesson.slug==="sound"){
   await page.locator("#finger-note").selectOption("330");
   await page.locator("#finger-window").selectOption("rect");
   await page.locator("#finger-fft-length").selectOption("4096");
   await svgNonblank(page,"finger-spectrum");
   await page.locator("#finger-guess").selectOption("piano");await page.locator("#finger-guess-check").click();
   check(await page.locator("#finger-reveal-btn").isEnabled(),"sound: prediction not recorded");
   await page.locator("#finger-reveal-btn").click();
   check(await page.locator("#finger-reveal-content").isVisible(),"sound: FFT fingerprint reveal did not work");
   check((await page.locator("#finger-compare").innerText()).length>35,"sound: comparison empty");
   await page.locator("#finger-quiz").selectOption("harmonics");await page.locator("#finger-quiz-check").click();
   check((await page.locator("#finger-quiz-feedback").innerText()).length>5,"sound: quiz not graded");
  }else if(lesson.slug==="upload"){
   await page.locator("#fft-upload-demo").click();
   await svgNonblank(page,"fft-upload-wave");await svgNonblank(page,"fft-upload-spectrum");
   check((await page.locator("#fft-upload-stats").innerText()).includes("Hz"),"upload: demo frequency units missing");
   await page.locator("#fft-upload-fs").fill("0");await page.locator("#fft-upload-fs").dispatchEvent("change");
   check((await page.locator("#fft-upload-stats").innerText()).includes("cycles/sample"),"upload: unknown sampling rate incorrectly uses Hz");
   await page.locator("#fft-upload-answer").click();
   check((await page.locator("#fft-upload-feedback").innerText()).includes("cycles/sample"),"upload: normalized-frequency explanation missing");
   await page.locator("#fft-upload-harmonic-demo").click();
   check((await page.locator("#fft-upload-harmonic-result").innerText()).length>5,"upload: harmonic discovery absent");
   await page.locator("#fft-upload-harmonic-mode").selectOption("manual");
   await page.locator("#fft-upload-manual-f0").fill("128");
   check((await page.locator("#fft-upload-manual-row").isVisible()),"upload: manual fundamental hidden");
   const data=Array.from({length:2048},(_,n)=>[n/1024,(Math.sin(2*Math.PI*64*n/1024)).toFixed(6)].join(",")).join("\n");
   await page.locator("#fft-upload-file").setInputFiles({name:"sensor-64hz.csv",mimeType:"text/csv",buffer:Buffer.from("time_s,value\n"+data)});
   await page.waitForFunction(()=>document.querySelector("#fft-upload-meta")?.textContent?.includes("sensor-64hz.csv"),{timeout:10000});
   check(await page.locator("#fft-upload-wave").isVisible(),"upload: sensor graph missing");
   await svgNonblank(page,"fft-upload-spectrum");
  }else if(lesson.slug==="chirp"){
   check(await page.locator("#stft-spectrogram").isVisible(),"chirp: spectrogram not shown");
   check(await page.locator("#stft-spectrogram rect").count()>20,"chirp: spectrogram no time-frequency cells");
   const first=await page.locator("#stft-frame").inputValue();
   await page.locator("#stft-next").click();
   check((await page.locator("#stft-frame").inputValue())!==first,"chirp: next frame not working");
   await page.locator("#stft-shape").selectOption("falling");
   await page.locator("#stft-window-type").selectOption("rect");
   await page.locator("#stft-compare-kind").selectOption("overlap");
   await svgNonblank(page,"stft-spectrogram");await svgNonblank(page,"stft-compare-a");
   await setRange(page,"stft-frame",await page.locator("#stft-frame").getAttribute("max"));
   await page.locator("#stft-mission-check").click();
   check((await page.locator("#stft-mission-feedback").innerText()).length>10,"chirp: mission no feedback");
  }
  console.log("PASS "+lesson.slug+": lab-specific controls, results and assessment");
  await page.locator("#"+lesson.lang).selectOption("en");
  await theme.selectOption("neutral-dark");
  await capture(page,lesson.slug+"-desktop-dark");
  await theme.selectOption("white-clean");
  await capture(page,lesson.slug+"-desktop-white");
  await page.setViewportSize({width:390,height:844});
  const mobile=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  check(mobile.width<=mobile.viewport+3,lesson.slug+": mobile horizontal overflow: "+JSON.stringify(mobile));
  await capture(page,lesson.slug+"-mobile");
  check(errors.length===0,lesson.slug+": uncaught JavaScript errors: "+errors.join(" | "));
  allErrors.push(...errors.map(e=>lesson.slug+": "+e));
  console.log("PASS "+lesson.slug+": 390px mobile, two themes, screenshots, no page errors");
  await page.close();page=null;
 }
 console.log("ALL SIX FFT APPLICATIONS BROWSER QA CHECKS PASSED");
}catch(error){
 try{if(page&&!page.isClosed())await page.screenshot({path:path.join(artifacts,"failure-state.png"),fullPage:true,timeout:12000})}catch(e){console.error("Cannot capture failure screenshot",e.message)}
 throw error;
}finally{await page?.close();await browser.close()}
