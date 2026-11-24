/* One sidebar header/toggle component for Signals & Systems Chapters 1–8.
 * The chapter-specific experiment controls remain owned by their original scripts.
 */
(function(){
'use strict';
const KEY='ss-sidebar-collapsed-v1';
const MOBILE_QUERY=window.matchMedia('(max-width:600px)');
let mobileOpen=false;
function mobileNav(){return findSidebar()?.querySelector('nav:has(> button)')}
function activeLesson(){const nav=mobileNav();const b=nav?.querySelector('[aria-current="page"],[aria-current="true"],.active,.on')||nav?.querySelector('button');return b?.querySelector('.nav-name,.tabname,.ss7-lab-title,.ss8-lab-label')?.textContent.trim()||b?.textContent.trim()||''}
function syncMobile(){
 const side=findSidebar(),btn=side?.querySelector('.ss-mobile-index-toggle');
 if(!side||!btn)return;
 const enabled=MOBILE_QUERY.matches&&root.dataset.ssSidebar!=='collapsed';
 root.dataset.ssMobileIndex=enabled&&mobileOpen?'open':'closed';
 btn.hidden=!enabled;btn.setAttribute('aria-expanded',String(enabled&&mobileOpen));
 const mode=window.ELSLanguage?.get?.()||'mixed';
 btn.textContent=mobileOpen?(mode==='en'?'Hide list':mode==='ko'?'목차 닫기':'Hide · 닫기'):(mode==='en'?'Show lessons':mode==='ko'?'목차 보기':'Lessons · 목차');
 const current=side.querySelector('.ss-mobile-current-lesson');
 if(current){current.hidden=!enabled||mobileOpen;current.textContent=activeLesson();current.title=current.textContent;}
}
const root=document.documentElement;
function saved(){try{return localStorage.getItem(KEY)==='1'}catch{return false}}
function persist(v){try{localStorage.setItem(KEY,v?'1':'0')}catch{}}
function findSidebar(){
 return document.querySelector('.ss-layout-root > .ss-layout-sidebar');
}
function redraw(){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  window.dispatchEvent(new Event('resize'));
  document.dispatchEvent(new CustomEvent('ss:sidebar-resized',{detail:{collapsed:root.dataset.ssSidebar==='collapsed'}}));
 }));
}
function sync(){
 const collapsed=root.dataset.ssSidebar==='collapsed';
 const side=findSidebar();
 if(side){
  for(const child of side.children){
   if(child.classList.contains('ss-sidebar-topline'))continue;
   if(collapsed)child.style.setProperty('display','none','important');
   else child.style.removeProperty('display');
  }
  if(collapsed)side.scrollTop=0;
  syncMobile();
 }
 // An independent, body-level restore control cannot be hidden or clipped
 // by any chapter's sidebar/lesson CSS while the rail is collapsed.
 const restore=document.getElementById('ss-sidebar-restore');
 if(restore){
  restore.hidden=!collapsed;
  restore.setAttribute('aria-expanded',String(!collapsed));
 }
 document.querySelectorAll('.ss-side-toggle').forEach(button=>{
  const inSide=!!button.closest('.ss-layout-sidebar');
  button.setAttribute('aria-expanded',String(!collapsed));
  button.setAttribute('aria-label',collapsed?'목차 펼치기':'목차 접기');
  button.title=collapsed?'Expand chapter navigation / 목차 펼치기':'Collapse chapter navigation / 목차 접기';
  const icon=button.querySelector('.ss-toggle-icon');
  if(icon)icon.textContent=collapsed?'≫':'≪';
  // Only the body-level restore control is keyboard-accessible when collapsed.
  if(inSide)button.tabIndex=collapsed?-1:0;
 });
}
function makeRestoreControl(){
 let restore=document.getElementById('ss-sidebar-restore');
 if(restore)return restore;
 restore=document.createElement('button');
 restore.id='ss-sidebar-restore';
 restore.type='button';
 restore.className='ss-side-toggle';
 restore.setAttribute('aria-label','목차 펼치기');
 restore.innerHTML='<span class="ss-toggle-icon" aria-hidden="true">≫</span>';
 restore.hidden=true;
 document.body.append(restore);
 return restore;
}
function setup(){
 const side=findSidebar();if(!side)return;
 const brand=side.querySelector(':scope > .brand');
 if(!brand)return;
 let row=side.querySelector(':scope > .ss-sidebar-topline');
 if(!row){
  row=document.createElement('div');
  row.className='ss-sidebar-topline';
  side.prepend(row);
 }
 let button=row.querySelector('.ss-side-toggle');
 if(!button){
  button=document.createElement('button');
  button.type='button';button.className='ss-side-toggle';
  button.innerHTML='<span class="ss-toggle-icon" aria-hidden="true">≪</span>';
  row.prepend(button);
 }
 let mobileButton=row.querySelector('.ss-mobile-index-toggle');
 if(!mobileButton){
  mobileButton=document.createElement('button');mobileButton.type='button';mobileButton.className='ss-mobile-index-toggle';
  mobileButton.setAttribute('aria-controls','ss-mobile-lessons');row.append(mobileButton);
 }
 const nav=mobileNav();if(nav&&!nav.id)nav.id='ss-mobile-lessons';
 else if(nav)mobileButton.setAttribute('aria-controls',nav.id);
 let current=row.querySelector('.ss-mobile-current-lesson');
 if(!current){current=document.createElement('span');current.className='ss-mobile-current-lesson';row.insertBefore(current,mobileButton)}
 const eyebrow=brand.querySelector(':scope > .over,:scope > .eyebrow');
 if(eyebrow && eyebrow.parentElement!==row){
  eyebrow.classList.add('ss-sidebar-chapter-label');
  const m=eyebrow.textContent.match(/CHAPTER\s*0?([1-8])/i);
  if(m)eyebrow.textContent='Signals & Systems · Ch '+String(m[1]).padStart(2,'0');
  row.append(eyebrow);
 }
 sync();
}
document.addEventListener('click',event=>{
 const mobile=event.target.closest?.('.ss-mobile-index-toggle');
 if(mobile){mobileOpen=!mobileOpen;syncMobile();redraw();return;}
 const choice=event.target.closest?.('.ss-layout-sidebar nav>button');
 if(choice&&MOBILE_QUERY.matches&&mobileOpen){mobileOpen=false;requestAnimationFrame(syncMobile);}
 const button=event.target.closest?.('.ss-side-toggle');
 if(!button||(!button.closest('.ss-layout-sidebar') && button.id!=='ss-sidebar-restore'))return;
 const collapsed=root.dataset.ssSidebar!=='collapsed';
 if(collapsed)mobileOpen=false;
 root.dataset.ssSidebar=collapsed?'collapsed':'expanded';
 persist(collapsed);
 sync();
 redraw();
});
root.dataset.ssSidebar=saved()?'collapsed':'expanded';
function init(){
 makeRestoreControl();
 setup();
 const app=document.getElementById('app');
 if(app)new MutationObserver(setup).observe(app,{childList:true});
 const side=findSidebar(),nav=mobileNav();
 if(nav)new MutationObserver(()=>requestAnimationFrame(syncMobile)).observe(nav,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-current']});
 if(side)new MutationObserver(()=>requestAnimationFrame(syncMobile)).observe(side,{childList:true});
 MOBILE_QUERY.addEventListener?.('change',()=>{mobileOpen=false;syncMobile()});
 window.ELSLanguage?.subscribe?.(syncMobile);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('storage',e=>{
 if(e.key===KEY){root.dataset.ssSidebar=saved()?'collapsed':'expanded';sync();redraw()}
});
})();