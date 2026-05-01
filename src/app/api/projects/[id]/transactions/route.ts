import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { id: projectId } = params;
    const body = await req.json();
    
    const { amount, officialAmount, date, purpose, type, userId, egpRate } = body;

    const transaction = await prisma.transaction.create({
      data: {
        projectId,
        userId: userId || (session.user as any).id,
        type: type || 'AUTHORITY_PAYMENT',
        amount: parseFloat(amount),
        officialAmount: officialAmount ? Math.abs(parseFloat(officialAmount)) : 0,
        egpRate: egpRate ? parseFloat(egpRate) : null,
        date: new Date(date),
        purpose: purpose || 'بدون بيان',
      }
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('CREATE_TRANSACTION_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = params;
    const transactions = await prisma.transaction.findMany({
      where: { projectId },
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
