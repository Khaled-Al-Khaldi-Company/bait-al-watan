import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const allProjects = await prisma.project.findMany({
      include: { transactions: true, obligations: true }
    });

    const allocatedCount = allProjects.filter(p => (p.status || '') === 'ALLOCATED').length;
    const awardingCount = allProjects.filter(p => ['UNDER_STUDY', 'SUBMITTED'].includes(p.status || '')).length;
    const inProgressCount = allProjects.filter(p => (p.status || '') === 'IN_PROGRESS').length;
    const completedCount = allProjects.filter(p => (p.status || '') === 'COMPLETED').length;

    const authorityDirectTypes = [
      'AUTHORITY_PAYMENT', 'RESERVATION_FEE_PAYMENT',
      'INSTALLMENT_PAYMENT', 'ACTIVATION_TRANSFER'
    ];

    // معاملة داخلية = إعادة توزيع أرباح أو مناقلة داخلية فقط
    // لا نعتبر معاملات الهيئة الحقيقية (WALLET_OPENING, LIQUIDITY_TRANSFER) داخلية
    const isInternalMove = (t: any) =>
      t.type === 'FUND_REALLOCATION' ||
      ((t.purpose || '').includes('[') && (t.purpose || '').includes(']')) ||
      (t.purpose || '').includes('مناقلة') ||
      (t.purpose || '').includes('رصيد افتتاح');

    // أنواع تحويلات المحفظة (أموال ذهبت لمحفظة الهيئة)
    const walletTransferTypes = ['LIQUIDITY_TRANSFER', 'WALLET_OPENING_PAYMENT'];

    let totalMemberContributions = 0; // إجمالي مساهمات الشركاء
    let totalAuthorityDirect = 0;     // مدفوع للهيئة مباشرة
    let totalLiquidityToWallet = 0;   // محوّل لمحفظة الهيئة
    let totalOfficialRecognized = 0;  // المعترف به رسمياً في سجلات الهيئة
    let totalExpenses = 0;            // مصاريف تشغيلية
    let totalRemainingToAuthority = 0;

    allProjects.forEach(project => {
      try {
        const transactions = project.transactions || [];
        const status = project.status || 'UNDER_STUDY';

        // 1. مساهمات الشركاء
        const contributions = transactions
          .filter(t => t.type === 'MEMBER_CONTRIBUTION' && (t.amount || 0) > 0 && !isInternalMove(t))
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        totalMemberContributions += contributions;

        // 2. مدفوعات الهيئة المباشرة — مبالغ سالبة، أنواع الهيئة المباشرة
        const authorityDirect = transactions
          .filter(t => authorityDirectTypes.includes(t.type || '') && (t.amount || 0) < 0 && !isInternalMove(t))
          .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
        totalAuthorityDirect += authorityDirect;

        // 3. تحويلات لمحفظة الهيئة (LIQUIDITY_TRANSFER + WALLET_OPENING_PAYMENT) — مبالغ سالبة
        const liquidityToWallet = transactions
          .filter(t => walletTransferTypes.includes(t.type || '') && (t.amount || 0) < 0 && !isInternalMove(t))
          .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
        totalLiquidityToWallet += liquidityToWallet;

        // 4. المعترف به رسمياً (officialAmount في معاملات الهيئة + تحويلات المحفظة)
        const officialRecognized = transactions
          .filter(t =>
            (authorityDirectTypes.includes(t.type || '') || walletTransferTypes.includes(t.type || '')) &&
            (t.amount || 0) < 0 && !isInternalMove(t)
          )
          .reduce((sum, t) => sum + Math.abs(t.officialAmount || 0), 0);
        totalOfficialRecognized += officialRecognized;

        // 5. المصاريف التشغيلية
        const expenses = transactions
          .filter(t => t.type === 'OTHER_EXPENSE' && !isInternalMove(t))
          .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
        totalExpenses += expenses;

        // 6. المتبقي (للمشاريع المخصصة فقط)
        if (status === 'ALLOCATED') {
          const totalValue = project.totalValue || 0;
          const totalPaidForProject = authorityDirect + liquidityToWallet;
          totalRemainingToAuthority += Math.max(0, totalValue - totalPaidForProject);
        }
      } catch (e) {
        console.error(`Error processing project ${project.id}:`, e);
      }
    });

    // إجمالي ما ذهب للهيئة = مباشر + محوّل للمحفظة
    const totalPaidToAuthority = totalAuthorityDirect + totalLiquidityToWallet;

    // ─── المعادلات الصحيحة ────────────────────────────────────────────────
    // المعترف به رسمياً = officialAmount الإجمالي من كل معاملات الهيئة
    const officialPaid = totalOfficialRecognized;

    // محفظة الهيئة (الرصيد المدين) = المعترف به رسمياً − المدفوع مباشرة للهيئة
    // يعني: ما تم الاعتراف به عبر المحفظة فقط (ليس عبر الدفع المباشر)
    const authorityWalletBalance = Math.max(0, totalOfficialRecognized - totalAuthorityDirect);

    // رصيد الصندوق (الكاش الفعلي) = مساهمات − معترف به رسمياً − مصاريف
    // لأن "المعترف به رسمياً" هو ما خرج فعلاً من الصندوق وتم توثيقه لدى الهيئة
    const cashBalance = totalMemberContributions - totalOfficialRecognized - totalExpenses;

    return NextResponse.json({
      // للتوافق مع الكود القديم
      allocatedCount: allocatedCount || 0,
      awardingCount: awardingCount || 0,
      inProgressCount: inProgressCount || 0,
      completedCount: completedCount || 0,
      // القيم الجديدة الصحيحة
      totalMemberContributions,        // إجمالي المحفظة
      cashBalance,                     // رصيد الصندوق (كاش فعلي)
      authorityWalletBalance,          // رصيد محفظة الهيئة (مدين)
      totalLiquidityToWallet,          // محوّل لمحفظة الهيئة
      totalAuthorityDirect,            // مدفوع للهيئة مباشرة
      totalPaidToAuthority,            // إجمالي سداد الهيئة
      officialPaid,                    // المعترف به رسمياً
      expenses: totalExpenses,
      remainingToAuthority: totalRemainingToAuthority,
      // Legacy keys for backward compatibility
      totalPaid: totalPaidToAuthority,
      totalOfficialPaid: officialPaid,
      totalRecognized: totalMemberContributions,
    });

  } catch (error: any) {
    console.error('CRITICAL_STATS_API_ERROR:', error);
    return NextResponse.json({
      error: 'Failed to fetch stats',
      details: error.message
    }, { status: 500 });
  }
}
