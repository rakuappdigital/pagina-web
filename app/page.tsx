import Image from "next/image";
import { getRandomBook } from "@/data/books";
import { getPassageFromGutenberg } from "@/lib/gutenberg";
import { getPassageFromWikisource } from "@/lib/wikisource";
import PassageViewer from "@/components/PassageViewer";
import AppStoreBadge from "@/components/AppStoreBadge";

async function getInitialPassage() {
  try {
    const book = getRandomBook();
    return await getPassageFromGutenberg(
      book.id,
      book.title,
      book.author,
      book.category
    );
  } catch {
    return await getPassageFromWikisource();
  }
}

export default async function Home() {
  const initial = await getInitialPassage();

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#F5F0E8" }}>
      {/* Header */}
      <header className="pt-10 pb-2 text-center flex flex-col items-center gap-3">
        <Image
          src="/logo.png"
          alt="Pagina"
          width={64}
          height={64}
          className="object-contain"
          priority
        />
        <div>
          <h1
            className="text-3xl font-light uppercase"
            style={{
              letterSpacing: "0.45em",
              color: "#2C2416",
              fontFamily: "var(--font-eb-garamond), Georgia, serif",
            }}
          >
            Pagina
          </h1>
          <p
            className="mt-1 text-xs uppercase"
            style={{ letterSpacing: "0.2em", color: "#9E8B70" }}
          >
            Her gün bir pasaj
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-10">
        <PassageViewer initial={initial} />
      </div>

      {/* App Store CTA */}
      <section className="py-10 flex flex-col items-center gap-4 border-t" style={{ borderColor: "#E8DFD0" }}>
        <p
          className="text-sm uppercase tracking-widest"
          style={{ color: "#9E8B70" }}
        >
          Yakında App Store&apos;da!
        </p>
        <AppStoreBadge className="h-12 opacity-70 hover:opacity-100 transition-opacity cursor-not-allowed" />
      </section>

      {/* Footer */}
      <footer className="py-5 text-center">
        <p
          className="text-xs"
          style={{ letterSpacing: "0.15em", color: "#C9A96E" }}
        >
          Telif hakkı serbest eserlerden derlendi
        </p>
      </footer>
    </main>
  );
}
