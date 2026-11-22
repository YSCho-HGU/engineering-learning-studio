#!/usr/bin/env node
// Independent course evidence: C11 compile/run + browser interactions + content contract.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync,spawn} from 'node:child_process';
const root=process.cwd(),reports=[],errors=[],lessons=[];
function check(condition,msg){reports.push({item:msg,pass:!!condition});if(!condition)errors.push(msg)}
for(const kind of ['pointer','structure']){
 const base=path.join(root,'c-programming',kind);
 const scope={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(base,'data.js'),'utf8'),scope,{timeout:5000});
 const data=scope.window.C_JOURNEY;
 check(data.lessons.length===8,kind+': eight lessons');
 check(data.practice.length===6,kind+': six independent coding exercises');
 check(new Set(data.lessons.map(l=>l.title)).size===8,kind+': distinct lessons');
 check(data.lessons.every(l=>l.quiz.options.length===3 && Number.isInteger(l.quiz.correct) && l.quiz.correct>=0 && l.quiz.correct<l.quiz.options.length && String(l.quiz.options[l.quiz.correct]).trim().length>0),kind+': quiz answer key points to a valid nonempty option');
 check(new Set(data.lessons.map(l=>l.quiz.correct)).size===3,kind+': nonfixed answer position');
 check(data.lessons.every(l=>l.goal&&l.concept&&l.transfer&&l.guide&&l.model&&l.code),kind+': complete pedagogical evidence');
 check(data.practice.every(p=>p.starter.includes('TODO')&&p.expected),kind+': standalone practice starter and reference');
 check(data.lessons.every(l=>Array.isArray(l.trace)&&l.trace.length>=2),kind+': every C lesson has a line-by-line trace');
 check(data.lessons.every(l=>l.trace.every(t=>l.code.includes(t.match)&&t.state&&t.meaning)),kind+': every trace line matches the literal C reference');
 check(data.lessons.every(l=>new Set(l.quiz.options).size===3),kind+': distinct conceptual distractors');
 check(data.lessons.every((l,i)=>!l.layout||Array.isArray(l.layout.cells)&&l.layout.cells.every(cell=>cell.label&&cell.offset&&cell.value)),kind+': array/struct layout cells carry labels and symbolic offsets');
 check(data.lessons.every((l,i)=>!l.layout||l.layout.note&&/(sizeof|ABI|offset|padding|pointer|4-byte int|one-past)/i.test(l.layout.note)),kind+': each layout includes platform caveat');
 check(data.lessons.every((l,i)=>kind==='structure'&&i===6 || l.trace.some(t=>t.state.replaceAll(String.fromCharCode(92)+"n",String.fromCharCode(10)).includes(l.output))),kind+': trace output corresponds to reference C stdout');

 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 for(const id of ['lesson','lesson-nav','progress-text','progress-bar','hero-count','theme'])
  check(html.includes('id="'+id+'"'),kind+': DOM target '+id);
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'c-journey-'));
 for(let i=0;i<data.lessons.length;i++){
  const lesson=data.lessons[i],src=path.join(temp,'case'+i+'.c'),exe=path.join(temp,'case'+i);
  fs.writeFileSync(src,lesson.code);
  const build=spawnSync('gcc',['-std=c11','-Wall','-Wextra','-Wpedantic','-Werror',src,'-o',exe],{encoding:'utf8'});
  check(build.status===0,kind+' lesson '+(i+1)+' GCC strict build '+(build.stderr||'').slice(0,180));
  if(build.status===0){
   const run=spawnSync(exe,[],{encoding:'utf8',timeout:3000});
   check(run.status===0,kind+' lesson '+(i+1)+' executes');
   const observed=(run.stdout||'').trim();
   if(kind==='structure'&&i===6)check(observed==='1'&&lesson.code.includes('sizeof(struct S) >= sizeof(char) + sizeof(int)'),kind+' sizeof checks member-size lower bound without asserting ABI-specific bytes');
   else check(observed===lesson.output.trim(),kind+' lesson '+(i+1)+' expected-output match: '+JSON.stringify(observed));
  }
 }
 fs.rmSync(temp,{recursive:true,force:true});
 lessons.push({kind,data});
}
for(const file of ['c-programming/journey.js','c-programming/pointer/data.js','c-programming/structure/data.js']){
 const status=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 check(status.status===0,file+' JS syntax '+(status.stderr||'').slice(0,200));
}
let browserStatus='NOT_RUN';
if(process.env.C_JOURNEY_BROWSER==='1'){
 try{
  const {chromium}=await import('playwright');
  const server=spawn('python3',['-m','http.server','8776','--bind','127.0.0.1'],{stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const browser=await chromium.launch({headless:true});
  try{
   for(const kind of ['pointer','structure'])for(const width of [390,1280])for(const theme of ['light','dark']){
    const page=await browser.newPage({viewport:{width,height:820},colorScheme:theme});
    const pageErrors=[];
    page.on('pageerror',e=>pageErrors.push(String(e)));
    const response=await page.goto('http://127.0.0.1:8776/c-programming/'+kind+'/',{waitUntil:'domcontentloaded'});
    check(response?.status()===200,kind+'/'+width+'/'+theme+': route serves HTTP 200');
    check(await page.evaluate(()=>[...document.styleSheets].some(x=>x.href?.includes('journey.css'))),kind+'/'+width+'/'+theme+': course CSS loaded');
    check(await page.evaluate(()=>getComputedStyle(document.body).fontSize!=='0px'),kind+'/'+width+'/'+theme+': body text computed style');
    const themePicker=page.locator('#theme');
    check(await themePicker.evaluate(el=>el.tagName==='SELECT'&&el.hasAttribute('data-els-theme-picker')),kind+'/'+width+'/'+theme+': shared theme picker');
    await themePicker.selectOption(theme==='light'?'white-clean':'neutral-dark');
    check(await page.evaluate(()=>document.documentElement.dataset.elsTheme)===(theme==='light'?'white-clean':'neutral-dark'),kind+'/'+width+'/'+theme+': explicit theme selection honored');
    check(await page.locator('#lesson-nav button').count()===8,kind+'/'+width+'/'+theme+': eight nav items');
    check(await page.locator('#lesson h2').count()===1,kind+'/'+width+'/'+theme+': initial lesson rendered');
    await page.locator('#lesson .question label').nth(1).click();
    await page.locator('#lesson .quiz button').click();
    check(await page.locator('#lesson .feedback').isVisible(),kind+'/'+width+'/'+theme+': prediction feedback');
    check(await page.locator('#lesson .trace-line.active').count()===1,kind+'/'+width+'/'+theme+': one highlighted C line');
    check(await page.locator('#lesson .mem-diagram-title').count()===1,kind+'/'+width+'/'+theme+': memory diagram rendered');
    check(await page.locator('#lesson .mem-cell').count()>=1,kind+'/'+width+'/'+theme+': labeled memory cells rendered');
    check(await page.locator('#lesson .mem-diagram-note').count()===1,kind+'/'+width+'/'+theme+': conceptual address disclaimer');
    const layoutIndex=kind==='pointer'?4:6;
    if(layoutIndex>=6)await page.locator('#lesson-nav details[data-group="advanced"] summary').click();
    await page.locator('#lesson-nav button').nth(layoutIndex).click();
    check(await page.locator('#lesson .layout-cell').count()>=3,kind+'/'+width+'/'+theme+': memory layout has labeled array/member cells');
    check(await page.locator('#lesson .layout-disclaimer').count()===1,kind+'/'+width+'/'+theme+': ABI caveat shown');
    await page.locator('#lesson-nav button').nth(0).click();

    const before=await page.locator('#lesson .trace-status').innerText();
    const memoryBefore=await page.locator('#lesson .trace-memory').innerText();
    await page.locator('#lesson .trace-controls button').nth(1).click();
    check((await page.locator('#lesson .trace-status').innerText())!==before,kind+'/'+width+'/'+theme+': trace next changes state');
    check((await page.locator('#lesson .trace-memory').innerText())!==memoryBefore,kind+'/'+width+'/'+theme+': trace next updates memory values');

    await page.locator('#lesson .trace-controls button').nth(0).click();
    check((await page.locator('#lesson .trace-status').innerText())===before,kind+'/'+width+'/'+theme+': trace previous restores initial step');
    await page.locator('#lesson-nav button').nth(2).click();
    check(await page.locator('#lesson .mem-diagram-title').count()===1,kind+'/'+width+'/'+theme+': memory diagram survives lesson navigation');
    await page.locator('#lesson-nav details[data-group="advanced"]').evaluate(el=>el.open=true);
    await page.locator('#lesson-nav button').nth(7).click();
    check((await page.locator('#lesson h2').innerText())===lessons.find(x=>x.kind===kind).data.lessons[7].title,kind+'/'+width+'/'+theme+': last lesson navigation');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+6),kind+'/'+width+'/'+theme+': no horizontal overflow');
    check(pageErrors.length===0,kind+'/'+width+'/'+theme+': no JS page errors '+pageErrors.join(';'));
    fs.mkdirSync('qa-output/c-journey-screens',{recursive:true});
    await page.screenshot({path:'qa-output/c-journey-screens/'+kind+'-'+width+'-'+theme+'.png',fullPage:true});
    await page.close();
   }
   for(const width of [390,1280])for(const theme of ['light','dark']){
    const page=await browser.newPage({viewport:{width,height:820},colorScheme:theme});
    const errs=[];page.on('pageerror',e=>errs.push(String(e)));
    const response=await page.goto('http://127.0.0.1:8776/c-programming/file-io/',{waitUntil:'domcontentloaded'});
    check(response?.status()===200,'File I/O / '+width+'/'+theme+': route serves HTTP 200');
    check(await page.locator('h1').count()>0,'File I/O / '+width+'/'+theme+': header exists');
    check(errs.length===0,'File I/O / '+width+'/'+theme+': no page errors '+errs.join(';'));
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+8),'File I/O / '+width+'/'+theme+': no horizontal overflow');
    await page.screenshot({path:'qa-output/c-journey-screens/file-io-'+width+'-'+theme+'.png',fullPage:true});
    await page.close();
   }
   browserStatus='RAN';
  }finally{await browser.close();server.kill()}
 }catch(e){check(false,'Browser QA execution failed: '+String(e))}
}
const summary={timestamp:new Date().toISOString(),status:errors.length?'FAIL':'PASS',browserStatus,total:reports.length,passed:reports.filter(r=>r.pass).length,errors,reports};
fs.mkdirSync('qa-output',{recursive:true});
fs.writeFileSync('qa-output/c-journey-qa.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify({status:summary.status,passed:summary.passed,total:summary.total,browserStatus,errors},null,2));
if(errors.length)process.exitCode=1;
