import dbConnect from "@/lib/dbConnect";
import Course from "@/models/Course";
import Setting from "@/models/Setting";
import Link from "next/link";
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  ArrowRight,
} from "lucide-react";

async function getPopularSubjects() {
  try {
    await dbConnect();
    const courses = await Course.find({ isActive: true })
      .select("name _id")
      .limit(5)
      .lean();

    return (courses as unknown as { name: string; _id: string }[]).map(c => ({
      name: c.name,
      href: `/courses/${c._id}`
    }));
  } catch (error) {
    console.error("Failed to fetch footer courses", error);
    return [];
  }
}

async function getSettings() {
  try {
    await dbConnect();
    const settings = await Setting.find();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = String(s.value ?? "");
    }
    return map;
  } catch (error) {
    console.error("Failed to fetch footer settings", error);
    return {};
  }
}

const resources = [
  { name: "Free Notes", href: "/courses" },
  { name: "Past Papers", href: "/courses" },
  { name: "Video Lectures", href: "/courses" },
];

export default async function Footer() {
  const [popularSubjects, settings] = await Promise.all([
    getPopularSubjects(),
    getSettings()
  ]);

  const socialLinks = [
    { icon: Facebook, href: settings.facebookUrl || "#", label: "Facebook", color: "hover:text-blue-600 hover:bg-blue-50" },
    { icon: Instagram, href: settings.instagramUrl || "#", label: "Instagram", color: "hover:text-pink-600 hover:bg-pink-50" },
    { icon: Youtube, href: settings.youtubeUrl || "#", label: "YouTube", color: "hover:text-red-600 hover:bg-red-50" },
    { icon: Linkedin, href: settings.linkedinUrl || "#", label: "LinkedIn", color: "hover:text-blue-700 hover:bg-blue-50" },
  ].filter(link => link.href !== "#");

  const academyName = settings.academyName || "SH Academy";
  const email = settings.email || "info@shacademy.com";
  const phone = settings.phone || "+92 321 2954720";
  const address = settings.address || "Islamabad, Pakistan";
  const mapsUrl = settings.mapsUrl;

  return (
    <footer className="bg-linear-to-b from-navy-900 via-navy-900 to-navy-950 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {/* Brand Section */}
            <div className="animate-fade-in-left" style={{ animationDelay: "0ms" }}>
              <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 bg-gradient-teal rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-300" />
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-teal flex items-center justify-center shadow-lg group-hover:shadow-teal-500/50 group-hover:scale-110 transition-all duration-300">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                </div>
                <span className="text-2xl font-bold font-serif group-hover:text-gold-300 transition-colors duration-300">
                  {academyName}
                </span>
              </Link>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                {settings.aboutDescription || "Empowering students with world-class O Level and A Level education."}
                <span className="block mt-1 text-white/40">{settings.tagline || "30+ years of excellence in Cambridge examinations."}</span>
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-2">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`group w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${social.color}`}
                  >
                    <social.icon className="w-4 h-4 transition-all duration-300 group-hover:rotate-12" />
                  </a>
                ))}
              </div>
            </div>

            {/* Popular Subjects */}
            <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-teal-400 mb-5 flex items-center gap-2">
                <div className="w-1 h-4 bg-linear-to-b from-teal-400 to-teal-600 rounded-full" />
                Popular Subjects
              </h3>
              {popularSubjects.length > 0 ? (
                <ul className="space-y-2.5">
                  {popularSubjects.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="group inline-flex items-center gap-2 text-sm text-white/60 hover:text-teal-400 transition-all duration-300"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0">
                          <ArrowRight className="w-3 h-3" />
                        </span>
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/40 text-sm">No courses available yet.</p>
              )}
            </div>

            {/* Resources / Map Area */}
            <div className="animate-fade-in-up lg:col-span-2" style={{ animationDelay: "150ms" }}>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-teal-400 mb-5 flex items-center gap-2">
                    <div className="w-1 h-4 bg-linear-to-b from-teal-400 to-teal-600 rounded-full" />
                    Contact Info
                  </h3>
                  <ul className="space-y-3.5">
                    {[
                      { icon: Phone, text: phone, href: `tel:${phone.replace(/\s+/g, "")}` },
                      { icon: Mail, text: email, href: `mailto:${email}` },
                      { icon: MapPin, text: address, href: settings.mapsUrl || "#" },
                    ].map((item, i) => (
                      <li key={i}>
                        <a
                          href={item.href}
                          className="group flex items-start gap-3 text-sm text-white/60 hover:text-teal-400 transition-all duration-300"
                        >
                          <div className="w-4 h-4 mt-0.5 text-teal-400 shrink-0 transition-all duration-300 group-hover:scale-125">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span>{item.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {mapsUrl && mapsUrl.includes("google.com/maps/embed") && (
                  <div className="animate-fade-in-right">
                    <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-teal-400 mb-5 flex items-center gap-2">
                      <div className="w-1 h-4 bg-linear-to-b from-teal-400 to-teal-600 rounded-full" />
                      Find Us
                    </h3>
                    <div className="w-full h-40 rounded-xl overflow-hidden border border-white/10 shadow-lg grayscale hover:grayscale-0 transition-all duration-500">
                      <iframe
                        title="Academy Location"
                        src={mapsUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-white/40">
            <p className="flex items-center gap-1.5">
              &copy; {new Date().getFullYear()} {academyName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animated top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-teal-500/30 to-transparent" />
    </footer>
  );
}

