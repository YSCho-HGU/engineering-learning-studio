/* Audit existing Applications mobile reading flow without adding/changing UI.
 * Uses page geometry, stage order, plot sizes and live screenshots.
 */
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {chromium} from "playwright";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const suites=[
 ...["harmonics","chirp","helix","beats","amfm","sampling"].map(lab=>({id:"A-"+lab,path:"applications-lab.html?lab="+lab,control:".ss-al-controls",plot:".ss-al-charts .ss-al-plot",family:"A"})),
 ...["rc","moving-average"].map(lab=>({id:"B-"+lab,path:"applications-system-lab.html?lab="+lab,control:".ss-sys-controls",plot:".ss-sys-plots .ss-sys-plot",family:"B"})),
 {id:"B-compare",path:"applications-system-compare.html",control:".ss-sys-controls",plot:".cmp-plots .cmp-plot",family:"B"},
 ...[
 ["samples","applications-fft-lab.html",".ss-fft-controls",".ss-fft-graphs .ss-fft-graph-card"],
 ["resolution","applications-fft-resolution.html",".ss-fft-r-controls",".ss-fft-r-graphs > *"],
 ["algorithm","applications-dft-fft.html","#panel-same .dft-controls","#panel-same .dft-plot-card"],
 ["dtmf","applications-fft-dtmf.html",".ss-dtmf-controls","#dtmf-spectrum"],
 ["fingerprint","applications-fft-sound-fingerprint.html",".ss-finger-controls","#finger-spectrum"],
 ["upload","applications-fft-upload.html",".ss-fft-upload-controls","#fft-upload-spectrum"],
 ["image","applications-fft-image.html",".ss-image-controls","#image-spectrum-canvas"],
 ["stft","applications-chirp-stft.html",".ss-stft-controls","#stft-spectrogram"]
 ].map(([id,path,control,plot])=>({id:"C-"+id,path,control,plot,family:"C"})),
 {id:"D-audio",path:"applications-audio-filter.html",control:"#experiment",plot:"#observe #specplot",family:"D"},
 {id:"D-radar",path:"applications-chirp-echo.html",control:"#experiment",plot:"#observe #echo-plot",family:"D"}
];
assert.equal(suites.length,19);
const browser=await chromium.launch({headless:true});
mkdirSync("qa/applications-mobile-flow",{recursive:true});
const report=[];
for(const vp of [{width:390,height:844},{width:768,height:900}]){
 for(const spec of suites){
  const page=await browser.newPage({viewport:vp});
  const pageErrors=[];
  page.on("pageerror",e=>pageErrors.push(e.message));
  const label=spec.id+"-"+vp.width;
  try{
   const res=await page.goto(base+"/signals-systems/"+spec.path,{waitUntil:"load",timeout:35000});
   assert(res?.ok(),label+" HTTP error");
   await page.waitForTimeout(240);
   // Inspect only existing elements; tolerate plots that are populated after user runs an experiment.
   const data=await page.evaluate(({control,plot})=>{
    const firstVisible=selector=>[...document.querySelectorAll(selector)].find(x=>x.getClientRects().length&&!x.hidden);
    const c=firstVisible(control),p=firstVisible(plot);
    const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
    const chart=p?.matches("canvas,svg")?p:p?.querySelector("canvas,svg");
    const plotbox=rect(p),ctl=rect(c),ch=rect(chart);
    const textNodes=[...p?.querySelectorAll("h2,h3,figcaption,p,.ss-al-plot-note")||[]].filter(x=>x.getClientRects().length).map(x=>({tag:x.tagName,len:x.textContent.trim().length,rect:rect(x)})).slice(0,8);
    return {foundControl:!!c,foundPlot:!!p,control:ctl,plot:plotbox,chart:ch,description:textNodes,
      viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      documentHeight:document.documentElement.scrollHeight,
      fixedStack:ctl&&plotbox?plotbox.top-ctl.bottom:null};
   },spec);
   if(!data.foundControl||!data.foundPlot)throw Error("Missing control/plot "+JSON.stringify(data));
   assert(data.scrollWidth<=data.viewport+4,"horizontal overflow "+JSON.stringify(data));
   assert(data.control.width>260&&data.plot.width>255,"collapsed panel width "+JSON.stringify(data));
   assert(data.plot.left>=-2&&data.plot.right<=vp.width+3,"plot off-screen "+JSON.stringify(data));
   assert(data.chart&&data.chart.width>235,"small/collapsed plot graphic "+JSON.stringify(data));
   if(vp.width===390){
    assert(data.control.bottom<=data.plot.top+5,"plot appears before controls in mobile reading order "+JSON.stringify(data));
    assert(data.description.every(x=>x.rect.right<=vp.width+5),"plot description clips horizontally "+JSON.stringify(data));
   }
   if(pageErrors.length)throw Error("Uncaught errors "+pageErrors.join(" | "));
   // Preserve selected representative screenshots, not all 38 full pages.
   if(vp.width===390&&["A-sampling","B-moving-average","B-compare","C-samples","C-dtmf","C-image","D-audio","D-radar"].includes(spec.id))
    await page.screenshot({path:"qa/applications-mobile-flow/"+spec.id+".png",fullPage:true,animations:"disabled"});
   report.push({label,ok:true,...data});
   console.log("PASS",label,JSON.stringify({controlWidth:data.control.width,plotWidth:data.plot.width,verticalGap:Math.round(data.fixedStack),chartWidth:Math.round(data.chart.width)}));
  }catch(e){report.push({label,ok:false,error:String(e)});console.error("FAIL",label,String(e))}
  finally{await page.close()}
 }
}
await browser.close();
writeFileSync("qa/applications-mobile-flow/report.json",JSON.stringify(report,null,2));
console.log("Mobile reading-flow audit",report.filter(x=>x.ok).length+"/"+report.length);
if(report.some(x=>!x.ok))process.exitCode=1;
