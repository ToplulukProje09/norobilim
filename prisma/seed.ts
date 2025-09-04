// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  /* -------------------- AUTH -------------------- */
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

  /* -------------------- MAIN MENU -------------------- */
  await prisma.mainMenu.upsert({
    where: { id: "singleton" },
    update: {
      titlePrimary: "Ana Başlık",
      titleSecondary: "Alt Başlık",
      mainLogo: "https://example.com/logo.png",
      mainPhoto: "https://example.com/photo.jpg",
      aboutParagraph: "Bizim hakkımızda kısa bilgi",
      mainParagraph: "Ana sayfa açıklaması",
      socialLinks: ["https://twitter.com/test", "https://github.com/test"],
      email: "info@example.com",
    },
    create: {
      id: "singleton",
      titlePrimary: "Ana Başlık",
      titleSecondary: "Alt Başlık",
      mainLogo: "https://example.com/logo.png",
      mainPhoto: "https://example.com/photo.jpg",
      aboutParagraph: "Bizim hakkımızda kısa bilgi",
      mainParagraph: "Ana sayfa açıklaması",
      socialLinks: ["https://twitter.com/test", "https://github.com/test"],
      email: "info@example.com",
    },
  });

  console.log("✅ MainMenu eklendi");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
