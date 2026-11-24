/** Applications A/B/D visual and functional browser QA: A has six live, B three live + four planned, D planned. */
import {chromium} from "playwright";
import assert from "node:assert/strict";
import {mkdir,writeFile} from "node:fs/promises";
import {fileURLToPath,pathToFileURL} from "node:url";
import path from "node:path";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"artifacts","applications-abd-visual-qa");
await mkdir(output,{recursive:true});
const labs=["harmonics","chirp","helix","beats","amfm","sampling"];
const browser=await chromium.launch({headless:true});
const p=await browser.newPage({viewport:{width:1366,height:850},deviceScaleFactor:1});
const errs=[];p.on("pageerror",e=>errs.push(e.message));
const url=(name,search="")=>pathToFileURL(path.join(root,"signals-systems",name)).href+search;
const photo=(label)=>p.screenshot({path:path.join(output,label+".png"),fullPage:true,animations:"disabled",timeout:20000});
const theme=p=>p.locator("[data-els-theme-picker]");
async function inspectHub(part,view){
 const result=await p.evaluate(part=>{
  const main=document.querySelector(".ss-app-container"),section=document.querySelector("#part-"+part);
  const row=section.querySelector(part==="d"?".ss-app-abd-planned-summary":".ss-app-abd-lab-row");
  const title=row.querySelector(".ss-app-lesson-title"),card=row.closest(".ss-app-abd-planned")||row,s=getComputedStyle(card),topicList=section.querySelector("#topics-"+part),collection=topicList.firstElementChild;
  return{
   header:!!document.querySelector("header.ss-common-header"),
   heading:getComputedStyle(title).fontSize,
   radius:s.borderTopLeftRadius,
   padding:s.paddingTop,
   overflow:document.documentElement.scrollWidth-innerWidth,
   rowWidth:row.getBoundingClientRect().width,
   panelWidth:main.getBoundingClientRect().width,
   topicGridWidth:topicList.getBoundingClientRect().width,
   collectionWidth:collection.getBoundingClientRect().width
  };
 },part);
 assert.ok(result.header,"Standard header lost on "+part);
 assert.ok(result.rowWidth>150,"Card collapsed "+part);
 assert.ok(result.collectionWidth>=result.topicGridWidth*.94,"Module collection unexpectedly half width "+part+" "+JSON.stringify(result));
 assert.ok(parseFloat(result.radius)>=10,"Card radius differs "+part);
 assert.ok(parseFloat(result.heading)>=(view==="mobile"?15:16),"Card heading too small "+part);
 assert.ok(result.overflow<=3,"Document overflow "+part+" "+JSON.stringify(result));
 return result;
}
const measured=[];
try{
 await p.goto(url("applications.html","#part-a"));
 await p.locator("#topics-a .ss-app-abd-lab-row").first().waitFor({state:"visible"});
 for(const area of ["a","b","d"]){
  assert.equal(await p.locator("#topics-"+area+" .ss-app-abd-lab-row").count(),area==="a"?6:area==="b"?3:0);
  assert.equal(await p.locator("#topics-"+area+" .ss-app-abd-planned").count(),area==="a"?0:area==="b"?4:6);
 }
 assert.equal(await p.locator("#topics-c .ss-app-lesson-row").count(),7,"Do not alter FFT Part C");
 const hrefs=await p.locator("#topics-a .ss-app-abd-lab-row").evaluateAll(a=>a.map(x=>x.getAttribute("href")));
 assert.deepEqual(hrefs,labs.map(l=>"./applications-lab.html?lab="+l));
 for(const part of ["b","d"]){
  if(part==="b")await p.locator("#topics-b .ss-app-future summary").first().click();
  assert.equal(await p.locator("#topics-"+part+" .ss-app-abd-planned[open]").count(),0);
  assert.equal(await p.locator("#topics-"+part+" .ss-app-abd-planned-summary a").count(),0,"Planned topic must not be a fake lab link");
  await p.locator("#topics-"+part+" .ss-app-abd-planned-summary").first().click();
  assert.ok(await p.locator("#topics-"+part+" .ss-app-abd-question").first().isVisible(),"Planned question hidden");
  assert.ok((await p.locator("#topics-"+part+" .ss-app-abd-observe").first().innerText()).length>10,"Planned exploration missing");
  assert.ok(await p.locator("#topics-"+part+" .ss-app-topic-labs a").first().isVisible(),"Chapter links lost");
  await p.locator("#topics-"+part+" .ss-app-abd-planned-summary").first().click();
  if(part==="b")await p.locator("#topics-b .ss-app-future summary").first().click();
 }
 for(const lang of ["en","ko"]){
  await p.locator(".ss-common-language-select").selectOption(lang);
  const title=await p.locator("#topics-a .ss-app-lesson-title").first().innerText();
  assert.ok(lang==="en"?!/[가-힣]/.test(title):/[가-힣]/.test(title),"Part A translation "+lang);
  const planned=await p.locator("#topics-b .ss-app-abd-planned-tag").first().innerText();
  assert.ok(lang==="en"?/Planned/.test(planned):/개발 예정/.test(planned),"Planned status translation "+lang);
 }
 await p.locator(".ss-common-language-select").selectOption("en");
 for(const [view,width,height,themeName] of [["dark",1366,850,"neutral-dark"],["white",1366,850,"white-clean"],["mobile",390,844,"neutral-dark"]]){
  await p.setViewportSize({width,height});
  await theme(p).selectOption(themeName);
  for(const part of ["a","b","d"]){
   const measurement=await inspectHub(part,view);
   measured.push({type:"catalog",part,view,...measurement});
  }
  await photo("catalog-"+view);
 }
 console.log("PASS Part A: 6 labs. Part B: 3 labs + 4 planned. Part D: 6 planned. No fake links.");
 for(const lab of labs){
  await p.setViewportSize({width:1366,height:850});
  await p.goto(url("applications-lab.html","?lab="+lab));
  await p.locator("#ss-al-controls").waitFor({state:"visible"});
  await p.locator("#ss-al-plot-title-1").waitFor({state:"visible"});
  assert.equal(await p.locator('link[href*="ss-app-abd-visual-standard.css"]').count(),1,"Shared CSS missing "+lab);
  assert.ok(await p.locator("header.ss-common-header").isVisible(),"Header missing "+lab);
  assert.ok((await p.locator("#ss-al-title").innerText()).length>4,lab+": title missing");
  const canvas=p.locator("#ss-al-canvas-1");
  const painted=await canvas.evaluate(el=>{
   const data=el.getContext("2d",{willReadFrequently:true})?.getImageData(0,0,el.width,el.height).data;
   if(!data)return {width:0,height:0,unique:0};
   const colors=new Set();
   const step=Math.max(4,Math.floor(data.length/1200/4)*4);
   for(let i=0;i<data.length;i+=step)colors.add(data[i]+","+data[i+1]+","+data[i+2]);
   return{width:el.width,height:el.height,unique:colors.size};
  });
  assert.ok(painted.width>100&&painted.height>100&&painted.unique>2,lab+": canvas not painted "+JSON.stringify(painted));
  for(const [view,width,height,t] of [["dark",1366,850,"neutral-dark"],["white",1366,850,"white-clean"],["mobile",390,844,"neutral-dark"]]){
   await p.setViewportSize({width,height});
   await theme(p).selectOption(t);
   const measure=await p.evaluate(()=>{
    const root=document.querySelector("main.ss-al-root"),card=root.querySelector(".ss-al-plot"),plot=card.querySelector("canvas");
    const title=card.querySelector("h2"),eq=root.querySelector(".ss-al-equation");
    const controls=root.querySelector(".ss-al-controls");
    return {
     cardPadding:getComputedStyle(card).paddingTop,
     cardRadius:getComputedStyle(card).borderTopLeftRadius,
     plotTitle:getComputedStyle(title).fontSize,
     formulaSize:getComputedStyle(eq).fontSize,
     controlsPadding:getComputedStyle(controls).paddingTop,
     graphWidth:plot.getBoundingClientRect().width,
     overflow:document.documentElement.scrollWidth-window.innerWidth
    };
   });
   assert.equal(parseFloat(measure.cardPadding),view==="mobile"?12:14,lab+": card spacing "+JSON.stringify(measure));
   assert.equal(parseFloat(measure.controlsPadding),view==="mobile"?12:14,lab+": control spacing "+JSON.stringify(measure));
   assert.equal(parseFloat(measure.plotTitle),view==="mobile"?15:16,lab+": plot title size "+JSON.stringify(measure));
   assert.ok(parseFloat(measure.formulaSize)>=17,lab+": equation too small");
   assert.ok(measure.graphWidth>120,lab+": graph missing");
   assert.ok(measure.overflow<=3,lab+": viewport overflow "+JSON.stringify(measure));
   measured.push({type:"lab",lab,view,...measure});
   await photo(lab+"-"+view);
  }
  await p.locator("#ss-al-reset").click();
  assert.ok(await p.locator("#ss-al-plot-title-1").isVisible(),lab+": reset broke plotted view");
  assert.equal(await p.locator(".katex-error").count(),0,lab+": invalid math syntax");
  console.log("PASS Part A lab "+lab+": chart, controls, math, themes, mobile");
 }
 assert.equal(errs.length,0,"Uncaught JS page errors: "+errs.join(" | "));
 await writeFile(path.join(output,"measured-layout.json"),JSON.stringify(measured,null,2));
 console.log("ALL APPLICATIONS A/B/D VISUAL QA CHECKS PASSED");
}catch(e){
 try{await photo("failure")}catch{}
 throw e;
}finally{await p.close();await browser.close()}
