import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "cmd_session";
const secretKey = process.env.JWT_SECRET || "";
const secret = new TextEncoder().encode(secretKey);

export async function signToken(payload: object) {
  if (!secretKey) throw new Error("JWT_SECRET missing");
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getSessionUser() {
  const cookie = (await cookies()).get(COOKIE)?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, secret);
    return payload as { uid: string; email: string };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(COOKIE, "", { path: "/", maxAge: 0 });
}
