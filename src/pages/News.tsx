import { useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import bannerImage from "@/assets/hero-news.jpg";
import { useNews } from "@/hooks/useCatalog";

const News = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const { data: news = [], isLoading } = useNews();
  const [category, setCategory] = useState("todas");

  const published = useMemo(() => news.filter((n) => n.published), [news]);
  const categories = useMemo(() => ["todas", ...Array.from(new Set(published.map((n) => n.category)))], [published]);
  const visible = published.filter((n) => category === "todas" || n.category === category);

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

          <div className="flex justify-end mb-8">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px] text-sm font-light">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "todas" ? "Todas as categorias" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground font-light text-center py-16">Carregando notícias...</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-muted-foreground font-light text-center py-16">Nenhuma notícia publicada.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <NewsCard item={item} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default News;
