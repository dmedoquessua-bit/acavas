import { useState, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ContentList } from "@/components/ContentSection";
import { Button } from "@/components/ui/button";
import bannerImage from "@/assets/hero-reading.jpg";
import { useContents } from "@/hooks/useContents";

const Webtoons = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const { data: items = [], isLoading } = useContents({ type: "webtoon" });
  const [tag, setTag] = useState("todas");

  const tags = useMemo(
    () => ["todas", ...Array.from(new Set(items.flatMap((i) => i.tags)))],
    [items],
  );
  const visible = useMemo(
    () => (tag === "todas" ? items : items.filter((i) => i.tags.includes(tag))),
    [items, tag],
  );

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      <div className="relative w-full h-[50vh] overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 -top-20 -bottom-20">
          <img src={bannerImage} alt="Webtoons" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/40" />
        </motion.div>
        <div className="relative h-full flex items-end pb-16">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="text-[11px] uppercase tracking-wider text-white/70 mb-4 block">Séries</span>
              <h1 className="text-3xl md:text-5xl font-light text-white tracking-tight">Webtoons & Comics</h1>
            </motion.div>
          </div>
        </div>
      </div>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {tags.map((t) => (
              <Button
                key={t}
                variant={tag === t ? "default" : "outline"}
                size="sm"
                className="rounded-full text-[11px] uppercase tracking-wider font-normal px-5"
                onClick={() => setTag(t)}
              >
                {t}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground font-light">Carregando…</p>
          ) : visible.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground font-light">Nenhum webtoon publicado ainda.</p>
          ) : (
            <ContentList items={visible} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Webtoons;
