import {chromium} from "@playwright/test";
import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
import path from "node:path";

const BASE=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const output="artifacts/partb-student-qa";
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={title:"Part B student journeys",viewportResults:[],testedAt:new Date().toISOString()};
const assertThat=(ok,message)=>{if(!ok)throw Error(message);};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const input=async(page,id,v)=>{
 await page.locator(id).evaluate((el,x)=>{el.value=String(x);el.dispatchEvent(new Event("input",{bubbles:true}));},v);
 await sleep(120);
};
const checkLayout=async(page,key,scenario)=>{
 const v=await page.evaluate(()=>{
  const first=document.querySelector(".ss-sys-plot canvas");
  const firstRect=first?.getBoundingClientRect();
  const p=first?.closest(".ss-sys-plot");
  const h=p?.querySelector("h2,h3");
  const text=Array.from(document.querySelectorAll("main p")).filter(n=>n.getBoundingClientRect().width>0)[0];
  return {width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
   firstGraphWidth:firstRect?.width||0,firstGraphHeight:firstRect?.height||0,
   firstGraphTop:firstRect?.top||0,headingSize:h?parseFloat(getComputedStyle(h).fontSize):0,
   paragraphSize:text?parseFloat(getComputedStyle(text).fontSize):0};
 });
 assertThat(v.scrollWidth<=v.width+7,key+" horizontal overflow: "+JSON.stringify(v));
 assertThat(v.firstGraphWidth>180,key+" graph too narrow");
 assertThat(v.firstGraphHeight>=150,key+" graph too short");
 assertThat(v.headingSize>=14,key+" chart heading too small");
 scenario.layout=v;
};
const shots=async(page,name)=>page.screenshot({path:path.join(output,name+".png"),fullPage:true,animations:"disabled"});
try{
 for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const scenario={viewport,steps:[]}; const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   const labUrl=BASE+"/signals-systems/applications-system-lab.html";
   // Journey 1: a first-time student learns what passes through the RC circuit.
   await page.goto(labUrl+"?lab=rc",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.SSSystemLab?.kind==="rc" && !!document.querySelector("#ss-sys-demo-one"),null,{timeout:10000});
   await page.locator("#ss-sys-demo-one").click();
   await sleep(130);
   let rc=await page.evaluate(()=>window.SSSystemCore.rcSimulate(window.SSSystemLab.state));
   const slowGain=rc.frequencyPoint.mag;
   assertThat(rc.frequency===.4 && rc.type==="low" && slowGain>.9,"slow RC demo failed");
   await page.locator("#ss-sys-demo-two").click();
   await sleep(130);
   rc=await page.evaluate(()=>window.SSSystemCore.rcSimulate(window.SSSystemLab.state));
   const fastGain=rc.frequencyPoint.mag;
   assertThat(rc.frequency===8 && fastGain<.25 && slowGain>fastGain*3,"fast RC demo did not reveal filtering");
   assertThat((await page.locator("#out-probe").textContent()).includes("ms"),"RC probe should be physical time");
   await page.locator("#sys-type").selectOption("high");
   await sleep(120);
   assertThat(await page.evaluate(()=>window.SSSystemLab.state.type==="high"),"RC type state did not switch");
   try{
    await page.waitForFunction(()=>document.getElementById("ss-sys-output-label")?.textContent.includes("v_R"),null,{timeout:4000});
   }catch(e){
    const visual=await page.evaluate(()=>({
     type:window.SSSystemLab?.state?.type,
     measured:document.getElementById("ss-sys-output-label")?.textContent,
     circuit:document.getElementById("ss-sys-rc-topology")?.textContent,
     rHidden:document.getElementById("ss-sys-series-r")?.hasAttribute("hidden"),
     cHidden:document.getElementById("ss-sys-series-c")?.hasAttribute("hidden"),
     voltage:document.getElementById("ss-sys-v-out")?.textContent,
     canvasWidth:document.getElementById("ss-sys-canvas-1")?.width
    }));
    throw Error("RC output measurement did not move to resistor: "+JSON.stringify({visual,errors}));
   }
   await checkLayout(page,"RC",scenario);
   await shots(page,"rc-"+viewport.width);
   scenario.steps.push({name:"RC: slow vs fast, topology, measured time",slowGain,fastGain,status:"PASS"});
   // Journey 2: student inspects all causal averaging contributions and verifies a sharp edge.
   await page.goto(labUrl+"?lab=moving-average",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.SSSystemLab?.kind==="moving-average" && !!document.querySelector("#ss-sys-ma-taps button"),null,{timeout:10000});
   await page.locator("#ss-sys-demo-one").click();await sleep(120);
   assertThat(await page.locator("#sys-M").inputValue()==="5","MA noisy example M mismatch");
   await page.locator("#ss-sys-demo-two").click();await sleep(120);
   assertThat(await page.locator("#sys-M").inputValue()==="21","MA step example M mismatch");
   assertThat(await page.locator("#ss-sys-ma-taps button").count()===21,"MA 21 tap contributions absent");
   await page.locator("#ss-sys-ma-next").click();await sleep(60);
   assertThat((await page.locator("#ss-sys-ma-counter").textContent()).includes("1 / 21"),"MA cumulative step missing");
   await page.locator("#ss-sys-ma-show-all").click();await sleep(60);
   assertThat((await page.locator("#ss-sys-ma-accumulator").getAttribute("data-verified"))==="true","MA output verification mismatch");
   await page.locator("#ss-sys-ma-back").click();await sleep(60);
   assertThat((await page.locator("#ss-sys-ma-accumulator").getAttribute("data-verified"))!=="true","MA stale match status after Back");
   await input(page,"#sys-index",0);
   assertThat(await page.locator(".ss-sys-ma-padded").count()===20,"MA early samples not zero-padded");
   await checkLayout(page,"MovingAverage",scenario);
   await shots(page,"ma-"+viewport.width);
   scenario.steps.push({name:"MA: noisy sensor, edge, 21 taps, sum, padding",status:"PASS"});
   // Journey 3: fair matched-cutoff comparison; student discovers phase and delay.
   await page.goto(BASE+"/signals-systems/applications-system-compare.html",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.SSSystemCompareLab && !!document.querySelector("#cmp-phase"),null,{timeout:10000});
   await page.locator("#cmp-example-fair").click();await sleep(110);
   let compare=await page.evaluate(()=>window.SSSystemCompareLab.compute());
   assertThat(compare.shape==="sensor"&&compare.match&&Math.abs(compare.cutoffRC-compare.cutoffMA)<1e-8,"matched cutoff example not configured");
   assertThat(compare.sigmaMA<compare.sigmaRC,"MA theoretical noise attenuation unexpected");
   await page.locator("#cmp-example-step").click();await sleep(110);
   compare=await page.evaluate(()=>window.SSSystemCompareLab.compute());
   assertThat(compare.shape==="step"&&compare.M===21&&compare.noise===0,"step response example failed");
   const sample=compare.spectrum.find(p=>p.f>0&&p.f<compare.cutoffMA*.7);
   assertThat(Number.isFinite(sample.rcPhase)&&Number.isFinite(sample.rcDelay)&&Number.isFinite(sample.maDelay),"phase/delay sample not finite");
   await page.locator("#cmp-scope").selectOption("full");await sleep(120);
   assertThat(Math.abs(Number(await page.locator("#cmp-freq-probe").getAttribute("max"))-compare.fs/2)<1e-6,"Nyquist range incorrect");
   assertThat(await page.locator("#cmp-frequency-readouts .cmp-frequency-value").count()===5,"paired phase-delay values absent");
   await page.locator("#cmp-reset").click();await sleep(100);
   assertThat((await page.locator("#cmp-example-step").getAttribute("aria-pressed"))==="false","compare demo not reset");
   await page.locator("#cmp-language").selectOption("en");await sleep(70);
   assertThat(!/[\uAC00-\uD7A3]/.test(await page.locator("#cmp-example-hint").textContent()),"English demo hint leaks Korean");
   await page.locator("#cmp-language").selectOption("ko");await sleep(70);
   assertThat(/[\uAC00-\uD7A3]/.test(await page.locator("#cmp-example-hint").textContent()),"Korean demo hint not translated");
   const themes=viewport.width>600?["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]:["white-clean","neutral-dark"];
   for(const theme of themes){
    await page.locator("#cmp-theme").selectOption(theme);await sleep(80);
    assertThat(await page.evaluate(()=>document.documentElement.dataset.elsTheme)===theme,"theme failed "+theme);
    assertThat(!(await page.locator("#cmp-phase").evaluate(canvas=>canvas.width<100)),"phase canvas disappeared after theme change");
   }
   await checkLayout(page,"Compare",scenario);
   await shots(page,"compare-"+viewport.width);
   scenario.steps.push({name:"Compare: fair cutoff, step, phase, delay, all themes and language",status:"PASS"});
   assertThat(errors.length===0,"Uncaught JS errors: "+errors.join(" | "));
   scenario.status="PASS";
   console.log("PASS Part B student journeys viewport "+viewport.width);
  }catch(e){
   scenario.status="FAIL";scenario.error=String(e);scenario.pageErrors=errors;
   try{await shots(page,"failure-"+viewport.width);}catch(_){}
   console.error("FAIL Part B student journey "+viewport.width+": "+e.stack);
  }finally{
   report.viewportResults.push(scenario);await page.close();
  }
 }
}finally{await browser.close();}
await writeFile(path.join(output,"journey-results.json"),JSON.stringify(report,null,2));
assert.ok(report.viewportResults.every(v=>v.status==="PASS"),"Part B student journey regressions");
