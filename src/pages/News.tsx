import { useEffect, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import bannerImage from "@/assets/hero-news.jpg";
import { useNews } from "@/hooks/useCatalog";
import { useNewsFeed } from "@/hooks/useNewsFeed";

const News = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const [params, setParams] = useSearchParams();

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
  const items = useMemo(() => feed.data?.pages.flatMap((p) => p.items) ?? [], [feed.data]);

  const { data: all = [] } = useNews();
  const categories = useMemo(
    () => Array.from(new Set(all.filter((n) => n.published).map((n) => n.category))).sort(),
    [all],
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
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">Redação</span>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4">Notícias</h1>
            <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
              Acompanhe o que acontece na cultura e na literatura
            </p>
          </div>

          <div className="mb-10 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                defaultValue={q}
                onChange={(e) => setParam("q", e.target.value)}
                placeholder="Buscar notícias"
                className="pl-9 text-sm font-light"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Select value={category} onValueChange={(v) => setParam("categoria", v)}>
                <SelectTrigger className="w-[180px] text-sm font-light">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground font-light text-center py-16">Nenhuma notícia encontrada.</p>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: Math.min(index, 6) * 0.06 }}
                  >
                    <NewsCard item={item} />
                  </motion.div>
                ))}
              </div>
              <div ref={ref} className="h-12" />
              {feed.isFetchingNextPage && (
                <p className="text-center text-sm text-muted-foreground font-light">Carregando mais…</p>
              )}
            </>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default News;
