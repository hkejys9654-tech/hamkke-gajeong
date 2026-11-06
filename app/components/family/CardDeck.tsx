// 함께카드 넘기기: 카드 한 장씩 보고 담당자를 톡 누르면 카드가 날아가고 다음 카드가 나옵니다.
// 저장 값은 기존 목록 방식과 똑같습니다(사전·사후 비교에 영향 없음).
import { useEffect, useMemo, useRef, useState } from "react";
import type { OwnerChoice, PhaseData } from "../../data";
import { asset } from "../../asset";

type Card = {
  id: string;
  category: string;
  title: string;
  desc?: string;
  note?: string;
  steps?: string[];
};

const flyClass: Record<OwnerChoice, string> = {
  adult1: "fly-left",
  adult2: "fly-right",
  together: "fly-up",
  child: "fly-up",
  none: "fly-down",
  na: "fly-down",
};

const cheers = ["좋아요!", "척척이네요!", "잘하고 있어요!", "멋져요!", "거의 다 왔어요!"];

export function CardDeck({
  cards,
  data,
  category,
  categoryVisual,
  options,
  optionLabel,
  onChoose,
  isLastGroup,
  onNextGroup,
  answeredTotal,
  total,
}: {
  cards: Card[];
  data: PhaseData;
  category: string;
  categoryVisual: string;
  options: { value: OwnerChoice; label: string }[];
  optionLabel: (value: OwnerChoice) => string;
  onChoose: (cardId: string, value: OwnerChoice) => void;
  isLastGroup: boolean;
  onNextGroup: () => void;
  answeredTotal: number;
  total: number;
}) {
  const firstOpen = useMemo(() => {
    const index = cards.findIndex((card) => !data.cards[card.id]);
    return index === -1 ? cards.length : index;
    // 영역이 바뀔 때만 처음 남은 카드로 이동합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);
  const [index, setIndex] = useState(firstOpen);
  const [flying, setFlying] = useState<OwnerChoice | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [cheer, setCheer] = useState("");

  useEffect(() => {
    setIndex(firstOpen);
    setFlying(null);
    setShowGuide(false);
  }, [firstOpen]);

  const card = cards[index];
  const done = index >= cards.length;
  const groupAnswered = cards.filter((c) => data.cards[c.id]).length;

  // "남은 카드 모두 해당 없음"처럼 한꺼번에 채워지면 바로 완료 화면으로 넘어갑니다.
  const prevAnswered = useRef(groupAnswered);
  useEffect(() => {
    const jumped = groupAnswered - prevAnswered.current > 1;
    prevAnswered.current = groupAnswered;
    if (jumped && groupAnswered === cards.length) setIndex(cards.length);
  }, [groupAnswered, cards.length]);

  function choose(value: OwnerChoice) {
    if (!card || flying) return;
    onChoose(card.id, value);
    setFlying(value);
    setShowGuide(false);
    const answeredAfter = answeredTotal + (data.cards[card.id] ? 0 : 1);
    if (answeredAfter > 0 && answeredAfter % 10 === 0 && answeredAfter < total) {
      setCheer(cheers[(answeredAfter / 10) % cheers.length]);
      window.setTimeout(() => setCheer(""), 1400);
    }
    window.setTimeout(() => {
      setFlying(null);
      // 다음으로 아직 안 고른 카드로 이동, 없으면 다음 카드
      const nextOpen = cards.findIndex(
        (c, i) => i > index && !data.cards[c.id] && c.id !== card.id,
      );
      setIndex(nextOpen === -1 ? cards.length : nextOpen);
    }, 320);
  }

  if (done) {
    const remaining = cards.length - groupAnswered;
    return (
      <div className="deck-done">
        <img src={asset("haeoni-suit-cheer.png")} alt="기뻐하는 해온이" />
        {remaining === 0 ? (
          <>
            <span className="deck-badge">
              {categoryVisual} {category} 완료!
            </span>
            <p>
              {isLastGroup
                ? "함께카드를 모두 마쳤어요. 이제 함께지수로 가요."
                : "멋져요! 다음 영역으로 넘어가 볼까요?"}
            </p>
            <div className="deck-done-actions">
              <button className="secondary-button" onClick={() => setIndex(0)}>
                다시 보기
              </button>
              <button className="primary-button" onClick={onNextGroup}>
                {isLastGroup ? "함께지수로" : "다음 영역"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p>아직 {remaining}장이 남았어요.</p>
            <button
              className="primary-button"
              onClick={() => setIndex(cards.findIndex((c) => !data.cards[c.id]))}
            >
              남은 카드 하러 가기
            </button>
          </>
        )}
      </div>
    );
  }

  const selected = data.cards[card.id];
  const hasGuide = Boolean(card.desc || card.note || card.steps?.length);
  const peek = Math.min(2, cards.length - index - 1);

  return (
    <div className="deck">
      <div className="deck-stage">
        {Array.from({ length: peek }, (_, i) => (
          <div key={i} className={`deck-back deck-back-${i + 1}`} aria-hidden />
        ))}
        <article
          key={card.id}
          className={`deck-card ${flying ? flyClass[flying] : ""}`}
        >
          <header>
            <span className="deck-emoji" aria-hidden>
              {categoryVisual}
            </span>
            <small>
              {index + 1} / {cards.length}
            </small>
          </header>
          <h3>{card.title}</h3>
          {selected && (
            <span className="deck-picked" data-owner={selected}>
              지금 선택: {optionLabel(selected)}
            </span>
          )}
          {hasGuide && (
            <button
              type="button"
              className="deck-guide-toggle"
              onClick={() => setShowGuide((v) => !v)}
            >
              {showGuide ? "설명 닫기" : "어떤 일인지 보기"}
            </button>
          )}
          {showGuide && (
            <div className="deck-guide">
              {card.desc && <p>{card.desc}</p>}
              {card.note && <em>{card.note}</em>}
              {card.steps?.length ? (
                <ol>
                  {card.steps.map((step) => (
                    <li key={step}>{step.replace(/^[①②③④]\s*/, "")}</li>
                  ))}
                </ol>
              ) : null}
            </div>
          )}
        </article>
        {cheer && (
          <div className="deck-cheer" role="status">
            <img src={asset("haeoni-red-cheer.png")} alt="" />
            <b>{cheer}</b>
            <small>{answeredTotal}장 완료</small>
          </div>
        )}
      </div>

      <p className="deck-question">이 일은 주로 누가 하나요?</p>
      <div className="deck-choices">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            data-owner={option.value}
            className={selected === option.value ? "deck-choice selected" : "deck-choice"}
            onClick={() => choose(option.value)}
            disabled={Boolean(flying)}
          >
            {optionLabel(option.value)}
          </button>
        ))}
      </div>

      <div className="deck-nav">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0 || Boolean(flying)}
        >
          ‹ 이전 카드
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          disabled={!selected || Boolean(flying)}
        >
          다음 카드 ›
        </button>
      </div>
    </div>
  );
}
