'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  MapPin, Calendar, Loader2, ChevronLeft, Plus, 
  Landmark, Building2, TrendingUp, ShieldCheck, 
  LogOut, BarChart3, Wallet, Users, LayoutDashboard,
  Search, Filter, ArrowUpRight, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';

export default function ProjectsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'MEMBER';
  const isViewer = role === 'VIEWER';

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    setLoading(true);
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setLoading(false);
      });
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 className="animate-spin" size={40} color="#064e3b" />
    </div>
  );

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl', fontFamily: 'inherit' }}>
      <Sidebar />
      
      <main style={{ 
        flex: 1, 
        padding: '2.5rem 4rem', 
        paddingRight: 'calc(var(--sidebar-width) + 3rem)',
        transition: 'all 0.35s ease'
      }}>
        
        {/* Modern Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#064e3b', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
               <LayoutDashboard size={18} /> المنصة العقارية الذكية
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-1px' }}>سجل الحجوزات</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>إدارة ومتابعة {projects.length} حجزاً موثقاً في محفظتك</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {!isViewer && (
              <Link href="/dashboard/projects/create">
                <Button style={{ height: '3.8rem', padding: '0 2.5rem', borderRadius: '18px', background: '#064e3b', color: 'white', fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 12px 24px rgba(6, 78, 59, 0.2)', border: 'none' }}>
                  <Plus size={22} style={{ marginLeft: '0.5rem' }} /> إضافة حجز استثماري
                </Button>
              </Link>
            )}
            <Button onClick={() => signOut()} style={{ height: '3.8rem', width: '3.8rem', borderRadius: '18px', background: '#fee2e2', color: '#dc2626', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <LogOut size={22} />
            </Button>
          </div>
        </div>

        {/* Global Search & Filters */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
           <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="البحث عن حجز، رقم قطعة، أو موقع..." 
                style={{ width: '100%', padding: '1.2rem 3.5rem 1.2rem 1.5rem', borderRadius: '22px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1.1rem', fontWeight: 600, outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
              />
           </div>
           <Button variant="outline" style={{ height: '4rem', padding: '0 2rem', borderRadius: '22px', gap: '0.8rem', fontWeight: 800, background: 'white' }}>
              <Filter size={20} /> تصفية النتائج
           </Button>
        </div>

        {/* Dynamic Project Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '2.5rem' }}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '10rem 0', opacity: 0.3 }}>
             <Building2 size={100} style={{ marginBottom: '2rem' }} />
             <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>لا توجد حجوزات تطابق البحث</h2>
          </div>
        )}

      </main>
    </div>
  );
}

function ProjectCard({ project }: any) {
  const isWallet = project.reservationType === 'WALLET' || (project.name || '').includes('محفظة');
  const totalPaid = project.transactions?.filter((t: any) => 
    ['AUTHORITY_PAYMENT', 'RESERVATION_FEE_PAYMENT', 'WALLET_OPENING_PAYMENT', 'INSTALLMENT_PAYMENT', 'ACTIVATION_TRANSFER', 'LIQUIDITY_TRANSFER'].includes(t.type)
  ).reduce((sum: number, t: any) => sum + Math.abs(t.officialAmount || t.amount || 0), 0) || 0;
  
  const progress = project.totalValue > 0 ? (totalPaid / project.totalValue) * 100 : 0;

  return (
    <Link href={`/dashboard/projects/${project.id}`} style={{ textDecoration: 'none' }}>
      <div className="luxury-card" style={{ 
        background: 'white', borderRadius: '35px', padding: '2.5rem', position: 'relative',
        boxShadow: '0 15px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
      }}>
        {/* Status Badge */}
        <div style={{ 
          position: 'absolute', top: '2.5rem', left: '2.5rem',
          background: `${getStatusColor(project.status)}15`,
          color: getStatusColor(project.status),
          padding: '0.5rem 1.2rem', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 900,
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
           <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(project.status) }} />
           {getStatusLabel(project.status)}
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1rem' }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'linear-gradient(135deg, #064e3b, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(6, 78, 59, 0.15)' }}>
                <Landmark size={28} />
             </div>
             <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: '#1e293b', maxWidth: '240px', lineHeight: '1.2' }}>{project.name}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.95rem' }}>
             <MapPin size={18} /> {project.location || 'الموقع غير محدد'}
          </div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '1.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
           <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>إجمالي القيمة</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a' }}>${(project.totalValue || 0).toLocaleString()}</p>
           </div>
           <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>المسدد للهيئة</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 950, color: '#10b981' }}>${totalPaid.toLocaleString()}</p>
           </div>
        </div>

        {!isWallet && (
          <div style={{ marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontWeight: 900, fontSize: '0.9rem', color: '#475569' }}>
                <span>نسبة سداد الأقساط للهيئة</span>
                <span>{Math.round(progress)}%</span>
             </div>
             <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #064e3b, #10b981)', borderRadius: '10px' }} />
             </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
           <div style={{ display: 'flex', gap: '0.8rem' }}>
              <Stat icon={<Clock size={14} />} text="78 يوم متبقي" />
              <Stat icon={<Users size={14} />} text={`${project.participations?.length || 0} شريك`} />
           </div>
           <ArrowUpRight size={20} color="#cbd5e1" />
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .luxury-card:hover { transform: translateY(-10px); box-shadow: 0 30px 60px rgba(0,0,0,0.06); border-color: #064e3b33; }
        `}} />
      </div>
    </Link>
  );
}

function Stat({ icon, text }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>
       {icon} {text}
    </div>
  );
}

function getStatusLabel(status: string) {
  const labels: any = { 'UNDER_STUDY': 'تحت الدراسة', 'SUBMITTED': 'تم التقديم', 'ALLOCATED': 'تم التخصيص', 'IN_PROGRESS': 'قيد التنفيذ', 'COMPLETED': 'مكتمل' };
  return labels[status] || status;
}

function getStatusColor(status: string) {
  const colors: any = { 'UNDER_STUDY': '#94a3b8', 'SUBMITTED': '#3b82f6', 'ALLOCATED': '#f59e0b', 'IN_PROGRESS': '#10b981', 'COMPLETED': '#059669' };
  return colors[status] || '#64748b';
}
