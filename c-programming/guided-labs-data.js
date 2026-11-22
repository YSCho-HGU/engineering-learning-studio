/* Guided practice is an intermediate step between concept review and independent coding.
   Each lab reuses the chapter's existing complete C example; no simulated compiler claims. */
window.CGuidedLabSpecs={
 arrays:[
  {step:2,en:"Index and bounds",ko:"첨자와 범위",taskEn:"Change the array values without changing its length. Predict the displayed element before compiling.",taskKo:"배열 길이를 유지한 채 원소 값을 바꾸고 출력 원소를 먼저 예측하세요.",checkEn:"Explain which indices are valid and why.",checkKo:"유효한 첨자 범위와 이유를 설명하세요."},
  {step:5,en:"Frequency table",ko:"빈도표 작성",taskEn:"Change one input value and predict which frequency count changes.",taskKo:"입력값 하나를 바꾸고 빈도표의 어떤 값이 바뀌는지 예측하세요.",checkEn:"Compare your table with the compiled program.",checkKo:"실제 프로그램의 빈도표와 비교하세요."}
 ],
 strings:[
  {step:2,en:"Null terminator",ko:"널 종료 문자",taskEn:"Change the text length and adjust the declared array capacity to include '\\0'.",taskKo:"문자열 길이를 바꾸고 '\\0' 공간을 포함하도록 배열 크기를 조정하세요.",checkEn:"Explain strlen versus storage capacity.",checkKo:"strlen 결과와 저장 공간 크기의 차이를 설명하세요."},
  {step:6,en:"Input buffer",ko:"입력 버퍼",taskEn:"Change the buffer capacity and test an input that reaches its limit.",taskKo:"버퍼 크기를 바꾸고 경계 길이의 입력을 시험하세요.",checkEn:"Identify when a full line is not read.",checkKo:"한 줄 전체를 읽지 못하는 조건을 확인하세요."}
 ],
 "standard-library":[
  {step:2,en:"sqrt arguments",ko:"sqrt 인수",taskEn:"Change the numeric input, predict the result, then compile with the math library when required.",taskKo:"입력값을 변경하고 결과를 예측한 다음 필요한 경우 수학 라이브러리와 링크하여 실행하세요.",checkEn:"Explain the function argument and return type.",checkKo:"함수의 인수와 반환형을 설명하세요."},
  {step:4,en:"Character functions",ko:"문자 처리 함수",taskEn:"Change the input character and check the classification or conversion result.",taskKo:"입력 문자를 바꾸고 분류 또는 변환 결과를 비교하세요.",checkEn:"Explain the expected result for a non-letter.",checkKo:"영문자가 아닌 입력의 결과를 설명하세요."}
 ],
 functions:[
  {step:3,en:"Arguments and parameters",ko:"인수와 매개변수",taskEn:"Change an argument in main() and trace the parameter value inside the called function.",taskKo:"main()의 인수를 변경하고 호출된 함수의 매개변수 값을 추적하세요.",checkEn:"Explain why the caller's variable does or does not change.",checkKo:"호출자 변수가 변경되는지와 그 이유를 설명하세요."},
  {step:7,en:"Array function parameter",ko:"배열 매개변수",taskEn:"Change array elements, call the existing function, and predict the returned result.",taskKo:"배열 원소를 바꾸고 기존 함수를 호출하여 반환값을 예측하세요.",checkEn:"Explain what size information the function needs.",checkKo:"함수에 배열 크기 정보가 필요한 이유를 설명하세요."}
 ],
 pointer:[
  {step:2,en:"Address and dereference",ko:"주소와 역참조",taskEn:"Change x and predict both direct and indirect reads; do not assume a fixed numeric address.",taskKo:"x를 변경한 뒤 직접 읽기와 역참조 결과를 예측하세요. 실제 주소 숫자는 가정하지 마세요.",checkEn:"Explain p versus *p.",checkKo:"p와 *p를 구분하여 설명하세요."},
  {step:4,en:"Swap through addresses",ko:"주소를 통한 값 교환",taskEn:"Change the caller values and trace temp, *a and *b through swap().",taskKo:"호출자 값을 변경하고 swap()의 temp, *a, *b를 순서대로 추적하세요.",checkEn:"Explain C pass-by-value for copied addresses.",checkKo:"주소값의 복사라는 C의 값 전달 원리를 설명하세요."}
 ],
 structure:[
  {step:3,en:"Dot and arrow",ko:"점과 화살표 연산자",taskEn:"Change a record member using the struct object and then via a pointer; predict the final value.",taskKo:"구조체 객체와 그 포인터를 이용해 멤버 값을 수정하고 최종 값을 예측하세요.",checkEn:"Explain s.member versus ps->member.",checkKo:"s.member와 ps->member의 차이를 설명하세요."},
  {step:4,en:"Array of records",ko:"구조체 배열",taskEn:"Change one student's score in the record array and predict the aggregate or selected result.",taskKo:"구조체 배열에서 학생 한 명의 점수를 바꾸고 계산 결과를 예측하세요.",checkEn:"Explain how the record index and member access work together.",checkKo:"배열 첨자와 멤버 접근이 함께 사용되는 이유를 설명하세요."}
 ],
 "dynamic-memory":[
  {step:2,en:"Allocate and check",ko:"할당과 실패 검사",taskEn:"Change n, adjust malloc(n * sizeof *p), and keep the NULL check before using p.",taskKo:"n을 바꾸고 malloc(n * sizeof *p)를 확인하며 사용 전 NULL 검사를 유지하세요.",checkEn:"Explain why allocated elements need initialization.",checkKo:"할당한 원소를 초기화해야 하는 이유를 설명하세요."},
  {step:4,en:"Release safely",ko:"안전한 해제",taskEn:"Trace the program before and after free(); never read the released allocation.",taskKo:"free() 전후 상태를 추적하고 해제된 메모리를 읽지 마세요.",checkEn:"Explain why free(p) does not set p to NULL.",checkKo:"free(p)로 p 자체가 NULL이 되지 않는 이유를 설명하세요."}
 ]
};