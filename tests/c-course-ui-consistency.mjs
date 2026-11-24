/* Consistency gate for the published shared-engine C Programming lessons.
 * node tests/c-course-ui-consistency.mjs
 * Checks data/translation/rendering contracts without changing learner state.
 */
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
const parse=(path,globalName)=>JSON.parse(read(path).replace(new RegExp("^\\s*window\\."+globalName+"\\s*=\\s*"),"").replace(/;\s*$/,""));
const catalog=JSON.parse(read("c-programming/course-catalog.json"));
const slugs=catalog.chapters.filter(c=>c.published&&c.kind!=="ai-capstone"&&c.url!=="./file-io/").map(c=>c.url.match(/^\.\/([^/]+)\/$/)?.[1]).filter(Boolean);
const errors=[],warnings=[];let lessons=0,practices=0;
const check=(ok,msg)=>{if(!ok)errors.push(msg)};
for(const slug of slugs){
 const prefix="c-programming/"+slug+"/";
 const d=parse(prefix+"data.js","C_JOURNEY"),en=parse(prefix+"en.js","C_JOURNEY_EN");
 const page=read(prefix+"index.html");
 check(d.slug===slug,slug+": invalid slug");
 check(page.includes("../journey.js"),slug+": shared journey engine missing");
 check(page.includes("../language.js"),slug+": shared localization missing");
 check(!/eight-step guided learning journey/i.test(page),slug+": misleading fixed 8-step metadata");
 const progressValue=Number(page.match(/aria-valuemax="(\d+)"/)?.[1]);
 check(progressValue===(d.coreCount||d.lessons.length),slug+": initial progress meter does not match core lesson count");

 check(d.lessons.length===en.lessons.length,slug+": translated lesson count mismatch");
 check(d.practice.length===en.practice.length,slug+": translated practice count mismatch");
 check(d.coreCount===undefined||(d.coreCount>0&&d.coreCount<=d.lessons.length),slug+": core count mismatch");
 const titles=new Set();
 for(const [i,l] of d.lessons.entries()){
  const label=slug+" lesson "+(i+1),e=en.lessons[i]||{};
  lessons++;
  check(l.title&&l.goal&&l.concept&&l.predict&&l.transfer,label+": incomplete conceptual context");
  check(!titles.has(l.title),label+": duplicate heading");titles.add(l.title);
  check(/^\s*#include\s+[<"]/m.test(l.code||"")&&/\bint\s+main\s*\(/.test(l.code||""),label+": full C example missing");
  check(l.output!==undefined,label+": predicted reference output missing");
  check(Array.isArray(l.quiz?.options)&&l.quiz.options.length>=2&&l.quiz.correct>=0&&l.quiz.correct<l.quiz.options.length,label+": quiz is incomplete");
  for(const key of ["goal","concept","predict","transfer","guide"]){
   check(typeof e[key]==="string"&&e[key].trim()&& !/[가-힣]/.test(e[key]),label+": English-only "+key+" missing");
  }
  check(typeof e.quiz?.q==="string"&&!/[가-힣]/.test(e.quiz.q),label+": English question missing");
  check(typeof e.quiz?.explain==="string"&&!/[가-힣]/.test(e.quiz.explain),label+": English feedback missing");
  check(e.quiz?.options?.length===l.quiz.options.length&&e.quiz.options.every(x=>typeof x==="string"&&!/[가-힣]/.test(x)),label+": English options mismatch");
  if(l.quiz?.context!==undefined)check(typeof l.quiz.context==="string"&&l.quiz.context.trim(),label+": invalid custom question context");
  if(e.quiz?.context!==undefined)check(typeof e.quiz.context==="string"&&e.quiz.context.trim()&&!/[가-힣]/.test(e.quiz.context),label+": invalid English question context");
  if(l.code?.split("\n").some(line=>line.length>85))warnings.push(label+": long source line; consider breaking it for first-year readers");
 }
 for(const [i,p] of d.practice.entries()){
  practices++;
  const english=en.practice[i];
  check(p.title&&p.task&&p.starter,labelFor(slug,i)+": incomplete coding practice");
  check(/TODO/.test(p.starter),labelFor(slug,i)+": starter code must explicitly identify what students implement");
  check(english&&typeof english.title==="string"&&typeof english.task==="string"&&!/[가-힣]/.test(english.title+english.task),labelFor(slug,i)+": untranslated practice");
 }
}
function labelFor(slug,i){return slug+" practice "+(i+1)}
const engine=read("c-programming/journey.js");
const css=read("c-programming/journey.css");
const practiceEngine=read("c-programming/practice-engine.js");
check(engine.includes('element("span","",b,l.title)')&&engine.includes('element("h2","",stage,l.title)'),"Sidebar and lesson heading must derive from same title");
check(engine.includes('element("p","quiz-context",section,l.quiz.context||l.goal)'),"Context must precede the quiz question");
check(engine.includes('element("p","quiz-question",section,l.quiz.q)'),"Quiz question must be distinct from context");
check(engine.includes('createCode(c,l.code)')&&!engine.includes('createCode(details,p.starter,"starter")')&&practiceEngine.includes('editor.value=Object.prototype.hasOwnProperty.call(drafts,i)?drafts[i]:task.starter'),"Complete examples remain in lessons; coding starters appear only in the dedicated editor");
check(practiceEngine.includes('const taskHeading=i=>')&&practiceEngine.includes('title.textContent=taskHeading(i)')&&practiceEngine.includes('sidebar,taskHeading(i)'),"Practice sidebar and task heading must use same title");
check(practiceEngine.includes('const K="els-code-"')&&practiceEngine.includes('E="els-code-evidence-"'),"Existing coding drafts and evidence keys must be retained");
check(engine.includes('const key="els-journey-"')&&engine.includes('const assessmentKey='),"Existing progress storage must be retained");
check(engine.includes('b.setAttribute("aria-current","step")'),"Navigation must expose current lesson");
check(css.includes('max-height:none !important')&&css.includes(".quiz-context"),"Full code visibility and question context CSS missing");
for(const [name,code] of [["journey.js",engine],["language.js",read("c-programming/language.js")],["practice-engine.js",practiceEngine]]){
 try{new Function(code)}catch(e){errors.push(name+" syntax error: "+e.message)}
}
console.log("C UI review:",slugs.length,"published shared chapters,",lessons,"full-program lessons,",practices,"starter exercises.");
if(warnings.length)console.log("Formatting suggestions:",warnings.join("; "));
if(errors.length){console.error("FAIL: "+errors.join("\nFAIL: "));process.exitCode=1}
else console.log("PASS: chapter title, code presentation, quiz context, core/optional, localization and progress contracts.");
