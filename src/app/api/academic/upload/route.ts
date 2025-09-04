// app/api/academic/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getDb } from "@/lib/mongodb"; // ✅ MongoDB bağlantısı

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ✅ POST → File Upload + MongoDB kayıt
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null; // ✅ opsiyonel: akademik kaydın başlığı
    const description = formData.get("description") as string | null; // ✅ opsiyonel açıklama
    const tags = (formData.getAll("tags") as string[]) || []; // ✅ çoklu tag desteği

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    // File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cloudinary upload promise wrapper
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "academic_uploads", // ✅ Cloudinary klasörü
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    // ✅ MongoDB'ye kaydet
    const db = await getDb();
    const academicCollection = db.collection("Academic");

    const newAcademic = {
      title: title || "Untitled",
      description: description || "",
      links: [],
      files: [uploadResult.secure_url], // ✅ Cloudinary URL kaydediyoruz
      tags,
      published: false,
      createdAt: new Date(),
    };

    const saved = await academicCollection.insertOne(newAcademic);

    return NextResponse.json(
      { id: saved.insertedId, ...newAcademic },
      { status: 201 }
    );
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Dosya yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
