import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const participations = await prisma.projectParticipation.findMany({
      where: { projectId },
      include: {
        user: true,
      },
    });
    return NextResponse.json(participations);
  } catch (error) {
    console.error('Error fetching participations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { projectId, userId, shareAmount } = await request.json();

    if (!projectId || !userId || shareAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if participation already exists
    const existing = await prisma.projectParticipation.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existing) {
      // Update existing participation
      const updated = await prisma.projectParticipation.update({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
        data: {
          shareAmount,
        },
      });
      return NextResponse.json(updated);
    }

    // Create new participation
    const participation = await prisma.projectParticipation.create({
      data: {
        projectId,
        userId,
        shareAmount,
      },
    });

    return NextResponse.json(participation);
  } catch (error) {
    console.error('Error creating/updating participation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
