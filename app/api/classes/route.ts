import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Class from "@/models/Class";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/classes — public: list all active classes
export async function GET() {
    try {
        await dbConnect();
        const classes = await Class.find({ isActive: true }).sort({ order: 1 });
        return NextResponse.json(classes);
    } catch (error) {
        console.error("GET /api/classes error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST /api/classes — admin: create new class
export async function POST(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await req.json();
        const { name, description, icon, order } = body;

        if (!name?.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Auto-generate slug
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        await dbConnect();

        // Check duplicate slug
        const existing = await Class.findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: "A class with this name already exists" }, { status: 409 });
        }

        const newClass = await Class.create({
            name: name.trim(),
            slug,
            description: description || "",
            icon: icon || "📚",
            order: order ?? 0,
        });

        return NextResponse.json(newClass, { status: 201 });
    } catch (error) {
        console.error("POST /api/classes error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
