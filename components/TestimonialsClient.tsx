"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface TestimonialData {
  _id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  image?: string;
}

export default function TestimonialsClient({ testimonials }: { testimonials: TestimonialData[] }) {
  const { ref, isVisible } = useScrollAnimation();

  // Get initials from name
  const getInitials = (name: unknown) => {
    if (typeof name !== "string") return "SA";

    const cleaned = name.trim();
    if (!cleaned) return "SA";

    return cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase() || "SA";
  };


  return (
    <section className="py-20 bg-gradient-navy text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-blob-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-400/8 rounded-full blur-3xl animate-blob-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute w-full h-px bg-linear-to-r from-transparent via-teal-400/20 to-transparent top-1/4 animate-pulse" />
        <div className="absolute w-full h-px bg-linear-to-r from-transparent via-gold-400/10 to-transparent top-3/4 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header section with scroll animation */}
        <div
          ref={ref}
          className={cn(
            "text-center mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs sm:text-sm font-medium mb-4 sm:mb-6 backdrop-blur-sm hover:bg-teal-500/30 transition-all animate-glow-breathe">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse shrink-0" />
            <span className="animate-subtle-bounce text-xs sm:text-sm">
              Trusted By 15k+ Students
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4">
            What Our <span className="text-gradient-gold">Students Say</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            Hear from students and parents who have experienced the SH Academy
            difference firsthand.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t._id}
              className={cn(
                "group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-500 transform hover:shadow-2xl hover:shadow-teal-500/20",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12",
              )}
              style={{
                transitionDelay: isVisible ? `${i * 150}ms` : "0ms",
                animationName: isVisible ? 'slideUpFade' : 'none',
                animationDuration: '0.6s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'forwards',
                animationDelay: `${i * 150}ms`,
              }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-teal-500/0 via-transparent to-teal-500/0 group-hover:from-teal-500/10 group-hover:to-teal-500/5 transition-all duration-500 pointer-events-none" />

              {/* Quote icon */}
              <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
                <Quote className="w-6 h-6 text-gold-400/30 rotate-180" />
              </div>

              {/* Stars with staggered reveal */}
              <div className="flex items-center gap-1 mb-4 relative z-10">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-gold-400 text-gold-400 transition-all duration-300 transform group-hover:scale-110 hover:rotate-180"
                    style={{
                      animationName: isVisible ? 'slideUpFade' : 'none',
                      animationDuration: '0.4s',
                      animationTimingFunction: 'ease-out',
                      animationFillMode: 'forwards',
                      animationDelay: `${i * 150 + j * 50}ms`,
                    }}
                  />
                ))}
              </div>

              {/* Testimonial text with fade effect */}
              <p className="text-white/80 text-sm leading-relaxed mb-6 italic relative z-10 group-hover:text-white transition-colors duration-300">
                &ldquo;
                <span className="text-gold-300 font-medium">
                  {t.text.slice(0, 50)}
                </span>
                {t.text.slice(50)}&rdquo;
              </p>

              {/* Author section */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10 group-hover:border-teal-400/30 transition-colors relative z-10">
                {/* Avatar with gradient and hover effect */}
                {t.image ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-teal-400/50 transition-all duration-300 group-hover:scale-110">
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-teal flex items-center justify-center font-bold text-white text-xs shadow-lg group-hover:shadow-teal-500/50 transition-all duration-300 group-hover:scale-110">
                    {getInitials(t.name)}
                  </div>
                )}

                <div>
                  <p className="font-semibold text-white text-sm group-hover:text-teal-300 transition-colors">
                    {t.name}
                  </p>
                  <p className="text-xs text-white/50">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
