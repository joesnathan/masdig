// MobileHomeTab.tsx - Home (Beranda) view for JogjaOne Mobile App
import React, { useState } from 'react';

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
}

// ----------------- SVG Icons Helper collection -----------------
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const WarningIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const TransitIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="4" width="14" height="16" rx="2" ry="2" />
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="9" y1="22" x2="9" y2="22" />
    <line x1="15" y1="22" x2="15" y2="22" />
    <circle cx="12" cy="9" r="2" />
  </svg>
);

const HealthIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const EcoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10H12V2z" />
    <path d="M12 2a10 10 0 0 1 10 10H12V2z" />
  </svg>
);

const SpeakerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

export default function MobileHomeTab({ onNavigate, tickets, v2xActive }: MobileHomeTabProps) {
  const [showFloodAlert, setShowFloodAlert] = useState(false);
  const [expandedFeed, setExpandedFeed] = useState<string | null>(null);

  const toggleFeedDetail = (feedId: string) => {
    setExpandedFeed(expandedFeed === feedId ? null : feedId);
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 16px 80px 16px' }}>
      
      {/* 1. Header Greetings */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-family)', letterSpacing: '-0.3px' }}>
            Selamat Pagi, Warga!
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
          Ringkasan kota hari ini.
        </p>
        
        {/* City Status Badge */}
        <div style={{ marginTop: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(24, 128, 56, 0.08)',
            color: '#137333',
            border: '1px solid rgba(24, 128, 56, 0.15)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#137333', display: 'inline-block' }}></span>
            City Status: Normal
          </span>
        </div>
      </div>

      {/* 2. Traffic Update Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(26, 115, 232, 0.08) 0%, rgba(26, 115, 232, 0.18) 100%)',
          border: '1px solid var(--border-color)',
          borderLeft: '4px solid var(--accent-blue)',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--accent-blue)', display: 'inline-flex', marginTop: '2px' }}>
            <InfoIcon />
          </span>
          <div>
            <strong style={{ fontSize: '11px', color: 'var(--accent-blue)', display: 'block', marginBottom: '2px' }}>
              Pembaruan Lalu Lintas
            </strong>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Penutupan jalan sementara di Jl. Malioboro karena acara budaya hingga pukul 16:00.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Metric Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Flood Risk Card (Accordion) */}
        <div 
          style={{ 
            borderRadius: '12px', 
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div 
            onClick={() => setShowFloodAlert(!showFloodAlert)}
            style={{ 
              padding: '12px 14px', 
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                Risiko Banjir
              </span>
              <strong style={{ display: 'block', fontSize: '16px', color: '#137333', marginTop: '2px' }}>
                Low
              </strong>
            </div>
            <span style={{ color: '#137333', display: 'flex' }}>
              <WarningIcon color="#137333" />
            </span>
          </div>

          {/* Detailed River Telemetry levels */}
          {showFloodAlert && (
            <div 
              className="animate-slide-up"
              style={{ 
                padding: '0 14px 14px 14px', 
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)'
              }}
            >
              <span style={{ fontSize: '8px', color: 'var(--text-muted)', display: 'block', margin: '8px 0 6px 0', fontWeight: 'bold' }}>
                LIVE TELEMETRI SALURAN AIR (RIVER GAUGES):
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Sungai Code', height: '1.2m', status: 'Aman', percentage: '60%' },
                  { name: 'Sungai Winongo', height: '0.8m', status: 'Aman', percentage: '40%' },
                  { name: 'Sungai Gajah Wong', height: '1.1m', status: 'Aman', percentage: '55%' }
                ].map((river, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px 0', borderBottom: idx < 2 ? '1px dashed var(--border-color)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{river.name}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{river.height} <span style={{ color: '#137333', fontWeight: 'normal', fontSize: '8px', background: 'rgba(24,128,56,0.12)', padding: '1px 4px', borderRadius: '3px', marginLeft: '4px' }}>{river.status}</span></strong>
                    </div>
                    {/* Visual mini bar */}
                    <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: river.percentage, height: '100%', background: '#137333', borderRadius: '2px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Combined Transport & Health Metric row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          
          {/* Transport Card */}
          <div 
            onClick={() => onNavigate('mobilitas')}
            style={{ 
              padding: '12px 14px', 
              borderRadius: '12px', 
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '80px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Transportasi
              </span>
              <span style={{ color: 'var(--accent-blue)', display: 'inline-flex' }}>
                <TransitIcon />
              </span>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '18px', color: 'var(--text-primary)', fontWeight: '800' }}>
                98%
              </strong>
              <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Tepat Waktu</span>
            </div>
          </div>

          {/* Health Card */}
          <div 
            onClick={() => onNavigate('kesehatan')}
            style={{ 
              padding: '12px 14px', 
              borderRadius: '12px', 
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '80px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Kesehatan
              </span>
              <span style={{ color: '#137333', display: 'inline-flex' }}>
                <HealthIcon />
              </span>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '18px', color: 'var(--text-primary)', fontWeight: '800' }}>
                420
              </strong>
              <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Bed Tersedia</span>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Quick Access Grid ("Akses Cepat") */}
      <div>
        <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
          Akses Cepat
        </strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            { id: 'mobilitas', label: 'Mobilitas', color: 'rgba(26, 115, 232, 0.12)', textColor: 'var(--accent-blue)', icon: <TransitIcon /> },
            { id: 'kesehatan', label: 'Kesehatan', color: 'rgba(24, 128, 56, 0.12)', textColor: 'var(--accent-green)', icon: <HealthIcon /> },
            { id: 'lingkungan', label: 'Lingkungan', color: 'rgba(229, 169, 59, 0.12)', textColor: 'var(--brand-gold)', icon: <EcoIcon /> },
            { id: 'lapor', label: 'Lapor', color: 'rgba(219, 68, 85, 0.12)', textColor: 'var(--accent-danger)', icon: <WarningIcon color="var(--accent-danger)" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: item.color,
                color: item.textColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.2s'
              }}
              className="quick-btn"
              >
                {item.icon}
              </div>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Live City Feed */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
            Live City Feed
          </strong>
          <span 
            onClick={() => onNavigate('lapor')}
            style={{ fontSize: '9px', color: 'var(--brand-crimson)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Lihat Semua
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Feed Item 1: Lampu Jalan Mati */}
          <div 
            onClick={() => toggleFeedDetail('feed-1')}
            style={{ 
              background: 'var(--bg-secondary)', 
              borderRadius: '10px', 
              padding: '10px 12px', 
              border: '1px solid var(--border-color)', 
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-danger)', display: 'flex' }}><WarningIcon color="var(--accent-danger)" /></span>
                <strong style={{ fontSize: '10px', color: 'var(--text-primary)' }}>Lampu Jalan Mati</strong>
              </div>
              <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>5 mnt lalu</span>
            </div>
            <p style={{ fontSize: '9px', color: 'var(--text-secondary)', margin: '6px 0 8px 0', lineHeight: 1.3 }}>
              Laporan warga di Jl. Sudirman KM 2. Tim teknis sedang menuju lokasi.
            </p>
            {expandedFeed === 'feed-1' && (
              <div className="animate-slide-up" style={{ fontSize: '8px', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginBottom: '6px' }}>
                <strong>Update:</strong> Unit PJU Dishub telah ditugaskan (Mobil Dinas No. 3). Estimasi perbaikan 30 menit.
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '7px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                Laporan Warga
              </span>
              <span style={{ fontSize: '7px', background: 'rgba(229, 169, 59, 0.15)', color: 'var(--brand-gold)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                Diproses
              </span>
            </div>
          </div>

          {/* Feed Item 2: Pengangkutan Sampah */}
          <div 
            onClick={() => toggleFeedDetail('feed-2')}
            style={{ 
              background: 'var(--bg-secondary)', 
              borderRadius: '10px', 
              padding: '10px 12px', 
              border: '1px solid var(--border-color)', 
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-blue)', display: 'flex' }}><SpeakerIcon /></span>
                <strong style={{ fontSize: '10px', color: 'var(--text-primary)' }}>Jadwal Pengangkutan Sampah</strong>
              </div>
              <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>1 jam lalu</span>
            </div>
            <p style={{ fontSize: '9px', color: 'var(--text-secondary)', margin: '6px 0 8px 0', lineHeight: 1.3 }}>
              Pengangkutan area utara dimajukan menjadi pukul 06:00 WIB mulai besok.
            </p>
            {expandedFeed === 'feed-2' && (
              <div className="animate-slide-up" style={{ fontSize: '8px', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginBottom: '6px' }}>
                <strong>Wilayah terdampak:</strong> Depok, Ngaglik, Mlati. Harap letakkan tempat sampah organik/anorganik di depan gerbang sebelum jam tersebut.
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '7px', background: 'rgba(26,115,232,0.12)', color: 'var(--accent-blue)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                Info Resmi
              </span>
            </div>
          </div>

          {/* Dynamic state logs */}
          {tickets.slice(0, 1).map((t, index) => (
            <div 
              key={index} 
              onClick={() => toggleFeedDetail(`feed-dyn-${t.id}`)}
              style={{ 
                background: 'var(--bg-secondary)', 
                borderRadius: '10px', 
                padding: '10px 12px', 
                border: '1px solid var(--border-color)', 
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--accent-green)', fontWeight: 'bold' }}>✓</span>
                  <strong style={{ fontSize: '10px', color: 'var(--text-primary)' }}>{t.title}</strong>
                </div>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{t.time}</span>
              </div>
              <p style={{ fontSize: '9px', color: 'var(--text-secondary)', margin: '6px 0 8px 0', lineHeight: 1.3 }}>
                {t.details}
              </p>
              {expandedFeed === `feed-dyn-${t.id}` && (
                <div className="animate-slide-up" style={{ fontSize: '8px', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginBottom: '6px' }}>
                  <strong>ID Aduan:</strong> {t.id} • Diteruskan otomatis ke penanggung jawab wilayah.
                </div>
              )}
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '7px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {t.source}
                </span>
                <span style={{
                  fontSize: '7px',
                  background: t.status === 'Selesai' ? 'rgba(24,128,56,0.15)' : t.status === 'Dalam Proses' ? 'rgba(229,169,59,0.15)' : 'rgba(219,68,85,0.15)',
                  color: t.status === 'Selesai' ? 'var(--accent-green)' : t.status === 'Dalam Proses' ? 'var(--brand-gold)' : 'var(--accent-danger)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 'bold'
                }}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
