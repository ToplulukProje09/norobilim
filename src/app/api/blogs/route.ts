import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (err: any) {
    console.error("GET /api/blogs error:", err);
    return NextResponse.json(
      { error: err.message || "Posts could not be fetched" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.title || !data.description || !data.mainPhoto) {
      return NextResponse.json(
        { error: "title, description ve mainPhoto gerekli" },
        { status: 400 }
      );
    }
    const newPost = await prisma.post.create({
      data: {
        title: data.title,
        description: data.description,
        paragraph: data.paragraph || "",
        shortText: data.shortText || "",
        mainPhoto: data.mainPhoto,
        images: Array.isArray(data.images) ? data.images : [],
        comments: [],
        show: true, // 🚀 her zaman yayında başlar
        commentsAllowed: true, // 🚀 her zaman yorumlara açık başlar
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/blogs error:", err);
    return NextResponse.json(
      { error: err.message || "Post could not be created" },
      { status: 500 }
    );
  }
}
