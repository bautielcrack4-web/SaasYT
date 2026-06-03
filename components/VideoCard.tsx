"use client";

import { useState } from "react";
import Icon from "./Icon";
import type { ChannelVideoIdea } from "@/lib/types";

const VIRALITY_COLOR: Record<ChannelVideoIdea["virality"], string> = {
  ALTA: "text-primary",
  CRÍTICA: "text-secondary",
  MEDIA: "text-tertiary",
};

export default function VideoCard({
  video,
  thumbnailStyle,
  onGenerateScript,
}: {
  video: ChannelVideoIdea;
  thumbnailStyle?: string;
  onGenerateScript: (video: ChannelVideoIdea) => void;
}) {
  const [image, setImage] = useState(video.thumbnailUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateThumb = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructions: `${thumbnailStyle ? `Estilo de miniatura del canal: ${thumbnailStyle}. ` : ""}El video se titula: "${video.title}". Crea una miniatura de YouTube con ese estilo y un texto/gancho corto acorde al título.`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo generar.");
      setImage(json.imageUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = "miniatura-creatorlens.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="group glass-premium rounded-xl overflow-hidden hover-lift smooth-transition shadow-2xl">
      <div className="relative aspect-video overflow-hidden bg-surface-container-high">
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            src={image}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 via-secondary/10 to-surface-container p-5 text-center">
            <span className="text-on-surface-variant/70 text-body-md font-semibold line-clamp-3">
              {video.title}
            </span>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <Icon name="progress_activity" className="animate-spin text-primary" size={36} />
          </div>
        )}

        {!loading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-3">
            <button
              onClick={generateThumb}
              className="bg-white text-on-surface px-6 py-3 rounded-full font-bold text-body-md shadow-2xl flex items-center gap-2 whitespace-nowrap hover:bg-primary hover:text-on-primary smooth-transition"
            >
              <Icon name="image" size={20} />
              {image ? "Regenerar miniatura" : "Generar miniatura"}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => onGenerateScript(video)}
                className="bg-secondary text-on-secondary px-6 py-3 rounded-full font-bold text-body-md shadow-2xl flex items-center gap-2 whitespace-nowrap hover:brightness-110 smooth-transition"
              >
                <Icon name="auto_fix_high" size={20} />
                Generar Script
              </button>
              {image && (
                <button
                  onClick={download}
                  title="Descargar miniatura"
                  className="bg-white text-on-surface w-12 rounded-full shadow-2xl flex items-center justify-center hover:bg-primary hover:text-on-primary smooth-transition"
                >
                  <Icon name="download" size={20} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="p-7 md:p-8">
        <h3 className="font-title-md text-on-surface leading-tight text-tighter line-clamp-2">
          {video.title}
        </h3>
        {error && <p className="text-error text-body-md font-medium mt-3">{error}</p>}
        <div className="flex items-center justify-between mt-5">
          <span className="text-on-surface-variant text-body-md font-medium">
            Viralidad:{" "}
            <span className={`font-bold ${VIRALITY_COLOR[video.virality]}`}>
              {video.virality}
            </span>
          </span>
          <Icon name="trending_up" className="text-primary/40" />
        </div>
      </div>
    </div>
  );
}
