import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Nízkopolygonová rybka (stejný tvar jako FishIcon v app/components/icons)
// na oceánovém gradientu webu — stejná vizuální identita jako zbytek
// stránky, místo obecného textového loga "H2F".
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "14px",
          background: "linear-gradient(180deg, #0a2438 0%, #0e4f66 55%, #146b78 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="#fbbf24">
          <polygon points="1,12 9,7 9,17" />
          <polygon points="9,7 23,10.5 23,13.5 9,17" />
          <circle cx="18.5" cy="11.3" r="1" fill="#111827" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
