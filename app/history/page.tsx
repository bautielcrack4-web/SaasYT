"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import ChannelGrid from "@/components/ChannelGrid";
import { deleteChannel, getHistory } from "@/lib/history";
import type { ChannelAnalysis } from "@/lib/types";

export default function HistoryPage() {
  const [channels, setChannels] = useState<ChannelAnalysis[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setChannels(getHistory());
  }, []);

  const remove = (id: string) => {
    deleteChannel(id);
    setChannels(getHistory());
    if (openId === id) setOpenId(null);
  };

  const open = channels.find((c) => c.id === openId);

  return (
    <>
      <section className="pt-24 md:pt-32 pb-10">
        <h1 className="font-display text-headline-lg-mobile md:text-display text-on-surface text-tighter">
          Historial
        </h1>
        <p className="text-body-lg text-on-surface-variant mt-4 max-w-2xl">
          Cada canal analizado con su cuadrícula de videos queda guardado aquí.
        </p>
      </section>

      {channels.length === 0 && (
        <div className="glass-premium rounded-xl p-12 text-center shadow-2xl">
          <Icon name="history" size={48} className="text-primary/40" />
          <p className="text-title-md text-on-surface mt-4">
            Aún no hay canales guardados
          </p>
          <p className="text-on-surface-variant mt-2">
            Crea tu primer análisis en la sección{" "}
            <Link href="/create-channel" className="text-primary font-semibold">
              Crear Canal
            </Link>
            .
          </p>
        </div>
      )}

      {!open && channels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {channels.map((c) => (
            <div
              key={c.id}
              className="group glass-premium rounded-xl overflow-hidden hover-lift smooth-transition shadow-2xl cursor-pointer"
              onClick={() => setOpenId(c.id)}
            >
              <div className="relative aspect-video overflow-hidden">
                {c.videos[0]?.thumbnailUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.videos[0].thumbnailUrl}
                    alt={c.channelName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/15 to-surface-container" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-5">
                  <span className="text-white font-bold text-title-md text-tighter">
                    {c.channelName}
                  </span>
                </div>
              </div>
              <div className="p-6 flex items-center justify-between">
                <span className="text-on-surface-variant text-body-md font-medium">
                  {c.videos.length} videos ·{" "}
                  {new Date(c.createdAt).toLocaleDateString("es")}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(c.id);
                  }}
                  className="text-outline hover:text-error smooth-transition"
                  title="Eliminar"
                >
                  <Icon name="delete" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <>
          <button
            onClick={() => setOpenId(null)}
            className="flex items-center gap-2 text-primary font-semibold hover:gap-3 smooth-transition"
          >
            <Icon name="arrow_back" /> Volver al historial
          </button>
          <ChannelGrid
            title={open.channelName}
            subtitle={`Guardado el ${new Date(open.createdAt).toLocaleString("es")} · pasa el cursor para generar miniatura o guion.`}
            videos={open.videos}
            thumbnailStyle={open.thumbnailStyle}
          />
        </>
      )}
    </>
  );
}
