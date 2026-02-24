import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Class from "@/models/Class";
import { requireAdmin } from "@/lib/auth";

// GET /api/classes/:id — public: single class
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const cls = await Class.findById(id);
        if (!cls) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(cls);
    } catch (error) {
        console.error("GET /api/classes/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PUT /api/classes/:id — admin: update class
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

        // If name changed, regenerate slug
        if (body.name) {
            body.slug = body.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");
        }

        const updated = await Class.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/classes/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE /api/classes/:id — admin: delete class
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        await dbConnect();
        const deleted = await Class.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ message: "Class deleted" });
    } catch (error) {
        console.error("DELETE /api/classes/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
