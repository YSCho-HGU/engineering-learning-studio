/* Shared Chapter-4 mobile standard: screenshot + geometry + interaction regression.
 * Fails fast on actual clipped controls, sidebar/main overlaps, missing content,
 * or changes to the Chapter-4 navigation style in any chapter.
 */
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
const BASE=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const CHAPTERS=Array.from({length:8},(_,i)=>i+1);
const SIZES=[360,390,430,768];
const NAV={1:"#nav [data-exp]",2:"[data-nav]",3:"[data-nav]",4:"[data-nav]",5:"#tabs [data-lab]",6:"[data-nav]",7:"#ss7-lesson-nav button",8:"#nav [data-exp]"};
const PAIRS={
 1:[".ss-found-23>.ss-found-controls",".ss-found-23>.ss-found-observe"],
 2:[".ss-found-23>.ss-found-controls",".ss-found-23>.ss-found-observe"],
 3:[".ss-found-23>.ss-found-controls",".ss-found-23>.ss-found-observe"],
 4:[".ss-found-23>.ss-found-controls",".ss-found-23>.ss-found-observe"],
 5:["#page>.lab>.panel","#page>.lab>.outputs"],
 6:[".ss6-control-plot-workspace .ss6-step-controls",".ss6-control-plot-workspace .ss6-step-graphs"],
 7:[".ss7-stage-pair>.ss7-stage-change",".ss7-stage-pair>.ss7-stage-observe"],
 8:[".ss8-stage-pair>.ss8-stage-change",".ss8-stage-pair>.ss8-stage-observe"]
};
const THEMES=["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"];
const LANGUAGES=["en","ko","mixed"];
const browser=await chromium.launch({headless:true});
const errors=[],samples=[],geometry={};
let assertions=0;
function check(value,message){assertions++;if(!value)throw Error(message);}
await mkdir("qa/ss-ch4-mobile-standard",{recursive:true});
async function snapshot(page,chapter,width,section){
 return page.evaluate(({chapter,width,section,selectors})=>{
  const root=document.documentElement,layout=document.querySelector(".ss-layout-root"),sidebar=layout?.querySelector(":scope>.ss-layout-sidebar"),main=layout?.querySelector(":scope>.ss-layout-main"),header=document.querySelector(".ss-common-header");
  const r=el=>{if(!el)return null;const b=el.getBoundingClientRect();return {x:b.left,y:b.top,right:b.right,bottom:b.bottom,w:b.width,h:b.height};};
  const crossed=(a,b)=>!!a&&!!b&&Math.min(a.right,b.right)-Math.max(a.x,b.x)>7&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>7;
  const lr=r(layout),hr=r(header),sr=r(sidebar),mr=r(main),a=r(main?.querySelector(selectors[0])),b=r(main?.querySelector(selectors[1]));
  const nav=sidebar?.querySelector("nav:has(> button)"),first=nav?.querySelector("button"),badge=first?.querySelector(".num,.ss7-lab-number,.ss8-lab-number");
  const navstyle=nav?getComputedStyle(nav):null,firststyle=first?getComputedStyle(first):null;
  const menu=header?.querySelector(".ss-common-menu>summary");
  const controls=[header?.querySelector(".ss-common-home"),menu,...(header?.querySelectorAll(".ss-four-navigation>a,.ss-four-navigation>button,.ss-common-actions select")||[])].filter(Boolean).map(e=>({name:e.getAttribute("aria-label")||e.textContent.trim().slice(0,22),rect:r(e)}));
  const visiblePlots=[...(main?.querySelectorAll("canvas,svg")||[])].filter(el=>{
   const b=el.getBoundingClientRect(),s=getComputedStyle(el);
   return b.width>50&&b.height>40&&s.display!=="none"&&s.visibility!=="hidden";
  });
  const plotErrors=visiblePlots.filter(el=>{const b=el.getBoundingClientRect();return b.width<80||b.height<55}).map(el=>el.id||el.tagName);
  return {chapter,width,section,header:hr,sidebar:sr,main:mr,root:lr,controls,
   cssHeader:Number.parseFloat(getComputedStyle(root).getPropertyValue("--ss-layout-header")),
   layoutDisplay:layout?getComputedStyle(layout).display:"",
   gridCols:layout?getComputedStyle(layout).gridTemplateColumns:"",
   collapsed:root.dataset.ssSidebar==="collapsed",
   navCount:nav?.querySelectorAll("button").length||0,
   navRow:{width:first?r(first)?.w:0,height:first?r(first)?.h:0,
    badgeWidth:badge?r(badge)?.w:0,gap:navstyle?.rowGap||"",size:firststyle?.fontSize||"",
    radius:firststyle?.borderTopLeftRadius||"",background:firststyle?.backgroundColor||""},
   sectionText:(main?.innerText||"").trim().length,
   contentTop:mr?.y||0,
   overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
   sideMainOverlap:crossed(sr,mr),stageOverlap:crossed(a,b),
   plotCount:visiblePlots.length,plotErrors};
 },{chapter,width,section,selectors:PAIRS[chapter]});
}
function validate(s,baseline){
 const name="Ch"+s.chapter+" "+s.width+"px section "+s.section;
 check(s.header&&s.sidebar&&s.main&&s.root,name+" missing shell/header/content");
 check(s.navCount>=4,name+" missing lesson navigation");
 check(s.sectionText>120,name+" blank section");
 check(s.overflow<=8,name+" horizontal document overflow "+s.overflow);
 check(!s.sideMainOverlap,name+" sidebar overlaps lesson");
 check(!s.stageOverlap,name+" Change and Observe overlap");
 check(s.plotErrors.length===0,name+" undersized graphic "+s.plotErrors.join(","));
 check(Math.abs(s.cssHeader-s.header.h)<=3,name+" header offset is stale "+s.cssHeader+" vs "+s.header.h);
 check(Math.abs(s.navRow.badgeWidth-30)<=1.5,name+" Chapter4 badge mismatch");
 check(s.navRow.size==="13px",name+" Chapter4 13px navigation font mismatch");
 check(s.navRow.gap==="6px",name+" Chapter4 6px navigation spacing mismatch");
 check(s.navRow.height>=52,name+" navigation tap target too small");
 check(s.navRow.radius===baseline.navRow.radius,name+" sidebar card corner differs from Chapter4");
 if(!String(s.section).startsWith("theme-"))check(s.navRow.background===baseline.navRow.background,name+" sidebar surface differs from Chapter4");
 check(Math.abs(s.header.h-baseline.header.h)<=18,name+" header differs too much from Chapter4");
 for(const c of s.controls){
  if(!c.rect||c.rect.w<2)continue;
  check(c.rect.x>=-3&&c.rect.right<=s.width+3,name+" header control clipped: "+c.name);
  check(c.rect.y>=s.header.y-3&&c.rect.bottom<=s.header.bottom+3,name+" header control outside header: "+c.name);
 }
 for(let i=0;i<s.controls.length;i++)for(let j=i+1;j<s.controls.length;j++){
  const a=s.controls[i].rect,b=s.controls[j].rect;
  const overlapW=Math.min(a.right,b.right)-Math.max(a.x,b.x),overlapH=Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y);
  check(overlapW<=4||overlapH<=4,name+" overlapping header controls "+s.controls[i].name+" / "+s.controls[j].name);
 }
 if(s.width<=600){
  check(s.layoutDisplay==="block",name+" expanded phone sidebar must stack");
  check(s.main.y>=s.sidebar.bottom-2,name+" main overlaps expanded nav");
  check(s.main.x>=-1&&s.main.right<=s.width+2,name+" main spills off phone");
 }else{
  check(s.layoutDisplay==="grid",name+" tablet sidebar must remain in two columns");
  check(s.main.x>=s.sidebar.right-2,name+" tablet main starts under sidebar");
 }
}
try{
 for(const width of SIZES){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:"reduce"});
  // The sidebar value must persist across reload. Do not rewrite it in
  // addInitScript: that would mask persistence bugs and hide the restore button.
  await context.addInitScript(()=>{
   localStorage.setItem("els-language","mixed");
   localStorage.setItem("els-theme-v2","neutral-dark");
  });
  const page=await context.newPage();
  const ref=async()=>{
   await page.goto(BASE+"/signals-systems/chapter4.html",{waitUntil:"domcontentloaded"});
   await page.locator(NAV[4]).first().waitFor({timeout:20000});
   await page.waitForTimeout(180);
   return snapshot(page,4,width,1);
  };
  const reference=await ref();geometry[width]=reference;
  for(const chapter of CHAPTERS){
   const pageErrors=[];const handle=e=>pageErrors.push(e.message);
   page.on("pageerror",handle);
   try{
    // Page already has the Studio origin after the Chapter 4 reference visit.
    await page.evaluate(()=>localStorage.setItem("ss-sidebar-collapsed-v1","0"));
    await page.goto(BASE+"/signals-systems/chapter"+chapter+".html",{waitUntil:"domcontentloaded"});
    const nav=page.locator(NAV[chapter]);await nav.first().waitFor({timeout:20000});
    await page.waitForTimeout(150);
    const count=await nav.count();
    check(count>=4&&count<35,"Ch"+chapter+" invalid count "+count);
    const selected=width===390?Array.from({length:count},(_,i)=>i):[0,Math.floor(count/2),count-1];
    for(const index of [...new Set(selected)]){
     await nav.nth(index).evaluate(el=>el.click());
     await page.waitForTimeout(75);
     const sample=await snapshot(page,chapter,width,index+1);
     validate(sample,reference);
     samples.push({chapter,width,section:index+1,plots:sample.plotCount,overflow:sample.overflow,headerH:Math.round(sample.header.h)});
    }
    if(width===390){
     const lang=page.locator(".ss-common-language-select").first(),theme=page.locator("[data-els-theme-picker]").first();
     for(const mode of LANGUAGES){
      if(await lang.count()){
       await lang.selectOption(mode);await page.waitForTimeout(50);
       const s=await snapshot(page,chapter,width,"language-"+mode);validate(s,reference);
      }
     }
     for(const color of THEMES){
      if(await theme.count()){
       await theme.selectOption(color);await page.waitForTimeout(60);
       const s=await snapshot(page,chapter,width,"theme-"+color);validate(s,reference);
      }
     }
    }
    // Saved state must survive navigation/reload and immediately reveal the lesson.
    await page.locator(".ss-side-toggle").first().evaluate(el=>el.click());
    await page.waitForFunction(()=>document.documentElement.dataset.ssSidebar==="collapsed");
    await page.reload({waitUntil:"domcontentloaded"});
    await page.locator("#ss-sidebar-restore").waitFor({state:"visible",timeout:10000});
    const collapsed=await snapshot(page,chapter,width,"persisted-collapse");
    check(collapsed.collapsed,"Ch"+chapter+" "+width+"px collapsed state was not restored");
    check(collapsed.layoutDisplay==="grid","Ch"+chapter+" "+width+"px collapsed root is not grid");
    check(Math.abs(collapsed.sidebar.w-52)<=2,"Ch"+chapter+" "+width+"px collapsed rail is not 52px");
    check(collapsed.main.x>=collapsed.sidebar.right-2,"Ch"+chapter+" "+width+"px collapsed main below rail");
    check(Math.abs(collapsed.main.y-collapsed.header.bottom)<=4,"Ch"+chapter+" "+width+"px collapsed main not under header");
    check(collapsed.main.w>=width-55,"Ch"+chapter+" "+width+"px collapsed main loses width");
    check(collapsed.overflow<=8,"Ch"+chapter+" "+width+"px collapsed horizontal overflow");
    await page.locator("#ss-sidebar-restore").click();
    await page.waitForFunction(()=>document.documentElement.dataset.ssSidebar==="expanded");
    await page.waitForTimeout(80);
    await page.screenshot({path:"qa/ss-ch4-mobile-standard/ch"+chapter+"-"+width+".png",fullPage:false,animations:"disabled"});
    check(pageErrors.length===0,"Ch"+chapter+" "+width+"px JS errors "+pageErrors.slice(0,4).join(" | "));
   }catch(e){errors.push({chapter,width,error:String(e.message||e)});}
   page.off("pageerror",handle);
  }
  await context.close();
 }
}finally{await browser.close();}
const summary={timestamp:new Date().toISOString(),assertions,samples:samples.length,errors,geometry:Object.fromEntries(Object.entries(geometry).map(([k,s])=>[k,{header:s.header?.h,sidebar:s.sidebar?.w,nav:s.navRow}]))};
await writeFile("qa/ss-ch4-mobile-standard/report.json",JSON.stringify(summary,null,2));
for(const err of errors)console.error("CH4_MOBILE_FAIL "+JSON.stringify(err));
console.log("Chapter4 mobile standard QA",assertions,"assertions,",samples.length,"section states,",errors.length,"failures");
assert.deepEqual(errors,[],"Chapter4 mobile standard regression");
