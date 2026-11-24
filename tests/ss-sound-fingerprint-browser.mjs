import {chromium} from "@playwright/test";
import {mkdir} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const problems=[];
const expect=(value,msg)=>{if(!value)throw Error(msg)};
function wav(fs=16000,f=220,duration=.8){
 const N=Math.round(fs*duration),b=Buffer.alloc(44+2*N);
 b.write("RIFF",0);b.writeUInt32LE(b.length-8,4);b.write("WAVE",8);
 b.write("fmt ",12);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(fs,24);b.writeUInt32LE(fs*2,28);
 b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write("data",36);b.writeUInt32LE(N*2,40);
 for(let i=0;i<N;i++)b.writeInt16LE(Math.round(15000*Math.sin(2*Math.PI*f*i/fs)),44+i*2);
 return b;
}
await mkdir("tests/screenshots",{recursive:true});
try{
 for(const width of [1366,390]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto(base+"/signals-systems/applications.html#part-c",{waitUntil:"domcontentloaded"});
   const card=page.locator('#topics-c a.ss-app-lesson-row[href="./applications-fft-sound-fingerprint.html"]');
   expect(await card.count()===1,"Sound Fingerprint lesson link missing");
   await page.goto(base+"/signals-systems/applications-fft-sound-fingerprint.html",{waitUntil:"domcontentloaded"});
   await page.locator("#finger-spectrum .ss-finger-wave").waitFor({timeout:20000});
   const arithmetic=await page.evaluate(()=>{
    const api=window.SSSoundFingerprint;
    const results={};
    for(const type of ["piano","guitar","voice"]){
     const data=api.synth(type,{f0:220});
     const a=api.analyze(data,{N:4096,f0:220});
     results[type]={length:data.length,delta:a.binHz,strongest:a.dominant.h,
       h1:a.partials[0].share,h5:a.partials[4].share,first:a.partials[0].frequency,
       sum:a.partials.reduce((s,p)=>s+p.share,0),finite:a.partials.every(p=>Number.isFinite(p.amplitude))};
    }
    const other=api.analyze(api.synth("piano",{f0:330}),{N:8192,f0:330});
    results.other={delta:other.binHz,first:other.partials[0].frequency,N:other.N};
    return results;
   });
   expect(["piano","guitar","voice"].every(type=>arithmetic[type].length===14400&&arithmetic[type].finite),"Signal synthesis invalid "+JSON.stringify(arithmetic));
   expect(["piano","guitar","voice"].every(type=>Math.abs(arithmetic[type].delta-16000/4096)<1e-6),"FFT bin spacing incorrect");
   expect(["piano","guitar","voice"].every(type=>Math.abs(arithmetic[type].first-220)<=16000/4096),"Reference frequency does not match");
   expect(["piano","guitar","voice"].every(type=>Math.abs(arithmetic[type].sum-100)<1e-6),"Harmonic profile not normalized");
   expect(arithmetic.piano.strongest===1&&arithmetic.guitar.strongest===1&&arithmetic.voice.strongest>=4,"Fingerprints indistinguishable "+JSON.stringify(arithmetic));
   expect(Math.abs(arithmetic.piano.h1-arithmetic.guitar.h1)>4,"Piano/guitar profiles too similar");
   expect(arithmetic.voice.h5>arithmetic.voice.h1,"Vowel formant not reflected in FFT");
   expect(arithmetic.other.N===8192&&Math.abs(arithmetic.other.first-330)<=arithmetic.other.delta,"Changing pitch failed");
   expect(await page.locator("#finger-reveal-content").isHidden(),"Secret identities revealed on load");
   expect(await page.locator("#finger-reveal-btn").isDisabled(),"Reveal not gated by prediction");
   await page.locator("#finger-play-b").click();
   expect(await page.locator("#finger-play-b").getAttribute("aria-pressed")==="true","Audio selection failed");
   await page.locator("#finger-guess").selectOption("voice");
   await page.locator("#finger-guess-check").click();
   expect(!(await page.locator("#finger-guess-feedback").innerText()).includes("Correct!"),"Prediction revealed answer prematurely");
   expect(await page.locator("#finger-reveal-btn").isDisabled(),"Prediction alone should not unlock reveal");
   const order=await page.evaluate(()=>window.SSSoundFingerprint.state);
   const h=await page.evaluate(()=>{
    const api=window.SSSoundFingerprint,selected=api.state.source;
    const data=api.synth(selected,{f0:Number(document.querySelector("#finger-note").value)});
    return api.analyze(data,{N:Number(document.querySelector("#finger-fft-length").value),f0:Number(document.querySelector("#finger-note").value)}).dominant.h;
   });
   await page.locator("#finger-evidence-choice").selectOption(h===1?"h4":"h1");
   await page.locator("#finger-evidence-check").click();
   expect(await page.locator("#finger-reveal-btn").isDisabled(),"Incorrect FFT evidence unlocked reveal");
   await page.locator("#finger-evidence-choice").selectOption(h===1?"h1":h<=3?"h23":"h4");
   await page.locator("#finger-evidence-check").click();
   expect(await page.locator("#finger-evidence-feedback").getAttribute("data-result")==="correct","Correct FFT evidence rejected");
   expect(await page.locator("#finger-reveal-btn").isEnabled(),"Correct FFT evidence did not unlock reveal");
   await page.locator("#finger-reveal-btn").click();
   expect(await page.locator("#finger-reveal-content").isVisible(),"Comparison not revealed");
   expect(await page.locator("#finger-compare svg").count()===3,"Three spectral fingerprints missing");
   expect(await page.locator("#finger-harmonic-table tbody tr").count()===10,"Harmonic table incomplete");
   expect((await page.locator("#finger-compare").innerText()).includes("Voice-like"),"Sound labels not revealed");
   await page.locator("#finger-quiz").selectOption("harmonics");
   await page.locator("#finger-quiz-check").click();
   expect((await page.locator("#finger-quiz-feedback").innerText()).includes("Correct"),"Correct concept feedback missing");
   await page.locator("#finger-fft-length").selectOption("8192");
   expect((await page.locator("#finger-data").innerText()).includes("1.95"),"Longer FFT bin resolution incorrect");
   await page.locator("#finger-note").selectOption("330");
   expect((await page.locator("#finger-data").innerText()).includes("330 Hz"),"Pitch control failed");
   await page.locator("#finger-reset").click();
   expect(await page.locator("#finger-reveal-content").isHidden()&&await page.locator("#finger-reveal-btn").isDisabled(),"Reset failed to hide solution");
   await page.locator(".ss-finger-real summary").click();
   const clip=wav();
   await page.locator("#finger-piano-file").setInputFiles({name:"real-piano.wav",mimeType:"audio/wav",buffer:clip});
   await page.waitForFunction(()=>document.getElementById("finger-files-status")?.textContent.includes("real-piano.wav"),{timeout:15000});
   const source=await page.evaluate(()=>window.SSSoundFingerprint.state);
   expect(source.source==="guitar"||source.source==="voice"||source.source==="piano","Source state invalid");
   await page.locator("#finger-clear-files").click();
   expect((await page.locator("#finger-files-status").innerText()).includes("Synthetic"),"Reset uploaded files failed");
   for(const l of ["en","ko","mixed"]){
    await page.locator("#finger-language").selectOption(l);
    const title=await page.locator("#finger-title").innerText();
    expect(l==="en"?!/[가-힣]/.test(title):/[가-힣]/.test(title),"Language failed "+l);
   }
   for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
    await page.locator("[data-els-theme-picker]").selectOption(theme);
    expect(await page.locator("html").getAttribute("data-els-theme")===theme,"Theme failed "+theme);
   }
   const math=await page.evaluate(()=>window.SSMathCore?.auditVisible?.());
   expect(math?.total>=2&&math.errors===0&&math.missing===0,"KaTeX error "+JSON.stringify(math));
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=8,"Document overflow "+width);
   if(width===1366){
    await page.locator("#ss-presentation-toggle").click();
    expect(await page.locator("#ss-presentation-toggle").getAttribute("aria-pressed")==="true","Presentation Mode missing");
    await page.keyboard.press("Escape");
    expect(await page.locator("#ss-presentation-toggle").getAttribute("aria-pressed")==="false","Presentation Escape failed");
   }
   expect(errors.length===0,"JS page errors "+errors.join("; "));
   await page.screenshot({path:"tests/screenshots/sound-fingerprint-"+width+".png",fullPage:true});
   console.log("PASS SOUND FINGERPRINT",width+"px",JSON.stringify(arithmetic));
  }catch(e){problems.push(width+": "+(e.stack||e.message||e))}
  finally{await page.close()}
 }
}finally{await browser.close()}
for(const problem of problems)console.error("FAIL",problem);
if(problems.length)process.exitCode=1;
