// app/api/yasak/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const word: string = body.word?.trim();

    if (!word) {
      return NextResponse.json(
        { error: "Kelime belirtilmedi" },
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

    const filteredWords = (yasak.wrongWords || []).filter(
      (w: string) => w.toLowerCase() !== word.toLowerCase()
    );

    await db
      .collection("Yasak")
      .updateOne({ _id: yasak._id }, { $set: { wrongWords: filteredWords } });

    return NextResponse.json({ words: filteredWords });
  } catch (err: any) {
    console.error("DELETE /yasak hata:", err);
    return NextResponse.json(
      { error: err.message || "Hata oluştu" },
      { status: 500 }
    );
  }
}
