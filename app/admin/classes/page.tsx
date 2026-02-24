"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ClassData {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    order: number;
    isActive: boolean;
}

const emptyForm = { name: "", description: "", icon: "📚", order: 0 };

export default function AdminClassesPage() {
    const { token } = useAuth();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const fetchClasses = async () => {
        try {
            const res = await fetch("/api/classes", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
            const data = await res.json();
            setClasses(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (token) fetchClasses(); }, [token]);

    const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (c: ClassData) => {
        setEditId(c._id);
        setForm({ name: c.name, description: c.description, icon: c.icon, order: c.order });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const url = editId ? `/api/classes/${editId}` : "/api/classes";
            const method = editId ? "PUT" : "POST";
            await fetch(url, { method, headers, body: JSON.stringify(form) });
            setShowModal(false);
            fetchClasses();
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this class? All courses under it will remain but lose their class reference.")) return;
        try {
            await fetch(`/api/classes/${id}`, { method: "DELETE", headers });
            fetchClasses();
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-navy-800">Classes</h2>
                    <p className="text-sm text-navy-400">Manage O Level, A Level, and other class categories</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-md">
                    <Plus className="w-4 h-4" /> Add Class
                </button>
            </div>

            {classes.length === 0 ? (
                <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
                    <p className="text-navy-400">No classes yet. Add your first class to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {classes.map((c) => (
                        <div key={c._id} className="bg-white rounded-xl border border-navy-100 p-5 card-hover">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{c.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-navy-800">{c.name}</h3>
                                        <span className="text-xs text-navy-400">/{c.slug}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-teal-600">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-navy-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {c.description && <p className="text-sm text-navy-500 line-clamp-2">{c.description}</p>}
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 bg-navy-50 text-navy-500 rounded">Order: {c.order}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${c.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                    {c.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-navy-800">{editId ? "Edit Class" : "Add Class"}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-navy-50"><X className="w-5 h-5 text-navy-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Name *</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. O Level" className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Icon (emoji)</label>
                                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Display Order</label>
                                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-navy-200 rounded-xl text-sm font-medium text-navy-600 hover:bg-navy-50">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex-1 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
                                    {saving ? "Saving..." : editId ? "Update" : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
