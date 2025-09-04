// app/api/person/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Tüm kişiler (+ roller)
export async function GET() {
  try {
    const db = await getDb();

    // Person + roller join
    const persons = await db
      .collection("Person")
      .aggregate([
        {
          $lookup: {
            from: "Role",
            localField: "_id",
            foreignField: "personId",
            as: "roles",
          },
        },
      ])
      .toArray();

    return NextResponse.json(persons);
  } catch (err: any) {
    console.error("Tüm kişileri getirme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Yeni kişi (+ roller)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { socialMedia, roles = [], ...personData } = body;

    if (!personData.name) {
      return NextResponse.json({ error: "İsim zorunludur." }, { status: 400 });
    }

    const db = await getDb();

    // ✅ Önce kişiyi oluştur
    const insertPerson = await db.collection("Person").insertOne({
      ...personData,
      socialMedia: socialMedia || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const personId = insertPerson.insertedId;

    // ✅ Roller varsa ekle
    if (roles.length > 0) {
      const rolesToInsert = roles.map((r: any) => ({
        title: r.title,
        organization: r.organization || null,
        startDate: r.startDate ? new Date(r.startDate) : null,
        endDate: r.endDate ? new Date(r.endDate) : null,
        personId: personId,
      }));

      await db.collection("Role").insertMany(rolesToInsert);
    }

    // ✅ Kişiyi roller ile birlikte geri döndür
    const newPerson = await db
      .collection("Person")
      .aggregate([
        { $match: { _id: personId } },
        {
          $lookup: {
            from: "Role",
            localField: "_id",
            foreignField: "personId",
            as: "roles",
          },
        },
      ])
      .toArray();

    return NextResponse.json(newPerson[0]);
  } catch (err: any) {
    console.error("Yeni kişi oluşturma hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
