"use client";

import { CreditCard, Smartphone, Building2 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const methods = [
  {
    icon: CreditCard,
    title: "Credit / Debit Card",
    description:
      "Pay securely with Visa, Mastercard, or any major card through our encrypted payment gateway.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Smartphone,
    title: "EasyPaisa / JazzCash",
    description:
      "Convenient mobile wallet payments. Send to our registered number and share the screenshot with admin.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Building2,
    title: "Bank Transfer",
    description:
      "Direct bank transfer to our account. Account details will be provided upon course selection.",
    color: "from-purple-500 to-violet-600",
  },
];

export default function PaymentMethods() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="pricing" className="relative py-24 bg-gradient-navy overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Heading */}
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
              Secure & Flexible Payments
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white mb-4">
            Payment <span className="text-gradient-gold">Methods</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Choose the payment option that suits you best. All transactions are
            safe and secure.
          </p>
        </div>

        {/* Payment cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {methods.map((m, i) => (
            <div
              key={m.title}
              className={cn(
                "group relative p-8 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
              )}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-linear-to-br ${m.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition`}
              >
                <m.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {m.title}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
