// LoginView.tsx - Premium responsive landing portal matching jogjaprov.go.id layout
import React, { useState, useEffect } from 'react';
import { speak } from '@/utils/speech';

interface LoginViewProps {
  isMobile?: boolean; // Kept for prop compatibility
  
  // Shared core accessibility state
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: string;
  setFontSize: (fontSize: string) => void;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  setUiMode: (mode: 'default' | 'lansia' | 'disabilitas') => void;
  
  // Login credentials state
  username: string;
  setUsername: (username: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  
  // Event handlers
  onLoginSubmit: (e: React.FormEvent) => void;
  onGuestLogin: () => void;
}

export default function LoginView({
  theme,
  setTheme,
  setFontSize,
  uiMode,
  setUiMode,
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onLoginSubmit,
  onGuestLogin
}: LoginViewProps) {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  const [isCctvPlaying, setIsCctvPlaying] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<'profil' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      speak(`Mencari informasi tentang ${searchQuery} di portal Yogyakarta.`);
      setShowLoginModal(true); 
    }
  };

  const handleUiModeSelect = (newMode: 'default' | 'lansia' | 'disabilitas', label: string) => {
    setUiMode(newMode);
    speak(`Profil Aksesibilitas diaktifkan: ${label}`);
    if (newMode === 'disabilitas') {
      setTheme('high-contrast');
      setFontSize('font-scale-large');
      setTimeout(() => {
        speak("Tema kontras tinggi aktif. Gunakan tombol melayang di samping kanan untuk bantuan.");
      }, 800);
    } else if (newMode === 'lansia') {
      setTheme('light');
      setFontSize('font-scale-large');
    } else {
      setTheme('dark');
      setFontSize('font-scale-medium');
    }
  };

  // Theme styling is controlled globally in globals.css via var(--bg-primary)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
      
      {/* 1. TOP HEADER NAVIGATION NAVBAR */}
      <header 
        style={{ 
          height: '64px', 
          background: theme === 'high-contrast' ? '#000000' : '#821417', 
          borderBottom: '2px solid var(--brand-gold)', 
          padding: '0 16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: '#ffd700', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#821417', fontSize: '18px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            👑
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 900, color: 'white', letterSpacing: '0.5px', lineHeight: 1 }}>JOGJAPROV</h2>
            <span style={{ fontSize: '8px', color: '#eef2f5', opacity: 0.8 }}>Portal Resmi D.I. Yogyakarta</span>
          </div>
        </div>

        {/* Navigation Menus (Desktop only) */}
        {!isMobileScreen && (
          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="#beranda" onClick={(e) => { e.preventDefault(); speak("Halaman Beranda"); }} style={{ color: 'white', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>Beranda</a>
            
            {/* Profil Dropdown Wrapper */}
            <div 
              onMouseEnter={() => setActiveDropdown('profil')}
              onMouseLeave={() => setActiveDropdown(null)}
              style={{ position: 'relative' }}
            >
              <a 
                href="#profil" 
                onClick={(e) => { e.preventDefault(); speak("Profil Pemerintah Daerah"); }} 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 0'
                }}
              >
                Profil <span style={{ fontSize: '10px' }}>▾</span>
              </a>

              {activeDropdown === 'profil' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '560px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-color)',
                    padding: '20px 24px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    zIndex: 1001,
                    marginTop: '4px'
                  }}
                >
                  {/* Column 1 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Visi Dan Misi', href: '#visi-misi' },
                      { label: 'Tugas Dan Fungsi', href: '#tugas-fungsi' },
                      { label: 'Profil Wakil Gubernur DIY', href: '#profil-wagub' },
                      { label: 'Lambang Daerah', href: '#lambang-daerah' },
                      { label: 'OPD Pemda DIY', href: '#opd-diy' },
                      { label: 'SATRIYA', href: '#satriya' }
                    ].map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          speak(item.label);
                          setActiveDropdown(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textDecoration: 'none',
                          color: '#495057',
                          fontSize: '12px',
                          fontWeight: 600,
                          paddingBottom: '8px',
                          borderBottom: '1px solid #f1f3f5',
                          transition: 'color 0.2s, padding-left 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = 'var(--brand-crimson)';
                          (e.currentTarget as HTMLElement).style.paddingLeft = '4px';
                          if (uiMode === 'disabilitas') speak(item.label);
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = '#495057';
                          (e.currentTarget as HTMLElement).style.paddingLeft = '0px';
                        }}
                      >
                        <span style={{ color: 'var(--brand-crimson)', fontSize: '12px', lineHeight: 1 }}>○</span>
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>

                  {/* Column 2 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Sejarah', href: '#sejarah' },
                      { label: 'Profil Gubernur DIY', href: '#profil-gubernur' },
                      { label: 'Profil Sekretaris Daerah', href: '#profil-sekda' },
                      { label: 'Struktur Organisasi', href: '#struktur-organisasi' },
                      { label: 'Instansi Vertikal / LNS Di DIY', href: '#instansi-vertikal' }
                    ].map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          speak(item.label);
                          setActiveDropdown(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textDecoration: 'none',
                          color: '#495057',
                          fontSize: '12px',
                          fontWeight: 600,
                          paddingBottom: '8px',
                          borderBottom: '1px solid #f1f3f5',
                          transition: 'color 0.2s, padding-left 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = 'var(--brand-crimson)';
                          (e.currentTarget as HTMLElement).style.paddingLeft = '4px';
                          if (uiMode === 'disabilitas') speak(item.label);
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = '#495057';
                          (e.currentTarget as HTMLElement).style.paddingLeft = '0px';
                        }}
                      >
                        <span style={{ color: 'var(--brand-crimson)', fontSize: '12px', lineHeight: 1 }}>○</span>
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a href="#ppid" onClick={(e) => { e.preventDefault(); speak("PPID"); }} style={{ color: 'white', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>PPID <span style={{ fontSize: '10px' }}>▾</span></a>
            <a href="#informasi" onClick={(e) => { e.preventDefault(); speak("Informasi"); }} style={{ color: 'white', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Informasi dan Berita <span style={{ fontSize: '10px' }}>▾</span></a>
            <a href="#layanan" onClick={(e) => { e.preventDefault(); speak("Layanan Publik Terpadu"); }} style={{ color: 'white', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Layanan Publik <span style={{ fontSize: '10px' }}>▾</span></a>
          </nav>
        )}

        {/* Access controls & Masuk Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'white', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => speak("Bahasa Indonesia aktif")}>ID | EN</span>
          
          <button 
            onClick={() => {
              setShowLoginModal(true);
              speak("Membuka form masuk portal.");
            }}
            style={{ 
              background: '#198754', 
              color: 'white', 
              border: 'none', 
              padding: '6px 14px', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              fontSize: '12px', 
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            Masuk
          </button>
        </div>
      </header>

      {/* 2. HERO BANNER SECTION WITH VIDEO BACKGROUND & SPLIT LAYOUT */}
      <section 
        style={{ 
          background: theme === 'high-contrast' ? '#000000' : 'linear-gradient(135deg, hsl(356, 75%, 36%) 0%, hsl(356, 75%, 26%) 50%, hsl(356, 75%, 16%) 100%)', 
          padding: isMobileScreen ? '30px 16px 50px 16px' : '70px 24px 90px 24px', 
          color: 'white',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }}
      >
        {/* Background Video Embed (YouTube Video ID: z_lvZLnsnhI) */}
        {theme !== 'high-contrast' && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          >
            <iframe
              src="https://www.youtube.com/embed/z_lvZLnsnhI?autoplay=1&mute=1&controls=0&loop=1&playlist=z_lvZLnsnhI&showinfo=0&rel=0&iv_load_policy=3&playsinline=1"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              style={{
                width: '100vw',
                height: '56.25vw', /* 16:9 Aspect Ratio */
                minHeight: '100%',
                minWidth: '177.77%', /* 16:9 Aspect Ratio */
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.3,
                filter: 'grayscale(35%) contrast(115%) blur(1px)'
              }}
              title="Yogyakarta Cinematic Background Video"
            />
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(80, 10, 12, 0.82) 0%, rgba(40, 5, 6, 0.9) 100%)',
                zIndex: 2
              }}
            />
          </div>
        )}

        <div 
          style={{ 
            maxWidth: '1100px', 
            width: '100%', 
            display: 'grid', 
            gridTemplateColumns: isMobileScreen ? '1fr' : '1.1fr 0.9fr', 
            alignItems: 'center', 
            gap: '30px', 
            position: 'relative', 
            zIndex: 5,
            textAlign: isMobileScreen ? 'center' : 'left'
          }}
        >
          {/* Left Column: Text Content and Search Form */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobileScreen ? 'center' : 'flex-start', gap: '14px' }}>
            {/* Sultan Birthday Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: 'var(--brand-crimson)', fontWeight: 'bold', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                👑
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ background: 'var(--brand-gold)', color: 'black', padding: '1px 6px', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gubernur DIY</span>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'white', marginTop: '1px' }}>SRI SULTAN HAMENGKUBUWONO X</div>
              </div>
            </div>

            <h1 style={{ fontSize: isMobileScreen ? '24px' : '36px', fontWeight: 900, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.6)', color: 'white' }}>
              Pemerintah Daerah Daerah Istimewa Yogyakarta
            </h1>
            
            <p style={{ fontSize: isMobileScreen ? '12px' : '14px', opacity: 0.95, maxWidth: '600px', lineHeight: 1.6, color: '#f1f3f5' }}>
              Ndherek Mangayubagya. Membangun peradaban Yogyakarta yang tangguh, cerdas, sejahtera, dan inklusif melalui penyelarasan budaya luhur serta teknologi masa depan.
            </p>

            {/* Search bar form */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%', maxWidth: '480px', background: 'white', borderRadius: '30px', padding: '3px', marginTop: '6px', boxShadow: '0 8px 20px rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <input
                type="text"
                placeholder="Cari layanan publik Jogja..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'none',
                  padding: isMobileScreen ? '8px 12px' : '12px 20px',
                  fontSize: '12px',
                  color: '#212529',
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                style={{
                  background: 'var(--brand-crimson)',
                  color: 'white',
                  border: 'none',
                  padding: '0 20px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Cari
              </button>
            </form>
          </div>

          {/* Right Column: Tugu Yogyakarta image card (Desktop only) */}
          {!isMobileScreen && (
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                animation: 'float 6s ease-in-out infinite' 
              }}
            >
              <div 
                style={{ 
                  width: '260px', 
                  height: '320px', 
                  borderRadius: '16px', 
                  border: '3px solid var(--brand-gold)', 
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  background: '#0f1013',
                  position: 'relative'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/tugu_yogyakarta.png" 
                  alt="Tugu Yogyakarta" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
                <div 
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    width: '100%', 
                    padding: '12px', 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--brand-gold)', fontWeight: 'bold', letterSpacing: '1px' }}>Ikon Kota</span>
                  <strong style={{ display: 'block', fontSize: '11px', marginTop: '2px' }}>Tugu Yogyakarta</strong>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 3. FLOATING METRICS STATS BAR */}
      <section style={{ marginTop: '-30px', padding: '0 16px', position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center' }}>
        <div 
          className="glass-panel" 
          style={{ 
            maxWidth: '1000px', 
            width: '100%', 
            background: theme === 'high-contrast' ? '#000000' : 'white', 
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: '12px',
            padding: isMobileScreen ? '12px' : '18px 24px',
            display: 'flex',
            flexDirection: isMobileScreen ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Stats grid */}
          <div style={{ display: 'flex', gap: isMobileScreen ? '12px' : '30px', flexDirection: isMobileScreen ? 'column' : 'row', width: isMobileScreen ? '100%' : 'auto' }}>
            
            {/* Stat item 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>☀️</span>
              <div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Yogyakarta Sekarang</span>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>32°C <span style={{ fontWeight: 'normal', fontSize: '10px', color: 'var(--text-secondary)' }}>Cerah Berawan</span></strong>
              </div>
            </div>

            {/* Stat item 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>🍃</span>
              <div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Kualitas Udara</span>
                <strong style={{ fontSize: '13px', color: '#198754' }}>34 AQI <span style={{ fontSize: '9px', background: 'rgba(25,135,84,0.1)', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>BAGUS</span></strong>
              </div>
            </div>

            {/* Stat item 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>💧</span>
              <div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>Pintu Air Winongo</span>
                <strong style={{ fontSize: '13px', color: '#0dcaf0' }}>80cm <span style={{ fontWeight: 'normal', fontSize: '10px', color: 'var(--text-secondary)' }}>Normal</span></strong>
              </div>
            </div>

          </div>

          {/* Action button */}
          <button 
            onClick={() => {
              setShowLoginModal(true);
              speak("Membuka portal dashboard smart city penuh.");
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#821417', 
              fontWeight: 'bold', 
              fontSize: '12px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              alignSelf: isMobileScreen ? 'flex-end' : 'center'
            }}
          >
            Lihat Dashboard Lengkap ➔
          </button>
        </div>
      </section>

      {/* 4. INTEGRATED SERVICES GRID SECTION */}
      <section style={{ padding: isMobileScreen ? '30px 16px' : '60px 24px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '10px', color: 'var(--brand-crimson)', fontWeight: 'bold', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Layanan Pemerintah Daerah DIY
          </span>
          <h2 style={{ fontSize: isMobileScreen ? '18px' : '24px', fontWeight: 800, color: 'var(--text-primary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.4 }}>
            Dapatkan layanan publik untuk memenuhi kebutuhan masyarakat
          </h2>
        </div>

        {/* Services Grid - 10 Tiles matching jogjaprov.go.id screenshot */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobileScreen ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', 
          gap: '16px' 
        }}>
          {[
            { 
              label: 'Kesehatan', 
              speakText: 'Layanan Kesehatan. Silakan masuk terlebih dahulu.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              )
            },
            { 
              label: 'Layanan Keuangan', 
              speakText: 'Layanan Keuangan. Silakan masuk terlebih dahulu.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              )
            },
            { 
              label: 'Jelajahi Jogja', 
              speakText: 'Layanan Jelajahi Jogja. Silakan masuk terlebih dahulu.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.82C4 6.4 7.58 3 12 3s8 3.4 8 7.18c0 7.32-8 11.82-8 11.82z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              )
            },
            { 
              label: 'Etalase Jogja', 
              speakText: 'Layanan Etalase Jogja UMKM. Silakan masuk terlebih dahulu.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              )
            },
            { 
              label: 'E-Lapor', 
              speakText: 'Layanan Pengaduan E-Lapor Sapa DIY. Silakan masuk terlebih dahulu.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              )
            },
            { 
              label: 'CCTV', 
              speakText: 'Layanan Live CCTV Simpang Tugu. Silakan masuk terlebih dahulu.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              )
            },
            { 
              label: 'Layanan Kepolisian', 
              speakText: 'Layanan Kepolisian. Silakan masuk terlebih dahulu.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              )
            },
            { 
              label: 'Layanan Satu Data', 
              speakText: 'Layanan Statistik Satu Data DIY. Silakan masuk terlebih dahulu.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  <path d="M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6"/>
                </svg>
              )
            },
            { 
              label: 'Portal Layanan Terintegrasi', 
              speakText: 'Portal Layanan Terintegrasi Smart City. Silakan masuk terlebih dahulu.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              )
            },
            { 
              label: 'JiTV', 
              speakText: 'Layanan Jogja Istimewa TV Streaming. Silakan masuk terlebih dahulu.',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                  <path d="M17 2l-5 5-5-5"/>
                  <polygon points="10 11 15 14 10 17 10 11"/>
                </svg>
              )
            }
          ].map((service, idx) => (
            <div 
              key={idx}
              onClick={() => { setShowLoginModal(true); speak(service.speakText); }} 
              className="glass-panel" 
              style={{ 
                padding: '20px 16px', 
                background: 'white', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center', 
                cursor: 'pointer', 
                borderRadius: '12px', 
                border: '1px solid var(--border-color)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'rgba(169, 29, 34, 0.05)', 
                color: 'var(--brand-crimson)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '12px',
                border: '1.5px solid rgba(169, 29, 34, 0.15)',
                transition: 'transform 0.3s'
              }}
              className="service-icon-container"
              >
                {service.icon}
              </div>
              <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {service.label}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* 5. NEWS & LIVE CCTV STREAM GRID SECTION */}
      <section style={{ padding: '20px 16px 40px 16px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Berita Terkini</h2>
          <div>
            <button type="button" onClick={() => speak("Berita sebelumnya")} style={{ width: '28px', height: '28px', border: '1px solid var(--border-color)', borderRadius: '50%', background: 'white', cursor: 'pointer', marginRight: '4px' }}>&lt;</button>
            <button type="button" onClick={() => speak("Berita selanjutnya")} style={{ width: '28px', height: '28px', border: '1px solid var(--border-color)', borderRadius: '50%', background: 'white', cursor: 'pointer' }}>&gt;</button>
          </div>
        </div>

        {/* 2-Column Split */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Column Left: Featured News Card */}
          <div 
            onClick={() => speak("Membuka Berita Gubernur D I Y Terima Kunjungan Kenegaraan")} 
            className="glass-panel" 
            style={{ overflow: 'hidden', background: 'white', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border-color)' }}
          >
            {/* Real generated news image */}
            <div style={{ width: '100%', height: isMobileScreen ? '180px' : '240px', position: 'relative', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/news_gubernur.png" 
                alt="Gubernur DIY Kunjungan Kenegaraan" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--brand-crimson)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>JOGJA NEWS</span>
            </div>

            <div style={{ padding: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                Gubernur DIY Terima Kunjungan Kenegaraan Bahas Kerjasama Ekonomi Kreatif
              </h3>
              <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
                <span>📅 12 Okt 2023</span>
                <span>👁️ 1.2k views</span>
              </div>
            </div>
          </div>

          {/* Column Right: CCTV Live Widget Card */}
          <div className="glass-panel" style={{ padding: '14px', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                🎥 Laporan Kota Live
              </strong>
              <span style={{ fontSize: '9px', color: '#dc3545', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '5px', height: '5px', background: '#dc3545', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite' }}></span> LIVE
              </span>
            </div>

            {/* Video Viewport with Interactive Playback State */}
            <div style={{ height: '140px', background: '#000000', borderRadius: '8px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCctvPlaying ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/tugu_yogyakarta.png" 
                    alt="Live Simpang Tugu" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(80%) contrast(110%)' }} 
                  />
                  {/* CCTV scan line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#00ff00', boxShadow: '0 0 8px #00ff00', animation: 'scan-line 3s linear infinite', opacity: 0.8 }} />
                  
                  {/* Edge AI Detection overlays */}
                  <div style={{ position: 'absolute', border: '1.5px solid #00ff00', left: '35%', top: '30%', width: '45px', height: '35px' }}>
                    <span style={{ position: 'absolute', top: '-10px', left: 0, background: '#00ff00', color: '#000', fontSize: '6px', fontWeight: 'bold', padding: '0 2px', fontFamily: 'monospace' }}>CAR: 96%</span>
                  </div>
                  <div style={{ position: 'absolute', border: '1.5px solid #00ff00', left: '60%', top: '50%', width: '30px', height: '20px' }}>
                    <span style={{ position: 'absolute', top: '-10px', left: 0, background: '#00ff00', color: '#000', fontSize: '6px', fontWeight: 'bold', padding: '0 2px', fontFamily: 'monospace' }}>BUS: 94%</span>
                  </div>

                  <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', padding: '1px 5px', borderRadius: '3px', color: '#00ff00', fontSize: '7px', fontFamily: 'monospace' }}>
                    REC ● 1080P
                  </div>
                  <button 
                    onClick={() => { setIsCctvPlaying(false); speak("Menghentikan putaran CCTV."); }}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', color: 'white', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ⏸
                  </button>
                </>
              ) : (
                <>
                  <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice">
                    <rect width="100%" height="100%" fill="#090d16" />
                    <path d="M 0,150 L 120,70 L 180,70 L 300,150 Z" fill="#1e293b" />
                    <line x1="150" y1="70" x2="150" y2="150" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="5 5" />
                    <path d="M 145,70 L 148,30 L 152,30 L 155,70 Z" fill="#ffffff" />
                    <circle cx="150" cy="28" r="3" fill="#eab308" />
                    <path d="M 40,150 L 130,85" stroke="#ef4444" strokeWidth="3" opacity="0.6" />
                    <path d="M 260,150 L 170,85" stroke="#ffd700" strokeWidth="3" opacity="0.6" />
                  </svg>
                  
                  <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', border: '1px solid white', cursor: 'pointer', zIndex: 10 }} onClick={() => { setIsCctvPlaying(true); speak("Memutar CCTV Simpang Tugu Live"); }}>
                    ▶
                  </div>
                </>
              )}
              
              <span style={{ position: 'absolute', top: '8px', left: '8px', color: '#00ff00', fontSize: '8px', fontFamily: 'monospace' }}>CAM_TUGU_01</span>
            </div>

            {/* Indicator pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#fef2f2', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #dc3545' }}>
                <span style={{ fontSize: '8px', color: '#b91c1c', display: 'block', fontWeight: 'bold' }}>VOLUME KENDARAAN</span>
                <strong style={{ fontSize: '12px', color: '#991b1b' }}>Tinggi</strong>
                <div style={{ height: '3px', background: '#fca5a5', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: '#dc3545' }} />
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #198754' }}>
                <span style={{ fontSize: '8px', color: '#166534', display: 'block', fontWeight: 'bold' }}>OKUPANSI WISATA</span>
                <strong style={{ fontSize: '12px', color: '#166534' }}>Normal</strong>
                <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                  <div style={{ flex: 1, height: '3px', background: '#198754', borderRadius: '2px' }} />
                  <div style={{ flex: 1, height: '3px', background: '#198754', borderRadius: '2px' }} />
                  <div style={{ flex: 1, height: '3px', background: '#eef2f5', borderRadius: '2px' }} />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. JOGJAPROV FOOTER */}
      <footer 
        style={{ 
          background: theme === 'high-contrast' ? '#000000' : '#4a0d0e', 
          color: 'white', 
          padding: isMobileScreen ? '30px 16px 20px 16px' : '50px 24px 20px 24px', 
          borderTop: '3px solid var(--brand-gold)',
          marginTop: 'auto'
        }}
      >
        <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobileScreen ? '24px' : '40px' }}>
          
          {/* Columns Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobileScreen ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            
            {/* Branding Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <div style={{ width: '24px', height: '24px', background: '#ffd700', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#821417', fontSize: '13px' }}>
                  👑
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 950, color: 'white', letterSpacing: '0.5px' }}>JOGJAPROV</h3>
              </div>
              <p style={{ fontSize: '10px', lineHeight: 1.5, opacity: 0.85, color: '#eef2f5' }}>
                Portal Resmi Pemerintah Daerah Daerah Istimewa Yogyakarta. Melayani dengan hati menuju Yogyakarta masa depan yang berbudaya dan modern.
              </p>
            </div>

            {/* Links Columns (Only if not mobile or render in 2 columns on mobile) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--brand-gold)', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>PROFIL</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', opacity: 0.9 }}>
                  <li style={{ cursor: 'pointer' }} onClick={() => speak("Menu Visi dan Misi")}>Visi & Misi</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => speak("Menu Sejarah Jogja")}>Sejarah</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => speak("Menu Struktur Organisasi")}>Struktur</li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--brand-gold)', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>LAYANAN</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', opacity: 0.9 }}>
                  <li style={{ cursor: 'pointer' }} onClick={() => speak("Menu Layanan Kesehatan")}>Kesehatan</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => speak("Menu Layanan Pendidikan")}>Pendidikan</li>
                  <li style={{ cursor: 'pointer' }} onClick={() => speak("Menu Layanan Perizinan")}>Perizinan</li>
                </ul>
              </div>
            </div>

            {/* Contact Column */}
            <div>
              <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--brand-gold)', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>HUBUNGI</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', opacity: 0.9 }}>
                <li>📍 Danurejan, Yogyakarta, 55213</li>
                <li>📞 (0274) 562811</li>
                <li>✉️ info@jogjaprov.go.id</li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', textAlign: 'center', fontSize: '9px', opacity: 0.7 }}>
            © 2026 Pemerintah Daerah Daerah Istimewa Yogyakarta.
          </div>

        </div>
      </footer>

      {/* 7. FLOATING QUICK ACCESSIBILITY CIRCLE BUTTONS */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '80px', 
          right: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px', 
          zIndex: 999 
        }}
      >
        <button
          onClick={() => handleUiModeSelect('lansia', 'Lansia / Orang Tua')}
          title="Mode Tampilan Lansia"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#e5a93b',
            color: 'black',
            border: '2px solid white',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            transition: 'transform 0.2s'
          }}
          className="animate-pulse"
        >
          👴
        </button>

        <button
          onClick={() => handleUiModeSelect('disabilitas', 'Difabel / Tunanetra')}
          title="Mode Tampilan Aksesibel / Difabel"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#198754',
            color: 'white',
            border: '2px solid white',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            transition: 'transform 0.2s'
          }}
        >
          ♿
        </button>
      </div>

      {/* 8. CREDENTIALS LOGIN POPUP GLASS MODAL */}
      {showLoginModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0,0,0,0.6)', 
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px'
          }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              maxWidth: '380px', 
              width: '100%', 
              background: theme === 'high-contrast' ? '#000000' : theme === 'inverted' ? '#ffffff' : 'var(--bg-secondary)', 
              border: '2px solid var(--border-color)',
              padding: '24px', 
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => {
                setShowLoginModal(false);
                speak("Menutup modal masuk.");
              }}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Masuk Layanan Cerdas</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                Masukkan NIK KTP atau Akun digital Jogja Istimewa Anda untuk melanjutkan ke layanan dashboard.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                onLoginSubmit(e);
                setShowLoginModal(false);
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Nama Pengguna / Email</label>
                <input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="modern-input"
                  style={{ padding: '10px 12px', fontSize: '12px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>Kata Sandi</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="modern-input"
                    style={{ padding: '10px 40px 10px 12px', fontSize: '12px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-premium animate-pulse"
                style={{ padding: '10px', borderRadius: '30px', fontWeight: 'bold', fontSize: '13px', marginTop: '6px', background: '#821417' }}
              >
                Masuk Portal Cerdas
              </button>

              <button
                type="button"
                onClick={() => {
                  onGuestLogin();
                  setShowLoginModal(false);
                }}
                style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px', borderRadius: '30px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                👤 Masuk Sebagai Tamu / Guest
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
