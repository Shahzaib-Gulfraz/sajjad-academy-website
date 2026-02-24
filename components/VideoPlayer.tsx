"use client";

import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

interface VideoPlayerProps {
    src: string;
    title?: string;
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (playing) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setPlaying(!playing);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !muted;
        setMuted(!muted);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!isFullscreen) {
            containerRef.current.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
        setIsFullscreen(!isFullscreen);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const val = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(isNaN(val) ? 0 : val);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pct * videoRef.current.duration;
    };

    const handleEnded = () => setPlaying(false);

    return (
        <div ref={containerRef} className="relative bg-black rounded-xl overflow-hidden group">
            <video
                ref={videoRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onClick={togglePlay}
                className="w-full aspect-video cursor-pointer"
                playsInline
            />

            {/* Play overlay */}
            {!playing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={togglePlay}>
                    <div className="w-16 h-16 rounded-full bg-teal-500/90 flex items-center justify-center shadow-lg hover:bg-teal-400 transition-colors">
                        <Play className="w-7 h-7 text-white ml-1" />
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-2" onClick={handleSeek}>
                    <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="text-white hover:text-teal-400 transition-colors">
                            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button onClick={toggleMute} className="text-white hover:text-teal-400 transition-colors">
                            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        {title && <span className="text-xs text-white/70">{title}</span>}
                    </div>
                    <button onClick={toggleFullscreen} className="text-white hover:text-teal-400 transition-colors">
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
