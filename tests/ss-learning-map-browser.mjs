/* Signals & Systems integrated Learning Map browser QA.
 * Scenarios: 3 language modes × 2 widths, plus route switching and transform map.
 * Run from repository root with server at http://127.0.0.1:8765:
 * node tests/ss-learning-map-browser.mjs
 */
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=(process.env.SS_TEST_BASE||'http://127.0.0.1:8765').replace(/\/$/,'');
const out='tests/screenshots/ss-learning-map';
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[],errors=[];
try{
 for(const width of [1440,390])for(const mode of ['mixed','en','ko']){
  const item={width,mode};
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const pageErrors=[];page.on('pageerror',err=>pageErrors.push(err.message));
  try{
   await page.addInitScript(m=>localStorage.setItem('els-language',m),mode);
   const response=await page.goto(base+'/signals-systems/index.html#map',{waitUntil:'load',timeout:55000});
   assert.ok(response?.ok(),'HTTP '+response?.status());
   await page.locator('#map-view').waitFor({state:'visible',timeout:20000});
   await page.waitForFunction(()=>!!window.SSLearningJourney&&document.querySelectorAll('.ss-j-chapter-card').length===8,null,{timeout:15000});
   assert.equal(await page.locator('.ss-j-chapter-card').count(),8);
   assert.equal(await page.locator('.ss-j-branch').count(),3);
   assert.equal(await page.locator('.ss-j-route-button').count(),3);
   assert.ok(await page.locator('#map-full #tm-root').count()>0,'Existing transform map missing');
   const linkCount=await page.locator('#ss-learning-journey a').count();
   assert.ok(linkCount>=24,'Chapter to lab navigation links missing');
   for(const id of ['signals','systems','fft']){
    await page.locator('.ss-j-route-button[data-route-id="'+id+'"]').click();
    assert.equal(await page.locator('.ss-j-route-button[aria-pressed="true"]').getAttribute('data-route-id'),id);
    assert.equal(await page.locator('.ss-j-stage').count(),6);
    const hrefs=await page.locator('.ss-j-stage a').evaluateAll(els=>els.map(a=>a.getAttribute('href')));
    assert.ok(hrefs.some(s=>s?.includes('chapter')||s?.includes('applications-')),'Path missing lab links');
   }
   const labels=(await page.locator('#ss-learning-journey').innerText())+'\n'+await page.locator('#ss-map-heading').innerText();
   if(mode==='en')assert.doesNotMatch(labels,/[가-힣]/,'Unexpected Korean in English-only map');
   if(mode==='ko')assert.match(labels,/[가-힣]/,'Korean map empty');
   if(mode==='mixed'){assert.match(labels,/[가-힣]/);assert.match(labels,/[A-Za-z]{4}/)}
   // A language change on the map must preserve the chosen route without resetting any chapter.
   await page.evaluate(()=>window.ELSLanguage.set('ko'));
   await page.waitForFunction(()=>document.querySelector('.ss-j-route-button[aria-pressed="true"]')?.dataset.routeId==='fft',null,{timeout:8000});
   assert.match(await page.locator('#ss-map-heading').innerText(),/[가-힣]/);
   const overflow=await page.evaluate(()=>{
    const selectors=['#ss-learning-journey','.ss-j-overview','.ss-j-routes','.ss-j-catalogue','.ss-j-finish'];
    return selectors.map(selector=>{
     const element=document.querySelector(selector),r=element?.getBoundingClientRect();
     const par=element?.parentElement?.getBoundingClientRect();
     if(!r)return {selector,missing:true};
     return {selector,left:r.left,right:r.right,
      offscreen:r.left< -5||r.right>innerWidth+5,
      outsideParent:r.width>(par?.width||r.width)+8};
    });
   });
   assert.ok(overflow.every(r=>!r.missing&&!r.offscreen&&!r.outsideParent),'Card overflow '+JSON.stringify(overflow));
   assert.ok((await page.locator('.ss-j-steps').evaluate(e=>e.scrollWidth))>=0);
   // Existing graph remains interactive: select one relationship and verify detail.
   await page.locator('#tm-root [data-tm-edge]').first().click();
   const detail=(await page.locator('#tm-detail').innerText()).trim();
   assert.ok(detail.length>=20,'Transform detail stopped updating');
   assert.deepEqual(pageErrors.slice(0,3),[],'JS runtime errors');
   results.push({...item,result:'pass',links:linkCount});
  }catch(e){
   const failure={...item,result:'fail',error:String(e),pageErrors};
   errors.push(failure);results.push(failure);
   if(errors.length<=10)try{await page.screenshot({path:out+'/map-'+mode+'-'+width+'.png',fullPage:true})}catch(_){}
  }finally{await page.close()}
 }
}finally{await browser.close()}
writeFileSync(out+'/report.json',JSON.stringify({base,results},null,2));
console.log('Learning Map browser QA '+(results.length-errors.length)+'/'+results.length+' passed');
for(const failure of errors)console.log(JSON.stringify(failure));
if(errors.length)process.exitCode=1;
