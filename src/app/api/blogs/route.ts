// app/api/blogs/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type Comment = {
  text: string;
  createdAt: Date;
};

type Post = {
  _id?: ObjectId;
  title: string;
  description: string;
  paragraph?: string;
  shortText?: string;
  mainPhoto: string;
  images: string[];
  comments: Comment[];
  show: boolean;
  commentsAllowed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/* ---------------------------- GET (Tüm postlar) ---------------------------- */
export async function GET() {
  try {
    const db = await getDb();
    const posts = await db
      .collection<Post>("Post")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // _id string’e dönüştür
    const safePosts = posts.map((p) => ({
      ...p,
      _id: p._id?.toHexString(),
    }));

    return NextResponse.json(safePosts);
  } catch (err: any) {
    console.error("❌ GET /api/blogs error:", err);
    return NextResponse.json(
      { error: err?.message || "Posts could not be fetched" },
      { status: 500 }
    );
  }
}

/* ----------------------------- POST (Yeni post) ---------------------------- */
export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.title || !data.description || !data.mainPhoto) {
      return NextResponse.json(
        { error: "title, description ve mainPhoto gerekli" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const col = db.collection<Post>("Post");

    const newPost: Post = {
      title: data.title,
      description: data.description,
      paragraph: data.paragraph || "",
      shortText: data.shortText || "",
      mainPhoto: data.mainPhoto,
      images: Array.isArray(data.images) ? data.images : [],
      comments: [],
      show: true, // 🚀 her zaman yayında başlar
      commentsAllowed: true, // 🚀 her zaman yorumlara açık başlar
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await col.insertOne(newPost);

    return NextResponse.json(
      { ...newPost, _id: result.insertedId.toHexString() },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ POST /api/blogs error:", err);
    return NextResponse.json(
      { error: err?.message || "Post could not be created" },
      { status: 500 }
    );
  }
}
