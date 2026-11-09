import { ItemsProvider } from "@/lib/items-context";
import HomeShell from "@/components/home/HomeShell";

export default function HomePage() {
  return (
    <ItemsProvider>
      <HomeShell />
    </ItemsProvider>
  );
}
