'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { File, Download, Upload, Search, Loader2, X, Eye, FileText, Map, ShieldCheck, MoreVertical, Trash2, ArrowUpRight, Landmark, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentExplorer({ projectId }: { projectId?: string }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'MEMBER';
  const isViewer = role === 'VIEWER';

  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchDocs();
    if (!projectId) {
      fetch('/api/projects').then(res => res.json()).then(setProjects);
    }
  }, [projectId]);

  const fetchDocs = () => {
    setLoading(true);
    fetch(`/api/documents${projectId ? `?projectId=${projectId}` : ''}`)
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setLoading(false);
      });
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    if (projectId) formData.append('projectId', projectId);

    try {
      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      if (res.ok) {
        alert('تم رفع المستند بنجاح ✅');
        setShowUploadModal(false);
        fetchDocs();
      } else {
        const errorData = await res.json();
        alert(`فشل الرفع: ${errorData.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('حدث خطأ أثناء الاتصال بالسيرفر لرفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستند نهائياً؟ سيتم مسح الملف من السيرفر أيضاً.')) return;
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
      } else {
        alert('فشل الحذف');
      }
    } catch (error) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const [editDoc, setEditDoc] = useState<any>(null);

  const handleUpdateDoc = async (id: string, newData: any) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...newData }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        fetchDocs();
        setEditDoc(null);
      }
    } catch (error) {
      alert('فشل التعديل');
    }
  };

  const handleCopyDoc = async (doc: any, targetType: string) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({ 
          projectId: doc.projectId,
          name: `${doc.name} (نسخة)`,
          type: targetType,
          url: doc.url, // Point to same physical file
          isCopy: true 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        fetchDocs();
        setEditDoc(null);
        alert('تم أخذ نسخة من الملف ونقلها للقسم الجديد بنجاح ✅');
      }
    } catch (error) {
      alert('فشل النسخ');
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#1e293b' }}>مركز المستندات الذكي</h2>
          <p style={{ opacity: 0.6, fontSize: '0.95rem' }}>إدارة آمنة ومنظمة لكافة الأوراق المالية والرسمية للمشاريع.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
           {!isViewer && (
             <Button onClick={() => setShowUploadModal(true)} style={{ borderRadius: '14px', height: '3.5rem', padding: '0 1.5rem', background: '#064e3b' }}>
                <Upload size={18} /> رفع مستند جديد
             </Button>
           )}
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
            <input 
              type="text" 
              placeholder="ابحث في الملفات..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.9rem 3rem 0.9rem 1rem', borderRadius: '16px', border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
           <FilterPill label="الكل" active={filterType === 'ALL'} onClick={() => setFilterType('ALL')} />
           <FilterPill label="حوالات الهيئة الرسمية 🏛️" active={filterType === 'OFFICIAL_TRANSFER'} onClick={() => setFilterType('OFFICIAL_TRANSFER')} color="#2563eb" />
           <FilterPill label="إيصالات الشركاء الداخلية 👥" active={filterType === 'INTERNAL_RECEIPT'} onClick={() => setFilterType('INTERNAL_RECEIPT')} color="#10b981" />
           <FilterPill label="خرائط وأراضي 🗺️" active={filterType === 'MAP'} onClick={() => setFilterType('MAP')} />
           <FilterPill label="عقود ونماذج 📝" active={filterType === 'FORM'} onClick={() => setFilterType('FORM')} />
        </div>
      </div>

      {/* Stats Summary for current filter */}
      {filterType !== 'ALL' && filteredDocs.length > 0 && (
        <div className="fade-in" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                 <Info size={18} color="#064e3b" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>إجمالي المستندات في هذا القسم: {filteredDocs.length} ملفات موثقة</span>
           </div>
        </div>
      )}

      {/* Documents Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={42} color="#064e3b" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
           {filteredDocs.map((doc) => (
             <div key={doc.id} className="doc-card" style={{ 
               background: 'white', borderRadius: '24px', padding: '1.5rem', position: 'relative',
               border: '1px solid #f1f5f9', boxShadow: '0 10px 25px rgba(0,0,0,0.02)',
               transition: 'all 0.3s ease', cursor: 'pointer'
             }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                   <div style={{ width: '55px', height: '55px', borderRadius: '16px', background: getDocBg(doc.type), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getDocIcon(doc.type)}
                   </div>
                   <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => setPreviewDoc(doc)} className="action-btn" title="معاينة سريعة"><Eye size={18} /></button>
                      {!isViewer && (
                        <>
                          <button onClick={() => setEditDoc(doc)} className="action-btn" title="إدارة / نقل"><MoreVertical size={18} /></button>
                          <button onClick={() => handleDeleteDoc(doc.id)} className="action-btn" title="حذف" style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                        </>
                      )}
                      <a href={doc.url} download className="action-btn" title="تحميل"><Download size={18} /></a>
                   </div>
                </div>
                
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doc.name}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', opacity: 0.5, fontSize: '0.8rem' }}>
                   <span style={{ fontWeight: 800, color: getDocColor(doc.type) }}>{getDocLabel(doc.type)}</span>
                   <span>{new Date(doc.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                  .doc-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.08); border-color: #064e3b33; }
                  .action-btn { width: 35px; height: 35px; border-radius: 10px; border: none; background: #f8fafc; color: #64748b; display: flex; alignItems: center; justifyContent: center; cursor: pointer; transition: all 0.2s; }
                  .action-btn:hover { background: #064e3b; color: white; }
                `}} />
             </div>
           ))}
           {filteredDocs.length === 0 && (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', opacity: 0.4 }}>
                <File size={48} style={{ marginBottom: '1rem' }} />
                <p>لا توجد مستندات في هذا القسم حالياً.</p>
             </div>
           )}
        </div>
      )}

      {/* Management Modal (Move/Copy/Rename) */}
      {editDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1800, padding: '2rem' }}>
           <Card style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', borderRadius: '32px', position: 'relative' }}>
              <button onClick={() => setEditDoc(null)} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer' }}><X size={20} /></button>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>إدارة المستند: {editDoc.name}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <FormGroup label="اسم الملف">
                    <input type="text" defaultValue={editDoc.name} onChange={(e) => editDoc.newName = e.target.value} style={inputStyle} />
                 </FormGroup>
                 
                 <FormGroup label="نقل إلى قسم آخر">
                    <select defaultValue={editDoc.type} onChange={(e) => editDoc.newType = e.target.value} style={inputStyle}>
                       <option value="OFFICIAL_TRANSFER">حوالات الهيئة الرسمية 🏛️</option>
                       <option value="INTERNAL_RECEIPT">إيصالات الشركاء الداخلية 👥</option>
                       <option value="MAP">خرائط وأراضي 🗺️</option>
                       <option value="FORM">عقد / نموذج رسمي 📝</option>
                    </select>
                 </FormGroup>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <Button onClick={() => handleUpdateDoc(editDoc.id, { name: editDoc.newName || editDoc.name, type: editDoc.newType || editDoc.type })} style={{ height: '3.5rem', borderRadius: '14px' }}>
                       حفظ التعديلات
                    </Button>
                    <Button onClick={() => handleCopyDoc(editDoc, editDoc.newType || editDoc.type)} style={{ height: '3.5rem', borderRadius: '14px', background: '#2563eb' }}>
                       أخذ نسخة ونقلها
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '2rem' }}>
           <div style={{ width: '100%', maxWidth: '1000px', height: '90vh', background: 'white', borderRadius: '32px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                    <h3 style={{ fontWeight: 800 }}>المعاين الذكي للمستندات</h3>
                    <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>{previewDoc.name}</p>
                 </div>
                 <button onClick={() => setPreviewDoc(null)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
              </div>
              <div style={{ flex: 1, background: '#f1f5f9', padding: '1rem' }}>
                 {previewDoc.url.toLowerCase().endsWith('.pdf') ? (
                   <iframe src={previewDoc.url} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '16px' }} />
                 ) : (
                   <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={previewDoc.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }} />
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Premium Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500, padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ background: 'white', padding: '2.5rem', borderRadius: '40px', width: '100%', maxWidth: '500px', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 50px 100px rgba(0,0,0,0.2)', position: 'relative' }}
            >
              <button 
                onClick={() => setShowUploadModal(false)} 
                style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '45px', height: '45px', borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }}
                className="close-btn-hover"
              >
                <X size={24} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#064e3b10', color: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Upload size={36} />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>رفع مستند جديد 📄</h3>
                <p style={{ opacity: 0.5, fontWeight: 700 }}>قم برفع النسخة الأصلية للمستند لضمان توثيقه.</p>
              </div>

              <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ fontWeight: 800, fontSize: '0.95rem', color: '#475569' }}>الملف المرفق</label>
                  <input type="file" name="file" required style={{ padding: '1.5rem', border: '3px dashed #e2e8f0', borderRadius: '20px', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }} />
                </div>
                
                {!projectId && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontWeight: 800, fontSize: '0.95rem', color: '#475569' }}>الربط بمشروع استثماري</label>
                    <select name="projectId" required style={{ padding: '1.1rem 1.4rem', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 600, outline: 'none' }}>
                      <option value="">اختر المشروع...</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ fontWeight: 800, fontSize: '0.95rem', color: '#475569' }}>تصنيف المستند</label>
                  <select name="type" required style={{ padding: '1.1rem 1.4rem', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 600, outline: 'none' }}>
                    <option value="OFFICIAL_TRANSFER">حوالة سداد رسمية للهيئة 🏛️</option>
                    <option value="INTERNAL_RECEIPT">إيصال تجميع داخلي 👥</option>
                    <option value="MAP">خريطة / مخطط هندسي 🗺️</option>
                    <option value="FORM">عقد / نموذج رسمي 📝</option>
                  </select>
                </div>

                <Button type="submit" disabled={uploading} style={{ height: '4.5rem', borderRadius: '22px', background: '#064e3b', color: 'white', fontWeight: 900, fontSize: '1.2rem', marginTop: '1.5rem', boxShadow: '0 10px 25px rgba(6, 78, 59, 0.2)' }}>
                  {uploading ? <Loader2 className="animate-spin" /> : 'تأكيد وحفظ المستند'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .close-btn-hover:hover { background: #fee2e2 !important; color: #ef4444 !important; transform: rotate(90deg); }
      `}} />
    </div>
  );
}

// Visual Helpers
function FilterPill({ label, active, onClick, color }: any) {
  return (
    <button onClick={onClick} style={{ 
      padding: '0.7rem 1.4rem', borderRadius: '14px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
      background: active ? (color || '#064e3b') : 'transparent', color: active ? 'white' : '#64748b', fontWeight: 800, fontSize: '0.9rem',
      boxShadow: active ? `0 4px 12px ${color || '#064e3b'}33` : 'none'
    }}>
      {label}
    </button>
  );
}

function FormGroup({ label, children }: any) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}><label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>{label}</label>{children}</div>;
}

const inputStyle = { padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none', fontWeight: 600 };

function getDocIcon(type: string) {
  switch(type) {
    case 'OFFICIAL_TRANSFER': return <Landmark size={28} color="#2563eb" />;
    case 'INTERNAL_RECEIPT': return <Users size={28} color="#059669" />;
    case 'MAP': return <Map size={28} color="#475569" />;
    case 'FORM': return <ShieldCheck size={28} color="#d97706" />;
    default: return <File size={28} color="#64748b" />;
  }
}

function getDocBg(type: string) {
  switch(type) {
    case 'OFFICIAL_TRANSFER': return '#eff6ff';
    case 'INTERNAL_RECEIPT': return '#f0fdf4';
    case 'MAP': return '#f1f5f9';
    case 'FORM': return '#fffbeb';
    default: return '#f8fafc';
  }
}

function getDocColor(type: string) {
  switch(type) {
    case 'OFFICIAL_TRANSFER': return '#2563eb';
    case 'INTERNAL_RECEIPT': return '#059669';
    case 'MAP': return '#475569';
    case 'FORM': return '#d97706';
    default: return '#64748b';
  }
}

function getDocLabel(type: string) {
  const labels: any = { 
    'OFFICIAL_TRANSFER': 'حوالة سداد هيئة', 
    'INTERNAL_RECEIPT': 'إيصال شريك داخلي', 
    'MAP': 'خريطة أرض', 
    'FORM': 'مستند رسمي', 
    'OTHER': 'ملف عام' 
  };
  return labels[type] || type;
}

function Info(props: any) { return <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>; }
