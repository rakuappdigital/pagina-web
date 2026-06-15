export interface Passage {
  text: string;
  title: string;
  author: string;
  year?: string;
  category: string;
}

interface GutendexBook {
  id: number;
  title: string;
  authors: { name: string }[];
  formats: Record<string, string>;
}

async function fetchBookMeta(gutenbergId: number): Promise<GutendexBook> {
  const res = await fetch(`https://gutendex.com/books/${gutenbergId}/`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Gutendex error: ${res.status}`);
  return res.json();
}

async function fetchBookText(meta: GutendexBook): Promise<string> {
  const textUrl =
    meta.formats["text/plain; charset=utf-8"] ||
    meta.formats["text/plain; charset=us-ascii"] ||
    meta.formats["text/plain"];

  if (!textUrl) throw new Error("No plain text format found");

  const res = await fetch(textUrl, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Text fetch error: ${res.status}`);
  return res.text();
}

function extractPassage(rawText: string): string {
  // Strip Project Gutenberg header and footer
  const startMarker = rawText.indexOf("*** START OF THE PROJECT GUTENBERG");
  const endMarker = rawText.indexOf("*** END OF THE PROJECT GUTENBERG");

  // Normalize Windows line endings
  const normalized = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  let content = normalized;
  if (startMarker !== -1) {
    const afterStart = normalized.indexOf("\n", startMarker) + 1;
    content = normalized.slice(afterStart);
  }
  if (endMarker !== -1) {
    content = content.slice(0, content.indexOf("*** END OF THE PROJECT GUTENBERG"));
  }

  // Split into sentences, then group into 2-4 sentence passages
  const rawParagraphs = content
    .split(/\n\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => {
      if (p.length < 80 || p.length > 1400) return false;
      if (/^(chapter|CHAPTER|book|BOOK|part|PART|section|SECTION)/i.test(p)) return false;
      if (/^[IVX]+\.?\s*$/.test(p)) return false;
      if (p.split(" ").length < 10) return false;
      if (p === p.toUpperCase() && p.length < 80) return false;
      return true;
    });

  // Prefer passages in the 200–800 char sweet spot; fall back to any valid one
  const ideal = rawParagraphs.filter((p) => p.length >= 200 && p.length <= 800);
  const paragraphs = ideal.length > 0 ? ideal : rawParagraphs;

  if (paragraphs.length === 0) throw new Error("No suitable passages found");

  return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}

export async function getPassageFromGutenberg(
  gutenbergId: number,
  bookTitle: string,
  bookAuthor: string,
  category: string
): Promise<Passage> {
  const meta = await fetchBookMeta(gutenbergId);
  const rawText = await fetchBookText(meta);
  const text = extractPassage(rawText);

  return {
    text,
    title: bookTitle,
    author: bookAuthor,
    category,
  };
}
