"use client";
import { useLang } from "./(components)/LangProvider";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button className="btn" onClick={() => setLang("en")} disabled={lang === "en"} aria-pressed={lang === "en"} style={{ width: 60, padding: "6px 10px" }}>
        ENG
      </button>
      <button className="btn" onClick={() => setLang("ko")} disabled={lang === "ko"} aria-pressed={lang === "ko"} style={{ width: 60, padding: "6px 10px" }}>
        KO
      </button>
    </div>
  );
}
