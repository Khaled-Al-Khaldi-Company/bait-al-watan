'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {
  ChevronLeft, Loader2, Printer, User, TrendingUp, TrendingDown,
  Wallet, Landmark, BarChart3, ChevronDown, ChevronUp, Filter
} from 'lucide-react';

const fmt = (n: number) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InvestorDetailReport() {
  const [data, setData] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState('');
  const [expandedInvestors, setExpandedInvestors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects);
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedProject ? `/api/reports/investor-detail?projectId=${selectedProject}` : '/api/reports/investor-detail';
    fetch(url).then(r => r.json()).then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); });
  }, [selectedProject]);

  const toggle = (id: string) => {
    setExpandedInvestors(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const filtered = selectedInvestor ? data.filter(d => d.userId === selectedInvestor) : data;
  const grandTotal = { paid: filtered.reduce((s, d) => s + d.totalPaidUSD, 0), remaining: filtered.reduce((s, d) => s + d.totalRemainingUSD, 0), required: filtered.reduce((s, d) => s + d.totalRequiredUSD, 0) };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', direction: 'rtl' }}>
      <Sidebar />
      <main className="main-content-layout" style={{ flex: 1, padding: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }} className="no-print">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
              <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>لوحة التحكم</Link>
              <ChevronLeft size={14} />
              <Link href="/dashboard/reports" style={{ color: 'inherit', textDecoration: 'none' }}>التقارير</Link>
              <ChevronLeft size={14} />
              <span style={{ color: '#064e3b', fontWeight: 700 }}>كشف حساب المستثمرين</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>كشف حساب المستثمرين التفصيلي 📋</h1>
            <p style={{ color: '#64748b', marginTop: '0.3rem' }}>عرض تفصيلي لحساب كل مستثمر عبر جميع المشاريع مع إمكانية الفلترة</p>
          </div>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#064e3b', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
            <Printer size={18} /> طباعة التقرير
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', borderRadius: '14px', padding: '0.5rem 1rem', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px' }}>
            <Filter size={16} color="#64748b" />
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={{ border: 'none', outline: 'none', background: 'none', fontSize: '0.95rem', fontWeight: 600, width: '100%', cursor: 'pointer' }}>
              <option value="">جميع المشاريع</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', borderRadius: '14px', padding: '0.5rem 1rem', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px' }}>
            <User size={16} color="#64748b" />
            <select value={selectedInvestor} onChange={e => setSelectedInvestor(e.target.value)} style={{ border: 'none', outline: 'none', background: 'none', fontSize: '0.95rem', fontWeight: 600, width: '100%', cursor: 'pointer' }}>
              <option value="">جميع المستثمرين</option>
              {data.map(d => <option key={d.userId} value={d.userId}>{d.userName}</option>)}
            </select>
          </div>
        </div>

        {/* Grand Total Banner */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'إجمالي المطلوب', value: `$${fmt(grandTotal.required)}`, sar: fmt(grandTotal.required * 3.75), color: '#0369a1', bg: '#eff6ff', icon: <Landmark size={22} color="#0369a1" /> },
              { label: 'إجمالي المسدد', value: `$${fmt(grandTotal.paid)}`, sar: fmt(grandTotal.paid * 3.75), color: '#059669', bg: '#ecfdf5', icon: <TrendingUp size={22} color="#059669" /> },
              { label: 'إجمالي المتبقي', value: `$${fmt(grandTotal.remaining)}`, sar: fmt(grandTotal.remaining * 3.75), color: '#dc2626', bg: '#fef2f2', icon: <TrendingDown size={22} color="#dc2626" /> },
              { label: 'عدد المستثمرين', value: filtered.length, sar: `${filtered.reduce((s, d) => s + d.projectCount, 0)} مشاركة`, color: '#7c3aed', bg: '#f5f3ff', icon: <User size={22} color="#7c3aed" /> },
            ].map((s, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', borderRight: `4px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.4rem' }}>{s.label}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{s.value}</div>
                    <div style={{ fontSize: '0.78rem', color: s.color, fontWeight: 700, marginTop: '0.2rem' }}>{s.sar} {typeof s.sar === 'string' && s.sar.includes('مشاركة') ? '' : 'SAR'}</div>
                  </div>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 size={48} className="animate-spin" color="#064e3b" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>لا توجد بيانات</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filtered.map(investor => {
              const isExpanded = expandedInvestors.has(investor.userId);
              const pct = investor.totalRequiredUSD > 0 ? (investor.totalPaidUSD / investor.totalRequiredUSD) * 100 : 0;
              return (
                <div key={investor.userId} style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                  {/* Investor Header */}
                  <div
                    onClick={() => toggle(investor.userId)}
                    style={{ padding: '1.8rem 2rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #064e3b, #065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={26} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>{investor.userName}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{investor.userEmail} · {investor.projectCount} مشاريع</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>إجمالي المطلوب</div>
                        <div style={{ fontWeight: 900, color: '#0f172a' }}>${fmt(investor.totalRequiredUSD)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>إجمالي المسدد</div>
                        <div style={{ fontWeight: 900, color: '#059669' }}>${fmt(investor.totalPaidUSD)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>المتبقي</div>
                        <div style={{ fontWeight: 900, color: investor.totalRemainingUSD > 0 ? '#dc2626' : '#059669' }}>${fmt(investor.totalRemainingUSD)}</div>
                      </div>
                      {/* Progress */}
                      <div style={{ width: '120px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                          <span style={{ color: '#64748b' }}>الإنجاز</span>
                          <span style={{ color: '#059669' }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 100 ? '#059669' : pct >= 60 ? '#f59e0b' : '#064e3b', borderRadius: '4px', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                      <div style={{ color: '#64748b' }}>{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
                    </div>
                  </div>

                  {/* Expanded: Per-Project Breakdown */}
                  {isExpanded && (
                    <div style={{ padding: '1.5rem 2rem' }}>
                      {/* Summary row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                          { label: 'إجمالي المدفوع ($)', value: fmt(investor.totalPaidUSD), color: '#059669' },
                          { label: 'إجمالي المدفوع (SAR)', value: fmt(investor.totalPaidSAR), color: '#0369a1' },
                          { label: 'إجمالي المدفوع (EGP)', value: fmt(investor.totalPaidEGP), color: '#7c3aed' },
                          { label: 'رصيده بالصندوق ($)', value: fmt(investor.totalFundBalance), color: investor.totalFundBalance >= 0 ? '#059669' : '#dc2626' },
                        ].map((s, i) => (
                          <div key={i} style={{ background: '#f8fafc', borderRadius: '14px', padding: '1rem 1.2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{s.label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Per-project table */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {['المشروع', 'الحصة %', 'المطلوب ($)', 'المسدد ($)', 'المسدد (SAR)', 'المسدد (EGP)', 'المتبقي ($)', 'التقدم', 'رصيد الصندوق'].map(h => (
                              <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {investor.projects.map((proj: any, idx: number) => (
                            <tr key={proj.projectId} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                              <td style={{ padding: '1rem', fontWeight: 700 }}>
                                <Link href={`/dashboard/projects/${proj.projectId}`} style={{ color: '#064e3b', textDecoration: 'none' }}>
                                  {proj.projectName}
                                </Link>
                                {proj.isWallet && <span style={{ marginRight: '0.5rem', fontSize: '0.7rem', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>محفظة</span>}
                              </td>
                              <td style={{ padding: '1rem', fontWeight: 700, color: '#7c3aed' }}>{proj.sharePercent}%</td>
                              <td style={{ padding: '1rem', fontWeight: 700 }}>${fmt(proj.shareAmount)}</td>
                              <td style={{ padding: '1rem', fontWeight: 800, color: '#059669' }}>${fmt(proj.totalPaidUSD)}</td>
                              <td style={{ padding: '1rem', fontWeight: 700, color: '#0369a1' }}>{fmt(proj.totalPaidSAR)}</td>
                              <td style={{ padding: '1rem', fontWeight: 700, color: '#7c3aed' }}>{fmt(proj.totalPaidEGP)}</td>
                              <td style={{ padding: '1rem', fontWeight: 800, color: proj.remainingUSD > 0 ? '#dc2626' : '#059669' }}>${fmt(proj.remainingUSD)}</td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                                    <div style={{ width: `${Math.min(proj.progressPercent, 100)}%`, height: '100%', background: proj.progressPercent >= 100 ? '#059669' : '#064e3b', borderRadius: '3px' }} />
                                  </div>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>{proj.progressPercent}%</span>
                                </div>
                              </td>
                              <td style={{ padding: '1rem', fontWeight: 800, color: proj.fundBalance >= 0 ? '#059669' : '#dc2626' }}>${fmt(proj.fundBalance)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: 'linear-gradient(135deg, #064e3b08, #065f4608)', fontWeight: 900 }}>
                            <td colSpan={2} style={{ padding: '1rem', fontWeight: 900, color: '#064e3b' }}>الإجمالي</td>
                            <td style={{ padding: '1rem', color: '#0369a1' }}>${fmt(investor.totalRequiredUSD)}</td>
                            <td style={{ padding: '1rem', color: '#059669' }}>${fmt(investor.totalPaidUSD)}</td>
                            <td style={{ padding: '1rem', color: '#0369a1' }}>{fmt(investor.totalPaidSAR)}</td>
                            <td style={{ padding: '1rem', color: '#7c3aed' }}>{fmt(investor.totalPaidEGP)}</td>
                            <td style={{ padding: '1rem', color: investor.totalRemainingUSD > 0 ? '#dc2626' : '#059669' }}>${fmt(investor.totalRemainingUSD)}</td>
                            <td style={{ padding: '1rem' }}></td>
                            <td style={{ padding: '1rem', color: investor.totalFundBalance >= 0 ? '#059669' : '#dc2626' }}>${fmt(investor.totalFundBalance)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; direction: rtl !important; }
            .main-content-layout { margin: 0 !important; padding: 1rem !important; }
            aside { display: none !important; }
          }
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </main>
    </div>
  );
}
