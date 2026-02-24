"use client";

import { useState } from "react";
import { Download, ExternalLink, Maximize2, Minimize2, Presentation } from "lucide-react";

interface PPTViewerProps {
    src: string;
    title?: string;
}

export default function PPTViewer({ src, title }: PPTViewerProps) {
    const [expanded, setExpanded] = useState(false);

    // For Cloudinary URLs, inject fl_attachment to force download
    const downloadUrl = src.includes("cloudinary.com")
        ? src.replace("/upload/", "/upload/fl_attachment/")
        : src;

    // Use Microsoft Office Online viewer for reliable PPTX rendering
    // Office Online viewer requires a publicly accessible URL
    const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(src)}`;

    return (
        <div className={`bg-white rounded-xl border border-navy-100 overflow-hidden transition-all ${expanded ? "fixed inset-4 z-50" : ""}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-navy-50 border-b border-navy-100">
                <div className="flex items-center gap-2 min-w-0">
                    <Presentation className="w-4 h-4 text-orange-600 shrink-0" />
                    <span className="text-sm font-medium text-navy-700 truncate">{title || "PowerPoint Presentation"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-navy-600 hover:bg-navy-100 rounded-lg transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                    </a>
                    <a
                        href={downloadUrl}
                        download
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download
                    </a>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-navy-600 hover:bg-navy-100 rounded-lg transition-colors"
                    >
                        {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        {expanded ? "Exit" : "Expand"}
                    </button>
                </div>
            </div>

            {/* Viewer Frame */}
            <div className="bg-navy-900/5 flex items-center justify-center relative">
                <iframe
                    src={viewerUrl}
                    className={`w-full border-0 shadow-inner ${expanded ? "h-[calc(100%-44px)]" : "h-[600px]"}`}
                    title={title || "PPTX Viewer"}
                    frameBorder="0"
                />
            </div>

            {/* Backdrop for expanded */}
            {expanded && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
                    onClick={() => setExpanded(false)}
                />
            )}
        </div>
    );
}
