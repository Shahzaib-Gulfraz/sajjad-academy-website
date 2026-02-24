"use client";

import { useState, useEffect } from "react";
import { Search, Check, X, Eye, Calendar, Clock, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Appointment {
  _id: string;
  studentName: string;
  email: string;
  phone: string;
  classType: string;
  subject: string;
  date: string;
  time: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [actionLoading, setActionLoading] = useState("");

  const { token } = useAuth();

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch {
      console.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = appointments.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (
      search &&
      !a.studentName.toLowerCase().includes(search.toLowerCase()) &&
      !a.subject.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const updateStatus = async (id: string, status: Appointment["status"]) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      fetchAppointments();
      if (selected?._id === id) setSelected(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      fetchAppointments();
      if (selected?._id === id) setSelected(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const counts = {
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    total: appointments.length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy-800">Appointment Management</h2>
        <p className="text-sm text-navy-400">
          Review and manage student appointment bookings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, color: "border-navy-200" },
          { label: "Pending", value: counts.pending, color: "border-yellow-300" },
          { label: "Confirmed", value: counts.confirmed, color: "border-green-300" },
          { label: "Completed", value: counts.completed, color: "border-blue-300" },
        ].map((s) => (
          <div key={s.label} className={cn("bg-white p-4 rounded-xl border-l-4", s.color)}>
            <p className="text-2xl font-bold text-navy-800">{s.value}</p>
            <p className="text-xs text-navy-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            placeholder="Search by student or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors",
                statusFilter === s
                  ? "bg-navy-800 text-white"
                  : "bg-white border border-navy-200 text-navy-500 hover:bg-navy-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-navy-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-navy-400 border-b border-navy-100 bg-navy-50/50">
                <th className="text-left px-6 py-3 font-medium">Student</th>
                <th className="text-left px-6 py-3 font-medium">Class / Subject</th>
                <th className="text-left px-6 py-3 font-medium">Date & Time</th>
                <th className="text-center px-6 py-3 font-medium">Status</th>
                <th className="text-center px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {filtered.map((a) => (
                <tr key={a._id} className="hover:bg-navy-50/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-navy-800">{a.studentName}</div>
                    <div className="text-xs text-navy-400">{a.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-navy-700">{a.subject}</div>
                    <div className="text-xs text-navy-400">{a.classType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-navy-700">
                      <Calendar className="w-3.5 h-3.5" /> {a.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-navy-400 mt-0.5">
                      <Clock className="w-3 h-3" /> {a.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase", statusColors[a.status])}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setSelected(a)} className="p-2 hover:bg-blue-50 rounded-lg text-navy-400 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      {a.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(a._id, "confirmed")}
                            disabled={actionLoading === a._id}
                            className="p-2 hover:bg-green-50 rounded-lg text-navy-400 hover:text-green-600 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(a._id, "cancelled")}
                            disabled={actionLoading === a._id}
                            className="p-2 hover:bg-red-50 rounded-lg text-navy-400 hover:text-red-500 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-navy-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-800">Appointment Details</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-navy-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Student" value={selected.studentName} />
              <Row label="Email" value={selected.email} />
              <Row label="Phone" value={selected.phone} />
              <Row label="Class" value={selected.classType} />
              <Row label="Subject" value={selected.subject} />
              <Row label="Date" value={selected.date} />
              <Row label="Time" value={selected.time} />
              {selected.notes && <Row label="Notes" value={selected.notes} />}
              <div className="flex items-center justify-between pt-2 border-t border-navy-100">
                <span className="font-medium text-navy-600">Status</span>
                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase", statusColors[selected.status])}>
                  {selected.status}
                </span>
              </div>
            </div>
            {selected.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => updateStatus(selected._id, "confirmed")}
                  disabled={actionLoading === selected._id}
                  className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => updateStatus(selected._id, "cancelled")}
                  disabled={actionLoading === selected._id}
                  className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between">
      <span className="font-medium text-navy-500">{label}</span>
      <span className="text-navy-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
