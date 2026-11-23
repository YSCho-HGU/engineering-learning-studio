(function(W){
"use strict";
const $=id=>document.getElementById(id),TAU=2*Math.PI,FS=8000,COUNT=3680;
const LOW=[697,770,852,941],HIGH=[1209,1336,1477],KEYS=["123","456","789","*0#"];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const tr=(a,b)=>W.ELSLanguage?.get?.()==="en"?a:W.ELSLanguage?.get?.()==="ko"?b:a+"\n"+b;
function tones(key){for(let r=0;r<4;r++)for(let c=0;c<3;c++)if(KEYS[r][c]===key)return{low:LOW[r],high:HIGH[c],key};throw Error("Unsupported key")}
function synth(key){const p=tones(key);return Float64Array.from({length:COUNT},(_,n)=>Math.min(1,n/100,(COUNT-1-n)/100)*(.43*Math.sin(TAU*p.low*n/FS)+.4*Math.sin(TAU*p.high*n/FS)))}
function fft(re,im){
 const N=re.length;if(N&(N-1))throw Error("Invalid FFT length");
 for(let i=1,j=0;i<N;i++){let bit=N>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}
 for(let L=2;L<=N;L*=2)for(let s=0;s<N;s+=L)for(let j=0;j<L/2;j++){
  const q=-TAU*j/L,c=Math.cos(q),si=Math.sin(q),a=s+j,b=a+L/2;
  const vr=c*re[b]-si*im[b],vi=c*im[b]+si*re[b];
  re[b]=re[a]-vr;im[b]=im[a]-vi;re[a]+=vr;im[a]+=vi;
 }
}
function analyze(samples,{N=2048,window="hann",offset=.4}={}){
 N=Number(N);if(![256,512,1024,2048].includes(N)||samples.length<N)throw Error("Invalid N");
 const start=Math.round(clamp(Number(offset),0,1)*(samples.length-N)),re=new Float64Array(N),im=new Float64Array(N);let gain=0;
 for(let n=0;n<N;n++){const w=window==="hann"?.5-.5*Math.cos(TAU*n/(N-1)):window==="rect"?1:null;if(w===null)throw Error("Invalid window");re[n]=samples[start+n]*w;gain+=w}
 fft(re,im);
 const spectrum=Float64Array.from({length:N/2+1},(_,k)=>(k===0||k===N/2?1:2)*Math.hypot(re[k],im[k])/gain),delta=FS/N;
 function peak(lo,hi){
  let k=Math.ceil(lo/delta);
  for(let j=k+1;j<=Math.floor(hi/delta);j++)if(spectrum[j]>spectrum[k])k=j;
  const a=Math.log(Math.max(1e-12,spectrum[k-1])),b=Math.log(Math.max(1e-12,spectrum[k])),c=Math.log(Math.max(1e-12,spectrum[k+1])),d=a-2*b+c;
  return{bin:k,center:k*delta,frequency:(k+(Math.abs(d)>1e-12?clamp((a-c)/(2*d),-.5,.5):0))*delta};
 }
 const low=peak(650,1000),high=peak(1140,1550);
 const row=LOW.reduce((b,v,i)=>Math.abs(v-low.frequency)<Math.abs(LOW[b]-low.frequency)?i:b,0),col=HIGH.reduce((b,v,i)=>Math.abs(v-high.frequency)<Math.abs(HIGH[b]-high.frequency)?i:b,0);
 return{N,start,spectrum,delta,low,high,decoded:KEYS[row][col]};
}
let randomSeed=null,st={secret:[],index:0,guess:null,result:null,tries:0,correct:0,done:false,solved:false},audioContext=null;
const match=(W.location?.search||"").match(/[?&]seed=(\d+)/);if(match)randomSeed=Number(match[1])>>>0;
function randomKey(){let i;if(randomSeed!==null){randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;i=randomSeed%12}else{const a=new Uint32Array(1);W.crypto.getRandomValues(a);i=a[0]%12}return KEYS.join("")[i]}
const current=()=>st.secret[st.index];
function axes(w,h,{xMax,yMin,yMax,xTitle,yTitle}){
 const l=59,t=15,W=w-73,H=h-52,parts=[];
 for(let i=0;i<=4;i++){
  const x=l+i*W/4,y=t+i*H/4;
  parts.push('<line class="ss-dtmf-grid" x1="'+x+'" x2="'+x+'" y1="'+t+'" y2="'+(t+H)+'"/>');
  parts.push('<line class="ss-dtmf-grid" x1="'+l+'" x2="'+(l+W)+'" y1="'+y+'" y2="'+y+'"/>');
  parts.push('<text class="ss-dtmf-tick" x="'+x+'" y="'+(h-16)+'" text-anchor="middle">'+(i*xMax/4).toFixed(xMax>=10?0:2)+'</text>');
  parts.push('<text class="ss-dtmf-tick" x="'+(l-7)+'" y="'+(y+4)+'" text-anchor="end">'+(yMax+(yMin-yMax)*i/4).toFixed(yMax<2?2:1)+'</text>');
 }
 parts.push('<path class="ss-dtmf-axis" d="M'+l+' '+t+'V'+(t+H)+'H'+(l+W)+'"/>');
 parts.push('<text class="ss-dtmf-axis-title" x="'+(l+W/2)+'" y="'+(h-1)+'" text-anchor="middle">'+xTitle+'</text>');
 parts.push('<text class="ss-dtmf-axis-title" transform="rotate(-90 13 '+(t+H/2)+')" x="13" y="'+(t+H/2)+'" text-anchor="middle">'+yTitle+'</text>');
 return{l,t,W,H,html:parts.join("")};
}
function drawWave(){
 if(st.done)return;
 const data=synth(current()),N=Number($("dtmf-fft-n").value),start=Math.round((COUNT-N)*Number($("dtmf-start").value)/100),g=axes(850,200,{xMax:460,yMin:-1,yMax:1,xTitle:"Time (ms)",yTitle:"x[n]"});
 const X=n=>g.l+n/(COUNT-1)*g.W,Y=v=>g.t+(1-v)*g.H/2;
 const path=[];for(let n=0;n<COUNT;n+=2)path.push((n?"L":"M")+X(n).toFixed(2)+" "+Y(data[n]).toFixed(2));
 $("dtmf-wave").innerHTML=g.html+'<rect class="ss-dtmf-region" x="'+X(start)+'" y="'+g.t+'" width="'+(X(start+N)-X(start))+'" height="'+g.H+'"/><path class="ss-dtmf-trace" d="'+path.join(" ")+'"/>';
 $("dtmf-start-value").textContent=(start/8).toFixed(1)+"–"+((start+N)/8).toFixed(1)+" ms";
}
function drawSpectrum(){
 const a=st.result,max=Math.max(...a.spectrum,1e-9),g=axes(850,290,{xMax:2000,yMin:0,yMax:max*1.12,xTitle:"Frequency (Hz)",yTitle:"Amplitude"});
 const path=[];for(let k=0;k<=Math.floor(2000/a.delta);k++){const x=g.l+k*a.delta/2000*g.W,y=g.t+g.H*(1-a.spectrum[k]/(max*1.12));path.push((k?"L":"M")+x.toFixed(2)+" "+y.toFixed(2))}
 let out=g.html+'<path class="ss-dtmf-trace" d="'+path.join(" ")+'"/>';
 for(const [p,name,offset] of [[a.low,"Low",18],[a.high,"High",34]]){
  const x=g.l+p.center/2000*g.W;
  out+='<line class="ss-dtmf-peakmark" x1="'+x+'" x2="'+x+'" y1="'+g.t+'" y2="'+(g.t+g.H)+'"/>';
  out+='<text class="ss-dtmf-peaktext" x="'+Math.min(760,x+5)+'" y="'+(g.t+offset)+'">'+name+' '+p.frequency.toFixed(1)+' Hz</text>';
 }
 $("dtmf-spectrum").innerHTML=out;$("dtmf-spectrum").removeAttribute("hidden");$("dtmf-spectrum-placeholder").hidden=true;
 $("dtmf-peaks").hidden=false;
 $("dtmf-peaks").innerHTML=[["Low group",a.low],["High group",a.high]].map(([n,p])=>'<div class="ss-dtmf-peak"><small>'+n+'</small><strong>'+p.frequency.toFixed(1)+' Hz</strong><small>k='+p.bin+' · bin '+p.center.toFixed(1)+' Hz</small></div>').join("");
 $("dtmf-bin-note").textContent=tr("FFT bin spacing "+a.delta.toFixed(2)+" Hz · sub-bin peak interpolation","FFT Bin 간격 "+a.delta.toFixed(2)+" Hz · 피크 Bin 사이 보간");
}
function drawMap(){
 const holder=$("dtmf-frequency-map");holder.replaceChildren();
 const cells=[["Low / High",true],...HIGH.map(x=>[String(x),true])];
 for(let r=0;r<4;r++){cells.push([String(LOW[r]),true]);for(let c=0;c<3;c++)cells.push([KEYS[r][c],false])}
 for(const [v,head] of cells){const el=document.createElement("div");el.className="ss-dtmf-map-cell"+(head?" ss-dtmf-map-head":"")+(v===st.guess?" ss-dtmf-map-chosen":"");el.textContent=v;holder.append(el)}
}
function keypad(){
 const el=$("dtmf-keypad");el.replaceChildren();
 for(const v of KEYS.join("")){
  const b=document.createElement("button");b.type="button";b.textContent=v;b.dataset.digit=v;b.disabled=st.done||st.solved;b.setAttribute("aria-pressed",String(st.guess===v));
  b.addEventListener("click",()=>{if(st.solved)return;st.guess=v;$("dtmf-current-guess").textContent=v;$("dtmf-check").disabled=!st.result;keypad();drawMap()});el.append(b);
 }
}
function progress(){
 $("dtmf-challenge-index").textContent=Math.min(st.index+1,st.secret.length)+" / "+st.secret.length;
 $("dtmf-progress").textContent=tr("Correct "+st.correct+" / "+st.secret.length+" · Attempts "+st.tries,"정답 "+st.correct+" / "+st.secret.length+" · 시도 "+st.tries);
}
function resetView(){
 st.result=null;st.guess=null;st.solved=false;
 $("dtmf-current-guess").textContent="—";$("dtmf-check").disabled=true;$("dtmf-fft").disabled=false;$("dtmf-play").disabled=false;$("dtmf-next").hidden=true;
 $("dtmf-spectrum").setAttribute("hidden","");$("dtmf-spectrum").replaceChildren();$("dtmf-peaks").hidden=true;$("dtmf-peaks").replaceChildren();$("dtmf-spectrum-placeholder").hidden=false;
 $("dtmf-spectrum-placeholder").textContent=tr("FFT hidden · Listen and run FFT.","FFT 숨김 · 소리를 듣고 FFT를 실행하세요.");
 $("dtmf-bin-note").textContent="";$("dtmf-feedback").textContent="";delete $("dtmf-feedback").dataset.result;
 keypad();drawMap();drawWave();progress();
}
function newMystery(){
 st={secret:Array.from({length:$("dtmf-mode").value==="sequence"?3:1},randomKey),index:0,guess:null,result:null,tries:0,correct:0,done:false};resetView();
}
function check(){
 if(!st.guess||st.done||st.solved||!st.result)return;st.tries++;
 if(st.guess===current()){
  st.correct++;st.solved=true;const p=tones(current());
  $("dtmf-feedback").textContent=tr("Correct! "+p.low+" Hz + "+p.high+" Hz → "+current(),"정답! "+p.low+"Hz + "+p.high+"Hz → "+current());
  $("dtmf-feedback").dataset.result="correct";$("dtmf-check").disabled=true;$("dtmf-next").hidden=false;keypad();
  $("dtmf-next").textContent=st.index+1===st.secret.length?tr("Finish Challenge","도전 결과 확인"):tr("Next Mystery","다음 비밀 숫자");
 }else{
  $("dtmf-feedback").textContent=tr("Try again: compare both FFT peaks with the table.","다시 시도하세요. 두 FFT 피크와 주파수 표를 비교해 보세요.");
  $("dtmf-feedback").dataset.result="wrong";
 }
 progress();
}
function next(){
 if(st.index+1<st.secret.length){st.index++;resetView();return}
 st.done=true;$("dtmf-next").hidden=true;$("dtmf-play").disabled=true;$("dtmf-fft").disabled=true;$("dtmf-check").disabled=true;
 $("dtmf-feedback").textContent=tr("Decoded "+st.correct+" / "+st.secret.length+" keys in "+st.tries+" attempts. Why does one FFT not recover the order of several tones?","비밀 숫자 "+st.correct+" / "+st.secret.length+"개를 "+st.tries+"번에 해독했습니다. 전체 소리 FFT 하나로 순서를 알 수 없는 이유는?");
 keypad();progress();
}
async function play(){
 if(st.done)return;
 try{
  const Audio=W.AudioContext||W.webkitAudioContext;if(!Audio)throw Error("Audio unavailable");
  if(!audioContext)audioContext=new Audio();if(audioContext.state==="suspended")await audioContext.resume();
  const samples=synth(current()),buf=audioContext.createBuffer(1,samples.length,FS);
  buf.getChannelData(0).set(Float32Array.from(samples));
  const src=audioContext.createBufferSource();src.buffer=buf;src.connect(audioContext.destination);src.start();
  $("dtmf-audio-status").textContent=tr("Playing mystery tone…","비밀 소리 재생 중…");
  src.onended=()=>{$("dtmf-audio-status").textContent=tr("Ready for FFT.","FFT 분석 준비 완료.")};
 }catch(e){$("dtmf-audio-status").textContent=String(e.message)}
}
function localize(){
 const labels={
 "dtmf-title":["DTMF Mystery Decoder · Find the Hidden Number","DTMF 비밀 숫자 해독 · 소리 속 숫자 찾기"],
 "dtmf-intro":["Listen to a hidden telephone key, use FFT to reveal two frequencies, then decode the number. The secret remains hidden until you guess correctly.","전화기 버튼의 비밀 소리를 듣고 FFT로 두 주파수를 찾은 뒤 숫자를 해독하세요. 정답을 맞힐 때까지 비밀 번호는 공개되지 않습니다."],
 "dtmf-step1":["1 · Listen & Predict","1 · 듣고 예측"],"dtmf-step2":["2 · Observe FFT","2 · FFT 관찰"],"dtmf-step3":["3 · Decode","3 · 숫자 해독"],"dtmf-step4":["4 · Explain","4 · 원리 설명"],
 "dtmf-mystery-title":["1 · Mystery Sound","1 · 비밀 소리"],"dtmf-mystery-help":["Listen first. Can you guess the keypad digit without an FFT?","FFT 없이 소리를 먼저 들어 보세요. 어느 전화기 숫자일까요?"],
 "dtmf-mode-label":["Challenge","도전 유형"],"dtmf-challenge-label":["Mystery key","비밀 숫자"],
 "dtmf-play":["▶ Play Mystery Sound","▶ 비밀 소리 듣기"],"dtmf-new":["New Mystery","새 문제"],
 "dtmf-n-label":["FFT size N","FFT 길이 N"],"dtmf-window-label":["Analysis Window","분석 Window"],"dtmf-start-label":["Observation position","관측 구간 위치"],"dtmf-fft":["Run FFT · Reveal Spectrum","FFT 실행 · 스펙트럼 보기"],
 "dtmf-sampling-note":["Sampling frequency fs = 8,000 Hz. Compare Δf = fs/N by changing N.","샘플링 주파수 fs = 8,000Hz. N을 바꿔 Δf = fs/N을 비교하세요."],
 "dtmf-wave-title":["Time waveform · What is hidden?","시간 파형 · 무엇이 숨어 있나요?"],"dtmf-wave-help":["The shaded samples are used for FFT.","음영으로 표시된 표본 구간만 FFT에 사용됩니다."],
 "dtmf-spectrum-title":["2 · FFT Spectrum","2 · FFT 스펙트럼"],"dtmf-spectrum-help":["Find one low-frequency peak and one high-frequency peak.","저주파 피크 하나와 고주파 피크 하나를 찾아보세요."],
 "dtmf-decode-title":["3 · Decode the Key","3 · 숫자 해독"],"dtmf-decode-help":["Match the low-frequency row and high-frequency column to find the keypad digit.","저주파의 행과 고주파의 열을 교차하여 숫자를 알아내세요."],
 "dtmf-guess-label":["Your answer","나의 답"],"dtmf-check":["Check Answer","정답 확인"],
 "dtmf-explain-title":["4 · Why Did FFT Work?","4 · FFT가 답을 찾은 이유"],
 "dtmf-explain":["DTMF combines two sinusoids. The time waveform mixes them; FFT separates the two frequencies. Increasing N reduces bin spacing fs/N. A sequence of keys must be divided into segments before decoding its order.","DTMF는 두 정현파의 합입니다. 시간 파형에는 두 성분이 섞여 있지만 FFT는 각 주파수를 보여줍니다. N을 늘리면 Bin 간격 fs/N이 작아집니다. 여러 숫자의 순서를 알려면 신호를 구간별로 나누어 분석해야 합니다."],
 "dtmf-challenge-conclusion":["Reflection · What did FFT reveal that the waveform did not?","성찰 · 시간 파형에 비해 FFT에서 어떤 정보를 발견했나요?"],
 "dtmf-prior":["← Frequency Resolution Lab","← 주파수 분해능 실습"],"dtmf-catalog":["Part C · All Topics","Part C · 전체 목록"]
 };
 for(const [id,[en,ko]] of Object.entries(labels))$(id).textContent=tr(en,ko);
 [...$("dtmf-mode").options].forEach((o,i)=>o.textContent=i===0?tr("One hidden key","비밀 숫자 1개"):tr("Three hidden keys","비밀 숫자 3개"));
 document.documentElement.lang=W.ELSLanguage?.get?.()==="ko"?"ko":"en";
 if(st.secret.length)progress();
}
function init(){
 W.ELSLanguage?.bindSelect?.("#dtmf-language");
 $("dtmf-mode").addEventListener("change",newMystery);$("dtmf-new").addEventListener("click",newMystery);$("dtmf-play").addEventListener("click",play);
 $("dtmf-fft").addEventListener("click",()=>{st.result=analyze(synth(current()),{N:Number($("dtmf-fft-n").value),window:$("dtmf-window").value,offset:Number($("dtmf-start").value)/100});drawSpectrum();$("dtmf-check").disabled=!st.guess});
 for(const id of ["dtmf-fft-n","dtmf-window","dtmf-start"])$(id).addEventListener("input",()=>{drawWave();st.result=null;$("dtmf-check").disabled=true;$("dtmf-spectrum").setAttribute("hidden","");$("dtmf-peaks").hidden=true;$("dtmf-spectrum-placeholder").hidden=false});
 $("dtmf-check").addEventListener("click",check);$("dtmf-next").addEventListener("click",next);
 W.ELSLanguage?.subscribe?.(localize);newMystery();localize();W.SSMathCore?.renderNow?.();
}
W.SSDTMF=Object.freeze({tones,synth,fft,analyze,get state(){return{index:st.index,length:st.secret.length,correct:st.correct,attempts:st.tries,done:st.done}},get result(){return st.result}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);