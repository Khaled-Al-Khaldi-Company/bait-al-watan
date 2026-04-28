export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import prisma from "@/lib/prisma";

async function handleFinanceRequest(req: NextRequest, isPatch = false) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const formData = await req.formData();
    
    const id = formData.get('id') as string;
    const projectId = formData.get('projectId') as string;
    const amount = formData.get('amount') as string;
    const officialAmount = formData.get('officialAmount') as string;
    const date = formData.get('date') as string;
    const purpose = formData.get('purpose') as string;
    const type = formData.get('type') as string;
    const targetUserId = formData.get('userId') as string | null;
    const egpRate = formData.get('egpRate') as string;
    const file = formData.get('attachment') as File;

    if (isPatch && !id) return NextResponse.json({ error: 'المعرف مفقود' }, { status: 400 });
    if (!isPatch && (!amount || isNaN(parseFloat(amount)))) {
      return NextResponse.json({ error: 'يرجى إدخال مبلغ صحيح' }, { status: 400 });
    }

    let attachmentUrl = null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'storage', 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      attachmentUrl = `/api/files/uploads/${filename}`;
    }

    if (isPatch) {
      const updateData: any = {};
      if (amount) updateData.amount = parseFloat(amount);
      if (officialAmount) updateData.officialAmount = parseFloat(officialAmount);
      if (date) updateData.date = new Date(date);
      if (purpose) updateData.purpose = purpose;
      if (type) updateData.type = type;
      if (egpRate) updateData.egpRate = parseFloat(egpRate);
      if (attachmentUrl) updateData.attachmentUrl = attachmentUrl;

      const transaction = await prisma.transaction.update({
        where: { id },
        data: updateData
      });

      if (attachmentUrl) {
        await prisma.document.create({
          data: { projectId: transaction.projectId, name: `سند معدل: ${purpose || file?.name}`, type: 'FINANCIAL', url: attachmentUrl }
        });
      }
      return NextResponse.json(transaction);
    } else {
      let finalUserId = targetUserId;
      if (!finalUserId) {
        const uId = session ? (session.user as any).id : null;
        if (!uId) {
          const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
          finalUserId = admin?.id || '';
        } else {
          finalUserId = uId;
        }
      }

      const transaction = await prisma.transaction.create({
        data: {
          projectId,
          userId: finalUserId || '',
          type: type || 'AUTHORITY_PAYMENT',
          amount: parseFloat(amount),
          officialAmount: officialAmount ? Math.abs(parseFloat(officialAmount)) : 0,
          egpRate: egpRate ? parseFloat(egpRate) : null,
          date: new Date(date),
          purpose: purpose || 'بدون بيان',
          attachmentUrl: attachmentUrl || null
        }
      });

      if (attachmentUrl) {
        await prisma.document.create({
          data: { projectId, name: `سند: ${purpose || file?.name}`, type: type === 'MEMBER_CONTRIBUTION' ? 'INTERNAL_RECEIPT' : 'OFFICIAL_TRANSFER', url: attachmentUrl }
        });
      }
      return NextResponse.json(transaction);
    }
  } catch (error: any) {
    console.error('FINANCE_ERROR:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ في العملية' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleFinanceRequest(req, false);
}

export async function PATCH(req: NextRequest) {
  return handleFinanceRequest(req, true);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const transactions = await prisma.transaction.findMany({
    where: projectId ? { projectId } : {},
    include: { user: { select: { name: true } } },
    orderBy: { date: 'desc' }
  });
  return NextResponse.json(transactions);
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

    // 1. Fetch the transaction to see if it's part of a transfer
    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

    // 2. Check for TID in purpose
    const tidMatch = transaction.purpose?.match(/\[(TID-[\w-]+)\]/);
    
    if (tidMatch) {
      const tid = tidMatch[0]; // Includes brackets
      // Delete all transactions with this TID
      await prisma.transaction.deleteMany({
        where: { purpose: { contains: tid } }
      });
    } else {
      // Standard single deletion
      await prisma.transaction.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE_ERROR:', error);
    return NextResponse.json({ error: 'فشل حذف العملية' }, { status: 500 });
  }
}
