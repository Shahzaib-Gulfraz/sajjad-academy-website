"use client";

import { BookOpen, Brain, FileText, Target } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BookOpen,
    title: "Comprehensive Notes",
    description: "Detailed chapter-wise notes by Cambridge examiners",
  },
  {
    icon: Brain,
    title: "Interactive Quizzes",
    description: "Test your knowledge with topic-wise MCQ quizzes",
  },
  {
    icon: FileText,
    title: "Past Papers + Solutions",
    description: "Complete past papers with detailed mark schemes",
  },
  {
    icon: Target,
    title: "Exam Techniques",
    description: "Proven strategies to maximize your exam scores",
  },
];

const stats = [
  { label: "Students Taught", value: "15,000+" },
  { label: "A* Results", value: "92%" },
  { label: "Years Experience", value: "10+" },
  { label: "Subjects", value: "30+" },
];

export default function FeaturesStrip() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="relative overflow-hidden border-y border-navy-700 bg-gradient-navy py-20">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        {/* Heading */}
        <div
          ref={ref}
          className={cn(
            "mb-14 text-center transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6 backdrop-blur-sm hover:bg-teal-500/30 transition-all animate-glow-breathe">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse shrink-0" />
            <span className="animate-subtle-bounce text-xs sm:text-sm">
              Complete Learning System
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
            Everything You Need to{" "}
            <span className="text-gradient-gold">Ace Your Exams</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-white/60">
            A complete learning ecosystem designed for Cambridge students.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className={cn(
                "group relative rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-teal-400/50 hover:shadow-xl hover:shadow-teal-500/20",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12",
              )}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-teal-500 shadow-lg">
                <feat.icon className="h-7 w-7 text-white" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-white">
                {feat.title}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center mb-14">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-white/5 border border-white/10 p-5 backdrop-blur"
            >
              <div className="text-2xl sm:text-3xl font-bold text-gold-400">
                {s.value}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-white/60">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
