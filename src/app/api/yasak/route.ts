// app/api/yasak/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const yasak = await db.collection("Yasak").findOne({});

    return NextResponse.json({ words: yasak?.wrongWords || [] });
  } catch (err: any) {
    console.error("Yasaklı kelimeler alınırken hata:", err);
    return NextResponse.json(
      { error: err.message || "Hata oluştu" },
      { status: 500 }
    );
  }
}
