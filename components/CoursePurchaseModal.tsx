"use client";

import { useState } from "react";
import { X, CheckCircle, ArrowRight, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface CoursePurchaseModalProps {
  courseId: string;
  courseName: string;
  courseIcon: string;
  courseLevel: string;
  courseInstructor: string;
  courseDescription: string;
  courseFee: number;
  open: boolean;
  onClose: () => void;
}

const steps = ["Course Info", "Payment", "Upload Proof", "Complete"];

const methodMap: Record<string, string> = {
  bank: "bank",
  jazzcash: "jazzcash",
  easypaisa: "easypaisa",
  card: "card",
};

export default function CoursePurchaseModal({
  courseId,
  courseName,
  courseIcon,
  courseLevel,
  courseInstructor,
  courseDescription,
  courseFee,
  open,
  onClose,
}: CoursePurchaseModalProps) {
  const { user, token } = useAuth();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!user || !token) {
      setError("Please log in first to submit a payment.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      let screenshotUrl = "";

      // Upload screenshot if provided
      if (screenshot) {
        const fd = new FormData();
        fd.append("file", screenshot);
        fd.append("folder", "payments");
        const upRes = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "Upload failed");
        screenshotUrl = upData.url;
      }

      // Submit payment
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course: courseId,
          amount: courseFee,
          method: methodMap[paymentMethod] || paymentMethod,
          screenshotUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment submission failed");

      setStep(3);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-modal" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-navy-100 text-navy-400 z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-8">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors", i <= step ? "bg-teal-500 text-white" : "bg-navy-100 text-navy-400")}>
                    {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-[10px] text-navy-400 mt-1 hidden sm:block">{label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("w-8 sm:w-12 h-0.5 mx-1", i < step ? "bg-teal-500" : "bg-navy-100")} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 pt-0">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          {/* Step 0: Course Info */}
          {step === 0 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{courseIcon}</div>
                <div>
                  <h3 className="text-xl font-bold text-navy-800">{courseName}</h3>
                  <p className="text-sm text-navy-500">
                    {String(courseLevel || "COURSE").toLowerCase() === "igcse"
                      ? "IGCSE / O Level"
                      : String(courseLevel || "COURSE").toUpperCase()} • {courseInstructor}
                  </p>
                </div>
              </div>
              <p className="text-sm text-navy-500 mb-4 leading-relaxed">{courseDescription}</p>
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 mb-6">
                <div className="text-sm text-navy-500 mb-1">Course Fee</div>
                <div className="text-2xl font-bold text-navy-800">PKR {courseFee.toLocaleString()}</div>
                <div className="text-xs text-navy-400">One-time payment • Lifetime access</div>
              </div>
              <h4 className="font-semibold text-navy-800 mb-2">What you&apos;ll get:</h4>
              <ul className="space-y-2 mb-6">
                {["Complete premium notes & resources", "All past papers with solutions", "Video lectures & tutorials", "Interactive quizzes & assessments", "LMS portal access (when available)"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-navy-600">
                    <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              {!user ? (
                <p className="text-sm text-center text-red-500 mb-4">Please <a href="/login" className="underline font-medium">log in</a> or <a href="/signup" className="underline font-medium">sign up</a> to purchase.</p>
              ) : (
                <button onClick={() => setStep(1)} className="w-full py-3 bg-gradient-teal text-white font-semibold rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Step 1: Payment Method */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-navy-800 mb-4">Payment Method</h3>
              <div className="space-y-3 mb-6">
                {[
                  { id: "card", label: "Credit / Debit Card", icon: "💳" },
                  { id: "jazzcash", label: "JazzCash", icon: "📱" },
                  { id: "easypaisa", label: "EasyPaisa", icon: "📱" },
                  { id: "bank", label: "Bank Transfer", icon: "🏦" },
                ].map((m) => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={cn("w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left",
                      paymentMethod === m.id ? "border-teal-500 bg-teal-50" : "border-navy-100 hover:border-navy-200"
                    )}>
                    <span className="text-2xl">{m.icon}</span>
                    <span className="font-medium text-navy-800">{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-4 bg-navy-50 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-navy-500">Course</span>
                  <span className="text-sm font-medium text-navy-800">{courseName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-navy-500">Total</span>
                  <span className="text-lg font-bold text-navy-800">PKR {(courseFee ?? 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 border border-navy-200 text-navy-700 font-semibold rounded-xl hover:bg-navy-50">Back</button>
                <button onClick={() => { if (paymentMethod) setStep(2); }} className="flex-1 py-3 bg-gradient-teal text-white font-semibold rounded-xl hover:opacity-90">
                  Continue <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Upload Proof */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold text-navy-800 mb-2">Upload Payment Proof</h3>
              <p className="text-sm text-navy-500 mb-6">
                Upload a screenshot of your payment receipt. Admin will verify and grant access.
              </p>

              <div className="border-2 border-dashed border-navy-200 rounded-xl p-8 text-center mb-6 hover:border-teal-400 transition-colors">
                {screenshot ? (
                  <div>
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-navy-800">{screenshot.name}</p>
                    <p className="text-xs text-navy-400 mt-1">{(screenshot.size / 1024).toFixed(1)} KB</p>
                    <button onClick={() => setScreenshot(null)} className="text-xs text-red-500 mt-2 hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                    <p className="text-sm text-navy-500">Click to upload screenshot</p>
                    <p className="text-xs text-navy-300 mt-1">PNG, JPG up to 5 MB</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setScreenshot(e.target.files[0]); }} />
                  </label>
                )}
              </div>

              <p className="text-xs text-navy-400 mb-6 text-center">
                Screenshot is optional but speeds up verification.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-navy-200 text-navy-700 font-semibold rounded-xl hover:bg-navy-50">Back</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-3 bg-gradient-teal text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Submit Payment Request"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-2">Payment Request Submitted!</h3>
              <p className="text-sm text-navy-500 mb-6 leading-relaxed">
                Your payment request has been sent to admin for verification. Once confirmed, you&apos;ll get instant access to all premium materials for this course.
              </p>
              <p className="text-xs text-navy-400 mb-6">
                You can track the status of your payment in your account dashboard.
              </p>
              <button onClick={onClose} className="w-full py-3 bg-navy-800 text-white font-semibold rounded-xl hover:bg-navy-700">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
