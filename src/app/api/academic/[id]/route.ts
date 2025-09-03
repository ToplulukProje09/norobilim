import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/* Schema                                                                     */
/* -------------------------------------------------------------------------- */

// PUT için full schema
const academicSchema = z.object({
  title: z.string().min(1, "Başlık gerekli."),
  description: z.string().nullable().optional(),
  links: z.array(z.string()).default([]),
  files: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  published: z.boolean().optional(),
});

// PATCH için sadece published
const publishedSchema = z.object({
  published: z.boolean(),
});

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

// 📍 GET → Tek akademik kayıt getir
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const academic = await prisma.academic.findUnique({ where: { id } });

    if (!academic) {
      return NextResponse.json(
        { success: false, error: "Kayıt bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: academic });
  } catch (error) {
    console.error("[GET /academic/:id] HATA:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}

// 📍 PUT → Akademik kayıt güncelle (full update)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await req.json();
    const body = academicSchema.parse(json);

    const updated = await prisma.academic.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PUT /academic/:id] HATA:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Güncellenecek kayıt bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}

// 📍 PATCH → Sadece published güncelle
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await req.json();
    const body = publishedSchema.parse(json);

    const updated = await prisma.academic.update({
      where: { id },
      data: { published: body.published },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[PATCH /academic/:id] HATA:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Güncellenecek kayıt bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}

// 📍 DELETE → Akademik kayıt sil
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const academicExists = await prisma.academic.findUnique({ where: { id } });
    if (!academicExists) {
      return NextResponse.json(
        { success: false, error: "Silinecek kayıt bulunamadı." },
        { status: 404 }
      );
    }

    await prisma.academic.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Kayıt başarıyla silindi.",
    });
  } catch (error) {
    console.error("[DELETE /academic/:id] HATA:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}
