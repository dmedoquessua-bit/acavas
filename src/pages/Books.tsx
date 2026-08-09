import { useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContentFiltersBar, { useUrlFilters } from "@/components/ContentFilters";
import InfiniteContentList from "@/components/InfiniteContentList";
import { Button } from "@/components/ui/button";
import bannerImage from "@/assets/hero-library.jpg";
import { useContentFeed } from "@/hooks/useContentFeed";
import { useContents, ContentType } from "@/hooks/useContents";

const TABS: Array<{ value: ContentType; label: string }> = [
  { value: "book", label: "Livros" },
  { value: "academic", label: "Acadêmicos" },
];

const Books = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const [params, setParams] = useSearchParams();
  const type = (params.get("tipo") as ContentType) ?? "book";
  const { filters } = useUrlFilters();

  const feed = useContentFeed({ ...filters, type });
  const items = useMemo(() => feed.data?.pages.flatMap((p) => p.items) ?? [], [feed.data]);

  const { data: all = [] } = useContents({ type });
  const options = useMemo(
    () => ({
      categories: Array.from(new Set(all.map((i) => i.category))).sort(),
      tags: Array.from(new Set(all.flatMap((i) => i.tags))).sort(),
      languages: Array.from(new Set(all.map((i) => i.language))).sort(),
      formats: Array.from(new Set(all.flatMap((i) => i.formats))).sort(),
      years: Array.from(new Set(all.map((i) => i.year).filter(Boolean) as number[])).sort((a, b) => b - a),
    }),
    [all],
  );

  const setType = (value: ContentType) => {
    const next = new URLSearchParams(params);
    if (value === "book") next.delete("tipo");
    else next.set("tipo", value);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Catálogo</span>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4">
              {type === "academic" ? "Artigos acadêmicos" : "Todos os livros"}
            </h1>
            <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
              Explore os títulos disponíveis para leitura online
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {TABS.map((t) => (
              <Button
                key={t.value}
                variant={type === t.value ? "default" : "outline"}
                size="sm"
                className="rounded-full text-[11px] uppercase tracking-wider font-normal px-5"
                onClick={() => setType(t.value)}
              >
                {t.label}
              </Button>
            ))}
          </div>

          <ContentFiltersBar options={options} />

          <InfiniteContentList
            items={items}
            isLoading={feed.isLoading}
            isFetchingNextPage={feed.isFetchingNextPage}
            hasNextPage={feed.hasNextPage}
            fetchNextPage={feed.fetchNextPage}
            emptyLabel="Nenhum título encontrado com esses filtros."
          />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Books;
