import React, { useState } from 'react';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';

export interface MapLayers {
  ghostNets: boolean;
  pipelines: boolean;
  marineDebris: boolean;
  seafloorAnomalies: boolean;
  surveyTrack: boolean;
  swathEnvelope: boolean;
  uncertaintyRadius: boolean;
  sonarRange: boolean;
  graticule: boolean;
  highPriorityOnly: boolean;
}

interface MapLayerTogglePanelProps {
  layers: MapLayers;
  onToggle: (key: keyof MapLayers) => void;
}

const LAYER_GROUPS: {
  groupLabel: string;
  color: string;
  items: { key: keyof MapLayers; label: string; badge?: string }[];
}[] = [
  {
    groupLabel: '// DETECTION LAYERS',
    color: '#00F5D4',
    items: [
      { key: 'ghostNets',         label: 'GHOST NETS (ALDFG)',  badge: 'HIGH' },
      { key: 'pipelines',         label: 'PIPELINE HAZARDS',   badge: 'CRIT' },
      { key: 'marineDebris',      label: 'MARINE DEBRIS',      badge: 'MED'  },
      { key: 'seafloorAnomalies', label: 'SEAFLOOR ANOMALY',   badge: 'LOW'  },
    ],
  },
  {
    groupLabel: '// SURVEY LAYERS',
    color: '#FFB703',
    items: [
      { key: 'surveyTrack',     label: 'AUV SURVEY TRACK' },
      { key: 'swathEnvelope',   label: 'SWATH ENVELOPE (75m)' },
    ],
  },
  {
    groupLabel: '// ACCURACY LAYERS',
    color: '#38BDF8',
    items: [
      { key: 'uncertaintyRadius', label: '±r TPU BUFFER (IHO S-44)' },
      { key: 'sonarRange',        label: 'SONAR RANGE RINGS' },
      { key: 'graticule',         label: 'GRATICULE GRID' },
    ],
  },
  {
    groupLabel: '// FILTER',
    color: '#EF4444',
    items: [
      { key: 'highPriorityOnly', label: 'HIGH PRIORITY ONLY' },
    ],
  },
];

const BADGE_COLORS: Record<string, string> = {
  HIGH: '#EF4444',
  CRIT: '#FF0066',
  MED:  '#F59E0B',
  LOW:  '#38BDF8',
};

export const MapLayerTogglePanel: React.FC<MapLayerTogglePanelProps> = ({ layers, onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);

  const activeCount = Object.values(layers).filter(Boolean).length;

  return (
    <div
      className="absolute top-2 left-2 z-[1000] flex flex-col font-mono select-none"
      style={{ maxHeight: 'calc(100% - 16px)' }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-2 py-1 bg-[#05070B]/95 border border-[#00F5D4]/40
                   rounded-t cursor-pointer hover:border-[#00F5D4]/70 transition-colors"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-[#00F5D4]" />
          <span className="text-[9px] font-black text-[#00F5D4] uppercase tracking-widest">
            // CONTROL LAYERS
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] px-1 py-0.5 bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30 rounded-sm">
            {activeCount} ON
          </span>
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-[#64748B]" />
            : <ChevronLeft  className="w-3 h-3 text-[#64748B]" />}
        </div>
      </div>

      {/* Layer list */}
      {!collapsed && (
        <div
          className="bg-[#050A14]/95 border border-t-0 border-[#00F5D4]/30 rounded-b
                     overflow-y-auto backdrop-blur-sm"
          style={{ maxHeight: '420px', minWidth: '185px' }}
        >
          {LAYER_GROUPS.map((group) => (
            <div key={group.groupLabel} className="px-2 pt-2 pb-1">
              {/* Group label */}
              <div className="text-[7.5px] font-bold mb-1" style={{ color: group.color }}>
                {group.groupLabel}
              </div>

              {group.items.map(({ key, label, badge }) => {
                const active = layers[key];
                return (
                  <button
                    key={key}
                    onClick={() => onToggle(key)}
                    className="w-full flex items-center gap-2 px-1 py-0.5 rounded
                               hover:bg-white/5 cursor-pointer transition-colors group mb-0.5"
                  >
                    {/* Checkbox */}
                    <span
                      className="flex-shrink-0 w-3 h-3 border flex items-center justify-center rounded-sm transition-colors"
                      style={{
                        borderColor: active ? group.color : '#1E293B',
                        background: active ? `${group.color}25` : 'transparent',
                      }}
                    >
                      {active && (
                        <span
                          className="w-1.5 h-1.5 rounded-sm"
                          style={{ background: group.color }}
                        />
                      )}
                    </span>

                    {/* Label */}
                    <span
                      className="flex-1 text-left text-[8.5px] font-bold transition-colors"
                      style={{ color: active ? '#E2E8F0' : '#475569' }}
                    >
                      {label}
                    </span>

                    {/* Badge */}
                    {badge && active && (
                      <span
                        className="text-[6.5px] font-black px-1 py-0.5 rounded"
                        style={{
                          background: `${BADGE_COLORS[badge] ?? '#64748B'}20`,
                          color: BADGE_COLORS[badge] ?? '#64748B',
                          border: `1px solid ${BADGE_COLORS[badge] ?? '#64748B'}40`,
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Keys footer */}
          <div className="px-2 py-1.5 mt-1 border-t border-[#1E293B]">
            <div className="text-[7px] text-[#475569] font-bold mb-0.5">// KEYS</div>
            <div className="text-[6.5px] text-[#334155] leading-relaxed">
              Click layer to toggle visibility.<br/>
              ±r = IHO S-44 Order 1a TPU buffer.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
