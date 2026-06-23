// InteractiveMap.tsx - Leaflet GIS Map of Yogyakarta for Smart City Sim
import React, { useEffect, useRef } from 'react';
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

const mapHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #eef2f6;
    }
    .custom-tooltip {
      background: rgba(255, 255, 255, 0.95);
      border: 1.5px solid #ced4da;
      border-radius: 6px;
      padding: 3px 6px;
      font-size: 10px;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      color: #212529;
      pointer-events: none;
    }
    .dark-tooltip {
      background: rgba(33, 37, 41, 0.95);
      border: 1.5px solid #495057;
      color: #f8f9fa;
    }
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      font-size: 11px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .leaflet-control-zoom {
      border: none !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      border-radius: 8px !important;
      overflow: hidden;
    }
    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 0.5; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.8); opacity: 0.5; }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const staticCoordinates = {
      tugu: [-7.7829, 110.3671],
      stasiun: [-7.7892, 110.3631],
      malioboro: [-7.7926, 110.3658],
      kraton: [-7.8052, 110.3642],
      puskesmas1: [-7.7850, 110.3790],
      puskesmas2: [-7.7780, 110.3600],
      rs_jogja: [-7.8250, 110.3770]
    };

    function getLatLng(node) {
      if (staticCoordinates[node.id]) {
        return staticCoordinates[node.id];
      }
      // Linear mapping from mock coords (0-500) to Yogyakarta LatLng
      const lat = -7.7829 - (node.y - 80) * (0.0223 / 340);
      const lng = 110.3631 + (node.x - 180) * (0.0159 / 200);
      return [lat, lng];
    }

    let map;
    let tileLayer;
    let markers = {};
    let routeLine;
    let currentMode = 'default';

    function initMap(data) {
      const { mode } = data;
      currentMode = mode;
      
      const center = [-7.7915, 110.3662];
      map = L.map('map', {
        zoomControl: true,
        attributionControl: false
      }).setView(center, 14);

      updateTiles(mode);
      updateMap(data);
    }

    function updateTiles(mode) {
      if (tileLayer) {
        map.removeLayer(tileLayer);
      }
      const isDark = mode === 'disabilitas';
      const tileUrl = isDark 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      
      tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19
      }).addTo(map);
    }

    function createDivIcon(color, text, isHealth, isSelected) {
      const size = isSelected ? 26 : 18;
      const shadow = isSelected ? '0 0 0 4px rgba(26, 115, 232, 0.4)' : '0 2px 6px rgba(0,0,0,0.15)';
      
      let htmlContent = '';
      if (isHealth) {
        htmlContent = \`
          <div style="
            width: \${size}px;
            height: \${size}px;
            background: #198754;
            border: 2px solid white;
            border-radius: 4px;
            box-shadow: \${shadow};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: \${size - 8}px;
            line-height: \${size - 8}px;
          ">+</div>
        \`;
      } else {
        htmlContent = \`
          <div style="
            width: \${size}px;
            height: \${size}px;
            background: \${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: \${shadow};
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 5px; height: 5px; background: white; border-radius: 50%;"></div>
          </div>
        \`;
      }
      
      return L.divIcon({
        html: htmlContent,
        className: 'custom-node-icon',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
      });
    }

    function getVehicleIcon(type, name) {
      let color = '#1a73e8';
      let emoji = '🚌';
      if (type === 'bus') { color = '#dc2626'; emoji = '🚌'; }
      else if (type === 'delman') { color = '#b45309'; emoji = '🐎'; }
      else if (type === 'bajaj') { color = '#eab308'; emoji = '🛺'; }
      else if (type === 'bentor') { color = '#06b6d4'; emoji = '🛵'; }
      
      return L.divIcon({
        html: \`
          <div style="
            background: \${color};
            color: white;
            padding: 3px 6px;
            border-radius: 12px;
            border: 1.5px solid white;
            font-size: 9px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 3px;
            white-space: nowrap;
          ">
            <span>\${emoji}</span>
            <span>\${name}</span>
          </div>
        \`,
        className: 'custom-vehicle-icon',
        iconAnchor: [20, 10]
      });
    }

    function updateMap(data) {
      const { mode, activeRoute = [], vehicles = [], drainageNodes = [], selectedNodeId, puddleReports = [] } = data;
      
      if (mode !== currentMode) {
        currentMode = mode;
        updateTiles(mode);
      }

      // Clear existing markers
      Object.keys(markers).forEach(key => {
        map.removeLayer(markers[key]);
      });
      markers = {};

      const isDark = mode === 'disabilitas';

      // 1. Static & Drainage Nodes
      const defaultNodes = [
        { id: 'tugu', name: 'Tugu Yogyakarta', type: 'landmark', details: 'Monumen ikonik pusat Yogyakarta' },
        { id: 'stasiun', name: 'Stasiun Yogyakarta', type: 'landmark', details: 'Pusat integrasi kereta dan Trans Jogja' },
        { id: 'malioboro', name: 'Kawasan Malioboro', type: 'landmark', details: 'Pusat perbelanjaan dan jalur pedestrian' },
        { id: 'kraton', name: 'Kraton Yogyakarta', type: 'landmark', details: 'Istana Kesultanan Yogyakarta' },
        { id: 'puskesmas1', name: 'Puskesmas Gondokusuman', type: 'health', details: 'Kapasitas ICU: 2 Tersedia' },
        { id: 'puskesmas2', name: 'Puskesmas Jetis', type: 'health', details: 'Kapasitas ICU: 4 Tersedia' },
        { id: 'rs_jogja', name: 'RSUD Kota Yogyakarta', type: 'health', details: 'Kapasitas Kamar: 15 Tersedia' }
      ];

      const allNodes = [...defaultNodes, ...drainageNodes];

      allNodes.forEach(node => {
        const coords = getLatLng(node);
        const isSelected = selectedNodeId === node.id;
        
        let color = '#1a73e8';
        if (node.type === 'landmark') color = '#b91c1c';
        else if (node.type === 'grate') {
          const isGrateBlocked = node.status === 'blocked';
          const isPuddleActive = node.status === 'puddle';
          color = isPuddleActive ? '#dc3545' : isGrateBlocked ? '#ffc107' : '#0dcaf0';
        }

        const isHealth = node.type === 'health';
        const icon = createDivIcon(color, node.name, isHealth, isSelected);
        
        const marker = L.marker(coords, { icon }).addTo(map);
        
        marker.bindTooltip(node.name, {
          permanent: node.type === 'landmark' || isSelected,
          direction: 'bottom',
          className: isDark ? 'custom-tooltip dark-tooltip' : 'custom-tooltip',
          offset: [0, 10]
        });

        marker.on('click', () => {
          window.parent.postMessage({
            type: 'nodeSelect',
            node: node
          }, '*');
        });

        markers['node_' + node.id] = marker;
      });

      // 2. Vehicles
      vehicles.forEach(v => {
        const coords = getLatLng(v);
        const icon = getVehicleIcon(v.type, v.name);
        const marker = L.marker(coords, { icon }).addTo(map);
        
        marker.on('click', () => {
          window.parent.postMessage({
            type: 'speak',
            text: \`Kendaraan: \${v.name}, tipe \${v.type}, status \${v.status}\`
          }, '*');
        });

        markers['vehicle_' + v.id] = marker;
      });

      // 3. Puddle Reports
      puddleReports.forEach(report => {
        const coords = getLatLng(report);
        const isSelesai = report.status === 'Selesai';
        const color = isSelesai ? '#198754' : '#dc3545';
        
        const icon = L.divIcon({
          html: \`
            <div style="position: relative; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: \${color}; opacity: 0.6; transform: scale(1.5); animation: pulse-ring 1.8s infinite;"></div>
              <div style="width: 8px; height: 8px; border-radius: 50%; background: \${color}; border: 1.5px solid white;"></div>
            </div>
          \`,
          className: 'puddle-icon',
          iconSize: [16, 16]
        });

        const marker = L.marker(coords, { icon }).addTo(map);
        marker.on('click', () => {
          window.parent.postMessage({
            type: 'speak',
            text: \`Laporan genangan air di titik ini. Status: \${report.status}\`
          }, '*');
        });
        markers['puddle_' + report.id] = marker;
      });

      // 4. Route path
      if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
      }

      if (activeRoute && activeRoute.length >= 2) {
        const points = activeRoute.map(id => {
          const matchedNode = allNodes.find(n => n.id === id);
          if (matchedNode) return getLatLng(matchedNode);
          return null;
        }).filter(Boolean);

        if (points.length >= 2) {
          routeLine = L.polyline(points, {
            color: isDark ? '#ffff00' : '#1a73e8',
            weight: 4,
            dashArray: '8, 8',
            opacity: 0.8
          }).addTo(map);
        }
      }
    }

    window.addEventListener('message', (event) => {
      if (!event.data) return;
      const { type, data } = event.data;
      if (type === 'init') {
        initMap(data);
      } else if (type === 'update') {
        updateMap(data);
      }
    });
  </script>
</body>
</html>`;

export default function InteractiveMap({
  mode,
  activeRoute = [],
  vehicles = [],
  drainageNodes = [],
  selectedNodeId,
  onNodeSelect,
  puddleReports = []
}: InteractiveMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      
      if (event.data.type === 'nodeSelect') {
        const node = event.data.node;
        speak(`Memilih ${node.name}`);
        if (onNodeSelect) {
          onNodeSelect(node);
        }
      } else if (event.data.type === 'speak') {
        speak(event.data.text);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onNodeSelect]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'update',
      data: {
        mode,
        activeRoute,
        vehicles,
        drainageNodes,
        selectedNodeId,
        puddleReports
      }
    }, '*');
  }, [mode, activeRoute, vehicles, drainageNodes, selectedNodeId, puddleReports]);

  const handleIframeLoad = () => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'init',
      data: {
        mode,
        activeRoute,
        vehicles,
        drainageNodes,
        selectedNodeId,
        puddleReports
      }
    }, '*');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        srcDoc={mapHtml}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        onLoad={handleIframeLoad}
        title="Interactive Yogyakarta Leaflet GIS Map"
      />
    </div>
  );
}
