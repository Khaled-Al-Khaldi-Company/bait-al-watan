import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    // Fetch recent activities from various tables
    const whereClause = projectId ? { projectId } : {};

    const [recentTransactions, recentProjects, recentDocs] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        take: 20,
        orderBy: { date: 'desc' },
        include: { project: { select: { name: true } }, user: { select: { name: true } } }
      }),
      prisma.project.findMany({
        where: projectId ? { id: projectId } : {},
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
      }),
      prisma.document.findMany({
        where: whereClause,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { project: { select: { name: true } } }
      })
    ]);

    // Format into a unified activity feed for Timeline
    const activities = [
      ...recentTransactions.map(t => ({
        id: `tx-${t.id}`,
        description: `${t.type === 'MEMBER_CONTRIBUTION' ? 'إيداع نقدي:' : 'عملية صرف:'} ${t.purpose}`,
        createdAt: t.date,
        user: { name: t.user.name },
        type: 'FINANCE'
      })),
      ...recentProjects.map(p => ({
        id: `pr-${p.id}`,
        description: `تأسيس ملف حجز جديد: ${p.name}`,
        createdAt: p.createdAt,
        user: { name: 'النظام' },
        type: 'PROJECT'
      })),
      ...recentDocs.map(d => ({
        id: `doc-${d.id}`,
        description: `رفع مستند جديد: ${d.name}`,
        createdAt: d.createdAt,
        user: { name: 'إدارة الملفات' },
        type: 'DOCUMENT'
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);

    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
