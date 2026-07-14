"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const birthdayMessages = [
  "🎉 올해도 돈 많이 벌어라!",
  "🍗 치킨은 내가 안 산다.",
  "🍺 술은 적당히 마셔라.",
  "💸 통장은 늘 풍족하길.",
  "🎮 게임은 져도 인생은 이겨라.",
  "😂 늙었다 병준아.",
  "🍀 올해는 뭐든 찍는 족족 대박나라!",
  "🥩 고기는 항상 네 앞자리로 가길.",
  "🏆 오늘의 주인공, 내일도 주인공!",
  "🧧 들어오는 돈은 두 배, 나가는 돈은 반으로!",
  "🚕 택시가 항상 바로 잡히길.",
  "☕ 카페 쿠폰은 늘 한 개 남아 있길.",
  "😎 사진은 전부 인생샷으로 나오길.",
  "🛌 알람 없이 푹 자는 날이 많아지길.",
  "🌟 네가 가는 곳마다 좋은 사람만 있길.",
  "🎁 갖고 싶은 건 고민 전에 품절 안 되길.",
  "📈 행복 수익률만 매일 상한가 가자!",
  "🤝 앞으로도 변함없이 웃기게 잘 지내자.",
] as const;

const floatingDecorations = [
  { id: "star-1", emoji: "✨", className: "float-1" },
  { id: "balloon-1", emoji: "🎈", className: "float-2" },
  { id: "heart-1", emoji: "💖", className: "float-3" },
  { id: "star-2", emoji: "⭐", className: "float-4" },
  { id: "party-1", emoji: "🎉", className: "float-5" },
  { id: "heart-2", emoji: "💛", className: "float-6" },
  { id: "sparkle-2", emoji: "✨", className: "float-7" },
  { id: "confetti-1", emoji: "🎊", className: "float-8" },
  { id: "star-3", emoji: "🌟", className: "float-9" },
  { id: "balloon-2", emoji: "🎈", className: "float-10" },
  { id: "heart-3", emoji: "💗", className: "float-11" },
  { id: "cake-1", emoji: "🎂", className: "float-12" },
] as const;

const burstEmojis = ["🎉", "🎊", "✨", "⭐", "💸", "🍻", "🎂", "💖"] as const;

type BurstStyle = CSSProperties & {
  "--burst-x": string;
  "--burst-y": string;
  "--burst-rotate": string;
  "--burst-delay": string;
};

const burstParticles = Array.from({ length: 48 }, (_, index) => {
  const angle = (index / 48) * Math.PI * 2;
  const distance = 34 + (index % 7) * 10;

  return {
    id: `burst-${index}`,
    emoji: burstEmojis[index % burstEmojis.length],
    style: {
      "--burst-x": `${Math.cos(angle) * distance}vw`,
      "--burst-y": `${Math.sin(angle) * distance}vh`,
      "--burst-rotate": `${180 + (index % 5) * 90}deg`,
      "--burst-delay": `${(index % 6) * 0.025}s`,
    } as BurstStyle,
  };
});

