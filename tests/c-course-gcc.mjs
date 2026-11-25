/* Reusable GCC C11 checks for any C_JOURNEY chapter with standalone reference code.
 * node tests/c-course-gcc.mjs [slug...]
 * Defaults to published chapters implemented by the common learning engine.
 * Chapter 19 visual engine is compiled via tests/c191-sensor-c11.sh.
 */
import {readFileSync,existsSync,mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
const chapters=JSON.parse(readFileSync("c-programming/course-catalog.json","utf8")).chapters;
const argumentsSlugs=process.argv.slice(2);
const slugs=argumentsSlugs.length?argumentsSlugs:chapters.filter(c=>c.published&&c.kind!=="visual-chapter").map(c=>c.url.match(/^\.\/([^/]+)\/$/)?.[1]).filter(slug=>slug&&existsSync("c-programming/"+slug+"/data.js"));
const errs=[],tmp=mkdtempSync(join(tmpdir(),"c-course-gcc-"));let checked=0,skipped=0;
try{
 for(const slug of slugs){
  const file="c-programming/"+slug+"/data.js";
  if(!existsSync(file)){errs.push(slug+": missing common-engine data.js (independent pages can be excluded from this runner)");continue}
  let d;
  try{d=JSON.parse(readFileSync(file,"utf8").replace(/^window\.C_JOURNEY=/,"").replace(/;\s*$/,""))}
  catch(e){errs.push(slug+": invalid data.js: "+e.message);continue}
  for(const [i,l] of d.lessons.entries()){
   const label=slug+" step "+(i+1);
   if(l.codeInput===true||l.manualRun===true){skipped++;console.log("SKIP "+label+" requires external input; instructor review required");continue}
   const src=join(tmp,"unit-"+checked+".c"),bin=join(tmp,"unit-"+checked);
   writeFileSync(src,l.code||"");
   const cc=spawnSync("gcc",["-std=c11","-Wall","-Wextra","-Wpedantic","-Werror",src,"-lm","-o",bin],{encoding:"utf8",timeout:15000});
   if(cc.status!==0){errs.push(label+" compilation: "+String(cc.stderr||cc.error?.message).slice(0,360));continue}
   const run=spawnSync(bin,[],{encoding:"utf8",timeout:4000});
   if(run.status!==0){errs.push(label+" execution failed: "+String(run.stderr||run.error?.message).slice(0,250));continue}
   checked++;
   if(run.stdout.trimEnd()!==String(l.output).trimEnd())errs.push(label+" reference output mismatch: expected ["+l.output+"] got ["+run.stdout.trimEnd()+"]");
  }
 }
}finally{rmSync(tmp,{recursive:true,force:true})}
console.log("GCC C11 check:",checked,"compiled & executed,",skipped,"input-dependent skipped,",slugs.length,"chapters inspected");
if(errs.length){console.error(errs.join("\n"));process.exit(1)}
console.log("PASS: compiler, runtime and reference outputs for tested snippets. Not proof of all possible inputs.");
