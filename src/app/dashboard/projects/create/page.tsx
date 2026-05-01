'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  ArrowRight, Landmark, MapPin, DollarSign, 
  Calendar, ShieldCheck, Loader2, Info, Building2, 
  TrendingUp, CheckCircle2, ChevronLeft, Hash, Layers, Navigation, CreditCard, AlertTriangle, PartyPopper, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateReservationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(3.75);
  const [reservationType, setReservationType] = useState('OFFICIAL');
  
  // States for automatic calculation
  const [plotArea, setPlotArea] = useState<number>(0);
  const [pricePerMeter, setPricePerMeter] = useState<number>(0);
  const [totalValue, setTotalValue] = useState<number>(0);

  // Set mounted to true after initial render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-calculate total value when area or price changes
  useEffect(() => {
    const calculated = plotArea * pricePerMeter;
    setTotalValue(calculated);
  }, [plotArea, pricePerMeter]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const body = {
      name: formData.get('name'),
      description: formData.get('description'),
      reservationCode: formData.get('reservationCode'),
      phaseNumber: formData.get('phaseNumber'),
      neighborhood: formData.get('neighborhood'),
      location: formData.get('location'),
      plotArea: plotArea || 0,
      pricePerMeter: pricePerMeter || 0,
      reservationType: formData.get('reservationType'),
      bookingAccount: formData.get('bookingAccount'),
      totalValue: totalValue || 0,
      reservationFee: parseFloat(formData.get('reservationFee') as string) || 0,
      installmentValue: parseFloat(formData.get('installmentValue') as string) || 0,
      installmentsCount: parseInt(formData.get('installmentsCount') as string) || 0,
      startDate: formData.get('startDate'),
      exchangeRate: parseFloat(formData.get('exchangeRate') as string) || 3.75,
      status: formData.get('reservationType') === 'OFFICIAL' ? 'ALLOCATED' : 'UNDER_STUDY'
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/projects');
        }, 2500);
      } else {
        setError(data.error || 'حدث خطأ أثناء حفظ البيانات. يرجى التحقق من الحقول والمحاولة مرة أخرى.');
      }
    } catch (err) {
      setError('تعذر الاتصال بالخادم. يرجى التأكد من تشغيل النظام.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <div style={{ 
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'white', flexDirection: 'column' as const, gap: '2rem' 
      }}>
         <div className="success-animation" style={{ 
           width: '120px', height: '120px', background: '#f0fdf4', 
           borderRadius: '50%', display: 'flex', alignItems: 'center', 
           justifyContent: 'center', color: '#166534', boxShadow: '0 20px 40px rgba(22, 101, 52, 0.1)' 
         }}>
            <CheckCircle2 size={60} />
         </div>
         <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#064e3b', marginBottom: '1rem' }}>تم توثيق الحجز بنجاح!</h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.6 }}>جاري تحديث سجلات بيت الوطن وإعادة توجيهك...</p>
         </div>
         <div style={{ width: '200px', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
            <div className="progress-loader" style={{ height: '100%', background: '#064e3b' }}></div>
         </div>
         <style dangerouslySetInnerHTML={{ __html: `
            .success-animation { animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .progress-loader { animation: progress 2.5s linear; }
            @keyframes pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes progress { from { width: 0%; } to { width: 100%; } }
         `}} />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', background: '#ffffff', color: '#1e293b', 
      fontFamily: 'var(--font-outfit)', position: 'relative', overflowX: 'hidden' 
    }}>
      {/* Background Abstract Elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px', background: '#f0fdf4', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, opacity: 0.6 }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: '#eff6ff', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, opacity: 0.6 }} />

      {/* Top Navigation Bar */}
      <nav style={{ 
        position: 'relative', zIndex: 10, padding: '2rem 4rem', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <div style={{ width: '45px', height: '45px', background: '#064e3b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 color="white" size={24} />
           </div>
           <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>بوابة بيت الوطن</span>
        </div>
        <Link href="/dashboard/projects">
           <button style={{ 
             background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.8rem 1.5rem', 
             borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem',
             cursor: 'pointer', transition: 'all 0.2s'
           }} onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}>
              <ArrowRight size={18} /> العودة لسجل الحجوزات
           </button>
        </Link>
      </nav>

      {/* Main Creation Flow */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '4rem auto', padding: '0 2rem' }}>
        <header style={{ marginBottom: '5rem', textAlign: 'center' }}>
           <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-2.5px', marginBottom: '1.5rem', color: '#064e3b' }}>حجز أراضي بيت الوطن</h1>
           <p style={{ fontSize: '1.3rem', opacity: 0.5, maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>توثيق رسمي وحساب دقيق للمساحات والقيم المالية لضمان سلامة الأرشفة.</p>
        </header>

        {error && (
          <div style={{ 
            background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', 
            padding: '1.5rem', borderRadius: '20px', marginBottom: '3rem',
            display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 700,
            animation: 'shake 0.5s'
          }}>
             <AlertCircle size={24} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' as const, gap: '5rem' }}>
           
           {/* Section 1: Classification & Type */}
           <section style={{ padding: '3rem', background: '#f8fafc', borderRadius: '40px', border: '1px solid #f1f5f9' }}>
              <SectionHeader number="01" title="تصنيف الحجز وحساب المصدر" subtitle="تحديد نوع الحجز (مبدئي/رسمي) وحساب الحجز المستخدم" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                 <FormGroup label="نوع الحجز" icon={<AlertTriangle size={18} />}>
                    <select 
                      name="reservationType" 
                      value={reservationType} 
                      onChange={(e) => setReservationType(e.target.value)}
                      style={{ ...globalInputStyle, background: 'white' }}
                    >
                       <option value="OFFICIAL">حجز رسمي (للتخصيص) ✅</option>
                       <option value="INITIAL">حجز مبدئي (لفتح المحفظة) 📁</option>
                    </select>
                    {reservationType === 'INITIAL' && (
                      <p style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Info size={14} /> هذا النوع يستخدم فقط لفتح المحافظ المالية ولا يترتب عليه تخصيص.
                      </p>
                    )}
                 </FormGroup>
                 <FormGroup label="حساب الحجز المستخدم" icon={<CreditCard size={18} />}>
                    <select name="bookingAccount" required style={{ ...globalInputStyle, background: 'white' }}>
                       <option value="ACCOUNT_01">الحساب الرسمي الأول (Primary)</option>
                       <option value="ACCOUNT_02">الحساب الرسمي الثاني (Secondary)</option>
                    </select>
                 </FormGroup>
              </div>
           </section>

           {/* Section 2: Reservation Metadata */}
           <section>
              <SectionHeader number="02" title="بيانات المرحلة والتعريف" subtitle="تحديد الكود الرسمي للحجز ورقم المرحلة ببيت الوطن" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                 <FormGroup label="رقم المرحلة" icon={<Layers size={18} />}>
                    <input name="phaseNumber" required placeholder="مثال: المرحلة الخامسة" style={globalInputStyle} />
                 </FormGroup>
                 <FormGroup label="كود الحجز الرسمي" icon={<Hash size={18} />}>
                    <input name="reservationCode" required placeholder="ادخل كود الحجز (رقم الطلب)..." style={globalInputStyle} />
                 </FormGroup>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginTop: '2rem' }}>
                 <FormGroup label="تاريخ البدء" icon={<Calendar size={18} />}>
                    <input name="startDate" type="date" style={globalInputStyle} />
                 </FormGroup>
                 <FormGroup label="وصف إضافي" icon={<Info size={18} />}>
                    <input name="description" placeholder="ملاحظات إضافية عن الحجز..." style={globalInputStyle} />
                 </FormGroup>
              </div>
           </section>

           {/* Section 3: Plot Details */}
           <section>
              <SectionHeader number="03" title="بيانات قطعة الأرض الجغرافية" subtitle="تحديد الموقع الدقيق للقطعة والحي السكني" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                 <FormGroup label="رقم القطعة" icon={<Landmark size={18} />}>
                    <input name="name" required placeholder="مثال: قطعة رقم 110" style={globalInputStyle} />
                 </FormGroup>
                 <FormGroup label="الحي" icon={<Navigation size={18} />}>
                    <input name="neighborhood" required placeholder="مثال: الحي السادس" style={globalInputStyle} />
                 </FormGroup>
                 <FormGroup label="المنطقة" icon={<MapPin size={18} />}>
                    <input name="location" required placeholder="مثال: منطقة ل" style={globalInputStyle} />
                 </FormGroup>
              </div>
           </section>

           {/* Section 4: Financial Foundation */}
           <section style={{ padding: '4rem', background: '#f8fafc', borderRadius: '45px', border: '1px solid #f1f5f9', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
              <SectionHeader number="04" title="البيانات المالية والمساحية" subtitle="تحديد المساحة الإجمالية وسعر المتر المتفق عليه" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5rem', marginBottom: '3rem' }}>
                 <FormGroup label="مساحة الأرض (م2)" icon={<Layers size={18} />}>
                    <input 
                      name="plotArea" 
                      type="number" 
                      required 
                      placeholder="0.00" 
                      style={globalInputStyle} 
                      onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)}
                    />
                 </FormGroup>
                 <FormGroup label="سعر المتر ($)" icon={<DollarSign size={18} />}>
                    <input 
                      name="pricePerMeter" 
                      type="number" 
                      required 
                      placeholder="0.00" 
                      style={globalInputStyle} 
                      onChange={(e) => setPricePerMeter(parseFloat(e.target.value) || 0)}
                    />
                 </FormGroup>
                 <FormGroup label="إجمالي قيمة الأرض ($)" icon={<DollarSign size={18} />}>
                    <div style={{ position: 'relative' }}>
                       <input 
                         name="totalValue" 
                         type="number" 
                         value={totalValue} 
                         readOnly
                         style={{ ...globalInputStyle, paddingLeft: '4rem', background: '#f1f5f9', color: '#064e3b' }} 
                       />
                       <div style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#064e3b', fontSize: '0.9rem' }}>USD</div>
                    </div>
                 </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5rem', marginBottom: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem' }}>
                 <FormGroup label="رسوم الحجز ($)" icon={<DollarSign size={18} />}>
                    <input name="reservationFee" type="number" placeholder="0.00" style={globalInputStyle} />
                 </FormGroup>
                 <FormGroup label="قيمة القسط ($)" icon={<DollarSign size={18} />}>
                    <input name="installmentValue" type="number" placeholder="0.00" style={globalInputStyle} />
                 </FormGroup>
                 <FormGroup label="عدد الأقساط" icon={<Hash size={18} />}>
                    <input name="installmentsCount" type="number" placeholder="0" style={globalInputStyle} />
                 </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem' }}>
                 <FormGroup label="سعر صرف الدولار (SAR/$)" icon={<TrendingUp size={18} />}>
                    <input name="exchangeRate" type="number" step="0.01" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value))} style={{ ...globalInputStyle, background: 'white' }} />
                 </FormGroup>
                 <div style={{ background: '#064e3b', padding: '1.5rem', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>القيمة المعادلة بالريال: <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>{(totalValue * exchangeRate).toLocaleString()} ريال</span></p>
                 </div>
              </div>
           </section>

           {/* Action Bar */}
           <div style={{ 
             marginTop: '2rem', padding: '4rem 0', borderTop: '1px solid #f1f5f9',
             display: 'flex', justifyContent: 'center', gap: '2rem' 
           }}>
              <Link href="/dashboard/projects">
                 <Button variant="secondary" style={{ height: '5rem', padding: '0 4rem', borderRadius: '25px', fontSize: '1.2rem', fontWeight: 800 }}>إلغاء العملية</Button>
              </Link>
              <Button type="submit" disabled={submitting} style={{ 
                height: '5rem', padding: '0 6rem', borderRadius: '25px', fontSize: '1.4rem', fontWeight: 900,
                background: '#064e3b', boxShadow: '0 20px 40px rgba(6, 78, 59, 0.25)', border: 'none'
              }}>
                {submitting ? <Loader2 className="animate-spin" /> : 'تأكيد وحفظ بيانات الحجز'}
              </Button>
           </div>
        </form>
      </main>

      <footer style={{ textAlign: 'center', padding: '6rem', opacity: 0.3, fontSize: '1rem', fontWeight: 600 }}>
         نظام إدارة الاستثمارات - بيت الوطن © 2026 | الأمانة والدقة في التوثيق
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');
        body { background: white; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}} />
    </div>
  );
}

function SectionHeader({ number, title, subtitle }: any) {
  return (
    <div style={{ marginBottom: '3rem' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.8rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#064e3b', background: '#f0fdf4', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{number}</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1e293b' }}>{title}</h2>
       </div>
       <p style={{ fontSize: '1.1rem', opacity: 0.5, paddingRight: '4.5rem' }}>{subtitle}</p>
    </div>
  );
}

function FormGroup({ label, icon, children }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
       <label style={{ fontWeight: 800, fontSize: '1rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {icon} {label}
       </label>
       {children}
    </div>
  );
}

const globalInputStyle = { 
  width: '100%', padding: '1.6rem 2rem', borderRadius: '22px', border: '2px solid #f1f5f9', 
  fontSize: '1.2rem', outline: 'none', fontWeight: 700, color: '#1e293b',
  transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.01)'
};
