import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const academics = await prisma.academic.findMany({
      select: { tags: true },
    });

    // Ensure tags are an array, even if empty
    const allTags = academics.flatMap((a) => a.tags || []);
    const uniqueTags = [...new Set(allTags)];

    // Return the unique tags with a clear key 'tags'
    return NextResponse.json({ tags: uniqueTags });
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return NextResponse.json(
      { error: "Etiketler alınırken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
