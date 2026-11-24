/* Shared chapter header controller; preserve each page's existing language/theme selectors. */
(function(){
'use strict';
const CHAPTERS=["Signals & Systems","LTI Systems","Fourier Series","CTFT","Laplace Transform","DTFT","Sampling","Z-Transform"];
function buildLinks(nav){
 if(nav.dataset.ssLinksBuilt)return;
 const fragment=document.createDocumentFragment();
 const overview=document.createElement('a');
 overview.href='./index.html#overview';overview.dataset.ssView='overview';
 overview.textContent='Overview · Course Home';fragment.appendChild(overview);
 const map=document.createElement('a');
 map.href='./index.html#map';map.dataset.ssView='map';
 map.textContent='Learning Map · Transform Connections';fragment.appendChild(map);
 CHAPTERS.forEach((name,i)=>{
  const number=i+1;
  const link=document.createElement('a');
  link.href='./chapter'+number+'.html';
  link.dataset.ssChapter=String(number);
  link.textContent='Chapter '+number+' · '+name;
  fragment.appendChild(link);
 });
 const applications=document.createElement('a');
 applications.href='./applications.html';applications.dataset.ssView='applications';
 applications.textContent='Applications · Signals / Systems / FFT / Integration';
 fragment.appendChild(applications);
 nav.replaceChildren(fragment);
 nav.dataset.ssLinksBuilt='true';
}
function normalizeTitleLabel(title){
 if(!title||title.querySelector('.ss-common-chapter-label'))return;
 const texts=Array.from(title.childNodes).filter(n=>n.nodeType===3&&n.textContent.trim());
 if(!texts.length)return;
 const label=document.createElement('span');
 label.className='ss-common-chapter-label';
 label.textContent=texts.map(n=>n.textContent.trim()).join(' ');
 title.insertBefore(label,texts[0]);
 texts.forEach(n=>n.remove());
}
function init(){
 const header=document.querySelector('.ss-common-header');
 if(!header)return;
 const menu=header.querySelector('.ss-common-menu');
 const title=header.querySelector('.ss-common-title');
 normalizeTitleLabel(title);
 const links=header.querySelector('.ss-common-links');
 if(!menu||!title||!links)return;
 buildLinks(links);
 // Four controls: previous chapter, previous section, next section, next chapter.
 const chapterMatch=location.pathname.match(/chapter([1-8])\.html$/);
 const chapterNumber=chapterMatch?Number(chapterMatch[1]):0;
 if(chapterNumber){
  const existing=header.querySelector('.ss-chapter-arrows');
  // Reuse semantic HTML navigation: never remove working arrows during hydration.
  const arrows=existing||document.createElement('nav');
  const preservedArrows=existing?Array.from(existing.children):[];
  let arrowIndex=0;
  arrows.className='ss-chapter-arrows ss-four-navigation';
  arrows.setAttribute('aria-label','Chapter and section navigation');
  const make=(kind,direction,glyph,label)=>{
   const factory=window.ELSHeaderControls?.makeNavigationArrow;
   // A missing shared adapter must never remove the chapter navigation.
   // This SVG-only fallback is used solely when a late or failed asset load occurs.
   const preserved=preservedArrows[arrowIndex++];
   const el=preserved || (typeof factory==="function"
     ?factory({kind,direction,label})
     :(()=>{
       const item=document.createElement(kind==="chapter"?"a":"button");
       item.className="els-header-arrow ss-chapter-arrow ss-nav-"+kind;
       item.setAttribute("aria-label",label);item.title=label;
       if(kind==="section")item.type="button";
       const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
       svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");
       const stroke=document.createElementNS("http://www.w3.org/2000/svg","path");
       stroke.setAttribute("d",direction<0?"M15 5l-7 7 7 7":"M9 5l7 7-7 7");svg.append(stroke);
       if(kind==="chapter"){
         const bar=document.createElementNS("http://www.w3.org/2000/svg","path");
         bar.setAttribute("d",direction<0?"M5 5v14":"M19 5v14");svg.append(bar);
       }
       item.append(svg);return item;
     })());
   if(kind==='section')el.dataset.ssSectionDirection=String(direction);
   else{
    const target=chapterNumber+direction;
    if(target===9&&direction===1)el.href='./applications.html';
    else if(target<1||target>8){el.setAttribute('aria-disabled','true');el.removeAttribute('href');}
    else el.href='./chapter'+target+'.html';
   }
   arrows.append(el);return el;
  };
  make('chapter',-1,'⇤','Previous chapter');
  const prevSection=make('section',-1,'←','Previous section');
  const nextSection=make('section',1,'→','Next section');
  make('chapter',1,'⇥','Next chapter');
  const actions=header.querySelector('.ss-common-actions');
  if(actions)header.insertBefore(arrows,actions);else header.append(arrows);

  // Each chapter owns its section buttons, but the public sidebar contract is shared.
  // Never count hidden or disabled navigation buttons as sections.
  const findNav=()=>{
   const side=document.querySelector('.ss-layout-sidebar');
   if(!side)return null;
   return side.querySelector('#ss7-lesson-nav,#tabs,nav.ss8-lab-nav,nav.tabs,nav.nav,nav#nav,nav[aria-label*="xperiment"]');
  };
  const sections=()=>{
   const nav=findNav();
   if(!nav)return [];
   return Array.from(nav.querySelectorAll('button')).filter(b=>
    !b.disabled && !b.hidden && b.getAttribute('aria-hidden')!=='true' &&
    !!b.getClientRects().length && !b.closest('[hidden],[aria-hidden="true"]'));
  };
  const currentIndex=items=>{
   let i=items.findIndex(b=>b.matches('.active,.on,.selected,[aria-current="page"],[aria-current="true"],[aria-pressed="true"]'));
   return i>=0?i:(items.length?0:-1);
  };
  const refresh=()=>{
   const items=sections(),i=currentIndex(items);
   prevSection.disabled=i<=0;
   nextSection.disabled=i<0||i>=items.length-1;
   prevSection.setAttribute('aria-disabled',String(prevSection.disabled));
   nextSection.setAttribute('aria-disabled',String(nextSection.disabled));
   prevSection.title=prevSection.disabled?'First section — no previous section':'Previous section';
   nextSection.title=nextSection.disabled?'Last section — no next section':'Next section';
  };
  arrows.addEventListener('click',event=>{
   const button=event.target.closest('[data-ss-section-direction]');
   if(!button||button.disabled)return;
   const items=sections(),index=currentIndex(items);
   const target=items[index+Number(button.dataset.ssSectionDirection)];
   if(!target)return;
   target.click();
   requestAnimationFrame(refresh);
   setTimeout(refresh,0);
  });
  let observed=null,observer=null;
  const observe=()=>{
   const nav=findNav();
   if(!nav){refresh();return;}
   if(observed===nav)return;
   if(observer)observer.disconnect();
   observed=nav;
   observer=new MutationObserver(()=>requestAnimationFrame(refresh));
   observer.observe(nav,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current','aria-pressed','disabled','hidden','style']});
   nav.addEventListener('click',()=>requestAnimationFrame(refresh));
   refresh();
  };
  observe();
  const container=document.querySelector('.ss-layout-root')||document.body;
  new MutationObserver(observe).observe(container,{childList:true,subtree:false});
  window.addEventListener('ss:sidebar-resized',refresh);
  window.addEventListener('pageshow',()=>{observe();refresh();});
  refresh();
 }
 // Synchronize all chapter language pickers using the shared language preference.
 const languageLabel=header.querySelector('.ss-common-language');
 if(languageLabel){
  const text=languageLabel.querySelector('span');
  if(text){text.textContent='🌐';text.setAttribute('aria-hidden','true');text.className='ss-language-icon';}
 }
 const languagePicker=header.querySelector('.ss-common-language-select');
 if(languagePicker){
  for(const option of languagePicker.options){
   if(option.value==='mixed')option.textContent='한/영';
   if(option.value==='en')option.textContent='English';
   if(option.value==='ko')option.textContent='한국어';
  }
  languagePicker.setAttribute('aria-label','언어 선택 / Select language');
  if(window.ELSLanguage?.bindSelect)window.ELSLanguage.bindSelect(languagePicker);
  else{
   const KEY='els-language';
   try{languagePicker.value=localStorage.getItem(KEY)||'mixed';}catch(e){}
   languagePicker.addEventListener('change',()=>{
    try{localStorage.setItem(KEY,languagePicker.value)}catch(e){}
    document.documentElement.dataset.language=languagePicker.value;
   });
  }
 }
 const path=location.pathname;
 function sync(){
  const ch=Number((path.match(/chapter([1-8])\.html$/)||[])[1])||Number((location.hash.match(/^#chapter=(\d+)/)||[])[1])||0;
  const onOverview=/index\.html$|\/$/.test(path);
  const view=/applications(?:-[a-z0-9-]+)?\.html$/.test(path)?'applications':onOverview?(location.hash==='#map'?'map':'overview'):null;
  for(const link of links.querySelectorAll('a')){
   const n=Number(link.dataset.ssChapter||0);
   const active=link.dataset.ssView?link.dataset.ssView===view:!!ch&&n===ch;
   if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  }
 }
 sync();
 window.addEventListener('hashchange',()=>{sync();menu.open=false});
 document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;title.focus()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
