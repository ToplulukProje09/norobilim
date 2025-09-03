// /api/events/upload
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Cloudinary yapılandırmasını environment değişkenlerinden alın
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Dosya yükleme işlemini bir Promise ile sarar.
 * @param file Dosya verisi (Buffer)
 * @returns Yüklenen dosyanın URL'si
 */
const uploadFileToCloudinary = async (file: Buffer): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "user-uploads" },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary'den yanıt alınamadı."));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    // Buffer'ı bir Readable stream'e dönüştürerek upload_stream'e gönderin
    Readable.from(file).pipe(stream);
  });
};

/**
 * Cloudinary'ye dosya yükleme API rotası.
 * Gelen FormData'yı işler, dosyaları Cloudinary'ye yükler ve URL'lerini döndürür.
 * @param req Next.js'in Request nesnesi
 * @returns JSON yanıtı içeren NextResponse nesnesi
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      // If no files are found under "files", check for "file" (single file upload)
      const singleFile = formData.get("file");
      if (singleFile instanceof File) {
        files.push(singleFile);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return uploadFileToCloudinary(buffer);
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls: uploadedUrls });
  } catch (err) {
    console.error("Yükleme işlemi sırasında hata:", err);
    return NextResponse.json(
      {
        error:
          (err as Error)?.message || "Bilinmeyen bir yükleme hatası oluştu.",
      },
      { status: 500 }
    );
  }
}
