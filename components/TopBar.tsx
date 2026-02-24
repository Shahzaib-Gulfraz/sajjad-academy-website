"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, ChevronRight } from "lucide-react";

export default function TopBar({ initialSettings }: { initialSettings?: Record<string, string> }) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings || {});

  useEffect(() => {
    if (initialSettings) return;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error("Failed to fetch settings", err));
  }, []);

  const phone = settings.phone || "+92 321 2954720";
  const email = settings.email || "info@shacademy.com";
  const address = settings.address || "Islamabad, Pakistan";
  const portalUrl = settings.portalUrl || "/login";

  return (
    <div className="bg-linear-to-r from-navy-900 via-navy-800 to-navy-900 text-white/80 text-sm hidden md:block relative overflow-hidden border-b border-white/10">
      {/* Animated background line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-teal-500/50 to-transparent animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative z-10">
        {/* Left - Contact Info */}
        <div className="flex items-center gap-6">
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="group inline-flex items-center gap-1.5 text-white/70 hover:text-teal-400 transition-all duration-300 py-1 px-2 rounded-lg hover:bg-white/5"
          >
            <Phone className="w-3.5 h-3.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="transition-all duration-300 group-hover:translate-x-0.5">{phone}</span>
          </a>

          <div className="w-px h-4 bg-white/20" />

          <a
            href={`mailto:${email}`}
            className="group inline-flex items-center gap-1.5 text-white/70 hover:text-teal-400 transition-all duration-300 py-1 px-2 rounded-lg hover:bg-white/5"
          >
            <Mail className="w-3.5 h-3.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="transition-all duration-300 group-hover:translate-x-0.5">{email}</span>
          </a>

          <div className="w-px h-4 bg-white/20 hidden lg:block" />

          <span className="hidden lg:flex items-center gap-1.5 text-white/70 py-1 px-2 rounded-lg hover:text-gold-400 transition-all duration-300 cursor-default">
            <MapPin className="w-3.5 h-3.5" />
            <span>{address}</span>
          </span>
        </div>

        {/* Right - Login Link */}
        <div className="flex items-center gap-4">
          <div className="w-px h-4 bg-white/20 hidden sm:block" />
          <a
            href={portalUrl}
            className="group inline-flex items-center gap-1.5 text-white/70 hover:text-teal-400 transition-all duration-300 py-1.5 px-3 rounded-lg hover:bg-white/5 font-medium"
          >
            <span className="transition-all duration-300 group-hover:translate-x-[-4px]">
              Student Portal
            </span>
            <ChevronRight className="w-3.5 h-3.5 transition-all duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* Bottom animated gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold-500/30 to-transparent" />
    </div>
  );
}