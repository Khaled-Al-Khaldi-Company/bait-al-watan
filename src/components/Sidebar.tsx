'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, Building2, Users, FileText,
  Wallet, Landmark, BarChart3, Settings, LogOut,
  MessageSquare, ChevronRight, ChevronLeft, User, Cloud,
  Zap, ShieldCheck, Crown
} from 'lucide-react';

const EXPANDED_W = 280; // Wider for luxury feel
const COLLAPSED_W = 80;

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? `${COLLAPSED_W}px` : `${EXPANDED_W}px`
    );
  }, [isCollapsed]);

  const menuItems = [
    { href: '/dashboard',           icon: <LayoutDashboard size={22} />, label: 'لوحة التحكم' },
    { href: '/dashboard/analytics', icon: <BarChart3 size={22} />,       label: 'تحليل السيولة' },
    { href: '/dashboard/projects',  icon: <Landmark size={22} />,        label: 'سجل الحجوزات' },
    { href: '/dashboard/members',   icon: <Users size={22} />,           label: 'إدارة الأعضاء' },
    { href: '/dashboard/finances',  icon: <Wallet size={22} />,          label: 'الحركة المالية' },
    { href: '/dashboard/reports',   icon: <Zap size={22} />,             label: 'تقارير الأداء' },
    { href: '/dashboard/documents', icon: <FileText size={22} />,        label: 'الأرشيف الرقمي' },
    { href: '/dashboard/messages',  icon: <MessageSquare size={22} />,   label: 'المراسلات' },
  ];

  const w = isCollapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <aside
      style={{
        width: `${w}px`,
        minWidth: `${w}px`,
        background: 'linear-gradient(185deg, #042f2e 0%, #064e3b 40%, #022c22 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        right: 0,
        top: 0,
        zIndex: 1000,
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* ── Brand / Logo ─────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: isCollapsed ? '2rem 0' : '2.5rem 1.8rem',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            width: '45px',
            height: '45px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(245,158,11,0.3)',
            flexShrink: 0
          }}
        >
          <Building2 color="#042f2e" size={24} strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 950, fontSize: '1.4rem', letterSpacing: '-0.5px', color: '#fef3c7' }}>
              بيت الوطن
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800 }}>
              Luxury Living
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isCollapsed ? '0.5rem' : '0.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {menuItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '1rem',
                padding: isCollapsed ? '1rem' : '0.9rem 1.2rem',
                borderRadius: '16px',
                textDecoration: 'none',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}
            >
              <span style={{ color: isActive ? '#fbbf24' : 'inherit' }}>
                {item.icon}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* ── Bottom Section ───────────────────────── */}
      <div
        style={{
          padding: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* User Card */}
        <div style={{ 
          background: 'rgba(255,255,255,0.04)', 
          borderRadius: '20px', 
          padding: isCollapsed ? '0.8rem' : '1rem',
          display: 'flex', 
          alignItems: 'center',
          gap: '0.8rem',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color="#042f2e" />
           </div>
           {!isCollapsed && (
             <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 900, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'المدير'}</div>
                <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 800 }}>التحكم الكامل</div>
             </div>
           )}
        </div>

        <button 
          onClick={() => signOut()}
          style={{
            width: '100%',
            height: '3.5rem',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem',
            fontWeight: 800
          }}
        >
           <LogOut size={20} /> {!isCollapsed && 'خروج آمن'}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          top: '2.5rem',
          left: isCollapsed ? '25px' : '20px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#fbbf24',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1100,
          color: '#042f2e'
        }}
      >
        {isCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </aside>
  );
}
