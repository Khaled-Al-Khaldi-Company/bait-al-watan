import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const password = await bcrypt.hash('password123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@bait-al-watan.com' },
      update: {
        password: password,
        role: 'ADMIN',
        name: 'مدير النظام'
      },
      create: {
        email: 'admin@bait-al-watan.com',
        password: password,
        name: 'مدير النظام',
        role: 'ADMIN'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin account has been reset/created successfully',
      user: { email: admin.email, role: admin.role }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
