import fs from 'fs';
import path from 'path';

const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_KEY   = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SEC   = process.env.CLOUDINARY_API_SECRET;

/**
 * Robust file upload utility that handles both Cloudinary and Local storage.
 * Ensures PDFs and Images are handled correctly.
 */
export async function uploadFile(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  // If Cloudinary is configured, use it
  if (CLOUDINARY_CLOUD && CLOUDINARY_KEY && CLOUDINARY_SEC) {
    return await uploadToCloudinary(file);
  }

  // Fallback to local storage (for development/local VPS)
  return await uploadLocally(file);
}

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  
  // Convert File to Blob to ensure compatibility with some environments
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  
  formData.append('file', blob);
  formData.append('upload_preset', 'bait_al_watan'); // Ensure this exists in Cloudinary settings
  formData.append('folder', 'bait-al-watan/documents');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('Cloudinary Upload Error:', err);
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const data = await res.json();
  
  let url = data.secure_url;
  
  // Bug fix: Ensure PDF extension for iframe compatibility
  if (file.type === 'application/pdf' && !url.toLowerCase().endsWith('.pdf')) {
    url = `${url}.pdf`;
  }

  return url;
}

async function uploadLocally(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
  const filename = `${Date.now()}-${safeName}`;
  const uploadDir = path.join(process.cwd(), 'storage', 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  
  return `/api/files/uploads/${filename}`;
}
