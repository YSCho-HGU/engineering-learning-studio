/* Browser QA: mathematical graph labels, captions and legends in Ch1-8.
 * Uses the same Chromium server as the existing S&S responsive tests. */
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const nav={1:"#nav [data-exp]",2:"[data-nav]",3:"[data-nav]",4:"[data-nav]",
 5:"#tabs [data-lab]",6:"[data-nav]",7:"#ss7-lesson-nav button",8:"#nav [data-exp]"};
const browser=await chromium.launch({headless:true});
const results=[],failures=[];
await mkdir("qa/graph-label-math",{recursive:true});
try{
 for(const width of [390,1366]){
  const context=await browser.newContext({viewport:{width,height:880},reducedMotion:"reduce"});
  for(let chapter=1;chapter<=8;chapter++){
   const page=await context.newPage();
   const errors=[];page.on("pageerror",err=>errors.push(err.message));
   try{
    const response=await page.goto(base+"/signals-systems/chapter"+chapter+".html",
      {waitUntil:"domcontentloaded",timeout:30000});
    assert.equal(response?.status(),200,"Chapter "+chapter+" HTTP");
    await page.waitForFunction(()=>!!window.SSGraphMath&&!!window.katex?.render,{timeout:12000});
    await page.locator(nav[chapter]).first().waitFor({timeout:14000});
    const count=await page.locator(nav[chapter]).count();
    assert.ok(count>=1,"No sections in chapter "+chapter);
    const indices=width===390?[0,Math.floor(count/2),count-1]:[0,count-1];
    for(const index of [...new Set(indices)]){
     await page.locator(nav[chapter]).nth(index).evaluate(el=>el.click());
     await page.waitForTimeout(320);
     const audit=await page.evaluate(()=>{
      window.SSGraphMath.enhanceAll();
      const main=document.querySelector("main");
      const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=="hidden";
      const graph=[...main.querySelectorAll("canvas,.plot-card svg")].filter(e=>visible(e)&&e.getBoundingClientRect().width>90);
      const math=[...main.querySelectorAll(".ss-graph-axis-math")].filter(visible);
      const captions=[...main.querySelectorAll(".ss-graph-caption-math")].filter(visible);
      const invalid=[...math,...captions].filter(e=>!e.querySelector(".katex")||
        e.querySelector(".katex-error")||e.dataset.ssMathState==="error");
      const svgAxes=[...main.querySelectorAll(".plot-card svg text.ss-plot-axis-title")]
       .filter(e=>window.SSGraphMath.latexFor(e.textContent));
      const missingSvg=svgAxes.filter(e=>{
       const parent=e.closest(".plot-card");
       return !parent?.querySelector('.ss-graph-axis-math[data-ss-formula]');
      });
      const labels=[...main.querySelectorAll(".plot-card .legend,.figure .legend,.plotbox .legend,.axis-key")]
       .filter(visible).map(e=>e.textContent.trim().slice(0,200)).slice(0,8);
      return {graphs:graph.length,math:math.length,captions:captions.length,
       invalid:invalid.length,svgAxes:svgAxes.length,missingSvg:missingSvg.length,
       labels,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
       offScreen:math.filter(e=>{const r=e.getBoundingClientRect();return r.left< -12||r.right>innerWidth+12}).length};
     });
     results.push({width,chapter,section:index+1,...audit});
     if(!audit.graphs)failures.push({width,chapter,section:index+1,reason:"no-visible-graphs"});
     if(audit.invalid)failures.push({width,chapter,section:index+1,reason:"invalid-katex",audit});
     if(audit.missingSvg)failures.push({width,chapter,section:index+1,reason:"unrendered-svg-axes",audit});
     if(audit.offScreen)failures.push({width,chapter,section:index+1,reason:"offscreen-graph-axis",audit});
     if(width===390&&audit.overflow>12)failures.push({width,chapter,section:index+1,reason:"mobile-overflow",audit});
     if(index===0){
      const chart=page.locator(".figure canvas,.plot-card svg").first();
      if(await chart.count()){
       await chart.scrollIntoViewIfNeeded();
       await page.screenshot({path:"qa/graph-label-math/ch"+chapter+"-"+width+".png",
        fullPage:false,animations:"disabled"});
      }
     }
    }
    if(errors.length)failures.push({width,chapter,reason:"pageerror",errors:errors.slice(0,5)});
   }catch(e){
    failures.push({width,chapter,reason:String(e)});
    await page.screenshot({path:"qa/graph-label-math/FAIL-ch"+chapter+"-"+width+".png",
      fullPage:true}).catch(()=>{});
   }finally{await page.close()}
  }
  await context.close();
 }
}finally{await browser.close()}
await writeFile("qa/graph-label-math/results.json",JSON.stringify({results,failures},null,2));
console.log("SS graph math browser QA:",results.length,"states,",failures.length,"failures");
failures.slice(0,25).forEach(x=>console.error("GRAPH LABEL",JSON.stringify(x).slice(0,850)));
assert.equal(failures.length,0,"SS graph labels and legends math regressions");
