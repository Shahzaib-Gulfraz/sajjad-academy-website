"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  GraduationCap,
  LogOut,
  FileText,
  Menu,
  HelpCircle,
  MessageSquare,
  Layers,
  FolderTree,
  Crown,
  Mail,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const sidebarItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Classes", href: "/admin/classes", icon: Layers },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Material Types", href: "/admin/material-types", icon: FolderTree },
  { label: "Materials", href: "/admin/materials", icon: FileText },
  { label: "Premium Content", href: "/admin/premium-content", icon: Crown },
  { label: "Messages", href: "/admin/messages", icon: Mail },
  { label: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { label: "Faculty", href: "/admin/faculty", icon: GraduationCap },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/admin");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-teal flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-navy-400">
            {authLoading ? "Loading..." : "Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="bg-white rounded-2xl shadow-xl border border-navy-100 p-8 max-w-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-navy-800 mb-2">Access Denied</h2>
          <p className="text-sm text-navy-500 mb-6">You need admin privileges to access this area.</p>
          <Link href="/" className="inline-block px-6 py-2.5 bg-gradient-teal text-white font-semibold rounded-xl hover:opacity-90 text-sm">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-teal flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold font-serif">SH Academy</span>
              <span className="block text-[10px] text-white/50 -mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-teal-500/20 text-teal-400"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {user?.name || "Admin"}
              </div>
              <div className="text-[11px] text-white/40 truncate">
                {user?.email || "admin@shacademy.com"}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-white/60 hover:text-white bg-white/5 rounded-lg transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-navy-100 px-4 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-navy-50"
          >
            <Menu className="w-5 h-5 text-navy-600" />
          </button>
          <h1 className="text-lg font-bold text-navy-800 font-serif">
            {sidebarItems.find((i) => i.href === pathname)?.label || "Dashboard"}
          </h1>
          <div className="text-xs text-navy-400">
            {new Date().toLocaleDateString("en-PK", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
