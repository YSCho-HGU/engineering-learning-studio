import {chromium} from "@playwright/test";
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const failures=[];
await mkdir("tests/screenshots",{recursive:true});
function check(v,message){if(!v)throw Error(message);}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function range(page,id,value){
 await page.locator("#"+id).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event("input",{bubbles:true}));},value);
 await page.waitForTimeout(110);
}
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:820}});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   const url=base+"/signals-systems/applications-system-lab.html";
   await page.goto(url+"?lab=rc",{waitUntil:"domcontentloaded"});
   await page.locator("#ss-sys-v-in").waitFor();
   await page.waitForFunction(()=>window.SSSystemLab?.kind==="rc" && document.getElementById("ss-sys-v-in")?.textContent!=="0 V");
   check(await page.locator("#ss-sys-rc-explorer").isVisible(),"RC schematic not visible");
   check(!(await page.locator("#ss-sys-series-r").isHidden()),"RC low-pass series resistor should be shown");
   check(await page.locator("#ss-sys-series-c").isHidden(),"RC low-pass series capacitor should be hidden");
   const voltages=await page.evaluate(()=>{
    const value=id=>Number(document.getElementById(id).textContent.replace(" V",""));
    return {input:value("ss-sys-v-in"),out:value("ss-sys-v-out"),r:value("ss-sys-v-r"),c:value("ss-sys-v-c")};
   });
   check(Math.abs(voltages.input-voltages.r-voltages.c)<.004,"RC Kirchhoff voltage relation incorrect");
   check(Math.abs(voltages.out-voltages.c)<.004,"RC low-pass output must equal capacitor voltage");
   await page.locator("#sys-type").selectOption("high");
   await page.waitForTimeout(110);
   check(!(await page.locator("#ss-sys-series-c").isHidden()),"RC high-pass capacitor symbol missing");
   check(await page.locator("#ss-sys-series-r").isHidden(),"RC high-pass resistor still shown in series");
   const hp=await page.evaluate(()=>({
    output:Number(document.getElementById("ss-sys-v-out").textContent.replace(" V","")),
    resistor:Number(document.getElementById("ss-sys-v-r").textContent.replace(" V",""))
   }));
   check(Math.abs(hp.output-hp.resistor)<.004,"RC high-pass output must equal resistor voltage");
   await range(page,"sys-Rk",25);
   check((await page.locator("#ss-sys-series-label").textContent()).includes("25")===false,"Series label should show capacitance in high-pass mode");
   check((await page.locator("#ss-sys-shunt-label").textContent()).includes("25"),"RC resistance label did not update");
   const cursorBefore=await page.locator("#sys-probe").inputValue();
   const chart=page.locator("#ss-sys-canvas-1");await chart.scrollIntoViewIfNeeded();const rect=await chart.boundingBox();
   check(!!rect,"RC chart not visible");
   await page.mouse.click(rect.x+rect.width*.73,rect.y+rect.height*.53);
   check((await page.locator("#sys-probe").inputValue())!==cursorBefore,"Clicking RC chart did not move time cursor");
   await page.locator("#ss-sys-theme").selectOption("white-clean");
   await page.waitForTimeout(100);
   check(await page.evaluate(()=>document.documentElement.dataset.elsTheme)==="white-clean","RC theme picker failed");
   await page.locator("#ss-sys-language").selectOption("ko");
   await page.waitForTimeout(90);
   check((await page.locator("#ss-sys-circuit-note").innerText()).includes("전압"),"RC Korean explanation missing");
   await page.locator("#ss-sys-language").selectOption("en");
   await page.waitForTimeout(90);
   check(!(await page.locator("#ss-sys-circuit-note").innerText()).includes("전압"),"RC English leaked Korean");
   await page.screenshot({path:"tests/screenshots/partb-rc-"+width+".png",fullPage:true});
   await page.goto(url+"?lab=moving-average",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.SSSystemLab?.kind==="moving-average" && !!document.querySelector("#ss-sys-ma-taps button"));
   check(await page.locator("#ss-sys-ma-explorer").isVisible(),"Convolution inspector missing");
   check(await page.locator("#ss-sys-ma-taps button").count()===7,"Incorrect initial tap count");
   check(await page.locator("#ss-sys-ma-back").isDisabled(),"Previous should be disabled at stage 0");
   await page.locator("#ss-sys-ma-next").click();
   check((await page.locator("#ss-sys-ma-counter").innerText()).includes("1 / 7"),"First tap step missing");
   check((await page.locator("#ss-sys-ma-accumulator").innerText()).includes("Running sum"),"Running sum not shown");
   await page.locator("#ss-sys-ma-show-all").click();
   check((await page.locator("#ss-sys-ma-accumulator").getAttribute("data-verified"))==="true","Completed convolution does not match FIR output");
   await range(page,"sys-M",21);
   await range(page,"sys-index",0);
   check(await page.locator("#ss-sys-ma-taps button").count()===21,"M=21 tap count incorrect");
   check(await page.locator(".ss-sys-ma-padded").count()===20,"Initial zero padding not shown");
   const before=await page.locator("#sys-index").inputValue();
   const graph=page.locator("#ss-sys-canvas-1");await graph.scrollIntoViewIfNeeded();const bounds=await graph.boundingBox();
   await page.mouse.click(bounds.x+bounds.width*.66,bounds.y+bounds.height*.5);
   check((await page.locator("#sys-index").inputValue())!==before,"Clicking sensor plot did not select a sample");
   await graph.focus();await page.keyboard.press("ArrowRight");
   const advanced=Number(await page.locator("#sys-index").inputValue());
   check(advanced>1,"Keyboard arrow did not advance sample");
   await page.locator("#ss-sys-ma-show-all").click();
   check((await page.locator("#ss-sys-ma-accumulator").getAttribute("data-verified"))==="true","Selected convolution sum mismatch");
   await page.locator("#ss-sys-language").selectOption("ko");
   await page.waitForTimeout(90);
   check((await page.locator("#ss-sys-ma-hint").innerText()).includes("표본"),"MA Korean language missing");
   await page.locator("#ss-sys-language").selectOption("en");
   await page.waitForTimeout(90);
   check(!(await page.locator("#ss-sys-ma-hint").innerText()).includes("표본"),"MA English language leak");
   await page.locator("#ss-sys-reset").click();
   await page.waitForTimeout(90);
   check(await page.locator("#sys-M").inputValue()==="7","Moving-average Reset did not restore M");
   check(await page.locator("#sys-index").inputValue()==="65","Moving-average Reset did not restore n");
   await page.screenshot({path:"tests/screenshots/partb-ma-"+width+".png",fullPage:true});
   if(width===390){
    const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    check(sizes.scroll<=sizes.client+8,"Mobile horizontal page overflow: "+JSON.stringify(sizes));
   }
   check(errors.length===0,"Page errors: "+errors.join(" | "));
   console.log("Part B browser PASS at "+width+"px");
  }catch(error){
   failures.push(width+": "+error.message);console.error("Part B browser FAIL "+width+": "+error.stack);
  }finally{await page.close();}
 }
}finally{await browser.close();}
assert.deepEqual(failures,[],"Part B browser smoke failures");
