import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

// Toggle switch component
const Toggle: React.FC<{ on: boolean; onChange: () => void; color?: string }> = ({
  on, onChange, color = '#00F5D4',
}) => (
  <button
    onClick={onChange}
    className={`relative w-7 h-3.5 rounded-full transition-all cursor-pointer shrink-0 ${
      on ? '' : 'bg-[#1E293B]'
    }`}
    style={on ? { background: `${color}30`, border: `1px solid ${color}60` } : { border: '1px solid #1E293B' }}
  >
    <span
      className="absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all"
      style={{
        left: on ? 'calc(100% - 12px)' : '1px',
        background: on ? color : '#334155',
        boxShadow: on ? `0 0 6px ${color}` : 'none',
      }}
    />
  </button>
);

// Color dot indicator
const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
);

interface LayerState {
  // Detections
  sonarDetections: boolean;
  acousticShadows: boolean;
  verifiedTargets: boolean;
  anomalyZones: boolean;
  // Survey data
  auvTrack: boolean;
  pingPositions: boolean;
  surveyCoverage: boolean;
  bathymetryContours: boolean;
  // Environment
  depthMap: boolean;
  currentVectors: boolean;
  temperature: boolean;
  salinity: boolean;
  // Infrastructure
  pipelineKnown: boolean;
  cablesKnown: boolean;
  restrictedZones: boolean;
}

// Base map type
type BaseMap = 'sonar_mosaic' | 'bathymetry_blend' | 'satellite_hybrid';

interface MapLayersSidePanelProps {
  className?: string;
}

const DEFAULT_LAYERS: LayerState = {
  sonarDetections: true,
  acousticShadows: true,
  verifiedTargets: true,
  anomalyZones: true,
  auvTrack: true,
  pingPositions: false,
  surveyCoverage: true,
  bathymetryContours: false,
  depthMap: true,
  currentVectors: true,
  temperature: false,
  salinity: false,
  pipelineKnown: true,
  cablesKnown: false,
  restrictedZones: false,
};

export const MapLayersSidePanel: React.FC<MapLayersSidePanelProps> = ({ className = '' }) => {
  const [layers, setLayers] = useState<LayerState>(DEFAULT_LAYERS);
  const [baseMap, setBaseMap] = useState<BaseMap>('sonar_mosaic');

  const toggle = (key: keyof LayerState) =>
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  const reset = () => { setLayers(DEFAULT_LAYERS); setBaseMap('sonar_mosaic'); };

  const SECTION_HEADER = (label: string) => (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#020608] border-t border-b border-[#0F1E2E]">
      <span className="text-[8px] font-black text-[#334155] uppercase tracking-widest">{label}</span>
    </div>
  );

  const LAYER_ROW = (
    key: keyof LayerState,
    label: string,
    dotColor: string,
    subLabel?: string,
  ) => (
    <div className="flex items-center justify-between px-3 py-1 hover:bg-[#0A1520] transition-colors group">
      <div className="flex items-center gap-2 min-w-0">
        <Dot color={layers[key] ? dotColor : '#334155'} />
        <div className="min-w-0">
          <div className={`text-[8.5px] font-bold leading-tight truncate transition-colors ${
            layers[key] ? 'text-[#CBD5E1]' : 'text-[#475569]'
          }`}>
            {label}
          </div>
          {subLabel && (
            <div className="text-[7px] text-[#334155]">{subLabel}</div>
          )}
        </div>
      </div>
      <Toggle on={layers[key]} onChange={() => toggle(key)} color={dotColor} />
    </div>
  );

  return (
    <aside className={`h-full bg-[#030810] border-r border-[#0F1E2E] flex flex-col font-mono select-none overflow-y-auto text-[9px] shrink-0 z-20 ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#05080F] border-b border-[#0F1E2E] shrink-0">
        <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">
          MAP LAYERS
        </span>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-[7.5px] text-[#475569] hover:text-[#E2E8F0] cursor-pointer transition-colors px-1.5 py-0.5 rounded border border-[#1E293B] hover:border-[#334155]"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          RESET
        </button>
      </div>

      {/* ── DETECTIONS ── */}
      {SECTION_HEADER('▸ DETECTIONS')}
      <div className="py-0.5">
        {LAYER_ROW('sonarDetections', 'Sonar Detections',   '#00F5D4')}
        {LAYER_ROW('acousticShadows', 'Acoustic Shadows',   '#38BDF8')}
        {LAYER_ROW('verifiedTargets', 'Verified Targets',   '#00C853')}
        {LAYER_ROW('anomalyZones',    'Anomaly Zones',      '#F59E0B')}
      </div>

      {/* ── SURVEY DATA ── */}
      {SECTION_HEADER('▸ SURVEY DATA')}
      <div className="py-0.5">
        {LAYER_ROW('auvTrack',           'AUV Track',           '#FFB703')}
        {LAYER_ROW('pingPositions',       'Ping Positions',      '#38BDF8')}
        {LAYER_ROW('surveyCoverage',      'Survey Coverage',     '#00F5D4')}
        {LAYER_ROW('bathymetryContours',  'Bathymetry Contours', '#6366F1')}
      </div>

      {/* ── ENVIRONMENT ── */}
      {SECTION_HEADER('▸ ENVIRONMENT')}
      <div className="py-0.5">
        {LAYER_ROW('depthMap',        'Depth Map',         '#38BDF8')}
        {LAYER_ROW('currentVectors',  'Current Vectors',   '#00F5D4')}
        {LAYER_ROW('temperature',     'Temperature (°C)',  '#F59E0B')}
        {LAYER_ROW('salinity',        'Salinity (PSU)',    '#818CF8')}
      </div>

      {/* ── INFRASTRUCTURE ── */}
      {SECTION_HEADER('▸ INFRASTRUCTURE')}
      <div className="py-0.5">
        {LAYER_ROW('pipelineKnown',    'Pipeline (Known)',   '#EF4444')}
        {LAYER_ROW('cablesKnown',      'Cables (Known)',     '#F59E0B')}
        {LAYER_ROW('restrictedZones',  'Restricted Zones',  '#A855F7')}
      </div>

      {/* ── BASE MAP ── */}
      {SECTION_HEADER('▸ BASE MAP')}
      <div className="px-3 py-2 space-y-1.5">
        {([
          { key: 'sonar_mosaic',      label: 'Sonar Mosaic' },
          { key: 'bathymetry_blend',  label: 'Bathymetry (Blend)' },
          { key: 'satellite_hybrid',  label: 'Satellite (Hybrid)' },
        ] as { key: BaseMap; label: string }[]).map(opt => (
          <button
            key={opt.key}
            onClick={() => setBaseMap(opt.key)}
            className="flex items-center gap-2 w-full cursor-pointer group"
          >
            {/* Radio circle */}
            <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              baseMap === opt.key
                ? 'border-[#00F5D4] bg-[#00F5D4]/10'
                : 'border-[#334155]'
            }`}>
              {baseMap === opt.key && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4]" />
              )}
            </span>
            <span className={`text-[8.5px] font-bold transition-colors ${
              baseMap === opt.key ? 'text-[#00F5D4]' : 'text-[#475569] group-hover:text-[#94A3B8]'
            }`}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {/* Footer spacer */}
      <div className="flex-1" />

      {/* Layer count badge */}
      <div className="px-3 py-2 border-t border-[#0F1E2E] bg-[#020608] shrink-0">
        <div className="text-[7.5px] text-[#334155] text-center">
          {Object.values(layers).filter(Boolean).length} / {Object.keys(layers).length} LAYERS ACTIVE
        </div>
      </div>
    </aside>
  );
};
