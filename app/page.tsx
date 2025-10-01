"use client";
import { useLang } from "./(components)/LangProvider";

export default function Home() {
  const { lang } = useLang();
  return (
    <main className="container">
      <div className="card">
        <h1 className="h1">CheckMyDashboard</h1>
        <p className="help">
          {lang==="en"
            ? "Upload a dashboard photo and optionally type make/model/year in one box. Login required to use the dashboard."
            : "계기판 사진을 업로드하고 제조사/차종/연식을 한 칸에 입력할 수 있습니다. 대시보드는 로그인 후 이용 가능합니다."}
        </p>
        <div style={{display:"flex", gap:10}}>
          <a className="btn" href="/dashboard" style={{width:"auto"}}>{lang==="en" ? "Go to Dashboard" : "대시보드로 이동"}</a>
          <a className="btn" href="/login" style={{width:"auto"}}>{lang==="en" ? "Login / Register" : "로그인 / 회원가입"}</a>
        </div>
      </div>
    </main>
  );
}
