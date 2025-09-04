// app/api/persons/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

// ✅ Next.js 15 uyumlu ayarlar
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ Cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64File}`;

    // ✅ Cloudinary'ye yükle
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "persons",
      public_id: uuidv4(),
    });

    if (!result || !result.secure_url) {
      throw new Error("Cloudinary'den geçerli bir yanıt alınamadı.");
    }

    console.log("Dosya başarıyla yüklendi:", result.secure_url);

    return NextResponse.json({ url: result.secure_url });
  } catch (err: any) {
    console.error("Yükleme sırasında hata oluştu:", err);
    return NextResponse.json(
      { error: err?.message || "Bilinmeyen bir yükleme hatası." },
      { status: 500 }
    );
  }
}
