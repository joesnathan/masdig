// InfoTab.tsx - Desktop Info Deck & Challenges view for Jogja Punya Kita
import React from 'react';

export default function InfoTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <h2 style={{ fontSize: '24px', color: 'var(--brand-crimson)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
        📊 Analisis Masalah & Tantangan Smart City Yogyakarta
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--brand-crimson)', marginBottom: '10px' }}>🩺 Akses Layanan Kesehatan</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Masalah:</strong> Kendala jarak faskes fisik bagi warga pelosok desa pegunungan. Kepesertaan aktif JKN BPJS baru berkisar 88.65% dari total penduduk DIY. BPJS Cabang Yogyakarta menggencarkan layanan daring untuk menjangkau masyarakat pelosok desa.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#198754', marginBottom: '10px' }}>♻️ Pengelolaan Sampah Kota</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Masalah:</strong> Tumpukan sampah liar menumpuk di TPS Mandala Krida Yogyakarta (Inspeksi LHK November 2024). Pengaduan SP4N-Lapor masih bersifat parsial dan kurang terintegrasi menyebabkan tumpukan sampah lambat tertangani.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--accent-blue)', marginBottom: '10px' }}>♿ Inklusivitas & Disabilitas</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Masalah:</strong> Jalur pedestrian belum sepenuhnya memadai untuk kursi roda atau ubin taktil tunanetra. Transportasi umum belum menjadi pilihan utama warga karena integrasi sarana penyeberangan ramah disabilitas yang minim.
          </p>
        </div>

      </div>

      {/* Challenges implementation section */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '10px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--brand-gold)', marginBottom: '12px' }}>⚠️ Tantangan Utama Implementasi Lapangan</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <strong>1. Keterbatasan Perangkat Edge-AI:</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Pemasangan dashcam berspesifikasi tinggi (real-time computer vision) di seluruh truk sampah dan transum kota membutuhkan anggaran modal pengadaan & pemeliharaan perangkat yang tinggi.</p>
            </div>
            <div>
              <strong>2. Infrastruktur Internet DIY:</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Kecepatan upload video dan transmisi data telemetri sensor sangat bergantung pada kestabilan internet 4G/5G, yang belum sepenuhnya rata di wilayah pedesaan Yogyakarta.</p>
            </div>
            <div>
              <strong>3. Kesenjangan Digitalisasi Warga:</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Sebagian besar penyandang disabilitas dan kelompok lansia memerlukan pendampingan intensif (literasi digital) untuk memahami cara kerja fitur mobile.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <strong>4. Konsolidasi SOP Antar Dinas:</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Menyatukan sistem pelaporan otomatis ke dalam satu aplikasi tunggal mengharuskan penyatuan SOP kerja antara Dinas Perhubungan, Dinas Kesehatan, dan Dinas Lingkungan Hidup.</p>
            </div>
            <div>
              <strong>5. Privasi & Keamanan Data Warga:</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Sistem pengaduan berbasis lokasi (GIS koordinat) dan tracking nomor BPJS rentan disalahgunakan apabila tata kelola perlindungan data pribadi pemprov DIY tidak diperkuat.</p>
            </div>
            <div>
              <strong>6. Biaya Cloud & Server Maintenance:</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Mengelola jutaan paket data timeseries sensor air (TimeScaleDB) dan koordinat geografis (PostGIS) membutuhkan server tangguh dengan pembiayaan berkelanjutan.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
