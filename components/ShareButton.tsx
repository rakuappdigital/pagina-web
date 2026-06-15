"use client";

import { useState } from "react";

interface ShareButtonProps {
  text: string;
  title: string;
  author: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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
  x: number,
  y: number,
  w: number,
  h: number
) {
  drawRoundedRect(ctx, x, y, w, h, 18);
  ctx.fillStyle = "#1A1A1A";
  ctx.fill();

  const aX = x + 22;
  const aY = y + h / 2 - 18;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(aX + 14, aY + 14, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1A1A1A";
  ctx.beginPath();
  ctx.ellipse(aX + 20, aY + 10, 7, 8, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.ellipse(aX + 17, aY + 3, 4, 6, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `${h * 0.22}px Arial`;
  ctx.textAlign = "left";
  ctx.fillText("Download on the", x + 52, y + h * 0.38);

  ctx.fillStyle = "white";
  ctx.font = `600 ${h * 0.38}px Arial`;
  ctx.fillText("App Store", x + 52, y + h * 0.72);
}

/** Metni canvas genişliğine göre satırlara böler */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
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

export default function ShareButton({ text, title, author }: ShareButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleShare() {
    setGenerating(true);
    try {
      // Fontun yüklenmesini bekle
      await document.fonts.ready;

      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = 1080 * scale;
      canvas.height = 1920 * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(scale, scale);

      const W = 1080;
      const H = 1920;

      // Sabit alan sınırları
      const TEXT_TOP = 300;       // metnin başlayabileceği en erken nokta
      const BOTTOM_RESERVED = 420; // yazar + branding + badge için alt alan
      const TEXT_BOTTOM = H - BOTTOM_RESERVED;
      const TEXT_AREA_H = TEXT_BOTTOM - TEXT_TOP;
      const MAX_WIDTH = W - 160;

      // Arka plan
      ctx.fillStyle = "#FAF7F2";
      ctx.fillRect(0, 0, W, H);

      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "rgba(201,169,110,0.04)");
      grad.addColorStop(1, "rgba(107,91,62,0.07)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Üst dekoratif çizgi
      ctx.strokeStyle = "#C9A96E";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 130);
      ctx.lineTo(W - 80, 130);
      ctx.stroke();

      // Alt dekoratif çizgi
      ctx.beginPath();
      ctx.moveTo(80, H - BOTTOM_RESERVED + 20);
      ctx.lineTo(W - 80, H - BOTTOM_RESERVED + 20);
      ctx.stroke();

      // Büyük tırnak işareti (dekoratif)
      ctx.font = "bold 280px Georgia, serif";
      ctx.fillStyle = "rgba(201,169,110,0.12)";
      ctx.textAlign = "left";
      ctx.fillText("“", 60, 420);

      // --- Otomatik font boyutu: metni TEXT_AREA_H'ye sığdır ---
      let fontSize = 54;
      let lineHeight = Math.round(fontSize * 1.52);
      let lines: string[] = [];

      while (fontSize >= 28) {
        ctx.font = `italic ${fontSize}px 'Lora', 'EB Garamond', Georgia, serif`;
        lines = wrapText(ctx, text, MAX_WIDTH);
        const totalH = lines.length * lineHeight;
        if (totalH <= TEXT_AREA_H) break;
        fontSize -= 2;
        lineHeight = Math.round(fontSize * 1.52);
      }

      // Metni dikey olarak TEXT_AREA içinde ortala
      const totalTextHeight = lines.length * lineHeight;
      const startY = TEXT_TOP + (TEXT_AREA_H - totalTextHeight) / 2 + fontSize;

      ctx.font = `italic ${fontSize}px 'Lora', 'EB Garamond', Georgia, serif`;
      ctx.fillStyle = "#2C2416";
      ctx.textAlign = "left";
      lines.forEach((l, i) => {
        ctx.fillText(l, 80, startY + i * lineHeight);
      });

      // Yazar bilgisi
      const authorY = H - BOTTOM_RESERVED + 80;
      ctx.strokeStyle = "#D4C4A8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, authorY - 30);
      ctx.lineTo(280, authorY - 30);
      ctx.stroke();

      ctx.font = "600 42px Georgia, serif";
      ctx.fillStyle = "#6B5B3E";
      ctx.textAlign = "left";
      ctx.fillText(author, 80, authorY + 10);

      ctx.font = "italic 36px Georgia, serif";
      ctx.fillStyle = "#9E8B70";
      ctx.fillText(title, 80, authorY + 58);

      // Pagina branding
      ctx.font = "300 32px Georgia, serif";
      ctx.fillStyle = "#C9A96E";
      ctx.textAlign = "center";
      ctx.fillText("P A G I N A", W / 2, H - 220);

      ctx.font = "300 24px Arial, sans-serif";
      ctx.fillStyle = "#9E8B70";
      ctx.textAlign = "center";
      ctx.fillText("Yakında App Store’da!", W / 2, H - 178);

      const badgeW = 280;
      const badgeH = 80;
      drawAppStoreBadge(ctx, W / 2 - badgeW / 2, H - 158, badgeW, badgeH);

      const link = document.createElement("a");
      link.download = `pagina-${author.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={generating}
      className="share-btn flex items-center gap-2 px-6 py-3 bg-[#2C2416] text-[#FAF7F2] rounded-full text-sm tracking-widest uppercase hover:bg-[#6B5B3E] transition-colors disabled:opacity-50"
    >
      {generating ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
          Oluşturuluyor...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Paylaş
        </>
      )}
    </button>
  );
}
