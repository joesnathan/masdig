// ReportsTab.tsx - Desktop Citizen Reports & Edge-AI Fleet camera view for Jogja Punya Kita
import React from 'react';

interface DetectedItem {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ReportsTabProps {
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
  uiMode: 'default' | 'lansia' | 'disabilitas';
  dashcamImage: string;
  detectedItem: DetectedItem | null;
}

export default function ReportsTab({
  laporCategory,
  setLaporCategory,
  laporDescription,
  setLaporDescription,
  laporLocationName,
  setLaporLocationName,
  laporImageMock,
  setLaporImageMock,
  laporSuccess,
  onReportSubmit,
  onLansiaQuickReport,
  uiMode,
  dashcamImage,
  detectedItem
}: ReportsTabProps) {

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      
      {/* Service panel */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <h2 style={{ fontSize: '20px', color: 'var(--brand-crimson)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
          📢 Pusat Pengaduan & Laporan Warga
        </h2>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Kirimkan laporan kerusakan infrastruktur jalan berlubang, genangan drainase mampet, atau tumpukan sampah liar. Sistem akan mengunci lokasi GPS Anda otomatis.
        </p>

        {laporSuccess ? (
          <div style={{ background: 'rgba(25, 135, 84, 0.15)', color: '#198754', padding: '24px', borderRadius: '8px', border: '1px solid #198754', textAlign: 'center' }}>
            <h3>Laporan Terkirim Sukses!</h3>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>Nomer tiket Anda telah terdaftar dalam database pemkot Yogyakarta.</p>
          </div>
        ) : (
          <form onSubmit={onReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Kategori Laporan:</label>
              <select value={laporCategory} onChange={(e) => setLaporCategory(e.target.value as 'Infrastruktur' | 'Genangan' | 'Sampah' | 'Lainnya')} className="modern-input">
                <option value="Infrastruktur">Kerusakan Jalan / Trotoar (Potholes)</option>
                <option value="Genangan">Genangan Air Mampet (Drainase)</option>
                <option value="Sampah">Sampah Liar Perkotaan</option>
                <option value="Lainnya">Lain-Lain</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Kecamatan/Wilayah Lokasi:</label>
              <select value={laporLocationName} onChange={(e) => setLaporLocationName(e.target.value)} className="modern-input">
                <option value="Jalan Malioboro">Jalan Malioboro</option>
                <option value="Kawasan Tugu Yogyakarta">Kawasan Tugu Yogyakarta</option>
                <option value="Area Kraton Yogyakarta">Area Kraton Yogyakarta</option>
                <option value="Gondokusuman">Gondokusuman</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Deskripsi Kejadian:</label>
              <textarea rows={3} value={laporDescription} onChange={(e) => setLaporDescription(e.target.value)} placeholder="Tulis rincian kerusakan..." className="modern-input" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Lampiran Foto (Simulasi Kamera):</label>
              <select value={laporImageMock} onChange={(e) => setLaporImageMock(e.target.value)} className="modern-input">
                <option value="pothole">📸 Foto Jalan Berlubang</option>
                <option value="puddle">📸 Foto Gorong-gorong Mampet</option>
                <option value="trash">📸 Foto Tumpukan Sampah</option>
              </select>
            </div>

            <button type="submit" className="btn-premium">
              Kirim Pengaduan Resmi Warga
            </button>
          </form>
        )}

        {/* Mode Lansia quick report */}
        {uiMode === 'lansia' && (
          <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>⚡ Lapor Cepat (Sekali Klik):</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => onLansiaQuickReport('Sampah', 'Tumpukan sampah mengganggu di jalan', 'Jalan Malioboro')} style={{ flex: 1, background: 'var(--brand-gold)', color: 'black', padding: '14px', fontSize: '14px', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                🗑️ Lapor Tumpukan Sampah
              </button>
              <button onClick={() => onLansiaQuickReport('Infrastruktur', 'Jalanan rusak berlubang berbahaya', 'Kawasan Tugu Yogyakarta')} style={{ flex: 1, background: 'var(--brand-gold)', color: 'black', padding: '14px', fontSize: '14px', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                🕳️ Lapor Jalan Berlubang
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Right Column: Fleet Edge-AI Dashcam Simulation */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          🤖 Edge-AI Dashcam Scanner (Armada Umum Keliling)
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          <strong>Konsep Baru:</strong> Mengubah fitur lapor pasif menjadi aktif-otomatis. Dashcam murah pada truk sampah & bus kota memindai jalan secara real-time untuk mendeteksi sampah/lubang jalan dan otomatis membuat tiket laporan sebelum warga mengeluh.
        </p>

        {/* Simulated Dashcam screen */}
        <div style={{ position: 'relative', background: '#000', borderRadius: '8px', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          
          <div style={{ color: 'white', zIndex: 10, textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
            [Kamera Dashcam AI Dinas] <br/>
            <span style={{ fontSize: '11px', color: '#ffc107' }}>Posisi: {dashcamImage}</span>
          </div>

          {/* Scan grid line */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#00ff00', boxShadow: '0 0 10px #00ff00', animation: 'scan-line 3.5s linear infinite' }}></div>
          
          {/* Bounding box detect mock */}
          {detectedItem && (
            <div style={{ position: 'absolute', border: '3px solid #ff0000', left: `${detectedItem.x + 30}px`, top: `${detectedItem.y}px`, width: `${detectedItem.width}px`, height: `${detectedItem.height}px`, animation: 'pulse 1s infinite' }}>
              <span style={{ position: 'absolute', top: '-18px', left: '-3px', background: '#ff0000', color: 'white', fontSize: '9px', padding: '1px 4px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                {detectedItem.label} ({detectedItem.confidence}%)
              </span>
            </div>
          )}
        </div>

        {detectedItem && (
          <div style={{ background: 'rgba(0, 102, 204, 0.1)', color: 'var(--accent-blue)', border: '1px solid rgba(0, 102, 204, 0.2)', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
            🛡️ AI TIKET AUTO-GENERATE: Deteksi jalan berlubang/sampah di {dashcamImage} tercatat dan diteruskan ke Dinas Pekerjaan Umum untuk segera ditindaklanjuti.
          </div>
        )}

      </div>

    </div>
  );
}
