/* Reusable C course authoring policy: variable lessons/tasks, schema and pedagogy.
 * Run: node tests/c-authoring-policy.mjs
 * Optional: node tests/c-authoring-policy.mjs arrays strings [slug...]
 */
import {readFileSync,existsSync} from "node:fs";
import {join} from "node:path";
const slugs=process.argv.slice(2).length?process.argv.slice(2):["arrays","strings","standard-library","functions","pointer","structure","dynamic-memory"];
const errors=[],warnings=[];
let reviewed=0;
for(const slug of slugs){
 const file=join("c-programming",slug,"data.js");
 if(!existsSync(file)){errors.push(slug+": missing data.js");continue}
 let d;
 try{d=JSON.parse(readFileSync(file,"utf8").replace(/^\s*(?:\/\*[\s\S]*?\*\/\s*)?window\.C_JOURNEY\s*=\s*/,"").replace(/;\s*$/,""))}
 catch(e){errors.push(slug+": cannot parse C_JOURNEY: "+e.message);continue}
 reviewed++;
 if(d.slug!==slug)errors.push(slug+": slug metadata mismatch");
 if(!d.title||!d.summary||!Array.isArray(d.lessons)||d.lessons.length<1)errors.push(slug+": missing essential chapter metadata or lessons");
 if(!Array.isArray(d.practice))errors.push(slug+": practice must be an array");
 if(!Array.isArray(d.phases)||d.phases.length!==3||d.phases.some(p=>!p))warnings.push(slug+": current UI expects three Before/In/After activity descriptions");
 const total=d.lessons?.length||0;
 if(d.phaseBreaks!==undefined&&(!Array.isArray(d.phaseBreaks)||d.phaseBreaks.length!==2||!d.phaseBreaks.every(n=>Number.isInteger(n)&&n>=0&&n<=total)||d.phaseBreaks[0]>d.phaseBreaks[1]))errors.push(slug+": invalid phaseBreaks");
 if(d.coreCount!==undefined&&(!Number.isInteger(d.coreCount)||d.coreCount<1||d.coreCount>total))errors.push(slug+": invalid coreCount");
 if(d.contentRevision!==undefined&&(!Number.isInteger(d.contentRevision)||d.contentRevision<1))errors.push(slug+": invalid contentRevision");
 const titles=new Set();
 for(const [i,l] of (d.lessons||[]).entries()){
  const scope=slug+" step "+(i+1);
  if(!l.title||!l.goal||!l.concept||!l.code||!l.predict||l.output===undefined||!l.transfer||!l.guide)errors.push(scope+": missing learning fields");
  if(titles.has(l.title))warnings.push(scope+": repeated lesson title");titles.add(l.title);
  if(!l.quiz||!Array.isArray(l.quiz.options)||l.quiz.options.length<2||!Number.isInteger(l.quiz.correct)||l.quiz.correct<0||l.quiz.correct>=l.quiz.options.length||!l.quiz.q||!l.quiz.explain)errors.push(scope+": invalid quiz");
  if(!Array.isArray(l.trace)||l.trace.length<1||l.trace.some(t=>!t.match||!l.code.includes(t.match)||!t.state||!t.meaning))errors.push(scope+": trace must correspond to actual C source");
  if(!l.model||!l.model.kind)errors.push(scope+": missing interactive model");
  else if(l.model.kind==="scenario"&&(!Array.isArray(l.model.cases)||l.model.cases.length!==Math.floor((l.model.max-l.model.min)/l.model.step)+1))warnings.push(scope+": scenario cases do not cover slider values");
  if(!l.code?.includes("#include")&&!l.code?.includes("int main("))warnings.push(scope+": reference code should be standalone C11");
  if(!l.minutes)warnings.push(scope+": consider conceptual study-time estimate (coding time separate)");
  if(/코드를 직접 추적했을 때 출력되는 값은\?/.test(l.quiz?.q||""))warnings.push(scope+": quiz may rely on output recall instead of conceptual understanding");
 }
 for(const [i,p] of (d.practice||[]).entries()){
  if(!p.title||!p.task||!p.starter||p.expected===undefined)errors.push(slug+" practice "+(i+1)+": incomplete task");
  if(!p.starter?.includes("TODO"))warnings.push(slug+" practice "+(i+1)+": no student TODO placeholder");
 }
 if((d.practice||[]).length===0)warnings.push(slug+": no coding practice; document the exception in review");
}
console.log("C authoring policy: "+reviewed+" chapters inspected; no fixed lesson or practice count.");
if(warnings.length)console.log("Review notes ("+warnings.length+"):\n"+warnings.join("\n"));
if(errors.length){console.error("Errors ("+errors.length+"):\n"+errors.join("\n"));process.exit(1)}
console.log("PASS: all required structural rules met. Pedagogical judgments remain instructor-reviewed.");
