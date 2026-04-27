'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  TrendingUp, TrendingDown, DollarSign, Landmark, 
  Users, Activity, ChevronLeft, Loader2, PieChart, 
  BarChart3, Wallet, ArrowUpRight, ArrowDownLeft, LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';

export default function AnalyticsDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'USD' | 'SAR' | 'EGP'>('USD');

  const rates = { USD: 1, SAR: 3.75, EGP: 50 };

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const format = (val: number) => {
    const converted = val * rates[currency];
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(converted);
  };

  if (loading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={50} color="#064e3b" /></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', direction: 'rtl' }}>
      <Sidebar />
      <main className="main-content-layout" style={{ flex: 1, padding: '2.5rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>مركز تحليل السيولة الموحد 📊</h1>
            <p style={{ opacity: 0.6 }}>رؤية شاملة لكافة التدفقات النقدية والالتزامات عبر جميع المشاريع.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.8rem', background: '#f1f5f9', padding: '0.5rem', borderRadius: '18px' }}>
                <CurrencyTab active={currency === 'USD'} onClick={() => setCurrency('USD')} label="USD $" />
                <CurrencyTab active={currency === 'SAR'} onClick={() => setCurrency('SAR')} label="SAR ر.س" />
                <CurrencyTab active={currency === 'EGP'} onClick={() => setCurrency('EGP')} label="EGP ج.م" />
            </div>
          </div>
        </header>

      {/* Primary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
         <BigStat title="إجمالي السيولة الحالية" value={format(data.totals.liquidity)} icon={<Wallet size={32} />} color="#059669" subtitle="متوفرة في الصناديق" />
         <BigStat title="إجمالي مساهمات الشركاء" value={format(data.totals.contributions)} icon={<Users size={32} />} color="#064e3b" subtitle="رأس المال المستثمر" />
         <BigStat title="سداد الهيئة (الرسمي)" value={format(data.totals.paidToAuthority)} icon={<Landmark size={32} />} color="#1e40af" subtitle="إجمالي ما تم تحويله" />
         <BigStat title="الالتزامات القادمة" value={format(data.totals.dueToAuthority)} icon={<TrendingDown size={32} />} color="#e11d48" subtitle="أقساط مجدولة لم تدفع" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
         {/* Detailed Project Table */}
         <Card style={{ padding: '2rem', borderRadius: '32px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '2rem' }}>توزيع السيولة حسب المشروع</h3>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem' }}>
               <thead>
                  <tr style={{ textAlign: 'right', opacity: 0.4, fontSize: '0.85rem' }}>
                     <th style={{ padding: '0 1rem' }}>اسم المشروع</th>
                     <th style={{ padding: '0 1rem' }}>السيولة ($)</th>
                     <th style={{ padding: '0 1rem' }}>المدفوع للهيئة ($)</th>
                     <th style={{ padding: '0 1rem' }}>الالتزامات ($)</th>
                  </tr>
               </thead>
               <tbody>
                  {data.projects.map((p: any) => (
                    <tr key={p.id} style={{ background: '#f8fafc', borderRadius: '16px' }}>
                       <td style={{ padding: '1.2rem', fontWeight: 900, borderRadius: '16px 0 0 16px' }}>{p.name}</td>
                       <td style={{ padding: '1.2rem', color: '#059669', fontWeight: 800 }}>${p.liquidity.toLocaleString()}</td>
                       <td style={{ padding: '1.2rem', color: '#1e40af', fontWeight: 800 }}>${p.paidToAuth.toLocaleString()}</td>
                       <td style={{ padding: '1.2rem', color: '#e11d48', fontWeight: 800, borderRadius: '0 16px 16px 0' }}>${p.dueToAuth.toLocaleString()}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </Card>

         {/* Quick Analytics Cards */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card style={{ padding: '2rem', borderRadius: '32px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
               <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', opacity: 0.8 }}>معدل استرداد رأس المال</h4>
               <div style={{ fontSize: '3rem', fontWeight: 900 }}>
                  {Math.round((data.totals.paidToAuthority / data.totals.contributions) * 100)}%
               </div>
               <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '1rem' }}>نسبة ما تم دفعه رسمياً للهيئة من إجمالي مساهمات الشركاء.</p>
            </Card>

            <Card style={{ padding: '2rem', borderRadius: '32px' }}>
               <h4 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>كفاءة المصروفات</h4>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#6366f1' }}>{format(data.totals.expenses)}</div>
                  <div style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '10px' }}>مصاريف إدارية</div>
               </div>
               <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', marginTop: '1.5rem', overflow: 'hidden' }}>
                  <div style={{ width: `${(data.totals.expenses / data.totals.contributions) * 100}%`, height: '100%', background: '#6366f1' }} />
               </div>
            </Card>
         </div>
      </div>
      </main>
    </div>
  );
}

function BigStat({ title, value, icon, color, subtitle }: any) {
  return (
    <Card style={{ padding: '2rem', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
       <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: `${color}12`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
       </div>
       <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.5, marginBottom: '0.2rem' }}>{title}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{value}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: color, marginTop: '0.2rem' }}>{subtitle}</div>
       </div>
       <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.03, color: color }}>
          {React.cloneElement(icon, { size: 120 })}
       </div>
    </Card>
  );
}

function CurrencyTab({ active, onClick, label }: any) {
  return (
    <button onClick={onClick} style={{ 
      padding: '0.6rem 1.5rem', borderRadius: '14px', border: 'none', cursor: 'pointer',
      background: active ? 'white' : 'transparent',
      color: active ? '#0f172a' : '#64748b',
      fontWeight: 800,
      boxShadow: active ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
      transition: 'all 0.3s'
    }}>
      {label}
    </button>
  );
}
