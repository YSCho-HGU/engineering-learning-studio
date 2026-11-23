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
   const extended=await page.evaluate(()=>{
    const api=window.SSChirpSTFT;
    const rising=api.analyze({shape:"rising"});
    const falling=api.analyze({shape:"falling"});
    const stepped=api.analyze({shape:"step"});
    const base={fs:512,duration:2,f0:20,f1:180,window:"hann",padding:1,shape:"rising"};
    const [short,long]=api.compareAnalyses(base,"window");
    const [without,withOverlap]=api.compareAnalyses(base,"overlap");
    const stepParams={duration:2,f0:20,f1:180,shape:"step"};
    return {
      risingPeaks:[rising.peaks[0],rising.peaks.at(-1)],
      fallingPeaks:[falling.peaks[0],falling.peaks.at(-1)],
      stepPeaks:[stepped.peaks[0],stepped.peaks.at(-1)],
      stepFs:[stepped.instantaneousFrequency(.5),stepped.instantaneousFrequency(1.5)],
      phaseContinuity:Math.abs(api.signalPhase(1-1e-10,stepParams)-api.signalPhase(1+1e-10,stepParams)),
      window:[short.L,long.L,short.binSpacing,long.binSpacing,short.frameCount,long.frameCount],
      overlap:[without.L,withOverlap.L,without.H,withOverlap.H,without.frameCount,withOverlap.frameCount,without.binSpacing,withOverlap.binSpacing],
      sameSamples:short.samples.every((x,i)=>x===long.samples[i])&&without.samples.every((x,i)=>x===withOverlap.samples[i])
    };
   });
   check(extended.risingPeaks[1]>extended.risingPeaks[0]+90,"Rising chirp ridge incorrect");
   check(extended.fallingPeaks[0]>extended.fallingPeaks[1]+90,"Falling chirp ridge incorrect");
   check(extended.stepPeaks[0]<40&&extended.stepPeaks[1]>150,"Stepped signal FFT ridge incorrect");
   check(extended.stepFs[0]===20&&extended.stepFs[1]===180&&extended.phaseContinuity<1e-6,"Stepped phase continuity incorrect");
   check(JSON.stringify(extended.window)==="[64,256,8,2,61,13]","Short/long window resolution comparison incorrect: "+JSON.stringify(extended.window));
   check(JSON.stringify(extended.overlap)==="[128,128,128,32,8,29,4,4]"&&extended.sameSamples,"Overlap changed observation or bin spacing");
   check(await page.locator("#stft-compare-a rect[fill^='rgb']").count()>100,"Comparison A spectrogram missing");
   check(await page.locator("#stft-compare-b rect[fill^='rgb']").count()>100,"Comparison B spectrogram missing");
   await page.locator("#stft-compare-kind").selectOption("overlap");
   check((await page.locator("#stft-compare-a-stats").innerText()).includes("8 frames") &&
         (await page.locator("#stft-compare-b-stats").innerText()).includes("29 frames"),"Overlap comparison does not reflect frame counts");
   await page.locator("#stft-compare-kind").selectOption("window");
   await page.locator("#stft-shape").selectOption("falling");
   check((await page.locator("#stft-local-help").innerText()).includes("measured local peak"),"Falling chirp local FFT did not redraw");
   await page.locator("#stft-shape").selectOption("step");
   const currentModel=await page.locator("#stft-main [data-ss-math][data-ss-math-display='block']").first().getAttribute("data-ss-math");
   check(currentModel.includes("cases"),"Step signal did not update instantaneous-frequency equation");
   check(await page.locator("#stft-spectrogram rect[fill^='rgb']").count()>100,"Step spectrogram missing");
   await page.locator("#stft-shape").selectOption("rising");
   check(await page.locator("#stft-time-plot path.ss-stft-trace").count()===1,"Waveform missing");
   check((await page.locator("#stft-time-plot").textContent()).includes("-1.0"),"Waveform negative-amplitude axis is missing");
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
    const compareLabel=await page.locator("#stft-compare-title").innerText();
    check(language==="en"?!/[가-힣]/.test(compareLabel):/[가-힣]/.test(compareLabel),"Comparison language failed "+language);
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
