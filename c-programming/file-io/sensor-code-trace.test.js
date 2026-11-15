"use strict";
const assert=require("node:assert/strict");
const Sensor=require("./sensor-model.js");
const Code=require("./sensor-code-trace.js");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const raw=html.match(/<pre id="sensor-c-source">([\s\S]*?)<\/pre>/);
assert.ok(raw,"Displayed code must exist");
const c=raw[1].replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
let tests=0;
const test=(name,fn)=>{fn();tests++;console.log("PASS "+name)};
test("Every simulation statement maps to a displayed code line",()=>{
 const result=Sensor.simulate(Sensor.sample,3);
 const snaps=Code.build(result,3);
 assert.ok(snaps.length>20);
 for(const snap of snaps)assert.ok(Code.codeLineIndex(c,snap.lineMarker)>=0,snap.key+" missing source line");
});
test("sum updates before count and threshold check",()=>{
 const snaps=Code.build(Sensor.simulate(Sensor.sample,3),3);
 const [read,sum,count,condition]=snaps;
 assert.deepEqual([read.key,sum.key,count.key,condition.key],["read","sum","count","condition"]);
 assert.equal(read.state.sum,0);assert.equal(sum.state.sum,2.51);
 assert.equal(sum.state.count,0);assert.equal(count.state.count,1);
});
test("Alert printed only after threshold condition",()=>{
 const snaps=Code.build(Sensor.simulate(Sensor.sample,3),3);
 const alert=snaps.filter(x=>x.key==="alert");assert.equal(alert.length,1);
 assert.equal(alert[0].state.stdout,"ALERT 0.3: 3.82\n");
 assert.equal(snaps.at(-1).state.stdout,"ALERT 0.3: 3.82\nCount = 4\nAverage = 2.840\n");
});
test("EOF leaves time and value unchanged",()=>{
 const snaps=Code.build(Sensor.simulate(Sensor.sample,3),3);
 const eof=snaps.filter(x=>x.key==="read").at(-1);
 assert.equal(eof.state.fields,"EOF");assert.equal(eof.state.time,0.3);assert.equal(eof.state.value,3.82);
 assert.equal(eof.state.count,4);
});
test("Partial conversion modifies time but preserves previous value",()=>{
 const snaps=Code.build(Sensor.simulate("0.0 2.51\n0.1 BAD\n",3),3);
 const fail=snaps.filter(x=>x.key==="read").at(-1);
 assert.equal(fail.state.fields,"1");assert.equal(fail.state.time,0.1);
 assert.equal(fail.state.value,2.51);
 assert.equal(fail.state.sum,2.51);assert.equal(fail.state.count,1);
 assert.equal(snaps.at(-1).state.exitCode,1);
});
test("Failed record does not print successful average",()=>{
 const snaps=Code.build(Sensor.simulate("0.0 2.51\nERROR\n",3),3);
 assert.equal(snaps.at(-1).state.stdout,"");
 assert.equal(snaps.at(-1).state.stderr,"Invalid sensor record: 0 field(s) read\n");
 assert.ok(!snaps.some(x=>x.key==="finalAverage"));
});
test("Empty input results in No sensor records",()=>{
 const snaps=Code.build(Sensor.simulate("",3),3);
 assert.equal(snaps[0].state.fields,"EOF");
 assert.equal(snaps.at(-1).state.stdout,"No sensor records\n");
});
test("Step 07 retains separate original and robust source download",()=>{
 assert.match(html,/sensor_log_analyzer\.c/);
 assert.match(html,/sensor_log_robust_fgets\.c/);
 assert.match(html,/id="sensor-assessment-form"/);
 assert.match(html,/id="sensor-code-fields"/);
});
console.log("All "+tests+" C-statement trace checks passed.");
