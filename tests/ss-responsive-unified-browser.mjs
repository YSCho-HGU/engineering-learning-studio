import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
const browser=await chromium.launch({headless:true});
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const sizes=[{name:"lecture",width:1920,height:1080},{name:"desktop",width:1366,height:850},{name:"tablet",width:768,height:1024},{name:"mobile",width:390,height:844}];
const chapters=[1,2,3,4,5,6,7,8];
const navs={1:"#nav [data-exp]",2:"[data-nav]",3:"[data-nav]",4:"[data-nav]",5:"#tabs [data-lab]",6:"[data-nav]",7:"#ss7-lesson-nav button",8:"#nav [data-exp]"};
const appRoutes=["applications.html",...["harmonics","chirp","helix","beats","amfm","sampling"].map(x=>"applications-lab.html?lab="+x),"applications-fft-lab.html","applications-fft-resolution.html","applications-chirp-stft.html"];
const reports=[],issues=[];
await mkdir("qa/responsive-screenshots",{recursive:true});
function check(data,label){
 reports.push({label,...data});
 if(data.overflow>8||data.mainWidth<150||data.invalidGraphs.length)
   issues.push({label,overflow:data.overflow,mainWidth:data.mainWidth,invalidGraphs:data.invalidGraphs,offenders:data.offenders});
}
async function measure(page){
 return page.evaluate(()=>{
  const main=document.querySelector("main"),rect=main?.getBoundingClientRect();
  const graphNodes=[...(main?.querySelectorAll("canvas,svg")||[])].filter(el=>{
   const b=el.getBoundingClientRect();
   const semantic=el.tagName==="CANVAS"||el.matches("svg[role=img],svg[aria-label]");
   const largePlot=b.width>=120&&b.height>=75;
   return (semantic||largePlot)&&b.width>25&&b.height>20&&getComputedStyle(el).visibility!=="hidden";
  });
  const invalidGraphs=graphNodes.filter(el=>{const b=el.getBoundingClientRect();return b.width<80||b.height<55}).map(el=>({tag:el.tagName,id:el.id}));
  const excess=Math.max(0,document.documentElement.scrollWidth-innerWidth);
  const offenders=excess>8?[...document.querySelectorAll("body *")].filter(el=>el.getBoundingClientRect().right>innerWidth+8).slice(0,8).map(el=>({tag:el.tagName,id:el.id,cls:typeof el.className==="string"?el.className:""})):[];
  return {overflow:excess,mainWidth:Math.round(rect?.width||0),graphCount:graphNodes.length,invalidGraphs,offenders,theme:document.documentElement.dataset.elsTheme};
 });
}
for(const view of sizes){
 const page=await browser.newPage({viewport:{width:view.width,height:view.height},reducedMotion:"reduce"});
 try{
  for(const chapter of chapters){
   const resp=await page.goto(base+"/signals-systems/chapter"+chapter+".html",{waitUntil:"domcontentloaded",timeout:30000});
   if(!resp?.ok())throw Error("HTTP "+resp?.status());
   const nav=page.locator(navs[chapter]);await nav.first().waitFor({timeout:10000});
   const count=await nav.count();
   const mode=page.locator("#ss-presentation-toggle");
   if(await mode.count()!==1)issues.push({chapter,view:view.name,reason:"Presentation control missing"});
   if(view.width===1920&&await mode.count()){
    await mode.click();
    const active=await page.evaluate(()=>document.documentElement.dataset.ssPresentation==="on");
    const clicked=await mode.getAttribute("aria-pressed");
    if(!active||clicked!=="true")issues.push({chapter,reason:"Presentation mode failed to activate"});
    check(await measure(page),"Presentation Ch"+chapter+" "+view.name);
    await page.keyboard.press("Escape");
    if(await page.evaluate(()=>document.documentElement.dataset.ssPresentation==="on"))
       issues.push({chapter,reason:"Presentation mode Escape failed"});
   }

   const indices=view.width<=768?Array.from({length:count},(_,i)=>i):[0,count-1];
   for(const index of indices){
    await nav.nth(index).evaluate(el=>el.click());
    await page.waitForTimeout(50);
    check(await measure(page),"Ch"+chapter+" Section "+(index+1)+" "+view.name);
   }
   if([1,5,7,8].includes(chapter)&&view.width!==1366)
    await page.screenshot({path:"qa/responsive-screenshots/ch"+chapter+"-"+view.name+".png",fullPage:false});
  }
  for(const route of appRoutes){
   const resp=await page.goto(base+"/signals-systems/"+route,{waitUntil:"domcontentloaded",timeout:30000});
   if(!resp?.ok())throw Error("HTTP "+resp?.status());
   await page.waitForTimeout(100);
   const label=route.replace(/[^a-z0-9]+/gi,"-");
   const mode=page.locator("#ss-presentation-toggle");
   if(await mode.count()!==1)issues.push({route,view:view.name,reason:"Presentation control missing"});
   if(view.width===1920&&await mode.count()){
     await mode.click();
     if(await mode.getAttribute("aria-pressed")!=="true")issues.push({route,reason:"Presentation mode not enabled"});
     check(await measure(page),"Presentation Applications "+route+" "+view.name);
     if(route.includes("fft")){
       const sight=await page.evaluate(()=>{
         const controls=document.querySelector(".ss-fft-controls,.ss-fft-r-controls");
         const graph=document.querySelector(".ss-fft-graphs svg,.ss-fft-r-graphs svg");
         const a=controls?.getBoundingClientRect(),b=graph?.getBoundingClientRect();
         return{controlsVisible:!!a&&a.top<innerHeight&&a.bottom>0,
           graphVisible:!!b&&b.top<innerHeight&&b.bottom>0,
           graphWidth:b?.width||0,controlsWidth:a?.width||0};
       });
       if(!sight.controlsVisible||!sight.graphVisible||sight.graphWidth<260||sight.controlsWidth<220)
         issues.push({route,reason:"Projector controls and graph not simultaneously readable",sight});
     }
     await page.keyboard.press("Escape");
     if(await mode.getAttribute("aria-pressed")!=="false")issues.push({route,reason:"Presentation mode not restored"});
   }

   check(await measure(page),"Applications "+route+" "+view.name);
   if(["applications-fft-lab.html","applications-fft-resolution.html","applications-lab.html?lab=sampling"].includes(route)&&view.width!==1366)
    await page.screenshot({path:"qa/responsive-screenshots/"+label+"-"+view.name+".png",fullPage:false});
  }
 }catch(e){issues.push({view:view.name,error:String(e.message||e)})}
 finally{await page.close()}
}
await browser.close();
await writeFile("qa/ss-responsive-unified-results.json",JSON.stringify({timestamp:new Date().toISOString(),reports,issues},null,2));
console.log("Responsive browser QA:",reports.length,"states,",issues.length,"issues");
issues.slice(0,40).forEach(issue=>console.error("ISSUE",JSON.stringify(issue)));
if(issues.length)process.exitCode=1;
