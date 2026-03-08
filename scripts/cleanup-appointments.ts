import mongoose from "mongoose";
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

async function cleanupAppointments() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection is not available");
  }

  const collectionName = "appointments";
  const exists = await db.listCollections({ name: collectionName }).toArray();

  if (exists.length === 0) {
    console.log("No appointments collection found. Nothing to clean.");
    await mongoose.disconnect();
    return;
  }

  const result = await db.collection(collectionName).deleteMany({});
  console.log(`Deleted ${result.deletedCount ?? 0} appointment records.`);

  await mongoose.disconnect();
}

cleanupAppointments().catch(async (error) => {
  console.error("Appointment cleanup failed:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
