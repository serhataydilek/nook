import { describe, expect, it } from "vitest";
import { detectFromText, extractFromClipboard, normalizeUrl } from "@/lib/detect";

describe("normalizeUrl", () => {
  it("accepts full http(s) urls", () => {
    expect(normalizeUrl("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(normalizeUrl("http://example.com")).toBe("http://example.com/");
  });
  it("adds https to bare domains and www", () => {
    expect(normalizeUrl("example.com/page")).toBe("https://example.com/page");
    expect(normalizeUrl("www.example.com")).toBe("https://www.example.com/");
  });
  it("rejects non-urls and other protocols", () => {
    expect(normalizeUrl("hello world")).toBeNull();
    expect(normalizeUrl("not a url at all")).toBeNull();
    expect(normalizeUrl("ftp://example.com")).toBeNull();
    expect(normalizeUrl("localhost:3000")).toBeNull();
    expect(normalizeUrl("")).toBeNull();
  });
});

describe("detectFromText", () => {
  it("detects a single-line url as a link", () => {
    expect(detectFromText("https://example.com")).toEqual({
      kind: "link",
      url: "https://example.com/",
    });
  });
  it("treats multiline text containing a url as a note", () => {
    const action = detectFromText("check this https://example.com\nand this too");
    expect(action?.kind).toBe("note");
  });
  it("preserves multiline note formatting and normalizes CRLF", () => {
    const action = detectFromText("line one\r\nline two\r\n");
    expect(action).toEqual({ kind: "note", text: "line one\nline two\n" });
  });
  it("returns null for empty text", () => {
    expect(detectFromText("   ")).toBeNull();
  });
});

describe("extractFromClipboard", () => {
  it("prefers an image file over text", () => {
    const file = new File(["x"], "shot.png", { type: "image/png" });
    const action = extractFromClipboard({ files: [file], text: "https://example.com", uriList: "" });
    expect(action).toEqual({ kind: "image", file });
  });
  it("ignores non-image files", () => {
    const file = new File(["x"], "doc.pdf", { type: "application/pdf" });
    const action = extractFromClipboard({ files: [file], text: "notes", uriList: "" });
    expect(action?.kind).toBe("note");
  });
  it("falls back to the uri-list when there is no text", () => {
    const action = extractFromClipboard({ files: [], text: "", uriList: "https://example.com/x" });
    expect(action).toEqual({ kind: "link", url: "https://example.com/x" });
  });
  it("returns null when there is nothing usable", () => {
    expect(extractFromClipboard({ files: [], text: "", uriList: "" })).toBeNull();
  });
});
