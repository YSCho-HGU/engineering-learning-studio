/* FFT Part C: beginner-first, seven native labs; non-invasive bilingual learning bridge. */
(function lessonBridge(){
 "use strict";
 const root=document.querySelector("main[data-fft-path-lesson]");
 if(!root)return;
 const lesson=root.dataset.fftPathLesson;
 const $=id=>document.getElementById(id);
 const lang=()=>window.ELSLanguage?.get?.()||"mixed";
 const t=(en,ko,compact=false)=>{
  const m=lang();
  return m==="en"?en:m==="ko"?ko:en+(compact?" · ":"\n")+ko;
 };
 const fmt=(v,d=3)=>Number.isFinite(v)?String(Number(v.toFixed(d))):"—";
 const numeric=id=>{
  const v=$(id)?.value;
  return v===undefined||v===null||v===""?null:Number(v);
 };
 const choose=(id,otherwise="")=>$(id)?.value??otherwise;
 const visibleText=(id,max=155)=>{
  const node=$(id);
  if(!node||node.hidden)return "";
  return (node.innerText||node.textContent||"").replace(/\s+/g," ").trim().slice(0,max);
 };
 const specs={
  samples:{
   name:["01 · FFT from sample data","01 · 표본으로부터 FFT 이해하기"],
   goal:["An FFT extracts frequency patterns from x[n]. Physical Hz requires a known sampling rate.","FFT는 x[n]의 주파수 구조를 찾아냅니다. 실제 Hz를 알려면 표본화 주파수를 알아야 합니다."],
   predict:["If only the sample values are supplied, can an FFT uniquely determine frequency in Hz?","표본값만 있을 때 FFT로 Hz 단위의 실제 주파수를 유일하게 알 수 있을까요?"],
   options:[["No. It yields bin index or cycles/sample.","아니요. Bin 번호나 cycles/sample만 알 수 있습니다."],["Yes. FFT automatically discovers the sampling rate.","예. FFT가 표본화 주파수까지 자동으로 알아냅니다."]],answer:0,
   change:["Select “One coherent sinusoid” first. Keep sampling rate unknown, then enable a known fs without changing samples.","먼저 단일 정현파 예제를 선택하세요. fs를 모르는 상태에서 관찰한 뒤 표본을 바꾸지 않고 알려진 fs를 입력해 비교하세요."],
   evidence:()=>visibleText("fft-metrics",195)||t("Run FFT to inspect the dominant bin.","FFT를 실행해 주요 Bin을 확인하세요."),
   formula:()=>{
    const raw=$("fft-samples")?.value||"";
    const count=raw.split(/[\s,;]+/).filter(x=>x.length).length;
    const reported=Number($("fft-metrics")?.querySelector(".ss-fft-metric:first-child strong")?.textContent||"");
    const N=Number.isInteger(reported)&&reported>1?reported:count;
    const valid=$("fft-known")?.checked&&numeric("fft-fs")>0;
    const fs=valid?numeric("fft-fs"):null;
    return N?{
     tex:fs?String.raw`\nu_k=\frac{k}{${N}},\quad f_k=\frac{k\cdot${fmt(fs)}}{${N}}\ \mathrm{Hz}`:
      String.raw`\nu_k=\frac{k}{${N}}\ \mathrm{cycles/sample}`,
     result:fs?
      t(`N=${N}; one bin corresponds to ${fmt(fs/N,4)} Hz.`,`N=${N}; Bin 하나의 간격은 ${fmt(fs/N,4)} Hz입니다.`):
      t(`N=${N}; normalized bin spacing is ${fmt(1/N,5)} cycles/sample; Hz is unknown.`,
        `N=${N}; 정규화 Bin 간격은 ${fmt(1/N,5)} cycles/sample이며 Hz는 아직 알 수 없습니다.`)
    }:{tex:String.raw`\nu_k=\frac{k}{N}`,result:t("Enter valid samples and calculate.","유효한 표본을 입력한 뒤 계산하세요.")};
   },
   apply:["Keeping x[n] and N fixed, what changes if the true sampling rate doubles?","x[n]과 N을 유지하면서 실제 표본화 주파수만 두 배가 되면 무엇이 달라질까요?"],
   applied:[["Only the Hz labels double; X[k] is unchanged.","Hz 축의 수치만 두 배가 되고 X[k]는 변하지 않습니다."],["Every complex DFT coefficient doubles.","모든 복소 DFT 계수가 두 배가 됩니다."]],right:0,
   why:["DFT uses x[n] and N. fs is needed only when mapping k to physical time/frequency.","DFT 계산에는 x[n]과 N을 사용합니다. fs는 Bin을 물리적인 시간·주파수로 환산할 때 필요합니다."],
   target:"#fft-controls-title",theory:"samples"
  },
  resolution:{
   name:["02 · Resolution, leakage, zero-padding","02 · 분해능·누설·제로 패딩"],
   goal:["Distinguish the measured record duration from the spacing of displayed FFT samples.","실제 측정 구간의 길이와 FFT 결과가 표시되는 주파수 눈금 간격을 구분합니다."],
   predict:["Does 4× zero-padding add information that makes two close tones physically easier to resolve?","4배 제로 패딩을 하면 관찰 정보가 늘어 가까운 두 주파수를 실제로 더 잘 구분할 수 있을까요?"],
   options:[["No. It interpolates the FFT display grid.","아니요. FFT 표시 격자만 촘촘해집니다."],["Yes. It is identical to collecting 4× more samples.","예. 실제 표본을 4배 더 측정한 것과 같습니다."]],answer:0,
   change:["First increase observed N at fixed fs; compare the two-tone plot. Then hold N fixed and switch padding 1× → 4×.","먼저 fs를 고정하고 실제 관측 표본 N을 늘리세요. 이후 N을 고정하고 패딩만 1배에서 4배로 바꾸세요."],
   evidence:()=>visibleText("fft-r-stats",195)||visibleText("fft-r-spectrum-note",150),
   formula:()=>{
    const fs=numeric("fft-r-fs"),N=numeric("fft-r-n"),pad=numeric("fft-r-padding")||1;
    if(!(fs>0&&N>0))return null;
    return {
     tex:String.raw`T=\frac{${fmt(N)}}{${fmt(fs)}}=${fmt(N/fs,4)}\,\mathrm{s},\quad \Delta f_{\mathrm{grid}}=\frac{${fmt(fs)}}{${fmt(N*pad)}}=${fmt(fs/(N*pad),3)}\,\mathrm{Hz}`,
     result:t(`Observed-record scale: fs/N=${fmt(fs/N,3)} Hz. Display grid: fs/(N·${pad})=${fmt(fs/(N*pad),3)} Hz.`,
       `관측 구간 기준 주파수 척도: fs/N=${fmt(fs/N,3)} Hz. 표시 격자: fs/(N·${pad})=${fmt(fs/(N*pad),3)} Hz.`)
    };
   },
   apply:["To improve the ability to separate nearby frequencies at fixed fs, what should you change first?","fs가 고정됐을 때 가까운 두 주파수를 실제로 구별하기 위해 먼저 무엇을 늘려야 할까요?"],
   applied:[["Collect a longer record (larger N).","더 긴 관측 구간(큰 N)을 확보합니다."],["Add more zeros to the same record.","동일한 데이터 뒤에 0만 더 붙입니다."]],right:0,
   why:["A longer record improves the underlying frequency discrimination scale. Padding adds finer display samples but no new observations. Window choice also affects leakage and main-lobe width.","관측 시간이 길어져야 주파수 성분의 구별 능력이 좋아집니다. 제로 패딩은 측정 정보를 추가하지 않습니다. 윈도 종류도 누설과 주엽 폭에 영향을 줍니다."],
   target:"#fft-r-controls-title",theory:"resolution"
  },
  algorithm:{
   name:["03 · DFT vs FFT","03 · DFT와 FFT의 관계"],
   goal:["Verify that FFT is a faster algorithm for exactly the same complex DFT coefficients.","FFT는 다른 변환이 아니라 동일한 복소 DFT 계수를 더 빠르게 계산하는 알고리즘임을 확인합니다."],
   predict:["For identical x[n] and N, should direct DFT and FFT yield different complex X[k]?","동일한 x[n]과 N일 때 직접 DFT와 FFT의 복소수 X[k]는 서로 달라야 할까요?"],
   options:[["No. They agree within numerical rounding.","아니요. 수치 연산의 반올림 오차 범위에서 같습니다."],["Yes. FFT performs a different mathematical transform.","예. FFT는 수학적으로 다른 변환을 계산합니다."]],answer:0,
   change:["Start with Same Result: calculate X[k]. Inspect the small error; then open Butterfly to see reused sums and Speed to compare computation growth.","‘Same Result’에서 X[k]와 작은 계산 오차를 확인한 뒤 ‘Butterfly’에서 중복 계산의 재사용을, ‘Speed’에서 계산량 증가를 비교하세요."],
   evidence:()=>t(`Current max |DFT−FFT|: ${visibleText("same-error",42)||"—"}. ${visibleText("same-peak",65)}`,
     `현재 최대 |DFT−FFT|: ${visibleText("same-error",42)||"—"}. ${visibleText("same-peak",65)}`),
   formula:()=>{
    const N=numeric("same-n"),fs=numeric("same-fs");
    if(!(N>0))return null;
    return{
     tex:String.raw`X[k]=\sum_{n=0}^{${N-1}}x[n]e^{-j2\pi kn/${N}},\quad \mathrm{FFT}\equiv\mathrm{DFT}`,
     result:fs>0?t(`N=${N}, fs=${fmt(fs)} Hz, bin spacing=${fmt(fs/N,3)} Hz. Compare the actual max numerical error above.`,
       `N=${N}, fs=${fmt(fs)} Hz, Bin 간격=${fmt(fs/N,3)} Hz입니다. 위 실제 수치 오차를 확인하세요.`):
      t(`N=${N}. Compare the actual max numerical error above.`,`N=${N}. 위의 실제 수치 오차를 확인하세요.`)
    };
   },
   apply:["When N doubles, which method's operation count grows faster for radix-2 data lengths?","N이 두 배로 늘면 radix-2 길이에서 어느 방법의 연산량이 더 빠르게 증가하나요?"],
   applied:[["Direct DFT (proportional to N²).","직접 DFT (N²에 비례)."],["FFT (proportional to N log₂N).","FFT (N log₂N에 비례)."]],right:0,
   why:["The direct DFT reuses fewer intermediate products. A radix-2 FFT combines smaller DFTs using butterflies; it computes the same coefficients.","직접 DFT는 많은 연산을 반복합니다. radix-2 FFT는 작은 DFT의 중간 결과를 버터플라이로 재활용해 같은 계수를 계산합니다."],
   target:"#panel-same",theory:"dftfft"
  },
  dtmf:{
   name:["04 · Decode a hidden DTMF key","04 · 숨겨진 DTMF 숫자 해독"],
   goal:["Use two FFT peaks as evidence for a telephone keypad row and column.","FFT의 두 주요 피크를 근거로 전화 버튼의 행과 열을 찾아냅니다."],
   predict:["How many simultaneous tone groups encode one standard DTMF key?","DTMF의 한 숫자 버튼은 동시에 몇 가지 주파수 그룹을 사용하나요?"],
   options:[["Two: a low row tone and a high column tone.","두 가지: 낮은 행 주파수와 높은 열 주파수."],["One: a single frequency alone.","한 가지: 주파수 하나만 사용합니다."]],answer:0,
   change:["Play the unknown key, then compute FFT. Choose one low-frequency and one high-frequency peak as evidence before guessing.","미지의 버튼 소리를 들은 뒤 FFT를 계산하세요. 숫자를 맞히기 전에 낮은 주파수 피크 하나와 높은 피크 하나를 근거로 선택하세요."],
   evidence:()=>{
    const peaks=visibleText("dtmf-peaks",150);
    return peaks||t("Press Compute FFT to reveal the candidate peak frequencies.","FFT 계산 버튼을 눌러 피크 후보를 확인하세요.");
   },
   formula:()=>{
    const N=numeric("dtmf-fft-n")||2048,fs=8000;
    return{tex:String.raw`\Delta f=\frac{${fs}}{${N}}=${fmt(fs/N,4)}\,\mathrm{Hz},\quad f_k=\frac{k\cdot${fs}}{${N}}`,
    result:t(`N=${N}; the FFT bin grid is ${fmt(fs/N,3)} Hz. DTMF tones need not fall exactly on bin centers.`,
      `N=${N}; FFT Bin 격자는 ${fmt(fs/N,3)} Hz입니다. DTMF 주파수는 Bin 중심과 정확히 일치하지 않을 수 있습니다.`)};
   },
   apply:["If fs stays fixed but N becomes smaller, what happens to the FFT bin spacing?","fs가 같고 N이 작아지면 FFT Bin 간격은 어떻게 될까요?"],
   applied:[["It becomes wider, making close peaks harder to separate.","간격이 커져 가까운 피크를 구별하기 어려워집니다."],["It becomes narrower, improving frequency discrimination.","간격이 작아져 분해능이 좋아집니다."]],right:0,
   why:["One row tone and one column tone identify a key. The FFT helps estimate both frequencies; window choice and record length limit how precisely peaks can be located.","행 주파수 하나와 열 주파수 하나를 조합하면 버튼을 알 수 있습니다. FFT는 두 피크를 찾는 도구이며 관측 길이와 윈도가 피크 추정 정확도에 영향을 줍니다."],
   target:"#dtmf-mystery-title",theory:"dtmf"
  },
  fingerprint:{
   name:["05 · Sound fingerprints","05 · 소리의 주파수 지문"],
   goal:["At a fixed note, compare harmonic amplitudes to explain differences in timbre.","같은 음높이에서 고조파 크기 분포가 달라질 때 음색이 달라지는 이유를 확인합니다."],
   predict:["If the fundamental frequency is unchanged, what can make two sounds have different timbres?","기본주파수가 같아도 두 소리의 음색이 달라지는 이유는 무엇일까요?"],
   options:[["Their harmonic amplitudes and time envelopes differ.","고조파 크기 분포와 시간 포락선이 다르기 때문입니다."],["The fundamental must be different.","기본주파수가 반드시 다르기 때문입니다."]],answer:0,
   change:["Keep the same note and FFT settings, listen to A/B/C, compare the harmonic peaks, then use the existing evidence check before revealing the model labels.","음높이와 FFT 설정을 고정하고 A/B/C를 들은 뒤 고조파 피크를 비교하세요. 기존 근거 확인을 마친 후 모델 분류를 공개하세요."],
   evidence:()=>visibleText("finger-data",190)||t("Listen to a sound and inspect its spectrum.","소리를 듣고 주파수 스펙트럼을 확인하세요."),
   formula:()=>{
    const f0=numeric("finger-note"),N=numeric("finger-fft-length"),fs=16000;
    if(!(f0>0&&N>0))return null;
    return{tex:String.raw`f_h=h f_0,\quad f_2=${fmt(f0*2)}\,\mathrm{Hz},\quad \Delta f=\frac{16000}{${N}}=${fmt(fs/N,3)}\,\mathrm{Hz}`,
     result:t(`Same note: f0=${fmt(f0)} Hz. The relative peak heights and envelopes carry timbre cues.`,
       `같은 음높이 f0=${fmt(f0)} Hz에서도 고조파의 상대 크기와 시간 포락선이 음색 정보를 제공합니다.`)};
   },
   apply:["If the note frequency f0 doubles while its relative harmonic pattern stays similar, what happens to harmonic frequencies?","상대적인 고조파 패턴을 유지한 채 기본주파수 f0가 두 배가 되면 고조파 주파수는 어떻게 될까요?"],
   applied:[["Each harmonic frequency doubles.","각 고조파 주파수가 두 배가 됩니다."],["All harmonic frequencies stay unchanged.","고조파 주파수는 바뀌지 않습니다."]],right:0,
   why:["For harmonic index h, fh=h·f0. Instrument-like and voice-like sounds here are modeled examples, not proof of source identity from an FFT alone.","고조파 h의 주파수는 fh=h·f0입니다. 이 실습의 악기·음성 유사 소리는 합성 모델이며 FFT만으로 실제 소리의 출처를 확정할 수 없습니다."],
   target:"#finger-controls-title",theory:"harmonics"
  },
  upload:{
   name:["06 · Analyze real audio and sensor samples","06 · 실제 오디오·센서 표본 분석"],
   goal:["Identify peaks without inventing a physical sampling rate for data that lack fs.","표본화 주파수가 없는 데이터에 임의의 Hz를 붙이지 않고 주파수 피크를 해석합니다."],
   predict:["A CSV contains only x[n] with no sampling interval. Which frequency axis is justified?","CSV에 x[n]만 있고 표본 시간 정보가 없다면 어떤 주파수 축을 사용할 수 있을까요?"],
   options:[["cycles/sample (or bin index), not Hz.","cycles/sample 또는 Bin 번호이며 Hz는 아닙니다."],["Hz, because FFT determines the hardware sample rate.","FFT가 장비의 표본화 주파수를 알아내므로 Hz입니다."]],answer:0,
   change:["Start with a built-in demonstration, then inspect the FFT peaks. Try a real file; enter fs only if the recording or sensor documentation provides it.","기본 데모로 FFT 피크를 먼저 확인한 뒤 실제 파일을 사용하세요. fs는 녹음·센서 기록에 명시된 경우에만 입력하세요."],
   evidence:()=>visibleText("fft-upload-stats",205)||t("Choose a demo or local file first.","데모 또는 로컬 파일을 먼저 선택하세요."),
   formula:()=>{
    const N=numeric("fft-upload-n")||1024;
    const entered=$("fft-upload-fs")?.value.trim()||"";
    const fromSource=($("fft-upload-meta")?.textContent||"").match(/fs\s*=\s*([0-9.]+)\s*Hz/i);
    const fs=entered==="0"?null:entered!==""?Number(entered):fromSource?Number(fromSource[1]):null;
    const isHz=Number.isFinite(fs)&&fs>0;
    return {
      tex:isHz?String.raw`\nu_k=\frac{k}{${N}},\quad f_k=\frac{k\,${fmt(fs)}}{${N}}\ \mathrm{Hz}`:
       String.raw`\nu_k=\frac{k}{${N}}\ \mathrm{cycles/sample}`,
      result:isHz?t(`Entered fs=${fmt(fs)} Hz → spacing=${fmt(fs/N,4)} Hz. Verify fs from the source metadata.`,`입력한 fs=${fmt(fs)} Hz → 간격=${fmt(fs/N,4)} Hz입니다. 원본 기록과 일치하는지 확인하세요.`):
      t(`Selected N=${N}; read the native peak card to determine whether metadata supply a valid fs. Never infer Hz from samples alone.`,`N=${N}이며 원래 데이터에 fs가 있는지는 기존 피크 카드에서 확인하세요. 표본만으로 Hz를 추정해서는 안 됩니다.`)
    };
   },
   apply:["With the same N and x[n], if the true sampling rate is doubled, what changes?","N과 x[n]이 같고 실제 표본화 주파수만 두 배이면 무엇이 달라질까요?"],
   applied:[["The Hz frequency labels double; bin k stays fixed.","Hz 주파수 눈금은 두 배, Bin 번호 k는 그대로입니다."],["The FFT's complex X[k] coefficients double.","FFT의 복소 계수 X[k]가 두 배가 됩니다."]],right:0,
   why:["FFT arithmetic only uses samples. Physical frequency units depend on an independently known sampling rate; metadata should be preserved rather than guessed.","FFT 계산은 표본값으로 수행합니다. 실제 Hz 단위는 별도로 확인한 표본화 주파수가 있어야 하며 임의의 값을 가정하면 안 됩니다."],
   target:"#fft-upload-controls-title",theory:"realdata"
  },
  image:{
   name:["07 · Discover 2D image frequencies","07 · 이미지의 2D 주파수 발견"],
   goal:["Relate repeating image patterns to symmetric FFT peaks and a reconstructed image.","이미지의 반복 패턴이 대칭적인 FFT 피크와 복원 이미지로 어떻게 연결되는지 알아봅니다."],
   predict:["With image size and stripe direction fixed, what happens to FFT peaks if stripe cycles increase?","이미지 크기와 줄무늬 방향을 고정한 채 반복 횟수를 늘리면 FFT 피크는 어떻게 이동할까요?"],
   options:[["Away from the center (higher spatial frequency).","중심에서 멀어집니다(공간주파수 증가)."],["Toward the center (lower spatial frequency).","중심으로 가까워집니다(공간주파수 감소)."]],answer:0,
   change:["Begin with Adjustable stripes in the first stage. Change only cycle count, then inspect paired peaks. Later use a symmetric notch mask in the noise-removal stage.","첫 번째 단계의 줄무늬를 선택하고 반복 횟수만 변경하세요. 대칭 피크를 관찰한 뒤 마지막 단계에서 대칭 Notch 필터를 사용하세요."],
   evidence:()=>visibleText("image-live-observation",165)||visibleText("image-metrics",170)||t("Change a stripe parameter to update the FFT plots.","줄무늬 변수를 조절하여 FFT 그림을 갱신하세요."),
   formula:()=>{
    const N=numeric("image-size")||256,cycles=numeric("image-cycles")||8,kind=choose("image-preset");
    return{tex:String.raw`\nu_{\mathrm{spatial}}=\frac{${fmt(cycles)}}{${fmt(N)}}=${fmt(cycles/N,5)}\ \mathrm{cycles/pixel}`,
     result:kind==="stripes"?
      t(`${cycles} cycles across ${N} pixels → period ≈${fmt(N/cycles,2)} pixels. A real image has conjugate-symmetric FFT peaks.`,`폭 ${N}픽셀에 ${cycles}회 반복 → 공간 주기 약 ${fmt(N/cycles,2)}픽셀입니다. 실수 영상의 FFT 피크는 켤레대칭입니다.`):
      t(`The formula above is the stripe example. Current input is ${kind}; interpret its actual displayed 2D spectrum instead.`,`위 식은 줄무늬 예제 기준입니다. 현재 입력은 ${kind}이므로 실제 표시된 2D 스펙트럼을 관찰하세요.`)
    };
   },
   apply:["For real-valued image data, why should a notch filter remove both symmetric peaks of periodic noise?","실수값 이미지에서 주기적 간섭을 제거할 때 왜 대칭된 두 피크를 함께 제거해야 할까요?"],
   applied:[["To preserve conjugate symmetry and obtain a real reconstruction.","켤레대칭을 유지하여 실수값으로 복원하기 위해서입니다."],["Because each single pixel maps to an independent FFT frequency.","픽셀 하나가 주파수 하나에만 대응하기 때문입니다."]],right:0,
   why:["2D FFT of a real image has F[−u,−v]=F[u,v]*. Symmetric masks preserve the reality condition; FFT2 applies 1D FFTs over rows and columns.","실수 영상의 FFT는 F[−u,−v]=F[u,v]*를 만족합니다. 대칭 마스크는 실수 복원 조건을 유지하고, FFT2는 행과 열에 1D FFT를 차례로 적용합니다."],
   target:"#image-controls-title",theory:"image"
  }
 };
 const c=specs[lesson];
 if(!c)return;
 const create=(name,cls,contents)=>{
  const node=document.createElement(name);
  if(cls)node.className=cls;
  if(contents!==undefined)node.textContent=contents;
  return node;
 };
 const initial=root.querySelector([
  ".ss-fft-intro",".ss-fft-r-intro",".dft-heading",".ss-dtmf-intro",
  ".ss-finger-intro",".ss-fft-upload-intro",".ss-image-intro"
 ].join(","));
 const anchor=root.querySelector({
  samples:"#fft-graphs",resolution:".ss-fft-r-graphs",
  algorithm:"#panel-same .dft-paired-plots",dtmf:"#dtmf-spectrum-panel",
  fingerprint:"#finger-observe",upload:"#fft-upload-stats",image:"#image-live-observation"
 }[lesson]);
 if(!initial||!anchor)return;
 const prereqHref="./applications-fft-theory.html#"+c.theory;
 const selection={predict:"",apply:"",touched:0,done:false};
 const header=create("section","ss-fft-path-top");
 header.id="ss-fft-path-top";header.setAttribute("aria-label",t("FFT learning journey","FFT 학습 순서"));
 const note=create("section","ss-fft-path-bridge");note.id="ss-fft-path-bridge";
 initial.insertAdjacentElement("afterend",header);
 anchor.insertAdjacentElement("afterend",note);
 const optionControl=(choices,current,callback,accessible)=>{
  const sel=create("select","ss-fft-path-select");
  sel.setAttribute("aria-label",accessible);
  let op=create("option","",t("Select your prediction","예측을 선택하세요"));op.value="";sel.append(op);
  choices.forEach((arr,i)=>{op=create("option","",t(...arr));op.value=String(i);sel.append(op)});
  sel.value=current;sel.addEventListener("change",()=>callback(sel.value));
  return sel;
 };
 let pending=false,signature="";
 const refresh=()=>{
  const formula=c.formula();
  const evidence=c.evidence();
  const next=JSON.stringify([formula,evidence,lang(),selection.touched]);
  if(signature===next)return;signature=next;
  const live=note.querySelector("[data-fft-path-evidence]");
  if(live)live.textContent=evidence;
  const math=note.querySelector("[data-fft-path-math]");
  if(math&&formula){
   math.dataset.tex=formula.tex;
   math.setAttribute("aria-label",formula.tex);
   if(window.katex?.render){
    try{window.katex.render(formula.tex,math,{displayMode:true,throwOnError:true,strict:"ignore",trust:false,output:"htmlAndMathml"});math.dataset.rendered="katex"}
    catch(err){math.textContent=formula.tex;math.dataset.rendered="fallback";math.dataset.error=String(err).slice(0,140)}
   }else{math.textContent=formula.tex;math.dataset.rendered="plain"}
  }
  const meaning=note.querySelector("[data-fft-path-meaning]");
  if(meaning)meaning.textContent=formula?.result||"";
  const touched=header.querySelector("[data-fft-path-interactions]");
  if(touched)touched.textContent=selection.touched>0?t("Settings explored: "+selection.touched+" change(s).","변경·실행한 조작: "+selection.touched+"회"):
   t("Use the controls in the original experiment below.","아래 기존 실습의 조절 메뉴를 사용하세요.");
 };
 const schedule=()=>{
  if(pending)return;pending=true;
  requestAnimationFrame(()=>{pending=false;refresh()});
 };
 const answer=(kind)=>{
  const value=selection[kind],expected=kind==="predict"?c.answer:c.right;
  return value!==""&&Number(value)===expected;
 };
 const redraw=()=>{
  header.replaceChildren();note.replaceChildren();signature="";
  const mainTitle=create("h2","ss-fft-path-title",t(...c.name));
  header.append(create("p","ss-fft-path-kicker",t("STEP-BY-STEP FFT DISCOVERY","단계별 FFT 발견 학습")),mainTitle,
    create("p","ss-fft-path-goal",t(...c.goal)));
  const prediction=create("div","ss-fft-path-predict");
  prediction.append(create("h3","",t("① Predict · Before changing anything","① Predict · 값을 바꾸기 전 예상하기")),
   create("p","",t(...c.predict)),
   optionControl(c.options,selection.predict,v=>{selection.predict=v;selection.done=false},t("Prediction","예측")));
  const step=create("div","ss-fft-path-change");
  step.append(create("h3","",t("② Change · One control at a time","② Change · 변수 하나씩 조작")),
   create("p","",t(...c.change)));
  const jump=document.createElement("a");jump.href=c.target;
  jump.textContent=t("Go to experiment controls","실습 조절 메뉴로 이동");
  jump.className="ss-fft-path-jump";step.append(jump);
  const help=document.createElement("a");help.href=prereqHref;help.target="_blank";help.rel="noopener noreferrer";
  help.className="ss-fft-path-theory";
  help.textContent=t("Need FFT theory? Open the illustrated guide (new tab)","FFT 배경 이론 보기 (새 창)");
  const meta=create("p","ss-fft-path-count");meta.dataset.fftPathInteractions="";
  header.append(prediction,step,help,meta);
  note.append(create("h3","ss-fft-path-observe-title",t("③ Observe · Read the actual result","③ Observe · 실제 결과 확인")));
  const evidence=create("output","ss-fft-path-evidence");evidence.dataset.fftPathEvidence="";note.append(evidence);
  note.append(create("h3","ss-fft-path-explain-title",t("④ Explain · The equation for these settings","④ Explain · 현재 설정값을 수식으로 확인")));
  const math=create("div","ss-fft-path-equation");math.dataset.fftPathMath="";note.append(math);
  const meaning=create("p","ss-fft-path-meaning");meaning.dataset.fftPathMeaning="";note.append(meaning);
  const apply=create("div","ss-fft-path-apply");
  apply.append(create("h3","",t("⑤ Apply / Check · Try a new condition","⑤ Apply / Check · 다른 조건에도 적용")),
    create("p","",t(...c.apply)));
  apply.append(optionControl(c.applied,selection.apply,v=>{selection.apply=v;selection.done=false},t("Transfer question","응용 질문")));
  const check=create("button","ss-fft-path-check",t("Check my explanation","근거로 정답 확인"));
  check.type="button";const feedback=create("p","ss-fft-path-feedback");feedback.setAttribute("role","status");feedback.setAttribute("aria-live","polite");
  check.addEventListener("click",()=>{
   feedback.dataset.status="";
   if(selection.predict===""||selection.apply===""){
    feedback.textContent=t("Choose both answers before checking.","예측과 응용 문제에 모두 답해 보세요.");
   }else if(selection.touched===0){
    feedback.textContent=t("First change or run one setting and examine the native graph.","먼저 실습을 한 번 조작하거나 실행하고 실제 그래프를 관찰하세요.");
   }else if(!answer("predict")||!answer("apply")){
    feedback.textContent=t("Compare the graph with the equation, then revise your choices.","그래프와 수식의 근거를 비교한 뒤 답을 다시 선택해 보세요.");
   }else{
    selection.done=true;feedback.dataset.status="correct";
    feedback.textContent=t("Verified. ","확인했습니다. ")+t(...c.why);
   }
  });
  apply.append(check,feedback);note.append(apply);
  schedule();
 };
 redraw();
 const tracked=event=>{
  if(!event.isTrusted)return;
  const target=event.target;
  if(!target||!root.contains(target)||header.contains(target)||note.contains(target))return;
  if(event.type==="input"&&target.tagName==="INPUT"&&target.type==="range")selection.touched++;
  else if(event.type==="change"&&["INPUT","SELECT","TEXTAREA"].includes(target.tagName))selection.touched++;
  else if(event.type==="click"&&target.closest("button")&& !target.closest("nav"))selection.touched++;
  schedule();
 };
 root.addEventListener("input",tracked,{passive:true});
 root.addEventListener("change",tracked,{passive:true});
 root.addEventListener("click",tracked,{passive:true});
 const targets={
  samples:["#fft-metrics","#fft-insight"],
  resolution:["#fft-r-stats","#fft-r-observation"],
  algorithm:["#same-error","#same-peak"],
  dtmf:["#dtmf-peaks","#dtmf-bin-note"],
  fingerprint:["#finger-data"],
  upload:["#fft-upload-stats"],
  image:["#image-metrics","#image-live-observation"]
 }[lesson];
 const obs=new MutationObserver(schedule);
 for(const query of targets){
  const element=root.querySelector(query);
  if(element)obs.observe(element,{subtree:true,childList:true,characterData:true});
 }
 window.ELSLanguage?.subscribe?.(()=>redraw());
 window.addEventListener("load",schedule);
 schedule();
 window.SSFFTStudyPath=Object.freeze({lesson,refresh:()=>{signature="";schedule()},getState:()=>({...selection})});
})();
