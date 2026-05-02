'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Clock, User, ArrowLeft, Loader2, RefreshCcw, Activity, Wallet, Landmark, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ActivityReport() {
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/activity');
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl' }}>
      <Sidebar />
      <main className="main-content-layout" style={{ flex: 1, padding: '2rem' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div onClick={() => router.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
               العودة للصفحة السابقة <ChevronLeft size={14} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>سجل النشاط والعمليات 🕒</h1>
            <p style={{ opacity: 0.6 }}>تتبع زمني لجميع التحركات المالية والإدارية داخل النظام.</p>
          </div>
          <Button onClick={fetchActivities} variant="secondary" style={{ borderRadius: '12px' }}>
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> تحديث السجل
          </Button>
        </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Loader2 className="animate-spin" size={48} color="#064e3b" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '900px', margin: '0 auto' }}>
          {activities.map((act, idx) => (
            <Card key={act.id} style={{ 
              padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', 
              background: 'white', display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
            }}>
              <div style={{ 
                width: '50px', height: '50px', borderRadius: '14px', 
                background: act.type === 'TRANSACTION' ? '#ecfdf5' : '#f1f5f9',
                color: act.type === 'TRANSACTION' ? '#059669' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {act.type === 'TRANSACTION' ? <Wallet size={24} /> : <Activity size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>{act.action}</h4>
                  <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>{new Date(act.timestamp).toLocaleString('ar-EG')}</span>
                </div>
                <p style={{ margin: '0 0 0.8rem 0', opacity: 0.6, fontSize: '0.95rem' }}>{act.details || 'تم إجراء عملية في النظام'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#064e3b' }}>
                  <User size={14} /> {act.userName}
                </div>
              </div>
            </Card>
          ))}
          {activities.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.4 }}>
               لا توجد نشاطات مسجلة حالياً.
            </div>
          )}
        </div>
      )}
      </main>
    </div>
  );
}
