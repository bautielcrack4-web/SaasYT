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
  return (
    <div className="md:col-span-5 glass-premium p-8 md:p-10 flex flex-col rounded-xl hover-lift smooth-transition shadow-2xl">
      <h2 className="font-display text-headline-lg mb-8 text-tighter">
        Miniatura Optimizada
      </h2>
      <div className="relative group overflow-hidden rounded-xl aspect-video mb-8 bg-surface-container-high shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.imageUrl}
          alt="Miniatura optimizada"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
          <div className="flex items-center gap-3 text-white">
            <Icon name="visibility" className="animate-pulse" />
            <span className="text-label-sm font-bold tracking-widest uppercase">
              Previsualización de CTR
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-grow">
        {data.insights.map((insight) => (
          <div key={insight.title} className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-primary/10 rounded-full">
              <Icon
                name="check_circle"
                className="text-primary font-bold"
                size={20}
              />
            </div>
            <div>
              <p className="font-bold text-on-surface text-body-md">
                {insight.title}
              </p>
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
