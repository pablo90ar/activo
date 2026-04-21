import { useEffect, useRef, useState } from "react";
import phrasesRaw from "../data/celebration-phrases.txt?raw";
import TraineeAvatar from "./TraineeAvatar";

const PHRASES = phrasesRaw.split("\n").filter((l) => l.trim());

interface Props {
  traineeId: string;
  name: string;
  color: string;
  onDone: () => void;
}

const CLAP_COUNT = 180;
const DURATION = 6000;

export default function CompletionCelebration({
  traineeId,
  name,
  color,
  onDone,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [phrase] = useState(
    () => PHRASES[Math.floor(Math.random() * PHRASES.length)],
  );
  const [claps] = useState(() =>
    Array.from({ length: CLAP_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 90 + 5,
      delay: Math.random() * 4500,
      size: Math.random() * 2 + 2.5,
      emoji: [
        "👏",
        "👏🏼",
        "👏🏽",
        "💪",
        "💪🏼",
        "🎉",
        "⭐",
        "🏋️",
        "🏋️‍♂️",
        "🏋️‍♀️",
        "🔥",
        "💥",
        "🥇",
        "🏆",
        "✅",
        "💯",
        "🫡",
        "🙌",
        "👊",
        "🎯",
      ][Math.floor(Math.random() * 20)],
    })),
  );

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => onDoneRef.current(), 400);
  };

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    const t = setTimeout(dismiss, DURATION);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="hidden md:flex fixed inset-0 z-[100] items-center justify-center cursor-pointer"
      onClick={dismiss}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-400 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* Emojis de aplauso */}
      {claps.map((c) => (
        <span
          key={c.id}
          className="absolute text-4xl"
          style={{
            left: `${c.left}%`,
            bottom: "-10%",
            fontSize: `${c.size}rem`,
            animation: `clap-rise 4s ease-out ${c.delay}ms forwards`,
          }}
        >
          {c.emoji}
        </span>
      ))}

      {/* Tarjeta de celebración */}
      <div
        className={`relative flex flex-col items-center gap-6 bg-white/95 backdrop-blur-lg rounded-3xl px-20 py-14 shadow-[0_0_60px_rgba(91,126,106,0.4)] transition-all duration-500 ${visible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
      >
        <TraineeAvatar
          traineeId={traineeId}
          name={name}
          color={color}
          size="w-72 h-72"
          textSize="text-9xl"
        />
        <span className="text-5xl font-bold text-[#3A3F39]">{name}</span>
        <span className="text-3xl font-bold text-[#5B7E6A]">{phrase}</span>
        <img
          src="/favicon.png"
          alt="Activo"
          className="mt-4 w-32 h-32 opacity-80"
        />
      </div>
    </div>
  );
}
