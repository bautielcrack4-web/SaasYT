"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";
import ChannelGrid from "@/components/ChannelGrid";
import { saveChannel } from "@/lib/history";
import type { ChannelAnalysis } from "@/lib/types";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  image?: string;
}

export default function CreateChannelPage() {
  const [channelName, setChannelName] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "¡Hola! Sube una captura de un canal de YouTube y dime su nombre. Analizaré su estilo y generaré 9 ideas de video con miniaturas y títulos adaptados a tu canal.",
    },
  ]);
  const [analysis, setAnalysis] = useState<ChannelAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!channelName.trim() && !screenshot) return;
    const name = channelName.trim() || "Canal de YouTube";

    setMessages((m) => [
      ...m,
      {
        role: "user",
        text: channelName.trim()
          ? `Analiza el canal: ${name}`
          : "Analiza este canal",
        image: screenshot ?? undefined,
      },
      { role: "ai", text: "Analizando estilo, nicho y oportunidades de contenido…" },
    ]);
    setLoading(true);
    setAnalysis(null);

    try {
      const res = await fetch("/api/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName: name, screenshot }),
      });
      const data: ChannelAnalysis = await res.json();
      setAnalysis(data);
      saveChannel(data);
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: `Listo ✨ Generé 9 ideas para "${data.channelName}". Estilo de miniatura sugerido: ${data.thumbnailStyle} Guardé este canal en tu historial.`,
        },
      ]);
    } finally {
      setLoading(false);
      setScreenshot(null);
      setChannelName("");
    }
  };

  return (
    <>
      <section className="pt-24 md:pt-32 pb-10">
        <h1 className="font-display text-headline-lg-mobile md:text-display text-on-surface text-tighter">
          Crear Canal con <span className="text-primary italic">IA</span>
        </h1>
        <p className="text-body-lg text-on-surface-variant mt-4 max-w-2xl">
          Sube la captura de un canal de referencia y genera una cuadrícula de 9
          videos adaptados a tu propio estilo.
        </p>
      </section>

      {/* Chat */}
      <div className="glass-premium rounded-xl p-6 md:p-8 shadow-2xl space-y-6 max-w-3xl">
        <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] bg-primary text-on-primary rounded-2xl rounded-br-sm px-5 py-3.5 shadow-lg shadow-primary/20"
                    : "max-w-[85%] bg-surface-container-low/70 border border-white/60 rounded-2xl rounded-bl-sm px-5 py-3.5"
                }
              >
                {m.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={m.image}
                    alt="captura del canal"
                    className="rounded-lg mb-3 max-h-48 object-cover"
                  />
                )}
                <p className="text-body-md leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-white/60 pt-5 space-y-4">
          {screenshot && (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshot}
                alt="preview"
                className="h-20 rounded-lg border border-white/60"
              />
              <button
                onClick={() => setScreenshot(null)}
                className="absolute -top-2 -right-2 bg-error text-on-error rounded-full w-6 h-6 flex items-center justify-center shadow"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              title="Subir captura"
              className="w-12 h-12 shrink-0 rounded-full glass-premium flex items-center justify-center hover:bg-white smooth-transition"
            >
              <Icon name="add_photo_alternate" className="text-primary" />
            </button>
            <input
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && submit()}
              placeholder="Nombre del canal a analizar…"
              className="w-full bg-surface-container-low/60 border border-white/60 rounded-full px-5 py-3.5 text-body-md focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={loading || (!channelName.trim() && !screenshot)}
              className="w-12 h-12 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center hover:brightness-110 smooth-transition active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/25"
            >
              <Icon
                name={loading ? "progress_activity" : "send"}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Resultado: cuadrícula 3x3 */}
      {analysis && (
        <ChannelGrid
          title={analysis.channelName}
          subtitle="9 ideas de video adaptadas a tu canal · pasa el cursor para generar miniatura o guion."
          videos={analysis.videos}
          thumbnailStyle={analysis.thumbnailStyle}
        />
      )}
    </>
  );
}
