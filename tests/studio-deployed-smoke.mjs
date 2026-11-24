/* Production smoke test for the published monorepo and legacy deep links.
 * Uses an isolated browser profile; never touches real student storage.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin='https://yscho-hgu.github.io';
const root=origin+'/engineering-learning-studio/';
const target=root+'signals-systems/';
const old=origin+'/signals-systems-visual-lab/';
for(const route of [root,target,target+'chapter1.html',target+'chapter5.html']){
 const response=await fetch(route);
 assert.equal(response.status,200,'Production endpoint failed: '+route);
}
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext();
 await ctx.addInitScript(()=>{
  localStorage.setItem('els-language','en');
  localStorage.setItem('els-theme-v2','neutral-dark');
  localStorage.setItem('studio-live-smoke-sentinel','keep-this-data');
 });
 const page=await ctx.newPage();
 const errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)failed.push(r.status()+':'+r.url())});
 const route=old+'chapter5.html?lang=en#lab=2';
 await page.goto(route,{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForURL(url=>url.pathname==='/engineering-learning-studio/signals-systems/chapter5.html',{timeout:20000});
 await page.locator('.ss-layout-sidebar nav button').first().waitFor({state:'visible',timeout:20000});
 const result=await page.evaluate(()=>({
  pathname:location.pathname,
  search:location.search,
  hash:location.hash,
  language:localStorage.getItem('els-language'),
  theme:localStorage.getItem('els-theme-v2'),
  sentinel:localStorage.getItem('studio-live-smoke-sentinel'),
  title:document.title,
  body:document.body.innerText.length
 }));
 assert.equal(result.search,'?lang=en');
 assert.equal(result.hash,'#lab=2');
 assert.equal(result.language,'en');
 assert.equal(result.theme,'neutral-dark');
 assert.equal(result.sentinel,'keep-this-data');
 assert.ok(result.body>200,'Destination content not rendered');
 assert.deepEqual(errors,[],'Browser JavaScript failures');
 assert.deepEqual(failed,[],'Missing deployed assets');
 console.log('PASS deployed Studio and legacy S&S redirect:',JSON.stringify(result));
 // Verify the published (not repository-local) C and SS header implementations.
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});
  for(const [course,route] of [["C",root+"c-programming/functions/"],["SS",target+"chapter5.html"]]){
   await page.goto(route,{waitUntil:"domcontentloaded",timeout:45000});
   await page.waitForFunction(()=>{
    const h=document.querySelector("body > header.els-course-header");
    return h?.dataset.elsHeaderVersion==="3" &&
      h.querySelectorAll(".els-course-header-navigation .ss-chapter-arrow svg").length===4 &&
      getComputedStyle(h).display==="grid";
   },null,{timeout:20000});
   const dims=await page.evaluate(()=>{
    const h=document.querySelector("body > header.els-course-header");
    const a=[...h.querySelectorAll(".els-course-header-navigation .ss-chapter-arrow")].map(e=>e.getBoundingClientRect());
    const r=h.getBoundingClientRect();
    return {headerCenter:r.x+r.width/2,arrowCenter:(a[0].left+a[3].right)/2,
      sameRow:a.every(x=>Math.abs(x.top-a[0].top)<=2),
      fits:a[0].left>=0&&a[3].right<=innerWidth+2,
      dimensions:a.map(x=>[x.width,x.height]),version:h.dataset.elsHeaderVersion};
   });
   assert.ok(Math.abs(dims.headerCenter-dims.arrowCenter)<=8,course+" published header not centered "+JSON.stringify(dims));
   assert.ok(dims.sameRow&&dims.fits,course+" published arrows wrap or overflow");
   assert.ok(dims.dimensions.every(([w,h])=>Math.abs(w-34)<2&&Math.abs(h-34)<2),course+" published arrow sizes mismatch");
   console.log("PASS published "+course+" shared header at "+width+"px");
  }
 }
 await ctx.close();
}finally{await browser.close()}
