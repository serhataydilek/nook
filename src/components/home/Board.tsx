"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { SavedItem } from "@/lib/types";
import { GAP, PAD, cascadeNoOverlap, clampX, resolveDrop, snap, tidyPositions } from "@/lib/layout";
import { useMediaQuery } from "@/lib/use-media-query";
import type { ItemActions } from "./actions";
import BoardItem from "./BoardItem";

export interface BoardProps {
  items: SavedItem[];
  actions: ItemActions;
  layout: "free" | "grid";
  boardAreaRef: RefObject<HTMLDivElement | null>;
  tidySignal: number;
}

const EST_H: Record<SavedItem["type"], number> = {
  link: 130,
  note: 170,
  image: 190,
  list: 170,
  drawing: 260,
};

export default function Board({ items, actions, layout, boardAreaRef, tidySignal }: BoardProps) {
  const desktop = useMediaQuery("(min-width: 768px)");
  const innerRef = useRef<HTMLDivElement>(null);
  const [boardW, setBoardW] = useState(0);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const heightsRef = useRef(heights);
  useEffect(() => {
    heightsRef.current = heights;
  }, [heights]);

  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);
  const dragRef = useRef<{
    id: string;
    startPX: number;
    startPY: number;
    origX: number;
    origY: number;
    w: number;
    h: number;
  } | null>(null);
  const dragPosRef = useRef(dragPos);
  useEffect(() => {
    dragPosRef.current = dragPos;
  }, [dragPos]);

  const setInnerRef = useCallback(
    (el: HTMLDivElement | null) => {
      innerRef.current = el;
      if (boardAreaRef) boardAreaRef.current = el;
    },
    [boardAreaRef],
  );

  // measure board width
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setBoardW(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout]);

  const onHeight = useCallback((id: string, h: number) => {
    setHeights((prev) => (Math.abs((prev[id] ?? 0) - h) < 1 ? prev : { ...prev, [id]: h }));
  }, []);

  const rectsOf = useCallback(
    (exceptId?: string) =>
      items
        .filter((it) => it.id !== exceptId)
        .map((it) => ({ id: it.id, x: it.x, y: it.y, w: it.w, h: heightsRef.current[it.id] ?? EST_H[it.type] })),
    [items],
  );

  // drag start from a card
  const onPointerDownItem = useCallback(
    (id: string, e: ReactPointerEvent<HTMLElement>) => {
      if (layout !== "free" || !desktop) return;
      if (e.button !== 0) return;
      const t = e.target as HTMLElement;
      if (t.closest("button, a, input, textarea, select, label, [contenteditable], [data-no-drag]")) return;
      const item = items.find((it) => it.id === id);
      if (!item) return;
      dragRef.current = {
        id,
        startPX: e.clientX,
        startPY: e.clientY,
        origX: item.x,
        origY: item.y,
        w: item.w,
        h: heightsRef.current[id] ?? EST_H[item.type],
      };
      setDragPos({ id, x: item.x, y: item.y });
      e.preventDefault();
    },
    [layout, desktop, items],
  );

  // drag move / drop
  const isDragging = dragPos !== null;
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const x = boardW > 0 ? clampX(snap(d.origX + e.clientX - d.startPX), d.w, boardW) : snap(d.origX + e.clientX - d.startPX);
      const y = Math.max(PAD, snap(d.origY + e.clientY - d.startPY));
      setDragPos({ id: d.id, x, y });
    };
    const onUp = () => {
      const d = dragRef.current;
      const pos = dragPosRef.current;
      dragRef.current = null;
      setDragPos(null);
      if (!d || !pos) return;
      const others = rectsOf(d.id);
      const resolved = resolveDrop({ x: pos.x, y: pos.y, w: d.w, h: d.h }, others);
      const x = boardW > 0 ? clampX(resolved.x, d.w, boardW) : resolved.x;
      void actions.updateItem(d.id, { x, y: snap(resolved.y) });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isDragging, boardW, rectsOf, actions]);

  // keep cards inside the board when the viewport shrinks
  const lastBoardW = useRef(0);
  useEffect(() => {
    if (layout !== "free" || !desktop || boardW === 0) return;
    if (lastBoardW.current === 0) {
      lastBoardW.current = boardW;
      return;
    }
    if (boardW === lastBoardW.current) return;
    lastBoardW.current = boardW;
    for (const it of items) {
      const x = clampX(it.x, it.w, boardW);
      if (x !== it.x) void actions.updateItem(it.id, { x });
    }
  }, [boardW, desktop, layout, items, actions]);

  // one-time overlap cascade once heights are measured (stable board after refresh)
  const cascaded = useRef(false);
  useEffect(() => {
    if (cascaded.current || layout !== "free" || !desktop) return;
    if (items.length === 0 || Object.keys(heights).length < items.length) return;
    cascaded.current = true;
    const rects = items.map((it) => ({
      id: it.id,
      x: it.x,
      y: it.y,
      w: it.w,
      h: heights[it.id] ?? EST_H[it.type],
    }));
    const fixed = cascadeNoOverlap(rects);
    for (const it of items) {
      const p = fixed.get(it.id);
      if (p && (p.x !== it.x || p.y !== it.y)) void actions.updateItem(it.id, { x: p.x, y: p.y });
    }
  }, [heights, items, desktop, layout, actions]);

  // tidy: pack everything into neat rows
  useEffect(() => {
    if (tidySignal === 0 || layout !== "free" || !desktop || boardW === 0) return;
    const rects = items.map((it) => ({
      id: it.id,
      x: it.x,
      y: it.y,
      w: it.w,
      h: heightsRef.current[it.id] ?? EST_H[it.type],
    }));
    const pos = tidyPositions(rects, boardW);
    for (const it of items) {
      const p = pos.get(it.id);
      if (p) void actions.updateItem(it.id, { x: p.x, y: p.y });
    }
  }, [tidySignal, layout, desktop, boardW, items, actions]);

  const boardH = useMemo(() => {
    if (layout !== "free") return 0;
    let max = 0;
    for (const it of items) {
      max = Math.max(max, it.y + (heights[it.id] ?? EST_H[it.type]));
    }
    return max + PAD + GAP;
  }, [items, heights, layout]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.y - b.y || a.x - b.x),
    [items],
  );

  if (layout === "grid") {
    return (
      <div ref={setInnerRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((item) => (
          <BoardItem
            key={item.id}
            item={item}
            actions={actions}
            layout="grid"
            boardW={boardW || 1200}
            onHeight={onHeight}
          />
        ))}
      </div>
    );
  }

  if (!desktop) {
    return (
      <div ref={setInnerRef} className="flex flex-col gap-6">
        {sorted.map((item) => (
          <BoardItem
            key={item.id}
            item={item}
            actions={actions}
            layout="stack"
            boardW={boardW || 800}
            onHeight={onHeight}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={setInnerRef} className="nook-board" style={{ minHeight: Math.max(boardH, 240) }}>
      {sorted.map((item) => (
        <BoardItem
          key={item.id}
          item={item}
          actions={actions}
          layout="free"
          dragPos={dragPos?.id === item.id ? dragPos : null}
          dragging={dragPos?.id === item.id}
          boardW={boardW || 1200}
          onHeight={onHeight}
          onPointerDownItem={onPointerDownItem}
        />
      ))}
    </div>
  );
}
