import Icon from "./Icon";
import type { TitleAnalysis } from "@/lib/types";

export default function TitleCard({ data }: { data: TitleAnalysis }) {
  return (
    <div className="md:col-span-7 glass-premium p-8 md:p-10 space-y-8 md:space-y-10 rounded-xl hover-lift smooth-transition shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-headline-lg text-tighter">
          Optimización de Título
        </h2>
        <div className="bg-primary/5 border border-primary/10 text-primary px-5 py-2 rounded-full font-bold text-label-sm tracking-wider whitespace-nowrap">
          SCORE: {data.score}/100
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="bg-surface-container-low/40 rounded-xl p-6 border border-white/50">
          <p className="font-bold text-outline-variant uppercase text-[11px] tracking-widest mb-3">
            Título Original
          </p>
          <p className="text-body-lg text-on-surface-variant italic font-normal">
            &ldquo;{data.original}&rdquo;
          </p>
        </div>
        <div className="bg-primary/[0.03] rounded-xl p-7 border-l-4 border-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Icon name="stars" size={64} />
          </div>
          <p className="font-bold text-primary uppercase text-[11px] tracking-widest mb-3">
            Título Optimizado
          </p>
          <p className="text-title-md text-on-surface leading-tight">
            &ldquo;{data.optimized}&rdquo;
          </p>
        </div>
      </div>

      <div className="pt-2">
        <h3 className="font-bold text-outline-variant uppercase text-[11px] tracking-widest mb-6">
          Estilo de escritura
        </h3>
        <div className="flex flex-wrap gap-4">
          {data.styleTags.map((tag) => (
            <span
              key={tag.label}
              className="bg-white/80 border border-outline-variant/20 px-5 py-2.5 rounded-full text-body-md font-medium flex items-center gap-2.5 shadow-sm hover:shadow-md smooth-transition cursor-default"
            >
              <Icon name={tag.icon} className="text-primary" size={20} />
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
