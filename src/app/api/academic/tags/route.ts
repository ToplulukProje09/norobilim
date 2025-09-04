import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection("Academic");

    // Sadece tags alanlarını çek
    const academics = await collection
      .find({}, { projection: { tags: 1 } })
      .toArray();

    // tags null olabilir, o yüzden fallback boş dizi
    const allTags = academics.flatMap((a) => a.tags || []);
    const uniqueTags = [...new Set(allTags)];

    return NextResponse.json({ tags: uniqueTags });
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return NextResponse.json(
      { error: "Etiketler alınırken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
