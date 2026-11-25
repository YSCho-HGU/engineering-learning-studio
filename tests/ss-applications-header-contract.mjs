#!/usr/bin/env node
/* Applications shared-header integration contract. Prevent unstyled SVG navigation. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
const pages=[
 "applications.html","applications-lab.html","applications-system-lab.html",
 "applications-system-compare.html","applications-dft-fft.html",
 "applications-fft-lab.html","applications-fft-resolution.html",
 "applications-fft-dtmf.html","applications-fft-sound-fingerprint.html",
 "applications-fft-upload.html","applications-fft-image.html",
 "applications-chirp-stft.html"
];
let checked=0;
for(const name of pages){
 const html=readFileSync(join("signals-systems",name),"utf8");
 assert.match(html,/ss-common-header\.css/,name+" missing S&S header layer");
 assert.match(html,/els-course-header\.css/,name+" missing mandatory shared header SVG geometry");
 assert.match(html,/els-header-controls\.js/,name+" missing header integration");
 assert.ok(html.indexOf("els-course-header.css")<html.indexOf("</head>"),name+" header CSS must load in head");
 checked++;
}
const css=readFileSync("assets/els-course-header.css","utf8");
assert.match(css,/ss-chapter-arrow svg/,"SVG arrow dimensions must remain in shared design system");
assert.match(css,/width:17px!important/,"Arrow width is 17px");
assert.match(css,/height:17px!important/,"Arrow height is 17px");
console.log("PASS Applications header geometry contract: "+checked+" pages");
