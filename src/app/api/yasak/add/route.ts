// app/api/yasak/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface YasakDoc {
  _id?: ObjectId;
  wrongWords: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const word: string = body.word?.trim();

    if (!word) {
      return NextResponse.json({ error: "Kelime boş olamaz" }, { status: 400 });
    }

    const db = await getDb();
    const yasak = await db.collection<YasakDoc>("Yasak").findOne({});

    if (!yasak) {
      // Yeni kayıt oluştur
      await db.collection("Yasak").insertOne({ wrongWords: [word] });
      return NextResponse.json({ words: [word] });
    }

    const newWords = [...new Set([...(yasak.wrongWords || []), word])];

    await db
      .collection("Yasak")
      .updateOne({ _id: yasak._id }, { $set: { wrongWords: newWords } });

    return NextResponse.json({ words: newWords });
  } catch (err: any) {
    console.error("POST /yasak hata:", err);
    return NextResponse.json(
      { error: err.message || "Hata oluştu" },
      { status: 500 }
    );
  }
}
