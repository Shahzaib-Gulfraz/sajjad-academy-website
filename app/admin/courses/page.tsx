"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ClassData { _id: string; name: string; }
interface CourseData {
  _id: string; classId: string | { _id: string; name: string }; name: string; slug: string;
  description: string; thumbnail: string; thumbnailPublicId: string; icon: string;
  tags: string[]; instructor: string; order: number; isActive: boolean;
}

const emptyForm = { classId: "", name: "", description: "", icon: "📚", tags: "", instructor: "", order: 0 };

export default function AdminCoursesPage() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    if (!token) return;
    fetch("/api/classes", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setClasses(Array.isArray(d) ? d : []); setLoading(false); });
  }, [token]);

  useEffect(() => {
    if (!token || !selectedClass) { setCourses([]); return; }
    setLoading(true);
    fetch(`/api/courses?classId=${selectedClass}&all=1`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [token, selectedClass]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm, classId: selectedClass });
    setThumbnail(null); setThumbnailPreview("");
    setShowModal(true);
  };

  const openEdit = (c: CourseData) => {
    setEditId(c._id);
    const cid = typeof c.classId === "object" ? c.classId._id : c.classId;
    setForm({ classId: cid, name: c.name, description: c.description, icon: c.icon, tags: c.tags.join(", "), instructor: c.instructor, order: c.order });
    setThumbnail(null); setThumbnailPreview(c.thumbnail || "");
    setShowModal(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setThumbnail(file); setThumbnailPreview(URL.createObjectURL(file)); }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.classId) return;
    setSaving(true);
    try {
      let thumbnailUrl = thumbnailPreview;
      let thumbnailPublicId = "";

      if (thumbnail) {
        const fd = new FormData();
        fd.append("file", thumbnail);
        const upRes = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        const upData = await upRes.json();
        thumbnailUrl = upData.url || "";
        thumbnailPublicId = upData.publicId || "";
      }

      const body = {
        classId: form.classId,
        name: form.name.trim(),
        description: form.description,
        icon: form.icon,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        instructor: form.instructor,
        order: form.order,
        thumbnail: thumbnailUrl,
        thumbnailPublicId,
      };

      const url = editId ? `/api/courses/${editId}` : "/api/courses";
      const method = editId ? "PUT" : "POST";
      await fetch(url, { method, headers, body: JSON.stringify(body) });
      setShowModal(false);
      // Refresh
      const res = await fetch(`/api/courses?classId=${selectedClass}&all=1`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      setCourses(await res.json());
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course and all its materials?")) return;
    try {
      await fetch(`/api/courses/${id}`, { method: "DELETE", headers });
      setCourses(prev => prev.filter(c => c._id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-800">Courses</h2>
          <p className="text-sm text-navy-400">Select a class first, then manage its courses</p>
        </div>
        {selectedClass && (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-md">
            <Plus className="w-4 h-4" /> Add Course
          </button>
        )}
      </div>

      {/* Class Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {classes.map(c => (
          <button key={c._id} onClick={() => setSelectedClass(c._id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedClass === c._id ? "bg-teal-500 text-white shadow-md" : "bg-white border border-navy-100 text-navy-600 hover:border-teal-300"}`}>
            {c.name}
          </button>
        ))}
        {classes.length === 0 && !loading && (
          <p className="text-sm text-navy-400">No classes found. <a href="/admin/classes" className="text-teal-600 hover:underline">Add a class first</a>.</p>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
      ) : selectedClass && courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <p className="text-navy-400">No courses in this class yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(c => (
            <div key={c._id} className="bg-white rounded-xl border border-navy-100 overflow-hidden card-hover">
              {c.thumbnail && (
                <div className="h-40 bg-navy-50 overflow-hidden">
                  <img src={c.thumbnail} alt={c.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.icon}</span>
                    <h3 className="font-bold text-navy-800">{c.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-teal-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-navy-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {c.description && <p className="text-sm text-navy-500 line-clamp-2 mb-2">{c.description}</p>}
                {c.instructor && <p className="text-xs text-navy-400">Instructor: {c.instructor}</p>}
                {c.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full">{t}</span>)}
                  </div>
                )}
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
              <h3 className="text-lg font-bold text-navy-800">{editId ? "Edit Course" : "Add Course"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-navy-50"><X className="w-5 h-5 text-navy-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Class *</label>
                <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none">
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Course Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Physics" className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Thumbnail</label>
                <div className="flex items-center gap-4">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="thumb" className="w-20 h-20 rounded-lg object-cover border" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-navy-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-navy-300" />
                    </div>
                  )}
                  <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-2 border border-navy-200 rounded-lg text-sm text-navy-600 hover:bg-navy-50 flex items-center gap-1.5">
                    <Upload className="w-4 h-4" /> Upload
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Icon (emoji)</label>
                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Instructor</label>
                <input value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="e.g. Algebra, Geometry" className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Display Order</label>
                <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-navy-200 rounded-xl text-sm font-medium text-navy-600 hover:bg-navy-50">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.classId} className="flex-1 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
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
