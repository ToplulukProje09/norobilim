import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Basit cache
const listensCache = new Map<string, { count: number; lastListen: Date }>();

function getClientIP(req: Request) {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  return xForwardedFor ? xForwardedFor.split(",")[0].trim() : "unknown-ip";
}

async function isListenAllowed(ip: string, podcastId: string) {
  const cacheKey = `${ip}-${podcastId}`;
  const now = new Date();
  const cachedData = listensCache.get(cacheKey);

  if (cachedData) {
    const today = new Date().toDateString();
    const lastListenDay = cachedData.lastListen.toDateString();

    // Günlük max 2 defa
    if (today === lastListenDay) {
      if (cachedData.count >= 2) return false;
    } else {
      cachedData.count = 0;
    }

    // 2 saat arası kuralı
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    if (now.getTime() - cachedData.lastListen.getTime() < twoHoursInMs) {
      return false;
    }
  }

  listensCache.set(cacheKey, {
    count: cachedData ? cachedData.count + 1 : 1,
    lastListen: now,
  });

  return true;
}

// ✅ GET → Tek podcast getir
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const podcast = await prisma.podcast.findUnique({ where: { id } });

    if (!podcast) {
      return NextResponse.json(
        { message: "Podcast bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(podcast);
  } catch (error) {
    console.error("Podcast getirilirken hata oluştu:", error);
    return NextResponse.json(
      { message: "Podcast alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// ✅ PUT → Podcast güncelle
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await prisma.podcast.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        audioUrl: body.audioUrl,
        coverImage: body.coverImage,
        duration: body.duration,
        speakers: body.speakers,
        seriesTitle: body.seriesTitle,
        episodeNumber: body.episodeNumber,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
        tags: body.tags,
        isPublished: body.isPublished,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Podcast güncellenirken hata oluştu:", error);
    return NextResponse.json(
      { message: "Podcast güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// ✅ PATCH → Publish toggle / Dinlenme artır
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const clientIP = getClientIP(req);

    let updated;

    if (body.action === "toggle-publish") {
      updated = await prisma.podcast.update({
        where: { id },
        data: { isPublished: body.isPublished },
      });
    }

    if (body.action === "spotify-listen") {
      const allowed = await isListenAllowed(clientIP, id);
      if (!allowed) {
        return NextResponse.json(
          { message: "Dinlenme sınırı aşıldı. Daha sonra tekrar deneyin." },
          { status: 429 }
        );
      }

      updated = await prisma.podcast.update({
        where: { id },
        data: { listens: { increment: 1 } },
      });
    }

    if (!updated) {
      return NextResponse.json({ message: "Geçersiz işlem." }, { status: 400 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH isteğinde hata oluştu:", error);
    return NextResponse.json(
      { message: "İstek işlenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// ✅ DELETE → Podcast sil
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.podcast.delete({ where: { id } });

    return NextResponse.json({ message: "Podcast başarıyla silindi." });
  } catch (error) {
    console.error("Podcast silinirken hata oluştu:", error);
    return NextResponse.json(
      { message: "Podcast silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
