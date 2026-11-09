import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="nook — home"
      className="group inline-block font-hand text-[32px] leading-none tracking-tight text-ink"
    >
      <span className="highlighter">nook</span>
      <span>.</span>
    </Link>
  );
}
