// TransitTab.tsx - Desktop Transit & Traffic V2X view for Jogja Punya Kita
import React from 'react';
import InteractiveMap from '@/components/InteractiveMap';

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

interface TransitTabProps {
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
  v2xActive: boolean;
  v2xTimeRemaining: number;
  triggerV2X: () => void;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  vehicles: Vehicle[];
  drainageNodes: MapNode[];
  puddleReports: Array<{ id: string; x: number; y: number; status: string }>;
  activeRoute: string[];
}

export default function TransitTab({
  transitFrom,
  setTransitFrom,
  transitTo,
  setTransitTo,
  transitMode,
  setTransitMode,
  transitPriorityDisabled,
  setTransitPriorityDisabled,
  onBookTransit,
  generateVoiceDirections,
  voiceDirections,
  v2xActive,
  v2xTimeRemaining,
  triggerV2X,
  uiMode,
  vehicles,
  drainageNodes,
  puddleReports,
  activeRoute
}: TransitTabProps) {

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      
      {/* Service Card */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <h2 style={{ fontSize: '20px', color: 'var(--brand-crimson)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
          🚌 Booking Transit & Perutean Dinamis (VRP)
        </h2>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          <strong>Konsep Baru:</strong> Penumpang tidak menunggu bus di halte konvensional secara buta. Shuttle rute micro-transit rute dinamis menjemput warga berdasarkan data request real-time dengan prioritas difabel.
        </p>

        {/* Form for default/standard profile */}
        {uiMode === 'default' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Titik Jemput (Asal):</label>
                <select value={transitFrom} onChange={(e) => setTransitFrom(e.target.value)} className="modern-input">
                  <option value="tugu">Tugu Yogyakarta</option>
                  <option value="malioboro">Malioboro</option>
                  <option value="kraton">Kraton</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Titik Antar (Tujuan):</label>
                <select value={transitTo} onChange={(e) => setTransitTo(e.target.value)} className="modern-input">
                  <option value="kraton">Kraton Yogyakarta</option>
                  <option value="malioboro">Malioboro</option>
                  <option value="tugu">Tugu Yogyakarta</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Jenis Moda:</label>
                <select value={transitMode} onChange={(e) => setTransitMode(e.target.value as 'bus' | 'bentor' | 'bajaj' | 'delman')} className="modern-input">
                  <option value="bus">Trans Jogja Shuttle (Bus)</option>
                  <option value="bentor">Bentor Listrik Modern</option>
                  <option value="bajaj">Bajaj Gas Ramah Lingkungan</option>
                  <option value="delman">Delman Wisata Tradisional</option>
                </select>
              </div>
              
              <label style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '20px' }}>
                <input type="checkbox" checked={transitPriorityDisabled} onChange={(e) => setTransitPriorityDisabled(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                ♿ Prioritaskan Penumpang Difabel
              </label>
            </div>

            <button 
              onClick={onBookTransit}
              className="btn-premium"
            >
              Pesan Tiket & Rute Dinamis
            </button>
          </div>
        )}

        {/* Form for Lansia Mode */}
        {uiMode === 'lansia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '18px' }}>Pilih Destinasi Cepat Lansia:</h3>
            <button 
              onClick={() => { setTransitFrom('tugu'); setTransitTo('rs_jogja'); setTransitMode('bus'); onBookTransit(); }}
              className="btn-premium animate-pulse"
              style={{ padding: '18px', fontSize: '18px', borderRadius: '8px' }}
            >
              🏥 Antar Saya Berobat Ke RSUD Kota
            </button>
            <button 
              onClick={() => { setTransitFrom('malioboro'); setTransitTo('kraton'); setTransitMode('bus'); onBookTransit(); }}
              className="btn-premium"
              style={{ padding: '18px', fontSize: '18px', borderRadius: '8px', background: 'var(--accent-blue)', boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)' }}
            >
              🕌 Antar Saya Ke Kraton / Masjid Gedhe
            </button>
          </div>
        )}

        {/* Form for Disabilitas Mode */}
        {uiMode === 'disabilitas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            
            <div style={{ background: '#000', border: '2px solid #ffff00', color: '#ffff00', padding: '14px', fontWeight: 'bold' }}>
              ♿ PERMINTAAN KENDARAAN DIFABEL (KURSI RODA / AUDIO GUIDE)
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                onClick={() => { setTransitFrom('tugu'); setTransitTo('malioboro'); setTransitMode('bus'); onBookTransit(); }}
                style={{ background: 'var(--accent-blue)', color: 'white', padding: '14px', fontSize: '14px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Pesan Shuttle: Tugu Ke Malioboro
              </button>
              <button 
                onClick={() => { setTransitFrom('malioboro'); setTransitTo('kraton'); setTransitMode('bus'); onBookTransit(); }}
                style={{ background: 'var(--accent-blue)', color: 'white', padding: '14px', fontSize: '14px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Pesan Shuttle: Malioboro Ke Kraton
              </button>
            </div>

            {/* Speech guide button */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold' }}>🔊 Cek Rute Pemandu Jalan Pedestrian Tunanetra</div>
              <button 
                onClick={generateVoiceDirections}
                style={{ background: 'var(--brand-crimson)', color: 'white', padding: '10px', fontSize: '12px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🔊 Dengar Rute Pedestrian Aman (Malioboro - Kraton)
              </button>
              {voiceDirections && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '8px', background: 'var(--bg-primary)', borderLeft: '3px solid var(--brand-crimson)', borderRadius: '2px' }}>
                  🗣️ {voiceDirections}
                </div>
              )}
            </div>

          </div>
        )}

        {/* V2X Signal Traffic Intervention simulation widget */}
        <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>📡 Integrasi V2X & Lampu Penyeberangan Zebra Cross</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Mendukung penyeberangan aman difabel. Sensor zebra cross mendeteksi keberadaan warga tunanetra/kursi roda lewat GPS ponsel mereka dan langsung meminta sinyal hijau ekstra 10 detik.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#212529', padding: '6px 4px', borderRadius: '10px', width: '22px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: v2xActive ? '#444' : '#dc3545' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#444' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: v2xActive ? '#00ff00' : '#444', animation: v2xActive ? 'pulse 1s infinite' : 'none' }}></div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status Lampu Zebra Cross:</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: v2xActive ? '#198754' : '#dc3545' }}>
                  {v2xActive ? `HIJAU AMAN (+${v2xTimeRemaining}s)` : 'MERAH STANDAR'}
                </div>
              </div>
            </div>

            <button 
              onClick={triggerV2X}
              disabled={v2xActive}
              style={{ background: v2xActive ? 'var(--border-color)' : 'var(--brand-gold)', color: 'black', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🚀 Simulasikan Zebra Cross V2X
            </button>
          </div>
        </div>

      </div>

      {/* Map view */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>🗺️ Jalur Transportasi Aktif Yogyakarta</h3>
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
