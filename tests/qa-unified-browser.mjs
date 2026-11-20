#!/usr/bin/env node
/* Dedicated unified browser checks for C's eight published units and Logic Design pilot.
   Isolated browser contexts; never reads actual student data. */
import {chromium} from "playwright";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {spawn} from "node:child_process";
const catalog=JSON.parse(readFileSync("c-programming/course-catalog.json","utf8"));
const published=catalog.chapters.filter(c=>c.published);
const outdir="qa-unified";mkdirSync(outdir,{recursive:true});
const base=process.env.QA_BASE||"http://127.0.0.1:8765/";
let server;
if(!process.env.QA_BASE){
 server=spawn("python3",["-m","http.server","8765","--bind","127.0.0.1"],{stdio:"ignore"});
 await new Promise(r=>setTimeout(r,1000));
}
const browser=await chromium.launch({headless:true});
const failures=[],chapters=[],pilot=[];
const widths=[390,1280],themes=["neutral-dark","warm-neutral"];
function issue(id,message){failures.push({id,message})}
function check(ok,id,message){if(!ok)issue(id,message)}
try{
 for(const c of published){
  const slug=c.url.match(/^\.\/([^/]+)\/$/)?.[1],id=String(c.id);
  let tests=0,passed=0;
  if(!slug){issue(id,"Invalid route");continue}
  for(const width of widths)for(const theme of themes){
   const ctx=await browser.newContext({viewport:{width,height:860}});
   await ctx.addInitScript(t=>{localStorage.setItem("els-theme-v2",t);localStorage.setItem("els-language","mixed");localStorage.setItem("phase0-unknown-key","unchanged")},theme);
   const page=await ctx.newPage();
   const errors=[];page.on("pageerror",e=>errors.push(String(e)));
   page.on("response",r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push("HTTP "+r.status()+" "+r.url())});
   let ok=false;
   try{
    const response=await page.goto(base+"c-programming/"+slug+"/",{waitUntil:"load",timeout:45000});
    await page.waitForTimeout(100);
    const value=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+8,theme:document.documentElement.dataset.elsTheme,
       content:document.body.innerText.length,buttons:document.querySelectorAll('button').length,
       intact:localStorage.getItem("phase0-unknown-key")==="unchanged",
       overflowSources:document.documentElement.scrollWidth>innerWidth+8
         ? [...document.querySelectorAll("body *")].map(e=>({el:e.tagName.toLowerCase()+(e.className&&typeof e.className==="string"?"."+e.className.trim().split(/\\s+/).slice(0,2).join("."):""),rect:e.getBoundingClientRect(),scroll:e.scrollWidth})).filter(x=>x.rect.right>innerWidth+7&&x.rect.width>0).sort((a,b)=>b.rect.right-a.rect.right).slice(0,6).map(x=>({el:x.el,right:Math.round(x.rect.right),width:Math.round(x.rect.width),scroll:x.scroll,html:document.elementFromPoint(Math.min(innerWidth-5,Math.max(1,x.rect.left+4)),Math.max(1,Math.min(innerHeight-2,x.rect.top+4)))?.outerHTML.slice(0,120)})):[] }));
    ok=response?.status()===200&&!value.overflow&&value.theme===theme&&value.content>100&&value.buttons>1&&value.intact&&!errors.length;
    if(!ok)issue(id,width+"px "+theme+": "+JSON.stringify({http:response?.status(),...value,errors}));
    await page.screenshot({path:outdir+"/c-"+id+"-"+theme+"-"+width+".png",fullPage:false});
   }catch(e){issue(id,width+"px "+theme+": "+String(e))}
   tests++;if(ok)passed++;
   await ctx.close();
  }
  chapters.push({id,title:c.title,url:slug,checks:tests,passed,status:passed===tests?"PASS":"FAIL",issues:failures.filter(f=>f.id===id).slice(0,8)});
 }
 for(const width of widths)for(const theme of themes){
  const ctx=await browser.newContext({viewport:{width,height:860}});
  await ctx.addInitScript(t=>localStorage.setItem("els-theme-v2",t),theme);
  const page=await ctx.newPage(),errors=[];page.on("pageerror",e=>errors.push(String(e)));
  let ok=false;
  try{
   await page.goto(base,{waitUntil:"load",timeout:45000});
   await page.locator("#gate-type").waitFor();
   const results=[];
   for(const gate of ["AND","OR","XOR","NAND","NOR"]){
    await page.locator("#gate-type").selectOption(gate);
    for(let a=0;a<=1;a++)for(let b=0;b<=1;b++){
     const actual=await page.evaluate(({a,b})=>{
       for(const [id,value] of [["a",a],["b",b]]){
         const node=document.getElementById(id);
         if(Number(node.textContent.match(/[01]/)?.[0])!==value)node.click();
       }
       return document.getElementById("out").textContent.trim();
     },{a,b});
     const ref={AND:a&b,OR:a|b,XOR:a^b,NAND:1-(a&b),NOR:1-(a|b)}[gate];
     results.push({gate,a,b,expected:ref,actual,pass:actual==="Y = "+ref});
    }
   }
   const display=await page.evaluate(()=>({theme:document.documentElement.dataset.elsTheme,overflow:document.documentElement.scrollWidth>innerWidth+8}));
   ok=results.every(x=>x.pass)&&display.theme===theme&&!display.overflow&&!errors.length;
   if(!ok)issue("logic-pilot",width+"px "+theme+": "+JSON.stringify({wrong:results.filter(x=>!x.pass),display,errors}));
   pilot.push({width,theme,combinations:results.length,status:ok?"PASS":"FAIL"});
   await page.screenshot({path:outdir+"/logic-"+theme+"-"+width+".png",fullPage:false});
  }catch(e){issue("logic-pilot",width+"px "+theme+": "+String(e));pilot.push({width,theme,status:"FAIL"})}
  await ctx.close();
 }
}finally{await browser.close();if(server)server.kill()}
const report={schemaVersion:1,createdAt:new Date().toISOString(),c:{chapters,planned:catalog.chapters.length,published:published.length,
 screenshotMatrix:widths.length*themes.length*published.length},
 logic:{kind:"prototype",truthTableTypes:5,truthTableCases:20,viewports:pilot,formalCourseStatus:"NOT_RUN"},
 status:failures.length?"FAIL":"PASS",failures};
writeFileSync(outdir+"/browser-results.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({status:report.status,cChapters:chapters.length,cViews:report.c.screenshotMatrix,logicCases:20,logicViews:pilot.length,failures:failures.slice(0,8)},null,2));
if(failures.length)process.exitCode=1;
