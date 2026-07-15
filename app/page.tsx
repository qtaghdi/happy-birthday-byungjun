"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { defaultBirthdayName, getBirthdayNameForms } from "./birthday-config";
import { createShareHash, parseShareHash, type SharePayload } from "./share-payload";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const maxCustomMessages = 10;

const defaultMessageTemplates = [
  "{이름} 항상 행복해라.",
  "{이름} 항상 건강해라.",
  "{이름} 태어난 걸 진심으로 축하한다.",
  "{이름} 오늘은 마음껏 맛있는 거 먹어라.",
  "{이름} 만 19세 된 걸 축하한다.",
  "{이름} 딜러 꼭 그랜드마스터 찍어라.",
  "{이름} 경쟁전에서 팀운도 좀 따라주길 바란다.",
  "{이름} 바이크 탈 땐 안전운전이 제일이다.",
  "{이름} 헬멧은 귀찮아도 꼭 쓰고 다녀라.",
  "{이름} 언젠가는 F1 드라이버가 되길 응원한다.",
  "{이름} 출근하다 허리 나가지 말고 스트레칭도 좀 해라.",
  "{이름} 야근은 적게 하고 월급은 많이 받아라.",
  "{이름} 올해는 하는 일마다 잘 풀렸으면 좋겠다.",
  "{이름} 로또 1등 되면 나도 기억해라.",
  "{이름} 내일 생일빵은... 유감이다.",
  "{이름} 오늘만큼은 세상 주인공이다.",
  "{이름} 앞으로도 오래오래 친구 하자.",
  "{이름} 웃을 일만 가득했으면 좋겠다.",
  "{이름} 앞으로도 잘 부탁한다.",
  "{이름} 생일 진심으로 축하한다.",
] as const;

type MessageDraft = {
  id: string;
  text: string;
};

function getInitialSharedPayload() {
  return typeof window === "undefined" ? null : parseShareHash(window.location.hash);
}

function getInitialMessageDrafts(): MessageDraft[] {
  const sharedMessages = getInitialSharedPayload()?.m;

  return sharedMessages?.length
    ? sharedMessages.map((message, index) => ({
        id: `shared-message-${index + 1}`,
        text: message,
      }))
    : [{ id: "message-1", text: "" }];
}

