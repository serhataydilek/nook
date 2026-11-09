"use client";

import { useState, type FormEvent } from "react";
import { ExternalLink, Link2, Pencil } from "lucide-react";
import type { SavedItem } from "@/lib/types";
import { getDomain } from "@/lib/utils";
import { normalizeUrl } from "@/lib/detect";
import type { ItemActions } from "../actions";
import DoodleIcon from "../../sketch/DoodleIcon";
import UnderlineText from "../../sketch/UnderlineText";
import SketchButton from "../../sketch/SketchButton";

export default function LinkCard({ item, actions }: { item: SavedItem; actions: ItemActions }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [description, setDescription] = useState(item.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setTitle(item.title ?? "");
    setUrl(item.url ?? "");
    setDescription(item.description ?? "");
    setError(null);
    setEditing(true);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("hmm, that doesn't look like a url");
      return;
    }
    void actions.updateItem(item.id, {
      title: title.trim() || getDomain(normalized),
      url: normalized,
      description: description.trim() || undefined,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <form onSubmit={save} className="flex flex-col gap-2" data-no-drag>
        <input
          aria-label="Title"
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b border-ink/30 bg-transparent font-hand text-xl focus:outline-none placeholder:text-muted/60"
        />
        <input
          aria-label="URL"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border-b border-ink/30 bg-transparent font-hand text-base focus:outline-none placeholder:text-muted/60"
        />
        <input
          aria-label="Description"
          placeholder="description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border-b border-ink/30 bg-transparent text-[13px] focus:outline-none placeholder:text-muted/60"
        />
        {error && (
          <p role="alert" className="font-hand text-sm text-error">
            {error}
          </p>
        )}
        <div className="mt-1 flex gap-2">
          <SketchButton type="submit" size="sm">
            save
          </SketchButton>
          <SketchButton size="sm" onClick={() => setEditing(false)}>
            cancel
          </SketchButton>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={startEdit}
        aria-label={`Edit ${item.title || item.url}`}
        className="absolute left-2 top-2 z-20 text-muted opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
      >
        <DoodleIcon icon={Pencil} size={14} strokeWidth={1.8} />
      </button>
      <DoodleIcon icon={Link2} size={20} strokeWidth={1.6} className="link-icon mt-1 shrink-0 text-ink" />
      <div className="min-w-0">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block pr-6">
          <h3 className="font-hand text-xl leading-snug">
            <UnderlineText>{item.title || (item.url ? getDomain(item.url) : "link")}</UnderlineText>
          </h3>
        </a>
        {item.url && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <DoodleIcon icon={ExternalLink} size={11} strokeWidth={2} />
            {getDomain(item.url)}
          </p>
        )}
        {item.description && (
          <p className="link-description mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink/75">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
