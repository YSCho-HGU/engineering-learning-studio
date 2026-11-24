/* End-to-end shared header contract: navigation, 34px control grid,
   language/theme persistence, mobile geometry and console errors. */
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {chromium} from "playwright";
const port=8798,base="http://127.0.0.1:"+port+"/";
const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{stdio:"ignore"});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
await sleep(1300);
const browser=await chromium.launch({headless:true});
const pages=["","c-programming/","signals-systems/index.html#overview","signals-systems/index.html#map",
 ...Array.from({length:8},(_,i)=>"signals-systems/chapter"+(i+1)+".html"),
 "signals-systems/applications.html","signals-systems/applications-fft-image.html"];
const themes=["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"];
const failures=[];
async function test(view,width){
 const context=await browser.newContext({viewport:{width,height:900}});
 await context.addInitScript(()=>{if(!sessionStorage.getItem("els-header-contract-initialized")){localStorage.setItem("els-language","en");localStorage.setItem("els-theme-v2","neutral-dark");localStorage.setItem("els-header-test-preserve","keep");sessionStorage.setItem("els-header-contract-initialized","1");}});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 try{
  const response=await page.goto(base+view,{waitUntil:"domcontentloaded",timeout:45000});
  assert.equal(response?.status(),200,"HTTP 200");
  await page.waitForFunction(()=>window.ELSTheme&&window.ELSHeaderControls,{timeout:20000});
  const data=await page.evaluate(()=>{
   const header=document.querySelector(".ss-common-header,.site-header,body > header");
   const lang=header?.querySelector("#lang,#c-language,.ss-common-language-select,#ss-language-select");
   const theme=header?.querySelector("[data-els-theme-picker]");
   const chapter=header?.querySelector(".ss-common-menu>summary");
   const arrows=[...header?.querySelectorAll(".ss-four-navigation .ss-chapter-arrow")||[]];
   const rect=x=>{const r=x.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
   return {language:lang?.value,theme:theme?.value,choices:[...theme?.options||[]].map(x=>x.value),
    globe:header?.querySelector(".els-header-language-icon,.ss-language-icon")?.textContent.trim(),
    langRect:lang?rect(lang):null,themeRect:theme?rect(theme):null,chapterRect:chapter?rect(chapter):null,
    arrowRects:arrows.map(rect),arrowSvgs:arrows.map(x=>x.querySelectorAll("svg path").length),
    arrowLabels:arrows.map(x=>x.getAttribute("aria-label")),
    arrowTargets:arrows.map(x=>x.getAttribute("href")),
    arrowDisabled:arrows.map(x=>x.getAttribute("aria-disabled")==="true"),
    headerRight:header?rect(header).right:0,
    horizontalOverflow:document.documentElement.scrollWidth-window.innerWidth,
    preserved:localStorage.getItem("els-header-test-preserve")};
  });
  assert.equal(data.preserved,"keep","unrelated browser storage preserved");
  assert.equal(data.globe,"🌐","language icon");
  assert.equal(data.language,"en","language preference");
  assert.equal(data.theme,"neutral-dark","theme preference");
  assert.deepEqual(data.choices,themes,"light-to-dark choices");
  for(const [name,rect] of [["language",data.langRect],["theme",data.themeRect]]){
   assert.ok(rect,name+" missing");
   assert.ok(Math.abs(rect.h-34)<=1.5,name+" height "+rect.h);
  }
  if(view.startsWith("signals-systems/chapter")){
   assert.ok(data.chapterRect,"chapter picker missing");
   assert.ok(Math.abs(data.chapterRect.h-34)<=1.5,"chapter height "+data.chapterRect.h);
   assert.equal(data.arrowRects.length,4,"four navigation arrows");
   for(const [i,r] of data.arrowRects.entries()){
    assert.ok(Math.abs(r.w-34)<=1.5&&Math.abs(r.h-34)<=1.5,"arrow "+i+" dimensions "+JSON.stringify(r));
    assert.ok(data.arrowSvgs[i]>=1,"arrow "+i+" must be SVG");
    assert.ok(data.arrowLabels[i],"accessible arrow label "+i);
   }
   const ch=Number(view.match(/chapter(\d+)/)[1]);
   assert.equal(data.arrowTargets[0],ch===1?null:"./chapter"+(ch-1)+".html","previous chapter target");
   assert.equal(data.arrowTargets[3],ch===8?"./applications.html":"./chapter"+(ch+1)+".html","next chapter target");
   assert.equal(data.arrowDisabled[0],ch===1,"first chapter boundary");
  }
  // Check the actual selected theme stays synchronized between DOM, picker, storage.
  await page.locator("[data-els-theme-picker]").selectOption("warm-neutral");
  await page.waitForFunction(()=>document.documentElement.dataset.elsTheme==="warm-neutral");
  assert.equal(await page.evaluate(()=>localStorage.getItem("els-theme-v2")),"warm-neutral");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>window.ELSHeaderControls&&window.ELSTheme);
  assert.equal(await page.locator("[data-els-theme-picker]").inputValue(),"warm-neutral","theme persisted after reload");
  assert.ok(data.horizontalOverflow<=3,"page horizontal overflow "+data.horizontalOverflow);
  assert.deepEqual(errors,[],"runtime errors");
  console.log("PASS "+width+"px "+(view||"Studio Home"));
 }finally{await context.close();}
}
try{
 for(const width of [390,768,1280])for(const view of pages){
  try{await test(view,width)}catch(e){failures.push({view,width,error:e.message});console.error("FAIL "+width+"px "+view+": "+e.message);}
 }
 assert.deepEqual(failures,[],"Shared header regression failures");
}finally{await browser.close();server.kill();}
