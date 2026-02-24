"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Menu,
  X,
  
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Home", href: "/#home" },
  { label: "Courses", href: "/#subjects" },
  { label: "About", href: "/#about" },
  { label: "FAQs", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

export default function Header({ initialSettings }: { initialSettings?: Record<string, string> }) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings || {});
  const headerRef = useRef<HTMLElement>(null);

  const isHomepage = pathname === "/";

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

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);

    if (isHomepage) {
      const sections = ["home", "subjects", "about", "faq", "contact"];
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    }
  }, [isHomepage]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const isActive = (href: string) => {
    if (!isHomepage) return false;
    return href === `/#${activeSection}`;
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-md border-b border-navy-100"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-teal flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span
              className={cn(
                "text-xl font-bold font-serif transition-colors",
                isScrolled ? "text-navy-800" : "text-navy-900"
              )}
            >
              {settings.academyName || "SH Academy"}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (isHomepage && item.href.startsWith("/#")) {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive(item.href)
                    ? "text-teal-600 bg-teal-50"
                    : isScrolled
                      ? "text-navy-600 hover:text-teal-600 hover:bg-navy-50"
                      : "text-navy-600 hover:text-teal-600 hover:bg-navy-50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${(settings.whatsappNumber || "923212954720").replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                isScrolled
                  ? "text-green-600 hover:bg-green-50"
                  : "text-green-600 hover:bg-green-50"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>

            {/* Admin Dashboard Link (only when logged in as admin) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-navy-800 text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition-colors"
              >
                Dashboard
              </Link>
            )}

            {/* Enroll Now CTA — always visible */}
            <Link
              href="/#contact"
              onClick={(e) => {
                if (isHomepage) {
                  e.preventDefault();
                  handleNavClick("/#contact");
                }
              }}
              className="px-5 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-md transition-all"
            >
              Enroll Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors text-navy-600 hover:bg-navy-50"
            )}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white rounded-2xl shadow-2xl border border-navy-100 mt-2 mb-4 p-4 animate-scale-in">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (isHomepage && item.href.startsWith("/#")) {
                      e.preventDefault();
                    }
                    handleNavClick(item.href);
                  }}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-teal-50 text-teal-600"
                      : "text-navy-600 hover:bg-navy-50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-navy-100 mt-3 pt-3 space-y-2">
              <a
                href={`https://wa.me/${(settings.whatsappNumber || "923212954720").replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 text-green-600 text-sm font-medium hover:bg-green-50 rounded-xl"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-navy-600 hover:bg-navy-50 rounded-xl"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/#contact"
                onClick={(e) => {
                  if (isHomepage) e.preventDefault();
                  handleNavClick("/#contact");
                }}
                className="block px-4 py-3 bg-gradient-teal text-white text-center text-sm font-semibold rounded-xl"
              >
                Enroll Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header >
  );
}