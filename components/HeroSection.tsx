"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buildWhatsAppHref } from "@/lib/whatsapp";

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
  const [rotationStep, setRotationStep] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [courses, setCourses] = useState<CourseData[]>(initialCourses || []);
  const [loading, setLoading] = useState(!initialCourses);
  const [announcement, setAnnouncement] = useState(
    initialSettings?.announcementText || "Admissions Open for March 2026",
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialSettings?.whatsappNumber || "923212954720",
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState({ width: 280, height: 192 });
  const faceCount = 4;

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
          if (data.settings?.whatsappNumber) {
            setWhatsappNumber(data.settings.whatsappNumber);
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

  // Keep 3D depth synced with actual box width to avoid side gaps
  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;

    const updateDepth = () => {
      const rect = element.getBoundingClientRect();
      setBoxSize({
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      });
    };

    updateDepth();

    const observer = new ResizeObserver(updateDepth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const rotateDurationMs = 3400;
  const holdDurationMs = 260;
  const activeFace = ((rotationStep % faceCount) + faceCount) % faceCount;

  const advanceFaces = (steps: number) => {
    if (steps <= 0) return;

    setRotationStep((previousStep) => {
      const previousFace =
        ((previousStep % faceCount) + faceCount) % faceCount;
      const wraps = Math.floor((previousFace + steps) / faceCount);

      if (wraps > 0 && courses.length > 0) {
        setWindowStart(
          (current) => (current + wraps * faceCount) % courses.length,
        );
      }

      return previousStep + steps;
    });
  };

  const handleIndicatorClick = (targetFace: number) => {
    const forwardSteps = (targetFace - activeFace + faceCount) % faceCount;
    if (forwardSteps === 0) return;
    advanceFaces(forwardSteps);
  };

  // Auto-rotate faces (slow turn + short hold)
  useEffect(() => {
    if (courses.length === 0) return;

    let timer: ReturnType<typeof setTimeout>;
    const cycleMs = rotateDurationMs + holdDurationMs;

    const tick = () => {
      advanceFaces(1);

      timer = setTimeout(tick, cycleMs);
    };

    timer = setTimeout(tick, holdDurationMs);

    return () => clearTimeout(timer);
  }, [courses.length, holdDurationMs, rotateDurationMs]);

  const cardColors = [
    "from-teal-500 to-teal-700",
    "from-blue-500 to-indigo-700",
    "from-orange-500 to-red-700",
    "from-purple-500 to-pink-700",
    "from-emerald-500 to-green-700",
  ];

  const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
  const depth = Math.max(80, Math.round(boxSize.width / 2) - 1);
  const halfHeight = Math.round(boxSize.height / 2);
  const tiltX = isMobile ? -6 : -10;
  const faceTransforms = ["rotateY(0deg)", "rotateY(90deg)", "rotateY(180deg)", "rotateY(-90deg)"];
  const faceShadeClasses = [
    "bg-black/[0.04]",
    "bg-black/[0.16]",
    "bg-black/[0.34]",
    "bg-black/[0.18]",
  ];
  const getFaceShadeClass = (faceIndex: number) => {
    const relative = (faceIndex - activeFace + faceCount) % faceCount;
    return faceShadeClasses[relative];
  };
  const visibleCourses = Array.from({ length: faceCount }, (_, faceIndex) => {
    if (courses.length === 0) return null;
    const courseIndex = (windowStart + faceIndex) % courses.length;
    return courses[courseIndex];
  });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-linear-to-br from-navy-900 via-navy-800 to-navy-900 text-white min-h-screen flex items-center"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left column – content */}
          <div className="order-1 space-y-6 sm:space-y-8 lg:space-y-10 text-center lg:text-left">
            {/* Announcement Badge – now static (no bounce) */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs sm:text-sm font-medium backdrop-blur-sm hover:bg-teal-500/30 transition-all animate-glow-breathe">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse shrink-0" />
              <span className="animate-subtle-bounce text-xs sm:text-sm">{announcement}</span>
            </div>

            {/* Contact Section */}
            <div className="animate-fade-in-up">
              <div className="inline-block p-5 sm:p-7 rounded-2xl bg-linear-to-br from-teal-500/20 to-teal-600/10 border border-teal-400/40 backdrop-blur-xl hover:border-teal-300/60 transition-all duration-300 shadow-xl shadow-teal-500/10 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                      Get in Touch Today
                    </h3>
                    <p className="text-sm sm:text-base text-white/70">
                      Direct support from our expert team
                    </p>
                  </div>
                  <a
                    href={buildWhatsAppHref(whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 px-5 sm:px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold text-sm sm:text-base text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Contact
                    on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Main heading */}
            <h1
              className="text-3xl sm:text-4xl lg:text-6xl font-bold font-serif leading-tight animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              Unlock Your Path to{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-300 via-gold-300 to-teal-400 block sm:inline">
                Academic Excellence
              </span>{" "}
              and Lifelong Success
            </h1>

            {/* Description */}
            <p
              className="text-sm sm:text-base lg:text-lg text-white/70 leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Pakistan&apos;s leading Cambridge education academy. Expert
              faculty, proven results, and comprehensive O Level &amp; A Level
              preparation that transforms futures. Join thousands of successful
              students.
            </p>
          </div>

          {/* Right column – 3D Rotating Box */}
          <div
            className="order-2 flex items-center justify-center animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative w-full h-100 sm:h-150 lg:h-175 perspective-carousel">
              {loading ? (
                <HeroSkeleton />
              ) : courses.length === 0 ? (
                <div className="w-full h-full rounded-none bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center p-6">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-white/60 text-sm text-center">
                    No courses available
                  </p>
                </div>
              ) : (
                <>
                  {/* 3D Box Container */}
                  <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                    <div ref={boxRef} className="relative w-full max-w-xs xs:max-w-[340px] sm:max-w-md aspect-[16/11]">
                      <div
                        className="relative w-full h-full transition-transform ease-out"
                        style={{
                          transformStyle: "preserve-3d",
                          transform: `rotateX(${tiltX}deg) rotateY(${rotationStep * -90}deg)`,
                          transitionDuration: `${rotateDurationMs}ms`,
                        }}
                      >
                        {visibleCourses.map((course, faceIndex) => {
                          if (!course) return null;

                          return (
                            <div
                              key={`${course._id}-${faceIndex}-${windowStart}`}
                              className="absolute inset-0"
                              style={{
                                transform: `${faceTransforms[faceIndex]} translateZ(${depth}px)`,
                                backfaceVisibility: "hidden",
                              }}
                            >
                              <Link
                                href={`/courses/${course._id}`}
                                className="block w-full h-full rounded-none overflow-hidden shadow-[0_20px_55px_rgba(0,0,0,0.45)] cursor-pointer group/card transition-all duration-300 hover:shadow-[0_24px_65px_rgba(0,0,0,0.55)]"
                              >
                                <div
                                  className={`h-full w-full bg-linear-to-br ${
                                    cardColors[(windowStart + faceIndex) % cardColors.length]
                                  } flex flex-col relative overflow-hidden group-hover/card:scale-[1.02] border border-white/10`}
                                >
                                  {/* Top Section: Thumbnail */}
                                  <div className="relative h-2/5 sm:h-1/2 overflow-hidden bg-navy-900/60">
                                    {course.thumbnail ? (
                                      <>
                                        <Image
                                          src={course.thumbnail}
                                          alt=""
                                          fill
                                          sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 384px"
                                          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl"
                                        />
                                        <Image
                                          src={course.thumbnail}
                                          alt={course.name}
                                          fill
                                          sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 384px"
                                          className="relative z-10 h-full w-full object-contain transition-transform duration-700 group-hover/card:scale-105"
                                          loading="lazy"
                                          fetchPriority={
                                            faceIndex === activeFace ? "high" : "low"
                                          }
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
                                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent z-10" />
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
                                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent animate-shimmer opacity-30 pointer-events-none" />
                                  <div className={`absolute inset-0 pointer-events-none transition-colors duration-700 ${getFaceShadeClass(faceIndex)}`} />
                                </div>
                              </Link>
                            </div>
                          );
                        })}

                        <div
                          className="absolute left-0 pointer-events-none"
                          style={{
                            top: "50%",
                            marginTop: `-${depth}px`,
                            width: "100%",
                            height: `${depth * 2}px`,
                            transform: `rotateX(90deg) translateZ(${halfHeight}px)`,
                            transformOrigin: "center center",
                          }}
                        >
                          <div className="h-full w-full rounded-none bg-linear-to-b from-white/24 via-white/12 to-black/15 border border-white/12" />
                        </div>

                        <div
                          className="absolute left-0 pointer-events-none"
                          style={{
                            top: "50%",
                            marginTop: `-${depth}px`,
                            width: "100%",
                            height: `${depth * 2}px`,
                            transform: `rotateX(-90deg) translateZ(${halfHeight}px)`,
                            transformOrigin: "center center",
                          }}
                        >
                          <div className="h-full w-full rounded-none bg-black/35 border border-white/6" />
                        </div>
                      </div>
                    </div>

                    {/* 3D Light Sources */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/4 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
                      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
                    </div>
                  </div>

                  {/* Card Indicators */}
                  <div className="absolute bottom-5 lg:bottom-15 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-50">
                    {Array.from({ length: faceCount }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleIndicatorClick(i)}
                        className={`rounded-full transition-all duration-300 ${
                          i === activeFace
                            ? "w-7 sm:w-9 h-2 sm:h-2.5 bg-linear-to-r from-teal-400 to-teal-300 shadow-lg shadow-teal-500/50 animate-glow-breathe"
                            : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/20 hover:bg-white/40 hover:scale-125"
                        }`}
                        aria-label={`Go to box face ${i + 1}`}
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
          0%,
          100% {
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
          0%,
          100% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.7);
          }
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
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
      w-full max-w-xs xs:max-w-[340px] sm:max-w-md 
      aspect-[16/11] transition-all duration-700 ease-out"
      style={{
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="h-full w-full rounded-none overflow-hidden 
        bg-white/5 backdrop-blur-sm border border-white/10 
        flex flex-col animate-pulse"
      >
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
