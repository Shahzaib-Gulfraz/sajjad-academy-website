import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Testimonial from "@/models/Testimonial";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/testimonials — list all active testimonials (public)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const filter: Record<string, unknown> = includeInactive ? {} : { isActive: true };

    const testimonials = await Testimonial.find(filter).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ testimonials });
  } catch (error: unknown) {
    console.error("Get testimonials error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/testimonials — create a testimonial (admin only)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    await dbConnect();

    const testimonial = await Testimonial.create({
      name: body.name,
      role: body.role,
      text: body.text,
      rating: body.rating || 5,
      image: body.image,
      order: body.order || 0,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
