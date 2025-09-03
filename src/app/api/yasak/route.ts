import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const yasak = await prisma.yasak.findFirst();
    return NextResponse.json({ words: yasak?.wrongWords || [] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Hata oluştu" },
      { status: 500 }
    );
  }
}
