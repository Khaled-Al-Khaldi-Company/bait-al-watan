import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, stageId, title } = body;

    // For simplicity, we'll associate tasks with stages by finding or creating the phase
    let phase = await prisma.phase.findFirst({
      where: { projectId, name: stageId }
    });

    if (!phase) {
      phase = await prisma.phase.create({
        data: { projectId, name: stageId, order: 0 }
      });
    }

    const task = await prisma.task.create({
      data: {
        phaseId: phase.id,
        title,
        isCompleted: false
      }
    });

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, isCompleted } = body;

    const task = await prisma.task.update({
      where: { id },
      data: { title, isCompleted }
    });

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
