import {readFileSync,mkdtempSync,writeFileSync,existsSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
const js=readFileSync("c-programming/file-io/practice/app.js","utf8");
const html=readFileSync("c-programming/file-io/practice/index.html","utf8");
const home=readFileSync("c-programming/file-io/index.html","utf8");
const issues=[];
for(const term of ['id:"M1"',"fgets(","fputs(","message.txt","preview.txt","sampleFilename"])if(!js.includes(term))issues.push("M1 data missing: "+term);
for(const term of ["mini-overview","sample-input","Core Mini Lab"])if(!html.includes(term))issues.push("M1 UI missing: "+term);
if(!home.includes("./practice/#m1"))issues.push("M1 direct learning roadmap link missing");
for(const id of ["P1","P2","P3","P4","P5","P6"])if(!js.includes('id:"'+id+'"'))issues.push("Original task "+id+" missing");
if(!js.includes("taskOrder=[0,1,6,2,3,4,5]"))issues.push("Core order changed; original P1–P6 indexes must remain");
if(!js.includes("els-c-fileio-practice-p"))issues.push("Existing browser draft keys lost");
const reference="#include <stdio.h>\nint main(void) {\n    FILE *src = fopen(\"message.txt\", \"r\");\n    if (src == NULL) { perror(\"message.txt\"); return 1; }\n    FILE *dst = fopen(\"preview.txt\", \"w\");\n    if (dst == NULL) { perror(\"preview.txt\"); fclose(src); return 1; }\n    char line[80]; int status = 0;\n    if (fgets(line, sizeof line, src) != NULL) {\n        if (fputs(line, dst) == EOF) status = 1;\n    } else if (ferror(src)) status = 1;\n    if (fclose(dst) == EOF) status = 1;\n    if (fclose(src) == EOF) status = 1;\n    return status;\n}\n";
const t=mkdtempSync(join(tmpdir(),"file-io-m1-"));
try {
 const c=join(t,"m1.c"),exe=join(t,"m1");writeFileSync(c,reference);
 const compiler=spawnSync("gcc",["-std=c11","-Wall","-Wextra","-Wpedantic","-Werror",c,"-o",exe],{encoding:"utf8",timeout:12000});
 if(compiler.status!==0)issues.push("Reference GCC failed: "+compiler.stderr);
 else {
  for(const tc of [{name:"first line only",input:"Sensor online\nsecond line ignored\n",expect:"Sensor online\n"},{name:"empty file",input:"",expect:""},{name:"without newline",input:"Sensor online",expect:"Sensor online"},{name:"short line",input:"OK\n",expect:"OK\n"}]){
   writeFileSync(join(t,"message.txt"),tc.input);const out=join(t,"preview.txt");if(existsSync(out))rmSync(out);
   const result=spawnSync(exe,[],{cwd:t,encoding:"utf8",timeout:3000});
   const actual=existsSync(out)?readFileSync(out,"utf8"):"[MISSING]";
   if(result.status!==0||actual!==tc.expect)issues.push(tc.name+" exit="+result.status+" output="+JSON.stringify(actual));
  }
  rmSync(join(t,"message.txt"));const missing=spawnSync(exe,[],{cwd:t,encoding:"utf8",timeout:3000});
  if(missing.status===0)issues.push("Missing source file not rejected");
 }
} finally {rmSync(t,{recursive:true,force:true})}
if(issues.length){console.error(issues.join("\n"));process.exit(1)}
console.log("PASS: M1 content, P1-P6 keys, GCC C11, normal/empty/no-newline/missing-file behavior.");
