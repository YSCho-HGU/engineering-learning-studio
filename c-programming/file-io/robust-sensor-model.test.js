"use strict";
const assert=require("node:assert/strict");
const F=require("./sensor-model.js");
const R=require("./robust-sensor-model.js");
let passed=0;
function check(label,fn){fn();passed++;process.stdout.write("PASS "+label+"\n");}
check("Normal input agrees",()=>{const a=F.simulate(F.sample),b=R.simulate(F.sample);assert.equal(a.stdout,b.stdout);assert.equal(a.count,4)});
check("Cross-line tokens differ",()=>{const a=F.simulate(F.cases.crossLine),b=R.simulate(F.cases.crossLine);assert.equal(a.exitCode,0);assert.equal(b.exitCode,1);assert.equal(b.stderr,"Invalid record at line 1\n")});
check("Empty file is clean EOF in both",()=>{const a=F.simulate(""),b=R.simulate("");assert.equal(a.exitCode,0);assert.equal(b.exitCode,0);assert.equal(b.stdout,"No sensor records\n")});
check("Malformed line carries line number",()=>{const b=R.simulate(F.cases.malformed);assert.equal(b.exitCode,1);assert.equal(b.stderr,"Invalid record at line 3\n")});
check("Partial line carries line number",()=>{const b=R.simulate(F.cases.partial);assert.equal(b.exitCode,1);assert.equal(b.stderr,"Invalid record at line 3\n")});
check("Long line rejected",()=>{const b=R.simulate("0.0 "+"2".repeat(260)+"\n");assert.equal(b.exitCode,1);assert.match(b.stderr,/Line 1 too long/)});
check("Extra columns rejected",()=>{assert.equal(R.simulate("0.0 2.51 99\n").exitCode,1)});
check("Threshold strict greater",()=>{const b=R.simulate("0.0 3.0\n0.1 3.01\n");assert.equal(b.alerts.length,1)});
check("Snapshot fields available at successful reads",()=>{const a=F.simulate(F.sample);assert.equal(a.trace[0].count,1);assert.equal(a.trace[1].sum,5.06);assert.equal(a.trace[0].time,0);assert.equal(a.trace[0].value,2.51)});
check("Partial conversion shows time only",()=>{const a=F.simulate("0.0 2.51\n0.1 BAD\n");assert.equal(a.trace[1].lastReturn,"1");assert.equal(a.trace[1].time,0.1);assert.equal(a.trace[1].value,undefined)});
process.stdout.write(passed+" comparison checks passed.\n");
