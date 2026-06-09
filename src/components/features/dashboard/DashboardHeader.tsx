// DashboardHeader.tsx - Desktop top navbar for Jogja Punya Kita
import React from 'react';
import AccessibilityToolbar from '@/components/accessibility/AccessibilityToolbar';
import { speak } from '@/utils/speech';

interface DashboardHeaderProps {
  timeStr: string;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  setUiMode: (mode: 'default' | 'lansia' | 'disabilitas') => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  showAccessDropdown: boolean;
  setShowAccessDropdown: (show: boolean) => void;
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: string;
  setFontSize: (fontSize: string) => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  timeStr,
  uiMode,
  setUiMode,
  voiceEnabled,
  setVoiceEnabled,
  showAccessDropdown,
  setShowAccessDropdown,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  onLogout
}: DashboardHeaderProps) {

  const handleUiModeSelect = (newMode: 'default' | 'lansia' | 'disabilitas', label: string) => {
    setUiMode(newMode);
    speak(`Layanan Khusus Diaktifkan: ${label}`);
  };

  const handleVoiceToggle = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    if (nextState) {
      speak("Pemandu Suara Diaktifkan. Arahkan kursor Anda pada tombol navigasi untuk penjelasan.", true);
    } else {
      speak("Pemandu Suara Dinonaktifkan.", true);
    }
  };

  return (
    <header 
      style={{ 
        height: '70px', 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '24px' }}>🇮🇩</span>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-crimson)', letterSpacing: '0.5px' }}>
            JOGJA PUNYA KITA
          </h2>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '-3px' }}>
            Portal Layanan & IoT Smart Living Terpadu
          </span>
        </div>
      </div>

      {/* Accessibility & Settings Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Dynamic Ticking Clock */}
        <div style={{ fontSize: '13px', fontWeight: 'bold', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          ⏰ {timeStr || '17:42 WIB'}
        </div>

        {/* Screen Mode Indicator Badges */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => handleUiModeSelect('default', 'Umum')}
            style={{ padding: '4px 10px', fontSize: '11px', border: 'none', borderRadius: '20px', cursor: 'pointer', background: uiMode === 'default' ? 'var(--brand-crimson)' : 'none', color: uiMode === 'default' ? 'white' : 'var(--text-secondary)', fontWeight: 'bold' }}
          >
            📱 Standar
          </button>
          <button 
            onClick={() => handleUiModeSelect('lansia', 'Lansia')}
            style={{ padding: '4px 10px', fontSize: '11px', border: 'none', borderRadius: '20px', cursor: 'pointer', background: uiMode === 'lansia' ? 'var(--brand-gold)' : 'none', color: uiMode === 'lansia' ? 'black' : 'var(--text-secondary)', fontWeight: 'bold' }}
          >
            👴 Lansia
          </button>
          <button 
            onClick={() => handleUiModeSelect('disabilitas', 'Disabilitas')}
            style={{ padding: '4px 10px', fontSize: '11px', border: 'none', borderRadius: '20px', cursor: 'pointer', background: uiMode === 'disabilitas' ? 'var(--accent-blue)' : 'none', color: uiMode === 'disabilitas' ? 'white' : 'var(--text-secondary)', fontWeight: 'bold' }}
          >
            ♿ Difabel
          </button>
        </div>

        {/* Speak Assist toggle */}
        <button 
          onClick={handleVoiceToggle}
          style={{
            background: voiceEnabled ? 'var(--accent-green)' : 'var(--bg-tertiary)',
            color: voiceEnabled ? 'white' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {voiceEnabled ? '🔊 Suara ON' : '🔇 Suara OFF'}
        </button>

        {/* Settings Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowAccessDropdown(!showAccessDropdown)}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ⚙️ Aksesibilitas Tampilan
          </button>
          
          {showAccessDropdown && (
            <div style={{ position: 'absolute', right: 0, top: '40px', background: 'var(--bg-secondary)', border: '2px solid var(--border-color)', width: '280px', borderRadius: '8px', padding: '16px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 100 }}>
              <AccessibilityToolbar
                theme={theme}
                setTheme={setTheme}
                fontSize={fontSize}
                setFontSize={setFontSize}
              />
              <button 
                onClick={() => setShowAccessDropdown(false)}
                style={{ background: 'var(--brand-crimson)', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
              >
                Tutup Pengaturan
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <button 
          onClick={onLogout}
          style={{ background: 'none', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🚪 Logout
        </button>

      </div>

    </header>
  );
}
