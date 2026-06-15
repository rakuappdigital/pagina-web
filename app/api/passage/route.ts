import { NextRequest, NextResponse } from "next/server";
import { getRandomBook, Category } from "@/data/books";
import { getPassageFromGutenberg, Passage } from "@/lib/gutenberg";
import { getPassageFromWikisource } from "@/lib/wikisource";

// Statik çevrilmiş pasajlar (scripts/generate-translations.mjs ile üretildi)
let translatedPassages: Passage[] | null = null;
function getTranslated(): Passage[] {
  if (!translatedPassages) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      translatedPassages = require("@/data/translated-passages.json");
    } catch {
      translatedPassages = [];
    }
  }
  return translatedPassages ?? [];
}

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") as Category | null;

  // Türkçe kategori → Wikisource'dan gerçek Türkçe edebi metin
  if (category === "turkce") {
    try {
      return NextResponse.json(await getPassageFromWikisource());
    } catch (err) {
      console.error("Wikisource hatası:", err);
      return NextResponse.json({ error: "Pasaj alınamadı" }, { status: 500 });
    }
  }

  // Diğer kategoriler → önce çevrilmiş havuzdan dene
  const pool = getTranslated().filter(
    (p) => !category || p.category === category
  );

  if (pool.length > 0) {
    const passage = pool[Math.floor(Math.random() * pool.length)];
    return NextResponse.json(passage);
  }

  // Havuz boşsa (script henüz çalıştırılmamış) → Gutenberg'den canlı çek
  try {
    const book = getRandomBook(category ?? undefined);
    const passage = await getPassageFromGutenberg(
      book.id,
      book.title,
      book.author,
      book.category
    );
    return NextResponse.json(passage);
  } catch (err) {
    console.error("Gutenberg hatası:", err);
    try {
      return NextResponse.json(await getPassageFromWikisource());
    } catch {
      return NextResponse.json({ error: "Pasaj alınamadı" }, { status: 500 });
    }
  }
}
