import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FAQ from "@/models/FAQ";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/faqs — list all active FAQs (public)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const filter: Record<string, unknown> = includeInactive ? {} : { isActive: true };

    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ faqs });
  } catch (error: unknown) {
    console.error("Get FAQs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/faqs — create an FAQ (admin only)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    await dbConnect();

    const faq = await FAQ.create({
      question: body.question,
      answer: body.answer,
      category: body.category || "General",
      order: body.order || 0,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({ faq }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create FAQ error:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
