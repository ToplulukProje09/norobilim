// app/api/roles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

// GET: Tek rol
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: roleId } = await params;

    if (!roleId || !ObjectId.isValid(roleId)) {
      return NextResponse.json(
        { error: "Geçerli rol ID'si gerekli" },
        { status: 400 }
      );
    }

    const db = await getDb();

    const role = await db
      .collection("Role")
      .aggregate([
        { $match: { _id: new ObjectId(roleId) } },
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
      .next();

    if (!role) {
      return NextResponse.json({ error: "Rol bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (err: any) {
    console.error("Rol getirme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Rol güncelleme
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: roleId } = await params;

    if (!roleId || !ObjectId.isValid(roleId)) {
      return NextResponse.json(
        { error: "Geçerli rol ID'si gerekli" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const db = await getDb();

    const updateResult = await db.collection("Role").findOneAndUpdate(
      { _id: new ObjectId(roleId) },
      {
        $set: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.organization !== undefined && {
            organization: body.organization,
          }),
          ...(body.startDate !== undefined && {
            startDate: body.startDate ? new Date(body.startDate) : null,
          }),
          ...(body.endDate !== undefined && {
            endDate: body.endDate ? new Date(body.endDate) : null,
          }),
        },
      },
      { returnDocument: "after" }
    );

    if (!updateResult) {
      return NextResponse.json({ error: "Rol bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(updateResult);
  } catch (err: any) {
    console.error("Rol güncelleme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: Rol silme
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id: roleId } = await params;

    if (!roleId || !ObjectId.isValid(roleId)) {
      return NextResponse.json(
        { error: "Geçerli rol ID'si gerekli" },
        { status: 400 }
      );
    }

    const db = await getDb();

    const deleteResult = await db.collection("Role").deleteOne({
      _id: new ObjectId(roleId),
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Silinecek rol bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Rol başarıyla silindi.",
    });
  } catch (err: any) {
    console.error("Rol silme hatası:", err);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
