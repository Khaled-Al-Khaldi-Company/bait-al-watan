import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string, transferId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }

    const { transferId } = params;
    const body = await request.json();

    const transfer = await prisma.transferTracking.findUnique({
      where: { id: transferId }
    });

    if (!transfer) {
      return NextResponse.json({ error: 'الحوالة غير موجودة' }, { status: 404 });
    }

    if (transfer.status === 'POSTED') {
      return NextResponse.json({ error: 'لا يمكن تعديل حوالة تم ترحيلها للمالية' }, { status: 400 });
    }

    const updateData: any = {
      transferType: body.transferType || transfer.transferType,
      fromAccount: body.fromAccount || transfer.fromAccount,
      toAccountName: body.toAccountName || transfer.toAccountName,
      toAccountNumber: body.toAccountNumber || transfer.toAccountNumber,
      transferAmount: body.transferAmount ? Number(body.transferAmount) : transfer.transferAmount,
      transferCurrency: body.transferCurrency || transfer.transferCurrency,
      initiationDate: body.initiationDate ? new Date(body.initiationDate) : transfer.initiationDate,
      referenceNumber: body.referenceNumber !== undefined ? body.referenceNumber : transfer.referenceNumber,
      arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : transfer.arrivalDate,
      receivedAmount: body.receivedAmount ? Number(body.receivedAmount) : transfer.receivedAmount,
      vatAmount: body.vatAmount !== undefined ? Number(body.vatAmount) : transfer.vatAmount,
      feeAmount: body.feeAmount !== undefined ? Number(body.feeAmount) : transfer.feeAmount,
      note: body.note !== undefined ? body.note : transfer.note,
    };

    if (body.referenceNumber && body.arrivalDate) {
      updateData.status = 'COMPLETED';
    }

    const updatedTransfer = await prisma.transferTracking.update({
      where: { id: transferId },
      data: updateData
    });

    return NextResponse.json(updatedTransfer);
  } catch (error) {
    console.error('Error updating transfer:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الحوالة' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, transferId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }

    const { transferId } = params;

    const transfer = await prisma.transferTracking.findUnique({
      where: { id: transferId }
    });

    if (!transfer) {
      return NextResponse.json({ error: 'الحوالة غير موجودة' }, { status: 404 });
    }

    if (transfer.status === 'POSTED') {
      return NextResponse.json({ error: 'لا يمكن حذف حوالة تم ترحيلها للمالية' }, { status: 400 });
    }

    await prisma.transferTracking.delete({
      where: { id: transferId }
    });

    return NextResponse.json({ message: 'تم حذف الحوالة بنجاح' });
  } catch (error) {
    console.error('Error deleting transfer:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الحوالة' },
      { status: 500 }
    );
  }
}
