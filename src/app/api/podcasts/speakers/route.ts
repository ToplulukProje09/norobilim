// app/api/podcasts/speakers/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();

    // Sadece speakers alanını al
    const podcasts = await db
      .collection("Podcast")
      .find({}, { projection: { speakers: 1 } })
      .toArray();

    if (!podcasts || podcasts.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Tüm podcast'lerin konuşmacılarını tek diziye topla
    const allSpeakers = podcasts.flatMap((p) => p.speakers || []);
    const uniqueSpeakers = [...new Set(allSpeakers)];

    return NextResponse.json({ data: uniqueSpeakers });
  } catch (error: any) {
    console.error("Konuşmacılar getirilirken hata:", error);
    return NextResponse.json(
      { error: error?.message || "Konuşmacılar alınamadı" },
      { status: 500 }
    );
  }
}
