// app/api/yasak/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const oldWord: string = body.oldWord?.trim();
    const newWord: string = body.newWord?.trim();

    if (!oldWord || !newWord) {
      return NextResponse.json(
        { error: "Eski ve yeni kelime gerekli" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const yasak = await db.collection("Yasak").findOne({});

    if (!yasak) {
      return NextResponse.json(
        { error: "Yasak kelime listesi bulunamadı" },
        { status: 404 }
      );
    }

    // wrongWords dizisini güncelle
    const updatedWords = (yasak.wrongWords || []).map((w: string) =>
      w.toLowerCase() === oldWord.toLowerCase() ? newWord : w
    );

    await db
      .collection("Yasak")
      .updateOne({ _id: yasak._id }, { $set: { wrongWords: updatedWords } });

    return NextResponse.json({ words: updatedWords });
  } catch (err: any) {
    console.error("PUT /yasak hata:", err);
    return NextResponse.json(
      { error: err.message || "Hata oluştu" },
      { status: 500 }
    );
  }
}
