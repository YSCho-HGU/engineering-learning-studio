/* Public course integrity: published links, numbering, structure and consistency */
import {existsSync,readFileSync} from "node:fs";
import {join} from "node:path";
const root="c-programming";
const catalog=JSON.parse(readFileSync(join(root,"course-catalog.json"),"utf8"));
const failures=[];
const current=catalog.chapters.filter(c=>c.published);
if(catalog.chapters.filter(c=>c.kind!=="ai-capstone").length!==18)failures.push("Original 18 C units must remain");
if(!catalog.chapters.some(c=>c.id==="211"&&c.kind==="ai-capstone"&&existsSync(join(root,c.url.slice(2),"index.html"))))failures.push("Missing AI capstone route");
if(current.filter(c=>c.kind!=="ai-capstone"&&c.kind!=="visual-chapter").length!==8)failures.push("Eight original finished units must remain public");
if(current.length!==10||!current.some(c=>c.id==="211"&&c.kind==="ai-capstone"))
 failures.push("Ten published units must include the AI capstone and Chapter 19");
if(!current.some(c=>c.id==="191"&&c.kind==="visual-chapter"&&existsSync(join(root,"low-level-c/index.html"))))
 failures.push("Chapter 19 visual course missing");
const seen=new Set();
for(const c of catalog.chapters){
 if(seen.has(c.id))failures.push("Duplicate catalog unit "+c.id);seen.add(c.id);
 if(c.chapter!==Math.floor(Number(c.id)/10))failures.push("Chapter numbering mismatch "+c.id);
 if(!catalog.groups.some(g=>g.id===c.group))failures.push("Orphan group "+c.id);
 if(c.published){
  if(!/^\.\/[a-z0-9-]+\/$/.test(c.url))failures.push("Unsafe published URL "+c.id);
  const file=join(root,c.url.slice(2),"index.html");
  if(!existsSync(file))failures.push("Published chapter does not exist "+file);
  if(!c.title.trim()||!c.description.trim())failures.push("Published chapter missing metadata "+c.id);
 }
}
const home=readFileSync(join(root,"index.html"),"utf8");
if(!home.includes("course-catalog.js?v="))failures.push("Homepage not reading catalog");
if(home.includes("세 단원을 하나의 흐름으로"))failures.push("Old three-chapter copy still present");
if(home.includes('href="./quick-labs/"'))failures.push("Quick Labs link returned to home");
const fileio=readFileSync(join(root,"file-io/index.html"),"utf8");
if(/Chapter 7\b|CHAPTER 7\b/.test(fileio))failures.push("File I/O should be numbered Chapter 17");
for(const slug of ["arrays","strings","standard-library","functions"]){
 const html=readFileSync(join(root,slug,"index.html"),"utf8");
 const coding=readFileSync(join(root,slug,"practice/index.html"),"utf8");
 if(!html.includes("../journey.js"))failures.push(slug+" missing common journey");
 if(!coding.includes("../data.js"))failures.push(slug+" coding page missing data");
 if(!coding.includes("practice-engine.js"))failures.push(slug+" coding page missing common engine");
}
console.log("Course integrity checked",catalog.chapters.length,"planned,",current.length,"published.");
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log("PASS: published routes, metadata, curriculum numbering and shared learning infrastructure.");
