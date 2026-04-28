'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { LayoutDashboard, FileText, Wallet, Settings, Users, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Sidebar from '@/components/Sidebar';

export default function Dashboard() {
  const t = useTranslations('Dashboard');
  const nt = useTranslations('Navigation');
  
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPaid: 0, remaining: 150000, docCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, finRes, docRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/finances'),
          fetch('/api/documents')
        ]);
        
        const projs = await projRes.json();
        const fins = await finRes.json();
        const docs = await docRes.json();

        setProjects(projs);
        setStats({
          totalPaid: fins.totalPaid || 0,
          remaining: 150000 - (fins.totalPaid || 0),
          docCount: docs.length || 0
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      location: formData.get('location'),
      description: formData.get('description'),
    };

    const res = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      setShowModal(false);
      window.location.reload();
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--background))' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  );

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', direction: 'rtl' }}>
      <Sidebar />

      <main className="main-content">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>{t('title')}</h1>
            <p style={{ opacity: 0.7 }}>{t('welcome')}</p>
          </div>
          <Button variant="secondary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> {t('addProject')}
          </Button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Card className="fade-in">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet style={{ color: 'hsl(var(--secondary))' }} /> {t('financialSummary')}
            </h3>
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{t('totalPaid')}</span>
                <span style={{ fontWeight: 700 }}>${stats.totalPaid.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('remaining')}</span>
                <span style={{ fontWeight: 700 }}>${stats.remaining.toLocaleString()}</span>
              </div>
              <div style={{ marginTop: '1rem', height: '8px', background: 'hsl(var(--border))', borderRadius: '4px' }}>
                <div style={{ 
                  width: `${Math.min(100, (stats.totalPaid / 150000) * 100)}%`, 
                  height: '100%', 
                  background: 'hsl(var(--primary))', 
                  borderRadius: '4px',
                  transition: 'width 1s ease-out'
                }}></div>
              </div>
            </div>
          </Card>

          <Card className="fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText style={{ color: 'hsl(var(--secondary))' }} /> {t('stats')}
            </h3>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('activeProjects')}</span>
                <span style={{ fontWeight: 700 }}>{projects.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('docsUploaded')}</span>
                <span style={{ fontWeight: 700 }}>{stats.docCount}</span>
              </div>
            </div>
          </Card>

          <Card className="fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard style={{ color: 'hsl(var(--secondary))' }} /> {t('recentProjects')}
            </h3>
            <div style={{ marginTop: '1.5rem' }}>
              {projects.length > 0 ? projects.slice(0, 3).map(p => (
                <ProjectItem key={p.id} name={p.name} status={p.phases?.find((ph:any) => ph.status === 'ACTIVE')?.name || 'Initial'} />
              )) : (
                <p style={{ opacity: 0.5, textAlign: 'center' }}>No projects yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Add Project Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
          }}>
            <Card style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
               <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
               <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
               <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Project Name</label>
                    <input name="name" required style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }} placeholder="e.g. New Cairo Plot 5" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Location</label>
                    <input name="location" style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }} placeholder="District 5, Cairo" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
                    <textarea name="description" rows={3} style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }} placeholder="Details about the plot..." />
                  </div>
                  <Button type="submit" style={{ marginTop: '0.5rem' }}>Create Project</Button>
               </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      padding: '0.75rem 1rem', 
      borderRadius: 'var(--radius)',
      background: active ? 'hsla(var(--primary-foreground) / 0.1)' : 'transparent',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}>
      {icon}
      <span style={{ fontWeight: active ? 700 : 500 }}>{label}</span>
    </div>
  );
}

function ProjectItem({ name, status }: { name: string, status: string }) {
  return (
    <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}>
      <div style={{ fontWeight: 700 }}>{name}</div>
      <div style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>Phase: {status}</div>
    </div>
  );
}
