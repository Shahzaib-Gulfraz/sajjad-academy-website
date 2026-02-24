import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Faculty from "@/models/Faculty";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PUT /api/faculty/[id] - admin
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        const body = await req.json();

        await dbConnect();
        const faculty = await Faculty.findByIdAndUpdate(id, body, { new: true });

        if (!faculty) {
            return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
        }

        return NextResponse.json(faculty);
    } catch (error) {
        console.error("PUT /api/faculty/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE /api/faculty/[id] - admin
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        await dbConnect();
        const faculty = await Faculty.findByIdAndDelete(id);

        if (!faculty) {
            return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Faculty deleted successfully" });
    } catch (error) {
        console.error("DELETE /api/faculty/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
