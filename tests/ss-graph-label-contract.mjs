/* Source-level contract: mapped axes preserve mathematical meanings and units. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const source=readFileSync("signals-systems/assets/ss-graph-math.js","utf8");
const window={addEventListener(){}};
const document={readyState:"loading",addEventListener(){}};
runInNewContext(source,{window,document});
const registry=window.SSGraphMath;
assert.equal(typeof registry?.latexFor,"function","Graph math API must be available");
const labels=[
 ["Re(s) = σ",String.raw`\operatorname{Re}(s)=\sigma`],
 ["Im(s) = ω",String.raw`\operatorname{Im}(s)=\omega`],
 ["Re(z)",String.raw`\operatorname{Re}(z)`],
 ["Im(z)",String.raw`\operatorname{Im}(z)`],
 ["ω (rad/s)",String.raw`\omega\;(\mathrm{rad/s})`],
 ["Ω (rad/sample)",String.raw`\Omega\;(\mathrm{rad/sample})`],
 ["digital frequency Ω/π",String.raw`\Omega/\pi`],
 ["phase difference (rad)",String.raw`\Delta\phi\;(\mathrm{rad})`],
 ["sample index n (full record)",String.raw`n\;(\text{full record})`],
 ["time (seconds)",String.raw`t\;(\mathrm{s})`],
 ["normalized amplitude (dB)",String.raw`\text{Normalized amplitude }(\mathrm{dB})`],
 ["|aₖ|",String.raw`|a_k|`],
 ["|X_N|/N",String.raw`\frac{|X_N|}{N}`],
 ["|X(jω)|",String.raw`|X(j\omega)|`],
 ["|H(jω)|",String.raw`|H(j\omega)|`],
 ["X(e^{jΩ})",String.raw`X(e^{j\Omega})`],
 ["S_K = Σ|h[k]|",String.raw`S_K=\sum_k|h[k]|`],
 ["fₛ/2",String.raw`\frac{f_s}{2}`]
];
for(const [raw,latex] of labels){
 assert.equal(registry.latexFor(raw),latex,"Math axis mismatch: "+raw);
}
assert.equal(registry.latexFor("ordinary caption"),null,"Do not modify prose labels");
assert.equal(typeof registry.typesetCaptionText,"function");
console.log("PASS Signals & Systems graph math axis/source registry: "+labels.length+" expressions");
