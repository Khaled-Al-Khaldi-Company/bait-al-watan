import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const participations = await prisma.projectParticipation.findMany({
      include: {
        user: { select: { name: true, email: true } },
        project: { select: { name: true } }
      }
    });

    const transactions = await prisma.transaction.findMany({
      select: {
        userId: true,
        amount: true,
        type: true,
        project: { select: { name: true } }
      }
    });

    return NextResponse.json({ participations, transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
