import {chromium} from "@playwright/test";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const navs={1:"#nav [data-exp]",2:"[data-nav]",3:"[data-nav]",4:"[data-nav]",5:"#tabs [data-lab]",6:"[data-nav]",7:"#ss7-lesson-nav button",8:"#nav [data-exp]"};
const boxes=[".ss-common-header",".ss-layout-root",".ss-layout-root > .ss-layout-sidebar",".ss-layout-root > .ss-layout-main",".ss-layout-root > .ss7-workspace",".ss-layout-root > .ss8-workspace","main","main h2","main .ss7-standard-layout","main .ss8-standard-layout",".ss5-lab","#page",".ss5-observe"];
const fmt=x=>x===null?null:Math.round(x);
for(const width of [390,430,768]){
 const p=await browser.newPage({viewport:{width,height:844},reducedMotion:"reduce"});
 await p.addInitScript(()=>{localStorage.setItem("ss-sidebar-collapsed-v1","0");});
 for(const chapter of [1,4,5,6,7,8]){
  const errors=[];p.removeAllListeners("pageerror");p.on("pageerror",e=>errors.push(e.message));
  await p.goto(base+"/signals-systems/chapter"+chapter+".html",{waitUntil:"domcontentloaded"});
  await p.locator(navs[chapter]).first().waitFor({timeout:16000});
  await p.waitForTimeout(200);
  const metrics=await p.evaluate((selectors)=>{
   const out={viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,htmlClass:document.documentElement.className,sideState:document.documentElement.dataset.ssSidebar};
   for(const sel of selectors){
    const e=document.querySelector(sel);if(!e)continue;
    const b=e.getBoundingClientRect(),st=getComputedStyle(e);
    out[sel]={x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height),display:st.display,position:st.position,grid:st.gridTemplateColumns?.slice(0,80),top:st.top};
   }
   const R=key=>out[key];
   const side=R(".ss-layout-root > .ss-layout-sidebar"),main=R(".ss-layout-root > .ss-layout-main")||R(".ss-layout-root > .ss7-workspace")||R(".ss-layout-root > .ss8-workspace"),head=R(".ss-common-header");
   out.overlap={sideMain:!!(side&&main&&side.x<main.x+main.w-4&&main.x<side.x+side.w-4&&side.y<main.y+main.h-4&&main.y<side.y+side.h-4),headerSide:!!(side&&head&&side.y<head.y+head.h-3),headerMain:!!(main&&head&&main.y<head.y+head.h-3)};
   out.offenders=[...document.querySelectorAll("body *")].filter(e=>{const r=e.getBoundingClientRect(),st=getComputedStyle(e);return st.display!=="none"&&r.width>20&&r.right>innerWidth+12}).slice(0,12).map(e=>({tag:e.tagName,id:e.id,cl:typeof e.className==="string"?e.className.slice(0,55):"",right:Math.round(e.getBoundingClientRect().right)}));
   return out;
  },boxes);
  console.log("MOBILE_DIAGNOSTIC "+JSON.stringify({chapter,width,errors:errors.slice(0,3),...metrics}));
  // Compare the inside of each teaching section, not only the chapter shell.
  const inside=await p.evaluate(()=>{
   const sels=[
    ".ss5-predict",".ss5-observe",".ss5-flow-label",".ss5-lab",".lab",".panel",".outputs",".plots",".figure",
    ".ss6-control-plot-workspace",".ss6-step-controls",".ss6-step-graphs",".ss6-step-card",".ss6-interpretation",".ss6-observation-header",
    ".ss7-stage-pair",".ss7-stage-change",".ss7-stage-observe",".ss7-stage-explain",
    ".ss8-stage-pair",".ss8-stage-change",".ss8-stage-observe",".ss8-stage-explain",
    ".ss-found-23",".ss-found-controls",".ss-found-observe"
   ];
   const list=[];
   for(const sel of sels){
    const el=document.querySelector(sel);if(!el)continue;
    const b=el.getBoundingClientRect(),c=getComputedStyle(el);
    if(b.width>1&&b.height>1)list.push({sel,x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height),display:c.display,cols:c.gridTemplateColumns?.slice(0,55),z:c.zIndex,position:c.position});
   }
   const clashes=[];
   for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
     const a=list[i],b=list[j];
     const overlapW=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),overlapH=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);
     if(overlapW>Math.min(80,a.w*.4,b.w*.4)&&overlapH>Math.min(80,a.h*.3,b.h*.3)&&a.sel!==".lab"&&a.sel!==".ss5-lab"&&a.sel!==".ss6-control-plot-workspace"&&a.sel!==".ss6-step-card"&&a.sel!==".ss7-stage-pair"&&a.sel!==".ss8-stage-pair")clashes.push([a.sel,b.sel]);
   }
   return {list,clashes};
  });
  console.log("INNER_DIAGNOSTIC "+JSON.stringify({chapter,width,...inside}));
  // Persisted sidebar state can differ between desktop and mobile.
  await p.evaluate(()=>{localStorage.setItem("ss-sidebar-collapsed-v1","1");});
  await p.reload({waitUntil:"domcontentloaded"});
  await p.locator(navs[chapter]).first().waitFor({state:"attached",timeout:15000});
  const collapsed=await p.evaluate(()=>{
   const root=document.querySelector(".ss-layout-root"),sidebar=document.querySelector(".ss-layout-sidebar");
   const main=root?.querySelector(".ss-layout-main"),header=document.querySelector(".ss-common-header");
   const rect=e=>{const b=e?.getBoundingClientRect();return b?{x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}:null};
   return {dataset:document.documentElement.dataset.ssSidebar,header:rect(header),root:rect(root),sidebar:rect(sidebar),main:rect(main),
     contentHidden:!main||rect(main).w<200,overflow:document.documentElement.scrollWidth-innerWidth};
  });
  console.log("COLLAPSED_DIAGNOSTIC "+JSON.stringify({chapter,width,...collapsed}));
  await p.evaluate(()=>{localStorage.setItem("ss-sidebar-collapsed-v1","0");});

 }
 await p.close();
}
await browser.close();
