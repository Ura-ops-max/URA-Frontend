// src/services/cloudinary.service.ts
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Cloudinary upload failed');

    const data = await response.json();
    return data.secure_url; // This is the URL you send to your backend
  } catch (error) {
    console.error('Cloudinary Error:', error);
    throw error;
  }
};

// src/lib/cloudinary.ts
export const uploadMediaToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  // Determine if it's a video or image based on file type
  const isVideo = file.type.startsWith('video');
  const resourceType = isVideo ? 'video' : 'image';

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
