import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MaterialType from "@/models/MaterialType";
import { requireAdmin } from "@/lib/auth";

// GET /api/material-types?courseId=xxx — public: list material types for a course
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({ error: "courseId is required" }, { status: 400 });
        }

        await dbConnect();
        const types = await MaterialType.find({ courseId, isActive: true }).sort({ order: 1 });
        return NextResponse.json(types);
    } catch (error) {
        console.error("GET /api/material-types error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST /api/material-types — admin: create new material type
export async function POST(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await req.json();
        const { courseId, name, icon, order } = body;

        if (!courseId || !name?.trim()) {
            return NextResponse.json({ error: "courseId and name are required" }, { status: 400 });
        }

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        await dbConnect();

        const existing = await MaterialType.findOne({ courseId, slug });
        if (existing) {
            return NextResponse.json({ error: "This material type already exists for this course" }, { status: 409 });
        }

        const materialType = await MaterialType.create({
            courseId,
            name: name.trim(),
            slug,
            icon: icon || "📄",
            order: order ?? 0,
        });

        return NextResponse.json(materialType, { status: 201 });
    } catch (error) {
        console.error("POST /api/material-types error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
