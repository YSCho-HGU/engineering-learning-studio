import {chromium} from "@playwright/test";
import {mkdir} from "node:fs/promises";
const browser=await chromium.launch({headless:true});
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const failures=[];
function assert(condition,message){if(!condition)throw Error(message)}
await mkdir("tests/screenshots",{recursive:true});
for(const width of [1366,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
 const jsErrors=[];page.on("pageerror",e=>jsErrors.push(e.message));
 try{
  await page.goto(base+"/signals-systems/applications.html#part-c",{waitUntil:"domcontentloaded"});
  const card=page.locator("#topics-c .ss-app-topic").filter({hasText:"DTMF Mystery Decoder"});
  assert(await card.count()===1,"DTMF card missing");
  assert(await card.locator('a[href="./applications-fft-dtmf.html"]').count()===1,"DTMF link missing");
  await page.goto(base+"/signals-systems/applications-fft-dtmf.html?seed=129",{waitUntil:"domcontentloaded"});
  await page.locator("#dtmf-wave .ss-dtmf-trace").waitFor({timeout:15000});
  const computed=await page.evaluate(()=>{
   const api=window.SSDTMF;
   const tests=[];
   for(const digit of "123456789*0#")for(const N of [256,512,1024,2048]){
    const result=api.analyze(api.synth(digit),{N,window:"hann"});
    const expected=api.tones(digit);
    tests.push({digit,N,decoded:result.decoded,low:result.low.frequency,high:result.high.frequency,
      error:Math.max(Math.abs(result.low.frequency-expected.low),Math.abs(result.high.frequency-expected.high)),
      binHz:result.binHz??result.delta});
   }
   return tests;
  });
  assert(computed.length===48,"Not all DTMF × N computations executed");
  assert(computed.every(x=>x.digit===x.decoded),"DTMF recognition differs from standard "+JSON.stringify(computed.filter(x=>x.digit!==x.decoded)));
  assert(computed.filter(x=>x.N===2048).every(x=>x.error<2),"2048-point frequency interpolation inaccurate");
  assert(await page.locator("#dtmf-spectrum").isHidden(),"FFT result should initially be hidden");
  assert(await page.locator("#dtmf-check").isDisabled(),"Check should be gated by spectrum");
  const before=await page.locator("#dtmf-wave").innerHTML();
  await page.locator("#dtmf-start").evaluate(el=>{el.value="85";el.dispatchEvent(new Event("input",{bubbles:true}))});
  assert(before!==(await page.locator("#dtmf-wave").innerHTML()),"Window slider failed");
  await page.locator("#dtmf-fft-n").selectOption("512");
  await page.locator("#dtmf-fft").click();
  assert(await page.locator("#dtmf-spectrum").isVisible(),"FFT spectrum missing");
  assert(await page.locator("#dtmf-peaks .ss-dtmf-peak").count()===2,"Two frequency peaks missing");
  let correct=await page.evaluate(()=>window.SSDTMF.result.decoded);
  const incorrect=correct==="1"?"2":"1";
  await page.locator('#dtmf-keypad button[data-digit="'+incorrect+'"]').click();
  await page.locator("#dtmf-check").click();
  assert(await page.locator("#dtmf-feedback").getAttribute("data-result")==="wrong","Wrong answer accepted");
  assert(!(await page.locator("#dtmf-feedback").innerText()).includes("Correct!"),"Secret leaked on wrong guess");
  await page.locator('#dtmf-keypad button[data-digit="'+correct+'"]').click();
  await page.locator("#dtmf-check").click();
  assert(await page.locator("#dtmf-feedback").getAttribute("data-result")==="correct","Correct answer rejected");
  assert(await page.locator("#dtmf-next").isVisible(),"Challenge next step missing");
  await page.locator("#dtmf-next").click();
  assert((await page.locator("#dtmf-feedback").innerText()).includes("Decoded"),"Single digit challenge did not finish");
  await page.locator("#dtmf-mode").selectOption("sequence");
  assert(await page.locator("#dtmf-challenge-index").innerText()==="1 / 3","Three-digit challenge not initialized");
  for(let j=0;j<3;j++){
   assert(await page.locator("#dtmf-spectrum").isHidden(),"New mystery leaked prior FFT");
   await page.locator("#dtmf-fft").click();
   correct=await page.evaluate(()=>window.SSDTMF.result.decoded);
   await page.locator('#dtmf-keypad button[data-digit="'+correct+'"]').click();
   await page.locator("#dtmf-check").click();
   assert(await page.locator("#dtmf-feedback").getAttribute("data-result")==="correct","Sequence digit "+j+" check failed");
   await page.locator("#dtmf-next").click();
  }
  const result=await page.evaluate(()=>window.SSDTMF.state);
  assert(result.done&&result.correct===3&&result.length===3,"Three key challenge did not complete "+JSON.stringify(result));
  await page.locator("#dtmf-new").click();
  assert(await page.locator("#dtmf-wave .ss-dtmf-trace").count()===1,"New challenge failed");
  for(const lang of ["en","ko","mixed"]){
   await page.locator("#dtmf-language").selectOption(lang);
   const title=await page.locator("#dtmf-title").innerText();
   assert(lang==="en"?!/[가-힣]/.test(title):/[가-힣]/.test(title),"Language mode failed "+lang);
  }
  for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
   await page.locator("[data-els-theme-picker]").selectOption(theme);
   assert(await page.locator("html").getAttribute("data-els-theme")===theme,"Theme failed "+theme);
  }
  const math=await page.evaluate(()=>window.SSMathCore?.auditVisible?.());
  assert(math?.total>=2&&math.errors===0&&math.missing===0,"DTMF KaTeX failed "+JSON.stringify(math));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<=8,"Horizontal overflow "+width+" : "+overflow);
  if(width===1366){
   await page.locator("#ss-presentation-toggle").click();
   assert(await page.locator("#ss-presentation-toggle").getAttribute("aria-pressed")==="true","Presentation Mode not enabled");
   await page.keyboard.press("Escape");
   assert(await page.locator("#ss-presentation-toggle").getAttribute("aria-pressed")==="false","Presentation Esc failed");
  }
  assert(jsErrors.length===0,"JavaScript errors "+JSON.stringify(jsErrors));
  await page.screenshot({path:"tests/screenshots/dtmf-"+width+".png",fullPage:true});
  console.log("PASS DTMF FFT lesson",width+"px","48 numerical checks, mystery and sequence, language and theme");
 }catch(e){failures.push(width+": "+(e.stack||e.message||e))}
 finally{await page.close()}
}
await browser.close();
for(const failure of failures)console.error("FAIL",failure);
if(failures.length)process.exitCode=1;
