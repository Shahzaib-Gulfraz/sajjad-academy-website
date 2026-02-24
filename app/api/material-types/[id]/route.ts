import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MaterialType from "@/models/MaterialType";
import Material from "@/models/Material";
import { requireAdmin } from "@/lib/auth";

// GET /api/material-types/:id
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const mt = await MaterialType.findById(id);
        if (!mt) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(mt);
    } catch (error) {
        console.error("GET /api/material-types/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PUT /api/material-types/:id — admin
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

        const updated = await MaterialType.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/material-types/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE /api/material-types/:id — admin: cascade delete materials
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        await dbConnect();

        await Material.deleteMany({ materialTypeId: id });
        const deleted = await MaterialType.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ message: "Material type and materials deleted" });
    } catch (error) {
        console.error("DELETE /api/material-types/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
