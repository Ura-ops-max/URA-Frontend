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
const uploadToS3 = async (file: File, folder: string): Promise<string> => {
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

  if (!response.ok) throw new Error("S3 upload failed");

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
