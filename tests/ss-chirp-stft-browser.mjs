import {chromium} from "@playwright/test";
import {mkdir} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const failures=[];
const check=(ok,message)=>{if(!ok)throw Error(message)};
const near=(a,b,tolerance=1e-6)=>Math.abs(a-b)<=tolerance;
await mkdir("tests/screenshots",{recursive:true});
try{
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto(base+"/signals-systems/applications.html#part-c",{waitUntil:"domcontentloaded"});
   const card=page.locator("#topics-c .ss-app-topic").filter({hasText:"Chirp, STFT, and Spectrogram"});
   check(await card.count()===1,"Part C STFT card missing");
   check(await card.locator('a[href="./applications-chirp-stft.html"]').count()===1,"STFT launch link missing");
   await page.goto(base+"/signals-systems/applications-chirp-stft.html",{waitUntil:"domcontentloaded"});
   await page.locator("#stft-spectrogram rect[fill^='rgb']").first().waitFor({timeout:20000});
   const calculations=await page.evaluate(()=>{
    const api=window.SSChirpSTFT;
    if(!api)return null;
    const result=api.analyze({fs:512,duration:2,f0:20,f1:180,L:128,overlap:75,window:"hann",padding:1});
    const peak=api.fftMagnitudes(Float64Array.from({length:128},(_,n)=>Math.sin(2*Math.PI*32*n/512)),"rect",128);
    const padded=api.analyze({fs:512,duration:2,f0:20,f1:180,L:128,overlap:75,window:"hann",padding:2});
    const maxK=peak.indexOf(Math.max(...peak));
    return {N:result.N,L:result.L,M:result.M,H:result.H,frameCount:result.frameCount,
      binSpacing:result.binSpacing,windowTime:result.windowTime,hopTime:result.hopTime,
      first:result.peaks[0],last:result.peaks.at(-1),knownToneBin:maxK,
      knownToneAmplitude:peak[maxK],paddedGrid:padded.displaySpacing,
      sameWindow:padded.windowTime===result.windowTime,
      sameFrames:padded.frameCount===result.frameCount,
      sameSamples:padded.samples.every((x,i)=>x===result.samples[i])};
   });
   check(calculations?.N===1024&&calculations.L===128&&calculations.M===128&&calculations.H===32,"STFT default length/hop wrong "+JSON.stringify(calculations));
   check(calculations.frameCount===29&&near(calculations.binSpacing,4)&&near(calculations.windowTime,.25)&&near(calculations.hopTime,.0625),"STFT frame spacing wrong");
   check(calculations.knownToneBin===8&&near(calculations.knownToneAmplitude,1,1e-9),"Known single-tone FFT incorrect");
   check(calculations.last>calculations.first+100,"Chirp spectrogram does not rise in frequency");
   check(near(calculations.paddedGrid,2)&&calculations.sameWindow&&calculations.sameFrames&&calculations.sameSamples,"Padding modified observation instead of grid");
   check(await page.locator("#stft-time-plot path.ss-stft-trace").count()===1,"Waveform missing");
   check((await page.locator("#stft-time-plot").innerText()).includes("-1.0"),"Waveform negative-amplitude axis is missing");
   check(await page.locator("#stft-local-plot path.ss-stft-trace").count()===1,"Local FFT missing");
   check(await page.locator("#stft-spectrogram rect[fill^='rgb']").count()>100,"Spectrogram cells missing");
   const before=await page.locator("#stft-frame-value").innerText();
   await page.locator("#stft-next").click();
   check(before!==await page.locator("#stft-frame-value").innerText(),"Moving frame failed");
   await page.locator("#stft-frame").evaluate(el=>{el.value="28";el.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.locator("#stft-frame").dispatchEvent("input");
   await page.locator("#stft-mission-check").click();
   check(await page.locator("#stft-mission-feedback").getAttribute("data-result")==="correct","Graph mission not reachable");
   await page.locator("#stft-window").selectOption("64");
   check((await page.locator("#stft-stats").innerText()).includes("125.0 ms"),"Window duration does not update");
   await page.locator("#stft-overlap").selectOption("50");
   check((await page.locator("#stft-stats").innerText()).includes("62.5 ms"),"Hop does not recompute");
   await page.locator("#stft-fft-factor").selectOption("2");
   check(await page.locator("#stft-spectrogram rect[fill^='rgb']").count()>100,"Padded spectrogram disappeared");
   await page.locator("#stft-reset").click();
   check(await page.locator("#stft-window").inputValue()==="128","Reset didn't restore window");
   for(const language of ["en","ko","mixed"]){
    await page.locator("#stft-language").selectOption(language);
    const title=await page.locator("#stft-title").innerText();
    check(language==="en"?!/[가-힣]/.test(title):/[가-힣]/.test(title),"Language failed "+language);
   }
   for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
    await page.locator("[data-els-theme-picker]").selectOption(theme);
    check(await page.locator("html").getAttribute("data-els-theme")===theme,"Theme failed "+theme);
   }
   const math=await page.evaluate(()=>window.SSMathCore?.auditVisible?.());
   check(math?.total>=4&&math.errors===0&&math.missing===0,"STFT KaTeX error "+JSON.stringify(math));
   const excess=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   check(excess<=8,"Document horizontal overflow "+width+": "+excess);
   if(width===1366){
    await page.locator("#ss-presentation-toggle").click();
    check(await page.locator("#ss-presentation-toggle").getAttribute("aria-pressed")==="true","Presentation mode missing");
    await page.keyboard.press("Escape");
    check(await page.locator("#ss-presentation-toggle").getAttribute("aria-pressed")==="false","Presentation mode Esc failed");
   }
   await page.screenshot({path:"tests/screenshots/stft-"+width+".png",fullPage:true});
   check(errors.length===0,"JS errors: "+errors.join("; "));
   console.log("PASS STFT lab "+width+"px",JSON.stringify(calculations));
  }catch(e){failures.push(width+": "+String(e.message||e))}
  finally{await page.close()}
 }
}finally{await browser.close()}
if(failures.length){for(const error of failures)console.error("FAIL",error);process.exitCode=1}
