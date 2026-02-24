"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

interface CourseData {
  _id: string;
  name: string;
  classId?: {
    _id: string;
    name: string;
    slug: string;
  };
  icon: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  instructor: string;
}

export default function HeroSection({
  initialCourses,
  initialSettings,
}: {
  initialCourses?: CourseData[];
  initialSettings?: Record<string, string>;
}) {
  const [activeCard, setActiveCard] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [courses, setCourses] = useState<CourseData[]>(initialCourses || []);
  const [loading, setLoading] = useState(!initialCourses);
  const [announcement, setAnnouncement] = useState(
    initialSettings?.announcementText || "Admissions Open for March 2026"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch courses and settings
  useEffect(() => {
    if (initialCourses && initialSettings) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [coursesRes, settingsRes] = await Promise.all([
          fetch("/api/courses", { cache: "no-store" }),
          fetch("/api/settings", { cache: "no-store" }),
        ]);

        if (coursesRes.ok) {
          const data = await coursesRes.json();
          setCourses(Array.isArray(data) ? data.slice(0, 5) : []);
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.settings?.announcementText) {
            setAnnouncement(data.settings.announcementText);
          }
        }
      } catch (error) {
        console.error("Failed to fetch hero data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialCourses, initialSettings]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-rotate cards
  useEffect(() => {
    if (courses.length === 0) return;

    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % courses.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [courses.length]);

  const cardColors = [
    "from-teal-500 to-teal-700",
    "from-blue-500 to-indigo-700",
    "from-orange-500 to-red-700",
    "from-purple-500 to-pink-700",
    "from-emerald-500 to-green-700",
  ];

  // WhatsApp handler
  const handleWhatsApp = () => {
    const phoneNumber = "+92 321 2954720"; 
    const message = encodeURIComponent(
      "Hello! I'm interested in learning more about your courses."
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  // Calculate 3D position for each card
  const getCardTransform = (index: number) => {
    const totalCards = courses.length;
    const angleSlice = (360 / totalCards) * (Math.PI / 180);
    const currentAngle = angleSlice * index - angleSlice * activeCard;
    const round = (value: number, precision = 3) =>
      Number(value.toFixed(precision));

    // Responsive radius and depth
    const radius = isMobile ? 200 : 320;
    const depth = isMobile ? 250 : 400;

    const x = Math.sin(currentAngle) * radius;
    const z = Math.cos(currentAngle) * radius - depth;
    const rotationY = currentAngle * (180 / Math.PI);

    // Scale based on distance
    const scale = 0.6 + (Math.cos(currentAngle) + 1) / 4;
    const opacity = 0.3 + (Math.cos(currentAngle) + 1) / 2.5;
    const xRounded = round(x);
    const zRounded = round(z);
    const rotationYRounded = round(rotationY);
    const scaleRounded = round(scale);
    const opacityRounded = round(Math.max(opacity, 0.3));

    return {
      transform: `translateX(${xRounded}px) translateZ(${zRounded}px) rotateY(${rotationYRounded}deg) scale(${scaleRounded})`,
      opacity: opacityRounded,
      zIndex: Math.round(1000 + zRounded),
    };
  };

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white min-h-screen flex items-center"
    >

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left column – content */}
          <div className="order-1 space-y-6 sm:space-y-8 lg:space-y-10 text-center lg:text-left">
            {/* Announcement Badge – now static (no bounce) */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs sm:text-sm font-medium backdrop-blur-sm hover:bg-teal-500/30 transition-all animate-glow-breathe">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm">{announcement}</span>
            </div>

            {/* Contact Section */}
            <div className="animate-fade-in-up">
              <div className="inline-block p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-400/40 backdrop-blur-xl hover:border-teal-300/60 transition-all duration-300 shadow-xl shadow-teal-500/10 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                      Get in Touch Today
                    </h3>
                    <p className="text-sm sm:text-base text-white/70">
                      Direct support from our expert team
                    </p>
                  </div>
                  <button
                    onClick={handleWhatsApp}
                    className="group flex items-center gap-2.5 px-5 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold text-sm sm:text-base text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold font-serif leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Unlock Your Path to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-gold-300 to-teal-400 block sm:inline">
                Academic Excellence
              </span>{" "}
              and Lifelong Success
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-white/70 leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Pakistan&apos;s leading Cambridge education academy. Expert faculty,
              proven results, and comprehensive O Level &amp; A Level preparation
              that transforms futures. Join thousands of successful students.
            </p>
          </div>

          {/* Right column – 3D Carousel */}
          <div className="order-2 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative w-full h-[400px] sm:h-[600px] lg:h-[700px] perspective-carousel">
              {loading ? (
                <HeroSkeleton />
              ) : courses.length === 0 ? (
                <div className="w-full h-full rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center p-6">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-white/60 text-sm text-center">
                    No courses available
                  </p>
                </div>
              ) : (
                <>
                  {/* 3D Carousel Container */}
                  <div
                    ref={carouselRef}
                    className="relative w-full h-full"
                    style={{
                      perspective: "1200px",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Rotating 3D Cards */}
                    {courses.map((course, index) => {
                      const { transform, opacity, zIndex } = getCardTransform(index);

                      return (
                        <div
                          key={course._id}
                          className="absolute left-1/2 top-1/2 w-full max-w-[240px] xs:max-w-[280px] sm:max-w-sm aspect-[3/4] transition-all duration-700 ease-out"
                          style={{
                            transformStyle: "preserve-3d",
                            transform: `translate(-50%, -50%) ${transform}`,
                            opacity: opacity,
                            zIndex: zIndex,
                            perspective: "1000px",
                          }}
                        >
                          <Link
                            href={`/courses/${course._id}`}
                            className="block w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl cursor-pointer group/card transition-all duration-300 hover:shadow-3xl"
                            style={{
                              transformStyle: "preserve-3d",
                            }}
                          >
                            <div
                              className={`h-full w-full bg-gradient-to-br ${
                                cardColors[index % cardColors.length]
                              } flex flex-col relative overflow-hidden group-hover/card:scale-[1.02] border border-white/10`}
                            >
                              {/* Top Section: Thumbnail */}
                              <div className="relative h-2/5 sm:h-1/2 overflow-hidden bg-navy-900/60">
                                {course.thumbnail ? (
                                  <>
                                    <img
                                      src={course.thumbnail}
                                      alt=""
                                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-110"
                                    />
                                    <img
                                      src={course.thumbnail}
                                      alt={course.name}
                                      className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover/card:scale-105"
                                      loading="lazy"
                                      fetchPriority={index === activeCard ? "high" : "low"}
                                    />
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-white/5 backdrop-blur-sm">
                                    <span className="text-5xl sm:text-6xl animate-pulse">
                                      📚
                                    </span>
                                  </div>
                                )}
                                <div className="absolute bottom-3 right-3 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center text-2xl sm:text-3xl shadow-lg border border-white/20 z-20 animate-float">
                                  {course.icon}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                              </div>

                              {/* Bottom Section: Content */}
                              <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col justify-between relative z-10 bg-white/5 backdrop-blur-xs">
                                <div className="space-y-2 sm:space-y-3">
                                  <h3 className="text-base sm:text-lg lg:text-xl font-bold font-serif line-clamp-2 text-white leading-snug tracking-wide">
                                    {course.name}
                                  </h3>
                                  <p className="text-white/80 text-[11px] sm:text-xs leading-relaxed line-clamp-3 font-medium">
                                    {course.description}
                                  </p>
                                </div>

                                {/* Footer */}
                                <div className="pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                                  <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-teal-300 border border-teal-500/20">
                                    {course.classId?.name || "Subject"}
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-white/90 group-hover/card:translate-x-1 transition-transform">
                                    <span>Enroll</span>
                                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </div>
                                </div>
                              </div>

                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-shimmer opacity-30 pointer-events-none" />
                            </div>
                          </Link>
                        </div>
                      );
                    })}

                    {/* 3D Light Sources */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/4 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
                      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
                    </div>
                  </div>

                  {/* Card Indicators */}
                  <div className="absolute bottom-5 lg:bottom-15 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-50">
                    {courses.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveCard(i)}
                        className={`rounded-full transition-all duration-300 ${
                          i === activeCard
                            ? "w-7 sm:w-9 h-2 sm:h-2.5 bg-gradient-to-r from-teal-400 to-teal-300 shadow-lg shadow-teal-500/50 animate-glow-breathe"
                            : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/20 hover:bg-white/40 hover:scale-125"
                        }`}
                        aria-label={`Go to course ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes glow-breathe {
          0%, 100% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.7);
          }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-glow-breathe {
          animation: glow-breathe 2s ease-in-out infinite;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }

        .perspective-carousel {
          perspective: 1200px;
        }
      `}</style>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <div
      className="absolute left-1/2 top-1/2 
      w-full max-w-[240px] xs:max-w-[280px] sm:max-w-sm 
      aspect-[3/4] transition-all duration-700 ease-out"
      style={{
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="h-full w-full rounded-xl sm:rounded-2xl overflow-hidden 
        bg-white/5 backdrop-blur-sm border border-white/10 
        flex flex-col animate-pulse">

        {/* Top Thumbnail Skeleton (matches 2/5 sm:1/2) */}
        <div className="relative h-2/5 sm:h-1/2 bg-white/5" />

        {/* Bottom Content Section */}
        <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col justify-between bg-white/5">
          
          <div className="space-y-2 sm:space-y-3">
            <div className="h-5 sm:h-6 w-3/4 bg-white/10 rounded-lg" />
            <div className="h-3 sm:h-4 w-full bg-white/5 rounded-lg" />
            <div className="h-3 sm:h-4 w-5/6 bg-white/5 rounded-lg" />
          </div>

          {/* Footer Skeleton */}
          <div className="pt-3 sm:pt-4 border-t border-white/10 flex justify-between">
            <div className="h-4 w-20 bg-white/10 rounded-lg" />
            <div className="h-4 w-12 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
