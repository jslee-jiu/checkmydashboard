"use client";
import { useEffect, useMemo, useState } from "react";
import { useLang } from "../(components)/LangProvider";

export default function Dashboard() {
  const { lang } = useLang();
  const [file, setFile] = useState<File | null>(null);
  const [carQuery, setCarQuery] = useState<string>("");
  const [streamText, setStreamText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { setStreamText(""); setErr(null); }, [file, carQuery, lang]);

  const t = useMemo(() => ({
    title: lang === "en" ? "Dashboard Upload & Analysis" : "대시보드 업로드 & 분석",
    searchLabel: lang === "en"
      ? "Search — Make / Model / Year (any subset OK)"
      : "검색 — 제조사 / 차종 / 연식 (아는 것만 입력 가능)",
    searchPh: lang === "en" ? `e.g. "Hyundai Avante 2021" or "K5"` : `예: "현대 아반떼 2021" 또는 "K5"`,
    photoLabel: lang === "en" ? "Dashboard Photo" : "계기판 사진",
    note: lang === "en" ? "This field is optional. You can leave it blank." : "이 칸은 선택사항입니다. 비워도 됩니다.",
    resize: lang === "en" ? "Large images are resized client-side for speed & cost." : "큰 이미지는 속도/비용을 위해 클라이언트에서 리사이즈됩니다.",
    start: lang === "en" ? "Start Analysis" : "분석 시작",
    analyzing: lang === "en" ? "Analyzing..." : "분석 중...",
    needPhoto: lang === "en" ? "Please select a dashboard photo." : "계기판 사진을 선택하세요.",
    result: lang === "en" ? "Result" : "분석 결과",
    appear: lang === "en" ? "The analysis will appear here." : "여기에 결과가 표시됩니다.",
  }), [lang]);

  async function onAnalyze() {
    if (!file) { setErr(t.needPhoto); return; }
    setErr(null); setLoading(true); setStreamText("");

    const b64 = await fileToResizedDataUrl(file, 1280, 0.85);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl: b64, carQuery, lang })
    });

    if (!res.ok || !res.body) {
      const allow = res.headers.get("allow") || "?";
      let msg = ""; try { msg = (await res.json())?.error ?? ""; } catch { msg = await res.text().catch(()=> ""); }
      setErr(`${lang==="en"?"Analysis failed":"분석 실패"} (HTTP ${res.status}) Allow=${allow} ${msg}`);
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      setStreamText(prev => prev + dec.decode(value));
    }
    setLoading(false);
  }

  return (
    <main className="container">
      <div className="card">
        <h1 className="h1">{t.title}</h1>

        <div className="grid sm:grid-cols-2" style={{marginTop:12}}>
          <div>
            <label className="label">{t.searchLabel}</label>
            <input className="input" placeholder={t.searchPh}
              value={carQuery} onChange={e => setCarQuery(e.target.value)} />
            <p className="help" style={{marginTop:6}}>{t.note}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t.photoLabel}</label>
            <input className="input" type="file" accept="image/*"
              onChange={e=>setFile(e.target.files?.[0] || null)} />
            <p className="help" style={{marginTop:6}}>{t.resize}</p>
          </div>
        </div>

        <div style={{marginTop:12}}>
          <button className="btn" onClick={onAnalyze} disabled={loading}>
            {loading ? t.analyzing : t.start}
          </button>
        </div>

        {err && <p className="text-red" style={{marginTop:12, whiteSpace:"pre-wrap"}}>{err}</p>}

        <div style={{marginTop:16}}>
          <h2 className="h2">{t.result}</h2>
          <pre>{streamText || t.appear}</pre>
        </div>
      </div>
    </main>
  );
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fileToResizedDataUrl(file: File, maxDim=1280, quality=0.85) {
  const orig = await fileToDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = orig;
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}
