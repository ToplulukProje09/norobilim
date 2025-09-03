// src/app/api/academics/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Academic } from "@prisma/client"; // Prisma'dan otomatik türleri içe aktarın

// ✅ GET → Tüm akademik kayıtları sayfalama, filtreleme ve arama ile listeler.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Parametreleri güvenli bir şekilde ayrıştır
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const publishedOnly = searchParams.get("published") === "true";
    const searchQuery = searchParams.get("q") || ""; // Arama sorgusu için yeni parametre

    const skip = (page - 1) * limit;

    // Dinamik `where` koşulu oluştur
    const where: any = {
      ...(publishedOnly && { published: true }),
    };

    // Arama sorgusu varsa filtreye ekle
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const [academics, total] = await Promise.all([
      prisma.academic.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.academic.count({ where }),
    ]);

    return NextResponse.json({
      data: academics,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Akademik kayıtlar getirilirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Akademik kayıtlar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// ✅ POST → Yeni akademik kayıt oluşturur.
export async function POST(req: Request) {
  try {
    const body: Partial<Academic> = await req.json();

    // Zorunlu alanların varlığını ve tiplerini doğrulama
    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json(
        { error: "Başlık zorunlu bir string'dir." },
        { status: 400 }
      );
    }
    if (body.tags && !Array.isArray(body.tags)) {
      return NextResponse.json(
        { error: "Etiketler bir dizi olmalıdır." },
        { status: 400 }
      );
    }

    const newAcademic = await prisma.academic.create({
      data: {
        title: body.title,
        description: body.description,
        links: body.links || [],
        files: body.files || [],
        tags: body.tags || [],
        published: body.published ?? false, // 'published' için daha güvenli bir varsayılan değer
      },
    });

    return NextResponse.json(
      { message: "Akademik kayıt başarıyla oluşturuldu.", data: newAcademic },
      { status: 201 }
    );
  } catch (error) {
    console.error("Akademik kayıt oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Kayıt eklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
