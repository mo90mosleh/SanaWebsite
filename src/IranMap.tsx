import { useEffect, useState } from "react";
import { Plus, Minus, LocateFixed } from "lucide-react";
import { iranOutline } from "./iran-outline";
export const project = ([lng, lat]: number[]) => [
  (lng - 43) * 26,
  (40.5 - lat) * 30,
];
const outline =
  iranOutline.map((p, i) => (i ? "L" : "M") + project(p).join(",")).join(" ") +
  "Z";
export function insideIran(lng: number, lat: number) {
  let inside = false;
  for (let i = 0, j = iranOutline.length - 1; i < iranOutline.length; j = i++) {
    const [xi, yi] = iranOutline[i],
      [xj, yj] = iranOutline[j];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    )
      inside = !inside;
  }
  return inside;
}
export function IranMap({
  lat,
  lng,
  city,
  onChange,
}: {
  lat: number;
  lng: number;
  city: string;
  onChange: (lat: number, lng: number) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState<[number, number]>([300, 250]);
  const [error, setError] = useState("");
  useEffect(() => {
    setFocus(project([lng, lat]) as [number, number]);
    setZoom(2.4);
    setError("");
  }, [city]);
  const [px, py] = project([lng, lat]);
  const tx = 300 - focus[0] * zoom,
    ty = 250 - focus[1] * zoom;
  function choose(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const p = point.matrixTransform(ctm.inverse());
    const x = (p.x - tx) / zoom,
      y = (p.y - ty) / zoom;
    const nextLng = x / 26 + 43,
      nextLat = 40.5 - y / 30;
    if (!insideIran(nextLng, nextLat)) {
      setError("یک نقطه داخل محدوده ایران انتخاب کنید.");
      return;
    }
    setError("");
    onChange(Number(nextLat.toFixed(5)), Number(nextLng.toFixed(5)));
  }
  return (
    <div className="iran-map">
      <div className="map-label">
        <span>انتخاب موقعیت روی نقشه ایران</span>
        <strong>{city}</strong>
      </div>
      <svg
        role="img"
        aria-label={"نقشه ایران، موقعیت " + city}
        viewBox="0 0 600 500"
        onClick={choose}
      >
        <rect width="600" height="500" fill="#eef6fa" />
        <defs>
          <pattern
            id="map-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#dcebf0"
              strokeWidth=".5"
            />
          </pattern>
        </defs>
        <rect width="600" height="500" fill="url(#map-grid)" />
        <g transform={`translate(${tx},${ty}) scale(${zoom})`}>
          <path
            d={outline}
            fill="#f8f6ed"
            stroke="#9ab6ac"
            strokeWidth={1 / zoom}
          />
          <circle
            cx={px}
            cy={py}
            r={12 / zoom}
            fill="#bf0015"
            fillOpacity=".12"
          />
          <circle
            cx={px}
            cy={py}
            r={5 / zoom}
            fill="#bf0015"
            stroke="white"
            strokeWidth={2 / zoom}
          />
        </g>
        <text x="23" y="470" fontSize="14" fill="#87a4b1">
          N ↑
        </text>
      </svg>
      <div className="map-controls">
        <button
          type="button"
          className="secondary"
          aria-label="بزرگ‌نمایی نقشه"
          onClick={() => setZoom((z) => Math.min(8, z + 1))}
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          className="secondary"
          aria-label="کوچک‌نمایی نقشه"
          onClick={() => setZoom((z) => Math.max(1, z - 1))}
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          className="secondary"
          aria-label="نمای کل ایران"
          onClick={() => {
            setFocus([300, 250]);
            setZoom(1);
          }}
        >
          <LocateFixed size={16} />
        </button>
      </div>
      <div className="map-caption">
        برای جابه‌جایی نشان، روی نقشه بزنید.{" "}
        <bdi>
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </bdi>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
