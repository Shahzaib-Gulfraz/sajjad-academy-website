import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Class from "@/models/Class";
import Course from "@/models/Course";
import Material from "@/models/Material";
import Message from "@/models/Message";
import Appointment from "@/models/Appointment";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/stats — dashboard statistics (admin only)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const [
      totalClasses,
      totalCourses,
      totalMaterials,
      unreadMessages,
      recentMessages,
      upcomingAppointments,
    ] = await Promise.all([
      Class.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      Material.countDocuments({ isActive: true }),
      Message.countDocuments({ status: "unread" }),
      Message.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Appointment.find({ status: { $in: ["pending", "confirmed"] } })
        .sort({ date: 1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      totalClasses,
      totalCourses,
      totalMaterials,
      unreadMessages,
      recentMessages,
      upcomingAppointments,
    });
  } catch (error: unknown) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
