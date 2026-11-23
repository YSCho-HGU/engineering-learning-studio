import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";

const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const results=[],failures=[];
await mkdir("qa",{recursive:true});
for(let chapter=1;chapter<=8;chapter++){
 const page=await browser.newPage({viewport:{width:1366,height:850}});
 const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
 const route="/signals-systems/chapter"+chapter+".html";
 try{
  const response=await page.goto(base+route,{waitUntil:"domcontentloaded",timeout:30000});
  if(!response?.ok())throw Error("HTTP "+response?.status());
  await page.waitForFunction(()=>!!window.SSChaptersMathAudit,{timeout:15000});
  await page.waitForTimeout(500);
  for(const language of ["en","ko","mixed"]){
   const select=page.locator("select[aria-label='Language']").first();
   if(await select.count()){await select.selectOption(language);await page.waitForTimeout(200)}
   const snapshot=await page.evaluate(()=>{
    window.SSMathCore?.renderNow?.();
    return window.SSChaptersMathAudit.audit();
   });
   results.push({chapter,language,...snapshot});
   if(!snapshot.passed)failures.push({chapter,language,failures:snapshot.failures});
  }
  if(errors.length)failures.push({chapter,reason:"pageerror",errors:errors.slice(0,8)});
 }catch(error){failures.push({chapter,reason:String(error.message||error)})}
 finally{await page.close()}
}
await browser.close();
await writeFile("qa/chapters-math-audit.json",JSON.stringify({createdAt:new Date().toISOString(),results,failures},null,2));
console.log("Chapter math audit:",results.length,"states;",failures.length,"failures");
if(failures.length){
 for(const f of failures.slice(0,30))console.error("FAIL",JSON.stringify(f).slice(0,1100));
 process.exitCode=1;
}
