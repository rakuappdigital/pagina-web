/**
 * Bu script Gutenberg'den pasaj çekip Türkçeye çevirir ve
 * data/translated-passages.json dosyasına kaydeder.
 *
 * Çalıştır: node scripts/generate-translations.mjs
 * (ANTHROPIC_API_KEY env'de veya .env.local'de olmalı)
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env.local'i oku
const envPath = path.join(__dirname, "../.env.local");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("HATA: ANTHROPIC_API_KEY bulunamadı. .env.local'e ekleyin.");
  process.exit(1);
}

// Kitap listesi (data/books.ts'deki BOOKS ile aynı)
const BOOKS = [
  // Felsefe
  { id: 2680, title: "Meditations", author: "Marcus Aurelius", category: "felsefe" },
  { id: 1497, title: "The Republic", author: "Plato", category: "felsefe" },
  { id: 1998, title: "Thus Spoke Zarathustra", author: "Friedrich Nietzsche", category: "felsefe" },
  { id: 205, title: "Walden", author: "Henry David Thoreau", category: "felsefe" },
  { id: 16643, title: "Essays", author: "Ralph Waldo Emerson", category: "felsefe" },
  // Aşk
  { id: 1342, title: "Pride and Prejudice", author: "Jane Austen", category: "ask" },
  { id: 161, title: "Sense and Sensibility", author: "Jane Austen", category: "ask" },
  { id: 174, title: "The Picture of Dorian Gray", author: "Oscar Wilde", category: "ask" },
  { id: 1400, title: "Great Expectations", author: "Charles Dickens", category: "ask" },
  // Yalnızlık
  { id: 5200, title: "The Metamorphosis", author: "Franz Kafka", category: "yalnizlik" },
  { id: 600, title: "Notes from Underground", author: "Fyodor Dostoevsky", category: "yalnizlik" },
  { id: 84, title: "Frankenstein", author: "Mary Shelley", category: "yalnizlik" },
  // Macera
  { id: 521, title: "Robinson Crusoe", author: "Daniel Defoe", category: "macera" },
  { id: 35, title: "The Time Machine", author: "H.G. Wells", category: "macera" },
  { id: 120, title: "Treasure Island", author: "Robert Louis Stevenson", category: "macera" },
  { id: 2701, title: "Moby Dick", author: "Herman Melville", category: "macera" },
];

// Her kitaptan kaç pasaj çekilsin
const PASSAGES_PER_BOOK = 3;

async function fetchBookText(gutenbergId) {
  const metaRes = await fetch(`https://gutendex.com/books/${gutenbergId}/`);
  if (!metaRes.ok) throw new Error(`Gutendex ${gutenbergId}: ${metaRes.status}`);
  const meta = await metaRes.json();

  const textUrl =
    meta.formats["text/plain; charset=utf-8"] ||
    meta.formats["text/plain; charset=us-ascii"] ||
    meta.formats["text/plain"];

  if (!textUrl) throw new Error(`${gutenbergId}: düz metin formatı yok`);

  const res = await fetch(textUrl);
  if (!res.ok) throw new Error(`Metin indirme ${gutenbergId}: ${res.status}`);
  return res.text();
}

function extractPassages(rawText, count) {
  const startMarker = rawText.indexOf("*** START OF THE PROJECT GUTENBERG");
  const endMarker = rawText.indexOf("*** END OF THE PROJECT GUTENBERG");

  let normalized = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  if (startMarker !== -1) {
    const afterStart = normalized.indexOf("\n", startMarker) + 1;
    normalized = normalized.slice(afterStart);
  }
  if (endMarker !== -1) {
    normalized = normalized.slice(0, normalized.indexOf("*** END OF THE PROJECT GUTENBERG"));
  }

  const paragraphs = normalized
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

  const ideal = paragraphs.filter((p) => p.length >= 200 && p.length <= 700);
  const pool = ideal.length >= count ? ideal : paragraphs;

  if (pool.length === 0) throw new Error("Uygun paragraf bulunamadı");

  // Kitabın farklı bölgelerinden rastgele seç
  const selected = [];
  const step = Math.floor(pool.length / count);
  for (let i = 0; i < count && i * step < pool.length; i++) {
    const idx = i * step + Math.floor(Math.random() * Math.min(step, 20));
    selected.push(pool[Math.min(idx, pool.length - 1)]);
  }
  return selected;
}

async function translateToTurkish(text) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Bu edebi pasajı İngilizce'den Türkçe'ye çevir. Yazarın dönemine uygun edebi üslubu koru. Sadece çeviriyi yaz, başka hiçbir şey ekleme:\n\n${text}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API hatası ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const outputPath = path.join(__dirname, "../data/translated-passages.json");
  const results = [];

  for (const book of BOOKS) {
    console.log(`\n📖 ${book.title} — ${book.author} (ID: ${book.id})`);

    let passages;
    try {
      const rawText = await fetchBookText(book.id);
      passages = extractPassages(rawText, PASSAGES_PER_BOOK);
      console.log(`  ✓ ${passages.length} pasaj çıkarıldı`);
    } catch (err) {
      console.error(`  ✗ Metin hatası: ${err.message}`);
      continue;
    }

    for (let i = 0; i < passages.length; i++) {
      const original = passages[i];
      console.log(`  🔄 Çevriliyor [${i + 1}/${passages.length}]...`);

      try {
        const translated = await translateToTurkish(original);
        results.push({
          text: translated,
          originalText: original,
          title: book.title,
          author: book.author,
          category: book.category,
        });
        console.log(`  ✓ Çevrildi (${translated.length} karakter)`);
        await sleep(300); // rate limit
      } catch (err) {
        console.error(`  ✗ Çeviri hatası: ${err.message}`);
      }
    }
  }

  writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\n✅ Tamamlandı! ${results.length} pasaj → data/translated-passages.json`);
}

main().catch((err) => {
  console.error("Kritik hata:", err);
  process.exit(1);
});
