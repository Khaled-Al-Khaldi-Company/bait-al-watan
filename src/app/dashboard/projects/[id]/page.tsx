'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, ChevronLeft, Loader2, Landmark, 
  DollarSign, Building, Info, TrendingUp, ShieldCheck, 
  Users, FileText, Activity, Clock, ArrowRight,
  Download, ExternalLink, Receipt, Settings, BarChart3,
  History, PieChart, Layers, Trash2, Edit3, Share2, X, Plus
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import DocumentExplorer from '@/components/DocumentExplorer';

type TabType = 'overview' | 'partners' | 'timeline' | 'finances' | 'documents' | 'settings';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [targetPhaseId, setTargetPhaseId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const [projRes, usersRes, actRes, allProjRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch('/api/members'),
        fetch(`/api/dashboard/activities?projectId=${id}`),
        fetch('/api/projects')
      ]);
      
      if (projRes.ok) {
        const data = await projRes.json();
        setProject(data);
      }
      if (usersRes.ok) {
        const usrs = await usersRes.json();
        setUsers(usrs);
      }
      if (actRes.ok) {
        const acts = await actRes.json();
        setActivities(acts);
      }
      if (allProjRes.ok) {
        const projs = await allProjRes.json();
        setAllProjects(projs);
      }
    } catch (err) {
      console.error('Error fetching project data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body = {
      projectId: id,
      userId: formData.get('userId'),
      percentage: parseFloat(formData.get('percentage') as string || '0'),
      shareAmount: parseFloat(formData.get('shareAmount') as string || '0'),
    };

    try {
      const res = await fetch('/api/participations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowAddPartner(false);
        fetchProject();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePartner = async (partId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الشريك؟')) return;
    try {
      const res = await fetch(`/api/participations?id=${partId}`, { method: 'DELETE' });
      if (res.ok) fetchProject();
    } catch (err) { console.error(err); }
  };

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        alert('تم تحديث البيانات بنجاح ✅');
        fetchProject();
      } else {
        const errorData = await res.json();
        alert(`فشل التحديث: ${errorData.error || 'حدث خطأ غير معروف'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('تحذير: سيتم حذف كافة البيانات المرتبطة بهذا الحجز نهائياً. هل أنت متأكد؟')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/projects');
      } else {
        const data = await res.json();
        alert(`فشل الحذف: ${data.error || 'خطأ غير معروف'}`);
      }
    } catch (err: any) {
      alert(`خطأ في الاتصال: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append('projectId', id as string);
    if (selectedTransaction) {
      formData.append('id', selectedTransaction.id);
    }

    try {
      const res = await fetch('/api/finances', {
        method: selectedTransaction ? 'PATCH' : 'POST',
        body: formData
      });
      if (res.ok) {
        setShowAddTransaction(false);
        setSelectedTransaction(null);
        fetchProject();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل معالجة العملية');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body = {
      sourceProjectId: id,
      targetProjectId: formData.get('targetProjectId'),
      amount: parseFloat(formData.get('amount') as string),
      purpose: formData.get('purpose'),
      transferType: formData.get('transferType') || 'LIQUIDITY_TRANSFER',
      mirrorPartners: true,
      date: formData.get('date')
    };

    if (body.sourceProjectId === body.targetProjectId) {
      alert('لا يمكن التحويل لنفس المشروع');
      setSubmitting(false);
      return;
    }

    if (!confirm('سيتم توزيع المبلغ على شركاء هذا المشروع في المشروع الوجهة بناءً على نسبهم الحالية. هل تريد المتابعة؟')) {
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
        fetchProject();
      } else {
        const err = await res.json();
        alert(`فشل التحويل: ${err.error}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العملية المالية؟')) return;
    try {
      const res = await fetch(`/api/projects/${id}/transactions/${txId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProject();
      } else {
        const data = await res.json();
        alert(`فشل حذف العملية: ${data.error || 'خطأ في الصلاحيات'}`);
      }
    } catch (err: any) {
      alert(`خطأ في الاتصال: ${err.message}`);
    }
  };

  const handleInitTimeline = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}/phases/init`, { method: 'POST' });
      if (res.ok) {
        fetchProject();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل تهيئة المسار الزمني');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!targetPhaseId) return;
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title');

    try {
      const res = await fetch(`/api/projects/${id}/phases/${targetPhaseId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        setShowAddTask(false);
        setTargetPhaseId(null);
        fetchProject();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, isCompleted })
      });
      if (res.ok) {
        fetchProject();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    try {
      const res = await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProject();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePhaseStatus = async (phaseId: string, status: string) => {
    try {
      const res = await fetch(`/api/projects/${id}/phases/${phaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchProject();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 className="animate-spin" size={40} color="#064e3b" />
    </div>
  );

  if (!project) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: '1rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>الحجز غير موجود ⚠️</h2>
      <Button onClick={() => router.push('/dashboard/projects')}>العودة لسجل الحجوزات</Button>
    </div>
  );

  const totalPaid = project.transactions?.filter((t: any) => 
    ['AUTHORITY_PAYMENT', 'RESERVATION_FEE_PAYMENT', 'INSTALLMENT_PAYMENT'].includes(t.type)
  ).reduce((sum: number, t: any) => sum + Math.abs(t.officialAmount || t.amount || 0), 0) || 0;

  const totalValue = project.totalValue || 0;
  const remaining = Math.max(0, totalValue - totalPaid);
  const progress = totalValue > 0 ? Math.min(100, Math.max(0, (totalPaid / totalValue) * 100)) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl', fontFamily: 'inherit' }}>
      <Sidebar />
      
      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ 
          flex: 1, 
          padding: '2rem 3rem', 
          paddingRight: 'calc(var(--sidebar-width) + 2rem)',
          maxWidth: '1600px', 
          margin: '0 auto', 
          width: '100%',
          transition: 'padding-right 0.35s ease'
        }}
      >
        
        {/* Professional Header */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <motion.div 
              whileHover={{ scale: 1.1, x: 5 }}
              onClick={() => router.push('/dashboard/projects')}
              style={{ cursor: 'pointer', width: '48px', height: '48px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#64748b' }}
            >
              <ChevronLeft size={24} />
            </motion.div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>{project.name}</h1>
                <Badge style={{ 
                  background: `${getStatusColor(project.status)}15`, 
                  color: getStatusColor(project.status),
                  padding: '0.4rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5, fontWeight: 600 }}>
                <MapPin size={16} /> {project.location || 'الموقع غير محدد'}
                <span style={{ fontSize: '1.2rem' }}>•</span>
                <Calendar size={16} /> {new Date(project.createdAt).toLocaleDateString('ar-EG')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" style={{ borderRadius: '14px', gap: '0.5rem', fontWeight: 700, height: '3.2rem', padding: '0 1.5rem', background: 'white' }}>
                <Share2 size={18} /> مشاركة
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => {
                  setActiveTab('settings');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ borderRadius: '14px', gap: '0.5rem', fontWeight: 700, height: '3.2rem', padding: '0 1.5rem', background: '#064e3b', color: 'white' }}
              >
                <Edit3 size={18} /> تعديل البيانات
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Top Summary Stats */}
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          <CompactStat title="إجمالي القيمة" value={`$${totalValue.toLocaleString()}`} icon={<DollarSign size={20} />} color="#0f172a" />
          <CompactStat title="المسدد للهيئة" value={`$${totalPaid.toLocaleString()}`} icon={<ShieldCheck size={20} />} color="#10b981" />
          <CompactStat title="المتبقي" value={`$${remaining.toLocaleString()}`} icon={<Clock size={20} />} color="#f59e0b" />
          <CompactStat title="المستندات" value={`${project.documents?.length || 0} ملفات`} icon={<FileText size={20} />} color="#3b82f6" />
        </motion.div>

        {/* Global Tab Navigation */}
        <motion.div 
          variants={itemVariants}
          style={{ 
            display: 'flex', gap: '0.5rem', background: 'white', padding: '0.5rem', 
            borderRadius: '20px', marginBottom: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            position: 'sticky', top: '1rem', zIndex: 50
          }}
        >
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Layers size={18} />} label="نظرة عامة" />
          <TabButton active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} icon={<Users size={18} />} label="حصص الشركاء" />
          <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Activity size={18} />} label="المسار الزمني" />
          <TabButton active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} icon={<History size={18} />} label="الحركة المالية" />
          <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FileText size={18} />} label="المستندات" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18} />} label="الإعدادات" />
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ minHeight: '500px' }}
        >
          {activeTab === 'overview' && <OverviewTab project={project} progress={progress} />}
          {activeTab === 'partners' && <PartnersTab project={project} onAdd={() => setShowAddPartner(true)} onDelete={handleDeletePartner} />}
          {activeTab === 'timeline' && (
            <TimelineTab 
              project={project} 
              onInit={handleInitTimeline} 
              onAddTask={(phaseId: string) => {
                setTargetPhaseId(phaseId);
                setShowAddTask(true);
              }}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onUpdatePhaseStatus={handleUpdatePhaseStatus}
              submitting={submitting}
            />
          )}
          {activeTab === 'finances' && (
            <FinancesTab 
              project={project} 
              onAdd={() => setShowAddTransaction(true)} 
              onTransfer={() => setShowTransferModal(true)}
              onEdit={(t: any) => {
                setSelectedTransaction(t);
                setShowAddTransaction(true);
              }}
              onDelete={handleDeleteTransaction} 
            />
          )}
          {activeTab === 'documents' && <DocumentsTab project={project} />}
          {activeTab === 'settings' && <SettingsTab project={project} onSubmit={handleUpdateProject} onDelete={handleDeleteProject} submitting={submitting} />}
        </motion.div>

        {/* Modals with AnimatePresence */}
        <AnimatePresence>
          {showAddPartner && (
            <Modal onClose={() => setShowAddPartner(false)}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textAlign: 'center', marginBottom: '2rem' }}>إضافة شريك للحجز</h2>
              <form onSubmit={handleAddPartner} style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' }}>
                <div style={formGroup}>
                  <label style={formLabel}>اختر الشريك</label>
                  <select name="userId" required style={formInput}>
                    <option value="">-- اختر العضو --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                   <div style={formGroup}>
                      <label style={formLabel}>النسبة (%)</label>
                      <input name="percentage" type="number" step="0.1" style={formInput} placeholder="50" />
                   </div>
                   <div style={formGroup}>
                      <label style={formLabel}>المبلغ ($)</label>
                      <input name="shareAmount" type="number" style={formInput} placeholder="10000" />
                   </div>
                </div>
                <Button type="submit" disabled={submitting} style={{ height: '3.5rem', borderRadius: '14px', background: '#064e3b', color: 'white', fontWeight: 800 }}>
                   {submitting ? <Loader2 className="animate-spin" /> : 'تأكيد الإضافة'}
                </Button>
              </form>
            </Modal>
          )}

          {showAddTransaction && (
            <Modal onClose={() => { setShowAddTransaction(false); setSelectedTransaction(null); }} maxWidth="650px">
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textAlign: 'center', marginBottom: '2rem' }}>
                {selectedTransaction ? 'تعديل عملية مالية' : 'تسجيل عملية مالية جديدة'}
              </h2>
              <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                   <div style={formGroup}>
                      <label style={formLabel}>نوع العملية</label>
                      <select name="type" required defaultValue={selectedTransaction?.type || 'MEMBER_CONTRIBUTION'} style={formInput}>
                        <option value="MEMBER_CONTRIBUTION">مساهمة من شريك (إيداع)</option>
                        <option value="AUTHORITY_PAYMENT">سداد للهيئة (قسط/رسوم)</option>
                        <option value="OTHER_EXPENSE">مصاريف أخرى (عمولات/إداري)</option>
                        <option value="RESERVATION_FEE_PAYMENT">رسوم حجز</option>
                        <option value="INSTALLMENT_PAYMENT">قسط دوري</option>
                        <option value="LIQUIDITY_TRANSFER">تحويل سيولة (مناقلة)</option>
                      </select>
                   </div>
                   <div style={formGroup}>
                      <label style={formLabel}>الشريك المرتبط (اختياري)</label>
                      <select name="userId" defaultValue={selectedTransaction?.userId || ''} style={formInput}>
                        <option value="">-- اختر الشريك --</option>
                        {project.participations?.map((p: any) => <option key={p.user.id} value={p.user.id}>{p.user.name}</option>)}
                      </select>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                   <div style={formGroup}>
                      <label style={formLabel}>المبلغ الإجمالي ($)</label>
                      <input name="amount" type="number" step="0.01" required defaultValue={selectedTransaction ? Math.abs(selectedTransaction.amount) : ''} style={formInput} placeholder="0.00" />
                   </div>
                   <div style={formGroup}>
                      <label style={formLabel}>المبلغ الرسمي للهيئة ($)</label>
                      <input name="officialAmount" type="number" step="0.01" defaultValue={selectedTransaction?.officialAmount || ''} style={formInput} placeholder="0.00" />
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                   <div style={formGroup}>
                      <label style={formLabel}>التاريخ</label>
                      <input name="date" type="date" required defaultValue={selectedTransaction?.date ? new Date(selectedTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} style={formInput} />
                   </div>
                   <div style={formGroup}>
                      <label style={formLabel}>سعر صرف الجنيه (EGP)</label>
                      <input name="egpRate" type="number" step="0.1" defaultValue={selectedTransaction?.egpRate || "50"} style={formInput} />
                   </div>
                </div>

                <div style={formGroup}>
                  <label style={formLabel}>البيان / الملاحظات</label>
                  <input name="purpose" required defaultValue={selectedTransaction?.purpose || ''} style={formInput} placeholder="مثال: القسط الأول - الحجز الرسمي" />
                </div>

                <div style={formGroup}>
                  <label style={formLabel}>سند الإيداع / المرفق</label>
                  <input name="attachment" type="file" style={{ ...formInput, padding: '0.6rem' }} />
                </div>

                <Button type="submit" disabled={submitting} style={{ height: '3.5rem', borderRadius: '14px', background: '#064e3b', color: 'white', fontWeight: 800, marginTop: '1rem' }}>
                   {submitting ? <Loader2 className="animate-spin" /> : (selectedTransaction ? 'تحديث البيانات' : 'حفظ العملية المالية')}
                </Button>
              </form>
            </Modal>
          )}

          {showTransferModal && (
            <Modal onClose={() => setShowTransferModal(false)} maxWidth="600px">
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '22px', background: '#064e3b10', color: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Activity size={32} />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>المناقلة الذكية للسيولة 🔄</h2>
                <p style={{ opacity: 0.6, fontSize: '1rem', marginTop: '0.5rem' }}>نقل الأرصدة والسيولة بين المشاريع بذكاء وتوزيع آلي.</p>
              </div>

              <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
                  <div style={formGroup}>
                    <label style={formLabel}>إلى مشروع (الوجهة)</label>
                    <select name="targetProjectId" required style={formInput}>
                      <option value="">-- اختر المشروع --</option>
                      {allProjects?.filter((p: any) => p.id !== id).map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={formGroup}>
                    <label style={formLabel}>المبلغ المراد تحويله ($)</label>
                    <input 
                      name="amount" 
                      type="number" 
                      step="0.01" 
                      required 
                      style={formInput} 
                      placeholder="0.00" 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        (window as any)._tempTransferAmount = val;
                        // Force a small re-render or update state if needed, but for now we can just show it
                      }}
                    />
                  </div>
                </div>

                <div style={formGroup}>
                  <label style={formLabel}>نوع المناقلة</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <label style={{ 
                      padding: '1.2rem', borderRadius: '16px', border: '2px solid #f1f5f9', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 700, transition: 'all 0.2s'
                    }} className="radio-card">
                      <input type="radio" name="transferType" value="LIQUIDITY_TRANSFER" defaultChecked />
                      <div>
                        <div style={{ fontSize: '0.95rem' }}>سيولة نقدية</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>نقل كاش فعلي</div>
                      </div>
                    </label>
                    <label style={{ 
                      padding: '1.2rem', borderRadius: '16px', border: '2px solid #f1f5f9', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 700, transition: 'all 0.2s'
                    }} className="radio-card">
                      <input type="radio" name="transferType" value="AUTHORITY_BALANCE" />
                      <div>
                        <div style={{ fontSize: '0.95rem' }}>رصيد هيئة</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>نقل دفتري بالهيئة</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Distribution Preview Section */}
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} /> معاينة التوزيع على الشركاء
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '150px', overflowY: 'auto' }}>
                    {project.participations?.map((p: any) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 700 }}>{p.user?.name}</span>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <span style={{ opacity: 0.5 }}>{p.percentage}%</span>
                          <span style={{ fontWeight: 900, color: '#064e3b' }}>
                            ${((p.percentage / 100) * ((window as any)._tempTransferAmount || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={formGroup}>
                  <label style={formLabel}>البيان / السبب</label>
                  <input name="purpose" required style={formInput} placeholder="مثال: تمويل بداية الإنشاءات..." />
                </div>

                <Button type="submit" disabled={submitting} style={{ height: '4rem', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 800, marginTop: '1rem', background: '#064e3b', color: 'white', boxShadow: '0 10px 25px rgba(6, 78, 59, 0.25)' }}>
                  {submitting ? <Loader2 className="animate-spin" /> : 'تأكيد عملية المناقلة'}
                </Button>
              </form>
              <style dangerouslySetInnerHTML={{ __html: `
                .radio-card:has(input:checked) { border-color: #064e3b !important; background: #064e3b05 !important; }
                .radio-card input { accent-color: #064e3b; width: 18px; height: 18px; }
              `}} />
            </Modal>
          )}
          {showAddTask && (
            <Modal onClose={() => { setShowAddTask(false); setTargetPhaseId(null); }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textAlign: 'center', marginBottom: '2rem' }}>إضافة مهمة جديدة</h2>
              <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={formGroup}>
                  <label style={formLabel}>عنوان المهمة</label>
                  <input name="title" required autoFocus style={formInput} placeholder="مثال: تقديم طلب الحجز" />
                </div>
                <Button type="submit" disabled={submitting} style={{ height: '3.5rem', borderRadius: '14px', background: '#064e3b', color: 'white', fontWeight: 800 }}>
                   {submitting ? <Loader2 className="animate-spin" /> : 'إضافة المهمة'}
                </Button>
              </form>
            </Modal>
          )}
        </AnimatePresence>

      </motion.main>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

function Modal({ children, onClose, maxWidth = '550px' }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={modalOverlay}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{ ...modalCard, maxWidth }}
      >
        <button onClick={onClose} style={closeButton}><X size={20} /></button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.8rem',
        padding: '1rem 0.5rem',
        borderRadius: '16px',
        border: 'none',
        background: active ? '#064e3b' : 'transparent',
        color: active ? 'white' : '#64748b',
        fontWeight: 800,
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}
    >
      {active && (
        <motion.div 
          layoutId="tab-pill"
          style={{ position: 'absolute', inset: 0, background: '#064e3b', borderRadius: '16px', zIndex: -1 }} 
        />
      )}
      {icon} {label}
    </button>
  );
}

function CompactStat({ title, value, icon, color }: any) {
  return (
    <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
        <motion.div 
          whileHover={{ rotate: 15 }}
          style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {icon}
        </motion.div>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>{title}</span>
      </div>
      <div dir="ltr" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', textAlign: 'right' }}>{value}</div>
    </Card>
  );
}

// ─── Tabs Sections ──────────────────────────────────────────────────────────

function OverviewTab({ project, progress }: any) {
  const remaining = Math.max(0, (project.totalValue || 0) - (project.totalPaid || 0));
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }}>
        <Card style={{ padding: '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>البيانات الفنية</h3>
            <div style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', fontWeight: 800, color: '#064e3b', fontSize: '0.9rem' }}>
              كود الحجز: {project.reservationCode || "-"}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            <DataField label="المرحلة / الإصدار" value={project.phaseNumber || "-"} />
            <DataField label="الحي / المنطقة" value={project.neighborhood || "-"} />
            <DataField label="مساحة الأرض" value={project.plotArea ? `${project.plotArea} م²` : "-"} />
            <DataField label="سعر المتر" value={project.pricePerMeter ? `$${project.pricePerMeter}` : "-"} />
            <DataField label="حساب الحجز" value={project.bookingAccount || "-"} />
            <DataField label="نوع الحجز" value={project.reservationType === 'OFFICIAL' ? 'رسمي 🏛️' : 'مبدئي 📝'} />
          </div>
        </Card>
        
        <Card style={{ padding: '2.5rem', borderRadius: '32px', background: 'linear-gradient(135deg, #064e3b, #043927)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.1, scale: 1 }}
            style={{ position: 'absolute', top: '-20px', left: '-20px' }}
          >
            <TrendingUp size={200} />
          </motion.div>
          
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>الحالة المالية</h3>
               <Badge style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{Math.round(progress)}% مكتمل</Badge>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.2rem', borderRadius: '20px' }}>
                <p style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.3rem' }}>إجمالي القيمة بالدولار</p>
                <p dir="ltr" style={{ fontSize: '1.8rem', fontWeight: 900, textAlign: 'right' }}>${(project.totalValue || 0).toLocaleString()}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.2rem', borderRadius: '20px' }}>
                <p style={{ opacity: 0.6, fontSize: '0.8rem', marginBottom: '0.3rem' }}>المتبقي للهيئة</p>
                <p dir="ltr" style={{ fontSize: '1.8rem', fontWeight: 900, textAlign: 'right', color: '#fbbf24' }}>${remaining.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', position: 'relative' }}>
             <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  style={{ height: '100%', background: '#10b981' }} 
                />
             </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <MiniInsightCard title="الأقساط المتبقية" value={project.installmentsCount || "0"} icon={<Calendar size={20} />} />
        <MiniInsightCard title="سعر الصرف المعتمد" value={`${project.exchangeRate || 3.75} SAR`} icon={<DollarSign size={20} />} />
        <MiniInsightCard title="إجمالي المساهمات" value={`$${(project.totalPaid || 0).toLocaleString()}`} icon={<Users size={20} />} />
      </div>
    </div>
  );
}

function MiniInsightCard({ title, value, icon }: any) {
  return (
    <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#064e3b10', color: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{title}</p>
        <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>{value}</p>
      </div>
    </Card>
  );
}

function PartnersTab({ project, onAdd, onDelete }: any) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'MEMBER';
  const isAdmin = role.toUpperCase() === 'ADMIN' || (session?.user?.name || '').includes('مدير');

  return (
    <Card style={{ padding: '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>سجل حصص الشركاء</h3>
        {isAdmin && <Button onClick={onAdd} style={{ borderRadius: '12px', background: '#064e3b', color: 'white' }}>إضافة شريك جديد</Button>}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {project.participations?.map((p: any, idx: number) => {
          const amount = Math.abs(p.shareAmount || 0);
          const percentage = p.percentage || (project.totalValue > 0 ? (amount / project.totalValue * 100).toFixed(1) : 0);
          
          return (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -5, borderColor: '#064e3b' }}
            style={{ 
              padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#f8fafc',
              display: 'flex', alignItems: 'center', gap: '1.2rem', transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#064e3b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900 }}>
              {p.user?.name?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{p.user?.name}</h4>
              <p dir="ltr" style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>${amount.toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '0.5rem' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#064e3b' }}>{percentage}%</div>
              {isAdmin && (
                <button onClick={() => onDelete(p.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </motion.div>
        )})}
      </div>
    </Card>
  );
}

function TimelineTab({ project, onInit, onAddTask, onToggleTask, onDeleteTask, onUpdatePhaseStatus, submitting }: any) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user?.name || '').includes('مدير');
  const phases = project?.phases || [];

  if (phases.length === 0) {
    return (
      <Card style={{ padding: '4rem', borderRadius: '32px', border: '1px solid #e2e8f0', background: 'white', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#064e3b10', color: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <Activity size={40} />
        </div>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>تهيئة المسار الزمني</h3>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
          لم يتم تحديد مراحل لهذا المشروع بعد. يمكنك البدء بتهيئة المراحل الافتراضية (البدء، التقديم، التخصيص، الاستلام) لمتابعة سير العمل.
        </p>
        {isAdmin && (
          <Button onClick={onInit} disabled={submitting} style={{ height: '3.5rem', padding: '0 2.5rem', borderRadius: '16px', background: '#064e3b', color: 'white', fontWeight: 800 }}>
            {submitting ? <Loader2 className="animate-spin" /> : 'بدء تهيئة المسار الزمني ✅'}
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {phases.map((phase: any, idx: number) => (
          <Card key={phase.id} style={{ padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column', height: '100%', borderTop: phase.status === 'ACTIVE' ? '4px solid #10b981' : '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: phase.status === 'COMPLETED' ? '#10b981' : (phase.status === 'ACTIVE' ? '#064e3b' : '#064e3b10'), color: (phase.status === 'COMPLETED' || phase.status === 'ACTIVE') ? 'white' : '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' }}>
                  {idx + 1}
                </div>
                <h4 style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>{phase.name}</h4>
              </div>
              
              {isAdmin ? (
                <select 
                  value={phase.status} 
                  onChange={(e) => onUpdatePhaseStatus(phase.id, e.target.value)}
                  style={{ 
                    padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', 
                    fontSize: '0.8rem', fontWeight: 800, color: getPhaseColor(phase.status),
                    background: getPhaseColor(phase.status) + '10', cursor: 'pointer'
                  }}
                >
                  <option value="PENDING">معلق</option>
                  <option value="ACTIVE">جاري حالياً</option>
                  <option value="COMPLETED">مكتمل</option>
                </select>
              ) : (
                <Badge style={{ background: getPhaseColor(phase.status) + '15', color: getPhaseColor(phase.status), border: 'none', fontWeight: 800 }}>
                  {getPhaseLabel(phase.status)}
                </Badge>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {phase.tasks?.map((task: any) => (
                <motion.div 
                  key={task.id}
                  whileHover={{ x: -5 }}
                  style={{ 
                    padding: '1rem', borderRadius: '16px', background: '#f8fafc', 
                    border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.8rem' 
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={task.isCompleted} 
                    onChange={(e) => onToggleTask(task.id, e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#064e3b' }}
                  />
                  <span style={{ 
                    flex: 1, fontWeight: 700, fontSize: '0.95rem', 
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    opacity: task.isCompleted ? 0.5 : 1
                  }}>
                    {task.title}
                  </span>
                  {isAdmin && (
                    <button onClick={() => onDeleteTask(task.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0.2rem', opacity: 0.3 }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
              {(!phase.tasks || phase.tasks.length === 0) && (
                <p style={{ textAlign: 'center', opacity: 0.3, fontSize: '0.85rem', padding: '1rem' }}>لا توجد مهام حالياً</p>
              )}
            </div>

            {isAdmin && (
              <Button 
                onClick={() => onAddTask(phase.id)} 
                variant="outline" 
                style={{ marginTop: '1.5rem', borderRadius: '12px', height: '3rem', borderStyle: 'dashed', borderColor: '#cbd5e1', fontWeight: 700, gap: '0.5rem', color: '#64748b' }}
              >
                <Plus size={16} /> إضافة مهمة
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function FinancesTab({ project, onAdd, onTransfer, onEdit, onDelete }: any) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user?.name || '').includes('مدير');

  return (
    <Card style={{ padding: '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>سجل المعاملات المالية</h3>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button onClick={onTransfer} variant="outline" style={{ borderRadius: '14px', gap: '0.5rem', fontWeight: 700 }}>
              <Activity size={18} /> مناقلة سيولة
            </Button>
            <Button onClick={onAdd} style={{ borderRadius: '14px', background: '#064e3b', color: 'white', gap: '0.5rem' }}>
              <Plus size={18} /> إضافة عملية
            </Button>
          </div>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem' }}>
          <thead>
            <tr style={{ textAlign: 'right', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 800 }}>
              <th style={{ padding: '1rem' }}>التاريخ</th>
              <th style={{ padding: '1rem' }}>المساهم / الشريك</th>
              <th style={{ padding: '1rem' }}>البيان</th>
              <th style={{ padding: '1rem' }}>المبلغ ($)</th>
              <th style={{ padding: '1rem' }}>رسمي (هيئة)</th>
              <th style={{ padding: '1rem' }}>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {project.transactions?.map((t: any) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  key={t.id} 
                  style={{ background: '#f8fafc', borderRadius: '16px' }}
                >
                  <td style={{ padding: '1.2rem', fontWeight: 700, borderRadius: '0 16px 16px 0' }}>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                  <td style={{ padding: '1.2rem' }}>
                     <div style={{ fontWeight: 800 }}>{t.user?.name}</div>
                     <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{t.type}</div>
                  </td>
                  <td style={{ padding: '1.2rem', fontWeight: 600 }}>{t.purpose}</td>
                  <td dir="ltr" style={{ padding: '1.2rem', fontWeight: 900, color: t.amount < 0 ? '#ef4444' : '#064e3b', textAlign: 'right' }}>
                    {t.amount < 0 ? '-' : ''}${Math.abs(t.amount || 0).toLocaleString()}
                  </td>
                  <td dir="ltr" style={{ padding: '1.2rem', fontWeight: 800, textAlign: 'right' }}>${Math.abs(t.officialAmount || 0).toLocaleString()}</td>
                  <td style={{ padding: '1.2rem', borderRadius: '16px 0 0 16px' }}>
                     <div style={{ display: 'flex', gap: '0.5rem' }}>
                       {t.attachmentUrl && (
                         <a href={t.attachmentUrl} target="_blank" rel="noopener noreferrer">
                           <Button variant="outline" style={{ color: '#64748b', padding: '0.4rem 0.6rem' }}><ExternalLink size={16} /></Button>
                         </a>
                       )}
                       {isAdmin && (
                         <>
                           <Button onClick={() => onEdit(t)} variant="outline" style={{ color: '#3b82f6', padding: '0.4rem 0.6rem' }}><Edit3 size={16} /></Button>
                           <Button onClick={() => onDelete(t.id)} variant="outline" style={{ color: '#ef4444', padding: '0.4rem 0.6rem', borderColor: '#fee2e2' }}><Trash2 size={16} /></Button>
                         </>
                       )}
                     </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DocumentsTab({ project }: any) {
  return (
    <Card style={{ padding: '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0', background: 'white' }}>
      <DocumentExplorer projectId={project.id} />
    </Card>
  );
}

function SettingsTab({ project, onSubmit, onDelete, submitting }: any) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user?.name || '').includes('مدير');

  if (!isAdmin) return <Card style={{ padding: '2rem', textAlign: 'center' }}>عذراً، هذه الصفحة متاحة للمدراء فقط.</Card>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <Card style={{ padding: '2.5rem', borderRadius: '32px', border: '1px solid #e2e8f0', background: 'white' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '2rem' }}>تعديل بيانات الحجز</h3>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div style={formGroup}>
              <label style={formLabel}>اسم الحجز</label>
              <input name="name" defaultValue={project.name} style={inputStyle} required />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>موقع الحجز</label>
              <input name="location" defaultValue={project.location} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>الوصف</label>
              <input name="description" defaultValue={project.description} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>الحي / المنطقة</label>
              <input name="neighborhood" defaultValue={project.neighborhood} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>المرحلة</label>
              <input name="phaseNumber" defaultValue={project.phaseNumber} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>إجمالي القيمة ($)</label>
              <input name="totalValue" type="number" defaultValue={project.totalValue} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>رسوم الحجز ($)</label>
              <input name="reservationFee" type="number" defaultValue={project.reservationFee} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>قيمة القسط ($)</label>
              <input name="installmentValue" type="number" defaultValue={project.installmentValue} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>عدد الأقساط</label>
              <input name="installmentsCount" type="number" defaultValue={project.installmentsCount} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>مساحة الأرض (م²)</label>
              <input name="plotArea" type="number" defaultValue={project.plotArea} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>سعر المتر ($)</label>
              <input name="pricePerMeter" type="number" step="0.1" defaultValue={project.pricePerMeter} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>رقم الحجز</label>
              <input name="reservationCode" defaultValue={project.reservationCode} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>تاريخ البدء</label>
              <input name="startDate" type="date" defaultValue={project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : ''} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>نوع الحجز</label>
              <select name="reservationType" defaultValue={project.reservationType} style={inputStyle}>
                <option value="INITIAL">حجز مبدئي</option>
                <option value="OFFICIAL">حجز رسمي</option>
              </select>
            </div>
            <div style={formGroup}>
              <label style={formLabel}>حساب الحجز</label>
              <input name="bookingAccount" defaultValue={project.bookingAccount} style={inputStyle} placeholder="مثال: حساب 1 أو حساب 2" />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>سعر الصرف المعتمد (SAR)</label>
              <input name="exchangeRate" type="number" step="0.01" defaultValue={project.exchangeRate || 3.75} style={inputStyle} />
            </div>
            <div style={formGroup}>
              <label style={formLabel}>حالة الحجز</label>
              <select name="status" defaultValue={project.status} style={inputStyle}>
                <option value="UNDER_STUDY">تحت الدراسة</option>
                <option value="SUBMITTED">تم التقديم</option>
                <option value="ALLOCATED">تم التخصيص</option>
                <option value="IN_PROGRESS">قيد التنفيذ</option>
                <option value="COMPLETED">مكتمل</option>
              </select>
            </div>
          </div>
          <Button type="submit" disabled={submitting} style={{ height: '3.5rem', borderRadius: '14px', background: '#064e3b', color: 'white', marginTop: '1rem', fontWeight: 800 }}>
            {submitting ? <Loader2 className="animate-spin" /> : 'حفظ كافة التغييرات'}
          </Button>
        </form>
      </Card>
      
      <Card style={{ padding: '2.5rem', borderRadius: '32px', border: '2px solid #fee2e2', background: 'white' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#dc2626', marginBottom: '1rem' }}>منطقة الخطر</h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>حذف هذا الحجز سيؤدي إلى مسح كافة المعاملات والمستندات المرتبطة به نهائياً.</p>
        <Button onClick={onDelete} variant="outline" disabled={submitting} style={{ width: '100%', color: '#dc2626', borderColor: '#fee2e2', height: '3.2rem', borderRadius: '12px', background: 'white', fontWeight: 800 }}>
          <Trash2 size={18} /> {submitting ? 'جاري الحذف...' : 'حذف الحجز نهائياً'}
        </Button>
      </Card>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function DataField({ label, value }: any) {
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.3rem' }}>{label}</p>
      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{value}</p>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '1rem',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '1rem',
  fontWeight: 600,
  outline: 'none'
};

const modalOverlay: any = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(15px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 99999
};

const modalCard: any = {
  width: '95%',
  padding: '3rem',
  borderRadius: '40px',
  background: 'white',
  position: 'relative',
  boxShadow: '0 50px 100px rgba(0,0,0,0.4)',
};

const closeButton: any = {
  position: 'absolute',
  top: '1.5rem',
  left: '1.5rem',
  background: '#f1f5f9',
  border: 'none',
  borderRadius: '50%',
  width: '35px',
  height: '35px',
  cursor: 'pointer'
};

const formGroup = { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' };
const formLabel = { fontWeight: 800, fontSize: '0.9rem', color: '#64748b' };
const formInput = { width: '100%', boxSizing: 'border-box' as const, padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 600, outline: 'none' };

function getStatusLabel(status: string) {
  const labels: any = { 'UNDER_STUDY': 'تحت الدراسة', 'SUBMITTED': 'تم التقديم', 'ALLOCATED': 'تم التخصيص', 'IN_PROGRESS': 'قيد التنفيذ', 'COMPLETED': 'مكتمل' };
  return labels[status] || status;
}

function getStatusColor(status: string) {
  const colors: any = { 'UNDER_STUDY': '#94a3b8', 'SUBMITTED': '#3b82f6', 'ALLOCATED': '#f59e0b', 'IN_PROGRESS': '#10b981', 'COMPLETED': '#059669' };
  return colors[status] || '#64748b';
}

function getPhaseLabel(status: string) {
  const labels: any = { 'PENDING': 'معلق', 'ACTIVE': 'جاري حالياً', 'COMPLETED': 'مكتمل' };
  return labels[status] || status;
}

function getPhaseColor(status: string) {
  const colors: any = { 'PENDING': '#94a3b8', 'ACTIVE': '#10b981', 'COMPLETED': '#059669' };
  return colors[status] || '#64748b';
}