function renderBirthdayMessages(vocative: string, customMessages: string[]) {
  const messages = customMessages.length > 0 ? customMessages : defaultMessageTemplates;

  return messages.map((message) => message.replaceAll("{이름}", vocative));
}

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
  const [locationSnapshot, setLocationSnapshot] = useState("");
  const locationUrl = locationSnapshot ? new URL(locationSnapshot) : null;
  const sharedPayload = locationUrl ? parseShareHash(locationUrl.hash) : null;
  const isEditMode = locationUrl?.searchParams.get("edit") === "1";
  const [previewPayload, setPreviewPayload] = useState<SharePayload | null>(null);
  const [nameInput, setNameInput] = useState(
    () => getInitialSharedPayload()?.n ?? defaultBirthdayName,
  );
  const [messageDrafts, setMessageDrafts] = useState<MessageDraft[]>(getInitialMessageDrafts);
  const [shareUrl, setShareUrl] = useState("");
  const [editorStatus, setEditorStatus] = useState("");
  const [messageIndex, setMessageIndex] = useState<number | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [finalPhase, setFinalPhase] = useState<"hidden" | "dim" | "show">("hidden");
  const nextMessageIdRef = useRef(2);
  const finalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePayload = previewPayload ?? sharedPayload ?? { n: defaultBirthdayName };
  const birthdayName = activePayload.n;
  const customMessageTemplates = activePayload.m ?? [];
  const { friendly, plain, subject, vocative } = getBirthdayNameForms(birthdayName);
  const birthdayMessages = renderBirthdayMessages(vocative, customMessageTemplates);

  useEffect(() => {
    return () => {
      if (finalTimerRef.current) clearTimeout(finalTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function updateLocation() {
      setLocationSnapshot(window.location.href);
    }

    const initialUpdate = window.setTimeout(updateLocation, 0);
    window.addEventListener("hashchange", updateLocation);
    window.addEventListener("popstate", updateLocation);

    return () => {
      window.clearTimeout(initialUpdate);
      window.removeEventListener("hashchange", updateLocation);
      window.removeEventListener("popstate", updateLocation);
    };
  }, []);

  useEffect(() => {
    const nextTitle = `${vocative} 생일 축하한다`;
    const keepTitleInSync = () => {
      if (document.title !== nextTitle) document.title = nextTitle;
    };
    const titleObserver = new MutationObserver(keepTitleInSync);

    keepTitleInSync();
    titleObserver.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => titleObserver.disconnect();
  }, [vocative]);

  function getDraftPayload(): SharePayload | null {
    const nextName = nameInput.trim();
    if (!nextName) {
      setEditorStatus("주인공 이름을 입력해 주세요.");
      return null;
    }

    const messages = messageDrafts
      .map((message) => message.text.trim())
      .filter(Boolean)
      .slice(0, maxCustomMessages);

    return {
      n: nextName,
      ...(messages.length > 0 ? { m: messages } : {}),
    };
  }

  function applyPayload(payload: SharePayload) {
    setNameInput(payload.n);
    setPreviewPayload(payload);
    setMessageIndex(null);
    setBurstKey((current) => current + 1);
  }

  function previewCustomization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = getDraftPayload();
    if (!payload) return;

    applyPayload(payload);
    setShareUrl("");
    setEditorStatus("미리보기에 적용했습니다. 이제 공유 링크를 만들 수 있어요!");
  }

  function updateMessageDraft(id: string, text: string) {
    setMessageDrafts((current) =>
      current.map((message) => (message.id === id ? { ...message, text } : message)),
    );
    setShareUrl("");
  }

  function addMessageDraft() {
    setMessageDrafts((current) => {
      if (current.length >= maxCustomMessages) return current;

      const nextMessage = {
        id: `message-${nextMessageIdRef.current}`,
        text: "",
      };
      nextMessageIdRef.current += 1;

      return [...current, nextMessage];
    });
    setShareUrl("");
  }

  function removeMessageDraft(id: string) {
    setMessageDrafts((current) => {
      if (current.length === 1) {
        return current.map((message) =>
          message.id === id ? { ...message, text: "" } : message,
        );
      }

      return current.filter((message) => message.id !== id);
    });
    setShareUrl("");
  }

  async function createShareLink() {
    const payload = getDraftPayload();
    if (!payload) return;

    applyPayload(payload);

    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    url.hash = createShareHash(payload);

    const nextShareUrl = url.toString();
    setShareUrl(nextShareUrl);

    try {
      if (!navigator.clipboard) throw new Error("Clipboard API is unavailable");

      await navigator.clipboard.writeText(nextShareUrl);
      setEditorStatus("공유 링크를 복사했습니다! 받는 사람에게는 편집기가 보이지 않아요.");
    } catch {
      setEditorStatus("공유 링크가 만들어졌습니다. 아래 링크를 직접 복사해 주세요.");
    }
  }

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
          <strong>경축 {friendly} 열아홉번째 생일</strong>
          <span>★ 만 수 무 강 ★</span>
        </div>

        <header className="hero">
          <p className="hero-kicker">♬ 오늘 하루 {subject} 하고 싶은 거 다 해 ♬</p>
          <h1>🎉 {friendly} 생일잔치 🎉</h1>
          <div className="blink-sign" aria-label={`오늘의 주인공 ${plain}`}>
            <span>오늘의</span>
            <b>주인공</b>
            <span>{plain}</span>
          </div>
        </header>

        {isEditMode && (
          <section className="party-editor" aria-labelledby="party-editor-title">
            <h2 id="party-editor-title">🛠️ 생일잔치 꾸미기 모드 🛠️</h2>
            <p className="editor-intro">
              여기서 꾸민 뒤 공유 링크를 만들면, 받는 사람에게는 이 편집기가 안 보입니다.
            </p>

            <form className="party-editor-form" onSubmit={previewCustomization}>
              <div className="editor-field">
                <label htmlFor="birthday-name">🎤 생일 주인공 이름</label>
                <input
                  id="birthday-name"
                  name="birthdayName"
                  type="text"
                  value={nameInput}
                  maxLength={10}
                  autoComplete="off"
                  required
                  onChange={(event) => {
                    setNameInput(event.target.value);
                    setShareUrl("");
                  }}
                />
              </div>

              <fieldset className="message-editor">
                <legend>💌 랜덤 축하 멘트</legend>
                <p className="message-editor-help">
                  최대 10개까지 입력할 수 있습니다. <code>{"{이름}"}</code>은 자동으로
                  주인공 이름에 맞게 바뀝니다. 모두 비워두면 기본 덕담 20개가 나옵니다.
                </p>

                <div className="message-draft-list">
                  {messageDrafts.map((message, index) => (
                    <div className="message-draft-row" key={message.id}>
                      <label htmlFor={message.id}>{index + 1}</label>
                      <textarea
                        id={message.id}
                        value={message.text}
                        maxLength={120}
                        rows={2}
                        placeholder="예: {이름} 오늘은 치킨 두 마리 먹어라!"
                        onChange={(event) => updateMessageDraft(message.id, event.target.value)}
                      />
                      <button
                        type="button"
                        className="remove-message-button"
                        aria-label={`${index + 1}번 축하 멘트 삭제`}
                        onClick={() => removeMessageDraft(message.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="add-message-button"
                  disabled={messageDrafts.length >= maxCustomMessages}
                  onClick={addMessageDraft}
                >
                  + 멘트 칸 추가 ({messageDrafts.length}/{maxCustomMessages})
                </button>
              </fieldset>

              <div className="editor-actions">
                <button type="submit" className="preview-button">
                  🎊 미리보기 적용
                </button>
                <button type="button" className="share-button" onClick={createShareLink}>
                  🔗 공유 링크 만들기
                </button>
              </div>

              <p className="editor-status" aria-live="polite">
                {editorStatus || `현재 잔치 주인공: ${plain}`}
              </p>

              {shareUrl && (
                <div className="share-output">
                  <label htmlFor="share-url">받는 사람에게 보낼 링크</label>
                  <input
                    id="share-url"
                    type="text"
                    value={shareUrl}
                    readOnly
                    onFocus={(event) => event.currentTarget.select()}
                  />
                </div>
              )}
            </form>
          </section>
        )}

        <section className="birthday-card" aria-labelledby="birthday-message-title">
          <div className="corner corner-tl" aria-hidden="true">✦</div>
          <div className="corner corner-tr" aria-hidden="true">✦</div>
          <div className="corner corner-bl" aria-hidden="true">✦</div>
          <div className="corner corner-br" aria-hidden="true">✦</div>

          <p className="equals-line" aria-hidden="true">================================</p>
          <div className="cake-bounce" aria-hidden="true">🎂</div>
          <h2 id="birthday-message-title">{vocative}!!</h2>
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
            <span>축 생일　★　오늘 하루 {subject} 하고 싶은 거 다 해　★　축 생일　★　</span>
            <span>축 생일　★　오늘 하루 {subject} 하고 싶은 거 다 해　★　축 생일　★　</span>
          </div>
        </div>

        <footer>
          <Image
            className="footer-favicon"
            src={`${basePath}/favicon.svg`}
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
          aria-label={`${friendly} 최종 생일 축하`}
        >
          <div className="final-rays" aria-hidden="true" />
          <div className="final-content">
            <div className="final-confetti" aria-hidden="true">🎉🎉🎉</div>
            <p className="final-headline">생일 축하한다 {plain}!!</p>
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
