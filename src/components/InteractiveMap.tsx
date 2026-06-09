// InteractiveMap.tsx - SVG Vector Map of Yogyakarta for Smart City Sim

import React from 'react';
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

interface InteractiveMapProps {
  mode: 'default' | 'lansia' | 'disabilitas';
  activeRoute?: string[];
  vehicles?: Vehicle[];
  drainageNodes?: MapNode[];
  selectedNodeId?: string;
  onNodeSelect?: (node: MapNode) => void;
  puddleReports?: Array<{ id: string; x: number; y: number; status: string }>;
}

export default function InteractiveMap({
  mode,
  activeRoute = [],
  vehicles = [],
  drainageNodes = [],
  selectedNodeId,
  onNodeSelect,
  puddleReports = []
}: InteractiveMapProps) {
  
  // Landmarks coordinates
  const nodes: MapNode[] = [
    { id: 'tugu', name: 'Tugu Yogyakarta', type: 'landmark', x: 250, y: 80, details: 'Monumen ikonik pusat Yogyakarta' },
    { id: 'stasiun', name: 'Stasiun Yogyakarta', type: 'landmark', x: 180, y: 160, details: 'Pusat integrasi kereta dan Trans Jogja' },
    { id: 'malioboro', name: 'Kawasan Malioboro', type: 'landmark', x: 250, y: 240, details: 'Pusat perbelanjaan dan jalur pedestrian' },
    { id: 'kraton', name: 'Kraton Yogyakarta', type: 'landmark', x: 250, y: 420, details: 'Istana Kesultanan Yogyakarta' },
    { id: 'puskesmas1', name: 'Puskesmas Gondokusuman', type: 'health', x: 380, y: 150, details: 'Kapasitas ICU: 2 Tersedia' },
    { id: 'puskesmas2', name: 'Puskesmas Jetis', type: 'health', x: 120, y: 120, details: 'Kapasitas ICU: 4 Tersedia' },
    { id: 'rs_jogja', name: 'RSUD Kota Yogyakarta', type: 'health', x: 380, y: 380, details: 'Kapasitas Kamar: 15 Tersedia' },
  ];

  // Combine static nodes with drainage nodes
  const allNodes = [...nodes, ...drainageNodes];

  const handleNodeHover = (node: MapNode) => {
    if (mode === 'disabilitas') {
      speak(`${node.name}. Tipe: ${node.type === 'health' ? 'Fasilitas Kesehatan' : node.type === 'grate' ? 'Sensor Drainase' : 'Tempat Penting'}. ${node.details || ''}`);
    }
  };

  const handleNodeClick = (node: MapNode) => {
    speak(`Memilih ${node.name}`);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  // Determine path coordinates if an active route is provided
  const getRoutePathD = () => {
    if (activeRoute.length < 2) return '';
    const points = activeRoute.map(nodeId => {
      const foundNode = allNodes.find(n => n.id === nodeId);
      return foundNode ? `${foundNode.x},${foundNode.y}` : null;
    }).filter(Boolean);
    
    if (points.length < 2) return '';
    return `M ${points.join(' L ')}`;
  };

  const highContrast = mode === 'disabilitas';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
      
      {/* Map Header details for screen readers */}
      <div className="sr-only">
        Peta Interaktif Yogyakarta. Berisi Tugu Yogyakarta di utara, Malioboro di tengah, Kraton di selatan. Puskesmas Gondokusuman di timur, dan Jetis di barat.
      </div>

      <svg 
        viewBox="0 0 500 500" 
        width="100%" 
        height="100%" 
        style={{ display: 'block' }}
      >
        {/* Grids for futuristic/smart city feel in default mode */}
        {!highContrast && (
          <defs>
            <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="var(--border-color)" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
        )}
        {!highContrast && <rect width="100%" height="100%" fill="url(#grid)" />}

        {/* Roads Outline */}
        <g stroke={highContrast ? '#ffffff' : '#ced4da'} strokeWidth={highContrast ? '12' : '8'} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Main Axis North-South (Tugu -> Malioboro -> Kraton) */}
          <line x1="250" y1="50" x2="250" y2="450" />
          
          {/* Sudirman - Diponegoro East-West axis (crosses Tugu) */}
          <line x1="50" y1="80" x2="450" y2="80" />
          
          {/* Stasiun feeder street */}
          <line x1="180" y1="160" x2="250" y2="160" />
          
          {/* Gondokusuman feeder street */}
          <line x1="250" y1="150" x2="380" y2="150" />
          
          {/* Jetis feeder street */}
          <line x1="120" y1="120" x2="120" y2="80" />
          
          {/* RSUD feeder street */}
          <line x1="250" y1="380" x2="380" y2="380" />
        </g>

        {/* Inner roads for visual flow */}
        {!highContrast && (
          <g stroke="var(--bg-secondary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <line x1="250" y1="50" x2="250" y2="450" />
            <line x1="50" y1="80" x2="450" y2="80" />
            <line x1="180" y1="160" x2="250" y2="160" />
            <line x1="250" y1="150" x2="380" y2="150" />
            <line x1="120" y1="120" x2="120" y2="80" />
            <line x1="250" y1="380" x2="380" y2="380" />
          </g>
        )}

        {/* Highlight Route Animation (Active Path) */}
        {activeRoute.length >= 2 && (
          <path
            d={getRoutePathD()}
            fill="none"
            stroke={highContrast ? '#ffff00' : 'var(--brand-crimson)'}
            strokeWidth={highContrast ? '8' : '5'}
            strokeLinecap="round"
            strokeDasharray="8 6"
            style={{ animation: 'dash-scroll 2s linear infinite' }}
          />
        )}

        {/* Puddle Reports Render */}
        {puddleReports.map((report) => (
          <g key={report.id} transform={`translate(${report.x}, ${report.y})`}>
            {/* Pulsing hazard ring */}
            <circle
              r="15"
              fill="none"
              stroke={report.status === 'Selesai' ? '#198754' : '#dc3545'}
              strokeWidth="2"
              style={{ animation: 'pulse-ring 1.8s infinite ease-out' }}
            />
            <circle
              r="6"
              fill={report.status === 'Selesai' ? '#198754' : '#dc3545'}
              onClick={() => speak(`Laporan genangan air di titik ini. Status: ${report.status}`)}
              style={{ cursor: 'pointer' }}
            />
          </g>
        ))}

        {/* Render Vehicles */}
        {vehicles.map((v) => {
          let color = 'var(--accent-blue)';
          if (v.type === 'bus') color = '#dc2626';
          if (v.type === 'delman') color = '#b45309';
          if (v.type === 'bajaj') color = '#eab308';
          if (v.type === 'bentor') color = '#06b6d4';
          
          if (highContrast) {
            color = '#ffff00';
          }

          return (
            <g 
              key={v.id} 
              transform={`translate(${v.x}, ${v.y})`}
              onClick={() => speak(`Kendaraan: ${v.name}, tipe ${v.type}, status ${v.status}`)}
              style={{ cursor: 'pointer' }}
            >
              {/* Vehicle Indicator */}
              <rect
                x="-8"
                y="-8"
                width="16"
                height="16"
                rx={v.type === 'bus' ? '2' : '8'}
                fill={color}
                stroke={highContrast ? '#ffffff' : 'var(--bg-secondary)'}
                strokeWidth="2"
              />
              <text
                y="-12"
                textAnchor="middle"
                fontSize="8px"
                fontWeight="bold"
                fill={highContrast ? '#ffffff' : 'var(--text-primary)'}
                style={{ pointerEvents: 'none', paintOrder: 'stroke', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
              >
                {v.name}
              </text>
            </g>
          );
        })}

        {/* Render Map Nodes */}
        {allNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          
          // Style configuration based on type and mode
          let fill = 'var(--bg-secondary)';
          let stroke = 'var(--text-primary)';
          let size = isSelected ? 12 : 8;

          if (node.type === 'landmark') {
            fill = highContrast ? '#000000' : 'var(--brand-crimson)';
            stroke = highContrast ? '#ffffff' : 'var(--bg-secondary)';
            size = isSelected ? 14 : 10;
          } else if (node.type === 'health') {
            fill = highContrast ? '#00ffff' : '#198754';
            stroke = highContrast ? '#ffffff' : 'var(--bg-secondary)';
            size = isSelected ? 13 : 9;
          } else if (node.type === 'grate') {
            const isGrateBlocked = node.status === 'blocked';
            const isPuddleActive = node.status === 'puddle';
            fill = isPuddleActive ? '#dc3545' : isGrateBlocked ? '#ffc107' : '#0dcaf0';
            stroke = highContrast ? '#ffffff' : 'var(--bg-secondary)';
            size = isSelected ? 12 : 8;
          }

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => handleNodeHover(node)}
              style={{ cursor: 'pointer' }}
            >
              {/* Highlight Ring */}
              {isSelected && (
                <circle
                  r={size + 6}
                  fill="none"
                  stroke={highContrast ? '#ffff00' : 'var(--brand-gold)'}
                  strokeWidth="2"
                  style={{ animation: 'pulse 1.5s infinite' }}
                />
              )}

              {/* Node representation */}
              {node.type === 'health' ? (
                // Draw a cross for health centers
                <rect
                  x={-size}
                  y={-size}
                  width={size * 2}
                  height={size * 2}
                  rx="3"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                />
              ) : (
                <circle
                  r={size}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                />
              )}

              {/* Cross symbol on medical centers */}
              {node.type === 'health' && (
                <path
                  d={`M 0,${-size + 4} L 0,${size - 4} M ${-size + 4},0 L ${size - 4},0`}
                  stroke="white"
                  strokeWidth="2"
                />
              )}

              {/* Node Name Tag */}
              {(mode !== 'lansia' || isSelected) && (
                <text
                  y={size + 14}
                  textAnchor="middle"
                  fontSize={mode === 'disabilitas' ? '12px' : '9px'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={highContrast ? '#ffff00' : 'var(--text-primary)'}
                  style={{ 
                    pointerEvents: 'none', 
                    paintOrder: 'stroke', 
                    stroke: 'var(--bg-primary)', 
                    strokeWidth: highContrast ? 3 : 2 
                  }}
                >
                  {node.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Legend Box */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '10px', 
          left: '10px', 
          background: 'var(--bg-secondary)', 
          padding: '8px 12px', 
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: 'var(--shadow-sm)',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-crimson)' }}></span>
          <span>Landmark Kota</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#198754' }}></span>
          <span>Puskesmas / RSUD</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#0dcaf0' }}></span>
          <span>Sensor Grate (Lancar)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ffc107' }}></span>
          <span>Saringan Tersumbat</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#dc3545' }}></span>
          <span>Titik Genangan Air</span>
        </div>
      </div>
    </div>
  );
}
