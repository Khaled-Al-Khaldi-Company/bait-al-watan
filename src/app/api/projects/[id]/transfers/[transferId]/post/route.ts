import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string, transferId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }

    const { id, transferId } = params;

    const transfer = await prisma.transferTracking.findUnique({
      where: { id: transferId }
    });

    if (!transfer) {
      return NextResponse.json({ error: 'الحوالة غير موجودة' }, { status: 404 });
    }

    if (transfer.status === 'POSTED') {
      return NextResponse.json({ error: 'تم ترحيل هذه الحوالة مسبقاً' }, { status: 400 });
    }

    if (!transfer.referenceNumber || !transfer.arrivalDate || !transfer.receivedAmount) {
      return NextResponse.json({ error: 'يجب إكمال بيانات الحوالة (السويفت وتاريخ الوصول) قبل الترحيل' }, { status: 400 });
    }

    // Create the transaction and update transfer status in a transaction
    const [transaction, updatedTransfer] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          projectId: id,
          userId: (session.user as any).id,
          type: 'AUTHORITY_PAYMENT',
          amount: -Math.abs(transfer.transferAmount), // المبلغ الإجمالي المدفوع (سالب لأنه صرف)
          officialAmount: transfer.receivedAmount, // المبلغ المعترف به من الهيئة
          date: transfer.arrivalDate, // تاريخ الاعتماد هو تاريخ الوصول
          purpose: transfer.reason || 'حوالة دولية (سويفت)',
          bankName: transfer.toAccountName,
          accountHolder: transfer.toAccountName,
          iban: transfer.toAccountNumber,
          transferCode: transfer.referenceNumber,
          sharedExpense: false,
          // note: store fees and vat in attachmentUrl temporarily or add a note field if it exists
        }
      }),
      prisma.transferTracking.update({
        where: { id: transferId },
        data: {
          status: 'POSTED',
          transactionId: undefined // Would be nice to link it, but we can update it after or use the id directly. Since transactionId is a unique field, we'll link it.
        }
      })
    ]);

    // Update the transfer tracking with the created transaction ID
    await prisma.transferTracking.update({
      where: { id: transferId },
      data: { transactionId: transaction.id }
    });

    return NextResponse.json({ success: true, transaction, updatedTransfer });
  } catch (error) {
    console.error('Error posting transfer to finance:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء ترحيل الحوالة للمالية' },
      { status: 500 }
    );
  }
}
