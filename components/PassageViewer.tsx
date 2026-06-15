"use client";

import { useState, useCallback } from "react";
import PassageCard from "./PassageCard";
import ShareButton from "./ShareButton";
import { Category, CATEGORY_LABELS } from "@/data/books";

interface Passage {
  text: string;
  title: string;
  author: string;
  category: string;
}

interface PassageViewerProps {
  initial: Passage;
}

const CATEGORIES: (Category | "all")[] = [
  "all",
  "felsefe",
  "ask",
  "yalnizlik",
  "macera",
  "turkce",
];

const CATEGORY_DISPLAY: Record<string, string> = {
  all: "Tümü",
  ...CATEGORY_LABELS,
};

export default function PassageViewer({ initial }: PassageViewerProps) {
  const [passage, setPassage] = useState<Passage>(initial);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [translating, setTranslating] = useState(false);
  const [displayText, setDisplayText] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);

  const fetchPassage = useCallback(async (category: Category | "all") => {
    setLoading(true);
    setDisplayText(null);
    setIsTranslated(false);
    try {
      const url =
        category === "all"
          ? "/api/passage"
          : `/api/passage?category=${category}`;
      const res = await fetch(url);
      const data = await res.json();
      setPassage(data);
    } catch {
      // sessizce mevcut pasajı koru
    } finally {
      setLoading(false);
    }
  }, []);

  function handleCategory(cat: Category | "all") {
    setActiveCategory(cat);
    fetchPassage(cat);
  }

  async function handleTranslate() {
    if (isTranslated) {
      setDisplayText(null);
      setIsTranslated(false);
      return;
    }

    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: passage.text }),
      });
      const data = await res.json();
      if (data.translated) {
        setDisplayText(data.translated);
        setIsTranslated(true);
      }
    } catch {
      // sessizce başarısız ol
    } finally {
      setTranslating(false);
    }
  }

  const shownText = displayText ?? passage.text;
  const isTurkish = passage.category === "turkce";

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4">
      {/* Kategori filtresi */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs tracking-widest uppercase transition-all duration-200 border ${
              activeCategory === cat
                ? "bg-[#2C2416] text-[#FAF7F2] border-[#2C2416]"
                : "bg-transparent text-[#9E8B70] border-[#D4C4A8] hover:border-[#9E8B70]"
            }`}
          >
            {CATEGORY_DISPLAY[cat]}
          </button>
        ))}
      </div>

      {/* Pasaj kartı */}
      <PassageCard
        text={shownText}
        title={passage.title}
        author={passage.author}
        category={passage.category}
        loading={loading}
      />

      {/* İşlem butonları */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => fetchPassage(activeCategory)}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 border border-[#C9A96E] text-[#6B5B3E] rounded-full text-sm tracking-widest uppercase hover:bg-[#F0E8D8] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
          )}
          Yeni Pasaj
        </button>

        {!isTurkish && (
          <button
            onClick={handleTranslate}
            disabled={translating || loading}
            className={`flex items-center gap-2 px-6 py-3 border rounded-full text-sm tracking-widest uppercase transition-colors disabled:opacity-50 ${
              isTranslated
                ? "border-[#2C2416] bg-[#2C2416] text-[#FAF7F2] hover:bg-[#6B5B3E]"
                : "border-[#C9A96E] text-[#6B5B3E] hover:bg-[#F0E8D8]"
            }`}
          >
            {translating ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8l6 6" />
                <path d="M4 14l6-6 2-3" />
                <path d="M2 5h12" />
                <path d="M7 2h1" />
                <path d="M22 22l-5-10-5 10" />
                <path d="M14 18h6" />
              </svg>
            )}
            {isTranslated ? "Orijinal" : "Türkçeye Çevir"}
          </button>
        )}

        <ShareButton
          text={shownText}
          title={passage.title}
          author={passage.author}
        />
      </div>

      {isTranslated && (
        <p className="text-xs text-[#C9A96E] tracking-wider" style={{ fontFamily: "var(--font-lato)" }}>
          AI tarafından çevrildi · Orijinal dil: İngilizce
        </p>
      )}
    </div>
  );
}
