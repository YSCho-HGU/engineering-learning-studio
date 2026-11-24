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
 }
 await p.close();
}
await browser.close();
