/* Supplemental first-year scaffolding; guidance never replaces student C source. */
(function(){"use strict";
const make=(ko,en,stepsKo,stepsEn,checkKo,checkEn)=>({
 ko:{scene:ko,steps:stepsKo,check:checkKo},
 en:{scene:en,steps:stepsEn,check:checkEn}
});
window.C_PRACTICE_GUIDES=window.C_PRACTICE_GUIDES||{};
window.C_PRACTICE_GUIDES["low-level-c"]=[
 make("상태 byte에서 READY, ERROR, ALARM 비트가 각각 켜졌는지 구별합니다.",
      "Inspect READY, ERROR and ALARM bits in one byte.",
      ["#define의 bit 위치를 확인하세요.","status & MASK의 결과가 0인지 검사하세요.","각 상태를 0 또는 1로 출력하세요."],
      ["Identify each named mask bit.","Use status & MASK to test a flag.","Print each result as 0 or 1."],
      "17 = 00010001이므로 READY=1, ERROR=0, ALARM=1입니다.",
      "17 is 00010001: READY=1, ERROR=0, ALARM=1."),
 make("8-bit 값에서 하나의 bit만 조작하는 세 함수입니다.",
      "Write three functions that modify one bit in an 8-bit value.",
      ["1u << k로 마스크를 만드세요.","set: |, clear: & ~, toggle: ^를 사용하세요.","다른 비트가 그대로인지 테스트하세요."],
      ["Build a mask using 1u << k.","Use | for set, &~ for clear, ^ for toggle.","Verify unrelated bits are preserved."],
      "4에서 bit1 set → 6, bit2 clear → 2, bit0 toggle → 3입니다.",
      "Start at 4: set bit1 → 6, clear bit2 → 2, toggle bit0 → 3."),
 make("상태 byte를 enum으로 변환한 다음 switch로 출력합니다.",
      "Decode an input byte into enum state and display it with switch.",
      ["ERROR나 ALARM을 READY보다 먼저 검사하세요.","READY이면 RUNNING으로 설정하세요.","아니면 IDLE을 반환하세요."],
      ["Test ERROR or ALARM before READY.","Return RUNNING when READY is set.","Return IDLE otherwise."],
      "0x11에는 READY와 ALARM이 있으므로 ERROR_STATE가 우선합니다.",
      "0x11 has READY and ALARM, so ERROR_STATE takes priority."),
 make("작동하는 기능을 여러 C 소스 파일로 구성합니다.",
      "Split a small program into header, implementation and caller.",
      ["status.h에 include guard와 선언을 정의하세요.","status.c에 status_decode()의 정의를 작성하세요.","main.c와 status.c를 함께 GCC로 컴파일하세요."],
      ["Put include guards and prototypes in status.h.","Define status_decode() in status.c.","Compile main.c and status.c together using GCC."],
      "gcc -std=c11 -Wall -Wextra -Wpedantic main.c status.c -o sensor",
      "Compile with: gcc -std=c11 -Wall -Wextra -Wpedantic main.c status.c -o sensor."),
 make("함수가 세 번 호출되어도 static 지역변수가 자신의 값을 유지하는지 확인합니다.",
      "Observe a static local retaining its value across three calls.",
      ["static int 변수의 초기값을 1000으로 설정하세요.","호출마다 증가시킨 값을 반환하세요.","3번의 출력값을 예상한 뒤 컴파일하세요."],
      ["Initialize a static int to 1000.","Increment once per call and return.","Predict three outputs and compile."],
      "1001, 1002, 1003이 차례로 출력됩니다.",
      "Expect 1001, 1002, 1003."),
 make("실행 시 파일명을 argv[1]로 전달하고 안전하게 숫자 데이터를 읽습니다.",
      "Accept a file path through argv[1] and read numeric samples.",
      ["argc가 정확히 2인지 검사하세요.","fopen 실패를 검사하고, fscanf의 반환값이 1인 동안 반복하세요.","fclose 후 숫자 개수를 출력하세요."],
      ["Require exactly two command-line arguments.","Check fopen and loop while fscanf returns 1.","Close the stream and print the count."],
      "data.txt에 숫자 3개가 있으면 count = 3입니다. 파일 경로가 없을 때도 검사하세요.",
      "With three numbers in data.txt, count = 3. Also test a missing file.")
];
const intro=document.querySelector(".hero p");
const update=()=>{if(intro)intro.textContent=window.ELSLanguage?.get()==="en"?
"Implement status flags, bit masks, enum state machines, modules, static locals and argc/argv. Drafts stay in this browser.":
"상태 플래그, bit mask, enum, 다중 소스 파일, static, argc/argv를 직접 구현합니다. 편집기 초안은 이 브라우저에만 저장됩니다.";};
window.ELSLanguage?.subscribe(update);
update();
})();