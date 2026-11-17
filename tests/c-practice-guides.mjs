/* Verify 39 core coding tasks + three standalone File I/O introductions.
 * Never change student draft or evidence storage keys. */
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>readFileSync(p,"utf8");
const names=["arrays","strings","standard-library","functions","pointer","structure","dynamic-memory"];
const context=vm.createContext({window:{}});
vm.runInContext(read("c-programming/practice-guides.js"),context,{filename:"practice-guides.js"});
const guides=context.window.C_PRACTICE_GUIDES;
const issues=[];
const assert=(ok,message)=>{if(!ok)issues.push(message)};
let core=0;
for(const slug of names){
 const data=JSON.parse(read("c-programming/"+slug+"/data.js").replace(/^\s*window\.C_JOURNEY\s*=\s*/,"").replace(/;\s*$/,""));
 const count=Number.isInteger(data.practiceCoreCount)?data.practiceCoreCount:data.practice.length;
 const items=guides[slug]||[];
 const html=read("c-programming/"+slug+"/practice/index.html");
 assert(items.length===count,slug+": "+count+" required exercises but "+items.length+" guides");
 assert(html.includes("../../practice-guides.js?v=1"),slug+": shared guide script missing");
 assert(html.indexOf("../../practice-guides.js?v=1")<html.indexOf("../../practice-engine.js"),slug+": guide must load before editor");
 for(let i=0;i<count;i++){
   core++;
   for(const lang of ["ko","en"]){
    const item=items[i]?.[lang];
    assert(typeof item?.scene==="string"&&item.scene.trim(),slug+": missing "+lang+" situation P"+(i+1));
    assert(Array.isArray(item?.steps)&&item.steps.length===3&&item.steps.every(x=>typeof x==="string"&&x.trim()),slug+": wrong "+lang+" steps P"+(i+1));
    assert(typeof item?.check==="string"&&item.check.trim(),slug+": missing "+lang+" verification P"+(i+1));
    if(lang==="en")assert(!/[가-힣]/.test([item.scene,...item.steps,item.check].join(" ")),slug+": Korean text in English guide P"+(i+1));
   }
 }
}
for(const id of ["P1","P2","M1"]){
 core++;
 for(const lang of ["ko","en"]){
  const item=guides["file-io"]?.[id]?.[lang];
  assert(item?.steps?.length===3&&item.scene&&item.check,"File I/O "+id+": missing "+lang+" guide");
  if(lang==="en")assert(!/[가-힣]/.test([item.scene,...item.steps,item.check].join(" ")),"File I/O "+id+": Korean text in English");
 }
}
const practice=read("c-programming/practice-engine.js");
const fileio=read("c-programming/file-io/practice/app.js");
const fileioHtml=read("c-programming/file-io/practice/index.html");
const labHtml=read("c-programming/file-io/core-labs/index.html");
const labJs=read("c-programming/file-io/core-labs/labs.js");
assert(practice.includes("renderTaskGuide(i)")&&practice.includes("guides[i]?.[lang]"),"Shared practice engine does not render task-specific guide");
assert(practice.includes('const K="els-code-"')&&practice.includes('E="els-code-evidence-"'),"Shared editor storage keys changed");
assert(fileio.includes("renderCoreGuide(t)")&&fileio.includes('commonGuides[task.id]'),"File I/O task-specific guide not rendered");
assert(fileio.includes('els-c-fileio-practice-m1-v1')&&fileio.includes('els-code-evidence-fileio-v1'),"File I/O stored drafts/evidence keys changed");
assert(fileioHtml.includes('id="fileio-guided"')&&fileioHtml.includes('../../practice-guides.js?v=1'),"File I/O guide panel/script missing");
for(const id of ["write","read","student"]){
 assert(labHtml.includes('id="'+id+'"')&&labHtml.includes('data-i18n="'+id+'Guide1"')&&labHtml.includes('data-i18n="'+id+'Guide3"'),"File I/O basic lab "+id+" has no three-step guide");
 for(let i=1;i<=3;i++)assert(labJs.includes(id+"Guide"+i+":"),"Missing translation for "+id+" step "+i);
}
assert(labHtml.includes('data-i18n="guideSummary"'),"Basic lab step guide not collapsible");
for(const [file,js] of [["practice-engine.js",practice],["practice-guides.js",read("c-programming/practice-guides.js")],["file-io/practice/app.js",fileio],["file-io/core-labs/labs.js",labJs]]){
 try{new Function(js)}catch(error){issues.push(file+": JS syntax error "+error.message)}
}
console.log("Guided C coding:",core,"required editor tasks + 3 introductory File I/O labs = "+(core+3)+" activities");
if(issues.length){console.error("FAIL:\n"+issues.join("\n"));process.exitCode=1}else console.log("PASS: Korean/English context, three-step guidance, verification, optional isolation, and preserved storage keys.");
