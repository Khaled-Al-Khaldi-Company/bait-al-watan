import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    // Show all users for ADMIN/VIEWER, or just the current user for MEMBER
    const userWhere = (role === 'ADMIN' || role === 'VIEWER') ? {} : { id: userId };

    const users = await prisma.user.findMany({
      where: userWhere,
      include: {
        participations: {
          where: projectId ? { projectId } : undefined,
          include: {
            project: {
              include: {
                transactions: true
              }
            }
          }
        }
      }
    });

    // Only return users who have participations in the filtered project
    const filteredUsers = users.filter(u => u.participations.length > 0);

    const reportData = filteredUsers.map(user => {
      let totalRequiredUSD = 0;
      let totalPaidUSD = 0;
      let totalPaidEGP = 0;

      user.participations.forEach(part => {
        const required = (part.project.totalValue * part.percentage) / 100;
        
        const memberTransactions = part.project.transactions.filter(t => 
          t.userId === user.id && 
          !t.purpose?.includes('[') && 
          !t.purpose?.includes('مناقلة') && 
          !t.purpose?.includes('رصيد افتتاح') && 
          !t.purpose?.includes('فتح محفظة') &&
          t.type !== 'FUND_REALLOCATION'
        );

        const paidUSD = memberTransactions.reduce((sum, t) => sum + t.amount, 0);
        const paidEGP = memberTransactions.reduce((sum, t) => {
          const rate = t.egpRate || 50;
          return sum + (t.amount * rate);
        }, 0);
        
        totalRequiredUSD += required;
        totalPaidUSD += paidUSD;
        totalPaidEGP += paidEGP;
      });

      const totalRemainingUSD = totalRequiredUSD - totalPaidUSD;
      // For remaining, we can use a standard rate or a project rate, 
      // but let's use the default 50 for "Future/Remaining" value estimation
      const totalRemainingEGP = totalRemainingUSD * 50; 

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        totalRequired: totalRequiredUSD,
        totalPaid: totalPaidUSD,
        totalPaidEGP,
        totalRemaining: totalRemainingUSD,
        totalRemainingEGP
      };
    });

    return NextResponse.json(reportData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
  }
}
