import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const projectsCount = await prisma.project.count();
    const usersCount = await prisma.user.count();
    return NextResponse.json({ projectsCount, usersCount, status: 'Database is UP' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, status: 'Database is DOWN' }, { status: 500 });
  }
}
