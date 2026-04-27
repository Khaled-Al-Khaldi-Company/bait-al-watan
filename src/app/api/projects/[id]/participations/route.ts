import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const participations = await prisma.projectParticipation.findMany({
    where: { projectId: params.id },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  return NextResponse.json(participations);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { userId, percentage } = body;

  const participation = await prisma.projectParticipation.upsert({
    where: {
      projectId_userId: {
        projectId: params.id,
        userId: userId
      }
    },
    update: { percentage: parseFloat(percentage) },
    create: {
      projectId: params.id,
      userId: userId,
      percentage: parseFloat(percentage)
    }
  });

  return NextResponse.json(participation);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  await prisma.projectParticipation.delete({
    where: {
      projectId_userId: {
        projectId: params.id,
        userId: userId
      }
    }
  });

  return NextResponse.json({ success: true });
}
