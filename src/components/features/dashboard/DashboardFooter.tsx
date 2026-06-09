// DashboardFooter.tsx - Unified web portal footer
import React from 'react';

export default function DashboardFooter() {
  return (
    <footer 
      style={{ 
        height: '40px', 
        background: 'var(--bg-secondary)', 
        borderTop: '1px solid var(--border-color)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '11px', 
        color: 'var(--text-muted)',
        flexShrink: 0
      }}
    >
      🇮🇩 Portal Jogja Punya Kita © 2026. Hak Cipta Dilindungi Undang-Undang. Pemerintah Provinsi Daerah Istimewa Yogyakarta.
    </footer>
  );
}
