// MobileReportTab.tsx - Citizen Reports (Lapor) view for JogjaOne Mobile App (Version 2)
import React, { useState, useEffect, useRef } from 'react';
import { speak } from '@/utils/speech';

interface Ticket {
  id: string;
  title: string;
  location: string;
  status: 'Terkirim' | 'Dalam Proses' | 'Selesai';
  source: 'Edge-AI Fleet Camera' | 'Smart Grate Sensor' | 'Laporan Warga';
  time: string;
  details: string;
}

interface MobileReportTabProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  puddleReports: Array<{ id: string; x: number; y: number; status: string }>;
  setPuddleReports: React.Dispatch<React.SetStateAction<Array<{ id: string; x: number; y: number; status: string }>>>;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  onNavigate?: (tab: 'home' | 'mobilitas' | 'lingkungan' | 'kesehatan' | 'lapor' | 'layanan') => void;
}

const getFs = (size: number) => `calc(${size}px * var(--font-scale))`;

// ----------------- SVG Icons Helper collection -----------------
const HeartIcon = ({ filled = false, color = 'currentColor' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function MobileReportTab({
  tickets,
  setTickets,
  setPuddleReports,
  onNavigate
}: MobileReportTabProps) {
  // AI Auto-Reporting simulation states
  const [cameraState, setCameraState] = useState<'idle' | 'captured' | 'analyzing' | 'done'>('idle');
  const [cameraFlash, setCameraFlash] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Custom camera controls
  const [scanProgress, setScanProgress] = useState(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

  // Form States
  const [manualTitle, setManualTitle] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [manualDetails, setManualDetails] = useState('');

  // Feed interaction states
  const [potholeLikes, setPotholeLikes] = useState(34);
  const [potholeLiked, setPotholeLiked] = useState(false);
  const [pjuLikes, setPjuLikes] = useState(18);
  const [pjuLiked, setPjuLiked] = useState(false);
  const [sampahLikes, setSampahLikes] = useState(27);
  const [sampahLiked, setSampahLiked] = useState(false);

  // Scanning progress and logs simulation
  useEffect(() => {
    if (cameraState === 'analyzing') {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const next = prev + 25;
          if (next === 25) {
            setDiagnosticLogs(l => [...l, '[INFO] Membaca retakan jalan & tekstur...']);
          } else if (next === 50) {
            setDiagnosticLogs(l => [...l, '[WARN] Kedalaman lubang terdeteksi >10cm...']);
          } else if (next === 75) {
            setDiagnosticLogs(l => [...l, '[INFO] Menghitung koordinat GIS otomatis...']);
          } else if (next >= 100) {
            clearInterval(interval);
            setCameraState('done');
            setDiagnosticLogs(l => [...l, '[SUCCESS] Pothole terverifikasi. Akurasi 92%.']);
            speak("Kecerdasan Buatan mendeteksi Jalan Berlubang dengan akurasi sembilan puluh dua persen. Siap dikirim.");
            // Automatically fill the fields
            setManualTitle('Jalan Berlubang');
            setManualLocation('Jl. Gejayan depan kampus');
            setManualDetails('AI mendeteksi retakan dan lubang jalan dengan kedalaman signifikan, membahayakan pengendara motor.');
            return 100;
          }
          return next;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [cameraState]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }

    setCameraFlash(true);
    speak("Foto diambil. Memulai pemindaian kecerdasan buatan.");
    setTimeout(() => {
      setCameraFlash(false);
      setScanProgress(0);
      setDiagnosticLogs(['[INFO] Model AI Cerdas diaktifkan...']);
      setCameraState('analyzing');
    }, 150);
  };

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (cameraState === 'idle') {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Gagal mengakses kamera:", err);
        });
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraState]);

  const handleSendAiReport = () => {
    const reportId = `RPT-${Math.floor(100 + Math.random() * 899)}`;
    const newTicket: Ticket = {
      id: reportId,
      title: manualTitle || 'Jalan Berlubang',
      location: manualLocation || 'Jl. Gejayan depan kampus',
      status: 'Terkirim',
      source: 'Laporan Warga',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      details: manualDetails || 'AI mendeteksi jalan rusak otomatis.'
    };

    setTickets(prev => [newTicket, ...prev]);
    setCameraState('idle');
    setCapturedImage(null);
    setManualTitle('');
    setManualLocation('');
    setManualDetails('');
    speak("Laporan aduan AI berhasil dikirim ke instansi terkait.");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      speak("Mohon isi judul laporan.");
      return;
    }
    const reportId = `RPT-${Math.floor(100 + Math.random() * 899)}`;
    const newTicket: Ticket = {
      id: reportId,
      title: manualTitle,
      location: manualLocation || 'Yogyakarta',
      status: 'Terkirim',
      source: 'Laporan Warga',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      details: manualDetails || 'Laporan warga manual.'
    };

    setTickets(prev => [newTicket, ...prev]);
    
    // Check if genangan/flood
    if (manualTitle.toLowerCase().includes('genangan') || manualTitle.toLowerCase().includes('banjir')) {
      setPuddleReports(prev => [...prev, { id: reportId, x: 250, y: 240, status: 'Terkirim' }]);
    }

    setManualTitle('');
    setManualLocation('');
    setManualDetails('');
    setCameraState('idle');
    setCapturedImage(null);
    speak("Laporan manual berhasil dikirim.");
  };

  const handleLikePothole = () => {
    if (potholeLiked) {
      setPotholeLikes(prev => prev - 1);
    } else {
      setPotholeLikes(prev => prev + 1);
      speak("Menyukai laporan jalan berlubang.");
    }
    setPotholeLiked(!potholeLiked);
  };

  const handleLikePju = () => {
    if (pjuLiked) {
      setPjuLikes(prev => prev - 1);
    } else {
      setPjuLikes(prev => prev + 1);
      speak("Menyukai laporan lampu jalan mati.");
    }
    setPjuLiked(!pjuLiked);
  };

  const handleLikeSampah = () => {
    if (sampahLiked) {
      setSampahLikes(prev => prev - 1);
    } else {
      setSampahLikes(prev => prev + 1);
      speak("Menyukai laporan sampah menumpuk.");
    }
    setSampahLiked(!sampahLiked);
  };

  return (
    <div 
      className="animate-slide-up" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        position: 'relative',
        background: '#F4F6F9',
        boxSizing: 'border-box'
      }}
    >
      
      {/* 1. Header block */}
      <div 
        style={{
          background: 'linear-gradient(180deg, #FF9800 0%, #F57C00 100%)',
          padding: 'calc(20px * var(--font-scale)) calc(16px * var(--font-scale))',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 15px rgba(255,152,0,0.15)'
        }}
      >
        {/* Back Link */}
        <div 
          onClick={() => { if (onNavigate) onNavigate('home'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', width: 'fit-content' }}
        >
          <BackIcon />
          <span style={{ fontSize: getFs(12), fontWeight: 600 }}>Kembali</span>
        </div>

        {/* Title & Subtitle */}
        <div style={{ marginTop: '4px' }}>
          <h2 style={{ fontSize: getFs(22), fontWeight: 800, margin: 0, color: 'white', letterSpacing: '-0.5px' }}>
            Lapor
          </h2>
          <span style={{ fontSize: getFs(11), color: 'rgba(255,255,255,0.85)', display: 'block', marginTop: '2px' }}>
            Laporkan masalah kota dengan foto
          </span>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px', boxSizing: 'border-box' }}>
        
        {/* Buat Laporan Baru Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          border: '1px solid #E0E0E0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          boxSizing: 'border-box'
        }}>
          <strong style={{ fontSize: getFs(13), color: 'var(--text-primary)', fontWeight: '800' }}>
            Buat Laporan Baru
          </strong>

          {/* Dotted border placeholder or Live AI scan */}
          <div style={{
            height: '140px',
            background: '#F8F9FA',
            borderRadius: '12px',
            border: '2px dashed #BDBDBD',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {cameraFlash && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'white', zIndex: 100 }} />}

            {cameraState === 'idle' && (
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  border: '2.5px dashed rgba(255, 255, 255, 0.65)',
                  borderRadius: '12px',
                  width: '70%',
                  height: '60%',
                  pointerEvents: 'none'
                }} />
                <span style={{ position: 'absolute', bottom: '6px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: getFs(7.5), padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                  Arahkan kamera ke jalan rusak / sampah liar
                </span>
              </div>
            )}

            {cameraState === 'analyzing' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.8)',
                padding: '10px',
                color: '#00ff00',
                fontFamily: 'monospace',
                fontSize: getFs(8),
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #00ff00', paddingBottom: '2px' }}>
                  <span>AI SCANNING OBJECT</span>
                  <span>{scanProgress}%</span>
                </div>
                <div style={{ overflowY: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {diagnosticLogs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
                <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${scanProgress}%`, height: '100%', background: '#00ff00' }} />
                </div>
              </div>
            )}

            {cameraState === 'done' && (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={capturedImage || "/tugu_yogyakarta.png"} 
                  alt="Scanned Pothole" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{
                  position: 'absolute',
                  border: '2px solid #EA4335',
                  borderRadius: '4px',
                  width: '70px',
                  height: '50px',
                  top: '30%',
                  left: '40%',
                  boxShadow: '0 0 8px rgba(234,67,53,0.8)'
                }}>
                  <span style={{ background: '#EA4335', color: 'white', fontSize: getFs(6), fontWeight: 'bold', padding: '1px 3px', position: 'absolute', top: '-10px', left: '-2px' }}>
                    POTHOLE: 92%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Trigger capture button */}
          <button 
            type="button"
            onClick={handleCapture}
            disabled={cameraState === 'analyzing'}
            style={{
              width: '100%',
              background: '#FF9800',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '16px',
              fontSize: getFs(12),
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(255,152,0,0.2)'
            }}
          >
            📸 Ambil Foto
          </button>

          {/* Form input fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <input 
              type="text"
              placeholder="Judul laporan"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              className="modern-input"
              style={{ padding: '12px', fontSize: getFs(11), borderRadius: '12px', border: '1px solid #E0E0E0' }}
            />
            <input 
              type="text"
              placeholder="Lokasi jalan"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="modern-input"
              style={{ padding: '12px', fontSize: getFs(11), borderRadius: '12px', border: '1px solid #E0E0E0' }}
            />
            <textarea 
              placeholder="Deskripsi kejadian..."
              value={manualDetails}
              onChange={(e) => setManualDetails(e.target.value)}
              className="modern-input"
              style={{ padding: '12px', fontSize: getFs(11), borderRadius: '12px', border: '1px solid #E0E0E0', height: '60px', resize: 'none' }}
            />
          </div>

          {/* Submit button */}
          <button 
            type="button"
            onClick={cameraState === 'done' ? handleSendAiReport : handleManualSubmit}
            style={{
              width: '100%',
              background: '#FF9800',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '16px',
              fontSize: getFs(12),
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(255,152,0,0.2)'
            }}
          >
            ✈️ Kirim Laporan Warga
          </button>
        </div>

        {/* 3. RIWAYAT LAPORAN Section */}
        <div>
          <strong style={{ fontSize: getFs(11), fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>
            RIWAYAT LAPORAN
          </strong>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Card 1: Jalan Berlubang */}
            <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)', position: 'relative' }}>
              <span style={{ position: 'absolute', right: '14px', top: '14px', fontSize: getFs(8), color: 'var(--text-muted)', fontFamily: 'monospace' }}>RPT-045</span>
              <strong style={{ fontSize: getFs(13), color: 'var(--text-primary)', display: 'block', fontWeight: '800' }}>
                Jalan Berlubang
              </strong>
              <span style={{ fontSize: getFs(10), color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                Jl. Gejayan depan kampus
              </span>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: getFs(10), color: '#FF9800', fontWeight: 'bold' }}>Verifikasi</span>
                <span style={{ fontSize: getFs(10), color: '#FF9800', fontWeight: 'bold' }}>40%</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: '#F0F2F5', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '40%', background: '#FF9800', borderRadius: '3px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #F0F2F5', paddingTop: '8px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleLikePothole} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: getFs(10), color: potholeLiked ? '#ea4335' : '#757575', padding: 0 }}>
                    <HeartIcon filled={potholeLiked} color={potholeLiked ? '#ea4335' : '#757575'} /> {potholeLikes}
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: getFs(10), color: '#757575' }}>
                    <CommentIcon /> 12
                  </span>
                </div>
                <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>1j lalu</span>
              </div>
            </div>

            {/* Card 2: Lampu Jalan Mati */}
            <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)', position: 'relative' }}>
              <span style={{ position: 'absolute', right: '14px', top: '14px', fontSize: getFs(8), color: 'var(--text-muted)', fontFamily: 'monospace' }}>RPT-044</span>
              <strong style={{ fontSize: getFs(13), color: 'var(--text-primary)', display: 'block', fontWeight: '800' }}>
                Lampu Jalan Mati
              </strong>
              <span style={{ fontSize: getFs(10), color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                Jl. Malioboro No. 12
              </span>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: getFs(10), color: '#FF9800', fontWeight: 'bold' }}>Dalam Penanganan</span>
                <span style={{ fontSize: getFs(10), color: '#FF9800', fontWeight: 'bold' }}>80%</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: '#F0F2F5', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '80%', background: '#FF9800', borderRadius: '3px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #F0F2F5', paddingTop: '8px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleLikePju} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: getFs(10), color: pjuLiked ? '#ea4335' : '#757575', padding: 0 }}>
                    <HeartIcon filled={pjuLiked} color={pjuLiked ? '#ea4335' : '#757575'} /> {pjuLikes}
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: getFs(10), color: '#757575' }}>
                    <CommentIcon /> 5
                  </span>
                </div>
                <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>3j lalu</span>
              </div>
            </div>

            {/* Card 3: Sampah Menumpuk */}
            <div style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)', position: 'relative' }}>
              <span style={{ position: 'absolute', right: '14px', top: '14px', fontSize: getFs(8), color: 'var(--text-muted)', fontFamily: 'monospace' }}>RPT-043</span>
              <strong style={{ fontSize: getFs(13), color: 'var(--text-primary)', display: 'block', fontWeight: '800' }}>
                Sampah Menumpuk
              </strong>
              <span style={{ fontSize: getFs(10), color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                Jl. Kaliurang Km 7
              </span>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: getFs(10), color: '#FF9800', fontWeight: 'bold' }}>Selesai</span>
                <span style={{ fontSize: getFs(10), color: '#FF9800', fontWeight: 'bold' }}>100%</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: '#F0F2F5', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: '#FF9800', borderRadius: '3px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #F0F2F5', paddingTop: '8px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleLikeSampah} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: getFs(10), color: sampahLiked ? '#ea4335' : '#757575', padding: 0 }}>
                    <HeartIcon filled={sampahLiked} color={sampahLiked ? '#ea4335' : '#757575'} /> {sampahLikes}
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: getFs(10), color: '#757575' }}>
                    <CommentIcon /> 9
                  </span>
                </div>
                <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>5j lalu</span>
              </div>
            </div>

            {/* Custom dynamic tickets */}
            {tickets.filter(t => t.source === 'Laporan Warga').map((t, idx) => (
              <div key={idx} style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <strong style={{ fontSize: getFs(13), color: 'var(--text-primary)', fontWeight: '800' }}>{t.title}</strong>
                  <span style={{ fontSize: getFs(8), color: '#FF9800', background: 'rgba(255,152,0,0.1)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: getFs(10), color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  {t.details}
                </p>
                <div style={{ fontSize: getFs(9), color: 'var(--text-muted)', marginTop: '8px' }}>
                  📍 {t.location} • {t.time}
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

    </div>
  );
}
