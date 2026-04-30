export const runtime = 'nodejs';
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
        status: body.status,
        totalValue: body.totalValue ? parseFloat(body.totalValue) : undefined,
        plotArea: body.plotArea ? parseFloat(body.plotArea) : undefined,
        pricePerMeter: body.pricePerMeter ? parseFloat(body.pricePerMeter) : undefined,
        reservationCode: body.reservationCode,
        phaseNumber: body.phaseNumber,
        neighborhood: body.neighborhood,
        bookingAccount: body.bookingAccount,
        exchangeRate: body.exchangeRate ? parseFloat(body.exchangeRate) : undefined,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
