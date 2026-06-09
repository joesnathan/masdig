// HomeTab.tsx - Desktop Beranda tab view for Jogja Punya Kita
import React from 'react';
import InteractiveMap from '@/components/InteractiveMap';

interface MapNode {
  id: string;
  name: string;
  type: 'landmark' | 'health' | 'grate' | 'user';
  x: number;
  y: number;
  status?: string;
  details?: string;
}

interface Vehicle {
  id: string;
  name: string;
  type: 'bus' | 'bentor' | 'bajaj' | 'delman';
  x: number;
  y: number;
  status: string;
}

interface Ticket {
  id: string;
  title: string;
  location: string;
  status: 'Terkirim' | 'Dalam Proses' | 'Selesai';
  source: 'Edge-AI Fleet Camera' | 'Smart Grate Sensor' | 'Laporan Warga';
  time: string;
  details: string;
}

interface HomeTabProps {
  v2xActive: boolean;
  v2xTimeRemaining: number;
  grateStatus: 'normal' | 'clogged';
  tickets: Ticket[];
  vehicles: Vehicle[];
  drainageNodes: MapNode[];
  puddleReports: Array<{ id: string; x: number; y: number; status: string }>;
  activeRoute: string[];
  uiMode: 'default' | 'lansia' | 'disabilitas';
}

export default function HomeTab({
  v2xActive,
  v2xTimeRemaining,
  grateStatus,
  tickets,
  vehicles,
  drainageNodes,
  puddleReports,
  activeRoute,
  uiMode
}: HomeTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Alert and overview banner */}
      <div 
        style={{ 
          background: 'rgba(139, 0, 0, 0.15)', 
          border: '1px solid var(--brand-crimson)', 
          color: 'var(--text-primary)', 
          padding: '16px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <strong>📢 NOTIFIKASI KOTA CERDAS:</strong> Rute Malioboro terintegrasi V2X & Adaptive Signal aktif. Sensor drainase Gondokusuman dalam pemantauan.
        </div>
        {v2xActive && (
          <span className="animate-pulse" style={{ background: '#dc3545', color: 'white', padding: '4px 10px', borderRadius: '30px', fontSize: '11px', fontWeight: 'bold' }}>
            🚦 ADAPTIVE LIGHT +{v2xTimeRemaining}s
          </span>
        )}
      </div>

      {/* Summary Metric Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '18px', borderTop: '4px solid var(--accent-green)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>KUALITAS UDARA DIY</div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '6px' }}>62 AQI <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>Baik</span></h3>
          <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '24px', opacity: 0.12 }}>🍃</span>
        </div>
        <div className="glass-panel" style={{ padding: '18px', borderTop: '4px solid var(--accent-blue)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>KASUR ICU TERSEDIA</div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '6px' }}>21 Unit</h3>
          <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '24px', opacity: 0.12 }}>🏥</span>
        </div>
        <div className="glass-panel" style={{ padding: '18px', borderTop: `4px solid ${grateStatus === 'clogged' ? 'var(--accent-danger)' : 'var(--accent-blue)'}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS ALIRAN DRAINASE</div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: grateStatus === 'clogged' ? 'var(--accent-danger)' : 'var(--accent-blue)', marginTop: '6px' }}>
            {grateStatus === 'clogged' ? 'SIAGA' : 'LANCAR'}
          </h3>
          <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '24px', opacity: 0.12 }}>💧</span>
        </div>
        <div className="glass-panel" style={{ padding: '18px', borderTop: '4px solid var(--brand-gold)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ADUAN WARGA DIPROSES</div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-gold)', marginTop: '6px' }}>
            {tickets.filter(t => t.status === 'Dalam Proses').length} Tiket
          </h3>
          <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '24px', opacity: 0.12 }}>📢</span>
        </div>
      </div>

      {/* Split Dashboard: Map on Left, Information Overview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', minHeight: '450px' }}>
        
        {/* GIS interactive Map */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>🗺️ Peta Pemantauan Kota Terintegrasi</h3>
          <div style={{ flex: 1 }} className="glass-panel">
            <InteractiveMap
              mode={uiMode}
              vehicles={vehicles}
              drainageNodes={drainageNodes}
              puddleReports={puddleReports}
              activeRoute={activeRoute}
            />
          </div>
        </div>

        {/* Quick logs feed */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px', fontWeight: 'bold' }}>
            📜 Log Peristiwa & AI Telemetri
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tickets.slice().reverse().map(t => (
              <div key={t.id} style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', borderLeft: `4px solid ${t.source === 'Laporan Warga' ? 'var(--brand-gold)' : t.source === 'Edge-AI Fleet Camera' ? 'var(--accent-blue)' : '#dc3545'}`, fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>{t.title}</span>
                  <span style={{ fontSize: '10px', color: 'var(--brand-crimson)' }}>{t.status}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {t.location} | {t.time}</div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{t.details}</p>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
