/* Part B–D chart-height stability. Existing lab DOM/JS is exercised,
 * not substituted with mock charts. Tests a real first slider if available,
 * redraws, resizing, and phone device-pixel ratio.
 */
import assert from "node:assert/strict";
import {chromium} from "playwright";
import {writeFileSync,mkdirSync} from "node:fs";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const labs=[
 ["B-rc","applications-system-lab.html?lab=rc"],
 ["B-moving-average","applications-system-lab.html?lab=moving-average"],
 ["B-compare","applications-system-compare.html"],
 ["C-samples","applications-fft-lab.html"],
 ["C-resolution","applications-fft-resolution.html"],
 ["C-dft","applications-dft-fft.html"],
 ["C-dtmf","applications-fft-dtmf.html"],
 ["C-fingerprint","applications-fft-sound-fingerprint.html"],
 ["C-upload","applications-fft-upload.html"],
 ["C-image","applications-fft-image.html"],
 ["C-stft","applications-chirp-stft.html"],
 ["D-audio","applications-audio-filter.html"],
 ["D-echo","applications-chirp-echo.html"]
];
const widths=[{id:"phone-dpr2",w:390,h:844,dpr:2},
 {id:"tablet",w:768,h:900,dpr:1},{id:"desktop",w:1366,h:900,dpr:1}];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=await chromium.launch({headless:true});
const report=[];
mkdirSync("qa/partbcd-height",{recursive:true});
async function snapshot(page){
 return page.evaluate(()=>{
  const main=document.querySelector("main"),geom=x=>{
    const r=x?.getBoundingClientRect();return r?{w:+r.width.toFixed(1),h:+r.height.toFixed(1),y:+r.y.toFixed(1)}:null};
  const plots=[...main.querySelectorAll('canvas,svg[role="img"]')].filter(el=>{
    const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
    return rect.width>120&&rect.height>70&&style.visibility!=="hidden"&&style.display!=="none";
  }).map((el,i)=>({id:el.id||("index-"+i),tag:el.tagName.toLowerCase(),
    box:geom(el),container:geom(el.closest("figure,.d-plot,.ss-sys-plot,.cmp-plot,.ss-image-view,.ss-fft-graph-card,.dft-plot-card")||el.parentElement),
    attrHeight:el.tagName.toLowerCase()==="canvas"?el.height:undefined,
    flex:getComputedStyle(el).flex
  }));
  return {height:document.documentElement.scrollHeight,body:document.body.scrollHeight,main:geom(main),
    plots,count:document.querySelectorAll("*").length};
 });
}
function matchAndCheck(key,baseline,late,kind){
 const byId=new Map(late.plots.map(x=>[x.id,x]));
 const bad=[];
 for(const start of baseline.plots){
  const end=byId.get(start.id);if(!end)continue;
  const change=end.box.h-start.box.h;
  const parentChange=end.container.h-start.container.h;
  const tolerated=Math.max(26,start.box.h*.09);
  if(change>tolerated&&parentChange>tolerated)
   bad.push({plot:start.id,change,parentChange,before:start.box.h,after:end.box.h,
     beforeParent:start.container.h,afterParent:end.container.h});
 }
 assert.equal(bad.length,0,key+" "+kind+" chart and card height increased: "+JSON.stringify(bad));
}
async function exercise(page){
 const el=page.locator('main input[type="range"]:visible').first();
 if(await el.count()===0)return "no-range";
 const def=await el.evaluate(e=>({min:Number(e.min),max:Number(e.max),
   step:Number(e.step)||1,value:e.value,id:e.id}));
 if(!(def.max>def.min))return "range-not-numeric";
 for(let i=0;i<9;i++){
  const percent=i%2===0?.37:.68;
  const step=Number.isFinite(def.step)&&def.step>0?def.step:1;
  const newval=Math.max(def.min,Math.min(def.max,
    Math.round((def.min+percent*(def.max-def.min)-def.min)/step)*step+def.min));
  await el.evaluate((e,v)=>{e.value=String(v);
    e.dispatchEvent(new Event("input",{bubbles:true}));
  },newval);
  await sleep(85);
 }
 await el.evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}))},def.value);
 await sleep(280);
 return def.id||"first-range";
}
for(const vp of widths){
 for(const [name,route] of labs){
  const key=name+"-"+vp.id;
  const page=await browser.newPage({viewport:{width:vp.w,height:vp.h},
    deviceScaleFactor:vp.dpr,hasTouch:vp.w<500,isMobile:vp.w<500});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   const res=await page.goto(base+"/signals-systems/"+route,{waitUntil:"load",timeout:35000});
   assert(res?.ok(),key+" HTTP "+res?.status());
   if(name==="C-dtmf"){
    const btn=page.locator("#dtmf-fft");
    if(await btn.count())await btn.click();
   }
   await sleep(350);
   const initial=await snapshot(page);
   await sleep(650);const idle=await snapshot(page);
   assert(initial.plots.length>0,key+" no visible plot");
   matchAndCheck(key,initial,idle,"idle");
   const manipulated=await exercise(page);
   const after=await snapshot(page);
   await sleep(500);const later=await snapshot(page);
   matchAndCheck(key,idle,after,"repeated-control");
   matchAndCheck(key,idle,later,"settled");
   // Trigger a resize and return to the original width.
   await page.setViewportSize({width:vp.w+30,height:vp.h});
   await sleep(120);
   await page.setViewportSize({width:vp.w,height:vp.h});
   await sleep(350);
   const back=await snapshot(page);
   matchAndCheck(key,idle,back,"resized-back");
   assert(back.plots.every(p=>p.box.h<1500),key+" oversized canvas or SVG");
   assert(back.count-idle.count<100,key+" DOM accumulating nodes");
   // A page may legitimately change short detail text after a control cycle.
   const delta=back.height-idle.height;
   assert(delta<Math.max(150,idle.height*.06),key+" cumulative document growth "+delta);
   // Report pre-existing JS exceptions, but don't label unrelated asset/network
   // issues as proof of a geometry failure.
   report.push({key,status:"PASS",plots:initial.plots.length,range:manipulated,
     initialHeight:idle.height,finalHeight:back.height,first:idle.plots.slice(0,3),
     last:back.plots.slice(0,3),errors:errors.slice(0,3)});
   console.log("PASS",key,JSON.stringify({plots:initial.plots.length,range:manipulated,
     documentDelta:delta,heights:back.plots.slice(0,3).map(x=>Math.round(x.box.h))}));
  }catch(e){
   const err=String(e);
   report.push({key,status:"FAIL",error:err});
   console.error("FAIL",key,err);
  }finally{await page.close()}
 }
}
await browser.close();
writeFileSync("qa/partbcd-height/report.json",JSON.stringify(report,null,2));
const bad=report.filter(x=>x.status==="FAIL");
console.log("PART_BCD_HEIGHT",report.length-bad.length+"/"+report.length,
 JSON.stringify(bad).slice(0,11000));
if(bad.length)process.exitCode=1;
