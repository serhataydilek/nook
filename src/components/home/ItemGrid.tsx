import type { SavedItem } from "@/lib/types";
import ItemCard from "./ItemCard";

export interface ItemGridProps {
  items: SavedItem[];
  onDelete: (id: string) => void;
  /** extra column classes, e.g. "lg:grid-cols-3" */
  className?: string;
}

export default function ItemGrid({ items, onDelete, className = "" }: ItemGridProps) {
  return (
    <ul className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      {items.map((item, i) => (
        <li
          key={item.id}
          className="animate-fade-rise"
          style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
        >
          <ItemCard item={item} index={i} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
