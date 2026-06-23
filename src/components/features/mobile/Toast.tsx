// Toast.tsx - Global Toast Notification System for JogjaOne Mobile App
'use client';
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

// ─── Single Toast Item Component ─────────────────────────────────────────────
const getFs = (size: number) => `calc(${size}px * var(--font-scale))`;

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const BG: Record<ToastType, string> = {
  success: 'linear-gradient(135deg, #137333 0%, #0F9D58 100%)',
  error:   'linear-gradient(135deg, #C5221F 0%, #EA4335 100%)',
  info:    'linear-gradient(135deg, #1557B0 0%, #1A73E8 100%)',
  warning: 'linear-gradient(135deg, #B06000 0%, #F9AB00 100%)',
};

interface ToastItemComponentProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastItemComponent: React.FC<ToastItemComponentProps> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 350);
    }, toast.duration ?? 3500);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: BG[toast.type],
        borderRadius: '16px',
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        color: 'white',
        width: '100%',
        boxSizing: 'border-box',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => {
        setVisible(false);
        setTimeout(() => onDismiss(toast.id), 350);
      }}
    >
      {/* Shimmer overlay */}
      <div style={{
        position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
        animation: 'shimmer-anim 2s linear infinite'
      }} />

      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {ICONS[toast.type]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: 'block', fontSize: getFs(11), fontWeight: 700, lineHeight: 1.3 }}>
          {toast.title}
        </strong>
        {toast.message && (
          <span style={{ display: 'block', fontSize: getFs(9.5), opacity: 0.9, marginTop: '2px', lineHeight: 1.4 }}>
            {toast.message}
          </span>
        )}
      </div>

      <button style={{
        background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
        width: '20px', height: '20px', borderRadius: '50%',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, padding: 0
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

// ─── Toast Provider ───────────────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `toast-${++idRef.current}`;
    setToasts(prev => [...prev.slice(-3), { id, type, title, message, duration }]);
  }, []);

  const showError   = useCallback((t: string, m?: string) => showToast('error',   t, m), [showToast]);
  const showSuccess = useCallback((t: string, m?: string) => showToast('success', t, m), [showToast]);
  const showInfo    = useCallback((t: string, m?: string) => showToast('info',    t, m), [showToast]);
  const showWarning = useCallback((t: string, m?: string) => showToast('warning', t, m), [showToast]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showInfo, showWarning }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'absolute',
        top: '64px',
        left: '12px',
        right: '12px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: toasts.length > 0 ? 'auto' : 'none'
      }}>
        {toasts.map(t => (
          <ToastItemComponent key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
