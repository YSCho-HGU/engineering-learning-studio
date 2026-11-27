/* Part C FFT educational journey: 7 lessons × 3 languages × desktop/mobile
 * plus the theory guide in three languages at two widths.
 * Run with local server at 8765 or specify SS_TEST_BASE (site root).
 */
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=(process.env.SS_TEST_BASE||'http://127.0.0.1:8765').replace(/\/$/,'');
const lessons=[
 {key:'samples',page:'applications-fft-lab.html',act:{click:'#fft-run'}},
 {key:'resolution',page:'applications-fft-resolution.html',act:{select:'#fft-r-n',value:'128'}},
 {key:'algorithm',page:'applications-dft-fft.html',act:{click:'#same-run'}},
 {key:'dtmf',page:'applications-fft-dtmf.html',act:{click:'#dtmf-fft'}},
 {key:'fingerprint',page:'applications-fft-sound-fingerprint.html',act:{click:'#finger-reset'}},
 {key:'upload',page:'applications-fft-upload.html',act:{click:'#fft-upload-demo'}},
 {key:'image',page:'applications-fft-image.html',act:{click:'#image-reset'}}
];
const output='tests/screenshots/fft-learning';
mkdirSync(output,{recursive:true});
const results=[],failures=[];
const browser=await chromium.launch({headless:true});
async function checkLayout(page,labels){
 return page.evaluate(selectors=>selectors.map(selector=>{
  const el=document.querySelector(selector);
  if(!el)return{selector,missing:true};
  const box=el.getBoundingClientRect();
  const left=box.left,right=box.right,width=box.width;
  const parent=el.parentElement?.getBoundingClientRect();
  return {selector,left,right,width,overflow:left< -5||right>innerWidth+5||width>(parent?.width||width)+8};
 }),labels);
}
try{
 for(const width of [1440,390])for(const language of ['mixed','en','ko']){
  for(const lesson of lessons){
   const meta={type:'lab',lesson:lesson.key,language,width};
   const page=await browser.newPage({viewport:{width,height:920},reducedMotion:'reduce'});
   const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
   try{
    await page.addInitScript(l=>localStorage.setItem('els-language',l),language);
    const response=await page.goto(base+'/signals-systems/'+lesson.page,{waitUntil:'load',timeout:50000});
    assert.ok(response?.ok(),'Page HTTP '+response?.status());
    await page.waitForSelector('#ss-fft-path-top',{timeout:17000});
    await page.waitForSelector('#ss-fft-path-bridge',{timeout:17000});
    const theory=page.locator('#ss-fft-path-top .ss-fft-path-theory');
    const href=await theory.getAttribute('href');
    assert.match(href,/applications-fft-theory\.html#/,'theory deep link missing');
    assert.equal(await theory.getAttribute('target'),'_blank');
    const prediction=page.locator('#ss-fft-path-top .ss-fft-path-select');
    const transfer=page.locator('#ss-fft-path-bridge .ss-fft-path-select');
    await prediction.selectOption('0');
    if(lesson.act.click)await page.locator(lesson.act.click).click();
    if(lesson.act.select)await page.locator(lesson.act.select).selectOption(lesson.act.value);
    await page.waitForFunction(()=>window.SSFFTStudyPath?.getState().touched>0,null,{timeout:10000});
    await transfer.selectOption('0');
    await page.locator('#ss-fft-path-bridge .ss-fft-path-check').click();
    await page.waitForFunction(()=>document.querySelector('#ss-fft-path-bridge .ss-fft-path-feedback')?.dataset.status==='correct',null,{timeout:9000});
    await page.waitForTimeout(150);
    const text=(await page.locator('#ss-fft-path-top').innerText())+'\n'+(await page.locator('#ss-fft-path-bridge').innerText());
    if(language==='en')assert.doesNotMatch(text,/[가-힣]/,'Korean leaked into English lesson');
    if(language==='ko')assert.match(text,/[가-힣]/,'Korean explanation missing');
    if(language==='mixed'){assert.match(text,/[가-힣]/);assert.match(text,/[a-zA-Z]{4}/)}
    const math=page.locator('#ss-fft-path-bridge [data-fft-path-math]');
    const sourceMath=await math.getAttribute('data-tex');
    assert.ok(sourceMath?.length>8,'Current-value math not generated');
    assert.doesNotMatch(sourceMath,/NaN|Infinity|undefined/);
    const rendered=await math.getAttribute('data-rendered');
    if(await page.evaluate(()=>!!window.katex?.render))assert.equal(rendered,'katex','KaTeX not rendered');
    const observations=(await page.locator('#ss-fft-path-bridge [data-fft-path-evidence]').innerText()).trim();
    assert.ok(observations.length>10,'No observable native evidence');
    const layout=await checkLayout(page,['#ss-fft-path-top','#ss-fft-path-bridge']);
    assert.ok(layout.every(x=>!x.missing&&!x.overflow),'Card layout overflow: '+JSON.stringify(layout));
    assert.deepEqual(pageErrors.slice(0,3),[],'Unexpected JS runtime errors');
    results.push({...meta,result:'pass',rendered});
   }catch(e){
    const issue={...meta,result:'fail',error:String(e),pageErrors};
    failures.push(issue);results.push(issue);
    if(failures.length<=12)try{await page.screenshot({path:output+'/'+lesson.key+'-'+language+'-'+width+'.png',fullPage:true})}catch(_){}
   }finally{await page.close()}
  }
  const meta={type:'theory',language,width};
  const page=await browser.newPage({viewport:{width,height:940},reducedMotion:'reduce'});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  try{
   await page.addInitScript(l=>localStorage.setItem('els-language',l),language);
   const response=await page.goto(base+'/signals-systems/applications-fft-theory.html#samples',{waitUntil:'load',timeout:50000});
   assert.ok(response?.ok(),'Theory page HTTP '+response?.status());
   await page.waitForFunction(()=>document.querySelectorAll('.fft-guide-topic').length===7,null,{timeout:12000});
   const headings=await page.locator('.fft-guide-topic h2').allTextContents();
   assert.equal(headings.length,7);
   const sample=await page.locator('#guide-explorer-result').innerText();
   assert.match(sample,/0\.18750/,'Initial k/N example wrong');
   await page.locator('#guide-known').check();
   const known=await page.locator('#guide-explorer-result').innerText();
   assert.match(known,/1500\.00 Hz/,'Known sample-rate conversion wrong');
   await page.locator('#guide-k').fill('13');
   const negative=await page.locator('#guide-explorer-result').innerText();
   assert.match(negative,/-1500\.00 Hz/,'Signed upper-half DFT bin wrong');
   const math=page.locator('#guide-explorer-tex');
   assert.match(await math.getAttribute('id'),/guide-explorer-tex/);
   const nav=await page.locator('#guide-toc a').count();
   assert.equal(nav,7);
   const body=(await page.locator('#guide-title').innerText())+'\n'+(await page.locator('#guide-figure-note').innerText())+'\n'+headings[0];
   if(language==='en')assert.doesNotMatch(body,/[가-힣]/);
   if(language==='ko')assert.match(body,/[가-힣]/);
   if(language==='mixed'){assert.match(body,/[가-힣]/);assert.match(body,/[A-Za-z]{4}/)}
   const layout=await checkLayout(page,['.fft-guide-hero','.fft-guide-explorer','.fft-guide-toc']);
   assert.ok(layout.every(x=>!x.missing&&!x.overflow),'Theory layout overflow: '+JSON.stringify(layout));
   assert.deepEqual(pageErrors.slice(0,3),[],'Unexpected theory JS error');
   results.push({...meta,result:'pass'});
  }catch(e){
   const issue={...meta,result:'fail',error:String(e),pageErrors};
   failures.push(issue);results.push(issue);
   if(failures.length<=12)try{await page.screenshot({path:output+'/theory-'+language+'-'+width+'.png',fullPage:true})}catch(_){}
  }finally{await page.close()}
 }
}finally{await browser.close()}
writeFileSync(output+'/report.json',JSON.stringify({base,results},null,2));
console.log('FFT learning browser QA '+(results.length-failures.length)+'/'+results.length+' passed');
for(const f of failures.slice(0,30))console.log(JSON.stringify(f));
if(failures.length)process.exitCode=1;
