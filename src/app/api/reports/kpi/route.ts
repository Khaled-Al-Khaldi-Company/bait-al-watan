import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Collection Rate
    const participations = await prisma.projectParticipation.findMany();
    const totalRequired = participations.reduce((s, p) => s + (p.shareAmount || 0), 0);
    
    const transactions = await prisma.transaction.findMany();
    const totalPaid = transactions
      .filter(t => t.type === 'MEMBER_CONTRIBUTION' && t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);

    // 2. Project Status Distribution
    const projects = await prisma.project.findMany({ select: { status: true } });
    const statusMap: any = {};
    projects.forEach(p => {
      statusMap[p.status] = (statusMap[p.status] || 0) + 1;
    });
    const statusData = Object.keys(statusMap).map(k => ({ name: k, value: statusMap[k] }));

    // 3. Monthly Inflow (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = await prisma.transaction.findMany({
      where: {
        type: 'MEMBER_CONTRIBUTION',
        amount: { gt: 0 },
        date: { gte: sixMonthsAgo }
      },
      select: { amount: true, date: true }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyInflow: any = {};
    
    monthlyData.forEach(t => {
      const monthLabel = months[new Date(t.date).getMonth()];
      monthlyInflow[monthLabel] = (monthlyInflow[monthLabel] || 0) + t.amount;
    });

    const inflowChart = Object.keys(monthlyInflow).map(k => ({ name: k, amount: monthlyInflow[k] }));

    return NextResponse.json({
      collection: {
        totalRequired,
        totalPaid,
        rate: totalRequired > 0 ? (totalPaid / totalRequired) * 100 : 0
      },
      statusDistribution: statusData,
      monthlyInflow: inflowChart
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
