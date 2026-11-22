import {chromium} from 'playwright';
import {readFileSync} from 'node:fs';
const chapters=[['131','arrays'],['132','strings'],['133','standard-library'],['141','functions']];
const catalog=JSON.parse(readFileSync('c-programming/course-catalog.json','utf8'));
const counts=Object.fromEntries(chapters.map(([id,slug])=>[id,JSON.parse(readFileSync('c-programming/'+slug+'/data.js','utf8').replace(/^window\.C_JOURNEY=/,'').replace(/;\s*$/,'')).lessons.length]));
const browser=await chromium.launch({headless:true});
const issues=[];let views=0;
for(const width of [390,1280]){
 const ctx=await browser.newContext({viewport:{width,height:900}});
 await ctx.addInitScript(()=>localStorage.setItem('els-theme-v2','neutral-dark'));
 const page=await ctx.newPage();
 page.on('pageerror',e=>issues.push(width+' JS: '+e.message));
 await page.goto('http://127.0.0.1:8765/c-programming/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelectorAll('#available-chapters .path-card').length>0);
 const expected=catalog.chapters.filter(c=>c.published).length;
 const actual=await page.locator('#available-chapters .path-card').count();
 if(actual!==expected)issues.push(width+' expected '+expected+' published cards, found '+actual);
 for(const [id,slug] of chapters){
  const entry=catalog.chapters.find(c=>c.id===id);
  if(!entry?.published)issues.push(id+' should be published');
  await page.goto('http://127.0.0.1:8765/c-programming/'+slug+'/',{waitUntil:'networkidle'});
  await page.locator('#lesson-nav button').first().waitFor();
  if(await page.locator('#lesson-nav button').count()!==counts[id])issues.push(id+' navigation count');
  if(await page.locator('.journey-next a.journey-practice-link').count()!==1)issues.push(id+' coding challenge destination missing');
  for(let i=0;i<counts[id];i++){
   const target=page.locator('#lesson-nav button').nth(i);
    await target.evaluate(b=>{const group=b.closest("details.c-learning-group");if(group)group.open=true});
    await target.click();
   const name=await page.locator('#lesson h2').first().textContent();
   if(!name?.trim())issues.push(id+' step '+i+' empty');
   const model=await page.locator('#lesson output').first().textContent();
   if(!model||model.includes('Model not configured'))issues.push(id+' step '+i+' model missing');
   if(await page.locator('#lesson .quiz input[type=radio]').count()!==3)issues.push(id+' step '+i+' missing quiz');
  }
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+4))issues.push(width+' '+id+' horizontal overflow');
  await page.screenshot({path:'qa-c-'+slug+'-'+width+'.png',fullPage:false});
  await page.goto('http://127.0.0.1:8765/c-programming/'+slug+'/practice/',{waitUntil:'networkidle'});
  await page.locator('.cp-nav-item').first().waitFor();
  if(await page.locator('.cp-nav-item').count()!==6)issues.push(id+' missing practice tasks');
  await page.locator('.cp-nav-item').nth(5).click();
  if(!await page.locator('textarea').first().inputValue())issues.push(id+' empty task editor');
  views++;
 }
 await ctx.close();
}
await browser.close();
console.log('Browser views:',views,'widths 390/1280; dynamic lesson counts',counts);
if(issues.length){console.error(issues.join('\n'));process.exit(1)}
console.log('PASS: 4 chapters with variable-length learning journeys and coding tasks accessible.');
