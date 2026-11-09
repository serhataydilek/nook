/**
 * Minimal IndexedDB wrapper — the local persistence layer.
 * Modular by design: a later milestone can swap these calls for Supabase
 * (Postgres rows + Storage) without touching the UI.
 *
 * Stores:
 *   items       — SavedItem records (keyPath "id")
 *   collections — Collection records (keyPath "id")
 *   blobs       — image/drawing binary payloads (keyPath "id")
 */

export type StoreName = "items" | "collections" | "blobs";

const DB_NAME = "nook-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("items")) {
          db.createObjectStore("items", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("collections")) {
          db.createObjectStore("collections", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("blobs")) {
          db.createObjectStore("blobs", { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error("failed to open IndexedDB"));
    });
  }
  return dbPromise;
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
  });
}

export async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDB();
  const tx = db.transaction(store, "readonly");
  return request<T[]>(tx.objectStore(store).getAll());
}

export async function idbGet<T>(store: StoreName, key: string): Promise<T | undefined> {
  const db = await openDB();
  const tx = db.transaction(store, "readonly");
  return request<T | undefined>(tx.objectStore(store).get(key));
}

export async function idbPut<T>(store: StoreName, value: T): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(store, "readwrite");
  await request(tx.objectStore(store).put(value));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB put failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB put aborted"));
  });
}

export async function idbDel(store: StoreName, key: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(store, "readwrite");
  await request(tx.objectStore(store).delete(key));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB delete failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB delete aborted"));
  });
}
