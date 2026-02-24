"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Download,
  Loader2,
  FileText,
  Film,
  Image as ImageIcon,
  Crown,
  MessageCircle,
  ExternalLink,
  Tag,
  User,
  Presentation,
} from "lucide-react";
import { cn } from "@/lib/utils";

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), { ssr: false });
const PDFViewer = dynamic(() => import("@/components/PDFViewer"), { ssr: false });
const ImageViewer = dynamic(() => import("@/components/ImageViewer"), { ssr: false });
const PPTViewer = dynamic(() => import("@/components/PPTViewer"), { ssr: false });

interface CourseData {
  _id: string; name: string; slug: string; description: string;
  thumbnail: string; icon: string; tags: string[];
  instructor: string; classId: { _id: string; name: string; slug: string; icon: string };
}

interface MaterialTypeData {
  _id: string; name: string; slug: string; icon: string;
}

interface MaterialData {
  _id: string; materialTypeId: string; title: string; description: string;
  fileUrl: string; fileType: string; fileName: string;
}

interface PremiumContentData {
  _id: string; title: string; description: string; price: number;
  features: { videoCount?: number; pastPaperCount?: number; quizCount?: number; notesCount?: number; otherFeatures?: string[] };
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [materialTypes, setMaterialTypes] = useState<MaterialTypeData[]>([]);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [premiums, setPremiums] = useState<PremiumContentData[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [viewingMaterial, setViewingMaterial] = useState<MaterialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPremium, setSelectedPremium] = useState<PremiumContentData | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${id}?withMaterials=1`)
      .then(r => r.json())
      .then(data => {
        setCourse(data.course);
        setMaterialTypes(data.materialTypes || []);
        setMaterials(data.materials || []);
        setPremiums(data.premiumContent || []);
        if (data.materialTypes?.length > 0) setActiveTab(data.materialTypes[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-800 mb-2">Course Not Found</h1>
          <Link href="/" className="text-teal-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const activeMaterials = materials.filter(m => m.materialTypeId === activeTab);

  const getFileIcon = (type: string) => {
    if (type?.includes("video")) return <Film className="w-5 h-5 text-purple-500" />;
    if (type?.includes("image")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (type?.includes("presentation") || type?.includes("powerpoint") || ["ppt", "pptx"].some(ext => type?.toLowerCase().includes(ext)))
      return <Presentation className="w-5 h-5 text-orange-600" />;
    return <FileText className="w-5 h-5 text-orange-500" />;
  };

  const isVideo = (type: string) => type?.includes("video");
  const isPDF = (type: string) => type?.includes("pdf") || type?.toLowerCase().endsWith(".pdf");
  const isImage = (type: string) => type?.includes("image") || ["jpg", "jpeg", "png", "gif", "webp"].some(ext => type?.toLowerCase().includes(ext));
  const isPPT = (type: string) => type?.includes("presentation") || type?.includes("powerpoint") || ["ppt", "pptx"].some(ext => type?.toLowerCase().includes(ext));

  const openBuyModal = (premium: PremiumContentData) => {
    setSelectedPremium(premium);
    setShowBuyModal(true);
  };

  const handleDownload = (e: React.MouseEvent, url: string, fileName: string) => {
    e.stopPropagation();
    if (!url) return;

    // For Cloudinary URLs, inject fl_attachment to force download
    let downloadUrl = url;
    if (url.includes("cloudinary.com")) {
      downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Hero */}
      <div className="relative bg-navy-900 pt-24 pb-16">
        {course.thumbnail && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={course.thumbnail} alt={course.name} className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-navy-950 via-navy-900/90 to-teal-900/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <Link href="/#subjects" className="inline-flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
            {course.thumbnail ? (
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-gold-400 to-teal-400 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-gradient-x" />
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-navy-800">
                  <img
                    src={course.thumbnail}
                    alt={course.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-3xl shadow-2xl border border-white/20">
                    {course.icon}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-white/5 flex items-center justify-center text-8xl border-2 border-white/10 shadow-2xl backdrop-blur-md">
                {course.icon}
              </div>
            )}

            <div className="flex-1 text-center lg:text-left pt-4">
              {course.classId && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 backdrop-blur-md border border-teal-500/20 rounded-full mb-6">
                  <span className="text-lg">{course.classId.icon}</span>
                  <span className="text-teal-300 text-sm font-bold tracking-widest uppercase">
                    {course.classId.name}
                  </span>
                </div>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black font-serif text-white tracking-tight leading-tight lg:leading-[1.1] mb-6 drop-shadow-2xl">
                {course.name}
              </h1>
              {course.instructor && (
                <div className="flex items-center justify-center lg:justify-start gap-3 mt-4">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center border-2 border-navy-900 shadow-xl">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Expert Instructor</span>
                    <span className="text-white font-bold text-lg tracking-wide">{course.instructor}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {course.description && (
            <div className="mt-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 max-w-4xl animate-fade-in">
              <p className="text-white/80 leading-relaxed text-base sm:text-lg">
                {course.description}
              </p>
            </div>
          )}
          {course.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-8">
              {course.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-teal-500/10 to-teal-400/5 text-teal-300 text-xs font-bold rounded-lg border border-teal-500/20">
                  <Tag className="w-3.5 h-3.5" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Material Type Tabs */}
            {materialTypes.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {materialTypes.map(mt => (
                  <button key={mt._id} onClick={() => { setActiveTab(mt._id); setViewingMaterial(null); }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === mt._id ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" : "bg-white text-navy-600 border border-navy-100 hover:border-teal-300"
                      }`}>
                    <span>{mt.icon}</span> {mt.name}
                  </button>
                ))}
              </div>
            )}

            {/* Inline Viewer */}
            {viewingMaterial && (
              <div id="material-viewer" className="space-y-3 scroll-mt-24">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-navy-800">{viewingMaterial.title}</h3>
                  <button onClick={() => setViewingMaterial(null)} className="text-xs text-navy-400 hover:text-navy-600 px-2 py-1 rounded hover:bg-navy-100">
                    Close Viewer ✕
                  </button>
                </div>
                {isVideo(viewingMaterial.fileType) ? (
                  <VideoPlayer src={viewingMaterial.fileUrl} title={viewingMaterial.title} />
                ) : isPDF(viewingMaterial.fileType) ? (
                  <PDFViewer src={viewingMaterial.fileUrl} title={viewingMaterial.title} />
                ) : isPPT(viewingMaterial.fileType) ? (
                  <PPTViewer src={viewingMaterial.fileUrl} title={viewingMaterial.title} />
                ) : isImage(viewingMaterial.fileType) ? (
                  <ImageViewer src={viewingMaterial.fileUrl} title={viewingMaterial.title} />
                ) : (
                  <div className="bg-white rounded-2xl border border-navy-100 p-10 text-center shadow-sm">
                    <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-navy-100">
                      <FileText className="w-8 h-8 text-navy-400" />
                    </div>
                    <h4 className="text-navy-800 font-bold mb-2">Ready to Study</h4>
                    <p className="text-sm text-navy-500 mb-6 max-w-xs mx-auto">This file format is available for download and offline study.</p>
                    <button
                      onClick={(e) => handleDownload(e, viewingMaterial.fileUrl, viewingMaterial.fileName || viewingMaterial.title)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-teal text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-teal-500/20"
                    >
                      <Download className="w-4 h-4" /> Download Material
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Materials List */}
            {activeMaterials.length > 0 ? (
              <div className="space-y-3">
                {activeMaterials.map(mat => (
                  <div
                    key={mat._id}
                    className={cn(
                      "bg-white rounded-2xl border p-5 flex items-center gap-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                      viewingMaterial?._id === mat._id
                        ? "border-teal-400 ring-4 ring-teal-500/10 shadow-lg"
                        : "border-navy-100 hover:border-teal-300"
                    )}
                    onClick={() => {
                      if (!mat.fileUrl) return;
                      setViewingMaterial(mat);
                      setTimeout(() => {
                        document.getElementById("material-viewer")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      viewingMaterial?._id === mat._id ? "bg-teal-500 text-white" : "bg-navy-50 text-navy-600 group-hover:bg-teal-50"
                    )}>
                      {getFileIcon(mat.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-navy-800 text-base">{mat.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {mat.fileType && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 bg-navy-50 px-1.5 py-0.5 rounded">
                            {mat.fileType.split("/")[1] || "file"}
                          </span>
                        )}
                        {mat.description && <p className="text-xs text-navy-400 truncate">{mat.description}</p>}
                      </div>
                    </div>
                    {mat.fileUrl && (
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={cn(
                          "text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border",
                          viewingMaterial?._id === mat._id
                            ? "bg-teal-500 text-white border-teal-500"
                            : "bg-teal-50 text-teal-600 border-teal-100"
                        )}>
                          {isVideo(mat.fileType) ? "▶ Play" : isPDF(mat.fileType) ? "📄 View" : isPPT(mat.fileType) ? "📽️ Slides" : isImage(mat.fileType) ? "🖼️ Preview" : "Open"}
                        </span>
                        <button
                          onClick={(e) => handleDownload(e, mat.fileUrl, mat.fileName || mat.title)}
                          className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all border border-orange-100"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : materialTypes.length > 0 ? (
              <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
                <p className="text-navy-400">No materials available in this section yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
                <p className="text-navy-400">No materials available for this course yet. Check back soon!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Premium Content Cards */}
            {premiums.map(p => (
              <div key={p._id} className="bg-white rounded-xl border border-navy-100 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-white" />
                  <span className="text-white font-bold">Premium Course</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-navy-800 mb-1">{p.title}</h3>
                  {p.description && <p className="text-sm text-navy-500 mb-3">{p.description}</p>}
                  <div className="space-y-2 mb-4">
                    {(p.features.videoCount ?? 0) > 0 && (
                      <div className="flex items-center gap-2 text-sm"><span>🎥</span> <span className="text-navy-600">{p.features.videoCount} Video Lectures</span></div>
                    )}
                    {(p.features.pastPaperCount ?? 0) > 0 && (
                      <div className="flex items-center gap-2 text-sm"><span>📝</span> <span className="text-navy-600">{p.features.pastPaperCount} Past Papers</span></div>
                    )}
                    {(p.features.quizCount ?? 0) > 0 && (
                      <div className="flex items-center gap-2 text-sm"><span>❓</span> <span className="text-navy-600">{p.features.quizCount} Quizzes</span></div>
                    )}
                    {(p.features.notesCount ?? 0) > 0 && (
                      <div className="flex items-center gap-2 text-sm"><span>📄</span> <span className="text-navy-600">{p.features.notesCount} Notes</span></div>
                    )}
                    {(p.features.otherFeatures ?? []).map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm"><span>✨</span> <span className="text-navy-600">{f}</span></div>
                    ))}
                  </div>
                  <div className="text-2xl font-bold text-teal-600 mb-4">
                    PKR {p.price.toLocaleString()}
                  </div>
                  <button onClick={() => openBuyModal(p)} className="w-full py-3 bg-gradient-teal text-white font-semibold rounded-xl hover:opacity-90 shadow-md transition-all">
                    Get Premium Access
                  </button>
                </div>
              </div>
            ))}

            {/* Contact Card */}
            <div className="bg-white rounded-xl border border-navy-100 p-5">
              <h4 className="font-bold text-navy-800 mb-2">Need Help?</h4>
              <p className="text-sm text-navy-500 mb-4">Reach out to us for any questions about this course.</p>
              <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors">
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
              <Link href="/#contact"
                className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 border border-navy-200 text-navy-600 text-sm font-semibold rounded-xl hover:bg-navy-50 transition-colors">
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal (Dummy) */}
      {showBuyModal && selectedPremium && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
            <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy-800 mb-2">{selectedPremium.title}</h3>
            <p className="text-2xl font-bold text-teal-600 mb-4">PKR {selectedPremium.price.toLocaleString()}</p>
            <div className="bg-navy-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-navy-700 mb-2">How to Purchase:</p>
              <ol className="text-sm text-navy-600 space-y-2 list-decimal list-inside">
                <li>Contact us via WhatsApp</li>
                <li>Share the course name and your details</li>
                <li>Complete the payment</li>
                <li>Get instant access to all premium materials</li>
              </ol>
            </div>
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors mb-3">
              <MessageCircle className="w-5 h-5" /> Contact on WhatsApp
            </a>
            <button onClick={() => setShowBuyModal(false)} className="text-sm text-navy-400 hover:text-navy-600">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}