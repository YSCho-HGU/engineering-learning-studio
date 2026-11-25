/** Cross-Applications interaction and rendering audit: every live lab at desktop/mobile. */
import assert from "node:assert/strict";
import {chromium} from "playwright";
import {mkdir} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const output="tests/screenshots/applications-comprehensive";
await mkdir(output,{recursive:true});
const cases=[
 {id:"hub",path:"applications.html",expected:".ss-app-part"},
 ...["harmonics","chirp","helix","beats","amfm","sampling"].map(id=>({id:"a-"+id,path:"applications-lab.html?lab="+id,expected:"#ss-al-canvas-1"})),
 {id:"b-rc",path:"applications-system-lab.html?lab=rc",expected:"#ss-sys-canvas-1"},
 {id:"b-moving-average",path:"applications-system-lab.html?lab=moving-average",expected:"#ss-sys-canvas-1"},
 {id:"b-compare",path:"applications-system-compare.html",expected:"#cmp-time"},
 {id:"c-dft-fft",path:"applications-dft-fft.html",expected:"#dft-time-plot"},
 {id:"c-fft-basics",path:"applications-fft-lab.html",expected:"#fft-time-plot"},
 {id:"c-resolution",path:"applications-fft-resolution.html",expected:"#fft-r-time"},
 {id:"c-dtmf",path:"applications-fft-dtmf.html",expected:"#dtmf-wave"},
 {id:"c-fingerprint",path:"applications-fft-sound-fingerprint.html",expected:"#finger-wave"},
 {id:"c-upload",path:"applications-fft-upload.html",expected:"main"},
 {id:"c-image",path:"applications-fft-image.html",expected:"#image-input-canvas"},
 {id:"c-stft",path:"applications-chirp-stft.html",expected:"#stft-time-plot"}
];
const browser=await chromium.launch({headless:true});
const failures=[],results=[];
async function checkOne(context,item,width,mode){
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 try{
  const response=await page.goto(base+"/signals-systems/"+item.path,{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(response?.status(),200,item.id+" HTTP");
  await page.locator(item.expected).first().waitFor({state:"visible",timeout:15000});
  await page.waitForTimeout(350);
  const initial=await page.evaluate(()=>{
   const graphics=[...document.querySelectorAll("main canvas,main svg,.ss-al-root canvas,.ss-app-container svg")]
    .filter(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);
      return b.width>=60&&b.height>=40&&s.display!=="none"&&s.visibility!=="hidden"&&e.closest("[hidden]")==null});
   return {scroll:document.documentElement.scrollWidth,client:innerWidth,
    charts:graphics.length,dimensions:graphics.slice(0,8).map(e=>{const b=e.getBoundingClientRect();return [Math.round(b.width),Math.round(b.height)]}),
    emptyCanvas:graphics.filter(e=>e.tagName.toLowerCase()==="canvas"&&(e.width<2||e.height<2)).length,
    theme:document.documentElement.dataset.elsTheme||"",header:!!document.querySelector("header.ss-common-header")};
  });
  assert.ok(initial.header,item.id+" missing header");
  assert.ok(initial.scroll<=initial.client+12,item.id+" horizontal overflow "+JSON.stringify(initial));
  assert.equal(initial.emptyCanvas,0,item.id+" uninitialized canvas");
  if(!["hub","c-upload"].includes(item.id))assert.ok(initial.charts>=1,item.id+" missing plotted graphic");
  const header=page.locator("header.ss-common-header");
  const lang=header.locator("select.ss-common-language-select").first();
  assert.equal(await lang.count(),1,item.id+" missing language selector");
  const startUrl=page.url();
  await lang.selectOption("en");
  await page.waitForTimeout(80);
  assert.equal(page.url(),startUrl,item.id+" language change unexpectedly navigated");
  const english=await lang.inputValue();
  assert.equal(english,"en",item.id+" English mode selection");
  assert.equal(await page.evaluate(()=>window.ELSLanguage?.get?.()),"en",item.id+" language store updates");
  await lang.selectOption("ko");
  await page.waitForTimeout(80);
  assert.equal(page.url(),startUrl,item.id+" Korean mode unexpectedly navigated");
  assert.equal(await lang.inputValue(),"ko",item.id+" Korean mode selection");
  assert.equal(await page.evaluate(()=>window.ELSLanguage?.get?.()),"ko",item.id+" Korean mode is actually active");
  await lang.selectOption("mixed");
  const theme=header.locator("select[data-els-theme-picker]").first();
  assert.equal(await theme.count(),1,item.id+" missing theme selector");
  for(const choice of ["white-clean","neutral-dark"]){
   await theme.selectOption(choice);
   await page.waitForTimeout(120);
   const actual=await page.evaluate(()=>document.documentElement.dataset.elsTheme);
   assert.equal(actual,choice,item.id+" theme sync");
   assert.equal(await theme.inputValue(),choice,item.id+" theme picker matches active theme");
   assert.equal(page.url(),startUrl,item.id+" theme change unexpectedly navigated");
  }

  // Part A: every signal lab must redraw its primary canvas when a model control changes.
  if(item.id.startsWith("a-")){
   const canvas=page.locator("#ss-al-canvas-1");
   const range=page.locator("#ss-al-control-fields input[type=range]").first();
   if(await range.count()){
    const before=await canvas.evaluate(e=>e.toDataURL());
    await range.evaluate(input=>{
     const lo=Number(input.min),hi=Number(input.max),cur=Number(input.value);
     const next=Math.abs(cur-hi)>1e-8?hi:lo;
     input.value=String(next);
     input.dispatchEvent(new Event("input",{bubbles:true}));
     input.dispatchEvent(new Event("change",{bubbles:true}));
    });
    await page.waitForTimeout(220);
    const afterBitmap=await canvas.evaluate(e=>e.toDataURL());
    assert.notEqual(afterBitmap,before,item.id+" graph does not update when control changes");
   }
   if(item.id==="a-helix"){
    const play=page.locator("#ss-al-play-motion");
    await play.click();
    const running=await play.innerText();
    assert.ok(/Pause|일시/.test(running),item.id+" animation did not start");
    await page.waitForTimeout(220);
    await play.click();
    const paused=await play.innerText();
    assert.ok(/Play|재생/.test(paused),item.id+" animation did not pause");
   }
  }
  const after=await page.evaluate(()=>{
   const main=document.querySelector("main");const graphics=[...document.querySelectorAll("main canvas,main svg,.ss-al-root canvas")];
   return {scroll:document.documentElement.scrollWidth,client:innerWidth,mainWidth:main?.getBoundingClientRect().width,
    zeroPlots:graphics.filter(e=>!e.closest("[hidden]")&&getComputedStyle(e).display!=="none"&&e.getBoundingClientRect().width<2).length};
  });
  assert.ok(after.scroll<=after.client+12,item.id+" post-theme mobile overflow");
  assert.equal(after.zeroPlots,0,item.id+" graphs collapsed after theme/language changes");
  if(errors.length)throw Error(item.id+" uncaught JS errors: "+errors.slice(0,5).join(" | "));
  if(mode==="mobile"&&item.id==="a-helix"){
    const canvas=page.locator("#ss-al-canvas-1");
    const rect=await canvas.boundingBox();
    assert.ok(rect&&rect.width>=240&&rect.width<=width+1,"Helix canvas mobile geometry");
  }
  results.push({id:item.id,width,charts:initial.charts,lang:"PASS",theme:"PASS",layout:"PASS"});
 }catch(err){
  failures.push({id:item.id,width,error:String(err)});
  await page.screenshot({path:output+"/"+item.id+"-"+width+"-failure.png",fullPage:true,animations:"disabled"}).catch(()=>{});
 }finally{await page.close();}
}
try{
 for(const [width,mode] of [[1280,"desktop"],[390,"mobile"]]){
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
  await context.addInitScript(()=>{localStorage.setItem("els-language","mixed");localStorage.setItem("els-theme-v2","neutral-dark")});
  for(const item of cases)await checkOne(context,item,width,mode);
  await context.close();
 }
}finally{await browser.close();}
console.log(JSON.stringify({tested:results.length,expected:cases.length*2,failures,results},null,2));
assert.equal(failures.length,0,"Applications comprehensive browser QA failures");
