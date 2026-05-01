'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  Printer, ChevronLeft, Loader2, Plus, 
  Trash2, Edit3, Save, X, UserPlus, 
  Building2, Users, Search, Filter,
  LogOut, LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ManageReservations() {
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sarRate = 3.75;
  const role = (session?.user as any)?.role || 'MEMBER';
  const isAdmin = role.toUpperCase() === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partsRes, usersRes, projectsRes] = await Promise.all([
        fetch('/api/participations'),
        fetch('/api/members'),
        fetch('/api/projects')
      ]);

      const parts = await partsRes.json();
      const usrs = await usersRes.json();
      const projs = await projectsRes.json();

      if (Array.isArray(parts)) setData(parts);
      if (Array.isArray(usrs)) setUsers(usrs);
      if (Array.isArray(projs)) setProjects(projs);
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body = {
      userId: formData.get('userId'),
      projectId: formData.get('projectId'),
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
        setShowAddModal(false);
        fetchData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الحجز؟')) return;
    
    try {
      const res = await fetch(`/api/participations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(data.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({
      percentage: p.percentage || 0,
      shareAmount: p.shareAmount || 0
    });
  };

  const saveEdit = async (p: any) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/participations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: p.userId,
          projectId: p.projectId,
          ...editForm
        })
      });
      if (res.ok) {
        setEditingId(null);
        fetchData();
        alert('تم تحديث بيانات الشريك بنجاح ✅');
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

  const filteredData = data.filter(p => 
    p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}><Loader2 className="animate-spin" size={48} color="#064e3b" /></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl', fontFamily: 'var(--font-outfit)' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '2.5rem 4rem', transition: 'all 0.3s' }}>
        {/* Header */}
        <header style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#064e3b', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
               <LayoutDashboard size={18} /> إدارة الشراكات والحجوزات
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-1px' }}>سجل الشركاء</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>إدارة حصص الأعضاء وتوزيع الحجوزات العقارية</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {isAdmin && (
              <Button onClick={() => setShowAddModal(true)} style={{ height: '3.8rem', padding: '0 2.5rem', borderRadius: '18px', background: '#064e3b', color: 'white', fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 12px 24px rgba(6, 78, 59, 0.2)', border: 'none' }}>
                <Plus size={22} style={{ marginLeft: '0.5rem' }} /> إضافة شريك لحجز
              </Button>
            )}
            <Link href="/dashboard/reports/reservations">
              <Button variant="secondary" style={{ height: '3.8rem', padding: '0 2rem', borderRadius: '18px', fontWeight: 800 }}>
                 <Printer size={20} style={{ marginLeft: '0.5rem' }} /> عرض كتقرير للطباعة
              </Button>
            </Link>
          </div>
        </header>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
           <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="البحث باسم الشريك أو المشروع..." 
                style={{ width: '100%', padding: '1.2rem 3.5rem 1.2rem 1.5rem', borderRadius: '22px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1.1rem', fontWeight: 600, outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
              />
           </div>
        </div>

        {/* Content Table */}
        <Card style={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1.5rem', fontWeight: 900, color: '#475569' }}>الشريك / العضو</th>
                <th style={{ padding: '1.5rem', fontWeight: 900, color: '#475569' }}>المشروع المحجوز</th>
                <th style={{ padding: '1.5rem', fontWeight: 900, color: '#475569', textAlign: 'center' }}>النسبة (%)</th>
                <th style={{ padding: '1.5rem', fontWeight: 900, color: '#475569', textAlign: 'center' }}>المبلغ التعاقدي ($)</th>
                {isAdmin && <th style={{ padding: '1.5rem', fontWeight: 900, color: '#475569', textAlign: 'center' }}>الإجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }} className="row-hover">
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#064e3b10', color: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem' }}>
                          {p.user?.name?.charAt(0)}
                       </div>
                       <div>
                          <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{p.user?.name}</div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.5 }}>{p.user?.email}</div>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ fontWeight: 700, color: '#1e40af' }}>{p.project?.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{p.project?.location}</div>
                  </td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                    {editingId === p.id ? (
                      <input 
                        type="number" 
                        value={editForm.percentage} 
                        onChange={e => setEditForm({ ...editForm, percentage: e.target.value })}
                        style={{ ...inlineInput, width: '80px', textAlign: 'center' }} 
                      />
                    ) : (
                      <div style={{ fontWeight: 900, color: '#064e3b', fontSize: '1.2rem' }}>{(p.percentage || 0).toFixed(1)}%</div>
                    )}
                  </td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                    {editingId === p.id ? (
                      <input 
                        type="number" 
                        value={editForm.shareAmount} 
                        onChange={e => setEditForm({ ...editForm, shareAmount: e.target.value })}
                        style={{ ...inlineInput, width: '120px', textAlign: 'center' }} 
                      />
                    ) : (
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>${(p.shareAmount || 0).toLocaleString()}</div>
                    )}
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {editingId === p.id ? (
                          <>
                            <Button onClick={() => saveEdit(p)} disabled={submitting} style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px' }}>
                              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />}
                            </Button>
                            <Button onClick={() => setEditingId(null)} variant="outline" style={{ padding: '0.5rem 1rem', borderRadius: '10px' }}>
                              <X size={18} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={() => startEdit(p)} variant="outline" style={{ padding: '0.5rem 1rem', borderRadius: '10px', color: '#3b82f6' }}>
                              <Edit3 size={18} />
                            </Button>
                            <Button onClick={() => handleDelete(p.id)} variant="outline" style={{ padding: '0.5rem 1rem', borderRadius: '10px', color: '#ef4444' }}>
                              <Trash2 size={18} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '5rem', textAlign: 'center', opacity: 0.4 }}>
                    <Users size={64} style={{ marginBottom: '1rem', display: 'block', margin: '0 auto' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>لا توجد شراكات مسجلة حالياً</h3>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div style={modalOverlay}>
          <Card style={modalCard}>
            <button onClick={() => setShowAddModal(false)} style={closeButton}><X size={20} /></button>
            <h2 style={{ fontSize: '2rem', fontWeight: 950, textAlign: 'center', marginBottom: '2rem' }}>إضافة شريك جديد لحجز</h2>
            
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={formGroup}>
                <label style={formLabel}>اختر الشريك (العضو)</label>
                <select name="userId" required style={formInput}>
                  <option value="">-- اختر العضو --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>

              <div style={formGroup}>
                <label style={formLabel}>اختر الحجز (المشروع / القطعة)</label>
                <select name="projectId" required style={formInput}>
                  <option value="">-- اختر المشروع --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name} - {p.location}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={formGroup}>
                  <label style={formLabel}>النسبة المئوية (%)</label>
                  <input name="percentage" type="number" step="0.1" placeholder="مثال: 50" style={formInput} />
                </div>
                <div style={formGroup}>
                  <label style={formLabel}>المبلغ التعاقدي ($)</label>
                  <input name="shareAmount" type="number" placeholder="القيمة المحددة للشريك" style={formInput} />
                </div>
              </div>

              <Button type="submit" disabled={submitting} style={{ height: '4rem', borderRadius: '18px', fontSize: '1.2rem', fontWeight: 900, background: '#064e3b', color: 'white', border: 'none', marginTop: '1rem' }}>
                {submitting ? <Loader2 size={24} className="animate-spin" /> : 'تأكيد الحجز وتوزيع الحصص'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
        :root { --font-outfit: 'Outfit', sans-serif; }
        .row-hover:hover { background: #f8fafc !important; transform: scale(1.002); }
      `}</style>
    </div>
  );
}

const inlineInput = {
  padding: '0.4rem 0.8rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  background: 'white',
  fontWeight: 800,
  fontSize: '1rem',
  outline: 'none'
};

const modalOverlay: any = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(6, 78, 59, 0.4)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1.5rem'
};

const modalCard: any = {
  width: '100%',
  maxWidth: '650px',
  padding: '3rem',
  borderRadius: '40px',
  border: 'none',
  boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
  background: 'white',
  position: 'relative'
};

const closeButton: any = {
  position: 'absolute',
  top: '2rem',
  left: '2rem',
  background: '#f1f5f9',
  border: 'none',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const formGroup = { display: 'flex', flexDirection: 'column', gap: '0.6rem' };
const formLabel = { fontWeight: 800, fontSize: '0.95rem', color: '#475569' };
const formInput = { padding: '1.2rem', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1.1rem', outline: 'none', fontWeight: 700 };
