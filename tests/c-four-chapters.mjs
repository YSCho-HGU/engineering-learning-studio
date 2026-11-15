/* Verify all newly authored C11 reference examples against actual GCC.
   Also audits expected answers, question structure, and linked lesson pages. */
import {readFileSync, mkdtempSync, writeFileSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
const rows=[["131","arrays"],["132","strings"],["133","standard-library"],["141","functions"]];
const issues=[];
let executed=0,lessons=0,practice=0;
const tmp=mkdtempSync(join(tmpdir(),"c-course-qa-"));
try{
 for(const [id,slug] of rows){
  const root="c-programming/"+slug+"/";
  const dataText=readFileSync(root+"data.js","utf8").replace(/^window\.C_JOURNEY=/,"").replace(/;\s*$/,"");
  const d=JSON.parse(dataText);
  const page=readFileSync(root+"index.html","utf8"),editor=readFileSync(root+"practice/index.html","utf8");
  if(d.lessons.length!==8||d.practice.length!==6)issues.push(id+" chapter expected 8 steps / 6 tasks");
  if(!page.includes('src="./data.js')||!page.includes('src="../journey.js'))issues.push(id+" missing lesson runtime");
  if(!editor.includes('src="../data.js')||!editor.includes("practice-engine.js"))issues.push(id+" missing coding editor");
  for(const [n,l] of d.lessons.entries()){
   lessons++;
   const prefix=id+" Step "+(n+1)+" "+l.title;
   if(!l.goal||!l.concept||!l.quiz||!l.transfer||!l.guide||!l.model)issues.push(prefix+" incomplete teaching elements");
   if(l.quiz?.options?.[l.quiz.correct]!==l.output)issues.push(prefix+" quiz answer differs from output");
   if(!l.trace?.length||l.trace.some(t=>!l.code.includes(t.match)))issues.push(prefix+" trace match not found in actual code");
   const src=join(tmp,slug+"-"+n+".c"),exe=join(tmp,slug+"-"+n);
   writeFileSync(src,l.code);
   const comp=spawnSync("gcc",["-std=c11","-Wall","-Wextra","-Wpedantic","-Werror",src,"-lm","-o",exe],{encoding:"utf8",timeout:12000});
   if(comp.status!==0){issues.push(prefix+" GCC failed: "+(comp.stderr||comp.error?.message||"").slice(0,500));continue}
   const run=spawnSync(exe,[],{encoding:"utf8",timeout:3000});
   if(run.status!==0){issues.push(prefix+" runtime failure: "+run.status+" "+String(run.stderr).slice(0,180));continue}
   executed++;
   if(run.stdout.trimEnd()!==String(l.output).trimEnd())issues.push(prefix+" expected ["+l.output+"] but GCC returned ["+run.stdout.trimEnd()+"]");
  }
  for(const [n,p] of d.practice.entries()){
   practice++;
   if(!p.title||!p.task||!p.starter||!p.expected)issues.push(id+" P"+(n+1)+" incomplete coding exercise");
   if(!p.starter.includes("TODO"))issues.push(id+" P"+(n+1)+" starter lacks student TODO");
  }
 }
}finally{rmSync(tmp,{recursive:true,force:true})}
console.log("Validation: "+rows.length+" chapters, "+lessons+" lessons, "+executed+" GCC executions, "+practice+" coding tasks");
if(issues.length){console.error(issues.join("\n"));process.exit(1)}
console.log("PASS: all actual C11 reference outputs and teaching structure match.");
