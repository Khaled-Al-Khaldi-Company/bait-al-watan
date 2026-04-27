import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { hash } from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    // Only Admin and Viewer can list all members
    if (role !== 'ADMIN' && role !== 'VIEWER') {
      // If member, they can only see their own profile info in this list
      const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true }
      });
      return NextResponse.json(me ? [me] : []);
    }

    const members = await prisma.user.findMany({
      where: { role: { in: ['MEMBER', 'VIEWER', 'ADMIN'] } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(members);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, password } = body;

    const hashedPassword = await hash(password || 'password123', 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role || 'MEMBER',
        password: hashedPassword
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { id, role, name, email, password } = body;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const updateData: any = { role, name, email };
    
    // If password is provided, hash it before updating
    if (password && password.trim() !== '') {
      updateData.password = await hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    // Prevent deleting self
    if (id === (session.user as any).id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
