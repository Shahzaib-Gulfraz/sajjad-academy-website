"use client";

import {
  Award,
  Star,
  Monitor,
  HeadphonesIcon,
  FileCheck,
  Globe,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const reasons = [
  {
    icon: Award,
    title: "Cambridge Examiner Insight",
    description:
      "Our faculty includes experienced Cambridge examiners who provide insider knowledge on exam techniques and marking criteria.",
    color: "from-teal-400 to-teal-600",
    borderColor: "border-teal-200",
    shadowColor: "shadow-teal-500/20",
  },
  {
    icon: Star,
    title: "95% A*/A Success Rate",
    description:
      "Consistent outstanding results with the majority of students achieving A* and A grades across all subjects.",
    color: "from-gold-400 to-gold-600",
    borderColor: "border-gold-200",
    shadowColor: "shadow-gold-500/20",
  },
  {
    icon: Monitor,
    title: "Online + In-Person",
    description:
      "Flexible learning options — attend classes physically at our campus or join live online sessions from anywhere.",
    color: "from-blue-400 to-indigo-600",
    borderColor: "border-blue-200",
    shadowColor: "shadow-blue-500/20",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Student Support",
    description:
      "Round-the-clock academic support through WhatsApp groups, forums, and one-on-one doubt-clearing sessions.",
    color: "from-purple-400 to-purple-600",
    borderColor: "border-purple-200",
    shadowColor: "shadow-purple-500/20",
  },
  {
    icon: FileCheck,
    title: "Original Materials",
    description:
      "Proprietary course materials, revision guides, and practice papers crafted specifically for Cambridge syllabi.",
    color: "from-orange-400 to-red-500",
    borderColor: "border-orange-200",
    shadowColor: "shadow-orange-500/20",
  },
  {
    icon: Globe,
    title: "Global Network",
    description:
      "Join a community of 15,000+ alumni studying at top universities worldwide, including Oxbridge and Ivy League.",
    color: "from-emerald-400 to-green-600",
    borderColor: "border-emerald-200",
    shadowColor: "shadow-emerald-500/20",
  },
];

export default function WhyChooseUs() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="about" className="py-16 sm:py-20 bg-linear-to-b from-cream-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-blob-pulse" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gold-400/3 rounded-full blur-3xl animate-blob-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div
          ref={ref}
          className={cn(
            "text-center mb-12 sm:mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >

          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy-800 mb-4">
            Why Choose <span className="text-gradient-gold">SH Academy</span>
          </h2>
          <p className="text-navy-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Discover what sets us apart and why families across Pakistan trust us
            with their children&apos;s academic journey.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {reasons.map((item, i) => (
            <div
              key={item.title}
              className={cn(
                "group relative p-6 sm:p-8 rounded-lg sm:rounded-2xl bg-white border transition-all duration-500 transform overflow-hidden",
                item.borderColor,
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12",
                "hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-2 hover:border-teal-300"
              )}
              style={{
                transitionDelay: isVisible ? `${i * 100}ms` : "0ms",
              }}
            >
              {/* Animated gradient background on hover */}
              <div
                className={cn(
                  "absolute inset-0 bg-linear-to-br from-teal-500/0 via-transparent to-teal-500/0 group-hover:from-teal-500/5 group-hover:via-transparent group-hover:to-teal-500/10 transition-all duration-500",
                  i % 2 === 0 ? "group-hover:from-teal-500/5" : "group-hover:from-gold-500/5"
                )}
              />

              {/* Icon Container */}
              <div className="relative z-10 mb-5 sm:mb-6 inline-block">
                <div
                  className={cn(
                    `w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-linear-to-br ${item.color} flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`,
                    item.shadowColor
                  )}
                >
                  <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                </div>
                
                {/* Icon glow effect */}
                <div
                  className={cn(
                    `absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur`,
                    `bg-linear-to-br ${item.color}`
                  )}
                  style={{
                    transform: "scale(1.2)",
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg sm:text-xl font-bold text-navy-800 mb-2 sm:mb-3 group-hover:text-teal-600 transition-colors duration-300 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-navy-500 leading-relaxed group-hover:text-navy-600 transition-colors duration-300">
                  {item.description}
                </p>
              </div>

              {/* Bottom accent line */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-transparent via-teal-500 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500",
                  "w-0 group-hover:w-full"
                )}
              />

              {/* Hover indicator dot */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
