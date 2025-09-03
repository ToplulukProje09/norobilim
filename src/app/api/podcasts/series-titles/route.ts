import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Veritabanındaki tüm seri adlarını çek
    const podcasts = await prisma.podcast.findMany({
      select: { seriesTitle: true },
      where: {
        seriesTitle: {
          not: null,
        },
      },
    });

    if (!podcasts || podcasts.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Null değerleri ele ve benzersiz serileri al
    const allSeriesTitles = podcasts.flatMap((p) => p.seriesTitle || []);
    const uniqueSeriesTitles = [...new Set(allSeriesTitles)];

    return NextResponse.json({ data: uniqueSeriesTitles });
  } catch (error) {
    console.error("Seri başlıkları getirilirken hata:", error);
    return NextResponse.json(
      { error: "Seri başlıkları alınamadı" },
      { status: 500 }
    );
  }
}
