import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const cases=[
 "/signals-systems/applications.html#part-a",
 "/signals-systems/applications.html#part-b",
 "/signals-systems/applications.html#part-c",
 "/signals-systems/applications.html#part-d",
 ...["harmonics","chirp","helix","beats","amfm","sampling"].map(x=>"/signals-systems/applications-lab.html?lab="+x),
 "/signals-systems/applications-fft-lab.html",
 "/signals-systems/applications-fft-resolution.html",
 "/signals-systems/applications-chirp-stft.html",
 "/signals-systems/applications-fft-upload.html",
 "/signals-systems/applications-fft-dtmf.html",
 "/signals-systems/applications-fft-sound-fingerprint.html"
];
const findings=[],results=[];
await mkdir("qa",{recursive:true});
for(const route of cases){
 const page=await browser.newPage({viewport:{width:1366,height:850}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 try{
  const response=await page.goto(base+route,{waitUntil:"domcontentloaded",timeout:25000});
  if(!response?.ok())throw Error("HTTP "+response?.status());
  await page.waitForTimeout(350);
  for(const language of ["en","ko","mixed"]){
   const select=page.locator("#ss-app-language,#ss-al-language,#ss-fft-language,#fft-r-language,#stft-language,#fft-upload-language,#dtmf-language,#finger-language").first();
   if(await select.count()){await select.selectOption(language);await page.waitForTimeout(150)}
   const audit=await page.evaluate(()=>{
     window.SSMathCore?.renderNow?.();
     const explicit=[...document.querySelectorAll("[data-ss-math],[data-latex]")].filter(e=>e.getClientRects().length);
     const missing=explicit.filter(e=>!(e.getAttribute("data-ss-math")||e.getAttribute("data-latex")||"").trim());
     const errors=explicit.filter(e=>e.dataset.ssMathState==="error"||!!e.querySelector(".katex-error"));
     const unrendered=explicit.filter(e=>window.katex?.render&&!e.querySelector(".katex"));
     const raw=[];
     const rx=/\\(?:frac|sum|int|omega|Delta|pi|left|right|begin|end|mathrm|text)\b|\\\(|\\\)|\\\[|\\\]/;
     const root=document.querySelector("main");
     if(root){
       const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
       while(walker.nextNode()){
         const node=walker.currentNode,host=node.parentElement;
         if(!host||host.closest("script,style,textarea,code,pre,svg,math,.katex,[data-ss-math],[data-latex]"))continue;
         if(!host.getClientRects().length)continue;
         const value=(node.textContent||"").trim();
         if(rx.test(value))raw.push({text:value.slice(0,160),parent:host.tagName});
       }
     }
     const legacy=document.getElementById("ss-al-equation");
     let legacyError=null;
     if(legacy&&legacy.getClientRects().length){
       const source=legacy.dataset.tex;
       if(source&&!legacy.querySelector(".katex,math"))legacyError="Legacy equation source not rendered";
     }
     return{explicit:explicit.length,missing:missing.length,errors:errors.length,unrendered:unrendered.length,
       raw:raw.slice(0,12),legacyError,katexAvailable:!!window.katex?.render};
   });
   if(!await page.evaluate(()=>!!window.SSApplicationsMath?.enhance))
     findings.push({route,language,error:"Shared math adapter is not installed"});
   // Verify the same adapter processes a late-inserted explanation, as future labs do.
   const dynamic=await page.evaluate(async()=>{
     const root=document.querySelector("main"),probe=document.createElement("p");
     probe.id="ss-math-future-probe";
     probe.textContent=String.raw`Future lab: \(\frac{1}{2}\) and Δf.`;
     root.append(probe);
     window.SSMathCore?.renderNow?.();
     await Promise.resolve();
     const converted=probe.querySelectorAll("[data-ss-math]").length;
     const rendered=probe.querySelectorAll(".katex").length;
     const plain=[...probe.childNodes].some(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.includes("\\frac"));
     probe.remove();
     return{converted,rendered,plain};
   });
   if(dynamic.converted!==2||dynamic.rendered!==2||dynamic.plain)
     findings.push({route,language,error:"Future dynamic card formula did not render",dynamic});
   results.push({route,language,...audit});
   if(audit.missing||audit.errors||audit.unrendered||audit.raw.length||audit.legacyError||errors.length)
     findings.push({route,language,...audit,pageErrors:errors});
  }
 }catch(e){findings.push({route,error:String(e.message||e)})}
 finally{await page.close()}
}
await browser.close();
await writeFile("qa/applications-math-audit.json",JSON.stringify({testedAt:new Date().toISOString(),cases:results.length,findings,results},null,2));
console.log("Applications math audit:",results.length,"states;",findings.length,"failures");
if(findings.length){findings.slice(0,20).forEach(x=>console.error("FAIL",JSON.stringify(x)));process.exitCode=1}
