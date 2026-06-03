"use client";

import { useState } from "react";
import Icon from "./Icon";
import type { ThumbnailAnalysis } from "@/lib/types";

export default function ThumbnailCard({
  data,
  onGenerateScript,
  loading,
}: {
  data: ThumbnailAnalysis;
  onGenerateScript: () => void;
  loading: boolean;
}) {
  // `data.imageUrl` es la miniatura original (referencia). Al generar, la
  // sustituimos por la versión optimizada con gpt-image-2.
  const [image, setImage] = useState(data.imageUrl);
  const [generated, setGenerated] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setGenLoading(true);
    setError("");
    try {
      const res = await fetch("/api/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: data.imageUrl,
          instructions:
            "Analiza esta miniatura de YouTube y crea una nueva con el MISMO estilo visual (composición, paleta, iluminación) pero con un TEXTO distinto y otro ángulo del tema.",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo generar.");
      setImage(json.imageUrl);
      setGenerated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="md:col-span-5 glass-premium p-8 md:p-10 flex flex-col rounded-xl hover-lift smooth-transition shadow-2xl">
      <h2 className="font-display text-headline-lg mb-8 text-tighter">
        Miniatura Optimizada
      </h2>
      <div className="relative group overflow-hidden rounded-xl aspect-video mb-6 bg-surface-container-high shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Miniatura optimizada"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
          <div className="flex items-center gap-3 text-white">
            <Icon name="visibility" className="animate-pulse" />
            <span className="text-label-sm font-bold tracking-widest uppercase">
              {generated ? "Generada con gpt-image-2" : "Miniatura original (referencia)"}
            </span>
          </div>
        </div>
        {genLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <Icon name="progress_activity" className="animate-spin text-primary" size={40} />
          </div>
        )}
      </div>

      <button
        onClick={generate}
        disabled={genLoading}
        className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex justify-center items-center gap-3 hover:brightness-110 smooth-transition active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-60 mb-6"
      >
        <Icon name={genLoading ? "progress_activity" : "auto_fix_high"} className={genLoading ? "animate-spin" : ""} />
        {genLoading
          ? "Generando miniatura…"
          : generated
            ? "Regenerar miniatura"
            : "Generar miniatura optimizada"}
      </button>

      {error && <p className="text-error text-body-md font-medium mb-4">{error}</p>}

      <div className="space-y-6 flex-grow">
        {data.insights.map((insight) => (
          <div key={insight.title} className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-primary/10 rounded-full">
              <Icon name="check_circle" className="text-primary font-bold" size={20} />
            </div>
            <div>
              <p className="font-bold text-on-surface text-body-md">{insight.title}</p>
              <p className="text-on-surface-variant text-body-md font-normal leading-relaxed">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onGenerateScript}
        disabled={loading}
        className="mt-10 w-full bg-secondary text-on-secondary py-5 rounded-xl font-bold flex justify-center items-center gap-3 hover:brightness-110 smooth-transition active:scale-95 shadow-xl shadow-secondary/20 disabled:opacity-60"
      >
        <Icon name={loading ? "progress_activity" : "description"} className={loading ? "animate-spin" : ""} />
        {loading ? "Generando guion…" : "Generar Script Adaptado"}
      </button>
    </div>
  );
}
