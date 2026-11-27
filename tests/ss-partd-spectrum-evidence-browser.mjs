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
  // Curves are drawn in order: a passing orange output can fully cover the
  // blue input at 250 Hz, so validate the complementary visible peaks instead.
  assert(low.output250.count>2&&low.blue1950.count>2,
    "Low-pass evidence is missing its 250 Hz output or 1950 Hz input: "+JSON.stringify(low));
  await page.locator("#filter").selectOption("high");
  const high=await capture();
  assert(high.blue250.count>2&&high.output1950.count>2,
    "High-pass evidence is missing its 250 Hz input or 1950 Hz output: "+JSON.stringify(high));
  assert(high.output1950.top!==null&&low.output250.top!==null,
    "Passing-tone peaks were not rendered: "+JSON.stringify({low,high}));
  // Suppressed tones can fall below the -75 dB graph floor, so no colored
  // pixels inside the plotting area is itself a valid attenuation result.
  const floor=Math.min(low.height,high.height)-37;
  const low250=low.output250.top,low1950=low.output1950.top??floor;
  const high250=high.output250.top??floor,high1950=high.output1950.top;
  assert(low250+30<high250,
    "Low-pass should retain 250 Hz far more than high-pass: "+JSON.stringify({low,high}));
  assert(high1950+30<low1950,
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
