import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Next.js 15: params artık Promise
interface Params {
  params: Promise<{ id: string }>;
}

// GET: Tek rol
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: roleId } = await params;
    if (!roleId) {
      return NextResponse.json({ error: "Rol ID'si gerekli" }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { person: true },
    });

    if (!role) {
      return NextResponse.json({ error: "Rol bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (err: any) {
    console.error("Rol getirme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Rol güncelleme
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: roleId } = await params;
    if (!roleId) {
      return NextResponse.json({ error: "Rol ID'si gerekli" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.role.update({
      where: { id: roleId },
      data: {
        title: body.title,
        organization: body.organization,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Rol güncelleme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: Rol silme
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: roleId } = await params;
    if (!roleId) {
      return NextResponse.json({ error: "Rol ID'si gerekli" }, { status: 400 });
    }

    await prisma.role.delete({ where: { id: roleId } });

    return NextResponse.json({
      success: true,
      message: "Rol başarıyla silindi.",
    });
  } catch (err: any) {
    console.error("Rol silme hatası:", err);
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Silinecek rol bulunamadı." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
