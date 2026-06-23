// MobileHealthTab.tsx - Health (Kesehatan) view for JogjaOne Mobile App
import React, { useState, useEffect } from 'react';
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

interface MobileHealthTabProps {
  vehicles: Vehicle[];
  drainageNodes: MapNode[];
  puddleReports: Array<{ id: string; x: number; y: number; status: string }>;
  activeRoute: string[];
  selectedClinic: string;
  setSelectedClinic: (val: string) => void;
  selectedRoom: string;
  setSelectedRoom: (val: string) => void;
  bookingDate: string;
  setBookingDate: (val: string) => void;
  onBookHealth: () => void;
  uiMode: 'default' | 'lansia' | 'disabilitas';
  onNavigate?: (tab: 'home' | 'mobilitas' | 'lingkungan' | 'kesehatan' | 'lapor' | 'layanan') => void;
  onDrawerStateChange?: (isOpen: boolean) => void;
}

const getFs = (size: number) => `calc(${size}px * var(--font-scale))`;

// ----------------- SVG Icons Helper collection -----------------
const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function MobileHealthTab({
  vehicles,
  drainageNodes,
  puddleReports,
  activeRoute,
  selectedClinic,
  setSelectedClinic,
  selectedRoom,
  setSelectedRoom,
  bookingDate,
  setBookingDate,
  onBookHealth,
  uiMode,
  onNavigate,
  onDrawerStateChange
}: MobileHealthTabProps) {
  const [showAppointmentDrawer, setShowAppointmentDrawer] = useState(false);
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [callingService, setCallingService] = useState<{ name: string; number: string; icon: string } | null>(null);
  const [emergencyCallState, setEmergencyCallState] = useState<'idle' | 'countdown' | 'calling'>('idle');
  const [emergencyTimer, setEmergencyTimer] = useState(3);
  const [callDuration, setCallDuration] = useState(0);
  
  // Custom Booking selection states
  const [selectedSlot, setSelectedSlot] = useState('09:00 - 09:30');
  const [selectedDoctor, setSelectedDoctor] = useState('dr. Budi Santoso, Sp.PD');
  const [myQueue, setMyQueue] = useState<{ code: string; clinic: string; specialty: string; time: string; doctor: string; slot: string; date: string } | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Current Serving Queue state for Pelacakan Progress
  const [currentServing, setCurrentServing] = useState(1);

  // Notify parent about drawers or overlay state
  useEffect(() => {
    onDrawerStateChange?.(showAppointmentDrawer || showAllDoctors || emergencyCallState !== 'idle');
  }, [showAppointmentDrawer, showAllDoctors, emergencyCallState, onDrawerStateChange]);

  // Active call duration counter
  useEffect(() => {
    if (emergencyCallState !== 'calling') return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [emergencyCallState]);

  // Countdown timer for emergency call
  useEffect(() => {
    if (emergencyCallState !== 'countdown') return;
    
    if (emergencyTimer > 0) {
      const timer = setTimeout(() => {
        setEmergencyTimer(prev => {
          const next = prev - 1;
          if (next === 0) {
            setEmergencyCallState('calling');
            const name = callingService?.name || "Ambulans Darurat 119";
            speak(`Menghubungi ${name}.`);
          } else {
            speak(String(next));
          }
          return next;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emergencyCallState, emergencyTimer, callingService]);

  const handleStartEmergency = (service = { name: 'Ambulans Darurat', number: '119', icon: '🚨' }) => {
    setCallingService(service);
    setEmergencyCallState('countdown');
    setEmergencyTimer(3);
    setCallDuration(0);
    speak(`Memulai panggilan darurat ke ${service.name} dalam tiga detik. Sentuh batalkan jika keliru.`);
  };

  const handleCancelEmergency = () => {
    setEmergencyCallState('idle');
    setCallingService(null);
    setEmergencyTimer(3);
    speak("Panggilan darurat dibatalkan.");
  };

  const handleAppointmentSubmit = () => {
    onBookHealth();
    const clinicLabel = selectedClinic === 'puskesmas1' ? 'RSUP Dr. Sardjito' : selectedClinic === 'puskesmas2' ? 'Puskesmas Jetis' : 'RSUD Kota Yogyakarta';
    setMyQueue({
      code: `B4`,
      clinic: clinicLabel,
      specialty: selectedRoom === 'Umum' ? 'Poli Penyakit Dalam' : selectedRoom === 'Gigi' ? 'Poli Gigi' : 'Poli Anak',
      time: '09:45 WIB',
      doctor: selectedDoctor,
      slot: selectedSlot,
      date: bookingDate
    });
    setCurrentServing(1); // Reset serving queue tracker to start from B1
    setShowAppointmentDrawer(false);
    setShowTicketModal(true);
    speak("Nomor antrean berhasil diterbitkan. Silakan simpan tiket check-in QR Anda.");
  };

  const formatDuration = (sec: number) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min < 10 ? '0' : ''}${min}:${s < 10 ? '0' : ''}${s}`;
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
          background: 'linear-gradient(180deg, #1A73E8 0%, #1557B0 100%)',
          padding: 'calc(20px * var(--font-scale)) calc(16px * var(--font-scale))',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 15px rgba(26,115,232,0.12)'
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
            Kesehatan
          </h2>
          <span style={{ fontSize: getFs(11), color: 'rgba(255,255,255,0.85)', display: 'block', marginTop: '2px' }}>
            Layanan kesehatan cerdas Yogyakarta
          </span>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px', boxSizing: 'border-box' }}>
        
        {/* Peta Faskes Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          border: '1px solid #E0E0E0',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: getFs(10), fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              PETA FASILITAS KESEHATAN
            </strong>
          </div>
          
          <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E0E0E0', position: 'relative' }}>
            <InteractiveMap
              mode={uiMode}
              vehicles={vehicles}
              drainageNodes={drainageNodes}
              puddleReports={puddleReports}
              activeRoute={activeRoute}
              selectedNodeId="puskesmas1"
            />
            
            {/* Floating Actions overlay */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              zIndex: 10
            }}>
              {/* Emergency 119 button */}
              <button
                onClick={() => handleStartEmergency()}
                style={{
                  background: '#ea4335',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: getFs(10),
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(234,67,53,0.3)'
                }}
              >
                <PhoneIcon /> Darurat 119
              </button>

              {/* Appointment button */}
              <button
                onClick={() => {
                  setShowAppointmentDrawer(true);
                  speak("Membuka form pendaftaran antrean faskes.");
                }}
                style={{
                  background: '#1A73E8',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: getFs(10),
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(26,115,232,0.2)'
                }}
              >
                <CalendarIcon /> Buat Janji
              </button>
            </div>
          </div>
        </div>

        {/* Selected Clinic Details */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '14px', border: '1px solid #E0E0E0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Kapasitas Pasien • 2.4 km
          </span>
          <strong style={{ display: 'block', fontSize: getFs(14), color: 'var(--text-primary)', marginTop: '2px', marginBottom: '2px', fontWeight: '800' }}>
            {selectedClinic === 'puskesmas1' ? 'RSUP Dr. Sardjito' : selectedClinic === 'puskesmas2' ? 'Puskesmas Jetis' : 'RSUD Kota Yogyakarta'}
          </strong>
          <span style={{ fontSize: getFs(10), color: 'var(--text-muted)', display: 'block' }}>
            {selectedClinic === 'puskesmas1' ? 'Jl. Kesehatan No.1, Senayan, Sinduadi' : selectedClinic === 'puskesmas2' ? 'Jl. P. Mangkubumi No.24, Jetis' : 'Jl. Wirosaban No.1, Sorosutan'}
          </span>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
            <div style={{ background: '#F4F6F9', borderRadius: '10px', padding: '8px 4px', textAlign: 'center', border: '1px solid #E0E0E0' }}>
              <strong style={{ display: 'block', fontSize: getFs(13), color: 'var(--text-primary)', fontWeight: '800' }}>15</strong>
              <span style={{ fontSize: getFs(8), color: 'var(--text-muted)' }}>Bed Tersedia</span>
            </div>
            <div style={{ background: '#FDF2F2', borderRadius: '10px', padding: '8px 4px', textAlign: 'center', border: '1px solid #FDE8E8' }}>
              <strong style={{ display: 'block', fontSize: getFs(13), color: '#DE3737', fontWeight: '800' }}>4</strong>
              <span style={{ fontSize: getFs(8), color: '#DE3737' }}>Kapasitas ICU</span>
            </div>
            <div style={{ background: '#F4F6F9', borderRadius: '10px', padding: '8px 4px', textAlign: 'center', border: '1px solid #E0E0E0' }}>
              <strong style={{ display: 'block', fontSize: getFs(13), color: 'var(--text-primary)', fontWeight: '800' }}>12m</strong>
              <span style={{ fontSize: getFs(8), color: 'var(--text-muted)' }}>Pk. Tunggu</span>
            </div>
          </div>
        </div>

        {/* Dynamic Stepper Queue Tracker */}
        {myQueue && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E0E0E0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: getFs(10), color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Pelacakan Progress Antrean
              </strong>
              <span style={{ fontSize: getFs(9), background: '#E8F0FE', color: '#1A73E8', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                Nomor Anda: {myQueue.code}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F4F6F9', borderRadius: '10px', padding: '10px', border: '1px solid #E0E0E0' }}>
              <div>
                <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', display: 'block' }}>Nomor Saat Ini Dipanggil:</span>
                <strong style={{ fontSize: getFs(22), color: '#137333', fontWeight: 800 }}>B{currentServing}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', display: 'block' }}>Status Pelayanan:</span>
                <strong style={{ fontSize: getFs(11), color: currentServing >= 4 ? '#137333' : '#B06000' }}>
                  {currentServing === 4 ? 'Giliran Anda!' : currentServing > 4 ? 'Selesai Pelayanan' : `Menunggu ${4 - currentServing} Antrean Lagi`}
                </strong>
              </div>
            </div>

            {/* Stepper Progress Visual */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', margin: '15px 0 5px 0', padding: '0 10px' }}>
              <div style={{ position: 'absolute', top: '50%', left: '10px', right: '10px', height: '3px', background: '#E0E0E0', zIndex: 1, transform: 'translateY(-50%)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '10px', width: `${Math.max(0, Math.min(100, ((currentServing - 1) / 3) * 100))}%`, height: '3px', background: '#1A73E8', zIndex: 1, transform: 'translateY(-50%)' }} />
              
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: currentServing >= 1 ? '#1A73E8' : '#E0E0E0', border: '2px solid white', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: getFs(8), fontWeight: 'bold' }}>B1</div>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: currentServing >= 2 ? '#1A73E8' : '#E0E0E0', border: '2px solid white', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: getFs(8), fontWeight: 'bold' }}>B2</div>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: currentServing >= 3 ? '#1A73E8' : '#E0E0E0', border: '2px solid white', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: getFs(8), fontWeight: 'bold' }}>B3</div>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: currentServing >= 4 ? '#137333' : '#E0E0E0', border: '2px solid white', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: getFs(8), fontWeight: 'bold' }}>B4</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: getFs(8), color: 'var(--text-muted)', padding: '0 4px' }}>
              <span>B1 (Dipanggil)</span>
              <span>B2 (Verifikasi)</span>
              <span>B3 (Poli)</span>
              <span>B4 (Anda)</span>
            </div>

            {/* Stepper progress controller */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={() => {
                  if (currentServing < 4) {
                    const next = currentServing + 1;
                    setCurrentServing(next);
                    if (next === 4) {
                      speak("Panggilan untuk nomor antrean B4. Silakan masuk ke Ruang Poli Pemeriksaan.", true);
                    } else {
                      speak(`Nomor antrean B${next} dipanggil.`, true);
                    }
                  } else if (currentServing === 4) {
                    setCurrentServing(5);
                    speak("Pemeriksaan selesai. Semoga lekas sembuh.", true);
                  } else {
                    setCurrentServing(1);
                    speak("Simulasi diulang dari nomor B1.", true);
                  }
                }}
                style={{
                  flex: 1,
                  background: '#F0F4F9',
                  border: '1px solid #1A73E8',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  fontSize: getFs(9),
                  fontWeight: 'bold',
                  color: '#1A73E8',
                  cursor: 'pointer'
                }}
              >
                ⚙️ {currentServing === 4 ? 'Selesaikan Pemeriksaan' : currentServing > 4 ? 'Reset Simulasi' : 'Panggil Antrean Berikutnya'}
              </button>
              
              <button
                onClick={() => setShowTicketModal(true)}
                style={{
                  flex: 1,
                  background: '#1A73E8',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  fontSize: getFs(9),
                  fontWeight: 'bold',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(26,115,232,0.2)'
                }}
              >
                🎫 Lihat Tiket QR
              </button>
            </div>
          </div>
        )}

        {/* Doctor Schedules */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: getFs(12), color: 'var(--text-primary)', fontWeight: '700' }}>
              Jadwal Dokter Hari Ini
            </strong>
            <span 
              style={{ fontSize: getFs(9), color: '#1A73E8', fontWeight: 'bold', cursor: 'pointer' }} 
              onClick={() => {
                setShowAllDoctors(true);
                speak("Menampilkan seluruh jadwal dokter.");
              }}
            >
              Lihat Semua
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: 'dr. Budi Santoso, Sp.PD', specialty: 'Penyakit Dalam', time: '08:00 - 12:00', avatar: '👨‍⚕️' },
              { name: 'dr. Siti Aminah, Sp.A', specialty: 'Anak', time: '13:00 - 16:00', avatar: '👩‍⚕️' }
            ].map((d, index) => (
              <div key={index} style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: getFs(18) }}>{d.avatar}</span>
                  <div>
                    <strong style={{ fontSize: getFs(11), color: 'var(--text-primary)', display: 'block', fontWeight: '600' }}>{d.name}</strong>
                    <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>{d.specialty}</span>
                  </div>
                </div>
                <span style={{ fontSize: getFs(9), background: '#F4F6F9', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #E0E0E0' }}>
                  <ClockIcon /> {d.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearest Facilities */}
        <div>
          <strong style={{ fontSize: getFs(12), color: 'var(--text-primary)', display: 'block', marginBottom: '8px', fontWeight: '700' }}>
            Fasilitas Terdekat
          </strong>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: 'Klinik Pratama Sehat', dist: '0.5 km', hours: 'Buka hingga 21:00' },
              { name: 'Puskesmas Depok I', dist: '1.2 km', hours: 'Buka 24 Jam' }
            ].map((f, index) => (
              <div key={index} style={{ background: 'white', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: getFs(16) }}>🏥</span>
                  <div>
                    <strong style={{ fontSize: getFs(11), color: 'var(--text-primary)', display: 'block', fontWeight: '600' }}>{f.name}</strong>
                    <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>{f.dist}</span>
                  </div>
                </div>
                <span style={{ fontSize: getFs(9), color: 'var(--text-secondary)' }}>
                  {f.hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts — always visible & clickable */}
        <div>
          <strong style={{ fontSize: getFs(12), color: 'var(--text-primary)', display: 'block', marginBottom: '8px', fontWeight: '700' }}>
            📞 Kontak Darurat
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: 'Ambulans Darurat', number: '119', icon: '🚨', color: '#ea4335', bg: '#FCE8E6', service: { name: 'Ambulans Darurat 119', number: '119', icon: '🚨' } },
              { name: 'Kepolisian', number: '110', icon: '👮', color: '#1A73E8', bg: '#E8F0FE', service: { name: 'Kepolisian', number: '110', icon: '👮' } },
              { name: 'Pemadam Kebakaran', number: '113', icon: '🚒', color: '#B06000', bg: '#FEF7E0', service: { name: 'Pemadam Kebakaran', number: '113', icon: '🚒' } },
            ].map((em, idx) => (
              <button
                key={idx}
                onClick={() => handleStartEmergency(em.service)}
                style={{
                  background: em.bg,
                  border: `1.5px solid ${em.color}22`,
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: getFs(18) }}>{em.icon}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: getFs(11), color: em.color }}>{em.name}</strong>
                    <span style={{ fontSize: getFs(9), color: 'var(--text-muted)' }}>Tekan untuk memanggil • {em.number}</span>
                  </div>
                </div>
                <span style={{
                  background: em.color,
                  color: 'white',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: getFs(9),
                  fontWeight: 'bold'
                }}>
                  {em.number}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Appointment Booking Drawer Overlay */}
      {showAppointmentDrawer && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
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
              gap: '14px',
              boxSizing: 'border-box',
              maxHeight: '85%',
              overflowY: 'auto',
              paddingBottom: '80px'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', alignSelf: 'center', cursor: 'pointer' }} onClick={() => setShowAppointmentDrawer(false)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: getFs(13), color: 'var(--accent-blue)' }}>📅 Pendaftaran Poli Klinik</strong>
              <button onClick={() => setShowAppointmentDrawer(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: getFs(16), cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* CLINIC SELECTION DROPDOWN */}
            <div>
              <label style={{ fontSize: getFs(9), fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pilih Rumah Sakit / Klinik:</label>
              <select 
                value={selectedClinic} 
                onChange={(e) => {
                  setSelectedClinic(e.target.value);
                  speak(`Rumah Sakit dipilih: ${e.target.value === 'puskesmas1' ? 'RSUP Dr. Sardjito' : e.target.value === 'puskesmas2' ? 'Puskesmas Jetis' : 'RSUD Kota Yogyakarta'}`);
                }} 
                className="modern-input" 
                style={{ padding: '8px', fontSize: getFs(11) }}
              >
                <option value="puskesmas1">RSUP Dr. Sardjito</option>
                <option value="puskesmas2">Puskesmas Jetis</option>
                <option value="puskesmas3">RSUD Kota Yogyakarta</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: getFs(9), fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pilih Spesialisasi Poli:</label>
              <select 
                value={selectedRoom} 
                onChange={(e) => {
                  setSelectedRoom(e.target.value);
                  if (e.target.value === 'Umum') {
                    setSelectedDoctor('dr. Budi Santoso, Sp.PD');
                  } else if (e.target.value === 'Gigi') {
                    setSelectedDoctor('dr. Siti Aminah, Sp.A');
                  } else {
                    setSelectedDoctor('dr. Hendra Wijaya, Sp.PD');
                  }
                }} 
                className="modern-input" 
                style={{ padding: '8px', fontSize: getFs(11) }}
              >
                <option value="Umum">Poli Penyakit Dalam</option>
                <option value="Gigi">Poli Gigi & Mulut</option>
                <option value="Anak">Poli Spesialis Anak</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: getFs(9), fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pilih Dokter:</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="modern-input"
                style={{ padding: '8px', fontSize: getFs(11) }}
              >
                {selectedRoom === 'Umum' && <option value="dr. Budi Santoso, Sp.PD">dr. Budi Santoso, Sp.PD (Rating: 4.8)</option>}
                {selectedRoom === 'Gigi' && <option value="dr. Siti Aminah, Sp.A">dr. Siti Aminah, Sp.A (Rating: 4.9)</option>}
                {selectedRoom === 'Anak' && <option value="dr. Hendra Wijaya, Sp.PD">dr. Hendra Wijaya, Sp.A (Rating: 4.7)</option>}
              </select>
            </div>

            <div>
              <label style={{ fontSize: getFs(9), fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pilih Sesi Jam (Slot):</label>
              <select 
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="modern-input"
                style={{ padding: '8px', fontSize: getFs(11) }}
              >
                <option value="08:30 - 09:00">08:30 - 09:00 (Tersedia)</option>
                <option value="10:00 - 10:30">10:00 - 10:30 (Tersedia)</option>
                <option value="11:30 - 12:00">11:30 - 12:00 (Sisa 1)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: getFs(9), fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tanggal Periksa:</label>
              <input 
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="modern-input"
                style={{ padding: '8px', fontSize: getFs(11) }}
              />
            </div>

            <button
              onClick={handleAppointmentSubmit}
              className="btn-premium"
              style={{
                background: 'var(--accent-blue)',
                padding: '10px',
                fontSize: getFs(11),
                boxShadow: '0 2px 6px rgba(26,115,232,0.2)',
                marginTop: '6px',
                width: '100%'
              }}
            >
              Konfirmasi & Ambil Nomor Antrean
            </button>
          </div>
        </div>
      )}

      {/* 4. Fullscreen Emergency dialer Simulation */}
      {emergencyCallState !== 'idle' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: callingService?.number === '110' 
            ? 'linear-gradient(180deg, #1557B0 0%, #0D3C80 100%)' 
            : 'linear-gradient(180deg, #D50000 0%, #9A0007 100%)',
          color: 'white',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          padding: '24px',
          overflowY: 'auto'
        }}>
          {/* Header block with Back button */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginTop: '12px', marginBottom: '40px' }}>
            <div 
              onClick={handleCancelEmergency}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <BackIcon />
              <span style={{ fontSize: getFs(12), fontWeight: 600 }}>Kembali</span>
            </div>
          </div>

          {/* Central circle with phone and 119 */}
          <div style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            border: '4px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            position: 'relative'
          }}>
            <span style={{ fontSize: getFs(36) }}>{callingService?.icon || '🚨'}</span>
            <strong style={{ fontSize: getFs(18), fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
              {callingService?.number || '119'}
            </strong>

            {emergencyCallState === 'countdown' && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#FBBC05',
                color: 'black',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: getFs(13),
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                border: '2px solid white'
              }}>
                {emergencyTimer}
              </div>
            )}
          </div>

          <h2 style={{ fontSize: getFs(24), fontWeight: '800', margin: 0, color: 'white', letterSpacing: '-0.5px', textAlign: 'center' }}>
            {callingService?.name || 'Darurat 119'}
          </h2>
          <span style={{ fontSize: getFs(11), color: 'rgba(255,255,255,0.85)', display: 'block', marginTop: '4px', marginBottom: '32px', textAlign: 'center' }}>
            {emergencyCallState === 'countdown' ? `Memulai panggilan dalam ${emergencyTimer} detik...` : 'Menghubungi...'}
          </span>

          {/* Action button */}
          {emergencyCallState === 'countdown' ? (
            <button
              onClick={() => {
                setEmergencyCallState('calling');
                const name = callingService?.name || "Ambulans 119";
                speak(`Menghubungi ${name}.`);
              }}
              style={{
                width: '100%',
                background: 'white',
                color: callingService?.number === '110' ? '#1557B0' : '#D50000',
                border: 'none',
                padding: '14px',
                borderRadius: '24px',
                fontSize: getFs(13),
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '4px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🚨 Hubungi Sekarang (Lewati {emergencyTimer}s)
            </button>
          ) : (
            <button
              onClick={handleCancelEmergency}
              style={{
                width: '100%',
                background: 'white',
                color: '#D50000',
                border: 'none',
                padding: '14px',
                borderRadius: '24px',
                fontSize: getFs(13),
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '4px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Akhiri Panggilan ({formatDuration(callDuration)})
            </button>
          )}

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px', marginBottom: '12px' }}>
            {/* Sardjito Card */}
            <div 
              onClick={() => handleStartEmergency({ name: 'Ambulans RSUP Sardjito', number: '(0274) 587333', icon: '🚑' })}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: getFs(18) }}>🚑</span>
                <div>
                  <strong style={{ display: 'block', fontSize: getFs(11), color: 'white' }}>Ambulans RSUP Sardjito</strong>
                  <span style={{ fontSize: getFs(9), color: 'rgba(255,255,255,0.7)' }}>(0274) 587333</span>
                </div>
              </div>
              <span style={{ fontSize: getFs(14) }}>📞</span>
            </div>

            {/* Damkar Card */}
            <div 
              onClick={() => handleStartEmergency({ name: 'Pemadam Kebakaran', number: '113', icon: '🚒' })}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: getFs(18) }}>🚒</span>
                <div>
                  <strong style={{ display: 'block', fontSize: getFs(11), color: 'white' }}>Pemadam Kebakaran</strong>
                  <span style={{ fontSize: getFs(9), color: 'rgba(255,255,255,0.7)' }}>113</span>
                </div>
              </div>
              <span style={{ fontSize: getFs(14) }}>📞</span>
            </div>

            {/* Police Card */}
            <div 
              onClick={() => handleStartEmergency({ name: 'Kepolisian', number: '110', icon: '👮' })}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: getFs(18) }}>👮</span>
                <div>
                  <strong style={{ display: 'block', fontSize: getFs(11), color: 'white' }}>Kepolisian</strong>
                  <span style={{ fontSize: getFs(9), color: 'rgba(255,255,255,0.7)' }}>110</span>
                </div>
              </div>
              <span style={{ fontSize: getFs(14) }}>📞</span>
            </div>
          </div>

        </div>
      )}

      {/* 5. PDF Check-in Ticket Overlay Modal */}
      {showTicketModal && myQueue && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 2100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div 
            className="animate-slide-up"
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '20px',
              width: '100%',
              maxWidth: '300px',
              border: '2px solid var(--accent-blue)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: getFs(8), color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Tiket Check-in Faskes
            </span>
            <strong style={{ fontSize: getFs(13), color: 'var(--text-primary)', display: 'block', letterSpacing: '-0.3px' }}>
              {myQueue.clinic}
            </strong>

            {/* Simulated QR Code Box */}
            <div style={{
              width: '110px',
              height: '110px',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              margin: '10px auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'var(--bg-tertiary)',
              padding: '6px',
              position: 'relative'
            }}>
              {/* Fake QR columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', width: '100%', height: '100%' }}>
                {Array(25).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    style={{
                      background: (i % 2 === 0 || i % 3 === 0) && i !== 12 ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                      borderRadius: '1px'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'left', fontSize: getFs(9), display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Nomor Antrean:</span> <strong style={{ color: 'var(--accent-blue)', fontSize: getFs(11) }}>{myQueue.code}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Dokter:</span> <strong>{myQueue.doctor}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Sesi:</span> <strong>{myQueue.slot}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Tanggal:</span> <strong>{myQueue.date}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
              <button
                onClick={() => {
                  speak("Tiket berhasil diunduh.");
                  setShowTicketModal(false);
                }}
                className="btn-premium"
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '20px',
                  fontSize: getFs(10),
                  background: 'var(--accent-blue)',
                  boxShadow: '0 4px 12px rgba(26, 115, 232, 0.2)'
                }}
              >
                Unduh PDF
              </button>
              <button
                onClick={() => setShowTicketModal(false)}
                style={{
                  flex: 1,
                  background: 'var(--bg-tertiary)',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '20px',
                  fontSize: getFs(10),
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Daftar Dokter "Lihat Semua" Drawer Overlay */}
      {showAllDoctors && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
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
              gap: '14px',
              boxSizing: 'border-box',
              maxHeight: '85%',
              overflowY: 'auto',
              paddingBottom: '80px'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', alignSelf: 'center', cursor: 'pointer' }} onClick={() => { setShowAllDoctors(false); }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: getFs(13), color: 'var(--accent-blue)' }}>👨‍⚕️ Daftar Dokter & Jadwal Praktek</strong>
              <button onClick={() => { setShowAllDoctors(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: getFs(16), cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              {[
                { name: 'dr. Budi Santoso, Sp.PD', specialty: 'Penyakit Dalam', clinicName: 'RSUD Kota Yogyakarta', clinicVal: 'puskesmas3', time: '08:00 - 12:00', avatar: '👨‍⚕️' },
                { name: 'dr. Siti Aminah, Sp.A', specialty: 'Anak', clinicName: 'Puskesmas Jetis', clinicVal: 'puskesmas2', time: '13:00 - 16:00', avatar: '👩‍⚕️' },
                { name: 'dr. Ahmad Hidayat, Sp.THT', specialty: 'THT', clinicName: 'RSUP Dr. Sardjito', clinicVal: 'puskesmas1', time: '09:00 - 13:00', avatar: '👨‍⚕️' },
                { name: 'dr. Rina Wijaya, Sp.GK', specialty: 'Gizi / Dietisien', clinicName: 'Puskesmas Jetis', clinicVal: 'puskesmas2', time: '10:00 - 14:00', avatar: '👩‍⚕️' },
                { name: 'dr. Hendra Kurniawan, Sp.JP', specialty: 'Jantung & Pembuluh', clinicName: 'RSUP Dr. Sardjito', clinicVal: 'puskesmas1', time: '14:00 - 18:00', avatar: '👨‍⚕️' },
                { name: 'dr. Dewi Lestari, Sp.KK', specialty: 'Kulit & Kelamin', clinicName: 'RSUD Kota Yogyakarta', clinicVal: 'puskesmas3', time: '08:00 - 11:00', avatar: '👩‍⚕️' }
              ].map((doc, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '16px', 
                    padding: '12px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.01)' 
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: getFs(22) }}>{doc.avatar}</span>
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ fontSize: getFs(11.5), color: 'var(--text-primary)', display: 'block', fontWeight: '600' }}>{doc.name}</strong>
                      <span style={{ fontSize: getFs(9.5), color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>{doc.specialty}</span>
                      <span style={{ fontSize: getFs(9), color: 'var(--text-muted)', display: 'block', marginTop: '1.5px' }}>📍 {doc.clinicName} • 🕒 {doc.time}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedDoctor(doc.name);
                      setSelectedClinic(doc.clinicVal);
                      setShowAllDoctors(false);
                      setShowAppointmentDrawer(true);
                      speak(`Membuka pendaftaran buat janji temu dengan ${doc.name}.`);
                    }}
                    style={{
                      background: 'var(--accent-blue)',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: getFs(9.5),
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(26,115,232,0.1)'
                    }}
                  >
                    Pilih
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
