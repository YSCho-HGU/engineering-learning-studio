#!/usr/bin/env node
/* Published-site regression for all active C and S&S chapters.
 * Read-only, isolated browser contexts; neither student drafts nor progress are changed.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

const root = (process.env.PAGES_BASE_URL || "https://yscho-hgu.github.io/engineering-learning-studio/").replace(/\/?$/, "/");
const cSlugs = ["arrays","strings","standard-library","functions","pointer","structure","file-io","dynamic-memory","ai-coding"];
const targets = [
  ...cSlugs.map(slug => ({course:"C", chapter:slug, route:`c-programming/${slug}/`})),
  ...Array.from({length:8},(_,i)=>({course:"SS",chapter:String(i+1),route:`signals-systems/chapter${i+1}.html`})),
  {course:"SS",chapter:"applications",route:"signals-systems/applications.html"}
];
// Release fingerprint: never label a stale Pages publish as a successful UI fix.
const cssResponse=await fetch(root+"assets/els-course-header.css",{cache:"no-store"});
assert.equal(cssResponse.status,200,"Published common header CSS was not found");
const cssBody=await cssResponse.text();
assert.ok(cssBody.includes("els-header-v7-single-component-20261124"),
  "The live Pages site is serving an older shared-header stylesheet; deployment is stale");
const widths = [390,768,1280];
const failures = [], results = [];
const browser = await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900}});
await context.addInitScript(()=>{
  localStorage.setItem("els-language","mixed");
  localStorage.setItem("els-theme-v2","neutral-dark");
  localStorage.setItem("studio-pages-smoke-marker","untouched");
});
const page=await context.newPage();
let last;
try {
  for(const width of widths) {
    await page.setViewportSize({width,height:900});
    for(const target of targets) {
      const id=`${target.course}-${target.chapter}-${width}`;
      const errors=[];
      const onError=error=>errors.push(error.message);
      page.on("pageerror",onError);
      try {
        const response=await page.goto(root+target.route,{waitUntil:"domcontentloaded",timeout:45000});
        assert.equal(response?.status(),200,`${id}: HTTP status`);
        await page.waitForFunction(()=>{
          const h=document.querySelector("body > header.ss-common-header");
          return h?.querySelectorAll(".ss-four-navigation .ss-chapter-arrow svg").length===4
             && h.querySelectorAll(".ss-common-actions select").length>=2;
        },null,{timeout:15000});
        const state=await page.evaluate(()=>{
          const header=document.querySelector("body > header.ss-common-header");
          const headerBuild=header.classList.contains("els-course-header")&&!!header.querySelector(":scope > .els-header-left");
          const nav=header.querySelector(".ss-four-navigation");
          const arrows=[...nav.querySelectorAll(".ss-chapter-arrow")];
          const rects=arrows.map(e=>e.getBoundingClientRect());
          const head=header.getBoundingClientRect();
          const style=getComputedStyle(nav);
          return {
            headerBuild,
            count:arrows.length,
            classes:arrows.map(e=>e.className),
            tags:arrows.map(e=>e.tagName),
            accessible:arrows.every(e=>e.getAttribute("aria-label") && e.querySelector("svg")),
            visible:rects.every((r,i)=>r.width>=29&&r.height>=29&&
              getComputedStyle(arrows[i]).visibility!=="hidden"&&getComputedStyle(arrows[i]).display!=="none"),
            sameRow:rects.every(r=>Math.abs(r.top-rects[0].top)<=3),
            insideViewport:rects[0].left>=-1&&rects.at(-1).right<=innerWidth+1,
            chooserWidth:header.querySelector(".ss-common-menu").getBoundingClientRect().width,
            chooserToNavGap:rects[0].left-header.querySelector(".ss-common-menu").getBoundingClientRect().right,
            centerError:Math.abs((rects[0].left+rects.at(-1).right)/2-(head.left+head.width/2)),
            dimensions:rects.map(r=>[Math.round(r.width),Math.round(r.height)]),
            navigationDisplay:style.display,
            chapterLinks:[arrows[0].getAttribute("href"),arrows[3].getAttribute("href")],
            sectionButtons:arrows.slice(1,3).every(e=>e.tagName==="BUTTON"),
            localStoragePreserved:localStorage.getItem("studio-pages-smoke-marker")==="untouched",
            chapterMenu:!!header.querySelector(".ss-common-menu > summary"),
            language:!!header.querySelector(".ss-common-language-select"),
            theme:!!header.querySelector("[data-els-theme-picker]"),
          };
        });
        assert.equal(state.count,4,id+" arrow count");
        assert.ok(state.accessible&&state.visible&&state.sameRow&&state.insideViewport,
          id+" geometry "+JSON.stringify(state));
        if(width===1280){
          assert.ok(state.chooserWidth<=440,id+" chooser unexpectedly expanded "+JSON.stringify(state));
          assert.ok(state.chooserToNavGap>=0&&state.chooserToNavGap<=22,
            id+" arrows not adjacent to chapter chooser "+JSON.stringify(state));
        }
        assert.ok(state.dimensions.every(([w,h])=>Math.abs(w-34)<=4&&Math.abs(h-34)<=4),
          id+" size mismatch "+JSON.stringify(state));
        assert.ok(state.sectionButtons&&state.chapterMenu&&state.language&&state.theme,
          id+" header controls "+JSON.stringify(state));
        assert.ok(state.localStoragePreserved,id+" modified unrelated localStorage");
        if(!((target.course==="C"&&target.chapter==="ai-coding") ||
          (target.course==="SS"&&target.chapter==="applications")))
          assert.ok(state.chapterLinks[1],id+" no next chapter");
        assert.deepEqual(errors,[],id+" JS errors");
        // Validate navigation destination without leaving the page: links must point
        // to a published route. First chapter may intentionally have no previous link.
        for(const href of state.chapterLinks.filter(Boolean)){
          const dest=new URL(href,root+target.route);
          assert.equal(dest.origin,new URL(root).origin,id+" unexpected chapter destination");
          assert.ok(dest.pathname.startsWith(new URL(root).pathname),id+" links outside Studio");
        }
        // At desktop width, prove that section navigation responds to the learner's
        // sidebar rather than merely rendering a decorative arrow.
        if(width===1280){
          await page.waitForTimeout(350);
          const section=await page.evaluate(()=>{
            const header=document.querySelector("body > header.ss-common-header");
            const prev=header.querySelector('.ss-nav-section[aria-label="Previous section"]');
            const next=header.querySelector('.ss-nav-section[aria-label="Next section"]');
            const side=document.querySelector(".ss-layout-sidebar");
            const toc=side?.querySelector("#lesson-nav,#ss7-lesson-nav,#tabs,nav.ss8-lab-nav,nav.tabs,nav.nav,nav#nav");
            const buttons=[...toc?.querySelectorAll("button")||[]].filter(e=>!e.hidden&&!e.disabled);
            return {previousDisabled:prev?.disabled,nextDisabled:next?.disabled,sidebarChoices:buttons.length,
              firstSection:buttons[0]?.textContent?.trim().slice(0,70)||null};
          });
          assert.ok(typeof section.previousDisabled==="boolean"&&typeof section.nextDisabled==="boolean",
            id+" section state not initialized");
          if(section.sidebarChoices>=2){
            assert.equal(section.nextDisabled,false,
              id+" next section is disabled despite "+section.sidebarChoices+" available sections: "+JSON.stringify(section));
            // Exercise the real next-section button and confirm sidebar selection changes.
            const outcome=await page.evaluate(()=>{
              const side=document.querySelector(".ss-layout-sidebar");
              const toc=side?.querySelector("#lesson-nav,#ss7-lesson-nav,#tabs,nav.ss8-lab-nav,nav.tabs,nav.nav,nav#nav");
              const getButtons=()=>[...toc?.querySelectorAll("button")||[]].filter(e=>!e.hidden&&!e.disabled);
              const active=buttons=>buttons.findIndex(b=>b.matches('.active,.on,.selected,.current,[aria-current="step"],[aria-current="page"],[aria-current="true"]'));
              const before=active(getButtons());
              document.querySelector('.ss-four-navigation .ss-nav-section[aria-label="Next section"]').click();
              return {before};
            });
            await page.waitForTimeout(200);
            if(outcome.before>=0){
              const after=await page.evaluate(()=>{
                const side=document.querySelector(".ss-layout-sidebar");
                const toc=side?.querySelector("#lesson-nav,#ss7-lesson-nav,#tabs,nav.ss8-lab-nav,nav.tabs,nav.nav,nav#nav");
                const buttons=[...toc?.querySelectorAll("button")||[]].filter(e=>!e.hidden&&!e.disabled);
                return buttons.findIndex(b=>b.matches('.active,.on,.selected,.current,[aria-current="step"],[aria-current="page"],[aria-current="true"]'));
              });
              assert.equal(after,outcome.before+1,
                id+" next-section click did not advance sidebar selection ("+outcome.before+" -> "+after+")");
            }
          }
        }
        results.push({id,status:"PASS",centerError:state.centerError,dimensions:state.dimensions});
        console.log("PASS",id,"centerError="+state.centerError.toFixed(1));
      }catch(error){
        failures.push({id,error:String(error),pageErrors:errors});
        console.error("FAIL",id,String(error));
        // Keep lightweight forensic screenshots for deploy diagnostics.
        await page.screenshot({path:`pages-smoke-${id}.png`,fullPage:false}).catch(()=>{});
      }finally{
        page.off("pageerror",onError);
      }
    }
  }
}finally{
  await context.close();await browser.close();
}
const report={
  schemaVersion:2,createdAt:new Date().toISOString(),root,sourceSha:process.env.GITHUB_SHA||null,
  viewports:widths,activeCChapters:cSlugs,ssChapters:8,
  cases:results.length+failures.length,passed:results.length,failed:failures.length,
  results,failures
};
fs.writeFileSync("pages-smoke-report.json",JSON.stringify(report,null,2)+"\\n");
console.log("PAGES_SMOKE_SUMMARY",JSON.stringify({cases:report.cases,passed:report.passed,failed:report.failed}));
if(failures.length)process.exitCode=1;
