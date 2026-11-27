/* Regression for 02 Chirp and 03 Complex Helix: no runaway canvas height.
   Repeated slider changes, animation, resize, focus, bilingual text and high DPR.
 */
import assert from "node:assert/strict";
import {chromium} from "playwright";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const scenarios=[
 {name:"desktop",width:1366,height:900,dpr:1},
 {name:"desktop-narrow",width:1138,height:840,dpr:1},
 {name:"mid",width:900,height:800,dpr:1},
 {name:"tablet",width:768,height:900,dpr:1},
 {name:"phone",width:390,height:844,dpr:2}
];
let pass=0;const failures=[];
for(const lab of ["chirp","helix"]){
 for(const cfg of scenarios){
 const page=await browser.newPage({viewport:{width:cfg.width,height:cfg.height},deviceScaleFactor:cfg.dpr});
 const key=lab+"-"+cfg.name;
 try{
  const res=await page.goto(base+"/signals-systems/applications-lab.html?lab="+lab,{waitUntil:"load",timeout:40000});
  assert(res?.ok(),key+" HTTP status");
  await page.waitForFunction(()=>document.querySelector("#ss-al-canvas-1")?.width>300,{timeout:9000});
  const measure=()=>page.evaluate(()=>{
   const area=document.querySelector("#ss-al-charts"),first=area.querySelector(".ss-al-plot:first-child"),canvas=first.querySelector("canvas"),second=area.children[1];
   const geom=e=>{const r=e.getBoundingClientRect();return {width:+r.width.toFixed(1),height:+r.height.toFixed(1),top:+r.top.toFixed(1)}};
   return {doc:document.documentElement.scrollHeight,first:geom(first),canvas:geom(canvas),
    other:geom(second),style:{flex:getComputedStyle(canvas).flex,cssHeight:getComputedStyle(canvas).height},
    attrs:{height:canvas.height,width:canvas.width}};
  });
  let samples=[];
  for(let i=0;i<6;i++){await page.waitForTimeout(170);samples.push(await measure())}
  const before=samples.at(-1);
  const stable=(arr,where)=>{
   const initial=arr[0],last=arr.at(-1);
   const increase=last.canvas.height-initial.canvas.height;
   const cardDelta=last.first.height-initial.first.height;
   const pageDelta=last.doc-initial.doc;
   assert(increase<=5&&cardDelta<=5&&pageDelta<=8,
     key+" "+where+" has cumulative growth "+JSON.stringify({increase,cardDelta,pageDelta,series:arr.map(x=>[x.doc,x.first.height,x.canvas.height])}));
   assert(last.canvas.height>=130&&last.canvas.height<=800,key+" "+where+" unexpected canvas "+JSON.stringify(last));
  };
  stable(samples,"idle");
  const names=lab==="chirp"?["ctl-pos","ctl-f1","ctl-window"]:["ctl-pos","ctl-sigma","ctl-f"];
  for(let k=0;k<20;k++){
   const id=names[k%names.length],value=lab==="chirp"?
     (id==="ctl-pos"?String((k*11)%100):id==="ctl-f1"?String(500+((k*3)%18)*100):(k%2?"256":"512")):
     (id==="ctl-pos"?String((k*13)%100):id==="ctl-sigma"?String(-.5+(k%9)*.1):String(1.0+(k%8)*.3));
   await page.evaluate(({id,value})=>{const el=document.getElementById(id);if(!el)return;el.value=value;el.dispatchEvent(new Event(el.tagName==="SELECT"?"change":"input",{bubbles:true}))},{id,value});
   await page.waitForTimeout(50);
   samples.push(await measure());
  }
  stable(samples.slice(6),"controls");
  if(lab==="helix"){
   await page.locator("#ss-al-play-motion").click();
   await page.waitForTimeout(950);
   const animated=await measure();
   await page.locator("#ss-al-play-motion").click();
   assert(animated.canvas.height-before.canvas.height<8,key+" helix animation enlarged canvas");
  }
  await page.locator("#ss-al-focus-toolbar").click();
  await page.waitForTimeout(270);
  const focus=await measure();
  assert(focus.canvas.height<=805,key+" focus exceed limit "+JSON.stringify(focus));
  await page.locator("#ss-al-focus-toolbar").click();
  await page.waitForTimeout(270);
  const restored=await measure();
  assert(Math.abs(restored.canvas.height-before.canvas.height)<=6,key+" focus/unfocus changed canvas size "+JSON.stringify({before,restored}));
  pass++;console.log("PASS",key,JSON.stringify({height:before.canvas.height,card:before.first.height,doc:before.doc,focus:focus.canvas.height,restored:restored.canvas.height,flex:restored.style.flex}));
 }catch(e){failures.push({key,error:String(e)});console.error("FAIL",key,String(e))}
 finally{await page.close()}
 }
}
await browser.close();
console.log("Chirp/Helix canvas height stability",pass+"/10",JSON.stringify(failures));
if(failures.length)process.exitCode=1;
