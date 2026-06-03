"use client";

import { useState } from "react";
import Icon from "./Icon";
import type { GeneratedScript } from "@/lib/types";

function scriptToText(script: GeneratedScript): string {
  const lines = [script.title, ""];
  for (const b of script.blocks) {
    lines.push(`## ${b.label}${b.timestamp ? ` (${b.timestamp})` : ""}`);
    if (b.body) lines.push(b.body);
    if (b.items) b.items.forEach((i) => lines.push(`- ${i}`));
    lines.push("");
  }
  return lines.join("\n");
}

export default function ScriptSection({ script }: { script: GeneratedScript }) {
  const [copied, setCopied] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(scriptToText(script));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const download = () => {
    const blob = new Blob([scriptToText(script)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guion-creatorlens.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-20 scroll-mt-28" id="script">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="font-display text-display text-on-surface text-tighter">
            Guion Sugerido
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            Estructura narrativa premium con nuevos ángulos de valor.
          </p>
          {script.transcriptSource && script.transcriptSource !== "none" && (
            <div className="mt-4 inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-1.5 rounded-full text-label-sm font-semibold">
              <Icon
                name={script.transcriptSource === "gemini" ? "verified" : "science"}
                size={18}
              />
              {script.transcriptSource === "gemini"
                ? "Basado en la transcripción real (Gemini 3 Flash)"
                : "Transcripción demo (configura REPLICATE_API_TOKEN)"}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={copy}
            title="Copiar guion"
            className="w-14 h-14 rounded-full glass-premium flex items-center justify-center hover:bg-white smooth-transition"
          >
            <Icon
              name={copied ? "check" : "content_copy"}
              className="text-on-surface-variant"
            />
          </button>
          <button
            onClick={download}
            title="Descargar guion"
            className="w-14 h-14 rounded-full glass-premium flex items-center justify-center hover:bg-white smooth-transition"
          >
            <Icon name="download" className="text-on-surface-variant" />
          </button>
        </div>
      </div>

      <div className="glass-premium p-8 md:p-12 text-body-lg leading-loose text-on-surface-variant space-y-10 rounded-xl shadow-2xl">
        {script.blocks.map((b, idx) => {
          if (b.kind === "angle") {
            return (
              <div
                key={idx}
                className="bg-tertiary-container/5 border-l-4 border-tertiary-container p-8 rounded-r-xl"
              >
                <p className="font-bold text-tertiary-container uppercase text-[11px] tracking-[0.2em] mb-3">
                  {b.label}
                </p>
                <p className="italic text-on-surface font-medium text-title-md leading-relaxed">
                  {b.body}
                </p>
              </div>
            );
          }
          if (b.kind === "value") {
            return (
              <div
                key={idx}
                className="bg-surface-container-low/60 p-8 rounded-2xl border border-white/50 space-y-6"
              >
                <p className="font-black text-on-surface text-[12px] uppercase tracking-widest flex items-center gap-2">
                  <Icon name="tips_and_updates" className="text-primary" />
                  {b.label}
                </p>
                <ul className="space-y-4 text-body-md font-medium text-on-surface-variant">
                  {b.items?.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return (
            <div key={idx} className="space-y-4">
              <p className="text-primary font-black uppercase text-[12px] tracking-widest">
                {b.timestamp ? `${b.timestamp} | ` : ""}
                {b.label}
              </p>
              <p className="text-on-surface font-medium leading-relaxed">
                {b.body}
              </p>
            </div>
          );
        })}
      </div>

      {script.transcript && (
        <div className="mt-8">
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="flex items-center gap-2 text-primary font-semibold hover:gap-3 smooth-transition"
          >
            <Icon name={showTranscript ? "expand_less" : "subtitles"} />
            {showTranscript
              ? "Ocultar transcripción del video original"
              : "Ver transcripción del video original"}
          </button>
          {showTranscript && (
            <pre className="mt-4 glass-premium rounded-xl p-6 md:p-8 text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed font-sans max-h-[480px] overflow-y-auto">
              {script.transcript}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
