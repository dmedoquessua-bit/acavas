import { useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { useBooks } from "@/hooks/useCatalog";

const Books = () => {
  const { data: books = [], isLoading } = useBooks();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(books.map((b) => b.category)))],
    [books]
  );

  const filtered = books.filter((b) => {
    const matchesQuery =
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "Todos" || b.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <span className="eyebrow">Catálogo</span>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Livros digitais</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Compre e leia direto no navegador, sem aplicativos nem downloads.
        </p>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            value={query}
            maxLength={80}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou autor"
            className="md:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando livros…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum livro encontrado.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {filtered.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Books;
