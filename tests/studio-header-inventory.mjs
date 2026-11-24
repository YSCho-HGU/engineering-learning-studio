/* Shared header source inventory (no browser dependencies).
   Teaching pages must load the shared adapter; archived snapshots remain immutable. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const modules=["arrays","strings","standard-library","functions","pointer","structure","file-io","dynamic-memory","ai-coding"];
const cPaths=modules.flatMap(slug=>["c-programming/"+slug+"/index.html",...(slug==="ai-coding"?[]:["c-programming/"+slug+"/practice/index.html"])]);
cPaths.push("c-programming/file-io/core-labs/index.html","c-programming/ai-coding/toolkit.html");
const apps=["applications","applications-chirp-stft","applications-dft-fft","applications-fft-dtmf","applications-fft-image","applications-fft-lab","applications-fft-resolution","applications-fft-sound-fingerprint","applications-fft-upload","applications-lab","applications-system-compare","applications-system-lab"];
const ssPaths=["index",...Array.from({length:8},(_,i)=>"chapter"+(i+1)),...apps].map(name=>"signals-systems/"+name+".html");
const projectPaths=["01-reaction-time","02-gpa-calculator","03-sorting-visualizer","04-signal-generator","05-study-planner","06-sensor-dashboard"].map(name=>"c-programming/ai-coding/projects/"+name+".html");
const issues=[];
function verify(path,patterns){let text;try{text=load(path)}catch(e){issues.push(path+": "+e.message);return}
 for(const [label,pattern] of patterns)if(!pattern.test(text))issues.push(path+": missing "+label);
}
for(const path of cPaths)verify(path,[["C shell",/c-ss-shell\.js/],["shared ELS header",/els-header-controls\.js/]]);
for(const path of ssPaths)verify(path,[["SS header stylesheet",/ss-common-header\.css/],["SS header controller",/ss-common-header\.js/],["shared header stylesheet",/els-header-controls\.css/],["shared header controller",/els-header-controls\.js/]]);
for(const path of projectPaths)verify(path,[["shared header stylesheet",/els-header-controls\.css/],["shared header controller",/els-header-controls\.js/]]);
verify("c-programming/learning-journey/index.html",[["shared stylesheet",/els-header-controls\.css/],["shared adapter",/els-header-controls\.js/]]);
verify("index.html",[["shared header stylesheet",/els-header-controls\.css/],["shared header controller",/els-header-controls\.js/]]);
verify("c-programming/index.html",[["shared header stylesheet",/els-header-controls\.css/],["shared header controller",/els-header-controls\.js/]]);
const shell=load("c-programming/c-ss-shell.js"),shared=load("assets/els-header-controls.js");
assert.match(shell,/makeNavigationArrow/,"C shell must use shared SVG factory");
assert.match(shared,/function makeNavigationArrow/,"Shared SVG factory missing");
assert.match(shared,/function normalize/,"Shared header normalizer missing");
if(issues.length){console.error(issues.join("\n"));process.exitCode=1}
else console.log("PASS source inventory:",cPaths.length+" C chapter/practice",ssPaths.length+" SS",projectPaths.length+" active AI projects, plus portals/overview");
