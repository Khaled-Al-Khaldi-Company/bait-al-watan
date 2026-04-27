import { NextRequest, NextResponse } from 'next/server';

// ─── Cloudinary Upload ────────────────────────────────────────────────────────
// إذا كانت متغيرات Cloudinary موجودة، استخدمها، وإلا استخدم التخزين المحلي
const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_KEY   = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SEC   = process.env.CLOUDINARY_API_SECRET;

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'bait_al_watan'); // unsigned preset — أنشئه في Cloudinary
  formData.append('folder', 'bait-al-watan/documents');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary error: ${err}`);
  }

  const data = await res.json();
  return data.secure_url;
}

async function uploadLocally(file: File): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const uploadDir = path.join(process.cwd(), 'storage', 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return `/api/files/uploads/${filename}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'لا يوجد ملف مرفق' }, { status: 400 });
    }

    let url: string;

    // استخدم Cloudinary إذا كانت متغيرات البيئة موجودة
    if (CLOUDINARY_CLOUD && CLOUDINARY_KEY && CLOUDINARY_SEC) {
      url = await uploadToCloudinary(file);
    } else {
      // fallback للتطوير المحلي
      url = await uploadLocally(file);
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('UPLOAD_ERROR:', error);
    return NextResponse.json({ error: 'فشل رفع الملف: ' + error.message }, { status: 500 });
  }
}
