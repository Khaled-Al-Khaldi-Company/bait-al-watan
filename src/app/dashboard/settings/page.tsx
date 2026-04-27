'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import { Languages, Bell, Shield, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const { data: session } = useSession();
  const toggleLanguage = (lang: string) => {
    // For now, let's just alert that we are switching
    alert(`Switching to ${lang === 'ar' ? 'Arabic' : 'English'}...`);
    // In a real app, this would change the locale cookie and refresh
    window.location.href = lang === 'ar' ? '/dashboard' : '/dashboard';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', direction: 'rtl' }}>
      <Sidebar />
      <main className="main-content-layout" style={{ flex: 1, padding: '2.5rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div onClick={() => window.history.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.75rem' }}>
               العودة للصفحة السابقة <ArrowLeft size={14} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>الإعدادات العامة للنظام ⚙️</h1>
            <p style={{ opacity: 0.7 }}>إدارة اللغة والتنبيهات وإعدادات النظام.</p>
          </div>
        </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Languages size={24} color="hsl(var(--primary))" />
            <div>
              <h3 style={{ margin: 0 }}>Language & Interface</h3>
              <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Choose your preferred language and layout.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <button 
               onClick={() => toggleLanguage('ar')}
               style={{ 
                 padding: '1.5rem', borderRadius: 'var(--radius)', border: '2px solid hsl(var(--primary))', 
                 background: 'hsl(var(--primary) / 0.05)',
                 cursor: 'pointer', textAlign: 'center'
               }}
             >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🇸🇦</div>
                <div style={{ fontWeight: 700 }}>العربية</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>من اليمين لليسار (RTL)</div>
             </button>

             <button 
               onClick={() => toggleLanguage('en')}
               style={{ 
                 padding: '1.5rem', borderRadius: 'var(--radius)', border: '2px solid hsl(var(--border))', 
                 background: 'white',
                 cursor: 'pointer', textAlign: 'center'
               }}
             >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🇺🇸</div>
                <div style={{ fontWeight: 700 }}>English</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Left-to-Right (LTR)</div>
             </button>
          </div>
        </Card>

        <Card className="fade-in" style={{ animationDelay: '0.1s' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
              <Bell size={24} />
              <div>
                <h3 style={{ margin: 0 }}>Notifications</h3>
                <p style={{ fontSize: '0.9rem' }}>Manage alerts for payments and documents.</p>
              </div>
           </div>
        </Card>
      </div>
      </main>
    </div>
  );
}
