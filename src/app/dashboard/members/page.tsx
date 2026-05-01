'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  Users, Shield, User, Loader2, Plus, X, Trash2, 
  ChevronLeft, FileText, Landmark, Search, Mail, 
  UserCheck, ShieldCheck, MoreHorizontal, UserMinus 
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';

export default function MembersPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'MEMBER';
  const isAdmin = role === 'ADMIN' || (session?.user?.name || '').includes('مدير');
  const isViewer = role === 'VIEWER';

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = () => {
    setLoading(true);
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMembers(data);
        else setMembers([]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMembers([]);
        setLoading(false);
      });
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      password: 'password123'
    };

    const res = await fetch('/api/members', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      setShowModal(false);
      fetchMembers();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذا العضو؟ سيتم مسح بياناته وصلاحياته نهائياً.')) return;
    
    const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchMembers();
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && members.length === 0) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 className="animate-spin" size={40} color="#064e3b" />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem 3rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* Modern Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <div onClick={() => window.history.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700, marginBottom: '0.8rem' }}>
              <ChevronLeft size={16} /> العودة للوحة التحكم
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>إدارة الشركاء والمساهمين 👥</h1>
            <p style={{ opacity: 0.6, fontSize: '1.1rem', fontWeight: 600 }}>إدارة كاملة لصلاحيات وحسابات أعضاء مشروع بيت الوطن.</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setShowModal(true)} 
              style={{ height: '3.5rem', borderRadius: '16px', background: '#064e3b', color: 'white', padding: '0 2rem', fontWeight: 800, gap: '0.5rem', boxShadow: '0 10px 20px rgba(6, 78, 59, 0.15)' }}
            >
              <Plus size={20} /> إضافة شريك جديد
            </Button>
          )}
        </header>

        {/* Stats & Search Bar */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
            <input 
              type="text" 
              placeholder="البحث بالاسم أو البريد الإلكتروني..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '1rem 3.5rem 1rem 1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0',
                background: 'white', fontSize: '1rem', fontWeight: 600, outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }} 
            />
          </div>
          <Card style={{ padding: '0.8rem 1.5rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '1rem', background: 'white' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>إجمالي الأعضاء</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#064e3b' }}>{members.length}</span>
          </Card>
        </div>

        {/* Members Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {filteredMembers.map((member, idx) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/dashboard/members/${member.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Card style={{ 
                    padding: '1.8rem', borderRadius: '28px', border: '1px solid #e2e8f0', background: 'white',
                    position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'pointer'
                  }} className="member-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                      <div style={{ 
                        width: '64px', height: '64px', borderRadius: '20px', 
                        background: member.role === 'ADMIN' ? '#fee2e2' : '#f0fdf4', 
                        color: member.role === 'ADMIN' ? '#ef4444' : '#10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {member.role === 'ADMIN' ? <ShieldCheck size={32} /> : <UserCheck size={32} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>{member.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                          <Mail size={14} /> {member.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.2rem', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ 
                         fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '10px', 
                         background: member.role === 'ADMIN' ? '#ef444415' : member.role === 'VIEWER' ? '#3b82f615' : '#f1f5f9',
                         color: member.role === 'ADMIN' ? '#ef4444' : member.role === 'VIEWER' ? '#3b82f6' : '#64748b',
                         fontWeight: 800, letterSpacing: '0.02em'
                      }}>
                         {member.role === 'ADMIN' ? 'مدير نظام' : member.role === 'VIEWER' ? 'مراقب' : 'شريك مساهم'}
                      </span>
                      
                      {isAdmin && member.id !== (session?.user as any)?.id && (
                        <button 
                          onClick={(e) => handleDelete(member.id, e)}
                          style={{ 
                            width: '36px', height: '36px', borderRadius: '10px', border: 'none', 
                            background: '#fff1f2', color: '#ef4444', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                          }}
                          className="delete-btn"
                        >
                          <UserMinus size={18} />
                        </button>
                      )}
                    </div>

                    <style dangerouslySetInnerHTML={{ __html: `
                      .member-card:hover { transform: translateY(-5px); border-color: #064e3b44; boxShadow: 0 20px 40px rgba(0,0,0,0.06); }
                      .delete-btn:hover { background: #ef4444; color: white; }
                    `}} />
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Premium Modal */}
        <AnimatePresence>
          {showModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500, padding: '1rem' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{ background: 'white', padding: '2.5rem', borderRadius: '40px', width: '100%', maxWidth: '550px', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 50px 100px rgba(0,0,0,0.2)', position: 'relative' }}
              >
                <button 
                  onClick={() => setShowModal(false)} 
                  style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '45px', height: '45px', borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }}
                  className="close-btn-hover"
                >
                  <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#064e3b10', color: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Users size={36} />
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>إضافة عضو جديد 👤</h2>
                  <p style={{ opacity: 0.5, fontWeight: 700 }}>قم بتعبئة بيانات العضو لمنحه حق الوصول للنظام.</p>
                </div>

                <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={formGroup}>
                     <label style={formLabel}>الاسم الكامل</label>
                     <input name="name" required style={formInput} placeholder="مثلاً: محمد أحمد علي" />
                  </div>
                  <div style={formGroup}>
                     <label style={formLabel}>البريد الإلكتروني</label>
                     <input name="email" type="email" required style={formInput} placeholder="email@bait-alwatan.com" />
                  </div>
                  <div style={formGroup}>
                     <label style={formLabel}>صلاحيات الوصول</label>
                     <select name="role" required style={formInput}>
                        <option value="MEMBER">شريك مساهم (صلاحيات محدودة)</option>
                        <option value="VIEWER">مراقب نظام (عرض فقط)</option>
                        <option value="ADMIN">مدير نظام (تحكم كامل)</option>
                     </select>
                  </div>
                  <div style={{ background: '#fffbeb', padding: '1.2rem', borderRadius: '18px', border: '1px solid #fef3c7', fontSize: '0.9rem', color: '#92400e', fontWeight: 700, textAlign: 'center' }}>
                     ملاحظة: سيتم تعيين "password123" ككلمة مرور افتراضية.
                  </div>
                  <Button type="submit" disabled={submitting} style={{ height: '4.5rem', borderRadius: '22px', background: '#064e3b', color: 'white', fontWeight: 900, fontSize: '1.2rem', marginTop: '1rem', boxShadow: '0 10px 25px rgba(6, 78, 59, 0.2)' }}>
                     {submitting ? <Loader2 className="animate-spin" /> : 'تأكيد إنشاء الحساب'}
                  </Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <style dangerouslySetInnerHTML={{ __html: `
          .close-btn-hover:hover { background: #fee2e2 !important; color: #ef4444 !important; transform: rotate(90deg); }
        `}} />
      </main>
    </div>
  );
}

// Styles
const formGroup = { display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' };
const formLabel = { fontSize: '0.95rem', fontWeight: 800, color: '#475569' };
const formInput = { 
  padding: '1.1rem 1.4rem', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: '1rem', fontWeight: 600, outline: 'none', transition: 'all 0.2s'
};
