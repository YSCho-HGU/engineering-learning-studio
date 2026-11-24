#!/usr/bin/env node
/* Pre-deploy check of the exact static-site files, not the old Pages deployment.
 * All assets except localhost are blocked so this verifies our own layout code.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import {chromium} from "playwright";
const root=(process.env.HEADER_BASE_URL||"http://127.0.0.1:8765/").replace(/\/?$/,"/");
const pages=[
  {name:"c-pointers",route:"c-programming/pointer/"},
  {name:"ss-applications",route:"signals-systems/applications.html"}
];
const widths=[1280,768,390];
const reports=[];
fs.mkdirSync("qa/header-preflight",{recursive:true});
const browser=await chromium.launch({headless:true});
try {
  for(const width of widths){
    for(const target of pages){
      const context=await browser.newContext({viewport:{width,height:880},deviceScaleFactor:1});
      const page=await context.newPage();
      await page.route("**/*",route=>{
        const url=new URL(route.request().url());
        if(url.hostname==="127.0.0.1"||url.hostname==="localhost")return route.continue();
        return route.abort();
      });
      const id=target.name+"-"+width;
      try{
        const response=await page.goto(root+target.route,{waitUntil:"domcontentloaded",timeout:25000});
        assert.equal(response?.status(),200,id+" entrypoint not served");
        await page.waitForFunction(()=>{
          const header=document.querySelector("body > header.ss-common-header.els-course-header");
          return header?.querySelectorAll(":scope > nav.ss-four-navigation > .ss-chapter-arrow svg").length===4;
        },null,{timeout:12000});
        const d=await page.evaluate(()=>{
          const header=document.querySelector("body > header.ss-common-header.els-course-header");
          const left=header.querySelector(":scope > .els-header-left");
          const menu=left.querySelector(".ss-common-menu");
          const nav=header.querySelector(":scope > nav.ss-four-navigation");
          const actions=header.querySelector(":scope > .ss-common-actions");
          const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
          const a=rect(actions),m=rect(menu),n=rect(nav);
          const overlap=(x,y)=>Math.max(0,Math.min(x.right,y.right)-Math.max(x.left,y.left))*
              Math.max(0,Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top));
          return {
            layout:getComputedStyle(header).display,
            menu:m,nav:n,actions:a,
            arrowCount:nav.querySelectorAll(".ss-chapter-arrow").length,
            visible:[...nav.children].every(el=>{const r=el.getBoundingClientRect();return r.width>=29&&r.height>=29&&getComputedStyle(el).visibility!=="hidden"}),
            overlaps:{menuNav:overlap(m,n),navActions:overlap(n,a)},
            selectors:actions.querySelectorAll("select").length,
            noHorizontalOverflow:n.right<=innerWidth+2&&a.right<=innerWidth+2
          };
        });
        assert.equal(d.layout,"grid",id+" header must use canonical grid");
        assert.equal(d.arrowCount,4,id+" four controls");
        assert.ok(d.visible&&d.selectors===2,id+" controls missing "+JSON.stringify(d));
        assert.equal(d.overlaps.menuNav,0,id+" chooser/arrows overlapping "+JSON.stringify(d));
        assert.equal(d.overlaps.navActions,0,id+" arrows/preferences overlapping "+JSON.stringify(d));
        assert.ok(d.noHorizontalOverflow,id+" viewport overflow "+JSON.stringify(d));
        if(width===1280){
          const gap=d.nav.left-d.menu.right;
          assert.ok(gap>=0&&gap<=25,id+" arrows must directly follow chooser; gap="+gap);
          assert.ok(d.menu.width<=390,id+" chooser unexpectedly wide "+JSON.stringify(d));
          assert.ok(d.menu.width>=180,id+" chooser unexpectedly collapsed "+JSON.stringify(d));
          assert.ok(Math.abs(d.nav.top-d.menu.top)<=12,id+" controls not on same row");
          assert.ok(d.actions.left>=d.nav.right+3,id+" right-side controls collision");
        }
        reports.push({id,status:"PASS",metrics:d});
        console.log("PASS",id,"chooser width",Math.round(d.menu.width),"gap",Math.round(d.nav.left-d.menu.right));
      }catch(e){
        reports.push({id,status:"FAIL",reason:String(e)});
        console.error("FAIL",id,String(e));
      }finally{
        await page.screenshot({path:"qa/header-preflight/"+id+".png"}).catch(()=>{});
        await context.close();
      }
    }
  }
}finally{await browser.close();}
fs.writeFileSync("qa/header-preflight/report.json",JSON.stringify({sourceSha:process.env.GITHUB_SHA||null,reports},null,2)+"\n");
assert.ok(reports.every(x=>x.status==="PASS"),"Course header pre-deployment regression failed");
