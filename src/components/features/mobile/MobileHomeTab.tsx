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
}

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

export default function MobileHomeTab({ onNavigate, tickets, username, sampahBalance = 45000 }: MobileHomeTabProps) {
  // Real weather fetch states
  const [weatherTemp, setWeatherTemp] = useState<number>(28);
  const [weatherDesc, setWeatherDesc] = useState<string>('Cerah berawan');

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
          padding: '24px 16px 28px 16px',
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
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
            {getFormattedDate()}
          </span>
          <button 
            onClick={() => speak("Tidak ada pemberitahuan baru. Semua sistem kota Yogyakarta terpantau aman dan kondusif.")}
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
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: 'white' }}>
            Selamat Datang
          </h2>
          <strong style={{ fontSize: '16px', fontWeight: 600, display: 'block', marginTop: '2px', color: 'rgba(255, 255, 255, 0.9)' }}>
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
              <strong style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'white' }}>Yogyakarta</strong>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)' }}>{weatherDesc}</span>
            </div>
          </div>
          <strong style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{weatherTemp}°</strong>
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
          fontSize: '10px',
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
      <div style={{ padding: '24px 16px 88px 16px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
        
        {/* LAYANAN UTAMA Section */}
        <div>
          <strong style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>
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
              <strong style={{ fontSize: '13px', color: '#1C1E21', display: 'block', marginTop: '4px' }}>Mobilitas</strong>
              <span style={{ fontSize: '9px', color: '#1A73E8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
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
              <strong style={{ fontSize: '13px', color: '#1C1E21', display: 'block', marginTop: '4px' }}>Kesehatan</strong>
              <span style={{ fontSize: '9px', color: '#D93025', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
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
              <strong style={{ fontSize: '13px', color: '#1C1E21', display: 'block', marginTop: '4px' }}>Lapor</strong>
              <span style={{ fontSize: '9px', color: '#B06000', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Buka layanan <ChevronRightIcon color="#B06000" />
              </span>
            </div>

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
              <strong style={{ fontSize: '13px', color: '#1C1E21', display: 'block', marginTop: '4px' }}>Layanan</strong>
              <span style={{ fontSize: '9px', color: '#137333', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Buka layanan <ChevronRightIcon color="#137333" />
              </span>
            </div>
          </div>
        </div>

        {/* AKTIVITAS TERBARU Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <strong style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Aktivitas Terbaru
            </strong>
            <span 
              onClick={() => onNavigate('lapor')}
              style={{ fontSize: '10px', color: '#1A73E8', fontWeight: 600, cursor: 'pointer' }}
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
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '11px', color: '#1C1E21' }}>Janji Poli berhasil dibuat</strong>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>10 mnt lalu</span>
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
                fontSize: '13px'
              }}>
                🔧
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '11px', color: '#1C1E21' }}>Laporan jalan berlubang diproses</strong>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>1j lalu</span>
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
                fontSize: '13px'
              }}>
                ♻️
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '11px', color: '#1C1E21' }}>Penjemputan sampah berhasil</strong>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>3j lalu</span>
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
            <strong style={{ fontSize: '18px', color: '#1A73E8', fontWeight: 800 }}>98%</strong>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 500 }}>Trans Akurasi</span>
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
            <strong style={{ fontSize: '18px', color: '#137333', fontWeight: 800 }}>{queueNo}</strong>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 500 }}>Antrian Anda</span>
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
            <strong style={{ fontSize: '18px', color: '#B06000', fontWeight: 800 }}>
              {Math.round(sampahBalance / 1000)}K
            </strong>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 500 }}>Poin Anda</span>
          </div>
        </div>

      </div>

    </div>
  );
}
