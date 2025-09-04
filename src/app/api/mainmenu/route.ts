import { NextResponse } from "next/server";
import { z } from "zod";
import { getMainMenuCollection } from "@/lib/mongodb";

/* ----------------------------- Zod Schema ----------------------------- */
const mainMenuSchema = z.object({
  titlePrimary: z.string().min(1, "Birinci başlık gerekli."),
  titleSecondary: z.string().min(1, "İkinci başlık gerekli."),
  mainLogo: z.string().url("Geçerli bir logo URL'si gerekli."),
  mainPhoto: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  aboutParagraph: z.string().optional().default(""),
  mainParagraph: z.string().optional().default(""),
  socialLinks: z.array(z.string().url()).optional().default([]),
  email: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .default(""),
});

// PUT için kısmi güncelleme
const mainMenuUpdateSchema = mainMenuSchema.partial();

/* ------------------------------- GET ---------------------------------- */
export async function GET() {
  try {
    const collection = await getMainMenuCollection();
    const data = await collection.findOne({ _id: "singleton" });

    if (!data) {
      return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ GET hata:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/* ------------------------------- POST --------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = mainMenuSchema.parse(body);

    const collection = await getMainMenuCollection();
    await collection.updateOne(
      { _id: "singleton" },
      { $set: parsed },
      { upsert: true }
    );

    return NextResponse.json({ _id: "singleton", ...parsed }, { status: 201 });
  } catch (err: any) {
    console.error("❌ POST hata:", err);
    return NextResponse.json(
      { error: err?.errors ?? err?.message ?? "Geçersiz istek" },
      { status: 400 }
    );
  }
}

/* ------------------------------- PUT ---------------------------------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parsedUpdate = mainMenuUpdateSchema.parse(body);

    const collection = await getMainMenuCollection();
    const result = await collection.updateOne(
      { _id: "singleton" },
      { $set: parsedUpdate }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı. Önce POST ile oluşturun." },
        { status: 404 }
      );
    }

    return NextResponse.json({ _id: "singleton", ...parsedUpdate });
  } catch (err: any) {
    console.error("❌ PUT hata:", err);
    return NextResponse.json(
      { error: err?.errors ?? err?.message ?? "Geçersiz istek" },
      { status: 400 }
    );
  }
}

/* ------------------------------ DELETE -------------------------------- */
export async function DELETE() {
  try {
    const collection = await getMainMenuCollection();
    await collection.deleteOne({ _id: "singleton" });
    return NextResponse.json({ message: "Silindi" });
  } catch (err: any) {
    console.error("❌ DELETE hata:", err);
    return NextResponse.json(
      { error: err?.message ?? "Silme işlemi başarısız" },
      { status: 400 }
    );
  }
}
