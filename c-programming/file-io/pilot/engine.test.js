/* Run: node c-programming/file-io/pilot/engine.test.js
   This checks only deterministic educational simulations. */
"use strict";
const assert = require("node:assert/strict");
const E = require("./engine.js");
let count=0;
function test(name,fn){fn();count++;process.stdout.write("PASS "+name+"\n");}
test("M3 r reads two lines and terminates only on subsequent fgets",()=>{
 const s=E.createM3();assert(E.m3Open(s,"r","lab"));assert.equal(s.phase,"open");
 E.m3Read(s);assert.equal(s.stdout,"25.0\n");assert.equal(s.eof,false);
 E.m3Read(s);assert.equal(s.stdout,"25.0\n26.5\n");assert.equal(s.phase,"open");
 E.m3Read(s);assert.equal(s.returnValue,"NULL");assert.equal(s.phase,"readDone");
 assert(E.m3Close(s));assert.equal(s.exitCode,0);
});
test("M3 w truncates, restart preserves, reset restores",()=>{
 const s=E.createM3();E.m3Open(s,"w","lab");assert.equal(E.m3File(s).content,"");
 E.m3Write(s);E.m3Close(s);E.m3Restart(s);
 assert.equal(E.m3File(s).content,"27.2\n");
 E.m3Reset(s);assert.equal(E.m3File(s).content,E.initialFile);
});
test("M3 a preserves content and appends",()=>{
 const s=E.createM3();E.m3Open(s,"a","lab");E.m3Write(s);E.m3Close(s);
 assert.equal(E.m3File(s).content,"25.0\n26.5\n27.2\n");
});
test("M3 r missing file returns NULL, w/a create",()=>{
 for(const mode of ["r","w","a"]){
 const s=E.createM3();E.m3Open(s,mode,"other");
 assert.equal(s.phase,mode==="r"?"failed":"open");
 assert.equal(E.m3File(s).exists,mode!=="r");
 }
});
test("M4 normal: three 1 returns then EOF, feof=1",()=>{
 const s=E.createM4("normal");E.m4Open(s);
 const returns=[];while(E.m4Next(s)==="read"){E.m4Read(s);returns.push(s.returnValue);}
 assert.deepEqual(returns,["1","1","1","EOF"]);
 assert.equal(s.stdout,"10\n20\n30\n");assert.equal(s.feof,1);assert.equal(s.ferror,0);
 E.m4Close(s);assert.equal(s.exitCode,0);
});
test("M4 malformed: matching failure 0, feof=0",()=>{
 const s=E.createM4("malformed");E.m4Open(s);E.m4Read(s);E.m4Read(s);
 assert.equal(s.returnValue,"0");assert.equal(s.feof,0);assert.equal(s.stdout,"10\n");
 E.m4Close(s);assert.equal(s.exitCode,1);
});
test("M4 empty: immediate EOF",()=>{
 const s=E.createM4("empty");E.m4Open(s);E.m4Read(s);
 assert.equal(s.returnValue,"EOF");assert.equal(s.feof,1);assert.equal(s.stdout,"");
 E.m4Close(s);assert.equal(s.exitCode,0);
});
test("M4 injected read error: EOF return but ferror=1",()=>{
 const s=E.createM4("ioError");E.m4Open(s);E.m4Read(s);E.m4Read(s);
 assert.equal(s.returnValue,"EOF");assert.equal(s.feof,0);assert.equal(s.ferror,1);
 E.m4Close(s);assert.equal(s.exitCode,1);
});
process.stdout.write("All "+count+" pilot engine tests passed.\n");
