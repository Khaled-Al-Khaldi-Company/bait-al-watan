'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import { 
  BarChart3, Users, Landmark, Wallet, 
  FileText, TrendingUp, ChevronLeft, ArrowRight,
  PieChart, History, Activity, BookUser
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function ReportsHub() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', direction: 'rtl' }}>
      <Sidebar />

      {/* Main Content */}
      <main className="main-content-layout" style={{ flex: 1, padding: '2.5rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.6, marginBottom: '1rem' }}>
             <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>لوحة التحكم</Link> 
             <ChevronLeft size={14} /> 
             مركز التقارير
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#064e3b' }}>مركز التقارير والتحليلات 📊</h1>
          <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>جميع البيانات المالية والتشغيلية في مكان واحد بتنسيق احترافي.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          
          <ReportCard 
            title="تقرير الموقف المالي العام" 
            desc="كشف كامل بأرصدة المساهمين، المبالغ المدفوعة، والمتبقي بالدولار والريال والجنيه."
            icon={<Users size={32} color="#059669" />}
            href="/dashboard/reports/members"
            color="#ecfdf5"
          />

          <ReportCard 
            title="تقرير الحصص والمصروفات" 
            desc="تفاصيل توزيع ثمن الأراضي، رسوم الحجز، والمصروفات الإدارية لكل شريك."
            icon={<Landmark size={32} color="#1e40af" />}
            href="/dashboard/reports/reservations"
            color="#eff6ff"
          />

          <ReportCard 
            title="تحليل السيولة والكاش" 
            desc="رصد حركة السيولة في المحفظة، المتاح للصرف، والالتزامات القادمة للهيئة."
            icon={<Wallet size={32} color="#d97706" />}
            href="/dashboard/analytics"
            color="#fffbeb"
          />

          <ReportCard 
            title="سجل العمليات المالية" 
            desc="تقرير مفصل بجميع التحويلات، الإيداعات، وعمليات المناقلة بين الحسابات."
            icon={<History size={32} color="#7c3aed" />}
            href="/dashboard/finances"
            color="#f5f3ff"
          />

          <ReportCard 
            title="مؤشرات الأداء (KPIs)" 
            desc="رسوم بيانية توضح معدلات النمو، نسب التحصيل، والتقدم في مراحل المشاريع."
            icon={<PieChart size={32} color="#db2777" />}
            href="/dashboard/reports/kpi"
            color="#fdf2f8"
          />

          <ReportCard 
            title="تقرير النشاط والعمليات" 
            desc="تتبع سجل النشاط لجميع المستخدمين والمهام المكتملة في كل مرحلة."
            icon={<Activity size={32} color="#4b5563" />}
            href="/dashboard/reports/activity"
            color="#f9fafb"
          />

          <ReportCard 
            title="كشف حساب المستثمرين" 
            desc="تقرير تفصيلي شامل لحساب كل مستثمر على مستوى كل المشاريع أو مشروع محدد، مع عرض المدفوع والمتبقي بكل العملات."
            icon={<BookUser size={32} color="#064e3b" />}
            href="/dashboard/reports/investor-detail"
            color="#ecfdf5"
          />

        </div>
      </main>
    </div>
  );
}

function ReportCard({ title, desc, icon, href, color, isComingSoon = false }: any) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', pointerEvents: isComingSoon ? 'none' : 'auto' }}>
      <Card style={{ 
        padding: '2rem', height: '100%', borderRadius: '24px', transition: 'all 0.3s',
        display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer',
        border: '1px solid transparent', position: 'relative'
      }} className="report-card-hover">
        {isComingSoon && (
          <span style={{ 
            position: 'absolute', top: '1rem', left: '1rem', background: '#f1f5f9', 
            color: '#64748b', padding: '0.2rem 0.75rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 700 
          }}>قريباً ⏳</span>
        )}
        <div style={{ 
          width: '70px', height: '70px', borderRadius: '20px', background: color, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem'
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>{title}</h3>
          <p style={{ opacity: 0.6, fontSize: '0.95rem', lineHeight: 1.6 }}>{desc}</p>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#064e3b', fontWeight: 700 }}>
           {isComingSoon ? 'قيد التطوير' : 'عرض التقرير الآن'} <ArrowRight size={18} />
        </div>
      </Card>

      <style jsx global>{`
        .report-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: #064e3b33 !important;
        }
      `}</style>
    </Link>
  );
}
