// app/api/podcasts/tags/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();

    // Sadece tags alanını al
    const podcasts = await db
      .collection("Podcast")
      .find({}, { projection: { tags: 1 } })
      .toArray();

    // Eğer hiç podcast yoksa boş dizi döndür
    if (!podcasts || podcasts.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Tüm podcast'lerin etiketlerini tek bir diziye topla
    const allTags = podcasts.flatMap((p) => p.tags || []);
    const uniqueTags = [...new Set(allTags)];

    return NextResponse.json({ data: uniqueTags });
  } catch (error: any) {
    console.error("Etiketler getirilirken hata:", error);
    return NextResponse.json(
      { error: error?.message || "Etiketler alınamadı" },
      { status: 500 }
    );
  }
}
