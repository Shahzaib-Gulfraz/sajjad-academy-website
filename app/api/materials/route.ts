import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Material from "@/models/Material";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/materials?materialTypeId=xxx or ?courseId=xxx — public
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const materialTypeId = searchParams.get("materialTypeId");
        const courseId = searchParams.get("courseId");

        if (!materialTypeId && !courseId) {
            return NextResponse.json({ error: "materialTypeId or courseId is required" }, { status: 400 });
        }

        await dbConnect();
        const filter: Record<string, unknown> = { isActive: true };
        if (materialTypeId) filter.materialTypeId = materialTypeId;
        if (courseId) filter.courseId = courseId;

        const materials = await Material.find(filter)
            .populate("materialTypeId", "name slug icon")
            .sort({ order: 1 });

        return NextResponse.json(materials);
    } catch (error) {
        console.error("GET /api/materials error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST /api/materials — admin: create material with file info
export async function POST(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await req.json();
        const { materialTypeId, courseId, title, description, fileUrl, filePublicId, fileType, fileName, order } = body;

        if (!materialTypeId || !courseId || !title?.trim()) {
            return NextResponse.json({ error: "materialTypeId, courseId, and title are required" }, { status: 400 });
        }

        await dbConnect();
        const material = await Material.create({
            materialTypeId,
            courseId,
            title: title.trim(),
            description: description || "",
            fileUrl: fileUrl || "",
            filePublicId: filePublicId || "",
            fileType: fileType || "",
            fileName: fileName || "",
            order: order ?? 0,
        });

        return NextResponse.json(material, { status: 201 });
    } catch (error) {
        console.error("POST /api/materials error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
