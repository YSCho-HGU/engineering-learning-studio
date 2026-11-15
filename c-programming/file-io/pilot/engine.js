/* File I/O Learning Pilot v2 — deterministic, pedagogical simulation.
   No network, file access, or execution of student C. Browser + Node compatible. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.FileIOPilot = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const initialFile = "25.0\n26.5\n";
  const fileName = "readings.txt";
  const sampleData = Object.freeze({
    normal: { name: "정상 입력", content: "10\n20\n30\n", hint: "모든 항목은 정수입니다." },
    malformed: { name: "형식 불일치", content: "10\nABC\n30\n", hint: "두 번째 항목이 정수인지 확인하세요." },
    empty: { name: "빈 파일", content: "", hint: "처음부터 아무 데이터가 없습니다." },
    ioError: { name: "강제 읽기 오류", content: "10\n20\n30\n", hint: "첫 번째 읽기는 성공하고 두 번째 호출에서 가상 I/O 오류를 주입합니다." }
  });
  const clone = x => JSON.parse(JSON.stringify(x));
  function createM3() {
    return { fs: { "lab/readings.txt": initialFile }, cwd: "lab", mode: "r",
      phase: "idle", pos: 0, stdout: "", eof: false, status: "Ready",
      returnValue: "-", active: null, events: [], exitCode: null, openedPath: null };
  }
  function m3File(state) {
    const path = state.cwd + "/" + fileName;
    return { path: "virtual/" + path, exists: Object.prototype.hasOwnProperty.call(state.fs, path),
      content: state.fs[path] ?? null };
  }
  function m3Log(s, key, detail) {
    s.events.push({ id: s.events.length + 1, code: key, detail });
    s.active = key;
  }
  function m3Open(s, mode, cwd) {
    if (s.phase === "open" || s.phase === "readDone" || s.phase === "writeDone") return false;
    if (!["r", "w", "a"].includes(mode) || !["lab", "other"].includes(cwd)) return false;
    s.mode=mode; s.cwd=cwd; s.pos=0; s.stdout=""; s.eof=false; s.returnValue="-";
    s.events=[]; s.exitCode=null;
    const path=cwd+"/"+fileName;
    s.openedPath=path;
    if (mode==="r" && !Object.prototype.hasOwnProperty.call(s.fs,path)) {
      s.phase="failed"; s.status="fopen() → NULL (no such file in this virtual directory)";
      s.returnValue="NULL"; s.exitCode=1; m3Log(s,"openFail","읽기용 파일이 없으므로 fopen은 NULL을 반환합니다. 파일 읽기와 fclose는 실행하지 않습니다.");
      return true;
    }
    if (mode==="w") s.fs[path]="";
    if (mode==="a" && !Object.prototype.hasOwnProperty.call(s.fs,path)) s.fs[path]="";
    s.phase="open"; s.pos=mode==="a" ? s.fs[path].length:0;
    s.status="OPEN ("+mode+")";s.returnValue="non-NULL FILE *";
    m3Log(s,"open","fopen 성공. "+(mode==="w"?"기존 내용을 삭제합니다.":mode==="a"?"파일 끝에 기록할 준비를 합니다.":"첫 줄부터 읽을 준비를 합니다."));
    return true;
  }
  function m3Read(s) {
    if (s.phase!=="open" || s.mode!=="r") return false;
    const src=s.fs[s.openedPath];
    if(s.pos>=src.length){
      s.eof=true;s.returnValue="NULL";s.phase="readDone";
      s.status="READ COMPLETE (EOF)";
      m3Log(s,"read","fgets()가 NULL을 반환합니다. while 조건이 거짓이므로 fputs() 없이 fclose()로 진행합니다.");
      return true;
    }
    const endNewline=src.indexOf("\n",s.pos);
    const until=endNewline<0?src.length:endNewline+1;
    const end=Math.min(s.pos+79,until);
    const line=src.slice(s.pos,end);
    s.pos=end;s.stdout+=line;s.returnValue="non-NULL char *";s.eof=false;
    m3Log(s,"read","fgets 성공 → while 본문의 fputs(line, stdout)가 자동 실행됩니다: "+JSON.stringify(line));
    return true;
  }
  function m3Write(s) {
    if(s.phase!=="open" || (s.mode!=="w" && s.mode!=="a")) return false;
    const chars="27.2\n";
    s.fs[s.openedPath]+=chars;s.pos=s.fs[s.openedPath].length;
    s.phase="writeDone";s.returnValue=String(chars.length)+" chars";s.status="WRITE COMPLETE";
    m3Log(s,"write","fprintf가 27.2와 줄바꿈을 파일에 기록했습니다.");
    return true;
  }
  function m3Close(s) {
    if(!["readDone","writeDone"].includes(s.phase)) return false;
    s.phase="closed";s.status="CLOSED";s.returnValue="0";s.exitCode=0;
    m3Log(s,"close","fclose() 성공(반환값 0). File 내용은 유지됩니다.");
    return true;
  }
  function m3Restart(s) {
    s.phase="idle";s.pos=0;s.stdout="";s.eof=false;s.returnValue="-";s.active=null;
    s.exitCode=null;s.openedPath=null;s.events=[];s.status="프로그램 재시작: 파일 내용 보존";
  }
  function m3Reset(s) {
    const fresh=createM3();Object.keys(s).forEach(k=>delete s[k]);Object.assign(s,fresh);
    s.status="실습 샘플 복원: lab/readings.txt 초기값 복구";
  }
  function m3Next(s) {
    if(s.phase==="idle" || s.phase==="closed" || s.phase==="failed") return "open";
    if(s.phase==="open") return s.mode==="r"?"read":"write";
    if(s.phase==="readDone"||s.phase==="writeDone") return "close";
    return null;
  }
  function createM4(scenario="normal") {
    if(!sampleData[scenario]) scenario="normal";
    return { scenario, input:sampleData[scenario].content, phase:"idle",pos:0,attempt:0,
      stdout:"",returnValue:"-",lastValue:"-",feof:0,ferror:0,
      status:"Ready",active:null,events:[],exitCode:null };
  }
  function m4Log(s,key,detail) {s.active=key;s.events.push({id:s.events.length+1,code:key,detail});}
  function m4Open(s) {
    if(s.phase!=="idle") return false;
    s.phase="reading";s.status="OPEN (r)";s.active="open";
    m4Log(s,"open","파일을 읽기 모드로 열었습니다. 아직 EOF 여부는 알 수 없습니다.");
    return true;
  }
  function m4Read(s) {
    if(s.phase!=="reading") return false;
    s.attempt++;
    if(s.scenario==="ioError" && s.attempt===2) {
      s.ferror=1;s.feof=0;s.returnValue="EOF";s.phase="done";
      m4Log(s,"read","강제 읽기 오류: fscanf가 EOF를 반환하고 ferror(fp)=1. 실제 OS 오류 재현이 아닌 교육용 fault injection입니다.");
      return true;
    }
    const rest=s.input.slice(s.pos);
    const ws=(rest.match(/^\s*/)||[""])[0];
    s.pos+=ws.length;
    if(s.pos>=s.input.length) {
      s.feof=1;s.returnValue="EOF";s.phase="done";
      m4Log(s,"read","입력할 문자가 없어 fscanf가 EOF를 반환합니다. feof(fp)=1.");
      return true;
    }
    const rem=s.input.slice(s.pos);
    const match=rem.match(/^[+-]?\d+/);
    if(!match) {
      s.returnValue="0";s.phase="done";s.feof=0;
      m4Log(s,"read","정수 변환에 실패해 반환값 0. 읽지 못한 토큰은 남아 있고 feof(fp)=0입니다.");
      return true;
    }
    const num=Number(match[0]);
    s.pos+=match[0].length;
    s.returnValue="1";s.lastValue=String(num);s.stdout+=String(num)+"\n";
    m4Log(s,"read","fscanf 반환값 1 → while 본문 printf 실행: "+num);
    return true;
  }
  function m4Close(s) {
    if(s.phase!=="done") return false;
    s.phase="closed";s.status="CLOSED";
    const classification = s.ferror?"I/O ERROR":s.feof?"CLEAN EOF":"MATCHING FAILURE";
    s.exitCode=s.ferror||!s.feof?1:0;
    m4Log(s,"diagnose","ferror="+s.ferror+", feof="+s.feof+" → "+classification+"; fclose 실행; exit "+s.exitCode);
    return true;
  }
  function m4Next(s){if(s.phase==="idle")return "open";if(s.phase==="reading")return "read";if(s.phase==="done")return "close";return null;}
  const m4ResultKind=s=>s.ferror?"ioError":s.feof?"eof":s.phase==="done"||s.phase==="closed"?"mismatch":"pending";
  return { initialFile, sampleData:clone(sampleData), createM3,m3File,m3Open,m3Read,m3Write,m3Close,m3Restart,m3Reset,m3Next,
    createM4,m4Open,m4Read,m4Close,m4Next,m4ResultKind };
});
