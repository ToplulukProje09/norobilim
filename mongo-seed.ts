// mongo-seed.ts
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

async function main() {
  const db = await getDb();

  /* -------------------- AUTH -------------------- */
  const hashedPassword = await bcrypt.hash("hipokrat", 10);

  await db
    .collection("Auth")
    .updateOne(
      { id: "singleton" },
      { $set: { username: "admin", password: hashedPassword } },
      { upsert: true }
    );
  console.log("✅ Admin kullanıcısı eklendi");

  /* -------------------- MAIN MENU -------------------- */
  await db.collection("MainMenu").updateOne(
    { id: "singleton" },
    {
      $set: {
        titlePrimary: "Ana Başlık",
        titleSecondary: "Alt Başlık",
        mainLogo: "https://example.com/logo.png",
        mainPhoto: "https://example.com/photo.jpg",
        aboutParagraph: "Bizim hakkımızda kısa bilgi",
        mainParagraph: "Ana sayfa açıklaması",
        socialLinks: ["https://twitter.com/test", "https://github.com/test"],
        email: "info@example.com",
      },
    },
    { upsert: true }
  );

  console.log("✅ MainMenu eklendi");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed hatası:", err);
  process.exit(1);
});
