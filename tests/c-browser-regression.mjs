import { chromium } from '@playwright/test';
const base=process.env.C_TEST_BASE || 'http://127.0.0.1:8765';
const chapters=['arrays','strings','standard-library','functions','pointer','structure','file-io','dynamic-memory'];
const browser=await chromium.launch({headless:true});
let failures=0;
const results=[];
try{
 for(const name of chapters){
  const page=await browser.newPage({viewport:{width:1366,height:768}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   const response=await page.goto(base+'/c-programming/'+name+'/',{waitUntil:'load',timeout:20000});
   if(!response?.ok())throw Error('HTTP '+response?.status());
   await page.locator('#lesson-nav').waitFor({timeout:12000});
   await page.waitForTimeout(300);
   const title=await page.title();
   const visibleText=await page.locator('body').innerText();
   if(/2026\s*[·•]\s*SELF-STUDY|Learning Journey/.test(visibleText))throw Error('stale heading');
   const sectionButtons=await page.locator('#lesson-nav button').count();
   if(sectionButtons<4)throw Error('too few navigation items: '+sectionButtons);
   const arrows=page.locator('.c-four-navigation .ss-chapter-arrow');
   if(await arrows.count()!==4)throw Error('expected 4 navigation arrows');
   if(name!=='file-io'){
    await page.locator('#lesson h2').waitFor();
    const first=page.locator('#lesson-nav a[href="#lab-1"]');
    if(await first.count()!==1)throw Error('missing guided lab');
    // A student opens the collapsed Guided Labs group before selecting a lab.
    const group=page.locator('#lesson-nav details[data-group="labs"]');
    if(await group.count()!==1)throw Error('missing Guided Labs group');
    if(!await group.evaluate(n=>n.open))await group.locator('summary').click();
    if(!await group.evaluate(n=>n.open))throw Error('Guided Labs did not expand');
    await first.waitFor({state:'visible',timeout:5000});
    await first.click();
    await page.locator('#lesson .c-guided-code-editor').waitFor();
    const editor=page.locator('#lesson .c-guided-code-editor');
    const current=await editor.inputValue();
    await editor.fill(current+'\n/* regression practice */');
    const notes=page.locator('#lesson textarea').last();
    await notes.fill('Prediction: input changes the observed program output.');
    await page.getByRole('button',{name:/Record practice|실습 수행 기록/}).click();
    const stored=await page.evaluate(n=>localStorage.getItem('els-guided-labs-'+n+'-v1'),name);
    if(!stored||!stored.includes('0'))throw Error('guided practice not saved');
    const core=page.locator('#lesson-nav details[data-group="core"]');
    if(await core.count()&& !await core.evaluate(n=>n.open))await core.locator('summary').click();
    await page.locator('#lesson-nav button[data-lesson="0"]').click();
    await page.locator('#lesson h2').waitFor();
   }
   // Reflow smoke test: a chapter should remain navigable in narrow view.
   await page.setViewportSize({width:390,height:844});
   await page.locator('#lesson-nav').waitFor();
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))throw Error('mobile horizontal overflow');
   if(errors.length)throw Error('script errors: '+errors.join(' | ').slice(0,500));
   results.push({name,status:'PASS',title});
  }catch(e){failures++;results.push({name,status:'FAIL',error:String(e.message||e)});}
  await page.close();
 }
}finally{await browser.close();}
for(const row of results)console.log(JSON.stringify(row));
if(failures){console.error(failures+' chapter(s) failed browser regression');process.exitCode=1;}
