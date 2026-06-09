// MobileMobilityTab.tsx - Mobility (Mobilitas) view for JogjaOne Mobile App
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
}

// ----------------- SVG Icons Helper collection -----------------
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const LocationPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="12" y1="10" x2="12" y2="14" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const LeafIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 22c1.25-6.7 5.75-11.2 12.5-12.5M12 2c6.7 1.25 11.2 5.75 12.5 12.5" />
    <path d="M2 22C8.7 20.75 13.2 16.25 14.5 9.5" />
  </svg>
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
  uiMode
}: MobileMobilityTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayDrawer, setShowPayDrawer] = useState(false);
  const [payStatus, setPayStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [jogjaPayBalance, setJogjaPayBalance] = useState(45500); 

  // Keypad Refill State
  const [showRefillKeypad, setShowRefillKeypad] = useState(false);
  const [refillAmount, setRefillAmount] = useState('');

  // Selected Transit state
  const [selectedTransit, setSelectedTransit] = useState<'bus' | 'bentor' | 'delman'>('bus');
  const ticketFare = selectedTransit === 'bus' ? 3500 : selectedTransit === 'bentor' ? 5000 : 15000;

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
        setShowPayDrawer(false);
        setPayStatus('idle');
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
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* 1. Header Search Bar */}
      <form 
        onSubmit={handleSearch}
        style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-primary)',
          borderRadius: '24px',
          padding: '2px 12px',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex' }}><SearchIcon /></span>
          <input
            type="text"
            placeholder="Mau kemana hari ini?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'none',
              fontSize: '11px',
              padding: '6px 0',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        <button 
          type="button" 
          onClick={() => {
            setActiveRoute(['stasiun', 'malioboro']);
            speak("Menampilkan rute terdekat.");
          }}
          style={{
            background: 'var(--bg-tertiary)',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <LocationPinIcon />
        </button>
      </form>

      {/* 2. Interactive Map View */}
      <div style={{ flex: 1, position: 'relative', minHeight: '220px' }}>
        <InteractiveMap
          mode={uiMode}
          vehicles={vehicles}
          drainageNodes={drainageNodes}
          puddleReports={puddleReports}
          activeRoute={activeRoute.length > 0 ? activeRoute : ['stasiun', 'malioboro']}
        />

        {/* 3. Floating Overlay Cards */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          borderRadius: '14px',
          padding: '12px 14px',
          boxShadow: 'var(--shadow-md)',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', letterSpacing: '-0.2px' }}>
                Malioboro Mall
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                15 mnt • 2.4 km
              </span>
            </div>
            <strong style={{ fontSize: '13px', color: 'var(--accent-blue)', fontWeight: '800' }}>
              Rp {ticketFare.toLocaleString('id-ID')}
            </strong>
          </div>

          {/* Transit alternative tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '8px' }}>
            {[
              { id: 'bus', label: 'Trans Jogja', carbon: '0.1 kg', duration: '10m' },
              { id: 'bentor', label: 'Bentor Lstrk', carbon: '0.0 kg', duration: '12m' },
              { id: 'delman', label: 'Delman Wst', carbon: '0.0 kg', duration: '25m' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setSelectedTransit(item.id as any); speak(`Moda ${item.label} dipilih.`); }}
                style={{
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 0',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: selectedTransit === item.id ? 'var(--bg-secondary)' : 'transparent',
                  color: selectedTransit === item.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  boxShadow: selectedTransit === item.id ? 'var(--shadow-sm)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <span>{item.label}</span>
                <span style={{ fontSize: '6px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '1px', marginTop: '1px' }}>
                  <LeafIcon /> {item.carbon}
                </span>
              </button>
            ))}
          </div>

          {/* Route Steps detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', paddingLeft: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
            <div style={{ position: 'absolute', left: '4px', top: '14px', bottom: '12px', width: '1.5px', borderLeft: '1.5px dashed var(--accent-blue)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '-13.5px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', border: '1px solid var(--bg-secondary)' }} />
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Jl. Kaliurang KM 5</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '-13.5px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)', border: '1px solid var(--bg-secondary)' }} />
              <span style={{ background: 'rgba(26,115,232,0.12)', color: 'var(--accent-blue)', padding: '2px 6px', borderRadius: '10px', fontSize: '8px', fontWeight: 'bold' }}>
                {selectedTransit === 'bus' ? 'Bus 3A' : selectedTransit === 'bentor' ? 'Eco-Bentor' : 'Delman Wisata'} Shuttle
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '-13.5px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-danger)', border: '1px solid var(--bg-secondary)' }} />
              <span style={{ fontSize: '9px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Malioboro Mall</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Controls */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10
      }}>
        {/* Adaptive Green Light Status */}
        <div 
          onClick={triggerV2X}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: v2xActive ? 'var(--accent-green)' : '#888',
            boxShadow: v2xActive ? '0 0 6px var(--accent-green)' : 'none',
            display: 'inline-block',
            animation: v2xActive ? 'pulse 1s infinite' : 'none'
          }} />
          <span style={{ fontSize: '9px', color: v2xActive ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 'bold' }}>
            {v2xActive ? `V2X Green Light (+${v2xTimeRemaining}s)` : 'Adaptive Green Light'}
          </span>
        </div>

        {/* Pay Button */}
        <button 
          onClick={() => {
            setShowPayDrawer(true);
            speak("Membuka laci pembayaran JogjaPay.");
          }}
          style={{
            background: 'var(--brand-crimson)',
            color: 'white',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(139, 0, 0, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <WalletIcon /> Bayar (JogjaPay)
        </button>
      </div>

      {/* 5. JogjaPay Bottom Slide-up Drawer Overlay */}
      {showPayDrawer && (
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
              gap: '14px',
              position: 'relative'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', alignSelf: 'center', cursor: 'pointer' }} onClick={() => setShowPayDrawer(false)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>JogjaPay Wallet</strong>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Saldo Terintegrasi Layanan DIY</span>
              </div>
              <button onClick={() => setShowPayDrawer(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* Visual Bank Card */}
            <div style={{
              background: 'linear-gradient(135deg, hsl(356, 75%, 36%) 0%, #a91d22 100%)',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
              boxShadow: '0 4px 14px rgba(169,29,34,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>JOGJAPAY CARD</span>
                <span style={{ fontSize: '14px' }}>💳</span>
              </div>
              <strong style={{ display: 'block', fontSize: '18px', margin: '20px 0 10px 0', fontWeight: '800' }}>
                Rp {jogjaPayBalance.toLocaleString('id-ID')}
              </strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', opacity: 0.8 }}>
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
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                + Isi Ulang Saldo
              </button>
              <button
                onClick={startPayment}
                disabled={payStatus !== 'idle'}
                style={{
                  flex: 1,
                  background: 'var(--accent-blue)',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(26,115,232,0.15)'
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
                    background: 'rgba(26,115,232,0.12)',
                    border: '2px dashed var(--accent-blue)',
                    color: 'var(--accent-blue)',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 1s infinite'
                  }}>
                    🔍
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>Memverifikasi Sidik Jari...</span>
                </>
              )}

              {payStatus === 'success' && (
                <>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(24,128,56,0.12)',
                    border: '2px solid var(--accent-green)',
                    color: 'var(--accent-green)',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    ✓
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--accent-green)', fontWeight: 'bold' }}>Pembayaran Sukses!</span>
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
                background: 'var(--bg-secondary)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 200,
                animation: 'slide-up 0.25s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>Isi Ulang Saldo</strong>
                  <button onClick={() => setShowRefillKeypad(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Batal</button>
                </div>

                {/* Display Area */}
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', display: 'block' }}>NOMINAL ISI ULANG</span>
                  <strong style={{ fontSize: '20px', color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>
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
                        background: 'var(--bg-tertiary)',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
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
                    background: 'var(--accent-green)',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(24,128,56,0.15)'
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
