import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サイトリニューアル準備中｜Rishiri Recruit",
  description:
    "利尻島の求人・観光・移住サイトはただいまリニューアル準備中です。近日公開予定です。",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <div
      style={{
        // root layout の Header/Footer より前面に出して全画面を覆う
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(1.5rem, 5vw, 3rem)",
        boxSizing: "border-box",
        background:
          "linear-gradient(180deg, #4FA8D5 0%, #2BA8C4 55%, #1A8FA8 100%)",
        color: "#FFFFFF",
        textAlign: "center",
        fontFamily:
          "system-ui, -apple-system, 'Hiragino Sans', 'Yu Gothic UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(1.25rem, 3.5dvh, 2.25rem)",
        }}
      >
        {/* アイコン */}
        <div
          aria-hidden="true"
          style={{
            fontSize: "clamp(4rem, 14vw, 6rem)",
            lineHeight: 1,
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))",
          }}
        >
          🏝️
        </div>

        {/* サイト名 */}
        <p
          style={{
            fontSize: "clamp(0.85rem, 2.5vw, 1.05rem)",
            letterSpacing: "0.22em",
            fontWeight: 800,
            opacity: 0.95,
            margin: 0,
          }}
        >
          RISHIRI RECRUIT
        </p>

        {/* メインメッセージ */}
        <h1
          style={{
            fontSize: "clamp(2rem, 7vw, 3.5rem)",
            fontWeight: 900,
            lineHeight: 1.25,
            margin: 0,
            textShadow: "0 3px 16px rgba(0,0,0,0.2)",
          }}
        >
          サイトリニューアル
          <br />
          準備中
        </h1>

        {/* サブテキスト */}
        <p
          style={{
            fontSize: "clamp(0.95rem, 2.6vw, 1.15rem)",
            lineHeight: 1.9,
            margin: 0,
            opacity: 0.95,
            fontWeight: 500,
          }}
        >
          いつもご覧いただきありがとうございます。
          <br />
          サイトを新しくするため、ただいま準備中です。
          <br />
          近日中に公開いたしますので、
          <br />
          今しばらくお待ちください。
        </p>

        {/* お問い合わせ情報 */}
        <div
          style={{
            marginTop: "clamp(0.5rem, 2dvh, 1rem)",
            padding: "clamp(1rem, 3dvh, 1.5rem) clamp(1.5rem, 5vw, 2rem)",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.14)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.35)",
            width: "100%",
            maxWidth: "480px",
            boxSizing: "border-box",
          }}
        >
          <p
            style={{
              margin: 0,
              marginBottom: "0.5rem",
              fontSize: "clamp(0.85rem, 2.2vw, 0.95rem)",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            お問い合わせ
          </p>
          <p
            style={{
              margin: 0,
              marginBottom: "0.5rem",
              fontSize: "clamp(0.95rem, 2.4vw, 1.05rem)",
              fontWeight: 700,
            }}
          >
            利尻富士町役場
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "clamp(0.8rem, 2.1vw, 0.9rem)",
              lineHeight: 1.7,
              opacity: 0.9,
            }}
          >
            〒097-0101 北海道利尻郡利尻富士町鴛泊富士野6
            <br />
            Tel:{" "}
            <a
              href="tel:01638-2-1111"
              style={{ color: "#FFFFFF", textDecoration: "underline" }}
            >
              0163-82-1111
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
