export type Operation =
  | 'compress'
  | 'convert-to-png'
  | 'remove-background'
  | 'duplicate';

export interface ImageResult {
  name: string;
  mime: string;
  size: number;
  base64?: string;
  downloadUrl?: string;
}

export interface ApiResponse {
  results: ImageResult[];
  meta?: Record<string, unknown>;
  error?: string;
}

