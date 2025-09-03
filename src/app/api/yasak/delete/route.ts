import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const word: string = body.word?.trim();

    if (!word)
      return NextResponse.json(
        { error: "Kelime belirtilmedi" },
        { status: 400 }
      );

    const yasak = await prisma.yasak.findFirst();
    if (!yasak)
      return NextResponse.json(
        { error: "Yasak kelime listesi bulunamadı" },
        { status: 404 }
      );

    const filteredWords = yasak.wrongWords.filter(
      (w) => w.toLowerCase() !== word.toLowerCase()
    );

    await prisma.yasak.update({
      where: { id: yasak.id },
      data: { wrongWords: filteredWords },
    });

    return NextResponse.json({ words: filteredWords });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Hata oluştu" },
      { status: 500 }
    );
  }
}
