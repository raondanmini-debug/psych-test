import { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

function getParam(key) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

const SCREENS = {
  INTRO: "intro", PART0: "part0", PART1: "part1",
  EMAIL: "email", LOADING: "loading", FREE_RESULT: "free_result",
  PAID_RESULT: "paid_result", ADMIN: "admin",
};

const PART0_Qs = [
  { text: "우리 집에서는 감정을 자유롭게 표현할 수 있는 분위기였다", reverse: true },
  { text: "부모님이 자주 다투셨다", reverse: false },
  { text: "나는 집에서 있는 그대로의 나로 있을 수 있었다", reverse: true },
  { text: "부모님 사이의 관계가 안정적이라고 느꼈다", reverse: true },
  { text: "어릴 때 스스로 결정할 수 있는 것들이 충분히 있었다", reverse: true },
];

const DIMS = [
  { id: "d1", name: "방어기제", icon: "🛡️", color: "#CE93D8", label: "A그룹", qs: ["불편한 감정이 생기면 '그럴 수도 있지'로 넘기거나 논리적으로 설명하며 덮어버리는 편이다","내가 얼마나 상처받았는지 한참 지나서야 알아차리는 경우가 많다","힘든 상황이 생기면 '없던 일로 하자'며 피하거나 외면하는 편이다","속으로는 힘들어도 겉으로는 괜찮은 척, 밝은 척을 습관적으로 하는 편이다"] },
  { id: "d2", name: "애착유형", icon: "💞", color: "#F48FB1", label: "B그룹", qs: ["안정적으로 잘 대해주는 사람보다 불규칙하게 나를 설레게 하는 사람에게 더 끌리는 경향이 있다","상대가 날 떠날까봐 자주 불안하다. 또는 반대로 관계가 가까워질수록 도망치고 싶어진다","나에게 진심으로 잘 대해주는 사람이 오히려 의심스럽거나 어색하게 느껴진다","사람들이 너무 가까이 다가오면 불편해서 거리를 두고 싶어진다"] },
  { id: "d3", name: "인지왜곡", icon: "🧩", color: "#80DEEA", label: "C그룹", qs: ["한 번 실패하거나 거절당하면 '나는 원래 이런 사람이야'로 확대 해석하는 경향이 있다","칭찬을 받아도 자연스럽게 받아들이기 어렵고 의심되거나 불편하다","내 생각·감정·외모·행동 등 작은 부분까지 과도하게 비판하는 편이다","내 자존감은 주로 다른 사람이 나를 어떻게 생각하느냐에 달려 있다"] },
  { id: "d4", name: "회복탄력성", icon: "⚡", color: "#A5D6A7", label: "D그룹", qs: ["힘든 일이 있을 때 '어떻게 하면 나아질까'보다 '왜 나한테 이런 일이'에 더 오래 머문다","기분 상태가 바뀌면 하던 계획이나 루틴이 완전히 무너지는 경우가 많다","새로운 것을 시도하기 전에 '잘 못하면 어떡하지'라는 두려움이 먼저 온다","감정이 격해지면 차분하게 생각하는 것이 매우 어렵다"] },
  { id: "d5", name: "신체신호", icon: "🫀", color: "#FFAB91", label: "E그룹", qs: ["특정 가족과 대화하거나 연락받은 후 몸이 긴장되거나 피로감, 두통 등이 나타난다","누군가 나에게 불만이 있을 것 같으면 마음속에서 쉽게 털어내지 못한다","비판이나 지적을 받으면 감정적으로 강하게 반응하는 편이다","상처받거나 배신당한 감정을 오래 품고 있는 편이다"] },
  { id: "d6", name: "과도한통제", icon: "🎯", color: "#FFD54F", label: "F그룹", qs: ["내가 충분히 노력하면 대부분의 문제를 해결할 수 있다고 믿어서 혼자 다 짊어지는 편이다","내가 나서지 않으면 일이 잘못될 것 같아 남에게 맡기거나 의지하는 것이 어렵다","모든 것이 내 통제 범위 안에 있을 때만 비로소 마음이 놓인다","타인의 문제를 해결해주고 싶은 충동을 자주 느끼고 실제로 나서는 편이다"] },
  { id: "d7", name: "자책죄책감", icon: "🔗", color: "#EF9A9A", label: "G그룹", qs: ["가족 중 누군가가 화내거나 기분이 나쁠 때, 그것이 어쩐지 내 탓인 것 같다는 생각이 든다","가족 안에서 생긴 문제를 내가 해결해야 한다는 부담을 느꼈거나 느낀다","가족을 위해 더 해야 했는데 못 했다는 죄책감이 자주 올라온다","가족의 기대에 부응하지 못할 때 지나치게 자책하는 편이다"] },
];

const OPTS = [
  { label: "거의 없다", value: 1 },{ label: "가끔 그렇다", value: 2 },{ label: "종종 그렇다", value: 3 },{ label: "자주 그렇다", value: 4 },{ label: "항상 그렇다", value: 5 },
];
const P0_OPTS = [
  { label: "전혀 아니다", value: 1 },{ label: "아니다", value: 2 },{ label: "보통이다", value: 3 },{ label: "그렇다", value: 4 },{ label: "매우 그렇다", value: 5 },
];

function getType(total) {
  if (total <= 70) return { type: "초록불", color: "#66BB6A", bg: "rgba(46,125,50,0.15)", border: "#388E3C", emoji: "🟢", detail: "경제 독립 집중형" };
  if (total <= 105) return { type: "노란불", color: "#FFA726", bg: "rgba(230,81,0,0.15)", border: "#E65100", emoji: "🟡", detail: "경계선 회복형" };
  return { type: "빨간불", color: "#EF5350", bg: "rgba(183,28,28,0.15)", border: "#B71C1C", emoji: "🔴", detail: "자아 재건형" };
}
function getLev(score) {
  if (score <= 8) return { label: "낮음", color: "#66BB6A" };
  if (score <= 12) return { label: "보통", color: "#FFA726" };
  if (score <= 16) return { label: "높음", color: "#FF7043" };
  return { label: "매우 높음", color: "#EF5350" };
}
function calcScores(answers) {
  const dimScores = DIMS.map((dim) => ({ id: dim.id, name: dim.name, icon: dim.icon, color: dim.color, score: dim.qs.reduce((sum, _, qi) => sum + (answers[`${dim.id}_${qi}`] || 0), 0), max: dim.qs.length * 5 }));
  return { dimScores, total: dimScores.reduce((s, d) => s + d.score, 0) };
}

const S = {
  page: { minHeight: "100vh", background: "linear-gradient(155deg,#0D0020 0%,#1A0535 40%,#2D1060 100%)", fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden" },
  wrap: { width: "100%", maxWidth: "560px" },
  card: (a) => ({ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(206,147,216,0.2)", borderRadius: "20px", padding: "28px", marginBottom: "20px", transition: "all 0.3s ease", opacity: a ? 0 : 1, transform: a ? "translateY(8px)" : "translateY(0)" }),
  btn: (active, color="#CE93D8") => ({ background: active ? `rgba(${color==="#CE93D8"?"206,147,216":"255,255,255"},0.18)` : "rgba(255,255,255,0.04)", border: `1.5px solid ${active?color:"rgba(255,255,255,0.12)"}`, borderRadius: "12px", padding: "14px 18px", textAlign: "left", color: active?"#fff":"rgba(255,255,255,0.75)", fontSize: "14.5px", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "12px", width: "100%" }),
  circle: (active, color="#CE93D8") => ({ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${active?color:"rgba(255,255,255,0.3)"}`, background: active?color:"transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }),
  input: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(206,147,216,0.3)", borderRadius: "10px", padding: "13px 16px", color: "#fff", fontSize: "15px", outline: "none", boxSizing: "border-box" },
  tag: { background: "rgba(206,147,216,0.12)", border: "1px solid rgba(206,147,216,0.3)", borderRadius: "20px", padding: "6px 14px", fontSize: "13px", color: "rgba(255,255,255,0.8)" },
  primaryBtn: { width: "100%", background: "linear-gradient(135deg,#6A1B9A,#9C27B0)", border: "none", borderRadius: "14px", padding: "18px", fontSize: "16px", fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "0.5px" },
  ghostBtn: { width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "13px", color: "rgba(255,255,255,0.5)", fontSize: "13px", cursor: "pointer", marginTop: "12px" },
  progressBar: (pct, color="#CE93D8") => ({ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${color},#9C27B0)`, borderRadius: "2px", transition: "width 0.4s" }),
};

export default function PsychTest() {
  const [screen, setScreen] = useState(SCREENS.INTRO);
  const [p0Answers, setP0Answers] = useState({});
  const [p0Idx, setP0Idx] = useState(0);
  const [dimIdx, setDimIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");
  const [nick, setNick] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isAnim, setIsAnim] = useState(false);
  const [selOpt, setSelOpt] = useState(null);
  const [scores, setScores] = useState(null);
  const [aiLetter, setAiLetter] = useState("");
  const [hasPaid, setHasPaid] = useState(false);
  const isAdmin = getParam("admin") === "true";

  useEffect(() => {
    if (isAdmin) {
      const fs = calcScores(Object.fromEntries(DIMS.flatMap((d) => d.qs.map((_, qi) => [`${d.id}_${qi}`, 4]))));
      setScores(fs); setNick("관리자"); setAiLetter("관리자 미리보기"); setScreen(SCREENS.FREE_RESULT);
    }
  }, []);

  const totalQs = DIMS.reduce((a, d) => a + d.qs.length, 0);
  const answeredCount = Object.keys(answers).length;

  function animate(fn) { setIsAnim(true); setTimeout(() => { fn(); setIsAnim(false); setSelOpt(null); }, 280); }

  function goBack() {
    if (screen === SCREENS.PART0) { if (p0Idx > 0) { setP0Idx(p0Idx-1); setSelOpt(null); } else setScreen(SCREENS.INTRO); }
    else if (screen === SCREENS.PART1) { if (qIdx > 0) { setQIdx(qIdx-1); setSelOpt(null); } else if (dimIdx > 0) { setDimIdx(dimIdx-1); setQIdx(DIMS[dimIdx-1].qs.length-1); setSelOpt(null); } else { setScreen(SCREENS.PART0); setP0Idx(PART0_Qs.length-1); } }
    else if (screen === SCREENS.EMAIL) { setScreen(SCREENS.PART1); setDimIdx(DIMS.length-1); setQIdx(DIMS[DIMS.length-1].qs.length-1); }
  }

  function handleP0Select(val) {
    setSelOpt(val);
    setTimeout(() => { setP0Answers(prev => ({ ...prev, [`p0_${p0Idx}`]: val })); animate(() => { if (p0Idx < PART0_Qs.length-1) setP0Idx(p0Idx+1); else setScreen(SCREENS.PART1); }); }, 150);
  }

  function handleMainSelect(val) {
    setSelOpt(val);
    const key = `${DIMS[dimIdx].id}_${qIdx}`;
    setTimeout(() => { setAnswers(prev => ({ ...prev, [key]: val })); animate(() => { if (qIdx < DIMS[dimIdx].qs.length-1) setQIdx(qIdx+1); else if (dimIdx < DIMS.length-1) { setDimIdx(dimIdx+1); setQIdx(0); } else setScreen(SCREENS.EMAIL); }); }, 150);
  }

  async function handleSubmit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError("올바른 이메일 주소를 입력해주세요 (예: name@email.com)"); return; }
    setEmailError("");
    const s = calcScores(answers);
    setScores(s); setScreen(SCREENS.LOADING);
    const topDims = [...s.dimScores].sort((a,b) => b.score-a.score).slice(0,2);
    const typeInfo = getType(s.total);
    const prompt = `당신은 자기계발 콘텐츠 작가 라온단미입니다. 역기능 가족 환경에서 자란 사람을 위한 따뜻하고 정확한 맞춤 편지를 작성해주세요.\n\n테스트 결과:\n- 닉네임: ${nick||"당신"}\n- 전체 유형: ${typeInfo.type} (${typeInfo.detail}), 총점: ${s.total}/140\n- 가장 두드러진 패턴 2가지: ${topDims.map(d=>`${d.name} ${d.score}점`).join(", ")}\n\n작성 형식 (200자 내외, 편지체):\n1. 닉네임으로 시작\n2. 가장 높은 패턴 1~2가지를 구체적으로 언급 (단, 차원 이름은 쓰지 말고 행동/감정으로 표현)\n3. 그 패턴이 어디서 왔는지 따뜻하게 한 문장으로\n4. 오늘 바로 할 수 있는 아주 구체적인 행동 한 가지\n5. 응원 문장으로 마무리\n\n주의: 의학적 용어, 상담, 치료 등의 표현 사용 금지. 자기계발 코칭 톤으로.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      setAiLetter(data.content?.[0]?.text || "");
    } catch { setAiLetter(`${nick||"당신"}님, 테스트를 완료해주셨어요.\n\n결과를 바탕으로 맞춤 가이드레터를 준비하고 있습니다. 48시간 내로 이메일로 발송해드릴게요.\n\n당신의 오늘을 응원합니다. — 라온단미`); }
    setScreen(SCREENS.FREE_RESULT);
  }

  function handlePaidAccess() { setHasPaid(true); setScreen(SCREENS.PAID_RESULT); }
  const progress = screen === SCREENS.PART1 ? ((dimIdx*4+qIdx)/totalQs)*100 : screen === SCREENS.EMAIL ? 100 : 0;

  return (
    <div style={S.page}>
      <div style={{ position:"fixed", top:"-100px", right:"-100px", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(206,147,216,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-80px", left:"-80px", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,rgba(106,27,154,0.1) 0%,transparent 70%)", pointerEvents:"none" }} />
      <div style={S.wrap}>

        {screen === SCREENS.INTRO && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#CE93D8", textTransform:"uppercase", marginBottom:"14px" }}>라온단미 · 심리 독립 테스트</div>
            <h1 style={{ fontSize:"clamp(26px,5vw,34px)", fontWeight:900, lineHeight:1.15, marginBottom:"10px" }}>나의 심리 독립 지도<br /><span style={{ color:"#CE93D8" }}>정밀 진단</span></h1>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"15px", lineHeight:1.8, marginBottom:"28px" }}>7가지 패턴 분석으로 역기능 가족 환경이<br />지금의 나에게 남긴 것을 파악합니다</p>
            <div style={{ display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap", marginBottom:"32px" }}>
              {["⏱ 약 8분","📊 7가지 패턴","✅ 무료 결과 제공"].map(t => <span key={t} style={S.tag}>{t}</span>)}
            </div>
            <div style={{ ...S.card(false), textAlign:"left", marginBottom:"16px" }}>
              <div style={{ fontSize:"12px", color:"#CE93D8", letterSpacing:"2px", marginBottom:"10px" }}>구성</div>
              <div style={{ fontSize:"13.5px", color:"rgba(255,255,255,0.72)", lineHeight:1.9 }}>📌 파트 0 — 성장 환경 체크 (5문항, 어린 시절 기준)<br />📌 파트 1 — 현재 나의 패턴 분석 (28문항, 현재 기준)<br />📊 무료 결과 — 유형 + 7가지 패턴 점수<br />💎 심층 분석 — 상세 해설 + 맞춤 가이드레터 (유료)</div>
            </div>
            <div style={{ background:"rgba(255,200,0,0.07)", border:"1px solid rgba(255,200,0,0.2)", borderRadius:"12px", padding:"13px 16px", marginBottom:"24px", fontSize:"12.5px", color:"rgba(255,255,255,0.5)", textAlign:"left" }}>⚠️ 이 테스트는 자기계발 목적의 패턴 파악 도구이며, 전문적 심리치료를 대체하지 않습니다.</div>
            <button style={S.primaryBtn} onClick={() => setScreen(SCREENS.PART0)}>테스트 시작하기 →</button>
          </div>
        )}

        {screen === SCREENS.PART0 && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
              <button onClick={goBack} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"20px", padding:"0" }}>←</button>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                  <span style={{ fontSize:"12px", color:"#CE93D8", letterSpacing:"2px" }}>파트 0 · 성장 환경 체크</span>
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>{p0Idx+1} / {PART0_Qs.length}</span>
                </div>
                <div style={{ height:"4px", background:"rgba(255,255,255,0.1)", borderRadius:"2px" }}><div style={S.progressBar(((p0Idx+1)/PART0_Qs.length)*100)} /></div>
              </div>
            </div>
            <div style={S.card(isAnim)}>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", marginBottom:"14px" }}>어린 시절을 기준으로 답해주세요</div>
              <div style={{ fontSize:"clamp(16px,3.5vw,19px)", fontWeight:600, lineHeight:1.65 }}>{PART0_Qs[p0Idx].text}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
              {P0_OPTS.map(opt => <button key={opt.value} style={S.btn(selOpt===opt.value)} onClick={() => handleP0Select(opt.value)}><span style={S.circle(selOpt===opt.value)}>{selOpt===opt.value?"✓":""}</span>{opt.label}</button>)}
            </div>
          </div>
        )}

        {screen === SCREENS.PART1 && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
              <button onClick={goBack} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:"20px", padding:"0" }}>←</button>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                  <span style={{ fontSize:"12px", color:"#CE93D8", letterSpacing:"2px" }}>파트 1 · {DIMS[dimIdx].label}</span>
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>{answeredCount} / {totalQs}</span>
                </div>
                <div style={{ height:"4px", background:"rgba(255,255,255,0.1)", borderRadius:"2px" }}><div style={S.progressBar(progress, DIMS[dimIdx].color)} /></div>
              </div>
            </div>
            <div style={S.card(isAnim)}>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", marginBottom:"14px" }}>현재를 기준으로 솔직하게 답해주세요</div>
              <div style={{ fontSize:"clamp(16px,3.5vw,18.5px)", fontWeight:600, lineHeight:1.7 }}>{DIMS[dimIdx].qs[qIdx]}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
              {OPTS.map(opt => <button key={opt.value} style={S.btn(selOpt===opt.value, DIMS[dimIdx].color)} onClick={() => handleMainSelect(opt.value)}><span style={S.circle(selOpt===opt.value, DIMS[dimIdx].color)}>{selOpt===opt.value?"✓":""}</span>{opt.label}</button>)}
            </div>
            <div style={{ marginTop:"18px", display:"flex", gap:"6px" }}>
              {DIMS.map((d,i) => <div key={d.id} style={{ flex:1, height:"4px", borderRadius:"2px", background: i<dimIdx?d.color:i===dimIdx?`${d.color}66`:"rgba(255,255,255,0.1)", transition:"all 0.3s" }} />)}
            </div>
          </div>
        )}

        {screen === SCREENS.EMAIL && (
          <div style={{ textAlign:"center" }}>
            <button onClick={goBack} style={{ ...S.ghostBtn, width:"auto", padding:"8px 16px", marginBottom:"20px", marginTop:0 }}>← 이전 질문으로</button>
            <div style={{ fontSize:"42px", marginBottom:"14px" }}>✅</div>
            <h2 style={{ fontSize:"22px", fontWeight:800, marginBottom:"6px" }}>33문항 완료!</h2>
            <p style={{ color:"rgba(255,255,255,0.55)", marginBottom:"24px", lineHeight:1.7, fontSize:"14px" }}>이메일을 입력하면 무료 결과를 바로 확인하고<br />맞춤 가이드레터도 받을 수 있어요</p>
            <div style={{ textAlign:"left", display:"flex", flexDirection:"column", gap:"14px", marginBottom:"18px" }}>
              <div>
                <label style={{ fontSize:"13px", color:"#CE93D8", display:"block", marginBottom:"6px" }}>닉네임 (결과에 표시, 선택)</label>
                <input value={nick} onChange={e => setNick(e.target.value)} placeholder="예: 별빛, 익명" style={S.input} />
              </div>
              <div>
                <label style={{ fontSize:"13px", color:"#CE93D8", display:"block", marginBottom:"6px" }}>이메일 주소 <span style={{ color:"#EF5350" }}>*필수</span></label>
                <input value={email} onChange={e => { setEmail(e.target.value); setEmailError(""); }} placeholder="example@email.com" type="email" style={{ ...S.input, borderColor: emailError?"#EF5350":"rgba(206,147,216,0.3)" }} />
                {emailError && <div style={{ color:"#EF5350", fontSize:"12px", marginTop:"6px" }}>{emailError}</div>}
              </div>
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(206,147,216,0.15)", borderRadius:"12px", padding:"16px" }}>
                <label style={{ display:"flex", gap:"10px", alignItems:"flex-start", cursor:"pointer", marginBottom:"12px" }}>
                  <input type="checkbox" defaultChecked disabled style={{ marginTop:"2px" }} />
                  <span style={{ fontSize:"12.5px", color:"rgba(255,255,255,0.65)", lineHeight:1.6 }}><strong style={{ color:"rgba(255,255,255,0.85)" }}>[필수] 개인정보 수집·이용 동의</strong><br />이메일 주소를 수집하여 테스트 결과 및 맞춤 가이드레터 발송 목적으로만 사용합니다.</span>
                </label>
                <label style={{ display:"flex", gap:"10px", alignItems:"flex-start", cursor:"pointer" }}>
                  <input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)} style={{ marginTop:"2px" }} />
                  <span style={{ fontSize:"12.5px", color:"rgba(255,255,255,0.65)", lineHeight:1.6 }}><strong style={{ color:"rgba(255,255,255,0.85)" }}>[선택] 마케팅 정보 수신 동의</strong><br />신규 콘텐츠, 이벤트, 할인 정보 등을 이메일로 받겠습니다.</span>
                </label>
              </div>
            </div>
            <button style={S.primaryBtn} onClick={handleSubmit}>무료 결과 확인하기 →</button>
          </div>
        )}

        {screen === SCREENS.LOADING && (
          <div style={{ textAlign:"center" }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ width:"56px", height:"56px", border:"3px solid rgba(206,147,216,0.2)", borderTopColor:"#CE93D8", borderRadius:"50%", margin:"0 auto 20px", animation:"spin 1s linear infinite" }} />
            <h3 style={{ fontSize:"18px", marginBottom:"8px" }}>분석 중입니다...</h3>
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"14px" }}>7가지 패턴을 종합해 맞춤 결과를 만들고 있어요</p>
          </div>
        )}

        {screen === SCREENS.FREE_RESULT && scores && (() => {
          const ti = getType(scores.total);
          const topDim = [...scores.dimScores].sort((a,b) => b.score-a.score)[0];
          const radarData = scores.dimScores.map(d => ({ subject: d.name, score: d.score, fullMark: 20 }));
          return (
            <div>
              <div style={{ fontSize:"11px", letterSpacing:"3px", color:"#CE93D8", textTransform:"uppercase", marginBottom:"16px", textAlign:"center" }}>진단 완료 · 무료 결과</div>
              <div style={{ background:ti.bg, border:`2px solid ${ti.border}`, borderRadius:"16px", padding:"20px", marginBottom:"20px", textAlign:"center" }}>
                <div style={{ fontSize:"34px", marginBottom:"6px" }}>{ti.emoji}</div>
                <div style={{ fontSize:"20px", fontWeight:900, color:ti.color, marginBottom:"4px" }}>{ti.type} — {ti.detail}</div>
                <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.55)", marginTop:"6px" }}>총점 {scores.total}점 / 140 · 최고 패턴: {topDim.icon} {topDim.name}</div>
              </div>
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(206,147,216,0.15)", borderRadius:"16px", padding:"18px", marginBottom:"18px" }}>
                <div style={{ fontSize:"12px", color:"#CE93D8", letterSpacing:"2px", marginBottom:"14px" }}>7가지 패턴 분포</div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill:"rgba(255,255,255,0.55)", fontSize:10 }} />
                    <Radar dataKey="score" stroke="#CE93D8" fill="#CE93D8" fillOpacity={0.22} />
                    <Tooltip contentStyle={{ background:"#1A0535", border:"1px solid #CE93D8", borderRadius:"8px", color:"#fff", fontSize:"12px" }} formatter={v => [`${v}점`,"점수"]} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"20px" }}>
                {[...scores.dimScores].sort((a,b) => b.score-a.score).map(d => {
                  const lev = getLev(d.score);
                  return <div key={d.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"12px 15px" }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"7px" }}><span style={{ fontSize:"13.5px", fontWeight:600 }}>{d.icon} {d.name}</span><span style={{ fontSize:"12.5px", fontWeight:700, color:lev.color }}>{lev.label}</span></div><div style={{ height:"5px", background:"rgba(255,255,255,0.08)", borderRadius:"3px" }}><div style={{ height:"100%", width:`${(d.score/d.max)*100}%`, background:lev.color, borderRadius:"3px" }} /></div></div>;
                })}
              </div>
              {aiLetter && (
                <div style={{ background:"linear-gradient(145deg,#0D0020,#2A0A40)", border:"1px solid rgba(206,147,216,0.25)", borderRadius:"14px", padding:"20px", marginBottom:"20px", position:"relative", overflow:"hidden" }}>
                  <div style={{ fontSize:"11px", color:"#CE93D8", letterSpacing:"2px", marginBottom:"12px" }}>라온단미의 맞춤 편지 — 미리보기</div>
                  <div style={{ fontSize:"14px", lineHeight:1.9, color:"rgba(255,255,255,0.85)", maxHeight:"120px", overflow:"hidden", position:"relative" }}>
                    {aiLetter}
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"60px", background:"linear-gradient(transparent,#0D0020)" }} />
                  </div>
                  <div style={{ textAlign:"center", marginTop:"10px", fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>전체 내용은 심층 분석에서 확인하세요</div>
                </div>
              )}
              <div style={{ background:"linear-gradient(135deg,rgba(106,27,154,0.3),rgba(156,39,176,0.2))", border:"1.5px solid rgba(206,147,216,0.4)", borderRadius:"18px", padding:"24px", marginBottom:"14px" }}>
                <div style={{ fontSize:"12px", color:"#CE93D8", letterSpacing:"2px", marginBottom:"12px" }}>💎 심층 분석 패키지</div>
                <div style={{ fontSize:"16px", fontWeight:800, marginBottom:"6px" }}>지금 보고 싶은 것이 더 있다면</div>
                <div style={{ fontSize:"13.5px", color:"rgba(255,255,255,0.65)", lineHeight:1.8, marginBottom:"18px" }}>✅ 7가지 패턴 상세 해설 (원인 + 치유 방향)<br />✅ 맞춤 가이드레터 전문<br />✅ 21일 심리 독립 전자책 3권<br />✅ 라온단미 1:1 맞춤 분석 레터 (48시간 내)</div>
                <div style={{ display:"flex", gap:"12px", marginBottom:"14px" }}>
                  <button onClick={() => setScreen(SCREENS.PAID_RESULT)} style={{ flex:1, background:"transparent", border:"1.5px solid rgba(206,147,216,0.5)", borderRadius:"12px", padding:"13px", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:"14px" }}>📊 상세 리포트만<br /><strong style={{ color:"#fff" }}>₩9,900</strong></button>
                  <button onClick={handlePaidAccess} style={{ flex:1, background:"linear-gradient(135deg,#6A1B9A,#9C27B0)", border:"none", borderRadius:"12px", padding:"13px", color:"#fff", cursor:"pointer", fontSize:"14px" }}>📖 전자책 풀 패키지<br /><strong>₩99,000</strong></button>
                </div>
                <div style={{ fontSize:"11.5px", color:"rgba(255,255,255,0.35)", textAlign:"center" }}>결제 즉시 자동 발송 · 카카오페이·네이버페이·카드 가능</div>
              </div>
              <button style={S.ghostBtn} onClick={() => { setScreen(SCREENS.INTRO); setAnswers({}); setP0Answers({}); setP0Idx(0); setDimIdx(0); setQIdx(0); setEmail(""); setNick(""); setAiLetter(""); setScores(null); setHasPaid(false); }}>처음부터 다시하기</button>
            </div>
          );
        })()}

        {screen === SCREENS.PAID_RESULT && scores && (() => {
          return (
            <div>
              <div style={{ fontSize:"11px", letterSpacing:"3px", color:"#CE93D8", textTransform:"uppercase", marginBottom:"16px", textAlign:"center" }}>심층 분석 · 상세 결과</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"14px", marginBottom:"20px" }}>
                {[...scores.dimScores].sort((a,b) => b.score-a.score).map(d => {
                  const lev = getLev(d.score);
                  const details = { 방어기제:{cause:"어릴 때 감정을 표현했을 때 무시되거나 처벌을 받은 경험에서 비롯됩니다.",tip:"오늘 불편했던 감정을 종이에 한 문장으로만 적어보세요. 판단 없이."}, 애착유형:{cause:"예측 불가능했던 부모의 반응이 신경계를 항상 경계 모드로 만들었습니다.",tip:"나에게 잘 대해주는 사람에게 짧게 감사 메시지 하나 보내보세요."}, 인지왜곡:{cause:"반복적인 비판과 기대 미달 경험이 자기 자신에 대한 왜곡된 렌즈를 만들었습니다.",tip:"오늘 내가 잘 한 것 딱 3가지를 손으로 적어보세요."}, 회복탄력성:{cause:"실패 시 충분한 지지를 받지 못한 환경이 무력감을 학습하게 했습니다.",tip:"의욕 없이, 딱 10분만 전자책 D1 미션을 해보세요."}, 신체신호:{cause:"만성적 스트레스가 신체에 축적되어 감정이 몸으로 먼저 신호를 보내고 있습니다.",tip:"4-7-8 호흡 3회. 숨 4초 들이쉬기 → 7초 참기 → 8초 내쉬기."}, 과도한통제:{cause:"아무것도 믿을 수 없었던 환경에서 '내가 다 해야 살아남는다'를 학습했습니다.",tip:"오늘 한 가지만 다른 사람에게 맡기고 결과를 보세요."}, 자책죄책감:{cause:"부모의 감정 조절 실패를 자신의 탓으로 돌리게 된 역전된 구조에서 비롯됩니다.",tip:"'이것은 내 탓이 아니다'를 오늘 한 번 소리 내서 말해보세요."} };
                  const det = details[d.name] || { cause:"원생가족 환경의 영향으로 형성된 패턴입니다.", tip:"전자책을 통해 구체적인 실천법을 확인하세요." };
                  return (
                    <div key={d.id} style={{ background:"rgba(255,255,255,0.04)", border:`1.5px solid ${lev.color}33`, borderRadius:"14px", padding:"18px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}><span style={{ fontSize:"15px", fontWeight:700 }}>{d.icon} {d.name}</span><span style={{ background:lev.color, color:"#fff", borderRadius:"12px", padding:"2px 10px", fontSize:"12px", fontWeight:700 }}>{lev.label}</span></div>
                      <div style={{ height:"6px", background:"rgba(255,255,255,0.08)", borderRadius:"3px", marginBottom:"14px" }}><div style={{ height:"100%", width:`${(d.score/d.max)*100}%`, background:lev.color, borderRadius:"3px" }} /></div>
                      <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.6)", lineHeight:1.7, marginBottom:"10px" }}><span style={{ color:"#CE93D8", fontWeight:600 }}>원인: </span>{det.cause}</div>
                      <div style={{ background:"rgba(206,147,216,0.1)", borderRadius:"8px", padding:"10px 13px", fontSize:"13px", color:"rgba(255,255,255,0.8)" }}><span style={{ color:"#CE93D8", fontWeight:600 }}>오늘 딱 하나: </span>{det.tip}</div>
                    </div>
                  );
                })}
              </div>
              {aiLetter && (
                <div style={{ background:"linear-gradient(145deg,#0D0020,#2A0A40)", border:"1px solid rgba(206,147,216,0.3)", borderRadius:"14px", padding:"22px", marginBottom:"20px" }}>
                  <div style={{ fontSize:"11px", color:"#CE93D8", letterSpacing:"2px", marginBottom:"14px" }}>라온단미의 맞춤 편지 — 전문</div>
                  <div style={{ fontSize:"14.5px", lineHeight:2, color:"rgba(255,255,255,0.88)", whiteSpace:"pre-wrap" }}>{aiLetter}</div>
                </div>
              )}
              <button style={S.ghostBtn} onClick={() => setScreen(SCREENS.FREE_RESULT)}>← 무료 결과로 돌아가기</button>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
