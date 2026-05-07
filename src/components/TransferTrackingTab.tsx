'use client';

import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, Save, Edit, Trash2, Send, X, RefreshCw, Activity, Landmark, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransferTracking {
  id: string;
  transferType: string;
  fromAccount: string;
  toAccountName: string;
  toAccountNumber: string;
  transferAmount: number;
  transferCurrency: string;
  receivedAmount: number | null;
  receivedCurrency: string;
  vatAmount: number;
  feeAmount: number;
  reason: string | null;
  note: string | null;
  referenceNumber: string | null;
  initiationDate: string;
  arrivalDate: string | null;
  status: 'PENDING' | 'COMPLETED' | 'POSTED';
  user?: { name: string };
}

export default function TransferTrackingTab({ projectId }: { projectId: string }) {
  const [transfers, setTransfers] = useState<TransferTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<TransferTracking | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    transferType: 'SWIFT',
    fromAccount: '',
    toAccountName: 'New Urban Communities Authority',
    toAccountNumber: '',
    transferAmount: '',
    transferCurrency: 'SAR',
    receivedAmount: '',
    receivedCurrency: 'USD',
    vatAmount: '0',
    feeAmount: '0',
    reason: '',
    note: '',
    referenceNumber: '',
    initiationDate: new Date().toISOString().slice(0, 16),
    arrivalDate: '',
  });

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/transfers`);
      if (res.ok) {
        const data = await res.json();
        setTransfers(data);
      }
    } catch (error) {
      console.error('Error fetching transfers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [projectId]);

  const handleOpenModal = (transfer?: TransferTracking) => {
    if (transfer) {
      setEditingTransfer(transfer);
      setFormData({
        transferType: transfer.transferType,
        fromAccount: transfer.fromAccount,
        toAccountName: transfer.toAccountName,
        toAccountNumber: transfer.toAccountNumber,
        transferAmount: transfer.transferAmount.toString(),
        transferCurrency: transfer.transferCurrency,
        receivedAmount: transfer.receivedAmount ? transfer.receivedAmount.toString() : '',
        receivedCurrency: transfer.receivedCurrency,
        vatAmount: transfer.vatAmount.toString(),
        feeAmount: transfer.feeAmount.toString(),
        reason: transfer.reason || '',
        note: transfer.note || '',
        referenceNumber: transfer.referenceNumber || '',
        initiationDate: new Date(transfer.initiationDate).toISOString().slice(0, 16),
        arrivalDate: transfer.arrivalDate ? new Date(transfer.arrivalDate).toISOString().slice(0, 16) : '',
      });
    } else {
      setEditingTransfer(null);
      setFormData({
        transferType: 'SWIFT',
        fromAccount: '',
        toAccountName: 'New Urban Communities Authority',
        toAccountNumber: '',
        transferAmount: '',
        transferCurrency: 'SAR',
        receivedAmount: '',
        receivedCurrency: 'USD',
        vatAmount: '0',
        feeAmount: '0',
        reason: '',
        note: '',
        referenceNumber: '',
        initiationDate: new Date().toISOString().slice(0, 16),
        arrivalDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTransfer 
        ? `/api/projects/${projectId}/transfers/${editingTransfer.id}`
        : `/api/projects/${projectId}/transfers`;
      const method = editingTransfer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchTransfers();
      } else {
        alert('حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحوالة؟')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/transfers/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchTransfers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostToFinance = async (id: string) => {
    if (!confirm('هل أنت متأكد من ترحيل هذه الحوالة واعتمادها في السجلات المالية؟')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/transfers/${id}/post`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('تم ترحيل الحوالة للمالية بنجاح');
        fetchTransfers();
      } else {
        const error = await res.json();
        alert(error.error || 'حدث خطأ أثناء الترحيل');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Utility to calculate duration
  const getDuration = (start: string, end: string | null) => {
    if (!end) return null;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const days = (diff / (1000 * 60 * 60 * 24)).toFixed(1);
    return days;
  };

  // Calculate average duration
  const completedTransfers = transfers.filter(t => t.arrivalDate && t.initiationDate);
  const avgDurationDays = completedTransfers.length > 0 
    ? completedTransfers.reduce((acc, t) => {
        const diff = new Date(t.arrivalDate!).getTime() - new Date(t.initiationDate).getTime();
        return acc + (diff / (1000 * 60 * 60 * 24));
      }, 0) / completedTransfers.length
    : 0;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
       <RefreshCw className="animate-spin text-emerald-600" size={40} />
       <p style={{ fontWeight: 800, color: '#64748b' }}>جاري تحميل البيانات المالية...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
    >
      {/* 🏆 Master Analytics Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <motion.div whileHover={{ y: -5 }} style={{ 
          padding: '2.5rem', borderRadius: '32px', background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', 
          color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(6, 78, 59, 0.2)' 
        }}>
           <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}><Landmark size={120} /></div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', backdropFilter: 'blur(10px)' }}>
                 <Activity size={24} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>سرعة المسار البنكي</span>
           </div>
           <div style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              {avgDurationDays.toFixed(1)} <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>أيام</span>
           </div>
           <p style={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: 600 }}>متوسط زمن الوصول الفعلي للحوالات المكتملة.</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} style={{ 
          padding: '2.5rem', borderRadius: '32px', background: 'white', border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ padding: '0.8rem', background: '#f0fdf4', color: '#10b981', borderRadius: '14px' }}>
                 <TrendingUp size={24} />
              </div>
              <span style={{ fontWeight: 800, color: '#64748b', fontSize: '1rem' }}>التوصية الذكية للحجز</span>
           </div>
           <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.5 }}>
              يُفضل البدء بالتحويل قبل <span style={{ color: '#059669' }}>{Math.ceil(avgDurationDays) + 1} أيام</span> لضمان الأولوية القصوى.
           </div>
        </motion.div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>تتبع الحوالات الصادرة (SWIFT)</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.3rem' }}>مراقبة المسار الزمني للحوالات قبل اعتمادها في السجلات النهائية</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ background: '#064e3b', color: 'white', padding: '0.8rem 1.8rem', borderRadius: '16px', fontWeight: 800, fontSize: '0.95rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(6, 78, 59, 0.2)' }}
        >
          <Plus size={20} /> تسجيل حوالة جديدة
        </button>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {transfers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
            <Clock style={{ margin: '0 auto 1.5rem', color: '#94a3b8' }} size={64} />
            <p style={{ fontWeight: 800, color: '#64748b' }}>لا توجد حوالات قيد التتبع حالياً لهذا المشروع</p>
          </div>
        ) : (
          transfers.map(transfer => {
            const isArrived = !!transfer.arrivalDate;
            const duration = getDuration(transfer.initiationDate, transfer.arrivalDate);
            
            return (
              <motion.div 
                key={transfer.id}
                whileHover={{ x: -10 }}
                style={{ 
                  background: 'white', borderRadius: '32px', padding: '2.5rem', border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 25px rgba(0,0,0,0.03)', position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '64px', height: '64px', borderRadius: '20px', 
                      background: transfer.status === 'POSTED' ? '#f0fdf4' : transfer.status === 'COMPLETED' ? '#eff6ff' : '#fffbeb', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: transfer.status === 'POSTED' ? '#10b981' : transfer.status === 'COMPLETED' ? '#3b82f6' : '#f59e0b'
                    }}>
                      {transfer.status === 'POSTED' ? <CheckCircle size={32} /> : <Send size={32} />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {transfer.transferType} - {transfer.fromAccount}
                        <div style={{ 
                          fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '8px', fontWeight: 800,
                          background: transfer.status === 'POSTED' ? '#10b98115' : transfer.status === 'COMPLETED' ? '#3b82f615' : '#f59e0b15',
                          color: transfer.status === 'POSTED' ? '#10b981' : transfer.status === 'COMPLETED' ? '#3b82f6' : '#f59e0b'
                        }}>
                          {transfer.status === 'POSTED' ? 'مُرحلة للمالية' : transfer.status === 'COMPLETED' ? 'مكتملة' : 'قيد التحويل'}
                        </div>
                      </h3>
                      <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>إلى: {transfer.toAccountName} | رقم: {transfer.toAccountNumber}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#064e3b' }}>{transfer.transferAmount.toLocaleString()} <span style={{ fontSize: '1rem' }}>{transfer.transferCurrency}</span></div>
                    {transfer.receivedAmount && (
                      <div style={{ fontSize: '1rem', color: '#10b981', fontWeight: 800, marginTop: '0.3rem' }}>الوصول الفعلي: {transfer.receivedAmount.toLocaleString()} {transfer.receivedCurrency}</div>
                    )}
                  </div>
                </div>

                {/* 🛣️ Route Map Visualization */}
                <div style={{ 
                  padding: '2rem', background: '#f8fafc', borderRadius: '28px', position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem'
                }}>
                   <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '3px', background: '#e2e8f0', zIndex: 0 }} />
                   <div style={{ 
                     position: 'absolute', top: '50%', left: '10%', right: isArrived ? '10%' : '50%', height: '3px', 
                     background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', zIndex: 1, transition: 'all 1.5s ease-out' 
                   }} />

                   <RouteNode label="إرسال الحوالة" date={new Date(transfer.initiationDate).toLocaleDateString('ar-EG')} active={true} icon={<Send size={18} />} />
                   <RouteNode 
                     label="عبور المسار البنكي" 
                     date={isArrived ? 'تم العبور' : 'جاري المعالجة'} 
                     active={true} 
                     icon={<Activity size={18} />} 
                     pulse={!isArrived}
                   />
                   <RouteNode 
                     label="البنك المركزي" 
                     date={transfer.arrivalDate ? new Date(transfer.arrivalDate).toLocaleDateString('ar-EG') : 'متوقع قريباً'} 
                     active={isArrived} 
                     icon={<Landmark size={18} />}
                     duration={duration}
                   />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                  {transfer.status !== 'POSTED' && (
                    <>
                      <button onClick={() => handleDelete(transfer.id)} style={{ padding: '0.7rem 1.2rem', borderRadius: '12px', border: 'none', background: '#fef2f2', color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                        <Trash2 size={16} /> حذف
                      </button>
                      <button onClick={() => handleOpenModal(transfer)} style={{ padding: '0.7rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                        <Edit size={16} /> تعديل / استكمال
                      </button>
                      {transfer.status === 'COMPLETED' && (
                        <button onClick={() => handlePostToFinance(transfer.id)} style={{ padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}>
                          <Send size={16} /> ترحيل للمالية
                        </button>
                      )}
                    </>
                  )}
                  {transfer.status === 'POSTED' && (
                    <div style={{ color: '#059669', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '1rem' }}>
                      <ShieldCheck size={24} /> تمت أرشفة العملية في السجلات المالية الرسمية
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 🚀 Premium Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'white', borderRadius: '40px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 50px 100px rgba(0,0,0,0.3)', position: 'relative' }}
            >
              <div style={{ padding: '2rem 3rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
                  {editingTransfer ? 'تحديث مسار الحوالة' : 'تسجيل حوالة SWIFT جديدة'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSave} style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '30px', height: '30px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
                    بيانات الخروج (أثناء التحويل)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <FormGroup label="نوع التحويل">
                      <input type="text" value={formData.transferType} onChange={e => setFormData({...formData, transferType: e.target.value})} style={formInputStyle} required />
                    </FormGroup>
                    <FormGroup label="من حساب (المرسل)">
                      <input type="text" value={formData.fromAccount} onChange={e => setFormData({...formData, fromAccount: e.target.value})} placeholder="مثال: حساب جاري 5000" style={formInputStyle} required />
                    </FormGroup>
                    <FormGroup label="إلى جهة (المستفيد)">
                      <input type="text" value={formData.toAccountName} onChange={e => setFormData({...formData, toAccountName: e.target.value})} style={formInputStyle} required />
                    </FormGroup>
                    <FormGroup label="رقم حساب المستفيد (IBAN)">
                      <input type="text" value={formData.toAccountNumber} onChange={e => setFormData({...formData, toAccountNumber: e.target.value})} style={formInputStyle} required />
                    </FormGroup>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <FormGroup label="مبلغ الحوالة" style={{ flex: 1 }}>
                        <input type="number" step="0.01" value={formData.transferAmount} onChange={e => setFormData({...formData, transferAmount: e.target.value})} style={formInputStyle} required />
                      </FormGroup>
                      <FormGroup label="العملة" style={{ width: '100px' }}>
                        <input type="text" value={formData.transferCurrency} onChange={e => setFormData({...formData, transferCurrency: e.target.value})} style={{ ...formInputStyle, textAlign: 'center' }} required />
                      </FormGroup>
                    </div>

                    <FormGroup label="تاريخ ووقت الإرسال">
                      <input type="datetime-local" value={formData.initiationDate} onChange={e => setFormData({...formData, initiationDate: e.target.value})} style={formInputStyle} required />
                    </FormGroup>

                    <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '20px' }}>
                      <FormGroup label="رسوم البنك">
                        <input type="number" step="0.01" value={formData.feeAmount} onChange={e => setFormData({...formData, feeAmount: e.target.value})} style={formInputStyle} />
                      </FormGroup>
                      <FormGroup label="الضريبة المضافة">
                        <input type="number" step="0.01" value={formData.vatAmount} onChange={e => setFormData({...formData, vatAmount: e.target.value})} style={formInputStyle} />
                      </FormGroup>
                    </div>
                    
                    <FormGroup label="ملاحظات التحويل" style={{ gridColumn: 'span 2' }}>
                      <input type="text" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="أي ملاحظات إضافية..." style={formInputStyle} />
                    </FormGroup>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f0fdf4', padding: '2rem', borderRadius: '30px', border: '1px solid #10b98120' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#059669', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '30px', height: '30px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
                    بيانات الوصول (بعد اكتمال الحوالة)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <FormGroup label="رقم السويفت / المرجع (SWIFT Ref)" style={{ gridColumn: 'span 2' }}>
                      <input type="text" value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} style={formInputStyle} />
                    </FormGroup>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <FormGroup label="المبلغ المستلم فعلياً" style={{ flex: 1 }}>
                        <input type="number" step="0.01" value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} style={{ ...formInputStyle, background: 'white' }} />
                      </FormGroup>
                      <FormGroup label="العملة" style={{ width: '100px' }}>
                        <input type="text" value={formData.receivedCurrency} onChange={e => setFormData({...formData, receivedCurrency: e.target.value})} style={{ ...formInputStyle, textAlign: 'center', background: 'white' }} />
                      </FormGroup>
                    </div>

                    <FormGroup label="تاريخ ووقت الوصول للمركزي">
                      <input type="datetime-local" value={formData.arrivalDate} onChange={e => setFormData({...formData, arrivalDate: e.target.value})} style={{ ...formInputStyle, background: 'white' }} />
                    </FormGroup>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '1rem 2rem', borderRadius: '16px', background: '#f1f5f9', color: '#64748b', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                    إلغاء
                  </button>
                  <button type="submit" style={{ padding: '1rem 3rem', borderRadius: '16px', background: '#064e3b', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 20px 40px rgba(6, 78, 59, 0.2)' }}>
                    <Save size={20} /> حفظ الحوالة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RouteNode({ label, date, active, icon, pulse, duration }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 10, width: '140px', position: 'relative' }}>
       <div style={{ 
         width: '56px', height: '56px', borderRadius: '50%', 
         background: active ? '#10b981' : 'white', 
         border: `4px solid ${active ? '#10b981' : '#e2e8f0'}`,
         display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'white' : '#cbd5e1',
         boxShadow: active ? '0 0 25px rgba(16, 185, 129, 0.5)' : 'none',
         position: 'relative'
       }}>
          {pulse && <div className="pulse-ring-modern" />}
          {icon}
       </div>
       <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: '1rem', color: active ? '#0f172a' : '#94a3b8' }}>{label}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 700, marginTop: '0.2rem' }}>{date}</div>
       </div>
       {duration && (
         <div style={{ 
           position: 'absolute', bottom: '-45px', background: '#064e3b', color: 'white', 
           padding: '0.4rem 1rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, whiteSpace: 'nowrap',
           boxShadow: '0 10px 15px rgba(0,0,0,0.1)'
         }}>
            الزمن: {duration} أيام
         </div>
       )}
       <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse_modern { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.8); opacity: 0; } }
          .pulse-ring-modern { position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #10b981; animation: pulse_modern 2s infinite; }
       `}} />
    </div>
  );
}

function FormGroup({ label, children, style }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', ...style }}>
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b' }}>{label}</label>
      {children}
    </div>
  );
}

const formInputStyle = {
  width: '100%',
  padding: '1rem 1.2rem',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '1rem',
  fontWeight: 600,
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box' as const
};
