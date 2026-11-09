"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Eraser, Pen, Redo2, Trash2, Undo2 } from "lucide-react";
import type { SavedItem, Stroke } from "@/lib/types";
import SketchModal from "../sketch/SketchModal";
import SketchBorder from "../sketch/SketchBorder";
import SketchButton from "../sketch/SketchButton";
import DoodleIcon from "../sketch/DoodleIcon";

export interface DrawModalProps {
  open: boolean;
  onClose: () => void;
  /** existing drawing to edit, or null for a new one */
  initial: SavedItem | null;
  onSave: (strokes: Stroke[], w: number, h: number) => void;
}

const INK = "#1B1B1B";
const WIDTHS = [2, 4, 8] as const;

export default function DrawModal({ open, onClose, initial, onSave }: DrawModalProps) {
  const W = initial?.drawW ?? 480;
  const H = initial?.drawH ?? 300;
  const [strokes, setStrokes] = useState<Stroke[]>(initial?.strokes ?? []);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [width, setWidth] = useState(4);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRef = useRef<Stroke | null>(null);
  const drawingRef = useRef(false);

  const replay = useCallback((list: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    for (const s of list) {
      ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      s.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      if (s.points.length === 1) ctx.lineTo(s.points[0].x + 0.01, s.points[0].y + 0.01);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }, [W, H]);

  // the parent mounts this modal only while open, so lazy initial state is enough
  useEffect(() => {
    if (open) replay(strokes);
  }, [open, strokes, replay]);

  const posOf = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };

  const drawSegment = (stroke: Stroke, from: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const a = stroke.points[from];
    const b = stroke.points[from + 1];
    if (!a || !b) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const p = posOf(e);
    currentRef.current = { tool, width, color: INK, points: [p] };
    drawSegment(currentRef.current, 0);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !currentRef.current) return;
    const p = posOf(e);
    const stroke = currentRef.current;
    const from = stroke.points.length - 1;
    stroke.points.push(p);
    drawSegment(stroke, from);
  };

  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (currentRef.current) {
      setStrokes((prev) => [...prev, currentRef.current as Stroke]);
      setRedoStack([]);
      currentRef.current = null;
    }
  };

  const undo = () => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      setRedoStack((r) => [...r, prev[prev.length - 1]]);
      return prev.slice(0, -1);
    });
  };
  const redo = () => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const s = r[r.length - 1];
      setStrokes((prev) => [...prev, s]);
      return r.slice(0, -1);
    });
  };
  const clear = () => {
    setRedoStack((r) => [...r, ...strokes]);
    setStrokes([]);
  };

  const toolBtn = "grid h-9 w-9 place-items-center transition-transform duration-150 hover:-rotate-6";

  return (
    <SketchModal open={open} onClose={onClose} title={initial ? "edit drawing" : "draw something"}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className={`${toolBtn} ${tool === "pen" ? "hatch" : "text-muted hover:text-ink"}`}
            onClick={() => setTool("pen")}
            aria-label="Pen"
            aria-pressed={tool === "pen"}
          >
            <DoodleIcon icon={Pen} size={18} />
          </button>
          <button
            type="button"
            className={`${toolBtn} ${tool === "eraser" ? "hatch" : "text-muted hover:text-ink"}`}
            onClick={() => setTool("eraser")}
            aria-label="Eraser"
            aria-pressed={tool === "eraser"}
          >
            <DoodleIcon icon={Eraser} size={18} />
          </button>
          <span className="mx-1 h-5 w-px bg-ink/20" aria-hidden="true" />
          {WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              className={`${toolBtn} ${width === w ? "hatch" : "text-muted hover:text-ink"}`}
              onClick={() => setWidth(w)}
              aria-label={`Stroke width ${w}`}
              aria-pressed={width === w}
            >
              <span
                aria-hidden="true"
                className="rounded-full bg-current"
                style={{ width: 4 + w * 1.6, height: 4 + w * 1.6 }}
              />
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-ink/20" aria-hidden="true" />
          <button type="button" className={toolBtn} onClick={undo} disabled={strokes.length === 0} aria-label="Undo">
            <DoodleIcon icon={Undo2} size={18} />
          </button>
          <button type="button" className={toolBtn} onClick={redo} disabled={redoStack.length === 0} aria-label="Redo">
            <DoodleIcon icon={Redo2} size={18} />
          </button>
          <button
            type="button"
            className={toolBtn}
            onClick={clear}
            disabled={strokes.length === 0}
            aria-label="Clear canvas"
          >
            <DoodleIcon icon={Trash2} size={17} />
          </button>
          <div className="ml-auto">
            <SketchButton
              size="sm"
              onClick={() => {
                onSave(strokes, W, H);
                onClose();
              }}
            >
              save drawing
            </SketchButton>
          </div>
        </div>
        <SketchBorder className="block" seedKey="draw-canvas">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="draw-canvas block w-full cursor-crosshair bg-card"
            style={{ aspectRatio: `${W} / ${H}` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-label="Drawing canvas"
          />
        </SketchBorder>
        <p className="font-hand text-sm text-muted">
          mouse, touch, and stylus all work — undo/redo are the curved arrows above
        </p>
      </div>
    </SketchModal>
  );
}
