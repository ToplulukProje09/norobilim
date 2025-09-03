// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// ✅ Global declaration for development hot reloading
declare global {
  var prisma: PrismaClient | undefined;
}

// ✅ Prisma Client with proper configuration for Vercel
const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// ✅ Prevent multiple instances in development
if (process.env.NODE_ENV === "development") {
  globalThis.prisma = prisma;
}

// ✅ Graceful shutdown handling
if (typeof window === "undefined") {
  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

export { prisma };
