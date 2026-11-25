import assert from "node:assert/strict";
import {chromium} from "playwright";
import {mkdir} from "node:fs/promises";
await mkdir("tests/screenshots/mobile-navigation",{recursive:true});
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
 {name:"C Low-Level",url:"/c-programming/low-level-c/",nav:"#lesson-nav button[data-lesson]",target:"#lesson"},
 {name:"C AI Coding",url:"/c-programming/ai-coding/",nav:"#lesson-nav button",target:"#lesson"},
 {name:"SS Applications topics",url:"/signals-systems/applications.html",nav:"#part-d details.ss-app-abd-planned > summary",target:"#part-d details.ss-app-abd-planned"}
];
const browser=await chromium.launch({headless:true});
const failures=[];
try{
 for(const width of [320,390,768,1280]){
  const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
  for(const item of cases){
   const page=await ctx.newPage();
   try{
    const response=await page.goto(base+item.url,{waitUntil:"domcontentloaded",timeout:30000});
    assert.equal(response?.status(),200,item.name+" HTTP");
    await page.locator(item.nav).first().waitFor({timeout:15000});
    const buttons=page.locator(item.nav);
    const count=await buttons.count();
    assert.ok(count>=1,item.name+" requires a selectable lesson");
    const choice=buttons.nth(Math.min(1,count-1));
    if(width<=800){
      const toggle=page.locator(".ss-mobile-index-toggle:visible").first();
      if(await toggle.count() && (await toggle.getAttribute("aria-expanded"))!=="true")await toggle.click();
    }
    await choice.evaluate(el=>{
      for(let node=el.parentElement;node;node=node.parentElement){
        if(node.tagName==="DETAILS")node.open=true;
      }
    });
    await choice.scrollIntoViewIfNeeded();
    const desktopBefore=await page.evaluate(()=>window.scrollY);
    await choice.click();
    await page.waitForTimeout(420);
    const data=await page.evaluate(sel=>{
     const content=document.querySelector(sel);
     const header=document.querySelector("body > header.ss-common-header,body > header.els-course-header,body > header.site-header");
     const r=content?.getBoundingClientRect();
     return {top:r?.top,bottom:r?.bottom,headerHeight:header?.getBoundingClientRect().height||0,scrollY:window.scrollY};
    },item.target);
    assert.ok(data.top!=null,item.name+" missing content");
    const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,
      title:document.querySelector("#lesson h1,#lesson h2,.ss-layout-main h1,.ss-layout-main h2")?.getBoundingClientRect().top??null}));
    assert.ok(layout.scrollWidth<=width+10,item.name+" horizontal overflow: "+JSON.stringify(layout));
    if(width>800)assert.equal(await page.locator("#els-mobile-open-lessons:visible").count(),0,
      item.name+" desktop should not display mobile lessons control");
    // Desktop course scripts may legitimately scroll to top themselves; the shared
    // mobile handler is gated off above 800px and must not add its own controls.
    if(width>800)console.log("DESKTOP native course scroll",item.name,desktopBefore,data.scrollY);

    const visual=await page.evaluate(sel=>{
      const root=document.querySelector(sel),heading=root?.querySelector("h1,h2,h3");
      const paragraph=root?.querySelector("p"),code=root?.querySelector("pre,code");
      const figures=[...root?.querySelectorAll("canvas,svg")||[]].filter(e=>{
        const r=e.getBoundingClientRect();return r.width>30&&r.height>30&&getComputedStyle(e).display!=="none";
      });
      const size=e=>e?parseFloat(getComputedStyle(e).fontSize):null;
      return {heading:size(heading),paragraph:size(paragraph),code:size(code),
        figures:figures.length,figureWidths:figures.map(e=>Math.round(e.getBoundingClientRect().width)).slice(0,6)};
    },item.target);
    if(width<=800 && visual.heading!==null)assert.ok(visual.heading>=12,
      item.name+" mobile heading too small: "+JSON.stringify(visual));
    if(width<=800 && visual.paragraph!==null)assert.ok(visual.paragraph>=11,
      item.name+" mobile body text too small: "+JSON.stringify(visual));
    await page.screenshot({path:"tests/screenshots/mobile-navigation/content-"+item.name.replace(/[^a-z0-9]+/gi,"-")+"-"+width+".png",
      fullPage:false,animations:"disabled"});
    console.log("VISUAL",item.name,width,JSON.stringify(visual));
    if(width<=800&&item.name.startsWith("C ")){
      assert.equal(await page.locator("#lesson-nav details[open]").count(),0,
        item.name+" mobile lesson groups should close");
    }
    if(width<=600&&item.name.startsWith("SS Chapter")){
      const toggle=page.locator(".ss-mobile-index-toggle").first();
      if(await toggle.count())assert.equal(await toggle.getAttribute("aria-expanded"),"false",
        item.name+" mobile sidebar should close");
    }
    if(width<=800 && !item.name.startsWith("SS Applications")){
      const reopen=page.locator("#els-mobile-open-lessons");
      await reopen.waitFor({state:"visible",timeout:4000});
      const fixed=await reopen.evaluate(el=>getComputedStyle(el).position);
      assert.notEqual(fixed,"fixed",item.name+" lesson title control must not be fixed");
      assert.notEqual(fixed,"sticky",item.name+" lesson title control must not be sticky");
      await reopen.click();
      const returnPosition=await page.evaluate(()=>({
        toc:document.querySelector("#lesson-nav, .ss-layout-sidebar nav")?.getBoundingClientRect().top,
        scrolled:window.scrollY
      }));
      assert.ok(returnPosition.toc>=-15&&returnPosition.toc<window.innerHeight*.8,
        item.name+" cannot return to lesson list: "+JSON.stringify(returnPosition));
    }
    await page.screenshot({path:"tests/screenshots/mobile-navigation/"+item.name.replace(/[^a-z0-9]+/gi,"-")+"-"+width+".png",fullPage:false,animations:"disabled"});
    console.log("PASS",item.name,width,data);
   }catch(e){failures.push(item.name+" "+width+": "+e.message);
    await page.screenshot({path:"tests/screenshots/mobile-navigation/FAIL-"+item.name.replace(/[^a-z0-9]+/gi,"-")+"-"+width+".png",fullPage:true}).catch(()=>{});}
   finally{await page.close();}
  }
  await ctx.close();
 }
}finally{await browser.close();}
assert.deepEqual(failures,[],"Mobile lesson title navigation alignment");
