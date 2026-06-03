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
  /** Origen de la transcripción usada como base ("gemini" | "demo" | "none"). */
  transcriptSource?: "gemini" | "demo" | "none";
  /** Transcripción detallada del video original (si se obtuvo). */
  transcript?: string;
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
