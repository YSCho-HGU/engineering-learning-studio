/* Repeated chart-height checks for remaining Part A labs:
 * 01 harmonics, 04 beats, 05 AM/FM, 06 sampling.
 * Existing plot cards and teaching interactions must remain unchanged.
 */
import assert from "node:assert/strict";
import {chromium} from "playwright";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const labs=["harmonics","beats","amfm","sampling"];
const viewports=[
  {id:"desktop",width:1366,height:900,dpr:1},
  {id:"desktop-narrow",width:1138,height:840,dpr:1},
  {id:"mid",width:900,height:800,dpr:1},
  {id:"tablet",width:768,height:900,dpr:1},
  {id:"phone-dpr2",width:390,height:844,dpr:2}
];
const browser=await chromium.launch({headless:true});
const failed=[];let passed=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function snapshot(page){
 return page.evaluate(()=>{
  const root=document.querySelector(".ss-al-root"),grid=document.getElementById("ss-al-charts");
  const box=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {w:+r.width.toFixed(2),h:+r.height.toFixed(2)}};
  return {doc:document.documentElement.scrollHeight,root:box(root),grid:box(grid),
    canvas:[...grid.querySelectorAll("canvas")].filter(x=>x.getClientRects().length).map(c=>({
      id:c.id,css:box(c),attrH:c.height,flex:getComputedStyle(c).flex,
      parent:box(c.closest(".ss-al-plot"))
    })),
    graphCards:[...grid.querySelectorAll(".ss-al-plot")].filter(x=>x.getClientRects().length).map(box),
    nodes:document.querySelectorAll("*").length};
 });
}
function checkStable(label,sequence,phase){
 const begin=sequence[0],last=sequence.at(-1);
 assert(begin&&last&&last.canvas.length>=2,label+" missing plots");
 for(let k=0;k<last.canvas.length;k++){
  const hs=sequence.map(s=>s.canvas[k]?.css.h||0);
  const initial=hs[0],final=hs.at(-1);
  assert(final>130&&final<840,label+" "+phase+" canvas "+k+" height outside readable range: "+JSON.stringify(hs));
  assert(final-initial<7,label+" "+phase+" canvas "+k+" grows: "+JSON.stringify(hs));
  assert(hs.at(-1)<=Math.max(...hs.slice(0,3))+7,
    label+" "+phase+" later redraw expanded canvas "+k+": "+JSON.stringify(hs));
 }
 const docChange=last.doc-begin.doc;
 assert(docChange<60,label+" "+phase+" document grew by "+docChange+": "+sequence.map(s=>s.doc));
 assert(last.nodes-begin.nodes<70,label+" "+phase+" DOM nodes accumulating");
}
const valuesFor={
 harmonics:[["ctl-f0","220"],["ctl-n","4"],["ctl-f0","330"],["ctl-n","6"]],
 beats:[["ss-extra-delta","2"],["ss-extra-f1","240"],["ss-extra-delta","8"],["ss-extra-ratio","0.65"]],
 amfm:[["ss-extra-fm","5"],["ss-extra-fc","560"],["ss-extra-fm","16"],["ss-extra-depth","0.55"]],
 sampling:[["ss-extra-pos","14"],["ss-extra-fs","4000"],["ss-extra-pos","60"],["ss-extra-fs","2200"]]
};
for(const lab of labs){
 for(const cfg of viewports){
  const key=lab+"-"+cfg.id;
  const page=await browser.newPage({viewport:{width:cfg.width,height:cfg.height},deviceScaleFactor:cfg.dpr});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   const response=await page.goto(base+"/signals-systems/applications-lab.html?lab="+lab,
     {waitUntil:"load",timeout:35000});
   assert(response?.ok(),key+" HTTP response");
   await page.waitForFunction(()=>document.getElementById("ss-al-canvas-1")?.width>240,{timeout:10000});
   const idle=[];
   for(let i=0;i<6;i++){await sleep(180);idle.push(await snapshot(page))}
   checkStable(key,idle,"idle");
   const active=[];
   for(let i=0;i<20;i++){
    const [id,value]=valuesFor[lab][i%4];
    const found=await page.evaluate(({id,value})=>{
     const el=document.getElementById(id);if(!el)return false;
     el.value=value;
     el.dispatchEvent(new Event(el.tagName==="SELECT"?"change":"input",{bubbles:true}));
     return true;
    },{id,value});
    assert(found,key+" missing real input "+id);
    await sleep(90);
    active.push(await snapshot(page));
   }
   checkStable(key,active,"20 controls");
   await page.locator("#ss-al-focus-toolbar").click();
   await sleep(260);
   const focus=await snapshot(page);
   assert(focus.canvas.every(c=>c.css.h>150&&c.css.h<850),key+" focus plot grew out of bounds: "+JSON.stringify(focus.canvas));
   await page.locator("#ss-al-focus-toolbar").click();
   await sleep(260);
   const back=await snapshot(page);
   assert(Math.abs(back.canvas[0].css.h-idle.at(-1).canvas[0].css.h)<8,
     key+" did not return to baseline plot height");
   if(cfg.width===390){
    await page.setViewportSize({width:430,height:844});
    await sleep(160);
    await page.setViewportSize({width:390,height:844});
    await sleep(160);
    const afterResize=await snapshot(page);
    assert(Math.abs(afterResize.canvas[0].css.h-back.canvas[0].css.h)<8,
      key+" resizing changed restored plot height");
   }
   if(lab==="sampling"){
    await page.locator("#ss-extra-kind").selectOption("sine");
    await sleep(150);
    const other=await snapshot(page);
    assert(other.canvas[0].css.h<840,key+" sampling sine chart height");
   }
   assert.equal(errors.length,0,key+" uncaught JS errors "+errors.join(" | "));
   passed++;
   console.log("PASS",key,JSON.stringify({
     canvas:idle.at(-1).canvas.map(x=>Math.round(x.css.h)),
     last:back.canvas.map(x=>Math.round(x.css.h)),
     focus:focus.canvas.map(x=>Math.round(x.css.h)),
     nodes:back.nodes-idle.at(-1).nodes
   }));
  }catch(e){failed.push({key,error:String(e)});console.error("FAIL",key,String(e))}
  finally{await page.close()}
 }
}
await browser.close();
console.log("Part A remaining chart-height regression",passed+"/"+labs.length*viewports.length,JSON.stringify(failed));
if(failed.length)process.exitCode=1;
