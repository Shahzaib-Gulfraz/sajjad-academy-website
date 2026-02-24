import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PremiumContent from "@/models/PremiumContent";
import { requireAdmin } from "@/lib/auth";

// GET /api/premium-content/:id
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const pc = await PremiumContent.findById(id);
        if (!pc) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(pc);
    } catch (error) {
        console.error("GET /api/premium-content/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PUT /api/premium-content/:id — admin
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

        const updated = await PremiumContent.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/premium-content/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE /api/premium-content/:id — admin
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        await dbConnect();
        const deleted = await PremiumContent.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ message: "Premium content deleted" });
    } catch (error) {
        console.error("DELETE /api/premium-content/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
