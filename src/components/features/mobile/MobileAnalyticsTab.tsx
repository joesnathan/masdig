// MobileAnalyticsTab.tsx - Layanan / Live Analytics view for JogjaOne Mobile App (Version 2)
import React, { useState } from 'react';
import { speak } from '@/utils/speech';

interface MobileAnalyticsTabProps {
  uiMode: 'default' | 'lansia' | 'disabilitas';
  onNavigate?: (tab: 'home' | 'mobilitas' | 'lingkungan' | 'kesehatan' | 'lapor' | 'layanan') => void;
}

const getFs = (size: number) => `calc(${size}px * var(--font-scale))`;

// ----------------- SVG Icons Helper collection -----------------
const AnalyticsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21h6m-6-4h6m-9-3c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.72-1.24 5.11-3 6.69V17H8v-2.31C6.24 13.11 5 10.72 5 8z" />
  </svg>
);

const TrendUpIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#137333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const WarningIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DE3737" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function MobileAnalyticsTab({ onNavigate }: MobileAnalyticsTabProps) {
  // Chart filter timeline
  const [timeline, setTimeline] = useState<'hari' | 'minggu' | 'bulan'>('hari');
  
  // Incident & health simulation state
  const [cityHealth, setCityHealth] = useState(92);
  const [activeIncidents, setActiveIncidents] = useState(4);
  const [workOrders, setWorkOrders] = useState([
    { id: 'WO-801', title: 'Clear blocked drain', location: 'Jl. Sudirman', source: 'Sensor alert', status: 'idle' },
    { id: 'WO-802', title: 'Replace street light', location: 'Alun-Alun', source: 'Citizen report', status: 'idle' },
    { id: 'WO-803', title: 'Repair tactile paving', location: 'Jl. Malioboro', source: 'Citizen report', status: 'idle' }
  ]);

  // Chart data sets
  const chartData = {
    hari: [
      { label: '06:00', occ: 40, dem: 55 },
      { label: '09:00', occ: 85, dem: 95 },
      { label: '12:00', occ: 60, dem: 65 },
      { label: '15:00', occ: 70, dem: 80 },
      { label: '18:00', occ: 90, dem: 85 },
      { label: '21:00', occ: 50, dem: 45 }
    ],
    minggu: [
      { label: 'Sen', occ: 75, dem: 70 },
      { label: 'Sel', occ: 80, dem: 85 },
      { label: 'Rab', occ: 65, dem: 60 },
      { label: 'Kam', occ: 70, dem: 75 },
      { label: 'Jum', occ: 85, dem: 90 },
      { label: 'Sab', occ: 95, dem: 95 }
    ],
    bulan: [
      { label: 'Jan', occ: 50, dem: 60 },
      { label: 'Feb', occ: 55, dem: 55 },
      { label: 'Mar', occ: 65, dem: 70 },
      { label: 'Apr', occ: 80, dem: 85 },
      { label: 'Mei', occ: 75, dem: 80 },
      { label: 'Jun', occ: 90, dem: 95 }
    ]
  };

  const handleAssign = (id: string, title: string) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === id) {
        return { ...wo, status: 'dispatched' };
      }
      return wo;
    }));
    
    // Animate status update
    setTimeout(() => {
      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === id) {
          return { ...wo, status: 'resolving' };
        }
        return wo;
      }));
      
      // complete order
      setTimeout(() => {
        setWorkOrders(prev => prev.map(wo => {
          if (wo.id === id) {
            return { ...wo, status: 'completed' };
          }
          return wo;
        }));
        
        setActiveIncidents(prev => Math.max(0, prev - 1));
        setCityHealth(prev => Math.min(100, prev + 2));
        speak(`Pekerjaan ${title} telah selesai diperbaiki.`);
      }, 3000);
      
    }, 2000);
    
    speak(`Perintah kerja ${title} berhasil dialokasikan. Petugas dikirim ke lokasi.`);
  };

  return (
    <div 
      className="animate-slide-up" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        position: 'relative',
        background: '#F4F6F9',
        boxSizing: 'border-box'
      }}
    >
      
      {/* 1. Header block */}
      <div 
        style={{
          background: 'linear-gradient(180deg, #1A73E8 0%, #1557B0 100%)',
          padding: 'calc(20px * var(--font-scale)) calc(16px * var(--font-scale))',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 15px rgba(26,115,232,0.12)'
        }}
      >
        {/* Back Link */}
        <div 
          onClick={() => { if (onNavigate) onNavigate('home'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', width: 'fit-content' }}
        >
          <BackIcon />
          <span style={{ fontSize: getFs(12), fontWeight: 600 }}>Kembali</span>
        </div>

        {/* Title & Subtitle */}
        <div style={{ marginTop: '4px' }}>
          <h2 style={{ fontSize: getFs(22), fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.5px' }}>
            Live Analytics
          </h2>
          <span style={{ fontSize: getFs(11), color: 'rgba(255,255,255,0.85)', display: 'block', marginTop: '2px' }}>
            Dasbor analitik kota Yogyakarta
          </span>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px', boxSizing: 'border-box' }}>
        
        {/* Overall City Health & Active Incidents header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
          {/* City Health */}
          <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '12px 14px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
            <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Overall City Health
            </span>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: getFs(16), color: '#137333', marginTop: '2px', fontWeight: '800' }}>
              {cityHealth}% <TrendUpIcon />
            </strong>
          </div>

          {/* Active Incidents */}
          <div style={{ background: '#FDF2F2', border: '1px solid #FDE8E8', borderRadius: '16px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
            <div>
              <span style={{ fontSize: getFs(8), color: '#DE3737', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Incidents Active
              </span>
              <strong style={{ display: 'block', fontSize: getFs(16), color: '#DE3737', marginTop: '2px', fontWeight: '800' }}>
                {activeIncidents}
              </strong>
            </div>
            <WarningIcon />
          </div>
        </div>

        {/* Live Analytics Chart Viewport */}
        <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong style={{ fontSize: getFs(11), color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800' }}>
              <AnalyticsIcon /> Occupancy vs Demand
            </strong>
            
            {/* Timeline Filter Switch */}
            <div style={{ display: 'flex', background: '#F0F2F5', borderRadius: '8px', padding: '2px' }}>
              {[
                { id: 'hari', label: 'Hari' },
                { id: 'minggu', label: 'Minggu' },
                { id: 'bulan', label: 'Bulan' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTimeline(t.id as 'hari' | 'minggu' | 'bulan'); speak(`Statistik ${t.label}an dimuat.`); }}
                  style={{
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: getFs(8),
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    background: timeline === t.id ? 'white' : 'transparent',
                    color: timeline === t.id ? '#1A73E8' : '#5F6368',
                    boxShadow: timeline === t.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom SVG Bar Chart */}
          <div style={{ height: '110px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 8px', borderBottom: '1px solid #E0E0E0', marginBottom: '10px' }}>
            {chartData[timeline].map((bar, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%', gap: '4px' }}>
                <div style={{ display: 'flex', width: '100%', height: '80px', alignItems: 'flex-end', gap: '2px', position: 'relative' }}>
                  {/* Occupancy bar */}
                  <div 
                    style={{ 
                      flex: 1, 
                      height: `${bar.occ}%`, 
                      background: 'linear-gradient(to top, rgba(26, 115, 232, 0.4) 0%, #1A73E8 100%)', 
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} 
                  />
                  {/* Demand bar */}
                  <div 
                    style={{ 
                      flex: 1, 
                      height: `${bar.dem}%`, 
                      background: 'linear-gradient(to top, rgba(229, 169, 59, 0.2) 0%, #B06000 100%)', 
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} 
                  />
                </div>
                <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', transform: 'scale(0.85)', display: 'block' }}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Chart Legend */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#1A73E8', borderRadius: '2px' }} />
              <span style={{ fontSize: getFs(8), color: 'var(--text-secondary)' }}>Occupancy</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#B06000', borderRadius: '2px' }} />
              <span style={{ fontSize: getFs(8), color: 'var(--text-secondary)' }}>Demand</span>
            </div>
          </div>
        </div>

        {/* Progress Ring widgets row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Waste Efficiency Circle */}
          <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
            <svg width="34" height="34" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#F0F2F5" strokeWidth="3.5" />
              <circle 
                cx="18" 
                cy="18" 
                r="16" 
                fill="none" 
                stroke="#0F9D58" 
                strokeWidth="3.5" 
                strokeDasharray="85, 100" 
                strokeDashoffset="25"
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
              <text x="18" y="21.5" textAnchor="middle" fontSize="9px" fontWeight="bold" fill="var(--text-primary)">
                85%
              </text>
            </svg>
            <div>
              <strong style={{ fontSize: getFs(10), color: 'var(--text-primary)', display: 'block', fontWeight: '700' }}>Waste Eff.</strong>
              <span style={{ fontSize: getFs(8), color: 'var(--text-muted)' }}>Recycled Rate</span>
            </div>
          </div>

          {/* Accessibility Score */}
          <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(26, 115, 232, 0.08)',
              color: '#1A73E8',
              fontSize: getFs(14),
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #1A73E8'
            }}>
              A-
            </div>
            <div>
              <strong style={{ fontSize: getFs(10), color: 'var(--text-primary)', display: 'block', fontWeight: '700' }}>Accessibility</strong>
              <span style={{ fontSize: getFs(8), color: 'var(--text-muted)' }}>City Average</span>
            </div>
          </div>
        </div>

        {/* AI Predictive Insights */}
        <div>
          <strong style={{ fontSize: getFs(12), color: 'var(--text-primary)', display: 'block', marginBottom: '8px', fontWeight: '800' }}>
            AI Predictive Insights
          </strong>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#FFF8E1', borderLeft: '4px solid #FFC107', borderRadius: '12px', padding: '12px', border: '1px solid #FFF5CC', borderLeftWidth: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: '#FFB300', display: 'flex' }}><LightbulbIcon /></span>
                <strong style={{ fontSize: getFs(10), color: '#B06000', fontWeight: 'bold' }}>Traffic Peak Predicted</strong>
              </div>
              <p style={{ fontSize: getFs(9), color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Congestion expected at Malioboro area around 5:00 PM due to weekend market setup.
              </p>
            </div>

            <div style={{ background: '#E8F0FE', borderLeft: '4px solid #1A73E8', borderRadius: '12px', padding: '12px', border: '1px solid #D2E3FC', borderLeftWidth: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: '#1A73E8', display: 'flex' }}><LightbulbIcon /></span>
                <strong style={{ fontSize: getFs(10), color: '#1A73E8', fontWeight: 'bold' }}>Disease Outbreak Warning</strong>
              </div>
              <p style={{ fontSize: getFs(9), color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Dengue fever risk (Low) in Kotagede based on recent rainfall and sensor data.
              </p>
            </div>
          </div>
        </div>

        {/* Automated Work Orders */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: getFs(12), color: 'var(--text-primary)', fontWeight: '800' }}>
              Automated Work Orders
            </strong>
            <span style={{ fontSize: getFs(9), color: '#1A73E8', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => speak("Menampilkan seluruh daftar work orders.")}>
              View All
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {workOrders.map((wo) => (
              <div 
                key={wo.id}
                style={{ 
                  background: 'white', 
                  border: '1px solid #E0E0E0', 
                  borderRadius: '16px', 
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
                }}
              >
                <div>
                  <strong style={{ fontSize: getFs(11), color: 'var(--text-primary)', display: 'block', fontWeight: '600' }}>
                    {wo.title}
                  </strong>
                  <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>
                    {wo.location} • {wo.source}
                  </span>
                </div>
                
                <button
                  onClick={() => handleAssign(wo.id, wo.title)}
                  disabled={wo.status !== 'idle'}
                  style={{
                    background: wo.status === 'completed' ? '#E6F4EA' : wo.status === 'resolving' ? '#FFF4E5' : wo.status === 'dispatched' ? '#E8F0FE' : '#F0F2F5',
                    color: wo.status === 'completed' ? '#137333' : wo.status === 'resolving' ? '#B06000' : wo.status === 'dispatched' ? '#1A73E8' : '#5F6368',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: getFs(9),
                    fontWeight: 'bold',
                    cursor: wo.status === 'idle' ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  {wo.status === 'completed' && 'Selesai ✓'}
                  {wo.status === 'resolving' && 'Dikerjakan...'}
                  {wo.status === 'dispatched' && 'Petugas OTW'}
                  {wo.status === 'idle' && 'Assign'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
