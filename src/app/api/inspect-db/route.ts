import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { project: { select: { name: true } } }
    });

    const summary = {
      total_count: transactions.length,
      types: transactions.reduce((acc: any, t) => {
        acc[t.type] = (acc[t.type] || 0) + (t.amount || 0);
        return acc;
      }, {}),
      by_project: transactions.reduce((acc: any, t) => {
        const name = t.project?.name || 'Unknown';
        acc[name] = (acc[name] || 0) + (t.amount || 0);
        return acc;
      }, {})
    };

    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
