import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Academic, AcademicDoc } from "@/types/academic";
import { z } from "zod";

/* ---------------------- Zod Schemas ---------------------- */
const academicSchema = z.object({
  title: z.string().min(1, "Başlık gerekli."),
  description: z.string().nullable().optional(),
  links: z.array(z.string()).default([]),
  files: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  published: z.boolean().optional(),
});

const publishedSchema = z.object({
  published: z.boolean(),
});

/* ---------------------- Helpers ---------------------- */
function mapMongoDoc(doc: AcademicDoc): Academic {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? undefined,
    links: doc.links ?? [],
    files: doc.files ?? [],
    tags: doc.tags ?? [],
    published: doc.published ?? false,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt
        : new Date(doc.createdAt as unknown as string),
    updatedAt: doc.updatedAt
      ? doc.updatedAt instanceof Date
        ? doc.updatedAt
        : new Date(doc.updatedAt as unknown as string)
      : undefined,
  };
}

/* ---------------------- GET ---------------------- */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Promise çözülmeli
    const client = await clientPromise;
    const db = client.db();

    const doc = await db
      .collection<AcademicDoc>("Academic")
      .findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Kayıt bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: mapMongoDoc(doc) });
  } catch (error) {
    console.error("[GET /academic/:id] HATA:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}

/* ---------------------- PUT (full update) ---------------------- */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Promise çözülmeli
    const client = await clientPromise;
    const db = client.db();
    const col = db.collection<AcademicDoc>("Academic");

    const body = academicSchema.parse(await req.json());
    const filter = { _id: new ObjectId(id) };

    const upd = await col.updateOne(filter, {
      $set: { ...body, updatedAt: new Date() },
    });

    if (upd.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Güncellenecek kayıt bulunamadı." },
        { status: 404 }
      );
    }

    const doc = await col.findOne(filter);
    return NextResponse.json({ success: true, data: mapMongoDoc(doc!) });
  } catch (error) {
    console.error("[PUT /academic/:id] HATA:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}

/* ---------------------- PATCH (only published) ---------------------- */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Promise çözülmeli
    const client = await clientPromise;
    const db = client.db();
    const col = db.collection<AcademicDoc>("Academic");

    const body = publishedSchema.parse(await req.json());
    const filter = { _id: new ObjectId(id) };

    const upd = await col.updateOne(filter, {
      $set: { published: body.published, updatedAt: new Date() },
    });

    if (upd.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Güncellenecek kayıt bulunamadı." },
        { status: 404 }
      );
    }

    const doc = await col.findOne(filter);
    return NextResponse.json({ success: true, data: mapMongoDoc(doc!) });
  } catch (error) {
    console.error("[PATCH /academic/:id] HATA:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}

/* ---------------------- DELETE ---------------------- */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Promise çözülmeli
    const client = await clientPromise;
    const db = client.db();

    const res = await db
      .collection<AcademicDoc>("Academic")
      .deleteOne({ _id: new ObjectId(id) });

    if (res.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Silinecek kayıt bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kayıt başarıyla silindi.",
    });
  } catch (error) {
    console.error("[DELETE /academic/:id] HATA:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}
