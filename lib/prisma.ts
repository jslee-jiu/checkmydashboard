// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// 전역 타입 보강: 빌드/개발에서 globalThis.prisma를 안전하게 사용
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 개발 환경에서는 전역에 보관해 핫리로드 시 중복 연결 방지
export const prisma =
  globalThis.prisma ?? new PrismaClient({ /* log: ['query'] */ });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
