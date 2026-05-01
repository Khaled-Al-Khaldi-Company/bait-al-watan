import fs from 'fs';
import path from 'path';

const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SEC = process.env.CLOUDINARY_API_SECRET;

export async function uploadFile(file: File): Promise<string> {
  // Use Cloudinary if variables exist
  if (CLOUDINARY_CLOUD && CLOUDINARY_KEY && CLOUDINARY_SEC) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'bait_al_watan');
      formData.append('folder', 'bait-al-watan/documents');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
        { method: 'POST', body: formData }
      );

      if (res.ok) {
        const data = await res.json();
        return data.secure_url;
      }
      console.warn('Cloudinary upload failed, falling back to local:', await res.text());
    } catch (err) {
      console.error('Cloudinary error:', err);
    }
  }

  // Fallback to local storage (Only works on local dev, will persist briefly on Vercel /tmp)
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  
  // On Vercel, we should use /tmp if we absolutely must write to disk, 
  // but it's better to just fail if Cloudinary is missing in production.
  const isVercel = process.env.VERCEL === '1';
  const baseDir = isVercel ? '/tmp' : path.join(process.cwd(), 'storage', 'uploads');
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const filePath = path.join(baseDir, filename);
  fs.writeFileSync(filePath, buffer);
  
  return isVercel ? `/api/files/tmp/${filename}` : `/api/files/uploads/${filename}`;
}
