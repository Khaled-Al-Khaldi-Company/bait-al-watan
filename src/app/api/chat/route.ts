import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { projectId, content, fileUrl } = body;

  const message = await prisma.chatMessage.create({
    data: {
      projectId,
      userId: (session.user as any).id,
      content,
      fileUrl
    },
    include: { user: { select: { name: true } } }
  });

  return NextResponse.json(message);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

  const messages = await prisma.chatMessage.findMany({
    where: { projectId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
    take: 100
  });

  return NextResponse.json(messages);
}
