// MobileReportTab.tsx - Citizen Reports (Lapor) view for JogjaOne Mobile App
import React, { useState, useEffect } from 'react';
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
}

// ----------------- SVG Icons Helper collection -----------------
const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const WarningIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

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

export default function MobileReportTab({
  tickets,
  setTickets,
  puddleReports,
  setPuddleReports,
  uiMode
}: MobileReportTabProps) {
  // AI Auto-Reporting simulation states
  const [cameraState, setCameraState] = useState<'idle' | 'captured' | 'analyzing' | 'done'>('idle');
  const [cameraFlash, setCameraFlash] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // Custom camera controls
  const [zoomLevel, setZoomLevel] = useState('1x');
  const [scanMode, setScanMode] = useState<'auto' | 'lidar'>('auto');
  const [scanProgress, setScanProgress] = useState(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

  // Manual Form States
  const [manualTitle, setManualTitle] = useState('');
  const [manualLocation, setManualLocation] = useState('Jl. Malioboro');
  const [manualDetails, setManualDetails] = useState('');

  // Feed interaction states
  const [potholeLikes, setPotholeLikes] = useState(48);
  const [potholeLiked, setPotholeLiked] = useState(false);
  const [pjuLikes, setPjuLikes] = useState(128);
  const [pjuLiked, setPjuLiked] = useState(false);

  // Comments state
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<Record<string, string[]>>({
    'pothole-1': ['Sangat membahayakan di malam hari!', 'Kemarin saya hampir jatuh di situ.'],
    'pju-1': ['Sudah seminggu mati belum dibetulkan.', 'Rawan begal kalau gelap begini.']
  });

  // Scanning progress and logs simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cameraState === 'analyzing') {
      setScanProgress(0);
      setDiagnosticLogs(['[INFO] Model AI Cerdas diaktifkan...']);
      
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
            return 100;
          }
          return next;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [cameraState]);

  const handleCapture = () => {
    setCameraFlash(true);
    speak("Foto diambil.");
    setTimeout(() => {
      setCameraFlash(false);
      setCameraState('analyzing');
    }, 150);
  };

  const handleSendAiReport = () => {
    const reportId = `AI-${Math.floor(1000 + Math.random() * 8999)}`;
    const newTicket: Ticket = {
      id: reportId,
      title: 'Jalan Berlubang (Pothole)',
      location: 'Jl. Malioboro KM 1.2',
      status: 'Terkirim',
      source: 'Edge-AI Fleet Camera',
      time: 'Baru saja',
      details: 'Sistem Edge-AI Vision mendeteksi otomatis lubang sedalam 15cm di lajur kiri Jalan Malioboro.'
    };
    
    setTickets(prev => [newTicket, ...prev]);
    setPuddleReports(prev => [...prev, { id: reportId, x: 250, y: 220, status: 'Terkirim' }]);
    
    speak(`Laporan AI berhasil dikirim. Tiket aduan ${reportId} telah diteruskan.`);
    setCameraState('idle');
    setScanProgress(0);
    setDiagnosticLogs([]);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualDetails) {
      speak("Mohon isi semua kolom laporan.");
      return;
    }

    const reportId = `LPR-${Math.floor(100 + Math.random() * 899)}`;
    const newTicket: Ticket = {
      id: reportId,
      title: manualTitle,
      location: manualLocation,
      status: 'Terkirim',
      source: 'Laporan Warga',
      time: 'Baru saja',
      details: manualDetails
    };

    setTickets(prev => [newTicket, ...prev]);
    setPuddleReports(prev => [...prev, { id: reportId, x: 230, y: 250, status: 'Terkirim' }]);
    
    speak(`Laporan Anda sukses terkirim. Nomor tiket Anda ${reportId}.`);
    
    setManualTitle('');
    setManualDetails('');
    setShowManualForm(false);
  };

  const handleLikePothole = () => {
    if (potholeLiked) {
      setPotholeLikes(prev => prev - 1);
      setPotholeLiked(false);
    } else {
      setPotholeLikes(prev => prev + 1);
      setPotholeLiked(true);
      speak("Menyukai aduan.");
    }
  };

  const handleLikePju = () => {
    if (pjuLiked) {
      setPjuLikes(prev => prev - 1);
      setPjuLiked(false);
    } else {
      setPjuLikes(prev => prev + 1);
      setPjuLiked(true);
      speak("Menyukai aduan.");
    }
  };

  const handleAddComment = (reportId: string) => {
    if (!commentText.trim()) return;
    setCommentsList(prev => ({
      ...prev,
      [reportId]: [...(prev[reportId] || []), commentText]
    }));
    setCommentText('');
    speak("Komentar ditambahkan.");
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Scrollable contents */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
        
        {/* Header Introduction */}
        <div>
          <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', letterSpacing: '-0.2px' }}>
            Smart Reporting & AI Vision
          </strong>
          <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
            Sistem pelaporan warga terintegrasi AI untuk Kota Yogyakarta yang lebih baik.
          </p>
        </div>

        {/* 1. AI Auto-Reporting Viewfinder */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '7px', background: 'rgba(26,115,232,0.12)', color: 'var(--accent-blue)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              AI Auto-Reporting
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                type="button"
                onClick={() => { setScanMode('auto'); speak("Mode kamera otomatis aktif."); }}
                style={{ fontSize: '6px', padding: '2px 4px', border: 'none', background: scanMode === 'auto' ? 'var(--accent-blue)' : 'var(--bg-tertiary)', color: scanMode === 'auto' ? 'white' : 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Auto
              </button>
              <button 
                type="button"
                onClick={() => { setScanMode('lidar'); speak("Mode LiDAR aktif."); }}
                style={{ fontSize: '6px', padding: '2px 4px', border: 'none', background: scanMode === 'lidar' ? 'var(--accent-blue)' : 'var(--bg-tertiary)', color: scanMode === 'lidar' ? 'white' : 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                LiDAR
              </button>
            </div>
          </div>
          
          <strong style={{ display: 'block', fontSize: '11px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Deteksi Kerusakan Otomatis
          </strong>

          {/* Viewfinder frame */}
          <div style={{
            height: '130px',
            background: '#000000',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Shutter flash */}
            {cameraFlash && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'white', zIndex: 100 }} />}

            {cameraState === 'idle' && (
              <div style={{ textAlign: 'center', color: '#aaa', padding: '10px' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>📷</span>
                <span style={{ fontSize: '8px', display: 'block' }}>Arahkan & Ambil Foto di bawah</span>
              </div>
            )}

            {cameraState !== 'idle' && (
              <>
                <img 
                  src="/tugu_yogyakarta.png" 
                  alt="Scanned item" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: cameraState === 'analyzing' ? 'brightness(60%) blur(1px)' : 'brightness(80%)' }} 
                />
                
                {/* Viewfinder focus box */}
                <div style={{ position: 'absolute', borderLeft: '2px solid #00ff00', borderTop: '2px solid #00ff00', left: '15px', top: '15px', width: '15px', height: '15px' }} />
                <div style={{ position: 'absolute', borderRight: '2px solid #00ff00', borderTop: '2px solid #00ff00', right: '15px', top: '15px', width: '15px', height: '15px' }} />
                <div style={{ position: 'absolute', borderLeft: '2px solid #00ff00', borderBottom: '2px solid #00ff00', left: '15px', bottom: '15px', width: '15px', height: '15px' }} />
                <div style={{ position: 'absolute', borderRight: '2px solid #00ff00', borderBottom: '2px solid #00ff00', right: '15px', bottom: '15px', width: '15px', height: '15px' }} />
              </>
            )}

            {/* AI Diagnostics Logging Overlay */}
            {cameraState === 'analyzing' && (
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                bottom: '10px',
                background: 'rgba(0,0,0,0.75)',
                borderRadius: '6px',
                padding: '10px',
                color: '#00ff00',
                fontFamily: 'monospace',
                fontSize: '6.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #00ff00', paddingBottom: '3px', marginBottom: '3px' }}>
                  <span>AI DIAGNOSTIC METER</span>
                  <span>{scanProgress}%</span>
                </div>
                {diagnosticLogs.map((log, idx) => (
                  <div key={idx} style={{ lineBreak: 'anywhere' }}>{log}</div>
                ))}
                
                {/* Progress bar */}
                <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden', marginTop: 'auto' }}>
                  <div style={{ width: `${scanProgress}%`, height: '100%', background: '#00ff00', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}

            {cameraState === 'done' && (
              <div style={{
                position: 'absolute',
                border: '2px solid #ea4335',
                borderRadius: '4px',
                width: '65px',
                height: '45px',
                top: '35%',
                left: '38%',
                boxShadow: '0 0 8px rgba(234,67,53,0.6)',
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <span style={{ background: '#ea4335', color: 'white', fontSize: '6px', fontWeight: 'bold', padding: '1px 3px' }}>
                  POTHOLE: 92%
                </span>
              </div>
            )}
          </div>

          {/* Zoom and Mode options */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '8px', color: 'var(--text-secondary)' }}>
            <span>Zoom: </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['1x', '2x', '4x'].map(z => (
                <button
                  key={z}
                  type="button"
                  onClick={() => { setZoomLevel(z); speak(`Perbesaran ${z}.`); }}
                  style={{ border: 'none', background: zoomLevel === z ? 'var(--accent-blue)' : 'var(--bg-tertiary)', color: zoomLevel === z ? 'white' : 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '7px', fontWeight: 'bold' }}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Viewfinder controller keys */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
            <button 
              type="button"
              onClick={handleCapture}
              disabled={cameraState === 'analyzing'}
              style={{
                background: 'var(--accent-blue)',
                color: 'white',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(26,115,232,0.15)'
              }}
            >
              <CameraIcon />
            </button>

            <button
              type="button"
              onClick={handleSendAiReport}
              disabled={cameraState !== 'done'}
              style={{
                background: cameraState === 'done' ? 'var(--brand-crimson)' : 'var(--border-color)',
                color: cameraState === 'done' ? 'white' : 'var(--text-muted)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: cameraState === 'done' ? 'pointer' : 'not-allowed',
                boxShadow: cameraState === 'done' ? '0 2px 5px rgba(139,0,0,0.2)' : 'none'
              }}
            >
              Kirim Laporan
            </button>
          </div>
        </div>

        <button 
          onClick={() => {
            setShowManualForm(true);
            speak("Membuka form manual.");
          }}
          style={{
            background: 'none',
            border: '1.5px solid var(--accent-blue)',
            color: 'var(--accent-blue)',
            padding: '8px',
            borderRadius: '20px',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Lapor Manual dengan AI
        </button>

        {/* 2. Laporan Terkini List */}
        <div>
          <strong style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
            Laporan Terkini
          </strong>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Card 1: Pothole */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ background: 'rgba(26,115,232,0.12)', color: 'var(--accent-blue)', padding: '2px 6px', borderRadius: '4px', fontSize: '7px', fontWeight: 'bold' }}>
                    AI Verified
                  </span>
                  <strong style={{ fontSize: '10px', color: 'var(--text-primary)' }}>Pothole on Jalan Malioboro</strong>
                </div>
                <span style={{ fontSize: '8px', color: '#b06000', background: 'rgba(176,96,0,0.12)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                  IN PROGRESS
                </span>
              </div>

              <div style={{ height: '110px', background: 'var(--bg-tertiary)', position: 'relative' }}>
                <img 
                  src="/tugu_yogyakarta.png" 
                  alt="Pothole" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(70%)' }} 
                />
              </div>

              <div style={{ padding: '10px 12px' }}>
                <p style={{ fontSize: '9px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Lubang cukup dalam di lajur kiri dekat halte Trans Jogja, berbahaya bagi pengendara motor...
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '8px 0', fontSize: '8px', color: 'var(--text-muted)' }}>
                  <span>📍 Jl. Malioboro</span>
                  <span>•</span>
                  <span>3 jam lalu</span>
                </div>

                {/* Interaction controls */}
                <div style={{ display: 'flex', gap: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <button 
                    onClick={handleLikePothole}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, fontSize: '9px', color: potholeLiked ? '#ea4335' : 'var(--text-secondary)' }}
                  >
                    <HeartIcon filled={potholeLiked} color={potholeLiked ? '#ea4335' : 'currentColor'} />
                    <span>{potholeLikes}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setShowCommentModal('pothole-1');
                      speak("Membuka komentar.");
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, fontSize: '9px', color: 'var(--text-secondary)' }}
                  >
                    <CommentIcon />
                    <span>{commentsList['pothole-1']?.length || 0}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Lampu PJU Mati */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <strong style={{ fontSize: '10px', color: 'var(--text-primary)' }}>Lampu PJU Mati</strong>
                </div>
                <span style={{ fontSize: '8px', color: 'var(--accent-blue)', background: 'rgba(26,115,232,0.12)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                  TERKIRIM
                </span>
              </div>
              <p style={{ fontSize: '9px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                3 lampu jalan berturut-turut mati, sangat gelap di malam hari.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '8px 0 6px 0', fontSize: '8px', color: 'var(--text-muted)' }}>
                <span>📍 Jl. Kaliurang</span>
                <span>•</span>
                <span>5 jam lalu</span>
              </div>

              {/* Interaction controls */}
              <div style={{ display: 'flex', gap: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <button 
                  onClick={handleLikePju}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, fontSize: '9px', color: pjuLiked ? '#ea4335' : 'var(--text-secondary)' }}
                >
                  <HeartIcon filled={pjuLiked} color={pjuLiked ? '#ea4335' : 'currentColor'} />
                  <span>{pjuLikes}</span>
                </button>

                <button 
                  onClick={() => {
                    setShowCommentModal('pju-1');
                    speak("Membuka komentar.");
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, fontSize: '9px', color: 'var(--text-secondary)' }}
                >
                  <CommentIcon />
                  <span>{commentsList['pju-1']?.length || 0}</span>
                </button>
              </div>
            </div>

            {/* Custom dynamic tickets */}
            {tickets.filter(t => t.source === 'Laporan Warga').map((t, index) => (
              <div key={index} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '10px', color: 'var(--text-primary)' }}>{t.title}</strong>
                  <span style={{ fontSize: '8px', color: 'var(--accent-blue)', background: 'rgba(26,115,232,0.12)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '9px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {t.details}
                </p>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  📍 {t.location} • {t.time}
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => {
          setShowManualForm(true);
          speak("Membuka form manual.");
        }}
        style={{
          position: 'absolute',
          bottom: '72px',
          right: '16px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--accent-blue)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 90
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* 3. Manual Report Drawer Overlay */}
      {showManualForm && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          animation: 'fade-in 0.2s ease'
        }}>
          <form 
            onSubmit={handleManualSubmit}
            className="animate-slide-up"
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 24px',
              boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', alignSelf: 'center', cursor: 'pointer' }} onClick={() => setShowManualForm(false)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--accent-blue)' }}>📢 Buat Laporan Pengaduan</strong>
              <button type="button" onClick={() => setShowManualForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div>
              <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Judul Laporan / Jenis Masalah:</label>
              <input
                type="text"
                placeholder="Misal: Pothole, Lampu Jalan Padam, dll"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="modern-input"
                style={{ padding: '8px', fontSize: '11px' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pilih Lokasi:</label>
              <select 
                value={manualLocation} 
                onChange={(e) => setManualLocation(e.target.value)} 
                className="modern-input" 
                style={{ padding: '8px', fontSize: '11px' }}
              >
                <option value="Jl. Malioboro">Kawasan Jalan Malioboro</option>
                <option value="Jl. Jenderal Sudirman">Jalan Jenderal Sudirman</option>
                <option value="Simpang Tugu Yogyakarta">Simpang Tugu Yogyakarta</option>
                <option value="Jl. Kaliurang">Jalan Kaliurang</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Keterangan / Detail Deskripsi:</label>
              <textarea
                rows={3}
                placeholder="Tulis detail aduan Anda..."
                value={manualDetails}
                onChange={(e) => setManualDetails(e.target.value)}
                className="modern-input"
                style={{ padding: '8px', fontSize: '11px' }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-premium"
              style={{
                background: 'var(--accent-blue)',
                padding: '10px',
                fontSize: '11px',
                boxShadow: '0 2px 6px rgba(26,115,232,0.2)',
                marginTop: '6px'
              }}
            >
              Kirim Laporan Warga
            </button>
          </form>
        </div>
      )}

      {/* 4. Comments Drawer Overlay */}
      {showCommentModal && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          animation: 'fade-in 0.2s ease'
        }}>
          <div 
            className="animate-slide-up"
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 24px',
              boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '75%'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', alignSelf: 'center', cursor: 'pointer' }} onClick={() => setShowCommentModal(null)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>💬 Komentar Warga</strong>
              <button onClick={() => setShowCommentModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* Comments list */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '120px' }}>
              {(commentsList[showCommentModal] || []).length === 0 ? (
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', display: 'block', margin: '20px 0' }}>Belum ada komentar. Tulis yang pertama!</span>
              ) : (
                (commentsList[showCommentModal] || []).map((cmt, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Warga Istimewa</span>
                      <span style={{ fontSize: '6px', color: 'var(--text-muted)' }}>Baru saja</span>
                    </div>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{cmt}</span>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <input
                type="text"
                placeholder="Tulis tanggapan Anda..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="modern-input"
                style={{ padding: '8px', fontSize: '10px', flex: 1 }}
              />
              <button
                onClick={() => handleAddComment(showCommentModal)}
                style={{
                  background: 'var(--accent-blue)',
                  color: 'white',
                  border: 'none',
                  padding: '0 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
