import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch recent logs
    const logs = await prisma.activityLog.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    // Fetch recent transactions as activities
    const recentTransactions = await prisma.transaction.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        project: { select: { name: true } }
      }
    });

    // Merge and format
    const activities = [
      ...logs.map(l => ({
        id: l.id,
        type: 'LOG',
        action: l.action,
        details: l.details,
        userName: l.user?.name || 'مستخدم',
        timestamp: l.timestamp
      })),
      ...recentTransactions.map(t => ({
        id: t.id,
        type: 'TRANSACTION',
        action: t.type === 'MEMBER_CONTRIBUTION' ? 'إيداع مالي' : 'صرف للهيئة',
        details: `${t.purpose} - مشروع ${t.project.name} (المبلغ: $${t.amount})`,
        userName: t.user?.name || 'مستخدم',
        timestamp: t.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(activities.slice(0, 50));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
