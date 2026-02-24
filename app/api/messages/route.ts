import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/messages — admin: list all messages
export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        await dbConnect();
        const filter: Record<string, unknown> = {};
        if (status) filter.status = status;

        const messages = await Message.find(filter).sort({ createdAt: -1 });
        return NextResponse.json(messages);
    } catch (error) {
        console.error("GET /api/messages error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST /api/messages — public: user sends a message (no login required)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, subject, message, phone } = body;

        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return NextResponse.json({ error: "Name, email, subject, and message are required" }, { status: 400 });
        }

        await dbConnect();
        const msg = await Message.create({
            name: name.trim(),
            email: email.trim(),
            phone: phone || "",
            subject: subject.trim(),
            message: message.trim(),
        });

        return NextResponse.json({ message: "Message sent successfully", id: msg._id }, { status: 201 });
    } catch (error) {
        console.error("POST /api/messages error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
