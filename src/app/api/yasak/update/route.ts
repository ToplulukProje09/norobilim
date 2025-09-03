import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const oldWord: string = body.oldWord?.trim();
    const newWord: string = body.newWord?.trim();

    if (!oldWord || !newWord)
      return NextResponse.json(
        { error: "Eski ve yeni kelime gerekli" },
        { status: 400 }
      );

    const yasak = await prisma.yasak.findFirst();
    if (!yasak)
      return NextResponse.json(
        { error: "Yasak kelime listesi bulunamadı" },
        { status: 404 }
      );

    const updatedWords = yasak.wrongWords.map((w) =>
      w.toLowerCase() === oldWord.toLowerCase() ? newWord : w
    );

    await prisma.yasak.update({
      where: { id: yasak.id },
      data: { wrongWords: updatedWords },
    });

    return NextResponse.json({ words: updatedWords });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Hata oluştu" },
      { status: 500 }
    );
  }
}
