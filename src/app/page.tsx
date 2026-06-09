// page.tsx - Main entry point with native responsive layouts for Jogja Punya Kita
'use client';

import React, { useState, useEffect } from 'react';
import MobileApp from '@/components/features/mobile/MobileApp';
import LoginView from '@/components/features/login/LoginView';

import { speak, setSpeechEnabled } from '@/utils/speech';

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

interface Ticket {
  id: string;
  title: string;
  location: string;
  status: 'Terkirim' | 'Dalam Proses' | 'Selesai';
  source: 'Edge-AI Fleet Camera' | 'Smart Grate Sensor' | 'Laporan Warga';
  time: string;
  details: string;
}

export default function HomePage() {
  // -------------------- NATIVE RESPONSIVE SCREEN STATE --------------------
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  
  // -------------------- CORE PORTAL STATES --------------------
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [theme, setTheme] = useState<string>('dark');
  const [fontSize, setFontSize] = useState<string>('font-scale-medium');
  const [uiMode, setUiMode] = useState<'default' | 'lansia' | 'disabilitas'>('default');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [showAccessDropdown, setShowAccessDropdown] = useState<boolean>(false);
  const [timeStr, setTimeStr] = useState<string>('');

  // -------------------- INTEGRATED SIMULATION STATES --------------------
  // V2X Adaptive Green Light
  const [v2xActive, setV2xActive] = useState<boolean>(false);
  const [v2xTimeRemaining, setV2xTimeRemaining] = useState<number>(0);
  
  // Map Routes
  const [activeRoute, setActiveRoute] = useState<string[]>([]);
  
  // Vehicles GPS positions
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 'BUS-1A', name: 'TJ 1A', type: 'bus', x: 250, y: 80, status: 'Beroperasi' },
    { id: 'BTR-03', name: 'Bentor 03', type: 'bentor', x: 180, y: 160, status: 'Menunggu' },
    { id: 'BJJ-09', name: 'Bajaj 09', type: 'bajaj', x: 250, y: 240, status: 'Mencari Penumpang' },
    { id: 'DLM-05', name: 'Delman 05', type: 'delman', x: 250, y: 420, status: 'Santai' },
  ]);

  // IoT Drainage Nodes
  const [drainageNodes, setDrainageNodes] = useState<MapNode[]>([
    { id: 'grate_gondo', name: 'Sensor Air Gondokusuman', type: 'grate', x: 290, y: 150, status: 'ok', details: 'Sensor Grate #1. Kecepatan arus: 1.4 m/s' },
    { id: 'grate_tugu', name: 'Sensor Air Tugu', type: 'grate', x: 250, y: 120, status: 'ok', details: 'Sensor Grate #2. Kecepatan arus: 1.2 m/s' },
    { id: 'grate_kraton', name: 'Sensor Air Kraton', type: 'grate', x: 250, y: 340, status: 'ok', details: 'Sensor Grate #3. Kecepatan arus: 1.5 m/s' },
  ]);

  // System Ticket logs
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'LPR-201', title: 'Trotoar Rusak', location: 'Jalan Malioboro', status: 'Selesai', source: 'Laporan Warga', time: '16:04', details: 'Terdapat keramik pemandu taktil yang copot membahayakan tunanetra.' },
    { id: 'AI-4829', title: 'Jalan Berlubang (Pothole)', location: 'Jalan Jenderal Sudirman', status: 'Dalam Proses', source: 'Edge-AI Fleet Camera', time: '16:45', details: 'Deteksi otomatis kamera armada Dishub. Lubang 30cm teridentifikasi.' },
    { id: 'GRT-7290', title: 'Sumbatan Sampah Plastik', location: 'Sensor Air Tugu', status: 'Terkirim', source: 'Smart Grate Sensor', time: '17:02', details: 'Alarm sumbatan aktif. Beban saringan meningkat drastis.' }
  ]);

  // Citizen-reported puddles list
  const [puddleReports, setPuddleReports] = useState<Array<{ id: string; x: number; y: number; status: string }>>([]);

  // -------------------- CITIZEN INPUT STATES --------------------
  // Transit booking
  const [transitFrom, setTransitFrom] = useState<string>('tugu');
  const [transitTo, setTransitTo] = useState<string>('kraton');
  const [transitMode, setTransitMode] = useState<'bus' | 'bentor' | 'bajaj' | 'delman'>('bus');
  const [transitPriorityDisabled, setTransitPriorityDisabled] = useState<boolean>(false);
  
  // Health booking
  const [selectedClinic, setSelectedClinic] = useState<string>('puskesmas1');
  const [selectedRoom, setSelectedRoom] = useState<string>('Umum');
  const [bookingDate, setBookingDate] = useState<string>('2026-06-08');

  // Bank Sampah recycling
  const [sampahCategory, setSampahCategory] = useState<'Plastik' | 'Kertas' | 'Logam'>('Plastik');
  const [sampahWeight, setSampahWeight] = useState<number>(3);
  const [sampahBalance, setSampahBalance] = useState<number>(45000);
  const [pickupHistory, setPickupHistory] = useState<Array<{ id: string; category: string; weight: number; points: number; status: string }>>([
    { id: 'SMP-082', category: 'Plastik', weight: 5, points: 15000, status: 'Selesai' },
    { id: 'SMP-114', category: 'Kertas', weight: 10, points: 20000, status: 'Selesai' }
  ]);

  // Lapor Form
  const [laporCategory, setLaporCategory] = useState<'Infrastruktur' | 'Genangan' | 'Sampah' | 'Lainnya'>('Infrastruktur');
  const [laporDescription, setLaporDescription] = useState<string>('');
  const [laporLocationName, setLaporLocationName] = useState<string>('Jalan Malioboro');
  const [laporImageMock, setLaporImageMock] = useState<string>('pothole');
  const [laporSuccess, setLaporSuccess] = useState<boolean>(false);

  // Accessible voice navigation text
  const [voiceDirections, setVoiceDirections] = useState<string>('');

  // -------------------- TELEMETRY SUB-SIMULATION STATES --------------------
  // Edge-AI Dashcam Scanner
  const [dashcamImage, setDashcamImage] = useState<string>('Jalan Malioboro');
  const [detectedItem, setDetectedItem] = useState<{ label: string; confidence: number; x: number; y: number; width: number; height: number } | null>(null);

  // Smart Grate Telemetry
  const [waterFlow, setWaterFlow] = useState<number[]>(Array(10).fill(80));
  const [grateWeight, setGrateWeight] = useState<number[]>(Array(10).fill(15));
  const [grateStatus, setGrateStatus] = useState<'normal' | 'clogged'>('normal');
  const [cctvEventShow, setCctvEventShow] = useState<boolean>(false);

  // -------------------- COMPUTED ACCESSIBILITY STATES --------------------
  const isPriorityDisabled = uiMode === 'disabilitas' || transitPriorityDisabled;

  // -------------------- UTILITY SIDE EFFECTS & BINDINGS --------------------
  // Screen resize listener for native responsiveness
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 820);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clock ticker
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const date = new Date();
      setTimeStr(date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Theme variable toggles
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Font size scaler variables
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const classList = document.body.classList;
    classList.forEach(cls => {
      if (cls.startsWith('font-scale-')) {
        classList.remove(cls);
      }
    });
    classList.add(fontSize);
  }, [fontSize]);

  // V2X countdown timer
  useEffect(() => {
    if (!v2xActive) return;
    const timer = setInterval(() => {
      setV2xTimeRemaining(prev => {
        if (prev <= 1) {
          setV2xActive(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [v2xActive]);

  // Vehicles GPS Random Animation loop
  useEffect(() => {
    const movementInterval = setInterval(() => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(v => {
          let nextX = v.x;
          let nextY = v.y;
          if (v.type === 'bus') {
            const direction = Math.random() > 0.5 ? 4 : -4;
            nextY = v.y + direction;
            if (nextY < 50) nextY = 50;
            if (nextY > 450) nextY = 450;
          } else if (v.type === 'bentor') {
            const direction = Math.random() > 0.5 ? 5 : -5;
            nextX = v.x + direction;
            if (nextX < 100) nextX = 100;
            if (nextX > 300) nextX = 300;
          } else {
            nextX = v.x + (Math.random() > 0.5 ? 2 : -2);
            nextY = v.y + (Math.random() > 0.5 ? 2 : -2);
          }
          return { ...v, x: nextX, y: nextY };
        });
      });
    }, 3000);
    return () => clearInterval(movementInterval);
  }, []);

  // Fleet Dashcam AI Scanning loop
  useEffect(() => {
    const scanInterval = setInterval(() => {
      const scenes = ['Jalan Malioboro', 'Jalan Jenderal Sudirman', 'Kawasan Tugu Jogja'];
      const detections = [
        { label: 'Tumpukan Sampah Liar', confidence: 94, x: 120, y: 150, width: 80, height: 60 },
        { label: 'Jalan Berlubang (Pothole)', confidence: 88, x: 200, y: 220, width: 90, height: 40 },
        { label: 'Trotoar Terhalang PKL/Motor', confidence: 91, x: 60, y: 180, width: 70, height: 80 },
        null
      ];
      const randScene = scenes[Math.floor(Math.random() * scenes.length)];
      const randDetect = detections[Math.floor(Math.random() * detections.length)];
      setDashcamImage(randScene);
      setDetectedItem(randDetect);

      if (randDetect) {
        const newTicketId = `AI-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTicket: Ticket = {
          id: newTicketId,
          title: randDetect.label,
          location: randScene,
          status: 'Terkirim',
          source: 'Edge-AI Fleet Camera',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          details: `Scan dashcam AI mendeteksi ${randDetect.label} di ${randScene}. Koordinat GIS tercatat otomatis.`
        };
        setTickets(prev => {
          if (prev.some(t => t.title === newTicket.title && t.location === newTicket.location)) return prev;
          return [...prev, newTicket];
        });
      }
    }, 6000);
    return () => clearInterval(scanInterval);
  }, []);

  // Smart Grate telemetry chart simulator
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setWaterFlow(prev => {
        const next = [...prev.slice(1)];
        const nextVal = grateStatus === 'clogged' ? 20 + Math.random() * 5 : 75 + Math.random() * 10;
        next.push(Math.round(nextVal));
        return next;
      });
      setGrateWeight(prev => {
        const next = [...prev.slice(1)];
        const nextVal = grateStatus === 'clogged' ? 85 + Math.random() * 5 : 12 + Math.random() * 5;
        next.push(Math.round(nextVal));
        return next;
      });
    }, 2000);
    return () => clearInterval(telemetryInterval);
  }, [grateStatus]);

  // -------------------- EVENT HANDLING ACTIONS --------------------
  const handleUiModeSelect = (mode: 'default' | 'lansia' | 'disabilitas') => {
    setUiMode(mode);
    if (mode === 'disabilitas') {
      setTheme('high-contrast');
      setFontSize('font-scale-large');
      setVoiceEnabled(true);
      setSpeechEnabled(true);
      setTimeout(() => {
        speak("Mode disabilitas aktif. Suara pemandu dihidupkan secara otomatis.");
      }, 500);
    } else if (mode === 'lansia') {
      setTheme('light');
      setFontSize('font-scale-large');
      setVoiceEnabled(false);
      setSpeechEnabled(false);
    } else {
      setTheme('dark');
      setFontSize('font-scale-medium');
      setVoiceEnabled(false);
      setSpeechEnabled(false);
    }
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    setSpeechEnabled(enabled);
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() && uiMode === 'default') {
      speak("Maaf, silakan masukkan nama pengguna Anda.");
      return;
    }
    setIsLoggedIn(true);
    speak("Masuk sukses ke Jogja Punya Kita. Selamat datang.");
  };

  const triggerV2X = () => {
    setV2xActive(true);
    setV2xTimeRemaining(10);
    speak("Sinyal V2X dikirim ke API Dishub. Lampu hijau zebra cross diperpanjang sepuluh detik.");
  };

  const triggerPuddleStatus = (nodeId: string) => {
    setDrainageNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        const nextStatus = node.status === 'ok' ? 'puddle' : 'ok';
        if (nextStatus === 'puddle') {
          const newTicket: Ticket = {
            id: `EPI-${Math.floor(100 + Math.random() * 899)}`,
            title: 'Anomali Stagnasi Air & Potensi Demam',
            location: node.name,
            status: 'Terkirim',
            source: 'Smart Grate Sensor',
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            details: `Sensor air mendeteksi genangan air >12 jam di ${node.name}. Faskes sekitar melaporkan lonjakan diare 6.2%. Perintah fogging & abate otomatis.`
          };
          setTickets(prevTickets => [...prevTickets, newTicket]);
          speak("Peringatan AI Smart City: Genangan air mampet terdeteksi. Risiko demam berdarah meningkat. Perintah penanganan dikirim ke Dinas Lingkungan Hidup.");
        }
        return { ...node, status: nextStatus };
      }
      if (nodeId === 'grate_normal') {
        return { ...node, status: 'ok' };
      }
      return node;
    }));
    if (nodeId === 'grate_normal') {
      setPuddleReports([]);
    }
  };

  const triggerSmartGrateOffender = () => {
    setGrateStatus('clogged');
    speak("Load cell saringan mendeteksi lonjakan berat sampah 89 kg. Debit air menyusut.");
    setTimeout(() => {
      setCctvEventShow(true);
      speak("Kamera CCTV mencocokkan anomali debit air. Klip pelaku membuang kantong sampah terekam.");
      const newTicket: Ticket = {
        id: `GRT-${Math.floor(100 + Math.random() * 899)}`,
        title: 'Sampah Sumbat Gorong-gorong',
        location: 'Tugu Yogyakarta',
        status: 'Terkirim',
        source: 'Smart Grate Sensor',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        details: 'Tekanan saringan: 89.2kg, Aliran air: 21.4%. CCTV mendeteksi pelanggaran pembuangan kantong sampah liar.'
      };
      setTickets(prev => [...prev, newTicket]);
    }, 2500);
  };

  const handleBookTransitSubmit = () => {
    setActiveRoute([transitFrom, transitTo]);
    
    // Animate bus coordinates to path start
    setVehicles(prev => prev.map(v => {
      if (v.type === 'bus') {
        const startNode = transitFrom === 'tugu' ? { x: 250, y: 80 } : transitFrom === 'malioboro' ? { x: 250, y: 240 } : { x: 250, y: 420 };
        return { ...v, x: startNode.x, y: startNode.y, status: 'Melayani Booking' };
      }
      return v;
    }));

    const ticketId = `TRN-${Math.floor(100 + Math.random() * 899)}`;
    const fromLabel = transitFrom === 'tugu' ? 'Tugu Jogja' : transitFrom === 'malioboro' ? 'Malioboro' : 'Kraton';
    const toLabel = transitTo === 'kraton' ? 'Kraton' : transitTo === 'malioboro' ? 'Malioboro' : 'Tugu Jogja';

    const newTicket: Ticket = {
      id: ticketId,
      title: `Booking ${transitMode.toUpperCase()}`,
      location: fromLabel,
      status: 'Terkirim',
      source: 'Laporan Warga',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      details: `Perjalanan ${transitMode.toUpperCase()} dari ${fromLabel} ke ${toLabel}. Prioritas difabel: ${isPriorityDisabled ? 'YA' : 'TIDAK'}.`
    };
    setTickets(prev => [...prev, newTicket]);
    
    speak(`Booking armada ${transitMode} dari ${fromLabel} menuju ${toLabel} sukses. Tiket Anda ${ticketId}.`);
    if (isPriorityDisabled) {
      speak("Sinyal lampu hijau diperpanjang di rute penyeberangan Anda.");
      triggerV2X();
    }
  };

  const handleBookHealthSubmit = () => {
    const queueNo = `H-${Math.floor(10 + Math.random() * 89)}`;
    const clinicLabel = selectedClinic === 'puskesmas1' ? 'Puskesmas Gondokusuman' : selectedClinic === 'puskesmas2' ? 'Puskesmas Jetis' : 'RSUD Kota Yogyakarta';
    
    const newTicket: Ticket = {
      id: `HCS-${Math.floor(100 + Math.random() * 899)}`,
      title: `Nomor Antrean Poli ${selectedRoom}`,
      location: clinicLabel,
      status: 'Terkirim',
      source: 'Laporan Warga',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      details: `Poli: ${selectedRoom}, Tanggal periksa: ${bookingDate}. Antrean: ${queueNo}.`
    };
    setTickets(prev => [...prev, newTicket]);
    speak(`Daftar faskes berhasil. Nomor antrean pemeriksaan Anda adalah ${queueNo}.`);
  };

  const handleRecyclePickupSubmit = () => {
    const gained = sampahWeight * (sampahCategory === 'Plastik' ? 3000 : sampahCategory === 'Kertas' ? 2000 : 5000);
    setSampahBalance(prev => prev + gained);
    const pickupId = `SMP-${Math.floor(100 + Math.random() * 899)}`;
    
    setPickupHistory(prev => [
      { id: pickupId, category: sampahCategory, weight: sampahWeight, points: gained, status: 'Proses Penjemputan' },
      ...prev
    ]);

    // Dispatch recycling vehicle coordinates on map
    setVehicles(prev => prev.map(v => {
      if (v.type === 'bentor') {
        return { ...v, x: 290, y: 150, status: 'Jemput Sampah Warga' };
      }
      return v;
    }));

    const newTicket: Ticket = {
      id: pickupId,
      title: `Setor Sampah: ${sampahCategory}`,
      location: 'Rumah Warga',
      status: 'Terkirim',
      source: 'Laporan Warga',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      details: `Setoran sampah ${sampahCategory} seberat ${sampahWeight} kg. Estimasi reward: Rp ${gained.toLocaleString()}`
    };
    setTickets(prev => [...prev, newTicket]);
    speak(`Sukses memesan penjemputan sampah. Estimasi saldo reward bertambah sebesar ${gained} rupiah.`);
  };

  const handleReportSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!laporDescription.trim()) {
      speak("Mohon tuliskan deskripsi laporan.");
      return;
    }
    const lprId = `LPR-${Math.floor(100 + Math.random() * 899)}`;
    const newTicket: Ticket = {
      id: lprId,
      title: `Aduan ${laporCategory}: ${laporDescription.substring(0, 20)}...`,
      location: laporLocationName,
      status: 'Terkirim',
      source: 'Laporan Warga',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      details: laporDescription
    };
    setTickets(prev => [...prev, newTicket]);

    if (laporCategory === 'Genangan') {
      let x = 250, y = 240;
      if (laporLocationName.includes('Tugu')) { x = 250; y = 100; }
      else if (laporLocationName.includes('Kraton')) { x = 250; y = 390; }
      else if (laporLocationName.includes('Gondokusuman')) { x = 320; y = 150; }
      
      setPuddleReports(prev => [...prev, { id: lprId, x, y, status: 'Terkirim' }]);
    }

    setLaporSuccess(true);
    speak(`Laporan Anda telah berhasil terkirim. Nomer aduan Anda adalah ${lprId}.`);
    setTimeout(() => {
      setLaporSuccess(false);
      setLaporDescription('');
    }, 4000);
  };

  const handleLansiaQuickReport = (category: 'Sampah' | 'Infrastruktur', desc: string, loc: string) => {
    setLaporCategory(category);
    setLaporDescription(desc);
    setLaporLocationName(loc);
    
    // Trigger submission
    const lprId = `LPR-${Math.floor(100 + Math.random() * 899)}`;
    const newTicket: Ticket = {
      id: lprId,
      title: `Aduan ${category}: ${desc.substring(0, 20)}...`,
      location: loc,
      status: 'Terkirim',
      source: 'Laporan Warga',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      details: desc
    };
    setTickets(prev => [...prev, newTicket]);
    
    if (category === 'Sampah') {
      setPuddleReports(prev => [...prev, { id: lprId, x: 250, y: 240, status: 'Terkirim' }]);
    }

    setLaporSuccess(true);
    speak(`Laporan cepat terkirim. Nomor tiket Anda ${lprId}.`);
    setTimeout(() => {
      setLaporSuccess(false);
      setLaporDescription('');
    }, 4000);
  };

  const generateVoiceDirections = () => {
    const fromLabel = transitFrom === 'tugu' ? 'Tugu Yogyakarta' : 'Kawasan Malioboro';
    const toLabel = transitTo === 'kraton' ? 'Kraton Yogyakarta' : 'Malioboro';
    const desc = `Panduan Navigasi Suara: Jalur pedestrian dari ${fromLabel} menuju ${toLabel} aman. Jalur ini ramah disabilitas, bebas tangga, terpasang ubin taktil kuning, serta dilengkapi lampu lalu lintas V2X Adaptive Green Light. Jarak tempuh satu koma dua kilometer.`;
    setVoiceDirections(desc);
    speak(desc);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    speak("Keluar sukses.");
  };

  // Helper properties to pass down to layouts
  const sharedProps = {
    isLoggedIn,
    setIsLoggedIn,
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    onLoginSubmit: handleLoginSubmit,
    onGuestLogin: () => handleLoginSubmit(),
    onLogout: handleLogout,
    
    theme,
    setTheme,
    fontSize,
    setFontSize,
    uiMode,
    setUiMode: handleUiModeSelect,
    voiceEnabled,
    setVoiceEnabled: handleVoiceToggle,
    showAccessDropdown,
    setShowAccessDropdown,
    timeStr,

    v2xActive,
    v2xTimeRemaining,
    triggerV2X,
    grateStatus,
    setGrateStatus,
    tickets,
    setTickets,
    vehicles,
    setVehicles,
    drainageNodes,
    setDrainageNodes,
    puddleReports,
    setPuddleReports,
    activeRoute,
    setActiveRoute,
    triggerPuddleStatus,

    transitFrom,
    setTransitFrom,
    transitTo,
    setTransitTo,
    transitMode,
    setTransitMode,
    transitPriorityDisabled,
    setTransitPriorityDisabled,
    onBookTransit: handleBookTransitSubmit,
    generateVoiceDirections,
    voiceDirections,

    selectedClinic,
    setSelectedClinic,
    selectedRoom,
    setSelectedRoom,
    bookingDate,
    setBookingDate,
    onBookHealth: handleBookHealthSubmit,

    sampahCategory,
    setSampahCategory,
    sampahWeight,
    setSampahWeight,
    onRecyclePickupSubmit: handleRecyclePickupSubmit,
    sampahBalance,
    setSampahBalance,
    pickupHistory,
    waterFlow,
    grateWeight,
    cctvEventShow,
    setCctvEventShow,
    triggerSmartGrateOffender,

    laporCategory,
    setLaporCategory,
    laporDescription,
    setLaporDescription,
    laporLocationName,
    setLaporLocationName,
    laporImageMock,
    setLaporImageMock,
    laporSuccess,
    onReportSubmit: handleReportSubmit,
    onLansiaQuickReport: handleLansiaQuickReport,
    dashcamImage,
    detectedItem,
  };


  // -------------------- RENDER LOGIC --------------------
  if (isMobileScreen) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        <MobileApp {...sharedProps} />
      </div>
    );
  }

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        width: '100%', 
        background: 'radial-gradient(circle at center, #2e303f 0%, #0c0d10 100%)', 
        padding: '24px',
        boxSizing: 'border-box'
      }}
    >
      {/* Smartphone Mockup Frame */}
      <div 
        style={{
          width: '410px',
          height: '840px',
          borderRadius: '36px',
          border: '12px solid #20232d',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
          background: 'var(--bg-primary)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Speaker Bezel & Camera detail */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '24px',
          background: '#20232d',
          borderBottomLeftRadius: '14px',
          borderBottomRightRadius: '14px',
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '40px', height: '3px', background: '#495057', borderRadius: '2px' }} />
          <div style={{ width: '8px', height: '8px', background: '#171920', borderRadius: '50%', border: '1px solid #495057' }} />
        </div>
        
        {/* Inner Mobile App Container */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <MobileApp {...sharedProps} />
        </div>
      </div>
    </div>
  );
}
