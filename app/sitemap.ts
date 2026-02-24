import { MetadataRoute } from "next";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/Course";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  // Fetch all active courses
  const courses = await Course.find({ isActive: true })
    .select("_id updatedAt")
    .lean();

  // Generate course URLs
  const courseUrls = courses.map((course) => ({
    url: `https://sajjadacademy.com/courses/${course._id}`,
    lastModified: course.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://sajjadacademy.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://sajjadacademy.com/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...courseUrls,
  ];
}
