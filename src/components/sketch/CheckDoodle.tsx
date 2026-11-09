export default function CheckDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`check-pop ${className}`}
      aria-hidden="true"
      fill="none"
    >
      <path
        className="check-path"
        d="M4 12.5 C 6.5 14.5, 8.5 17.5, 10 19.5 C 12.5 14, 16.5 8, 20.5 4.5"
        pathLength={1}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
