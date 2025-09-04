import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

// PUT için partial versiyon
const mainMenuUpdateSchema = mainMenuSchema.partial();

/* ------------------------------- GET ---------------------------------- */
export async function GET() {
  try {
    const data = await prisma.mainMenu.findUnique({
      where: { id: "singleton" },
    });

    if (!data) {
      return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET hata:", err?.message ?? err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/* ------------------------------- POST --------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = mainMenuSchema.parse(body);

    const saved = await prisma.mainMenu.upsert({
      where: { id: "singleton" },
      update: parsed,
      create: { id: "singleton", ...parsed },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    console.error("❌ POST hata:", err?.errors ?? err.message ?? err);
    return NextResponse.json(
      { error: err?.errors ?? err.message ?? "Geçersiz istek" },
      { status: 400 }
    );
  }
}

/* ------------------------------- PUT ---------------------------------- */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parsedUpdate = mainMenuUpdateSchema.parse(body);

    const existing = await prisma.mainMenu.findUnique({
      where: { id: "singleton" },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Kayıt bulunamadı. Önce POST ile oluşturun." },
        { status: 404 }
      );
    }

    const updated = await prisma.mainMenu.update({
      where: { id: "singleton" },
      data: parsedUpdate,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("❌ PUT hata:", err?.errors ?? err.message ?? err);
    return NextResponse.json(
      { error: err?.errors ?? err.message ?? "Geçersiz istek" },
      { status: 400 }
    );
  }
}

/* ------------------------------ DELETE -------------------------------- */
export async function DELETE() {
  try {
    await prisma.mainMenu.delete({
      where: { id: "singleton" },
    });
    return NextResponse.json({ message: "Silindi" });
  } catch (err: any) {
    console.error("❌ DELETE hata:", err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? "Silme işlemi başarısız" },
      { status: 400 }
    );
  }
}
