import { NextRequest, NextResponse } from "next/server";
import { getRandomBook, Category } from "@/data/books";
import { getPassageFromGutenberg, Passage } from "@/lib/gutenberg";
import turkishPassages from "@/data/turkish-passages.json";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") as Category | null;

  try {
    let passage: Passage;

    if (category === "turkce") {
      const pool = turkishPassages;
      passage = pool[Math.floor(Math.random() * pool.length)];
    } else {
      const book = getRandomBook(category ?? undefined);
      passage = await getPassageFromGutenberg(
        book.id,
        book.title,
        book.author,
        book.category
      );
    }

    return NextResponse.json(passage);
  } catch (err) {
    console.error("Passage fetch error:", err);
    // Fallback to a random Turkish passage if API fails
    const fallback = turkishPassages[Math.floor(Math.random() * turkishPassages.length)];
    return NextResponse.json(fallback);
  }
}
