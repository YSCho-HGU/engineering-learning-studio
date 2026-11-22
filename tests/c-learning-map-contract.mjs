#!/usr/bin/env node
/* Structural regression for C course learning taxonomy and sidebar routing.
 * Source contract only: browser interaction is covered by c-integrated-qa.
 */
import fs from "node:fs";
import assert from "node:assert/strict";
const read=p=>fs.readFileSync(p,"utf8");
const chapters=["arrays","strings","standard-library","functions","pointer","structure","dynamic-memory"];
const shell=read("c-programming/c-ss-shell.js");
const renderer=read("c-programming/journey.js");
const practice=read("c-programming/practice-engine.js");
assert.match(shell,/function makeGroup\(/,"shared grouped sidebar helper");
for(const group of ['"core"','"labs"','"advanced"','"challenges"'])assert.ok(shell.includes(group),"missing shared sidebar group "+group);
assert.match(renderer,/const core=group\("core"/);
assert.match(renderer,/const optional=hasOptional\?group\("advanced"/);
assert.match(renderer,/Coding Challenges/);
assert.match(renderer,/labData\.length\?group\("labs"/);
assert.match(renderer,/\.\/practice\/#p/);
assert.match(practice,/hashTask/,"deep linking to individual P tasks");
for(const slug of chapters){
 const page=read("c-programming/"+slug+"/index.html");
 assert.match(page,/id="lesson-nav"/,slug+" sidebar lesson navigation");
 assert.doesNotMatch(page,/class="(?:course-core-links|c-learning-shortcuts)"/,slug+" must have no duplicated top learning shortcuts");
 assert.match(page,/c-ss-shell\.js/,slug+" shared header and sidebar");
 assert.match(page,/journey\.js/,slug+" generated grouped lesson navigation");
 assert.match(page,/class="hero-meta" id="hero-count"/,slug+" compact course summary");
 assert.doesNotMatch(page,/id="coding-practice"/,slug+" duplicate coding preview must not return");
 assert.doesNotMatch(page,/id="site-title"|id="current-title"|class="hero-aside"/,slug+" duplicate heading or redundant hero card");
 assert.match(page,/class="journey-practice-link"/,slug+" direct challenge link retained");
}
const fileio=read("c-programming/file-io/index.html");
const labs=read("c-programming/file-io/core-labs/index.html");
const filePractice=read("c-programming/file-io/practice/index.html");
assert.doesNotMatch(fileio,/class="learning-route"/,"File I/O top learning path removed");
assert.doesNotMatch(fileio,/id="concept-count"/,"redundant count removed, stored concept evidence retained");
assert.match(fileio,/id="lesson-nav"/);
assert.match(fileio,/class="fileio-lab-nav"/,"three guided labs remain linked");
assert.match(labs,/data-lab-link="write"/);
assert.match(labs,/data-lab-link="read"/);
assert.match(labs,/data-lab-link="student"/);
assert.match(filePractice,/id="task-nav"/);
assert.doesNotMatch(filePractice,/class="practice-core-route"/,"practice shortcuts replaced by sidebar");
const app=read("c-programming/file-io/practice/app.js");
assert.match(app,/details\.className="c-learning-group"/);
assert.match(app,/shellControls/,"task changes preserve chapter sidebar and links");
for(const source of [fileio,labs,filePractice])assert.doesNotMatch(source,/src="[^"]*learning-nav\.js"/,"legacy top path script removed");
console.log("PASS: C course taxonomy, group order, sidebar routing and legacy top-path removal");
