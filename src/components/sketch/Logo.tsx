import Link from "next/link";
import UnderlineText from "./UnderlineText";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="nook — home"
      className="group w-fit font-hand text-[34px] leading-none tracking-tight text-ink"
    >
      <UnderlineText>nook.</UnderlineText>
    </Link>
  );
}
