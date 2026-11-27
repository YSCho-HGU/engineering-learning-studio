/* FFT Sound Fingerprint: modelled instrument-like/voice-like sources and optional real recordings.
 * Modelled sounds are explicitly NOT recordings of instruments or human speech.
 * A common 16 kHz sample grid and window make comparisons meaningful.
 */
(function(W){
"use strict";
const $=id=>document.getElementById(id),FS=16000,COUNT=14400,TAU=2*Math.PI;
const TYPES=["piano","guitar","voice"],LETTERS=["A","B","C"];
const profiles={
 piano:{amps:[1,.54,.27,.19,.12,.08,.06,.045,.035,.025],phase:.12},
 guitar:{amps:[1,.66,.50,.38,.26,.17,.10,.075,.045,.03],phase:.32},
 voice:{amps:[.40,.14,.23,.80,1,.50,.36,.77,.49,.14],phase:.05}
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),fmt=(n,d=1)=>Number(n).toFixed(d);
const mode=()=>W.ELSLanguage?.get?.()||"mixed",tr=(en,ko)=>mode()==="en"?en:mode()==="ko"?ko:en+"\n"+ko;
let order=["guitar","voice","piano"],selected=0,revealed=false,recordings={},audio=null,analyzed=null,attempts=0,studentPrediction=null,evidenceVerified=false;
const reverse=()=>order[selected],name=type=>tr(type==="piano"?"Piano-like":type==="guitar"?"Guitar-like":"Voice-like",type==="piano"?"피아노 유사":type==="guitar"?"기타 유사":"목소리 유사");
function synth(type,{f0=220}={}){
 if(!profiles[type])throw Error("Unsupported model");
 const profile=profiles[type],signal=new Float64Array(COUNT);
 let norm=profile.amps.reduce((s,a)=>s+Math.abs(a),0);
 for(let n=0;n<COUNT;n++){
  const t=n/FS,release=Math.min(1,(COUNT-n)/900),fade=Math.min(1,n/100);
  const envelope=type==="piano"?Math.exp(-t*2.3):
    type==="guitar"?Math.exp(-t*4.8):.82+.10*Math.sin(TAU*5*t);
  let sum=0;
  for(let h=1;h<=profile.amps.length;h++){
   const decay=type==="piano"?Math.exp(-t*.18*h):type==="guitar"?Math.exp(-t*.42*h):1;
   const vibrato=type==="voice"?0.55*Math.sin(TAU*5.2*t):0;
   // The same f0 drives all partials. Vibrato is phase-integrated to avoid discontinuities.
   const phase=h*(TAU*f0*t-(type==="voice"?2*Math.PI*.55/(TAU*5.2)*(Math.cos(TAU*5.2*t)-1):0))+profile.phase*h;
   sum+=profile.amps[h-1]*decay*Math.sin(phase+vibrato*.001);
  }
  signal[n]=.92*fade*release*envelope*sum/norm;
 }
 return signal;
}
function fft(re,im){
 const N=re.length;if(N<2||(N&(N-1)))throw Error("FFT requires a power of two");
 for(let i=1,j=0;i<N;i++){let bit=N>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}
 for(let L=2;L<=N;L*=2)for(let s=0;s<N;s+=L)for(let j=0;j<L/2;j++){
  const angle=-TAU*j/L,c=Math.cos(angle),si=Math.sin(angle),a=s+j,b=a+L/2;
  const vr=c*re[b]-si*im[b],vi=c*im[b]+si*re[b];
  re[b]=re[a]-vr;im[b]=im[a]-vi;re[a]+=vr;im[a]+=vi;
 }
}
function analyze(samples,{N=4096,position=.2,window="hann",f0=220}={}){
 N=Number(N);if(![2048,4096,8192].includes(N)||samples.length<N)throw Error("Insufficient samples");
 const offset=Math.round(clamp(Number(position),0,1)*(samples.length-N)),re=new Float64Array(N),im=new Float64Array(N);
 let gain=0,mean=0;for(let n=0;n<N;n++)mean+=samples[offset+n];mean/=N;
 for(let n=0;n<N;n++){const w=window==="hann"?.5-.5*Math.cos(TAU*n/(N-1)):window==="rect"?1:null;if(w===null)throw Error("Unknown window");re[n]=(samples[offset+n]-mean)*w;gain+=w}
 fft(re,im);
 const magnitude=Float64Array.from({length:N/2+1},(_,k)=>(k===0||k===N/2?1:2)*Math.hypot(re[k],im[k])/gain);
 const binHz=FS/N;
 const partials=Array.from({length:10},(_,i)=>{
  const h=i+1,center=h*f0,k=Math.round(center/binHz);
  let best=k;const radius=Math.max(1,Math.ceil(Math.min(16,f0*.05)/binHz));
  for(let j=Math.max(1,k-radius);j<=Math.min(magnitude.length-2,k+radius);j++)if(magnitude[j]>magnitude[best])best=j;
  return{h,expected:center,frequency:best*binHz,amplitude:magnitude[best],bin:best};
 });
 const total=partials.reduce((s,p)=>s+p.amplitude,0)||1;
 const normalized=partials.map(p=>({...p,share:p.amplitude/total*100}));
 const dominant=partials.reduce((a,b)=>a.amplitude>=b.amplitude?a:b);
 return{N,offset,binHz,magnitude,partials:normalized,dominant,f0,fs:FS};
}
function realSample(type){
 return recordings[type]?.samples||synth(type,{f0:Number($("finger-note").value)});
}
function currentAnalysis(type){
 return analyze(realSample(type),{N:Number($("finger-fft-length").value),position:Number($("finger-position").value)/100,
   window:$("finger-window").value,f0:Number($("finger-note").value)});
}
function graphicBase(w,h,{xMax,yMax,xLabel,yLabel,yMin=0}){
 const l=54,t=13,W=w-69,H=h-47,marks=[];
 for(let i=0;i<=4;i++){
  const x=l+i*W/4,y=t+i*H/4;
  marks.push('<line class="ss-finger-grid" x1="'+x+'" y1="'+t+'" x2="'+x+'" y2="'+(t+H)+'"/>');
  marks.push('<line class="ss-finger-grid" x1="'+l+'" y1="'+y+'" x2="'+(l+W)+'" y2="'+y+'"/>');
  marks.push('<text class="ss-finger-tick" x="'+x+'" y="'+(h-16)+'" text-anchor="middle">'+fmt(xMax*i/4,xMax>20?0:2)+'</text>');
  marks.push('<text class="ss-finger-tick" x="'+(l-6)+'" y="'+(y+4)+'" text-anchor="end">'+fmt(yMax+(yMin-yMax)*i/4,Math.abs(yMax)>10?0:1)+'</text>');
 }
 marks.push('<path class="ss-finger-axis" d="M'+l+' '+t+' V'+(t+H)+' H'+(l+W)+'"/>');
 marks.push('<text class="ss-finger-axislabel" x="'+(l+W/2)+'" y="'+(h-1)+'" text-anchor="middle">'+xLabel+'</text>');
 marks.push('<text class="ss-finger-axislabel" x="12" y="'+(t+H/2)+'" text-anchor="middle" transform="rotate(-90 12 '+(t+H/2)+')">'+yLabel+'</text>');
 return{l,t,W,H,html:marks.join("")};
}
function waveform(){
 const x=realSample(reverse()),a=analyzed,svg=$("finger-wave"),g=graphicBase(780,200,{xMax:x.length/FS,yMax:.7,yMin:-.7,xLabel:"Time (s)",yLabel:"x[n]"});
 const stride=Math.max(1,Math.ceil(x.length/1500)),path=[];
 for(let n=0;n<x.length;n+=stride){
  path.push((n?"L":"M")+fmt(g.l+n/(x.length-1)*g.W,2)+" "+fmt(g.t+g.H*(.7-x[n])/1.4,2));
 }
 const start=g.l+a.offset/x.length*g.W,end=g.l+(a.offset+a.N)/x.length*g.W;
 svg.innerHTML=g.html+'<rect x="'+fmt(start,2)+'" y="'+g.t+'" width="'+fmt(end-start,2)+'" height="'+g.H+'" fill="var(--els-link)" opacity=".14"/><path class="ss-finger-wave" d="'+path.join(" ")+'"/>';
}
function spectrum(){
 const a=analyzed,g=graphicBase(780,235,{xMax:2400,yMax:1,yMin:0,xLabel:"Frequency (Hz)",yLabel:"Relative amplitude"}),max=Math.max(...a.magnitude.slice(1,Math.floor(2400/a.binHz)+1),1e-9),path=[];
 for(let k=0;k<=Math.floor(2400/a.binHz);k++){
  path.push((k?"L":"M")+fmt(g.l+k*a.binHz/2400*g.W,2)+" "+fmt(g.t+g.H*(1-a.magnitude[k]/max),2));
 }
 let out=g.html+'<path class="ss-finger-wave" d="'+path.join(" ")+'"/>';
 for(let i=1;i<=10;i++){
  const x=g.l+i*a.f0/2400*g.W;
  if(x>g.l+g.W)break;
  out+='<line class="ss-finger-harmonic" x1="'+fmt(x,2)+'" x2="'+fmt(x,2)+'" y1="'+g.t+'" y2="'+(g.t+g.H)+'"/>';
 }
 $("finger-spectrum").innerHTML=out;
}
function render(){
 analyzed=currentAnalysis(reverse());waveform();spectrum();
 const a=analyzed,type=reverse(),start=a.offset/FS;
 $("finger-position-value").textContent=fmt(start*1000,1)+"–"+fmt((start+a.N/FS)*1000,1)+" ms";
 const cells=[[recordings[type]?tr("Assumed f₀ (not estimated)","가정한 f₀ (자동 추정 아님)"):tr("Reference f₀","기준 f₀"),a.f0+" Hz"],[tr("FFT bin spacing","FFT Bin 간격"),fmt(a.binHz,2)+" Hz"],
 [tr("Strongest partial","최대 고조파"),"h = "+a.dominant.h]];
 $("finger-data").innerHTML=cells.map(([label,value])=>'<div>'+label+'<strong>'+value+'</strong></div>').join("");
 for(let i=0;i<3;i++)$("finger-play-"+LETTERS[i].toLowerCase()).setAttribute("aria-pressed",String(selected===i));
 if(revealed)renderCompare();
}
function smallBars(type){
 const a=currentAnalysis(type),max=Math.max(...a.partials.map(x=>x.amplitude),1e-12);
 const g=graphicBase(390,175,{xMax:10,yMax:50,yMin:0,xLabel:"Harmonic order h",yLabel:"Share (%)"});
 const W=g.W/11;
 let out=g.html;
 for(const p of a.partials){
  const x=g.l+p.h/11*g.W-W*.3,h=g.H*Math.min(50,p.share)/50;
  out+='<rect class="ss-finger-bar" x="'+fmt(x,2)+'" y="'+fmt(g.t+g.H-h,2)+'" width="'+fmt(W*.6,2)+'" height="'+fmt(h,2)+'"/>';
 }
 return'<svg viewBox="0 0 390 175" role="img" aria-label="Harmonic amplitude fingerprint">'+out+'</svg>';
}
function renderCompare(){
 const target=$("finger-compare");target.innerHTML=order.map((type,i)=>
  '<div><h3>'+LETTERS[i]+' · '+name(type)+'</h3><p>'+tr(recordings[type]?"Uploaded recording":"Illustrative synthesized model",
   recordings[type]?"업로드된 실제 녹음":"학습용 합성 모델")+'</p>'+smallBars(type)+'</div>').join("");
 const results=order.map(type=>currentAnalysis(type));
 const headings=[tr("Harmonic","고조파"),...order.map((type,i)=>LETTERS[i]+" · "+name(type))];
 let html='<table><thead><tr>'+headings.map(x=>'<th>'+x+'</th>').join("")+'</tr></thead><tbody>';
 for(let h=1;h<=10;h++)html+='<tr><td>'+h+'f₀</td>'+results.map(a=>'<td>'+fmt(a.partials[h-1].share,1)+'%</td>').join("")+'</tr>';
 html+='</tbody></table>';
 $("finger-harmonic-table").innerHTML=html;
 $("finger-compare-note").textContent=tr(
  "Each column is normalized to the sum of ten harmonic magnitudes, not absolute loudness. Harmonic balance helps explain timbre, but attack, decay, formants and recording conditions matter too. For uploaded files, all three clips should contain the same sustained pitch; the reference f₀ is NOT automatically estimated.",
  "각 열은 절대 음량이 아니라 첫 10개 고조파 크기 합에 대한 비율입니다. 고조파 분포는 음색의 한 요인이지만 어택·감쇠·포먼트·녹음 조건도 중요합니다. 실제 파일 비교에서는 같은 음높이의 지속 구간을 사용하세요. 기준 f₀는 자동 추정이 아니라 사용자가 설정한 값입니다.");
}
async function play(type){
 try{
  const Constructor=W.AudioContext||W.webkitAudioContext;if(!Constructor)throw Error("Web Audio unavailable");
  if(!audio)audio=new Constructor();
  if(audio.state==="suspended")await audio.resume();
  const clip=realSample(type),source=audio.createBufferSource(),buffer=audio.createBuffer(1,clip.length,FS);
  buffer.getChannelData(0).set(Float32Array.from(clip));
  source.buffer=buffer;source.connect(audio.destination);source.start();
 }catch(e){$("finger-guess-feedback").textContent=tr("Audio playback: ","오디오 재생: ")+String(e.message)}
}
function evaluateGuess(){
 const val=$("finger-guess").value;
 if(!val){$("finger-guess-feedback").textContent=tr("Choose an instrument/voice hypothesis first.","먼저 악기 또는 목소리 후보를 선택하세요.");return}
 attempts++;studentPrediction={type:val,source:reverse(),letter:LETTERS[selected]};evidenceVerified=false;
 $("finger-reveal-btn").disabled=true;$("finger-evidence-choice").value="";
 $("finger-evidence-feedback").textContent="";
 $("finger-guess-feedback").textContent=tr("Prediction saved. Inspect its strongest FFT harmonic and verify the evidence before revealing.","예측이 저장됐습니다. FFT의 가장 강한 고조파를 찾고 근거를 검증한 뒤 정체를 공개하세요.");
}
function checkEvidence(){
 const output=$("finger-evidence-feedback");
 if(!studentPrediction){
  output.dataset.result="retry";output.textContent=tr("Save an A/B/C prediction first.","먼저 A/B/C에 대한 예측을 저장하세요.");return;
 }
 if(reverse()!==studentPrediction.source){
  output.dataset.result="retry";output.textContent=tr("Return to your predicted sound "+studentPrediction.letter+" to inspect its FFT.","예측한 "+studentPrediction.letter+" 소리로 돌아가 FFT를 확인하세요.");return;
 }
 const chosen=$("finger-evidence-choice").value;
 if(!chosen){
  output.dataset.result="retry";output.textContent=tr("Select a harmonic range from the observed FFT.","관찰한 FFT에서 고조파 범위를 선택하세요.");return;
 }
 const h=currentAnalysis(studentPrediction.source).dominant.h;
 const expected=h===1?"h1":h<=3?"h23":"h4";
 evidenceVerified=chosen===expected;
 output.dataset.result=evidenceVerified?"correct":"retry";
 output.textContent=evidenceVerified?tr("Supported by the FFT: the dominant harmonic has order h="+h+". Now reveal and compare all three sources.",
  "FFT 근거 확인: 가장 큰 고조파는 h="+h+"입니다. 이제 정체를 공개하고 세 소리를 비교하세요."):
  tr("Reinspect the tallest FFT harmonic; its order h is shown in the readout. Revise your observation.",
  "FFT에서 가장 높은 고조파 피크를 다시 살펴보세요. h 값은 측정 정보에도 표시됩니다. 선택을 수정하세요.");
 $("finger-reveal-btn").disabled=!evidenceVerified;
}
function reveal(){
 if(!studentPrediction||!evidenceVerified)return;
 revealed=true;$("finger-reveal-content").hidden=false;$("finger-reveal-btn").disabled=true;
 renderCompare();
 const correct=studentPrediction.type===studentPrediction.source;
 $("finger-guess-feedback").textContent=(correct?tr("Correct! ","정답! "):tr("Discovery: ","발견! "))+
 studentPrediction.letter+" = "+name(studentPrediction.source)+". "+tr("Compare the harmonic fingerprints to explain the difference.","고조파 분포를 비교하고 이유를 설명해 보세요.");
 $("finger-guess-feedback").dataset.result=correct?"correct":"wrong";
}
function reset(){
 revealed=false;selected=0;attempts=0;studentPrediction=null;evidenceVerified=false;$("finger-reveal-content").hidden=true;$("finger-reveal-btn").disabled=true;
 $("finger-evidence-choice").value="";$("finger-evidence-feedback").textContent="";delete $("finger-evidence-feedback").dataset.result;
 $("finger-guess").value="";$("finger-quiz").value="";$("finger-guess-feedback").textContent="";$("finger-quiz-feedback").textContent="";
 render();
}
async function loadFile(type,file){
 if(!file)return;
 if(file.size>25*1024*1024)throw Error("File size exceeds 25 MB");
 const Context=W.AudioContext||W.webkitAudioContext;if(!Context)throw Error("Browser has no audio decoder");
 const context=new Context();
 try{
  const decoded=await context.decodeAudioData(await file.arrayBuffer());
  const srcLength=Math.min(decoded.length,Math.round(decoded.sampleRate*.9));
  const n=Math.max(0,Math.round(srcLength*FS/decoded.sampleRate)),data=new Float64Array(n);
  for(let i=0;i<n;i++){
   const pos=i*decoded.sampleRate/FS,j=Math.min(decoded.length-1,Math.floor(pos)),k=Math.min(decoded.length-1,j+1),alpha=pos-j;
   let sample=0;for(let channel=0;channel<decoded.numberOfChannels;channel++){
    const x=decoded.getChannelData(channel);
    sample+=((1-alpha)*x[j]+alpha*x[k])/decoded.numberOfChannels;
   }
   data[i]=sample;
  }
  if(data.length<8192)throw Error("Recording must be at least 0.512 seconds long");
  recordings[type]={samples:data,label:file.name};
  $("finger-files-status").textContent=tr("Loaded locally: ","브라우저에서 파일을 읽었습니다: ")+file.name;
  reset();
 }finally{await context.close()}
}
function localize(){
 const labels={
 "finger-title":["Sound Fingerprint · Why Does the Same Note Sound Different?","Sound Fingerprint · 같은 음높이인데 왜 다르게 들릴까요?"],
 "finger-intro":["Listen to three hidden sounds at the same reference pitch. Use an actual FFT to discover their different harmonic fingerprints. Begin with clearly labelled synthetic models, or upload real recordings to test the idea.","같은 기준 음높이를 가진 세 소리를 듣고 FFT로 고조파 분포를 비교하세요. 학습용 합성 모델로 시작하거나 실제 녹음 파일을 올려 검증할 수 있습니다."],
 "finger-controls-title":["Experiment Controls","실험 설정"],
 "finger-note-label":["Reference fundamental f₀","기준 기본주파수 f₀"],
 "finger-length-label":["FFT observation N","FFT 관측 표본 수 N"],
 "finger-window-label":["Analysis window","분석 창 함수"],
 "finger-position-label":["Observation position","관측 구간 위치"],
 "finger-controls-help":["Synthetic sources share the selected reference pitch; for uploaded recordings, f₀ is a user assumption and must be checked before comparing harmonics.","합성 신호는 선택한 기준 음높이가 같습니다. 실제 녹음의 f₀는 사용자 가정이므로 고조파를 비교하기 전에 확인해야 합니다."],
 "finger-reset":["Reset the discovery","탐구 초기화"],
 "finger-recordings-title":["Optional · Compare your real recordings","선택 · 실제 녹음으로 비교"],
 "finger-recordings-help":["Choose three separate clips playing/singing the same steady note. Files stay in this browser. Uploaded audio replaces only that source; no remote upload. Recording pitch must be checked by the student.","같은 음높이로 연주하거나 부른 안정된 구간의 파일 세 개를 선택하세요. 파일은 브라우저 내부에서만 처리됩니다. 업로드는 해당 소리만 대체하며 녹음 음높이는 학생이 확인해야 합니다."],
 "finger-piano-file-label":["Piano recording","피아노 녹음"],"finger-guitar-file-label":["Guitar recording","기타 녹음"],"finger-voice-file-label":["Voice recording","목소리 녹음"],
 "finger-clear-files":["Use synthetic models again","합성 모델로 돌아가기"],
 "finger-predict-title":["1 · Listen, Then Make a Prediction","1 · 듣고 예측하기"],
 "finger-predict-help":["Keep the reference note fixed and listen to A, B and C first. Predict the selected sound, then reveal the FFT: which harmonic peaks support your guess?","기준 음높이를 고정하고 A·B·C를 먼저 들으세요. 선택한 소리를 예측한 뒤 FFT를 공개하여 어떤 고조파 피크가 추측을 뒷받침하는지 확인하세요."],
 "finger-guess-label":["Selected sound identity","현재 소리의 정체"],
 "finger-guess-check":["Check my prediction","예측 확인"],
 "finger-synthesis-note":["Initial examples are instrument-like and vowel-like harmonic models, NOT real piano/guitar/human recordings.","기본 예제는 악기·모음 특성을 모사한 합성 모델이며 실제 피아노·기타·사람 목소리 녹음이 아닙니다."],
 "finger-observe-title":["2 · Observe Waveform and FFT","2 · 시간 파형과 FFT 관찰"],
 "finger-observe-help":["The selected A/B/C sound is shown below. Vertical markers show integer multiples of the common reference frequency, not automatically estimated peaks.","선택한 A·B·C 소리의 그래프입니다. 세로선은 자동으로 추정한 피크가 아니라 공통 기준주파수의 정수배 위치입니다."],
 "finger-wave-title":["Selected waveform","선택한 시간 파형"],"finger-spectrum-title":["Actual FFT magnitude","실제 FFT 크기"],
 "finger-reveal-title":["3 · Reveal the Sound Fingerprints","3 · 소리의 주파수 지문 공개"],
 "finger-reveal-help":["First predict; then reveal the identities and compare relative harmonic magnitudes using the SAME FFT length and window.","먼저 예상한 뒤 정체를 공개하세요. 동일한 FFT 길이와 Window로 계산한 고조파 상대 크기를 비교합니다."],
"finger-evidence-title":["3 · Support your claim with FFT evidence","3 · FFT의 근거로 가설을 뒷받침하기"],
 "finger-evidence-label":["Which harmonic range contains the dominant FFT peak of your predicted sound?","예측한 소리에서 FFT의 가장 큰 피크는 몇 번째 고조파 부근인가요?"],
 "finger-evidence-check":["Verify spectral evidence","스펙트럼 근거 확인"],
 "finger-reveal-btn":["Reveal Fingerprints","주파수 지문 공개"],
 "finger-conclude-title":["4 · Explain the Discovery","4 · 발견한 원리 설명"],
 "finger-conclude-explain":["The fundamental primarily sets perceived pitch for harmonic tones; the harmonic balance, spectral envelope, onset and decay help shape timbre. This FFT uses one observation window and does not capture every temporal characteristic.","고조파 신호에서 기본주파수는 음높이와 밀접하며, 고조파 진폭·스펙트럼 포락선·어택과 감쇠는 음색에 영향을 줍니다. 이 FFT는 하나의 관측 구간만 분석하므로 모든 시간적 특징을 보여주지는 않습니다."],
 "finger-question":["Question: Two sounds have the same fundamental. Which property can still make them sound different?","문제: 두 소리의 기본주파수가 같아도 다르게 들릴 수 있는 이유는 무엇일까요?"],
 "finger-quiz-label":["Choose the best explanation","가장 적절한 설명"],
 "finger-quiz-check":["Check Explanation","설명 확인"],
 };
 for(const [id,[en,ko]]of Object.entries(labels))$(id).textContent=tr(en,ko);
 for(const letter of LETTERS)$("finger-play-"+letter.toLowerCase()).textContent=tr("▶ Listen "+letter,"▶ "+letter+" 듣기");
 const selects=[
 ["finger-guess",[["—","—"],["Piano-like","피아노 유사"],["Guitar-like","기타 유사"],["Voice-like","목소리 유사"]]],
 ["finger-quiz",[["—","—"],["Same perceived pitch guarantees identical timbre","음높이가 같으면 음색도 동일합니다"],
 ["Harmonic amplitudes and their evolution can differ","고조파 진폭과 시간에 따른 변화가 다를 수 있습니다"],
 ["Only the overall volume matters","전체 음량만 중요합니다"]]]
 ];
 for(const [id,options]of selects)[...$(id).options].forEach((o,i)=>o.textContent=tr(...options[i]));
 const evidenceOptions=[["Choose a range","범위 선택"],["Fundamental h = 1","기본주파수 h = 1"],["Harmonics h = 2–3","고조파 h = 2–3"],["Higher harmonics h ≥ 4","고조파 h ≥ 4"]];
 [...$("finger-evidence-choice").options].forEach((option,i)=>option.textContent=tr(...evidenceOptions[i]));
 document.documentElement.lang=mode()==="ko"?"ko":"en";
 if(analyzed)render();
}
function init(){
 W.ELSLanguage?.bindSelect?.("#finger-language");
 for(let i=0;i<3;i++){
  $("finger-play-"+LETTERS[i].toLowerCase()).addEventListener("click",()=>{selected=i;if(!revealed){evidenceVerified=false;$("finger-reveal-btn").disabled=true;$("finger-evidence-feedback").textContent="";delete $("finger-evidence-feedback").dataset.result;}render();play(reverse())});
 }
 for(const id of ["finger-note","finger-fft-length","finger-window","finger-position"])$(id).addEventListener("input",()=>{
  if(!revealed){evidenceVerified=false;$("finger-reveal-btn").disabled=true;$("finger-evidence-feedback").textContent="";delete $("finger-evidence-feedback").dataset.result;}
  render();
 });
 $("finger-evidence-check").addEventListener("click",checkEvidence);
 $("finger-guess-check").addEventListener("click",evaluateGuess);
 $("finger-reveal-btn").addEventListener("click",reveal);
 $("finger-quiz-check").addEventListener("click",()=>{
  const yes=$("finger-quiz").value==="harmonics";
  $("finger-quiz-feedback").textContent=yes?tr("Correct. Pitch and timbre describe different features of sound.","정답! 음높이와 음색은 서로 다른 소리의 특징입니다."):
   tr("Try again: focus on the amplitudes of the harmonic peaks and how they evolve.","다시 생각해 보세요. 고조파의 상대 진폭과 시간에 따른 변화를 확인하세요.");
 });
 $("finger-reset").addEventListener("click",reset);
 for(const type of TYPES)$("finger-"+type+"-file").addEventListener("change",async e=>{
  try{await loadFile(type,e.target.files?.[0])}catch(error){$("finger-files-status").textContent=tr("Unable to read file: ","파일 분석 실패: ")+error.message}
 });
 $("finger-clear-files").addEventListener("click",()=>{recordings={};for(const type of TYPES)$("finger-"+type+"-file").value="";reset();$("finger-files-status").textContent=tr("Synthetic examples restored.","합성 예제로 돌아왔습니다.")});
 W.ELSLanguage?.subscribe?.(()=>{localize();$("finger-evidence-feedback").textContent="";delete $("finger-evidence-feedback").dataset.result;});
 localize();reset();W.SSMathCore?.renderNow?.();
}
W.SSSoundFingerprint=Object.freeze({synth,fft,analyze,profiles,fs:FS,get state(){return{selected:LETTERS[selected],revealed,source:reverse(),attempts}}});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);
