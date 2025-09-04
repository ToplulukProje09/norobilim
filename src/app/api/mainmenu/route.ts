import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/* ----------------------------- Zod Schema ----------------------------- */
const mainMenuSchema = z.object({
  titlePrimary: z.string().min(1, "Birinci başlık gerekli."),
  titleSecondary: z.string().min(1, "İkinci başlık gerekli."),
  mainLogo: z.string().url("Geçerli bir logo URL'si gerekli."),
  mainPhoto: z
    .string()
    .url("Geçerli bir fotoğraf URL'si gerekli.")
    .optional()
    .or(z.literal(""))
    .or(z.null()),
  aboutParagraph: z.string().optional().or(z.literal("")),
  mainParagraph: z.string().optional().or(z.literal("")),
  socialLinks: z.array(z.string().url()).optional().default([]),
  email: z.string().email().optional().or(z.literal("")),
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
    console.error("GET hata:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ------------------------------- POST --------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = mainMenuSchema.parse(body);

    const saved = await prisma.mainMenu.create({
      data: {
        id: "singleton",
        ...parsed,
        aboutParagraph: parsed.aboutParagraph || "",
        mainParagraph: parsed.mainParagraph || "",
        email: parsed.email || "",
        socialLinks: parsed.socialLinks ?? [],
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    console.error("❌ POST hata:", err.errors ?? err.message);
    return NextResponse.json(
      { error: err.errors ?? err.message },
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
      data: {
        ...parsedUpdate,
        socialLinks:
          parsedUpdate.socialLinks !== undefined
            ? parsedUpdate.socialLinks
            : existing.socialLinks,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("❌ PUT hata:", err.errors ?? err.message);
    return NextResponse.json(
      { error: err.errors ?? err.message },
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
    console.error("❌ DELETE hata:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
