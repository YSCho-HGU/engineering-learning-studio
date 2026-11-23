import {chromium} from "@playwright/test";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const failures=[];
const assert=(v,msg)=>{if(!v)throw Error(msg)};
const near=(a,b,t)=>Math.abs(a-b)<=t;
function makeWav(fs=8000,frequency=440,seconds=1){
 const count=Math.round(fs*seconds),bytes=Buffer.alloc(44+count*2);
 bytes.write("RIFF",0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write("WAVE",8);
 bytes.write("fmt ",12);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);
 bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(fs,24);bytes.writeUInt32LE(fs*2,28);
 bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write("data",36);
 bytes.writeUInt32LE(count*2,40);
 for(let n=0;n<count;n++)bytes.writeInt16LE(Math.round(.7*32767*Math.sin(2*Math.PI*frequency*n/fs)),44+2*n);
 return bytes;
}
try{
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto(base+"/signals-systems/applications.html#part-c",{waitUntil:"domcontentloaded"});
   const card=page.locator("#topics-c .ss-app-topic").filter({hasText:"FFT of Real Audio, Music & Sensor Data"});
   assert(await card.count()===1,"Real FFT lab card missing");
   assert(await card.locator('a[href="./applications-fft-upload.html"]').count()===1,"FFT upload link missing");
   await page.goto(base+"/signals-systems/applications-fft-upload.html",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>!!window.SSRealFFT,{timeout:15000});
   const pure=await page.evaluate(()=>{
    const api=window.SSRealFFT;
    const values=Float64Array.from({length:1024},(_,n)=>.8*Math.sin(2*Math.PI*128*n/1024));
    const unknown=api.analyze(values,{N:1024,fs:null,window:"rect"});
    const known=api.analyze(values,{N:1024,fs:512,window:"rect"});
    const csv=api.parseCSV("time_s,value\n"+Array.from({length:1024},(_,n)=>(n/512)+","+Math.sin(2*Math.PI*64*n/512)).join("\n"));
    const unlabelled=api.parseCSV(Array.from({length:1024},(_,n)=>Math.sin(2*Math.PI*64*n/512)).join("\n"));
    return {bin:unknown.peakBin,unknownFreq:unknown.peakFreq,knownFreq:known.peakFreq,amplitude:known.peakAmplitude,
      inferredFs:csv.fs,csvLen:csv.samples.length,noFs:unlabelled.fs===null};
   });
   assert(pure.bin===128&&near(pure.unknownFreq,.125,1e-9),"Normalized frequency wrong "+JSON.stringify(pure));
   const multiplePeaks=await page.evaluate(()=>{
     const samples=Float64Array.from({length:1024},(_,n)=>.7*Math.sin(2*Math.PI*64*n/1024)+.3*Math.sin(2*Math.PI*192*n/1024));
     const r=window.SSRealFFT.analyze(samples,{N:1024,fs:512,window:"rect"});
     return r.topPeaks.slice(0,2).map(x=>({bin:x.bin,freq:x.frequency,amplitude:x.amplitude}));
   });
   assert(multiplePeaks.length===2&&multiplePeaks[0].bin===64&&multiplePeaks[1].bin===192,"Multiple audio harmonic peaks missing "+JSON.stringify(multiplePeaks));

   assert(near(pure.knownFreq,64,1e-9)&&near(pure.amplitude,.8,1e-6),"FFT amplitude/Hz wrong "+JSON.stringify(pure));
   assert(near(pure.inferredFs,512,1e-5)&&pure.noFs&&pure.csvLen===1024,"CSV sampling-rate inference incorrect "+JSON.stringify(pure));
   const ambiguous=await page.evaluate(()=>{
    const csv="timestamp,value\n"+Array.from({length:1024},(_,n)=>(1700000000000+n*2)+","+Math.sin(2*Math.PI*64*n/1024)).join("\n");
    const parsed=window.SSRealFFT.parseCSV(csv);
    return {fs:parsed.fs,reason:parsed.reason};
   });
   assert(ambiguous.fs===null&&ambiguous.reason==="ambiguous-time-unit","Ambiguous timestamp inferred a false Hz scale "+JSON.stringify(ambiguous));

   const csv="time_s,value,secondary\n"+Array.from({length:2048},(_,n)=>{
     const f=n<1024?64:96;return(n/512)+","+Math.sin(2*Math.PI*f*n/512)+","+Math.sin(2*Math.PI*40*n/512);
   }).join("\n");
   await page.locator("#fft-upload-file").setInputFiles({name:"sensor.csv",mimeType:"text/csv",buffer:Buffer.from(csv)});
   await page.waitForFunction(()=>window.SSRealFFT?.analysis?.fs===512);
   const first=await page.evaluate(()=>({peak:window.SSRealFFT.analysis.peakFreq,points:document.querySelectorAll("#fft-upload-spectrum path").length}));
   assert(near(first.peak,64,1e-5)&&first.points===1,"CSV first segment spectrum wrong "+JSON.stringify(first));
   assert(await page.locator("#fft-upload-peaks .ss-fft-upload-peak").count()>0,"Top peaks table missing");
   assert(await page.locator("#fft-upload-column-row").isVisible(),"Multi-column sensor chooser not shown");
   await page.locator("#fft-upload-column").selectOption("secondary");
   assert(near(await page.evaluate(()=>window.SSRealFFT.analysis.peakFreq),40,1e-5),"Secondary sensor channel not selected");
   await page.locator("#fft-upload-column").selectOption("value");
   assert(near(await page.evaluate(()=>window.SSRealFFT.analysis.peakFreq),64,1e-5),"Sensor channel did not restore");

   await page.locator("#fft-upload-location").evaluate(el=>{el.value="1000";el.dispatchEvent(new Event("input",{bubbles:true}))});
   assert(near(await page.evaluate(()=>window.SSRealFFT.analysis.peakFreq),96,1e-5),"CSV selected segment not updated");
   await page.locator("#fft-upload-fs").fill("0");
   await page.locator("#fft-upload-fs").dispatchEvent("input");
   const normalized=await page.evaluate(()=>({unit:window.SSRealFFT.analysis.freqUnit,peak:window.SSRealFFT.analysis.peakFreq}));
   assert(normalized.unit==="cycles/sample"&&near(normalized.peak,96/512,1e-9),"Unknown fs normalization failed");
   await page.locator("#fft-upload-answer").click();
   assert((await page.locator("#fft-upload-feedback").innerText()).includes("cycles/sample"),"Unknown fs explanation missing");
   await page.locator("#fft-upload-file").setInputFiles({name:"speech.wav",mimeType:"audio/wav",buffer:makeWav()});
   await page.waitForFunction(()=>window.SSRealFFT?.analysis?.fs>0&&document.querySelector("#fft-upload-meta")?.textContent.includes("speech.wav"),{timeout:20000});
   const audio=await page.evaluate(()=>({peak:window.SSRealFFT.analysis.peakFreq,fs:window.SSRealFFT.analysis.fs,kind:document.querySelector("#fft-upload-meta").textContent}));
   assert(Math.abs(audio.peak-440)<audio.fs/1024*2,"Audio FFT peak mismatch "+JSON.stringify(audio));
   assert(audio.kind.includes("speech.wav"),"Audio file metadata absent");
   const harmonicNumerics=await page.evaluate(()=>{
     const api=window.SSRealFFT,h=window.SSFFTHarmonics;
     const fs=4096,N=4096,f0=64;
     function synth(orderList,amps){
       return Float64Array.from({length:N},(_,n)=>orderList.reduce((sum,order,j)=>sum+
         amps[j]*Math.sin(2*Math.PI*order*f0*n/fs),0));
     }
     const normal=h.analyzeHarmonics(api.analyze(synth([1,2,3,4],[1,.5,.3,.2]),{N,fs,window:"rect"}));
     const weak=h.analyzeHarmonics(api.analyze(synth([1,2,3,4],[.1,1,.7,.3]),{N,fs,window:"rect"}));
     const missing=h.analyzeHarmonics(api.analyze(synth([2,3,4,5],[1,.7,.4,.2]),{N,fs,window:"rect"}));
     const single=h.analyzeHarmonics(api.analyze(synth([1],[1]),{N,fs,window:"rect"}));
     const unrelated=h.analyzeHarmonics(api.analyze(synth([1,1.75],[1,.7]),{N,fs,window:"rect"}));
     const unknown=h.analyzeHarmonics(api.analyze(synth([2,3,4,5],[1,.7,.4,.2]),{N,fs:null,window:"rect"}));
     return {
       normal:[normal.candidate?.frequency,normal.status,normal.candidate?.matches.length],
       weak:[weak.candidate?.frequency,weak.status,weak.dominantPeak?.frequency],
       missing:[missing.candidate?.frequency,missing.status,missing.candidate?.hasFundamental,missing.candidate?.matches.length],
       single:single.status,unrelated:unrelated.status,
       unknown:[unknown.candidate?.frequency,unknown.unit]
     };
   });
   assert(near(harmonicNumerics.normal[0],64,1e-5)&&harmonicNumerics.normal[1]==="pattern"&&harmonicNumerics.normal[2]>=4,
      "Harmonic series f0 incorrect "+JSON.stringify(harmonicNumerics));
   assert(near(harmonicNumerics.weak[0],64,1e-5)&&near(harmonicNumerics.weak[2],128,1e-5),
      "Strongest harmonic confused with fundamental "+JSON.stringify(harmonicNumerics));
   assert(near(harmonicNumerics.missing[0],64,1e-5)&&harmonicNumerics.missing[1]==="pattern"&&
      harmonicNumerics.missing[2]===false&&harmonicNumerics.missing[3]>=3,
      "Missing fundamental inference incorrect "+JSON.stringify(harmonicNumerics));
   assert(harmonicNumerics.single==="insufficient"&&harmonicNumerics.unrelated!=="pattern",
      "Single/unrelated tones overclaimed as definite harmonics");
   assert(near(harmonicNumerics.unknown[0],64/4096,1e-9)&&harmonicNumerics.unknown[1]==="cycles/sample",
      "Unknown fs harmonic estimate invented an Hz scale");
   await page.locator("#fft-upload-harmonic-demo").click();
   await page.waitForFunction(()=>document.querySelectorAll("#fft-upload-harmonic-table .ss-fft-harmonic-row").length>=4);
   const lesson=await page.evaluate(()=>({
     fundamental:window.SSFFTHarmonics.analyzeHarmonics(window.SSRealFFT.analysis).candidate?.frequency,
     strongest:window.SSRealFFT.analysis.peakFreq,
     markerCount:document.querySelectorAll("#fft-upload-spectrum .ss-fft-harmonic-marker").length,
     f0Count:document.querySelectorAll("#fft-upload-spectrum .ss-fft-harmonic-f0").length
   }));
   assert(near(lesson.fundamental,128,4)&&near(lesson.strongest,256,4)&&lesson.markerCount>=2&&lesson.f0Count===1,
     "Weak-fundamental live demo incorrectly rendered "+JSON.stringify(lesson));
   await page.locator("#fft-upload-harmonic-mode").selectOption("manual");
   await page.locator("#fft-upload-manual-f0").fill("128");
   assert((await page.locator("#fft-upload-harmonic-result").innerText()).includes("128"),
      "Manual f0 hypothesis not applied");
   await page.locator("#fft-upload-harmonic-mode").selectOption("auto");
   assert(await page.locator("#fft-upload-manual-row").isHidden(),"Manual input did not hide");
   for(const language of ["en","ko","mixed"]){
    await page.locator("#fft-upload-language").selectOption(language);
    const label=await page.locator("#fft-upload-title").innerText();
    assert(language==="en"?!/[가-힣]/.test(label):/[가-힣]/.test(label),"Language failed "+language);
   }
   for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
    await page.locator("[data-els-theme-picker]").selectOption(theme);
    assert(await page.locator("html").getAttribute("data-els-theme")===theme,"Theme failed "+theme);
   }
   const math=await page.evaluate(()=>window.SSMathCore?.auditVisible?.());
   assert(math?.total>=2&&math.errors===0&&math.missing===0,"FFT upload KaTeX error "+JSON.stringify(math));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=8,"Horizontal page overflow "+width);
   if(width===1366){
    await page.locator("#ss-presentation-toggle").click();
    assert(await page.locator("#ss-presentation-toggle").getAttribute("aria-pressed")==="true","Presentation mode missing");
    await page.keyboard.press("Escape");
    assert(await page.locator("#ss-presentation-toggle").getAttribute("aria-pressed")==="false","Presentation Escape missing");
   }
   assert(errors.length===0,"JavaScript errors "+errors.join(";"));
   console.log("PASS real audio/sensor FFT",width,JSON.stringify({pure,audio}));
  }catch(e){failures.push(width+": "+String(e.message||e))}
  finally{await page.close()}
 }
}finally{await browser.close()}
for(const error of failures)console.error("FAIL",error);
if(failures.length)process.exitCode=1;
