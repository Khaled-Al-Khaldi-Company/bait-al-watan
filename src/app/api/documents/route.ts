import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { uploadFile } from '@/lib/upload';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const isAdmin = user?.role === 'ADMIN' || (user?.name || '').includes('مدير');

    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'عذراً، هذه الصلاحية للمدراء فقط.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const type = formData.get('type') as string;

    if (!file || !projectId) {
      return NextResponse.json({ error: 'يجب اختيار ملف وتحديد المشروع المرتبط.' }, { status: 400 });
    }

    const url = await uploadFile(file);

    const document = await prisma.document.create({
      data: {
        name: file.name,
        url: url,
        type: type || 'OTHER',
        projectId: projectId,
      }
    });

    return NextResponse.json(document);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const documents = await prisma.document.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(documents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, type, name } = body;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const document = await prisma.document.update({
      where: { id },
      data: { type, name }
    });
    return NextResponse.json(document);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const doc = await prisma.document.findUnique({ where: { id } });
    if (doc?.url.startsWith('/api/files/uploads/')) {
       const filename = doc.url.split('/').pop();
       const filePath = path.join(process.cwd(), 'storage', 'uploads', filename!);
       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
