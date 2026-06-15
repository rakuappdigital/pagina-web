"use client";

import { useState } from "react";

interface ShareButtonProps {
  text: string;
  title: string;
  author: string;
}

// Sabit layout sabitleri (1080×1920 canvas)
const W = 1080;
const H = 1920;
const PAD = 80;
const TEXT_TOP = 220;
const TEXT_BOTTOM = 1590;
const TEXT_AREA_H = TEXT_BOTTOM - TEXT_TOP;
const MAX_TEXT_WIDTH = W - PAD * 2;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawAppStoreBadge(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) {
  drawRoundedRect(ctx, x, y, w, h, h * 0.22);
  ctx.fillStyle = "#1A1A1A";
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(w / 135, h / 40);

  // Apple logosu (AppStoreBadge.tsx ile aynı SVG path)
  ctx.save();
  ctx.scale(0.65, 0.65);
  ctx.translate(4, 4);
  ctx.fillStyle = "white";
  const applePath = new Path2D(
    "M17.5 10.8c1.1-1.4 1.9-3.2 1.7-5.1-1.6.1-3.6 1.1-4.7 2.5-1 1.2-1.9 3.1-1.7 4.9 1.8.1 3.6-.9 4.7-2.3z" +
    "m1.6 2.6c-2.6-.2-4.8 1.5-6 1.5-1.3 0-3.2-1.4-5.3-1.4-2.7 0-5.3 1.6-6.6 4.1-2.9 5-.7 12.3 2 16.4" +
    " 1.4 2 3 4.2 5.1 4.1 2-.1 2.8-1.3 5.2-1.3s3.1 1.3 5.3 1.3c2.2 0 3.6-2 5-4 1.5-2.2 2.2-4.4 2.2-4.5" +
    "-.1 0-4.2-1.6-4.3-6.4-.1-4 3.3-5.9 3.4-6-1.9-2.7-4.7-3-5.7-3z"
  );
  ctx.fill(applePath);
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "7px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Download on the", 38, 13);
  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.fillText("App Store", 38, 27);

  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

