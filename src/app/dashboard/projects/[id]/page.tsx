'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  MapPin, Calendar, ChevronLeft, Loader2, Landmark, 
  DollarSign, Building, Info, TrendingUp, ShieldCheck, 
  Users, FileText, Activity, Clock, ArrowRight,
  Download, ExternalLink, Receipt
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      } else {
        console.error('Failed to fetch project');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 className="animate-spin" size={40} color="#064e3b" />
    </div>
  );

  if (!project) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: '1rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>الحجز غير موجود ⚠️</h2>
      <Button onClick={() => router.push('/dashboard/projects')}>العودة لسجل الحجوزات</Button>
    </div>
  );

  const totalPaid = project.transactions?.filter((t: any) => 
    ['AUTHORITY_PAYMENT', 'RESERVATION_FEE_PAYMENT', 'INSTALLMENT_PAYMENT'].includes(t.type)
  ).reduce((sum: number, t: any) => sum + (t.officialAmount || t.amount || 0), 0) || 0;

  const progress = project.totalValue > 0 ? (totalPaid / project.totalValue) * 100 : 0;
  const isWallet = project.reservationType === 'WALLET' || (project.name || '').includes('محفظة');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* Header Section */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
          <div>
            <div 
              onClick={() => router.back()} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.6, marginBottom: '1rem', fontWeight: 700 }}
            >
               العودة <ChevronLeft size={16} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: `${getStatusColor(project.status)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Landmark size={32} color={getStatusColor(project.status)} />
              </div>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.4rem' }}>{project.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1rem', opacity: 0.6 }}>
                  <MapPin size={18} /> {project.location || 'الموقع غير محدد'}
                  <Badge style={{ background: `${getStatusColor(project.status)}15`, color: getStatusColor(project.status) }}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="outline" style={{ height: '3.5rem', borderRadius: '14px', gap: '0.6rem' }}>
              <FileText size={18} /> تقرير تفصيلي
            </Button>
            {(session?.user as any)?.role === 'ADMIN' && (
              <Button style={{ height: '3.5rem', borderRadius: '14px', background: '#064e3b' }}>تعديل البيانات</Button>
            )}
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
          
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Financial Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
               <StatCard 
                 title="إجمالي قيمة الأرض" 
                 value={`$${(project.totalValue || 0).toLocaleString()}`} 
                 icon={<DollarSign size={20} />} 
                 color="#1e293b"
                 subtitle={`${((project.totalValue || 0) * (project.exchangeRate || 3.75)).toLocaleString()} SAR`}
               />
               <StatCard 
                 title="المسدد للهيئة" 
                 value={`$${totalPaid.toLocaleString()}`} 
                 icon={<ShieldCheck size={20} />} 
                 color="#059669"
                 subtitle={`بنسبة إنجاز ${Math.round(progress)}%`}
               />
               <StatCard 
                 title="المتبقي للهيئة" 
                 value={`$${((project.totalValue || 0) - totalPaid).toLocaleString()}`} 
                 icon={<Clock size={20} />} 
                 color="#b45309"
                 subtitle="حسب جدول الأقساط"
               />
            </div>

            {/* Project Specifications */}
            <Card style={{ padding: '2rem', borderRadius: '30px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Info size={24} color="#064e3b" /> المواصفات الفنية والبيانات
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                <InfoField label="رقم الحجز" value={project.reservationCode || "-"} />
                <InfoField label="المرحلة" value={project.phaseNumber || "-"} />
                <InfoField label="الحي" value={project.neighborhood || "-"} />
                <InfoField label="مساحة الأرض" value={project.plotArea ? `${project.plotArea} م²` : "-"} />
                <InfoField label="سعر المتر" value={project.pricePerMeter ? `$${project.pricePerMeter}` : "-"} />
                <InfoField label="نوع الحجز" value={project.reservationType === 'INITIAL' ? 'ابتدائي' : 'رسمي'} />
                <InfoField label="حساب الحجز" value={project.bookingAccount || "-"} />
                <InfoField label="سعر الصرف" value={project.exchangeRate || "3.75"} />
                <InfoField label="تاريخ البدء" value={project.startDate ? new Date(project.startDate).toLocaleDateString('ar-EG') : "-"} />
              </div>
            </Card>

            {/* Phases / Timeline */}
            <Card style={{ padding: '2rem', borderRadius: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Activity size={24} color="#064e3b" /> المسار الزمني والمراحل
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {project.phases?.map((phase: any, idx: number) => (
                  <div key={phase.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', 
                    borderRadius: '20px', background: phase.status === 'ACTIVE' ? '#f0fdf4' : '#f8fafc',
                    border: phase.status === 'ACTIVE' ? '2px solid #bbf7d0' : '1px solid #f1f5f9'
                  }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      background: getPhaseColor(phase.status), color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{phase.name}</h4>
                      <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>{phase.tasks?.length || 0} مهام متبقية</p>
                    </div>
                    <Badge style={{ background: `${getPhaseColor(phase.status)}20`, color: getPhaseColor(phase.status) }}>
                      {getPhaseLabel(phase.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card style={{ padding: '2rem', borderRadius: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Receipt size={24} color="#064e3b" /> السجل المالي الأخير
                </h3>
                <Button variant="outline" style={{ borderRadius: '12px', fontSize: '0.85rem' }}>عرض الكل</Button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'right', fontSize: '0.85rem', opacity: 0.5, borderBottom: '1px solid #f1f5f9' }}>
                      <th style={{ padding: '1rem' }}>التاريخ</th>
                      <th style={{ padding: '1rem' }}>البيان</th>
                      <th style={{ padding: '1rem' }}>المساهم</th>
                      <th style={{ padding: '1rem' }}>المبلغ ($)</th>
                      <th style={{ padding: '1rem' }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.transactions?.slice(0, 5).map((t: any) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                        <td style={{ padding: '1rem' }}>{t.purpose}</td>
                        <td style={{ padding: '1rem' }}>{t.user?.name}</td>
                        <td style={{ padding: '1rem', fontWeight: 800 }}>${(t.amount || 0).toLocaleString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <Badge style={{ background: '#f0fdf4', color: '#166534' }}>مكتمل</Badge>
                        </td>
                      </tr>
                    ))}
                    {(!project.transactions || project.transactions.length === 0) && (
                      <tr>
                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>لا توجد عمليات مالية مسجلة بعد</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>

          {/* Sidebar / Info Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Partners List */}
            <Card style={{ padding: '2rem', borderRadius: '30px', border: 'none', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={20} color="#064e3b" /> الشركاء والمساهمين
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {project.participations?.map((p: any) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '16px', background: '#f8fafc' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#064e3b15', color: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                      {p.user?.name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p.user?.name}</p>
                      <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>حصة: {p.percentage || (p.shareAmount / project.totalValue * 100).toFixed(1)}%</p>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>${(p.shareAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {(!project.participations || project.participations.length === 0) && (
                  <p style={{ opacity: 0.5, fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>لا يوجد شركاء مسجلين</p>
                )}
              </div>
              <Button variant="outline" style={{ width: '100%', marginTop: '1.5rem', borderRadius: '12px' }}>إدارة الشركاء</Button>
            </Card>

            {/* Documents Section */}
            <Card style={{ padding: '2rem', borderRadius: '30px' }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={20} color="#064e3b" /> المستندات والوثائق
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {project.documents?.map((doc: any) => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#ef4444' }}><FileText size={24} /></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{doc.name}</p>
                      <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>{doc.type}</p>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#64748b' }}><ExternalLink size={18} /></a>
                  </div>
                ))}
                {(!project.documents || project.documents.length === 0) && (
                  <p style={{ opacity: 0.5, fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>لا توجد مستندات مرفوعة</p>
                )}
              </div>
              <Button variant="outline" style={{ width: '100%', marginTop: '1.5rem', borderRadius: '12px' }}>رفع مستند جديد</Button>
            </Card>

          </div>

        </div>

      </main>

      <style jsx global>{`
        .glass-card {
          background: white;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 25px rgba(0,0,0,0.02);
        }
        .main-content-layout {
          max-width: 1400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

function InfoField({ label, value }: { label: string, value: any }) {
  return (
    <div>
      <p style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: 700, marginBottom: '0.4rem' }}>{label}</p>
      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{value}</p>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }: any) {
  return (
    <Card style={{ padding: '1.8rem', borderRadius: '28px', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b' }}>{title}</span>
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.5 }}>{subtitle}</div>}
    </Card>
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

function getPhaseLabel(status: string) {
  const labels: any = { 'PENDING': 'معلق', 'ACTIVE': 'جاري حالياً', 'COMPLETED': 'مكتمل' };
  return labels[status] || status;
}

function getPhaseColor(status: string) {
  const colors: any = { 'PENDING': '#94a3b8', 'ACTIVE': '#10b981', 'COMPLETED': '#059669' };
  return colors[status] || '#64748b';
}
