import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ CORS headers
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ GET -> Tek etkinlik
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Promise çözümü

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Geçersiz etkinlik ID formatı" },
        { status: 400, headers: corsHeaders }
      );
    }

    const db = await getDb();
    const event = await db
      .collection("Event")
      .findOne({ _id: new ObjectId(id) });

    if (!event) {
      return NextResponse.json(
        { error: "Etkinlik bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(event, { headers: corsHeaders });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Etkinlik getirilemedi";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ PATCH -> Etkinlik güncelle
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Promise çözümü

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Geçersiz etkinlik ID formatı" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const db = await getDb();

    const updateResult = await db
      .collection("Event")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...body, updatedAt: new Date() } },
        { returnDocument: "after" as const }
      );

    const updatedEvent = updateResult?.value;

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "Güncellenecek etkinlik bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(updatedEvent, { headers: corsHeaders });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Etkinlik güncellenemedi";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ DELETE -> Etkinlik sil
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Promise çözümü

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Geçersiz etkinlik ID formatı" },
        { status: 400, headers: corsHeaders }
      );
    }

    const db = await getDb();
    const deleteResult = await db
      .collection("Event")
      .deleteOne({ _id: new ObjectId(id) });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Silinecek etkinlik bulunamadı" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "Etkinlik başarıyla silindi" },
      { headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Etkinlik silinemedi";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ OPTIONS handler - CORS için
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: corsHeaders,
  });
}
