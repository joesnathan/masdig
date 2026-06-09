// DashboardSidebar.tsx - Desktop side navigation drawer for Jogja Punya Kita
import React from 'react';
import { speak } from '@/utils/speech';

interface DashboardSidebarProps {
  activeTab: 'home' | 'transit' | 'health' | 'waste' | 'reports' | 'info';
  setActiveTab: (tab: 'home' | 'transit' | 'health' | 'waste' | 'reports' | 'info') => void;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  voiceEnabled: boolean;
  sampahBalance: number;
  setSampahBalance: (balance: number) => void;
}

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  uiMode,
  voiceEnabled,
  sampahBalance,
  setSampahBalance
}: DashboardSidebarProps) {

  const announceHover = (text: string) => {
    if (voiceEnabled) {
      speak(text);
    }
  };

  const handleCashout = () => {
    if (sampahBalance < 10000) {
      speak("Maaf, saldo minimal pencairan adalah sepuluh ribu rupiah.", true);
      return;
    }
    setSampahBalance(0);
    speak("Pencairan dana reward sukses. Saldo dikirim ke e-wallet Anda.", true);
  };

  const tabs: Array<{
    id: 'home' | 'transit' | 'health' | 'waste' | 'reports' | 'info';
    label: string;
    icon: string;
    description: string;
  }> = [
    { id: 'home', label: 'Beranda Utama', icon: '🏠', description: 'Tombol halaman beranda utama' },
    { id: 'transit', label: 'Transportasi & V2X', icon: '🚌', description: 'Tombol halaman layanan transportasi dan sistem lalu lintas pintar' },
    { id: 'health', label: 'Kesehatan & Nexus', icon: '🏥', description: 'Tombol halaman antrean faskes dan deteksi kesehatan prediktif' },
    { id: 'waste', label: 'Bank Sampah & Grate', icon: '♻️', description: 'Tombol halaman setoran bank sampah digital dan sensor drainase' },
    { id: 'reports', label: 'Laporan Warga & AI', icon: '📢', description: 'Tombol halaman pusat laporan warga dan pemindaian AI dashcam' },
    { id: 'info', label: 'Info Deck & Tantangan', icon: '📊', description: 'Tombol halaman deck informasi dan tantangan pembangunan' },
  ];

  return (
    <aside 
      style={{ 
        width: uiMode === 'lansia' ? '280px' : '240px', 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--glass-border)', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px 12px',
        gap: '8px',
        flexShrink: 0
      }}
    >
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            speak(`Membuka halaman ${tab.label}`);
          }}
          onMouseEnter={() => announceHover(tab.description)}
          className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
          style={{ 
            fontSize: uiMode === 'lansia' ? '18px' : '14px', 
            padding: uiMode === 'lansia' ? '18px 14px' : '14px 16px' 
          }}
        >
          <span>{tab.icon}</span> {tab.label}
        </button>
      ))}

      {/* Balance Widget in Sidebar */}
      <div 
        style={{ 
          marginTop: 'auto', 
          background: 'var(--bg-tertiary)', 
          padding: '14px', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)',
          fontSize: '13px'
        }}
      >
        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Saldo Bank Sampah</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--brand-gold)', margin: '4px 0' }}>
          Rp {sampahBalance.toLocaleString()}
        </div>
        <button
          onClick={handleCashout}
          style={{ 
            width: '100%', 
            padding: '8px', 
            background: '#198754', 
            border: 'none', 
            borderRadius: '4px', 
            color: 'white', 
            fontSize: '11px', 
            fontWeight: 'bold', 
            cursor: 'pointer' 
          }}
        >
          💸 Cairkan Poin
        </button>
      </div>

    </aside>
  );
}
