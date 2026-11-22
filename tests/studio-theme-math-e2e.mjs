/* Whole-course theme/math browser audit: eight Signals chapters x five palettes.
 * Confirms shared WCAG color variables, computed text contrast, TeX engine,
 * and absence of runtime errors without mutating student localStorage.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
const port=8791,root='http://127.0.0.1:'+port+'/signals-systems/';
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{stdio:'ignore'});
await new Promise(resolve=>setTimeout(resolve,1200));
const browser=await chromium.launch({headless:true});
const themes=['white-clean','warm-neutral','warm-dark','navy-dark','neutral-dark'];
const results=[];
const lum=s=>{const m=s.match(/[\d.]+/g);if(!m||m.length<3)return null;const rgb=m.slice(0,3).map(x=>Number(x)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return x===null||y===null?null:(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
let failures=0;
try{
 for(const theme of themes){
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});
  await ctx.addInitScript(value=>{localStorage.setItem('els-theme-v2',value);localStorage.setItem('els-language','en')},theme);
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(root)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
  for(let chapter=1;chapter<=8;chapter++){
   errors.length=0;
   let sample;
   try{
    const response=await page.goto(root+'chapter'+chapter+'.html',{waitUntil:'domcontentloaded',timeout:40000});
    await page.waitForTimeout(350);
    sample=await page.evaluate(()=>{
     const root=document.documentElement,style=getComputedStyle(root);
     const main=document.querySelector('.ss-layout-main')||document.querySelector('main')||document.body;
     const count=document.querySelectorAll('.katex,.mjx-container,mjx-container').length;
     const colorProps=[['body','--els-ink','--els-page'],['surface','--els-ink','--els-surface'],['secondary','--els-muted','--els-surface'],['code','--els-code-ink','--els-code-bg']];
     const colors=colorProps.map(([name,fg,bg])=>({name,fg:style.getPropertyValue(fg).trim(),bg:style.getPropertyValue(bg).trim()}));
     const mathRoots=[...document.querySelectorAll('.katex,.mjx-container,mjx-container')].filter(x=>x.getClientRects().length>0);
     const mathOverflow=mathRoots.filter(x=>{const b=x.getBoundingClientRect();return b.right>innerWidth+24||b.left< -24}).length;
     return {theme:root.dataset.elsTheme,mainText:main.textContent.length,mathCount:count,mathOverflow,
       katexLoaded:typeof window.katex?.render==='function',colors};
    });
    const pairs=sample.colors.map(x=>({...x,ratio:contrast(x.fg,x.bg)}));
    const bad=pairs.filter(x=>x.ratio===null||x.ratio<4.5-1e-8);
    const issues=[...errors];
    if(response.status()!==200)issues.push('HTTP '+response.status());
    if(sample.theme!==theme)issues.push('wrong palette '+sample.theme);
    if(sample.mainText<400)issues.push('main content absent');
    if(!sample.katexLoaded)issues.push('KaTeX engine unavailable');
    if(sample.mathOverflow>0)issues.push(sample.mathOverflow+' overflowed math elements');
    if(bad.length)issues.push('contrast '+JSON.stringify(bad));
    results.push({chapter,theme,mathCount:sample.mathCount,issues});
    console.log((issues.length?'FAIL':'PASS')+' Chapter '+chapter+' '+theme+' math='+sample.mathCount+' '+issues.join(' | '));
    failures+=issues.length>0?1:0;
   }catch(e){failures++;results.push({chapter,theme,issues:[String(e)]});console.error('FAIL Chapter '+chapter+' '+theme+': '+e)}
  }
  await ctx.close();
 }
}finally{await browser.close();server.kill()}
fs.mkdirSync('qa-theme-math',{recursive:true});
fs.writeFileSync('qa-theme-math/report.json',JSON.stringify(results,null,2));
console.log('S&S all-chapter theme/math '+(results.length-failures)+'/'+results.length+' combinations passed');
assert.equal(failures,0,'Chapter/theme math and contrast regressions');
