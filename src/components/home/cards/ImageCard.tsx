"use client";

import { ImageOff } from "lucide-react";
import type { SavedItem } from "@/lib/types";
import type { ItemActions } from "../actions";
import DoodleIcon from "../../sketch/DoodleIcon";

export default function ImageCard({ item, actions }: { item: SavedItem; actions: ItemActions }) {
  const url = actions.imageUrl(item);
  if (!url) {
    return (
      <div className="grid aspect-[12/5] w-full place-items-center text-muted">
        <DoodleIcon icon={ImageOff} size={28} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- object URLs come from IndexedDB blobs / Supabase Storage later
    <img
      src={url}
      alt={item.title || "saved image"}
      data-no-drag
      onClick={() => actions.onOpenImage(item)}
      className="block aspect-[12/5] w-full cursor-zoom-in object-cover"
    />
  );
}
