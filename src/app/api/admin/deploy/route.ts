import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK;

    if (!deployHookUrl) {
      return NextResponse.json({ 
        message: 'تم تعديل الكود محلياً بنجاح. للنشر السحابي التلقائي، يرجى إضافة VERCEL_DEPLOY_HOOK في ملف .env' 
      }, { status: 200 });
    }

    // If hook is available, trigger it
    const response = await fetch(deployHookUrl, { method: 'POST' });
    
    if (response.ok) {
      return NextResponse.json({ message: 'تم إرسال طلب النشر للسحابة بنجاح! سيتم تحديث الموقع خلال دقائق.' });
    } else {
      return NextResponse.json({ error: 'فشل الاتصال بـ Vercel. تأكد من صحة الرابط.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Deploy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
