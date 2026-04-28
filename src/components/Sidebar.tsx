'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, Building2, Users, FileText,
  Wallet, Landmark, BarChart3, Settings, LogOut,
  MessageSquare, ChevronRight, ChevronLeft, User, Cloud
} from 'lucide-react';

const EXPANDED_W = 240;
const COLLAPSED_W = 68;

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
    { href: '/dashboard',           icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم' },
    { href: '/dashboard/analytics', icon: <BarChart3 size={20} />,       label: 'تحليل السيولة' },
    { href: '/dashboard/projects',  icon: <Landmark size={20} />,        label: 'الحجوزات' },
    { href: '/dashboard/members',   icon: <Users size={20} />,           label: 'الأعضاء' },
    { href: '/dashboard/finances',  icon: <Wallet size={20} />,          label: 'المالية' },
    { href: '/dashboard/reports',   icon: <BarChart3 size={20} />,       label: 'التقارير' },
    { href: '/dashboard/documents', icon: <FileText size={20} />,        label: 'المستندات' },
    { href: '/dashboard/messages',  icon: <MessageSquare size={20} />,   label: 'المحادثات' },
    { href: '#deploy',              icon: <Cloud size={20} />,           label: 'نشر التحديثات' },
  ];

  const w = isCollapsed ? COLLAPSED_W : EXPANDED_W;

  const handleDeploy = async () => {
    if (confirm('هل أنت متأكد من رغبتك في نشر كافة التعديلات الحالية إلى السحابة؟')) {
      try {
        const res = await fetch('/api/admin/deploy', { method: 'POST' });
        const data = await res.json();
        alert(data.message || 'تم بدء عملية النشر بنجاح!');
      } catch (err) {
        alert('حدث خطأ أثناء محاولة النشر. تأكد من إعدادات الـ Webhook.');
      }
    }
  };

  return (
    <aside
      style={{
        width: `${w}px`,
        minWidth: `${w}px`,
        background: 'linear-gradient(170deg, #064e3b 0%, #043927 60%, #021f16 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        right: 0,
        top: 0,
        zIndex: 100,
        transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), min-width 0.35s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        boxShadow: '-6px 0 24px rgba(0,0,0,0.18)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Toggle Button ─────────────────────────── */}
      <button
        onClick={() => setIsCollapsed(p => !p)}
        title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
        style={{
          position: 'absolute',
          left: '-14px',
          top: '26px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#f59e0b',
          border: '2px solid #064e3b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          zIndex: 120,
          color: '#064e3b',
          transition: 'transform 0.2s',
        }}
      >
        {isCollapsed ? <ChevronRight size={15} strokeWidth={2.5} /> : <ChevronLeft size={15} strokeWidth={2.5} />}
      </button>

      {/* ── Brand ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          padding: isCollapsed ? '1.4rem 0' : '1.4rem 1.1rem',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '0.5rem',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '38px',
            minWidth: '38px',
            height: '38px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
          }}
        >
          <Building2 color="#064e3b" size={20} strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              بيت الوطن
            </div>
            <div style={{ fontSize: '0.6rem', opacity: 0.45, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
              Real Estate Co.
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────── */}
      <div
        className="sidebar-nav-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isCollapsed ? '0.4rem 0.5rem' : '0.4rem 0.7rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {menuItems.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <div
              key={item.href}
              onClick={(e) => {
                if (item.href === '#deploy') {
                  e.preventDefault();
                  handleDeploy();
                }
              }}
              style={{ display: 'contents' }}
            >
              <Link
                href={item.href === '#deploy' ? '#' : item.href}
                title={isCollapsed ? item.label : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '0.65rem',
                  padding: isCollapsed ? '0.7rem' : '0.65rem 0.9rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  background: isActive
                    ? 'rgba(255,255,255,0.12)'
                    : item.href === '#deploy' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  border: isActive
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  transition: 'all 0.2s',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '22%',
                      bottom: '22%',
                      width: '3px',
                      background: '#f59e0b',
                      borderRadius: '0 3px 3px 0',
                    }}
                  />
                )}
                <span
                  style={{
                    color: isActive ? '#fbbf24' : item.href === '#deploy' ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: '20px',
                  }}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Settings + User ───────────────────────── */}
      <div
        style={{
          padding: isCollapsed ? '0.7rem 0.5rem' : '0.7rem 0.7rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        {/* Settings Link */}
        <Link
          href="/dashboard/settings"
          title={isCollapsed ? 'إعدادات النظام' : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '0.65rem',
            padding: isCollapsed ? '0.7rem' : '0.65rem 0.9rem',
            borderRadius: '10px',
            textDecoration: 'none',
            color: pathname === '/dashboard/settings' ? '#ffffff' : 'rgba(255,255,255,0.55)',
            background: pathname === '/dashboard/settings' ? 'rgba(255,255,255,0.12)' : 'transparent',
            border: pathname === '/dashboard/settings' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: '0.88rem',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <Settings size={20} color={pathname === '/dashboard/settings' ? '#fbbf24' : 'rgba(255,255,255,0.5)'} />
          {!isCollapsed && <span>إعدادات النظام</span>}
        </Link>

        {/* User card */}
        <div
          style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            padding: isCollapsed ? '0.6rem' : '0.7rem 0.9rem',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '0.6rem',
            marginTop: '2px',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '32px',
              minWidth: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #065f46, #064e3b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.12)',
              flexShrink: 0,
            }}
          >
            <User size={16} color="rgba(255,255,255,0.85)" />
          </div>

          {!isCollapsed && (
            <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                  }}
                >
                  {user?.name || 'مستخدم النظام'}
                </div>
                <div style={{ fontSize: '0.62rem', opacity: 0.45, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {user?.role === 'ADMIN' ? 'المدير العام' : 'شريك مساهم'}
                </div>
              </div>

              <button
                onClick={() => signOut()}
                title="تسجيل الخروج"
                style={{
                  flexShrink: 0,
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(239,68,68,0.12)',
                  color: '#f87171',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                <LogOut size={15} />
              </button>
            </>
          )}

          {isCollapsed && (
            <button
              onClick={() => signOut()}
              title="تسجيل الخروج"
              style={{
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {/* Logout button in collapsed state */}
        {isCollapsed && (
          <button
            onClick={() => signOut()}
            title="تسجيل الخروج"
            style={{
              width: '100%',
              padding: '0.55rem',
              borderRadius: '9px',
              border: 'none',
              background: 'rgba(239,68,68,0.1)',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <LogOut size={16} />
          </button>
        )}
        {/* Version Indicator */}
        <div style={{ fontSize: '10px', opacity: 0.2, textAlign: 'center', marginTop: '10px' }}>v2.0.5-final</div>
      </div>
    </aside>
  );
}
