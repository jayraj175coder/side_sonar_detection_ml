import React from 'react';
import { ShieldAlert, AlertTriangle, Send, X, Radio, ArrowRight } from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';

interface HazardAlertDrawerProps {
  targets: MissionV3Target[];
  isOpen: boolean;
  onClose: () => void;
  onSelectTarget: (id: string) => void;
  onOpenDispatch: (target: MissionV3Target) => void;
}

export const HazardAlertDrawer: React.FC<HazardAlertDrawerProps> = ({
  targets,
  isOpen,
  onClose,
  onSelectTarget,
  onOpenDispatch,
}) => {
  if (!isOpen) return null;

  const criticalTargets = targets.filter((t) => t.priority === 'HIGH' || t.status === 'CONFIRMED');

  return (
    <div className="absolute top-14 right-4 z-40 w-96 bg-[#05121F] border border-[#0D2E4A] rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden font-sans select-none">
      {/* Drawer Header */}
      <div className="px-4 py-3 bg-[#030B14] border-b border-[#0D2E4A] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
          <span className="text-xs font-bold text-[#E0F7F4] uppercase tracking-wider">
            CRITICAL SUBSEA HAZARD ALERTS ({criticalTargets.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#7C98A6] hover:text-[#E0F7F4] hover:bg-[#082830] transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Target Alerts List */}
      <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
        {criticalTargets.map((t) => (
          <div
            key={t.id}
            className="p-3 bg-[#030B14] border border-[#0D2E4A] hover:border-[#00D4AA]/60 rounded-lg space-y-2 transition-all"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#E0F7F4]">{t.id} — {t.label}</span>
              <span className="px-1.5 py-0.5 bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444] text-[9px] font-bold rounded">
                {(t.confidence * 100).toFixed(1)}% CONF
              </span>
            </div>

            <p className="text-[11px] text-[#7C98A6]">
              Depth: <strong className="text-[#E0F7F4]">{t.depth}m</strong> · Shadow Relief: <strong className="text-[#00D4AA]">{t.shadowLength}m</strong>
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  onSelectTarget(t.id);
                  onClose();
                }}
                className="flex-1 py-1 bg-[#082830] border border-[#00D4AA]/40 hover:border-[#00D4AA] text-[#00D4AA] text-[10.5px] font-bold rounded cursor-pointer transition-colors"
              >
                INSPECT TARGET
              </button>
              <button
                onClick={() => {
                  onOpenDispatch(t);
                  onClose();
                }}
                className="flex items-center justify-center gap-1 px-3 py-1 bg-[#00D4AA] text-[#030B14] text-[10.5px] font-black rounded cursor-pointer hover:brightness-110"
              >
                <Send className="w-3 h-3" />
                <span>DISPATCH ROV</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
