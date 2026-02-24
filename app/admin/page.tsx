"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  BookOpen,
  FileText,
  Mail,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Stats {
  totalClasses: number;
  totalCourses: number;
  totalMaterials: number;
  unreadMessages: number;
  recentMessages: { _id: string; name: string; subject: string; status: string; createdAt: string }[];
  upcomingAppointments: { _id: string; studentName: string; classType: string; subject: string; date: string; time: string }[];
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Classes", value: stats?.totalClasses ?? 0, icon: Layers, color: "from-teal-500 to-teal-600" },
    { label: "Total Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "from-blue-500 to-indigo-600" },
    { label: "Total Materials", value: stats?.totalMaterials ?? 0, icon: FileText, color: "from-purple-500 to-pink-600" },
    { label: "Unread Messages", value: stats?.unreadMessages ?? 0, icon: Mail, color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-navy-100 p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-navy-800">{stat.value}</div>
            <div className="text-xs text-navy-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Messages */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-navy-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between">
            <h2 className="font-bold text-navy-800">Recent Messages</h2>
            <a href="/admin/messages" className="text-xs text-teal-600 hover:underline font-medium">View All</a>
          </div>
          <div className="divide-y divide-navy-50">
            {(stats?.recentMessages ?? []).map((msg) => (
              <div key={msg._id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-navy-800">{msg.name}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${msg.status === "unread" ? "bg-yellow-100 text-yellow-700" :
                    msg.status === "read" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                    {msg.status}
                  </span>
                </div>
                <div className="text-xs text-navy-400">{msg.subject}</div>
              </div>
            ))}
            {(stats?.recentMessages ?? []).length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-navy-400">No messages yet</div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-navy-100">
          <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between">
            <h2 className="font-bold text-navy-800">Upcoming Appointments</h2>
            <a href="/admin/appointments" className="text-xs text-teal-600 hover:underline font-medium">View All</a>
          </div>
          <div className="divide-y divide-navy-50">
            {(stats?.upcomingAppointments ?? []).map((apt) => (
              <div key={apt._id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-navy-800">{apt.studentName}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full font-semibold">{apt.classType}</span>
                </div>
                <div className="text-xs text-navy-400">{apt.subject} • {apt.date} at {apt.time}</div>
              </div>
            ))}
            {(stats?.upcomingAppointments ?? []).length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-navy-400">No upcoming appointments</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-navy-100 p-6">
        <h2 className="font-bold text-navy-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add Class", href: "/admin/classes", icon: Layers },
            { label: "Add Course", href: "/admin/courses", icon: BookOpen },
            { label: "Upload Material", href: "/admin/materials", icon: FileText },
            { label: "View Messages", href: "/admin/messages", icon: Mail },
          ].map((action) => (
            <a key={action.label} href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-navy-100 hover:bg-teal-50 hover:border-teal-200 transition-colors text-center">
              <action.icon className="w-6 h-6 text-teal-500" />
              <span className="text-sm font-medium text-navy-700">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
