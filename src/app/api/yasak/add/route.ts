import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const word: string = body.word?.trim();

    if (!word) {
      return NextResponse.json({ error: "Kelime boş olamaz" }, { status: 400 });
    }

    // Eğer yasak kaydı yoksa oluştur
    let yasak = await prisma.yasak.findFirst();
    if (!yasak) {
      yasak = await prisma.yasak.create({ data: { wrongWords: [word] } });
    } else {
      const newWords = [...new Set([...yasak.wrongWords, word])]; // Tekrarlayanları engelle
      yasak = await prisma.yasak.update({
        where: { id: yasak.id },
        data: { wrongWords: newWords },
      });
    }

    return NextResponse.json({ words: yasak.wrongWords });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Hata oluştu" },
      { status: 500 }
    );
  }
}
