export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    
    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        location: body.location,
        description: body.description,
        status: body.status,
        totalValue: body.totalValue ? parseFloat(body.totalValue) : undefined,
        reservationFee: body.reservationFee ? parseFloat(body.reservationFee) : undefined,
        installmentValue: body.installmentValue ? parseFloat(body.installmentValue) : undefined,
        installmentsCount: body.installmentsCount ? parseInt(body.installmentsCount) : undefined,
        plotArea: body.plotArea ? parseFloat(body.plotArea) : undefined,
        pricePerMeter: body.pricePerMeter ? parseFloat(body.pricePerMeter) : undefined,
        reservationCode: body.reservationCode,
        phaseNumber: body.phaseNumber,
        neighborhood: body.neighborhood,
        reservationType: body.reservationType,
        bookingAccount: body.bookingAccount,
        exchangeRate: body.exchangeRate ? parseFloat(body.exchangeRate) : undefined,
        startDate: (body.startDate && body.startDate !== "") ? new Date(body.startDate) : undefined,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update Project Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user?.name || '').includes('مدير');
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'عذراً، لا تملك صلاحية الحذف' }, { status: 403 });
    }

    const { id } = params;

    // Use a transaction to ensure clean deletion of all related data
    await prisma.$transaction(async (tx) => {
      // 1. Delete all tasks related to phases of this project
      const phases = await tx.phase.findMany({ where: { projectId: id }, select: { id: true } });
      const phaseIds = phases.map(p => p.id);
      await tx.task.deleteMany({ where: { phaseId: { in: phaseIds } } });

      // 2. Delete all other relations (Prisma schema has Cascade, but being explicit is safer)
      await tx.document.deleteMany({ where: { projectId: id } });
      await tx.transaction.deleteMany({ where: { projectId: id } });
      await tx.projectParticipation.deleteMany({ where: { projectId: id } });
      await tx.obligation.deleteMany({ where: { projectId: id } });
      await tx.chatMessage.deleteMany({ where: { projectId: id } });
      await tx.phase.deleteMany({ where: { projectId: id } });

      // 3. Finally delete the project itself
      await tx.project.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Project Error:', error);
    return NextResponse.json({ 
      error: 'فشل حذف الحجز', 
      details: error.message 
    }, { status: 500 });
  }
}
