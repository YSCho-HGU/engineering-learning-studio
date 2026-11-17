/* Guard File I/O content, navigation, language hooks, and core labs against regressions. */
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
const html=read("c-programming/file-io/index.html");
const app=read("c-programming/file-io/app.js");
const transfer=read("c-programming/file-io/core-transfer.js");
const coreHtml=read("c-programming/file-io/core-labs/index.html");
const coreJs=read("c-programming/file-io/core-labs/labs.js");
const practiceJs=read("c-programming/file-io/practice/app.js");
const language=read("c-programming/language.js");
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message)};
for(const [name,code] of [["app",app],["transfer",transfer],["core labs",coreJs],["practice",practiceJs],["language",language]]){
  try {new Function(code)} catch(error){failures.push(name+" JavaScript syntax: "+error.message)}
}
assert(!html.includes("상황 설명 상황"),"Duplicate Korean context label");
assert(!html.includes("Code fragment · C 핵심 흐름"),"Old fragment label still present");
const nav=[...html.matchAll(/<button data-nav="(\d+)"[^>]*>[\s\S]*?<span class="nav-title">([^<]+)<\/span>/g)];
const stage=[...html.matchAll(/<section class="stage" data-stage="(\d+)"[^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/g)];
assert(nav.length===8&&stage.length===8,"Existing eight navigation/stage slots must remain");
const expectedNavOrder=[0,1,2,3,4,5,7,6];
for(let i=0;i<8;i++){
  const step=expectedNavOrder[i];
  assert(nav[i]?.[1]===String(step)&&stage[step]?.[1]===String(step),"Navigation or stable stage ID mismatch at slot "+(i+1));
  assert(nav[i]?.[2]===stage[step]?.[2],"Sidebar and main heading differ at slot "+(i+1));
}
assert(app.includes("coreStageOrder=[0,1,2,3,4,5,7]"),"Main progression must skip optional sensor stage");
assert(html.includes('class="optional-stage-nav"')&&html.includes('OPTIONAL · SENSOR LAB'),"Sensor stage must be marked optional");
assert(html.includes('aria-valuemax="7"')&&app.includes("completedCoreCount"),"Core progress must count seven stages");
assert(!html.includes('>7.5 · STRUCTURE RECORDS<'),"Textbook section number incorrectly presented as stage number");
assert(!html.includes("학생이 함수를 선택하는 <strong>부분 코드</strong>"),"Fragmented Korean/English explanation was reintroduced");
for(const step of [3,4,5,6,8]){
  const from=html.indexOf('data-core-step="'+step+'"');
  const to=html.indexOf('class="core-transfer-questions"',from);
  const section=html.slice(from,to);
  assert(section.includes("Complete C program"),"Step "+step+" missing full code label");
  assert(section.includes("#include &lt;stdio.h&gt;")&&section.includes("int main(void)"),"Step "+step+" missing complete program structure");
  assert(section.indexOf("core-transfer-heading")<section.indexOf("core-transfer-layout"),"Step "+step+" explanatory text must precede code and quiz");
}
assert((html.match(/data-core-q="\d+[ab]"/g)||[]).length===10,"Ten existing core assessments must remain");
assert(html.includes('./core-labs/#write')&&html.includes('./core-labs/#read')&&html.includes('./core-labs/#student'),"Core walkthrough navigation links missing");
assert(coreHtml.includes('id="run-write"')&&coreHtml.includes('id="run-read"')&&coreHtml.includes('id="run-student"'),"Three beginner lab controls missing");
assert(coreJs.includes("els-fileio-core-labs-v1"),"Independent beginner lab progress missing");
for(const [navId,titleId] of [["navWrite","title-write"],["navRead","title-read"],["navStudent","title-student"]]){
 const navPattern=new RegExp('data-i18n="'+navId+'">([^<]+)<');
 const titlePattern=new RegExp('id="'+titleId+'" data-i18n="[^"]+">([^<]+)<');
 const left=coreHtml.match(navPattern)?.[1],right=coreHtml.match(titlePattern)?.[1];
 assert(Boolean(left)&&left===right,"Core lab sidebar and title differ: "+navId);
}
assert(!coreHtml.includes('data-go-task'),"Beginner labs must not mix the advanced coding engine.");
assert(coreHtml.includes("../practice/#p3")&&practiceJs.includes("p3:2,p4:3,p5:4,p6:5"),"Advanced deep link missing");
assert(app.includes("els-fileio-progress-v2")&&transfer.includes("els-fileio-core-transfer-v1"),"Student progress storage keys changed");
assert(language.includes("File I/O language coverage")&&transfer.includes("explanationsEn"),"English feedback coverage missing");
if(failures.length){console.error("FAIL: "+failures.join("\nFAIL: "));process.exitCode=1}
else console.log("PASS: File I/O title parity, scenario layout, full programs, language, script syntax, and preservation keys.");
