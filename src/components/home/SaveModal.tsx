"use client";

import { useState, type ClipboardEvent as ReactClipboardEvent, type DragEvent as ReactDragEvent, type FormEvent, type KeyboardEvent } from "react";
import SketchModal from "../sketch/SketchModal";
import SketchBorder from "../sketch/SketchBorder";
import SketchButton from "../sketch/SketchButton";

export interface SaveModalProps {
  open: boolean;
  onClose: () => void;
  /** called with the typed/pasted text; the app detects link vs note */
  onSubmitText: (text: string) => void;
  /** called when an image is pasted/dropped straight into the modal */
  onImageFile: (file: File) => void;
}

/**
 * Frictionless save: one input area, no type picker. Paste a URL, an image,
 * or plain text — the app figures out what it is.
 */
export default function SaveModal({ open, onClose, onSubmitText, onImageFile }: SaveModalProps) {
  const [text, setText] = useState("");

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSubmitText(text);
    setText("");
  };

  const onPaste = (e: ReactClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      onImageFile(file);
      setText("");
    }
    // text pastes fall through and land in the textarea
  };

  const onDrop = (e: ReactDragEvent) => {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      e.stopPropagation();
      onImageFile(file);
      setText("");
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
  };

  return (
    <SketchModal open={open} onClose={onClose} title="save something">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
          <SketchBorder className="sketch-box block">
            <textarea
              autoFocus
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={onPaste}
              onKeyDown={onKeyDown}
              aria-label="What do you want to save? Paste a link, an image, or type a note."
              placeholder="paste a link, an image, or just type…"
              className="w-full resize-y bg-transparent px-3 py-2 font-hand text-lg leading-relaxed focus:outline-none placeholder:text-muted/60"
            />
          </SketchBorder>
        </div>
        <p className="font-hand text-sm text-muted">
          paste a link → link card · paste an image → image card · text → note · ⌘/Ctrl+Enter
          saves
        </p>
        <div className="flex justify-end gap-2">
          <SketchButton size="sm" onClick={onClose}>
            cancel
          </SketchButton>
          <SketchButton type="submit" size="sm" disabled={!text.trim()}>
            save
          </SketchButton>
        </div>
      </form>
    </SketchModal>
  );
}
