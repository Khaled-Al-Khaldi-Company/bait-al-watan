'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Printer, ChevronLeft, Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar';

export default function MembersReport() {
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  const sarRate = 3.75;
  const egpRate = 50.0;

  useEffect(() => {
    fetchProjects();
    fetchData();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    if (Array.isArray(data)) setProjects(data);
  };

  const fetchData = async (pid?: string) => {
    setLoading(true);
    const url = pid ? `/api/reports/members?projectId=${pid}` : '/api/reports/members';
    const res = await fetch(url);
    const data = await res.json();
    if (Array.isArray(data)) {
      setData(data);
    } else {
      setData([]);
    }
    setLoading(false);
  };

  const handleProjectChange = (id: string) => {
    setSelectedProjectId(id);
    fetchData(id);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && projects.length === 0) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}><Loader2 className="animate-spin" size={48} color="#064e3b" /></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl' }}>
      <Sidebar />
      <main className="main-content-layout" style={{ padding: '2.5rem' }}>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; margin: 0 !important; direction: rtl !important; }
            .print-container { padding: 10px !important; margin: 0 !important; width: 100% !important; }
            table { width: 100% !important; font-size: 11px !important; border-collapse: collapse !important; }
            th, td { padding: 8px !important; border: 1px solid #000 !important; text-align: right !important; }
            .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
            h1 { font-size: 20px !important; margin-bottom: 10px !important; }
          }
        `}</style>

        <header className="no-print" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div onClick={() => router.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.75rem' }}>
               العودة للصفحة السابقة <ChevronLeft size={14} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>تقرير الموقف المالي العام 📊</h1>
            {selectedProjectId && (
              <p style={{ fontWeight: 800, color: '#064e3b', fontSize: '1.2rem', marginTop: '0.5rem' }}>
                مشروع: {projects.find(p => p.id === selectedProjectId)?.name}
              </p>
            )}
            <div className="no-print" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <span style={{ fontWeight: 700, fontSize: '0.9rem', opacity: 0.7 }}>تصفية حسب المشروع:</span>
               <select 
                 value={selectedProjectId} 
                 onChange={(e) => handleProjectChange(e.target.value)}
                 style={{ padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, outline: 'none' }}
               >
                  <option value="">جميع المشاريع والشركاء</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
               </select>
            </div>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: '1rem' }}>
            <Button onClick={handlePrint} style={{ background: '#064e3b', borderRadius: '16px', height: '3.5rem', padding: '0 2rem' }}>
              <Printer size={20} /> طباعة التقرير
            </Button>
          </div>
        </header>

        <div className="print-container">
          <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'none' }} className="visible-print-only">
              <h1 style={{ fontSize: '26px', fontWeight: 900 }}>بيان الموقف المالي العام للشركاء - بيت الوطن</h1>
              <p style={{ opacity: 0.7 }}>تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          <Card className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1.2rem' }}>اسم العضو المساهم</th>
                  <th style={{ padding: '1.2rem', textAlign: 'center' }}>إجمالي المطلوب ($)</th>
                  <th style={{ padding: '1.2rem', textAlign: 'center' }}>إجمالي المدفوع ($)</th>
                  <th style={{ padding: '1.2rem', textAlign: 'center', background: '#ecfdf5' }}>المدفوع (SAR)</th>
                  <th style={{ padding: '1.2rem', textAlign: 'center', background: '#f0f9ff' }}>المدفوع (EGP)</th>
                  <th style={{ padding: '1.2rem', textAlign: 'center', color: '#e11d48' }}>المتبقي ($)</th>
                  <th style={{ padding: '1.2rem', textAlign: 'center', color: '#059669' }}>المتبقي (SAR)</th>
                  <th style={{ padding: '1.2rem', textAlign: 'center', color: '#0284c7' }}>المتبقي (EGP)</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? data.map((m, idx) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fcfcfc' }}>
                    <td style={{ padding: '1.2rem', fontWeight: 800 }}>{m.name}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>${m.totalRequired.toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 900, color: '#059669' }}>${m.totalPaid.toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', background: '#ecfdf5' }}>{(m.totalPaid * sarRate).toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', background: '#f0f9ff' }}>{(m.totalPaidEGP).toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 900, color: '#e11d48' }}>${m.totalRemaining.toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', color: '#059669', fontWeight: 700 }}>{(m.totalRemaining * sarRate).toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', color: '#0284c7', fontWeight: 700 }}>{(m.totalRemainingEGP).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                      {loading ? 'جاري تحميل البيانات...' : 'لا توجد بيانات متاحة حالياً لهذا المشروع'}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot style={{ background: '#0f172a', color: 'white' }}>
                 <tr>
                    <td style={{ padding: '1.2rem', fontWeight: 900 }}>الإجمالي العام</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 900 }}>${data.reduce((s, m) => s + m.totalRequired, 0).toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 900 }}>${data.reduce((s, m) => s + m.totalPaid, 0).toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 900 }}>{(data.reduce((s, m) => s + m.totalPaid, 0) * sarRate).toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 900 }}>{(data.reduce((s, m) => s + m.totalPaidEGP, 0)).toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 900 }}>${data.reduce((s, m) => s + m.totalRemaining, 0).toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 900 }}>{(data.reduce((s, m) => s + m.totalRemaining, 0) * sarRate).toLocaleString()}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 900 }}>{(data.reduce((s, m) => s + m.totalRemainingEGP, 0)).toLocaleString()}</td>
                 </tr>
              </tfoot>
            </table>
          </Card>
          
          <div style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.5, textAlign: 'center' }} className="no-print">
              * ملاحظة: تم احتساب الريال بسعر {sarRate} والجنيه بسعر {egpRate}.
          </div>
        </div>

        <style jsx>{`
          .visible-print-only { display: none; }
          @media print {
            .visible-print-only { display: block !important; }
          }
        `}</style>
      </main>
    </div>
  );
}
