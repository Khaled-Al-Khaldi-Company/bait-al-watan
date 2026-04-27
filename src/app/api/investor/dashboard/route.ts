import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    console.log('Fetching dashboard for User ID:', userId);

    const userProjects = await prisma.project.findMany({
      where: {
        participations: {
          some: { userId }
        }
      },
      include: {
        participations: true,
        transactions: true,
        documents: {
           where: {
              OR: [
                 { tag: 'PUBLIC' },
                 { name: { contains: 'عقد' } }
              ]
           }
        }
      }
    });

    console.log(`Found ${userProjects.length} projects for user ${userId}`);

    const dashboardData = userProjects.map(project => {
      const isWallet = project.reservationType === 'WALLET' || (project.name || '').includes('محفظة');
      const myParticipation = project.participations.find(p => p.userId === userId);
      
      // Filter transactions for this specific user in this project
      const myTransactions = project.transactions.filter(t => t.userId === userId);
      
      // Calculate total paid: Include all positive amounts from the user that are NOT transfers or allocation entries
      const userPaidUSD = myTransactions
        .filter(t => 
          (t.amount || 0) > 0 && 
          !(t.purpose || '').includes('[') && 
          !(t.purpose || '').includes('مناقلة')
        )
        .reduce((s, t) => s + (t.amount || 0), 0);

      const userPaidEGP = myTransactions
        .filter(t => (t.amount || 0) > 0)
        .reduce((s, t) => s + ((t.amount || 0) * (t.egpRate || 50)), 0);

      // Calculate total project contributions (for wallet percentage if needed)
      const totalProjectContributions = (project.transactions || [])
        .filter(t => (t.amount || 0) > 0)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      let pct = 0;
      if (isWallet) {
        pct = totalProjectContributions > 0 ? (userPaidUSD / totalProjectContributions) : 0;
      } else {
        pct = (myParticipation?.percentage || 0) / 100;
      }

      const totalRequiredUSD = isWallet ? userPaidUSD : (myParticipation?.shareAmount || (project.totalValue * pct) || 0);

      return {
        id: project.id,
        name: project.name,
        location: project.location,
        status: project.status,
        mySharePercentage: pct * 100,
        myPaidUSD: userPaidUSD,
        myPaidEGP: userPaidEGP,
        totalRequiredUSD,
        remainingUSD: Math.max(0, totalRequiredUSD - userPaidUSD),
        documents: project.documents
      };
    });

    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error('INVESTOR_DASHBOARD_API_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
