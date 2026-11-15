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
 check(data.lessons.every(l=>l.quiz.options.length===3 && l.quiz.options[l.quiz.correct]===l.output),kind+': quiz answer key follows expected output');
 check(new Set(data.lessons.map(l=>l.quiz.correct)).size===3,kind+': nonfixed answer position');
 check(data.lessons.every(l=>l.goal&&l.concept&&l.transfer&&l.guide&&l.model&&l.code),kind+': complete pedagogical evidence');
 check(data.practice.every(p=>p.starter.includes('TODO')&&p.expected),kind+': standalone practice starter and reference');
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 for(const id of ['lesson','lesson-nav','progress-text','progress-bar','practice','theme'])
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
   if(kind==='structure'&&i===6)check(/^[0-9]+$/.test(observed)&&Number(observed)>=5,kind+' sizeof platform-dependent positive result');
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
    const page=await browser.newPage({viewport:{width,height:820}});
    const pageErrors=[];
    page.on('pageerror',e=>pageErrors.push(String(e)));
    await page.goto('http://127.0.0.1:8776/c-programming/'+kind+'/',{waitUntil:'domcontentloaded'});
    await page.locator('#theme').click();
    if(theme==='light')await page.locator('#theme').click();
    check(await page.locator('#lesson-nav button').count()===8,kind+'/'+width+'/'+theme+': eight nav items');
    check(await page.locator('#lesson h2').count()===1,kind+'/'+width+'/'+theme+': initial lesson rendered');
    await page.locator('#lesson .question label').nth(1).click();
    await page.locator('#lesson .quiz button').click();
    check(await page.locator('#lesson .feedback').isVisible(),kind+'/'+width+'/'+theme+': prediction feedback');
    await page.locator('#lesson-nav button').nth(7).click();
    check((await page.locator('#lesson h2').innerText())===lessons.find(x=>x.kind===kind).data.lessons[7].title,kind+'/'+width+'/'+theme+': last lesson navigation');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+6),kind+'/'+width+'/'+theme+': no horizontal overflow');
    check(pageErrors.length===0,kind+'/'+width+'/'+theme+': no JS page errors '+pageErrors.join(';'));
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
