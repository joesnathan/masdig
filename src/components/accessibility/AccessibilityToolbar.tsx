// AccessibilityToolbar.tsx - Reusable accessibility tool controls for Jogja Punya Kita
import React from 'react';
import { speak } from '@/utils/speech';

interface AccessibilityToolbarProps {
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: string;
  setFontSize: (fontSize: string) => void;
  uiMode?: 'default' | 'lansia' | 'disabilitas';
  setUiMode?: (mode: 'default' | 'lansia' | 'disabilitas') => void;
  showProfiles?: boolean;
  compact?: boolean;
}

export default function AccessibilityToolbar({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  uiMode = 'default',
  setUiMode,
  showProfiles = false,
  compact = false
}: AccessibilityToolbarProps) {

  const handleThemeChange = (newTheme: string, speakText: string) => {
    setTheme(newTheme);
    speak(speakText);
  };

  const handleUiModeSelect = (newMode: 'default' | 'lansia' | 'disabilitas', label: string) => {
    if (setUiMode) {
      setUiMode(newMode);
      speak(`Mengaktifkan Fitur Profil ${label}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '8px' : '12px' }}>
      
      {/* Theme Toggles */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--brand-crimson)' }}>
          🎨 TEMA WARNA:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          <button 
            type="button" 
            onClick={() => handleThemeChange('light', 'Tema Terang')} 
            style={{ 
              fontSize: '10px', 
              padding: '8px 2px', 
              background: '#ffffff', 
              color: '#000000', 
              border: theme === 'light' ? '2px solid var(--brand-gold)' : '1px solid #dddddd', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            ☀️ Terang
          </button>
          <button 
            type="button" 
            onClick={() => handleThemeChange('dark', 'Tema Gelap')} 
            style={{ 
              fontSize: '10px', 
              padding: '8px 2px', 
              background: '#111111', 
              color: '#ffffff', 
              border: theme === 'dark' ? '2px solid var(--brand-gold)' : '1px solid #333333', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            🌙 Gelap
          </button>
          <button 
            type="button" 
            onClick={() => handleThemeChange('high-contrast', 'Tema Kontras Tinggi')} 
            style={{ 
              fontSize: '10px', 
              padding: '8px 2px', 
              background: '#000000', 
              color: '#ffff00', 
              border: theme === 'high-contrast' ? '2px solid #ffffff' : '1px solid #ffffff', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            🟨 Kontras
          </button>
          <button 
            type="button" 
            onClick={() => handleThemeChange('inverted', 'Tema Inversi Warna')} 
            style={{ 
              fontSize: '10px', 
              padding: '8px 2px', 
              background: '#ffffff', 
              color: '#0000ff', 
              border: theme === 'inverted' ? '2px solid #0000ff' : '1px solid #0000ff', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            🔄 Invers
          </button>
        </div>
      </div>

      {/* Font Size Scaling */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-muted)' }}>
          🔍 UKURAN HURUF:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          <button 
            type="button" 
            onClick={() => { setFontSize('font-scale-small'); speak("Huruf Kecil"); }} 
            style={{ 
              fontSize: '10px', 
              padding: '6px 2px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)', 
              background: fontSize === 'font-scale-small' ? 'var(--brand-crimson)' : 'var(--bg-primary)', 
              color: fontSize === 'font-scale-small' ? 'white' : 'var(--text-primary)', 
              cursor: 'pointer',
              fontWeight: fontSize === 'font-scale-small' ? 'bold' : 'normal'
            }}
          >
            A- (Kecil)
          </button>
          <button 
            type="button" 
            onClick={() => { setFontSize('font-scale-medium'); speak("Huruf Sedang"); }} 
            style={{ 
              fontSize: '11px', 
              padding: '6px 2px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)', 
              background: fontSize === 'font-scale-medium' ? 'var(--brand-crimson)' : 'var(--bg-primary)', 
              color: fontSize === 'font-scale-medium' ? 'white' : 'var(--text-primary)', 
              cursor: 'pointer',
              fontWeight: fontSize === 'font-scale-medium' ? 'bold' : 'normal'
            }}
          >
            A (Normal)
          </button>
          <button 
            type="button" 
            onClick={() => { setFontSize('font-scale-large'); speak("Huruf Besar"); }} 
            style={{ 
              fontSize: '12px', 
              padding: '6px 2px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)', 
              background: fontSize === 'font-scale-large' ? 'var(--brand-crimson)' : 'var(--bg-primary)', 
              color: fontSize === 'font-scale-large' ? 'white' : 'var(--text-primary)', 
              cursor: 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            A+ (Besar)
          </button>
          <button 
            type="button" 
            onClick={() => { setFontSize('font-scale-extra-large'); speak("Huruf Sangat Besar"); }} 
            style={{ 
              fontSize: '13px', 
              padding: '6px 2px', 
              borderRadius: '4px', 
              border: '1px solid var(--border-color)', 
              background: fontSize === 'font-scale-extra-large' ? 'var(--brand-crimson)' : 'var(--bg-primary)', 
              color: fontSize === 'font-scale-extra-large' ? 'white' : 'var(--text-primary)', 
              cursor: 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            A++ (Extra)
          </button>
        </div>
      </div>

      {/* Profiles Selection */}
      {showProfiles && setUiMode && (
        <div style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--brand-gold)' }}>
            👴♿ LAYANAN KHUSUS (PROFIL FITUR):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button 
              type="button"
              onClick={() => handleUiModeSelect('default', 'Umum')}
              style={{ 
                padding: '12px 4px', 
                fontSize: '12px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                background: uiMode === 'default' ? 'var(--brand-crimson)' : 'var(--bg-primary)', 
                color: uiMode === 'default' ? 'white' : 'var(--text-primary)', 
                fontWeight: 'bold', 
                transition: 'all 0.2s' 
              }}
            >
              📱 Standar
            </button>
            <button 
              type="button"
              onClick={() => handleUiModeSelect('lansia', 'Lansia / Orang Tua')}
              style={{ 
                padding: '12px 4px', 
                fontSize: '12px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                background: uiMode === 'lansia' ? 'var(--brand-gold)' : 'var(--bg-primary)', 
                color: uiMode === 'lansia' ? 'black' : 'var(--text-primary)', 
                fontWeight: 'bold', 
                transition: 'all 0.2s' 
              }}
            >
              👴 Lansia
            </button>
            <button 
              type="button"
              onClick={() => handleUiModeSelect('disabilitas', 'Difabel / Tunanetra')}
              style={{ 
                padding: '12px 4px', 
                fontSize: '12px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                background: uiMode === 'disabilitas' ? 'var(--accent-blue)' : 'var(--bg-primary)', 
                color: uiMode === 'disabilitas' ? 'white' : 'var(--text-primary)', 
                fontWeight: 'bold', 
                transition: 'all 0.2s' 
              }}
            >
              ♿ Difabel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
