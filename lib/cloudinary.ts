import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  originalFilename?: string;
}

/** Upload a file buffer to Cloudinary */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
  originalFilename?: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // Extract filename and extension for public_id
    let publicId: string | undefined;
    if (originalFilename) {
      const lastDotIndex = originalFilename.lastIndexOf('.');
      const nameWithoutExt = lastDotIndex > 0
        ? originalFilename.substring(0, lastDotIndex)
        : originalFilename;
      const extension = lastDotIndex > 0 ? originalFilename.substring(lastDotIndex) : "";

      // Clean filename: replace spaces and special chars with underscores
      const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');

      // For raw files (PDF, PPTX, etc.), Cloudinary needs the extension in public_id
      // for the resulting URL to have the correct extension.
      if (resourceType === "raw") {
        publicId = `${cleanName}_${Date.now()}${extension}`;
      } else {
        publicId = `${cleanName}_${Date.now()}`;
      }
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `shacademy/${folder}`,
        resource_type: resourceType,
        public_id: publicId,
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            originalFilename: originalFilename,
          });
        }
      }
    );
    stream.end(buffer);
  });
}

/** Delete a file from Cloudinary */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
