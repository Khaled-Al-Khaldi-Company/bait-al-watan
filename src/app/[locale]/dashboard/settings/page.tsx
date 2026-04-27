'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import { Languages, Globe, Bell, Shield, Moon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = (locale: string) => {
    // Basic locale switcher logic
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '2rem' }}>Settings</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Languages size={24} color="hsl(var(--primary))" />
            <div>
              <h3 style={{ margin: 0 }}>Language & Regional</h3>
              <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Select your preferred language and interface direction.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <button 
               onClick={() => toggleLanguage('ar')}
               style={{ 
                 padding: '1.5rem', borderRadius: 'var(--radius)', border: '2px solid hsl(var(--primary))', 
                 background: pathname.startsWith('/ar') ? 'hsl(var(--primary) / 0.05)' : 'white',
                 cursor: 'pointer', textAlign: 'center'
               }}
             >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🇸🇦</div>
                <div style={{ fontWeight: 700 }}>العربية</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Right-to-Left (RTL)</div>
             </button>

             <button 
               onClick={() => toggleLanguage('en')}
               style={{ 
                 padding: '1.5rem', borderRadius: 'var(--radius)', border: '2px solid hsl(var(--border))', 
                 background: pathname.startsWith('/en') ? 'hsl(var(--primary) / 0.05)' : 'white',
                 cursor: 'pointer', textAlign: 'center'
               }}
             >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🇺🇸</div>
                <div style={{ fontWeight: 700 }}>English</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Left-to-Right (LTR)</div>
             </button>
          </div>
        </Card>

        <Card>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
              <Bell size={24} />
              <div>
                <h3 style={{ margin: 0 }}>Notifications</h3>
                <p style={{ fontSize: '0.9rem' }}>Manage your alert preferences.</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>Coming Soon</div>
           </div>
        </Card>

        <Card>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
              <Shield size={24} />
              <div>
                <h3 style={{ margin: 0 }}>Security</h3>
                <p style={{ fontSize: '0.9rem' }}>Change password and session settings.</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>Coming Soon</div>
           </div>
        </Card>
      </div>
    </div>
  );
}
