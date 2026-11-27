/* Evidence integrity: 250/1950 Hz must appear in the plotted D1 FFT and
 * D2 round-trip delay must generate the stated distance. No visual UI changes.
 */
import assert from "node:assert/strict";
import {chromium} from "playwright";
const base=process.env.SS_TEST_BASE||"http://127.0.0.1:8765";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1366,height:900}});
const errors=[];
page.on("pageerror",e=>errors.push(e.message));
try{
  let r=await page.goto(base+"/signals-systems/applications-audio-filter.html",{waitUntil:"load"});
  assert.equal(r?.status(),200);
  await page.locator("#source").selectOption("tones");
  await page.locator("#filter").selectOption("low");
  await page.locator("#cutoff").evaluate(el=>{el.value="950";el.dispatchEvent(new Event("input",{bubbles:true}))});
  const capture=()=>page.locator("#specplot").evaluate(canvas=>{
    const rect=canvas.getBoundingClientRect(),ratio=canvas.width/rect.width,ctx=canvas.getContext("2d");
    const bytes=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    function highestVisibleColor(f,rgb){
      const expected=(51+(f/4000)*(rect.width-51-19))*ratio;
      const xmin=Math.max(0,Math.round(expected-6*ratio));
      const xmax=Math.min(canvas.width-1,Math.round(expected+6*ratio));
      const ymin=Math.round(32*ratio),ymax=Math.round((rect.height-37)*ratio);
      let best=null,count=0;
      for(let yy=ymin;yy<ymax;yy++)for(let xx=xmin;xx<=xmax;xx++){
        const idx=4*(yy*canvas.width+xx);
        if(Math.abs(bytes[idx]-rgb[0])<=25&&Math.abs(bytes[idx+1]-rgb[1])<=25&&Math.abs(bytes[idx+2]-rgb[2])<=25){
          count++;if(best===null||yy<best)best=yy;
        }
      }
      return {top:best===null?null:best/ratio,count};
    }
    return {
      width:rect.width,height:rect.height,
      blue250:highestVisibleColor(250,[74,156,232]),
      blue1950:highestVisibleColor(1950,[74,156,232]),
      output250:highestVisibleColor(250,[229,158,78]),
      output1950:highestVisibleColor(1950,[229,158,78])
    };
  });
  const low=await capture();
  assert(low.width>400&&low.height>150,"Spectrum canvas collapsed");
  assert(low.blue250.count>2&&low.blue1950.count>2,
    "A visible input peak is missing at 250 or 1950 Hz: "+JSON.stringify(low));
  await page.locator("#filter").selectOption("high");
  const high=await capture();
  assert(high.output1950.top!==null&&high.output250.top!==null,
    "High-pass peaks not rendered at both frequencies: "+JSON.stringify(high));
  assert(low.output250.top!==null&&low.output1950.top!==null,
    "Low-pass peaks not rendered at both frequencies: "+JSON.stringify(low));
  // Smaller y means higher spectral magnitude in the plotted dB graph.
  assert(low.output250.top+30<high.output250.top,
    "Low-pass should retain 250 Hz far more than high-pass: "+JSON.stringify({low,high}));
  assert(high.output1950.top+30<low.output1950.top,
    "High-pass should retain 1950 Hz far more than low-pass: "+JSON.stringify({low,high}));
  console.log("PASS D1: input FFT includes 250 & 1950 Hz; LP/HP output peaks swap",JSON.stringify({low,high}));
  r=await page.goto(base+"/signals-systems/applications-chirp-echo.html",{waitUntil:"load"});
  assert.equal(r?.status(),200);
  await page.locator("#noise").evaluate(el=>{el.value="0";el.dispatchEvent(new Event("input",{bubbles:true}))});
  for(const d of [17,27]){
    await page.locator("#distance").evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event("input",{bubbles:true}))},d);
    const estimate=Number((await page.locator("#estimate").innerText()).replace(/\s*m$/,""));
    const travel=Number((await page.locator("#truth").innerText()).replace(/\s*ms$/,""));
    assert(Math.abs(estimate-d)<.15,"D2 estimated distance disagrees with actual target at "+d+": "+estimate);
    const expectedTravel=2000*d/343;
    assert(Math.abs(travel-expectedTravel)<.12,"D2 round-trip delay is wrong: "+JSON.stringify({d,travel,expectedTravel}));
    assert((await page.locator("#radar-observe-settings").innerText()).includes(d+" m"),
      "D2 Step 3 does not track Step 2 distance");
  }
  console.log("PASS D2: round-trip delay, correlation maximum and distance agree at 17 m and 27 m");
  assert.equal(errors.length,0,"Browser JS exceptions: "+errors.join(" | "));
}finally{await page.close();await browser.close()}
