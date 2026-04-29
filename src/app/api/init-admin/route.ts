import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@bait-al-watan.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        email: 'admin@bait-al-watan.com',
        name: 'مدير النظام',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Admin account activated successfully',
      email: admin.email,
      newPassword: 'admin123'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}
