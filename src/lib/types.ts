export type ItemType = "link" | "image" | "note";

export type Filter = "all" | ItemType;

export type View = "home" | "all" | "collections" | "settings";

export interface SavedItem {
  id: string;
  type: ItemType;
  title: string;
  /** link */
  url?: string;
  description?: string;
  /** image */
  imageUrl?: string;
  /** note */
  content?: string;
  createdAt: number;
}

export type NewSavedItem = Omit<SavedItem, "id" | "createdAt">;
