import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/Appointment";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/appointments — admin gets all, student gets own (with pagination)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (!user || user.role !== "admin") {
      if (user) filter.user = user._id;
    }
    if (status && status !== "all") filter.status = status;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Appointment.countDocuments(filter)
    ]);

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/appointments — book an appointment (public or authenticated)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    const { studentName, email, phone, classType, subject, date, time, notes } = body;

    if (!studentName || !email || !phone || !classType || !date || !time) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    await dbConnect();

    const appointment = await Appointment.create({
      user: user?._id,
      studentName,
      email,
      phone,
      classType,
      subject: subject || "",
      date,
      time,
      notes: notes || "",
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
