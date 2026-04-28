'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  MapPin, Calendar, ChevronLeft, Loader2, Landmark, 
  DollarSign, Building, Info, TrendingUp, ShieldCheck, 
  Users, FileText, Activity, Clock, ArrowRight,
  Download, ExternalLink, Receipt, Settings, BarChart3,
  History, PieChart, Layers, Trash2, Edit3, Share2
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

type TabType = 'overview' | 'partners' | 'timeline' | 'finances' | 'documents' | 'settings';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7f9', direction: 'rtl', fontFamily: 'inherit' }}>
      <Sidebar />
      
      <main style={{ flex: 1, padding: '2rem 3rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        
        {/* Professional Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div 
              onClick={() => router.push('/dashboard/projects')}
              style={{ cursor: 'pointer', width: '48px', height: '48px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#64748b' }}
            >
              <ChevronLeft size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>{project.name}</h1>
                <Badge style={{ 
                  background: `${getStatusColor(project.status)}15`, 
                  color: getStatusColor(project.status),
                  padding: '0.4rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5, fontWeight: 600 }}>
                <MapPin size={16} /> {project.location || 'الموقع غير محدد'}
                <span style={{ fontSize: '1.2rem' }}>•</span>
                <Calendar size={16} /> {new Date(project.createdAt).toLocaleDateString('ar-EG')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="outline" style={{ borderRadius: '14px', gap: '0.5rem', fontWeight: 700, height: '3.2rem', padding: '0 1.5rem' }}>
              <Share2 size={18} /> مشاركة
            </Button>
            <Button style={{ borderRadius: '14px', gap: '0.5rem', fontWeight: 700, height: '3.2rem', padding: '0 1.5rem', background: '#064e3b' }}>
              <Edit3 size={18} /> تعديل البيانات
            </Button>
            <div style={{ fontSize: '10px', opacity: 0.1, position: 'absolute', top: 5, left: 5 }}>v2.0.5-final</div>
          </div>
        </div>

        {/* Top Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          <CompactStat title="إجمالي القيمة" value={`$${(project.totalValue || 0).toLocaleString()}`} icon={<DollarSign size={20} />} color="#0f172a" />
          <CompactStat title="المسدد للهيئة" value={`$${totalPaid.toLocaleString()}`} icon={<ShieldCheck size={20} />} color="#10b981" />
          <CompactStat title="المتبقي" value={`$${((project.totalValue || 0) - totalPaid).toLocaleString()}`} icon={<Clock size={20} />} color="#f59e0b" />
          <CompactStat title="المستندات" value={`${project.documents?.length || 0} ملفات`} icon={<FileText size={20} />} color="#3b82f6" />
        </div>

        {/* Global Tab Navigation */}
        <div style={{ 
          display: 'flex', gap: '0.5rem', background: 'white', padding: '0.5rem', 
          borderRadius: '20px', marginBottom: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          position: 'sticky', top: '1rem', zIndex: 50
        }}>
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Layers size={18} />} label="نظرة عامة" />
          <TabButton active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} icon={<Users size={18} />} label="حصص الشركاء" />
          <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Activity size={18} />} label="المسار الزمني" />
          <TabButton active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} icon={<History size={18} />} label="الحركة المالية" />
          <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FileText size={18} />} label="المستندات" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18} />} label="الإعدادات" />
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '500px' }}>
          {activeTab === 'overview' && <OverviewTab project={project} />}
          {activeTab === 'partners' && <PartnersTab project={project} />}
          {activeTab === 'timeline' && <TimelineTab project={project} />}
          {activeTab === 'finances' && <FinancesTab project={project} />}
          {activeTab === 'documents' && <DocumentsTab project={project} />}
          {activeTab === 'settings' && <SettingsTab project={project} />}
        </div>

      </main>
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.8rem',
        padding: '1rem 0.5rem',
        borderRadius: '16px',
        border: 'none',
        background: active ? '#064e3b' : 'transparent',
        color: active ? 'white' : '#64748b',
        fontWeight: 800,
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {icon} {label}
    </button>
  );
}

