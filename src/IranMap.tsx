import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, RefreshCw } from "lucide-react";
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
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const layer = useRef<L.TileLayer | null>(null);
  const change = useRef(onChange);
  change.current = onChange;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!node.current) return;
    const instance = L.map(node.current, {
      center: [lat, lng],
      zoom: 14,
      minZoom: 5,
      maxZoom: 19,
      scrollWheelZoom: false,
      zoomControl: false,
      maxBounds: [
        [23, 43],
        [41, 65],
      ],
      maxBoundsViscosity: 0.9,
      attributionControl: true,
    });
    map.current = instance;
    L.control
      .zoom({
        position: "topright",
        zoomInTitle: "بزرگ‌نمایی نقشه",
        zoomOutTitle: "کوچک‌نمایی نقشه",
      })
      .addTo(instance);
    instance.attributionControl.setPrefix(
      '<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>',
    );
    let loaded = 0;
    const tiles = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
        crossOrigin: false,
        referrerPolicy: "strict-origin-when-cross-origin",
      },
    );
    layer.current = tiles;
    tiles.on("loading", () => {
      loaded = 0;
    });
    tiles.on("tileload", () => {
      loaded++;
      setFailed(false);
    });
    tiles.on("tileerror", () => {
      if (!loaded) setFailed(true);
    });
    tiles.addTo(instance);
    const pin = L.marker([lat, lng], {
      draggable: true,
      keyboard: true,
      alt: "نشان موقعیت تحویل",
      icon: L.divIcon({
        className: "sana-map-pin",
        html: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40"><path d="M15 1C7 1 1 7 1 15c0 11 14 24 14 24s14-13 14-24C29 7 23 1 15 1Z" fill="#bf0015" stroke="white" stroke-width="2"/><circle cx="15" cy="14" r="5" fill="white"/></svg>',
        iconSize: [30, 40],
        iconAnchor: [15, 39],
      }),
    }).addTo(instance);
    marker.current = pin;
    pin
      .getElement()
      ?.setAttribute("aria-label", "نشان موقعیت تحویل؛ قابل جابه‌جایی");
    const update = (p: L.LatLng) => {
      const next = L.latLng(
        Math.max(24, Math.min(40, p.lat)),
        Math.max(44, Math.min(64, p.lng)),
      );
      pin.setLatLng(next);
      change.current(Number(next.lat.toFixed(6)), Number(next.lng.toFixed(6)));
    };
    instance.on("click", (e: L.LeafletMouseEvent) => update(e.latlng));
    pin.on("dragend", () => update(pin.getLatLng()));
    const size = new ResizeObserver(() => instance.invalidateSize());
    size.observe(node.current);
    instance.invalidateSize();
    return () => {
      size.disconnect();
      tiles.off();
      instance.remove();
      map.current = null;
      marker.current = null;
      layer.current = null;
    };
  }, []);
  useEffect(() => {
    marker.current?.setLatLng([lat, lng]);
  }, [lat, lng]);
  useEffect(() => {
    map.current?.setView([lat, lng], 14, { animate: false });
  }, [city]);
  return (
    <div className="iran-map osm-map">
      <div className="map-label">
        <span>موقعیت تحویل روی نقشه</span>
        <strong>{city}</strong>
      </div>
      <div
        ref={node}
        className="leaflet-map"
        role="region"
        aria-label={"نقشه OpenStreetMap، موقعیت " + city}
        data-lat={lat}
        data-lng={lng}
      />
      <div className="osm-map-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => {
            const p = map.current?.getCenter();
            if (p) {
              onChange(Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6)));
              marker.current?.setLatLng(p);
            }
          }}
        >
          <LocateFixed size={15} />
          انتخاب مرکز نقشه
        </button>
        <button
          type="button"
          className="link"
          onClick={() => map.current?.setView([lat, lng], 16)}
        >
          بازگشت به نشان
        </button>
      </div>
      <div className="map-caption">
        روی خیابان موردنظر بزنید یا نشان را جابه‌جا کنید.
        <bdi>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </bdi>
      </div>
      {failed && (
        <div className="map-network-error" role="status">
          نقشه بارگیری نشد؛ اتصال اینترنت را بررسی کنید. موقعیت انتخاب‌شده حفظ
          شده است.
          <button
            type="button"
            className="link"
            onClick={() => {
              setFailed(false);
              layer.current?.redraw();
            }}
          >
            <RefreshCw size={14} />
            بارگیری دوباره
          </button>
        </div>
      )}
    </div>
  );
}
