import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; transactionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user?.name || '').includes('مدير');
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { transactionId } = params;

    if (!transactionId) {
      return NextResponse.json({ error: 'المعرف مفقود' }, { status: 400 });
    }

    // Standard single deletion
    await prisma.transaction.delete({ 
      where: { id: transactionId } 
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE_TRANSACTION_ERROR:', error);
    return NextResponse.json({ 
      error: 'فشل حذف العملية المالية',
      details: error.message 
    }, { status: 500 });
  }
}
