import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const podcasts = await prisma.podcast.findMany({
      select: { tags: true },
    });

    // Eğer hiç podcast yoksa boş bir dizi döndür
    if (!podcasts || podcasts.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Tüm podcast'lerin etiketlerini tek bir diziye topla ve tekrarlayanları kaldır
    const allTags = podcasts.flatMap((p) => p.tags);
    const uniqueTags = [...new Set(allTags)];

    return NextResponse.json({ data: uniqueTags });
  } catch (error) {
    console.error("Etiketler getirilirken hata:", error);
    return NextResponse.json({ error: "Etiketler alınamadı" }, { status: 500 });
  }
}
