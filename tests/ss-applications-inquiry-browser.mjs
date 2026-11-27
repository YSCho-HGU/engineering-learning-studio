/* 36 Playwright scenarios: 6 application lessons × 3 language modes × 2 viewports.
 * Exercises real learner choices and checks live evidence and no card overflow.
 * Start a local HTTP server on 8765, or set SS_TEST_BASE to a published site root.
 */
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=(process.env.SS_TEST_BASE||'http://127.0.0.1:8765').replace(/\/$/,'');
const contexts=[
 {name:'chirp',kind:'a',url:'/signals-systems/applications-lab.html?lab=chirp',answer:'0',transfer:'0'},
 {name:'helix',kind:'a',url:'/signals-systems/applications-lab.html?lab=helix',answer:'0',transfer:'0'},
 {name:'amfm',kind:'a',url:'/signals-systems/applications-lab.html?lab=amfm',answer:'1',transfer:'0'},
 {name:'rc',kind:'b',url:'/signals-systems/applications-system-lab.html?lab=rc',answer:'0',transfer:'0',
  buttons:['ss-sys-demo-one','ss-sys-demo-two']},
 {name:'moving-average',kind:'b',url:'/signals-systems/applications-system-lab.html?lab=moving-average',answer:'0',transfer:'0',
  buttons:['ss-sys-demo-one','ss-sys-demo-two']},
 {name:'compare',kind:'b',url:'/signals-systems/applications-system-compare.html',answer:'0',transfer:'0',
  buttons:['cmp-example-fair','cmp-example-step']}
];
const browser=await chromium.launch({headless:true});
const out='tests/screenshots/ss-applications-inquiry';
mkdirSync(out,{recursive:true});
const report=[],errors=[];
try{
for(const width of [1440,390])for(const mode of ['mixed','en','ko'])for(const test of contexts){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 const jsErrors=[];page.on('pageerror',e=>jsErrors.push(e.message));
 const task={lab:test.name,width,mode};
 try{
  await page.addInitScript(lang=>localStorage.setItem('els-language',lang),mode);
  const response=await page.goto(base+test.url,{waitUntil:'load',timeout:50000});
  if(!response?.ok())throw Error('HTTP '+response?.status());
  const root=test.kind==='a'?page.locator('#ss-al-guidance[data-inquiry="'+test.name+'"]'):page.locator('#ss-b-inquiry');
  await root.waitFor({timeout:18000});
  const inputs=root.locator('select');
  if(await inputs.count()!==(test.kind==='a'?2:1))throw Error('Expected initial prediction control(s)');
  await inputs.first().selectOption(test.answer);
  if(test.kind==='a'){
   await root.locator('[data-scenario="1"]').click();
   await root.locator('[data-scenario="2"]').click();
   await root.locator('select').last().selectOption(test.transfer);
   await root.locator('.ss-inquiry-verify').click();
   const status=root.locator('.ss-inquiry-feedback');
   if(await status.getAttribute('data-result')!=='correct')throw Error('Part A verification did not pass: '+await status.innerText());
   await page.locator('#ss-al-metrics .ss-al-metric').first().waitFor();
  }else{
   for(const id of test.buttons)await page.locator('#'+id).click();
   await page.waitForTimeout(150);
   await page.locator('#ss-b-transfer select').selectOption(test.transfer);
   await page.locator('#ss-b-transfer .ss-b-inquiry-check').click();
   await page.waitForFunction(()=>document.querySelector('#ss-b-inquiry-next')?.hidden===false,null,{timeout:6000});
   const progress=await root.locator('.ss-b-inquiry-progress').innerText();
   if(!progress.includes('2 / 2'))throw Error('Both prepared scenarios not recorded: '+progress);
   const evidence=page.locator('#ss-b-evidence');
   await evidence.waitFor();
   const equation=await evidence.locator('.ss-b-evidence-equation').getAttribute('data-math-state');
   if(equation==='error')throw Error('Part B KaTeX parse failed');
   if((await evidence.locator('.ss-b-evidence-values').innerText()).trim().length<10)throw Error('Missing live result');
  }
  const text=await root.innerText()+(test.kind==='b'?'\n'+await page.locator('#ss-b-transfer').innerText():'');
  if(mode==='en'&&/[가-힣]/.test(text))throw Error('Korean in English-only inquiry');
  if(mode==='ko'&&!/[가-힣]/.test(text))throw Error('Korean absent in Korean inquiry');
  if(mode==='mixed'&&(!/[가-힣]/.test(text)||!/[A-Za-z]{3}/.test(text)))throw Error('Bilingual content missing');
  const overflow=await page.evaluate(kind=>{
   const selectors=kind==='a'?['#ss-al-guidance']:['#ss-b-inquiry','#ss-b-evidence','#ss-b-transfer'];
   return selectors.map(selector=>{
    const e=document.querySelector(selector);if(!e)return {selector,missing:true};
    const r=e.getBoundingClientRect(),parent=e.parentElement?.getBoundingClientRect();
    return {selector,width:r.width,offscreen:r.left < -6||r.right>innerWidth+6,
      largerThanParent:r.width>(parent?.width||r.width)+6,
      scroll:e.scrollWidth>e.clientWidth+10};
   });
  },test.kind);
  if(overflow.some(x=>x.missing||x.offscreen||x.largerThanParent||x.scroll))
   throw Error('Evidence layout overflow '+JSON.stringify(overflow));
  if(jsErrors.length)throw Error('JavaScript errors: '+jsErrors.slice(0,4).join(' | '));
  report.push({...task,result:'pass'});
 }catch(e){
  const issue={...task,result:'fail',error:String(e)};
  errors.push(issue);report.push(issue);
  if(errors.length<=10)try{await page.screenshot({path:out+'/'+test.name+'-'+mode+'-'+width+'.png',fullPage:true})}catch(_){}
 }finally{await page.close()}
}
}finally{await browser.close()}
writeFileSync(out+'/report.json',JSON.stringify({base,results:report},null,2));
console.log('Applications Inquiry QA: '+(report.length-errors.length)+'/'+report.length+' passed');
for(const e of errors.slice(0,25))console.log(JSON.stringify(e));
if(errors.length)process.exitCode=1;
