// MobileApp.tsx - Smartphone optimized interface matching official JogjaOne screens
import React, { useState } from 'react';
import { speak } from '@/utils/speech';

// Import newly created modular mobile tabs
import MobileHomeTab from './MobileHomeTab';
import MobileMobilityTab from './MobileMobilityTab';
import MobileEnvironmentTab from './MobileEnvironmentTab';
import MobileHealthTab from './MobileHealthTab';
import MobileReportTab from './MobileReportTab';
import MobileAnalyticsTab from './MobileAnalyticsTab';

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

interface MobileAppProps {
  // Authentication & Layout Mode
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  setUiMode: (mode: 'default' | 'lansia' | 'disabilitas') => void;
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: string;
  setFontSize: (fontSize: string) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (val: boolean) => void;
  
  // Shared States
  v2xActive: boolean;
  v2xTimeRemaining: number;
  triggerV2X: () => void;
  grateStatus: 'normal' | 'clogged';
  setGrateStatus: (val: 'normal' | 'clogged') => void;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  drainageNodes: MapNode[];
  setDrainageNodes: React.Dispatch<React.SetStateAction<MapNode[]>>;
  puddleReports: Array<{ id: string; x: number; y: number; status: string }>;
  setPuddleReports: React.Dispatch<React.SetStateAction<Array<{ id: string; x: number; y: number; status: string }>>>;
  activeRoute: string[];
  setActiveRoute: (route: string[]) => void;
  triggerPuddleStatus: (nodeId: string) => void;
  
  // Credentials
  username: string;
  setUsername: (username: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onLoginSubmit: (e: React.FormEvent) => void;
  onGuestLogin: () => void;

  // Transit state
  transitFrom: string;
  setTransitFrom: (val: string) => void;
  transitTo: string;
  setTransitTo: (val: string) => void;
  transitMode: 'bus' | 'bentor' | 'bajaj' | 'delman';
  setTransitMode: (val: 'bus' | 'bentor' | 'bajaj' | 'delman') => void;
  transitPriorityDisabled: boolean;
  setTransitPriorityDisabled: (val: boolean) => void;
  onBookTransit: () => void;
  generateVoiceDirections: () => void;
  voiceDirections: string;

  // Health state
  selectedClinic: string;
  setSelectedClinic: (val: string) => void;
  selectedRoom: string;
  setSelectedRoom: (val: string) => void;
  bookingDate: string;
  setBookingDate: (val: string) => void;
  onBookHealth: () => void;

  // Waste state
  sampahCategory: 'Plastik' | 'Kertas' | 'Logam';
  setSampahCategory: (val: 'Plastik' | 'Kertas' | 'Logam') => void;
  sampahWeight: number;
  setSampahWeight: (val: number) => void;
  onRecyclePickupSubmit: () => void;
  sampahBalance: number;
  setSampahBalance: (val: number) => void;
  pickupHistory: Array<{ id: string; category: string; weight: number; points: number; status: string }>;
  waterFlow: number[];
  grateWeight: number[];
  cctvEventShow: boolean;
  setCctvEventShow: (val: boolean) => void;
  triggerSmartGrateOffender: () => void;

  // Reports state
  laporCategory: 'Infrastruktur' | 'Genangan' | 'Sampah' | 'Lainnya';
  setLaporCategory: (val: 'Infrastruktur' | 'Genangan' | 'Sampah' | 'Lainnya') => void;
  laporDescription: string;
  setLaporDescription: (val: string) => void;
  laporLocationName: string;
  setLaporLocationName: (val: string) => void;
  laporImageMock: string;
  setLaporImageMock: (val: string) => void;
  laporSuccess: boolean;
  onReportSubmit: (e: React.FormEvent) => void;
  onLansiaQuickReport: (category: 'Sampah' | 'Infrastruktur', desc: string, loc: string) => void;
  dashcamImage: string;
  detectedItem: { label: string; confidence: number; x: number; y: number; width: number; height: number } | null;
}

// ----------------- Navigation SVG Icons Helper collection -----------------
const HomeNavIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const TransitNavIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="4" width="14" height="16" rx="2" ry="2" />
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="9" y1="22" x2="9" y2="22" />
    <line x1="15" y1="22" x2="15" y2="22" />
    <circle cx="12" cy="9" r="2" />
  </svg>
);

const HealthNavIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const ReportNavIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LayananNavIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const BellNavIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function MobileApp(props: MobileAppProps) {
  // Tabs: 'home' (Beranda), 'mobilitas', 'kesehatan', 'lapor', 'layanan' (Layanan/Analytics), 'lingkungan' (Environment Subview)
  const [activeTab, setActiveTab] = useState<'home' | 'mobilitas' | 'lingkungan' | 'kesehatan' | 'lapor' | 'layanan'>('home');
  const [activeDrawer, setActiveDrawer] = useState<'more' | null>(null);

  const handleUiModeSelect = (newMode: 'default' | 'lansia' | 'disabilitas', label: string) => {
    props.setUiMode(newMode);
    speak(`Profil Aksesibilitas diaktifkan: ${label}`);
    if (newMode === 'disabilitas') {
      props.setTheme('high-contrast');
      props.setFontSize('font-scale-large');
      props.setVoiceEnabled(true);
    } else if (newMode === 'lansia') {
      props.setTheme('light');
      props.setFontSize('font-scale-large');
      props.setVoiceEnabled(false);
    } else {
      props.setTheme('dark');
      props.setFontSize('font-scale-medium');
      props.setVoiceEnabled(false);
    }
  };

  if (!props.isLoggedIn) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          width: '100%', 
          background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)', 
          padding: '40px 24px 24px 24px',
          boxSizing: 'border-box',
          justifyContent: 'space-between',
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        {/* Top Accent / Logo area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', gap: '12px' }}>
          {/* Logo Circle */}
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, var(--brand-crimson) 0%, hsl(356, 75%, 20%) 100%)', 
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--brand-gold)',
            animation: 'float-animation 4s ease-in-out infinite'
          }}>
            <span style={{ fontSize: '28px' }}>👑</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
              JogjaOne
            </h1>
            <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2px', display: 'block' }}>
              Satu Layanan Kota Cerdas
            </span>
          </div>
        </div>

        {/* Form area */}
        <form 
          onSubmit={props.onLoginSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', margin: '20px 0' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>NAMA PENGGUNA / NIK</label>
            <input 
              type="text"
              placeholder="Masukkan NIK atau username"
              value={props.username}
              onChange={(e) => props.setUsername(e.target.value)}
              className="modern-input"
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                outline: 'none',
                width: '100%'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>KATA SANDI</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={props.showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi"
                value={props.password}
                onChange={(e) => props.setPassword(e.target.value)}
                className="modern-input"
                style={{
                  padding: '10px 36px 10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  outline: 'none',
                  width: '100%'
                }}
                required
              />
              <button
                type="button"
                onClick={() => props.setShowPassword(!props.showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {props.showPassword ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-premium"
            style={{
              padding: '11px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              marginTop: '4px',
              boxShadow: '0 4px 12px rgba(169, 29, 34, 0.2)',
              cursor: 'pointer'
            }}
          >
            Masuk Layanan Cerdas
          </button>

          <button
            type="button"
            onClick={props.onGuestLogin}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Masuk Sebagai Tamu / Guest
          </button>
        </form>

        {/* Accessibility quick triggers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button
              onClick={() => handleUiModeSelect('lansia', 'Lansia')}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '10px',
                background: props.uiMode === 'lansia' ? 'var(--brand-gold)' : 'var(--bg-tertiary)',
                color: props.uiMode === 'lansia' ? 'black' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontSize: '8.5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              👴 Lansia
            </button>
            <button
              onClick={() => handleUiModeSelect('disabilitas', 'Difabel')}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '10px',
                background: props.uiMode === 'disabilitas' ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                color: props.uiMode === 'disabilitas' ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontSize: '8.5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              ♿ Difabel
            </button>
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '8px', color: 'var(--text-muted)' }}>
            Layanan Smart City Pemerintah Daerah D.I. Yogyakarta
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      {activeTab !== 'mobilitas' && (
        <header 
          style={{ 
            height: '56px', 
            background: props.theme === 'high-contrast' ? '#000000' : 'var(--bg-secondary)', 
            borderBottom: '1px solid var(--border-color)', 
            padding: '0 16px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)',
            zIndex: 100
          }}
        >
          {/* Brand Logo & Avatar Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(356, 75%, 36%) 0%, hsl(356, 75%, 26%) 100%)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              JO
            </div>
            <div>
              <h2 style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>JogjaOne</h2>
              <span style={{ fontSize: '7px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Hub Pelayanan Warga</span>
            </div>
          </div>

          {/* Right Notification and Accessibility Trigger */}
          <button 
            onClick={() => {
              speak("Membuka pengaturan aksesibilitas");
              setActiveDrawer('more');
            }}
            style={{ 
              background: 'var(--bg-tertiary)', 
              border: 'none', 
              color: 'var(--text-primary)', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}
          >
            <BellNavIcon />
          </button>
        </header>
      )}

      {/* 2. Main Scrollable Tab Container */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {activeTab === 'home' && (
          <MobileHomeTab
            onNavigate={(tab) => {
              setActiveTab(tab);
              speak(`Membuka halaman ${tab}`);
            }}
            tickets={props.tickets}
            v2xActive={props.v2xActive}
          />
        )}

        {activeTab === 'mobilitas' && (
          <MobileMobilityTab
            vehicles={props.vehicles}
            drainageNodes={props.drainageNodes}
            puddleReports={props.puddleReports}
            activeRoute={props.activeRoute}
            setActiveRoute={props.setActiveRoute}
            v2xActive={props.v2xActive}
            v2xTimeRemaining={props.v2xTimeRemaining}
            triggerV2X={props.triggerV2X}
            uiMode={props.uiMode}
          />
        )}

        {activeTab === 'lingkungan' && (
          <MobileEnvironmentTab
            vehicles={props.vehicles}
            drainageNodes={props.drainageNodes}
            puddleReports={props.puddleReports}
            activeRoute={props.activeRoute}
            grateStatus={props.grateStatus}
            setGrateStatus={props.setGrateStatus}
            sampahBalance={props.sampahBalance}
            setSampahBalance={props.setSampahBalance}
            uiMode={props.uiMode}
          />
        )}

        {activeTab === 'kesehatan' && (
          <MobileHealthTab
            vehicles={props.vehicles}
            drainageNodes={props.drainageNodes}
            puddleReports={props.puddleReports}
            activeRoute={props.activeRoute}
            selectedClinic={props.selectedClinic}
            setSelectedClinic={props.setSelectedClinic}
            selectedRoom={props.selectedRoom}
            setSelectedRoom={props.setSelectedRoom}
            bookingDate={props.bookingDate}
            setBookingDate={props.setBookingDate}
            onBookHealth={props.onBookHealth}
            uiMode={props.uiMode}
          />
        )}

        {activeTab === 'lapor' && (
          <MobileReportTab
            tickets={props.tickets}
            setTickets={props.setTickets}
            puddleReports={props.puddleReports}
            setPuddleReports={props.setPuddleReports}
            uiMode={props.uiMode}
          />
        )}

        {activeTab === 'layanan' && (
          <MobileAnalyticsTab
            uiMode={props.uiMode}
          />
        )}
      </div>

      {/* 3. BOTTOM TAB NAVIGATION BAR */}
      <nav 
        style={{ 
          minHeight: '56px', 
          height: 'auto',
          padding: '4px 0',
          background: 'var(--bg-secondary)', 
          borderTop: '1px solid var(--border-color)', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          alignItems: 'center',
          flexShrink: 0,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.03)',
          zIndex: 100,
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%'
        }}
      >
        <button 
          onClick={() => { setActiveTab('home'); speak("Tab Beranda"); }} 
          style={{ background: 'none', border: 'none', color: activeTab === 'home' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: 'calc(8.5px * var(--font-scale))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}
        >
          <span style={{ display: 'flex', color: activeTab === 'home' ? 'var(--accent-blue)' : 'var(--text-muted)' }}><HomeNavIcon /></span>
          Beranda
        </button>
 
        <button 
          onClick={() => { setActiveTab('mobilitas'); speak("Tab Mobilitas"); }} 
          style={{ background: 'none', border: 'none', color: activeTab === 'mobilitas' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: 'calc(8.5px * var(--font-scale))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: activeTab === 'mobilitas' ? 'bold' : 'normal' }}
        >
          <span style={{ display: 'flex', color: activeTab === 'mobilitas' ? 'var(--accent-blue)' : 'var(--text-muted)' }}><TransitNavIcon /></span>
          Mobilitas
        </button>
 
        <button 
          onClick={() => { setActiveTab('kesehatan'); speak("Tab Kesehatan"); }} 
          style={{ background: 'none', border: 'none', color: activeTab === 'kesehatan' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: 'calc(8.5px * var(--font-scale))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: activeTab === 'kesehatan' ? 'bold' : 'normal' }}
        >
          <span style={{ display: 'flex', color: activeTab === 'kesehatan' ? 'var(--accent-blue)' : 'var(--text-muted)' }}><HealthNavIcon /></span>
          Kesehatan
        </button>
 
        <button 
          onClick={() => { setActiveTab('lapor'); speak("Tab Lapor"); }} 
          style={{ background: 'none', border: 'none', color: activeTab === 'lapor' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: 'calc(8.5px * var(--font-scale))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: activeTab === 'lapor' ? 'bold' : 'normal' }}
        >
          <span style={{ display: 'flex', color: activeTab === 'lapor' ? 'var(--accent-blue)' : 'var(--text-muted)' }}><ReportNavIcon /></span>
          Lapor
        </button>
 
        <button 
          onClick={() => { setActiveTab('layanan'); speak("Tab Layanan"); }} 
          style={{ background: 'none', border: 'none', color: activeTab === 'layanan' || activeTab === 'lingkungan' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: 'calc(8.5px * var(--font-scale))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: activeTab === 'layanan' || activeTab === 'lingkungan' ? 'bold' : 'normal' }}
        >
          <span style={{ display: 'flex', color: activeTab === 'layanan' || activeTab === 'lingkungan' ? 'var(--accent-blue)' : 'var(--text-muted)' }}><LayananNavIcon /></span>
          Layanan
        </button>
      </nav>

      {/* ==================== CONFIG DRAWER OVERLAYS ==================== */}
      
      {/* ACCESSIBILITY CONFIG DRAWER */}
      {/* ACCESSIBILITY CONFIG DRAWER */}
      {activeDrawer === 'more' && (
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
              gap: '14px'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', alignSelf: 'center', cursor: 'pointer' }} onClick={() => setActiveDrawer(null)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>⚙️ Konfigurasi Aksesibilitas</strong>
              <button onClick={() => setActiveDrawer(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div>
              <strong style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Profil Aksesibilitas Khusus:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '6px' }}>
                <button onClick={() => handleUiModeSelect('default', 'Default')} style={{ padding: '8px', fontSize: '9px', background: props.uiMode === 'default' ? 'var(--accent-blue)' : 'var(--bg-tertiary)', color: props.uiMode === 'default' ? 'white' : 'var(--text-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>STANDAR</button>
                <button onClick={() => handleUiModeSelect('lansia', 'Lansia')} style={{ padding: '8px', fontSize: '9px', background: props.uiMode === 'lansia' ? 'var(--brand-gold)' : 'var(--bg-tertiary)', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>👴 LANSIA</button>
                <button onClick={() => handleUiModeSelect('disabilitas', 'Disabilitas')} style={{ padding: '8px', fontSize: '9px', background: props.uiMode === 'disabilitas' ? 'var(--accent-green)' : 'var(--bg-tertiary)', color: props.uiMode === 'disabilitas' ? 'white' : 'var(--text-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>♿ DIFABEL</button>
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Tema Tampilan Visual:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '6px' }}>
                <button onClick={() => { props.setTheme('dark'); speak("Tema gelap aktif."); }} style={{ padding: '8px', fontSize: '9px', background: '#20232d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: props.theme === 'dark' ? 'bold' : 'normal', outline: props.theme === 'dark' ? '2px solid var(--accent-blue)' : 'none' }}>GELAP</button>
                <button onClick={() => { props.setTheme('light'); speak("Tema terang aktif."); }} style={{ padding: '8px', fontSize: '9px', background: '#f8f9fa', color: '#212529', border: '1px solid #dee2e6', borderRadius: '4px', cursor: 'pointer', fontWeight: props.theme === 'light' ? 'bold' : 'normal', outline: props.theme === 'light' ? '2px solid var(--accent-blue)' : 'none' }}>TERANG</button>
                <button onClick={() => { props.setTheme('high-contrast'); speak("Tema kontras tinggi aktif."); }} style={{ padding: '8px', fontSize: '9px', background: '#000000', color: '#ffff00', border: '2px solid #ffff00', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', outline: props.theme === 'high-contrast' ? '2px solid #ffff00' : 'none' }}>KONTRAS</button>
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Skala Ukuran Huruf:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '6px' }}>
                <button onClick={() => { props.setFontSize('font-scale-small'); speak("Huruf diperkecil."); }} style={{ padding: '8px', fontSize: '9px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: props.fontSize === 'font-scale-small' ? 'bold' : 'normal' }}>KECIL</button>
                <button onClick={() => { props.setFontSize('font-scale-medium'); speak("Huruf standar."); }} style={{ padding: '8px', fontSize: '9px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: props.fontSize === 'font-scale-medium' ? 'bold' : 'normal' }}>STANDAR</button>
                <button onClick={() => { props.setFontSize('font-scale-large'); speak("Huruf diperbesar."); }} style={{ padding: '8px', fontSize: '9px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: props.fontSize === 'font-scale-large' ? 'bold' : 'normal' }}>BESAR</button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <div>
                <strong style={{ fontSize: '10px', color: 'var(--text-primary)', display: 'block' }}>🔊 Pemandu Suara</strong>
                <span style={{ fontSize: '7px', color: 'var(--text-muted)' }}>Membantu membaca elemen layar</span>
              </div>
              <button
                onClick={() => { props.setVoiceEnabled(!props.voiceEnabled); speak(props.voiceEnabled ? "Pemandu suara dinonaktifkan." : "Pemandu suara diaktifkan."); }}
                style={{
                  background: props.voiceEnabled ? 'var(--accent-green)' : 'var(--border-color)',
                  color: props.voiceEnabled ? 'white' : 'var(--text-primary)',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {props.voiceEnabled ? 'AKTIF' : 'MATI'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
