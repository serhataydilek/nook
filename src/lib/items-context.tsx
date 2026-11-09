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

/* ------------------------------------------------------------------ */
/* Development-only preview seed.                                      */
/* Active only when NODE_ENV === "development" (inlined at build      */
/* time), so production builds always start with the real empty       */
/* state — sample content never touches production accounts.           */
/* ------------------------------------------------------------------ */
const DEV_SEED: SavedItem[] = (() => {
  const svg = (inner: string) =>
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 125"><rect width="300" height="125" fill="#FFFDF8"/>${inner}</svg>`,
    )}`;
  const ink = "stroke='#1B1B1B' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'";
  const t = 1762600000000;
  return [
    {
      id: "seed-link-1",
      type: "link",
      title: "Cool article",
      url: "https://example.com/cool-article",
      description: "On sketching interfaces with a fineliner pen.",
      createdAt: t,
    },
    {
      id: "seed-link-2",
      type: "link",
      title: "Design inspo",
      url: "https://inspo.design",
      description: "Hand-drawn UI references and moodboards.",
      createdAt: t - 1000,
    },
    {
      id: "seed-link-3",
      type: "link",
      title: "Useful tools",
      url: "https://tools.example.com",
      description: "Little utilities I reach for every day.",
      createdAt: t - 2000,
    },
    {
      id: "seed-note-1",
      type: "note",
      title: "Ideas:",
      content: "• new collection\n• organize links\n• weekend project?",
      createdAt: t - 3000,
    },
    {
      id: "seed-note-2",
      type: "note",
      title: "Remember:",
      content: "[ ] review saves\n[ ] clean up notes\n[ ] plan next week",
      createdAt: t - 4000,
    },
    {
      id: "seed-img-1",
      type: "image",
      title: "",
      imageUrl: svg(
        `<path d="M25 105 L95 30 L125 68 L155 42 L240 105" ${ink}/><circle cx="225" cy="30" r="14" ${ink}/>`,
      ),
      createdAt: t - 5000,
    },
    {
      id: "seed-img-2",
      type: "image",
      title: "",
      imageUrl: svg(
        `<path d="M15 75 C 55 45, 85 95, 125 70 S 195 45, 235 80 S 275 92, 290 82" ${ink}/><path d="M15 100 C 65 75, 105 112, 155 90 S 235 72, 290 98" ${ink}/>`,
      ),
      createdAt: t - 6000,
    },
    {
      id: "seed-img-3",
      type: "image",
      title: "",
      imageUrl: svg(
        `<path d="M150 115 C 150 80, 150 55, 150 25" ${ink}/><path d="M150 78 C 122 70, 108 48, 112 26 C 137 32, 150 55, 150 78" ${ink}/><path d="M150 60 C 178 53, 192 32, 189 12 C 164 17, 150 38, 150 60" ${ink}/>`,
      ),
      createdAt: t - 7000,
    },
  ];
})();

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>(() =>
    process.env.NODE_ENV === "development" ? DEV_SEED : [],
  );

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
