import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Check, Filter, Trash2, ArrowDown } from 'lucide-react';

export interface LogLine {
  id: string;
  timestamp: string;
  stage: 'INGEST' | 'PREPROCESS' | 'DETECT' | 'FILTER' | 'REPORT';
  text: string;
  level: 'info' | 'success' | 'warn' | 'reject';
}

interface AutomatedDecisionLogProps {
  logs: LogLine[];
  isLive: boolean;
}

export const AutomatedDecisionLog: React.FC<AutomatedDecisionLogProps> = ({ logs, isLive }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'DETECTIONS' | 'REJECTIONS'>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  // Autoscroll to bottom as new logs arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.stage}] ${l.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'DETECTIONS') return log.level === 'success';
    if (filterLevel === 'REJECTIONS') return log.level === 'reject';
    return true;
  });

  return (
    <div className="w-full h-full bg-[#081118] border border-[#16303B] rounded-2xl p-3.5 shadow-xl font-mono select-none flex flex-col space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#32E6D1]" />
          <h3 className="text-xs font-black text-[#E4F2F5] tracking-wider uppercase font-sans">
            AUTOMATED DECISION LOG
          </h3>
          {isLive && (
            <span className="flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#32E6D1]/20 text-[#32E6D1] border border-[#32E6D1]/40 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#32E6D1]" />
              STREAMING
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 text-[9px]">
          {/* Filter Pills */}
          <div className="flex items-center rounded-lg border border-[#16303B] bg-[#0C171E] overflow-hidden">
            {(['ALL', 'DETECTIONS', 'REJECTIONS'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterLevel(f)}
                className={`px-2 py-0.5 font-bold transition-colors cursor-pointer ${
                  filterLevel === f
                    ? 'bg-[#32E6D1] text-[#03070B]'
                    : 'text-[#6F8992] hover:text-[#E4F2F5]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyLogs}
            className="p-1 rounded-lg bg-[#0C171E] border border-[#16303B] text-[#6F8992] hover:text-[#32E6D1] transition-colors cursor-pointer"
            title="Copy decision log"
          >
            {copied ? <Check className="w-3 h-3 text-[#65D391]" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={containerRef}
        className="flex-1 bg-[#03070B] border border-[#16303B] rounded-xl p-3 overflow-y-auto font-mono text-[10px] space-y-1.5 shadow-inner min-h-[220px]"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#6F8992] text-[10px] italic">
            Awaiting automated perception stream... Click "Run Demo" or upload a sonar image.
          </div>
        ) : (
          filteredLogs.map((log) => {
            let textColor = 'text-[#E4F2F5]';
            let stageBadgeColor = 'bg-[#16303B] text-[#6F8992]';

            if (log.level === 'success') {
              textColor = 'text-[#32E6D1] font-semibold';
              stageBadgeColor = 'bg-[#32E6D1]/20 text-[#32E6D1] border border-[#32E6D1]/40';
            } else if (log.level === 'reject') {
              textColor = 'text-[#FF5D5D]';
              stageBadgeColor = 'bg-[#FF5D5D]/20 text-[#FF5D5D] border border-[#FF5D5D]/40';
            } else if (log.level === 'warn') {
              textColor = 'text-[#FFB547]';
              stageBadgeColor = 'bg-[#FFB547]/20 text-[#FFB547] border border-[#FFB547]/40';
            }

            return (
              <div key={log.id} className="flex items-start gap-2 leading-tight hover:bg-[#081118]/80 py-0.5 px-1 rounded transition-colors">
                <span className="text-[#6F8992] shrink-0">[{log.timestamp}]</span>
                <span className={`text-[8px] font-bold px-1 py-0.2 rounded shrink-0 ${stageBadgeColor}`}>
                  {log.stage}
                </span>
                <span className={`flex-1 break-words ${textColor}`}>
                  {log.text}
                </span>
              </div>
            );
          })
        )}

        {/* Live Blinking Terminal Cursor */}
        {isLive && (
          <div className="flex items-center gap-1 text-[#32E6D1] pt-1">
            <span className="inline-block w-2 h-3.5 bg-[#32E6D1] animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};
