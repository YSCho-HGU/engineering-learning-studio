import {chromium} from "@playwright/test";
import {mkdir} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const failures=[];
await mkdir("tests/screenshots",{recursive:true});
const check=(v,msg)=>{if(!v)throw Error(msg)};
const almost=(a,b,tol=1e-6)=>Math.abs(Number(a)-b)<tol;
try{
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:820}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto(base+"/signals-systems/applications.html#part-c",{waitUntil:"domcontentloaded"});
   await page.locator("#topics-c .ss-app-topic").first().waitFor();
   const cards=page.locator("#topics-c .ss-app-topic");
   check(await cards.count()===13,"Part C must have 13 ordered learning topics");
   const first=cards.first();
   check((await first.innerText()).includes("FFT from Sample Data"),"Beginner FFT is not first");
   check(await first.locator('a[href="./applications-fft-lab.html"]').count()===1,"New live FFT lab link missing");
   check(await first.locator("summary").count()===1,"First card lost native summary");
   check(await first.getAttribute("open")!==null,"Working FFT first card should start open");
   await page.waitForFunction(()=>window.SSMathCore?.report?.total>0,{timeout:10000});
   check(await page.locator('#topics-c .ss-app-inline-math').count()>=2,"Card mathematical notation was not converted");
   await page.locator("#ss-app-language").selectOption("en");
   await page.waitForTimeout(100);
   check(await page.locator('#topics-c .ss-app-inline-math').count()>=2,"Math disappeared after English rerender");
   await page.locator("#ss-app-language").selectOption("mixed");
   await page.waitForTimeout(100);
   check(await page.locator('#topics-c .ss-app-inline-math').count()>=2,"Math disappeared after bilingual rerender");
   await page.screenshot({path:"tests/screenshots/fft-catalog-"+width+".png"});
   await page.goto(base+"/signals-systems/applications-fft-lab.html",{waitUntil:"domcontentloaded"});
   await page.locator("#fft-table tbody tr").first().waitFor();
   check(await page.locator("#fft-table tbody tr").count()===9,"N16 real FFT should have 9 nonnegative bins");
   const api=await page.evaluate(()=>{
    const a=window.SSFFTFoundations;
    if(!a)return null;
    const s=a.sampleArray("one"),u=a.analyze(s),known=a.analyze(s,8000),dbl=a.analyze(s,16000);
    return {n:u.n,method:u.method,k:u.best.k,unknown:u.best.hz,peak:known.best.hz,doubled:dbl.best.hz,
      amp:known.best.amplitude,invariant:JSON.stringify(u.X)===JSON.stringify(known.X)};
   });
   check(api?.n===16&&api.method==="FFT"&&api.k===3&&api.unknown===null,"Unknown fs analysis incorrect");
   check(almost(api.peak,1500)&&almost(api.doubled,3000)&&almost(api.amp,1)&&api.invariant,"FFT/frequency ground truth incorrect");
   check((await page.locator("#fft-spectrum-note").innerText()).includes("unknown"),"Unknown fs teaching note missing");
   check(await page.locator("#fft-table thead th").count()===4,"Without fs there should be no Hz table column");
   check(await page.locator("#fft-time-plot line.stem").count()===16,"Time-domain sample stems missing");
   await page.locator("#fft-practice-task").selectOption("bins");
   await page.locator("#fft-preset").selectOption("two");
   await page.locator("#fft-practice-check").click();
   check(await page.locator("#fft-practice-feedback").getAttribute("data-result")==="correct","Unknown-fs graph mission failed");
   await page.locator("#fft-practice-task").selectOption("hz");
   await page.locator("#fft-preset").selectOption("one");
   await page.locator("#fft-checkpoint-answer").selectOption("0");
   await page.locator("#fft-checkpoint-check").click();
   check(await page.locator("#fft-checkpoint-feedback").getAttribute("data-result")==="correct","Unknown-fs concept check failed");
   await page.locator("#fft-known").check();
   await page.locator("#fft-practice-check").click();
   check(await page.locator("#fft-practice-feedback").getAttribute("data-result")==="correct","1500Hz graph mission failed");
   check(!(await page.locator("#fft-fs").isDisabled()),"Known fs field did not activate");
   await page.locator("#fft-checkpoint-answer").selectOption("1");
   await page.locator("#fft-checkpoint-check").click();
   check(await page.locator("#fft-checkpoint-feedback").getAttribute("data-result")==="correct","Known-fs concept check failed");
   check((await page.locator("#fft-table thead").innerText()).includes("f (Hz)"),"Hz table column not enabled");
   check((await page.locator("#fft-metrics").innerText()).includes("1,500"),"Expected k3 => 1500 Hz");
   await page.locator("#fft-fs").fill("16000");
   await page.locator("#fft-fs").dispatchEvent("change");
   check((await page.locator("#fft-metrics").innerText()).includes("3,000"),"Doubling fs must double Hz interpretation");
   await page.locator("#fft-preset").selectOption("two");
   check(await page.locator("#fft-table tbody tr").count()===17,"N32 must yield 17 nonnegative bins");
   await page.locator("#fft-preset").selectOption("leak");
   const leaked=await page.evaluate(()=>window.SSFFTFoundations.analyze(window.SSFFTFoundations.sampleArray("leak")).bins.filter(x=>x.amplitude>.08).length);
   check(leaked>1,"Non-bin-centered sinusoid should leak across several bins");
   await page.locator("#fft-preset").selectOption("pulse");
   check((await page.locator("#fft-metrics").innerText()).includes("Flat"),"An impulse must not be mislabeled as one dominant tone");
   check((await page.locator("#fft-insight").innerText()).includes("equal"),"Flat raw impulse |X[k]| teaching note missing");
   await page.locator("#fft-preset").selectOption("custom");
   await page.locator("#fft-samples").fill("1, 2, 3");
   await page.locator("#fft-run").click();
   check(await page.locator("#fft-error").isVisible(),"Bad sample length should show validation");
   await page.locator("#fft-samples").fill("0 1 0 -1 0 1 0 -1 0 1 0 -1");
   await page.locator("#fft-run").click();
   check(!(await page.locator("#fft-error").isVisible()),"12-point DFT fallback should be accepted");
   check((await page.locator("#fft-sample-source").innerText()).includes("DFT"),"Non-power-of-two fallback not disclosed");
   await page.locator("#fft-reset").click();
   check(await page.locator("#fft-known").isChecked()===false,"Reset should return to unknown fs");
   await page.waitForFunction(()=>window.SSMathCore?.report?.total>=2,{timeout:10000});
   const math=await page.evaluate(()=>window.SSMathCore?.auditVisible?.());
   check(math?.total>=2,"Shared FFT equation rendering not installed");
   check(math.errors===0&&math.missing===0,"FFT formula renderer reported errors: "+JSON.stringify(math));
   if(await page.evaluate(()=>!!window.katex?.render)){
    await page.waitForFunction(()=>window.SSMathCore?.auditVisible?.().rendered===window.SSMathCore?.auditVisible?.().total);
    check(await page.locator(".ss-fft-equation .katex").count()===2,"FFT definitions did not render as KaTeX");
   }
   for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
    await page.locator('[data-els-theme-picker]').selectOption(theme);
    check(await page.locator("html").getAttribute("data-els-theme")===theme,"Broken theme "+theme);
   }
   for(const lang of ["en","ko","mixed"]){
    await page.locator("#ss-fft-language").selectOption(lang);
    const title=await page.locator("#fft-title").innerText();
    check(lang==="en"?!/[가-힣]/.test(title):/[가-힣]/.test(title),"Language mode not reflected in FFT title: "+lang);
   }
   // Follow-up FFT lesson: acquisition duration, leakage, windows and padding.
   await page.goto(base+"/signals-systems/applications-fft-resolution.html",{waitUntil:"domcontentloaded"});
   await page.locator("#fft-r-spectrum path.curve").waitFor();
   await page.waitForFunction(()=>window.SSMathCore?.report?.total>=2);
   const resolutionMath=await page.evaluate(()=>window.SSMathCore?.auditVisible?.());
   check(resolutionMath?.total>=2&&resolutionMath.errors===0&&resolutionMath.missing===0,"Resolution math initialization failed "+JSON.stringify(resolutionMath));
   if(await page.evaluate(()=>!!window.katex?.render)){
     await page.waitForFunction(()=>window.SSMathCore?.auditVisible?.().rendered===window.SSMathCore?.auditVisible?.().total);
     check(await page.locator(".ss-fft-r-theory .katex").count()===2,"Resolution KaTeX formulas not rendered");
   }
   check(await page.locator("#fft-r-challenge-title").isVisible(),"Graph-driven challenge invisible");

   const v=await page.evaluate(()=>{
     const a=window.SSFFTResolution;
     const short=a.analyze({N:64,fs:256,experiment:"resolution"});
     const long=a.analyze({N:128,fs:256,experiment:"resolution"});
     const padded=a.analyze({N:64,fs:256,experiment:"padding",padding:4});
     const off=a.analyze({N:64,fs:256,experiment:"leakage",offset:.35,window:"rect"});
     const tapered=a.analyze({N:64,fs:256,experiment:"leakage",offset:.35,window:"hann"});
     return {shortDf:short.df,longDf:long.df,shortT:short.duration,longT:long.duration,
       paddedDf:padded.df,paddedGrid:padded.grid,paddedT:padded.duration,paddedM:padded.M,
       offBins:off.bins.filter(b=>b.amplitude>.02).length,
       hannBins:tapered.bins.filter(b=>b.amplitude>.02).length};
   });
   check(almost(v.shortDf,4)&&almost(v.longDf,2),"Changing observation N must change nominal bin spacing");
   check(almost(v.shortT,.25)&&almost(v.longT,.5),"Observation time must increase with N");
   check(almost(v.paddedDf,4)&&almost(v.paddedGrid,1)&&almost(v.paddedT,.25)&&v.paddedM===256,"Padding changes only FFT grid, not observation");
   check(await page.locator("#fft-r-spectrum line.true-frequency-guide").count()===2,"Resolution graph needs two true-frequency guides");
   check(await page.locator("#fft-r-spectrum line.fft-bin-guide").count()>0,"FFT bin guides missing");
   await page.locator("#fft-r-quiz-answers").selectOption("0");
   await page.locator("#fft-r-quiz-check").click();
   check(await page.locator("#fft-r-quiz-feedback").getAttribute("data-result")==="correct","Resolution understanding check failed");
   await page.locator("#fft-r-challenge-check").click();
   check(await page.locator("#fft-r-challenge-feedback").getAttribute("data-result")==="incorrect","Resolution default mission must fail");
   await page.locator("#fft-r-n").selectOption("128");
   await page.locator("#fft-r-separation").fill("4");
   await page.locator("#fft-r-separation").dispatchEvent("input");
   await page.locator("#fft-r-challenge-check").click();
   check(await page.locator("#fft-r-challenge-feedback").getAttribute("data-result")==="correct","Resolution mission failed");
   await page.locator("#fft-r-experiment").selectOption("leakage");
   check(await page.locator("#fft-r-spectrum line.true-frequency-guide").count()===1,"Leakage graph requires one true-tone guide");
   await page.locator("#fft-r-quiz-answers").selectOption("0");
   await page.locator("#fft-r-quiz-check").click();
   check(await page.locator("#fft-r-quiz-feedback").getAttribute("data-result")==="correct","Leakage concept check failed");
   await page.locator("#fft-r-n").selectOption("64");
   await page.locator("#fft-r-window").selectOption("hann");
   await page.locator("#fft-r-challenge-check").click();
   check(await page.locator("#fft-r-challenge-feedback").getAttribute("data-result")==="correct","Leakage mission failed");
   await page.locator("#fft-r-experiment").selectOption("padding");
   await page.locator("#fft-r-padding").selectOption("4");
   await page.locator("#fft-r-challenge-check").click();
   check(await page.locator("#fft-r-challenge-feedback").getAttribute("data-result")==="correct","Padding mission failed");
   await page.locator("#fft-r-quiz-answers").selectOption("1");
   await page.locator("#fft-r-quiz-check").click();
   check(await page.locator("#fft-r-quiz-feedback").getAttribute("data-result")==="correct","Zero-padding concept check failed");
   check((await page.locator("#fft-r-stats").innerText()).includes("1 Hz"),"Padding grid metric failed");
   for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
     await page.locator('[data-els-theme-picker]').selectOption(theme);
     check(await page.locator("html").getAttribute("data-els-theme")===theme,"Resolution theme broken");
   }
   for(const lang of ["en","ko","mixed"]){
     await page.locator("#fft-r-language").selectOption(lang);
     const title=await page.locator("#fft-r-title").innerText();
     check(lang==="en"?!/[가-힣]/.test(title):/[가-힣]/.test(title),"Resolution language failed");
   }
   const visual=await page.evaluate(()=>{
     const graph=document.querySelector("#fft-r-spectrum").getBoundingClientRect();
     const controls=document.querySelector(".ss-fft-r-controls").getBoundingClientRect();
     const formulas=[...document.querySelectorAll(".ss-fft-r-theory [data-ss-math]")].map(e=>({
       width:e.getBoundingClientRect().width,scroll:e.scrollWidth,client:e.clientWidth
     }));
     return {graphWidth:graph.width,controlWidth:controls.width,formulas};
   });
   check(visual.graphWidth>200&&visual.controlWidth>200,"FFT graph/controls collapsed "+JSON.stringify(visual));
   const overflowAudit=await page.evaluate(()=>{
      const excess=document.documentElement.scrollWidth-innerWidth;
      const offenders=[...document.querySelectorAll("body *")].filter(el=>{
        const b=el.getBoundingClientRect();
        return b.width>0&&(b.right>innerWidth+6||b.left< -6);
      }).slice(0,14).map(el=>({tag:el.tagName,id:el.id,cls:typeof el.className==="string"?el.className:"",right:Math.round(el.getBoundingClientRect().right),scroll:el.scrollWidth}));
      return{excess,offenders};
   });
   check(overflowAudit.excess<=6,"Resolution lab horizontal overflow: "+JSON.stringify(overflowAudit));
   await page.screenshot({path:"tests/screenshots/fft-resolution-"+width+".png",fullPage:true});
   await page.goto(base+"/signals-systems/applications-fft-lab.html",{waitUntil:"domcontentloaded"});
   await page.locator("#fft-table tbody tr").first().waitFor();
   check((await page.locator("#fft-next-link").getAttribute("href"))==="./applications-fft-resolution.html","Foundation to resolution link missing");
   check(await page.locator("link[href*='ss-fft-lab-standard.css']").count()===1,"Shared FFT style missing");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   check(overflow<=6,"Horizontal overflow at "+width+"px: "+overflow);
   await page.screenshot({path:"tests/screenshots/fft-foundations-"+width+".png",fullPage:true});
   check(errors.length===0,"JS page errors: "+errors.join("; "));
   console.log("PASS FFT foundational lab and math "+width+"px",JSON.stringify({api,math,overflow}));
  }catch(e){failures.push("viewport "+width+": "+String(e.message||e))}
  finally{await page.close()}
 }
}finally{await browser.close()}
if(failures.length){failures.forEach(e=>console.error("FAIL",e));process.exitCode=1}
