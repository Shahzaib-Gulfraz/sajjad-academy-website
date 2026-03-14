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

  // Cube rotation state (continuous)
  const [rotationY, setRotationY] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

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
          setCourses(Array.isArray(data) ? data.slice(0, 4) : []);
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

  // Continuous rotation animation
  useEffect(() => {
    if (loading) return;

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current !== null) {
        const delta = timestamp - lastTimestampRef.current;
        const rotationSpeed = 12; // degrees per second
        const deltaRotation = (rotationSpeed * delta) / 1000;
        setRotationY((prev) => prev - deltaRotation);
      }
      lastTimestampRef.current = timestamp;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null)
        cancelAnimationFrame(animationRef.current);
    };
  }, [loading]);

  // ── ALWAYS 4 FACES = PERFECT BOX ──────────────────────────────────────────
  const FACE_COUNT = 4;
  const ANGLE_PER_FACE = 90; // 360 / 4

  // Cube dimensions (responsive)
  const cubeWidth = isMobile ? 200 : 280;
  const cubeHeight = isMobile ? 250 : 350;

  // translateZ = cubeWidth / 2  →  perfect square prism regardless of course count
  const translateZ = cubeWidth / 2;

  const visibleCourses = courses.slice(0, FACE_COUNT);
  const faceCourses =
    visibleCourses.length > 0
      ? Array.from(
          { length: FACE_COUNT },
          (_, index) => visibleCourses[index % visibleCourses.length],
        )
      : [];

  // Compute current face index based on rotation
  const currentFaceIndex = (() => {
    const normalized = ((rotationY % 360) + 360) % 360;
    const angle = (-normalized + 360) % 360;
    return Math.floor((angle + ANGLE_PER_FACE / 2) / ANGLE_PER_FACE) % FACE_COUNT;
  })();

  // Jump to a specific face
  const jumpToFace = (faceIndex: number) => {
    const targetRotation = -ANGLE_PER_FACE * faceIndex;
    setRotationY(targetRotation);
  };

  // Colors for faces
  const cardColors = [
    "from-teal-500 to-teal-700",
    "from-blue-500 to-indigo-700",
    "from-orange-500 to-red-700",
    "from-purple-500 to-pink-700",
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

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-linear-to-br from-navy-900 via-navy-800 to-navy-900 text-white min-h-screen flex items-center"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left column – content */}
          <div className="order-1 space-y-6 sm:space-y-8 lg:space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs sm:text-sm font-medium backdrop-blur-sm hover:bg-teal-500/30 transition-all animate-glow-breathe">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse shrink-0" />
              <span className="animate-subtle-bounce text-xs sm:text-sm">
                {announcement}
              </span>
            </div>

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

          {/* Right column – rotating box (always 4 faces) */}
          <div
            className="order-2 flex items-center justify-center animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative w-full h-100 sm:h-150 lg:h-175 perspective-carousel">
              {loading ? (
                <SkeletonCube
                  width={cubeWidth}
                  height={cubeHeight}
                  translateZ={cubeWidth / 2}
                />
              ) : (
                <>
                  <div
                    className="absolute left-1/2 top-1/2"
                    style={{
                      width: cubeWidth,
                      height: cubeHeight,
                      transformStyle: "preserve-3d",
                      transform: `translate(-50%, -50%) rotateX(5deg) rotateY(${rotationY}deg)`,
                      transition: "transform 0.3s ease-out",
                    }}
                  >
                    {/* Always render exactly 4 faces */}
                    {Array.from({ length: FACE_COUNT }).map((_, faceIndex) => {
                      const course = faceCourses[faceIndex]; // may be undefined
                      const angle = ANGLE_PER_FACE * faceIndex;
                      const colorIndex = faceIndex % cardColors.length;

                      return (
                        <div
                          key={faceIndex}
                          className="absolute inset-0"
                          style={{
                            width: cubeWidth,
                            height: cubeHeight,
                            transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
                            backfaceVisibility: "hidden",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          {course ? (
                            <Link
                              href={`/courses/${course._id}`}
                              className="block w-full h-full overflow-hidden shadow-2xl cursor-pointer group/card transition-all duration-300 hover:shadow-3xl"
                            >
                              <div
                                className={`h-full w-full bg-linear-to-br ${cardColors[colorIndex]} flex flex-col relative overflow-hidden group-hover/card:scale-[1.02] border border-white/10`}
                              >
                                {/* Top Section */}
                                <div className="relative h-2/5 sm:h-1/2 overflow-hidden bg-navy-900/60">
                                  {course.thumbnail ? (
                                    <>
                                      <Image
                                        src={course.thumbnail}
                                        alt=""
                                        fill
                                        sizes="(max-width: 640px) 200px, 280px"
                                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl"
                                      />
                                      <Image
                                        src={course.thumbnail}
                                        alt={course.name}
                                        fill
                                        sizes="(max-width: 640px) 200px, 280px"
                                        className="relative z-10 h-full w-full object-contain transition-transform duration-700 group-hover/card:scale-105"
                                        loading="lazy"
                                      />
                                    </>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5 backdrop-blur-sm">
                                      <span className="text-2xl sm:text-3xl font-bold text-white/60 animate-pulse">
                                        Book
                                      </span>
                                    </div>
                                  )}

                                  <div className="absolute bottom-3 right-3 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center text-2xl sm:text-3xl shadow-lg border border-white/20 z-20 animate-float">
                                    {course.icon}
                                  </div>

                                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent z-10" />
                                </div>

                                {/* Bottom Section */}
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

                                {/* Shine */}
                                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent animate-shimmer opacity-30 pointer-events-none" />
                              </div>
                            </Link>
                          ) : (
                            // Empty face – subtle placeholder so the box shape is solid
                            <div className="h-full w-full border border-white/8 bg-white/3 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                              <span className="text-3xl opacity-20">✦</span>
                              <span className="text-white/20 text-xs font-medium tracking-widest uppercase">
                                More Soon
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dot indicators – only for faces that have a course */}
                  {faceCourses.length > 0 && (
                    <div className="absolute bottom-5 lg:bottom-15 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-50">
                      {faceCourses.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => jumpToFace(i)}
                          className={`rounded-full transition-all duration-300 ${
                            i === currentFaceIndex
                              ? "w-7 sm:w-9 h-2 sm:h-2.5 bg-linear-to-r from-teal-400 to-teal-300 shadow-lg shadow-teal-500/50 animate-glow-breathe"
                              : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/20 hover:bg-white/40 hover:scale-125"
                          }`}
                          aria-label={`Go to face ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
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

        @keyframes spin-cube {
          0% {
            transform: translate(-50%, -50%) rotateX(5deg) rotateY(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotateX(5deg) rotateY(360deg);
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

        .perspective-carousel {
          perspective: 1200px;
        }
      `}</style>
    </section>
  );
}

function SkeletonCube({
  width,
  height,
  translateZ,
}: {
  width: number;
  height: number;
  translateZ: number;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width,
        height,
        transformStyle: "preserve-3d",
        animation: "spin-cube 4s infinite linear",
        transform: "translate(-50%, -50%) rotateX(5deg)",
      }}
    >
      {[0, 1, 2, 3].map((faceIndex) => {
        const angle = faceIndex * 90;
        return (
          <div
            key={faceIndex}
            className="absolute inset-0"
            style={{
              width,
              height,
              transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            <div className="h-full w-full rounded-xl sm:rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 flex flex-col animate-pulse">
              <div className="relative h-2/5 sm:h-1/2 bg-white/5" />
              <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col justify-between bg-white/5">
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-5 sm:h-6 w-3/4 bg-white/10 rounded-lg" />
                  <div className="h-3 sm:h-4 w-full bg-white/5 rounded-lg" />
                  <div className="h-3 sm:h-4 w-5/6 bg-white/5 rounded-lg" />
                </div>
                <div className="pt-3 sm:pt-4 border-t border-white/10 flex justify-between">
                  <div className="h-4 w-20 bg-white/10 rounded-lg" />
                  <div className="h-4 w-12 bg-white/10 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}