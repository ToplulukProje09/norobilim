import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getDb } from "@/lib/mongodb";

/* ---------------------- Cloudinary config ---------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/* ---------------------- Upload API ---------------------- */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Birden fazla dosyayı yakala
    const files = formData
      .getAll("file")
      .filter((f): f is File => f instanceof File);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Dosya bulunamadı, form-data ile göndermeyi unutma." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("uploads");

    const uploaded: {
      url: string;
      public_id: string;
      createdAt: Date;
    }[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Cloudinary'ye yükle
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "mainmenu", // Cloudinary'de klasör adı
            resource_type: "auto",
          },
          (error, res) => {
            if (error) return reject(error);
            if (!res) return reject(new Error("Cloudinary yanıt vermedi"));
            resolve(res);
          }
        );
        stream.end(buffer);
      });

      const doc = {
        url: result.secure_url,
        public_id: result.public_id,
        createdAt: new Date(),
      };

      // MongoDB’ye kaydet
      await collection.insertOne(doc);

      uploaded.push(doc);
    }

    return NextResponse.json({ files: uploaded }, { status: 201 });
  } catch (err: any) {
    console.error("❌ UPLOAD hata:", err);
    return NextResponse.json(
      { error: err?.message || "Bilinmeyen upload hatası" },
      { status: 500 }
    );
  }
}
