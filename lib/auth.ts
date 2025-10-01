import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const COOKIE = "cmd_session";
const secretKey = process.env.JWT_SECRET || "";
const secret = new TextEncoder().encode(secretKey);

// 우리가 담을 세션 페이로드 형태
export type SessionPayload = {
  uid: string;
  email: string;
} & JWTPayload;

export async function signToken(payload: { uid: string; email: string }) {
  if (!secretKey) throw new Error("JWT_SECRET missing");

  // JWTPayload로 맞춰서 전달
  const p: SessionPayload = { ...payload };

  return await new SignJWT(p)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getSessionUser() {
  const cookie = cookies().get(COOKIE)?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(cookie, secret);
    return { uid: payload.uid, email: payload.email };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}
