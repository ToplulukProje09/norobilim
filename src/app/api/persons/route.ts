import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Tüm kişiler (+ roller)
export async function GET() {
  try {
    const persons = await prisma.person.findMany({
      include: { roles: true },
    });
    return NextResponse.json(persons);
  } catch (err: any) {
    console.error("Tüm kişileri getirme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Yeni kişi (+ roller)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { socialMedia, roles = [], ...personData } = body;

    if (!personData.name) {
      return NextResponse.json({ error: "İsim zorunludur." }, { status: 400 });
    }

    const person = await prisma.person.create({
      data: {
        ...personData,
        socialMedia, // socialMedia alanı JSON olarak eklenir
        roles: {
          create: roles.map((r: any) => ({
            title: r.title,
            organization: r.organization,
            startDate: r.startDate ? new Date(r.startDate) : null,
            endDate: r.endDate ? new Date(r.endDate) : null,
          })),
        },
      },
      include: { roles: true },
    });

    return NextResponse.json(person);
  } catch (err: any) {
    console.error("Yeni kişi oluşturma hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
