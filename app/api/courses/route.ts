import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/Course";
import Class from "@/models/Class";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/courses — public: list courses, optionally filter by classId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const all = searchParams.get("all"); // admin: include inactive

    await dbConnect();

    const filter: Record<string, unknown> = {};
    if (classId) filter.classId = classId;
    else filter.classId = { $ne: null }; // Ensure we only get hierarchical courses for the public
    if (!all) filter.isActive = true;

    const courses = await Course.find(filter)
      .populate("classId", "name slug icon")
      .sort({ order: 1 });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/courses — admin: create new course
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { classId, name, description, thumbnail, thumbnailPublicId, icon, tags, instructor, order } = body;

    if (!classId || !name?.trim()) {
      return NextResponse.json({ error: "classId and name are required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    await dbConnect();

    const existing = await Course.findOne({ classId, slug });
    if (existing) {
      return NextResponse.json({ error: "A course with this name already exists in this class" }, { status: 409 });
    }

    const course = await Course.create({
      classId,
      name: name.trim(),
      slug,
      description: description || "",
      thumbnail: thumbnail || "",
      thumbnailPublicId: thumbnailPublicId || "",
      icon: icon || "📚",
      tags: tags || [],
      instructor: instructor || "",
      order: order ?? 0,
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
