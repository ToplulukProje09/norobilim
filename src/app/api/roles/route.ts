// app/api/roles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Tüm rolleri ve ilişkili kişileri getirir
export async function GET() {
  try {
    const db = await getDb();

    const roles = await db
      .collection("Role")
      .aggregate([
        {
          $lookup: {
            from: "Person",
            localField: "personId",
            foreignField: "_id",
            as: "person",
          },
        },
        { $unwind: { path: "$person", preserveNullAndEmptyArrays: true } },
      ])
      .toArray();

    return NextResponse.json(roles);
  } catch (err: any) {
    console.error("Tüm rolleri getirme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Yeni bir rol oluşturur
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personId, title, organization, startDate, endDate } = body;

    // Zorunlu alan kontrolü
    if (!personId || !title || !organization) {
      return NextResponse.json(
        { error: "personId, title ve organization alanları zorunludur." },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(personId)) {
      return NextResponse.json({ error: "Geçersiz personId" }, { status: 400 });
    }

    const db = await getDb();

    const role = {
      personId: new ObjectId(personId),
      title,
      organization,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    const result = await db.collection("Role").insertOne(role);

    return NextResponse.json({
      message: "Rol başarıyla oluşturuldu.",
      data: { ...role, _id: result.insertedId },
    });
  } catch (err: any) {
    console.error("Yeni rol oluşturma hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
