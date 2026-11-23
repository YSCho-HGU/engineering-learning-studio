import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const views=[{name:"projector",width:1920,height:1080},{name:"desktop",width:1366,height:850},{name:"tablet",width:768,height:1024},{name:"phone",width:390,height:844}];
const navs={1:"#nav [data-exp]",2:"[data-nav]",3:"[data-nav]",4:"[data-nav]",5:"#tabs [data-lab]",6:"[data-nav]",7:"#ss7-lesson-nav button",8:"#nav [data-exp]"};
const issues=[],states=[];
await mkdir("qa/plot-typography-screenshots",{recursive:true});
for(const view of views){
 const page=await browser.newPage({viewport:{width:view.width,height:view.height},reducedMotion:"reduce"});
 await page.addInitScript(()=>{
  const old=CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText=function(value,x,y,...rest){
   try{
    const canvas=this.canvas,txt=String(value),font=this.font;
    if(canvas&&txt.trim()&&canvas.closest("main")){
     const m=this.getTransform(),tx=m.a*x+m.c*y+m.e,ty=m.b*x+m.d*y+m.f;
     const n=Number((font.match(/(\d+(?:\.\d+)?)px/)||[])[1]||0);
     const entry={canvasId:canvas.id,text:txt.slice(0,45),font,size:n,x:tx,y:ty,width:canvas.width,height:canvas.height};
     (window.__ssCanvasTextEvents ||= []).push(entry);
     if(window.__ssCanvasTextEvents.length>5000)window.__ssCanvasTextEvents.splice(0,1000);
    }
   }catch(_){}return old.call(this,value,x,y,...rest)
  };
 });
 try{
  for(let chapter=1;chapter<=8;chapter++){
   const resp=await page.goto(base+"/signals-systems/chapter"+chapter+".html",{waitUntil:"domcontentloaded",timeout:30000});
   if(!resp?.ok())throw Error("HTTP "+resp?.status());
   const nav=page.locator(navs[chapter]);await nav.first().waitFor({timeout:14000});
   const count=await nav.count();
   const indices=view.width===1920||view.width===390?Array.from({length:count},(_,i)=>i):[0,count-1];
   for(const section of indices){
    await page.evaluate(()=>window.__ssCanvasTextEvents=[]);
    await nav.nth(section).evaluate(el=>el.click());
    await page.waitForTimeout(70);
    const audit=await page.evaluate(()=>{
     const entries=window.__ssCanvasTextEvents||[];
     const main=document.querySelector("main");
     const svgs=[...main.querySelectorAll("svg[role=img]")].filter(e=>e.getClientRects().length);
     const ticks=[...main.querySelectorAll("svg text.ss-plot-tick")].filter(e=>e.getClientRects().length);
     const axes=[...main.querySelectorAll("svg text.ss-plot-axis-title")].filter(e=>e.getClientRects().length);
     const legends=[...main.querySelectorAll(".legend,.ss-al-legend")].filter(e=>e.getClientRects().length);
     const sizes={tick:window.SSCanvasTypography?.size?.("tick"),axis:window.SSCanvasTypography?.size?.("axis")};
     return{
      textCount:entries.length,smallFonts:entries.filter(x=>x.size&&x.size<10).slice(0,5),
      fontSizes:[...new Set(entries.map(x=>x.size))].sort((a,b)=>a-b),
      canvasClips:entries.filter(x=>x.x < -27||x.y < -27||x.x > x.width+27||x.y > x.height+27).slice(0,6),
      svgs:svgs.length,svgTicks:ticks.length,svgAxes:axes.length,
      svgTickSizes:[...new Set(ticks.map(e=>Math.round(parseFloat(getComputedStyle(e).fontSize))))],
      svgAxisSizes:[...new Set(axes.map(e=>Math.round(parseFloat(getComputedStyle(e).fontSize))))],
      legendSizes:[...new Set(legends.map(e=>Math.round(parseFloat(getComputedStyle(e).fontSize))))],
      sizes,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth)
     };
    });
    const label="Ch"+chapter+" section"+(section+1)+" "+view.name;
    states.push({label,...audit});
    if(chapter<=6&&(!Number.isFinite(audit.sizes.tick)||!Number.isFinite(audit.sizes.axis)||audit.sizes.axis<audit.sizes.tick))
      issues.push({label,reason:"invalid shared Canvas font policy",sizes:audit.sizes});
    if(audit.smallFonts.length)issues.push({label,reason:"canvas font below 10px",sample:audit.smallFonts});
    if(audit.canvasClips.length)issues.push({label,reason:"Canvas label positioned beyond bounds",sample:audit.canvasClips});
    if((chapter===7||chapter===8)&&audit.svgs&&(!audit.svgTicks||!audit.svgAxes))
      issues.push({label,reason:"SVG plot ticks or axes lack semantics",audit});
    if(audit.overflow>8)issues.push({label,reason:"horizontal overflow",px:audit.overflow});
   }
   if([1,2,5,6,7,8].includes(chapter)&&(view.name==="projector"||view.name==="phone"))
    await page.screenshot({path:"qa/plot-typography-screenshots/ch"+chapter+"-"+view.name+".png",fullPage:false});
  }
 }catch(e){issues.push({view:view.name,error:String(e.message||e)})}
 finally{await page.close()}
}
await browser.close();
await writeFile("qa/ss-plot-typography-audit.json",JSON.stringify({testedAt:new Date().toISOString(),states,issues},null,2));
console.log("Plot typography QA:",states.length,"states",issues.length,"issues");
for(const issue of issues.slice(0,30))console.error("ISSUE",JSON.stringify(issue).slice(0,900));
if(issues.length)process.exitCode=1;
