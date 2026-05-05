import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }

    const { id } = params;

    const transfers = await prisma.transferTracking.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب سجل الحوالات' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Basic Validation
    if (!body.transferAmount || !body.fromAccount || !body.toAccountName || !body.toAccountNumber || !body.initiationDate) {
      return NextResponse.json({ error: 'البيانات الأساسية ناقصة' }, { status: 400 });
    }

    const transfer = await prisma.transferTracking.create({
      data: {
        projectId: id,
        userId: (session!.user as any).id,
        transferType: body.transferType || 'SWIFT',
        fromAccount: body.fromAccount,
        toAccountName: body.toAccountName,
        toAccountNumber: body.toAccountNumber,
        transferAmount: Number(body.transferAmount),
        transferCurrency: body.transferCurrency || 'SAR',
        receivedAmount: body.receivedAmount ? Number(body.receivedAmount) : null,
        receivedCurrency: body.receivedCurrency || 'USD',
        vatAmount: body.vatAmount ? Number(body.vatAmount) : 0,
        feeAmount: body.feeAmount ? Number(body.feeAmount) : 0,
        reason: body.reason,
        note: body.note,
        initiationDate: new Date(body.initiationDate),
        status: 'PENDING',
      }
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ الحوالة المبدئية' },
      { status: 500 }
    );
  }
}
