import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string, phaseId: string } }
) {
  try {
    const { title } = await req.json();
    
    if (!title) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        phaseId: params.phaseId,
        isCompleted: false
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Task Creation Error:', error);
    return NextResponse.json({ error: 'فشل في إضافة المهمة' }, { status: 500 });
  }
}
