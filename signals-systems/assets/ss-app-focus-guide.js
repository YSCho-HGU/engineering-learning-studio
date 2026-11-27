/* Applications A-D: one clear discovery question per lab, shared 2026 sophomore learning contract.
 * This guide augments existing labs; it does not change any experiment state or computation.
 */
(()=>{
"use strict";
const q=(en,ko)=>({en,ko});
const guides={
"a:harmonics":{question:q("At the same fundamental frequency, what changes when more harmonics appear?","기본주파수가 같을 때 고조파가 더해지면 무엇이 달라질까요?"),change:q("Keep the pitch fixed and change the harmonic content.","기본주파수를 고정하고 고조파 구성을 바꾸세요."),observe:q("Compare waveform, spectrum and timbre.","시간 파형·스펙트럼·음색을 비교하세요."),explain:q("Explain why the pitch stays while the timbre changes.","음높이는 유지되면서 음색이 달라지는 이유를 설명하세요.")},
"a:chirp":{question:q("With the start frequency and duration fixed, how does increasing the end frequency affect the chirp midpoint?","시작 주파수와 시간을 고정하면 끝 주파수를 높였을 때 처프 중간의 주파수는 어떻게 될까요?"),change:q("Keep the starting frequency and duration fixed; adjust only the ending frequency.","시작 주파수와 지속 시간을 고정한 뒤 끝 주파수만 조절해 보세요."),observe:q("Compare waveform spacing and instantaneous frequency.","파형 간격과 순간주파수를 비교하세요."),explain:q("Connect closer wave cycles to rising frequency.","파형 간격 감소와 주파수 증가를 연결하세요.")},
"a:helix":{question:q("What happens to the helix radius when the growth parameter changes sign?","증가·감쇠 계수의 부호를 바꾸면 나선의 반지름은 어떻게 될까요?"),change:q("Hold the rotation rate fixed; change the growth or decay parameter.","회전 속도는 고정하고 증가·감쇠 계수만 바꾸세요."),observe:q("Watch the radius expand or contract along time.","시간에 따른 나선 반지름의 확대·축소를 보세요."),explain:q("Link the exponential envelope to the projected waveform.","지수 포락선과 투영된 파형을 연결하세요.")},
"a:beats":{question:q("How does a larger difference between two nearby frequencies change beat speed?","두 가까운 주파수의 차이를 늘리면 맥놀이 속도는 어떻게 달라질까요?"),change:q("Keep one frequency fixed; vary the difference.","한 주파수를 고정하고 주파수 차이만 바꾸세요."),observe:q("Listen and count the slow amplitude pulses.","소리를 듣고 느린 진폭 변화의 횟수를 보세요."),explain:q("Relate beat frequency to the difference of two tones.","맥놀이 주파수와 두 정현파의 주파수 차이를 연결하세요.")},
"a:amfm":{question:q("How can you distinguish AM from FM by looking at the carrier waveform?","반송파 파형을 보고 AM과 FM을 어떻게 구분할까요?"),change:q("Compare AM and FM with the same message.","같은 정보 신호로 AM과 FM을 비교하세요."),observe:q("Look for amplitude-envelope changes versus cycle-spacing changes.","진폭 포락선 변화와 파형 간격 변화를 살펴보세요."),explain:q("Identify which carrier quantity carries the message.","정보가 반송파의 어떤 특성에 실리는지 설명하세요.")},
"a:sampling":{question:q("Why can a 1,500 Hz sine appear at 500 Hz when sampled at 2,000 samples/s?","1,500 Hz 정현파를 초당 2,000표본으로 샘플링하면 왜 500 Hz처럼 보일까요?"),change:q("Keep the sine at 1,500 Hz; change the sampling rate.","정현파를 1,500 Hz로 고정하고 샘플링 주파수를 바꾸세요."),observe:q("Compare the original tone, sample points and alias frequency.","원래 주파수·표본 위치·에일리어스 주파수를 비교하세요."),explain:q("Use the Nyquist boundary to explain the apparent frequency.","나이퀴스트 경계를 이용해 겉보기 주파수를 설명하세요.")},
"b:rc":{question:q("How does changing R or C affect which frequencies pass through an RC filter?","R 또는 C를 바꾸면 RC 필터가 통과시키는 주파수는 어떻게 달라질까요?"),change:q("Choose low-pass or high-pass and change one circuit parameter.","저역통과 또는 고역통과를 선택하고 회로 변수 하나를 조절하세요."),observe:q("Compare input/output and the cutoff response.","입출력 파형과 차단주파수 응답을 비교하세요."),explain:q("Connect the time constant to filtering behavior.","시정수와 필터 동작을 연결하세요.")},
"b:moving-average":{question:q("Why does a longer moving-average window smooth noise but delay changes?","이동평균 구간을 길게 하면 잡음은 줄지만 변화가 늦어지는 이유는 무엇일까요?"),change:q("Keep the sensor input; increase the averaging window.","센서 입력을 유지하고 평균 구간만 늘리세요."),observe:q("Compare noise variation and output timing.","잡음 변동과 출력의 시간 위치를 비교하세요."),explain:q("Relate averaging more samples to smoothness and delay.","평균에 쓰는 표본 수와 평활화·지연을 연결하세요.")},
"b:compare":{question:q("With matched cutoff and the same input, how do RC and moving-average outputs differ?","차단주파수와 입력이 같을 때 RC와 이동평균의 출력은 어떻게 다를까요?"),change:q("Keep the input and cutoff matched; compare the two filters.","입력과 차단주파수를 같게 유지해 두 필터를 비교하세요."),observe:q("Look at noise reduction, lag and step response.","잡음 감소·지연·계단응답을 살펴보세요."),explain:q("Explain the tradeoff using the measured outputs.","관찰한 출력으로 두 필터의 장단점을 설명하세요.")},
"c:samples":{question:q("Which frequencies are hidden in a sampled signal, and what changes when fs is known?","표본 신호 속에는 어떤 주파수가 숨어 있으며 샘플링 주파수를 알면 무엇이 달라질까요?"),change:q("Start with one sinusoid, then add another; switch fs information on/off.","정현파 하나에서 시작해 두 개로 늘리고 fs 정보 유무를 바꾸세요."),observe:q("Find FFT peaks in bins and, when possible, in Hz.","FFT 피크를 Bin으로 찾고 가능하면 Hz로 환산하세요."),explain:q("Distinguish sample index from physical frequency.","표본 인덱스와 실제 주파수를 구분해 설명하세요.")},
"c:resolution":{question:q("Why can two close frequencies be hard to separate in an FFT?","가까운 두 주파수를 FFT에서 구분하기 어려운 이유는 무엇일까요?"),change:q("Compare record lengths while keeping the tones fixed.","신호 주파수를 고정하고 관측 길이를 바꾸세요."),observe:q("Check whether two peaks become distinguishable.","두 피크가 분리되어 보이는지 확인하세요."),explain:q("Connect observation time to frequency resolution.","관측 시간과 주파수 분해능을 연결하세요.")},
"c:algorithm":{question:q("How can FFT compute the same spectrum as DFT with fewer operations?","FFT는 어떻게 DFT와 같은 스펙트럼을 더 적은 연산으로 구할까요?"),change:q("Keep the input samples identical; compare DFT with FFT.","입력 표본을 동일하게 두고 DFT와 FFT를 비교하세요."),observe:q("Verify matching spectral values before opening butterfly steps.","Butterfly를 보기 전에 스펙트럼 값이 일치하는지 보세요."),explain:q("Describe reuse of smaller computations, not a different transform.","다른 변환이 아니라 작은 계산을 재사용한다는 점을 설명하세요.")},
"c:dtmf":{question:q("Can two FFT peaks identify a hidden telephone keypad button?","FFT 피크 두 개만으로 숨겨진 전화 버튼을 알아낼 수 있을까요?"),change:q("Try one keypad tone, then a second tone.","전화 버튼 소리 하나를 분석한 뒤 다른 소리를 선택하세요."),observe:q("Find the low-group and high-group frequency peaks.","낮은 주파수군과 높은 주파수군의 피크를 찾으세요."),explain:q("Match the peak pair to the keypad row and column.","두 피크를 버튼의 행·열에 연결하세요.")},
"c:fingerprint":{question:q("Why do sounds with a similar pitch have different spectral fingerprints?","음높이가 비슷한 소리도 FFT 지문이 다른 이유는 무엇일까요?"),change:q("Compare two sounds with different harmonic mixtures.","고조파 구성이 다른 소리 두 개를 비교하세요."),observe:q("Compare relative positions and heights of FFT peaks.","FFT 피크의 위치와 상대적인 높이를 비교하세요."),explain:q("Use harmonic patterns as evidence for sound identity.","고조파 패턴이 소리 구별의 근거가 되는 이유를 설명하세요.")},
"c:upload":{question:q("How do you turn real audio or sensor samples into interpretable frequency values?","실제 음성·센서 표본을 어떻게 의미 있는 주파수 정보로 바꿀까요?"),change:q("Start with an example or upload data; provide fs if known.","예제 또는 업로드 데이터에서 시작해 알고 있는 fs를 입력하세요."),observe:q("Compare peak bins and corresponding physical Hz.","피크 Bin과 대응되는 실제 Hz를 비교하세요."),explain:q("State what can and cannot be inferred without fs.","fs가 없으면 알 수 있는 것과 알 수 없는 것을 구분하세요.")},
"c:image":{question:q("Where does a repeated stripe pattern appear in a 2D FFT spectrum?","반복되는 줄무늬는 2D FFT 스펙트럼의 어디에 나타날까요?"),change:q("Change stripe spacing or direction in the example image.","예제 영상에서 줄무늬 간격이나 방향을 바꾸세요."),observe:q("Locate symmetric frequency peaks and inspect the reconstructed image.","대칭 주파수 피크와 복원 영상을 살펴보세요."),explain:q("Connect spatial repetition to spectrum peaks.","공간적 반복과 스펙트럼 피크의 관계를 설명하세요.")},
"c:stft":{question:q("Why can a single FFT hide when a chirp's frequency changes?","처프의 주파수가 바뀌는 시점을 전체 FFT 하나로 알기 어려운 이유는 무엇일까요?"),change:q("Compare the full-window FFT with a shorter sliding window.","전체 FFT와 짧은 이동 구간 분석을 비교하세요."),observe:q("Locate frequencies over time in the spectrogram.","스펙트로그램에서 시간별 주파수 위치를 찾으세요."),explain:q("Explain how short-time analysis adds time localization.","짧은 구간 분석이 시간 정보를 더하는 이유를 설명하세요.")},
"d:audio":{question:q("Which sound frequencies survive the digital filter you designed?","직접 설정한 디지털 필터를 통과한 후 어떤 소리 주파수가 남을까요?"),change:q("Use Step 2 to change the filter; keep the same input.","2번에서 필터를 바꾸고 입력은 유지하세요."),observe:q("Use Step 3A spectra, Step 3B waveforms and listening.","3A 스펙트럼·3B 파형·청취 결과를 비교하세요."),explain:q("Connect H to the differences between input and output.","필터 H와 입출력 차이를 연결하세요.")},
"d:radar":{question:q("How can matching a delayed chirp reveal the distance to a hidden target?","지연된 처프를 비교하면 보이지 않는 물체까지의 거리를 어떻게 알 수 있을까요?"),change:q("Use Step 2 to set target distance and noise.","2번에서 목표물 거리와 잡음을 설정하세요."),observe:q("In Step 3A align the template; in 3B locate the correlation peak.","3A에서 기준 신호를 정렬하고 3B에서 상관 피크를 찾으세요."),explain:q("Convert the round-trip delay to distance using wave speed.","왕복 지연과 전파 속도로 거리를 계산해 설명하세요.")}
};
function findKey(){
 const page=location.pathname.split("/").pop(),lab=new URLSearchParams(location.search).get("lab");
 if(page==="applications-lab.html"&&lab)return "a:"+lab;
 if(page==="applications-system-lab.html"&&lab)return "b:"+lab;
 const fixed={
  "applications-system-compare.html":"b:compare",
  "applications-fft-lab.html":"c:samples",
  "applications-fft-resolution.html":"c:resolution",
  "applications-dft-fft.html":"c:algorithm",
  "applications-fft-dtmf.html":"c:dtmf",
  "applications-fft-sound-fingerprint.html":"c:fingerprint",
  "applications-fft-upload.html":"c:upload",
  "applications-fft-image.html":"c:image",
  "applications-chirp-stft.html":"c:stft",
  "applications-audio-filter.html":"d:audio",
  "applications-chirp-echo.html":"d:radar"
 };
 return fixed[page]||null;
}
const key=findKey(),data=guides[key];if(!data)return;
const main=document.querySelector("main");if(!main)return;
const lang=window.ELSLanguage;
function mode(){const v=lang?.get?.()||document.documentElement.dataset.elsLanguage||"mixed";return ["en","ko","mixed"].includes(v)?v:"mixed"}
function pairText(x){const m=mode();return m==="en"?x.en:m==="ko"?x.ko:x.en+"\n"+x.ko}
function node(tag,cls){const e=document.createElement(tag);if(cls)e.className=cls;return e}
const guide=node("section","ss-focus-guide");guide.id="ss-app-focus-guide";guide.dataset.lab=key;guide.setAttribute("aria-label","Single discovery question");
const head=node("div","ss-focus-head"),name=node("span","ss-focus-eyebrow"),question=node("p","ss-focus-question");
question.id="ss-app-focus-question";head.append(name,question);guide.append(head);
const steps=node("div","ss-focus-steps");
const labels=[q("Change","조절"),q("Observe","관찰"),q("Explain","설명")];
for(const [i,k] of ["change","observe","explain"].entries()){
 const item=node("div","ss-focus-step"),label=node("strong","ss-focus-label"),description=node("span","ss-focus-description");
 const number=node("span","ss-focus-index");number.textContent=String(i+1);
 label.dataset.stepLabel=String(i);
 description.dataset.stepField=k;item.append(number,label,description);steps.append(item);
}
guide.append(steps);
// Place the single question AFTER the lab title, before controls/results.
const intro=[...main.children].find(el=>el.matches("h1")||el.querySelector("h1"));
const anchor=main.querySelector(":scope > .d-steps")||intro;
if(anchor?.parentElement===main)anchor.insertAdjacentElement("afterend",guide);
else main.insertBefore(guide,main.firstElementChild);
function render(){
 const m=mode();
 name.textContent=pairText(q("ONE DISCOVERY QUESTION","핵심 발견 질문 하나"));
 question.textContent=pairText(data.question);
 guide.setAttribute("aria-label",pairText(q("One discovery question and how to investigate","핵심 발견 질문과 실험 방법")));
 guide.querySelectorAll("[data-step-label]").forEach((e,i)=>e.textContent=pairText(labels[i]));
 guide.querySelectorAll("[data-step-field]").forEach(e=>e.textContent=pairText(data[e.dataset.stepField]));
 guide.dataset.mode=m;
}
render();
lang?.subscribe?.(render);
// When the host framework changes language directly, refresh only this independent summary.
window.addEventListener("els:languagechange",render);
window.SSAppFocusGuide=Object.freeze({key,question:data.question,render,covered:Object.freeze(Object.keys(guides))});
})();