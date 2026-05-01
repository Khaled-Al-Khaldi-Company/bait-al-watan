import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch recent activities from various tables
    const [recentTransactions, recentProjects, recentDocs] = await Promise.all([
      prisma.transaction.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { project: { select: { name: true } }, user: { select: { name: true } } }
      }),
      prisma.project.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
      }),
      prisma.document.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { project: { select: { name: true } } }
      })
    ]);

    // Format into a unified activity feed
    const activities = [
      ...recentTransactions.map(t => ({
        id: `tx-${t.id}`,
        title: `${t.type === 'MEMBER_CONTRIBUTION' ? 'مساهمة من' : 'دفع للهيئة:'} ${t.user.name}`,
        subtitle: `${t.project.name} - $${t.amount.toLocaleString()}`,
        time: t.date,
        color: t.amount > 0 ? '#10b981' : '#ef4444',
        type: 'FINANCE'
      })),
      ...recentProjects.map(p => ({
        id: `pr-${p.id}`,
        title: `حجز جديد: ${p.name}`,
        subtitle: 'تمت إضافة المشروع للنظام',
        time: p.createdAt,
        color: '#3b82f6',
        type: 'PROJECT'
      })),
      ...recentDocs.map(d => ({
        id: `doc-${d.id}`,
        title: `مستند جديد: ${d.name}`,
        subtitle: `في مشروع: ${d.project.name}`,
        time: d.createdAt,
        color: '#f59e0b',
        type: 'DOCUMENT'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
