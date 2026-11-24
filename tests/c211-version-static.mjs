import {readFileSync,existsSync} from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";
const names=["01-reaction-time","02-gpa-calculator","03-sorting-visualizer","04-signal-generator","05-study-planner","06-sensor-dashboard"];
const root="c-programming/ai-coding/projects/versions/";
for(const name of names){const versions=new Set();for(let v=1;v<=5;v++){const s=readFileSync(root+name+"/v"+v+".html","utf8");assert.match(s,new RegExp("VERSION "+v+"/5"));assert.match(s,/id="copy-prompt"/);assert.match(s,/download="/);assert.ok(!versions.has(s));versions.add(s);for(const m of s.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);}assert.equal(versions.size,5)}
assert.ok(existsSync(root+"index.html"));
console.log("PASS: 30 distinct standalone HTML stages, prompt, navigation, download and script syntax.");
