import Icon from "./Icon";
import type { ChannelVideoIdea } from "@/lib/types";

const VIRALITY_COLOR: Record<ChannelVideoIdea["virality"], string> = {
  ALTA: "text-primary",
  CRÍTICA: "text-secondary",
  MEDIA: "text-tertiary",
};

export default function VideoCard({
  video,
  onGenerateScript,
}: {
  video: ChannelVideoIdea;
  onGenerateScript: (video: ChannelVideoIdea) => void;
}) {
  return (
    <div className="group glass-premium rounded-xl overflow-hidden hover-lift smooth-transition shadow-2xl">
      <div className="relative aspect-video overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
          src={video.thumbnailUrl}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
          <button
            onClick={() => onGenerateScript(video)}
            className="floating-button-reveal absolute left-1/2 top-1/2 bg-white text-on-surface px-8 py-3.5 rounded-full font-bold text-body-md shadow-2xl flex items-center gap-2 whitespace-nowrap hover:bg-primary hover:text-on-primary"
          >
            <Icon name="auto_fix_high" size={20} />
            Generar Script
          </button>
        </div>
      </div>
      <div className="p-7 md:p-8">
        <h3 className="font-title-md text-on-surface leading-tight text-tighter line-clamp-2">
          {video.title}
        </h3>
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
