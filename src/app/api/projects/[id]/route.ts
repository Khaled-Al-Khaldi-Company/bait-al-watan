import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        phases: {
          include: { 
            tasks: {
              include: { assignedTo: true }
            },
            documents: true 
          },
          orderBy: { order: 'asc' }
        },
        documents: true,
        transactions: {
          include: { user: true },
          orderBy: { date: 'desc' }
        },
        participations: {
          include: { user: true }
        },
        obligations: {
          orderBy: { dueDate: 'asc' }
        },
        _count: {
          select: { 
            documents: true,
            transactions: true,
            phases: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Fetch Project Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch project details', 
      details: error.message 
    }, { status: 500 });
  }
}
