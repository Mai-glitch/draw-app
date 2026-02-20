export interface Drawing {
  id: string;
  name: string;
  dataUrl: string;
  thumbnailDataUrl: string;
  createdAt: number;
  updatedAt: number;
  width: number;
  height: number;
}

export interface DrawingTool {
  type: 'brush' | 'eraser' | 'text' | 'image';
  size: number;
  color: string;
}

export interface CanvasState {
  isDrawing: boolean;
  currentTool: DrawingTool;
  startX: number;
  startY: number;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

export interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface CanvasElement {
  type: 'path' | 'text' | 'image';
  data: PathElement | TextElement | ImageElement;
}

export interface PathElement {
  id: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  size: number;
  tool: 'brush' | 'eraser';
}

export const DEFAULT_TOOL: DrawingTool = {
  type: 'brush',
  size: 5,
  color: '#000000'
};

export const DEFAULT_CANVAS_WIDTH = 800;
export const DEFAULT_CANVAS_HEIGHT = 600;

export const FUNKY_COLORS = [
  '#f97316', // Orange
  '#d946ef', // Magenta
  '#ff5252', // Coral
  '#facc15', // Lemon
  '#0ea5e9', // Azure
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#ec4899', // Pink
];
