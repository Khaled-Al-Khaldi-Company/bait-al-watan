'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Users, Shield, User, Loader2, Plus, X, Trash2, ChevronLeft, FileText, Landmark, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';

export default function MembersPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'MEMBER';
  const isAdmin = role === 'ADMIN';
  const isViewer = role === 'VIEWER';

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = () => {
    setLoading(true);
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMembers(data);
        } else {
          console.error('Invalid members data:', data);
          setMembers([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
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
      password: 'password123' // Default password
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
    if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) return;
    
    const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchMembers();
  };

  if (loading && members.length === 0) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;

  return (

    <div 
      style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl' }}
    >
      <Sidebar />
      <main className="main-content-layout" style={{ flex: 1, padding: '2.5rem' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div onClick={() => window.history.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.75rem' }}>
              العودة للصفحة السابقة <ChevronLeft size={14} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>إدارة أعضاء المجموعة</h1>
            <p style={{ opacity: 0.7 }}>إضافة، تعديل، ومراقبة حسابات الشركاء المساهمين.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {isAdmin && (
              <Button onClick={() => setShowModal(true)} style={{ height: '3.5rem', padding: '0 2rem' }}>
                <Plus size={18} /> إضافة عضو جديد
              </Button>
            )}
          </div>
        </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {Array.isArray(members) && members.map((member) => (
          <Link href={`/dashboard/members/${member.id}`} key={member.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }} className="project-item-hover">
              {!isViewer && (
                <button 
                  onClick={(e) => handleDelete(member.id, e)}
                  style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.4 }}
                >
                  <Trash2 size={16} />
                </button>
              )}
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '50%', 
                background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {member.role === 'ADMIN' ? <Shield size={30} /> : <User size={30} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{member.name}</h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.4rem' }}>{member.email}</p>
                <span style={{ 
                   fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', 
                   background: member.role === 'ADMIN' ? '#fee2e2' : member.role === 'VIEWER' ? '#e0f2fe' : '#f1f5f9',
                   color: member.role === 'ADMIN' ? '#991b1b' : member.role === 'VIEWER' ? '#0369a1' : '#475569',
                   fontWeight: 700
                }}>
                   {member.role === 'ADMIN' ? 'مدير (Admin)' : member.role === 'VIEWER' ? 'مراقب (Viewer)' : 'عضو (Member)'}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <Card style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
             <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
             <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>إضافة عضو جديد</h2>
             <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <label style={{ fontWeight: 600 }}>الاسم الكامل</label>
                   <input name="name" required style={inputStyle} placeholder="الاسم الرباعي للشريك" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <label style={{ fontWeight: 600 }}>البريد الإلكتروني</label>
                   <input name="email" type="email" required style={inputStyle} placeholder="email@example.com" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <label style={{ fontWeight: 600 }}>الدور الصلاحية</label>
                   <select name="role" required style={inputStyle}>
                      <option value="MEMBER">عضو مساهم (Member)</option>
                      <option value="VIEWER">مراقب نظام (Viewer - Read Only)</option>
                      <option value="ADMIN">مدير نظام (Admin - Full Access)</option>
                   </select>
                </div>
                <p style={{ fontSize: '0.8rem', opacity: 0.6, textAlign: 'center' }}>سيتم تعيين كلمة مرور افتراضية (password123) يمكن للعضو تغييرها لاحقاً.</p>
                <Button type="submit" disabled={submitting}>
                   {submitting ? <Loader2 className="animate-spin" /> : 'إنشاء الحساب'}
                </Button>
             </form>
          </Card>
        </div>
      )}
      </main>
    </div>
  );
}

const inputStyle = {
  padding: '0.85rem',
  borderRadius: 'var(--radius)',
  border: '1px solid hsl(var(--border))',
  background: 'white',
  fontSize: '1rem'
};
