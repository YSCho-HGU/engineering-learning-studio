import {chromium} from 'playwright';
import {readFileSync} from 'node:fs';
const published=JSON.parse(readFileSync('c-programming/course-catalog.json','utf8')).chapters.filter(c=>c.published);
const browser=await chromium.launch({headless:true});
let failures=[];
const widths=[320,375,390,768,1024,1440];
for(const theme of ['neutral-dark','warm-neutral']){
 for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
  await context.addInitScript(theme=>localStorage.setItem('els-theme-v2',theme),theme);
  const page=await context.newPage();
  page.on('pageerror',e=>failures.push(theme+' '+width+' JS: '+e.message));
  await page.goto('http://127.0.0.1:8765/c-programming/',{waitUntil:'load'});
  await page.locator('#units .unit').first().waitFor({state:'attached'});
  const result=await page.evaluate(()=>{
   const doc=document.documentElement;
   const overflow=doc.scrollWidth>innerWidth+2;
   const nav=document.querySelector('.header-nav');
   const hero=document.querySelector('.course-intro');
   const cards=[...document.querySelectorAll('.path-card')];
   return {overflow,scrollWidth:doc.scrollWidth,viewport:innerWidth,navWidth:nav.getBoundingClientRect().width,heroWidth:hero.getBoundingClientRect().width,cardCount:cards.length,theme:doc.dataset.elsTheme,links:[...document.querySelectorAll('a[href^="./"]')].map(a=>a.getAttribute('href'))};
  });
  if(result.overflow)failures.push(theme+' '+width+' horizontal overflow: '+result.scrollWidth);
  if(result.cardCount!==published.length)failures.push(theme+' '+width+' missing learning cards');
  if(result.theme!==theme)failures.push(theme+' '+width+' theme not applied: '+result.theme);
  await page.screenshot({path:'qa-c-'+theme+'-'+width+'.png',fullPage:true});
  if(width===375){
   const summary=page.locator('.roadmap-panel summary');
   await summary.click();
   if(!(await page.locator('.roadmap-panel').evaluate(e=>e.open)))failures.push(theme+' '+width+' roadmap failed');
  }
  await context.close();
 }
}
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('C Programming visual smoke checks passed: 12 viewport/theme combinations.');
