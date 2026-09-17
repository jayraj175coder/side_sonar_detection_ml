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
      <div className="w-full max-w-lg bg-[#080D17] border border-[#162136] rounded-xl shadow-[0_0_50px_rgba(255, 183, 3, )] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#05070B] border-b border-[#162136] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FFB703]" />
            <span className="text-sm font-black text-[#F8FAFC] uppercase tracking-wider">
              DISPATCH REMEDIATION UNIT // FIELD MISSION ORDER
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#131B2A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-[#94A3B8]">
          {isDispatched ? (
            <div className="p-6 text-center space-y-3 bg-[#131B2A]/50 border border-[#FFB703] rounded-lg">
              <CheckCircle className="w-12 h-12 text-[#FFB703] mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-[#F8FAFC]">
                DISPATCH ORDER TRANSMITTED
              </h3>
              <p className="text-xs text-[#FFB703] font-mono">
                ORDER ID: MoES-DISPATCH-{Math.floor(100000 + Math.random() * 900000)}
              </p>
              <p className="text-xs text-[#94A3B8]">
                Remediation Unit <strong>{unitType}-04</strong> dispatched to target <strong>{target.id}</strong> ({target.latitude.toFixed(4)}°N, {target.longitude.toFixed(4)}°E). Estimated ETA: 42 minutes.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2 bg-[#FFB703] text-[#05070B] font-bold rounded-md cursor-pointer hover:brightness-110"
              >
                RETURN TO MISSION CONTROL
              </button>
            </div>
          ) : (
            <>
              {/* Target Coordinates & Details */}
              <div className="p-3 bg-[#05070B] border border-[#162136] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F8FAFC]">{target.id} — {target.label.toUpperCase()}</span>
                  <span className="px-2 py-0.5 bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444] font-bold text-[10px] rounded-md">
                    {target.priority} PRIORITY
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>WGS84 LAT: <strong className="text-[#FFB703]">{target.latitude.toFixed(4)}°N</strong></div>
                  <div>WGS84 LON: <strong className="text-[#FFB703]">{target.longitude.toFixed(4)}°E</strong></div>
                  <div>SEABED DEPTH: <strong className="text-[#F8FAFC]">{target.depth} m</strong></div>
                  <div>SHADOW RELIEF: <strong className="text-[#F8FAFC]">{target.shadowLength} m</strong></div>
                </div>
              </div>

              {/* Unit Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#F8FAFC]">SELECT REMEDIATION UNIT TYPE:</label>
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
                          ? 'bg-[#131B2A] border-[#FFB703] text-[#FFB703]'
                          : 'bg-[#05070B] border-[#162136] text-[#94A3B8] hover:border-[#FFB703]/40'
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
                  className="px-4 py-2 bg-[#05070B] border border-[#162136] text-[#94A3B8] hover:text-[#F8FAFC] rounded-md font-semibold cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDispatch}
                  className="flex items-center gap-2 px-5 py-2 bg-[#FFB703] text-[#05070B] font-black rounded-md cursor-pointer hover:brightness-110 shadow-[0_0_15px_rgba(255, 183, 3, )]"
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
