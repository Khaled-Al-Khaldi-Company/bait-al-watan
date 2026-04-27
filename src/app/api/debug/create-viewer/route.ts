import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const password = await bcrypt.hash('password123', 10);
    
    const viewer = await prisma.user.upsert({
      where: { email: 'viewer@bait-al-watan.com' },
      update: {
        password: password,
        role: 'VIEWER',
        name: 'مراقب النظام'
      },
      create: {
        email: 'viewer@bait-al-watan.com',
        password: password,
        name: 'مراقب النظام',
        role: 'VIEWER'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Viewer account has been created successfully',
      user: { email: viewer.email, role: viewer.role }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
