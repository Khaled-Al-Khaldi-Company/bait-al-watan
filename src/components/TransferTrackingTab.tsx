'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, CheckCircle, Clock, Save, Edit, Trash2, Send, X, RefreshCw, Activity } from 'lucide-react';

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
    if (!end) return 'جاري التنفيذ...';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days} يوم و ${hours} ساعة`;
    return `${hours} ساعة`;
  };

  // Calculate average duration
  const completedTransfers = transfers.filter(t => t.arrivalDate && t.initiationDate);
  const avgDurationDays = completedTransfers.length > 0 
    ? completedTransfers.reduce((acc, t) => {
        const diff = new Date(t.arrivalDate!).getTime() - new Date(t.initiationDate).getTime();
        return acc + (diff / (1000 * 60 * 60 * 24));
      }, 0) / completedTransfers.length
    : 0;

  if (loading) return <div className="p-8 text-center"><RefreshCw className="animate-spin inline-block text-blue-500" /> جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      {/* Top Cards for Advice and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Smart Advice Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold">
            <Clock size={20} />
            <h3 className="text-lg">نصيحة التحويل الذكية</h3>
          </div>
          <p className="text-slate-800 font-bold text-xl leading-relaxed">
            يفضل التحويل قبل 1 أيام من موعد الإغلاق لضمان الأولوية.
          </p>
        </div>

        {/* Average Duration Card */}
        <div className="bg-emerald-800 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-center relative overflow-hidden">
          <div className="absolute left-0 bottom-0 opacity-10">
             <Activity size={120} style={{ transform: 'translate(-20%, 20%)' }} />
          </div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-emerald-100 font-bold text-lg">متوسط مدة وصول الحوالة</h3>
            <Activity size={24} className="text-emerald-300" />
          </div>
          <div className="relative z-10">
            <span className="text-4xl font-black">{avgDurationDays.toFixed(1)}</span>
            <span className="text-xl font-bold mr-2 text-emerald-200">أيام</span>
          </div>
          <p className="text-emerald-200/70 text-sm mt-3 relative z-10">
            بناءً على الحوالات الموثقة تاريخياً لهذا المشروع.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">تتبع الحوالات الصادرة (SWIFT)</h2>
          <p className="text-slate-500 text-sm mt-1">سجل الحوالات قيد التنفيذ قبل اعتمادها في العمليات المالية</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
        >
          <Plus size={18} />
          تسجيل حوالة جديدة
        </button>
      </div>

      <div className="grid gap-4">
        {transfers.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Clock className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">لا توجد حوالات قيد التتبع حالياً</p>
          </div>
        ) : (
          transfers.map(transfer => (
            <div key={transfer.id} className={`bg-white p-6 rounded-2xl shadow-sm border ${transfer.status === 'POSTED' ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    transfer.status === 'POSTED' ? 'bg-green-100 text-green-600' :
                    transfer.status === 'COMPLETED' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {transfer.status === 'POSTED' ? <CheckCircle size={24} /> :
                     transfer.status === 'COMPLETED' ? <CheckCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      {transfer.transferType} - {transfer.fromAccount}
                      {transfer.status === 'POSTED' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">مُرحلة للمالية</span>}
                      {transfer.status === 'COMPLETED' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">مكتملة - جاهزة للترحيل</span>}
                      {transfer.status === 'PENDING' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">قيد التحويل</span>}
                    </h3>
                    <p className="text-slate-500 text-sm">إلى: {transfer.toAccountName} | رقم: {transfer.toAccountNumber}</p>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <div className="text-lg font-bold text-slate-800" dir="ltr">{transfer.transferAmount.toLocaleString()} {transfer.transferCurrency}</div>
                  {transfer.receivedAmount && (
                    <div className="text-sm text-emerald-600 font-bold" dir="ltr">يصل: {transfer.receivedAmount.toLocaleString()} {transfer.receivedCurrency}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl mb-4 text-sm">
                <div>
                  <span className="block text-slate-400 text-xs mb-1">تاريخ التحويل</span>
                  <span className="font-bold text-slate-700">{new Date(transfer.initiationDate).toLocaleDateString('ar-SA')}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs mb-1">وقت الوصول</span>
                  <span className="font-bold text-slate-700">{transfer.arrivalDate ? new Date(transfer.arrivalDate).toLocaleDateString('ar-SA') : '---'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs mb-1">المدة المستغرقة</span>
                  <span className="font-bold text-slate-700">{getDuration(transfer.initiationDate, transfer.arrivalDate)}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs mb-1">رقم السويفت (المرجعي)</span>
                  <span className="font-mono font-bold text-slate-700">{transfer.referenceNumber || '---'}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                {transfer.status !== 'POSTED' && (
                  <>
                    <button onClick={() => handleDelete(transfer.id)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                      <Trash2 size={16} /> حذف
                    </button>
                    <button onClick={() => handleOpenModal(transfer)} className="text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                      <Edit size={16} /> استكمال / تعديل
                    </button>
                    {transfer.status === 'COMPLETED' && (
                      <button onClick={() => handlePostToFinance(transfer.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm">
                        <Send size={16} /> ترحيل إلى المالية
                      </button>
                    )}
                  </>
                )}
                {transfer.status === 'POSTED' && (
                  <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">
                    <CheckCircle size={16} /> تمت المعالجة مالياً
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {editingTransfer ? 'تحديث بيانات الحوالة' : 'تسجيل حوالة صادرة جديدة'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Phase 1: Initiation Data */}
              <div className="space-y-4">
                <h4 className="font-bold text-blue-600 border-b pb-2 flex items-center gap-2">
                  <span className="bg-blue-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span>
                  بيانات الخروج (أثناء التحويل)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">نوع التحويل</label>
                    <input type="text" value={formData.transferType} onChange={e => setFormData({...formData, transferType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">تحويل من (الحساب الخاص بنا)</label>
                    <input type="text" value={formData.fromAccount} onChange={e => setFormData({...formData, fromAccount: e.target.value})} placeholder="مثال: حساب جاري 5000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">تحويل إلى (الجهة المستفيدة)</label>
                    <input type="text" value={formData.toAccountName} onChange={e => setFormData({...formData, toAccountName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">رقم الحساب المستفيد (IBAN)</label>
                    <input type="text" value={formData.toAccountNumber} onChange={e => setFormData({...formData, toAccountNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" required />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm text-slate-500 mb-1">مبلغ الحوالة</label>
                      <input type="number" step="0.01" value={formData.transferAmount} onChange={e => setFormData({...formData, transferAmount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono" required />
                    </div>
                    <div className="w-24">
                      <label className="block text-sm text-slate-500 mb-1">العملة</label>
                      <input type="text" value={formData.transferCurrency} onChange={e => setFormData({...formData, transferCurrency: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono text-center" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-500 mb-1">تاريخ ووقت التحويل</label>
                    <input type="datetime-local" value={formData.initiationDate} onChange={e => setFormData({...formData, initiationDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono" required />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">رسوم التحويل</label>
                      <input type="number" step="0.01" value={formData.feeAmount} onChange={e => setFormData({...formData, feeAmount: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">ضريبة القيمة المضافة</label>
                      <input type="number" step="0.01" value={formData.vatAmount} onChange={e => setFormData({...formData, vatAmount: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-mono" />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-500 mb-1">ملاحظات التحويل</label>
                    <input type="text" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="مثال: Code 89739159089 Bayt Elwatan" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                  </div>
                </div>
              </div>

              {/* Phase 2: Arrival Data */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-emerald-600 border-b pb-2 flex items-center gap-2">
                  <span className="bg-emerald-100 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">2</span>
                  بيانات الوصول (بعد اكتمال الحوالة)
                  <span className="text-xs font-normal text-slate-400 mr-auto">يتم إدخالها لاحقاً لتجهيز الترحيل</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-500 mb-1">رقم السويفت (SWIFT Code / Reference)</label>
                    <input type="text" value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono" />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm text-slate-500 mb-1">المبلغ الفعلي المستلم (في حساب الهيئة)</label>
                      <input type="number" step="0.01" value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono" />
                    </div>
                    <div className="w-24">
                      <label className="block text-sm text-slate-500 mb-1">العملة</label>
                      <input type="text" value={formData.receivedCurrency} onChange={e => setFormData({...formData, receivedCurrency: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono text-center" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-500 mb-1">تاريخ ووقت وصول الحوالة</label>
                    <input type="datetime-local" value={formData.arrivalDate} onChange={e => setFormData({...formData, arrivalDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
                  إلغاء
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30">
                  <Save size={18} /> حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
