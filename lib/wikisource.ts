import { Passage } from "./gutenberg";

interface WikisourceWork {
  page: string;
  title: string;
  author: string;
}

// Türkçe Wikisource'da mevcut olan telif hakkı serbest eserler
const TURKISH_WORKS: WikisourceWork[] = [
  { page: "Kaşağı", title: "Kaşağı", author: "Ömer Seyfettin" },
  { page: "Yüksek_Ökçeler", title: "Yüksek Ökçeler", author: "Ömer Seyfettin" },
  { page: "Bomba", title: "Bomba", author: "Ömer Seyfettin" },
  { page: "İlk_Cinayet", title: "İlk Cinayet", author: "Ömer Seyfettin" },
  { page: "Primo_Türk_Çocuğu", title: "Primo Türk Çocuğu", author: "Ömer Seyfettin" },
  { page: "Forsa", title: "Forsa", author: "Ömer Seyfettin" },
  { page: "Gizli_Mabed", title: "Gizli Mabed", author: "Ömer Seyfettin" },
  { page: "Falaka", title: "Falaka", author: "Ömer Seyfettin" },
  { page: "Ant", title: "Ant", author: "Ömer Seyfettin" },
  { page: "Başını_Vermeyen_Şehit", title: "Başını Vermeyen Şehit", author: "Ömer Seyfettin" },
];

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&nbsp;/g, " ");
}

function cleanWikitext(raw: string): string {
  let text = raw;

  // Şablon çağrılarını temizle: {{...}}
  // İç içe şablonlar için birkaç kez uygula
  for (let i = 0; i < 5; i++) {
    text = text.replace(/\{\{[^{}]*\}\}/g, "");
  }

  // Dosya ve Resim bağlantılarını kaldır
  text = text.replace(/\[\[(Dosya|File|Image|Resim):[^\]]*\]\]/gi, "");

  // [[Bağlantı|Görünen metin]] → Görünen metin
  text = text.replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, "$1");
  // [[Bağlantı]] → Bağlantı
  text = text.replace(/\[\[([^\]]*)\]\]/g, "$1");

  // Kalın/italik işaretlerini kaldır
  text = text.replace(/'''?/g, "");

  // Başlıkları kaldır (== Başlık ==)
  text = text.replace(/={2,}[^=\n]+={2,}/g, "");

  // HTML etiketlerini kaldır
  text = text.replace(/<[^>]+>/g, "");

  // HTML yorumlarını kaldır
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Dış bağlantıları kaldır [http://... metin]
  text = text.replace(/\[https?:\/\/[^\s\]]*\s*([^\]]*)\]/g, "$1");

  // Kategori satırlarını kaldır
  text = text.replace(/\[\[Kategori:[^\]]*\]\]/gi, "");

  // Wiki girintileme (:) satır başlarını temizle
  text = text.replace(/^:+\s*/gm, "");

  // HTML entity'lerini çöz
  text = decodeHtmlEntities(text);

  return text;
}

function extractPassages(wikitext: string): string[] {
  const cleaned = cleanWikitext(wikitext);

  const paragraphs = cleaned
    .split(/\n\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => {
      if (p.length < 80 || p.length > 1400) return false;
      if (p.split(" ").length < 10) return false;
      // Tablo satırlarını ve yönlendirme karakterlerini filtrele
      if (/^[|!{]/.test(p)) return false;
      if (/^(==|\*)/.test(p)) return false;
      return true;
    });

  const ideal = paragraphs.filter((p) => p.length >= 150 && p.length <= 700);
  return ideal.length > 0 ? ideal : paragraphs;
}

export async function getPassageFromWikisource(): Promise<Passage> {
  // Rastgele bir eser seç
  const work = TURKISH_WORKS[Math.floor(Math.random() * TURKISH_WORKS.length)];

  const apiUrl = `https://tr.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(work.page)}&prop=wikitext&format=json&origin=*`;

  const res = await fetch(apiUrl, {
    headers: { "User-Agent": "Pagina-Web/1.0 (pagina app; contact: contact@pagina.app)" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Wikisource API hatası: ${res.status}`);

  const data = await res.json();
  const wikitext: string = data?.parse?.wikitext?.["*"] ?? "";

  if (!wikitext) throw new Error(`Wikisource: ${work.page} için içerik bulunamadı`);

  const passages = extractPassages(wikitext);
  if (passages.length === 0) throw new Error(`${work.page}: uygun pasaj bulunamadı`);

  const text = passages[Math.floor(Math.random() * passages.length)];

  return {
    text,
    title: work.title,
    author: work.author,
    category: "turkce",
  };
}
