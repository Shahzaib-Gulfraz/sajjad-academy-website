"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AnnouncementBanner({ initialSettings }: { initialSettings?: Record<string, string> }) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings || {});
  const [loading, setLoading] = useState(!initialSettings);

  useEffect(() => {
    if (initialSettings) {
      setLoading(false);
      return;
    }
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error("Failed to fetch settings", err))
      .finally(() => setLoading(false));
  }, [initialSettings]);

  if (loading) return <div className="h-11 bg-navy-900/5" />;
  if (settings.announcementEnabled !== "true") return null;

  const text = settings.announcementText || "New Batch Starting March 2026 — Register Now & Get 15% Early Bird Discount!";
  const cta = settings.announcementCta || "";
  const link = settings.announcementLink || "/#contact";

  return (
    <div className="bg-gradient-to-r from-gold-400 via-gold-300 to-amber-200 text-navy-900 border-y border-navy-900/10 shadow-sm relative z-40 min-h-11 flex items-center">
      <div className="max-w-7xl mx-auto px-4 py-2 text-center flex items-center justify-center gap-2 text-sm sm:text-base font-semibold tracking-tight">
        <span className="animate-pulse">🎓</span>
        <span>{text}</span>
        {cta && (
          <Link
            href={link}
            className="ml-2 underline underline-offset-2 hover:text-navy-700 transition-colors duration-200"
          >
            {cta}
          </Link>
        )}
        <span className="animate-pulse">🎓</span>
      </div>
    </div>
  );
}