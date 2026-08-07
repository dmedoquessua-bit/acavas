import { useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { useNews } from "@/hooks/useCatalog";

const News = () => {
  const { data: news = [], isLoading } = useNews();
  const [category, setCategory] = useState("Todas");

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(news.map((n) => n.category)))],
    [news]
  );

  const filtered = category === "Todas" ? news : news.filter((n) => n.category === category);
  const [lead, ...rest] = filtered;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <span className="eyebrow">Redação</span>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">Notícias</h1>

        <div className="mt-6 flex flex-wrap gap-2">
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

        <div className="mt-10">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando notícias…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma notícia por aqui ainda.</p>
          ) : (
            <>
              <NewsCard item={lead} large />
              <div className="mt-14 grid gap-10 rule pt-10 md:grid-cols-3">
                {rest.map((n) => <NewsCard key={n.id} item={n} />)}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default News;
