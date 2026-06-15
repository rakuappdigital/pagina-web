"use client";

import { forwardRef } from "react";
import { CATEGORY_LABELS, Category } from "@/data/books";

interface PassageCardProps {
  text: string;
  title: string;
  author: string;
  year?: string;
  category: string;
  loading?: boolean;
}

const PassageCard = forwardRef<HTMLDivElement, PassageCardProps>(
  ({ text, title, author, year, category, loading }, ref) => {
    const categoryLabel =
      CATEGORY_LABELS[category as Category] ?? category;

    return (
      <div
        ref={ref}
        className={`passage-card relative bg-[#FAF7F2] transition-opacity duration-500 ${
          loading ? "opacity-40 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Decorative quote mark */}
        <span className="absolute top-6 left-8 text-7xl text-[#C9A96E] font-serif leading-none select-none opacity-40">
          &ldquo;
        </span>

        {/* Category badge */}
        <div className="flex justify-end mb-6">
          <span className="text-xs tracking-widest uppercase text-[#9E8B70] border border-[#D4C4A8] px-3 py-1 rounded-full">
            {categoryLabel}
          </span>
        </div>

        {/* Passage text */}
        <p className="passage-text text-[#2C2416] leading-relaxed relative z-10 mt-2">
          {text}
        </p>

        {/* Author and title */}
        <div className="mt-8 pt-6 border-t border-[#E8DFD0]">
          <p className="text-[#6B5B3E] font-semibold text-sm tracking-wide">
            {author}
          </p>
          <div className="flex items-baseline gap-3 mt-1">
            <p className="text-[#9E8B70] text-xs italic">{title}</p>
            {year && (
              <span className="text-[#C9A96E] text-xs tracking-widest" style={{ fontFamily: "var(--font-lato)" }}>
                {year}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PassageCard.displayName = "PassageCard";

export default PassageCard;
