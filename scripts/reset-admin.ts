/**
 * Reset (or create) the default admin account.
 *
 * Usage:
 *   npm run reset-admin
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
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function resetAdmin() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  const email = "admin@shacademy.com";
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: "Admin",
        password: hashedPassword,
        role: "admin",
        status: "active",
      },
    },
    { upsert: true, new: true }
  );

  console.log("Admin account is ready:");
  console.log(`Email: ${user.email}`);
  console.log("Password: admin123");

  await mongoose.disconnect();
}

resetAdmin().catch(async (error) => {
  console.error("Reset admin failed:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

