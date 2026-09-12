import React, { useState } from 'react';
import { ShieldAlert, Navigation, Send, CheckCircle, X, Radio, Anchor } from 'lucide-react';
import { MissionV3Target } from '../../../data/missionV3Data';
import { sonarAudio } from '../../../utils/sonarAudio';

interface RovDispatchModalProps {
  target: MissionV3Target;
  isOpen: boolean;
  onClose: () => void;
}

export const RovDispatchModal: React.FC<RovDispatchModalProps> = ({ target, isOpen, onClose }) => {
  const [isDispatched, setIsDispatched] = useState(false);
  const [unitType, setUnitType] = useState<'ROV' | 'DIVERS' | 'AUV'>('ROV');

  if (!isOpen) return null;

  const handleDispatch = () => {
    sonarAudio.playEmergencyAlertAlarm();
    setIsDispatched(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#01050A]/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-lg bg-[#05121F] border border-[#0D2E4A] rounded-xl shadow-[0_0_50px_rgba(0,212,170,0.2)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#030B14] border-b border-[#0D2E4A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#00D4AA]" />
            <span className="text-sm font-black text-[#E0F7F4] uppercase tracking-wider">
              DISPATCH REMEDIATION UNIT // FIELD MISSION ORDER
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#7C98A6] hover:text-[#E0F7F4] hover:bg-[#082830] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-[#7C98A6]">
          {isDispatched ? (
            <div className="p-6 text-center space-y-3 bg-[#082830]/50 border border-[#00D4AA] rounded-lg">
              <CheckCircle className="w-12 h-12 text-[#00D4AA] mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-[#E0F7F4]">
                DISPATCH ORDER TRANSMITTED
              </h3>
              <p className="text-xs text-[#00D4AA] font-mono">
                ORDER ID: MoES-DISPATCH-{Math.floor(100000 + Math.random() * 900000)}
              </p>
              <p className="text-xs text-[#7C98A6]">
                Remediation Unit <strong>{unitType}-04</strong> dispatched to target <strong>{target.id}</strong> ({target.latitude.toFixed(4)}°N, {target.longitude.toFixed(4)}°E). Estimated ETA: 42 minutes.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2 bg-[#00D4AA] text-[#030B14] font-bold rounded-md cursor-pointer hover:brightness-110"
              >
                RETURN TO MISSION CONTROL
              </button>
            </div>
          ) : (
            <>
              {/* Target Coordinates & Details */}
              <div className="p-3 bg-[#030B14] border border-[#0D2E4A] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#E0F7F4]">{target.id} — {target.label.toUpperCase()}</span>
                  <span className="px-2 py-0.5 bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444] font-bold text-[10px] rounded-md">
                    {target.priority} PRIORITY
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>WGS84 LAT: <strong className="text-[#00D4AA]">{target.latitude.toFixed(4)}°N</strong></div>
                  <div>WGS84 LON: <strong className="text-[#00D4AA]">{target.longitude.toFixed(4)}°E</strong></div>
                  <div>SEABED DEPTH: <strong className="text-[#E0F7F4]">{target.depth} m</strong></div>
                  <div>SHADOW RELIEF: <strong className="text-[#E0F7F4]">{target.shadowLength} m</strong></div>
                </div>
              </div>

              {/* Unit Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E0F7F4]">SELECT REMEDIATION UNIT TYPE:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ROV', name: 'Workclass ROV', desc: 'Deep-water mechanical arm' },
                    { id: 'DIVERS', name: 'Commercial Divers', desc: 'Shallow net clearance' },
                    { id: 'AUV', name: 'Inspection AUV', desc: 'Subsea video survey' },
                  ].map((unit) => (
                    <button
                      key={unit.id}
                      onClick={() => setUnitType(unit.id as any)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        unitType === unit.id
                          ? 'bg-[#082830] border-[#00D4AA] text-[#00D4AA]'
                          : 'bg-[#030B14] border-[#0D2E4A] text-[#7C98A6] hover:border-[#00D4AA]/40'
                      }`}
                    >
                      <div className="font-bold text-xs">{unit.name}</div>
                      <div className="text-[9.5px] opacity-80">{unit.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#030B14] border border-[#0D2E4A] text-[#7C98A6] hover:text-[#E0F7F4] rounded-md font-semibold cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDispatch}
                  className="flex items-center gap-2 px-5 py-2 bg-[#00D4AA] text-[#030B14] font-black rounded-md cursor-pointer hover:brightness-110 shadow-[0_0_15px_rgba(0,212,170,0.4)]"
                >
                  <Send className="w-4 h-4" />
                  <span>TRANSMIT DISPATCH ORDER</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
