"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ClassData { _id: string; name: string; }
interface CourseData { _id: string; name: string; icon: string; }
interface MaterialTypeData {
    _id: string; courseId: string; name: string; slug: string;
    icon: string; order: number; isActive: boolean;
}

const emptyForm = { courseId: "", name: "", icon: "📄", order: 0 };

export default function AdminMaterialTypesPage() {
    const { token } = useAuth();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [types, setTypes] = useState<MaterialTypeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    useEffect(() => {
        if (!token) return;
        fetch("/api/classes", { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => setClasses(Array.isArray(d) ? d : []));
    }, [token]);

    useEffect(() => {
        if (!token || !selectedClass) { setCourses([]); setSelectedCourse(""); return; }
        fetch(`/api/courses?classId=${selectedClass}&all=1`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { setCourses(Array.isArray(d) ? d : []); setSelectedCourse(""); });
    }, [token, selectedClass]);

    useEffect(() => {
        if (!token || !selectedCourse) { setTypes([]); return; }
        setLoading(true);
        fetch(`/api/material-types?courseId=${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
            .then(r => r.json()).then(d => setTypes(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    }, [token, selectedCourse]);

    const openAdd = () => { setEditId(null); setForm({ ...emptyForm, courseId: selectedCourse }); setShowModal(true); };
    const openEdit = (mt: MaterialTypeData) => {
        setEditId(mt._id);
        setForm({ courseId: mt.courseId, name: mt.name, icon: mt.icon, order: mt.order });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.courseId) return;
        setSaving(true);
        try {
            const url = editId ? `/api/material-types/${editId}` : "/api/material-types";
            const method = editId ? "PUT" : "POST";
            await fetch(url, { method, headers: authHeaders, body: JSON.stringify(form) });
            setShowModal(false);
            const res = await fetch(`/api/material-types?courseId=${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
            setTypes(await res.json());
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this material type and all its materials?")) return;
        try {
            await fetch(`/api/material-types/${id}`, { method: "DELETE", headers: authHeaders });
            setTypes(prev => prev.filter(t => t._id !== id));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-navy-800">Material Types</h2>
                    <p className="text-sm text-navy-400">Define what types of materials each course has (Quiz, Past Paper, Video, etc.)</p>
                </div>
                {selectedCourse && (
                    <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-md">
                        <Plus className="w-4 h-4" /> Add Type
                    </button>
                )}
            </div>

            {/* Selectors */}
            <div className="bg-white rounded-xl border border-navy-100 p-4 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-navy-500 mb-1">Class</label>
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none">
                        <option value="">Select class</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-navy-500 mb-1">Course</label>
                    <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} disabled={!selectedClass} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none disabled:opacity-50">
                        <option value="">Select course</option>
                        {courses.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Types List */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
            ) : selectedCourse && types.length === 0 ? (
                <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
                    <p className="text-navy-400">No material types yet. Add types like Quiz, Past Paper, Video Lecture, etc.</p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {types.map(t => (
                        <div key={t._id} className="bg-white rounded-xl border border-navy-100 p-5 flex items-center justify-between card-hover">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{t.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-navy-800">{t.name}</h3>
                                    <span className="text-xs text-navy-400">Order: {t.order}</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-teal-600"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(t._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-navy-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
                            <h3 className="text-lg font-bold text-navy-800">{editId ? "Edit Material Type" : "Add Material Type"}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-navy-50"><X className="w-5 h-5 text-navy-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Type Name *</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder='e.g. "Quiz", "Past Paper", "Video Lecture"' className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Icon (emoji)</label>
                                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Display Order</label>
                                <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
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
