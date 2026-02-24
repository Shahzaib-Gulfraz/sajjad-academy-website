import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  await dbConnect();

  // Re-populate subscribedCourses
  const user = await result.user.populate("subscribedCourses", "name level icon fee");

  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscribedCourses: user.subscribedCourses,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
}
