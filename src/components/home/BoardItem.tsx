"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { SavedItem } from "@/lib/types";
import { PAD, snap } from "@/lib/layout";
import type { ItemActions } from "./actions";
import SketchBorder from "../sketch/SketchBorder";
import CardMenu from "./CardMenu";
import LinkCard from "./cards/LinkCard";
import NoteCard from "./cards/NoteCard";
import ImageCard from "./cards/ImageCard";
import ListCard from "./cards/ListCard";
import DrawingCard from "./cards/DrawingCard";

export interface BoardItemProps {
  item: SavedItem;
  actions: ItemActions;
  /** "free" = absolutely positioned & draggable; "grid"/"stack" = static flow */
  layout: "free" | "grid" | "stack";
  /** live drag position override (while dragging) */
  dragPos?: { x: number; y: number } | null;
  dragging?: boolean;
  boardW: number;
  onHeight: (id: string, h: number) => void;
  onPointerDownItem?: (id: string, e: ReactPointerEvent<HTMLElement>) => void;
}

export default function BoardItem({
  item,
  actions,
  layout,
  dragPos,
  dragging = false,
  boardW,
  onHeight,
  onPointerDownItem,
}: BoardItemProps) {
  const ref = useRef<HTMLElement>(null);
  const [liveW, setLiveW] = useState<number | null>(null);
  const resizeRef = useRef<{ startPX: number; origW: number } | null>(null);
  const liveWRef = useRef<number | null>(null);
  useEffect(() => {
    liveWRef.current = liveW;
  }, [liveW]);

  const isVisual = item.type === "image" || item.type === "drawing";
  const width = liveW ?? item.w;

  // report measured height so the board can size itself and resolve collisions
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) onHeight(item.id, entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [item.id, onHeight]);

  // resize via bottom-right handle (visual cards only)
  const onResizePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = { startPX: e.clientX, origW: item.w };
    setLiveW(item.w);
  };

  const isResizing = liveW !== null;
  useEffect(() => {
    if (!isResizing || !resizeRef.current) return;
    const onMove = (e: PointerEvent) => {
      const d = resizeRef.current;
      if (!d) return;
      const maxW = Math.max(220, boardW - (dragPos?.x ?? item.x) - PAD);
      const w = Math.min(Math.max(snap(d.origW + e.clientX - d.startPX), 220), maxW);
      setLiveW(w);
    };
    const onUp = () => {
      const w = liveWRef.current;
      resizeRef.current = null;
      setLiveW(null);
      if (w !== null && w !== item.w) void actions.updateItem(item.id, { w });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isResizing, boardW, dragPos?.x, item.x, item.w, item.id, actions]);

  const onResizeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    e.stopPropagation();
    const maxW = Math.max(220, boardW - item.x - PAD);
    const w = Math.min(Math.max(snap(item.w + (e.key === "ArrowRight" ? 16 : -16)), 220), maxW);
    void actions.updateItem(item.id, { w });
  };

  const style: CSSProperties =
    layout === "free"
      ? {
          position: "absolute",
          left: dragPos?.x ?? item.x,
          top: dragPos?.y ?? item.y,
          width,
          zIndex: dragging ? 40 : 1,
        }
      : { position: "relative", width: "100%" };

  return (
    <article
      ref={ref}
      className={`board-item item-card group ${dragging ? "board-dragging" : ""}`}
      style={style}
      data-static={layout !== "free" ? "true" : undefined}
      onPointerDown={(e) => onPointerDownItem?.(item.id, e)}
    >
      <SketchBorder
        seedKey={item.id}
        radius={0.5}
        className={`block h-full transition-transform duration-150 ease-out ${
          layout === "free" ? "hover:-rotate-[0.4deg]" : ""
        } ${isVisual ? "" : `card-content ${item.type === "note" ? "note-content" : ""}`}`}
      >
        <CardMenu item={item} actions={actions} />
        {item.type === "link" && <LinkCard item={item} actions={actions} />}
        {item.type === "note" && <NoteCard item={item} actions={actions} />}
        {item.type === "image" && <ImageCard item={item} actions={actions} />}
        {item.type === "list" && <ListCard item={item} actions={actions} />}
        {item.type === "drawing" && <DrawingCard item={item} actions={actions} />}
        {isVisual && (
          <div
            className="board-resize-handle"
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize ${item.title || item.type}`}
            tabIndex={0}
            onPointerDown={onResizePointerDown}
            onKeyDown={onResizeKeyDown}
            data-no-drag
          >
            <svg viewBox="0 0 10 10" className="h-3 w-3" aria-hidden="true">
              <path d="M9 1 L1 9 M9 5 L5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        )}
      </SketchBorder>
    </article>
  );
}
