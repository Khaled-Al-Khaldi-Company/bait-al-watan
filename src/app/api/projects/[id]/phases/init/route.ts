import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const DEFAULT_PHASES = [
  { name: 'مرحلة البدء', order: 1 },
  { name: 'مرحلة التقديم', order: 2 },
  { name: 'مرحلة التخصيص', order: 3 },
  { name: 'مرحلة الاستلام', order: 4 },
  { name: 'مرحلة ما بعد الاستلام', order: 5 },
];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user?.name || '').includes('مدير');
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك بالقيام بهذا الإجراء' }, { status: 403 });
    }

    const projectId = params.id;

    // Check if phases already exist
    const existingPhases = await prisma.phase.findMany({
      where: { projectId }
    });

    if (existingPhases.length > 0) {
      return NextResponse.json({ error: 'المراحل موجودة بالفعل لهذا المشروع' }, { status: 400 });
    }

    // Create default phases
    const createdPhases = await Promise.all(
      DEFAULT_PHASES.map(phase => 
        prisma.phase.create({
          data: {
            name: phase.name,
            order: phase.order,
            projectId,
            status: phase.order === 1 ? 'ACTIVE' : 'PENDING'
          }
        })
      )
    );

    return NextResponse.json(createdPhases);
  } catch (error: any) {
    console.error('Init Phases Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
