import Link from "next/link";
import UnderlineText from "./UnderlineText";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="nook — home"
      className="nook-logo group w-fit font-hand leading-none tracking-tight text-ink"
    >
      <UnderlineText>nook.</UnderlineText>
    </Link>
  );
}
