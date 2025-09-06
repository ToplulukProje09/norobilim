// app/api/academic/upload/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Cloudinary public_id: unique, ama DB’de orijinal adı tutacağız
    const public_id = `${file.name.split(".")[0]}_${Date.now()}`;

    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${buffer.toString("base64")}`,
      {
        resource_type: "raw",
        public_id,
        overwrite: true,
      }
    );

    // MongoDB kaydı: dosyanın orijinal adı
    const db = await getDb();
    await db.collection("academicFiles").insertOne({
      public_id,
      url: result.secure_url,
      file_name: file.name, // Orijinal adı ve uzantısı burada tutuluyor
      createdAt: new Date(),
    });

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id,
      file_name: file.name, // response da orijinal adı dönülüyor
    });
  } catch (err: any) {
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
