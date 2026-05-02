import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string, phaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user?.name || '').includes('مدير');
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { status } = await req.json();

    const updatedPhase = await prisma.phase.update({
      where: { id: params.phaseId },
      data: { status }
    });

    // If this phase is set to ACTIVE, we might want to set others to PENDING/COMPLETED
    // depending on the logic, but for now let's just update the specific phase.

    return NextResponse.json(updatedPhase);
  } catch (error: any) {
    console.error('Update Phase Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string, phaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user?.name || '').includes('مدير');
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.phase.delete({
      where: { id: params.phaseId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Phase Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
