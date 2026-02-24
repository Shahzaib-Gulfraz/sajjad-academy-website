/**
 * Add a new admin user.
 *
 * Usage:
 *   npx tsx scripts/add-admin.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv(fileName: string) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(".env.local");
loadEnv(".env");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: String,
    role: { type: String, enum: ["student", "admin"], default: "student" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    subscribedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function addAdmin() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  const email = "shahzaib@gmail.com";
  const password = "shahzaib123";
  const name = "Shahzaib";

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`User ${email} already exists. Updating to admin role...`);
    existing.role = "admin";
    existing.status = "active";
    existing.password = await bcrypt.hash(password, 12);
    existing.name = name;
    await existing.save();
    console.log("✅ User updated to admin successfully!");
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      status: "active",
      subscribedCourses: [],
    });
    console.log("✅ Admin user created successfully!");
    console.log(`Email: ${user.email}`);
  }

  console.log(`\nLogin credentials:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  await mongoose.disconnect();
}

addAdmin().catch(async (error) => {
  console.error("❌ Add admin failed:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
