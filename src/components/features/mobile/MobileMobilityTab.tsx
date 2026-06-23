// MobileMobilityTab.tsx - Mobility (Mobilitas) view for JogjaOne Mobile App (Version 2)
import React, { useState } from 'react';
import InteractiveMap from '@/components/InteractiveMap';
import { speak } from '@/utils/speech';

interface Vehicle {
  id: string;
  name: string;
  type: 'bus' | 'bentor' | 'bajaj' | 'delman';
  x: number;
  y: number;
  status: string;
}

interface MapNode {
  id: string;
  name: string;
  type: 'landmark' | 'health' | 'grate' | 'user';
  x: number;
  y: number;
  status?: string;
  details?: string;
}

interface MobileMobilityTabProps {
  vehicles: Vehicle[];
  drainageNodes: MapNode[];
  puddleReports: Array<{ id: string; x: number; y: number; status: string }>;
  activeRoute: string[];
  setActiveRoute: (route: string[]) => void;
  v2xActive: boolean;
  v2xTimeRemaining: number;
  triggerV2X: () => void;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  onNavigate?: (tab: 'home' | 'mobilitas' | 'lingkungan' | 'kesehatan' | 'lapor' | 'layanan') => void;
  jogjaPayBalance: number;
  setJogjaPayBalance: React.Dispatch<React.SetStateAction<number>>;
  onBookTransit: () => void;
  onDrawerStateChange?: (isOpen: boolean) => void;
}

const getFs = (size: number) => `calc(${size}px * var(--font-scale))`;

// ----------------- SVG Icons Helper collection -----------------
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const WalletIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="12" y1="10" x2="12" y2="14" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const BusModaIcon = () => (
  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4" width="14" height="16" rx="2" ry="2" />
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="9" y1="22" x2="9" y2="22" />
      <line x1="15" y1="22" x2="15" y2="22" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  </div>
);

const BentorModaIcon = () => (
  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#E6F4EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#137333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m13 6-5 6h4v6l5-6h-4z" fill="#137333" />
    </svg>
  </div>
);

const DelmanModaIcon = () => (
  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEF7E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B06000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  </div>
);

