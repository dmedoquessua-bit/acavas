import { useEffect, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NewsHero from "@/components/news/NewsHero";
import CategoryPills from "@/components/news/CategoryPills";
import EditorialCard from "@/components/news/EditorialCard";
import MissedCarousel from "@/components/news/MissedCarousel";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import bannerImage from "@/assets/hero-news.jpg";
import { useNews } from "@/hooks/useCatalog";
import { useNewsFeed } from "@/hooks/useNewsFeed";
import { useContentProtection } from "@/hooks/useContentProtection";
import { NEWS_CATEGORIES, pickFeatured, type CuratedNews } from "@/lib/news";

const News = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const [params, setParams] = useSearchParams();
  useContentProtection();

  const category = params.get("categoria") ?? "all";
  const order = (params.get("ordem") as "recent" | "oldest") ?? "recent";
  const q = params.get("q") ?? "";

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || value === "") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const feed = useNewsFeed({ category, order, q });
  const items = useMemo(
    () => (feed.data?.pages.flatMap((p) => p.items) ?? []) as CuratedNews[],
    [feed.data],
  );

  const { data: all = [] } = useNews();
  const published = useMemo(() => all.filter((n) => n.published) as CuratedNews[], [all]);

  /** Curation: Top Story flag → engajamento do dia → mais recente. */
  const featured = useMemo(() => pickFeatured(published), [published]);
  const gridItems = useMemo(
    () => items.filter((i) => !featured || i.id !== featured.id || category !== "all" || q),
    [items, featured, category, q],
  );

  const categories = useMemo(() => {
    const fromData = published.map((n) => n.category).filter(Boolean);
    return Array.from(new Set([...NEWS_CATEGORIES, ...fromData]));
  }, [published]);

  const missed = useMemo(
    () => published.filter((n) => !featured || n.id !== featured.id).slice(0, 10),
    [published, featured],
  );

  const { ref, inView } = useInView({ rootMargin: "600px 0px" });
  useEffect(() => {
    if (inView && feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
  }, [inView, feed]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      <div className="relative w-full h-[50vh] overflow-hidden">
        <motion.img
          src={bannerImage}
          alt="Jornal sobre a mesa"
          style={{ y }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-[120%] object-cover select-none [-webkit-user-drag:none]"
          draggable={false}
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
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Redação</span>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4">Notícias</h1>
            <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
              Acompanhe o que acontece no mundo, na cultura e na literatura
            </p>
          </div>

          {featured && !q && category === "all" && <NewsHero item={featured} />}

          <div className="mb-10 space-y-5">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                defaultValue={q}
                onChange={(e) => setParam("q", e.target.value)}
                placeholder="Buscar notícias"
                className="pl-9 text-sm font-light"
              />
            </div>

            <CategoryPills categories={categories} value={category} onChange={(v) => setParam("categoria", v)} />

            <div className="flex justify-end">
              <Select value={order} onValueChange={(v) => setParam("ordem", v === "recent" ? undefined : v)}>
                <SelectTrigger className="w-[180px] text-sm font-light">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {feed.isLoading ? (
            <p className="text-sm text-muted-foreground font-light text-center py-16">Carregando notícias...</p>
          ) : gridItems.length === 0 ? (
            <p className="text-sm text-muted-foreground font-light text-center py-16">Nenhuma notícia encontrada.</p>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {gridItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: Math.min(index, 6) * 0.06 }}
                  >
                    <EditorialCard item={item} />
                  </motion.div>
                ))}
              </div>
              <div ref={ref} className="h-12" />
              {feed.isFetchingNextPage && (
                <p className="text-center text-sm text-muted-foreground font-light">Carregando mais…</p>
              )}
            </>
          )}

          <MissedCarousel items={missed} />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default News;
