#!/usr/bin/env node
/* Shared low-glare theme QA: all Studio and C routes, palette contrast and live selection. */
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const results=[],failures=[];
function check(cond,msg){results.push({pass:!!cond,msg});if(!cond)failures.push(msg)}
const pages=[
 'index.html','c-programming/index.html','c-programming/learning-journey/index.html',
 'c-programming/pointer/index.html','c-programming/structure/index.html',
 'c-programming/pointer/practice/index.html','c-programming/structure/practice/index.html',
 'c-programming/file-io/index.html','c-programming/file-io/practice/index.html'
];
const css=fs.readFileSync('assets/els-theme-v2.css','utf8'),js=fs.readFileSync('assets/els-theme-v2.js','utf8');
const palettes=['neutral-dark','warm-dark','navy-dark','warm-neutral'];
for(const p of pages){
 const source=fs.readFileSync(p,'utf8');
 check(source.includes('els-theme-v2.css'),p+': palette stylesheet present');
 check(source.includes('els-theme-v2.js'),p+': palette selector present');
 check(source.includes('els-theme-v2')&&source.includes('Apply selected palette before CSS paint.'),p+': first-paint bootstrap present');
}
for(const p of palettes){check(css.includes('data-els-theme="'+p+'"'),p+': CSS palette present');check(js.includes('"'+p+'"'),p+': JS palette supported')}
check(js.includes('localStorage.setItem(KEY,v)'), 'persistent shared setting');
check(js.includes('window.addEventListener("storage"'), 'cross-tab synchronization');
function luminance(hex){const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]}
function contrast(a,b){const [v,w]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (v+.05)/(w+.05)}
const known=[
 ['neutral-dark','#101010','#f0f0ed','#c1c5c1','#1c1c1c'],
 ['warm-dark','#1d2323','#e5e9e3','#bdc9c2','#293130'],
 ['navy-dark','#101827','#edf3fa','#c1cfdf','#1c293a'],
 ['warm-neutral','#f7f6f2','#28312f','#51665b','#fffefa']
];
for(const [name,bg,ink,muted,panel] of known){
 check(contrast(bg,ink)>=4.5,name+': foreground/background WCAG AA text contrast');
 check(contrast(bg,muted)>=4.5,name+': muted/background WCAG AA text contrast');
 check(contrast(panel,ink)>=4.5,name+': panel/foreground WCAG AA text contrast');
}
let browserStatus='NOT_RUN';
if(process.env.C_JOURNEY_BROWSER==='1'){
 let server,browser;
 try{
  const {chromium}=await import('playwright');
  server=spawn('python3',['-m','http.server','8891','--bind','127.0.0.1'],{stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1000));
  browser=await chromium.launch({headless:true});
  for(const w of [390,1280]){
   for(const path of pages){
    const page=await browser.newPage({viewport:{width:w,height:850}});
    const exceptions=[];page.on('pageerror',e=>exceptions.push(String(e)));
    const rsp=await page.goto('http://127.0.0.1:8891/'+path,{waitUntil:'domcontentloaded'});
    check(rsp?.status()===200,path+'/'+w+': HTTP 200');
    check(await page.evaluate(()=>document.documentElement.dataset.elsTheme)==='neutral-dark',path+'/'+w+': neutral-dark default');
    const themeSelect=page.locator('[data-els-theme-picker]').first();
    check(await themeSelect.count()===1,path+'/'+w+': theme picker visible');
    await themeSelect.selectOption('warm-neutral');
    check(await page.evaluate(()=>document.documentElement.dataset.elsTheme)==='warm-neutral',path+'/'+w+': theme switches without navigation');
    check(await page.evaluate(()=>localStorage.getItem('els-theme-v2'))==='warm-neutral',path+'/'+w+': theme is persisted');
    await themeSelect.selectOption('neutral-dark');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+8),path+'/'+w+': no overflow');
    check(exceptions.length===0,path+'/'+w+': no JS errors '+exceptions.join(';'));
    await page.close();
   }
  }
  // Cross-course persistence: same browser context and origin.
  const context=await browser.newContext();
  let page=await context.newPage();
  await page.goto('http://127.0.0.1:8891/c-programming/pointer/');
  await page.locator('[data-els-theme-picker]').selectOption('warm-dark');
  await page.goto('http://127.0.0.1:8891/c-programming/file-io/');
  check(await page.evaluate(()=>document.documentElement.dataset.elsTheme)==='warm-dark','theme persisted across C chapters');
  await page.close();await context.close();
  browserStatus='RAN';
 }catch(e){check(false,'Theme browser QA failed: '+String(e))}
 finally{if(browser)await browser.close();if(server)server.kill()}
}
fs.mkdirSync('qa-output',{recursive:true});
const report={status:failures.length?'FAIL':'PASS',browserStatus,passed:results.filter(x=>x.pass).length,total:results.length,failures,results};
fs.writeFileSync('qa-output/els-theme-qa.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,browserStatus,passed:report.passed,total:report.total,failures},null,2));
if(failures.length)process.exitCode=1;