export default function MobileMobilityTab({
  vehicles,
  drainageNodes,
  puddleReports,
  activeRoute,
  setActiveRoute,
  v2xActive,
  v2xTimeRemaining,
  triggerV2X,
  uiMode,
  onNavigate,
  jogjaPayBalance,
  setJogjaPayBalance,
  onBookTransit,
  onDrawerStateChange
}: MobileMobilityTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayDrawer, setShowPayDrawer] = useState(false);
  const [payStatus, setPayStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [mobilityStep, setMobilityStep] = useState<'list' | 'order'>('list');
  const [originStation, setOriginStation] = useState('Stasiun Yogyakarta (YK)');
  const [destStation, setDestStation] = useState('Malioboro Mall');

  // Keypad Refill State
  const [showRefillKeypad, setShowRefillKeypad] = useState(false);
  const [refillAmount, setRefillAmount] = useState('');

  // Selected Transit state
  const [selectedTransit, setSelectedTransit] = useState<'bus' | 'bentor' | 'delman'>('bentor');
  const ticketFare = selectedTransit === 'bus' ? 3500 : selectedTransit === 'bentor' ? 5000 : 15000;

  React.useEffect(() => {
    onDrawerStateChange?.(showPayDrawer || showRefillKeypad);
  }, [showPayDrawer, showRefillKeypad, onDrawerStateChange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.toLowerCase().includes('malioboro')) {
      setActiveRoute(['stasiun', 'malioboro']);
      speak("Rute ke Malioboro Mall ditemukan. Durasi 15 menit, tarif 3500 rupiah.");
    } else if (searchQuery.toLowerCase().includes('kraton')) {
      setActiveRoute(['malioboro', 'kraton']);
      speak("Rute ke Kraton Yogyakarta ditemukan. Durasi 10 menit, tarif 3500 rupiah.");
    } else {
      setActiveRoute(['tugu', 'malioboro']);
      speak(`Mencari rute ke ${searchQuery}.`);
    }
  };

  const startPayment = () => {
    if (jogjaPayBalance < ticketFare) {
      speak("Saldo JogjaPay tidak mencukupi. Silakan lakukan isi ulang.");
      return;
    }
    setPayStatus('scanning');
    speak("Pindai sidik jari Anda untuk memverifikasi pembayaran.");
    
    setTimeout(() => {
      setPayStatus('success');
      setJogjaPayBalance(prev => prev - ticketFare);
      speak(`Pembayaran Rp ${ticketFare} sukses menggunakan JogjaPay.`);
      
      setTimeout(() => {
        onBookTransit();
        setShowPayDrawer(false);
        setPayStatus('idle');
        setMobilityStep('list');
      }, 2000);
    }, 1500);
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setRefillAmount('');
    } else if (val === '←') {
      setRefillAmount(prev => prev.slice(0, -1));
    } else {
      if (refillAmount.length < 6) {
        setRefillAmount(prev => prev + val);
      }
    }
  };

  const confirmRefill = () => {
    const amountNum = parseInt(refillAmount) || 0;
    if (amountNum < 5000) {
      speak("Minimal isi ulang adalah 5000 rupiah.");
      return;
    }
    setJogjaPayBalance(prev => prev + amountNum);
    speak(`Sukses mengisi ulang saldo JogjaPay sebesar ${amountNum} rupiah.`);
    setRefillAmount('');
    setShowRefillKeypad(false);
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
          onClick={() => {
            if (mobilityStep === 'order') {
              setMobilityStep('list');
              speak("Kembali ke daftar pilihan transportasi.");
            } else if (onNavigate) {
              onNavigate('home');
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', width: 'fit-content' }}
        >
          <BackIcon />
          <span style={{ fontSize: getFs(12), fontWeight: 600 }}>Kembali</span>
        </div>

        {/* Title & Subtitle */}
        <div style={{ marginTop: '4px' }}>
          <h2 style={{ fontSize: getFs(22), fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.5px' }}>
            Mobilitas
          </h2>
          <span style={{ fontSize: getFs(11), color: 'rgba(255,255,255,0.85)', display: 'block', marginTop: '2px' }}>
            Transportasi cerdas Yogyakarta
          </span>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      {mobilityStep === 'order' ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '140px', boxSizing: 'border-box' }}>
          
          {/* Travel Summary Card */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E0E0E0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <strong style={{ fontSize: getFs(10), fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              RINCIAN TIKET PERJALANAN
            </strong>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {selectedTransit === 'bus' ? <BusModaIcon /> : selectedTransit === 'bentor' ? <BentorModaIcon /> : <DelmanModaIcon />}
              <div>
                <strong style={{ fontSize: getFs(14), color: '#1C1E21' }}>
                  {selectedTransit === 'bus' ? 'Trans Jogja' : selectedTransit === 'bentor' ? 'Eco-Bentor' : 'Delman Wisata'}
                </strong>
                <span style={{ fontSize: getFs(10), color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  {selectedTransit === 'bus' ? 'Moda Bus Transit' : selectedTransit === 'bentor' ? 'Moda Listrik Ramah Lingkungan' : 'Moda Wisata Budaya'}
                </span>
              </div>
            </div>
          </div>

          {/* Route Selection */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E0E0E0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <strong style={{ fontSize: getFs(10), fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              RUTE PERJALANAN
            </strong>
            
            <div>
              <label style={{ fontSize: getFs(9), fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Titik Asal:</label>
              <select
                value={originStation}
                onChange={(e) => {
                  setOriginStation(e.target.value);
                  speak(`Asal perjalanan diatur ke ${e.target.value}`);
                }}
                className="modern-input"
                style={{ padding: '8px', fontSize: getFs(11) }}
              >
                <option value="Stasiun Yogyakarta (YK)">Stasiun Yogyakarta (YK)</option>
                <option value="Tugu Yogyakarta">Simpang Pal Putih / Tugu</option>
                <option value="Halte Malioboro 1">Halte Trans Jogja Malioboro 1</option>
                <option value="Kraton Yogyakarta">Alun-Alun Utara Kraton</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: getFs(9), fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Titik Tujuan:</label>
              <select
                value={destStation}
                onChange={(e) => {
                  setDestStation(e.target.value);
                  speak(`Tujuan perjalanan diatur ke ${e.target.value}`);
                }}
                className="modern-input"
                style={{ padding: '8px', fontSize: getFs(11) }}
              >
                <option value="Malioboro Mall">Malioboro Mall</option>
                <option value="Stasiun Yogyakarta (YK)">Stasiun Yogyakarta (YK)</option>
                <option value="Kraton Yogyakarta">Kraton Yogyakarta / Istana</option>
                <option value="Puskesmas Jetis">Puskesmas Jetis Yogyakarta</option>
              </select>
            </div>
          </div>

          {/* Payment Details Card */}
          <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E0E0E0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <strong style={{ fontSize: getFs(10), fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              RINCIAN BIAYA & MANFAAT
            </strong>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: getFs(11) }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tarif Perjalanan:</span>
              <strong style={{ color: 'var(--text-primary)' }}>Rp {ticketFare.toLocaleString('id-ID')}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: getFs(11) }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimasi Durasi:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedTransit === 'bus' ? '10 menit' : selectedTransit === 'bentor' ? '12 menit' : '25 menit'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: getFs(11) }}>
              <span style={{ color: 'var(--text-secondary)' }}>Penghematan CO₂:</span>
              <strong style={{ color: '#137333' }}>{selectedTransit === 'bus' ? '0.1 kg' : selectedTransit === 'bentor' ? '0.4 kg' : '0.5 kg'} CO₂</strong>
            </div>

            <div style={{ borderTop: '1px dashed #E0E0E0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: getFs(10), fontWeight: 'bold', color: 'var(--text-primary)' }}>Total Pembayaran:</span>
              <strong style={{ fontSize: getFs(14), color: 'var(--accent-blue)', fontWeight: '850' }}>Rp {ticketFare.toLocaleString('id-ID')}</strong>
            </div>
          </div>

          {/* JogjaPay Balance Status Card */}
          {jogjaPayBalance < ticketFare && (
            <div style={{ background: '#FCE8E6', border: '1px solid #FAD2CF', borderRadius: '12px', padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: getFs(14) }}>⚠️</span>
              <span style={{ fontSize: getFs(9.5), color: '#C5221F', fontWeight: 500 }}>
                Saldo JogjaPay tidak mencukupi (Rp {jogjaPayBalance.toLocaleString('id-ID')}). Silakan Top Up terlebih dahulu.
              </span>
            </div>
          )}

        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '120px', boxSizing: 'border-box' }}>
          
          {/* Search Bar Input */}
          <form 
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'white',
              borderRadius: '16px',
              padding: '2px 14px',
              border: '1px solid #E0E0E0',
              boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Mau ke mana hari ini?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'none',
                padding: '12px 0',
                fontSize: getFs(12),
                width: '100%',
                color: 'var(--text-primary)'
              }}
            />
          </form>

          {/* Peta GIS Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #E0E0E0',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: getFs(10), fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                PETA JOGJA
              </strong>
            </div>
            <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E0E0E0', position: 'relative' }}>
              <InteractiveMap
                mode={uiMode}
                vehicles={vehicles}
                drainageNodes={drainageNodes}
                puddleReports={puddleReports}
                activeRoute={activeRoute.length > 0 ? activeRoute : ['stasiun', 'tugu']}
              />
            </div>
          </div>

          {/* PILIH TRANSPORTASI Heading */}
          <div>
            <strong style={{ fontSize: getFs(9), fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>
              PILIH TRANSPORTASI
            </strong>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Trans Jogja Card */}
              <div 
                onClick={() => { setSelectedTransit('bus'); setMobilityStep('order'); speak("Moda Trans Jogja dipilih. Silakan tinjau rincian pemesanan Anda."); }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: selectedTransit === 'bus' ? '2px solid #1A73E8' : '1px solid #E0E0E0',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <BusModaIcon />
                  <div>
                    <strong style={{ fontSize: getFs(13), color: '#1C1E21', display: 'block' }}>Trans Jogja</strong>
                    <span style={{ fontSize: getFs(9), color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>
                      Rute 1A · Malioboro → Tugu
                    </span>
                    <span style={{ fontSize: getFs(10), color: '#1C1E21', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                      Rp3.500 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>•</span> 10 mnt <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>•</span> <span style={{ color: '#137333' }}>0.1 kg CO₂</span>
                    </span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: selectedTransit === 'bus' ? '5px solid #1A73E8' : '2px solid #CCCCCC',
                  boxSizing: 'border-box'
                }} />
              </div>

              {/* Eco-Bentor Card */}
              <div 
                onClick={() => { setSelectedTransit('bentor'); setMobilityStep('order'); speak("Moda Eco Bentor dipilih. Silakan tinjau rincian pemesanan Anda."); }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: selectedTransit === 'bentor' ? '2px solid #1A73E8' : '1px solid #E0E0E0',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <BentorModaIcon />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: getFs(13), color: '#1C1E21' }}>Eco-Bentor</strong>
                      <span style={{
                        background: '#E6F4EA',
                        color: '#137333',
                        fontSize: getFs(7.5),
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        border: '0.5px solid rgba(19,115,51,0.15)'
                      }}>
                        Most Eco Friendly
                      </span>
                    </div>
                    <span style={{ fontSize: getFs(9), color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>
                      Tenaga listrik · 0 emisi
                    </span>
                    <span style={{ fontSize: getFs(10), color: '#1C1E21', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                      Rp5.000 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>•</span> 12 mnt <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>•</span> <span style={{ color: '#137333' }}>0 kg CO₂</span>
                    </span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: selectedTransit === 'bentor' ? '5px solid #1A73E8' : '2px solid #CCCCCC',
                  boxSizing: 'border-box'
                }} />
              </div>

              {/* Delman Wisata Card */}
              <div 
                onClick={() => { setSelectedTransit('delman'); setMobilityStep('order'); speak("Moda Delman Wisata dipilih. Silakan tinjau rincian pemesanan Anda."); }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: selectedTransit === 'delman' ? '2px solid #1A73E8' : '1px solid #E0E0E0',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <DelmanModaIcon />
                  <div>
                    <strong style={{ fontSize: getFs(13), color: '#1C1E21', display: 'block' }}>Delman Wisata</strong>
                    <span style={{ fontSize: getFs(9), color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>
                      Wisata budaya · area Kraton
                    </span>
                    <span style={{ fontSize: getFs(10), color: '#1C1E21', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                      Rp15.000 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>•</span> 25 mnt <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>•</span> <span style={{ color: '#137333' }}>0 kg CO₂</span>
                    </span>
                  </div>
                </div>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: selectedTransit === 'delman' ? '5px solid #1A73E8' : '2px solid #CCCCCC',
                  boxSizing: 'border-box'
                }} />
              </div>
            </div>
          </div>

          {/* Adaptive Green Light Action Button */}
          <button
            onClick={triggerV2X}
            style={{
              background: 'white',
              borderRadius: '16px',
              border: '1.5px solid #E0E0E0',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
              width: '100%',
              fontWeight: 'bold',
              fontSize: getFs(11),
              color: v2xActive ? '#137333' : '#1C1E21',
              transition: 'all 0.2s'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: v2xActive ? '#00E676' : '#888',
              boxShadow: v2xActive ? '0 0 8px #00E676' : 'none',
              display: 'inline-block',
              animation: v2xActive ? 'pulse 1s infinite' : 'none'
            }} />
            Adaptive Green Light — {v2xActive ? `Aktif (+${v2xTimeRemaining}s)` : 'Aktifkan'}
          </button>

        </div>
      )}

      {/* 3. Bottom controls container */}
      {mobilityStep === 'list' && (
        <div style={{
          padding: '12px 16px',
          background: 'white',
          borderTop: '1px solid #E0E0E0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10,
          position: 'absolute',
          bottom: '56px',
          left: 0,
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
        }}>
          {/* JogjaPay Wallet Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: getFs(18) }}>💳</span>
            <div>
              <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Saldo JogjaPay</span>
              <strong style={{ fontSize: getFs(12), color: '#1C1E21' }}>Rp {jogjaPayBalance.toLocaleString('id-ID')}</strong>
            </div>
          </div>

          {/* Top Up Button */}
          <button 
            onClick={() => {
              setShowRefillKeypad(true);
              speak("Membuka menu isi ulang saldo.");
            }}
            style={{
              background: '#F4F6F9',
              color: '#1C1E21',
              border: '1px solid #E0E0E0',
              padding: '10px 14px',
              borderRadius: '16px',
              fontSize: getFs(10),
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            + Top Up
          </button>
        </div>
      )}

      {/* Sticky bottom bar for ORDER step */}
      {mobilityStep === 'order' && (
        <div style={{
          padding: '12px 16px',
          background: 'white',
          borderTop: '1px solid #E0E0E0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10,
          position: 'absolute',
          bottom: '56px',
          left: 0,
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo JogjaPay</span>
              <strong style={{ fontSize: getFs(12), color: jogjaPayBalance < ticketFare ? '#EA4335' : '#137333' }}>Rp {jogjaPayBalance.toLocaleString('id-ID')}</strong>
            </div>
            <strong style={{ fontSize: getFs(13), color: '#1A73E8' }}>Total: Rp {ticketFare.toLocaleString('id-ID')}</strong>
          </div>
          {jogjaPayBalance < ticketFare ? (
            <button
              onClick={() => {
                setShowRefillKeypad(true);
                speak("Membuka menu isi ulang saldo.");
              }}
              className="btn-premium"
              style={{ background: '#EA4335', padding: '12px', fontSize: getFs(12), borderRadius: '16px', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              ⚠️ Saldo Kurang — Top Up Sekarang
            </button>
          ) : (
            <button
              onClick={() => {
                setShowPayDrawer(true);
                speak("Membuka laci verifikasi pembayaran JogjaPay.");
              }}
              className="btn-premium"
              style={{ background: '#1A73E8', padding: '13px', fontSize: getFs(12.5), borderRadius: '16px', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', width: '100%', boxShadow: '0 4px 14px rgba(26,115,232,0.25)' }}
            >
              ✅ Konfirmasi & Bayar via JogjaPay
            </button>
          )}
        </div>
      )}

      {/* 5. JogjaPay Bottom Slide-up Drawer Overlay */}
      {showPayDrawer && (
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
              background: 'white',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 24px',
              boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: '#E0E0E0', borderRadius: '2px', alignSelf: 'center', cursor: 'pointer' }} onClick={() => setShowPayDrawer(false)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E0E0', paddingBottom: '10px' }}>
              <div>
                <strong style={{ fontSize: getFs(13), color: '#1C1E21', display: 'block' }}>JogjaPay Wallet</strong>
                <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>Saldo Terintegrasi Layanan DIY</span>
              </div>
              <button onClick={() => setShowPayDrawer(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: getFs(16), cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* Visual Bank Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1A73E8 0%, #1557B0 100%)',
              borderRadius: '16px',
              padding: '16px',
              color: 'white',
              boxShadow: '0 8px 20px rgba(26,115,232,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: getFs(11), fontWeight: 'bold', letterSpacing: '1px' }}>JOGJAPAY CARD</span>
                <span style={{ fontSize: getFs(14) }}>💳</span>
              </div>
              <strong style={{ display: 'block', fontSize: getFs(20), margin: '20px 0 10px 0', fontWeight: '800' }}>
                Rp {jogjaPayBalance.toLocaleString('id-ID')}
              </strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: getFs(8), opacity: 0.8 }}>
                <span>METROPOLIS ID: 90812 8820</span>
                <span>EXP: 12/30</span>
              </div>
            </div>

            {/* Pay Button / Refill Trigger */}
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                onClick={() => {
                  setShowRefillKeypad(true);
                  speak("Masukkan nominal isi ulang.");
                }}
                style={{
                  flex: 1,
                  background: '#F4F6F9',
                  color: '#1C1E21',
                  border: '1px solid #E0E0E0',
                  padding: '12px',
                  borderRadius: '16px',
                  fontSize: getFs(11),
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                + Top Up
              </button>
              <button
                onClick={startPayment}
                disabled={payStatus !== 'idle'}
                style={{
                  flex: 1,
                  background: '#1A73E8',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '16px',
                  fontSize: getFs(11),
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(26,115,232,0.15)'
                }}
              >
                Bayar Rp {ticketFare.toLocaleString('id-ID')}
              </button>
            </div>

            {/* Fingerprint verification segment */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
              {payStatus === 'scanning' && (
                <>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(26,115,232,0.08)',
                    border: '2px dashed #1A73E8',
                    color: '#1A73E8',
                    fontSize: getFs(20),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 1s infinite'
                  }}>
                    🔍
                  </div>
                  <span style={{ fontSize: getFs(9), color: '#1A73E8', fontWeight: 'bold' }}>Memverifikasi Sidik Jari...</span>
                </>
              )}

              {payStatus === 'success' && (
                <>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(24,128,56,0.08)',
                    border: '2px solid #137333',
                    color: '#137333',
                    fontSize: getFs(20),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    ✓
                  </div>
                  <span style={{ fontSize: getFs(9), color: '#137333', fontWeight: 'bold' }}>Pembayaran Sukses! Rute terpesan.</span>
                </>
              )}
            </div>

            {/* Keypad Overlay for refilling */}
            {showRefillKeypad && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'white',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 2000,
                animation: 'slide-up 0.25s ease',
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E0E0', paddingBottom: '8px' }}>
                  <strong style={{ fontSize: getFs(12), color: '#1C1E21' }}>Isi Ulang Saldo</strong>
                  <button onClick={() => setShowRefillKeypad(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: getFs(14), cursor: 'pointer', fontWeight: 'bold' }}>Batal</button>
                </div>

                {/* Display Area */}
                <div style={{ background: '#F4F6F9', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid #E0E0E0' }}>
                  <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', display: 'block' }}>NOMINAL ISI ULANG</span>
                  <strong style={{ fontSize: getFs(20), color: '#1C1E21', display: 'block', marginTop: '4px' }}>
                    Rp {(parseInt(refillAmount) || 0).toLocaleString('id-ID')}
                  </strong>
                </div>

                {/* Numeric Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', flex: 1 }}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '←'].map(key => (
                    <button
                      key={key}
                      onClick={() => handleKeypadPress(key)}
                      style={{
                        background: '#F4F6F9',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: getFs(14),
                        fontWeight: 'bold',
                        color: '#1C1E21',
                        cursor: 'pointer',
                        padding: '10px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                <button
                  onClick={confirmRefill}
                  style={{
                    background: '#137333',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '16px',
                    fontSize: getFs(11),
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(24,128,56,0.15)'
                  }}
                >
                  Konfirmasi Isi Ulang
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
