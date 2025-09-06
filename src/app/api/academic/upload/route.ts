// app/api/academic/upload/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file)
      return NextResponse.json({ error: "Dosya yok" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const originalName = (file as any).name || `file_${Date.now()}`;
    const safeName = originalName.split(".")[0].replace(/[^a-zA-Z0-9_-]/g, "_");
    const public_id = `${safeName}_${Date.now()}`;
    const mimeType = (file as any).type || "application/octet-stream";

    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${base64}`,
      { resource_type: "raw", public_id, overwrite: true }
    );

    const db = await getDb();
    await db.collection("academicFiles").insertOne({
      public_id,
      url: result.secure_url,
      file_name: originalName,
      createdAt: new Date(),
    });

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id,
      file_name: originalName,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const public_id = searchParams.get("public_id");
    const db = await getDb();

    if (action === "download") {
      if (!public_id)
        return NextResponse.json(
          { error: "public_id gerekli" },
          { status: 400 }
        );

      const fileRecord = await db
        .collection("academicFiles")
        .findOne({ public_id });
      if (!fileRecord)
        return NextResponse.json(
          { error: "Dosya bulunamadı" },
          { status: 404 }
        );

      const fileUrl = fileRecord.url;
      const fileName = fileRecord.file_name; // Orijinal adı alıyoruz

      const res = await fetch(fileUrl);
      const fileBuffer = await res.arrayBuffer();

      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    // Default: listeleme
    const files = await db.collection("academicFiles").find().toArray();
    return NextResponse.json(files);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const public_id = searchParams.get("public_id");
    if (!public_id)
      return NextResponse.json({ error: "public_id gerekli" }, { status: 400 });

    const db = await getDb();

    // Cloudinary’den sil
    await cloudinary.uploader.destroy(public_id, { resource_type: "raw" });

    // MongoDB’den sil
    await db.collection("academicFiles").deleteOne({ public_id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
