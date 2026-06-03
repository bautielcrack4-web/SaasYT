"use client";

import { useState } from "react";
import VideoCard from "./VideoCard";
import ScriptSection from "./ScriptSection";
import type { ChannelVideoIdea, GeneratedScript } from "@/lib/types";

export default function ChannelGrid({
  title = "Análisis de Canal y Sugerencias",
  subtitle = "Temas de alta retención curados específicamente para tu nicho.",
  videos,
}: {
  title?: string;
  subtitle?: string;
  videos: ChannelVideoIdea[];
}) {
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const generate = async (video: ChannelVideoIdea) => {
    setLoadingId(video.id);
    setScript(null);
    try {
      const res = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: video.title }),
      });
      const data: GeneratedScript = await res.json();
      setScript(data);
      setTimeout(
        () => document.getElementById("script")?.scrollIntoView({ behavior: "smooth" }),
        60
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="mt-32 pb-4">
      <div className="mb-12 md:mb-16">
        <h2 className="font-display text-display text-on-surface text-tighter">
          {title}
        </h2>
        <p className="text-body-lg text-on-surface-variant mt-4">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} onGenerateScript={generate} />
        ))}
      </div>

      {loadingId && (
        <p className="mt-10 text-center text-on-surface-variant font-medium animate-pulse">
          Generando guion adaptado…
        </p>
      )}

      {script && <ScriptSection script={script} />}
    </section>
  );
}
