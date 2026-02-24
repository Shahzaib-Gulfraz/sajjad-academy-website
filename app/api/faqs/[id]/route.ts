import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FAQ from "@/models/FAQ";
import { requireAdmin } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/faqs/[id] — get single FAQ
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    await dbConnect();
    const faq = await FAQ.findById(id);

    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ faq });
  } catch (error: unknown) {
    console.error("Get FAQ error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/faqs/[id] — update FAQ (admin only)
export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    const body = await req.json();
    await dbConnect();

    const faq = await FAQ.findByIdAndUpdate(
      id,
      {
        question: body.question,
        answer: body.answer,
        category: body.category,
        order: body.order,
        isActive: body.isActive,
      },
      { new: true, runValidators: true }
    );

    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ faq });
  } catch (error: unknown) {
    console.error("Update FAQ error:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE /api/faqs/[id] — delete FAQ (admin only)
export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    await dbConnect();
    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "FAQ deleted successfully" });
  } catch (error: unknown) {
    console.error("Delete FAQ error:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
