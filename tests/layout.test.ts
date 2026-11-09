import { describe, expect, it } from "vitest";
import {
  cascadeNoOverlap,
  clampX,
  findFreeSpot,
  overlaps,
  resolveDrop,
  snap,
  tidyPositions,
} from "@/lib/layout";

describe("overlaps / snap / clampX", () => {
  it("detects overlap and non-overlap", () => {
    expect(overlaps({ x: 0, y: 0, w: 100, h: 100 }, { x: 50, y: 50, w: 100, h: 100 })).toBe(true);
    expect(overlaps({ x: 0, y: 0, w: 100, h: 100 }, { x: 100, y: 0, w: 100, h: 100 })).toBe(false);
    expect(overlaps({ x: 0, y: 0, w: 100, h: 100 }, { x: 0, y: 200, w: 100, h: 100 })).toBe(false);
  });
  it("snaps to the grid", () => {
    expect(snap(13)).toBe(16);
    expect(snap(11)).toBe(8);
    expect(snap(0)).toBe(0);
  });
  it("clamps x inside the board", () => {
    expect(clampX(-50, 100, 500)).toBe(8);
    expect(clampX(450, 100, 500)).toBe(392);
    expect(clampX(100, 100, 500)).toBe(100);
  });
});

describe("resolveDrop", () => {
  it("pushes a dropped card below whatever it overlaps", () => {
    const others = [{ x: 0, y: 0, w: 200, h: 100 }];
    const res = resolveDrop({ x: 20, y: 20, w: 200, h: 100 }, others);
    expect(res.y).toBe(100 + 16);
    expect(res.x).toBe(20);
  });
  it("leaves a free position untouched", () => {
    const others = [{ x: 0, y: 0, w: 200, h: 100 }];
    const res = resolveDrop({ x: 300, y: 0, w: 200, h: 100 }, others);
    expect(res).toEqual({ x: 300, y: 0 });
  });
});

describe("findFreeSpot", () => {
  it("finds a spot that overlaps nothing", () => {
    const items = [
      { x: 8, y: 8, w: 340, h: 130 },
      { x: 372, y: 8, w: 340, h: 130 },
    ];
    const spot = findFreeSpot(items, 340, 130, 1200);
    const rect = { ...spot, w: 340, h: 130 };
    expect(items.some((o) => overlaps(rect, o))).toBe(false);
    expect(spot.x + 340).toBeLessThanOrEqual(1200);
  });
  it("stacks below everything when the row is full", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ x: 8 + i * 360, y: 8, w: 340, h: 130 }));
    const spot = findFreeSpot(items, 340, 130, 1200);
    expect(spot.y).toBeGreaterThan(8);
  });
});

describe("tidyPositions", () => {
  it("packs items into rows without overlap and inside the board", () => {
    const items = [
      { id: "a", x: 500, y: 300, w: 340, h: 130 },
      { id: "b", x: 10, y: 10, w: 340, h: 200 },
      { id: "c", x: 700, y: 20, w: 500, h: 150 },
      { id: "d", x: 100, y: 500, w: 300, h: 120 },
    ];
    const boardW = 1200;
    const pos = tidyPositions(items, boardW);
    const rects = items.map((it) => ({ ...pos.get(it.id)!, w: it.w, h: it.h }));
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(8);
      expect(r.x + Math.min(r.w, boardW - 16)).toBeLessThanOrEqual(boardW - 8 + 1);
    }
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        expect(overlaps(rects[i], rects[j])).toBe(false);
      }
    }
  });
});

describe("cascadeNoOverlap", () => {
  it("removes overlaps deterministically in visual order", () => {
    const items = [
      { id: "a", x: 0, y: 0, w: 200, h: 100 },
      { id: "b", x: 10, y: 10, w: 200, h: 100 }, // overlaps a -> pushed down
      { id: "c", x: 400, y: 0, w: 200, h: 100 },
    ];
    const res = cascadeNoOverlap(items);
    expect(res.get("a")).toEqual({ x: 0, y: 0 });
    expect(res.get("b")!.y).toBe(100 + 16);
    expect(res.get("c")).toEqual({ x: 400, y: 0 });
  });
});
