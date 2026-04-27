import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Find the sample project
    const project = await prisma.project.findFirst({
      where: { name: 'مشروع بيت الوطن - المرحلة الخامسة' }
    });

    if (!project) {
      return NextResponse.json({ message: 'المشروع غير موجود بالفعل.' });
    }

    // 2. Delete the project (onDelete: Cascade will handle phases, participations, etc. if configured in schema)
    // Looking at schema, phases, participations, documents, and transactions are Cascade.
    await prisma.project.delete({
      where: { id: project.id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'تم حذف مشروع بيت الوطن - المرحلة الخامسة وجميع البيانات المرتبطة به بنجاح.' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
