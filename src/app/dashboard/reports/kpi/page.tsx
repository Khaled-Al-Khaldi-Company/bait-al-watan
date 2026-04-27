'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Activity, ChevronLeft, Loader2, DollarSign, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COLORS = ['#064e3b', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function KPIReport() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/kpi')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={48} color="#064e3b" /></div>;

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f8fafc', direction: 'rtl' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div onClick={() => router.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            العودة للصفحة السابقة <ChevronLeft size={14} />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#064e3b' }}>تحليل مؤشرات الأداء (KPIs) 📈</h1>
        <p style={{ opacity: 0.6 }}>نظرة شاملة على النمو، التحصيل، وتوزيع المشاريع.</p>
      </header>

      {/* Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <Card style={{ padding: '1.5rem', borderRadius: '24px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Target size={24} />
              </div>
              <h4 style={{ margin: 0, opacity: 0.6 }}>نسبة التحصيل</h4>
           </div>
           <div style={{ fontSize: '2rem', fontWeight: 900, color: '#064e3b' }}>{data.collection.rate.toFixed(1)}%</div>
           <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', marginTop: '1rem', overflow: 'hidden' }}>
              <div style={{ width: `${data.collection.rate}%`, height: '100%', background: '#059669' }}></div>
           </div>
           <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.5 }}>تم تحصيل ${(data.collection.totalPaid).toLocaleString()} من إجمالي المطلوب.</p>
        </Card>

        <Card style={{ padding: '1.5rem', borderRadius: '24px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <TrendingUp size={24} />
              </div>
              <h4 style={{ margin: 0, opacity: 0.6 }}>حجم الإيداعات (آخر 6 أشهر)</h4>
           </div>
           <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e3a8a' }}>${data.monthlyInflow.reduce((s: any, i: any) => s + i.amount, 0).toLocaleString()}</div>
           <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.5 }}>إجمالي السيولة الجديدة التي دخلت المحفظة مؤخراً.</p>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        {/* Charts */}
        <Card style={{ padding: '2rem', borderRadius: '24px' }}>
           <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem' }}>نمو التدفق المالي الشهري</h3>
           <div style={{ width: '100%', height: '300px' }}>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.monthlyInflow}>
                 <defs>
                   <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#064e3b" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#064e3b" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" />
                 <YAxis />
                 <Tooltip />
                 <Area type="monotone" dataKey="amount" stroke="#064e3b" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </Card>

        <Card style={{ padding: '2rem', borderRadius: '24px' }}>
           <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem' }}>توزيع المشاريع حسب الحالة</h3>
           <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center' }}>
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data.statusDistribution}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {data.statusDistribution.map((entry: any, index: number) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.statusDistribution.map((entry: any, index: number) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: COLORS[index % COLORS.length] }}></div>
                    <span style={{ opacity: 0.7 }}>{entry.name}: {entry.value}</span>
                  </div>
                ))}
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
