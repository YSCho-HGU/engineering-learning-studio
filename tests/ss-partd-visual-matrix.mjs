/* Part D visual matrix: 2 labs × 3 language modes × 5 themes × desktop/tablet/mobile.
 * Run with repo static server on SS_TEST_BASE (default http://127.0.0.1:8765).
 */
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {chromium} from "playwright";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const viewports=[{width:1366,height:900},{width:768,height:900},{width:390,height:844}];
const languages=["en","ko","mixed"];
const themes=["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"];
const pages=[
 {path:"applications-audio-filter.html",id:"audio",canvases:["waveplot","specplot","gainplot","impulseplot"],metrics:["atten","delay","rms"]},
 {path:"applications-chirp-echo.html",id:"radar",canvases:["echo-plot","product-plot","sum-plot","corr-plot"],metrics:["truth","estimate","error","product-value","partial-value","norm-value"]}
];
const browser=await chromium.launch({headless:true});
const report={cases:[],errors:[]};mkdirSync("qa/partd-visual",{recursive:true});
function fail(label,error){report.errors.push({label,error:String(error)});console.error("FAIL",label,String(error))}
for(const spec of pages){
 const page=await browser.newPage({viewport:viewports[0]});
 let pageErrors=[];
 page.on("pageerror",e=>pageErrors.push(e.message));
 try{
  const res=await page.goto(base+"/signals-systems/"+spec.path,{waitUntil:"load",timeout:35000});
  assert(res?.ok(),"HTTP failure");
  await page.waitForFunction(()=>!!window.ELSLanguage,{timeout:10000});
  await page.waitForTimeout(200);
  for(const viewport of viewports){
   await page.setViewportSize(viewport);
   for(const theme of themes){
    await page.locator("#partd-theme").selectOption(theme);
    await page.waitForTimeout(90);
    for(const language of languages){
     const label=spec.id+" "+viewport.width+" "+theme+" "+language;
     try{
      await page.locator("#partd-language").selectOption(language);
      await page.waitForTimeout(60);
      const state=await page.evaluate(({canvases,metrics})=>{
       const visible=el=>!!el&&!!el.getClientRects().length;
       const documentWidth=document.documentElement.scrollWidth;
       const viewportWidth=innerWidth;
       const equation=[...document.querySelectorAll("[data-ss-math]")].filter(visible);
       const missing=equation.filter(el=>!el.querySelector(".katex")||el.querySelector(".katex-error"));
       const canvas=canvases.map(id=>{
        const el=document.getElementById(id),ctx=el?.getContext("2d");
        if(!el||!ctx)return {id,error:"missing"};
        const {width:w,height:h}=el;
        const values=ctx.getImageData(0,0,w,h).data;
        let distinct=false,first=values.slice(0,4);
        for(let i=4;i<values.length;i+=Math.max(4,Math.floor(values.length/1500/4)*4)){
         if(values[i]!==first[0]||values[i+1]!==first[1]||values[i+2]!==first[2]){distinct=true;break}
        }
        const rect=el.getBoundingClientRect();
        return {id,distinct,width:rect.width,height:rect.height};
       });
       const metricValues=metrics.map(id=>({id,value:document.getElementById(id)?.textContent?.trim()}));
       const control=document.getElementById("experiment")?.getBoundingClientRect();
       return {
        width:viewportWidth,scrollWidth:documentWidth,
        language:document.documentElement.dataset.elsLanguage,
        theme:document.documentElement.dataset.elsTheme,
        equations:equation.length,missing:missing.length,
        mathErrors:document.querySelectorAll(".katex-error").length,
        canvases:canvas,metrics:metricValues,
        controlWidth:control?.width||0
       };
      },spec);
      assert(state.scrollWidth<=state.width+3,"horizontal page overflow "+JSON.stringify(state));
      assert.equal(state.language,language,"language state mismatch");
      assert.equal(state.theme,theme,"theme state mismatch");
      assert(state.equations>0&&state.missing===0&&state.mathErrors===0,"math not rendered");
      for(const c of state.canvases)assert(!c.error&&c.distinct&&c.width>100&&c.height>80,"blank or collapsed canvas "+c.id);
      for(const m of state.metrics)assert(m.value&&m.value!=="—","empty metric "+m.id);
      assert(state.controlWidth>220,"controls missing");
      if(pageErrors.length)throw Error("page errors "+pageErrors.join(" | "));
      report.cases.push({label,ok:true});
      if((viewport.width===1366||viewport.width===390)&&(theme==="white-clean"||theme==="neutral-dark")&&language==="ko"){
       await page.screenshot({path:"qa/partd-visual/"+spec.id+"-"+viewport.width+"-"+theme+".png",fullPage:true});
      }
     }catch(e){fail(label,e);report.cases.push({label,ok:false})}
    }
   }
  }
  if(spec.id==="radar"){
   await page.locator("#partd-language").selectOption("en");
   await page.locator("#lag-peak").click();
   await page.locator("#sample-complete").click();
   const check=await page.evaluate(()=>{
    const expected=+document.querySelector("#norm-value").textContent;
    const sum=+document.querySelector("#partial-value").textContent;
    const proof=(document.querySelector("#product-explain").textContent||"").match(/Full sum (-?\d+(?:\.\d+)?) ÷ energy normalization (-?\d+(?:\.\d+)?) = (-?\d+(?:\.\d+)?)/);
    return {expected,sum,proof:proof?.slice(1).map(Number)}
   });
   assert(check.proof&&Math.abs(check.sum-check.proof[0])<.00015,"partial sum disagrees with formula");
   assert(Math.abs(check.expected-check.proof[2])<.00015,"normalized correlation disagrees with formula");
   await page.locator("#sample-index").evaluate(el=>{el.value="0";el.dispatchEvent(new Event("input",{bubbles:true}))});
   await page.locator("#sample-play").click();
   await page.waitForTimeout(210);
   assert(+(await page.locator("#sample-index").inputValue())>0,"sample animation did not advance");
   await page.locator("#sample-play").click();
   const paused=+(await page.locator("#sample-index").inputValue());
   await page.waitForTimeout(180);
   assert.equal(+(await page.locator("#sample-index").inputValue()),paused,"sample animation did not pause");
   await page.locator("#lag-play").click();
   await page.waitForTimeout(130);
   assert(+(await page.locator("#lag").inputValue())>0,"lag animation did not advance");
   await page.locator("#lag-play").click();
  }
  if(spec.id==="audio"){
   await page.locator("#filter").selectOption("low");
   const before=await page.locator("#cutoff-explain").innerText();
   await page.locator("#cutoff").evaluate(el=>{el.value="1700";el.dispatchEvent(new Event("input",{bubbles:true}))});
   assert.notEqual(await page.locator("#cutoff-explain").innerText(),before,"cutoff explanation failed to update");
   assert((await page.locator("#delay-explain").innerText()).includes("6.25"),"delay explanation not visible");
  }
 }catch(e){fail(spec.id+" setup or interaction",e)}
 finally{await page.close()}
}
await browser.close();
writeFileSync("qa/partd-visual/report.json",JSON.stringify({...report,total:report.cases.length,passed:report.cases.filter(x=>x.ok).length},null,2));
console.log("Part D visual matrix",report.cases.filter(x=>x.ok).length+"/"+report.cases.length,"states; errors",report.errors.length);
if(report.errors.length)process.exitCode=1;
