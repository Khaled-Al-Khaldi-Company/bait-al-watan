'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  Building2, Wallet, Landmark, ChevronLeft, 
  FileText, Loader2, Download, ExternalLink, 
  TrendingUp, Clock, ShieldCheck, LogOut, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function InvestorDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/investor/dashboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error('Invalid data received:', data);
          setProjects([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" size={48} color="#064e3b" />
    </div>
  );

  const totalInvestedUSD = Array.isArray(projects) ? projects.reduce((sum, p) => sum + (p.myPaidUSD || 0), 0) : 0;
  const totalRemainingUSD = Array.isArray(projects) ? projects.reduce((sum, p) => sum + (p.remainingUSD || 0), 0) : 0;


  return (
    <div style={{ padding: '2rem', direction: 'rtl', minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
           <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>مرحباً بك في بوابة المستثمر 👋</h1>
           <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>تابع استثماراتك، كشوف حسابك، ومستنداتك الرسمية في مكان واحد.</p>
        </div>
        <Button onClick={() => signOut()} variant="secondary" style={{ borderRadius: '14px', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
           <LogOut size={20} /> تسجيل الخروج
        </Button>
      </header>

      {/* Hero Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
         <Card style={{ padding: '2rem', borderRadius: '32px', background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', color: 'white', border: 'none', boxShadow: '0 20px 40px rgba(6, 78, 59, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={24} />
               </div>
               <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', borderRadius: '2rem' }}>إجمالي المساهمات</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>${totalInvestedUSD.toLocaleString()}</div>
            <div style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '0.5rem' }}>تم تحويلها وتأكيدها في حسابات المشاريع</div>
         </Card>

         <Card style={{ padding: '2rem', borderRadius: '32px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={24} />
               </div>
               <span style={{ fontSize: '0.8rem', background: '#fef2f2', color: '#ef4444', padding: '0.3rem 0.8rem', borderRadius: '2rem', fontWeight: 700 }}>المتبقي المستحق</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' }}>${totalRemainingUSD.toLocaleString()}</div>
            <div style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>أقساط مجدولة أو التزامات تعاقدية متبقية</div>
         </Card>

         <Link href="/dashboard/messages" style={{ textDecoration: 'none' }}>
           <Card style={{ padding: '2rem', borderRadius: '32px', border: 'none', background: '#f0fdf4', color: '#065f46', boxShadow: '0 10px 30px rgba(6, 95, 70, 0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={24} />
                 </div>
                 <span style={{ fontSize: '0.8rem', background: 'white', padding: '0.3rem 0.8rem', borderRadius: '2rem', fontWeight: 700 }}>التواصل المباشر</span>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>المحادثات 💬</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '0.5rem' }}>تواصل الآن مع الإدارة حول استفساراتك</div>
           </Card>
         </Link>
      </div>

      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '2rem', color: '#1e293b' }}>مشاريعك الاستثمارية 🏢</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2.5rem' }}>
         {projects.map(project => (
           <Card key={project.id} style={{ padding: '2.5rem', borderRadius: '32px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                 <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{project.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, fontSize: '0.9rem', marginTop: '0.4rem' }}>
                       <ShieldCheck size={16} /> حصة معتمدة بنسبة {project.mySharePercentage.toFixed(1)}%
                    </div>
                 </div>
                 <span style={{ background: '#f1f5f9', padding: '0.5rem 1.2rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 700 }}>{getStatusLabel(project.status)}</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                       <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.3rem' }}>مدفوعاتك ($)</div>
                       <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#059669' }}>${project.myPaidUSD.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                       <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '0.3rem' }}>المتبقي عليك</div>
                       <div style={{ fontSize: '1.3rem', fontWeight: 900, color: project.remainingUSD > 0 ? '#ef4444' : '#059669' }}>
                          ${project.remainingUSD.toLocaleString()}
                       </div>
                    </div>
                 </div>
                 <div style={{ marginTop: '1.5rem', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(project.myPaidUSD / (project.totalRequiredUSD || 1)) * 100}%`, height: '100%', background: '#064e3b', borderRadius: '4px' }} />
                 </div>
              </div>

              <div>
                 <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', opacity: 0.8 }}>المستندات والعقود الخاصة بك 📄</h4>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {project.documents.map((doc: any) => (
                      <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <div style={{ padding: '0.7rem 1.2rem', borderRadius: '14px', border: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#1e40af', fontWeight: 700 }}>
                           <FileText size={16} /> {doc.name}
                        </div>
                      </a>
                    ))}
                    {project.documents.length === 0 && <p style={{ fontSize: '0.85rem', opacity: 0.4 }}>لا توجد مستندات مرفوعة حالياً.</p>}
                 </div>
              </div>

              <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Link href={`/dashboard/reports/reservations`} style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" style={{ borderRadius: '12px', fontSize: '0.85rem' }}>عرض كشف الحساب الكامل <ChevronLeft size={16} /></Button>
                 </Link>
              </div>
           </Card>
         ))}
      </div>
    </div>
  );
}

function getStatusLabel(status: string) {
  const labels: any = { 'UNDER_STUDY': 'تحت الدراسة 📝', 'SUBMITTED': 'تم التقديم 📤', 'ALLOCATED': 'تم التخصيص 🔑', 'IN_PROGRESS': 'قيد الإنشاء 🏗️', 'COMPLETED': 'مكتمل ✅' };
  return labels[status] || status;
}
