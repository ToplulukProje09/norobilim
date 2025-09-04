// app/api/events/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// 🔐 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ✅ Helper: Cloudinary’ye dosya yükleme
const uploadFileToCloudinary = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "events" }, // klasör ismi
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary'den yanıt alınamadı."));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // ✅ Next.js 15 için Readable.fromWeb kullan
    Readable.fromWeb(new Response(buffer).body as any).pipe(uploadStream);
  });
};

// ✅ POST handler
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Çoklu veya tekli dosya desteği
    const files: File[] = [];
    formData.getAll("files").forEach((f) => {
      if (f instanceof File) files.push(f);
    });

    const singleFile = formData.get("file");
    if (singleFile instanceof File) files.push(singleFile);

    if (files.length === 0) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // ✅ Upload
    const uploadedUrls = await Promise.all(
      files.map((file) => uploadFileToCloudinary(file))
    );

    return NextResponse.json({ urls: uploadedUrls }, { status: 200 });
  } catch (err: any) {
    console.error("Upload hatası:", err);
    return NextResponse.json(
      { error: err?.message || "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}
