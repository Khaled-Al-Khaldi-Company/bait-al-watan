import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No session found' });

    const userInDb = await prisma.user.findUnique({
      where: { email: session.user?.email || '' },
      include: {
        participations: { include: { project: true } },
        transactions: true
      }
    });

    return NextResponse.json({
      session: session.user,
      databaseUser: {
        id: userInDb?.id,
        email: userInDb?.email,
        role: userInDb?.role,
        participationCount: userInDb?.participations?.length,
        transactionCount: userInDb?.transactions?.length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
