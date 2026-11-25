import assert from "node:assert/strict";
import {chromium} from "playwright";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const pages=[
 "applications.html","applications-lab.html?lab=helix","applications-system-lab.html",
 "applications-system-compare.html","applications-dft-fft.html","applications-fft-lab.html",
 "applications-fft-resolution.html","applications-fft-dtmf.html",
 "applications-fft-sound-fingerprint.html","applications-fft-upload.html",
 "applications-fft-image.html","applications-chirp-stft.html"
];
const browser=await chromium.launch({headless:true});
const problems=[];
try{
 for(const width of [1280,390]){
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
  for(const name of pages){
   const page=await context.newPage();
   try{
    const response=await page.goto(base+"/signals-systems/"+name,{waitUntil:"domcontentloaded",timeout:25000});
    assert.equal(response?.status(),200,name+" HTTP");
    await page.locator("header.ss-common-header.els-course-header").waitFor({timeout:12000});
    const measure=await page.evaluate(()=>{
      const header=document.querySelector("header.ss-common-header");
      const box=header.getBoundingClientRect();
      const arrows=[...header.querySelectorAll(".ss-four-navigation svg")];
      const svg=arrows.map(x=>{const b=x.getBoundingClientRect();return [b.width,b.height]});
      const styles=[...document.styleSheets].some(x=>(x.href||"").includes("els-course-header.css"));
      return {h:box.height,w:box.width,left:box.left,arrows:svg,styles,scroll:document.documentElement.scrollWidth,client:innerWidth};
    });
    assert.ok(measure.styles,name+" common CSS absent");
    assert.ok(measure.h>=40&&measure.h<=200,name+" unexpected header height: "+JSON.stringify(measure));
    assert.ok(measure.w<=width+2,name+" header overflows viewport");
    assert.ok(measure.arrows.every(([w,h])=>w>=10&&w<=28&&h>=10&&h<=28),name+" oversized SVG: "+JSON.stringify(measure));
    assert.ok(measure.scroll<=width+8,name+" horizontal overflow: "+JSON.stringify(measure));
    if(name.includes("applications-lab.html")){
      await page.locator("#ss-al-canvas-1").waitFor({timeout:12000});
      const canvas=await page.locator("#ss-al-canvas-1").boundingBox();
      assert.ok(canvas&&canvas.width>240&&canvas.height>145,name+" Helix canvas is missing");
    }
    console.log("PASS",width,name);
   }catch(e){problems.push(width+" "+name+": "+e.message);}
   finally{await page.close();}
  }
  await context.close();
 }
}finally{await browser.close();}
assert.deepEqual(problems,[],"Applications all-pages visual shell QA");
