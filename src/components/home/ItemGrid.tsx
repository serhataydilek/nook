import type { SavedItem } from "@/lib/types";
import ItemCard from "./ItemCard";

export interface ItemGridProps {
  items: SavedItem[];
  onDelete: (id: string) => void;
}

export default function ItemGrid({ items, onDelete }: ItemGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
