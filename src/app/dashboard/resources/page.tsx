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
      <main style={{ flex: 1, padding: '2.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <header style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div onClick={() => window.history.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700, marginBottom: '0.8rem' }}>
              <ChevronLeft size={16} /> العودة للوحة التحكم
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0f172a' }}>الروابط والمصادر الهامة 🌐</h1>
            <p style={{ opacity: 0.6, fontSize: '1.1rem', fontWeight: 600 }}>الوصول السريع لمواقع الهيئة، مجموعات التواصل، والمصادر المفيدة.</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => { setEditingResource(null); setShowModal(true); }}
              style={{ height: '3.8rem', borderRadius: '18px', background: '#064e3b', color: 'white', padding: '0 2.5rem', fontWeight: 800, gap: '0.6rem', boxShadow: '0 10px 20px rgba(6, 78, 59, 0.15)' }}
            >
              <Plus size={20} /> إضافة رابط جديد
            </Button>
          )}
        </header>

        {error && (
          <div style={{ padding: '1.5rem', background: '#fef2f2', color: '#dc2626', borderRadius: '20px', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #fee2e2', fontWeight: 800 }}>
            <Info size={22} />
            <div style={{ flex: 1 }}>حدث خطأ أثناء جلب الروابط: {error}</div>
            <Button onClick={fetchResources} style={{ background: 'white', color: '#dc2626', border: '1px solid #fee2e2', padding: '0.6rem 1.2rem', height: 'auto', borderRadius: '12px' }}>إعادة المحاولة</Button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {Object.entries(categories).map(([key, cat]) => {
            const filtered = resources.filter(r => r.category === key);
            if (filtered.length === 0 && !isAdmin) return null;

            return (
              <section key={key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${cat.color}15`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.icon}
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>{cat.label}</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {filtered.map((resource) => (
                    <motion.div 
                      key={resource.id}
                      whileHover={{ y: -5 }}
                      style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>{resource.title}</h4>
                          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, lineHeight: 1.5 }}>{resource.description || 'لا يوجد وصف متاح.'}</p>
                        </div>
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => { setEditingResource(resource); setShowModal(true); }} style={iconBtn} className="action-btn-hover"><Edit3 size={16} /></button>
                            <button onClick={() => handleDelete(resource.id)} style={{ ...iconBtn, color: '#ef4444' }} className="action-btn-hover delete"><Trash2 size={16} /></button>
                          </div>
                        )}
                      </div>

                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', padding: '0.9rem', borderRadius: '16px', background: `${cat.color}10`, color: cat.color, textDecoration: 'none', fontWeight: 800, transition: 'all 0.2s' }}
                        className="link-btn-hover"
                      >
                        <ExternalLink size={18} /> زيارة الرابط
                      </a>
                    </motion.div>
                  ))}

                  {filtered.length === 0 && isAdmin && (
                    <div style={{ border: '3px dashed #e2e8f0', borderRadius: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', opacity: 0.5, gap: '1rem' }}>
                      <Link2 size={40} />
                      <span style={{ fontWeight: 800 }}>لا توجد روابط في هذا القسم</span>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <AnimatePresence>
          {showModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{ background: 'white', padding: '3.5rem', borderRadius: '40px', width: '100%', maxWidth: '550px', boxShadow: '0 50px 100px rgba(0,0,0,0.2)', position: 'relative' }}
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
                    <Globe size={36} />
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{editingResource ? 'تعديل الرابط' : 'إضافة رابط جديد'}</h2>
                  <p style={{ opacity: 0.5, fontWeight: 700 }}>قم بتعبئة بيانات الرابط لسهولة الوصول إليه لاحقاً.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                      <option value="AUTHORITY">روابط الهيئة الحكومية 🏛️</option>
                      <option value="WHATSAPP">مجموعات الواتساب 💬</option>
                      <option value="GENERAL">عام / روابط أخرى 🌐</option>
                    </select>
                  </div>

                  <div style={formGroup}>
                    <label style={formLabel}>وصف مختصر</label>
                    <textarea name="description" defaultValue={editingResource?.description} style={{ ...formInput, height: '100px', resize: 'none', paddingTop: '1rem' }} placeholder="اكتب وصفاً مختصراً للرابط..."></textarea>
                  </div>

                  <Button type="submit" disabled={submitting} style={{ height: '4.5rem', borderRadius: '22px', background: '#064e3b', color: 'white', fontWeight: 900, fontSize: '1.2rem', marginTop: '1.5rem', boxShadow: '0 10px 25px rgba(6, 78, 59, 0.2)' }}>
                    {submitting ? <Loader2 className="animate-spin" /> : (editingResource ? 'حفظ التعديلات' : 'إضافة الرابط')}
                  </Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <style dangerouslySetInnerHTML={{ __html: `
          .action-btn-hover:hover { background: #f1f5f9; transform: scale(1.1); }
          .action-btn-hover.delete:hover { background: #fee2e2; }
          .link-btn-hover:hover { filter: brightness(0.95); transform: translateY(-2px); }
          .close-btn-hover:hover { background: #fee2e2 !important; color: #ef4444 !important; transform: rotate(90deg); }
        `}} />
      </main>
    </div>
  );
}

const iconBtn = {
  width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: 'transparent', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s'
};

const formGroup = { display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' };
const formLabel = { fontSize: '0.95rem', fontWeight: 800, color: '#475569' };
const formInput = { 
  fontSize: '1rem', fontWeight: 600, outline: 'none'
};
