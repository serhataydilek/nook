/** Renders note lines, turning "[ ]" into a drawn checkbox and "•"/"-" into a dot. */
export default function NoteBody({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="note-body mt-1 font-hand text-[17px] leading-[1.6] text-ink/90">
      {lines.map((line, i) => {
        const checkbox = line.match(/^\s*\[\s?\]\s?(.*)$/);
        if (checkbox) {
          return (
            <div key={i} className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-block h-[13px] w-[13px] shrink-0 border-[1.5px] border-ink"
              />
              <span>{checkbox[1]}</span>
            </div>
          );
        }
        const bullet = line.match(/^\s*[•\-*+]\s?(.*)$/);
        if (bullet) {
          return (
            <div key={i} className="flex items-baseline gap-2.5">
              <span aria-hidden="true" className="inline-block h-[5px] w-[5px] rounded-full bg-ink" />
              <span>{bullet[1]}</span>
            </div>
          );
        }
        return <div key={i}>{line}</div>;
      })}
    </div>
  );
}
