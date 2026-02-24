"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Users, Star, Award, Loader2, User } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface FacultyMember {
    _id: string;
    name: string;
    designation: string;
    experience: string;
    bio: string;
    image: string;
    subjects: string[];
}

export default function FacultySection() {
    const { ref, isVisible } = useScrollAnimation();
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/faculty", { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => setFaculty(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error fetching faculty:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section id="faculty" className="relative py-24 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 overflow-hidden">
            {/* Premium Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -right-32 w-128 h-128 bg-teal-500/10 rounded-full blur-3xl animate-blob-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl animate-blob-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div
                    ref={ref}
                    className={cn(
                        "text-center mb-20 transition-all duration-1000",
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    )}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-semibold mb-6 backdrop-blur-sm">
                        <GraduationCap className="w-4 h-4 text-teal-400" />
                        <span>Expert Educators</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-white mb-6">
                        Meet Our <span className="text-gradient-gold">Faculty</span>
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
                        Learn from the industry&apos;s best. Our expert faculty members are dedicated to
                        your success with years of proven academic excellence.
                    </p>
                </div>

                {/* Faculty Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 text-teal-400 animate-spin" />
                    </div>
                ) : faculty.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                        <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
                        <p className="text-white/40">Faculty listing coming soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                        {faculty.map((member, i) => (
                            <div
                                key={member._id}
                                className={cn(
                                    "group relative transition-all duration-700 h-full",
                                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                                )}
                                style={{ transitionDelay: `${i * 150}ms` }}
                            >
                                {/* Card Glow Effect */}
                                <div className="absolute -inset-0.5 bg-linear-to-r from-teal-500/0 via-teal-500/0 to-gold-400/0 rounded-3xl blur opacity-0 group-hover:opacity-100 group-hover:from-teal-500/20 group-hover:to-gold-400/20 transition duration-500" />

                                <div className="relative h-full bg-navy-800/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-teal-500/30 transition-all duration-500 hover:-translate-y-2 flex flex-col shadow-2xl">
                                    {/* Image Container */}
                                    <div className="relative h-72 sm:h-80 overflow-hidden">
                                        {member.image ? (
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-navy-700 flex items-center justify-center">
                                                <User className="w-20 h-20 text-white/10" />
                                            </div>
                                        )}
                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-linear-to-t from-navy-900 via-transparent to-transparent opacity-60" />

                                        {/* Experience Badge */}
                                        {member.experience && (
                                            <div className="absolute bottom-4 right-4 px-3 py-1 bg-teal-500 text-white text-xs font-bold rounded-full shadow-lg">
                                                {member.experience}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="text-2xl font-bold text-white font-serif group-hover:text-teal-400 transition-colors">
                                                {member.name}
                                            </h3>
                                            <p className="text-teal-500 text-sm font-semibold tracking-wide uppercase mt-1">
                                                {member.designation}
                                            </p>
                                        </div>

                                        <p className="text-white/60 text-sm leading-relaxed mb-6 line-clamp-3">
                                            {member.bio}
                                        </p>

                                        {/* Subjects */}
                                        <div className="mt-auto pt-6 border-t border-white/10 flex flex-wrap gap-2">
                                            {member.subjects.map((sub) => (
                                                <span
                                                    key={sub}
                                                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/70 uppercase tracking-tighter hover:bg-teal-500/20 hover:text-teal-400 hover:border-teal-500/30 transition-all"
                                                >
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Trust Strip */}
                <div className="mt-24 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center">
                        <Star className="w-6 h-6 text-gold-400 mb-2" />
                        <span className="text-white font-bold text-xl uppercase tracking-tighter pb-1">5.0 Rating</span>
                        <span className="text-white/40 text-xs">Student Satisfaction</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Award className="w-6 h-6 text-teal-400 mb-2" />
                        <span className="text-white font-bold text-xl uppercase tracking-tighter pb-1">Top Tier</span>
                        <span className="text-white/40 text-xs">Faculty Selection</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Users className="w-6 h-6 text-teal-400 mb-2" />
                        <span className="text-white font-bold text-xl uppercase tracking-tighter pb-1">10k+</span>
                        <span className="text-white/40 text-xs">Success Stories</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <GraduationCap className="w-6 h-6 text-gold-400 mb-2" />
                        <span className="text-white font-bold text-xl uppercase tracking-tighter pb-1">Certified</span>
                        <span className="text-white/40 text-xs">PhD & Masters Holders</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
