"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import TitleCard from "@/components/TitleCard";
import ThumbnailCard from "@/components/ThumbnailCard";
import ScriptSection from "@/components/ScriptSection";
import type { GeneratedScript, VideoAnalysis } from "@/lib/types";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scripting, setScripting] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!url.trim()) {
      setError("Pega el enlace de un video de YouTube.");
      return;
    }
    setError("");
    setAnalyzing(true);
    setScript(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("No se pudo analizar el video.");
      const data: VideoAnalysis = await res.json();
      setAnalysis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setAnalyzing(false);
    }
  };

  const generateScript = async () => {
    if (!analysis) return;
    setScripting(true);
    setScript(null);
    try {
      const res = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: analysis.title.optimized,
          sourceUrl: analysis.sourceUrl,
        }),
      });
      const data: GeneratedScript = await res.json();
      setScript(data);
      setTimeout(
        () =>
          document
            .getElementById("script")
            ?.scrollIntoView({ behavior: "smooth" }),
        60
      );
    } finally {
      setScripting(false);
    }
  };

  return (
    <>
      {/* Hero / Input */}
      <section className="pt-24 md:pt-32 pb-16 flex flex-col items-center text-center">
        <h1 className="font-display text-headline-lg-mobile md:text-display mb-10 md:mb-12 text-on-surface text-tighter max-w-2xl">
          Potencia tu contenido con{" "}
          <span className="text-primary italic">IA</span>
        </h1>
        <div className="w-full max-w-3xl glass-premium rounded-2xl p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 input-glow smooth-transition glow-focal">
          <div className="hidden sm:flex pl-5 text-primary/60 items-center">
            <Icon name="search" size={28} />
          </div>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-title-md font-medium placeholder:text-outline-variant py-4 sm:py-5 px-4 sm:px-0"
            placeholder="Pega el link de YouTube aquí…"
            type="text"
          />
          <button
            onClick={analyze}
            disabled={analyzing}
            className="bg-primary text-on-primary px-8 md:px-10 py-4 md:py-5 rounded-xl font-bold flex items-center justify-center gap-3 hover:brightness-110 smooth-transition shadow-xl shadow-primary/25 disabled:opacity-60"
          >
            <span>{analyzing ? "Analizando…" : "Analizar"}</span>
            <Icon
              name={analyzing ? "progress_activity" : "auto_awesome"}
              size={24}
              className={analyzing ? "animate-spin" : ""}
            />
          </button>
        </div>
        {error && (
          <p className="mt-4 text-error font-medium text-body-md">{error}</p>
        )}
        {!analysis && !analyzing && (
          <p className="mt-6 text-on-surface-variant/70 text-body-md max-w-md">
            Pega cualquier enlace y la IA generará un título optimizado, análisis
            de miniatura y un guion adaptado a tu canal.
          </p>
        )}
      </section>

      {/* Skeleton de carga */}
      {analyzing && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-7 glass-premium rounded-xl h-80 shimmer" />
          <div className="md:col-span-5 glass-premium rounded-xl h-80 shimmer" />
        </div>
      )}

      {/* Resultados */}
      {analysis && !analyzing && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <TitleCard data={analysis.title} />
          <ThumbnailCard
            data={analysis.thumbnail}
            onGenerateScript={generateScript}
            loading={scripting}
          />
        </div>
      )}

      {script && <ScriptSection script={script} />}
    </>
  );
}
