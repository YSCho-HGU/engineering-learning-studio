import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=8789,base='http://127.0.0.1:'+port+'/signals-systems/';
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{stdio:'ignore'});
await new Promise(resolve=>setTimeout(resolve,1200));
const browser=await chromium.launch({headless:true});
const expected=['White Clean','Warm Neutral','Warm Dark','Navy Dark','Neutral Dark'];
try{
 for(const width of [390,1280]){
  const ctx=await browser.newContext({viewport:{width,height:850}});
  await ctx.addInitScript(()=>{localStorage.setItem('els-language','en');localStorage.setItem('els-theme-v2','neutral-dark')});
  const page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const view of ['#overview','#map']){
   await page.goto(base+'index.html'+view,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>!!window.ELSTheme?.get());
   const selector=page.locator('#ss-language-select');
   const icon=page.locator('.ss-common-actions .ss-language-icon');
   assert.equal(await icon.count(),1,width+' '+view+' globe icon');
   assert.equal((await icon.textContent()).trim(),'🌐');
   assert.equal(await selector.inputValue(),'en');
   const options=await page.locator('#theme-select option').allTextContents();
   assert.deepEqual(options,expected,width+' '+view+' theme order');
   assert.equal(await page.locator('#theme-select').inputValue(),'neutral-dark');
   assert.ok(!options.some(x=>x.includes('기본')),'No default label');
   await selector.selectOption('mixed');
   assert.equal(await page.evaluate(()=>localStorage.getItem('els-language')),'mixed');
   await selector.selectOption('en');
   await page.locator('#theme-select').selectOption('warm-neutral');
   assert.equal(await page.evaluate(()=>localStorage.getItem('els-theme-v2')),'warm-neutral');
  }
  await page.goto(base+'chapter5.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.ELSTheme?.get());
  assert.deepEqual(await page.locator('[data-els-theme-picker] option').allTextContents(),expected,'chapter theme order');
  assert.equal(await page.locator('[data-els-theme-picker]').inputValue(),'warm-neutral','theme maintained across map -> chapter');
  assert.equal(await page.locator('.ss-common-language .ss-language-icon').count(),1,'chapter language icon');
  assert.deepEqual(errors,[],'browser errors');
  await ctx.close();
  console.log('PASS language globe and light-to-dark theme order across Overview, Learning Map, Chapter 5 at '+width+'px');
 }
}finally{await browser.close();server.kill()}
