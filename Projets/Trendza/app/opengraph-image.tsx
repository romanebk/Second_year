import { ImageResponse } from "next/og";

export const alt = "Trendza — Trouvez le produit phare à vendre";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a12",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 18% 20%, rgba(124,58,237,0.35), transparent 55%), radial-gradient(circle at 82% 75%, rgba(192,38,211,0.3), transparent 55%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)",
            }}
          >
            <svg width="58" height="58" viewBox="0 0 24 24" fill="none">
              <path
                d="M3.5 16.5 9 11l3.5 3.5 5-5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.5 9.5h3V13"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.5 2.5Q21.1 3.9 22.5 4.5Q21.1 5.1 20.5 6.5Q19.9 5.1 18.5 4.5Q19.9 3.9 20.5 2.5Z"
                fill="#fff"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 700, color: "#f5f5f7" }}>
            Trendza
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 34,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: 860,
          }}
        >
          Trouvez le produit phare à vendre, selon votre pays et la saison
        </div>
      </div>
    ),
    { ...size },
  );
}
