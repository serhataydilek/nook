export type ItemType = "link" | "image" | "note" | "drawing" | "list";

export type Filter = "all" | ItemType;

export type View = "home" | "all" | "collections" | "settings";

export interface ListEntry {
  id: string;
  text: string;
  checked: boolean;
}

export interface Stroke {
  tool: "pen" | "eraser";
  width: number;
  color: string;
  points: { x: number; y: number }[];
}

export interface SavedItem {
  id: string;
  type: ItemType;
  createdAt: number;
  updatedAt: number;
  /** link */
  title?: string;
  url?: string;
  description?: string;
  /** image — references a blob in the "blobs" store */
  blobId?: string;
  /** note */
  content?: string;
  /** drawing */
  strokes?: Stroke[];
  drawW?: number;
  drawH?: number;
  /** list */
  list?: ListEntry[];
  /** freeform board layout (px, desktop) */
  x: number;
  y: number;
  w: number;
  /** optional organization */
  collectionIds?: string[];
}

export type NewSavedItem = Omit<SavedItem, "id" | "createdAt" | "updatedAt">;

export interface Collection {
  id: string;
  name: string;
  createdAt: number;
}
