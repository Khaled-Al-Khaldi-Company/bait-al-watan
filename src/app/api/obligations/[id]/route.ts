import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const id = params.id;

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.title) updateData.title = body.title;
    if (body.amount) updateData.amount = parseFloat(body.amount);
    if (body.type) updateData.type = body.type;
    if (body.dueDate) updateData.dueDate = new Date(body.dueDate);

    const obligation = await prisma.obligation.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(obligation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
