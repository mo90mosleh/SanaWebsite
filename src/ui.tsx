import { assetPath } from "./assets";
import type React from "react";
import { Package } from "lucide-react";
import { products as devices } from "./devices";
export const DeviceImage = ({
  model,
  priority = false,
}: {
  model: (typeof devices)[number];
  priority?: boolean;
}) =>
  model.id === "bha5000" || model.id === "bha3000" ? (
    <svg
      className="device-image"
      role="img"
      aria-label={model.name}
      viewBox={model.id === "bha3000" ? "220 240 360 365" : "330 0 1020 977"}
      preserveAspectRatio="xMidYMid meet"
      overflow="hidden"
    >
      <image
        href={assetPath(model.image)}
        x="0"
        y="0"
        width={model.id === "bha3000" ? "800" : "1609"}
        height={model.id === "bha3000" ? "800" : "977"}
      />
    </svg>
  ) : (
    <img
      className="device-image"
      src={assetPath(model.image)}
      alt={model.name}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
export const Logo = () => (
  <span className="logo" role="img" aria-label="سانا" />
);
export const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="empty">
    <Package size={30} />
    <p>{children}</p>
  </div>
);

export const BrandLogo = ({ brand }: { brand: "Getein" | "Wondfo" }) =>
  brand === "Getein" ? (
    <svg
      className="manufacturer-logo"
      role="img"
      aria-label="لوگوی Getein"
      viewBox="0 0 258 59"
      preserveAspectRatio="xMidYMid meet"
      overflow="hidden"
    >
      <image
        width="400"
        height="59"
        href={assetPath("/product-assets/getein/branding/getein-logo.png")}
      />
    </svg>
  ) : (
    <img
      className="manufacturer-logo"
      src={assetPath("/product-assets/wondfo/branding/wondfo-logo.png")}
      alt="لوگوی Wondfo"
    />
  );
