// src/services/s3.service.ts
import API from "@/lib/axios-client";

interface PresignResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

// Uploads a file to S3 using a backend-issued presigned URL.
// 1. Ask the backend for a short-lived presigned PUT URL.
// 2. PUT the file straight to S3 (no AWS credentials in the browser).
// 3. Return the public URL to store/send to the backend.
// Size ceilings (mirror the backend's FILE_LIMITS) so oversized files fail
// fast with a clear message instead of a long upload that S3 rejects.
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

const uploadToS3 = async (file: File, folder: string): Promise<string> => {
  const isVideo = file.type.startsWith("video");
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    throw new Error(
      `${isVideo ? "Video" : "Image"} is too large (${(file.size / 1024 / 1024).toFixed(
        1,
      )}MB). Maximum is ${limit / 1024 / 1024}MB.`,
    );
  }

  const { data } = await API.post("/upload/presign", {
    fileName: file.name,
    contentType: file.type,
    folder,
  });

  // Backend may wrap the payload in { data: ... } or return it flat.
  const { uploadUrl, fileUrl } = (data?.data ?? data) as PresignResponse;

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!response.ok) {
    // 403 here usually means the presigned URL expired mid-upload.
    throw new Error(
      response.status === 403
        ? "Upload link expired before the file finished uploading. Please try again."
        : `Upload failed (${response.status}). Please try again.`,
    );
  }

  return fileUrl;
};

// Drop-in replacement for uploadImageToCloudinary.
export const uploadImageToS3 = (file: File): Promise<string> =>
  uploadToS3(file, "profiles");

// Drop-in replacement for uploadMediaToCloudinary (images + videos).
export const uploadMediaToS3 = (file: File): Promise<string> => {
  const folder = file.type.startsWith("video") ? "attachments" : "profiles";
  return uploadToS3(file, folder);
};
