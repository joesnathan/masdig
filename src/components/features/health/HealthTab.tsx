// HealthTab.tsx - Desktop Healthcare & Nexus view for Jogja Punya Kita
import React from 'react';
import InteractiveMap from '@/components/InteractiveMap';
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

interface HealthTabProps {
  selectedClinic: string;
  setSelectedClinic: (val: string) => void;
  selectedRoom: string;
  setSelectedRoom: (val: string) => void;
  bookingDate: string;
  setBookingDate: (val: string) => void;
  onBookHealth: () => void;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  drainageNodes: MapNode[];
  triggerPuddleStatus: (nodeId: string) => void;
  vehicles: Vehicle[];
  puddleReports: Array<{ id: string; x: number; y: number; status: string }>;
  activeRoute: string[];
}

export default function HealthTab({
  selectedClinic,
  setSelectedClinic,
  selectedRoom,
  setSelectedRoom,
  bookingDate,
  setBookingDate,
  onBookHealth,
  uiMode,
  drainageNodes,
  triggerPuddleStatus,
  vehicles,
  puddleReports,
  activeRoute
}: HealthTabProps) {

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      
      {/* Service card */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <h2 style={{ fontSize: '20px', color: 'var(--accent-green)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
          🏥 Booking Fasilitas Kesehatan & Data Hub
        </h2>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Membangun ekosistem kesehatan digital Yogyakarta. Terintegrasi langsung dengan ketersediaan tempat tidur (bed) faskes, rekam medis JKN BPJS, dan deteksi dini penyebaran epidemik demam berdarah.
        </p>

        {/* Standard Booking Form */}
        {uiMode !== 'lansia' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Pilih Fasilitas Kesehatan:</label>
              <select value={selectedClinic} onChange={(e) => setSelectedClinic(e.target.value)} className="modern-input">
                <option value="puskesmas1">Puskesmas Gondokusuman (Tersedia: 2 Kamar ICU)</option>
                <option value="puskesmas2">Puskesmas Jetis (Tersedia: 4 Kamar ICU)</option>
                <option value="rs_jogja">RSUD Kota Yogyakarta (Tersedia: 15 Kamar Kelas I)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Poli Pemeriksaan:</label>
                <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="modern-input">
                  <option value="Umum">Poli Umum</option>
                  <option value="Gigi">Poli Gigi & Mulut</option>
                  <option value="KIA">Poli Kesehatan Ibu & Anak (KIA)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Tanggal Pemeriksaan:</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="modern-input" />
              </div>
            </div>

            <button 
              onClick={onBookHealth}
              className="btn-premium"
              style={{ background: 'var(--accent-green)', boxShadow: '0 4px 12px rgba(25, 135, 84, 0.2)' }}
            >
              Daftar Nomor Antrean Online
            </button>
          </div>
        ) : (
          // Lansia Fast-Click
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '18px' }}>Daftar Cepat Puskesmas Terdekat:</h3>
            <button 
              onClick={() => { setSelectedClinic('puskesmas1'); setSelectedRoom('Umum'); onBookHealth(); }}
              className="btn-premium animate-pulse"
              style={{ padding: '18px', fontSize: '18px', borderRadius: '8px', background: 'var(--accent-green)', boxShadow: '0 4px 12px rgba(25, 135, 84, 0.2)' }}
            >
              Daftar Antrean Puskesmas Gondokusuman (Umum)
            </button>
            <a 
              href="tel:119"
              onClick={(e) => { e.preventDefault(); speak("Menghubungi Ambulans Gawat Darurat", true); }}
              className="btn-premium"
              style={{ padding: '14px', fontSize: '16px', borderRadius: '8px', background: 'var(--accent-danger)', boxShadow: '0 4px 12px rgba(220, 53, 69, 0.2)', textDecoration: 'none', textAlign: 'center' }}
            >
              🚨 PANGGIL AMBULANS DARURAT (119)
            </a>
          </div>
        )}

        {/* Interactive simulation health-drainage prediction */}
        <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>🦟 Hub Prediktif Kesehatan-Drainase (Health-Drainage Nexus)</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            AI menganalisis data sensor genangan air drainase (jika bertahan &gt;12 jam) dan data klinik RS sekitar (jika kasus demam melonjak &gt;5%). AI otomatis dispatch petugas fogging ke area tersebut.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', background: 'var(--bg-tertiary)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }}>
            <div>
              <div>Sensor Genangan Air: <strong style={{ color: drainageNodes[0].status === 'puddle' ? '#dc3545' : '#198754' }}>{drainageNodes[0].status === 'puddle' ? '⚠️ TERGENANG ARUS MAMPET (>12h)' : '✓ AMAN / LANCAR'}</strong></div>
              <div style={{ marginTop: '4px' }}>Kasus Demam Faskes: <strong style={{ color: drainageNodes[0].status === 'puddle' ? '#dc3545' : '#198754' }}>{drainageNodes[0].status === 'puddle' ? '⚠️ LONJAKAN +6.2%' : '✓ NORMAL (<2%)'}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={() => triggerPuddleStatus('grate_gondo')} style={{ background: '#eab308', color: 'black', border: 'none', padding: '6px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                🌧️ Simulasikan Hujan & Genangan
              </button>
              <button onClick={() => triggerPuddleStatus('grate_normal')} style={{ background: '#198754', color: 'white', border: 'none', padding: '6px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                ✓ Bersihkan Genangan
              </button>
            </div>
          </div>

          {drainageNodes[0].status === 'puddle' && (
            <div style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', border: '1px solid rgba(220, 53, 69, 0.2)', padding: '10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
              📢 ALARM PRE-EMPTIVE WABAH AKTIF: Perintah penyemprotan fogging otomatis ditransmisikan ke Dinas Lingkungan Hidup Yogyakarta. Notifikasi pencegahan dikirim ke 1,420 ponsel warga sekitar radius 500m.
            </div>
          )}
        </div>

      </div>

      {/* Right Column: GIS Map with healthcare nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>🗺️ Peta Lokasi Puskesmas & Sensor Air</h3>
        <div style={{ flex: 1 }} className="glass-panel">
          <InteractiveMap
            mode={uiMode}
            vehicles={vehicles}
            drainageNodes={drainageNodes}
            puddleReports={puddleReports}
            activeRoute={activeRoute}
          />
        </div>
      </div>

    </div>
  );
}
