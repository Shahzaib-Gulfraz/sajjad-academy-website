"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye, Loader2, Mail, MailOpen, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MessageData {
    _id: string; name: string; email: string; phone: string;
    subject: string; message: string; status: "unread" | "read" | "replied";
    adminReply: string; createdAt: string;
}

export default function AdminMessagesPage() {
    const { token } = useAuth();
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<MessageData | null>(null);
    const [reply, setReply] = useState("");
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState("");

    const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const fetchMessages = async () => {
        try {
            const url = filter ? `/api/messages?status=${filter}` : "/api/messages";
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (token) fetchMessages(); }, [token, filter]);

    const openMessage = async (msg: MessageData) => {
        setSelected(msg);
        setReply(msg.adminReply || "");
        if (msg.status === "unread") {
            await fetch(`/api/messages/${msg._id}`, { method: "PUT", headers: authHeaders, body: JSON.stringify({ status: "read" }) });
            setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: "read" } : m));
        }
    };

    const handleReply = async () => {
        if (!selected || !reply.trim()) return;
        setSaving(true);
        try {
            await fetch(`/api/messages/${selected._id}`, { method: "PUT", headers: authHeaders, body: JSON.stringify({ status: "replied", adminReply: reply.trim() }) });
            setMessages(prev => prev.map(m => m._id === selected._id ? { ...m, status: "replied", adminReply: reply.trim() } : m));
            setSelected(prev => prev ? { ...prev, status: "replied", adminReply: reply.trim() } : null);
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this message?")) return;
        try {
            await fetch(`/api/messages/${id}`, { method: "DELETE", headers: authHeaders });
            setMessages(prev => prev.filter(m => m._id !== id));
            if (selected?._id === id) setSelected(null);
        } catch (e) { console.error(e); }
    };

    const getStatusIcon = (status: string) => {
        if (status === "unread") return <Mail className="w-4 h-4 text-yellow-500" />;
        if (status === "read") return <MailOpen className="w-4 h-4 text-blue-500" />;
        return <MessageCircle className="w-4 h-4 text-green-500" />;
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-navy-800">Messages</h2>
                    <p className="text-sm text-navy-400">User contact messages and inquiries</p>
                </div>
                <div className="flex gap-2">
                    {["", "unread", "read", "replied"].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? "bg-teal-500 text-white" : "bg-white border border-navy-100 text-navy-600 hover:border-teal-300"}`}>
                            {f || "All"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Messages List */}
                <div className="lg:col-span-1 space-y-2">
                    {messages.map(msg => (
                        <div key={msg._id} onClick={() => openMessage(msg)}
                            className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${selected?._id === msg._id ? "border-teal-400 ring-2 ring-teal-100" : "border-navy-100 hover:border-navy-200"}`}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(msg.status)}
                                    <span className={`text-sm font-medium ${msg.status === "unread" ? "text-navy-800 font-bold" : "text-navy-600"}`}>{msg.name}</span>
                                </div>
                                <button onClick={e => { e.stopPropagation(); handleDelete(msg._id); }} className="p-1 rounded hover:bg-red-50 text-navy-300 hover:text-red-500">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-xs text-navy-500 font-medium truncate">{msg.subject}</p>
                            <p className="text-[11px] text-navy-400 truncate mt-0.5">{msg.message}</p>
                            <p className="text-[10px] text-navy-300 mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="bg-white rounded-xl border border-navy-100 p-8 text-center">
                            <p className="text-sm text-navy-400">No messages found</p>
                        </div>
                    )}
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-2">
                    {selected ? (
                        <div className="bg-white rounded-xl border border-navy-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-navy-800">{selected.subject}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-navy-500">
                                        <span>{selected.name}</span>
                                        <span>•</span>
                                        <a href={`mailto:${selected.email}`} className="text-teal-600 hover:underline">{selected.email}</a>
                                        {selected.phone && <><span>•</span><span>{selected.phone}</span></>}
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${selected.status === "unread" ? "bg-yellow-100 text-yellow-700" :
                                    selected.status === "read" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                                    }`}>{selected.status}</span>
                            </div>
                            <div className="bg-navy-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-navy-700 whitespace-pre-wrap">{selected.message}</p>
                            </div>
                            <div className="text-xs text-navy-400 mb-4">
                                Received: {new Date(selected.createdAt).toLocaleString()}
                            </div>

                            {/* Reply Section */}
                            <div className="border-t border-navy-100 pt-4">
                                <label className="block text-sm font-medium text-navy-700 mb-2">Admin Reply</label>
                                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4} placeholder="Write your reply..." className="w-full px-4 py-3 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none resize-none" />
                                <div className="flex justify-end mt-3">
                                    <button onClick={handleReply} disabled={saving || !reply.trim()} className="px-6 py-2.5 bg-gradient-teal text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
                                        {saving ? "Saving..." : selected.status === "replied" ? "Update Reply" : "Send Reply"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
                            <Eye className="w-10 h-10 text-navy-200 mx-auto mb-3" />
                            <p className="text-sm text-navy-400">Select a message to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
