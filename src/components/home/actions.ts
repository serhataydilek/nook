import type { Collection, SavedItem } from "@/lib/types";

/** Actions every workspace card can invoke, provided by HomeShell. */
export interface ItemActions {
  updateItem: (id: string, patch: Partial<SavedItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  imageUrl: (item: SavedItem) => string | null;
  onEditDrawing: (item: SavedItem) => void;
  onOpenImage: (item: SavedItem) => void;
  collections: Collection[];
  onToggleCollection: (itemId: string, collectionId: string) => Promise<void>;
  onCreateCollection: (name: string) => Promise<Collection>;
}
