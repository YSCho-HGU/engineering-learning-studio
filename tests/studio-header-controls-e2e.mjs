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
   if(path.startsWith('signals-systems/'))assert.equal(result.icon,'🌐',path+' language icon');
   // Studio and C course home use an inline language label instead of the
   // chapter header icon; verify the picker value independently below.
   assert.deepEqual(result.labels,options,path+' theme options');
   assert.equal(result.progress,'test-progress',path+' preserved progress');
   assert.equal(result.savedLang,'en',path+' preserved language');
   assert.equal(result.savedTheme,index===0?'neutral-dark':'warm-neutral',path+' saved theme');
   if(index===0){
     // Only the two currently published courses are interactive.
     const active=page.locator("#available-courses .course-card--available");
     const planned=page.locator("#planned-courses .course-card--planned");
     assert.equal(await page.locator(".studio-intro .intro-link").count(),0,"Redundant Explore available courses CTA must be removed");
     assert.equal(await page.locator(".studio-intro a").count(),0,"Hero should not contain extra navigation button");
     const compact=await page.evaluate(()=>{
       const rect=selector=>document.querySelector(selector)?.getBoundingClientRect();
       const hero=rect(".studio-intro"),first=rect(".course-card--available"),grid=rect(".available-grid");
       return {
         heroHeight:hero?.height,firstCardHeight:first?.height,
         firstCardTop:first?.top,gridBottom:grid?.bottom,
         viewport:innerHeight,
         scrollWidth:document.documentElement.scrollWidth
       };
     });
     assert.ok(compact.heroHeight<=(width>=900?230:300),"Hero takes too much vertical space: "+JSON.stringify(compact));
     assert.ok(compact.firstCardHeight<=(width>=900?425:540),"Active course card still too tall: "+JSON.stringify(compact));
     assert.ok(compact.firstCardTop<(width>=900?380:530),"Available courses start too low: "+JSON.stringify(compact));
     if(width>=900)assert.ok(compact.gridBottom<compact.viewport+45,"Available courses should be visible in one desktop viewport: "+JSON.stringify(compact));
     assert.equal(await active.count(),2,"Exactly two active courses");
     assert.equal(await planned.count(),4,"Logic Design onward should all be Coming soon");
     assert.deepEqual(await active.evaluateAll(nodes=>nodes.map(n=>n.dataset.course)),["ss","c"]);
     assert.deepEqual(await planned.evaluateAll(nodes=>nodes.map(n=>n.dataset.course)),["logic","dsp","python","ai"]);
     assert.equal(await page.locator("#gate,#gate-type").count(),0,"Legacy Logic Design mini lab must be removed");
     assert.equal(await page.locator("#planned-courses a").count(),0,"Planned courses cannot be clicked");
     assert.deepEqual(await active.evaluateAll(nodes=>nodes.map(n=>n.getAttribute("href"))),
       ["./signals-systems/","./c-programming/"]);
     const subdued=await page.evaluate(()=>{
       const a=getComputedStyle(document.querySelector(".course-card--available"));
       const p=getComputedStyle(document.querySelector(".course-card--planned"));
       return {active:a.backgroundColor,planned:p.backgroundColor,
         overflow:document.documentElement.scrollWidth-innerWidth};
     });
     assert.notEqual(subdued.active,subdued.planned,"Planned cards should be visually subdued");
     assert.ok(subdued.overflow<=2,"Studio Home horizontal overflow: "+subdued.overflow);
     assert.match(await planned.first().innerText(),/Coming soon/);
     // Q1/Q2: native, theme-aware learning previews (not screenshots or external embeds).
     const signalCard=page.locator('#available-courses [data-course="ss"]');
     const codeCard=page.locator('#available-courses [data-course="c"]');
     assert.equal(await signalCard.locator('.ss-diagram-svg').count(),2,"Input and output signal plots");
     assert.equal(await signalCard.locator('.ss-diagram .system-block').innerText(),"LTI");
     assert.equal(await signalCard.locator('.ss-diagram .flow-arrow').count(),2);
     assert.equal(await signalCard.locator('.course-method').count(),4,"S&S learning topics");
     assert.equal(await codeCard.locator('.course-method').count(),5,"C five-phase workflow");
     assert.match(await codeCard.locator('.c-code-source code').innerText(),/int x = 3/);
     assert.match(await codeCard.locator('.c-code-source code').innerText(),/printf/);
     assert.equal((await codeCard.locator('.c-code-result .result-number').innerText()).trim(),"5");
     const plotted=await signalCard.locator('svg path.signal').evaluateAll(nodes=>nodes.map(n=>n.getAttribute("d")));
     assert.equal(plotted.length,2,"Both paths use real SVG geometry");
     assert.ok(plotted.every(d=>d?.startsWith("M")&&!d.includes("NaN")&&!d.includes("Infinity")));
     for(const theme of ["white-clean","warm-neutral","warm-dark","navy-dark","neutral-dark"]){
       await page.locator('[data-els-theme-picker]').selectOption(theme);
       await page.waitForFunction(t=>document.documentElement.dataset.elsTheme===t,theme);
       const props=await page.evaluate(()=>{
         const panel=getComputedStyle(document.querySelector('.course-preview'));
         const signal=getComputedStyle(document.querySelector('.ss-diagram-svg .signal'));
         const card=getComputedStyle(document.querySelector('.course-card--available'));
         return {panel:panel.backgroundColor,plot:signal.stroke,card:card.backgroundColor};
       });
       assert.notEqual(props.panel,"rgba(0, 0, 0, 0)","Preview surface missing in "+theme);
       assert.notEqual(props.plot,"none","Signal path not themed in "+theme);
     }
     for(const [mode,hasKorean] of [["ko",true],["mixed",true],["en",false]]){
       await page.locator("#lang").selectOption(mode);
       const activeDescription=await active.first().locator("p").innerText();
       const visualText=await page.locator("#available-courses .course-preview, #available-courses .course-methods").allInnerTexts();
       if(hasKorean){
         assert.match(activeDescription,/[가-힣]/,"Missing Korean "+mode);
         assert.ok(visualText.some(v=>/[가-힣]/.test(v)),"Localized diagram labels missing: "+mode);
       }else{
         assert.doesNotMatch(activeDescription,/[가-힣]/,"English-only cards contain Korean");
         assert.ok(visualText.every(v=>!/[가-힣]/.test(v)),"English-only diagram contains Korean");
       }
     }
     await page.locator("#lang").selectOption("en");
     await page.locator('[data-els-theme-picker]').selectOption('warm-neutral');
     await page.waitForFunction(()=>localStorage.getItem('els-theme-v2')==='warm-neutral');
   }
   console.log('PASS '+width+'px '+(path||'Studio Home'));
  }
  assert.deepEqual(errors,[],'browser runtime errors');
  await ctx.close();
 }
}finally{await browser.close();server.kill()}
