// app/api/podcasts/series/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();

    // Null olmayan seriesTitle alanlarını al
    const podcasts = await db
      .collection("Podcast")
      .find({ seriesTitle: { $ne: null } }, { projection: { seriesTitle: 1 } })
      .toArray();

    if (!podcasts || podcasts.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Null değerleri filtrele ve benzersiz başlıkları çıkar
    const allSeriesTitles = podcasts
      .map((p) => p.seriesTitle)
      .filter((title): title is string => !!title);

    const uniqueSeriesTitles = [...new Set(allSeriesTitles)];

    return NextResponse.json({ data: uniqueSeriesTitles });
  } catch (error: any) {
    console.error("Seri başlıkları getirilirken hata:", error);
    return NextResponse.json(
      { error: error?.message || "Seri başlıkları alınamadı" },
      { status: 500 }
    );
  }
}
