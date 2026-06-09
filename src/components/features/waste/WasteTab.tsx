// WasteTab.tsx - Desktop Bank Sampah & Smart Grate view for Jogja Punya Kita
import React from 'react';
import { speak } from '@/utils/speech';

interface WasteTabProps {
  sampahCategory: 'Plastik' | 'Kertas' | 'Logam';
  setSampahCategory: (val: 'Plastik' | 'Kertas' | 'Logam') => void;
  sampahWeight: number;
  setSampahWeight: (val: number) => void;
  onRecyclePickupSubmit: () => void;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  waterFlow: number[];
  grateWeight: number[];
  cctvEventShow: boolean;
  setCctvEventShow: (val: boolean) => void;
  setGrateStatus: (val: 'normal' | 'clogged') => void;
  triggerSmartGrateOffender: () => void;
  pickupHistory: Array<{ id: string; category: string; weight: number; points: number; status: string }>;
}

export default function WasteTab({
  sampahCategory,
  setSampahCategory,
  sampahWeight,
  setSampahWeight,
  onRecyclePickupSubmit,
  uiMode,
  waterFlow,
  grateWeight,
  cctvEventShow,
  setCctvEventShow,
  setGrateStatus,
  triggerSmartGrateOffender,
  pickupHistory
}: WasteTabProps) {

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      
      {/* Service Panel */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <h2 style={{ fontSize: '20px', color: 'var(--brand-gold)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
          ♻️ Bank Sampah Digital & Monitor Saringan
        </h2>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Tukarkan sampah anorganik rumah tangga Anda dengan saldo poin e-wallet. Ikut serta menjaga saluran drainase kota Yogyakarta dari tumpukan sampah liar yang menyumbat air.
        </p>

        {/* Standard Pickup Request */}
        {uiMode !== 'lansia' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Kategori Sampah:</label>
                <select value={sampahCategory} onChange={(e) => setSampahCategory(e.target.value as 'Plastik' | 'Kertas' | 'Logam')} className="modern-input">
                  <option value="Plastik">Plastik (Reward: Rp 3,000/kg)</option>
                  <option value="Kertas">Kertas (Reward: Rp 2,000/kg)</option>
                  <option value="Logam">Logam (Reward: Rp 5,000/kg)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Estimasi Berat (Kilogram):</label>
                <input type="number" value={sampahWeight} onChange={(e) => setSampahWeight(Number(e.target.value))} className="modern-input" />
              </div>
            </div>

            <button 
              onClick={onRecyclePickupSubmit}
              className="btn-premium"
              style={{ background: 'var(--brand-gold)', color: 'black', boxShadow: '0 4px 12px rgba(229, 169, 59, 0.2)' }}
            >
              Minta Penjemputan Sampah Saya
            </button>
          </div>
        ) : (
          // Lansia Pickup
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '18px' }}>Kirim Sampah Anorganik:</h3>
            <button 
              onClick={() => { setSampahCategory('Plastik'); setSampahWeight(8); onRecyclePickupSubmit(); }}
              className="btn-premium animate-pulse"
              style={{ padding: '18px', fontSize: '18px', borderRadius: '8px', background: 'var(--brand-gold)', color: 'black', boxShadow: '0 4px 12px rgba(229, 169, 59, 0.2)' }}
            >
              🗑️ Kirim Petugas Ambil Sampah Plastik Rumah Saya
            </button>
          </div>
        )}

        {/* Smart Grating Telemetry & CCTV simulation */}
        <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>🗑️ Deteksi Sensor Sumbatan Saringan & Integrasi CCTV</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Saringan drainase dilengkapi dengan sensor beban load-cell dan sensor debit ultrasonik. Jika beban naik mendadak namun air menyusut drastis, AI memotong CCTV jalanan untuk menangkap pelanggar pembuangan sampah.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            
            {/* Grate stats graph mock */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>Debit Aliran Air:</span>
                  <strong>{waterFlow[waterFlow.length - 1]}%</strong>
                </div>
                <div style={{ display: 'flex', height: '14px', alignItems: 'flex-end', gap: '2px', borderBottom: '1px solid var(--border-color)' }}>
                  {waterFlow.map((v, i) => (
                    <div key={i} style={{ flex: 1, height: `${v}%`, background: v < 40 ? '#dc3545' : '#0dcaf0' }}></div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>Tekanan Load-cell:</span>
                  <strong>{grateWeight[grateWeight.length - 1]} kg</strong>
                </div>
                <div style={{ display: 'flex', height: '14px', alignItems: 'flex-end', gap: '2px', borderBottom: '1px solid var(--border-color)' }}>
                  {grateWeight.map((v, i) => (
                    <div key={i} style={{ flex: 1, height: `${Math.min(100, v)}%`, background: v > 50 ? '#dc3545' : '#ffc107' }}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* CCTV Trigger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
              {cctvEventShow ? (
                <div style={{ background: '#000', border: '1px solid var(--brand-gold)', borderRadius: '4px', padding: '6px', fontSize: '10px', color: '#ffd700', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold' }}>📹 CAPTURE REKAMAN CCTV</div>
                  <div style={{ color: 'white', margin: '4px 0' }}>[Offender plate: AB-492-XX]</div>
                  <button onClick={() => { setGrateStatus('normal'); setCctvEventShow(false); speak("Saluran dinormalisasikan."); }} style={{ background: '#198754', border: 'none', color: 'white', padding: '2px 6px', fontSize: '9px', cursor: 'pointer' }}>Normalkan</button>
                </div>
              ) : (
                <button onClick={triggerSmartGrateOffender} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ⚠️ Simulasikan Sumbatan Sampah Gorong-gorong
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Right Column: History of setoran & active sensors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>⏳ Riwayat Setoran Bank Sampah Warga</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pickupHistory.map(item => (
            <div key={item.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontSize: '13px' }}>
              <div>
                <strong>{item.category} ({item.weight} kg)</strong>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ID Pickup: {item.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#198754', fontWeight: 'bold' }}>+Rp {item.points.toLocaleString()}</span>
                <div style={{ fontSize: '10px', color: 'var(--brand-gold)' }}>{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
