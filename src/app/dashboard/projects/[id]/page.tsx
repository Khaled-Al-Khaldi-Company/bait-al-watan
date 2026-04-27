'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function ProjectDetails() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', direction: 'rtl' }}>
      <Sidebar />
      <main className="main-content-layout" style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>تفاصيل الحجز (قيد الإصلاح)</h1>
        <p>جاري تحديث النظام لضمان أفضل تجربة مستخدم...</p>
      </main>
    </div>
  );
}
