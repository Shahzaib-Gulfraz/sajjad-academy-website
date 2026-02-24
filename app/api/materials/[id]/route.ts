import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Material from "@/models/Material";
import { requireAdmin } from "@/lib/auth";

// GET /api/materials/:id
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const material = await Material.findById(id).populate("materialTypeId", "name slug icon");
        if (!material) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(material);
    } catch (error) {
        console.error("GET /api/materials/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PUT /api/materials/:id — admin
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

        const updated = await Material.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/materials/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE /api/materials/:id — admin
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        await dbConnect();
        const deleted = await Material.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ message: "Material deleted" });
    } catch (error) {
        console.error("DELETE /api/materials/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
