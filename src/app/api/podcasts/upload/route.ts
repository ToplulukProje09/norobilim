import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData
      .getAll("file")
      .filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(
        `Yüklenecek dosya: ${file.name}, size: ${buffer.length} bytes`
      );

      // Doğrudan Buffer'ı yüklemek için uploader.upload metodunu kullanıyoruz
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload(
          `data:${file.type};base64,${buffer.toString("base64")}`,
          { folder: "podcasts" },
          (error, res) => {
            if (error) {
              console.error("Cloudinary error:", error);
              reject(error);
            } else if (!res) {
              reject(new Error("Cloudinary'den yanıt alınamadı"));
            } else {
              resolve(res);
            }
          }
        );
      });

      uploadedUrls.push(result.secure_url);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (err: any) {
    console.error("Upload hatası:", err);
    return NextResponse.json(
      {
        error:
          err?.message || JSON.stringify(err) || "Bilinmeyen upload hatası",
      },
      { status: 500 }
    );
  }
}