export default function Home() {
  const [messageIndex, setMessageIndex] = useState<number | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [finalPhase, setFinalPhase] = useState<"hidden" | "dim" | "show">("hidden");
  const finalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (finalTimerRef.current) clearTimeout(finalTimerRef.current);
    };
  }, []);

  function receiveCelebration() {
    let nextIndex = Math.floor(Math.random() * birthdayMessages.length);
    if (nextIndex === messageIndex) {
      nextIndex = (nextIndex + 1) % birthdayMessages.length;
    }

    setMessageIndex(nextIndex);
    setBurstKey((current) => current + 1);
  }

  function showFinalCelebration() {
    if (finalTimerRef.current) clearTimeout(finalTimerRef.current);
    setFinalPhase("dim");
    finalTimerRef.current = setTimeout(() => setFinalPhase("show"), 650);
  }

  function closeFinalCelebration() {
    if (finalTimerRef.current) clearTimeout(finalTimerRef.current);
    setFinalPhase("hidden");
  }

  return (
    <main className="party-page">
      <div className="scanlines" aria-hidden="true" />
      <div className="spotlight spotlight-left" aria-hidden="true" />
      <div className="spotlight spotlight-right" aria-hidden="true" />

      <div className="floating-field" aria-hidden="true">
        {floatingDecorations.map((decoration) => (
          <span key={decoration.id} className={`floating-emoji ${decoration.className}`}>
            {decoration.emoji}
          </span>
        ))}
      </div>

      <div className="bunting" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <span key={`flag-${index}`} />
        ))}
      </div>

      <div key={burstKey} className={burstKey > 0 ? "party-stage screen-shake" : "party-stage"}>
        {burstKey > 0 && (
          <div className="emoji-burst" aria-hidden="true">
            {burstParticles.map((particle) => (
              <span key={`${burstKey}-${particle.id}`} style={particle.style}>
                {particle.emoji}
              </span>
            ))}
          </div>
        )}

        <div className="top-ribbon">
          <span>★ 경 축 ★</span>
          <strong>대한민국 최고 생일남 인증</strong>
          <span>★ 만 수 무 강 ★</span>
        </div>

        <header className="hero">
          <p className="hero-kicker">♬ 전국 병준이 자랑 대회 대상 수상 ♬</p>
          <h1>🎉 병준이 생일잔치 🎉</h1>
          <div className="blink-sign" aria-label="오늘의 주인공 병준">
            <span>오늘의</span>
            <b>주인공</b>
            <span>병준</span>
          </div>
        </header>

        <section className="birthday-card" aria-labelledby="birthday-message-title">
          <div className="corner corner-tl" aria-hidden="true">✦</div>
          <div className="corner corner-tr" aria-hidden="true">✦</div>
          <div className="corner corner-bl" aria-hidden="true">✦</div>
          <div className="corner corner-br" aria-hidden="true">✦</div>

          <p className="equals-line" aria-hidden="true">================================</p>
          <div className="cake-bounce" aria-hidden="true">🎂</div>
          <h2 id="birthday-message-title">병준아!!</h2>
          <p className="main-wish">생일 진심으로 축하한다!!</p>
          <p className="sub-wish">
            오늘만큼은<br />
            세상에서 제일 행복해라!!
          </p>
          <div className="party-face" aria-hidden="true">🥳</div>
          <p className="equals-line" aria-hidden="true">================================</p>
        </section>

        <section className="actions" aria-label="생일 축하 버튼">
          <button className="celebrate-button primary-button" type="button" onClick={receiveCelebration}>
            <span aria-hidden="true">🎁</span>
            축하 받기
            <span aria-hidden="true">🎁</span>
          </button>

          <div className="random-message" aria-live="polite">
            <span className="message-label">★ 오늘의 덕담 ★</span>
            <p>
              {messageIndex === null
                ? "빨간 버튼을 힘차게 눌러 주세요!"
                : birthdayMessages[messageIndex]}
            </p>
          </div>

          <button className="celebrate-button final-button" type="button" onClick={showFinalCelebration}>
            <span aria-hidden="true">🚨</span>
            최종 축하
            <span aria-hidden="true">🚨</span>
          </button>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            <span>축 생일　★　오늘 하루 병준이 하고 싶은 거 다 해　★　축 생일　★　</span>
            <span>축 생일　★　오늘 하루 병준이 하고 싶은 거 다 해　★　축 생일　★　</span>
          </div>
        </div>

        <footer>
          <img
            className="footer-favicon"
            src="/favicon.svg"
            alt="생일잔치 파비콘"
            width="56"
            height="56"
          />
        </footer>
      </div>

      {finalPhase !== "hidden" && (
        <div
          className={`final-overlay ${finalPhase === "show" ? "is-revealed" : "is-dimming"}`}
          role="dialog"
          aria-modal="true"
          aria-label="병준이 최종 생일 축하"
        >
          <div className="final-rays" aria-hidden="true" />
          <div className="final-content">
            <div className="final-confetti" aria-hidden="true">🎉🎉🎉</div>
            <p className="final-headline">생일 축하한다 병준!!</p>
            <div className="final-confetti" aria-hidden="true">🎉🎉🎉</div>
            <p className="final-note">
              항상 고맙고<br />
              앞으로도 오래 보자 🍻
            </p>
            <button type="button" className="encore-button" onClick={closeFinalCelebration}>
              앵콜! 한 번 더 보기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
