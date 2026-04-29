import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  try {
    const whereClause = projectId ? { projectId } : {};
    const participations = await prisma.projectParticipation.findMany({
      where: whereClause,
      include: {
        user: true,
        project: true,
      },
      orderBy: {
        project: { name: 'asc' }
      }
    });
    return NextResponse.json(participations);
  } catch (error) {
    console.error('Error fetching participations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { projectId, userId, shareAmount, percentage } = await request.json();

    if (!projectId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data: any = {};
    if (shareAmount !== undefined) data.shareAmount = parseFloat(shareAmount);
    if (percentage !== undefined) data.percentage = parseFloat(percentage);

    const participation = await prisma.projectParticipation.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      update: data,
      create: {
        projectId,
        userId,
        ...data
      },
    });

    return NextResponse.json(participation);
  } catch (error) {
    console.error('Error creating/updating participation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await prisma.projectParticipation.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting participation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

