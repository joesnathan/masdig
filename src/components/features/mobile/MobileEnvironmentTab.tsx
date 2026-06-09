// MobileEnvironmentTab.tsx - Environment (Lingkungan) view for JogjaOne Mobile App
import React, { useState, useEffect } from 'react';
import InteractiveMap from '@/components/InteractiveMap';
import { speak } from '@/utils/speech';

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

interface MobileEnvironmentTabProps {
  vehicles: Vehicle[];
  drainageNodes: MapNode[];
  puddleReports: Array<{ id: string; x: number; y: number; status: string }>;
  activeRoute: string[];
  grateStatus: 'normal' | 'clogged';
  setGrateStatus: (val: 'normal' | 'clogged') => void;
  sampahBalance: number;
  setSampahBalance: (val: number) => void;
  uiMode: 'default' | 'lansia' | 'disabilitas';
}

// ----------------- SVG Icons Helper collection -----------------
const EcoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10H12V2z" />
    <path d="M12 2a10 10 0 0 1 10 10H12V2z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

export default function MobileEnvironmentTab({
  vehicles,
  drainageNodes,
  puddleReports,
  activeRoute,
  grateStatus,
  setGrateStatus,
  sampahBalance,
  setSampahBalance,
  uiMode
}: MobileEnvironmentTabProps) {
  const [activeSegment, setActiveSegment] = useState<'banjir' | 'limbah'>('banjir');
  const [playCctvCode, setPlayCctvCode] = useState(false);
  const [playCctvTugu, setPlayCctvTugu] = useState(false);
  
  // Real-time ticking CCTV clock
  const [cctvClock, setCctvClock] = useState('');

  // Waste Form Drawer States
  const [showPickupDrawer, setShowPickupDrawer] = useState(false);
  const [wasteCategory, setWasteCategory] = useState<'Plastik' | 'Kertas' | 'Logam'>('Plastik');
  const [wasteWeight, setWasteWeight] = useState(5); // slider default 5kg
  const [localHistory, setLocalHistory] = useState([
    { id: 'SMP-082', category: 'Plastik & Kertas', points: 150, status: 'Selesai', date: '08 Des 2025' },
    { id: 'SMP-041', category: 'Organik', points: 50, status: 'Selesai', date: '05 Des 2025' }
  ]);

  // Live ticking clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCctvClock(now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('id-ID') + ' WIB');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRequestPickup = () => {
    const pointsGained = wasteCategory === 'Plastik' ? wasteWeight * 30 : wasteCategory === 'Kertas' ? wasteWeight * 20 : wasteWeight * 50;
    setSampahBalance(sampahBalance + pointsGained);
    
    // Add to history
    const newId = `SMP-${Math.floor(100 + Math.random() * 899)}`;
    const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    setLocalHistory(prev => [
      { id: newId, category: `${wasteCategory} (${wasteWeight}kg)`, points: pointsGained, status: 'Jemput Kurir', date: dateStr },
      ...prev
    ]);

    // Dispatch recycling vehicle coordinates on the map
    if (vehicles.length > 1) {
      vehicles[1].x = 290;
      vehicles[1].y = 150;
      vehicles[1].status = 'Kurir Penjemputan Sampah Daur Ulang';
    }

    speak(`Berhasil meminta penjemputan sampah ${wasteCategory}. Saldo poin bertambah sebesar ${pointsGained} poin.`);
    setShowPickupDrawer(false);
  };

  const handleToggleCctvCode = () => {
    const nextState = !playCctvCode;
    setPlayCctvCode(nextState);
    if (nextState) {
      speak("Memutar live CCTV Pintu Air Code. Aliran air Sungai Code terpantau 1.2 meter, status aman.");
    }
  };

  const handleToggleCctvTugu = () => {
    const nextState = !playCctvTugu;
    setPlayCctvTugu(nextState);
    if (nextState) {
      speak("Memutar live CCTV Simpang Tugu. Persimpangan terpantau lancar.");
    }
  };

  // Live estimate points computation
  const estimatedPoints = wasteCategory === 'Plastik' ? wasteWeight * 30 : wasteCategory === 'Kertas' ? wasteWeight * 20 : wasteWeight * 50;

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* 1. Header Segment Controls */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          background: 'var(--bg-primary)',
          borderRadius: '20px',
          padding: '2px',
          width: '100%'
        }}>
          <button
            onClick={() => { setActiveSegment('banjir'); speak("Membuka Pantau Banjir."); }}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '18px',
              padding: '6px 0',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: activeSegment === 'banjir' ? 'white' : 'transparent',
              color: activeSegment === 'banjir' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeSegment === 'banjir' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Pantau Banjir
          </button>
          <button
            onClick={() => { setActiveSegment('limbah'); speak("Membuka Manajemen Limbah."); }}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '18px',
              padding: '6px 0',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: activeSegment === 'limbah' ? 'white' : 'transparent',
              color: activeSegment === 'limbah' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeSegment === 'limbah' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Manajemen Limbah
          </button>
        </div>
      </div>

      {/* 2. Active Segment Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        
        {/* ================= PANTAU BANJIR ================= */}
        {activeSegment === 'banjir' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            
            {/* Status Kota Card */}
            <div style={{
              background: 'rgba(24, 128, 56, 0.12)',
              borderRadius: '12px',
              padding: '12px 14px',
              border: '1px solid var(--accent-green)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <span style={{ fontSize: '8px', color: 'var(--accent-green)', textTransform: 'uppercase', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldIcon /> Status Kota
                </span>
                <strong style={{ display: 'block', fontSize: '13px', color: 'var(--accent-green)', marginTop: '2px' }}>
                  • Aman Terkendali
                </strong>
              </div>
              <span style={{ fontSize: '16px', color: 'var(--accent-green)', display: 'flex' }}>✓</span>
            </div>

            {/* Flood Map Viewport */}
            <div style={{ height: '170px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
              <InteractiveMap
                mode={uiMode}
                vehicles={vehicles}
                drainageNodes={drainageNodes}
                puddleReports={puddleReports}
                activeRoute={activeRoute}
              />
              <span style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--glass-border)',
                padding: '3px 8px',
                borderRadius: '10px',
                fontSize: '8px',
                fontWeight: 'bold',
                color: 'var(--accent-blue)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                Sungai Code: 1.2m
              </span>
            </div>

            {/* CCTV Live Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <VideoIcon /> Live CCTV Pantauan
                </strong>
                <span style={{ fontSize: '7px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {cctvClock}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
                {/* CCTV 1: Pintu Air Code */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ height: '84px', background: '#000000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {playCctvCode ? (
                      <>
                        <img 
                          src="/tugu_yogyakarta.png" 
                          alt="Pintu Air Code" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(60%) hue-rotate(120deg)' }} 
                        />
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'rgba(0, 255, 0, 0.04)', animation: 'cctv-noise 0.5s steps(3) infinite' }} />
                        <div style={{ position: 'absolute', left: 0, width: '100%', height: '2px', background: '#00ff00', opacity: 0.6, animation: 'cctv-scanline 3s linear infinite' }} />
                        <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#00ff00', fontSize: '5px', padding: '1px 3px', borderRadius: '2px', fontFamily: 'monospace' }}>PTU_CODE_CAM01</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '18px', color: '#95a5a6' }}>📹</span>
                    )}
                    <button
                      onClick={handleToggleCctvCode}
                      style={{
                        position: 'absolute',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: 'white',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '9px',
                        zIndex: 5
                      }}
                    >
                      {playCctvCode ? '⏸' : '▶'}
                    </button>
                  </div>
                  <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Pintu Air Code</span>
                    <span style={{ fontSize: '7px', background: 'rgba(24,128,56,0.12)', color: 'var(--accent-green)', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>Aman</span>
                  </div>
                </div>

                {/* CCTV 2: Simpang Tugu */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ height: '84px', background: '#000000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {playCctvTugu ? (
                      <>
                        <img 
                          src="/tugu_yogyakarta.png" 
                          alt="Simpang Tugu" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(60%)' }} 
                        />
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'rgba(0, 255, 0, 0.04)', animation: 'cctv-noise 0.5s steps(3) infinite' }} />
                        <div style={{ position: 'absolute', left: 0, width: '100%', height: '2px', background: '#00ff00', opacity: 0.6, animation: 'cctv-scanline 3s linear infinite' }} />
                        <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#00ff00', fontSize: '5px', padding: '1px 3px', borderRadius: '2px', fontFamily: 'monospace' }}>TUGU_CROSS_CAM02</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '18px', color: '#95a5a6' }}>📹</span>
                    )}
                    <button
                      onClick={handleToggleCctvTugu}
                      style={{
                        position: 'absolute',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: 'white',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '9px',
                        zIndex: 5
                      }}
                    >
                      {playCctvTugu ? '⏸' : '▶'}
                    </button>
                  </div>
                  <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Simpang Tugu</span>
                    <span style={{ fontSize: '7px', background: 'rgba(24,128,56,0.12)', color: 'var(--accent-green)', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>Aman</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ================= MANAJEMEN LIMBAH ================= */}
        {activeSegment === 'limbah' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            
            {/* Poin Bank Sampah Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              borderRadius: '16px',
              padding: '16px',
              color: 'white',
              boxShadow: '0 6px 20px rgba(46,125,50,0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '8px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  Poin Bank Sampah
                </span>
                <strong style={{ display: 'block', fontSize: '22px', marginTop: '4px', fontWeight: '800' }}>
                  {sampahBalance.toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 'normal', opacity: 0.9 }}>pts</span>
                </strong>
              </div>
              
              <button
                onClick={() => {
                  setShowPickupDrawer(true);
                  speak("Membuka laci request penjemputan sampah daur ulang.");
                }}
                style={{
                  background: 'white',
                  color: '#2e7d32',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                Request Pickup
              </button>
            </div>

            {/* Riwayat Daur Ulang */}
            <div>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
                Riwayat Daur Ulang
              </strong>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {localHistory.map((item, index) => (
                  <div 
                    key={index}
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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--accent-green)', display: 'flex' }}><TrashIcon /></span>
                      <div>
                        <strong style={{ fontSize: '10px', color: 'var(--text-primary)', display: 'block' }}>
                          {item.category}
                        </strong>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                          {item.date} • {item.id}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <strong style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: '800' }}>
                        +{item.points} pts
                      </strong>
                      <span style={{
                        fontSize: '7px',
                        background: item.status === 'Selesai' ? 'rgba(24,128,56,0.12)' : 'rgba(176,96,0,0.12)',
                        color: item.status === 'Selesai' ? '#137333' : '#b06000',
                        padding: '1px 4px',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 3. Waste Pickup Request Drawer Overlay */}
      {showPickupDrawer && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
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
              gap: '14px'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', alignSelf: 'center', cursor: 'pointer' }} onClick={() => setShowPickupDrawer(false)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--accent-green)' }}>♻️ Jadwalkan Setor Sampah</strong>
              <button onClick={() => setShowPickupDrawer(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div>
              <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Kategori Sampah:</label>
              <select 
                value={wasteCategory} 
                onChange={(e) => setWasteCategory(e.target.value as any)} 
                className="modern-input" 
                style={{ padding: '8px', fontSize: '11px' }}
              >
                <option value="Plastik">Plastik & Kertas (30 pts/kg)</option>
                <option value="Kertas">Kertas Bekas (20 pts/kg)</option>
                <option value="Logam">Logam / Kaleng (50 pts/kg)</option>
              </select>
            </div>

            {/* WEIGHT SLIDER COUNTER */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Perkiraan Berat:</label>
                <strong style={{ fontSize: '12px', color: 'var(--accent-green)' }}>{wasteWeight} kg</strong>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={wasteWeight}
                onChange={(e) => setWasteWeight(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-green)',
                  height: '6px',
                  borderRadius: '3px',
                  background: 'var(--border-color)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Animate potential reward pts dynamically */}
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '10px', padding: '10px 12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Estimasi Reward Poin:</span>
              <strong style={{ fontSize: '13px', color: 'var(--accent-green)' }}>+{estimatedPoints} pts</strong>
            </div>

            <button
              onClick={handleRequestPickup}
              className="btn-premium"
              style={{
                background: 'var(--accent-green)',
                padding: '10px',
                fontSize: '11px',
                boxShadow: '0 2px 6px rgba(46,125,50,0.2)',
                marginTop: '6px'
              }}
            >
              Setor & Panggil Kurir Jemput
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
