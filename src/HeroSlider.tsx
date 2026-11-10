import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Activity,
  Gauge,
  Touchpad,
} from "lucide-react";
import { products } from "./devices";
import { DeviceImage, BrandLogo } from "./ui";
const slides = ["bha5100", "bha5000", "bha3000", "fs-205", "fs-114"].map((id) =>
  products.find((p) => p.id === id)!,
);
export function HeroSlider() {
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [engaged, setEngaged] = useState(false),
    [visible, setVisible] = useState(!document.hidden),
    [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    const visibility = () => setVisible(!document.hidden);
    media.addEventListener("change", change);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (paused || engaged || reduced || !visible) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5500,
    );
    return () => clearInterval(timer);
  }, [paused, engaged, reduced, visible]);
  const product = slides[index];
  return (
    <section
      className="hero-carousel sana-hero"
      aria-label="اسلایدر دستگاه‌های سانا"
      aria-roledescription="اسلایدر"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setEngaged(true);
      }}
      onPointerLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setEngaged(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setIndex((i) => (i + 1) % slides.length);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          setIndex((i) => (i + slides.length - 1) % slides.length);
        }
      }}
    >
      <div className="sana-hero-inner" key={product.id}>
        <div
          className="sana-hero-copy"
          aria-live={paused || engaged ? "polite" : "off"}
        >
          <BrandLogo brand={product.manufacturer} />
          <span className="sana-overline">
            {product.category === "CBC"
              ? "آنالایزر هماتولوژی"
              : "ایمونوفلورسانس"}{" "}
            · <bdi>{product.manufacturer}</bdi>
          </span>
          <h1>
            <bdi>{product.model}</bdi>
          </h1>
          <h2>{product.headline}</h2>
          <ul className="sana-hero-facts">
            {product.highlights.slice(0, 3).map((text, i) => {
              const Icon = [Activity, Gauge, Touchpad][i];
              return (
                <li key={text}>
                  <Icon size={27} strokeWidth={1.6} />
                  <span>{text}</span>
                </li>
              );
            })}
          </ul>
          <a className="button sana-primary" href={"#/devices/" + product.id}>
            مشاهده محصول <ArrowLeft size={20} />
          </a>
        </div>
        <a
          className="hero-slide sana-hero-image"
          href={"#/devices/" + product.id}
          aria-label={"مشخصات " + product.name}
        >
          <DeviceImage model={product} priority />
        </a>
      </div>
      <button
        className="carousel-arrow sana-hero-prev"
        aria-label="دستگاه قبلی"
        onClick={() => setIndex((i) => (i + slides.length - 1) % slides.length)}
      >
        <ChevronRight size={22} />
      </button>
      <button
        className="carousel-arrow sana-hero-next"
        aria-label="دستگاه بعدی"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
      >
        <ChevronLeft size={22} />
      </button>
      <div className="carousel-controls sana-hero-controls">
        <div className="carousel-dots">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              aria-label={"نمایش " + slide.model}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          className="carousel-arrow"
          aria-label={paused ? "پخش خودکار اسلایدر" : "توقف پخش خودکار اسلایدر"}
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? <Play size={15} /> : <Pause size={15} />}
        </button>
        <span className="sana-slide-count" aria-hidden="true">
          {(index + 1).toLocaleString("fa-IR")} / ۵
        </span>
      </div>
    </section>
  );
}
