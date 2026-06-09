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
}

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
  uiMode
}: MobileHealthTabProps) {
  const [showAppointmentDrawer, setShowAppointmentDrawer] = useState(false);
  const [emergencyCallState, setEmergencyCallState] = useState<'idle' | 'countdown' | 'calling'>('idle');
  const [emergencyTimer, setEmergencyTimer] = useState(3);
  const [callDuration, setCallDuration] = useState(0);
  
  // Custom Booking selection states
  const [selectedSlot, setSelectedSlot] = useState('09:00 - 09:30');
  const [selectedDoctor, setSelectedDoctor] = useState('dr. Budi Santoso, Sp.PD');
  const [myQueue, setMyQueue] = useState<{ code: string; clinic: string; specialty: string; time: string; doctor: string; slot: string; date: string } | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Active call duration counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emergencyCallState === 'calling') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [emergencyCallState]);

  // Countdown timer for emergency call
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emergencyCallState === 'countdown') {
      if (emergencyTimer > 0) {
        timer = setTimeout(() => {
          setEmergencyTimer(prev => prev - 1);
          speak(String(emergencyTimer - 1));
        }, 1000);
      } else {
        setEmergencyCallState('calling');
        speak("Menghubungi Pusat Layanan Ambulans Darurat Seratus Sembilan Belas DIY.");
      }
    } else {
      setEmergencyTimer(3);
    }
    return () => clearTimeout(timer);
  }, [emergencyCallState, emergencyTimer]);

  const handleStartEmergency = () => {
    setEmergencyCallState('countdown');
    speak("Memulai panggilan darurat dalam tiga detik. Sentuh batalkan jika keliru.");
  };

  const handleCancelEmergency = () => {
    setEmergencyCallState('idle');
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
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* 1. Header Faskes Map */}
      <div style={{ flex: '0 0 170px', position: 'relative', borderBottom: '1px solid var(--border-color)' }}>
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
            onClick={handleStartEmergency}
            style={{
              background: '#ea4335',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '10px',
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
              background: '#1a73e8',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '10px',
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

      {/* 2. Health Info scroll section */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
        
        {/* RSUP Dr. Sardjito details */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '12px 14px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Kapasitas Pasien • 2.4 km
          </span>
          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px', marginBottom: '2px' }}>
            RSUP Dr. Sardjito
          </strong>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>
            Jl. Kesehatan No.1, Senayan, Sinduadi
          </span>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '6px 4px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-primary)' }}>15</strong>
              <span style={{ fontSize: '7px', color: 'var(--text-muted)' }}>Bed Tersedia</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '6px 4px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <strong style={{ display: 'block', fontSize: '12px', color: 'var(--accent-danger)' }}>4</strong>
              <span style={{ fontSize: '7px', color: 'var(--text-muted)' }}>Kapasitas ICU</span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '6px 4px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-primary)' }}>12m</strong>
              <span style={{ fontSize: '7px', color: 'var(--text-muted)' }}>Pk. Tunggu</span>
            </div>
          </div>
        </div>

        {/* My Queue (Antrean Saya) */}
        {myQueue && (
          <div 
            onClick={() => setShowTicketModal(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(26,115,232,0.12) 0%, rgba(26,115,232,0.2) 100%)',
              borderRadius: '12px',
              padding: '12px 14px',
              border: '1px solid var(--accent-blue)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '9px', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Antrean Saya
              </strong>
              <span style={{ fontSize: '8px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>Lihat Tiket QR ›</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--accent-blue)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(26,115,232,0.2)'
              }}>
                {myQueue.code}
              </div>
              <div>
                <strong style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'block' }}>
                  {myQueue.specialty}
                </strong>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>
                  {myQueue.doctor}
                </span>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  Slot: {myQueue.slot} • Tanggal: {myQueue.date}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Schedules */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
              Jadwal Dokter Hari Ini
            </strong>
            <span style={{ fontSize: '8px', color: 'var(--brand-crimson)', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => speak("Menampilkan seluruh jadwal dokter.")}>
              Lihat Semua
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: 'dr. Budi Santoso, Sp.PD', specialty: 'Penyakit Dalam', time: '08:00 - 12:00', avatar: '👨‍⚕️' },
              { name: 'dr. Siti Aminah, Sp.A', specialty: 'Anak', time: '13:00 - 16:00', avatar: '👩‍⚕️' }
            ].map((d, index) => (
              <div key={index} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px' }}>{d.avatar}</span>
                  <div>
                    <strong style={{ fontSize: '10px', color: 'var(--text-primary)', display: 'block' }}>{d.name}</strong>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{d.specialty}</span>
                  </div>
                </div>
                <span style={{ fontSize: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ClockIcon /> {d.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearest Facilities */}
        <div>
          <strong style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
            Fasilitas Terdekat
          </strong>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: 'Klinik Pratama Sehat', dist: '0.5 km', hours: 'Buka hingga 21:00' },
              { name: 'Puskesmas Depok I', dist: '1.2 km', hours: 'Buka 24 Jam' }
            ].map((f, index) => (
              <div key={index} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px' }}>🏥</span>
                  <div>
                    <strong style={{ fontSize: '10px', color: 'var(--text-primary)', display: 'block' }}>{f.name}</strong>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{f.dist}</span>
                  </div>
                </div>
                <span style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>
                  {f.hours}
                </span>
              </div>
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
              gap: '14px'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: 'var(--border-color)', borderRadius: '2px', alignSelf: 'center', cursor: 'pointer' }} onClick={() => setShowAppointmentDrawer(false)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--accent-blue)' }}>📅 Pendaftaran Poli Klinik</strong>
              <button onClick={() => setShowAppointmentDrawer(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div>
              <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pilih Spesialisasi Poli:</label>
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
                style={{ padding: '8px', fontSize: '11px' }}
              >
                <option value="Umum">Poli Penyakit Dalam (Dalam Negeri)</option>
                <option value="Gigi">Poli Gigi & Mulut</option>
                <option value="Anak">Poli Spesialis Anak</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pilih Dokter:</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="modern-input"
                style={{ padding: '8px', fontSize: '11px' }}
              >
                {selectedRoom === 'Umum' && <option value="dr. Budi Santoso, Sp.PD">dr. Budi Santoso, Sp.PD (Rating: 4.8)</option>}
                {selectedRoom === 'Gigi' && <option value="dr. Siti Aminah, Sp.A">dr. Siti Aminah, Sp.A (Rating: 4.9)</option>}
                {selectedRoom === 'Anak' && <option value="dr. Hendra Wijaya, Sp.PD">dr. Hendra Wijaya, Sp.A (Rating: 4.7)</option>}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Pilih Sesi Jam (Slot):</label>
              <select 
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="modern-input"
                style={{ padding: '8px', fontSize: '11px' }}
              >
                <option value="08:30 - 09:00">08:30 - 09:00 (Tersedia)</option>
                <option value="10:00 - 10:30">10:00 - 10:30 (Tersedia)</option>
                <option value="11:30 - 12:00">11:30 - 12:00 (Sisa 1)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tanggal Periksa:</label>
              <input 
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="modern-input"
                style={{ padding: '8px', fontSize: '11px' }}
              />
            </div>

            <button
              onClick={handleAppointmentSubmit}
              className="btn-premium"
              style={{
                background: 'var(--accent-blue)',
                padding: '10px',
                fontSize: '11px',
                boxShadow: '0 2px 6px rgba(26,115,232,0.2)',
                marginTop: '6px'
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
          background: '#ea4335',
          color: 'white',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          {emergencyCallState === 'countdown' ? (
            <>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                PANGGILAN DARURAT
              </div>
              <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '60px' }}>
                Menghubungi Ambulans 119 Yogyakarta...
              </div>

              {/* Countdown circle */}
              <div style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '4px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '52px',
                fontWeight: 'bold',
                marginBottom: '80px',
                animation: 'pulse-ring 1s infinite'
              }}>
                {emergencyTimer}
              </div>

              <button
                onClick={handleCancelEmergency}
                style={{
                  background: 'var(--bg-secondary)',
                  color: '#ea4335',
                  border: 'none',
                  padding: '12px 40px',
                  borderRadius: '30px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                Batalkan
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '6px', letterSpacing: '-0.3px' }}>
                AMBULANS DARURAT 119
              </div>
              <div style={{ fontSize: '11px', color: '#ffcdd2', fontWeight: 'bold', marginBottom: '60px' }}>
                SEDANG BERLANGSUNG ({formatDuration(callDuration)})
              </div>

              {/* Animated Waveform Bars */}
              <div style={{ display: 'flex', gap: '8px', height: '60px', alignItems: 'center', marginBottom: '80px' }}>
                {[
                  { delay: '0.1s', height: '40px' },
                  { delay: '0.4s', height: '60px' },
                  { delay: '0.2s', height: '30px' },
                  { delay: '0.6s', height: '50px' },
                  { delay: '0.3s', height: '40px' },
                  { delay: '0.5s', height: '20px' }
                ].map((bar, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      width: '6px',
                      height: bar.height,
                      background: 'white',
                      borderRadius: '3px',
                      animation: `pulse 1.2s infinite ${bar.delay} ease-in-out`
                    }}
                  />
                ))}
              </div>

              {/* End Call Button */}
              <button
                onClick={() => {
                  setEmergencyCallState('idle');
                  speak("Panggilan darurat selesai.");
                }}
                style={{
                  background: '#37474f',
                  color: 'white',
                  border: 'none',
                  padding: '12px 40px',
                  borderRadius: '30px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📞 Akhiri Panggilan
              </button>
            </>
          )}
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
            <span style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Tiket Check-in Faskes
            </span>
            <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', letterSpacing: '-0.3px' }}>
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

            <div style={{ textAlign: 'left', fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Nomor Antrean:</span> <strong style={{ color: 'var(--accent-blue)', fontSize: '11px' }}>{myQueue.code}</strong></div>
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
                  fontSize: '10px',
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
                  fontSize: '10px',
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

    </div>
  );
}
