'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {
  User as UserIcon, Wallet, Activity, ChevronLeft, Loader2,
  FileText, Edit, X, TrendingUp, TrendingDown, Landmark,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';

const fmt = (n: number) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d: any) => new Date(d).toLocaleDateString('ar-EG');

const TYPE_LABELS: any = {
  MEMBER_CONTRIBUTION: 'إيداع مساهمة',
  OTHER_EXPENSE: 'مصروفات',
  RESERVATION_FEE_PAYMENT: 'رسوم حجز',
  INSTALLMENT_PAYMENT: 'قسط هيئة',
  ACTIVATION_TRANSFER: 'تحويل تفعيل',
  LIQUIDITY_TRANSFER: 'تحويل سيولة',
};

const inputStyle = {
  padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0',
  background: 'white', fontSize: '1rem', outline: 'none', width: '100%', fontFamily: 'inherit'
};

export default function MemberPortfolio({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [expandedTxn, setExpandedTxn] = useState(false);

  useEffect(() => {
    fetch(`/api/members/${params.id}/portfolio`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/members', {
      method: 'PATCH',
      body: JSON.stringify({ id: params.id, name: fd.get('name'), email: fd.get('email'), role: fd.get('role'), password: fd.get('password') }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) { const u = await res.json(); setData({ ...data, user: u }); setShowEdit(false); }
    setUpdating(false);
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="#064e3b" /></div>;
  if (!data || data.error) return <div style={{ padding: '2rem' }}>العضو غير موجود</div>;

  const { user, stats, projects, transactions } = data;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', direction: 'rtl' }}>
      <Sidebar />
      <main className="main-content-layout" style={{ flex: 1, padding: '2rem' }}>

        {/* Breadcrumb + Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
            <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>لوحة التحكم</Link>
            <ChevronLeft size={14} />
            <Link href="/dashboard/members" style={{ color: 'inherit', textDecoration: 'none' }}>الأعضاء</Link>
            <ChevronLeft size={14} />
            <span style={{ color: '#064e3b', fontWeight: 700 }}>ملف المستثمر</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#064e3b,#065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(6,78,59,0.25)' }}>
                <UserIcon size={30} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{user.name}</h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>{user.email} · {user.role === 'ADMIN' ? 'مدير نظام' : 'شريك مساهم'}</p>
              </div>
            </div>
            <button onClick={() => setShowEdit(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.7rem 1.2rem', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>
              <Edit size={16} /> تعديل البيانات
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'إجمالي المطلوب', val: stats.totalRequired, color: '#0369a1', bg: '#eff6ff', icon: <Landmark size={20} color="#0369a1" /> },
            { label: 'إجمالي المسدد', val: stats.totalPaid, color: '#059669', bg: '#ecfdf5', icon: <TrendingUp size={20} color="#059669" /> },
            { label: 'إجمالي المتبقي', val: stats.totalRemaining, color: '#dc2626', bg: '#fef2f2', icon: <TrendingDown size={20} color="#dc2626" /> },
            { label: 'رصيد المدفوع (SAR)', val: stats.totalPaidSAR || stats.totalPaid * 3.75, color: '#7c3aed', bg: '#f5f3ff', icon: <Wallet size={20} color="#7c3aed" /> },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '18px', padding: '1.3rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRight: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.3rem' }}>{s.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>${fmt(s.val)}</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Projects List */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedProject ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left: Projects */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>
              المشاريع المشترك بها ({stats.projectCount})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {projects.map((p: any) => {
                const isSelected = selectedProject?.id === p.id;
                const pct = p.shareAmount > 0 ? Math.min(100, (p.paid / p.shareAmount) * 100) : 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProject(isSelected ? null : p)}
                    style={{
                      background: 'white', borderRadius: '18px', padding: '1.4rem 1.6rem',
                      boxShadow: isSelected ? '0 8px 30px rgba(6,78,59,0.15)' : '0 2px 10px rgba(0,0,0,0.04)',
                      border: isSelected ? '2px solid #064e3b' : '2px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                          <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', margin: 0 }}>{p.name}</h4>
                          {p.isWallet && <span style={{ background: '#eff6ff', color: '#1e40af', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>محفظة</span>}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>نسبة المساهمة: {p.percentage}% · {p.transactions?.length || 0} دفعة</span>
                      </div>
                      <div style={{ textAlign: 'left', flexShrink: 0 }}>
                        <div style={{ fontWeight: 900, color: p.remaining > 0 ? '#dc2626' : '#059669', fontSize: '1.05rem' }}>
                          ${fmt(p.remaining)} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>متبقي</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                          {fmt(p.remainingSAR)} SAR
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>
                        <span>المسدد: ${fmt(p.paid)}</span>
                        <span style={{ color: pct >= 100 ? '#059669' : '#064e3b', fontWeight: 800 }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#059669' : 'linear-gradient(90deg,#064e3b,#10b981)', borderRadius: '4px', transition: 'width 0.5s' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.8rem', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#064e3b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {isSelected ? <><ChevronUp size={16} /> إخفاء التفاصيل</> : <><ChevronDown size={16} /> عرض التفاصيل</>}
                      </span>
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <ExternalLink size={14} /> فتح المشروع
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detail Panel */}
          {selectedProject && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', position: 'sticky', top: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div>
                  <h3 style={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a', margin: 0 }}>{selectedProject.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>تفاصيل حساب المستثمر</p>
                </div>
                <button onClick={() => setSelectedProject(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Financial summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.2rem' }}>
                {[
                  { label: 'الحصة المقررة ($)', val: selectedProject.shareAmount, color: '#0369a1' },
                  { label: 'إجمالي المسدد ($)', val: selectedProject.paid, color: '#059669' },
                  { label: 'المسدد (SAR)', val: selectedProject.paidSAR, color: '#059669' },
                  { label: 'المسدد (EGP)', val: selectedProject.paidEGP, color: '#7c3aed' },
                  { label: 'المتبقي ($)', val: selectedProject.remaining, color: '#dc2626' },
                  { label: 'المتبقي (SAR)', val: selectedProject.remainingSAR, color: '#dc2626' },
                  { label: 'نصيبه (هيئة)', val: selectedProject.partnerLandShare, color: '#0369a1' },
                  { label: 'نصيبه (مصروفات)', val: selectedProject.partnerExpenseShare, color: '#7c3aed' },
                  { label: 'رصيده بالصندوق ($)', val: selectedProject.fundBalance, color: selectedProject.fundBalance >= 0 ? '#059669' : '#dc2626' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.7rem', background: i % 2 === 0 ? '#f8fafc' : 'white', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: row.color }}>{fmt(row.val)}</span>
                  </div>
                ))}
              </div>

              {/* Transactions */}
              <div>
                <button
                  onClick={() => setExpandedTxn(p => !p)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: 'none', borderRadius: '10px', padding: '0.7rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: expandedTxn ? '0.6rem' : 0 }}
                >
                  <span>سجل الدفعات ({selectedProject.transactions?.length || 0} دفعة)</span>
                  {expandedTxn ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {expandedTxn && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedProject.transactions?.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem', fontSize: '0.85rem' }}>لا توجد دفعات مسجلة</div>
                    )}
                    {selectedProject.transactions?.map((t: any) => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: '10px' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{TYPE_LABELS[t.type] || t.type}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{fmtDate(t.date)} · {t.purpose?.slice(0, 30)}</div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem' }}>${fmt(t.amount)}</div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{fmt(t.amountEGP)} EGP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div style={{ marginTop: '2rem', background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '1rem', color: '#0f172a' }}>سجل جميع المدفوعات</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['التاريخ', 'المشروع', 'البيان', 'المبلغ ($)', 'بالريال (SAR)', 'بالجنيه (EGP)'].map(h => (
                    <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any, i: number) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#064e3b' }}>{t.project?.name}</td>
                    <td style={{ padding: '0.8rem 1rem', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.purpose}</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 800, color: '#059669' }}>${fmt(t.amount)}</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#0369a1' }}>{fmt(t.amount * 3.75)}</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: '#7c3aed' }}>{fmt(t.amount * 50)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {showEdit && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '440px', position: 'relative' }}>
              <button onClick={() => setShowEdit(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
              <h2 style={{ fontWeight: 900, marginBottom: '1.5rem', textAlign: 'center' }}>تعديل بيانات العضو</h2>
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>الاسم الكامل</label><input name="name" defaultValue={user.name} required style={inputStyle} /></div>
                <div><label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>البريد الإلكتروني</label><input name="email" type="email" defaultValue={user.email} required style={inputStyle} /></div>
                <div><label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>كلمة مرور جديدة (اختياري)</label><input name="password" type="password" style={inputStyle} placeholder="اتركه فارغاً لعدم التغيير" /></div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>الدور / الصلاحية</label>
                  <select name="role" defaultValue={user.role} required style={inputStyle}>
                    <option value="MEMBER">شريك مساهم</option>
                    <option value="VIEWER">مراقب (قراءة فقط)</option>
                    <option value="ADMIN">مدير النظام</option>
                  </select>
                </div>
                <button type="submit" disabled={updating} style={{ background: '#064e3b', color: 'white', border: 'none', borderRadius: '14px', padding: '0.9rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                  {updating ? '...جاري الحفظ' : 'حفظ التعديلات'}
                </button>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .animate-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </main>
    </div>
  );
}
