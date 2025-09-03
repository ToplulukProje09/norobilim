import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// GET /api/podcasts?page=1&limit=10
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;

    const [podcasts, total] = await Promise.all([
      prisma.podcast.findMany({
        orderBy: { releaseDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.podcast.count(),
    ]);

    return NextResponse.json({
      data: podcasts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Podcastleri getirirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Podcastler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/podcasts
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.audioUrl) {
      return NextResponse.json(
        { error: "Başlık ve ses dosyası URL'si zorunludur." },
        { status: 400 }
      );
    }

    if (!isValidUrl(body.audioUrl)) {
      return NextResponse.json(
        { error: "Geçerli bir ses dosyası URL'si girilmelidir." },
        { status: 400 }
      );
    }

    const podcast = await prisma.podcast.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        audioUrl: body.audioUrl,
        coverImage: body.coverImage ?? null,
        duration: body.duration ?? null,
        speakers: body.speakers ?? [],
        seriesTitle: body.seriesTitle ?? null,
        episodeNumber: body.episodeNumber ?? null,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : new Date(),
        tags: body.tags ?? [],
        isPublished: body.isPublished ?? true,
        listens: body.listens ?? 0,
      },
    });

    return NextResponse.json(
      { message: "Podcast başarıyla oluşturuldu.", data: podcast },
      { status: 201 }
    );
  } catch (error) {
    console.error("Podcast oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Podcast eklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
