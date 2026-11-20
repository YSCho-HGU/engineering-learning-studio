#!/usr/bin/env node
/* Unified public snapshots. Read-only aggregation from real test result files. */
import {readFileSync,existsSync,mkdirSync,writeFileSync} from "node:fs";
const read=f=>{try{return JSON.parse(readFileSync(f,"utf8"))}catch{return null}};
const policy=read("docs/qa/studio-quality-policy.json");
const catalog=read("c-programming/course-catalog.json");
const browser=read("qa-unified/browser-results.json");
const baseline=read("qa-phase0/c-baseline.json");
const status=id=>{try{const x=readFileSync("qa-unified/"+id+".status","utf8").trim();return ["PASS","FAIL","NOT_RUN"].includes(x)?x:"NOT_RUN"}catch{return "NOT_RUN"}};
const now=new Date().toISOString(),runId=process.env.GITHUB_RUN_ID||null,sha=process.env.GITHUB_SHA||null;
const runUrl=runId?"https://github.com/YSCho-HGU/engineering-learning-studio/actions/runs/"+runId:null;
const gates=policy.commonGates.map(x=>({id:x.id,label:x.name,status:status(x.id),required:true}));
const pending={axesAndLegends:"PENDING",mathematics:"PENDING",pedagogy:"PENDING"};
const cUnits=catalog.chapters.filter(c=>c.published).map(c=>{
 const result=browser?.c?.chapters?.find(x=>x.id===String(c.id));
 const cStatus=result?.status||"NOT_RUN";
 return {id:String(c.id),title:c.title,labCount:result?.checks??0,
  visual:{status:cStatus,expected:4,observed:result?.checks??0,issues:result?.issues?.length||0,missing:4-(result?.checks??0)},
  issueExamples:result?.issues||[],manual:{...pending},
  coverage:{numericalReference:c.url==="./file-io/"?"File I/O specialist checks; GCC oracle separately scoped":"GCC C11 stdout for supported common-engine cases"}};
});
const cPass=gates.every(g=>g.status==="PASS")&&cUnits.every(c=>c.visual.status==="PASS");
const c={
 schemaVersion:1,course:"c-programming",generatedAt:now,sourceSha:sha,runId,runUrl,
 automaticStatus:cPass?"AUTOMATED_PASS":"BLOCKED_AUTOMATED",
 automatedStatus:cPass?"AUTOMATED_PASS":"BLOCKED_AUTOMATED",
 manualStatus:"PENDING",releaseStatus:cPass?"AUTOMATED_PASS_MANUAL_PENDING":"BLOCKED_AUTOMATED",
 chaptersCount:8,labsCount:8,plannedUnits:catalog.chapters.length,
 gates,chapters:cUnits,
 visual:{expected:32,observed:browser?.c?.chapters?.reduce((n,x)=>n+x.checks,0)||0,
   issues:browser?.failures?.filter(x=>x.id!=="logic-pilot").length??null},
 notes:["PASS applies only to the named, executed checks for eight published C chapters.","Compiler reference output does not verify every possible input or student solution.","Instructor evaluation M1–M3 remains pending."]};
const pilot=browser?.logic?.viewports||[];
const logicBase=pilot.length===4&&pilot.every(x=>x.status==="PASS");
const g0=status("G0"),g1=status("G1"),g2=status("G2"),g3=status("G3"),g7=status("G7");
const logicGates=policy.commonGates.map(x=>{
 const map={G0:g0,G1:g1,G2:g2,G3:g3,G4:logicBase?"PASS":"NOT_RUN",G5:"NOT_RUN",G6:logicBase?"PASS":"NOT_RUN",G7:g7};
 return {id:x.id,label:x.name,status:map[x.id],required:x.id!=="G5"};
});
const prototypePassed=logicBase&&logicGates.filter(g=>g.required).every(g=>g.status==="PASS");
const logic={
 schemaVersion:1,course:"logic-design",generatedAt:now,sourceSha:sha,runId,runUrl,
 mode:"prototype",automatedStatus:prototypePassed?"PILOT_PASS":"PILOT_BLOCKED",
 releaseStatus:prototypePassed?"PILOT_PASS_FUTURE_COURSE_PENDING":"PILOT_BLOCKED",
 formalCourseStatus:"NOT_RUN",manualStatus:"PENDING",
 plannedUnits:null,publishedUnits:0,
 testedPrototype:"5 combinational gate types × 4 input combinations; 2 widths × 2 themes",
 visual:{expected:4,observed:pilot.length,issues:browser?.failures?.filter(x=>x.id==="logic-pilot").length??null},
 truthTableCases:20,
 chapters:[],
 gates:logicGates,notes:["This is the existing homepage mini-lab, not a completed Logic Design course.","Storage, clocked/sequential circuits, state transitions and full lessons are NOT_RUN.","M1–M3 manual review is pending."]};
mkdirSync("qa-dashboard",{recursive:true});
for(const [file,data] of [["c-latest.json",c],["logic-latest.json",logic]])
 writeFileSync("qa-dashboard/"+file,JSON.stringify(data,null,2)+"\n");
const overall={schemaVersion:1,generatedAt:now,sourceSha:sha,runUrl,
 sharedPolicy:"docs/qa/studio-quality-policy.json",courses:[
 {id:"signals-systems",kind:"external",source:"https://raw.githubusercontent.com/YSCho-HGU/signals-systems-visual-lab/main/qa-dashboard/latest.json"},
 {id:"c-programming",kind:"local",status:c.releaseStatus,source:"qa-dashboard/c-latest.json"},
 {id:"logic-design",kind:"local",status:logic.releaseStatus,source:"qa-dashboard/logic-latest.json"}
]};
writeFileSync("qa-dashboard/studio-latest.json",JSON.stringify(overall,null,2)+"\n");
console.log(JSON.stringify({c:c.releaseStatus,logic:logic.releaseStatus,cGates:gates.map(g=>[g.id,g.status]),logicGates:logicGates.map(g=>[g.id,g.status]),cUnits:cUnits.length,logicPilotViews:pilot.length},null,2));
if(!cPass||!prototypePassed)process.exitCode=1;
