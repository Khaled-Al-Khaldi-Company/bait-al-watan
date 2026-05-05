import { NextRequest, NextResponse } from 'next/server';

import { uploadFile } from '@/lib/upload_new';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'لا يوجد ملف مرفق' }, { status: 400 });
    }

    const url = await uploadFile(file);

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('UPLOAD_ERROR:', error);
    return NextResponse.json({ error: 'فشل رفع الملف: ' + error.message }, { status: 500 });
  }
}
