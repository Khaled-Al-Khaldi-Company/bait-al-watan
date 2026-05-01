'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Users, FileText,
  Wallet, Landmark, BarChart3, Settings, LogOut,
  MessageSquare, ChevronRight, ChevronLeft, User, Cloud,
  Zap, ShieldCheck, Crown, Globe
} from 'lucide-react';

const EXPANDED_W = 280; 
const COLLAPSED_W = 80;

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isMobile ? '0px' : (isCollapsed ? `${COLLAPSED_W}px` : `${EXPANDED_W}px`)
    );
  }, [isCollapsed, isMobile]);

  const menuItems = [
    { href: '/dashboard',           icon: <LayoutDashboard size={22} />, label: 'الرئيسية' },
    { href: '/dashboard/analytics', icon: <BarChart3 size={22} />,       label: 'السيولة' },
    { href: '/dashboard/projects',  icon: <Landmark size={22} />,        label: 'الحجوزات' },
    { href: '/dashboard/reservations', icon: <Users size={22} />,        label: 'الحصص' },
    ...(user?.role !== 'VIEWER' ? [{ href: '/dashboard/members', icon: <Users size={22} />, label: 'الأعضاء' }] : []),
    { href: '/dashboard/finances',  icon: <Wallet size={22} />,          label: 'المالية' },
    { href: '/dashboard/resources', icon: <Globe size={22} />,           label: 'روابط' },
    { href: '/dashboard/documents', icon: <FileText size={22} />,        label: 'الأرشيف' },
  ];

  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(6, 78, 59, 0.95)',
        backdropFilter: 'blur(10px)',
        height: '70px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 1rem',
        zIndex: 2000,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.2)'
      }}>
        {menuItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ transform: isActive ? 'scale(1.1) translateY(-2px)' : 'scale(1)', transition: 'all 0.2s' }}>
                {item.icon}
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>{item.label}</span>
            </Link>
          );
        })}
        <button onClick={() => signOut()} style={{ background: 'none', border: 'none', color: '#f87171' }}>
          <LogOut size={22} />
        </button>
      </nav>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? COLLAPSED_W : EXPANDED_W }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        background: 'linear-gradient(185deg, #064e3b 0%, #042f2e 40%, #021a14 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        right: 0,
        top: 0,
        zIndex: 1000,
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
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
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
        </motion.div>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ fontWeight: 950, fontSize: '1.4rem', letterSpacing: '-0.5px', color: '#fef3c7' }}>
                بيت الوطن
              </div>
              <div style={{ fontSize: '0.65rem', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 800 }}>
                Luxury Living
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ────────────────────────────── */}
      <motion.div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isCollapsed ? '0.5rem' : '0.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: -5, background: 'rgba(255,255,255,0.05)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '1rem',
                  padding: isCollapsed ? '1rem' : '0.9rem 1.2rem',
                  borderRadius: '16px',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.95rem',
                  transition: 'all 0.2s',
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  position: 'relative'
                }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    style={{ 
                      position: 'absolute', right: 0, width: '4px', height: '20px', 
                      background: '#fbbf24', borderRadius: '4px 0 0 4px' 
                    }} 
                  />
                )}
                <span style={{ color: isActive ? '#fbbf24' : 'inherit' }}>
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

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
        <motion.div 
          whileHover={{ scale: 1.02 }}
          style={{ 
            background: 'rgba(255,255,255,0.04)', 
            borderRadius: '20px', 
            padding: isCollapsed ? '0.8rem' : '1rem',
            display: 'flex', 
            alignItems: 'center',
            gap: '0.8rem',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
           <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color="#042f2e" />
           </div>
           {!isCollapsed && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               style={{ flex: 1, overflow: 'hidden' }}
             >
                <div style={{ fontWeight: 900, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'المدير'}</div>
                <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 800 }}>{user?.role === 'ADMIN' ? 'التحكم الكامل' : 'مراقب نظام'}</div>
             </motion.div>
           )}
        </motion.div>

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
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
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
      </motion.button>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          main {
            padding: 1rem !important;
            padding-bottom: 100px !important;
          }
          header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.5rem !important;
          }
          h1 { font-size: 1.8rem !important; }
          .stat-grid { grid-template-columns: 1fr !important; }
          .card-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </motion.aside>
  );
}
