import React, { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  RefreshCw,
  Download,
  Globe,
  Terminal,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MarketingAsset } from "../../types";

interface BotAgenciesTabProps {
  onAddMarketingLog?: (log: string) => void;
}

export default function BotAgenciesTab({
  onAddMarketingLog,
}: BotAgenciesTabProps) {
  // Image Generation States
  const [imagePrompt, setImagePrompt] = useState(
    "High end minimal modern cyber workstation workspace",
  );
  const [imageRatio, setImageRatio] = useState("16:9");
  const [generatedAssets, setGeneratedAssets] = useState<MarketingAsset[]>([]);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [compilationError, setCompilationError] = useState<string | null>(null);

  // Puppeteer Automator States
  const [puppeteerQuery, setPuppeteerQuery] = useState(
    "Scrape california enterprise tech positions needing AI developers",
  );
  const [puppeteerLogs, setPuppeteerLogs] = useState<string[]>([
    "[Social Automator] Pipeline scheduler active. Awaiting manual trigger instructions...",
  ]);
  const [puppeteerBusy, setPuppeteerBusy] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [puppeteerLogs]);

  // Real Marketing Image Asset generation using backend endpoint
  const generateMarketingImage = async () => {
    if (!imagePrompt.trim() || generatingImage) return;

    setGeneratingImage(true);
    setCompilationError(null);
    try {
      const response = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageRatio,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to contact image render stream.");
      }

      const data = await response.json();

      const newAsset: MarketingAsset = {
        id: `asset-${Date.now()}`,
        prompt: data.prompt,
        imageUrl: data.imageUrl,
        aspectRatio: data.aspectRatio,
        createdTime: data.time,
      };

      setGeneratedAssets((prev) => [newAsset, ...prev]);
    } catch (err: any) {
      setCompilationError(`Asset compilation failed: ${err.message}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  // Run Headless social search / scraping pipelines
  const handlePuppeteerRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puppeteerQuery.trim() || puppeteerBusy) return;

    setPuppeteerBusy(true);
    setPuppeteerLogs((prev) => [
      ...prev,
      `[Social Ops] Instantiating browser-use thread for instruction: "${puppeteerQuery}"`,
      `[Social Ops] Launching headless browser with viewport width=1280...`,
    ]);

    setTimeout(() => {
      setPuppeteerLogs((prev) => [
        ...prev,
        `[Social Ops] Evaluating DOM tree at target social profiles...`,
        `[Social Ops] Discovered 8 active recruiting and enterprise contract nodes!`,
      ]);
    }, 1000);

    setTimeout(() => {
      setPuppeteerLogs((prev) => [
        ...prev,
        `[Social Ops] [PROSPECT MATCH] Scraped lead: 'Alexander Vance, Director of Operations @ NextGen Tech'`,
        `[Social Ops] Custom message queued utilizing product catalogs...`,
        `[Social Ops] Dispatching conversion webhooks. Prospect converted successfully!`,
      ]);
      setPuppeteerBusy(false);
    }, 2500);
  };

  const getAspectStyle = (ratio: string) => {
    switch (ratio) {
      case "16:9":
        return "aspect-video";
      case "9:16":
        return "w-32 aspect-[9/16]";
      case "3:4":
        return "w-40 aspect-[3/4]";
      case "4:3":
        return "aspect-[4/3]";
      case "1:1":
        return "aspect-square";
      default:
        return "aspect-video";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Visual Image Marketing Asset engine */}
      <div className="bg-slate-950 rounded-sm border border-slate-850 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
          <ImageIcon className="w-4 h-4 text-blue-400" />
          <div>
            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
              AI Marketing Asset Engine
            </h3>
            <p className="text-[8.5px] font-mono text-slate-500">
              MODEL: GEMINI-2.5 FLASH IMAGE
            </p>
          </div>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[8.5px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
              Select Aspect Ratio Layout
            </label>
            <select
              value={imageRatio}
              onChange={(e) => setImageRatio(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1:1">1:1 (Square Standard)</option>
              <option value="3:4">3:4 (Portrait Feed)</option>
              <option value="4:3">4:3 (Landscape Grid)</option>
              <option value="9:16">9:16 (Tik-Tok, Shorts, Reel)</option>
              <option value="16:9">16:9 (X, LinkedIn Post)</option>
              <option value="2:3">2:3 (Pinterest Ratio)</option>
              <option value="3:2">3:2 (Camera Frame)</option>
              <option value="21:9">21:9 (Widescreen Banner)</option>
            </select>
          </div>

          <div>
            <label className="block text-[8.5px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
              Creative Vector Prompts
            </label>
            <textarea
              placeholder="e.g. Sleek abstract cyber grid workstation vector banner, isometric layout..."
              rows={3}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-sm p-2 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {compilationError && (
            <div className="bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-sm text-rose-300 text-xs font-mono leading-normal">
              ⚠ {compilationError}
            </div>
          )}

          <button
            onClick={generateMarketingImage}
            disabled={generatingImage}
            className="w-full bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 disabled:opacity-40 font-bold text-xs py-3 rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            {generatingImage ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                <span>Generating AI design layer...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ingest Visual Design</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Render Display */}
        <AnimatePresence>
          {generatedAssets.length > 0 && (
            <div className="border-t border-slate-850 pt-4 space-y-2">
              <span className="text-[9px] font-mono text-slate-500 block uppercase">
                Generated Promoshot
              </span>
              <div
                className={`overflow-hidden rounded-sm border border-slate-800 bg-slate-900 flex items-center justify-center ${getAspectStyle(generatedAssets[0].aspectRatio)}`}
              >
                <img
                  src={generatedAssets[0].imageUrl}
                  alt="AI Output"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <a
                href={generatedAssets[0].imageUrl}
                download={`aether_promo_${Date.now()}.png`}
                className="text-[9px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 cursor-pointer uppercase tracking-wider font-semibold"
              >
                <Download className="w-3 h-3" />
                <span>Download Asset Frame</span>
              </a>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Simulated Social Browser Puppeteer scrapper agency */}
      <div className="bg-slate-950 rounded-sm border border-slate-850 flex flex-col h-[480px]">
        <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe
              className="w-4 h-4 text-blue-400 animate-spin"
              style={{ animationDuration: "6s" }}
            />
            <div>
              <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
                Browser Automator (Sales Ops)
              </h3>
              <p className="text-[8.5px] font-mono text-slate-400">
                Headless Puppeteer Session
              </p>
            </div>
          </div>
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
        </div>

        {/* Simulated console output */}
        <div className="flex-1 p-4 overflow-y-auto fancy-scrollbar bg-slate-950 text-[#58a6ff] font-mono text-[10px] space-y-2 border-b border-slate-850">
          {puppeteerLogs.map((log, idx) => (
            <div key={idx} className="flex gap-1.5 leading-relaxed">
              <span className="text-slate-600 select-none">[{idx + 1}]</span>
              <span className="whitespace-pre-wrap">{log}</span>
            </div>
          ))}
          {puppeteerBusy && (
            <div className="flex items-center gap-1 text-teal-400 animate-pulse mt-2 font-mono">
              <Terminal className="w-3.5 h-3.5" />
              <span>
                [Puppeteer] Processing headless DOM page structures...
              </span>
            </div>
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Form client trigger */}
        <form
          onSubmit={handlePuppeteerRun}
          className="p-3 bg-slate-950 space-y-2"
        >
          <label className="block text-[8.5px] font-mono text-slate-500 uppercase font-bold">
            Dispatch Automator Scraper Script
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Scrape target recruitment pipelines..."
              value={puppeteerQuery}
              onChange={(e) => setPuppeteerQuery(e.target.value)}
              disabled={puppeteerBusy}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-sm px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              type="submit"
              disabled={!puppeteerQuery.trim() || puppeteerBusy}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm px-3.5 py-1.5 text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer disabled:opacity-40 font-mono"
            >
              <Play className="w-3 h-3" />
              <span>Run</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
