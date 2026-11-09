import { Link2, Trash2 } from "lucide-react";
import type { SavedItem } from "@/lib/types";
import SketchBorder from "../sketch/SketchBorder";
import DoodleIcon from "../sketch/DoodleIcon";
import UnderlineText from "../sketch/UnderlineText";

export interface ItemCardProps {
  item: SavedItem;
  onDelete: (id: string) => void;
}

/** Renders note lines, turning "[ ]" into a drawn checkbox and "•"/"-" into a dot. */
function NoteBody({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="note-body mt-1 font-hand text-[17px] leading-[1.6] text-ink/90">
      {lines.map((line, i) => {
        const checkbox = line.match(/^\s*\[\s?\]\s?(.*)$/);
        if (checkbox) {
          return (
            <div key={i} className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-block h-[13px] w-[13px] shrink-0 border-[1.5px] border-ink"
              />
              <span>{checkbox[1]}</span>
            </div>
          );
        }
        const bullet = line.match(/^\s*[•\-*+]\s?(.*)$/);
        if (bullet) {
          return (
            <div key={i} className="flex items-baseline gap-2.5">
              <span aria-hidden="true" className="inline-block h-[5px] w-[5px] rounded-full bg-ink" />
              <span>{bullet[1]}</span>
            </div>
          );
        }
        return <div key={i}>{line}</div>;
      })}
    </div>
  );
}

export default function ItemCard({ item, onDelete }: ItemCardProps) {
  return (
    <article className="item-card group relative h-full">
      <SketchBorder
        className={`block bg-card transition-transform duration-150 ease-out hover:-rotate-[0.5deg] ${
          item.type === "image" ? "" : `card-content ${item.type === "note" ? "note-content" : ""}`
        }`}
        seedKey={item.id}
        radius={0.5}
      >
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.title || "saved image"}`}
          className="delete-item absolute right-2 top-2 z-20 text-muted opacity-0 transition-opacity hover:text-error focus-visible:opacity-100 group-hover:opacity-100"
        >
          <DoodleIcon icon={Trash2} size={15} strokeWidth={1.8} />
        </button>

        {item.type === "link" && (
          <div className="flex items-start gap-3">
            <DoodleIcon icon={Link2} size={20} strokeWidth={1.6} className="link-icon mt-1 shrink-0 text-ink" />
            <div className="min-w-0">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block pr-6"
              >
                <h3 className="font-hand text-xl leading-snug">
                  <UnderlineText>{item.title || item.url}</UnderlineText>
                </h3>
              </a>
              {item.description && (
                <p className="link-description mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink/75">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        )}

        {item.type === "note" && (
          <div>
            <h3 className="pr-6 font-hand text-xl leading-snug">{item.title}</h3>
            {item.content && <NoteBody content={item.content} />}
          </div>
        )}

        {item.type === "image" && item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- saved images come from user uploads / Supabase Storage
          <img
            src={item.imageUrl}
            alt={item.title || "saved image"}
            className="block aspect-[12/5] w-full object-cover"
          />
        )}
        {item.type === "image" && item.title && (
          <p className="px-3 py-2 font-hand text-base text-ink/80">{item.title}</p>
        )}
      </SketchBorder>
    </article>
  );
}
