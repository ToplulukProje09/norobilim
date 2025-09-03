import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const podcasts = await prisma.podcast.findMany({
      select: { speakers: true },
    });

    if (!podcasts || podcasts.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const allSpeakers = podcasts.flatMap((p) => p.speakers);
    const uniqueSpeakers = [...new Set(allSpeakers)];

    return NextResponse.json({ data: uniqueSpeakers });
  } catch (error) {
    console.error("Konuşmacılar getirilirken hata:", error);
    return NextResponse.json(
      { error: "Konuşmacılar alınamadı" },
      { status: 500 }
    );
  }
}
