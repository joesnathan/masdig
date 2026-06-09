// MobileAnalyticsTab.tsx - Layanan / Live Analytics view for JogjaOne Mobile App
import React, { useState } from 'react';
import { speak } from '@/utils/speech';

interface MobileAnalyticsTabProps {
  uiMode: 'default' | 'lansia' | 'disabilitas';
}

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
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const WarningIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function MobileAnalyticsTab({ uiMode }: MobileAnalyticsTabProps) {
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
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Scrollable contents */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
        
        {/* 1. Overall City Health & Active Incidents header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
          {/* City Health */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 12px', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Overall City Health
            </span>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px', color: 'var(--accent-green)', marginTop: '2px', fontWeight: '800' }}>
              {cityHealth}% <TrendUpIcon />
            </strong>
          </div>

          {/* Active Incidents */}
          <div style={{ background: 'rgba(219, 68, 85, 0.12)', border: '1px solid var(--accent-danger)', borderRadius: '12px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div>
              <span style={{ fontSize: '8px', color: 'var(--accent-danger)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Incidents Active
              </span>
              <strong style={{ display: 'block', fontSize: '15px', color: 'var(--accent-danger)', marginTop: '2px', fontWeight: '800' }}>
                {activeIncidents}
              </strong>
            </div>
            <WarningIcon />
          </div>
        </div>

        {/* 2. Live Analytics Chart Viewport */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <strong style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AnalyticsIcon /> Transport Occupancy vs Demand
            </strong>
            
            {/* Timeline Filter Switch */}
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '1.5px' }}>
              {[
                { id: 'hari', label: 'Hari' },
                { id: 'minggu', label: 'Minggu' },
                { id: 'bulan', label: 'Bulan' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTimeline(t.id as any); speak(`Statistik ${t.label}an dimuat.`); }}
                  style={{
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '6.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    background: timeline === t.id ? 'var(--bg-secondary)' : 'transparent',
                    color: timeline === t.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                    boxShadow: timeline === t.id ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom SVG Bar Chart */}
          <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 8px', borderBottom: '1px solid var(--border-color)' }}>
            {chartData[timeline].map((bar, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%', gap: '4px' }}>
                <div style={{ display: 'flex', width: '100%', height: '70px', alignItems: 'flex-end', gap: '2px', position: 'relative' }}>
                  
                  {/* Occupancy bar */}
                  <div 
                    style={{ 
                      flex: 1, 
                      height: `${bar.occ}%`, 
                      background: 'linear-gradient(to top, rgba(66, 133, 244, 0.4) 0%, var(--accent-blue) 100%)', 
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} 
                  />
                  
                  {/* Demand bar */}
                  <div 
                    style={{ 
                      flex: 1, 
                      height: `${bar.dem}%`, 
                      background: 'linear-gradient(to top, rgba(229, 169, 59, 0.2) 0%, var(--brand-gold) 100%)', 
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} 
                  />
                </div>
                
                <span style={{ fontSize: '7px', color: 'var(--text-muted)', transform: 'scale(0.85)' }}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Chart Legend */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--accent-blue)', borderRadius: '1.5px' }} />
              <span style={{ fontSize: '7px', color: 'var(--text-secondary)' }}>Occupancy</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--brand-gold)', borderRadius: '1.5px' }} />
              <span style={{ fontSize: '7px', color: 'var(--text-secondary)' }}>Demand</span>
            </div>
          </div>
        </div>

        {/* 3. Progress Ring widgets row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          
          {/* Waste Efficiency Progress Circle */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="34" height="34" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bg-tertiary)" strokeWidth="3.5" />
              <circle 
                cx="18" 
                cy="18" 
                r="16" 
                fill="none" 
                stroke="var(--accent-green)" 
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
              <strong style={{ fontSize: '9px', color: 'var(--text-primary)', display: 'block', letterSpacing: '-0.1px' }}>Waste Eff.</strong>
              <span style={{ fontSize: '7px', color: 'var(--text-muted)' }}>Recycled Rate</span>
            </div>
          </div>

          {/* Accessibility Score */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(26, 115, 232, 0.12)',
              color: 'var(--accent-blue)',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid var(--accent-blue)'
            }}>
              A-
            </div>
            <div>
              <strong style={{ fontSize: '9px', color: 'var(--text-primary)', display: 'block', letterSpacing: '-0.1px' }}>Accessibility</strong>
              <span style={{ fontSize: '7px', color: 'var(--text-muted)' }}>City Average</span>
            </div>
          </div>

        </div>

        {/* 4. AI Predictive Insights */}
        <div>
          <strong style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
            AI Predictive Insights
          </strong>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Insight 1 */}
            <div style={{ background: 'rgba(229, 169, 59, 0.12)', borderLeft: '4px solid var(--brand-gold)', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--brand-gold)', display: 'flex' }}><LightbulbIcon /></span>
                <strong style={{ fontSize: '9px', color: 'var(--brand-gold)' }}>Traffic Peak Predicted</strong>
              </div>
              <p style={{ fontSize: '8px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Congestion expected at Malioboro area around 5:00 PM due to weekend market setup.
              </p>
            </div>

            {/* Insight 2 */}
            <div style={{ background: 'rgba(26, 115, 232, 0.12)', borderLeft: '4px solid var(--accent-blue)', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--accent-blue)', display: 'flex' }}><LightbulbIcon /></span>
                <strong style={{ fontSize: '9px', color: 'var(--accent-blue)' }}>Disease Outbreak Warning</strong>
              </div>
              <p style={{ fontSize: '8px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Dengue fever risk (Low) in Kotagede based on recent rainfall and sensor data.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Automated Work Orders */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
              Automated Work Orders
            </strong>
            <span style={{ fontSize: '8px', color: 'var(--brand-crimson)', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => speak("Menampilkan seluruh daftar work orders.")}>
              View All
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {workOrders.map((wo) => (
              <div 
                key={wo.id}
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px', 
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '9px', color: 'var(--text-primary)', display: 'block' }}>
                    {wo.title}
                  </strong>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                    {wo.location} • {wo.source}
                  </span>
                </div>
                
                {/* Dispatch tracking status buttons */}
                <button
                  onClick={() => handleAssign(wo.id, wo.title)}
                  disabled={wo.status !== 'idle'}
                  style={{
                    background: wo.status === 'completed' ? 'rgba(24, 128, 56, 0.15)' : wo.status === 'resolving' ? 'rgba(229, 169, 59, 0.15)' : wo.status === 'dispatched' ? 'rgba(26, 115, 232, 0.15)' : 'var(--bg-tertiary)',
                    color: wo.status === 'completed' ? 'var(--accent-green)' : wo.status === 'resolving' ? 'var(--brand-gold)' : wo.status === 'dispatched' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    cursor: wo.status === 'idle' ? 'pointer' : 'default',
                    transition: 'all 0.2s'
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
