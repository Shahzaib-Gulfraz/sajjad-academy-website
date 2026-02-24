"use client";

import { useState } from "react";
import { Download, Maximize2, Minimize2, ZoomIn, ZoomOut, Image as ImageIcon } from "lucide-react";

interface ImageViewerProps {
    src: string;
    title?: string;
}

export default function ImageViewer({ src, title }: ImageViewerProps) {
    const [expanded, setExpanded] = useState(false);
    const [zoom, setZoom] = useState(1);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

    return (
        <div className={`bg-white rounded-2xl border border-navy-100 overflow-hidden transition-all duration-300 ${expanded ? "fixed inset-4 z-50 flex flex-col" : "relative shadow-sm"}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-navy-50/50 border-b border-navy-100 backdrop-blur-sm">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white border border-navy-100">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="text-sm font-bold text-navy-800 truncate">{title || "Image Preview"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 bg-white border border-navy-100 rounded-lg p-0.5 mr-1">
                        <button
                            onClick={handleZoomOut}
                            className="p-1.5 hover:bg-navy-50 rounded-md text-navy-400 hover:text-navy-600 transition-colors"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-bold text-navy-600 px-1 w-10 text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-1.5 hover:bg-navy-50 rounded-md text-navy-400 hover:text-navy-600 transition-colors"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>

                    <a
                        href={src.includes("cloudinary.com") ? src.replace("/upload/", "/upload/fl_attachment/") : src}
                        download
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </a>

                    <button
                        onClick={() => {
                            setExpanded(!expanded);
                            setZoom(1);
                        }}
                        className="p-2 text-navy-600 hover:bg-navy-100 rounded-lg transition-colors border border-navy-100 ml-1"
                        title={expanded ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Image Stage */}
            <div className={`relative flex-1 overflow-auto bg-navy-900/5 flex items-center justify-center p-4 min-h-[400px] ${expanded ? "h-full" : "h-[500px]"}`}>
                <div
                    className="transition-transform duration-200 ease-out flex items-center justify-center"
                    style={{ transform: `scale(${zoom})` }}
                >
                    <img
                        src={src}
                        alt={title || "Preview"}
                        className="max-w-full max-h-full rounded-lg shadow-xl"
                    />
                </div>
            </div>

            {/* Expanded Backdrop */}
            {expanded && (
                <div
                    className="fixed inset-0 bg-navy-950/80 -z-10 backdrop-blur-md"
                    onClick={() => setExpanded(false)}
                />
            )}
        </div>
    );
}
