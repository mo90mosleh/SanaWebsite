import {LaboratoryArtwork} from "./LaboratoryArtwork";
import {
  Activity,
  Droplets,
  HeartPulse,
  Sun,
  Dna,
  FlaskConical,
  Atom,
  Network,
  Orbit,
  Waves,
} from "lucide-react";
import type { Item } from "./domain";
const styles: Record<string, [string, string, typeof Atom]> = {
  crp: ["#be4966", "#fff0f4", Atom],
  hba1c: ["#238679", "#eaf8f3", Droplets],
  tsh: ["#7857aa", "#f4eefb", Orbit],
  pct: ["#c47630", "#fff5e9", Activity],
  vitd: ["#bc921b", "#fffbe1", Sun],
  ctni: ["#b95153", "#fff0ef", HeartPulse],
  ntprobnp: ["#3e71aa", "#edf5ff", HeartPulse],
  ckmb: ["#a35e92", "#fff0fb", Activity],
  t3: ["#29879c", "#eafaff", Orbit],
  t4: ["#6067b0", "#f0f0ff", Orbit],
  ddimer: ["#318e74", "#ecfaf4", Network],
  ferritin: ["#9c5548", "#fff3eb", FlaskConical],
  il6: ["#8754a0", "#f8efff", Atom],
  bhcg: ["#c57775", "#fff2f0", Dna],
  psa: ["#576d90", "#eef3fb", Waves],
};
const accents = [
  "#448a9e",
  "#9170aa",
  "#5c8d70",
  "#a0784d",
  "#6f78aa",
  "#af657f",
];
export function KitArtwork({ product: p }: { product: Item }) {
  if(p.family === "laboratory") return <LaboratoryArtwork product={p}/>;
  const hash = Array.from(p.id).reduce((a, c) => a + c.charCodeAt(0), 0);
  const [accent, soft, Icon] = styles[p.id] || [
    accents[hash % accents.length],
    "#f3f6f9",
    p.models.length ? FlaskConical : Droplets,
  ];
  return (
    <svg
      className="kit-artwork"
      role="img"
      aria-label={"تصویر گرافیکی کیت " + p.english}
      viewBox="0 0 340 190"
      direction="ltr"
    >
      <title>
        {p.english} — {p.code}
      </title>
      <rect width="340" height="190" rx="12" fill={soft} />
      <circle cx="285" cy="40" r="58" fill={accent} opacity=".07" />
      <circle cx="45" cy="176" r="47" fill={accent} opacity=".05" />
      <Icon
        x={278}
        y={16}
        width={35}
        height={35}
        color={accent}
        strokeWidth={1.2}
      />
      <g transform="translate(58 20)">
        <path d="M0 22 22 6h166l-21 16Z" fill="white" />
        <path d="M167 22 188 6v124l-21 18Z" fill={accent} opacity=".55" />
        <rect
          x="0"
          y="22"
          width="167"
          height="126"
          rx="3"
          fill="white"
          stroke={accent}
          strokeOpacity=".2"
        />
        <rect x="0" y="22" width="167" height="9" fill={accent} />
        <text x="15" y="57" fontSize="9" letterSpacing="1.5" fill="#9aa4b3">
          LABORATORY ASSAY
        </text>
        <text
          x="15"
          y="88"
          fontSize={
            p.english.length > 15 ? 15 : p.english.length > 10 ? 20 : 27
          }
          fontFamily="Arial,sans-serif"
          fontWeight="600"
          fill={accent}
        >
          {p.english}
        </text>
        <path d="M15 103h135" stroke={accent} strokeOpacity=".15" />
        <text
          x="15"
          y="125"
          fontSize="11"
          fontFamily="Arial,sans-serif"
          fill="#7b8493"
        >
          {p.code || p.brand}
        </text>
        <g transform="translate(130 114)" stroke={accent} strokeOpacity=".35">
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M${i * 2} 0v12`}
              strokeWidth={i % 3 === 0 ? 1.5 : 0.7}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
