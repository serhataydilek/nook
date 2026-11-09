"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, Image as ImageIcon, Link as LinkIcon, StickyNote, Upload } from "lucide-react";
import SketchModal from "../sketch/SketchModal";
import SketchBorder from "../sketch/SketchBorder";
import SketchButton from "../sketch/SketchButton";
import DoodleIcon from "../sketch/DoodleIcon";
import { SketchInput, SketchTextarea } from "../sketch/SketchField";
import type { ItemType, NewSavedItem } from "@/lib/types";

export interface SaveModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: NewSavedItem) => void;
}

type Step = "pick" | ItemType;
type Errors = Partial<Record<"url" | "title" | "content" | "file", string>>;

const PICK_OPTIONS: { type: ItemType; label: string; hint: string; icon: typeof LinkIcon }[] = [
  { type: "link", label: "Link", hint: "a website or article", icon: LinkIcon },
  { type: "image", label: "Image", hint: "a picture or screenshot", icon: ImageIcon },
  { type: "note", label: "Note", hint: "an idea or thought", icon: StickyNote },
];

const STEP_TITLES: Record<Exclude<Step, "pick">, string> = {
  link: "save a link",
  image: "save an image",
  note: "save a note",
};

export default function SaveModal({ open, onClose, onSave }: SaveModalProps) {
  const [step, setStep] = useState<Step>("pick");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  // The parent mounts this modal only while open, so initial state is clean.
  // Revoke the object URL when the component unmounts.
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    if (f) {
      const objectUrl = URL.createObjectURL(f);
      previewRef.current = objectUrl;
      setPreview(objectUrl);
    } else {
      previewRef.current = null;
      setPreview(null);
    }
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (step === "link") {
      if (!url.trim()) {
        e.url = "a link needs a url";
      } else {
        try {
          const parsed = new URL(url.trim());
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            e.url = "only http(s) links, please";
          }
        } catch {
          e.url = "hmm, that doesn't look like a url";
        }
      }
    }
    if (step === "image" && !file) {
      e.file = "pick an image to save";
    }
    if (step === "note") {
      if (!noteTitle.trim()) e.title = "give your note a title";
      if (!content.trim()) e.content = "write something first";
    }
    return e;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (step === "link") {
      const parsed = new URL(url.trim());
      onSave({
        type: "link",
        title: title.trim() || parsed.hostname.replace(/^www\./, ""),
        url: parsed.toString(),
        description: description.trim() || undefined,
      });
    } else if (step === "image" && file && preview) {
      onSave({
        type: "image",
        title: title.trim() || file.name.replace(/\.[^.]+$/, ""),
        imageUrl: preview,
      });
    } else if (step === "note") {
      onSave({
        type: "note",
        title: noteTitle.trim(),
        content: content.trim(),
      });
    }
  };

  const titleText = step === "pick" ? "save something" : STEP_TITLES[step];

  return (
    <SketchModal open={open} onClose={onClose} title={titleText}>
      {step === "pick" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PICK_OPTIONS.map((opt) => (
            <SketchBorder key={opt.type} className="block bg-card transition-transform duration-200 hover:-rotate-1 hover:-translate-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setStep(opt.type);
                  setErrors({});
                }}
                className="relative z-10 block w-full px-3 py-4 text-left"
              >
                <DoodleIcon icon={opt.icon} size={22} className="text-ink" />
                <span className="mt-2 block font-hand text-lg leading-tight">{opt.label}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted">{opt.hint}</span>
              </button>
            </SketchBorder>
          ))}
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setStep("pick")}
            className="inline-flex w-fit items-center gap-1 font-hand text-base text-muted transition-colors hover:text-ink"
          >
            <DoodleIcon icon={ArrowLeft} size={15} />
            back
          </button>

          {step === "link" && (
            <>
              <SketchInput
                label="url *"
                type="url"
                placeholder="https://…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                error={errors.url}
                autoFocus
              />
              <SketchInput
                label="title (optional)"
                placeholder="what is it?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <SketchTextarea
                label="description (optional)"
                placeholder="why did you save it?"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </>
          )}

          {step === "image" && (
            <>
              <div className="flex flex-col gap-1">
                <span className="font-hand text-lg text-ink/80">image *</span>
                <SketchBorder
                  dash
                  className={`sketch-box block bg-card ${errors.file ? "text-error" : "text-ink"}`}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative z-10 flex w-full flex-col items-center gap-1 px-3 py-4 text-sm text-muted transition-colors hover:text-ink"
                  >
                    <DoodleIcon icon={Upload} size={20} />
                    {file ? file.name : "click to choose an image"}
                  </button>
                </SketchBorder>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onFileChange}
                />
                {errors.file && (
                  <p className="font-hand text-sm text-error" role="alert">
                    {errors.file}
                  </p>
                )}
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element -- local object-url preview
                  <img
                    src={preview}
                    alt="preview of the image you are saving"
                    className="mt-1 h-32 w-full border border-ink/15 object-cover"
                  />
                )}
              </div>
              <SketchInput
                label="title (optional)"
                placeholder="what is it?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </>
          )}

          {step === "note" && (
            <>
              <SketchInput
                label="title *"
                placeholder="a little heading"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                error={errors.title}
                autoFocus
              />
              <SketchTextarea
                label="note *"
                placeholder="write it down before it escapes…"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                error={errors.content}
              />
            </>
          )}

          <SketchButton variant="primary" type="submit" className="mt-1 w-full">
            save to my nook
          </SketchButton>
        </form>
      )}
    </SketchModal>
  );
}
