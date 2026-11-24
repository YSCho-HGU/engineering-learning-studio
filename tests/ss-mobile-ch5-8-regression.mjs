import {chromium} from "@playwright/test";
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const navs={5:"#tabs [data-lab]",6:"[data-nav]",7:"#ss7-lesson-nav button",8:"#nav [data-exp]"};
const pair={5:["#page>.ss5-predict","#page>.lab"],6:[".ss6-step-controls",".ss6-step-graphs"],7:[".ss7-stage-change",".ss7-stage-observe"],8:[".ss8-stage-change",".ss8-stage-observe"]};
let checks=0;const issues=[];
await mkdir("qa/ss-mobile-ch5-8",{recursive:true});
function verify(v,label){checks++;if(!v)throw Error(label);}
async function inspect(page,chapter,width,section,collapsed){
 return page.evaluate(({chapter,section,collapsed,selectors})=>{
  const header=document.querySelector(".ss-common-header");
  const side=document.querySelector(".ss-layout-root > .ss-layout-sidebar");
  const main=document.querySelector(".ss-layout-root > .ss-layout-main");
  const root=document.querySelector(".ss-layout-root");
  const box=e=>{if(!e)return null;const b=e.getBoundingClientRect();return{x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height),right:Math.round(b.right),bottom:Math.round(b.bottom)}};
  const a=box(document.querySelector(selectors[0])),b=box(document.querySelector(selectors[1]));
  const cross=(a,b)=>!!a&&!!b&&Math.min(a.right,b.right)-Math.max(a.x,b.x)>8&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>8;
  const h=box(header),s=box(side),m=box(main),r=box(root);
  return {chapter,section,collapsed,viewport:innerWidth,header:h,sidebar:s,main:m,root:r,
    sideState:document.documentElement.dataset.ssSidebar,headerHeight:h?.h||0,
    mainText:(main?.innerText||"").trim().length,overflow:document.documentElement.scrollWidth-innerWidth,
    sideMainCross:cross(s,m),insideCross:cross(a,b),first:a,second:b,
    grid:getComputedStyle(root).display,columns:getComputedStyle(root).gridTemplateColumns,
    visibleRestore:!document.getElementById("ss-sidebar-restore")?.hidden
  };
 },{chapter,section,collapsed,selectors:pair[chapter]});
}
try{
 for(const width of [390,430,768]){
  for(const chapter of [5,6,7,8]){
   const page=await browser.newPage({viewport:{width,height:844},reducedMotion:"reduce"});
   page.addInitScript(()=>{localStorage.setItem("ss-sidebar-collapsed-v1","0")});
   const pageErrors=[];page.on("pageerror",e=>pageErrors.push(e.message));
   try{
    await page.goto(base+"/signals-systems/chapter"+chapter+".html",{waitUntil:"domcontentloaded"});
    const nav=page.locator(navs[chapter]);await nav.first().waitFor({timeout:20000});
    await page.waitForTimeout(220);
    const n=await nav.count();verify(n>=4&&n<30,"Invalid section navigation count "+chapter+":"+n);
    for(const index of [...new Set([0,Math.floor(n/2),n-1])]){
     await nav.nth(index).evaluate(el=>el.click());
     await page.waitForTimeout(120);
     const x=await inspect(page,chapter,width,index+1,false);
     console.log("RESPONSIVE_RESULT "+JSON.stringify(x));
     verify(x.mainText>120,"Chapter "+chapter+" section "+(index+1)+" blank content");
     verify(x.overflow<=8,"Chapter "+chapter+" section "+(index+1)+" horizontal overflow "+x.overflow);
     verify(!x.sideMainCross,"Chapter "+chapter+" section "+(index+1)+" sidebar overlaps main");
     verify(!x.insideCross,"Chapter "+chapter+" section "+(index+1)+" experiment panels intersect");
     verify(x.headerHeight>=58,"Chapter "+chapter+" header stuck at legacy 46px");
     if(width<=600){
      verify(x.grid==="block","Chapter "+chapter+" phone sidebar should stack above main");
      verify(x.main.y>=x.sidebar.bottom-2,"Chapter "+chapter+" main starts inside mobile sidebar");
     }else{
      verify(x.grid==="grid","Chapter "+chapter+" tablet must use two columns");
      verify(x.main.x>=x.sidebar.right-2,"Chapter "+chapter+" tablet sidebar pushes main below");
     }
     if(index===0)await page.screenshot({path:"qa/ss-mobile-ch5-8/ch"+chapter+"-"+width+"-expanded.png",fullPage:false,animations:"disabled"});
    }
    verify(pageErrors.length===0,"Chapter "+chapter+" page errors "+pageErrors.join(" | "));
   }catch(e){issues.push({chapter,width,mode:"expanded",error:e.message});}
   finally{await page.close();}
   const collapsed=await browser.newPage({viewport:{width,height:844},reducedMotion:"reduce"});
   collapsed.addInitScript(()=>localStorage.setItem("ss-sidebar-collapsed-v1","1"));
   try{
    await collapsed.goto(base+"/signals-systems/chapter"+chapter+".html",{waitUntil:"domcontentloaded"});
    await collapsed.locator(navs[chapter]).first().waitFor({state:"attached",timeout:20000});
    await collapsed.waitForTimeout(220);
    const x=await inspect(collapsed,chapter,width,1,true);
    console.log("COLLAPSED_RESULT "+JSON.stringify(x));
    verify(x.sideState==="collapsed","Chapter "+chapter+" persisted collapse not restored");
    verify(x.grid==="grid","Chapter "+chapter+" collapsed view must retain 52px+content grid");
    verify(x.main.x>=x.sidebar.right-2,"Chapter "+chapter+" collapsed rail pushes content BELOW instead of BESIDE rail");
    verify(x.main.y<=x.header.bottom+3,"Chapter "+chapter+" collapsed view must show main directly under header");
    verify(x.main.w>=width-55,"Chapter "+chapter+" collapsed state loses content width");
    verify(x.main.w>=200,"Chapter "+chapter+" collapsed state hides content");
    verify(!x.sideMainCross,"Chapter "+chapter+" collapsed rail overlaps main");
    verify(x.visibleRestore,"Chapter "+chapter+" no restore button");
    verify(x.overflow<=8,"Chapter "+chapter+" collapsed overflow");
    await collapsed.screenshot({path:"qa/ss-mobile-ch5-8/ch"+chapter+"-"+width+"-collapsed.png",fullPage:false,animations:"disabled"});
   }catch(e){issues.push({chapter,width,mode:"collapsed",error:e.message});}
   finally{await collapsed.close();}
  }
 }
}finally{await browser.close();}
for(const x of issues)console.error("MOBILE_FAILURE "+JSON.stringify(x));
console.log("SS mobile Chapter 5-8 checks:",checks,"failures:",issues.length);
assert.deepEqual(issues,[],"Mobile 5-8 layout regression");
