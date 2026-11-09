"use client";

/**
 * TEMPORARY in-memory store for Milestone 1 (layout verification only).
 * Milestone 2 replaces this module with Supabase: Postgres rows for items,
 * Storage objects for images, all protected by Row Level Security.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NewSavedItem, SavedItem } from "./types";

interface ItemsContextValue {
  items: SavedItem[];
  addItem: (input: NewSavedItem) => SavedItem;
  deleteItem: (id: string) => void;
}

const ItemsContext = createContext<ItemsContextValue | null>(null);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([]);

  const addItem = useCallback((input: NewSavedItem): SavedItem => {
    const item: SavedItem = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setItems((prev) => [item, ...prev]);
    return item;
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const value = useMemo(
    () => ({ items, addItem, deleteItem }),
    [items, addItem, deleteItem],
  );

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems(): ItemsContextValue {
  const ctx = useContext(ItemsContext);
  if (!ctx) {
    throw new Error("useItems must be used within <ItemsProvider>");
  }
  return ctx;
}
