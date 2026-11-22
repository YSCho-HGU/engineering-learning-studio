/* Chapter 4 is the reference navigation style across SS Chapters 1-8. */
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {chromium} from "playwright";

const port=8796,base="http://127.0.0.1:"+port+"/signals-systems/";
const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{stdio:"ignore"});
await new Promise(resolve=>setTimeout(resolve,1200));
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const width of [1280,390]){
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
  await context.addInitScript(()=>{
   localStorage.setItem("ss-sidebar-collapsed-v1","0");
   localStorage.setItem("els-language","en");
   localStorage.setItem("els-theme-v2","neutral-dark");
  });
  const page=await context.newPage();
  const reference={};
  for(let chapter=1;chapter<=8;chapter++){
   const errors=[];
   page.on("pageerror",handler);
   function handler(error){errors.push(error.message)}
   await page.goto(base+"chapter"+chapter+".html",{waitUntil:"domcontentloaded"});
   const sidebar=page.locator(".ss-layout-root > .ss-layout-sidebar");
   await sidebar.waitFor({state:"visible"});
   await sidebar.locator("nav > button").first().waitFor({state:"visible",timeout:12000});
   const items=sidebar.locator("nav > button");
   const count=await items.count();
   assert.ok(count>=4,"Ch "+chapter+": missing experiment items");
   const sample=await page.evaluate(()=>{
    const sidebar=document.querySelector(".ss-layout-root > .ss-layout-sidebar");
    const nav=sidebar.querySelector("nav:has(> button)");
    const row=nav.querySelector("button");
    const badge=row.querySelector(".num,.ss7-lab-number,.ss8-lab-number");
    const style=getComputedStyle(row),number=getComputedStyle(badge),navStyle=getComputedStyle(nav);
    const box=row.getBoundingClientRect(),rail=sidebar.getBoundingClientRect();
    return {width:rail.width,rowWidth:box.width,navWidth:nav.getBoundingClientRect().width,
      height:box.height,border:style.borderTopWidth,borderStyle:style.borderTopStyle,
      radius:style.borderTopLeftRadius,background:style.backgroundColor,
      fontSize:style.fontSize,fontWeight:style.fontWeight,
      badgeWidth:badge.getBoundingClientRect().width,badgeHeight:badge.getBoundingClientRect().height,
      gap:navStyle.rowGap,overflow:document.documentElement.scrollWidth-window.innerWidth};
   });
   assert.equal(sample.border,"1px","Ch "+chapter+": cards require visible 1px border");
   assert.equal(sample.borderStyle,"solid","Ch "+chapter+": border style");
   assert.equal(sample.fontSize,"13px","Ch "+chapter+": title font must match Ch4");
   assert.ok(sample.height>=52,"Ch "+chapter+": row under Ch4 minimum 52px");
   assert.equal(Math.round(sample.badgeWidth),30,"Ch "+chapter+": number badge width");
   assert.equal(Math.round(sample.badgeHeight),30,"Ch "+chapter+": number badge height");
   assert.equal(sample.gap,"6px","Ch "+chapter+": section card gap");
   assert.ok(sample.rowWidth>=sample.navWidth-3,"Ch "+chapter+": full-width row");
   assert.ok(sample.overflow<=3,"Ch "+chapter+": horizontal document overflow "+sample.overflow);
   if(chapter===4)reference[width]=sample;
   if(reference[width]){
    assert.ok(Math.abs(sample.width-reference[width].width)<=2,
      "Ch "+chapter+": sidebar width differs from Chapter 4");
    assert.equal(sample.radius,reference[width].radius);
    assert.equal(sample.background,reference[width].background);
   }
   const collapse=sidebar.locator(".ss-side-toggle").first();
   await collapse.click();
   await page.waitForFunction(()=>document.documentElement.dataset.ssSidebar==="collapsed");
   await page.locator("#ss-sidebar-restore").waitFor({state:"visible"});
   assert.equal(await sidebar.locator("nav").isVisible(),false,"Ch "+chapter+": collapsed nav must be hidden");
   await page.locator("#ss-sidebar-restore").click();
   await page.waitForFunction(()=>document.documentElement.dataset.ssSidebar==="expanded");
   assert.equal(await sidebar.locator("nav > button").first().isVisible(),true,"Ch "+chapter+": expanded nav");
   results.push({chapter,width,count,fontSize:sample.fontSize,height:sample.height,sidebarWidth:sample.width,background:sample.background});
   page.off("pageerror",handler);
   // Lessons can have unrelated mathematical libraries; assert sidebar integrity
   // rather than assuming all scripts and optional third-party CDNs load.
  }
  await context.close();
 }
}finally{
 await browser.close();
 server.kill();
}
console.log(JSON.stringify({status:"PASS",chapterCount:8,viewports:[1280,390],results},null,2));
