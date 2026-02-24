"use client";

import { useState } from "react";
import { Download, ExternalLink, Maximize2, Minimize2 } from "lucide-react";

interface PDFViewerProps {
    src: string;
    title?: string;
}

export default function PDFViewer({ src, title }: PDFViewerProps) {
    const [expanded, setExpanded] = useState(false);

    // For Cloudinary URLs, inject fl_attachment to force download
    const downloadUrl = src.includes("cloudinary.com")
        ? src.replace("/upload/", "/upload/fl_attachment/")
        : src;

    // Use Google Docs viewer for reliable PDF rendering
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(src)}&embedded=true`;

    return (
        <div className={`bg-white rounded-xl border border-navy-100 overflow-hidden transition-all ${expanded ? "fixed inset-4 z-50" : ""}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-navy-50 border-b border-navy-100">
                <span className="text-sm font-medium text-navy-700 truncate">{title || "PDF Document"}</span>
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

            {/* PDF Frame */}
            <iframe
                src={viewerUrl}
                className={`w-full border-0 ${expanded ? "h-[calc(100%-44px)]" : "h-[600px]"}`}
                title={title || "PDF Viewer"}
                sandbox="allow-scripts allow-same-origin allow-popups"
            />

            {/* Backdrop for expanded */}
            {expanded && (
                <div
                    className="fixed inset-0 bg-black/50 -z-10"
                    onClick={() => setExpanded(false)}
                />
            )}
        </div>
    );
}
