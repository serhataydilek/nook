import {
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import SketchBorder from "./SketchBorder";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FieldShell({ label, error, hint, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-hand text-lg text-ink/80">{label}</span>
      {children}
      {error ? (
        <p className="font-hand text-sm text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="font-hand text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export type SketchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function SketchInput({
  label,
  error,
  hint,
  className = "",
  id,
  ...rest
}: SketchInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} hint={hint}>
      <SketchBorder
        className={`sketch-box block bg-card ${error ? "text-error" : "text-ink"} ${className}`}
      >
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          className="relative z-10 w-full bg-transparent px-3 py-2 text-[15px] focus:outline-none placeholder:text-muted/70"
          {...rest}
        />
      </SketchBorder>
    </FieldShell>
  );
}

export type SketchTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function SketchTextarea({
  label,
  error,
  hint,
  className = "",
  rows = 4,
  ...rest
}: SketchTextareaProps) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      <SketchBorder
        className={`sketch-box block bg-card ${error ? "text-error" : "text-ink"} ${className}`}
      >
        <textarea
          rows={rows}
          aria-invalid={error ? true : undefined}
          className="relative z-10 w-full resize-y bg-transparent px-3 py-2 text-[15px] leading-relaxed focus:outline-none placeholder:text-muted/70"
          {...rest}
        />
      </SketchBorder>
    </FieldShell>
  );
}
