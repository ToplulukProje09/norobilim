// lib/prisma.ts

import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const DATABASE_URL =
  "mongodb+srv://toplulukproje_db_user:yDDNlT7CnNdM3i1N@cluster0.fjsjezr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // <-- ENV yerine buraya yapıştır

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
