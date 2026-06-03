// Tipos compartidos para CreatorLens AI.

export interface TitleAnalysis {
  original: string;
  optimized: string;
  score: number;
  styleTags: { label: string; icon: string }[];
}

export interface ThumbnailAnalysis {
  imageUrl: string;
  insights: { title: string; description: string }[];
}

export interface VideoAnalysis {
  videoId: string | null;
  sourceUrl: string;
  title: TitleAnalysis;
  thumbnail: ThumbnailAnalysis;
  /** Transcripción del video (base para título y guion). */
  transcript?: string;
  transcriptSource?: "captions" | "gemini";
  /** Autor/canal real del video (de YouTube oEmbed). */
  author?: string;
}

export interface ScriptBlock {
  kind: "angle" | "section" | "value";
  label: string;
  timestamp?: string;
  body?: string;
  items?: string[];
}

export interface GeneratedScript {
  title: string;
  blocks: ScriptBlock[];
  /** Transcripción detallada del video original usada como base. */
  transcript?: string;
  transcriptSource?: "captions" | "gemini";
}

export interface ChannelVideoIdea {
  id: string;
  title: string;
  thumbnailUrl: string;
  virality: "ALTA" | "CRÍTICA" | "MEDIA";
}

export interface ChannelAnalysis {
  id: string;
  channelName: string;
  createdAt: number;
  adaptedTitle: string;
  thumbnailStyle: string;
  videos: ChannelVideoIdea[];
}
