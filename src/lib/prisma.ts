// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // global type declaration (development hot reload için)
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Development ortamında prisma instance cache’le
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
