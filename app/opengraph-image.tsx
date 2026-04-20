import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(145deg, #f7f7f4 0%, #ece9e2 45%, #ddd8ce 100%)",
          color: "#111111",
          padding: "56px 64px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              border: "1px solid rgba(17,17,17,0.14)",
              borderRadius: 999,
              padding: "10px 18px",
              fontSize: 22,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            Gainables
          </div>
          <div style={{ fontSize: 24, opacity: 0.65 }}>Ottawa to Montreal</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 880 }}>
          <div style={{ fontSize: 88, lineHeight: 0.95, fontWeight: 700, letterSpacing: "-0.06em" }}>
            Ride for Mental Health
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, opacity: 0.78 }}>
            A community-driven initiative from Gainables during Mental Health Month. Follow the ride, support the cause, and stay close in real time.
          </div>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          {[
            { label: "Distance", value: "~200 km" },
            { label: "Tracking", value: "Live" },
            { label: "Window", value: "Mental Health Month" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                border: "1px solid rgba(17,17,17,0.12)",
                background: "rgba(255,255,255,0.58)",
                borderRadius: 28,
                padding: "18px 22px",
                minWidth: 220,
              }}
            >
              <div style={{ fontSize: 18, textTransform: "uppercase", letterSpacing: "0.18em", opacity: 0.58 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 34, fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
