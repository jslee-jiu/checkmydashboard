"use client";
import { useState } from "react";
import { useLang } from "../(components)/LangProvider";

export default function Login() {
  const { lang } = useLang();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState<string|null>(null);
  const t = {
    title: lang==="en" ? "Sign in / Register" : "로그인 / 회원가입",
    email: lang==="en" ? "Email" : "이메일",
    password: lang==="en" ? "Password" : "비밀번호",
    login: lang==="en" ? "Login" : "로그인",
    register: lang==="en" ? "Register" : "회원가입",
  };

  async function submit(path: "/api/login" | "/api/register") {
    setErr(null);
    const res = await fetch(path, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email, password }) });
    if (!res.ok) { setErr((await res.json()).error || "error"); return; }
    location.href = "/dashboard";
  }

  return (
    <main className="container">
      <div className="card" style={{maxWidth:420, margin:"0 auto"}}>
        <h1 className="h1">{t.title}</h1>
        <label className="label">{t.email}</label>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="label" style={{marginTop:10}}>{t.password}</label>
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{display:"flex", gap:8, marginTop:12}}>
          <button className="btn" onClick={()=>submit("/api/login")}>{t.login}</button>
          <button className="btn" onClick={()=>submit("/api/register")}>{t.register}</button>
        </div>
        {err && <p className="text-red" style={{marginTop:8}}>{err}</p>}
      </div>
    </main>
  );
}
