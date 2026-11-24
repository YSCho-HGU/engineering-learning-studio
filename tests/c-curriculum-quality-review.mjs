#!/usr/bin/env node
/* Repeatable SOURCE-based educational review; not a student learning outcome or GCC executor.
 * Structural errors fail CI; pedagogy flags require explicit human follow-up.
 */
import {readFileSync,existsSync,mkdirSync,writeFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const parse=p=>JSON.parse(read(p).replace(/^\s*window\.C_JOURNEY\s*=\s*/,"").replace(/;\s*$/,""));
const catalog=JSON.parse(read("c-programming/course-catalog.json"));
const units=catalog.chapters.filter(c=>c.published&&c.kind!=="ai-capstone"); // The capstone is independently audited by c211-*.
const result={schemaVersion:1,createdAt:new Date().toISOString(),audience:"first-year university",standard:"GCC C11",
 source:"Eight published units and their authored data; this audit does not execute C",
 structural:[],pedagogyFlags:[],units:[],summary:{}};
const check=(good,id,detail)=>{
 result.structural.push({id,status:good?"PASS":"FAIL",detail});
};
const flag=(id,severity,unit,location,message,action)=>{
 result.pedagogyFlags.push({id,severity,unit,location,message,action,status:"OPEN_FOR_INSTRUCTOR_REVIEW"});
};
for(const c of units){
 const slug=c.url.match(/^\.\/([^/]+)\/$/)?.[1],root="c-programming/"+slug;
 check(!!slug&&existsSync(root+"/index.html"),"route-"+c.id,"Published route and HTML page exist");
 if(!slug)continue;
 if(slug==="file-io"){
  const html=read(root+"/index.html"),practice=read(root+"/practice/app.js");
  const stages=[...html.matchAll(/<section class="stage" data-stage="(\d+)"/g)].map(m=>Number(m[1]));
  const coreOrder=[0,1,2,3,4,5,7],optional=stages.filter(i=>!coreOrder.includes(i));
  const practiceIds=[...practice.matchAll(/id:"(P[1-6]|M1)"/g)].map(m=>m[1]);
  check(stages.length===8&&new Set(stages).size===8,"fileio-8-unique-stages",JSON.stringify(stages));
  check(optional.length===1&&optional[0]===6,"fileio-optional-sensor","Only sensor stage 6 is optional; terminal synthesis 7 remains core");
  check(practiceIds.length===7&&new Set(practiceIds).size===7,"fileio-practice-ids",practiceIds.join(","));
  check(html.includes("./core-labs/#write")&&html.includes("./core-labs/#read")&&html.includes("./core-labs/#student"),"fileio-3-intro-labs","Three introductory programs linked");
  check(html.includes("./practice/#m1")||read("c-programming/c-ss-shell.js").includes("./practice/#m1"),"fileio-M1-link","One-line copy M1 is discoverable through the grouped sidebar");
  result.units.push({id:c.id,slug,lessonStages:8,coreLessons:7,optionalLessons:1,practiceTasks:practiceIds.length,
   introductoryLabs:3,notes:["A separate HTML teaching engine; stage 6 is optional sensor analysis","Core-first navigation: stages 0-5,7"]});
  continue;
 }
 const data=parse(root+"/data.js");
 check(data.slug===slug,"slug-"+c.id,slug);
 check(Array.isArray(data.lessons)&&data.lessons.length>0,"lessons-"+c.id,String(data.lessons?.length));
 check(Array.isArray(data.practice),"practice-"+c.id,String(data.practice?.length));
 const core=data.coreCount??data.lessons.length,practiceCore=data.practiceCoreCount??data.practice.length;
 check(Number.isInteger(core)&&core>=1&&core<=data.lessons.length,"core-"+c.id,String(core));
 check(Number.isInteger(practiceCore)&&practiceCore>=0&&practiceCore<=data.practice.length,"practice-core-"+c.id,String(practiceCore));
 check(Array.isArray(data.phaseBreaks)&&data.phaseBreaks.length===2&&data.phaseBreaks[0]<=data.phaseBreaks[1]&&data.phaseBreaks[1]<=data.lessons.length,
  "sequence-"+c.id,JSON.stringify(data.phaseBreaks));
 const errors=[];
 for(const [i,l] of data.lessons.entries()){
  const prefix=c.id+"-L"+(i+1),q=l.quiz;
  if(!l.title||!l.goal||!l.concept||!l.code||!l.predict||l.output===undefined||!l.guide||!l.transfer)errors.push(prefix+": incomplete concept/code/transfer");
  if(!q||!Array.isArray(q.options)||q.options.length<2||!Number.isInteger(q.correct)||q.correct<0||q.correct>=q.options.length||new Set(q.options).size!==q.options.length||!q.explain)errors.push(prefix+": incomplete quiz");
  if(!Array.isArray(l.trace)||!l.trace.length||l.trace.some(t=>!l.code.includes(t.match)))errors.push(prefix+": code trace mismatch");
  if(!l.model?.kind||!l.model.note)errors.push(prefix+": missing conceptual-model disclaimer");
  if(l.model?.kind==="scenario"){
   const expected=1+Math.floor((l.model.max-l.model.min)/l.model.step);
   if(!Array.isArray(l.model.cases)||l.model.cases.length!==expected||l.model.cases.some(x=>typeof x!=="string"||!x.trim()))errors.push(prefix+": scenario coverage");
  }
  if(l.level&&l.level!==(i<core?"core":"advanced"))errors.push(prefix+": Core/Optional mismatch");
 }
 check(errors.length===0,"lesson-content-"+c.id,errors.join(" | ")||"Essential learning fields, trace and quiz checks pass");
 check(data.practice.every(p=>p.title&&p.task&&p.starter&&p.expected!==undefined),"practice-structure-"+c.id,"Starter, task and expected target present");
 check(existsSync(root+"/en.js"),"english-"+c.id,"Separate English learning data exists");
 result.units.push({id:c.id,slug,lessonStages:data.lessons.length,coreLessons:core,optionalLessons:data.lessons.length-core,
   practiceTasks:data.practice.length,corePractices:practiceCore,optionalPractices:data.practice.length-practiceCore,
   predictiveQuizDuplication:data.lessons.filter(l=>l.predict?.trim()===l.quiz?.q?.trim()).length,
   modelTypes:[...new Set(data.lessons.map(l=>l.model?.kind))],phaseBreaks:data.phaseBreaks});
}
const bySlug=Object.fromEntries(result.units.map(x=>[x.slug,x]));
const source=slug=>parse("c-programming/"+slug+"/data.js");
const arrays=source("arrays"),strings=source("strings"),functions=source("functions"),memory=source("dynamic-memory");
const codeContains=(d,i,pattern)=>pattern.test(d.lessons[i].code);
if(arrays.lessons[3].quiz.explain.includes("음수")&&!arrays.lessons[3].model.cases.some(x=>/-[1-9]/.test(x)))
 flag("EDU-131-NEG","P1","131","L4 Finding Maximum","Quizzes explain negative-only arrays but the interactive scenarios use positive-only values.","Add a scenario such as {-8,-3,-11}, compare max=a[0] with max=0, and ask for a prediction.");
if(strings.lessons[3].model.cases.every(x=>x.includes("==0 → true")))
 flag("EDU-132-STRCMP","P1","132","L4 String Comparison","Every model case is an equal-string comparison; <0 and >0 outcomes are not visualized.","Include equal, less-than and greater-than comparisons; teach the sign rather than exact +/-1.");
if(strings.lessons[5].concept.includes("fgets")&&!codeContains(strings,5,/\bfgets\s*\(/)&&!/\bfgets\s*\(/.test(strings.lessons[5].extraExample?.code||""))
 flag("EDU-132-FGETS","P1","132","L6 Buffer Capacity / P5 Safe fgets","Concept names fgets and P5 requires reading stdin, but the worked program only prints sizeof and an initialized string.","Add a worked input example with fgets return check, newline handling and a safe short buffer; keep the deterministic sizeof example.");
if(/Menu-Driven/i.test(functions.lessons[7].model.title)&&!/(scanf|fgets|switch|while|for)\s*\(/.test(functions.lessons[7].code))
 flag("EDU-141-NAMING","P2","141","L8 Composing Functions","Interactive model says Menu-Driven while the example explicitly demonstrates nested function calls, without menu input.","Rename model to Function Composition; if menu-driven CLI is desired, supply a separate relevant example.");
const coreMemory=memory.lessons.slice(0,memory.coreCount||4);
if(coreMemory.filter(l=>/출력|값이 출력/.test(l.quiz?.q||"")).length===coreMemory.length)
 flag("EDU-181-CONCEPT","P1","181","L1-L4 Core memory lessons","Every Core quiz asks for output prediction rather than verifying NULL handling, lifecycle or uninitialized-memory safety.","Keep output prediction in Predict and use Check Yourself for malloc failure, byte sizing, free, and alias safety.");
if(catalog.chapters.some(x=>!x.published&&Number(x.id)<131)){
 const home=read("c-programming/index.html");
 if(!home.includes('id="prerequisite-checkpoint"'))flag("EDU-PREREQUISITES","P2","course","Units 101-123 unpublished","The first published Arrays unit assumes earlier C fundamentals but offers no prerequisite checkpoint.","Add a concise checkpoint for input/output, decisions, loops and basic function calls.");
 else flag("EDU-PREREQUISITES-PUBLICATION","P3","course","Earlier foundations not published","A prerequisite checkpoint is visible, but earlier foundation chapters are still unpublished in the portal.","Keep the checkpoint; publish those chapters when their materials are ready.");
}
if(bySlug["file-io"]?.optionalLessons===1){
 const html=read("c-programming/file-io/index.html");
 const start=html.indexOf('<section class="stage" data-stage="6"');
 const end=html.indexOf('<section class="stage" data-stage="7"',start);
 if(start>=0&&end>start&&end-start>12000&&!(html.slice(start,end).includes("sensor-learning-flow")&&html.slice(start,end).includes('<details class="sensor-reference-code"')&&html.slice(start,end).includes('<details class="sensor-advanced-optional"')))
  flag("EDU-171-DENSITY","P2","171","Optional Sensor Log stage 6","The long sensor module needs a compact starting route and progressively revealed advanced content.","Keep the short learning-flow overview and collapse the reference source and advanced validation.");
}
const count=key=>result.units.reduce((n,x)=>n+Number(x[key]||0),0);
result.summary={publishedUnits:units.length,plannedUnits:catalog.chapters.length,
  learningStages:count("lessonStages"),coreLearningStages:count("coreLessons"),optionalLearningStages:count("optionalLessons"),
  authoredPracticeTasks:count("practiceTasks"),corePracticeTasks:count("corePractices")+3,openPedagogyFlags:result.pedagogyFlags.length,
  structuralFailures:result.structural.filter(x=>x.status==="FAIL").length,
  warning:"Structural PASS and GCC compilation cannot replace a scientific or classroom review."};
result.status=result.summary.structuralFailures?"FAIL":"STRUCTURE_PASS_EDUCATIONAL_REVIEW_OPEN";
mkdirSync("qa-review",{recursive:true});
writeFileSync("qa-review/c-curriculum-audit.json",JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({status:result.status,summary:result.summary,flags:result.pedagogyFlags.map(x=>x.id)},null,2));
if(result.summary.structuralFailures)process.exitCode=1;