function CompactStat({ title, value, icon, color }: any) {
  return (
    <Card style={{ padding: '1.5rem', borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>{title}</span>
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b' }}>{value}</div>
    </Card>
  );
}

// ─── Tabs Sections ──────────────────────────────────────────────────────────

function OverviewTab({ project }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <Card style={{ padding: '2.5rem', borderRadius: '32px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '2rem', color: '#0f172a' }}>البيانات الفنية</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <DataField label="المرحلة / الإصدار" value={project.phaseNumber || "-"} />
          <DataField label="رقم الحجز" value={project.reservationCode || "-"} />
          <DataField label="الحي / المنطقة" value={project.neighborhood || "-"} />
          <DataField label="مساحة الأرض" value={project.plotArea ? `${project.plotArea} م²` : "-"} />
          <DataField label="سعر المتر" value={project.pricePerMeter ? `$${project.pricePerMeter}` : "-"} />
          <DataField label="حساب الحجز" value={project.bookingAccount || "-"} />
        </div>
      </Card>
      
      <Card style={{ padding: '2.5rem', borderRadius: '32px', background: 'linear-gradient(135deg, #064e3b, #043927)', color: 'white' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '2rem' }}>تحليل القيمة</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '20px' }}>
            <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '0.5rem' }}>القيمة الكلية بالدولار</p>
            <p style={{ fontSize: '2rem', fontWeight: 900 }}>${(project.totalValue || 0).toLocaleString()}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '20px' }}>
            <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '0.5rem' }}>القيمة الموازية (SAR)</p>
            <p style={{ fontSize: '2rem', fontWeight: 900 }}>{((project.totalValue || 0) * (project.exchangeRate || 3.75)).toLocaleString()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PartnersTab({ project }: any) {
  return (
    <Card style={{ padding: '2.5rem', borderRadius: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>سجل حصص الشركاء</h3>
        <Button style={{ borderRadius: '12px', background: '#064e3b' }}>إضافة شريك جديد</Button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {project.participations?.map((p: any) => (
          <div key={p.id} style={{ 
            padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', background: '#fcfdfe',
            display: 'flex', alignItems: 'center', gap: '1.2rem', transition: 'all 0.2s'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#064e3b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900 }}>
              {p.user?.name?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{p.user?.name}</h4>
              <p style={{ fontSize: '0.85rem', opacity: 0.5, fontWeight: 700 }}>${(p.shareAmount || 0).toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#064e3b' }}>{p.percentage || (p.shareAmount / project.totalValue * 100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TimelineTab({ project }: any) {
  return (
    <Card style={{ padding: '2.5rem', borderRadius: '32px' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '3rem' }}>المراحل التشغيلية</h3>
      <div style={{ position: 'relative', paddingLeft: '2rem' }}>
        <div style={{ position: 'absolute', right: '1.5rem', top: 0, bottom: 0, width: '2px', background: '#e2e8f0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {project.phases?.map((phase: any, idx: number) => (
            <div key={phase.id} style={{ display: 'flex', gap: '2rem', position: 'relative' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', background: getPhaseColor(phase.status),
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                zIndex: 10, fontSize: '1rem', fontWeight: 900, marginRight: '-19px',
                boxShadow: '0 0 0 5px white'
              }}>
                {idx + 1}
              </div>
              <div style={{ 
                flex: 1, padding: '1.5rem', borderRadius: '24px', background: phase.status === 'ACTIVE' ? '#f0fdf4' : '#f8fafc',
                border: phase.status === 'ACTIVE' ? '2px solid #bbf7d0' : '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.2rem' }}>{phase.name}</h4>
                  <Badge style={{ background: 'white', color: getPhaseColor(phase.status), border: `1px solid ${getPhaseColor(phase.status)}` }}>
                    {getPhaseLabel(phase.status)}
                  </Badge>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                    {phase.tasks?.length || 0} مهام مدرجة
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function FinancesTab({ project }: any) {
  return (
    <Card style={{ padding: '2.5rem', borderRadius: '32px' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem' }}>سجل المعاملات المالية</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.8rem' }}>
          <thead>
            <tr style={{ textAlign: 'right', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 800 }}>
              <th style={{ padding: '1rem' }}>التاريخ</th>
              <th style={{ padding: '1rem' }}>المساهم / الشريك</th>
              <th style={{ padding: '1rem' }}>البيان</th>
              <th style={{ padding: '1rem' }}>المبلغ ($)</th>
              <th style={{ padding: '1rem' }}>رسمي (هيئة)</th>
              <th style={{ padding: '1rem' }}>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {project.transactions?.map((t: any) => (
              <tr key={t.id} style={{ background: '#f8fafc', borderRadius: '16px' }}>
                <td style={{ padding: '1.2rem', fontWeight: 700, borderRadius: '0 16px 16px 0' }}>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                <td style={{ padding: '1.2rem' }}>
                   <div style={{ fontWeight: 800 }}>{t.user?.name}</div>
                   <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{t.type}</div>
                </td>
                <td style={{ padding: '1.2rem', fontWeight: 600 }}>{t.purpose}</td>
                <td style={{ padding: '1.2rem', fontWeight: 900, color: '#064e3b' }}>${(t.amount || 0).toLocaleString()}</td>
                <td style={{ padding: '1.2rem', fontWeight: 800 }}>${(t.officialAmount || 0).toLocaleString()}</td>
                <td style={{ padding: '1.2rem', borderRadius: '16px 0 0 16px' }}>
                   <Button variant="ghost" size="sm" style={{ color: '#64748b' }}><ExternalLink size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DocumentsTab({ project }: any) {
  return (
    <Card style={{ padding: '2.5rem', borderRadius: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>مستودع المستندات</h3>
        <Button style={{ borderRadius: '12px', background: '#3b82f6' }}>رفع ملف جديد</Button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {project.documents?.map((doc: any) => (
          <div key={doc.id} style={{ 
            padding: '1.5rem', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem',
            position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              <FileText size={32} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '150px' }}>{doc.name}</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 700 }}>{doc.type}</p>
            </div>
            <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', top: '1rem', left: '1rem', color: '#94a3b8' }}>
              <Download size={16} />
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SettingsTab({ project }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <Card style={{ padding: '2.5rem', borderRadius: '32px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '2rem' }}>تعديل بيانات الحجز</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 800, fontSize: '0.9rem', color: '#64748b' }}>اسم الحجز</label>
              <input defaultValue={project.name} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 800, fontSize: '0.9rem', color: '#64748b' }}>الموقع</label>
              <input defaultValue={project.location} style={inputStyle} />
            </div>
          </div>
          <Button style={{ height: '3.5rem', borderRadius: '14px', background: '#064e3b', marginTop: '1rem' }}>حفظ التغييرات</Button>
        </form>
      </Card>
      
      <Card style={{ padding: '2.5rem', borderRadius: '32px', border: '2px solid #fee2e2' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#dc2626', marginBottom: '1rem' }}>منطقة الخطر</h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>حذف هذا الحجز سيؤدي إلى مسح كافة المعاملات والمستندات المرتبطة به نهائياً.</p>
        <Button variant="outline" style={{ width: '100%', color: '#dc2626', borderColor: '#fee2e2', height: '3.2rem', borderRadius: '12px' }}>
          <Trash2 size={18} /> حذف الحجز نهائياً
        </Button>
      </Card>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function DataField({ label, value }: any) {
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.3rem' }}>{label}</p>
      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{value}</p>
    </div>
  );
}

const inputStyle = {
  padding: '1rem',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '1rem',
  fontWeight: 600,
  outline: 'none'
};

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
