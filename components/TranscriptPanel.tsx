"use client";

import { useState } from "react";
import Icon from "./Icon";

interface TranscriptResult {
  transcript: string;
  source: "gemini" | "demo";
}

export default function TranscriptPanel({
  url,
  initialTranscript,
  initialSource,
}: {
  url: string;
  initialTranscript?: string;
  initialSource?: "gemini" | "demo";
}) {
  const [transcript, setTranscript] = useState<string>(initialTranscript || "");
  const [source, setSource] = useState<"gemini" | "demo" | null>(
    initialSource || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo transcribir.");
      const d = data as TranscriptResult;
      setTranscript(d.transcript);
      setSource(d.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <section className="mt-20 scroll-mt-28" id="transcript">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="font-display text-headline-lg text-on-surface text-tighter">
            Transcripción del Video
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-3">
            El contenido hablado del link, con marcas de tiempo.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {transcript && (
            <button
              onClick={copy}
              title="Copiar transcripción"
              className="w-14 h-14 rounded-full glass-premium flex items-center justify-center hover:bg-white smooth-transition"
            >
              <Icon
                name={copied ? "check" : "content_copy"}
                className="text-on-surface-variant"
              />
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="bg-primary text-on-primary px-7 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:brightness-110 smooth-transition shadow-xl shadow-primary/25 disabled:opacity-60"
          >
            <Icon
              name={loading ? "progress_activity" : transcript ? "refresh" : "subtitles"}
              size={22}
              className={loading ? "animate-spin" : ""}
            />
            {loading
              ? "Transcribiendo…"
              : transcript
                ? "Volver a transcribir"
                : "Ver transcripción"}
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-premium rounded-xl p-6 flex items-start gap-3 text-error">
          <Icon name="error" />
          <p className="text-body-md font-medium">{error}</p>
        </div>
      )}

      {loading && !transcript && (
        <div className="glass-premium rounded-xl h-48 shimmer" />
      )}

      {transcript && (
        <div className="glass-premium rounded-xl p-8 md:p-10 shadow-2xl">
          {source && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-label-sm font-semibold mb-6 ${
                source === "gemini"
                  ? "bg-primary/5 border border-primary/10 text-primary"
                  : "bg-tertiary/5 border border-tertiary/20 text-tertiary"
              }`}
            >
              <Icon
                name={source === "gemini" ? "verified" : "science"}
                size={18}
              />
              {source === "gemini"
                ? "Transcripción real · Gemini 3 Flash"
                : "Transcripción demo · configura REPLICATE_API_TOKEN"}
            </div>
          )}
          <pre className="text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed font-sans max-h-[520px] overflow-y-auto">
            {transcript}
          </pre>
        </div>
      )}
    </section>
  );
}
