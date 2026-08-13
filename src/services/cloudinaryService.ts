export interface CloudinaryUploadResult {
  success: boolean;
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  resourceType?: string;
  bytes?: number;
}

export interface CloudinaryStatus {
  configured: boolean;
  cloudName: string | null;
  uploadPreset: string | null;
}

/**
  * Check whether Cloudinary backend credentials are configured on the server.
  */
export async function checkCloudinaryStatus(): Promise<CloudinaryStatus> {
  try {
    const res = await fetch('/api/cloudinary/status');
    if (!res.ok) throw new Error('Failed to fetch Cloudinary status');
    return await res.json();
  } catch (err) {
    console.warn('Error checking Cloudinary status:', err);
    return { configured: false, cloudName: null, uploadPreset: null };
  }
}

/**
  * Upload a File object (image, video, pdf, etc.) to Cloudinary via server-side API proxy.
  */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'teethly_app'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      const resourceType = file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('image/')
        ? 'image'
        : 'auto';

      try {
        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileData: base64Data,
            folder,
            resourceType,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to upload file to Cloudinary');
        }

        resolve(data);
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file for Cloudinary upload'));
    };

    reader.readAsDataURL(file);
  });
}
