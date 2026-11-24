#!/usr/bin/env node
/* Post-deployment smoke: verify real hosted C and Signals & Systems headers.
 * This suite operates in isolated browser profiles and never changes student data.
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const root = (process.env.PAGES_BASE_URL || "https://yscho-hgu.github.io/engineering-learning-studio/").replace(/\/?$/, "/");
const pages = [
  ["C", "c-programming/arrays/"],
  ["SS", "signals-systems/chapter2.html"],
];
const browser = await chromium.launch({headless:true});
let failures = 0;
try {
  for (const viewportWidth of [1280,390]) {
    for (const [course,route] of pages) {
      const ctx=await browser.newContext({viewport:{width:viewportWidth,height:900}});
      const page=await ctx.newPage();
      try {
        const response=await page.goto(root+route,{waitUntil:"domcontentloaded",timeout:45000});
        assert.equal(response?.status(),200,`${course} page HTTP status`);
        await page.waitForFunction(()=>{
          const h=document.querySelector("body > header.ss-common-header");
          const nav=h?.querySelector(".ss-four-navigation");
          return !!nav && nav.querySelectorAll(".ss-chapter-arrow svg").length===4;
        },null,{timeout:20000});
        const state=await page.evaluate(()=>{
          const header=document.querySelector("body > header.ss-common-header");
          const nav=header.querySelector(".ss-four-navigation");
          const a=[...nav.querySelectorAll(".ss-chapter-arrow")];
          const boxes=a.map(e=>e.getBoundingClientRect());
          const hb=header.getBoundingClientRect();
          return {
            navCount:a.length,chapterLinks:a.filter(e=>e.classList.contains("ss-nav-chapter")).length,
            sectionButtons:a.filter(e=>e.classList.contains("ss-nav-section")).length,
            arrowsVisible:a.every(e=>{const s=getComputedStyle(e);return s.display!=="none"&&s.visibility!=="hidden"&&e.getBoundingClientRect().width>20}),
            aligned:boxes.every(b=>Math.abs(b.top-boxes[0].top)<3),
            fits:boxes[0].left>=-1&&boxes.at(-1).right<=innerWidth+1,
            centerError:Math.abs((boxes[0].left+boxes.at(-1).right)/2-(hb.left+hb.width/2)),
            sizes:boxes.map(b=>[Math.round(b.width),Math.round(b.height)]),
            leftHref:a[0].getAttribute("href"),rightHref:a[3].getAttribute("href"),
          };
        });
        assert.equal(state.navCount,4);
        assert.equal(state.chapterLinks,2);
        assert.equal(state.sectionButtons,2);
        assert.ok(state.arrowsVisible&&state.aligned&&state.fits,JSON.stringify(state));
        assert.ok(state.centerError<=9,`Header arrows not centered: ${JSON.stringify(state)}`);
        assert.ok(state.sizes.every(([w,h])=>w>=30&&w<=36&&h>=30&&h<=36),JSON.stringify(state));
        assert.ok(state.rightHref,`Missing next chapter link: ${JSON.stringify(state)}`);
        console.log("PASS",course,viewportWidth,JSON.stringify(state));
      }catch(error){
        failures++;
        console.error("FAIL",course,viewportWidth,String(error));
        await page.screenshot({path:`pages-smoke-${course.toLowerCase()}-${viewportWidth}.png`}).catch(()=>{});
      }finally{await ctx.close();}
    }
  }
}finally{await browser.close();}
if(failures){console.error(`${failures} production header smoke case(s) failed`);process.exitCode=1;}
