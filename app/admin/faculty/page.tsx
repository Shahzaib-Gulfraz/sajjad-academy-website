"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Save,
    Loader2,
    User,
    GraduationCap,
    Image as ImageIcon,
    Check,
    MoreVertical,
    Upload
} from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface FacultyMember {
    _id: string;
    name: string;
    designation: string;
    experience: string;
    bio: string;
    image: string;
    imagePublicId: string;
    subjects: string[];
    order: number;
    isActive: boolean;
}

export default function FacultyAdmin() {
    const { token } = useAuth();
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        designation: "",
        experience: "",
        bio: "",
        image: "",
        imagePublicId: "",
        subjects: "",
        order: 0,
        isActive: true,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFaculty = async () => {
        try {
            const res = await fetch("/api/faculty?all=true", {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store"
            });
            const data = await res.json();
            setFaculty(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch faculty", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchFaculty();
    }, [token]);

    const handleOpenModal = (member?: FacultyMember) => {
        setImageFile(null);
        if (member) {
            setEditingId(member._id);
            setFormData({
                name: member.name,
                designation: member.designation,
                experience: member.experience,
                bio: member.bio,
                image: member.image,
                imagePublicId: member.imagePublicId,
                subjects: member.subjects.join(", "),
                order: member.order,
                isActive: member.isActive,
            });
            setImagePreview(member.image || "");
        } else {
            setEditingId(null);
            setFormData({
                name: "",
                designation: "",
                experience: "",
                bio: "",
                image: "",
                imagePublicId: "",
                subjects: "",
                order: faculty.length,
                isActive: true,
            });
            setImagePreview("");
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let currentImage = formData.image;
            let currentPublicId = formData.imagePublicId;

            // Handle Image Upload if new file selected
            if (imageFile) {
                const fd = new FormData();
                fd.append("file", imageFile);
                fd.append("folder", "faculty");

                const upRes = await fetch("/api/upload", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: fd
                });

                if (!upRes.ok) throw new Error("Image upload failed");
                const upData = await upRes.json();
                currentImage = upData.url;
                currentPublicId = upData.publicId;
            }

            const payload = {
                ...formData,
                image: currentImage,
                imagePublicId: currentPublicId,
                subjects: formData.subjects.split(",").map(s => s.trim()).filter(Boolean),
            };

            const url = editingId ? `/api/faculty/${editingId}` : "/api/faculty";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchFaculty();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to save faculty");
            }
        } catch (error: unknown) {
            const err = error as { message?: string };
            alert(err.message || "Error saving faculty");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this faculty member?")) return;

        try {
            const res = await fetch(`/api/faculty/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchFaculty();
            else alert("Failed to delete faculty member");
        } catch (error) {
            alert("Error deleting faculty member");
        }
    };

    const filteredFaculty = faculty.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.designation.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-navy-800 font-serif">Faculty Management</h2>
                    <p className="text-sm text-navy-500">Add and manage your expert faculty members.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-teal text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-teal-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Faculty
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-navy-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Total Faculty</p>
                            <p className="text-xl font-bold text-navy-800">{faculty.length}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-navy-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Active</p>
                            <p className="text-xl font-bold text-navy-800">{faculty.filter(f => f.isActive).length}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-navy-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <Search className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Subjects</p>
                            <p className="text-xl font-bold text-navy-800">
                                {new Set(faculty.flatMap(f => f.subjects)).size}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-navy-100 flex flex-col sm:flex-row gap-4 justify-between bg-navy-50/30">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                        <input
                            type="text"
                            placeholder="Search faculty..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-navy-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-navy-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-navy-500 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-xs font-semibold text-navy-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-navy-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-navy-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                                        <p className="text-sm text-navy-400">Loading faculty...</p>
                                    </td>
                                </tr>
                            ) : filteredFaculty.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <User className="w-12 h-12 text-navy-100 mx-auto mb-2" />
                                        <p className="text-sm text-navy-400">No faculty members found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredFaculty.map((f) => (
                                    <tr key={f._id} className="hover:bg-navy-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-navy-100 overflow-hidden relative border border-navy-200">
                                                    {f.image ? (
                                                        <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-navy-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-navy-800">{f.name}</p>
                                                    <p className="text-xs text-navy-500">{f.designation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-navy-600 mb-1">
                                                <span className="font-semibold">Exp:</span> {f.experience || "N/A"}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {f.subjects.slice(0, 3).map((s) => (
                                                    <span key={s} className="px-1.5 py-0.5 bg-navy-50 text-navy-500 border border-navy-100 rounded text-[10px]">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                f.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                            )}>
                                                {f.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(f)}
                                                    className="p-2 text-navy-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(f._id)}
                                                    className="p-2 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-navy-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-navy-800 font-serif">
                                {editingId ? "Edit Faculty Member" : "Add New Faculty Member"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-navy-400 hover:text-navy-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-600 uppercase">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-navy-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                                        placeholder="e.g. Dr. Sajjad"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-600 uppercase">Designation</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-navy-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                                        placeholder="e.g. Physics Lead"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-600 uppercase">Experience</label>
                                    <input
                                        type="text"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-navy-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                                        placeholder="e.g. 15+ Years"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-navy-600 uppercase">Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-navy-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-navy-600 uppercase">Subjects</label>
                                <input
                                    type="text"
                                    value={formData.subjects}
                                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-navy-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                                    placeholder="e.g. Physics, Mathematics (comma separated)"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-navy-600 uppercase">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-navy-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm"
                                    placeholder="Brief biography..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-navy-600 uppercase">Faculty Photo</label>
                                <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-navy-100 bg-navy-50/50">
                                    <div className="w-16 h-16 rounded-xl bg-white border border-navy-100 overflow-hidden shrink-0 flex items-center justify-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-navy-200" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 bg-white border border-navy-200 rounded-lg text-xs font-bold text-navy-600 hover:bg-navy-50 transition-all flex items-center gap-2"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {imagePreview ? "Change Photo" : "Upload Photo"}
                                            </button>
                                            {imageFile && (
                                                <span className="text-[10px] text-teal-600 font-medium">New image selected</span>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <p className="text-[10px] text-navy-400 mt-2">Recommended: Square professional photo.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-teal-600 rounded border-navy-200 focus:ring-teal-500/20"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-navy-700">
                                    Active (show on homepage)
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-navy-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-navy-100 text-navy-600 font-bold rounded-xl hover:bg-navy-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 bg-gradient-teal text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {editingId ? "Update Member" : "Add Member"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
