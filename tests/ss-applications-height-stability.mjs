/* Diagnose time-dependent document growth across Applications.
 * Exercises high-DPR phones and desktop without modifying UI.
 */
import {chromium} from "playwright";
import {mkdirSync,writeFileSync} from "node:fs";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const routes=[
 ["hub","applications.html"],["A-harmonics","applications-lab.html?lab=harmonics"],
 ["A-chirp","applications-lab.html?lab=chirp"],["A-helix","applications-lab.html?lab=helix"],
 ["A-beats","applications-lab.html?lab=beats"],["A-amfm","applications-lab.html?lab=amfm"],
 ["A-sampling","applications-lab.html?lab=sampling"],
 ["B-rc","applications-system-lab.html?lab=rc"],
 ["B-ma","applications-system-lab.html?lab=moving-average"],
 ["B-compare","applications-system-compare.html"],
 ["C-samples","applications-fft-lab.html"],
 ["C-resolution","applications-fft-resolution.html"],
 ["C-dft","applications-dft-fft.html"],["C-dtmf","applications-fft-dtmf.html"],
 ["C-finger","applications-fft-sound-fingerprint.html"],
 ["C-upload","applications-fft-upload.html"],["C-image","applications-fft-image.html"],
 ["C-stft","applications-chirp-stft.html"],
 ["D-audio","applications-audio-filter.html"],
 ["D-echo","applications-chirp-echo.html"]
];
const browser=await chromium.launch({headless:true});
mkdirSync("qa/app-height-stability",{recursive:true});
const records=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function sample(page){
 return page.evaluate(()=>{
  const body=document.body,main=document.querySelector("main"),canv=[...document.querySelectorAll("canvas")],svgs=[...document.querySelectorAll("main svg")];
  const geom=e=>{let r=e?.getBoundingClientRect();return r?{h:Math.round(r.height),w:Math.round(r.width),top:Math.round(r.top)}:null};
  return {time:Math.round(performance.now()),scrollHeight:document.documentElement.scrollHeight,bodyHeight:body.scrollHeight,main:geom(main),
   canvas:canv.map(c=>({id:c.id,w:c.width,h:c.height,rect:geom(c)})).slice(0,12),
   svg:svgs.map(c=>({id:c.id,rect:geom(c)})).slice(0,7),
   elements:document.querySelectorAll("*").length};
 });
}
async function visit(spec,config){
 const [name,route]=spec, label=name+"-"+config.label;
 const page=await browser.newPage({viewport:{width:config.width,height:config.height},deviceScaleFactor:config.dpr,hasTouch:config.width<500,isMobile:config.width<500});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 try{
  const res=await page.goto(base+"/signals-systems/"+route,{waitUntil:"load",timeout:40000});
  if(!res?.ok())throw Error("HTTP "+res?.status());
  const samples=[];
  samples.push(await sample(page));
  await wait(300);samples.push(await sample(page));
  await wait(800);samples.push(await sample(page));
  await wait(1500);samples.push(await sample(page));
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
  await wait(500);samples.push(await sample(page));
  await wait(800);samples.push(await sample(page));
  const heights=samples.map(s=>s.scrollHeight);
  const start=heights[1],end=heights.at(-1),delta=end-start,pct=delta/Math.max(1,start)*100;
  const increasing=heights.slice(2).every((v,i)=>v>=heights[i+1]-3);
  const activeGrowth=delta>Math.max(150,start*.08)&&increasing;
  const nodeDelta=samples.at(-1).elements-samples[1].elements;
  const result={label,config,heights,delta,pct:Math.round(pct*100)/100,activeGrowth,nodeDelta,
   errors:errors.slice(0,6),first:samples[1],last:samples.at(-1)};
  records.push(result);
  console.log((activeGrowth?"GROW":"STABLE"),label,JSON.stringify({heights,delta,pct:result.pct,nodeDelta,canvasEnd:result.last.canvas.map(x=>[x.id,x.rect.h,x.h])}));
  if(activeGrowth||Math.abs(delta)>200)
   await page.screenshot({path:"qa/app-height-stability/"+label+".png",fullPage:false,animations:"disabled"});
 }catch(e){records.push({label,error:String(e)});console.error("ERROR",label,String(e))}
 finally{await page.close()}
}
const configs=[{label:"phone-dpr2",width:390,height:844,dpr:2},{label:"desktop",width:1366,height:900,dpr:1}];
for(const config of configs){
 const todo=config.label==="desktop"?routes.filter(x=>["hub","A-harmonics","A-sampling","C-image","D-audio","D-echo"].includes(x[0])):routes;
 for(let i=0;i<todo.length;i+=4)await Promise.all(todo.slice(i,i+4).map(spec=>visit(spec,config)));
}
await browser.close();
records.sort((a,b)=>(a.label||"").localeCompare(b.label||""));
writeFileSync("qa/app-height-stability/report.json",JSON.stringify(records,null,2));
const growing=records.filter(x=>x.activeGrowth),errors=records.filter(x=>x.error);
console.log("HEIGHT_STABILITY",JSON.stringify({tested:records.length,growing:growing.map(x=>({label:x.label,heights:x.heights,delta:x.delta,canvas:x.last.canvas})),errors}));
if(growing.length||errors.length)process.exitCode=1;
