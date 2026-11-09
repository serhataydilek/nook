import { beforeAll, describe, expect, it, vi } from "vitest";
import { indexedDB, IDBKeyRange } from "fake-indexeddb";

// install the fake IndexedDB before importing the db module
(globalThis as Record<string, unknown>).indexedDB = indexedDB;
(globalThis as Record<string, unknown>).IDBKeyRange = IDBKeyRange;

type Db = typeof import("@/lib/storage/db");
let db: Db = await import("@/lib/storage/db");

/** simulate a full page refresh: fresh module state, same underlying database */
async function reload(): Promise<Db> {
  vi.resetModules();
  return await import("@/lib/storage/db");
}

interface Item {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
}

describe("IndexedDB layer (fake-indexeddb)", () => {
  beforeAll(async () => {
    await db.openDB();
  });

  it("puts, gets, lists, and deletes items — surviving a simulated reload", async () => {
    const item: Item = { id: "i1", type: "note", x: 8, y: 8, w: 340 };
    await db.idbPut("items", item);

    // simulate a refresh: fresh module (fresh connection cache), same database
    db = await reload();
    expect(await db.idbGet<Item>("items", "i1")).toEqual(item);
    expect(await db.idbGetAll<Item>("items")).toContainEqual(item);

    await db.idbDel("items", "i1");
    expect(await db.idbGet<Item>("items", "i1")).toBeUndefined();
  });

  it("stores and retrieves image blobs across a reload", async () => {
    const blob = new Blob(["fake-png-bytes"], { type: "image/png" });
    await db.idbPut("blobs", { id: "b1", blob });

    db = await reload();
    const rec = await db.idbGet<{ id: string; blob: Blob }>("blobs", "b1");
    expect(rec).toBeDefined();
    expect(rec!.blob.type).toBe("image/png");
    expect(await rec!.blob.text()).toBe("fake-png-bytes");
    await db.idbDel("blobs", "b1");
  });

  it("keeps collections separate from items", async () => {
    await db.idbPut("collections", { id: "c1", name: "inspo", createdAt: 1 });
    await db.idbPut("items", { id: "i2", type: "link", x: 0, y: 0, w: 340 });
    expect((await db.idbGetAll("collections")).length).toBeGreaterThanOrEqual(1);
    expect((await db.idbGetAll<Item>("items")).map((i) => i.id)).toContain("i2");
    await db.idbDel("collections", "c1");
    await db.idbDel("items", "i2");
  });
});
