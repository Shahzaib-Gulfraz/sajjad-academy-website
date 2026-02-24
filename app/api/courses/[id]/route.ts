import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/Course";
import MaterialType from "@/models/MaterialType";
import Material from "@/models/Material";
import PremiumContent from "@/models/PremiumContent";
import { requireAdmin } from "@/lib/auth";

// GET /api/courses/:id — public: single course with related data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const withMaterials = searchParams.get("withMaterials");

    await dbConnect();

    const course = await Course.findById(id).populate("classId", "name slug icon");
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (withMaterials) {
      const materialTypes = await MaterialType.find({ courseId: id, isActive: true }).sort({ order: 1 });
      const materials = await Material.find({ courseId: id, isActive: true }).sort({ order: 1 });
      const premiumContent = await PremiumContent.find({ courseId: id, isActive: true });

      return NextResponse.json({
        course,
        materialTypes,
        materials,
        premiumContent,
      });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("GET /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT /api/courses/:id — admin: update course
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    if (body.name) {
      body.slug = body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
    }

    const updated = await Course.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/courses/:id — admin: delete course + cascade
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    await dbConnect();

    // Cascade delete: materials, material types, premium content
    await Material.deleteMany({ courseId: id });
    await MaterialType.deleteMany({ courseId: id });
    await PremiumContent.deleteMany({ courseId: id });

    const deleted = await Course.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Course and related data deleted" });
  } catch (error) {
    console.error("DELETE /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
