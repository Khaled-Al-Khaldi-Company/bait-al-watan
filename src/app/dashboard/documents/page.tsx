'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DocumentExplorer from '@/components/DocumentExplorer';
import { ChevronLeft, LogOut } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function DocumentsPage() {
  const router = useRouter();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', direction: 'rtl' }}>
      <Sidebar />
      <main className="main-content-layout" style={{ flex: 1, padding: '2.5rem' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div onClick={() => router.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.75rem' }}>
               العودة للصفحة السابقة <ChevronLeft size={14} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>مركز المستندات 📂</h1>
            <p style={{ opacity: 0.7 }}>إدارة كافة الأوراق، الإيصالات، والخرائط الخاصة بالمشاريع.</p>
          </div>
        </header>

        <DocumentExplorer />
      </main>
    </div>
  );
}
