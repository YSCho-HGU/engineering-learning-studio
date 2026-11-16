/* Outcome-based review regression for published advanced C chapters.
 * Checks structural alignment without forcing an arbitrary lesson count.
 * Run: node tests/c-advanced-review.mjs
 */
import {readFileSync} from "node:fs";
const failures=[];
let total=0,core=0,optional=0;
for(const slug of ["pointer","structure","dynamic-memory"]){
 const source=readFileSync("c-programming/"+slug+"/data.js","utf8");
 const d=JSON.parse(source.replace(/^window\.C_JOURNEY=/,"").replace(/;\s*$/,""));
 if(!Number.isInteger(d.coreCount)||d.coreCount<1||d.coreCount>d.lessons.length)failures.push(slug+": invalid Core count");
 if(!Array.isArray(d.practice)||d.practice.length<1)failures.push(slug+": coding practice missing");
 if(!Number.isInteger(d.practiceCoreCount)||d.practiceCoreCount<0||d.practiceCoreCount>d.practice.length)failures.push(slug+": invalid practice Core count");
 if(!Number.isInteger(d.contentRevision)||d.contentRevision<1)failures.push(slug+": revision metadata missing");
 if(!Array.isArray(d.phaseBreaks)||d.phaseBreaks.length!==2||d.phaseBreaks[0]>=d.phaseBreaks[1])failures.push(slug+": invalid phase boundaries");
 const titles=new Set();
 d.lessons.forEach((l,i)=>{
  const tag=slug+" lesson "+(i+1);
  if(l.level!==(i<d.coreCount?"core":"advanced"))failures.push(tag+": level inconsistent with Core count");
  if(!l.title||!l.goal||!l.concept||!l.code||l.output===undefined||!l.quiz?.explain||!l.transfer||!l.guide)failures.push(tag+": incomplete lesson");
  if(titles.has(l.title))failures.push(tag+": duplicate title");
  titles.add(l.title);
  if(!Number.isInteger(l.quiz?.correct)||l.quiz.correct<0||l.quiz.correct>=l.quiz.options?.length)failures.push(tag+": invalid quiz");
  if(!Array.isArray(l.trace)||!l.trace.length||l.trace.some(t=>!l.code.includes(t.match)))failures.push(tag+": trace mismatch");
 });
 total+=d.lessons.length;core+=d.coreCount;optional+=d.lessons.length-d.coreCount;
}
const io=readFileSync("c-programming/file-io/index.html","utf8");
const stages=[...io.matchAll(/<section class="stage" data-stage="(\d+)"/g)].map(m=>Number(m[1]));
// File I/O is an independently authored HTML course. Keep its existing 8 purposeful stages.
const navigation=[...io.matchAll(/<button data-nav="(\d+)"/g)].map(m=>Number(m[1]));
if(stages.length!==8||navigation.length!==8||stages.some((n,i)=>n!==i)||navigation.some((n,i)=>n!==i))failures.push("file-io: 8 existing stages/navigation must stay aligned");
if(!["P1(정수 파일 쓰기)","P2(실수 파일 읽기·평균)","M1(한 줄 복사)"].every(token=>io.includes(token)))failures.push("file-io: core P1/P2/M1 guidance missing");
const engine=readFileSync("c-programming/journey.js","utf8");
if(!engine.includes("const hasOptional=")||!engine.includes("const total=D.lessons.length"))failures.push("shared journey: dynamic Core/optional support missing");
const practice=readFileSync("c-programming/practice-engine.js","utf8");
if(!practice.includes("practiceCoreCount"))failures.push("shared practice: Core/optional label metadata missing");
console.log("C advanced curriculum: "+total+" lessons ("+core+" Core, "+optional+" Optional), plus 8 standalone File I/O stages.");
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log("PASS: stage structure, chapter tracks, safe practice labels and File I/O regression.");
