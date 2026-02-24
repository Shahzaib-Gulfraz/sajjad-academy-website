import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Faculty from "@/models/Faculty";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/faculty - public
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const all = searchParams.get("all"); // admin only

        await dbConnect();
        const filter: Record<string, unknown> = {};
        if (!all) filter.isActive = true;

        const faculty = await Faculty.find(filter).sort({ order: 1 });
        return NextResponse.json(faculty);
    } catch (error) {
        console.error("GET /api/faculty error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST /api/faculty - admin
export async function POST(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await req.json();
        const { name, designation, experience, bio, image, imagePublicId, subjects, order } = body;

        if (!name?.trim() || !designation?.trim()) {
            return NextResponse.json({ error: "Name and designation are required" }, { status: 400 });
        }

        await dbConnect();
        const faculty = await Faculty.create({
            name: name.trim(),
            designation: designation.trim(),
            experience: experience || "",
            bio: bio || "",
            image: image || "",
            imagePublicId: imagePublicId || "",
            subjects: subjects || [],
            order: order ?? 0,
        });

        return NextResponse.json(faculty, { status: 201 });
    } catch (error) {
        console.error("POST /api/faculty error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
