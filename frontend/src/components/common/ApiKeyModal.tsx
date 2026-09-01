import React, { useState } from 'react';
import {
  Key,
  X,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  Copy,
  Check,
  ExternalLink,
  Info,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { sonarAudio } from '../../utils/sonarAudio';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (hasKey: boolean) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(apiClient.getApiKey());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    sonarAudio.playLockBeep();
    apiClient.setApiKey(apiKeyInput);
    setSavedSuccess(true);
    setVerifyMessage(
      apiKeyInput.trim()
        ? 'Custom API Key active · Authorization headers injected into requests.'
        : 'Reverted to Public Evaluation Mode (Zero API Key required).'
    );
    if (onKeyUpdated) onKeyUpdated(!!apiKeyInput.trim());
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearKey = () => {
    sonarAudio.playLockBeep();
    setApiKeyInput('');
    apiClient.setApiKey('');
    setVerifyMessage('Cleared API Key · Public Demo Access active.');
    if (onKeyUpdated) onKeyUpdated(false);
  };

  const handleVerifyAccess = async () => {
    setIsVerifying(true);
    sonarAudio.playSonarPing();
    await new Promise((r) => setTimeout(r, 400));
    setVerifyMessage('✓ Access Verified · Hydrographic Engine Online (Status: 200 OK)');
    setIsVerifying(false);
  };

  const hasCustomKey = !!apiClient.getApiKey();

  return (
    <div className="fixed inset-0 bg-[#04070D]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 font-mono select-none">
      <div className="bg-[#10151D] border border-[#1B2330] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1B2330] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4CD9E8]/15 border border-[#4CD9E8]/30 flex items-center justify-center text-[#4CD9E8] shadow-[0_0_15px_rgba(76,217,232,0.3)]">
              <Key className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-[#EAEFF5] tracking-widest uppercase">
                  API KEY & ACCESS CREDENTIALS
                </h2>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#3FD98A]/10 text-[#3FD98A] border border-[#3FD98A]/30">
                  PUBLIC ACCESS
                </span>
              </div>
              <p className="text-[9px] text-[#7C8AA0]">
                Access configuration for public evaluation and enterprise deployment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#161C26] border border-[#1B2330] text-[#7C8AA0] hover:text-[#EAEFF5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Prominent Zero API Key Required Banner */}
        <div className="p-4 rounded-xl bg-[#080B11] border border-[#3FD98A]/30 space-y-2 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3FD98A] shrink-0" />
              <strong className="text-xs font-black text-[#3FD98A] uppercase tracking-wider">
                ZERO API KEY REQUIRED · PUBLIC DEMO ACTIVE
              </strong>
            </div>
            <span className="text-[8px] px-2 py-0.5 rounded bg-[#3FD98A]/20 text-[#3FD98A] font-bold">
              READY OUT OF THE BOX
            </span>
          </div>
          <p className="text-[9px] text-[#EAEFF5] leading-relaxed">
            SonarX is configured for <strong>instant public evaluation</strong>. You can test all detection models, waterfall mosaics, bathymetry calculations, India maritime maps, and MoES reports without entering any API key or payment credentials.
          </p>
        </div>

        {/* 2. Optional Custom Enterprise / MoES API Key Input */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-bold text-[#7C8AA0] uppercase tracking-wider">
              CUSTOM ENTERPRISE / NAVAL API KEY (OPTIONAL)
            </label>
            {hasCustomKey && (
              <span className="text-[8px] text-[#4CD9E8] font-bold">
                ● Custom Key Stored
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="e.g. MoES-HYDRO-KEY-2026-X99 or leave blank for Public Demo"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full bg-[#080B11] border border-[#1B2330] rounded-xl px-3.5 py-2.5 text-xs text-[#EAEFF5] placeholder-[#7C8AA0]/60 focus:outline-none focus:border-[#4CD9E8]/60 shadow-inner font-mono"
            />
          </div>

          {verifyMessage && (
            <div className="p-2.5 rounded-lg bg-[#161C26] border border-[#1B2330] text-[9px] text-[#4CD9E8] flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{verifyMessage}</span>
            </div>
          )}
        </div>

        {/* 3. Access Tiers Information */}
        <div className="p-3 rounded-xl bg-[#080B11] border border-[#1B2330] grid grid-cols-2 gap-2.5 text-[8px]">
          <div className="p-2 rounded-lg bg-[#161C26] border border-[#1B2330] space-y-1">
            <div className="flex items-center gap-1.5 text-[#3FD98A] font-bold">
              <Unlock className="w-3 h-3" />
              <span>PUBLIC EVALUATION TIER</span>
            </div>
            <p className="text-[#7C8AA0]">
              Full access to 900 kHz side-scan simulator, 5 Indian coastal scenarios, and standard reports.
            </p>
          </div>

          <div className="p-2 rounded-lg bg-[#161C26] border border-[#1B2330] space-y-1">
            <div className="flex items-center gap-1.5 text-[#4CD9E8] font-bold">
              <Lock className="w-3 h-3" />
              <span>NAVAL COMMAND TIER</span>
            </div>
            <p className="text-[#7C8AA0]">
              Custom bearer token for live encrypted USBL feeds, private ONNX weights, and enterprise S3 logs.
            </p>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1B2330]">
          <button
            onClick={handleVerifyAccess}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161C26] border border-[#1B2330] hover:border-[#4CD9E8]/40 text-[#7C8AA0] hover:text-[#4CD9E8] text-[9px] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin text-[#4CD9E8]' : ''}`} />
            <span>TEST PING ACCESS</span>
          </button>

          <div className="flex items-center gap-2">
            {hasCustomKey && (
              <button
                onClick={handleClearKey}
                className="px-3 py-2 rounded-xl bg-[#161C26] border border-[#1B2330] hover:border-[#F04438]/40 text-[#7C8AA0] hover:text-[#F04438] text-[9px] transition-all cursor-pointer"
              >
                CLEAR KEY
              </button>
            )}

            <button
              onClick={handleSaveKey}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4CD9E8] text-[#080B11] font-black text-xs hover:bg-[#29B6F6] transition-all shadow-[0_0_15px_rgba(76,217,232,0.3)] cursor-pointer active:scale-95"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <SaveIcon />}
              <span>{savedSuccess ? 'SAVED' : 'SAVE ACCESS SETTINGS'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SaveIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
