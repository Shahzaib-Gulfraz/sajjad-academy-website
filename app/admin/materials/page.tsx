"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Loader2, Upload, FileText, Film, Image as ImageIcon, Presentation } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ClassData { _id: string; name: string; }
interface CourseData { _id: string; name: string; icon: string; }
interface MaterialTypeData { _id: string; name: string; icon: string; }
interface MaterialData {
  _id: string; materialTypeId: string; courseId: string; title: string;
  description: string; fileUrl: string; filePublicId: string;
  fileType: string; fileName: string; order: number; isActive: boolean;
}

export default function AdminMaterialsPage() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [matTypes, setMatTypes] = useState<MaterialTypeData[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState({ url: "", name: "", type: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // Cascade fetches
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
    if (!token || !selectedCourse) { setMatTypes([]); setSelectedType(""); return; }
    fetch(`/api/material-types?courseId=${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setMatTypes(Array.isArray(d) ? d : []); setSelectedType(""); });
  }, [token, selectedCourse]);

  useEffect(() => {
    if (!token || !selectedType) { setMaterials([]); return; }
    setLoading(true);
    fetch(`/api/materials?materialTypeId=${selectedType}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then(r => r.json()).then(d => setMaterials(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [token, selectedType]);

  const getFileIcon = (type: string) => {
    if (type?.includes("video")) return <Film className="w-5 h-5 text-purple-500" />;
    if (type?.includes("image")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (type?.includes("presentation") || type?.includes("powerpoint") || ["ppt", "pptx"].some(ext => type?.toLowerCase().includes(ext)))
      return <Presentation className="w-5 h-5 text-orange-600" />;
    return <FileText className="w-5 h-5 text-orange-500" />;
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ title: "", description: "", order: 0 });
    setFile(null); setExistingFile({ url: "", name: "", type: "" });
    setShowModal(true);
  };

  const openEdit = (m: MaterialData) => {
    setEditId(m._id);
    setForm({ title: m.title, description: m.description, order: m.order });
    setFile(null);
    setExistingFile({ url: m.fileUrl, name: m.fileName, type: m.fileType });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      let fileUrl = existingFile.url;
      let filePublicId = "";
      let fileType = existingFile.type;
      let fileName = existingFile.name;

      if (file) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        const upData = await upRes.json();
        fileUrl = upData.url || "";
        filePublicId = upData.publicId || "";
        fileType = file.type;
        fileName = file.name;
        setUploading(false);
      }

      const body = {
        materialTypeId: selectedType,
        courseId: selectedCourse,
        title: form.title.trim(),
        description: form.description,
        fileUrl,
        filePublicId,
        fileType,
        fileName,
        order: form.order,
      };

      const url = editId ? `/api/materials/${editId}` : "/api/materials";
      await fetch(url, { method: editId ? "PUT" : "POST", headers: authHeaders, body: JSON.stringify(body) });
      setShowModal(false);
      const res = await fetch(`/api/materials?materialTypeId=${selectedType}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      setMaterials(await res.json());
    } catch (e) { console.error(e); }
    finally { setSaving(false); setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    try {
      await fetch(`/api/materials/${id}`, { method: "DELETE", headers: authHeaders });
      setMaterials(prev => prev.filter(m => m._id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-800">Materials</h2>
          <p className="text-sm text-navy-400">Upload and manage course materials (PDFs, videos, etc.)</p>
        </div>
        {selectedType && (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 shadow-md">
            <Plus className="w-4 h-4" /> Upload Material
          </button>
        )}
      </div>

      {/* Cascade Selectors */}
      <div className="bg-white rounded-xl border border-navy-100 p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-navy-500 mb-1">Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none">
            <option value="">Select class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-navy-500 mb-1">Course</label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} disabled={!selectedClass} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none disabled:opacity-50">
            <option value="">Select course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-navy-500 mb-1">Material Type</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} disabled={!selectedCourse} className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none disabled:opacity-50">
            <option value="">Select type</option>
            {matTypes.map(t => <option key={t._id} value={t._id}>{t.icon} {t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Materials List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
      ) : selectedType && materials.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <p className="text-navy-400">No materials uploaded yet for this type.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map(m => (
            <div key={m._id} className="bg-white rounded-xl border border-navy-100 p-4 flex items-center gap-4 card-hover">
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                {getFileIcon(m.fileType)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-navy-800 truncate">{m.title}</h3>
                {m.description && <p className="text-xs text-navy-400 truncate">{m.description}</p>}
                <div className="flex items-center gap-2 mt-1">
                  {m.fileName && <span className="text-[10px] px-2 py-0.5 bg-navy-50 text-navy-500 rounded">{m.fileName}</span>}
                  <span className="text-[10px] text-navy-300">Order: {m.order}</span>
                </div>
              </div>
              {m.fileUrl && (
                <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline font-medium shrink-0">View</a>
              )}
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-teal-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(m._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-navy-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-navy-800">{editId ? "Edit Material" : "Upload Material"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-navy-50"><X className="w-5 h-5 text-navy-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Chapter 1 Quiz" className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">File</label>
                {existingFile.name && !file && (
                  <div className="mb-2 text-xs text-navy-500 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Current: {existingFile.name}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 border border-navy-200 rounded-lg text-sm text-navy-600 hover:bg-navy-50 flex items-center gap-1.5">
                    <Upload className="w-4 h-4" /> {file ? "Change File" : "Choose File"}
                  </button>
                  {file && <span className="text-xs text-navy-500 truncate">{file.name}</span>}
                </div>
                <input ref={fileRef} type="file" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.mov,.jpg,.jpeg,.png,.gif" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Display Order</label>
                <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-navy-200 rounded-xl text-sm font-medium text-navy-600 hover:bg-navy-50">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex-1 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
                  {uploading ? "Uploading..." : saving ? "Saving..." : editId ? "Update" : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
