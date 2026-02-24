import dynamic from "next/dynamic";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import HeroSection from "@/components/HeroSection";
import dbConnect from "@/lib/dbConnect";
import Setting from "@/models/Setting";
import Course from "@/models/Course";

// Lazy load below-fold components for better initial load performance
const FeaturesStrip = dynamic(() => import("@/components/FeaturesStrip"));
const SubjectsSection = dynamic(() => import("@/components/SubjectsSection"));
const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"));
const TestimonialsSection = dynamic(() => import("@/components/TestimonialsSection"));
const CTASection = dynamic(() => import("@/components/CTASection"));
const FacultySection = dynamic(() => import("@/components/FacultySection"));
const FAQSection = dynamic(() => import("@/components/FAQSection"));
const Footer = dynamic(() => import("@/components/Footer"));
const FloatingElements = dynamic(() => import("@/components/FloatingElements"));

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
    (settingsDocs as any[]).forEach((s) => {
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
      <TopBar initialSettings={settings} />
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
