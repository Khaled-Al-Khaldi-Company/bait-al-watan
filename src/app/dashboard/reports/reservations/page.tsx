'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Printer, ChevronLeft, Loader2, FileText, Landmark, DollarSign, Wallet, TrendingDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ReservationsReport() {
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const sarRate = 3.75;

  useEffect(() => {
    fetch('/api/reports/reservations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setData(data);
        } else {
          console.error('API Error:', data?.error || 'Unknown error');
          setData([]);
        }
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ padding: '2rem', direction: 'rtl' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; direction: rtl !important; }
          .print-container { padding: 10px !important; margin: 0 !important; width: 100% !important; }
          table { width: 100% !important; font-size: 9px !important; border-collapse: collapse !important; }
          th, td { padding: 4px !important; border: 1px solid #000 !important; text-align: right !important; }
          .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
          h1 { font-size: 16px !important; margin-bottom: 5px !important; }
          .badge-print { border: 1px solid #000 !important; padding: 2px 4px !important; }
        }
      `}</style>

      <header className="no-print" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div onClick={() => router.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.75rem' }}>
             العودة للصفحة السابقة <ChevronLeft size={14} />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>تقرير المساهمات والمدفوعات الشامل 🏢</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <Button onClick={handlePrint} style={{ background: '#1e40af', borderRadius: '16px', height: '3.5rem', padding: '0 2rem' }}>
             <Printer size={20} /> طباعة التقرير
           </Button>
           <Link href="/dashboard/reports/members">
              <Button variant="secondary" style={{ borderRadius: '16px', height: '3.5rem' }}>تقرير أرصدة الأعضاء</Button>
           </Link>
           <Button onClick={() => signOut()} variant="secondary" style={{ height: '3.5rem', borderRadius: '14px', background: '#fee2e2', color: '#dc2626', border: 'none' }}>
             <LogOut size={18} /> خروج
           </Button>
        </div>
      </header>

      <div className="print-container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', display: 'none' }} className="visible-print-only">
            <h1 style={{ fontSize: '22px', fontWeight: 900 }}>كشف حساب توزيع حصص الأرض والمصروفات والمتبقي</h1>
            <p style={{ opacity: 0.8, fontSize: '14px' }}>تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</p>
        </div>

        <Card className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '24px', background: 'white' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '0.8rem' }}>
                <th style={{ padding: '1rem' }}>الشريك / المشروع</th>
                <th style={{ padding: '1rem', textAlign: 'center', background: '#fef2f2' }}>حصة الأرض ($)</th>
                <th style={{ padding: '1rem', textAlign: 'center', background: '#eff6ff' }}>المصاريف ($)</th>
                <th style={{ padding: '1rem', textAlign: 'center', background: '#f0fdf4', color: '#166534' }}>إجمالي المسدد ($)</th>
                <th style={{ padding: '1rem', textAlign: 'center', background: '#f0fdf4', color: '#166534' }}>المسدد (SAR)</th>
                <th style={{ padding: '1rem', textAlign: 'center', background: '#f0fdf4', color: '#166534' }}>المسدد (EGP)</th>
                <th style={{ padding: '1rem', textAlign: 'center', background: '#fffbeb', color: '#92400e' }}>المتبقي ($)</th>
                <th style={{ padding: '1rem', textAlign: 'center', background: '#fffbeb', color: '#92400e' }}>المتبقي (SAR)</th>
                <th style={{ padding: '1rem', textAlign: 'center', background: '#fffbeb', color: '#92400e' }}>المتبقي (EGP)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa', fontSize: '0.85rem' }}>
                    <td style={{ padding: '1rem' }}>
                       <div style={{ fontWeight: 900, color: '#0f172a' }}>{row.userName}</div>
                       <Link href={`/dashboard/projects/${row.projectId}`} style={{ textDecoration: 'none' }}>
                         <div style={{ fontSize: '0.75rem', color: '#1e40af', cursor: 'pointer' }}>
                           {row.projectName} <span className="badge-print" style={{ color: '#059669', fontWeight: 800 }}>({row.percentage.toFixed(1)}%)</span>
                         </div>
                       </Link>
                    </td>
                  
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#991b1b' }}>${row.landShare.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#1e40af' }}>${row.expenseShare.toLocaleString()}</td>
                  
                  {/* Paid Columns */}
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 900, color: '#059669', background: '#f0fdf4' }}>${row.paidUSD.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', background: '#f0fdf4' }}>{(row.paidUSD * sarRate).toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', background: '#f0fdf4' }}>{(row.paidEGP).toLocaleString()}</td>
                  
                  {/* Remaining Columns */}
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 900, color: '#b45309', background: '#fffbeb' }}>${row.remainingUSD.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', background: '#fffbeb' }}>{(row.remainingUSD * sarRate).toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', background: '#fffbeb' }}>{(row.remainingUSD * 50).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: '#0f172a', color: 'white' }}>
               <tr style={{ fontWeight: 900, fontSize: '0.8rem' }}>
                  <td style={{ padding: '1rem' }}>الإجمالي العام</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>${data.reduce((s, r) => s + r.landShare, 0).toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>${data.reduce((s, r) => s + r.expenseShare, 0).toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', background: '#064e3b' }}>${data.reduce((s, r) => s + r.paidUSD, 0).toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', background: '#064e3b' }}>{(data.reduce((s, r) => s + r.paidUSD, 0) * sarRate).toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', background: '#064e3b' }}>{(data.reduce((s, r) => s + r.paidEGP, 0)).toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', background: '#92400e' }}>${data.reduce((s, r) => s + r.remainingUSD, 0).toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', background: '#92400e' }}>{(data.reduce((s, r) => s + r.remainingUSD, 0) * sarRate).toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', background: '#92400e' }}>{(data.reduce((s, r) => s + r.remainingUSD, 0) * 50).toLocaleString()}</td>
               </tr>
            </tfoot>
          </table>
        </Card>

        <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }} className="no-print">
            <SummaryCard title="إجمالي المسدد ($)" value={`$${data.reduce((s, r) => s + r.paidUSD, 0).toLocaleString()}`} icon={<Wallet color="#059669" />} color="#059669" />
            <SummaryCard title="إجمالي المتبقي ($)" value={`$${data.reduce((s, r) => s + r.remainingUSD, 0).toLocaleString()}`} icon={<TrendingDown color="#b45309" />} color="#b45309" />
            <SummaryCard title="إجمالي حصص الأرض" value={`$${data.reduce((s, r) => s + r.landShare, 0).toLocaleString()}`} icon={<Landmark color="#991b1b" />} color="#991b1b" />
            <SummaryCard title="إجمالي المصروفات" value={`$${data.reduce((s, r) => s + r.expenseShare, 0).toLocaleString()}`} icon={<DollarSign color="#1e40af" />} color="#1e40af" />
        </div>
      </div>

      <style jsx>{`
        .visible-print-only { display: none; }
        @media print {
          .visible-print-only { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }: any) {
  return (
    <Card style={{ padding: '1.5rem', borderRadius: '24px', background: 'white', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
       <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {React.cloneElement(icon, { size: 24 })}
       </div>
       <div>
          <div style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{value}</div>
       </div>
    </Card>
  );
}
