import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Next.js 15: params artık Promise
interface Params {
  params: Promise<{ id: string }>;
}

// GET: Tek kişi
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: personId } = await params;
    if (!personId) {
      return NextResponse.json(
        { error: "Kişi ID'si gerekli" },
        { status: 400 }
      );
    }

    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: { roles: true },
    });

    if (!person) {
      return NextResponse.json({ error: "Kişi bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (err: any) {
    console.error("Kişi getirme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Kişi ve rollerin güncellenmesi
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: personId } = await params;
    if (!personId) {
      return NextResponse.json(
        { error: "Kişi ID'si gerekli" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, department, personClass, photo, socialMedia, roles } = body;

    // Rolleri güncelleme
    if (roles !== undefined) {
      // Mevcut rolleri sil
      await prisma.role.deleteMany({
        where: { personId: personId },
      });
      // Yeni rolleri oluştur
      await prisma.person.update({
        where: { id: personId },
        data: {
          roles: {
            create: roles.map((r: any) => ({
              title: r.title,
              organization: r.organization,
              startDate: r.startDate ? new Date(r.startDate) : null,
              endDate: r.endDate ? new Date(r.endDate) : null,
            })),
          },
        },
      });
    }

    // Kişi bilgilerini güncelleme
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        name,
        department,
        class: personClass,
        photo,
        socialMedia, // JSON veri tipi için doğrudan eklenir
      },
      include: { roles: true },
    });

    return NextResponse.json(updatedPerson);
  } catch (err: any) {
    console.error("Kişi güncelleme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: Kişi silme
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: personId } = await params;
    if (!personId) {
      return NextResponse.json(
        { error: "Kişi ID'si gerekli" },
        { status: 400 }
      );
    }

    // Önce ilişkili Role kayıtlarını sil
    await prisma.role.deleteMany({
      where: {
        personId: personId,
      },
    });

    // Ardından Person kaydını sil
    await prisma.person.delete({
      where: { id: personId },
    });

    return NextResponse.json({
      success: true,
      message: "Kişi ve ilişkili rolleri başarıyla silindi.",
    });
  } catch (err: any) {
    console.error("Kişi silme hatası:", err);
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Silinecek kişi bulunamadı." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
