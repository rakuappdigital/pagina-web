export type Category = "felsefe" | "ask" | "yalnizlik" | "macera" | "turkce";

export interface Book {
  id: number;
  title: string;
  author: string;
  category: Category;
}

export const BOOKS: Book[] = [
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
  { id: 4300, title: "Ulysses", author: "James Joyce", category: "ask" },

  // Yalnızlık
  { id: 5200, title: "The Metamorphosis", author: "Franz Kafka", category: "yalnizlik" },
  { id: 600, title: "Notes from Underground", author: "Fyodor Dostoevsky", category: "yalnizlik" },
  { id: 84, title: "Frankenstein", author: "Mary Shelley", category: "yalnizlik" },
  { id: 2641, title: "The Brothers Karamazov", author: "Fyodor Dostoevsky", category: "yalnizlik" },
  { id: 244, title: "A Study in Scarlet", author: "Arthur Conan Doyle", category: "yalnizlik" },

  // Macera
  { id: 521, title: "Robinson Crusoe", author: "Daniel Defoe", category: "macera" },
  { id: 35, title: "The Time Machine", author: "H.G. Wells", category: "macera" },
  { id: 120, title: "Treasure Island", author: "Robert Louis Stevenson", category: "macera" },
  { id: 2701, title: "Moby Dick", author: "Herman Melville", category: "macera" },
  { id: 98, title: "A Tale of Two Cities", author: "Charles Dickens", category: "macera" },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  felsefe: "Felsefe",
  ask: "Aşk",
  yalnizlik: "Yalnızlık",
  macera: "Macera",
  turkce: "Türkçe",
};

export function getRandomBook(category?: Category): Book {
  const pool = category && category !== "turkce"
    ? BOOKS.filter((b) => b.category === category)
    : BOOKS;
  return pool[Math.floor(Math.random() * pool.length)];
}
