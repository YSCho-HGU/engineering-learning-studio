/* Shared header integration: Studio Home, C Home, S&S Overview and Ch1–8.
 * Browser selection and course progress must survive navigation.
 */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=8793,base='http://127.0.0.1:'+port+'/';
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,1200));
const browser=await chromium.launch({headless:true});
const options=['White Clean','Warm Neutral','Warm Dark','Navy Dark','Neutral Dark'];
const paths=['','c-programming/','signals-systems/index.html#overview','signals-systems/index.html#map',...Array.from({length:8},(_,i)=>'signals-systems/chapter'+(i+1)+'.html')];
try{
 for(const width of [390,1280]){
  const ctx=await browser.newContext({viewport:{width,height:860}});
  await ctx.addInitScript(()=>{
   if(!sessionStorage.getItem('els-header-init')){
    localStorage.setItem('els-language','en');
    localStorage.setItem('els-theme-v2','neutral-dark');
    localStorage.setItem('els-journey-arrays-v1','test-progress');
    sessionStorage.setItem('els-header-init','1');
   }
  });
  const page=await ctx.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const [index,path] of paths.entries()){
   const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>window.ELSHeaderControls&&window.ELSTheme,{timeout:18000});
   const result=await page.evaluate(()=>{
     const header=document.querySelector('.ss-common-header,.site-header,body > header');
     const lang=header?.querySelector('#lang,#c-language,.ss-common-language-select,#ss-language-select');
     const theme=header?.querySelector('[data-els-theme-picker]');
     const icon=header?.querySelector('.els-header-language-icon,.ss-language-icon');
     return {icon:icon?.textContent?.trim(),labels:theme?[...theme.options].map(x=>x.text):[],
       language:lang?.value,theme:theme?.value,progress:localStorage.getItem('els-journey-arrays-v1'),
       savedLang:localStorage.getItem('els-language'),savedTheme:localStorage.getItem('els-theme-v2')};
   });
   if(response)assert.equal(response.status(),200,path+' status');
   assert.equal(result.icon,'🌐',path+' language icon');
   assert.deepEqual(result.labels,options,path+' theme options');
   assert.equal(result.progress,'test-progress',path+' preserved progress');
   assert.equal(result.savedLang,'en',path+' preserved language');
   assert.equal(result.savedTheme,index===0?'neutral-dark':'warm-neutral',path+' saved theme');
   if(index===0){
     await page.locator('[data-els-theme-picker]').selectOption('warm-neutral');
     await page.waitForFunction(()=>localStorage.getItem('els-theme-v2')==='warm-neutral');
   }
   console.log('PASS '+width+'px '+(path||'Studio Home'));
  }
  assert.deepEqual(errors,[],'browser runtime errors');
  await ctx.close();
 }
}finally{await browser.close();server.kill()}
