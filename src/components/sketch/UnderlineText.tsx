export interface UnderlineTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Text with a wobbly pen underline that re-draws itself on hover/focus.
 */
export default function UnderlineText({ children, className = "" }: UnderlineTextProps) {
  return (
    <span className={`group/uline relative inline-block ${className}`}>
      {children}
      <svg
        className="pointer-events-none absolute -bottom-1 left-0 h-[7px] w-full"
        viewBox="0 0 100 7"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M1.5 4.5 C 25 2, 55 6.5, 98.5 3.5"
          pathLength={1}
          className="pen-underline"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
