import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// POST /api/upload — upload file to Cloudinary
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("📤 Uploading file to Cloudinary:", { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      folder 
    });

    // Determine resource type
    let resourceType: "image" | "video" | "raw" | "auto" = "auto";
    if (file.type.startsWith("image/")) resourceType = "image";
    else if (file.type.startsWith("video/")) resourceType = "video";
    else resourceType = "raw"; // PDFs, docs, etc.

    const buffer = Buffer.from(await file.arrayBuffer());
    // Pass original filename to preserve it
    const result = await uploadToCloudinary(buffer, folder, resourceType, file.name);

    console.log("✅ File uploaded to Cloudinary successfully:", {
      url: result.url,
      publicId: result.publicId,
      originalFilename: file.name
    });

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      resourceType: result.resourceType,
      fileName: file.name,
      message: "File uploaded successfully to Cloudinary"
    });
  } catch (error: unknown) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
