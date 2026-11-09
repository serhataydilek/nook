import { ExternalLink, Link as LinkIcon, Image as ImageIcon, StickyNote, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import type { SavedItem } from "@/lib/types";
import { getDomain } from "@/lib/utils";
import SketchBorder from "../sketch/SketchBorder";
import DoodleIcon from "../sketch/DoodleIcon";
import UnderlineText from "../sketch/UnderlineText";

const TYPE_META: Record<SavedItem["type"], { label: string; icon: typeof LinkIcon }> = {
  link: { label: "link", icon: LinkIcon },
  image: { label: "image", icon: ImageIcon },
  note: { label: "note", icon: StickyNote },
};

export interface ItemCardProps {
  item: SavedItem;
  index: number;
  onDelete: (id: string) => void;
}

export default function ItemCard({ item, index, onDelete }: ItemCardProps) {
  const tilt = ((index % 4) - 1.5) * 0.7; // -1.05 .. 1.05 deg, alternating
  const meta = TYPE_META[item.type];
  const date = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="group relative h-full">
      <SketchBorder
        className="sketch-shadow block h-full bg-card p-4 pt-5 transition-transform duration-200 ease-out [transform:rotate(var(--tilt,0deg))] hover:[transform:rotate(0deg)_translateY(-3px)]"
        style={{ "--tilt": `${tilt}deg` } as CSSProperties}
        seedKey={item.id}
      >
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.title}`}
          className="absolute right-2 top-2 z-20 text-muted opacity-0 transition-opacity hover:text-error focus-visible:opacity-100 group-hover:opacity-100"
        >
          <DoodleIcon icon={Trash2} size={16} />
        </button>

        <p className="mb-2 flex items-center gap-1.5 font-hand text-xs uppercase tracking-wider text-muted">
          <DoodleIcon icon={meta.icon} size={13} strokeWidth={2} />
          {meta.label}
        </p>

        {item.type === "link" && (
          <div>
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
            {item.url && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                <DoodleIcon icon={ExternalLink} size={12} strokeWidth={2} />
                {getDomain(item.url)}
              </p>
            )}
            {item.description && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/80">
                {item.description}
              </p>
            )}
          </div>
        )}

        {item.type === "image" && (
          <div>
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- saved images come from user uploads / Supabase Storage
              <img
                src={item.imageUrl}
                alt={item.title || "saved image"}
                className="h-40 w-full border border-ink/15 object-cover"
              />
            )}
            <h3 className="mt-2 pr-6 font-hand text-xl leading-snug">
              {item.title || "untitled image"}
            </h3>
          </div>
        )}

        {item.type === "note" && (
          <div>
            <h3 className="pr-6 font-hand text-xl leading-snug">{item.title}</h3>
            {item.content && (
              <p className="mt-1 line-clamp-5 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                {item.content}
              </p>
            )}
          </div>
        )}

        <p className="mt-3 font-hand text-xs text-muted">{date}</p>
      </SketchBorder>
    </article>
  );
}
