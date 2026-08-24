import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "12px",
          background: "#111827",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: "#fbbf24",
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          H2F
        </span>
      </div>
    ),
    { ...size }
  );
}
