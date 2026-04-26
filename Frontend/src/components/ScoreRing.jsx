import { useEffect, useState } from "react";

export default function ScoreRing({ score = 0, size = 140, strokeWidth = 12 }) {
  const [displayed, setDisplayed] = useState(0);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (displayed / 100) * circumference;
  const color = score >= 70 ? "#0ea47a" : score >= 50 ? "#d97706" : "#e24b4a";

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring-circle"
          />
        </svg>
        <div
          style={{ position: "absolute", inset: 0 }}
          className="flex flex-col items-center justify-center"
        >
          <span className="text-3xl font-bold text-gray-900">{score}%</span>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Match</span>
        </div>
      </div>
    </div>
  );
}