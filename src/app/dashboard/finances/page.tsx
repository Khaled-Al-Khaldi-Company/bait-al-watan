'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  Wallet, Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Loader2, X, Info, 
  ChevronLeft, Activity, CreditCard, Users, Edit, Trash2, Eye, LogOut, 
  Landmark, Building2, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';

export default function FinancesPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'MEMBER';
  const isViewer = role === 'VIEWER';

  const [data, setData] = useState<any>({ transactions: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Currency States
  const [sarAmount, setSarAmount] = useState<string>('');
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [currentExchangeRate, setCurrentExchangeRate] = useState(3.75);

  useEffect(() => {
    fetchData();
    fetch('/api/projects').then(res => res.json()).then(setProjects);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finances');
      const result = await res.json();
      if (Array.isArray(result)) {
        setData({ transactions: result });
      } else {
        setData(result || { transactions: [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const isEditing = !!selectedTransaction?.id;
    const body = {
      id: selectedTransaction?.id,
      projectId: formData.get('projectId'),
      amount: usdAmount || formData.get('amount'),
      officialAmount: formData.get('officialAmount'),
      date: formData.get('date'),
      purpose: formData.get('purpose'),
      type: formData.get('type')
    };

    try {
      const res = await fetch('/api/finances', {
        method: isEditing ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        handleCloseModal();
        fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العملية المالية؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    const res = await fetch(`/api/finances?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const handleOpenEdit = (t: any) => {
    setSelectedTransaction(t);
    setUsdAmount(t.amount.toString());
    setSarAmount((t.amount * currentExchangeRate).toFixed(2));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
    setSarAmount('');
    setUsdAmount('');
  };

  const handleSarChange = (val: string) => {
    setSarAmount(val);
    if (val && !isNaN(parseFloat(val))) {
      setUsdAmount((parseFloat(val) / currentExchangeRate).toFixed(2));
    } else {
      setUsdAmount('');
    }
  };

  const handleUsdChange = (val: string) => {
    setUsdAmount(val);
    if (val && !isNaN(parseFloat(val))) {
      setSarAmount((parseFloat(val) * currentExchangeRate).toFixed(2));
    } else {
      setSarAmount('');
    }
  };

  // Safe Calculations
  const transactions = data?.transactions || [];
  const authorityTypes = ['AUTHORITY_PAYMENT', 'RESERVATION_FEE_PAYMENT', 'WALLET_OPENING_PAYMENT', 'INSTALLMENT_PAYMENT', 'ACTIVATION_TRANSFER'];
  
  // Helper to identify internal system transfers & system noise (Treasury Rule)
  const isInternalMove = (t: any) => 
    t.purpose?.includes('[') || 
    t.purpose?.includes('مناقلة') || 
    t.purpose?.includes('رصيد افتتاح') || 
    t.purpose?.includes('فتح محفظة') ||
    t.type === 'FUND_REALLOCATION';

  const totalAuthorityPaid = transactions
    .filter((t: any) => authorityTypes.includes(t.type) && t.amount < 0 && !isInternalMove(t))
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

  const totalRecognized = transactions
    .filter((t: any) => authorityTypes.includes(t.type) && t.amount < 0 && !isInternalMove(t))
    .reduce((sum: number, t: any) => sum + Math.abs(t.officialAmount || 0), 0);

  // مبالغ تحويل السيولة لمحافظ الهيئة (LIQUIDITY_TRANSFER) — مبالغ صادرة (سالبة)
  const totalLiquidityTransferred = transactions
    .filter((t: any) => t.type === 'LIQUIDITY_TRANSFER' && t.amount < 0 && !isInternalMove(t))
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

  // رصيد محفظة الهيئة = ما حوّل إليها − ما تم الاعتراف به رسمياً
  const authorityWalletBalance = Math.max(0, totalLiquidityTransferred - totalRecognized);

  const totalContributions = transactions
    .filter((t: any) => t.type === 'MEMBER_CONTRIBUTION' && t.amount > 0 && !isInternalMove(t))
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

  const totalOperationalExpenses = transactions
    .filter((t: any) => t.type === 'OTHER_EXPENSE' && !isInternalMove(t))
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

  // الرصيد النقدي الفعلي = مساهمات − مدفوعات هيئة مباشرة − تحويلات السيولة − مصروفات تشغيلية
  const cashBalance = totalContributions - totalAuthorityPaid - totalLiquidityTransferred - totalOperationalExpenses;

  if (loading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={40} color="#064e3b" /></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', direction: 'rtl' }}>
      <Sidebar />
      <main className="main-content-layout" style={{ flex: 1, padding: '2.5rem' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div onClick={() => window.history.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.75rem' }}>
              العودة للصفحة السابقة <ChevronLeft size={14} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>الإدارة المالية المركزية</h1>
            <p style={{ opacity: 0.7 }}>متابعة السيولة، المصاريف الإدارية، وسداد الهيئة.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {!isViewer && (
              <Button onClick={() => setShowModal(true)} style={{ height: '3.5rem', padding: '0 2rem' }}>
                <Plus size={18} /> تسجيل حركة مالية
              </Button>
            )}
          </div>
        </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
        <StatCard title="إجمالي مساهمات الشركاء 💼" value={`$${totalContributions.toLocaleString()}`} icon={<Users color="#064e3b" />} color="#064e3b" />
        <StatCard 
          title="رصيد الصندوق (كاش فعلي) 💵" 
          value={`$${cashBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          icon={<Wallet color="#10b981" />} 
          color="#10b981"
          note="بعد خصم المحولات والمصروفات" 
        />
        <StatCard 
          title="محوّل لمحفظة الهيئة 🏛️" 
          value={`$${totalLiquidityTransferred.toLocaleString()}`} 
          icon={<Landmark color="#3b82f6" />} 
          color="#3b82f6"
          note="مبالغ محولة من الصندوق" 
        />
        <StatCard 
          title="رصيد محفظة الهيئة (متبقٍ) 🏦" 
          value={`$${authorityWalletBalance.toLocaleString()}`} 
          icon={<Building2 size={20} />} 
          color="#7c3aed"
          note="المحوّل − المعترف به رسمياً" 
        />
        <StatCard title="المعترف به رسمياً ✅" value={`$${totalRecognized.toLocaleString()}`} icon={<CheckCircle2 size={20} />} color="#059669" />
        <StatCard title="المصاريف التشغيلية" value={`$${totalOperationalExpenses.toLocaleString()}`} icon={<CreditCard color="#f59e0b" />} color="#f59e0b" />
      </div>

      <Card style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '2rem', fontSize: '1.4rem', fontWeight: 800 }}>سجل العمليات المالية الشامل</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'right', borderBottom: '2px solid #f1f5f9', opacity: 0.6, fontSize: '0.9rem' }}>
                <th style={{ padding: '1rem' }}>التاريخ</th>
                <th style={{ padding: '1rem' }}>النوع</th>
                <th style={{ padding: '1rem' }}>المشروع</th>
                <th style={{ padding: '1rem' }}>البيان</th>
                <th style={{ padding: '1rem' }}>المبلغ</th>
                <th style={{ padding: '1rem' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => {
                const diff = t.amount - (t.officialAmount || t.amount);
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                    <td style={{ padding: '1rem' }}>
                       <span style={{ 
                         fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '1rem',
                         background: t.type === 'MEMBER_CONTRIBUTION' ? '#dcfce7' : (t.type === 'OTHER_EXPENSE' ? '#fef3c7' : '#fee2e2'),
                         color: t.type === 'MEMBER_CONTRIBUTION' ? '#166534' : (t.type === 'OTHER_EXPENSE' ? '#92400e' : '#991b1b'),
                         fontWeight: 700
                       }}>
                          {t.type === 'MEMBER_CONTRIBUTION' ? 'إيداع شريك' : (t.type === 'OTHER_EXPENSE' ? 'مصروفات' : 'سداد هيئة')}
                       </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{t.project?.name}</td>
                    <td style={{ padding: '1rem' }}>{t.purpose}</td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>${t.amount.toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                       <div style={{ display: 'flex', gap: '0.75rem' }}>
                          {!isViewer ? (
                            <>
                              <button onClick={() => handleOpenEdit(t)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={18} /></button>
                              <button onClick={() => handleDeleteTransaction(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                            </>
                          ) : (
                            <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>للعرض فقط</span>
                          )}
                       </div>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }}>لا توجد عمليات مسجلة حالياً.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <Card style={{ width: '100%', maxWidth: '450px', position: 'relative', padding: '2rem' }}>
            <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ marginBottom: '2rem', textAlign: 'center', fontWeight: 800 }}>{selectedTransaction ? 'تعديل عملية مالية' : 'تسجيل عملية مالية جديدة'}</h3>
            <form onSubmit={handleSubmitTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>المشروع المرتبط</label>
                <select name="projectId" defaultValue={selectedTransaction?.projectId} required style={inputStyle}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>نوع العملية</label>
                <select name="type" defaultValue={selectedTransaction?.type} required style={inputStyle}>
                  <option value="AUTHORITY_PAYMENT">سداد قسط للهيئة 🏛️</option>
                  <option value="OTHER_EXPENSE">مصروفات إدارية / عمولات 📦</option>
                  <option value="MEMBER_CONTRIBUTION">إيداع شريك 👤</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <label style={{ fontWeight: 600 }}>بالريال (SAR)</label>
                   <input type="number" step="0.01" value={sarAmount} onChange={(e) => handleSarChange(e.target.value)} style={inputStyle} placeholder="0.00" />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <label style={{ fontWeight: 600 }}>بالدولار ($)</label>
                   <input type="number" name="amount" step="0.01" value={usdAmount} onChange={(e) => handleUsdChange(e.target.value)} required style={inputStyle} placeholder="0.00" />
                 </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>المبلغ المعترف به رسمياً ($)</label>
                <input type="number" name="officialAmount" defaultValue={selectedTransaction?.officialAmount} style={inputStyle} placeholder="مثال: القيمة بدون عمولة البنك" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>التاريخ</label>
                <input type="date" name="date" required defaultValue={selectedTransaction?.date ? new Date(selectedTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>البيان</label>
                <input type="text" name="purpose" defaultValue={selectedTransaction?.purpose} required style={inputStyle} placeholder="الغرض من الصرف..." />
              </div>
              <Button type="submit" disabled={submitting} style={{ height: '3.5rem', marginTop: '1rem' }}>
                {submitting ? <Loader2 className="animate-spin" /> : 'تأكيد وحفظ البيانات'}
              </Button>
            </form>
          </Card>
        </div>
      )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color, note }: { title: string, value: string, icon: any, color: string, note?: string }) {
  return (
    <div style={{ background: 'white', borderRadius: '18px', padding: '1.4rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderBottom: `4px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 600 }}>{title}</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>{value}</h2>
        {note && <p style={{ fontSize: '0.7rem', color, fontWeight: 600, marginTop: '0.3rem', opacity: 0.8 }}>{note}</p>}
      </div>
      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
    </div>
  );
}

const inputStyle = { padding: '0.85rem', borderRadius: 'var(--radius)', border: '1px solid #e2e8f0', background: 'white', outline: 'none' };


