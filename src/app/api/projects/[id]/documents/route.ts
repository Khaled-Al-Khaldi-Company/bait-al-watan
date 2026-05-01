import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'bait_al_watan'); 
  formData.append('folder', 'bait-al-watan/documents');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary error: ${err}`);
  }

  const data = await res.json();
  return data.secure_url;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const projectId = params.id;
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const phaseId = formData.get('phaseId') as string;

    if (!file) {
      return NextResponse.json({ error: 'لا يوجد ملف مرفق' }, { status: 400 });
    }

    // Upload to Cloudinary
    const url = await uploadToCloudinary(file);

    // Save record to Database
    const document = await prisma.document.create({
      data: {
        projectId,
        phaseId: phaseId || null,
        name: name || file.name,
        type: type || 'GENERAL',
        url: url,
      }
    });

    return NextResponse.json(document);
  } catch (error: any) {
    console.error('DOCUMENT_UPLOAD_ERROR:', error);
    return NextResponse.json({ error: 'فشل حفظ الملف: ' + error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documents = await prisma.document.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(documents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
