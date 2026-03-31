import type { PetStage } from "@/lib/game";

/**
 * Stylized vector “essence” art — transparent background, no photo frame.
 * (True PNG→vector tracing needs a dedicated tool; these replace raster for a clean HUD.)
 */
type ExpressionProps = { joy: number; excited: boolean };

export function CreatureVectorArt({ stage, joy = 100, excited = false }: { stage: PetStage } & Partial<ExpressionProps>) {
  const expr: ExpressionProps = { joy, excited };

  switch (stage) {
    case "egg":
      return <EggSvg />;
    case "baby":
      return <BabySvg {...expr} />;
    case "teen":
      return <TeenSvg {...expr} />;
    case "adult":
      return <AdultSvg {...expr} />;
    default:
      return <EggSvg />;
  }
}

function Mouth({
  joy,
  excited,
  cx,
  cySmile,
  smileD,
  strokeColor = "#1e293b"
}: ExpressionProps & { cx: number; cySmile: number; smileD: string; strokeColor?: string }) {
  if (excited) {
    return <ellipse cx={cx} cy={cySmile + 4} rx="12" ry="14" fill="none" stroke={strokeColor} strokeWidth="5" />;
  }
  if (joy < 30) {
    return <circle cx={cx} cy={cySmile} r="9" fill="none" stroke={strokeColor} strokeWidth="4" />;
  }
  return <path d={smileD} fill="none" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />;
}

function EggSvg() {
  return (
    <svg viewBox="0 0 200 240" className="h-64 w-64" aria-hidden>
      <defs>
        <radialGradient id="eggBody" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fffefb" />
          <stop offset="55%" stopColor="#f3e8ff" />
          <stop offset="100%" stopColor="#e9d5ff" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="125" rx="72" ry="96" fill="url(#eggBody)" stroke="#c4b5fd" strokeWidth="3" />
      <ellipse cx="100" cy="118" rx="48" ry="36" fill="#ffffff" opacity="0.35" />
      <path
        d="M78 132c8-6 16-9 22-9s14 3 22 9"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

function BabySvg({ joy, excited }: ExpressionProps) {
  return (
    <svg viewBox="0 0 280 280" className="h-64 w-64" aria-hidden>
      <defs>
        <radialGradient id="babyFill" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#d8faf0" />
          <stop offset="100%" stopColor="#9ae6d3" />
        </radialGradient>
      </defs>
      <path
        d="M140 48c48 0 88 38 96 88 4 24-2 48-14 68-18 32-52 52-90 52s-72-20-90-52c-12-20-18-44-14-68 8-50 48-88 96-88Z"
        fill="url(#babyFill)"
        stroke="#5eead4"
        strokeWidth="3"
      />
      <ellipse cx="108" cy="128" rx="10" ry="12" fill="#1e293b" />
      <ellipse cx="172" cy="128" rx="10" ry="12" fill="#1e293b" />
      <Mouth joy={joy} excited={excited} cx={140} cySmile={168} smileD="M112 168c16 18 40 18 56 0" />
      <ellipse cx="86" cy="152" rx="14" ry="10" fill="#fda4af" opacity="0.7" />
      <ellipse cx="194" cy="152" rx="14" ry="10" fill="#fda4af" opacity="0.7" />
    </svg>
  );
}

function TeenSvg({ joy, excited }: ExpressionProps) {
  return (
    <svg viewBox="0 0 280 280" className="h-64 w-64" aria-hidden>
      <defs>
        <linearGradient id="teenFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      <path
        d="M140 36c56 8 100 52 108 108 6 36-6 72-28 96-26 30-68 46-108 46s-82-16-108-46c-22-24-34-60-28-96 8-56 52-100 108-108Z"
        fill="url(#teenFill)"
        stroke="#8b5cf6"
        strokeWidth="3"
      />
      <ellipse cx="108" cy="124" rx="11" ry="13" fill="#1e293b" />
      <ellipse cx="176" cy="124" rx="11" ry="13" fill="#1e293b" />
      <Mouth joy={joy} excited={excited} cx={140} cySmile={172} smileD="M118 172c10 12 34 12 44 0" />
      <ellipse cx="82" cy="156" rx="12" ry="9" fill="#f472b6" opacity="0.55" />
      <ellipse cx="198" cy="156" rx="12" ry="9" fill="#f472b6" opacity="0.55" />
      <circle cx="140" cy="64" r="8" fill="#fde68a" opacity="0.9" />
    </svg>
  );
}

function AdultSvg({ joy, excited }: ExpressionProps) {
  return (
    <svg viewBox="0 0 280 280" className="h-64 w-64" aria-hidden>
      <defs>
        <linearGradient id="adultFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <path
        d="M140 32c62 4 112 54 120 118 4 34-8 68-32 92-28 28-72 44-116 44s-88-16-116-44c-24-24-36-58-32-92 8-64 58-114 120-118Z"
        fill="url(#adultFill)"
        stroke="#3b82f6"
        strokeWidth="3"
      />
      <ellipse cx="104" cy="120" rx="12" ry="14" fill="#0f172a" />
      <ellipse cx="180" cy="120" rx="12" ry="14" fill="#0f172a" />
      <Mouth
        joy={joy}
        excited={excited}
        cx={140}
        cySmile={176}
        smileD="M112 176c10 14 46 14 56 0"
        strokeColor="#0f172a"
      />
      <ellipse cx="78" cy="158" rx="14" ry="10" fill="#fbcfe8" opacity="0.65" />
      <ellipse cx="202" cy="158" rx="14" ry="10" fill="#fbcfe8" opacity="0.65" />
      <path d="M140 40v-16M124 32l16 8 16-8" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
