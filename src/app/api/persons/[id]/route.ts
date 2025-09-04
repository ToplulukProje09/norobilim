import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Tek kişi (+ roller)
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Promise çözümü

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Geçersiz kişi ID" }, { status: 400 });
    }

    const db = await getDb();
    const person = await db
      .collection("Person")
      .findOne({ _id: new ObjectId(id) });

    if (!person) {
      return NextResponse.json({ error: "Kişi bulunamadı" }, { status: 404 });
    }

    const roles = await db.collection("Role").find({ personId: id }).toArray();

    return NextResponse.json({ ...person, roles });
  } catch (err: any) {
    console.error("Kişi getirme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Kişi ve rollerin güncellenmesi
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Geçersiz kişi ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      department,
      class: personClass,
      photo,
      socialMedia,
      roles,
    } = body;

    const db = await getDb();

    // Rolleri güncelle
    if (Array.isArray(roles)) {
      await db.collection("Role").deleteMany({ personId: id });
      if (roles.length > 0) {
        await db.collection("Role").insertMany(
          roles.map((r: any) => ({
            title: r.title,
            organization: r.organization,
            startDate: r.startDate ? new Date(r.startDate) : null,
            endDate: r.endDate ? new Date(r.endDate) : null,
            personId: id,
          }))
        );
      }
    }

    // Kişiyi güncelle
    await db
      .collection("Person")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { name, department, class: personClass, photo, socialMedia } }
      );

    const updatedPerson = await db
      .collection("Person")
      .findOne({ _id: new ObjectId(id) });
    const updatedRoles = await db
      .collection("Role")
      .find({ personId: id })
      .toArray();

    return NextResponse.json({ ...updatedPerson, roles: updatedRoles });
  } catch (err: any) {
    console.error("Kişi güncelleme hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: Kişi silme (+ roller)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Geçersiz kişi ID" }, { status: 400 });
    }

    const db = await getDb();

    // Roller silinsin
    await db.collection("Role").deleteMany({ personId: id });

    // Kişi silinsin
    const deleteResult = await db
      .collection("Person")
      .deleteOne({ _id: new ObjectId(id) });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Silinecek kişi bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kişi ve ilişkili rolleri başarıyla silindi.",
    });
  } catch (err: any) {
    console.error("Kişi silme hatası:", err);
    return NextResponse.json(
      { error: err.message || "Beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
