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
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showTransferModal, setShowTransferModal] = useState(false);

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

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body = {
      sourceProjectId: formData.get('sourceProjectId'),
      targetProjectId: formData.get('targetProjectId'),
      amount: parseFloat(formData.get('amount') as string),
      purpose: formData.get('purpose'),
      mirrorPartners: true, 
      date: formData.get('date')
    };

    if (body.sourceProjectId === body.targetProjectId) {
      alert('لا يمكن التحويل لنفس المشروع');
      setSubmitting(false);
      return;
    }

    if (!confirm('سيقوم النظام بخصم المبلغ من المصدر وتوزيعه كحصص مساهمين في الوجهة بناءً على نسبهم. هل تريد المتابعة؟')) {
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/finances/transfer', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setShowTransferModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(`فشل التحويل: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
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
    // We removed 'فتح محفظة' from here because these are the transfers we want to track
    t.type === 'FUND_REALLOCATION';

  const totalAuthorityPaid = transactions
    .filter((t: any) => authorityTypes.includes(t.type) && t.amount < 0 && !isInternalMove(t))
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

  const totalRecognized = transactions
    .filter((t: any) => authorityTypes.includes(t.type) && t.amount < 0 && !isInternalMove(t))
    .reduce((sum: number, t: any) => sum + Math.abs(t.officialAmount || 0), 0);

  // مبالغ تحويل السيولة لمحافظ الهيئة (LIQUIDITY_TRANSFER) — مبالغ صادرة (سالبة)
  const totalLiquidityTransferred = transactions
    .filter((t: any) => (t.type === 'LIQUIDITY_TRANSFER' || t.type === 'AUTHORITY_PAYMENT') && t.amount < 0 && !isInternalMove(t))
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div onClick={() => window.history.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700, marginBottom: '0.8rem' }}>
              <ChevronLeft size={16} /> العودة للوحة التحكم
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0f172a' }}>الإدارة المالية المركزية 🏦</h1>
            <p style={{ opacity: 0.6, fontSize: '1.1rem', fontWeight: 600 }}>الرؤية الشاملة للسيولة، المحافظ، والعمليات المالية للمجموعة.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {!isViewer && (
              <>
                <Button onClick={() => setShowTransferModal(true)} variant="secondary" style={{ height: '3.8rem', borderRadius: '18px', padding: '0 2rem', background: 'white', border: '2px solid #064e3b', color: '#064e3b', fontWeight: 800 }}>
                  <Activity size={20} /> مناقلة سيولة ذكية
                </Button>
                <Button onClick={() => setShowModal(true)} style={{ height: '3.8rem', borderRadius: '18px', padding: '0 2rem', background: '#064e3b', color: 'white', fontWeight: 800, boxShadow: '0 10px 20px rgba(6, 78, 59, 0.15)' }}>
                  <Plus size={20} /> تسجيل حركة مالية
                </Button>
              </>
            )}
          </div>
        </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="إجمالي مساهمات الشركاء" value={`$${totalContributions.toLocaleString()}`} icon={<Users size={24} />} color="#064e3b" />
        <StatCard 
          title="رصيد الصندوق (كاش فعلي)" 
          value={`$${cashBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          icon={<Wallet size={24} />} 
          color="#10b981"
          note="السيولة المتاحة حالياً بالصندوق" 
        />
        <StatCard 
          title="محوّل لمحفظة الهيئة" 
          value={`$${totalLiquidityTransferred.toLocaleString()}`} 
          icon={<Landmark size={24} />} 
          color="#3b82f6"
          note="إجمالي ما تم سداده للهيئة" 
        />
        <StatCard 
          title="رصيد محفظة الهيئة (متبقٍ)" 
          value={`$${authorityWalletBalance.toLocaleString()}`} 
          icon={<Building2 size={24} />} 
          color="#7c3aed"
          note="رصيد معلق لم يعترف به بعد" 
        />
      </div>

      <Card style={{ padding: '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>سجل العمليات المالية الشامل 📊</h3>
          <div style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', fontWeight: 700, color: '#64748b', fontSize: '0.9rem' }}>
             إجمالي العمليات: {transactions.length}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem' }}>
            <thead>
              <tr style={{ textAlign: 'right', opacity: 0.4, fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                <th style={{ padding: '0 1rem' }}>التاريخ</th>
                <th style={{ padding: '0 1rem' }}>النوع</th>
                <th style={{ padding: '0 1rem' }}>المشروع</th>
                <th style={{ padding: '0 1rem' }}>البيان</th>
                <th style={{ padding: '0 1rem' }}>المبلغ</th>
                <th style={{ padding: '0 1rem' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => {
                const isPositive = t.amount > 0;
                return (
                  <tr key={t.id} style={{ background: '#f8fafc', borderRadius: '16px', transition: 'transform 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '1.2rem 1rem', fontWeight: 700, borderRadius: '16px 0 0 16px' }}>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                    <td style={{ padding: '1.2rem 1rem' }}>
                       <span style={{ 
                         fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '10px',
                         background: t.type === 'MEMBER_CONTRIBUTION' ? '#dcfce7' : (t.type === 'OTHER_EXPENSE' ? '#fef3c7' : '#fee2e2'),
                         color: t.type === 'MEMBER_CONTRIBUTION' ? '#166534' : (t.type === 'OTHER_EXPENSE' ? '#92400e' : '#991b1b'),
                         fontWeight: 900
                       }}>
                          {t.type === 'MEMBER_CONTRIBUTION' ? 'إيداع شريك' : (t.type === 'OTHER_EXPENSE' ? 'مصروفات' : 'سداد هيئة')}
                       </span>
                    </td>
                    <td style={{ padding: '1.2rem 1rem', fontWeight: 800, color: '#064e3b' }}>{t.project?.name}</td>
                    <td style={{ padding: '1.2rem 1rem', color: '#475569', fontSize: '0.9rem', maxWidth: '300px' }}>{t.purpose}</td>
                    <td style={{ padding: '1.2rem 1rem', fontWeight: 900, color: isPositive ? '#059669' : '#dc2626', fontSize: '1.1rem' }}>
                      {isPositive ? '+' : ''}{t.amount.toLocaleString()}$
                    </td>
                    <td style={{ padding: '1.2rem 1rem', borderRadius: '0 16px 16px 0' }}>
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!isViewer ? (
                            <>
                              <button onClick={() => handleOpenEdit(t)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: 'white', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}><Edit size={16} /></button>
                              <button onClick={() => handleDeleteTransaction(t.id)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: 'white', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}><Trash2 size={16} /></button>
                            </>
                          ) : (
                            <Eye size={18} style={{ opacity: 0.2 }} />
                          )}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modern Modals */}
      <AnimatePresence>
        {(showModal || showTransferModal) && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ background: 'white', padding: '2.5rem', borderRadius: '40px', width: '100%', maxWidth: '550px', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 50px 100px rgba(0,0,0,0.2)', position: 'relative' }}
            >
              <button 
                onClick={showTransferModal ? () => setShowTransferModal(false) : handleCloseModal} 
                style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '45px', height: '45px', borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }}
                className="close-btn-hover"
              >
                <X size={24} />
              </button>

              {showTransferModal ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '22px', background: '#064e3b10', color: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <Activity size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>مناقلة سيولة ذكية 🔄</h3>
                    <p style={{ opacity: 0.5, fontWeight: 600 }}>نقل الأرصدة بين المشاريع وتوزيعها آلياً على الشركاء.</p>
                  </div>
                  <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                      <div style={formGroup}>
                        <label style={formLabel}>من مشروع (المصدر)</label>
                        <select name="sourceProjectId" required style={formInput}>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div style={formGroup}>
                        <label style={formLabel}>إلى مشروع (الوجهة)</label>
                        <select name="targetProjectId" required style={formInput}>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={formGroup}>
                      <label style={formLabel}>المبلغ المراد تحويله ($)</label>
                      <input type="number" name="amount" step="0.01" required style={formInput} placeholder="0.00" />
                    </div>
                    <div style={formGroup}>
                      <label style={formLabel}>البيان / السبب</label>
                      <input type="text" name="purpose" required style={formInput} placeholder="مثال: تمويل بداية الإنشاءات..." />
                    </div>
                    <div style={formGroup}>
                      <label style={formLabel}>التاريخ</label>
                      <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} style={formInput} />
                    </div>
                    <Button type="submit" disabled={submitting} style={{ height: '4rem', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 800, marginTop: '1rem', background: '#064e3b', color: 'white' }}>
                      {submitting ? <Loader2 className="animate-spin" /> : 'تنفيذ المناقلة الذكية'}
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '22px', background: '#064e3b10', color: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                      <Landmark size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>{selectedTransaction ? 'تعديل عملية مالية' : 'تسجيل حركة مالية'}</h3>
                    <p style={{ opacity: 0.5, fontWeight: 600 }}>أدخل تفاصيل العملية المالية لضمان دقة التقارير.</p>
                  </div>
                  <form onSubmit={handleSubmitTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={formGroup}>
                      <label style={formLabel}>المشروع المرتبط</label>
                      <select name="projectId" defaultValue={selectedTransaction?.projectId} required style={formInput}>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div style={formGroup}>
                      <label style={formLabel}>نوع العملية</label>
                      <select name="type" defaultValue={selectedTransaction?.type} required style={formInput}>
                        <option value="AUTHORITY_PAYMENT">سداد قسط للهيئة 🏛️</option>
                        <option value="OTHER_EXPENSE">مصروفات إدارية / عمولات 📦</option>
                        <option value="MEMBER_CONTRIBUTION">إيداع شريك 👤</option>
                        <option value="LIQUIDITY_TRANSFER">تحويل سيولة لمحفظة الهيئة 🏦</option>
                      </select>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                       <div style={formGroup}>
                         <label style={formLabel}>بالريال (SAR)</label>
                         <input type="number" step="0.01" value={sarAmount} onChange={(e) => handleSarChange(e.target.value)} style={formInput} placeholder="0.00" />
                       </div>
                       <div style={formGroup}>
                         <label style={formLabel}>بالدولار ($)</label>
                         <input type="number" name="amount" step="0.01" value={usdAmount} onChange={(e) => handleUsdChange(e.target.value)} required style={formInput} placeholder="0.00" />
                       </div>
                    </div>
      
                    <div style={formGroup}>
                      <label style={formLabel}>المبلغ المعترف به رسمياً ($)</label>
                      <input type="number" name="officialAmount" defaultValue={selectedTransaction?.officialAmount} style={formInput} placeholder="مثال: القيمة بدون عمولة البنك" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                      <div style={formGroup}>
                        <label style={formLabel}>التاريخ</label>
                        <input type="date" name="date" required defaultValue={selectedTransaction?.date ? new Date(selectedTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} style={formInput} />
                      </div>
                      <div style={formGroup}>
                        <label style={formLabel}>البيان</label>
                        <input type="text" name="purpose" defaultValue={selectedTransaction?.purpose} required style={formInput} placeholder="الغرض..." />
                      </div>
                    </div>
                    <Button type="submit" disabled={submitting} style={{ height: '4rem', borderRadius: '20px', background: '#064e3b', color: 'white', fontWeight: 800, fontSize: '1.1rem', marginTop: '1rem' }}>
                      {submitting ? <Loader2 className="animate-spin" /> : 'تأكيد وحفظ البيانات'}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .table-row-hover:hover { transform: scale(1.01); background: #f1f5f9 !important; }
        .close-btn-hover:hover { background: #fee2e2 !important; color: #ef4444 !important; transform: rotate(90deg); }
      `}} />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color, note }: { title: string, value: string, icon: any, color: string, note?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      style={{ background: 'white', borderRadius: '24px', padding: '1.8rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderBottom: `5px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
    >
      <div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 700 }}>{title}</p>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>{value}</h2>
        {note && <p style={{ fontSize: '0.75rem', color, fontWeight: 700, marginTop: '0.5rem', opacity: 0.8 }}>{note}</p>}
      </div>
      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
    </motion.div>
  );
}

const formGroup = { display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' };
const formLabel = { fontWeight: 800, fontSize: '0.9rem', color: '#475569' };
const formInput = { 
  padding: '1rem 1.2rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: '1rem', fontWeight: 600, outline: 'none', transition: 'all 0.2s', width: '100%'
};


