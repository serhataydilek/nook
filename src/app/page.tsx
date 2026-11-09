import { NookProvider } from "@/lib/store";
import HomeShell from "@/components/home/HomeShell";

export default function HomePage() {
  return (
    <NookProvider>
      <HomeShell />
    </NookProvider>
  );
}
