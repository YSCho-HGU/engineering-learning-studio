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
 await ctx.close();
}finally{await browser.close()}
