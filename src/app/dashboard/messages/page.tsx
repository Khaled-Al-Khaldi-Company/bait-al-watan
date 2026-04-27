'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  Send, Paperclip, Search, ChevronLeft, Loader2, 
  MessageSquare, User, Building2, Clock, LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';

export default function MessagesPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || 'MEMBER';
  const userId = (session?.user as any)?.id;
  
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchMessages(selectedProject.id);
      fetchParticipants(selectedProject.id);
    }
  }, [selectedProject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (projectId: string) => {
    try {
      const res = await fetch(`/api/reports/reservations`);
      const data = await res.json();
      // Filter for this project only
      const projectParts = data.filter((p: any) => p.projectId === projectId || p.projectName === selectedProject?.name);
      setParticipants(projectParts);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (projectId: string) => {
    setChatLoading(true);
    try {
      const res = await fetch(`/api/messages?projectId=${projectId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedProject || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          content: newMessage
        })
      });
      
      if (res.ok) {
        const msg = await res.json();
        setMessages([...messages, msg]);
        setNewMessage('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleMentionClick = (name: string) => {
    const parts = newMessage.split('@');
    parts.pop();
    setNewMessage(parts.join('@') + '@' + name + ' ');
    setShowMentions(false);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewMessage(val);
    if (val.endsWith('@')) {
      setShowMentions(true);
    } else if (showMentions && !val.includes('@')) {
      setShowMentions(false);
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <Loader2 className="animate-spin" size={48} color="#064e3b" />
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f4f8', overflow: 'hidden', direction: 'rtl' }}>
      <Sidebar />
      
      {/* Projects Sidebar */}
      <div className="main-content-layout" style={{ width: '350px', background: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9' }}>
           <div onClick={() => window.history.back()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.6, marginBottom: '1.5rem' }}>
              العودة للصفحة السابقة <ChevronLeft size={14} />
           </div>
           <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>المحادثات 💬</h2>
           <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>تواصل مباشر حول مشاريعك</p>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {projects.map(p => (
            <div 
              key={p.id}
              onClick={() => setSelectedProject(p)}
              style={{ 
                padding: '1.25rem', borderRadius: '16px', cursor: 'pointer',
                background: selectedProject?.id === p.id ? '#f0fdf4' : 'transparent',
                border: selectedProject?.id === p.id ? '1px solid #bcf0da' : '1px solid transparent',
                transition: 'all 0.2s', marginBottom: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Building2 size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{p.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.5 }}>{p.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        {selectedProject ? (
          <>
            <header style={{ padding: '1.5rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800 }}>{selectedProject.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.5 }}>مكتب التواصل الموحد</p>
                </div>
              </div>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {chatLoading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 className="animate-spin" size={32} color="#064e3b" />
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = m.userId === userId;
                  // Basic highlight for mentions in display
                  const content = m.content.split(' ').map((word: string, i: number) => {
                    if (word.startsWith('@')) return <span key={i} style={{ color: '#2563eb', fontWeight: 700 }}>{word} </span>;
                    return word + ' ';
                  });

                  return (
                    <div 
                      key={m.id} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                         <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{m.user?.name}</span>
                         <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ 
                        padding: '1rem 1.5rem', 
                        borderRadius: isMe ? '20px 20px 2px 20px' : '20px 20px 20px 2px',
                        background: isMe ? '#064e3b' : 'white',
                        color: isMe ? 'white' : 'inherit',
                        boxShadow: isMe ? '0 10px 15px -3px rgba(6, 78, 59, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                        fontSize: '1rem',
                        lineHeight: 1.6
                      }}>
                        {content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: '1.5rem 2rem', background: 'white', borderTop: '1px solid #e2e8f0', position: 'relative' }}>
               {showMentions && (
                 <Card style={{ position: 'absolute', bottom: '100%', right: '2rem', width: '250px', marginBottom: '0.5rem', zIndex: 50, padding: '0.5rem', boxShadow: '0 -10px 20px rgba(0,0,0,0.1)' }}>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, padding: '0.4rem' }}>أشر لمساهم في المشروع:</p>
                    {participants.map((p, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleMentionClick(p.userName)}
                        style={{ padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.9rem' }}
                        className="hover:bg-slate-100"
                      >
                        {p.userName}
                      </div>
                    ))}
                    {participants.length === 0 && <p style={{ padding: '0.5rem', fontSize: '0.85rem', opacity: 0.6 }}>لا يوجد مساهمين آخرين</p>}
                 </Card>
               )}
               <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={onInputChange}
                      placeholder="اكتب رسالتك هنا... (استخدم @ للإشارة)"
                      style={{ 
                        width: '100%', padding: '1rem 1.5rem', borderRadius: '16px', 
                        border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none',
                        fontSize: '1rem', textAlign: 'right'
                      }}
                    />
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '0.5rem' }}>
                       <Paperclip size={20} style={{ opacity: 0.3, cursor: 'pointer' }} />
                    </div>
                  </div>
                  <Button type="submit" disabled={sending || !newMessage.trim()} style={{ width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {sending ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                  </Button>
               </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
             <MessageSquare size={80} style={{ marginBottom: '1.5rem' }} />
             <h3>اختر مشروعاً لبدء المحادثة</h3>
          </div>
        )}
      </div>
    </div>
  );
}
