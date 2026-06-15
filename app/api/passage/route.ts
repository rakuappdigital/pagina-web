import { NextRequest, NextResponse } from "next/server";
import { getRandomBook, Category } from "@/data/books";
import { getPassageFromGutenberg, Passage } from "@/lib/gutenberg";
import { getPassageFromWikisource } from "@/lib/wikisource";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") as Category | null;

  try {
    let passage: Passage;

    if (category === "turkce") {
      passage = await getPassageFromWikisource();
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
    // Wikisource'dan başka bir eser dene
    try {
      const fallback = await getPassageFromWikisource();
      return NextResponse.json(fallback);
    } catch {
      return NextResponse.json(
        { error: "Pasaj alınamadı" },
        { status: 500 }
      );
    }
  }
}
