/**
 * Pure layout math for the freeform workspace board.
 * Positions are persisted per item, so the desk looks the same after refresh.
 */

export const GRID = 8; // snap step for dragging / resizing
export const PAD = 8; // board edge padding
export const GAP = 16; // spacing used when resolving collisions

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const snap = (v: number, step: number = GRID): number => Math.round(v / step) * step;

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** Clamp an x position so a card of width w stays inside the board. */
export function clampX(x: number, w: number, boardW: number): number {
  const maxX = Math.max(PAD, boardW - w - PAD);
  return Math.min(Math.max(x, PAD), maxX);
}

/**
 * After a drop, push the moved card straight down until it no longer overlaps
 * anything. Deterministic: processes blockers in board order.
 */
export function resolveDrop(moved: Rect, others: Rect[]): { x: number; y: number } {
  const x = moved.x;
  let y = moved.y;
  const sorted = [...others].sort((a, b) => a.y - b.y || a.x - b.x);
  for (let iter = 0; iter < 50; iter++) {
    const hit = sorted.find((o) => overlaps({ x, y, w: moved.w, h: moved.h }, o));
    if (!hit) break;
    y = hit.y + hit.h + GAP;
  }
  return { x, y };
}

/**
 * Find the first free spot (top-to-bottom, left-to-right) for a new card,
 * so new items never spawn on top of existing ones.
 */
export function findFreeSpot(items: Rect[], w: number, h: number, boardW: number): { x: number; y: number } {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const maxY = sorted.reduce((m, o) => Math.max(m, o.y + o.h), 0);
  for (let y = PAD; y <= maxY + GAP; y += 24) {
    for (let x = PAD; x + w <= boardW - PAD + 1; x += 24) {
      const rect = { x, y, w, h };
      if (!sorted.some((o) => overlaps(rect, o))) return { x, y };
    }
  }
  return { x: PAD, y: maxY + GAP };
}

/**
 * "Tidy": pack items into neat rows (keeping each card's width), preserving
 * the current visual order. Returns new positions keyed by item id.
 */
export function tidyPositions(
  items: (Rect & { id: string })[],
  boardW: number,
): Map<string, { x: number; y: number }> {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const result = new Map<string, { x: number; y: number }>();
  let x = PAD;
  let y = PAD;
  let rowH = 0;
  for (const it of sorted) {
    const w = Math.min(it.w, boardW - PAD * 2);
    if (x > PAD && x + w > boardW - PAD) {
      x = PAD;
      y += rowH + GAP;
      rowH = 0;
    }
    result.set(it.id, { x, y });
    x += w + GAP;
    rowH = Math.max(rowH, it.h);
  }
  return result;
}

/**
 * One-time cascade on load: walk items in visual order and push any overlapping
 * card down below the cards already placed. Guarantees a stable, overlap-free
 * board after refresh.
 */
export function cascadeNoOverlap(items: (Rect & { id: string })[]): Map<string, { x: number; y: number }> {
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: (Rect & { id: string })[] = [];
  const result = new Map<string, { x: number; y: number }>();
  for (const it of sorted) {
    const x = it.x;
    let y = it.y;
    for (let iter = 0; iter < 50; iter++) {
      const hit = placed.find((o) => overlaps({ x, y, w: it.w, h: it.h }, o));
      if (!hit) break;
      y = hit.y + hit.h + GAP;
    }
    const rect = { x, y, w: it.w, h: it.h, id: it.id };
    placed.push(rect);
    result.set(it.id, { x, y });
  }
  return result;
}
