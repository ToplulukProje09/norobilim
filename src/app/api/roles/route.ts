import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Tüm rolleri ve ilişkili kişileri getirir
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: { person: true },
    });
    return NextResponse.json(roles);
  } catch (err: any) {
    console.error("Tüm rolleri getirme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Yeni bir rol oluşturur
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personId, title, organization, startDate, endDate } = body;

    // Sadece personId, title ve organization alanları zorunludur.
    if (!personId || !title || !organization) {
      return NextResponse.json(
        { error: "personId, title ve organization alanları zorunludur." },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        personId,
        title,
        organization,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({
      message: "Rol başarıyla oluşturuldu.",
      data: role,
    });
  } catch (err: any) {
    console.error("Yeni rol oluşturma hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
