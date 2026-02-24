import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PremiumContent from "@/models/PremiumContent";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/premium-content?courseId=xxx — public
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({ error: "courseId is required" }, { status: 400 });
        }

        await dbConnect();
        const content = await PremiumContent.find({ courseId, isActive: true });
        return NextResponse.json(content);
    } catch (error) {
        console.error("GET /api/premium-content error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST /api/premium-content — admin
export async function POST(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const body = await req.json();
        const { courseId, title, description, price, features } = body;

        if (!courseId || !title?.trim() || price == null) {
            return NextResponse.json({ error: "courseId, title, and price are required" }, { status: 400 });
        }

        await dbConnect();
        const premium = await PremiumContent.create({
            courseId,
            title: title.trim(),
            description: description || "",
            price,
            features: features || {},
        });

        return NextResponse.json(premium, { status: 201 });
    } catch (error) {
        console.error("POST /api/premium-content error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
