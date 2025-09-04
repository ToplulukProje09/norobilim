// src/app/api/academics/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb"; // MongoDB bağlantı helper
import { ObjectId } from "mongodb";

// ✅ GET → Tüm akademik kayıtları sayfalama, filtreleme ve arama ile listeler.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const publishedOnly = searchParams.get("published") === "true";
    const searchQuery = searchParams.get("q") || "";

    const skip = (page - 1) * limit;

    const db = await getDb();
    const collection = db.collection("Academic");

    // Dinamik filtre
    const filter: any = {};
    if (publishedOnly) filter.published = true;

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: search },
      ];
    }

    const [academics, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
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
    const body = await req.json();

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

    const db = await getDb();
    const collection = db.collection("Academic");

    const newAcademic = {
      title: body.title,
      description: body.description || "",
      links: body.links || [],
      files: body.files || [],
      tags: body.tags || [],
      published: body.published ?? false,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newAcademic);

    return NextResponse.json(
      {
        message: "Akademik kayıt başarıyla oluşturuldu.",
        data: { id: result.insertedId, ...newAcademic },
      },
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
