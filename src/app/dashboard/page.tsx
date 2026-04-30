'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Users, FileText, 
  Wallet, TrendingUp, Plus, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, MessageSquare, ChevronRight, Loader2,
  PieChart, Activity, Settings, Bell, Search, LogOut, X, MapPin, Landmark, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import InvestorDashboard from '@/components/investor/InvestorDashboard';

import Sidebar from '@/components/Sidebar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const role = (session?.user as any)?.role || 'MEMBER';
  const isViewer = role === 'VIEWER';

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
      return;
    }

    if (status === 'authenticated') {
      if (role === 'ADMIN' || role === 'VIEWER') {
        fetchData();
      } else {
        setLoading(false);
      }
    }
  }, [status, role]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/dashboard/stats').then(res => res.ok ? res.json() : null),
      fetch('/api/projects').then(res => res.ok ? res.json() : [])
    ])
    .then(([statsData, projectsData]) => {
      if (statsData) setStats(statsData);
      setProjects(projectsData || []);
    })
    .catch(err => {
      console.error('Dashboard Fetch Error:', err);
    })
    .finally(() => {
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
      exchangeRate: 3.75,
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
        fetchData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || status === 'loading') return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 className="animate-spin" size={48} color="#064e3b" />
    </div>
  );

  if (role === 'MEMBER') {
    return <InvestorDashboard />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', fontFamily: 'var(--font-outfit)', direction: 'rtl' }}>
      <Sidebar />

      {/* Main Content */}
      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="main-content-layout" 
        style={{ flex: 1, padding: '2.5rem' }}
      >
        {/* Top Header */}
        <motion.header 
          variants={itemVariants}
          style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginBottom: '3rem', background: 'white', padding: '1.2rem 2rem',
            borderRadius: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>مرحباً بك، {session?.user?.name || 'مدير النظام'} 👋</h1>
            <p style={{ opacity: 0.6, fontSize: '0.95rem' }}>إليك آخر مستجدات استثماراتك وحجوزاتك اليوم.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} size={18} />
                <input type="text" placeholder="بحث سريع..." style={{ 
                  padding: '0.7rem 3rem 0.7rem 1rem', borderRadius: '1rem', border: '1px solid #e2e8f0',
                  width: '250px', outline: 'none', fontSize: '0.9rem'
                }} />
             </div>
             <motion.div 
               whileHover={{ scale: 1.1, rotate: 5 }}
               onClick={() => signOut()} 
               style={{ cursor: 'pointer', width: '45px', height: '45px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} 
               title="تسجيل الخروج"
             >
                <LogOut size={20} />
             </motion.div>
             <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #064e3b, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                {session?.user?.name?.substring(0, 2).toUpperCase() || 'AD'}
             </div>
          </div>
        </motion.header>

        {/* Row 1: Main Stats */}
        <motion.div 
          variants={itemVariants}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}
        >
          <StatCard
            title="إجمالي المحفظة 💼"
            value={`$${(stats?.totalMemberContributions || stats?.totalRecognized || 0).toLocaleString()}`}
            icon={<Users size={20} />} color="#064e3b" trend="حجم الاستثمار"
          />
          <StatCard
            title="رصيد الصندوق 💵"
            value={`$${(stats?.cashBalance ?? ((stats?.totalRecognized || 0) - (stats?.totalPaid || 0) - (stats?.expenses || 0))).toLocaleString()}`}
            icon={<Wallet size={20} />} color="#10b981" trend="كاش متاح"
          />
          <StatCard
            title="المتبقي للهيئة"
            value={`$${(stats?.remainingToAuthority || 0).toLocaleString()}`}
            icon={<ArrowDownRight size={20} />} color="#f59e0b" trend="مجدولة"
          />
          <StatCard
            title="المخصصة"
            value={stats?.allocatedCount || 0}
            icon={<CheckCircle2 size={20} />} color="#059669" trend="تم الحجز"
          />
        </motion.div>

        {/* Row 2: Authority Payment Breakdown */}
        <motion.div variants={itemVariants} style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', paddingRight: '0.3rem' }}>
            تفاصيل سداد الهيئة
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
            <StatCard
              title="مدفوع مباشر للهيئة 🏦"
              value={`$${(stats?.totalAuthorityDirect || 0).toLocaleString()}`}
              icon={<Building2 size={20} />} color="#3b82f6" trend="دفع مباشر"
            />
            <StatCard
              title="محفظة الهيئة (مدين) 🏛️"
              value={`$${(stats?.authorityWalletBalance ?? 0).toLocaleString()}`}
              icon={<Landmark size={20} />} color="#8b5cf6" trend="رصيد المحفظة"
              subtitle={`إجمالي محوّل: $${(stats?.totalLiquidityToWallet || 0).toLocaleString()}`}
            />
            <StatCard
              title="معترف به رسمياً ✅"
              value={`$${(stats?.officialPaid || stats?.totalOfficialPaid || 0).toLocaleString()}`}
              icon={<CheckCircle2 size={20} />} color="#ef4444" trend="مسجّل بالهيئة"
              subtitle={`إجمالي السداد: $${(stats?.totalPaidToAuthority || stats?.totalPaid || 0).toLocaleString()}`}
            />
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Projects Table */}
          <motion.div variants={itemVariants}>
            <Card style={{ padding: '2.5rem', borderRadius: '24px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>أحدث الحجوزات العقارية</h3>
                  <Link href="/dashboard/projects">
                    <Button variant="secondary" style={{ borderRadius: '0.8rem' }}>عرض كل الحجوزات</Button>
                  </Link>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {projects.slice(0, 4).map((p: any) => (
                    <Link href={`/dashboard/projects/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <motion.div 
                        whileHover={{ x: -10, backgroundColor: 'white', borderColor: '#e2e8f0', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.2rem', 
                          borderRadius: '1.2rem', background: '#f8fafc', transition: 'all 0.2s',
                          cursor: 'pointer', border: '1px solid transparent'
                        }}
                      >
                         <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <Landmark color="#064e3b" />
                         </div>
                         <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{p.name}</h4>
                            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>{p.location}</p>
                         </div>
                         <div style={{ textAlign: 'left' }}>
                            {!p.name.includes('محفظة') && p.totalValue > 0 && (
                              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>${p.totalValue?.toLocaleString()}</div>
                            )}
                            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>{getStatusLabel(p.status)}</div>
                         </div>
                         <ChevronRight size={20} opacity={0.3} />
                      </motion.div>
                    </Link>
                  ))}
                  {projects.length === 0 && <p style={{ textAlign: 'center', opacity: 0.4, padding: '2rem' }}>لا توجد حجوزات مسجلة حالياً.</p>}
               </div>
            </Card>
          </motion.div>

          {/* Quick Actions & Notifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             {!isViewer && (
               <motion.div variants={itemVariants}>
                 <Card style={{ background: 'linear-gradient(135deg, #064e3b, #059669)', color: 'white', border: 'none', borderRadius: '24px', padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>إضافة سريعة</h3>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '1.5rem' }}>ابدأ بإضافة حجز جديد للأرض أو عضو جديد إلى نظام بيت الوطن.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                       <Link href="/dashboard/projects/create">
                         <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                           <Button style={{ width: '100%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '14px', height: '3.5rem' }}>
                             <Plus size={18} /> حجز جديد للأرض
                           </Button>
                         </motion.div>
                       </Link>
                       <Link href="/dashboard/members">
                         <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                           <Button style={{ width: '100%', background: 'white', color: '#064e3b', border: 'none', borderRadius: '14px', height: '3.5rem' }}>
                             <Users size={18} /> عضو جديد
                           </Button>
                         </motion.div>
                       </Link>
                    </div>
                 </Card>
               </motion.div>
             )}

             <motion.div variants={itemVariants}>
               <Card style={{ padding: '1.5rem', borderRadius: '24px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>تنبيهات الاستحقاق 🔔</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <NotificationItem title="موعد قسط التجمع الخامس" time="بعد يومين" color="#ef4444" />
                     <NotificationItem title="تحديث مستندات الحي السادس" time="أمس" color="#3b82f6" />
                     <NotificationItem title="عضو جديد انضم للجروب" time="منذ ساعة" color="#10b981" />
                  </div>
               </Card>
             </motion.div>
          </div>
        </div>
      </motion.main>

      {/* Add Reservation Modal */}
      <AnimatePresence>
        {(showAddModal && !isViewer) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(6, 78, 59, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <Card style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '32px', border: 'none', boxShadow: '0 40px 100px rgba(0,0,0,0.2)', position: 'relative' }}>
                <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer' }}><X size={20} /></button>
                <h3 style={{ marginBottom: '2rem', textAlign: 'center', fontWeight: 900, fontSize: '1.8rem' }}>إضافة حجز أرض جديد</h3>
                <form onSubmit={handleAddReservation} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <FormGroup label="اسم الحجز (مثلاً: قطعة 110)">
                    <input name="name" required placeholder="ادخل رقم القطعة أو الاسم المميز..." style={inputStyle} />
                  </FormGroup>
                  <FormGroup label="موقع الأرض (الحي / المنطقة)">
                    <input name="location" required placeholder="مثال: التجمع الخامس - الحي السادس..." style={inputStyle} />
                  </FormGroup>
                  <FormGroup label="حالة الحجز الحالية">
                    <select name="status" required style={inputStyle}>
                       <option value="ALLOCATED">تم التخصيص (حجز نهائي) 🔑</option>
                       <option value="SUBMITTED">تحت الترسية (تقديم طلب) 📝</option>
                    </select>
                  </FormGroup>
                  <FormGroup label="إجمالي قيمة الأرض ($)">
                    <input name="totalValue" type="number" placeholder="اتركه صفراً إذا كان الحساب 'محفظة'..." style={inputStyle} />
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.2rem' }}>* القيمة الإجمالية مطلوبة فقط لحجوزات الأراضي الفعلية.</p>
                  </FormGroup>
                  <Button type="submit" disabled={submitting} style={{ height: '4rem', borderRadius: '18px', fontSize: '1.1rem', fontWeight: 800 }}>
                    {submitting ? <Loader2 className="animate-spin" /> : 'تأكيد وحفظ الحجز'}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
        :root { --font-outfit: 'Outfit', sans-serif; }
      `}</style>
    </div>
  );
}

function formatCompactNumber(val: any) {
  if (typeof val === 'string' && val.startsWith('$')) {
    const num = parseFloat(val.replace(/[$,]/g, ''));
    if (isNaN(num)) return val;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return val;
  }
  return val;
}

function StatCard({ title, value, icon, color, trend, subtitle }: { title: string, value: any, icon: any, color: string, trend: string, subtitle?: string }) {
  return (
    <Card style={{ padding: '1.2rem 1rem', position: 'relative', overflow: 'hidden', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
        <motion.div 
          whileHover={{ rotate: 15 }}
          style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {icon}
        </motion.div>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', background: '#dcfce7', padding: '0.15rem 0.4rem', borderRadius: '0.4rem', whiteSpace: 'nowrap' }}>
          {trend}
        </div>
      </div>
      <h3 style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.6, marginBottom: '0.2rem', whiteSpace: 'nowrap' }}>{title}</h3>
      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', whiteSpace: 'nowrap' }} title={(value || '').toString()}>
        {formatCompactNumber(value || 0)}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={subtitle}>
          {subtitle}
        </div>
      )}
    </Card>
  );
}

function NotificationItem({ title, time, color }: { title: string, time: string, color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
       <motion.div 
         animate={{ scale: [1, 1.2, 1] }}
         transition={{ repeat: Infinity, duration: 2 }}
         style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}
       />
       <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{time}</div>
       </div>
    </div>
  );
}

function FormGroup({ label, children }: any) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}><label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>{label}</label>{children}</div>;
}

const inputStyle = { padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none', fontWeight: 600 };

function getStatusLabel(status: string) {
  const labels: any = { 'UNDER_STUDY': 'تحت الدراسة 📝', 'SUBMITTED': 'تم التقديم 📤', 'ALLOCATED': 'تم التخصيص 🔑', 'IN_PROGRESS': 'قيد الإنشاء 🏗️', 'COMPLETED': 'مكتمل ✅' };
  return labels[status] || status;
}
