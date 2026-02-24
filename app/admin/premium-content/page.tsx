"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Loader2, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ClassData { _id: string; name: string; }
interface CourseData { _id: string; name: string; icon: string; }
interface PremiumData {
    _id: string; courseId: string; title: string; description: string;
    price: number; features: { videoCount?: number; pastPaperCount?: number; quizCount?: number; notesCount?: number; otherFeatures?: string[] };
    isActive: boolean;
}

const emptyForm = { courseId: "", title: "", description: "", price: 0, videoCount: 0, pastPaperCount: 0, quizCount: 0, notesCount: 0, otherFeatures: "" };

export default function AdminPremiumContentPage() {
    const { token } = useAuth();
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [premiums, setPremiums] = useState<PremiumData[]>([]);
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
        if (!token || !selectedCourse) { setPremiums([]); return; }
        setLoading(true);
        fetch(`/api/premium-content?courseId=${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
            .then(r => r.json()).then(d => setPremiums(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    }, [token, selectedCourse]);

    const openAdd = () => {
        setEditId(null);
        setForm({ ...emptyForm, courseId: selectedCourse });
        setShowModal(true);
    };

    const openEdit = (p: PremiumData) => {
        setEditId(p._id);
        setForm({
            courseId: p.courseId, title: p.title, description: p.description, price: p.price,
            videoCount: p.features.videoCount ?? 0, pastPaperCount: p.features.pastPaperCount ?? 0,
            quizCount: p.features.quizCount ?? 0, notesCount: p.features.notesCount ?? 0,
            otherFeatures: (p.features.otherFeatures ?? []).join(", "),
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.courseId) return;
        setSaving(true);
        try {
            const body = {
                courseId: form.courseId,
                title: form.title.trim(),
                description: form.description,
                price: form.price,
                features: {
                    videoCount: form.videoCount,
                    pastPaperCount: form.pastPaperCount,
                    quizCount: form.quizCount,
                    notesCount: form.notesCount,
                    otherFeatures: form.otherFeatures.split(",").map(s => s.trim()).filter(Boolean),
                },
            };
            const url = editId ? `/api/premium-content/${editId}` : "/api/premium-content";
            await fetch(url, { method: editId ? "PUT" : "POST", headers: authHeaders, body: JSON.stringify(body) });
            setShowModal(false);
            const res = await fetch(`/api/premium-content?courseId=${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
            setPremiums(await res.json());
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this premium content?")) return;
        try {
            await fetch(`/api/premium-content/${id}`, { method: "DELETE", headers: authHeaders });
            setPremiums(prev => prev.filter(p => p._id !== id));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-navy-800">Premium Content</h2>
                    <p className="text-sm text-navy-400">Define premium course offerings (metadata only — no file uploads)</p>
                </div>
                {selectedCourse && (
                    <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-md">
                        <Plus className="w-4 h-4" /> Add Premium
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

            {/* Premium Cards */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
            ) : selectedCourse && premiums.length === 0 ? (
                <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
                    <p className="text-navy-400">No premium content defined for this course.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {premiums.map(p => (
                        <div key={p._id} className="bg-white rounded-xl border border-navy-100 p-5 card-hover">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <Crown className="w-6 h-6 text-amber-500" />
                                    <div>
                                        <h3 className="font-bold text-navy-800">{p.title}</h3>
                                        <span className="text-lg font-bold text-teal-600">PKR {p.price.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-teal-600"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-navy-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            {p.description && <p className="text-sm text-navy-500 mb-3">{p.description}</p>}
                            <div className="flex flex-wrap gap-2">
                                {(p.features.videoCount ?? 0) > 0 && <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-lg">🎥 {p.features.videoCount} Videos</span>}
                                {(p.features.pastPaperCount ?? 0) > 0 && <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">📝 {p.features.pastPaperCount} Past Papers</span>}
                                {(p.features.quizCount ?? 0) > 0 && <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-lg">❓ {p.features.quizCount} Quizzes</span>}
                                {(p.features.notesCount ?? 0) > 0 && <span className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-lg">📄 {p.features.notesCount} Notes</span>}
                                {(p.features.otherFeatures ?? []).map(f => <span key={f} className="text-xs px-2 py-1 bg-navy-50 text-navy-600 rounded-lg">✨ {f}</span>)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-navy-800">{editId ? "Edit Premium Content" : "Add Premium Content"}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-navy-50"><X className="w-5 h-5 text-navy-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Title *</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Physics Premium Bundle" className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Price (PKR) *</label>
                                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} min="0" className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                            </div>
                            <p className="text-xs font-semibold text-navy-500 pt-2">Included Content Counts</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-navy-500 mb-1">Videos</label>
                                    <input type="number" value={form.videoCount} onChange={e => setForm({ ...form, videoCount: Number(e.target.value) })} min="0" className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-navy-500 mb-1">Past Papers</label>
                                    <input type="number" value={form.pastPaperCount} onChange={e => setForm({ ...form, pastPaperCount: Number(e.target.value) })} min="0" className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-navy-500 mb-1">Quizzes</label>
                                    <input type="number" value={form.quizCount} onChange={e => setForm({ ...form, quizCount: Number(e.target.value) })} min="0" className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-navy-500 mb-1">Notes</label>
                                    <input type="number" value={form.notesCount} onChange={e => setForm({ ...form, notesCount: Number(e.target.value) })} min="0" className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy-700 mb-1">Other Features (comma separated)</label>
                                <input value={form.otherFeatures} onChange={e => setForm({ ...form, otherFeatures: e.target.value })} placeholder='e.g. "Live Sessions, WhatsApp Group"' className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-navy-200 rounded-xl text-sm font-medium text-navy-600 hover:bg-navy-50">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex-1 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
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
