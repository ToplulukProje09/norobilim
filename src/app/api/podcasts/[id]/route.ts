import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

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

  const today = now.toDateString();

  if (cachedData) {
    const lastListenDay = cachedData.lastListen.toDateString();

    if (today === lastListenDay) {
      if (cachedData.count >= 2) return false;

      const twoHoursInMs = 2 * 60 * 60 * 1000;
      if (now.getTime() - cachedData.lastListen.getTime() < twoHoursInMs) {
        return false;
      }

      listensCache.set(cacheKey, {
        count: cachedData.count + 1,
        lastListen: now,
      });
      return true;
    }
  }

  listensCache.set(cacheKey, { count: 1, lastListen: now });
  return true;
}

// ✅ GET → Tek podcast getir
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Geçersiz podcast ID" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const podcast = await db
      .collection("Podcast")
      .findOne({ _id: new ObjectId(id) });

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
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Geçersiz podcast ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const db = await getDb();

    await db
      .collection("Podcast")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...body, updatedAt: new Date() } }
      );

    const updated = await db
      .collection("Podcast")
      .findOne({ _id: new ObjectId(id) });

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
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Geçersiz podcast ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const clientIP = getClientIP(req);
    const db = await getDb();

    let updated;

    if (body.action === "toggle-publish") {
      await db
        .collection("Podcast")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { isPublished: body.isPublished, updatedAt: new Date() } }
        );
      updated = await db
        .collection("Podcast")
        .findOne({ _id: new ObjectId(id) });
    }

    if (body.action === "spotify-listen") {
      const allowed = await isListenAllowed(clientIP, id);
      if (!allowed) {
        return NextResponse.json(
          { message: "Dinlenme sınırı aşıldı. Daha sonra tekrar deneyin." },
          { status: 429 }
        );
      }
      await db
        .collection("Podcast")
        .updateOne(
          { _id: new ObjectId(id) },
          { $inc: { listens: 1 }, $set: { updatedAt: new Date() } }
        );
      updated = await db
        .collection("Podcast")
        .findOne({ _id: new ObjectId(id) });
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
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Geçersiz podcast ID" },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    const result = await db
      .collection("Podcast")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Podcast bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Podcast başarıyla silindi." });
  } catch (error) {
    console.error("Podcast silinirken hata oluştu:", error);
    return NextResponse.json(
      { message: "Podcast silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
