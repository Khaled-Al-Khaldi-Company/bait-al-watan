'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  ExternalLink, Plus, Trash2, Edit3, Link2, 
  MessageCircle, Globe, Shield, Info, Loader2, X 
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';

export default function ResourcesPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN' || (session?.user?.name || '').includes('مدير');
  
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = () => {
    setLoading(true);
    setError(null);
    fetch('/api/resources')
      .then(res => {
        if (!res.ok) throw new Error('فشل جلب البيانات');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setResources(data);
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());
    if (editingResource) (body as any).id = editingResource.id;

    try {
      const res = await fetch('/api/resources', {
        method: editingResource ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingResource(null);
        fetchResources();
        alert('تم حفظ الرابط بنجاح ✅');
      } else {
        const errData = await res.json();
        alert(`فشل الحفظ: ${errData.error || 'حدث خطأ في الخادم'}`);
      }
    } catch (err: any) {
      alert(`خطأ في الاتصال: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرابط؟')) return;
    try {
      const res = await fetch(`/api/resources?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = {
    'AUTHORITY': { label: 'روابط الهيئة الحكومية', icon: <Shield size={20} />, color: '#064e3b' },
    'WHATSAPP': { label: 'مجموعات الواتساب', icon: <MessageCircle size={20} />, color: '#25d366' },
    'GENERAL': { label: 'روابط ومواقع هامة', icon: <Globe size={20} />, color: '#3b82f6' },
  };

  const getCategoryData = (cat: string) => (categories as any)[cat] || categories.GENERAL;

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 className="animate-spin" size={40} color="#064e3b" />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl' }}>
      <Sidebar />
      
      <main style={{ flex: 1, padding: '2rem 3rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        <header style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>روابط والمصادر الهامة 🌐</h1>
              <p style={{ opacity: 0.6, fontSize: '1.1rem', fontWeight: 600 }}>الوصول السريع لمواقع الهيئة، مجموعات التواصل، والمصادر المفيدة.</p>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => { setEditingResource(null); setShowModal(true); }}
                style={{ height: '3.5rem', borderRadius: '16px', background: '#064e3b', color: 'white', padding: '0 2rem', fontWeight: 800, gap: '0.5rem', boxShadow: '0 10px 20px rgba(6, 78, 59, 0.15)' }}
              >
                <Plus size={20} /> إضافة رابط جديد
              </Button>
            )}
          </div>
        </header>

        {error && (
          <div style={{ padding: '1.5rem', background: '#fef2f2', color: '#dc2626', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #fee2e2', fontWeight: 700 }}>
            <Info size={20} />
            حدث خطأ أثناء جلب الروابط: {error}
            <Button onClick={fetchResources} style={{ marginRight: 'auto', background: 'white', color: '#dc2626', border: '1px solid #fee2e2', padding: '0.5rem 1rem', height: 'auto' }}>إعادة المحاولة</Button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3rem' }}>
          {Object.entries(categories).map(([key, cat]) => {
            const filtered = resources.filter(r => r.category === key);
            if (filtered.length === 0 && !isAdmin) return null;

            return (
              <section key={key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${cat.color}15`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.icon}
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>{cat.label}</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {filtered.map((res) => (
                    <motion.div 
                      key={res.id}
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', background: 'white', height: '100%', display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                              {key === 'WHATSAPP' ? <MessageCircle size={24} /> : <Link2 size={24} />}
                            </div>
                            {isAdmin && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => { setEditingResource(res); setShowModal(true); }} style={iconBtn}><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete(res.id)} style={{ ...iconBtn, color: '#ef4444' }}><Trash2 size={16} /></button>
                              </div>
                            )}
                          </div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>{res.title}</h3>
                          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>{res.description || 'لا يوجد وصف متاح.'}</p>
                        </div>
                        
                        <a 
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            width: '100%', padding: '0.8rem', borderRadius: '14px', background: `${cat.color}10`,
                            color: cat.color, fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s'
                          }}
                        >
                          فتح الرابط <ExternalLink size={16} />
                        </a>
                      </Card>
                    </motion.div>
                  ))}
                  {filtered.length === 0 && isAdmin && (
                    <div style={{ border: '2px dashed #e2e8f0', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', opacity: 0.5 }}>
                      لا يوجد روابط في هذا القسم
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Admin Modal */}
        <AnimatePresence>
          {showModal && (
            <div style={modalOverlay}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={modalCard}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{editingResource ? 'تعديل الرابط' : 'إضافة رابط جديد'}</h2>
                  <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' as const, gap: '1.2rem' }}>
                  <div style={formGroup}>
                    <label style={formLabel}>العنوان</label>
                    <input name="title" required defaultValue={editingResource?.title} style={formInput} placeholder="مثال: موقع الهيئة الرسمي" />
                  </div>
                  
                  <div style={formGroup}>
                    <label style={formLabel}>الرابط (URL)</label>
                    <input name="url" required defaultValue={editingResource?.url} style={formInput} placeholder="https://..." dir="ltr" />
                  </div>

                  <div style={formGroup}>
                    <label style={formLabel}>التصنيف</label>
                    <select name="category" required defaultValue={editingResource?.category || 'GENERAL'} style={formInput}>
                      <option value="AUTHORITY">روابط الهيئة</option>
                      <option value="WHATSAPP">جروبات واتساب</option>
                      <option value="GENERAL">عام / روابط أخرى</option>
                    </select>
                  </div>

                  <div style={formGroup}>
                    <label style={formLabel}>وصف مختصر</label>
                    <textarea name="description" defaultValue={editingResource?.description} style={{ ...formInput, height: '80px', resize: 'none' }} placeholder="اكتب وصفاً مختصراً للرابط..."></textarea>
                  </div>

                  <Button type="submit" disabled={submitting} style={{ height: '3.5rem', borderRadius: '14px', background: '#064e3b', color: 'white', fontWeight: 800, marginTop: '1rem' }}>
                    {submitting ? <Loader2 className="animate-spin" /> : (editingResource ? 'حفظ التعديلات' : 'إضافة الرابط')}
                  </Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Styles
const iconBtn = {
  width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#f1f5f9', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer'
};

const modalOverlay = {
  position: 'fixed' as const, inset: 0, background: 'rgba(15, 23, 42, 0.5)', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
};

const modalCard = {
  background: 'white', padding: '2.5rem', borderRadius: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
};

const formGroup = { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' };
const formLabel = { fontSize: '0.9rem', fontWeight: 800, color: '#475569' };
const formInput = { 
  padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc',
  fontSize: '1rem', fontWeight: 600, outline: 'none'
};
