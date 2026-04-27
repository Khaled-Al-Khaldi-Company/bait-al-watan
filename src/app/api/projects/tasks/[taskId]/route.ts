import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { isCompleted } = await req.json();

    const task = await prisma.task.update({
      where: { id: params.taskId },
      data: { isCompleted }
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'فشل في تحديث حالة المهمة' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    await prisma.task.delete({
      where: { id: params.taskId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'فشل في حذف المهمة' }, { status: 500 });
  }
}
