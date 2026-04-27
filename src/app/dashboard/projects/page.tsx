'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { MapPin, Calendar, ArrowLeft, Loader2, Wallet, Activity, ChevronLeft, Plus, X, Landmark, DollarSign, Building, Info, TrendingUp, ShieldCheck, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';

export default function ProjectsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'MEMBER';
  const isViewer = role === 'VIEWER';

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    setLoading(true);
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error('Projects API returned non-array:', data);
          setProjects([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch Projects Error:', err);
        setProjects([]);
        setLoading(false);
      });
  };

  const handleAddReservation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get('name'),
      location: formData.get('location'),
      totalValue: parseFloat(formData.get('totalValue') as string),
      exchangeRate: parseFloat(formData.get('exchangeRate') as string || '3.75'),
      status: formData.get('status') || 'ALLOCATED'
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchProjects();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" size={40} color="#064e3b" />
    </div>
  );

  return (
    <div 
      style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', direction: 'rtl' }}
    >
      <Sidebar />
      <main className="main-content-layout" style={{ flex: 1, padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#1e293b' }}>سجل الحجوزات العقارية 🏗️</h1>
          <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>إجمالي الحجوزات الموثقة: {projects?.length || 0}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isViewer && (
            <Link href="/dashboard/projects/create">
              <Button style={{ height: '3.5rem', padding: '0 2rem', borderRadius: '14px', background: '#064e3b' }}>
                <Plus size={18} /> إضافة حجز جديد
              </Button>
            </Link>
          )}
          <Button onClick={() => window.history.back()} variant="secondary" style={{ height: '3.5rem', borderRadius: '14px' }}>
            العودة للصفحة السابقة <ChevronLeft size={18} />
          </Button>
          <Button onClick={() => signOut()} variant="secondary" style={{ height: '3.5rem', borderRadius: '14px', background: '#fee2e2', color: '#dc2626', border: 'none' }}>
            <LogOut size={18} /> خروج
          </Button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
        {Array.isArray(projects) && projects.map((project) => {
          const isWallet = project.reservationType === 'WALLET' || (project.name || '').includes('محفظة');
          const totalPaid = project.transactions?.filter((t: any) => 
            ['AUTHORITY_PAYMENT', 'RESERVATION_FEE_PAYMENT', 'WALLET_OPENING_PAYMENT', 'INSTALLMENT_PAYMENT', 'ACTIVATION_TRANSFER', 'LIQUIDITY_TRANSFER'].includes(t.type)
          ).reduce((sum: number, t: any) => {
            if (t.type === 'LIQUIDITY_TRANSFER' || t.type === 'AUTHORITY_PAYMENT') return sum + (t.officialAmount || 0);
            return sum + Math.abs(t.officialAmount || t.amount || 0);
          }, 0) || 0;
          const progress = project.totalValue > 0 ? (totalPaid / project.totalValue) * 100 : 0;

          return (
            <Link href={`/dashboard/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card className="fade-in reservation-card" style={{ 
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                borderTop: `6px solid ${getStatusColor(project.status)}`,
                position: 'relative', overflow: 'hidden', borderRadius: '28px', padding: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: `${getStatusColor(project.status)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Landmark color={getStatusColor(project.status)} />
                     </div>
                     <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{project.name}</h2>
                  </div>
                  <span style={{ 
                    fontSize: '0.8rem', padding: '0.4rem 1rem', borderRadius: '2rem', 
                    background: `${getStatusColor(project.status)}15`,
                    color: getStatusColor(project.status),
                    fontWeight: 900
                  }}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', opacity: 0.6 }}>
                    <MapPin size={18} /> {project.location || 'غير محدد'}
                  </div>
                  
                  <div style={{ 
                    background: '#f8fafc', padding: '1.5rem', borderRadius: '20px',
                    display: 'grid', gridTemplateColumns: isWallet ? '1fr' : '1fr 1fr', gap: '1rem'
                  }}>
                     {!isWallet && (
                       <div>
                          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.3rem' }}>إجمالي القيمة</p>
                          <p style={{ fontWeight: 900, fontSize: '1.2rem' }}>${(project.totalValue || 0).toLocaleString()}</p>
                       </div>
                     )}
                     <div style={{ textAlign: isWallet ? 'right' : 'left' }}>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.3rem' }}>سداد الهيئة</p>
                        <p style={{ fontWeight: 900, fontSize: '1.2rem', color: '#10b981' }}>${totalPaid.toLocaleString()}</p>
                     </div>
                  </div>

                  {!isWallet && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 800 }}>
                         <span>نسبة السداد للهيئة</span>
                         <span>{Math.round(progress)}%</span>
                      </div>
                      <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px' }}>
                        <div style={{ 
                          width: `${progress}%`, height: '100%', background: '#064e3b', 
                          borderRadius: '5px', transition: 'width 1s' 
                        }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5, fontSize: '0.9rem', fontWeight: 600 }}>
                  <span>{project.phases?.length || 0} مراحل تنفيذية</span>
                  <ChevronLeft size={20} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* NEW WIDE "POPUP PAGE" MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <Card className="fade-in-up" style={{ width: '100%', maxWidth: '950px', height: 'auto', maxHeight: '90vh', padding: 0, borderRadius: '40px', border: 'none', boxShadow: '0 50px 150px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex' }}>
            
            {/* Sidebar Info Panel */}
            <div style={{ width: '300px', background: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)', color: 'white', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={32} />
               </div>
               <div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.8rem' }}>توثيق حجز جديد</h3>
                  <p style={{ opacity: 0.7, fontSize: '0.9rem', lineHeight: '1.6' }}>يرجى ملء البيانات بدقة لضمان صحة التقارير المالية والتحويلات الرسمية للهيئة.</p>
               </div>
               <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <SidebarTip icon={<ShieldCheck size={18} />} text="نظام تشفير آمن للمستندات" />
                  <SidebarTip icon={<TrendingUp size={18} />} text="تحديث تلقائي لأسعار الصرف" />
                  <SidebarTip icon={<Info size={18} />} text="إمكانية التعديل لاحقاً" />
               </div>
            </div>

            {/* Main Form Area */}
            <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
               <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e293b' }}>تفاصيل بيانات الحجز</h4>
                  <button onClick={() => setShowAddModal(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
               </div>

               <form onSubmit={handleAddReservation} style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {/* Section 1: Basic Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                     <FormGroup label="اسم الحجز / رقم القطعة" icon={<Landmark size={18} />}>
                        <input name="name" required placeholder="مثال: قطعة 110 حرف E" style={premiumInputStyle} />
                     </FormGroup>
                     <FormGroup label="الموقع الجغرافي" icon={<MapPin size={18} />}>
                        <input name="location" required placeholder="الحي السادس، منطقة الجامعات..." style={premiumInputStyle} />
                     </FormGroup>
                  </div>

                  {/* Section 2: Financials */}
                  <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     <h5 style={{ fontWeight: 800, color: '#064e3b', fontSize: '0.95rem' }}>التفاصيل المالية والمحاسبية</h5>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <FormGroup label="إجمالي قيمة الأرض ($)" icon={<DollarSign size={18} />}>
                           <div style={{ position: 'relative' }}>
                              <input name="totalValue" type="number" required placeholder="0.00" style={{ ...premiumInputStyle, paddingLeft: '3rem' }} />
                              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#cbd5e1' }}>USD</span>
                           </div>
                        </FormGroup>
                        <FormGroup label="سعر صرف الدولار الافتراضي" icon={<Activity size={18} />}>
                           <input name="exchangeRate" type="number" step="0.01" defaultValue="3.75" style={premiumInputStyle} />
                        </FormGroup>
                     </div>
                  </div>

                  {/* Section 3: Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                     <FormGroup label="الحالة الحالية للحجز" icon={<ShieldCheck size={18} />}>
                        <select name="status" style={premiumInputStyle}>
                           <option value="ALLOCATED">تم التخصيص 🔑</option>
                           <option value="UNDER_STUDY">تحت الدراسة 📝</option>
                           <option value="IN_PROGRESS">قيد التنفيذ 🏗️</option>
                        </select>
                     </FormGroup>
                     <FormGroup label="تاريخ البدء المتوقع" icon={<Calendar size={18} />}>
                        <input type="date" name="startDate" defaultValue={new Date().toISOString().split('T')[0]} style={premiumInputStyle} />
                     </FormGroup>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                     <Button type="submit" disabled={submitting} style={{ 
                        flex: 2, height: '4rem', borderRadius: '18px', fontSize: '1.2rem', fontWeight: 900,
                        background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)', boxShadow: '0 10px 30px rgba(6, 78, 59, 0.2)'
                     }}>
                        {submitting ? <Loader2 className="animate-spin" /> : 'تأكيد الحجز وحفظ البيانات'}
                     </Button>
                     <Button type="button" onClick={() => setShowAddModal(false)} variant="secondary" style={{ flex: 1, height: '4rem', borderRadius: '18px', fontWeight: 800 }}>إلغاء</Button>
                  </div>
               </form>
            </div>
          </Card>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .reservation-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); border-color: #064e3b33; }
        .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
      </main>
    </div>
  );
}

function SidebarTip({ icon, text }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', opacity: 0.8, fontSize: '0.85rem' }}>
       <div style={{ color: '#fbbf24' }}>{icon}</div>
       <span>{text}</span>
    </div>
  );
}

function FormGroup({ label, icon, children }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
       <label style={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {icon} {label}
       </label>
       {children}
    </div>
  );
}

const premiumInputStyle = { 
  width: '100%', padding: '1.1rem 1.2rem', borderRadius: '16px', border: '1.5px solid #f1f5f9', 
  background: 'white', fontSize: '1rem', outline: 'none', fontWeight: 700,
  transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
};

function getStatusLabel(status: string) {
  const labels: any = { 'UNDER_STUDY': 'تحت الدراسة 📝', 'SUBMITTED': 'تم التقديم 📤', 'ALLOCATED': 'تم التخصيص 🔑', 'IN_PROGRESS': 'قيد الإنشاء 🏗️', 'COMPLETED': 'مكتمل ✅' };
  return labels[status] || status;
}

function getStatusColor(status: string) {
  const colors: any = { 'UNDER_STUDY': '#94a3b8', 'SUBMITTED': '#3b82f6', 'ALLOCATED': '#f59e0b', 'IN_PROGRESS': '#10b981', 'COMPLETED': '#059669' };
  return colors[status] || '#64748b';
}
