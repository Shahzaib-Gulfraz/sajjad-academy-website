/**
 * Seed Script — Populates MongoDB with initial courses and an admin user.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Make sure your .env.local has MONGODB_URI set before running.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
// import { subjects } from "../lib/data";

// ─── Inline env loading (dotenv not required) ───
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local may not exist — rely on env vars
  }
}

loadEnv();

// ─── Models (inline to avoid Next.js module issues) ───

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ["free", "premium"], default: "free" },
  fileUrl: String,
  filePublicId: String,
  fileType: String,
});

const CourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: String, enum: ["igcse", "as", "a2"], required: true },
    category: { type: String, required: true },
    icon: { type: String, default: "📘" },
    description: { type: String, default: "" },
    tags: [String],
    fee: { type: Number, default: 0 },
    instructor: { type: String, default: "" },
    resources: {
      notes: [MaterialSchema],
      quizzes: [MaterialSchema],
      pastPapers: [MaterialSchema],
      videos: [MaterialSchema],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    subscribedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, default: "" },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Setting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);

// ─── Seed ───

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set. Check your .env.local file.");
    process.exit(1);
    return; // TypeScript flow analysis helper
  }

  console.log("🔌 Connecting to MongoDB…");
  await mongoose.connect(uri);
  console.log("✅ Connected!\n");

  // 1. Seed courses (Legacy - Removed)
  console.log("📚 (Skipping course seeding - legacy structure removed)\n");

  // 2. Seed admin user
  console.log("👤 Seeding admin user…");
  const adminEmail = "admin@shacademy.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log(`   ⏭  Admin user (${adminEmail}) already exists, skipping.\n`);
  } else {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`   ✅ Created admin user:`);
    console.log(`      Email:    ${adminEmail}`);
    console.log(`      Password: admin123\n`);
  }

  // 3. Seed default settings
  console.log("⚙️  Seeding default settings…");
  const defaultSettings = [
    { key: "academyName", value: "SH Academy", isPublic: true },
    { key: "tagline", value: "Where Excellence Meets Education", isPublic: true },
    { key: "aboutDescription", value: "We provide world-class O Level and A Level education with comprehensive study materials, experienced instructors, and proven exam strategies.", isPublic: true },
    { key: "whatsappNumber", value: "+92 321 1234567", isPublic: true },
    { key: "email", value: "info@shacademy.com", isPublic: true },
    { key: "phone", value: "+92 (051) 123-4567", isPublic: true },
    { key: "address", value: "123 Education Lane, Blue Area, Islamabad", isPublic: true },
    { key: "announcementEnabled", value: "true", isPublic: true },
    { key: "announcementText", value: "🎓 Exciting News! Admissions for March 2026 Batch are now OPEN!", isPublic: true },
    { key: "announcementCta", value: "Enroll Now", isPublic: true },
    { key: "announcementLink", value: "/pricing", isPublic: true },
  ];

  let settingsCreated = 0;
  for (const s of defaultSettings) {
    const exists = await Setting.findOne({ key: s.key });
    if (!exists) {
      await Setting.create(s);
      settingsCreated++;
    }
  }
  console.log(`   ✅ ${settingsCreated} new settings created (${defaultSettings.length - settingsCreated} already existed).\n`);

  console.log("🎉 Seed complete!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
