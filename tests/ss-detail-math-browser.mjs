import assert from "node:assert/strict";
import {chromium} from "playwright";
import {mkdir,writeFile} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const COUNT={1:9,2:9,3:7,4:8};
const nav={1:"#nav button[data-exp]",2:"[data-nav]",3:"[data-nav]",4:"[data-nav]",
 5:"#tabs button[data-lab]",6:"[data-nav]",7:"#ss7-lesson-nav button",8:"#nav button[data-exp]"};
const browser=await chromium.launch({headless:true});
const records=[],failures=[];
await mkdir("qa",{recursive:true});
try{
 for(const width of [390,1280]){
  const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
  for(let chapter=1;chapter<=8;chapter++){
   const page=await ctx.newPage();const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   try{
    const response=await page.goto(base+"/signals-systems/chapter"+chapter+".html",
       {waitUntil:"domcontentloaded",timeout:30000});
    assert.equal(response?.status(),200,"Chapter "+chapter+" HTTP");
    await page.waitForFunction(()=>window.katex?.renderToString,{timeout:14000});
    await page.locator(nav[chapter]).first().waitFor({timeout:14000});
    const available=await page.locator(nav[chapter]).count();
    if(chapter<=4)assert.equal(available,COUNT[chapter],"Expected lesson count Ch"+chapter);
    const indices=chapter<=4?[...Array(COUNT[chapter]).keys()]:[0,Math.floor(available/2),available-1];
    for(const index of [...new Set(indices)]){
     await page.locator(nav[chapter]).nth(index).evaluate(el=>el.click());
     await page.waitForTimeout(280);
     if(chapter<=4){
      await page.waitForFunction(i=>document.querySelector("#formula.formula")?.dataset.ssFoundationMathDone===String(i)
        &&document.querySelector("#formula.formula .katex"),index,{timeout:5000});
     }
     const state=await page.evaluate(()=>{
      window.SSDetailCardMath?.scan?.();
      const card=document.querySelector("#formula.formula");
      const report=window.SSChaptersMathAudit?.audit?.();
      const eq=card?.querySelector(".katex");
      const root=document.querySelector("main");
      const mathCount=root?.querySelectorAll(".katex").length||0;
      const errorCount=root?.querySelectorAll(".katex-error,[data-ss-math-error]").length||0;
      const scrollWidth=document.documentElement.scrollWidth,clientWidth=innerWidth;
      const b=card?.getBoundingClientRect();
      return {formulaRendered:!!eq,formulaIndex:card?.dataset.ssFoundationMathDone,
       mathCount,errorCount,sourceFailures:window.SSFoundationCardMath?.failures||[],
       proseFailures:window.SSDetailCardMath?.failures||[],auditPassed:report?.passed,
       scrollWidth,clientWidth,formulaWidth:b?.width};
     });
     records.push({chapter,section:index+1,width,...state});
     if(chapter<=4&&!state.formulaRendered)failures.push({chapter,section:index+1,width,reason:"formula-not-katex"});
     if(state.errorCount||state.sourceFailures.length||state.proseFailures.length)
      failures.push({chapter,section:index+1,width,reason:"math-error",state});
     if(state.scrollWidth>width+15)failures.push({chapter,section:index+1,width,reason:"page-overflow",state});
    }
    if(errors.length)failures.push({chapter,width,reason:"pageerror",errors:errors.slice(0,5)});
   }catch(error){
    failures.push({chapter,width,reason:String(error)});
    await page.screenshot({path:"qa/math-card-failure-ch"+chapter+"-"+width+".png",fullPage:true}).catch(()=>{});
   }finally{await page.close()}
  }
  await ctx.close();
 }
}finally{await browser.close()}
await writeFile("qa/ss-detail-math-results.json",JSON.stringify({records,failures},null,2));
console.log("SS detail math:",records.length,"card states,",failures.length,"failures");
for(const f of failures.slice(0,20))console.error("MATH FAIL",JSON.stringify(f).slice(0,400));
assert.equal(failures.length,0,"SS detail card math regression");
