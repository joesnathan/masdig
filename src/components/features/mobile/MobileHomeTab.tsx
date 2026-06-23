// MobileHomeTab.tsx - Home (Beranda) view for JogjaOne Mobile App (Version 2)
import React, { useState, useEffect } from 'react';
import { speak } from '@/utils/speech';

interface Ticket {
  id: string;
  title: string;
  location: string;
  status: 'Terkirim' | 'Dalam Proses' | 'Selesai';
  source: 'Edge-AI Fleet Camera' | 'Smart Grate Sensor' | 'Laporan Warga';
  time: string;
  details: string;
}

interface MobileHomeTabProps {
  onNavigate: (tab: 'home' | 'mobilitas' | 'lingkungan' | 'kesehatan' | 'lapor' | 'layanan') => void;
  tickets: Ticket[];
  v2xActive: boolean;
  username?: string;
  sampahBalance?: number;
  jogjaPayBalance?: number;
  setJogjaPayBalance?: React.Dispatch<React.SetStateAction<number>>;
  onDrawerStateChange?: (isOpen: boolean) => void;
}

const getFs = (size: number) => `calc(${size}px * var(--font-scale))`;

// ----------------- SVG Icons Helper collection -----------------
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SunIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" fill="#FFD700" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const ChevronRightIcon = ({ color = '#666' }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const BusServiceIcon = () => (
  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4" width="14" height="16" rx="2" ry="2" />
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="9" y1="22" x2="9" y2="22" />
      <line x1="15" y1="22" x2="15" y2="22" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  </div>
);

const HeartServiceIcon = () => (
  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FCE8E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D93025" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  </div>
);

const AlertServiceIcon = () => (
  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF7E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B06000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  </div>
);

const RecycleServiceIcon = () => (
  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E6F4EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#137333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  </div>
);

