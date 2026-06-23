// MobileApp.tsx - Smartphone optimized interface matching official JogjaOne screens
import React, { useState } from 'react';
import { speak, setSpeechEnabled } from '@/utils/speech';
import { ToastProvider, useToast } from './Toast';
import {
  LogoutIcon, SettingsIcon, BellIcon, SpinnerIcon,
  CheckCircleIcon, DisabilityIcon, ElderlyIcon, WarningIcon
} from './Icons';

// Import newly created modular mobile tabs
import MobileHomeTab from './MobileHomeTab';
import MobileMobilityTab from './MobileMobilityTab';
import MobileEnvironmentTab from './MobileEnvironmentTab';
import MobileHealthTab from './MobileHealthTab';
import MobileReportTab from './MobileReportTab';

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
  onLogout: () => void;
  jogjaPayBalance: number;
  setJogjaPayBalance: React.Dispatch<React.SetStateAction<number>>;
  
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
  onLoginSubmit: (e?: React.FormEvent) => void;
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

const SettingsNavIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export default function MobileApp(props: MobileAppProps) {
  return (
    <ToastProvider>
      <MobileAppInner {...props} />
    </ToastProvider>
  );
}

function MobileAppInner(props: MobileAppProps) {
  // Tabs: 'home' (Beranda), 'mobilitas', 'kesehatan', 'lapor', 'layanan' (Layanan/Analytics), 'lingkungan' (Environment Subview)
  const [activeTab, setActiveTab] = useState<'home' | 'mobilitas' | 'lingkungan' | 'kesehatan' | 'lapor' | 'layanan'>('home');
  const [activeDrawer, setActiveDrawer] = useState<'more' | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginShake, setLoginShake] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const toast = useToast();

  const handleUiModeSelect = (newMode: 'default' | 'lansia' | 'disabilitas', label: string) => {
    props.setUiMode(newMode);
    if (newMode === 'disabilitas') {
      props.setTheme('high-contrast');
      props.setFontSize('font-scale-large');
      props.setVoiceEnabled(true);
      setSpeechEnabled(true);
      speak("Mode difabel aktif. Suara pemandu dihidupkan secara otomatis. Selamat datang di JogjaOne.");
    } else if (newMode === 'lansia') {
      props.setTheme('light');
      props.setFontSize('font-scale-extra-large');
      props.setVoiceEnabled(false);
      setSpeechEnabled(false);
    } else {
      props.setTheme('light');
      props.setFontSize('font-scale-medium');
      props.setVoiceEnabled(false);
      setSpeechEnabled(false);
    }
  };

  const handleLoginSubmit = () => {
    if (!props.username.trim()) {
      setLoginError('NIK / Username tidak boleh kosong.');
      setLoginShake(true);
      setTimeout(() => setLoginShake(false), 600);
      return;
    }
    if (!props.password.trim()) {
      setLoginError('Password tidak boleh kosong.');
      setLoginShake(true);
      setTimeout(() => setLoginShake(false), 600);
      return;
    }
    if (props.password.length < 4) {
      setLoginError('Password minimal 4 karakter.');
      setLoginShake(true);
      setTimeout(() => setLoginShake(false), 600);
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    // Simulate async login
    setTimeout(() => {
      try {
        props.onLoginSubmit();
        toast.showSuccess('Berhasil masuk!', `Selamat datang kembali, ${props.username}.`);
      } catch {
        setLoginError('Terjadi kesalahan. Silakan coba lagi.');
        toast.showError('Login gagal', 'Silakan periksa koneksi Anda.');
      } finally {
        setLoginLoading(false);
      }
    }, 600);
  };

  if (!props.isLoggedIn) {
    if (showSplash) {
      return (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            width: '100%', 
            background: '#1A73E8', 
            padding: '40px 24px 24px 24px',
            boxSizing: 'border-box',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            color: 'white'
          }}
        >
          {/* Ambient Arcs */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '15%', left: '-15%', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)', pointerEvents: 'none' }} />

          {/* Tugu Vector Art in Center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', marginBottom: 'auto', gap: '20px', width: '100%', zIndex: 5 }}>
            <svg width="120" height="200" viewBox="0 0 120 200" fill="none" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.15))' }}>
              {/* Dots / Lines Background */}
              <circle cx="20" cy="80" r="2" fill="#00E676" opacity="0.8"/>
              <line x1="20" y1="80" x2="60" y2="100" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2" opacity="0.5"/>
              <circle cx="100" cy="90" r="2.5" fill="#00E676" opacity="0.8"/>
              <line x1="100" y1="90" x2="60" y2="110" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2" opacity="0.5"/>
              <circle cx="15" cy="140" r="2" fill="white" opacity="0.6"/>
              <circle cx="105" cy="120" r="2" fill="white" opacity="0.6"/>

              {/* Flame top */}
              <path d="M60 25 C62 35, 68 40, 60 50 C52 40, 58 35, 60 25 Z" fill="#FFD700" />
              <circle cx="60" cy="45" r="3" fill="#ffffff"/>
              <circle cx="60" cy="45" r="7" stroke="#ffffff" strokeWidth="1.5" opacity="0.8"/>
              
              {/* Pillar Body */}
              <rect x="56" y="58" width="8" height="85" rx="2" fill="#E8F0FE" />
              <line x1="56" y1="65" x2="64" y2="65" stroke="#1A73E8" strokeWidth="1.5"/>
              <line x1="56" y1="135" x2="64" y2="135" stroke="#1A73E8" strokeWidth="1.5"/>
              
              {/* Steps pedestal base */}
              <rect x="52" y="143" width="16" height="8" rx="1" fill="#D2E3FC" />
              <rect x="47" y="151" width="26" height="8" rx="1.5" fill="#8AB4F8" />
              <rect x="40" y="159" width="40" height="10" rx="2" fill="#669DF6" />
            </svg>

            {/* App Branding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-1.0px', color: 'white' }}>
                JogjaOne
              </h1>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', margin: '0 0 4px 0', fontWeight: 500 }}>
                Satu Layanan Kota Cerdas
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                Yogyakarta
              </p>
            </div>

            {/* Pagination Dots */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.3)' }}></span>
              <span style={{ width: '12px', height: '6px', borderRadius: '3px', background: 'white' }}></span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.3)' }}></span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 5 }}>
            <button
              onClick={() => {
                speak("Selamat datang di JogjaOne. Silakan masuk ke akun Anda.");
                setShowSplash(false);
              }}
              style={{
                width: '100%',
                background: '#white',
                backgroundColor: 'white',
                color: '#1A73E8',
                padding: '14px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Mulai <span style={{ fontSize: '16px', fontWeight: 'bold' }}>→</span>
            </button>
            <div style={{ textAlign: 'center', fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
              v2.0 · Smart City Yogyakarta
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          width: '100%', 
          background: '#F4F6F9', 
          boxSizing: 'border-box',
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        {/* Blue Top Header Block */}
        <div style={{
          width: '100%',
          height: '240px',
          background: 'linear-gradient(180deg, #1A73E8 0%, #1557B0 100%)',
          borderBottomLeftRadius: '32px',
          borderBottomRightRadius: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px',
          boxSizing: 'border-box',
          color: 'white',
          boxShadow: '0 4px 20px rgba(26,115,232,0.15)'
        }}>
          {/* Logo with light blue border */}
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
            JogjaOne
          </h1>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
            Masuk ke akun Anda
          </span>
        </div>

        {/* Floating Form Overlay Card */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleLoginSubmit(); }}
          className={loginShake ? 'animate-shake' : ''}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            width: '90%', 
            margin: '-40px auto 20px auto', 
            background: 'white',
            borderRadius: '24px',
            padding: '24px 20px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
            boxSizing: 'border-box',
            zIndex: 10
          }}
        >
          {/* User ID Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
              NIK / USERNAME
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#F4F6F9',
              borderRadius: '12px',
              padding: '2px 14px',
              border: '1px solid #E0E0E0'
            }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input 
                type="text"
                placeholder="Masukkan NIK atau username"
                value={props.username}
                onChange={(e) => props.setUsername(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  padding: '10px 0',
                  fontSize: '12px',
                  width: '100%',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
              PASSWORD
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#F4F6F9',
              borderRadius: '12px',
              padding: '2px 14px',
              border: '1px solid #E0E0E0',
              position: 'relative'
            }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input 
                type={props.showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={props.password}
                onChange={(e) => props.setPassword(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  padding: '10px 0',
                  fontSize: '12px',
                  width: 'calc(100% - 24px)',
                  color: 'var(--text-primary)'
                }}
                required
              />
              <button
                type="button"
                onClick={() => props.setShowPassword(!props.showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#888888',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {props.showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error message */}
        {loginError && (
          <div className="animate-fade-up" style={{
            width: '90%', margin: '-8px auto 0 auto',
            background: '#FCE8E6', border: '1px solid #FAD2CF',
            borderRadius: '10px', padding: '8px 12px',
            display: 'flex', gap: '6px', alignItems: 'center'
          }}>
            <WarningIcon size={14} color="#C5221F" strokeWidth={2.5} />
            <span style={{ fontSize: '11px', color: '#C5221F', fontWeight: 500 }}>{loginError}</span>
          </div>
        )}

        {/* Main Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '90%', margin: '0 auto' }}>
          <button
            onClick={handleLoginSubmit}
            disabled={loginLoading}
            className="btn-tap"
            style={{
              width: '100%',
              background: loginLoading ? '#93b4e0' : '#1A73E8',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: loginLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(26,115,232,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {loginLoading ? (
              <><SpinnerIcon size={16} color="white" /> Memverifikasi...</>
            ) : (
              <><CheckCircleIcon size={16} color="white" strokeWidth={2.5} /> Masuk Layanan Cerdas</>
            )}
          </button>
          
          <button
            onClick={props.onGuestLogin}
            style={{
              width: '100%',
              background: 'white',
              color: '#333',
              border: '1px solid #E0E0E0',
              padding: '14px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            Masuk Sebagai Tamu
          </button>
        </div>

        {/* Akses Khusus Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px', width: '100%', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>
            Akses Khusus
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 5%', boxSizing: 'border-box', marginBottom: '24px' }}>
            <div 
              onClick={() => handleUiModeSelect('lansia', 'Lansia')}
              className="card-hover"
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '18px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: props.uiMode === 'lansia' ? '2px solid #1A73E8' : '1px solid #E0E0E0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                gap: '8px'
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#FEF7E0', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ElderlyIcon size={22} color="#B06000" strokeWidth={1.8} />
              </div>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Lansia</strong>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Tampilan besar</span>
            </div>

            <div 
              onClick={() => handleUiModeSelect('disabilitas', 'Difabel')}
              className="card-hover"
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '18px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: props.uiMode === 'disabilitas' ? '2px solid #1A73E8' : '1px solid #E0E0E0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                gap: '8px'
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <DisabilityIcon size={22} color="#1A73E8" strokeWidth={1.8} />
              </div>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Difabel</strong>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Akses asistif</span>
            </div>
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => {
                toast.showInfo('Keluar...', 'Sesi Anda berakhir.');
                setTimeout(() => props.onLogout?.(), 400);
              }}
              className="btn-tap"
              style={{
                background: '#ea4335',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: 'calc(10px * var(--font-scale))',
                fontWeight: 'bold',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(234,67,53,0.15)',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <LogoutIcon size={12} color="white" strokeWidth={2.5} />
              Keluar
            </button>
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
              <SettingsNavIcon />
            </button>
          </div>
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
            username={props.username}
            sampahBalance={props.sampahBalance}
            jogjaPayBalance={props.jogjaPayBalance}
            setJogjaPayBalance={props.setJogjaPayBalance}
            onDrawerStateChange={setIsDrawerOpen}
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
            onNavigate={(tab) => {
              setActiveTab(tab);
              speak(`Membuka halaman ${tab}`);
            }}
            jogjaPayBalance={props.jogjaPayBalance}
            setJogjaPayBalance={props.setJogjaPayBalance}
            onBookTransit={props.onBookTransit}
            onDrawerStateChange={setIsDrawerOpen}
          />
        )}

        {activeTab === 'lingkungan' && (
          <MobileEnvironmentTab
            vehicles={props.vehicles}
            setVehicles={props.setVehicles}
            drainageNodes={props.drainageNodes}
            puddleReports={props.puddleReports}
            activeRoute={props.activeRoute}
            grateStatus={props.grateStatus}
            setGrateStatus={props.setGrateStatus}
            sampahBalance={props.sampahBalance}
            setSampahBalance={props.setSampahBalance}
            uiMode={props.uiMode}
            onNavigate={(tab) => {
              setActiveTab(tab);
              speak(`Membuka halaman ${tab}`);
            }}
            onDrawerStateChange={setIsDrawerOpen}
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
            onNavigate={(tab) => {
              setActiveTab(tab);
              speak(`Membuka halaman ${tab}`);
            }}
            onDrawerStateChange={setIsDrawerOpen}
          />
        )}

        {activeTab === 'lapor' && (
          <MobileReportTab
            tickets={props.tickets}
            setTickets={props.setTickets}
            puddleReports={props.puddleReports}
            setPuddleReports={props.setPuddleReports}
            uiMode={props.uiMode}
            onNavigate={(tab) => {
              setActiveTab(tab);
              speak(`Membuka halaman ${tab}`);
            }}
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
          onClick={() => { setActiveTab('lingkungan'); speak("Tab Layanan"); }} 
          style={{ background: 'none', border: 'none', color: activeTab === 'lingkungan' ? 'var(--accent-blue)' : 'var(--text-muted)', fontSize: 'calc(8.5px * var(--font-scale))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: activeTab === 'lingkungan' ? 'bold' : 'normal' }}
        >
          <span style={{ display: 'flex', color: activeTab === 'lingkungan' ? 'var(--accent-blue)' : 'var(--text-muted)' }}><LayananNavIcon /></span>
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
              gap: '14px',
              paddingBottom: '80px',
              overflowY: 'auto',
              maxHeight: '85%'
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
                onClick={() => {
                  const nextVal = !props.voiceEnabled;
                  if (nextVal) {
                    props.setVoiceEnabled(true);
                    setSpeechEnabled(true);
                    speak("Pemandu suara diaktifkan.");
                  } else {
                    speak("Pemandu suara dinonaktifkan.");
                    props.setVoiceEnabled(false);
                    setSpeechEnabled(false);
                  }
                }}
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

            <button
              onClick={() => {
                props.onLogout?.();
                setActiveDrawer(null);
              }}
              style={{
                background: 'var(--accent-danger)',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontSize: 'calc(11px * var(--font-scale))',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '12px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(213,0,0,0.15)'
              }}
            >
              🚪 Keluar Dari Akun (Logout)
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
