"use client";

import { useState, useEffect } from "react";
import { Save, Globe, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const tabs = ["General", "Contact", "Announcements"];

// All settings keys we use
const settingKeys = [
  "academyName",
  "tagline",
  "aboutDescription",
  "whatsappNumber",
  "portalUrl",
  "email",
  "phone",
  "address",
  "mapsUrl",
  "facebookUrl",
  "instagramUrl",
  "youtubeUrl",
  "linkedinUrl",
  "announcementEnabled",
  "announcementText",
  "announcementCta",
  "announcementLink",
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json();
        // API returns { settings: { key: value, ... } }
        const map: Record<string, string> = {};
        if (data.settings && typeof data.settings === "object") {
          for (const [k, v] of Object.entries(data.settings)) {
            map[k] = String(v ?? "");
          }
        }
        setSettings(map);
      } catch {
        console.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key: string, value: string) => {
    let val = value;
    if (key === "mapsUrl" && value.includes("<iframe")) {
      const match = value.match(/src="([^"]+)"/);
      if (match && match[1]) {
        val = match[1];
      }
    }
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // API expects body as { key: value, key: value, ... }
      const body: Record<string, string> = {};
      for (const k of settingKeys) {
        if (settings[k] !== undefined) {
          body[k] = settings[k];
        }
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-800">Settings</h2>
          <p className="text-sm text-navy-400">
            Configure your academy website preferences.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50",
            saved ? "bg-green-600" : "bg-gradient-teal hover:opacity-90"
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-50 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === t
                ? "bg-white text-navy-800 shadow-sm"
                : "text-navy-400 hover:text-navy-600"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-navy-100 p-6">
        {activeTab === "General" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-navy-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-600" /> General Settings
            </h3>
            <Field label="Academy Name" value={settings.academyName || ""} onChange={(v) => set("academyName", v)} />
            <Field label="Tagline" value={settings.tagline || ""} onChange={(v) => set("tagline", v)} />
            <TextArea label="About Description" value={settings.aboutDescription || ""} onChange={(v) => set("aboutDescription", v)} />
            <Field label="WhatsApp Number" value={settings.whatsappNumber || ""} onChange={(v) => set("whatsappNumber", v)} />
            <Field label="Student Portal URL" value={settings.portalUrl || ""} onChange={(v) => set("portalUrl", v)} />
          </div>
        )}

        {activeTab === "Contact" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-navy-800 flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-600" /> Contact Information
            </h3>
            <Field label="Email" value={settings.email || ""} onChange={(v) => set("email", v)} icon={<Mail className="w-4 h-4" />} />
            <Field label="Phone" value={settings.phone || ""} onChange={(v) => set("phone", v)} icon={<Phone className="w-4 h-4" />} />
            <Field label="Address" value={settings.address || ""} onChange={(v) => set("address", v)} icon={<MapPin className="w-4 h-4" />} />
            <Field label="Google Maps Embed URL" value={settings.mapsUrl || ""} onChange={(v) => set("mapsUrl", v)} placeholder="Paste your embed URL…" />
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-600">Social Media Links</label>
              <div className="space-y-3">
                {[
                  { label: "Facebook", key: "facebookUrl" },
                  { label: "Instagram", key: "instagramUrl" },
                  { label: "YouTube", key: "youtubeUrl" },
                  { label: "LinkedIn", key: "linkedinUrl" },
                ].map((s) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-xs text-navy-500 w-20">{s.label}</span>
                    <input
                      value={settings[s.key] || ""}
                      onChange={(e) => set(s.key, e.target.value)}
                      placeholder={`https://${s.label.toLowerCase()}.com/shacademy`}
                      className="flex-1 px-3 py-2 rounded-lg border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Announcements" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-navy-800">Announcement Banner</h3>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-navy-600">Enabled</label>
              <button
                onClick={() =>
                  set("announcementEnabled", settings.announcementEnabled === "true" ? "false" : "true")
                }
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  settings.announcementEnabled === "true" ? "bg-teal-500" : "bg-navy-300"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    settings.announcementEnabled === "true" ? "right-1" : "left-1"
                  )}
                />
              </button>
            </div>
            <TextArea
              label="Banner Text"
              value={settings.announcementText || ""}
              onChange={(v) => set("announcementText", v)}
            />
            <Field label="CTA Text" value={settings.announcementCta || ""} onChange={(v) => set("announcementCta", v)} />
            <Field label="CTA Link" value={settings.announcementLink || ""} onChange={(v) => set("announcementLink", v)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function Field({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-navy-600">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400">
            {icon}
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full px-3 py-2.5 rounded-xl border border-navy-200 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none",
            icon && "pl-10"
          )}
        />
      </div>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-navy-600">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl border border-navy-200 text-sm resize-none focus:ring-2 focus:ring-teal-400 focus:outline-none"
      />
    </div>
  );
}
