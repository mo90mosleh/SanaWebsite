import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { products } from "./devices";
import { DeviceImage, BrandLogo } from "./ui";
const slides = [
  products.find((p) => p.id === "fs-205")!,
  products.find((p) => p.id === "fs-114")!,
  ...products.filter((p) => p.category === "CBC"),
];
export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => setReduced(media.matches);
    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
  }, []);
  useEffect(() => {
    if (paused || hover || reduced || document.hidden) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5500,
    );
    return () => clearInterval(id);
  }, [paused, hover, reduced]);
  const p = slides[index];
  return (
    <div
      className={
        "hero-visual hero-carousel brand-" + p.manufacturer.toLowerCase()
      }
      aria-label="اسلایدر دستگاه‌های سانا"
      aria-roledescription="اسلایدر"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHover(false);
      }}
    >
      <span className="orb orb1" />
      <span className="orb orb2" />
      <div className="visual-label">
        <BrandLogo brand={p.manufacturer} />
        <span>{p.category}</span>
      </div>
      <a
        className="hero-slide"
        key={p.id}
        href={"#/devices/" + p.id}
        aria-label={"مشخصات " + p.name}
      >
        <DeviceImage model={p} />
      </a>
      <div className="floating-label">
        <div>
          <strong>
            <bdi>{p.name}</bdi>
          </strong>
          <small>{p.highlights[0]}</small>
        </div>
        <a href={"#/devices/" + p.id} aria-label={"بیشتر درباره " + p.model}>
          <ArrowLeft size={18} />
        </a>
      </div>
      <div className="carousel-controls">
        <button
          className="carousel-arrow"
          aria-label="دستگاه قبلی"
          onClick={() =>
            setIndex((i) => (i + slides.length - 1) % slides.length)
          }
        >
          <ChevronRight size={17} />
        </button>
        <div className="carousel-dots">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={"نمایش " + s.model}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          className="carousel-arrow"
          aria-label="دستگاه بعدی"
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
        >
          <ChevronLeft size={17} />
        </button>
        <button
          className="carousel-arrow"
          aria-label={paused ? "پخش خودکار اسلایدر" : "توقف پخش خودکار اسلایدر"}
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </div>
  );
}
