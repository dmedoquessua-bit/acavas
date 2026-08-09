import { useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContentFiltersBar, { useUrlFilters } from "@/components/ContentFilters";
import InfiniteContentList from "@/components/InfiniteContentList";
import bannerImage from "@/assets/hero-reading.jpg";
import { useContentFeed } from "@/hooks/useContentFeed";
import { useContents } from "@/hooks/useContents";

const Webtoons = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const { filters } = useUrlFilters();
  const feed = useContentFeed({ ...filters, type: "webtoon" });
  const items = useMemo(() => feed.data?.pages.flatMap((p) => p.items) ?? [], [feed.data]);

  const { data: all = [] } = useContents({ type: "webtoon" });
  const options = useMemo(
    () => ({
      categories: Array.from(new Set(all.map((i) => i.category))).sort(),
      tags: Array.from(new Set(all.flatMap((i) => i.tags))).sort(),
      languages: Array.from(new Set(all.map((i) => i.language))).sort(),
      formats: [],
      years: Array.from(new Set(all.map((i) => i.year).filter(Boolean) as number[])).sort((a, b) => b - a),
    }),
    [all],
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
          <ContentFiltersBar options={options} />

          <InfiniteContentList
            items={items}
            isLoading={feed.isLoading}
            isFetchingNextPage={feed.isFetchingNextPage}
            hasNextPage={feed.hasNextPage}
            fetchNextPage={feed.fetchNextPage}
            emptyLabel="Nenhum webtoon encontrado com esses filtros."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Webtoons;
