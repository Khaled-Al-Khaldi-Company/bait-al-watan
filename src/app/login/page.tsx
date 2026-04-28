'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Card, Button } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('يرجى إدخال البريد وكلمة المرور');
      return;
    }

    setLoading(true);
    console.log('Login attempt start...');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('Login response:', res);

      if (res?.ok) {
        window.location.href = '/dashboard';
      } else {
        alert(res?.error === 'CredentialsSignin' ? 'بيانات الدخول غير صحيحة' : 'حدث خطأ: ' + (res?.error || 'Unknown'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      alert('خطأ تقني: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#064e3b',
      padding: '1rem'
    }}>
      <Card className="fade-in" style={{ width: '100%', maxWidth: '400px', padding: '3rem', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ color: '#064e3b', fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>بيت الوطن</h2>
          <p style={{ opacity: 0.6, fontWeight: 700 }}>Secure Collaboration Portal</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="admin@bait-al-watan.com"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <Button 
            onClick={handleLogin} 
            disabled={loading} 
            style={{ 
              width: '100%', 
              height: '3.8rem', 
              borderRadius: '16px', 
              fontSize: '1.1rem', 
              fontWeight: 900,
              background: '#064e3b',
              marginTop: '1rem'
            }}
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </Button>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.85rem', opacity: 0.4, fontWeight: 700 }}>
          نظام التعاون العقاري | جميع الحقوق محفوظة 2025
        </div>
      </Card>
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
  outline: 'none',
  transition: 'all 0.2s'
};
