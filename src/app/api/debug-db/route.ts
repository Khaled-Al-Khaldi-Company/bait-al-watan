import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET() {
  try {
    // 1. Test Prisma Connection
    const userCount = await prisma.user.count();
    
    // 2. Test specific admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    return NextResponse.json({
      status: 'success',
      database: 'connected',
      userCount,
      adminFound: !!admin,
      adminEmail: admin?.email,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
      db_url_defined: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
