// MobileEnvironmentTab.tsx - Environment (Lingkungan) view for JogjaOne Mobile App (Version 2)
import React, { useState, useEffect } from 'react';
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
  setVehicles?: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  drainageNodes: MapNode[];
  puddleReports: Array<{ id: string; x: number; y: number; status: string }>;
  activeRoute: string[];
  grateStatus: 'normal' | 'clogged';
  setGrateStatus: (val: 'normal' | 'clogged') => void;
  sampahBalance: number;
  setSampahBalance: (val: number) => void;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  onNavigate?: (tab: 'home' | 'mobilitas' | 'lingkungan' | 'kesehatan' | 'lapor' | 'layanan') => void;
}

// ----------------- SVG Icons Helper collection -----------------
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function MobileEnvironmentTab({
  vehicles,
  setVehicles,
  sampahBalance,
  setSampahBalance,
  onNavigate
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
    if (setVehicles && vehicles.length > 1) {
      setVehicles(prev => {
        const next = [...prev];
        if (next.length > 1) {
          next[1] = {
            ...next[1],
            x: 290,
            y: 150,
            status: 'Kurir Penjemputan Sampah Daur Ulang'
          };
        }
        return next;
      });
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
      
      {/* 1. Header block (Green Gradient for Layanan/Environment) */}
      <div 
        style={{
          background: 'linear-gradient(180deg, #0F9D58 0%, #0B8043 100%)',
          padding: '20px 16px 20px 16px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 15px rgba(15,157,88,0.15)'
        }}
      >
        {/* Back Link */}
        <div 
          onClick={() => { if (onNavigate) onNavigate('home'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', width: 'fit-content' }}
        >
          <BackIcon />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Kembali</span>
        </div>

        {/* Title & Subtitle */}
        <div style={{ marginTop: '4px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.5px' }}>
            Layanan
          </h2>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', display: 'block', marginTop: '2px' }}>
            Pemantauan banjir & Bank Sampah
          </span>
        </div>
      </div>

      {/* 2. Segment Switcher (White Card container) */}
      <div style={{
        padding: '12px 16px',
        background: 'white',
        borderBottom: '1px solid #E0E0E0',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          background: '#F0F2F5',
          borderRadius: '20px',
          padding: '2px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <button
            onClick={() => { setActiveSegment('banjir'); speak("Membuka Pantau Banjir."); }}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '18px',
              padding: '6px 0',
              fontSize: '10.5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: activeSegment === 'banjir' ? '#1A73E8' : 'transparent',
              color: activeSegment === 'banjir' ? 'white' : '#5F6368',
              boxShadow: activeSegment === 'banjir' ? '0 2px 6px rgba(26,115,232,0.2)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            🌊 Pantau Banjir
          </button>
          <button
            onClick={() => { setActiveSegment('limbah'); speak("Membuka Manajemen Limbah."); }}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '18px',
              padding: '6px 0',
              fontSize: '10.5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: activeSegment === 'limbah' ? '#0F9D58' : 'transparent',
              color: activeSegment === 'limbah' ? 'white' : '#5F6368',
              boxShadow: activeSegment === 'limbah' ? '0 2px 6px rgba(15,157,88,0.2)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            ♻️ Bank Sampah
          </button>
        </div>
      </div>

      {/* 3. Active Segment Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '88px', boxSizing: 'border-box' }}>
        
        {/* ================= PANTAU BANJIR ================= */}
        {activeSegment === 'banjir' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', boxSizing: 'border-box' }}>
            
            {/* Flood Map Viewport Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              border: '1px solid #E0E0E0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              boxSizing: 'border-box',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  PETA SENSOR REAL-TIME
                </strong>
              </div>
              <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E0E0E0', position: 'relative' }}>
                {/* Visual Rivers Map Overlay from Screenshots */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: '#E8F0FE',
                  padding: '10px',
                  boxSizing: 'border-box',
                  fontFamily: 'system-ui, sans-serif'
                }}>
                  {/* Rivers lines */}
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {/* River 1 */}
                    <path d="M 40,20 Q 150,150 300,180" fill="none" stroke="#90CAF9" strokeWidth="6" strokeLinecap="round" />
                    {/* River 2 */}
                    <path d="M 120,20 Q 180,180 200,210" fill="none" stroke="#90CAF9" strokeWidth="6" strokeLinecap="round" />
                    {/* River 3 */}
                    <path d="M 280,20 Q 250,150 180,210" fill="none" stroke="#90CAF9" strokeWidth="6" strokeLinecap="round" />
                  </svg>

                  {/* Labels and Nodes */}
                  {/* Winongo Hulu */}
                  <div style={{ position: 'absolute', left: '80px', top: '45px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0F9D58', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <span style={{ fontSize: '7.5px', color: '#3C4043', marginTop: '2px', fontWeight: 'bold' }}>Winongo Hulu</span>
                  </div>

                  {/* Code Tengah */}
                  <div style={{ position: 'absolute', left: '175px', top: '65px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FBBC05', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <span style={{ fontSize: '7.5px', color: '#3C4043', marginTop: '2px', fontWeight: 'bold' }}>Code Tengah</span>
                  </div>

                  {/* Gajah Wong */}
                  <div style={{ position: 'absolute', left: '125px', top: '125px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0F9D58', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <span style={{ fontSize: '7.5px', color: '#3C4043', marginTop: '2px', fontWeight: 'bold' }}>Gajah Wong</span>
                  </div>

                  {/* Winongo Hilir */}
                  <div style={{ position: 'absolute', left: '210px', top: '135px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0F9D58', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    <span style={{ fontSize: '7.5px', color: '#3C4043', marginTop: '2px', fontWeight: 'bold' }}>Winongo Hilir</span>
                  </div>

                  {/* Code Hilir */}
                  <div style={{ position: 'absolute', left: '60px', top: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EA4335', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', animation: 'pulse-ring 1.5s infinite' }} />
                    <span style={{ fontSize: '7.5px', color: '#3C4043', marginTop: '2px', fontWeight: 'bold' }}>Code Hilir</span>
                  </div>

                  {/* Map Legend Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'white',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: '1px solid #E0E0E0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0F9D58' }} />
                      <span style={{ fontSize: '7px', color: '#5F6368' }}>Normal</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FBBC05' }} />
                      <span style={{ fontSize: '7px', color: '#5F6368' }}>Waspada</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA4335' }} />
                      <span style={{ fontSize: '7px', color: '#5F6368' }}>Banjir</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* River Levels Section Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              border: '1px solid #E0E0E0',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              boxSizing: 'border-box'
            }}>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '800' }}>
                Level Sungai
              </strong>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Sungai Code', value: '1.2m', percentage: 65, color: '#00B0FF' },
                  { name: 'Sungai Winongo', value: '0.8m', percentage: 40, color: '#00B0FF' },
                  { name: 'Sungai Gajah Wong', value: '1.1m', percentage: 58, color: '#00B0FF' }
                ].map((river, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#1C1E21', marginBottom: '4px' }}>
                      <span>{river.name}</span>
                      <span style={{ color: '#1A73E8' }}>{river.value}</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: '#F0F2F5', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${river.percentage}%`, background: river.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CCTV Live Section Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              border: '1px solid #E0E0E0',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800' }}>
                  <VideoIcon /> CCTV LIVE
                </strong>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {cctvClock}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
                {/* CCTV 1: Pintu Air Code */}
                <div style={{ background: '#F4F6F9', borderRadius: '12px', border: '1px solid #E0E0E0', overflow: 'hidden', padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ height: '90px', background: '#20232D', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                    {playCctvCode ? (
                      <iframe 
                        src="https://www.youtube.com/embed/live_stream?channel=UCw_bU-Yf3y43u8qB6G77d3A&autoplay=1&mute=1" 
                        title="Pintu Air Code" 
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <span style={{ fontSize: '20px', color: '#95a5a6' }}>📹</span>
                    )}
                    
                    {/* Live red badge */}
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: '#EA4335',
                      color: 'white',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontSize: '6.5px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'white', display: 'inline-block' }} />
                      LIVE
                    </div>
                  </div>
                  
                  <div style={{ padding: '2px 4px 0 4px' }}>
                    <strong style={{ fontSize: '9px', color: 'var(--text-primary)', display: 'block' }}>Pintu Air Sungai Code</strong>
                    <span style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>Kota Jogja</span>
                  </div>

                  <button
                    onClick={handleToggleCctvCode}
                    style={{
                      width: '100%',
                      background: '#1A73E8',
                      color: 'white',
                      border: 'none',
                      padding: '6px 0',
                      borderRadius: '8px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 4px rgba(26,115,232,0.1)'
                    }}
                  >
                    {playCctvCode ? '⏸ Jeda CCTV' : '▷ Lihat CCTV'}
                  </button>
                </div>

                {/* CCTV 2: Simpang Tugu */}
                <div style={{ background: '#F4F6F9', borderRadius: '12px', border: '1px solid #E0E0E0', overflow: 'hidden', padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ height: '90px', background: '#20232D', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                    {playCctvTugu ? (
                      <iframe 
                        src="https://www.youtube.com/embed/live_stream?channel=UCxS-G24K6-l7i4_G5N0V8oA&autoplay=1&mute=1" 
                        title="Simpang Tugu" 
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <span style={{ fontSize: '20px', color: '#95a5a6' }}>📹</span>
                    )}

                    {/* Live red badge */}
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: '#EA4335',
                      color: 'white',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontSize: '6.5px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'white', display: 'inline-block' }} />
                      LIVE
                    </div>
                  </div>

                  <div style={{ padding: '2px 4px 0 4px' }}>
                    <strong style={{ fontSize: '9px', color: 'var(--text-primary)', display: 'block' }}>Simpang Tugu</strong>
                    <span style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>Pal Putih</span>
                  </div>

                  <button
                    onClick={handleToggleCctvTugu}
                    style={{
                      width: '100%',
                      background: '#1A73E8',
                      color: 'white',
                      border: 'none',
                      padding: '6px 0',
                      borderRadius: '8px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 4px rgba(26,115,232,0.1)'
                    }}
                  >
                    {playCctvTugu ? '⏸ Jeda CCTV' : '▷ Lihat CCTV'}
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ================= MANAJEMEN LIMBAH ================= */}
        {activeSegment === 'limbah' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', boxSizing: 'border-box' }}>
            
            {/* Poin Bank Sampah Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              borderRadius: '20px',
              padding: '18px',
              color: 'white',
              boxShadow: '0 6px 20px rgba(46,125,50,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '9px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  Poin Bank Sampah Anda
                </span>
                <strong style={{ display: 'block', fontSize: '24px', marginTop: '4px', fontWeight: '800' }}>
                  {sampahBalance.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.9 }}>pts</span>
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
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '10px',
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
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginBottom: '10px', fontWeight: '700' }}>
                Riwayat Setoran Daur Ulang
              </strong>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {localHistory.map((item, index) => (
                  <div 
                    key={index}
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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#2e7d32', display: 'flex' }}><TrashIcon /></span>
                      <div>
                        <strong style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'block', fontWeight: '600' }}>
                          {item.category}
                        </strong>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                          {item.date} • {item.id}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <strong style={{ fontSize: '12px', color: '#137333', fontWeight: '800' }}>
                        +{item.points} pts
                      </strong>
                      <span style={{
                        fontSize: '8px',
                        background: item.status === 'Selesai' ? '#E6F4EA' : '#FFF4E5',
                        color: item.status === 'Selesai' ? '#137333' : '#B06000',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        border: item.status === 'Selesai' ? '1px solid #A8DAB5' : '1px solid #FFE0B2'
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

      {/* 4. Waste Pickup Request Drawer Overlay */}
      {showPickupDrawer && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
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
                onChange={(e) => setWasteCategory(e.target.value as 'Plastik' | 'Kertas' | 'Logam')} 
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
