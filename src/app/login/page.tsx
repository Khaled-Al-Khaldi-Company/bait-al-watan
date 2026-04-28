'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push('/dashboard');
    } else {
      console.error('Login error:', res?.error);
      alert(res?.error === 'CredentialsSignin' ? 'بيانات الدخول غير صحيحة' : 'حدث خطأ في الاتصال بالخادم: ' + (res?.error || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
      padding: '1rem'
    }}>
      <Card className="fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'hsl(var(--primary))', fontSize: '1.8rem' }}>Bait Al Watan</h2>
          <p style={{ opacity: 0.7 }}>Secure Collaboration Portal</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                padding: '0.75rem', 
                borderRadius: 'var(--radius)', 
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--background))'
              }}
              placeholder="admin@bait-al-watan.com"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                padding: '0.75rem', 
                borderRadius: 'var(--radius)', 
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--background))'
              }}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.6 }}>
          Restricted access for group members only.
        </div>
      </Card>
    </div>
  );
}