async function buildCanvas(text: string, title: string, author: string): Promise<HTMLCanvasElement> {
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  const scale = 2; // retina
  canvas.width = W * scale;
  canvas.height = H * scale;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // ── Arka plan ──────────────────────────────────────
  ctx.fillStyle = "#FAF7F2";
  ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "rgba(201,169,110,0.04)");
  grad.addColorStop(1, "rgba(107,91,62,0.07)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Üst çizgi ──────────────────────────────────────
  ctx.strokeStyle = "#C9A96E";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(PAD, 130);
  ctx.lineTo(W - PAD, 130);
  ctx.stroke();

  // ── Dekoratif tırnak ───────────────────────────────
  ctx.font = "bold 260px Georgia, serif";
  ctx.fillStyle = "rgba(201,169,110,0.10)";
  ctx.textAlign = "left";
  ctx.fillText("“", 50, 400);

  // ── Metin (otomatik font küçültme) ─────────────────
  let fontSize = 52;
  let lineHeight = Math.round(fontSize * 1.55);
  let lines: string[] = [];

  ctx.textAlign = "left";
  while (fontSize >= 26) {
    ctx.font = `italic ${fontSize}px 'Lora', Georgia, serif`;
    lines = wrapText(ctx, text, MAX_TEXT_WIDTH);
    if (lines.length * lineHeight <= TEXT_AREA_H) break;
    fontSize -= 2;
    lineHeight = Math.round(fontSize * 1.55);
  }

  // Son çare: min font'ta bile sığmıyorsa fazla satırları kes
  const maxLines = Math.floor(TEXT_AREA_H / lineHeight);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.replace(/\s+\S+$/, "") + "…";
  }

  // Dikey ortala: metin TEXT_TOP..TEXT_BOTTOM arasında ortalanır
  const totalTextH = lines.length * lineHeight;
  const textStartY = TEXT_TOP + (TEXT_AREA_H - totalTextH) / 2 + fontSize;

  ctx.font = `italic ${fontSize}px 'Lora', Georgia, serif`;
  ctx.fillStyle = "#2C2416";
  lines.forEach((l, i) => {
    ctx.fillText(l, PAD, textStartY + i * lineHeight);
  });

  // ── Alt çizgi (metin alanının hemen altında, sabit) ─
  ctx.strokeStyle = "#C9A96E";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(PAD, TEXT_BOTTOM + 18);
  ctx.lineTo(W - PAD, TEXT_BOTTOM + 18);
  ctx.stroke();

  // ── Yazar / kitap ───────────────────────────────────
  // küçük ayırıcı
  ctx.strokeStyle = "#D4C4A8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, TEXT_BOTTOM + 58);
  ctx.lineTo(PAD + 200, TEXT_BOTTOM + 58);
  ctx.stroke();

  ctx.font = "600 42px Georgia, serif";
  ctx.fillStyle = "#6B5B3E";
  ctx.textAlign = "left";
  ctx.fillText(author, PAD, TEXT_BOTTOM + 105);

  ctx.font = "italic 36px Georgia, serif";
  ctx.fillStyle = "#9E8B70";
  ctx.fillText(title, PAD, TEXT_BOTTOM + 153);

  // ── Branding ────────────────────────────────────────
  ctx.font = "300 30px Georgia, serif";
  ctx.fillStyle = "#C9A96E";
  ctx.textAlign = "center";
  ctx.fillText("P A G I N A", W / 2, TEXT_BOTTOM + 248);

  ctx.font = "300 22px Arial, sans-serif";
  ctx.fillStyle = "#9E8B70";
  ctx.fillText("Yakında App Store’da!", W / 2, TEXT_BOTTOM + 287);

  // ── App Store badge ─────────────────────────────────
  const bW = 260;
  const bH = 76;
  drawAppStoreBadge(ctx, W / 2 - bW / 2, TEXT_BOTTOM + 305, bW, bH);

  return canvas;
}

function downloadCanvas(canvas: HTMLCanvasElement, author: string) {
  const link = document.createElement("a");
  link.download = `pagina-${author.replace(/\s+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export default function ShareButton({ text, title, author }: ShareButtonProps) {
  const [busy, setBusy] = useState<"share" | "download" | null>(null);

  async function handleShare() {
    setBusy("share");
    try {
      const canvas = await buildCanvas(text, title, author);
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("blob failed"))), "image/png")
      );
      const file = new File([blob], `pagina-${author}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Pagina",
          text: `"${text.slice(0, 80)}${text.length > 80 ? "…" : ""}" — ${author}`,
        });
      } else {
        // Masaüstü fallback
        downloadCanvas(canvas, author);
      }
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") {
        console.error("Paylaşım hatası:", e);
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleDownload() {
    setBusy("download");
    try {
      const canvas = await buildCanvas(text, title, author);
      downloadCanvas(canvas, author);
    } finally {
      setBusy(null);
    }
  }

  const isShareBusy = busy === "share";
  const isDownloadBusy = busy === "download";

  return (
    <>
      {/* Paylaş (native share sheet) */}
      <button
        onClick={handleShare}
        disabled={!!busy}
        className="flex items-center gap-2 px-6 py-3 bg-[#2C2416] text-[#FAF7F2] rounded-full text-sm tracking-widest uppercase hover:bg-[#6B5B3E] transition-colors disabled:opacity-50"
      >
        {isShareBusy ? (
          <span className="inline-block w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        )}
        Paylaş
      </button>

      {/* İndir */}
      <button
        onClick={handleDownload}
        disabled={!!busy}
        className="flex items-center gap-2 px-6 py-3 border border-[#C9A96E] text-[#6B5B3E] rounded-full text-sm tracking-widest uppercase hover:bg-[#F0E8D8] transition-colors disabled:opacity-50"
      >
        {isDownloadBusy ? (
          <span className="inline-block w-4 h-4 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
        İndir
      </button>
    </>
  );
}
