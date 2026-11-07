"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  caption: string;
  secret: string;
  index: number;
  onReveal: (index: number) => void;
};

const SIZE = 220;

/** A touch- and mouse-friendly scratch card; no third-party packages needed. */
export function ScratchCard({ caption, secret, index, onReveal }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(false);
  const revealedRef = useRef(false);
  const strokesRef = useRef(0);
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    onReveal(index);
  }, [index, onReveal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * ratio;
    canvas.height = SIZE * ratio;
    context.scale(ratio, ratio);
    context.fillStyle = "#c6a17f";
    context.fillRect(0, 0, SIZE, SIZE);
    context.fillStyle = "rgba(255,255,255,.18)";
    for (let x = -SIZE; x < SIZE * 2; x += 18) {
      context.fillRect(x, 0, 1, SIZE);
    }
    context.fillStyle = "#fff9ef";
    context.font = "600 13px Georgia, serif";
    context.textAlign = "center";
    context.fillText("SCRATCH TO REVEAL", SIZE / 2, SIZE / 2 - 3);
    context.font = "25px Georgia, serif";
    context.fillText("✦", SIZE / 2, SIZE / 2 + 32);
  }, [revealed]);

  const eraseAt = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeRef.current || revealed) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const bounds = canvas.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * SIZE;
    const y = ((event.clientY - bounds.top) / bounds.height) * SIZE;
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, 26, 0, Math.PI * 2);
    context.fill();
    strokesRef.current += 1;
    // Check the alpha channel occasionally rather than on every pointer move.
    if (strokesRef.current % 8 === 0) {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      let checked = 0;
      for (let i = 3; i < pixels.length; i += 4 * 30) {
        checked += 1;
        if (pixels[i] < 48) clear += 1;
      }
      if (clear / checked > 0.42) reveal();
    }
  };

  return (
    <div className="scratch-item">
      <p className="tiny-label">{caption}</p>
      <div className={`scratch-circle ${revealed ? "is-revealed" : ""}`}>
        <div className="scratch-secret"><span>✦</span><strong>{secret}</strong></div>
        {!revealed && (
          <canvas
            ref={canvasRef}
            className="scratch-canvas"
            aria-label={`Scratch to reveal ${caption}`}
            onPointerDown={(event) => {
              activeRef.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              eraseAt(event);
            }}
            onPointerMove={eraseAt}
            onPointerUp={() => { activeRef.current = false; }}
            onPointerCancel={() => { activeRef.current = false; }}
          />
        )}
      </div>
      {!revealed && <button className="subtle-button" onClick={reveal}>Or tap to reveal</button>}
      {revealed && <span className="reveal-done">Revealed ♥</span>}
    </div>
  );
}
