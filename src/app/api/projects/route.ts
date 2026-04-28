export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { 
      name, location, description, totalValue, reservationFee, installmentValue, 
      installmentsCount, startDate, reservationCode, phaseNumber, neighborhood, 
      plotArea, pricePerMeter, reservationType, bookingAccount 
    } = body;

    const project = await prisma.project.create({
      data: {
        name,
        location,
        description,
        reservationCode,
        phaseNumber,
        neighborhood,
        reservationType,
        bookingAccount,
        plotArea: parseFloat(plotArea || 0),
        pricePerMeter: parseFloat(pricePerMeter || 0),
        totalValue: parseFloat(totalValue || 0),
        reservationFee: parseFloat(reservationFee || 0),
        installmentValue: parseFloat(installmentValue || 0),
        installmentsCount: parseInt(installmentsCount || 0),
        startDate: startDate ? new Date(startDate) : null,
        phases: {
          create: [
            { name: 'مرحلة ما قبل التقديم', order: 1, status: 'ACTIVE' },
            { name: 'مرحلة التقديم', order: 2, status: 'PENDING' },
            { name: 'مرحلة التخصيص', order: 3, status: 'PENDING' },
            { name: 'مرحلة ما بعد التخصيص', order: 4, status: 'PENDING' },
          ]
        }
      }
    });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Create Project Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const body = await req.json();
    const { 
      name, location, description, status, totalValue, reservationFee, 
      installmentValue, installmentsCount, exchangeRate, startDate,
      reservationCode, phaseNumber, neighborhood, plotArea, pricePerMeter,
      reservationType, bookingAccount
    } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        location,
        description,
        status,
        reservationCode,
        phaseNumber,
        neighborhood,
        reservationType,
        bookingAccount,
        plotArea: parseFloat(plotArea || 0),
        pricePerMeter: parseFloat(pricePerMeter || 0),
        totalValue: parseFloat(totalValue || 0),
        reservationFee: parseFloat(reservationFee || 0),
        installmentValue: parseFloat(installmentValue || 0),
        installmentsCount: parseInt(installmentsCount || 0),
        exchangeRate: parseFloat(exchangeRate || 3.75),
        startDate: startDate ? new Date(startDate) : null,
      }
    });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Update Project Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      include: {
        phases: {
          include: { tasks: true },
          orderBy: { order: 'asc' }
        },
        documents: true,
        transactions: true,
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Fetch Projects Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch projects', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Delete Project Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete project' }, { status: 500 });
  }
}
