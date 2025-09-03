// prisma/seed.ts
import { prisma } from "@/lib/prisma"; // ✅ alias kullan
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("hipokrat", 10);

  await prisma.auth.upsert({
    where: { id: "singleton" },
    update: {
      username: "admin",
      password: hashedPassword,
    },
    create: {
      id: "singleton",
      username: "admin",
      password: hashedPassword,
    },
  });

  console.log("✅ Admin kullanıcısı eklendi");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
