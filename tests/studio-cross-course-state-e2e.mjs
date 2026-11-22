import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.STUDIO_BASE_URL||'http://127.0.0.1:8788/';
const browser=await chromium.launch({headless:true});
const pages=['index.html','c-programming/arrays/','c-programming/file-io/','signals-systems/','signals-systems/chapter5.html'];
const runs=[];
try{
 for(const lang of ['en','ko','mixed']){
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  await ctx.addInitScript(mode=>{
   localStorage.setItem('els-language',mode);
   localStorage.setItem('els-theme-v2','neutral-dark');
   localStorage.setItem('els-journey-arrays-v1','[0,1]');
   localStorage.setItem('els-migration-sentinel','retained');
  },lang);
  const page=await ctx.newPage(),errors=[],bad=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)bad.push(r.status()+':'+r.url())});
  for(const route of pages){
   const res=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForTimeout(350);
   const snapshot=await page.evaluate(()=>({
    language:localStorage.getItem('els-language'),
    theme:localStorage.getItem('els-theme-v2'),
    sentinel:localStorage.getItem('els-migration-sentinel'),
    progress:localStorage.getItem('els-journey-arrays-v1'),
    markupLanguage:document.documentElement.dataset.elsLanguage,
    hasMain:!!document.body&&document.body.innerText.length>80
   }));
   assert.equal(res.status(),200,route+' HTTP');
   assert.equal(snapshot.language,lang,route+' language preference');
   assert.equal(snapshot.theme,'neutral-dark',route+' theme preference');
   assert.equal(snapshot.sentinel,'retained',route+' cross-course storage');
   assert.equal(snapshot.progress,'[0,1]',route+' progress unchanged');
   assert.ok(snapshot.hasMain,route+' contents');
   runs.push({lang,route,status:'PASS'});
  }
  assert.deepEqual(bad,[],lang+' broken internal resources');
  assert.deepEqual(errors,[],lang+' browser runtime errors');
  await ctx.close();
 }
}finally{await browser.close()}
console.log('PASS: '+runs.length+' Studio/C/S&S route+language+theme+progress checks.');
