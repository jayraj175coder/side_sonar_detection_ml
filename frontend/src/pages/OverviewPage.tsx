import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  Layers,
  MapPin,
  Play,
  Cpu,
  Eye,
  Radio,
  Filter,
  ArrowRight,
  ShieldCheck,
  Compass,
  Sliders,
  Check,
  Crosshair,
  Printer,
  Download,
  Share2,
  ChevronRight,
  ScanLine,
  Activity,
  ExternalLink,
  Target,
  Waves,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MarineSurveyHero } from '../components/overview/MarineSurveyHero';
import { TacticalDebrisRadarShowcase } from '../components/overview/TacticalDebrisRadarShowcase';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const OverviewPage: React.FC = () => {
  const { setActiveTab } = useApp();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver for smooth scroll-reveal (.reveal -> .reveal.in)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = rootRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="space-y-16 pb-20 font-body select-none text-[15px] text-[#E0F7F4]">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION — SEE BENEATH THE SURFACE & OPERATIONAL MODE SELECTOR
          SURVEY VESSEL + TOW CABLE + TOWFISH + ACOUSTIC BEAM + MARINE WILDLIFE
          ═══════════════════════════════════════════════════════════════════ */}
      <MarineSurveyHero />

      {/* ═══════════════════════════════════════════════════════════════════
          LIVE AUTONOMOUS MARINE DEBRIS HOLOGRAPHIC RADAR SHOWCASE
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="reveal">
        <TacticalDebrisRadarShowcase />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — THE PROBLEM: EASY TO COLLECT, HARD TO READ IN TIME
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="problem" className="space-y-8">
        <div className="max-w-2xl space-y-2 reveal">
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-[#FFFFFF] tracking-tight">
            Sonar data is easy to collect. It's hard to read in time.
          </h2>
          <p className="text-[16px] text-[#8CA6B8] leading-relaxed">
            A survey vehicle can log hours of side-scan sonar in a single pass. Turning that into usable intelligence is where the process breaks down.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="subpixel-card p-6 rounded-2xl space-y-3 reveal">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#00F5D4]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-white">Manual inspection</h3>
            <p className="text-[13.5px] text-slate-400 leading-relaxed">
              Experts scan long sonar swaths frame by frame. It's slow, and the result depends on who's watching.
            </p>
          </div>

          <div className="subpixel-card p-6 rounded-2xl space-y-3 reveal">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#00F5D4]">
              <Waves className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-white">Acoustic noise</h3>
            <p className="text-[13.5px] text-slate-400 leading-relaxed">
              Speckle, seabed texture, shadows, and vehicle motion produce false contacts on almost every pass.
            </p>
          </div>

          <div className="subpixel-card p-6 rounded-2xl space-y-3 reveal">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#00F5D4]">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-white">Natural vs. artificial</h3>
            <p className="text-[13.5px] text-slate-400 leading-relaxed">
              Rock outcrops and seabed ripples resemble man-made debris closely enough to fool a quick pass.
            </p>
          </div>

          <div className="subpixel-card p-6 rounded-2xl space-y-3 reveal">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#00F5D4]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-white">No location intelligence</h3>
            <p className="text-[13.5px] text-slate-400 leading-relaxed">
              A detection without coordinates and a report isn't actionable — someone still has to write it up by hand.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — APPROACH COMPARISON TABLE
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="approach" className="space-y-6">
        <div className="max-w-2xl space-y-2 reveal">
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-white tracking-tight">
            Where existing approaches fall short
          </h2>
          <p className="text-[15px] text-slate-400 leading-relaxed">
            Most of the pieces exist already. None of them close the loop from raw sonar to an actionable report.
          </p>
        </div>

        <div className="overflow-x-auto border border-white/[0.08] rounded-2xl bg-[#090E17]/90 backdrop-blur-xl shadow-2xl reveal">
          <table className="w-full text-left text-[14px] border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.08] text-slate-300 font-display font-semibold text-[13px]">
                <th className="p-4">Existing approach</th>
                <th className="p-4">Where it breaks down</th>
                <th className="p-4 text-[#00F5D4]">What SONARX does instead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-400">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-medium text-slate-200">Manual sonar review</td>
                <td className="p-4">Slow, subjective, depends on analyst experience</td>
                <td className="p-4 font-medium text-[#00F5D4]">Automated, consistent detection in 14.2 ms</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-medium text-slate-200">Ghost-net-specific tools</td>
                <td className="p-4">Built for one target type only</td>
                <td className="p-4 font-medium text-[#00F5D4]">Multi-class marine debris & pipeline hazard perception</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-medium text-slate-200">Generic object detectors</td>
                <td className="p-4">High false-positive rate on seabed clutter</td>
                <td className="p-4 font-medium text-[#00F5D4]">Acoustic shadow geometry filtering & rock rejection</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-medium text-slate-200">Detection-only systems</td>
                <td className="p-4">No geotagging or operational context</td>
                <td className="p-4 font-medium text-[#00F5D4]">End-to-end workflow with WGS-84 coordinates & dossiers</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-medium text-slate-200">Cloud-dependent pipelines</td>
                <td className="p-4">High latency, needs a live satellite connection</td>
                <td className="p-4 font-medium text-[#00F5D4]">Lightweight ONNX model built for offline edge inference</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — SOLUTION & EMBEDDED DASHBOARD SHOWCASE
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="solution" className="space-y-6">
        <div className="max-w-2xl space-y-2 reveal">
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-[#FFFFFF] tracking-tight">
            SONARX turns a sonar log into a working dashboard
          </h2>
          <p className="text-[16px] text-[#8CA6B8] leading-relaxed">
            Upload a survey line and the pipeline handles detection, filtering, classification, and reporting on its own.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Feature List & Empirical Validation Metrics */}
          <div className="lg:col-span-6 space-y-6 reveal">
            <ul className="space-y-4 list-none p-0 m-0">
              <li className="flex items-start gap-3.5">
                <span className="w-2 h-2 rounded-full bg-[#00D4AA] mt-2 shrink-0 shadow-[0_0_8px_#00D4AA]" />
                <div>
                  <strong className="block font-display font-semibold text-[15.5px] text-[#FFFFFF]">Multi-class detection</strong>
                  <span className="text-[14px] text-[#8CA6B8]">Locates ghost nets, lost fishing gear, and pipelines directly in raw side-scan sonar imagery.</span>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="w-2 h-2 rounded-full bg-[#00D4AA] mt-2 shrink-0 shadow-[0_0_8px_#00D4AA]" />
                <div>
                  <strong className="block font-display font-semibold text-[15.5px] text-[#FFFFFF]">Acoustic clutter filtering</strong>
                  <span className="text-[14px] text-[#8CA6B8]">Shadow trigonometry and confidence scoring cut down the false positives that noise and seabed texture create.</span>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="w-2 h-2 rounded-full bg-[#00D4AA] mt-2 shrink-0 shadow-[0_0_8px_#00D4AA]" />
                <div>
                  <strong className="block font-display font-semibold text-[15.5px] text-[#FFFFFF]">Automatic geotagging</strong>
                  <span className="text-[14px] text-[#8CA6B8]">Every contact is tagged to WGS-84 coordinates and logged against the USBL ping that produced it.</span>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="w-2 h-2 rounded-full bg-[#00D4AA] mt-2 shrink-0 shadow-[0_0_8px_#00D4AA]" />
                <div>
                  <strong className="block font-display font-semibold text-[15.5px] text-[#FFFFFF]">Prioritized anomaly reports</strong>
                  <span className="text-[14px] text-[#8CA6B8]">Findings are ranked and written up automatically, ready to hand to an operational MoES retrieval team.</span>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="w-2 h-2 rounded-full bg-[#00D4AA] mt-2 shrink-0 shadow-[0_0_8px_#00D4AA]" />
                <div>
                  <strong className="block font-display font-semibold text-[15.5px] text-[#FFFFFF]">Interactive intelligence map</strong>
                  <span className="text-[14px] text-[#8CA6B8]">A live map and 3D bathymetry viewer for hydrographic and conservation teams to inspect contacts.</span>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <span className="w-2 h-2 rounded-full bg-[#00D4AA] mt-2 shrink-0 shadow-[0_0_8px_#00D4AA]" />
                <div>
                  <strong className="block font-display font-semibold text-[15.5px] text-[#FFFFFF]">Edge-ready inference</strong>
                  <span className="text-[14px] text-[#8CA6B8]">A lightweight 12.3 MB ONNX model that runs locally on towfish edge hardware without internet.</span>
                </div>
              </li>
            </ul>

            {/* Empirical Validation Metrics Strip (Linear Key Metric Grid) */}
            <div className="grid grid-cols-3 gap-px bg-white/[0.08] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-[#090E17]/95 p-4 text-center">
                <div className="font-mono text-2xl font-bold text-[#00F5D4]">77.7%</div>
                <div className="text-[11px] text-slate-400 mt-1 uppercase font-mono font-medium">Precision (Val)</div>
              </div>

              <div className="bg-[#090E17]/95 p-4 text-center">
                <div className="font-mono text-2xl font-bold text-[#00F5D4]">74.6%</div>
                <div className="text-[11px] text-slate-400 mt-1 uppercase font-mono font-medium">Recall (Val)</div>
              </div>

              <div className="bg-[#090E17]/95 p-4 text-center">
                <div className="font-mono text-2xl font-bold text-[#00F5D4]">74.1%</div>
                <div className="text-[11px] text-slate-400 mt-1 uppercase font-mono font-medium">mAP@0.50</div>
              </div>
            </div>

            {/* Class Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="font-mono text-xs px-2.5 py-1 bg-white/[0.03] border border-white/[0.08] text-slate-300 rounded-lg">
                <b className="text-[#00F5D4]">0: ghost_net_aldfg</b> — 99.5% accuracy
              </span>
              <span className="font-mono text-xs px-2.5 py-1 bg-white/[0.03] border border-white/[0.08] text-slate-300 rounded-lg">
                <b className="text-[#FFB703]">1: anthropogenic_debris</b> — metallic clutter
              </span>
              <span className="font-mono text-xs px-2.5 py-1 bg-white/[0.03] border border-white/[0.08] text-slate-300 rounded-lg">
                <b className="text-[#38BDF8]">2: pipeline_hazard</b> — 99.5% accuracy
              </span>
              <span className="font-mono text-xs px-2.5 py-1 bg-white/[0.03] border border-white/[0.08] text-slate-300 rounded-lg">
                <b className="text-rose-400">3: seafloor_anomaly</b> — seabed contact
              </span>
            </div>
          </div>

          {/* Right Live Interactive Workstation Card (Raycast / Caliper Box) */}
          <div className="lg:col-span-6 caliper-box subpixel-card rounded-2xl overflow-hidden shadow-2xl reveal border border-white/[0.08]">
            <div className="p-3.5 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
                <span className="text-slate-200 font-medium">Mission Control — Live Workstation</span>
              </div>
              <button
                onClick={() => setActiveTab('mission')}
                className="text-[#00F5D4] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <span>Open full ↗</span>
              </button>
            </div>

            {/* Interactive Spotlight Target Card */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-white/[0.02] border border-[#00F5D4]/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#00F5D4] text-[#05070B] font-mono font-bold text-xs rounded">
                      FLAGSHIP HAZARD: SX-T07
                    </span>
                    <span className="font-display font-semibold text-sm text-white">Ghost Net (ALDFG)</span>
                  </div>
                  <span className="font-mono font-bold text-[#00F5D4] text-sm">94.7% CONFIDENCE</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <span className="text-slate-400 text-[10px] block">WGS-84 LOCATION</span>
                    <strong className="text-slate-200">18.5204° N, 73.8567° E</strong>
                  </div>
                  <div className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <span className="text-slate-400 text-[10px] block">BATHYMETRIC DEPTH</span>
                    <strong className="text-[#00F5D4]">43.1 m (USBL Fix)</strong>
                  </div>
                  <div className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <span className="text-slate-400 text-[10px] block">SHADOW RELIEF</span>
                    <strong className="text-slate-200">2.31 m (0.82m vertical)</strong>
                  </div>
                  <div className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <span className="text-slate-400 text-[10px] block">EVIDENCE MATCH</span>
                    <strong className="text-[#00F5D4]">96% Shadow · 92% Shape</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-slate-200 leading-relaxed rounded-lg">
                  <strong className="text-[#00F5D4]">Acoustic Noise Filter Verdict: </strong>
                  Passed. Object exhibits specular highlight relief followed by acoustic shadow void, distinct from flat seabed sediment.
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setActiveTab('mission')}
                  className="flex-1 py-2.5 bg-[#00F5D4] hover:bg-[#5EFFD8] text-[#05070B] font-display font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,245,212,0.3)] transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>LAUNCH TACTICAL RADAR HUD</span>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] hover:border-white/[0.2] text-slate-200 font-display font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>View Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS: THE 6-STAGE PIPELINE
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="pipeline" className="space-y-8">
        <div className="max-w-2xl space-y-2 reveal">
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-[#FFFFFF] tracking-tight">
            How it works
          </h2>
          <p className="text-[16px] text-[#8CA6B8] leading-relaxed">
            The same six-stage pipeline that runs inside Mission Control, from raw sonar to a finished report.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 reveal">
          <div className="p-5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 rounded-xs space-y-2 transition-all group">
            <span className="font-mono text-xs text-[#00D4AA] font-bold block">01</span>
            <h3 className="font-display font-semibold text-base text-[#FFFFFF] group-hover:text-[#00D4AA] transition-colors">Ingest</h3>
            <p className="text-[13.5px] text-[#8CA6B8] leading-relaxed">
              Raw side-scan sonar survey data enters the pipeline.
            </p>
          </div>

          <div className="p-5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 rounded-xs space-y-2 transition-all group">
            <span className="font-mono text-xs text-[#00D4AA] font-bold block">02</span>
            <h3 className="font-display font-semibold text-base text-[#FFFFFF] group-hover:text-[#00D4AA] transition-colors">Denoise</h3>
            <p className="text-[13.5px] text-[#8CA6B8] leading-relaxed">
              Speckle and seabed texture are suppressed before detection.
            </p>
          </div>

          <div className="p-5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 rounded-xs space-y-2 transition-all group">
            <span className="font-mono text-xs text-[#00D4AA] font-bold block">03</span>
            <h3 className="font-display font-semibold text-base text-[#FFFFFF] group-hover:text-[#00D4AA] transition-colors">Detect</h3>
            <p className="text-[13.5px] text-[#8CA6B8] leading-relaxed">
              YOLOv8n locates candidate contacts in the imagery.
            </p>
          </div>

          <div className="p-5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 rounded-xs space-y-2 transition-all group">
            <span className="font-mono text-xs text-[#00D4AA] font-bold block">04</span>
            <h3 className="font-display font-semibold text-base text-[#FFFFFF] group-hover:text-[#00D4AA] transition-colors">Filter</h3>
            <p className="text-[13.5px] text-[#8CA6B8] leading-relaxed">
              Confidence scoring removes low-quality candidates.
            </p>
          </div>

          <div className="p-5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 rounded-xs space-y-2 transition-all group">
            <span className="font-mono text-xs text-[#00D4AA] font-bold block">05</span>
            <h3 className="font-display font-semibold text-base text-[#FFFFFF] group-hover:text-[#00D4AA] transition-colors">Classify</h3>
            <p className="text-[13.5px] text-[#8CA6B8] leading-relaxed">
              Remaining contacts are tagged to MoES debris taxonomy.
            </p>
          </div>

          <div className="p-5 bg-[#05121F] border border-[#0D2E4A] hover:border-[#00D4AA]/60 rounded-xs space-y-2 transition-all group">
            <span className="font-mono text-xs text-[#00D4AA] font-bold block">06</span>
            <h3 className="font-display font-semibold text-base text-[#FFFFFF] group-hover:text-[#00D4AA] transition-colors">Report</h3>
            <p className="text-[13.5px] text-[#8CA6B8] leading-relaxed">
              Geotagged, prioritized findings are written up automatically.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5 — IMPACT: WHAT THAT CHANGES FOR A SURVEY TEAM
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="impact" className="space-y-6">
        <div className="max-w-2xl space-y-2 reveal">
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-[#FFFFFF] tracking-tight">
            What that changes for a survey team
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-[#05121F] border border-[#0D2E4A] rounded-xs space-y-2 reveal">
            <h3 className="font-display font-semibold text-base text-[#FFFFFF]">Faster detection</h3>
            <p className="text-[14px] text-[#8CA6B8] leading-relaxed">
              Contacts surface as the survey is processed, not after a manual review queue.
            </p>
          </div>

          <div className="p-6 bg-[#05121F] border border-[#0D2E4A] rounded-xs space-y-2 reveal">
            <h3 className="font-display font-semibold text-base text-[#FFFFFF]">Automated reporting</h3>
            <p className="text-[14px] text-[#8CA6B8] leading-relaxed">
              Findings are written up and geotagged without a separate write-up step.
            </p>
          </div>

          <div className="p-6 bg-[#05121F] border border-[#0D2E4A] rounded-xs space-y-2 reveal">
            <h3 className="font-display font-semibold text-base text-[#FFFFFF]">Less inspection effort</h3>
            <p className="text-[14px] text-[#8CA6B8] leading-relaxed">
              Analysts review flagged, filtered contacts instead of raw, noisy imagery.
            </p>
          </div>

          <div className="p-6 bg-[#05121F] border border-[#0D2E4A] rounded-xs space-y-2 reveal">
            <h3 className="font-display font-semibold text-base text-[#FFFFFF]">Cleaner, safer oceans</h3>
            <p className="text-[14px] text-[#8CA6B8] leading-relaxed">
              Debris and hazards get found and acted on before they're forgotten at depth.
            </p>
          </div>
        </div>
      </section>

      {/* ── TECHNICAL STACK LINE ── */}
      <div className="text-center font-mono text-xs text-[#7C98A6] pt-4 pb-2 border-t border-[#0D2E4A]/80 reveal">
        Python · YOLOv8n · ONNX Runtime · FastAPI · React · Vite · Leaflet · MoES SIH 2026
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CLOSING CTA & TEAM CREDITS
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#05121F] border border-[#0D2E4A] text-center p-10 md:p-14 space-y-5 rounded-xs shadow-2xl reveal">
        <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#FFFFFF] max-w-xl mx-auto tracking-tight">
          See the sonar-to-report pipeline running on real data.
        </h2>
        <p className="text-[#8CA6B8] text-[15px]">Live dashboard, no login required.</p>
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => setActiveTab('mission')}
            className="btn-primary cursor-pointer"
          >
            <span>View live dashboard</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <a
            href="https://github.com/jayraj175coder/side_sonar_detection_ml"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <GithubIcon className="w-4 h-4 text-[#A6C0CE]" />
            <span>View the repo</span>
          </a>
        </div>
      </div>

      <div className="text-center font-mono text-xs text-[#94A3B8] -mt-6">
        Team DEAD BRAINCELLS — Smart India Hackathon 2026
      </div>
    </div>
  );
};
