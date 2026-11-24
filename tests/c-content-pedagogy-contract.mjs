#!/usr/bin/env node
/* Published C curriculum contract: educational labels, bilingual explanations,
 * substantive challenge instructions and distinct learning modes. This static
 * check does not claim to measure actual student learning or replace GCC.
 */
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>readFileSync(p,"utf8");
const parse=(path,kind)=>JSON.parse(read(path).replace(new RegExp("^\\s*window\\.C_JOURNEY"+(kind==="en"?"_EN":"")+"\\s*=\\s*"),"").replace(/;\s*$/,""));
const slugs=["arrays","strings","standard-library","functions","pointer","structure","dynamic-memory"];
const catalog=JSON.parse(read("c-programming/course-catalog.json"));
const published=catalog.chapters.filter(x=>x.published&&x.kind!=="ai-capstone"); // Legacy C lesson-engine contract; 211 has its own suite.
const bad=[];
const ok=(condition,message)=>{if(!condition)bad.push(message)};
const context=vm.createContext({window:{}});
vm.runInContext(read("shared/els-content-model.js"),context);
const model=context.window.ELSContentModel;
let stages=0,tasks=0,core=0,optional=0;
for(const slug of slugs){
 const base="c-programming/"+slug+"/";
 const d=parse(base+"data.js","ko"),e=parse(base+"en.js","en");
 ok(d.slug===slug,slug+" slug mismatch");
 ok(d.lessons.length===e.lessons.length,slug+" EN lesson parity");
 ok(d.practice.length===e.practice.length,slug+" EN practice parity");
 const coreCount=d.coreCount??d.lessons.length;
 const practiceCore=d.practiceCoreCount??d.practice.length;
 ok(coreCount>0&&coreCount<=d.lessons.length,slug+" core concept count");
 ok(practiceCore>=0&&practiceCore<=d.practice.length,slug+" core challenge count");
 for(let i=0;i<d.lessons.length;i++){
  const a=d.lessons[i],b=e.lessons[i],prefix=slug+" L"+(i+1);
  ok(typeof a.title==="string"&&a.title.length>=12,prefix+" precise English lesson title");
  ok(typeof a.concept==="string"&&a.concept.length>=100&&/[가-힣]/.test(a.concept),prefix+" substantive Korean concept");
  ok(typeof b.concept==="string"&&b.concept.length>=120&&!/[가-힣]/.test(b.concept),prefix+" substantive English concept");
  for(const field of ["guide","predict"]){
   ok(typeof a[field]==="string"&&a[field].length>=35,prefix+" "+field+" ko");
   ok(typeof b[field]==="string"&&b[field].length>=40&&!/[가-힣]/.test(b[field]),prefix+" "+field+" en");
  }
  ok(typeof a.code==="string"&&a.code.includes("#include"),prefix+" C11 example retained");
  ok(a.quiz&&Array.isArray(a.quiz.options)&&a.quiz.correct>=0&&a.quiz.correct<a.quiz.options.length,prefix+" quiz answer");
  const enProjected=model.project(a,b,"en");
  const mixedProjected=model.project(a,b,"mixed");
  ok(enProjected.concept===b.concept,prefix+" English projection");
  ok(mixedProjected.concept===b.concept+"\n"+a.concept,prefix+" EN-then-KR projection");
  if(i<coreCount)core++;else optional++;
  stages++;
 }
 for(let i=0;i<d.practice.length;i++){
  const a=d.practice[i],b=e.practice[i],prefix=slug+" P"+(i+1);
  ok(typeof a.title==="string"&&a.title.length>=14,prefix+" precise challenge title");
  ok(typeof a.task==="string"&&a.task.length>=60&&/[가-힣]/.test(a.task),prefix+" detailed Korean task");
  ok(typeof b.task==="string"&&b.task.length>=85&&!/[가-힣]/.test(b.task),prefix+" detailed English task");
  ok(a.starter?.includes("TODO")&&a.expected!==undefined,prefix+" starter and expected result");
  tasks++;
 }
}
const arrays=parse("c-programming/arrays/data.js","ko");
const strings=parse("c-programming/strings/data.js","ko");
const memory=parse("c-programming/dynamic-memory/data.js","ko");
ok(arrays.lessons[3].model.cases.some(c=>/-8,-3,-11/.test(c)), "negative-only maximum scenario");
ok(strings.lessons[3].model.cases.some(c=>/strcmp.*< 0/.test(c))&&strings.lessons[3].model.cases.some(c=>/strcmp.*> 0/.test(c)), "strcmp sign exploration");
ok(/fgets\s*\(/.test(strings.lessons[5].extraExample?.code||""),"separate fgets worked input example");
ok(memory.lessons.slice(0,4).every(x=>!/출력|값이 출력/.test(x.quiz.q)),"malloc/free conceptual quiz coverage");
ok(memory.coreCount===4&&memory.practiceCoreCount===3,"dynamic memory malloc/free core boundary");
const shell=read("c-programming/c-ss-shell.js");
const fileio=read("c-programming/file-io/index.html");
const labs=read("c-programming/file-io/core-labs/index.html");
const editor=read("c-programming/file-io/practice/app.js");
ok(published.length===8,"published 8 C units");
ok(/id="prerequisite-checkpoint"/.test(read("c-programming/index.html")),"published chapter prerequisite checkpoint");
ok((fileio.match(/<section class="stage" data-stage="/g)||[]).length===8,"File I/O 7 core + 1 optional");
ok((labs.match(/data-lab-link=/g)||[]).length===3,"File I/O has exactly three standalone guided labs");
ok((editor.match(/id:"(?:P[1-6]|M1)"/g)||[]).length===7,"File I/O has 7 independent coding challenges");
ok(editor.includes("tasksEN=")&&editor.includes("langText("),"File I/O bilingual challenge descriptions");
const coreModel=read("c-programming/file-io/practice/core-io-explorer.js");
const bufferModel=read("c-programming/file-io/practice/buffer-explorer.js");
ok(!coreModel.includes('first.includes("PRACTICE')&&coreModel.includes('button.active[data-task]'),"P1/P2 explorer must not depend on translated page heading");
ok(bufferModel.includes('button.active[data-task]'),"M1 buffer model must use stable task indices");
ok(shell.includes('makeGroup(toc,"labs"')&&shell.includes('makeGroup(toc,"challenges"'),"File I/O groups separated");
ok(fileio.includes('class="sensor-learning-flow"')&&fileio.includes('class="sensor-advanced-optional"'),"progressive advanced sensor disclosure");
const metrics={published:published.length,dataDrivenLessons:stages,coreLessons:core,optionalLessons:optional,dataDrivenChallenges:tasks,fileioChallenges:7,fileioGuidedLabs:3};
console.log(JSON.stringify({status:bad.length?"FAIL":"PASS",metrics,errors:bad},null,2));
if(bad.length)process.exitCode=1;
