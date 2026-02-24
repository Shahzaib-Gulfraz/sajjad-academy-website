"use client";

import { useState, useEffect, FormEvent } from "react";
import { Phone, MessageCircle, CheckCircle, ArrowRight, Send } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const benefits = [
  "Personalised learning pathways",
  "Experienced Cambridge faculty",
  "Flexible online & in-person classes",
  "Free trial session available",
  "24/7 academic support",
  "Proven track record of results",
];

export default function CTASection() {
  const { ref, isVisible } = useScrollAnimation();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [settings, setSettings] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(err => console.error("CTA Settings fetch error:", err));
  }, []);

  const phone = settings.phone || "+92 321 2954720";
  const whatsapp = settings.whatsappNumber || "923212954720";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 bg-linear-to-b from-cream-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-400/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div
          ref={ref}
          className={cn(
            "grid lg:grid-cols-2 gap-8 sm:gap-12 items-start transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* LEFT — Info Section */}
          <div className="animate-fade-in-left">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy-800 mb-4">
              Start Your{" "}
              <span className="text-gradient-gold">Journey Today</span>
            </h2>
            <p className="text-navy-500 mb-8 leading-relaxed text-sm sm:text-base">
              Take the first step towards academic excellence. Get in touch with
              us for a free consultation and personalised learning plan.
            </p>

            {/* Benefits list */}
            <ul className="space-y-3 mb-8">
              {benefits.map((b, i) => (
                <li
                  key={b}
                  className={cn(
                    "flex items-center gap-3 text-navy-600 text-sm transition-all duration-500 transform",
                    isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-[-20px]"
                  )}
                  style={{
                    transitionDelay: isVisible ? `${i * 80}ms` : "0ms",
                  }}
                >
                  <div className="relative">
                    <CheckCircle className="w-5 h-5 text-teal-500 shrink-0" />
                  </div>
                  <span className="text-sm">{b}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="group inline-flex items-center justify-center sm:justify-start gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-navy-800 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-navy-700 transition-all duration-300 hover:shadow-lg"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12" />
                <span>Call Now</span>
              </a>
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center sm:justify-start gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-green-500 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-green-600 transition-all duration-300 hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          {/* RIGHT — Contact Form (submits to Messages API) */}
          <div
            className={cn(
              "bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl border border-navy-100 p-6 sm:p-8 transition-all duration-500 transform",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            )}
          >
            <h3 className="text-lg sm:text-xl font-bold text-navy-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-teal rounded-full" />
              Send Us a Message
            </h3>

            {submitted ? (
              <div className="text-center py-12 animate-scale-in" style={{ animationDuration: "0.5s" }}>
                <div className="w-16 h-16 bg-linear-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-lg font-bold text-navy-800 mb-2">Message Sent!</h4>
                <p className="text-navy-500 text-sm leading-relaxed">
                  We&apos;ll get back to you within 24 hours. Thank you for reaching out!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5">Name *</label>
                    <input
                      required value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      type="text" placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all hover:border-navy-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5">Email *</label>
                    <input
                      required value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      type="email" placeholder="email@example.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all hover:border-navy-300"
                    />
                  </div>
                </div>

                {/* Phone & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5">Phone</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      type="tel" placeholder="+92 3XX XXXXXXX"
                      className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all hover:border-navy-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5">Subject *</label>
                    <input
                      required value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      type="text" placeholder="What's this about?"
                      className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all hover:border-navy-300"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5">Message *</label>
                  <textarea
                    required value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={4} placeholder="Tell us how we can help you…"
                    className="w-full px-4 py-2.5 rounded-lg border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none transition-all hover:border-navy-300"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={sending}
                  className="w-full py-3 sm:py-3.5 bg-gradient-teal text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl hover:opacity-90 shadow-lg shadow-teal-500/30 transition-all inline-flex items-center justify-center gap-2 group disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send Message"}
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}