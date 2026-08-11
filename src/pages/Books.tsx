import { useEffect, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FreeBookHero from "@/components/books/FreeBookHero";
import BookGridCard from "@/components/books/BookGridCard";
import RecommendedCarousel from "@/components/books/RecommendedCarousel";
import CategoryPills from "@/components/news/CategoryPills";
import { Button } from "@/components/ui/button";
import bannerImage from "@/assets/hero-library.jpg";
import { useContentFeed } from "@/hooks/useContentFeed";
import { useContents, ContentType } from "@/hooks/useContents";
import { useContentProtection } from "@/hooks/useContentProtection";
import { BOOK_CATEGORIES, freeBookOfTheDay } from "@/lib/books";

const TABS: Array<{ value: ContentType; label: string }> = [
  { value: "book", label: "Livros" },
  { value: "academic", label: "Acadêmicos" },
];

const Books = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const [params, setParams] = useSearchParams();
  useContentProtection();

  const type = (params.get("tipo") as ContentType) ?? "book";
  const category = params.get("categoria") ?? "all";

  const feed = useContentFeed({ type, category });
  const items = useMemo(() => feed.data?.pages.flatMap((p) => p.items) ?? [], [feed.data]);

  const { data: all = [] } = useContents({ type });
  const freeBook = useMemo(() => freeBookOfTheDay(all.filter((i) => i.cover || i.description)), [all]);
  const recommended = useMemo(() => [...all].sort((a, b) => b.rating - a.rating).slice(0, 10), [all]);

  const categories = useMemo(() => {
    const fromData = all.map((i) => i.category).filter(Boolean);
    return Array.from(new Set([...BOOK_CATEGORIES, ...fromData]));
  }, [all]);

  const { ref, inView } = useInView({ rootMargin: "600px 0px" });
  useEffect(() => {
    if (inView && feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
  }, [inView, feed]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || (key === "tipo" && value === "book")) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      <div className="relative w-full h-[50vh] overflow-hidden">
        <motion.img
          src={bannerImage}
          alt="Estantes de livros"
          style={{ y }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <main className="py-24 lg:py-32 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Catálogo</span>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4">
              {type === "academic" ? "Artigos acadêmicos" : "Todos os livros"}
            </h1>
            <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
              Explore os títulos disponíveis para leitura online
            </p>
          </div>

          <FreeBookHero book={freeBook} />

          <div className="flex justify-center gap-2 mb-8">
            {TABS.map((t) => (
              <Button
                key={t.value}
                variant={type === t.value ? "default" : "outline"}
                size="sm"
                className="rounded-full text-[11px] uppercase tracking-wider font-normal px-5"
                onClick={() => setParam("tipo", t.value)}
              >
                {t.label}
              </Button>
            ))}
          </div>

          <div className="mb-10">
            <CategoryPills categories={categories} value={category} onChange={(v) => setParam("categoria", v)} />
          </div>

          {feed.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-56 rounded-lg bg-accent animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground font-light py-16">
              Nenhum título encontrado nesta categoria.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => (
                <BookGridCard key={item.id} book={item} free={item.id === freeBook?.id} />
              ))}
            </div>
          )}

          <div ref={ref} className="h-12" />
          {feed.isFetchingNextPage && (
            <p className="text-center text-sm text-muted-foreground font-light">Carregando mais…</p>
          )}

          <RecommendedCarousel items={recommended} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Books;
