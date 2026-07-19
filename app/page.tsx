import dynamicImport from "next/dynamic";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import HeroSection from "@/components/HeroSection";
import dbConnect from "@/lib/dbConnect";
import Setting from "@/models/Setting";
import Course from "@/models/Course";

export const dynamic = "force-dynamic";

// Lazy load below-fold components for better initial load performance
const FeaturesStrip = dynamicImport(() => import("@/components/FeaturesStrip"));
const SubjectsSection = dynamicImport(() => import("@/components/SubjectsSection"));
const WhyChooseUs = dynamicImport(() => import("@/components/WhyChooseUs"));
const TestimonialsSection = dynamicImport(
  () => import("@/components/TestimonialsSection"),
);
const CTASection = dynamicImport(() => import("@/components/CTASection"));
const FacultySection = dynamicImport(() => import("@/components/FacultySection"));
const FAQSection = dynamicImport(() => import("@/components/FAQSection"));
const Footer = dynamicImport(() => import("@/components/Footer"));
const FloatingElements = dynamicImport(() => import("@/components/FloatingElements"));

async function getInitialData() {
  try {
    await dbConnect();

    // Fetch settings and featured courses in parallel
    const [settingsDocs, coursesDocs] = await Promise.all([
      Setting.find().lean(),
      Course.find({ isActive: true })
        .sort({ order: 1 })
        .limit(5)
        .populate("classId", "name slug")
        .lean(),
    ]);

    const settings: Record<string, string> = {};
    (settingsDocs as { key: string; value: unknown }[]).forEach((s) => {
      settings[s.key] = String(s.value);
    });

    return {
      settings,
      courses: JSON.parse(JSON.stringify(coursesDocs)),
    };
  } catch (error) {
    console.error("Error fetching initial data:", error);
    return { settings: {}, courses: [] };
  }
}

export default async function HomePage() {
  const { settings, courses } = await getInitialData();

  return (
    <main className="min-h-screen">
      <Header initialSettings={settings} />
      <AnnouncementBanner initialSettings={settings} />
      <HeroSection initialCourses={courses} initialSettings={settings} />
      <SubjectsSection />
      <FeaturesStrip />
      <WhyChooseUs />
      <TestimonialsSection />
      <CTASection />
      <FacultySection />
      <FAQSection />
      <Footer />
      <FloatingElements />
    </main>
  );
}
