import assert from "node:assert/strict";
import {chromium} from "playwright";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const cases=[
 {name:"SS Chapter 1",url:"/signals-systems/chapter1.html",nav:".ss-layout-sidebar nav button",target:".ss-layout-main"},
 {name:"SS Chapter 2",url:"/signals-systems/chapter2.html",nav:".ss-layout-sidebar nav button",target:".ss-layout-main"},
 {name:"SS Chapter 3",url:"/signals-systems/chapter3.html",nav:".ss-layout-sidebar nav button",target:".ss-layout-main"},
 {name:"SS Chapter 4",url:"/signals-systems/chapter4.html",nav:".ss-layout-sidebar nav button",target:".ss-layout-main"},
 {name:"SS Chapter 5",url:"/signals-systems/chapter5.html",nav:".ss-layout-sidebar nav button",target:".ss-layout-main"},
 {name:"SS Chapter 6",url:"/signals-systems/chapter6.html",nav:".ss-layout-sidebar nav button",target:".ss-layout-main"},
 {name:"SS Chapter 7",url:"/signals-systems/chapter7.html",nav:".ss-layout-sidebar nav button",target:".ss-layout-main"},
 {name:"SS Chapter 8",url:"/signals-systems/chapter8.html",nav:".ss-layout-sidebar nav button",target:".ss-layout-main"},
 {name:"C Arrays",url:"/c-programming/arrays/",nav:"#lesson-nav button[data-lesson]",target:"#lesson"},
 {name:"C functions",url:"/c-programming/functions/",nav:"#lesson-nav button[data-lesson]",target:"#lesson"},
 {name:"C strings",url:"/c-programming/strings/",nav:"#lesson-nav button[data-lesson]",target:"#lesson"},
 {name:"C structure",url:"/c-programming/structure/",nav:"#lesson-nav button[data-lesson]",target:"#lesson"},
 {name:"C pointer",url:"/c-programming/pointer/",nav:"#lesson-nav button[data-lesson]",target:"#lesson"},
 {name:"C standard-library",url:"/c-programming/standard-library/",nav:"#lesson-nav button[data-lesson]",target:"#lesson"},
 {name:"C dynamic-memory",url:"/c-programming/dynamic-memory/",nav:"#lesson-nav button[data-lesson]",target:"#lesson"},
 {name:"C File I/O",url:"/c-programming/file-io/",nav:"#lesson-nav button[data-nav]",target:"#lesson"},
 {name:"C Low-Level",url:"/c-programming/low-level-c/",nav:"#lesson-nav button[data-lesson]",target:"#lesson"}
];
const browser=await chromium.launch({headless:true});
const failures=[];
try{
 for(const width of [390,768,1280]){
  const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
  for(const item of cases){
   const page=await ctx.newPage();
   try{
    const response=await page.goto(base+item.url,{waitUntil:"domcontentloaded",timeout:30000});
    assert.equal(response?.status(),200,item.name+" HTTP");
    await page.locator(item.nav).first().waitFor({timeout:15000});
    const buttons=page.locator(item.nav);
    const count=await buttons.count();
    assert.ok(count>=2,item.name+" requires two selectable lessons");
    const choice=buttons.nth(1);
    await choice.scrollIntoViewIfNeeded();
    await choice.click();
    await page.waitForTimeout(420);
    const data=await page.evaluate(sel=>{
     const content=document.querySelector(sel);
     const header=document.querySelector("body > header.ss-common-header,body > header.els-course-header,body > header.site-header");
     const r=content?.getBoundingClientRect();
     return {top:r?.top,bottom:r?.bottom,headerHeight:header?.getBoundingClientRect().height||0,scrollY:window.scrollY};
    },item.target);
    assert.ok(data.top!=null,item.name+" missing content");
    if(width<=800)assert.ok(data.top>=data.headerHeight-18&&data.top<=data.headerHeight+115,
      item.name+" lesson not aligned after mobile selection: "+JSON.stringify(data));
    console.log("PASS",item.name,width,data);
   }catch(e){failures.push(item.name+" "+width+": "+e.message);}
   finally{await page.close();}
  }
  await ctx.close();
 }
}finally{await browser.close();}
assert.deepEqual(failures,[],"Mobile lesson title navigation alignment");
