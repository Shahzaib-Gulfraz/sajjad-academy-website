import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/Course";
import Setting from "@/models/Setting";

export async function GET() {
    try {
        await dbConnect();

        // 1. Count active courses (Subjects Offered)
        const subjectsCount = await Course.countDocuments({ isActive: true });

        // 2. Fetch other stats from Settings (or use defaults)
        const settings = await Setting.find({
            key: { $in: ["yearsOfExcellence", "studentsTaught", "successRate"] },
        });

        const getSettingValue = (key: string, defaultValue: string) => {
            const setting = settings.find((s) => s.key === key);
            return setting ? setting.value : defaultValue;
        };

        const stats = {
            years: getSettingValue("yearsOfExcellence", "30+"),
            students: getSettingValue("studentsTaught", "15K+"),
            rate: getSettingValue("successRate", "95%"),
            subjects: subjectsCount.toString(),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching public stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
