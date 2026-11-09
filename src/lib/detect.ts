/**
 * Content detection for frictionless saving: figure out what the user pasted
 * or dropped without asking them to pick a type.
 */

export type PasteAction =
  | { kind: "image"; file: File }
  | { kind: "link"; url: string }
  | { kind: "note"; text: string };

/**
 * If the text is exactly one URL, return it normalized with a protocol.
 * Anything else (including multiline text that merely contains a URL) is a note.
 */
export function normalizeUrl(text: string): string | null {
  const t = text.trim();
  if (!t || /\s/.test(t)) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes(".") || u.hostname === ".") return null;
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function detectFromText(text: string): PasteAction | null {
  const cleaned = text.replace(/\r\n/g, "\n");
  if (!cleaned.trim()) return null;
  if (!cleaned.includes("\n")) {
    const url = normalizeUrl(cleaned);
    if (url) return { kind: "link", url };
  }
  return { kind: "note", text: cleaned };
}

export interface ClipboardLike {
  files: File[];
  text: string;
  uriList: string;
}

/** Decide what a paste/drop contains. An image file always wins over text. */
export function extractFromClipboard(input: ClipboardLike): PasteAction | null {
  const image = input.files.find((f) => f.type.startsWith("image/"));
  if (image) return { kind: "image", file: image };
  const text = input.text || input.uriList;
  if (!text.trim()) return null;
  return detectFromText(text);
}
