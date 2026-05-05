'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { motion } from 'framer-motion';
import { 
  Download, Search, Filter, Calendar, Loader2, 
  ArrowLeft, Landmark, FileText, History, Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function BankTransfersReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/finances');
      if (res.ok) {
        const data = await res.json();
        // Filter only transactions that have bank details or are related to authority payments
        setTransactions(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = 
      (t.bankName?.toLowerCase().includes(search.toLowerCase())) ||
      (t.accountHolder?.toLowerCase().includes(search.toLowerCase())) ||
      (t.uetr?.toLowerCase().includes(search.toLowerCase())) ||
      (t.user?.name.toLowerCase().includes(search.toLowerCase())) ||
      (t.project?.name.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (dateFilter.start && new Date(t.date) < new Date(dateFilter.start)) return false;
    if (dateFilter.end && new Date(t.date) > new Date(dateFilter.end)) return false;

    return true;
  });

  const exportToExcel = () => {
    // Simple CSV export for now
    const headers = ["المسلسل", "التاريخ", "المشروع", "اسم الحاجز", "اسم صاحب الحساب", "البنك", "المبلغ", "UETR", "IBAN", "كود التحويل"];
    const rows = filtered.map((t, i) => [
      i + 1,
      new Date(t.date).toLocaleDateString('ar-EG'),
      t.project?.name,
      t.user?.name,
      t.accountHolder || '-',
      t.bankName || '-',
      t.amount,
      t.uetr || '-',
      t.iban || '-',
      t.transferCode || '-'
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_الحوالات_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem 3rem', paddingRight: 'calc(var(--sidebar-width) + 2rem)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.back()} style={backBtn}><ArrowLeft size={20} /></button>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>تقرير الحوالات البنكية 🏛️</h1>
              <p style={{ opacity: 0.6, fontWeight: 600 }}>عرض وتصدير كافة التحويلات البنكية الرسمية والموثقة.</p>
            </div>
          </div>
          <Button onClick={exportToExcel} style={{ borderRadius: '14px', gap: '0.6rem', height: '3.5rem', background: '#064e3b', color: 'white' }}>
            <Download size={20} /> تصدير التقرير (Excel)
          </Button>
        </div>

        {/* Filters */}
        <Card style={{ padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '250px' }}>
            <label style={filterLabel}>البحث في البيانات</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input 
                type="text" 
                placeholder="ابحث بالبنك، اسم الشريك، أو كود UETR..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={filterInput}
              />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={filterLabel}>من تاريخ</label>
            <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))} style={filterInput} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={filterLabel}>إلى تاريخ</label>
            <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))} style={filterInput} />
          </div>
        </Card>

        {/* Report Table */}
        <Card style={{ borderRadius: '28px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={thStyle}>التاريخ</th>
                  <th style={thStyle}>المشروع / الحاجز</th>
                  <th style={thStyle}>اسم صاحب الحساب</th>
                  <th style={thStyle}>البنك</th>
                  <th style={thStyle}>المبلغ</th>
                  <th style={thStyle}>UETR / IBAN</th>
                  <th style={thStyle}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: '5rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '5rem', textAlign: 'center', opacity: 0.5 }}>لا توجد بيانات تطابق البحث.</td></tr>
                ) : filtered.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 800 }}>{t.project?.name}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{t.user?.name}</div>
                    </td>
                    <td style={tdStyle}>{t.accountHolder || t.user?.name}</td>
                    <td style={tdStyle}>
                      <Badge style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 800 }}>
                        {t.bankName || 'غير محدد'}
                      </Badge>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 900, color: t.amount < 0 ? '#ef4444' : '#10b981' }}>
                      ${Math.abs(t.amount).toLocaleString()}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '0.85rem' }}>{t.uetr || '-'}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{t.iban || '-'}</div>
                    </td>
                    <td style={tdStyle}>
                       {t.officialAmount > 0 ? (
                         <Badge style={{ background: '#f0fdf4', color: '#10b981' }}>موثق بالهيئة</Badge>
                       ) : (
                         <Badge style={{ background: '#fffbeb', color: '#d97706' }}>تحت المراجعة</Badge>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}

const thStyle = { padding: '1.2rem 1.5rem', fontWeight: 800, color: '#64748b', fontSize: '0.9rem' };
const tdStyle = { padding: '1.2rem 1.5rem', verticalAlign: 'middle' };
const backBtn = { width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const filterLabel = { display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: '#64748b' };
const filterInput = { width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontWeight: 600 };
