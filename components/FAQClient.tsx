"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface FAQData {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQClient({ faqs }: { faqs: FAQData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="faq"
      className="py-16 sm:py-20 bg-linear-to-b from-white via-cream-50/30 to-white relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl animate-blob-pulse" />
        <div
          className="absolute bottom-20 right-1/4 w-80 h-80 bg-gold-400/3 rounded-full blur-3xl animate-blob-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header section */}
        <div
          ref={ref}
          className={cn(
            "text-center mb-10 sm:mb-12 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy-800 mb-3 sm:mb-4">
            Frequently Asked{" "}
            <span className="text-gradient-gold">Questions</span>
          </h2>
          <p className="text-sm sm:text-base text-navy-500 leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about SH Academy and our programs. Can
            not find your answer? Reach out to our support team.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2.5 sm:space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq._id}
              className={cn(
                "border border-navy-100 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-500 transform hover:border-teal-200",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4",
                openIndex === i &&
                  "border-teal-300 bg-teal-50/30 shadow-lg shadow-teal-500/10",
              )}
              style={{
                transitionDelay: isVisible ? `${i * 80}ms` : "0ms",
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={cn(
                  "w-full flex items-center justify-between p-4 sm:p-5 text-left transition-all duration-300 group",
                  openIndex === i
                    ? "bg-linear-to-r from-teal-50/50 to-transparent"
                    : "hover:bg-navy-50/50",
                )}
              >
                <span
                  className={cn(
                    "font-semibold pr-4 text-sm sm:text-base transition-colors duration-300",
                    openIndex === i
                      ? "text-teal-700"
                      : "text-navy-800 group-hover:text-navy-900",
                  )}
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-navy-400 shrink-0 transition-all duration-300",
                    openIndex === i && "rotate-180 text-teal-500",
                  )}
                />
              </button>

              {/* Answer section with smooth collapse/expand */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === i ? "max-h-96" : "max-h-0",
                )}
              >
                <div
                  className={cn(
                    "px-4 sm:px-5 pb-4 sm:pb-5 border-t border-teal-200/50 transition-all duration-300",
                    openIndex === i ? "opacity-100" : "opacity-0",
                  )}
                  style={{
                    animation:
                      openIndex === i ? "slideUpFade 0.4s ease-out" : "none",
                  }}
                >
                  <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
                    {faq.answer}
                  </p>

                  {/* Helpful action buttons */}
                  <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs">
                    <span className="text-navy-400">Was this helpful?</span>
                    <button className="px-2 sm:px-3 py-1 rounded-full text-navy-500 hover:bg-white hover:text-teal-600 transition-all duration-200 text-[11px] sm:text-xs font-medium border border-navy-200 hover:border-teal-300">
                      Yes
                    </button>
                    <button className="px-2 sm:px-3 py-1 rounded-full text-navy-500 hover:bg-white hover:text-navy-700 transition-all duration-200 text-[11px] sm:text-xs font-medium border border-navy-200 hover:border-navy-300">
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div
          className={cn(
            "mt-10 sm:mt-12 p-6 sm:p-8 bg-linear-to-br from-teal-50 via-white to-cream-50 rounded-xl sm:rounded-2xl border border-teal-200/50 shadow-lg transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
          style={{ transitionDelay: isVisible ? `${faqs.length * 80}ms` : "0ms" }}
        >
          <p className="text-sm sm:text-base text-navy-700 text-center mb-3 sm:mb-4">
            Still have questions?{" "}
            <span className="font-semibold text-teal-700">
              We&apos;re here to help!
            </span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-teal text-white rounded-lg sm:rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/30 hover:scale-105 transition-all duration-300"
            >
              Contact Support
            </a>
            <a
              href="tel:+92XXXXXXXXXX"
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-teal-500 text-teal-700 rounded-lg sm:rounded-xl font-semibold text-sm hover:bg-teal-50 transition-all duration-300"
            >
              Call Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
