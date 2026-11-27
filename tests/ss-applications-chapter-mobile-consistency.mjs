/* Compare Chapter 1-8 and Applications at identical mobile widths. */
import assert from "node:assert/strict";
import {chromium} from "playwright";
import {mkdirSync,writeFileSync} from "node:fs";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const chapters=Array.from({length:8},(_,i)=>"chapter"+(i+1)+".html");
const applications=["applications.html","applications-lab.html?lab=harmonics","applications-system-lab.html?lab=rc","applications-system-compare.html","applications-fft-lab.html","applications-fft-resolution.html","applications-dft-fft.html","applications-fft-dtmf.html","applications-fft-sound-fingerprint.html","applications-fft-upload.html","applications-fft-image.html","applications-chirp-stft.html","applications-audio-filter.html","applications-chirp-echo.html"];
const routes=[...chapters,...applications];
mkdirSync("qa/ss-chapter-app-consistency",{recursive:true});
const browser=await chromium.launch({headless:true});
const report=[],issues=[];
for(const width of [390,768]){
 for(const route of routes){
  const page=await browser.newPage({viewport:{width,height:844}});
  try{
   const res=await page.goto(base+"/signals-systems/"+route,{waitUntil:"load",timeout:35000});
   assert(res?.ok(),route+" HTTP "+res?.status());
   await page.waitForTimeout(220);
   const row=await page.evaluate(()=>{
    const header=document.querySelector("header.ss-common-header"),body=document.body;
    const lang=header?.querySelector("select.ss-common-language-select"),theme=header?.querySelector("select[data-els-theme-picker]");
    const nav=header?.querySelector("nav.ss-four-navigation"),summary=header?.querySelector(".ss-common-title"),home=header?.querySelector(".ss-common-home");
    const main=document.querySelector("main")||document.querySelector(".ss-layout-main")||document.querySelector("#page");
    const sidebar=document.querySelector(".ss-layout-sidebar");
    const geom=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),right:Math.round(r.right),bottom:Math.round(r.bottom)}};
    const controls=[...header?.querySelectorAll("select,button,a,summary")||[]].filter(el=>!!el.getClientRects().length);
    const clipped=controls.filter(el=>{const r=el.getBoundingClientRect();return r.width<12||r.right>innerWidth+4||r.left< -4}).map(el=>({tag:el.tagName,cls:el.className?.toString().slice(0,65),rect:geom(el)}));
    return {viewport:innerWidth,docWidth:document.documentElement.scrollWidth,
      controlsClipped:clipped,arrows:nav?.querySelectorAll(".ss-chapter-arrow").length||0,
      sidebarPresent:!!sidebar,headerPresent:!!header,languagePresent:!!lang,themePresent:!!theme,
      langOptions:lang?[...lang.options].map(x=>x.value):[],themeOptions:theme?[...theme.options].map(x=>x.value):[],
      header:geom(header),summary:geom(summary),home:geom(home),lang:geom(lang),theme:geom(theme),nav:geom(nav),main:geom(main),sidebar:geom(sidebar),
      fontSize:getComputedStyle(body).fontSize,lineHeight:getComputedStyle(body).lineHeight,
      headerDisplay:header?getComputedStyle(header).display:null};
   });
   const chapter=route.startsWith("chapter"),fail=[];
   if(!row.headerPresent||!row.languagePresent||!row.themePresent)fail.push("missing shared header controls");
   if(row.docWidth>width+6)fail.push("horizontal overflow "+row.docWidth);
   if(row.controlsClipped.length){fail.push("header controls outside viewport");console.log("CLIPPED",route,width,JSON.stringify(row.controlsClipped));}
   if(row.header?.h>140)fail.push("header too tall "+row.header.h);
   if(chapter&&!row.sidebarPresent)fail.push("chapter sidebar missing");
   if(chapter&&row.arrows!==4)fail.push("chapter navigation arrows missing");
   if(!row.main||row.main.w<width*.45)fail.push("main content collapsed");
   if(row.langOptions.join(",")!=="mixed,en,ko")fail.push("language modes incorrect");
   if(row.themeOptions.join(",")!=="white-clean,warm-neutral,warm-dark,navy-dark,neutral-dark")fail.push("theme order incorrect");
   const label=route+" @"+width;
   report.push({label,chapter,geometry:row,issues:fail});
   if(fail.length)issues.push({label,fail});
   console.log(fail.length?"FAIL":"PASS",label,JSON.stringify({headerHeight:row.header?.h,arrows:row.arrows,font:row.fontSize,doc:row.docWidth,main:row.main?.w,issues:fail}));
   if(width===390&&["chapter4.html","chapter6.html","chapter8.html","applications.html","applications-lab.html?lab=harmonics","applications-fft-lab.html","applications-audio-filter.html"].includes(route))
     await page.screenshot({path:"qa/ss-chapter-app-consistency/"+route.replace(/[^a-z0-9]+/gi,"-")+"-390.png",fullPage:true,animations:"disabled"});
  }catch(e){issues.push({label:route+" @"+width,fail:[String(e)]});console.error("FAIL",route,width,String(e))}
  finally{await page.close()}
 }
}
await browser.close();
const stats=rows=>({medianHeader:[...rows.map(r=>r.geometry.header?.h||0)].sort((a,b)=>a-b)[Math.floor(rows.length/2)],
 arrows:rows.reduce((o,r)=>(o[r.geometry.arrows]=(o[r.geometry.arrows]||0)+1,o),{}),
 fontSizes:[...new Set(rows.map(x=>x.geometry.fontSize))],withoutNav:rows.filter(x=>!x.geometry.nav).map(x=>x.label)});
const summary={chapters:stats(report.filter(x=>x.chapter)),applications:stats(report.filter(x=>!x.chapter)),passed:report.length-issues.length,total:routes.length*2,issues};
writeFileSync("qa/ss-chapter-app-consistency/summary.json",JSON.stringify(summary,null,2));
writeFileSync("qa/ss-chapter-app-consistency/report.json",JSON.stringify(report,null,2));
console.log("Chapter/Application mobile consistency",summary.passed+"/"+summary.total,JSON.stringify(summary).slice(0,6000));
if(issues.length)process.exitCode=1;
