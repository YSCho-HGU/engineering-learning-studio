/* FFT companion reference: seven bilingual tutorials and frequency-bin explorer. */
(function FFTConceptGuide(){
 "use strict";
 const lang=()=>window.ELSLanguage?.get?.()||"mixed";
 const t=(en,ko)=>{const m=lang();return m==="en"?en:m==="ko"?ko:en+"\n"+ko};
 const $=id=>document.getElementById(id);
 const make=(tag,cls,content)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(content!==undefined)node.textContent=content;
  return node;
 };
 const topics=[
  {id:"samples",code:"1",title:["From time samples to FFT bins","시간 표본에서 FFT Bin으로"],
   intro:["Before FFT, a signal is an ordered list x[0], x[1], …, x[N−1]. The FFT describes how strongly discrete complex sinusoids occur in that list.",
    "FFT를 하기 전 신호는 x[0], x[1], …, x[N−1]의 순서 있는 값입니다. FFT는 그 표본 안에 어떤 복소 정현파 성분이 얼마나 있는지 보여줍니다."],
   keys:[
    [["Step 1 · What does k mean?","1단계 · k는 무엇일까요?"],["k is a frequency-bin index, not a physical frequency. k=1 corresponds to one cycle across N samples; k=3 means three cycles in N samples.","k는 실제 주파수가 아니라 주파수 Bin 번호입니다. k=1은 N개 표본에서 한 번, k=3은 세 번 반복하는 기저를 나타냅니다."]],
    [["Step 2 · What does the FFT calculate?","2단계 · FFT는 무엇을 계산하나요?"],["The discrete Fourier transform adds N samples after rotating each by a complex-exponential weight. The FFT calculates exactly these same X[k] values, just more efficiently.","DFT는 각 표본에 복소지수 가중치를 곱해 N개를 합산합니다. FFT는 바로 이 X[k]를 더 효율적으로 계산합니다."]],
    [["Step 3 · What if fs is unknown?","3단계 · fs가 없다면?"],["You can name k and ν=k/N cycles/sample, but you cannot label a peak as 300 Hz without the actual sampling rate. Physical frequency is f=kfs/N.","k와 ν=k/N cycles/sample은 계산할 수 있지만 실제 표본화 주파수 없이 300 Hz라고 표시할 수는 없습니다. 물리 주파수는 f=kfs/N입니다."]]
   ],
   math:[String.raw`X[k]=\sum_{n=0}^{N-1}x[n]e^{-j2\pi kn/N}`,String.raw`\nu_k=\frac{k}{N}\ \mathrm{cycles/sample},\qquad f_k=\frac{kf_s}{N}`],
   worked:["Worked example: N=16, k=3. The normalized frequency is 3/16 = 0.1875 cycles/sample. If fs=8000 Hz, the same bin corresponds to 1500 Hz. If fs is absent, report only 0.1875 cycles/sample.",
    "예제: N=16, k=3이면 정규화 주파수는 3/16=0.1875 cycles/sample입니다. fs=8000 Hz이면 1500 Hz에 해당하지만, fs가 없다면 0.1875 cycles/sample로만 표현합니다."],
   caution:["For a real signal, bins above N/2 represent negative-frequency components. Also, a constant offset appears at DC (k=0).","실수 신호에서 k>N/2는 음의 주파수에 해당합니다. 일정한 평균값은 DC 성분(k=0)에 나타납니다."],
   back:"applications-fft-lab.html"},
  {id:"resolution",code:"2",title:["Resolution, windowing and zero-padding","주파수 분해능·윈도·제로 패딩"],
   intro:["A graph may look smoother when more FFT points are displayed, but the ability to distinguish two actual tones depends fundamentally on the observation time and the chosen window.",
    "FFT 결과를 더 많은 점으로 표시하면 그래프가 매끄러워 보이지만, 실제 두 주파수를 구별하는 능력은 기본적으로 관측 시간과 선택한 윈도에 의해 결정됩니다."],
   keys:[
    [["Step 1 · Increase actual observation time","1단계 · 실제 관측 시간을 늘리기"],["At fixed fs, recording more actual samples increases T=N/fs. The scale 1/T describes how finely distinct frequencies can be distinguished, though exact resolvability also depends on window shape and tone strengths.","fs가 고정됐을 때 실제 표본 수 N을 늘리면 T=N/fs가 길어집니다. 1/T는 주파수 구별의 기본 척도이며 실제 분리 성능은 윈도와 성분 크기에도 좌우됩니다."]],
    [["Step 2 · Why does leakage occur?","2단계 · 누설은 왜 생길까요?"],["FFT treats the finite observation as one period of a periodic signal. A sinusoid that does not complete an integer number of cycles across that record spreads its energy over multiple bins. Hann reduces far sidelobes but widens the main lobe.","FFT는 유한 관측 구간이 주기적으로 반복된다고 가정합니다. 관측 구간 안에서 정수 번 반복되지 않는 정현파는 여러 Bin에 퍼집니다. Hann 윈도는 먼 누설 성분을 줄이지만 주엽을 넓힙니다."]],
    [["Step 3 · Why is zero-padding different?","3단계 · 제로 패딩은 왜 다를까요?"],["Appending zeros lengthens the FFT input to M≥N without extending the measured time record. The plot is sampled at a finer frequency grid fs/M, but no new information is acquired.","뒤에 0을 붙여 FFT 입력 길이를 M≥N으로 늘려도 실제 관찰 시간은 변하지 않습니다. 표시 격자는 fs/M으로 촘촘해지지만 새로운 정보는 생기지 않습니다."]]
   ],
   math:[String.raw`T=\frac{N}{f_s},\qquad \Delta f_{\mathrm{record}}\sim\frac{1}{T}=\frac{f_s}{N}`,String.raw`\Delta f_{\mathrm{grid}}=\frac{f_s}{M},\qquad M\ge N`],
   worked:["Worked example: fs=256 Hz, N=64 → 0.25 seconds observed and a record scale of 4 Hz. With M=256 zero-padding, the displayed FFT grid is 1 Hz; the record still contains only 64 observations.","예제: fs=256 Hz, N=64이면 관측 시간은 0.25초, 관측 길이 기준 주파수 척도는 4 Hz입니다. M=256으로 제로 패딩하면 화면 격자는 1 Hz이지만 관측 정보는 여전히 64개 표본뿐입니다."],
   caution:["Do not call fs/M the new physical resolution. Changing the window trades sidelobes against main-lobe width, even when N is unchanged.","fs/M을 새로운 실제 분해능이라고 부르지 마세요. N이 같아도 윈도에 따라 주엽 폭과 누설이 달라집니다."],
   back:"applications-fft-resolution.html"},
  {id:"dftfft",code:"3",title:["DFT and FFT: same answer, different work","DFT와 FFT: 같은 결과, 다른 연산"],
   intro:["DFT is a mathematical definition. FFT is a family of algorithms to compute that definition quickly. Students should verify equality first, and only then inspect butterflies and complexity.",
    "DFT는 수학적 변환의 정의이고, FFT는 이를 빠르게 계산하는 알고리즘 계열입니다. 먼저 결과가 동일함을 확인한 뒤 버터플라이와 계산량을 살펴보는 순서가 적절합니다."],
   keys:[
    [["Step 1 · Equal complex coefficients","1단계 · 복소수 계수의 일치"],["Given exactly the same x[n] and N, direct DFT and FFT return the same complex X[k], apart from floating-point rounding. Compare complex values, not just their magnitudes.","같은 x[n]과 N을 사용하면 직접 DFT와 FFT는 부동소수점 반올림 오차를 제외하고 같은 복소수 X[k]를 만듭니다. 크기뿐 아니라 복소수 값도 비교하세요."]],
    [["Step 2 · Reuse half-sized problems","2단계 · 작은 문제 재활용"],["For radix-2 FFT, split samples into even and odd indices and combine their smaller DFTs using complex factors called twiddles. A butterfly forms a sum and a difference from two intermediate values.","radix-2 FFT는 짝수·홀수 인덱스 표본을 나누어 작은 DFT를 계산하고 회전인자(twiddle factor)로 결합합니다. 버터플라이는 중간값 두 개를 더하고 빼는 구조입니다."]],
    [["Step 3 · Compare growth, not a fixed stopwatch","3단계 · 절대 시간이 아닌 증가 추세 비교"],["A direct N-point DFT has O(N²) arithmetic growth, while a radix-2 FFT has O(N log₂N). Browser timing depends on implementation and hardware; the orders of growth are the robust lesson.","N점 직접 DFT의 연산량은 O(N²), radix-2 FFT는 O(N log₂N)로 증가합니다. 실제 브라우저 실행 시간은 구현과 컴퓨터에 따라 달라지므로 증가 추세가 핵심입니다."]]
   ],
   math:[String.raw`X[k]=\sum_{n=0}^{N-1}x[n]W_N^{kn},\qquad W_N=e^{-j2\pi/N}`,String.raw`y_0=u+Wv,\qquad y_1=u-Wv`],
   worked:["Worked example: An 8-point radix-2 FFT has log₂8=3 stages. Each stage combines pairs of complex values. Inspect one butterfly's u, v and W before moving to the next stage.","예제: 8점 radix-2 FFT는 log₂8=3단계로 이루어집니다. 각 단계에서 복소수 쌍을 결합합니다. 다음 단계로 이동하기 전에 버터플라이 하나의 u, v, W를 확인하세요."],
   caution:["FFT does not automatically increase frequency resolution. Input record length N and fs still determine its physical interpretation.","FFT 알고리즘 자체가 주파수 분해능을 높이는 것은 아닙니다. 물리 주파수 해석은 N과 fs에 달려 있습니다."],
   back:"applications-dft-fft.html"},
  {id:"dtmf",code:"4",title:["DTMF: decode two tones with FFT","DTMF: 두 주파수로 전화 버튼 해독"],
   intro:["A DTMF keypad key is encoded by a low-frequency row tone and a higher-frequency column tone added together. The FFT reveals both at once.",
    "DTMF 전화 버튼 하나는 낮은 행 주파수와 높은 열 주파수를 동시에 내어 부호화합니다. FFT를 사용하면 두 주파수를 함께 확인할 수 있습니다."],
   keys:[
    [["Step 1 · Listen before looking","1단계 · 먼저 소리 듣기"],["Listen to an unknown keypad sound and predict whether one tone or several components are present. The waveform alone does not make the two frequencies obvious.","미지의 버튼 소리를 듣고 주파수 성분이 몇 개인지 예상하세요. 시간 파형만으로 두 주파수를 직접 구별하기는 어렵습니다."]],
    [["Step 2 · Compare FFT peaks","2단계 · FFT 피크 비교"],["Use the FFT peak positions to identify one row from 697, 770, 852, 941 Hz and one column from 1209, 1336, 1477 Hz. Read both, rather than choosing a key by ear alone.","FFT 피크 위치로 행(697, 770, 852, 941 Hz)과 열(1209, 1336, 1477 Hz)에서 하나씩 고르세요. 귀로만 추측하지 않고 두 피크를 근거로 삼습니다."]],
    [["Step 3 · Account for finite bin spacing","3단계 · 유한 Bin 간격 고려"],["The generated tones generally are not exactly at integer FFT bins. Use the peak location and DTMF frequency map, allowing for the FFT grid spacing fs/N.","생성된 주파수가 항상 FFT Bin 중심에 정확히 맞지는 않습니다. fs/N 간격과 DTMF 표를 함께 이용해 피크를 해석하세요."]]
   ],
   math:[String.raw`x[n]=A\sin(2\pi f_Ln/f_s)+B\sin(2\pi f_Hn/f_s)`,String.raw`f_k=\frac{kf_s}{N},\qquad \Delta f=\frac{f_s}{N}`],
   worked:["Worked example: The digit 5 uses row 770 Hz and column 1336 Hz. With fs=8000 Hz and N=2048, the FFT grid is about 3.91 Hz per bin.","예제: 숫자 5는 행 770 Hz와 열 1336 Hz를 사용합니다. fs=8000 Hz, N=2048이면 FFT Bin 간격은 약 3.91 Hz입니다."],
   caution:["A spectrum shows a frequency pair, not a universally unique musical instrument. DTMF identification requires the known codebook.","스펙트럼의 두 피크만으로 모든 종류의 소리를 식별할 수 있는 것은 아닙니다. DTMF는 주파수 부호 표를 알고 있기 때문에 해독할 수 있습니다."],
   back:"applications-fft-dtmf.html"},
  {id:"harmonics",code:"5",title:["Sound timbre: fundamental and harmonics","음색: 기본주파수와 고조파"],
   intro:["Two sounds can have the same musical pitch while sounding very different. FFT makes the harmonic distribution visible, but timbre also depends on how the spectrum changes over time.",
    "서로 같은 음높이를 가진 소리도 서로 다르게 들릴 수 있습니다. FFT는 고조파의 분포를 보여주지만, 음색은 시간에 따른 스펙트럼의 변화에도 영향을 받습니다."],
   keys:[
    [["Step 1 · Keep pitch fixed","1단계 · 음높이 고정"],["Choose one fundamental f0 and keep it unchanged while listening to the modeled A/B/C sounds. Their fundamental can be the same while upper harmonics differ.","기본주파수 f0를 하나 선택해 유지하면서 모델 소리 A/B/C를 들어 보세요. 기본주파수는 같아도 높은 고조파 성분의 크기는 다를 수 있습니다."]],
    [["Step 2 · Read harmonic multiples","2단계 · 고조파 배수 읽기"],["A periodic tone has harmonics near h·f0 for h=1,2,3,… . Compare peak heights relative to the first harmonic rather than only the dominant peak.","주기적인 소리의 고조파는 h=1,2,3,…에서 h·f0 근처에 나타납니다. 가장 큰 피크 하나만 보지 말고 첫 고조파에 대한 상대적인 크기를 비교하세요."]],
    [["Step 3 · Interpret with care","3단계 · 결과 과대해석 주의"],["A single short FFT cannot fully identify an instrument or a person. Real recordings have attacks, decays, background noise, inharmonicity and changing formants.","짧은 구간의 FFT 하나로 악기나 사람을 완전히 식별할 수 없습니다. 실제 소리에는 시작·감쇠, 잡음, 비정수배 성분, 시간에 따라 변하는 공명 특성이 있습니다."]]
   ],
   math:[String.raw`x(t)=\sum_{h=1}^{H}A_h(t)\sin(2\pi h f_0t+\phi_h)`,String.raw`f_h=h f_0,\qquad\Delta f=\frac{f_s}{N}`],
   worked:["Worked example: f0=220 Hz gives harmonic candidates at 220, 440, 660 and 880 Hz. The amplitudes near these frequencies tell you more about tone color than f0 alone.","예제: f0=220 Hz이면 고조파 후보는 220, 440, 660, 880 Hz입니다. 이 주파수 주변의 상대 진폭 분포가 음색에 관한 정보를 제공합니다."],
   caution:["The built-in piano-like, guitar-like and voice-like signals are controlled synthetic models; they are not recordings of actual instruments or people.","기본 제공되는 피아노·기타·음성 유사 소리는 통제된 합성 모델이며 실제 악기나 사람의 녹음이 아닙니다."],
   back:"applications-fft-sound-fingerprint.html"},
  {id:"realdata",code:"6",title:["Real samples: where does Hz come from?","실제 표본: Hz는 어디서 오는가?"],
   intro:["The FFT is useful for sensor and audio data, but frequency units come from acquisition metadata. Do not invent a sampling rate from a CSV that contains only sample values.",
    "FFT는 센서·오디오 데이터에도 유용하지만 실제 주파수 단위는 데이터 취득 정보에서 얻습니다. 값만 있는 CSV에서 표본화 주파수를 만들어내면 안 됩니다."],
   keys:[
    [["Step 1 · Find source metadata","1단계 · 원본 정보 확인"],["A WAV file typically includes a sample rate; a CSV may or may not include time stamps, a sample interval or a sampling-frequency column. Check what the data actually provide.","WAV 파일에는 보통 표본화 주파수가 포함됩니다. CSV에는 시간표, 표본 간격 또는 표본화 주파수 열이 있을 수도 없을 수도 있으므로 실제 정보를 확인해야 합니다."]],
    [["Step 2 · Window a finite record","2단계 · 유한 구간을 정해 분석"],["Choose N actual consecutive samples, subtract the mean if appropriate, and apply a window before FFT. A shorter analysis record gives less information about closely spaced tones.","연속된 N개의 실제 표본을 선택하고 필요한 경우 평균값을 제거하며 윈도를 적용합니다. 분석 구간이 짧으면 가까운 주파수를 구별하기 어렵습니다."]],
    [["Step 3 · Convert units only when justified","3단계 · 근거가 있을 때만 단위 변환"],["Without fs, report k and cycles/sample. With verified fs, f=kfs/N in Hz and record duration T=N/fs. A large spectral peak is not automatically the source's fundamental frequency.","fs가 없다면 k와 cycles/sample을 사용합니다. fs가 확인되면 f=kfs/N으로 Hz를 계산하고 T=N/fs를 구할 수 있습니다. 큰 스펙트럼 피크가 항상 기본주파수는 아닙니다."]]
   ],
   math:[String.raw`X[k]=\sum_{n=0}^{N-1}(x[n]-\bar{x})w[n]e^{-j2\pi kn/N}`,String.raw`\nu_k=\frac{k}{N},\qquad f_k=\frac{kf_s}{N}\quad(\text{known }f_s)`],
   worked:["Worked example: N=1024 and a peak at k=80 means 80/1024=0.078125 cycles/sample. If fs=1000 Hz is documented, the peak is 78.125 Hz. Without that documentation do not write 78.125 Hz.","예제: N=1024, k=80에서 피크가 있으면 80/1024=0.078125 cycles/sample입니다. fs=1000 Hz가 확인되었다면 78.125 Hz이지만, 그런 정보가 없다면 78.125 Hz라고 쓰면 안 됩니다."],
   caution:["Windowing and zero-padding affect the displayed spectrum; uploaded sample data are processed locally in the browser in this lab.","윈도와 제로 패딩은 표시 스펙트럼에 영향을 줍니다. 이 실습의 사용자 표본 데이터는 브라우저 안에서 로컬 처리됩니다."],
   back:"applications-fft-upload.html"},
  {id:"image",code:"7",title:["2D FFT: from stripes to image filters","2D FFT: 줄무늬에서 영상 필터까지"],
   intro:["A grayscale image is a two-dimensional signal I[y,x]. Its 2D FFT describes variations across rows and columns. Patterns in the image become peaks in a two-dimensional frequency plane.",
    "흑백 이미지는 2차원 신호 I[y,x]입니다. 2D FFT는 행과 열 방향으로 밝기가 변화하는 정도를 나타냅니다. 이미지의 반복 패턴이 2차원 주파수 평면의 피크로 나타납니다."],
   keys:[
    [["Step 1 · Spatial frequency is not Hz","1단계 · 공간주파수는 Hz가 아님"],["Eight cycles over an image width of 256 pixels mean 8/256=0.03125 cycles/pixel and an image period of 32 pixels. More cycles move peaks farther from the FFT center.","256픽셀 폭에서 8회 반복하면 8/256=0.03125 cycles/pixel, 주기는 32픽셀입니다. 반복 횟수가 늘면 FFT 피크는 중심에서 멀어집니다."]],
    [["Step 2 · Why are there paired peaks?","2단계 · 왜 피크가 쌍으로 나타날까요?"],["Real-valued images have conjugate-symmetric spectra: F[−u,−v]=F[u,v]*. A real sinusoidal stripe pattern produces a symmetric pair of frequency peaks.","실수 영상의 FFT는 F[−u,−v]=F[u,v]*의 켤레대칭 관계를 갖습니다. 실수 정현파 줄무늬에는 대칭된 두 주파수 피크가 나타납니다."]],
    [["Step 3 · Link a spatial kernel and FFT filtering","3단계 · 커널 연산과 FFT 필터링 연결"],["A 3×3 kernel computes a weighted neighborhood sum. With identical boundary conditions, the same linear convolution can be expressed as multiplication in frequency. A 2D FFT is computed by FFTs along all rows and then all columns.","3×3 커널은 이웃 픽셀의 가중합을 계산합니다. 동일한 경계 조건에서 선형 컨벌루션은 주파수 영역의 곱으로 표현할 수 있습니다. 2D FFT는 행과 열 방향 FFT를 차례대로 수행해 계산합니다."]]
   ],
   math:[String.raw`F[u,v]=\sum_y\sum_x I[y,x]e^{-j2\pi(ux+vy)/N}`,String.raw`G[u,v]=H[u,v]F[u,v],\qquad g=\mathrm{IFFT2}(G)`],
   worked:["Worked example: 256×256 image with 8 horizontal-direction cycles. The spatial period is 32 pixels. Select a spectrum peak and its symmetric partner; symmetric suppression helps keep the inverse image real.","예제: 256×256 영상에 8회 반복이 있으면 공간 주기는 32픽셀입니다. 스펙트럼 피크와 켤레 대칭 피크를 함께 살펴보세요. 대칭적으로 제거해야 역변환된 영상이 실수로 유지됩니다."],
   caution:["Spatial convolution equals an FFT-based multiplication only with consistent padding and boundary rules. Image FFT axes are cycles/pixel—not temporal Hertz.","공간 컨벌루션과 FFT 곱셈은 패딩·경계 조건을 같게 적용해야 등가입니다. 영상 FFT의 축은 시간 주파수 Hz가 아니라 cycles/pixel입니다."],
   back:"applications-fft-image.html"}
 ];
 const list=$("guide-topics");
 const side=$("guide-toc");
 const render=()=>{
  if(!list||!side)return;
  list.replaceChildren();side.replaceChildren();
  for(const item of topics){
   const link=make("a","fft-guide-nav-link",item.code+" · "+t(...item.title));
   link.href="#"+item.id;side.append(link);
   const section=make("section","fft-guide-topic");section.id=item.id;
   section.append(make("p","fft-guide-number",t("CONCEPT "+item.code,"개념 "+item.code)));
   section.append(make("h2","",t(...item.title)));
   section.append(make("p","fft-guide-intro",t(...item.intro)));
   const grid=make("div","fft-guide-steps");
   item.keys.forEach((pair,index)=>{
    const card=make("article","fft-guide-step");
    card.append(make("h3","",t(...pair[0])),make("p","",t(...pair[1])));
    grid.append(card);
   });
   section.append(grid);
   const math=make("div","fft-guide-math");
   math.append(make("h3","",t("Two relations to remember","기억할 관계식 두 개")));
   for(const expression of item.math){
    const block=make("div","fft-guide-equation",expression);
    block.dataset.tex=expression;math.append(block);
   }
   section.append(math);
   const example=make("div","fft-guide-example");
   example.append(make("h3","",t("Work through one example","예제로 확인")),make("p","",t(...item.worked)));
   section.append(example);
   const caution=make("p","fft-guide-caution",t("Avoid this misconception: ","이 오해를 피하세요: ")+t(...item.caution));
   section.append(caution);
   const back=make("a","fft-guide-return",t("Return to this interactive lab","해당 실습으로 돌아가기"));
   back.href="./"+item.back;section.append(back);
   list.append(section);
  }
  for(const el of list.querySelectorAll("[data-tex]")){
   if(window.katex?.render){
    try{window.katex.render(el.dataset.tex,el,{displayMode:true,throwOnError:true,strict:"ignore",trust:false,output:"htmlAndMathml"});
      el.dataset.mathState="rendered";
    }catch(e){el.textContent=el.dataset.tex;el.dataset.mathState="fallback";el.title=String(e)}
   }
  }
  $("guide-title").textContent=t("FFT Concept Guide · For second-year engineering students","FFT 핵심 개념 가이드 · 공학계열 2학년");
  $("guide-description").textContent=t(
   "A short reference you can open beside each FFT lab. Start with time samples; open only the concepts you need to solve the current experiment.",
   "FFT 실습 옆에서 함께 볼 수 있는 보충 자료입니다. 시간 표본에서 출발하고, 지금 진행하는 실습에 필요한 개념만 골라 읽어도 됩니다.");
  $("guide-home").textContent=t("Applications · FFT","응용 실습 · FFT");
  $("guide-skip").textContent=t("Skip to FFT concepts","FFT 개념 본문으로 이동");
  $("guide-lang-label").textContent=t("Language","언어");
  $("guide-close").textContent=t("Close guide","설명 창 닫기");
  $("guide-figure-note").textContent=t(
   "Schematic only: the bars show an illustrative mapping, not the calculated FFT of the drawn samples.",
   "개념도입니다. 막대는 대응 관계의 예시이며 그려진 표본의 실제 FFT 계산 결과는 아닙니다.");
  $("guide-toc-heading").textContent=t("Jump to one concept","필요한 개념 바로 찾기");
  $("guide-explorer-heading").textContent=t("Mini explorer · One bin in two units","작은 계산 실험 · Bin 하나와 두 단위");
  $("guide-explorer-note").textContent=t(
   "Select an FFT bin k, N and an optional known sampling rate. Watch the same bin become a normalized frequency or Hz. This calculator does not generate or process a signal.",
   "FFT Bin k, N과 확인된 표본화 주파수를 선택해 보세요. 같은 Bin을 정규화 주파수 또는 Hz로 표현하는 계산기이며 실제 신호 변환을 수행하지는 않습니다.");
  for(const [id,en,ko]of [["guide-n-label","Number of samples N","표본 수 N"],["guide-k-label","FFT bin index k","FFT Bin 번호 k"],["guide-known-label","I know the sampling rate fs","표본화 주파수 fs를 알고 있습니다"],["guide-fs-label","Known sampling rate fs (Hz)","확인된 표본화 주파수 fs (Hz)"]]){
   $(id).textContent=t(en,ko);
  }
  $("guide-footer").textContent=t(
   "Study route: Signals & Systems Ch1 (sample sequences) → Ch3/4 (Fourier ideas) → Ch6/7 (DTFT and sampling) → FFT discovery in Applications.",
   "연결 학습: 신호및시스템 1장(표본 수열) → 3·4장(푸리에 개념) → 6·7장(DTFT·표본화) → Applications FFT 발견 실습.");
  updateExplorer();
 };
 const explorer=()=>{
  const n=$("guide-n"),k=$("guide-k"),known=$("guide-known"),fs=$("guide-fs");
  if(!n||!k||!known||!fs)return;
  const N=Number(n.value),old=Number(k.value);
  k.max=String(N-1);
  k.value=String(Number.isFinite(old)?Math.min(N-1,Math.max(0,Math.round(old))):0);
  fs.disabled=!known.checked;
 };
 const updateExplorer=()=>{
  explorer();
  const N=Number($("guide-n").value),k=Number($("guide-k").value),known=$("guide-known").checked;
  const fs=Number($("guide-fs").value);
  const nu=k/N,signed=(k>N/2?k-N:k)/N;
  const physical=known&&Number.isFinite(fs)&&fs>0;
  const lines=physical?
   ["k="+k+", N="+N+"; ν="+nu.toFixed(5)+" cycles/sample; signed ν="+signed.toFixed(5)+" cycles/sample; f="+(signed*fs).toFixed(2)+" Hz.",
    "k="+k+", N="+N+"; ν="+nu.toFixed(5)+" cycles/sample; 부호 주파수="+signed.toFixed(5)+" cycles/sample; f="+(signed*fs).toFixed(2)+" Hz."]:
   ["k="+k+", N="+N+"; ν="+nu.toFixed(5)+" cycles/sample; signed ν="+signed.toFixed(5)+" cycles/sample. Physical Hz cannot be inferred.",
    "k="+k+", N="+N+"; ν="+nu.toFixed(5)+" cycles/sample; 부호 주파수="+signed.toFixed(5)+" cycles/sample. 실제 Hz는 알 수 없습니다."];
  $("guide-explorer-result").textContent=t(...lines);
  $("guide-explorer-tex").textContent=physical?
   String.raw`f_{\mathrm{signed}}=\frac{${k>N/2?k-N:k}\times${fs}}{${N}}=${(signed*fs).toFixed(2)}\,\mathrm{Hz}`:
   String.raw`\nu_k=\frac{${k}}{${N}}=${nu.toFixed(5)}\ \mathrm{cycles/sample}`;
  if(window.katex?.render){
   try{window.katex.render($("guide-explorer-tex").textContent,$("guide-explorer-tex"),{displayMode:true,throwOnError:true,strict:"ignore",trust:false});}
   catch(e){}
  }
 };
 $("guide-n").addEventListener("change",updateExplorer);
 $("guide-k").addEventListener("input",updateExplorer);
 $("guide-known").addEventListener("change",updateExplorer);
 $("guide-fs").addEventListener("input",updateExplorer);
 window.ELSLanguage?.subscribe?.(render);
 render();
 if(location.hash){
  requestAnimationFrame(()=>{const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));target?.scrollIntoView({block:"start"});});
 }
 window.SSFFTTheoryGuide=Object.freeze({topics:topics.map(x=>x.id),updateExplorer});
})();
