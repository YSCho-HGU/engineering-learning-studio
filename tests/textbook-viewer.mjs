/* Shared PDF textbook viewer contract and integration regression.
 * node tests/textbook-viewer.mjs */
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
const html=read("textbook-viewer/index.html");
const css=read("textbook-viewer/viewer.css");
const js=read("textbook-viewer/viewer.mjs");
const catalog=read("c-programming/course-catalog.js");
const cFileio=read("c-programming/file-io/index.html");
const cPractice=read("c-programming/file-io/practice/index.html");
const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message)};
try{new Function(js)}catch(error){errors.push("viewer.mjs syntax: "+error.message)}
try{new Function(catalog)}catch(error){errors.push("catalog.js syntax: "+error.message)}
for(const id of ["local-pdf","paste-drive","open-drive-link","color-mode","drive-preview","pdf-canvas","page-input","next","previous","zoom","open-original"]){
 assert(html.includes('id="'+id+'"'),"Viewer control missing: "+id);
}
assert(js.includes("4.10.38/pdf.min.mjs")&&js.includes("4.10.38/pdf.worker.min.mjs"),"PDF.js and worker versions must match");
assert(js.includes("pageColors")&&js.includes("foreground")&&js.includes("background"),"PDF.js color customization missing");
assert(js.includes("data:")===false,"Do not enable data URI PDFs from URL parameters");
assert(js.includes('u.origin!==location.origin')&&js.includes('endsWith(".pdf")'),"Same-origin PDF URL restriction missing");
assert(js.includes('a-zA-Z0-9_-')&&js.includes("drive.google.com"),"Google Drive URL validation missing");
assert(js.includes('input instanceof Uint8Array'),"Local file PDF.js source missing");
assert(js.includes('URL.revokeObjectURL'),"Resource cleanup missing");
assert(js.includes("pageColors")&&css.includes(".drive-wrap.dark-preview iframe"),"Dark mode not implemented for both viewer types");
assert(css.includes('data-els-theme="warm-neutral"'),"Light site theme missing");
assert(catalog.includes("textbookViewer(book,c.title)"),"C course textbook cards not using viewer");
assert(cFileio.includes("../../textbook-viewer/?course=c"),"C File I/O source link not using viewer");
assert(cPractice.includes("../../../textbook-viewer/?course=c"),"C File I/O practice source link not using viewer");
if(errors.length){console.error("FAIL: "+errors.join("\nFAIL: "));process.exitCode=1}else console.log("PASS: textbook viewer routes, theme colors, PDF.js pinning, source validation, and integrations.");