export default function MobileHomeTab({ onNavigate, tickets, username, sampahBalance = 45000, jogjaPayBalance = 45500, setJogjaPayBalance, onDrawerStateChange }: MobileHomeTabProps) {
  // Real weather fetch states
  const [weatherTemp, setWeatherTemp] = useState<number>(28);
  const [weatherDesc, setWeatherDesc] = useState<string>('Cerah berawan');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showTopUpDrawer, setShowTopUpDrawer] = useState<boolean>(false);
  const [customTopUpAmount, setCustomTopUpAmount] = useState<string>('');
  const [selectedTopUpMethod, setSelectedTopUpMethod] = useState<'qris' | 'va' | 'bank'>('qris');

  useEffect(() => {
    onDrawerStateChange?.(showTopUpDrawer || showNotifications);
  }, [showTopUpDrawer, showNotifications, onDrawerStateChange]);

  useEffect(() => {
    // Fetch live weather data for Yogyakarta
    fetch('https://api.open-meteo.com/v1/forecast?latitude=-7.7956&longitude=110.3695&current=temperature_2m,weather_code')
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          const temp = Math.round(data.current.temperature_2m);
          setWeatherTemp(temp);
          
          const code = data.current.weather_code;
          let desc = 'Cerah berawan';
          if (code === 0) desc = 'Cerah';
          else if (code === 1 || code === 2) desc = 'Cerah berawan';
          else if (code === 3) desc = 'Berawan';
          else if (code >= 45 && code <= 48) desc = 'Kabut';
          else if (code >= 51 && code <= 55) desc = 'Gerimis';
          else if (code >= 61 && code <= 65) desc = 'Hujan';
          else if (code >= 80 && code <= 82) desc = 'Hujan deras';
          else if (code >= 95) desc = 'Hujan badai petir';
          
          setWeatherDesc(desc);
        }
      })
      .catch(err => console.error('Gagal mengambil data cuaca:', err));
  }, []);

  // Parse dynamic queue number from tickets if exists
  const healthTicket = tickets.find(t => t.id.startsWith('HCS') || t.title.includes('Antrean'));
  let queueNo = 'B4';
  if (healthTicket) {
    const match = healthTicket.details.match(/Antrean:\s*([A-Za-z0-9-]+)/);
    if (match && match[1]) {
      queueNo = match[1];
    }
  }

  // Format today's date dynamically
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
  };

  return (
    <div 
      className="animate-slide-up" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100%', 
        background: '#F4F6F9', 
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      
      {/* 1. Header block */}
      <div 
        style={{
          background: 'linear-gradient(180deg, #1A73E8 0%, #1557B0 100%)',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
          padding: 'calc(24px * var(--font-scale)) calc(16px * var(--font-scale)) calc(28px * var(--font-scale)) calc(16px * var(--font-scale))',
          color: 'white',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 15px rgba(26,115,232,0.12)'
        }}
      >
        {/* Date & Settings */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: getFs(10), color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
            {getFormattedDate()}
          </span>
          <button 
            onClick={() => {
              setShowNotifications(true);
              speak("Tidak ada pemberitahuan baru. Semua sistem kota Yogyakarta terpantau aman dan kondusif.", true);
            }}
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: 'none', 
              color: 'white', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}
          >
            <BellIcon />
          </button>
        </div>

        <div>
          <h2 style={{ fontSize: getFs(20), fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: 'white' }}>
            Selamat Datang
          </h2>
          <strong style={{ fontSize: getFs(16), fontWeight: 600, display: 'block', marginTop: '2px', color: 'rgba(255, 255, 255, 0.9)' }}>
            {username || 'Budi Santoso'}
          </strong>
        </div>

        {/* Weather Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SunIcon />
            <div>
              <strong style={{ display: 'block', fontSize: getFs(12), fontWeight: 700, color: 'white' }}>Yogyakarta</strong>
              <span style={{ fontSize: getFs(10), color: 'rgba(255, 255, 255, 0.75)' }}>{weatherDesc}</span>
            </div>
          </div>
          <strong style={{ fontSize: getFs(24), fontWeight: 800, color: 'white' }}>{weatherTemp}°</strong>
        </div>

        {/* JogjaPay Wallet Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box',
          color: '#1C1E21',
          border: '1px solid #E0E0E0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          marginTop: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: getFs(20) }}>💳</span>
            <div>
              <span style={{ fontSize: getFs(9), color: 'var(--text-muted)', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo JogjaPay</span>
              <strong style={{ fontSize: getFs(14), color: '#1C1E21' }}>Rp {jogjaPayBalance.toLocaleString('id-ID')}</strong>
            </div>
          </div>
          <button 
            onClick={() => {
              setShowTopUpDrawer(true);
              speak("Membuka laci isi ulang saldo JogjaPay.");
            }}
            style={{
              background: '#E8F0FE',
              border: 'none',
              borderRadius: '10px',
              padding: '6px 12px',
              color: '#1A73E8',
              fontSize: getFs(10),
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            + Top Up
          </button>
        </div>

        {/* Overlapping City Status Pill */}
        <div style={{
          position: 'absolute',
          bottom: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          borderRadius: '20px',
          padding: '6px 16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: getFs(10),
          fontWeight: 'bold',
          color: '#1A73E8',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E0E0E0',
          zIndex: 10,
          whiteSpace: 'nowrap'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#137333', display: 'inline-block' }}></span>
          Kota Status: Normal
        </div>
      </div>

      {/* 2. Main Scroll Content */}
      <div style={{ padding: 'calc(24px * var(--font-scale)) calc(16px * var(--font-scale)) calc(88px * var(--font-scale)) calc(16px * var(--font-scale))', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
        
        {/* LAYANAN UTAMA Section */}
        <div>
          <strong style={{ fontSize: getFs(9), fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>
            Layanan Utama
          </strong>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Mobilitas */}
            <div 
              onClick={() => onNavigate('mobilitas')}
              style={{
                background: '#E8F0FE',
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(26,115,232,0.03)',
                border: '1px solid rgba(26,115,232,0.05)'
              }}
            >
              <BusServiceIcon />
              <strong style={{ fontSize: getFs(13), color: '#1C1E21', display: 'block', marginTop: '4px' }}>Mobilitas</strong>
              <span style={{ fontSize: getFs(9), color: '#1A73E8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Buka layanan <ChevronRightIcon color="#1A73E8" />
              </span>
            </div>

            {/* Kesehatan */}
            <div 
              onClick={() => onNavigate('kesehatan')}
              style={{
                background: '#FCE8E6',
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(217,48,37,0.03)',
                border: '1px solid rgba(217,48,37,0.05)'
              }}
            >
              <HeartServiceIcon />
              <strong style={{ fontSize: getFs(13), color: '#1C1E21', display: 'block', marginTop: '4px' }}>Kesehatan</strong>
              <span style={{ fontSize: getFs(9), color: '#D93025', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Buka layanan <ChevronRightIcon color="#D93025" />
              </span>
            </div>

            {/* Lapor */}
            <div 
              onClick={() => onNavigate('lapor')}
              style={{
                background: '#FEF7E0',
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(176,96,0,0.03)',
                border: '1px solid rgba(176,96,0,0.05)'
              }}
            >
              <AlertServiceIcon />
              <strong style={{ fontSize: getFs(13), color: '#1C1E21', display: 'block', marginTop: '4px' }}>Lapor</strong>
              <span style={{ fontSize: getFs(9), color: '#B06000', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Buka layanan <ChevronRightIcon color="#B06000" />
              </span>
            </div>

            {/* Layanan/Lingkungan */}
            <div 
              onClick={() => onNavigate('lingkungan')}
              style={{
                background: '#E6F4EA',
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(24,128,56,0.03)',
                border: '1px solid rgba(24,128,56,0.05)'
              }}
            >
              <RecycleServiceIcon />
              <strong style={{ fontSize: getFs(13), color: '#1C1E21', display: 'block', marginTop: '4px' }}>Layanan</strong>
              <span style={{ fontSize: getFs(9), color: '#137333', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Buka layanan <ChevronRightIcon color="#137333" />
              </span>
            </div>
          </div>
        </div>

        {/* AKTIVITAS TERBARU Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <strong style={{ fontSize: getFs(9), fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Aktivitas Terbaru
            </strong>
            <span 
              onClick={() => onNavigate('lapor')}
              style={{ fontSize: getFs(10), color: '#1A73E8', fontWeight: 600, cursor: 'pointer' }}
            >
              Lihat semua
            </span>
          </div>

          {/* Activities Card Panel */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #E0E0E0',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            {/* Act 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#E6F4EA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#137333',
                fontSize: getFs(14),
                fontWeight: 'bold'
              }}>
                ✓
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: getFs(11), color: '#1C1E21' }}>Janji Poli berhasil dibuat</strong>
                <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>Baru saja</span>
              </div>
            </div>

            {/* Act 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#FEF7E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#B06000',
                fontSize: getFs(13)
              }}>
                🔧
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: getFs(11), color: '#1C1E21' }}>Laporan jalan berlubang diproses</strong>
                <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>1j lalu</span>
              </div>
            </div>

            {/* Act 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#E6F4EA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#137333',
                fontSize: getFs(13)
              }}>
                ♻️
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: getFs(11), color: '#1C1E21' }}>Penjemputan sampah berhasil</strong>
                <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>3j lalu</span>
              </div>
            </div>
          </div>
        </div>

        {/* THREE STAT CARDS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {/* Card 1 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E0E0E0',
            padding: '12px 6px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
          }}>
            <strong style={{ fontSize: getFs(18), color: '#1A73E8', fontWeight: 800 }}>98%</strong>
            <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', fontWeight: 500 }}>Trans Akurasi</span>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E0E0E0',
            padding: '12px 6px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
          }}>
            <strong style={{ fontSize: getFs(18), color: '#137333', fontWeight: 800 }}>{queueNo}</strong>
            <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', fontWeight: 500 }}>Antrian Anda</span>
          </div>

          {/* Card 3 */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E0E0E0',
            padding: '12px 6px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
          }}>
            <strong style={{ fontSize: getFs(18), color: '#B06000', fontWeight: 800 }}>
              {Math.round(sampahBalance / 1000)}K
            </strong>
            <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', fontWeight: 500 }}>Poin Anda</span>
          </div>
        </div>

      </div>

      {/* 4. Top Up Slide-up Drawer Overlay */}
      {showTopUpDrawer && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'flex-end',
          animation: 'fade-in 0.2s ease'
        }}>
          <div 
            className="animate-slide-up"
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 24px',
              boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxSizing: 'border-box',
              maxHeight: '85%',
              overflowY: 'auto',
              paddingBottom: '80px'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', alignSelf: 'center', cursor: 'pointer' }} onClick={() => setShowTopUpDrawer(false)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: getFs(13), color: 'var(--accent-blue)' }}>💳 Top Up JogjaPay</strong>
              <button onClick={() => setShowTopUpDrawer(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: getFs(16), cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div>
              <span style={{ fontSize: getFs(9), color: 'var(--text-muted)', display: 'block' }}>Saldo Saat Ini</span>
              <strong style={{ fontSize: getFs(16), color: 'var(--text-primary)' }}>Rp {(jogjaPayBalance || 0).toLocaleString('id-ID')}</strong>
            </div>

            {/* Quick Amounts */}
            <div>
              <label style={{ fontSize: getFs(9), fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Pilih Nominal:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[10000, 20000, 50000, 100000, 200000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setCustomTopUpAmount(String(amt));
                      speak(`Nominal ${amt.toLocaleString('id-ID')} rupiah dipilih.`);
                    }}
                    style={{
                      background: customTopUpAmount === String(amt) ? '#E8F0FE' : 'var(--bg-tertiary)',
                      border: customTopUpAmount === String(amt) ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                      color: customTopUpAmount === String(amt) ? 'var(--accent-blue)' : 'var(--text-primary)',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      fontSize: getFs(9.5),
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.1s'
                    }}
                  >
                    Rp {amt.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label style={{ fontSize: getFs(9), fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nominal Kustom (Rp):</label>
              <input
                type="number"
                placeholder="Masukkan nominal lainnya..."
                value={customTopUpAmount}
                onChange={(e) => setCustomTopUpAmount(e.target.value)}
                className="modern-input"
                style={{ padding: '8px 12px', fontSize: getFs(11) }}
              />
            </div>

            {/* Payment Methods */}
            <div>
              <label style={{ fontSize: getFs(9), fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Metode Pembayaran:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'qris', label: 'QRIS (Gopay/OVO/Dana/LinkAja)', icon: '📱' },
                  { id: 'va', label: 'Virtual Account (BPD DIY / Mandiri / BNI)', icon: '🏛️' },
                  { id: 'bank', label: 'Transfer Bank Manual', icon: '🏦' }
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedTopUpMethod(m.id as any);
                      speak(`Metode pembayaran ${m.label} dipilih.`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '10px',
                      border: selectedTopUpMethod === m.id ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: getFs(12) }}>{m.icon}</span>
                      <span style={{ fontSize: getFs(9.5), color: 'var(--text-primary)', fontWeight: 500 }}>{m.label}</span>
                    </div>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: selectedTopUpMethod === m.id ? '4px solid var(--accent-blue)' : '2.5px solid #ccc',
                      boxSizing: 'border-box'
                    }} />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const amt = parseInt(customTopUpAmount) || 0;
                if (amt < 5000) {
                  speak("Gagal. Minimal isi ulang adalah lima ribu rupiah.", true);
                  return;
                }
                if (setJogjaPayBalance) {
                  setJogjaPayBalance(prev => prev + amt);
                }
                speak(`Berhasil isi ulang saldo JogjaPay sebesar ${amt} rupiah. Saldo Anda sekarang Rp ${((jogjaPayBalance || 0) + amt).toLocaleString('id-ID')}.`, true);
                setCustomTopUpAmount('');
                setShowTopUpDrawer(false);
              }}
              className="btn-premium"
              style={{
                background: 'var(--accent-blue)',
                padding: '10px',
                fontSize: getFs(11),
                borderRadius: '16px',
                marginTop: '4px',
                width: '100%'
              }}
            >
              Isi Saldo Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Visual Notification Modal bell trigger */}
      {showNotifications && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 2100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div 
            className="animate-slide-up"
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              padding: '24px 20px',
              width: '100%',
              maxWidth: '300px',
              border: '2px solid var(--accent-blue)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: getFs(28) }}>🔔</span>
            <strong style={{ fontSize: getFs(14), color: 'var(--text-primary)', display: 'block' }}>
              Notifikasi JogjaOne
            </strong>
            <p style={{ fontSize: getFs(11), color: 'var(--text-secondary)', lineHeight: 1.4, margin: '8px 0' }}>
              Tidak ada pemberitahuan baru. Semua sistem kota Yogyakarta terpantau aman, lancar, dan kondusif.
            </p>
            <button
              onClick={() => setShowNotifications(false)}
              className="btn-premium"
              style={{
                background: 'var(--accent-blue)',
                padding: '10px 20px',
                fontSize: getFs(11),
                borderRadius: '16px',
                width: '100%',
                marginTop: '8px'
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
