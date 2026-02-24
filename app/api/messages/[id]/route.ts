import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { requireAdmin } from "@/lib/auth";
import { sendMail, messageReplyTemplate } from "@/lib/mail";

// GET /api/messages/:id — admin
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        await dbConnect();
        const msg = await Message.findById(id);
        if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(msg);
    } catch (error) {
        console.error("GET /api/messages/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PUT /api/messages/:id — admin: update status, add reply
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

        const updated = await Message.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // If an admin reply is provided, send it via email
        if (body.adminReply) {
            try {
                await sendMail({
                    to: updated.email,
                    subject: `Re: ${updated.subject}`,
                    html: messageReplyTemplate(updated.name, updated.message, body.adminReply),
                });
            } catch (mailError) {
                console.error("Failed to send reply email:", mailError);
            }
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/messages/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE /api/messages/:id — admin
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const { id } = await params;
        await dbConnect();
        const deleted = await Message.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ message: "Message deleted" });
    } catch (error) {
        console.error("DELETE /api/messages/[id] error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
