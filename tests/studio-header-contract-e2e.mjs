/* End-to-end shared header contract: navigation, 34px control grid,
   language/theme persistence, mobile geometry and console errors. */
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {chromium} from "playwright";
import {mkdir} from "node:fs/promises";
const port=8798,base="http://127.0.0.1:"+port+"/";
const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{stdio:"ignore"});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
await sleep(1300);
const browser=await chromium.launch({headless:true});
const cModules=["arrays","strings","standard-library","functions","pointer","structure","file-io","dynamic-memory","ai-coding"];
const cViews=cModules.flatMap(slug=>["c-programming/"+slug+"/",...(slug==="ai-coding"?[]:["c-programming/"+slug+"/practice/"])]);
cViews.push("c-programming/file-io/core-labs/","c-programming/ai-coding/toolkit.html");
const pages=["","c-programming/","signals-systems/index.html#overview","signals-systems/index.html#map",
 ...Array.from({length:8},(_,i)=>"signals-systems/chapter"+(i+1)+".html"),
 ...cViews,"signals-systems/applications.html","signals-systems/applications-fft-image.html"];
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
  if(view.startsWith("signals-systems/chapter")||cViews.includes(view)){
   await page.waitForFunction(()=>document.querySelector("body > header.els-course-header .els-course-header-navigation")?.children.length===4,{timeout:20000});
   await page.waitForFunction(()=>getComputedStyle(document.querySelector("body > header.els-course-header")).display==="grid",{timeout:20000});
  }
  const data=await page.evaluate(()=>{
   const header=document.querySelector(".ss-common-header,.site-header,body > header");
   const lang=header?.querySelector("#lang,#c-language,.ss-common-language-select,#ss-language-select,#c-shared-language select");
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
    headerRight:header?rect(header).right:0,headerLeft:header?rect(header).x:0,headerWidth:header?rect(header).w:0,
    headerVersion:header?.dataset.elsHeaderVersion,
    nativeCLanguageCount:header?.querySelectorAll("#c-shared-language select").length||0,
    duplicateCLanguageCount:header?.querySelectorAll(".ss-common-language-select").length||0,
    headerDisplay:header?getComputedStyle(header).display:null,
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
  if(view.startsWith("signals-systems/chapter")||cViews.includes(view)){
   assert.equal(data.headerVersion,"7","shared header composer version");
   assert.equal(data.headerDisplay,"grid","shared layout must be grid");
   const canonicalCss=await page.evaluate(()=>{
    const styles=[...document.styleSheets];
    return styles.some(sheet=>[...(() => {
      try{return sheet.cssRules}catch{return []}
    })()].some(rule=>rule.href?.includes("els-course-header.css"))) ||
      styles.some(sheet=>sheet.href?.includes("els-course-header.css"));
   });
   assert.ok(canonicalCss,"canonical els-course-header.css must be imported directly by course CSS");
   assert.ok(data.chapterRect,"chapter picker missing");
   assert.ok(Math.abs(data.chapterRect.h-34)<=1.5,"chapter height "+data.chapterRect.h);
   assert.equal(data.arrowRects.length,4,"four navigation arrows");
   if(width<=1100){
    assert.ok(data.arrowRects.every(r=>Math.abs(r.y-data.arrowRects[0].y)<2),
      "mobile/tablet: all four arrows must remain on one row");
    assert.ok(data.arrowRects[0].x>=0&&data.arrowRects[3].right<=width+2,
      "mobile/tablet: all four arrows must remain inside the viewport");
    // Responsive navigation is adjacent to the chooser, not viewport-centered.
   }
   assert.equal(await page.evaluate(()=>typeof window.ELSHeaderControls?.makeNavigationArrow),"function",
      "shared header component missing");
   if(width>=1101){
    const gap=data.arrowRects[0].x-data.chapterRect.right;
    assert.ok(gap>=-1&&gap<=28,"arrows must immediately follow chooser; gap="+gap);
    assert.ok(Math.abs(data.arrowRects[0].y-data.chapterRect.y)<=12,
      "chapter chooser and arrows must share a row");
   }
   if(cViews.includes(view)){
    assert.equal(data.nativeCLanguageCount,1,"C must have one native language selector");
    assert.equal(data.duplicateCLanguageCount,0,"C must not have duplicate language selector");
    const geometry=await page.evaluate(()=>{
     const header=document.querySelector("body > .c-ss-header");
     const left=header?.querySelector(".els-header-left");
     return {display:header?getComputedStyle(header).display:null,area:left?getComputedStyle(left).gridArea:null,nav:!!header?.querySelector(".ss-four-navigation.els-course-header-navigation")};
    });
    assert.equal(geometry.display,"grid","C shared header must use canonical grid");
    assert.equal(geometry.area,"left","C chapter/home group must occupy shared left slot");
    assert.ok(geometry.nav,"C adjacent navigation missing");
   }
   for(const [i,r] of data.arrowRects.entries()){
    assert.ok(Math.abs(r.w-34)<=1.5&&Math.abs(r.h-34)<=1.5,"arrow "+i+" dimensions "+JSON.stringify(r));
    assert.ok(data.arrowSvgs[i]>=1,"arrow "+i+" must be SVG");
    assert.ok(data.arrowLabels[i],"accessible arrow label "+i);
   }
   if(view.startsWith("signals-systems/chapter")){const ch=Number(view.match(/chapter(\d+)/)[1]);
   assert.equal(data.arrowTargets[0],ch===1?null:"./chapter"+(ch-1)+".html","previous chapter target");
   assert.equal(data.arrowTargets[3],ch===8?"./applications.html":"./chapter"+(ch+1)+".html","next chapter target");
   assert.equal(data.arrowDisabled[0],ch===1,"first chapter boundary");}
  }
  // Check the actual selected theme stays synchronized between DOM, picker, storage.
  // Keep representative visual evidence for human inspection in CI artifacts.
  if(["c-programming/functions/","signals-systems/chapter5.html"].includes(view)){
   await mkdir("qa/header-screenshots",{recursive:true});
   const key=view.startsWith("c-programming")?"c-functions":"ss-chapter5";
   await page.screenshot({path:"qa/header-screenshots/"+key+"-"+width+".png",fullPage:false});
  }
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
